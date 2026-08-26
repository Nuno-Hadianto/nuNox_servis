"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
// @ts-nocheck
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getDashboardStats() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentMonth = today.substring(0, 7); // YYYY-MM
    // Servis Hari Ini
    const todayServicesQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `DATE(${drizzleSchema_1.serviceOrders.created_at}, 'localtime')`, today))
        .get();
    const todayServices = todayServicesQuery?.count || 0;
    // Sedang Dikerjakan
    const inProgressQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.notLike)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'), (0, drizzle_orm_1.notInArray)(drizzleSchema_1.serviceOrders.service_status, ['Batal', 'Dibatalkan'])))
        .get();
    const inProgress = inProgressQuery?.count || 0;
    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'))
        .get();
    const completed = completedQuery?.count || 0;
    // Pendapatan Bulan Ini (Total dari payments)
    const incomeMonthQuery = db_1.default.drizzle.select({ total: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.payments.amount})` })
        .from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `strftime('%Y-%m', ${drizzleSchema_1.payments.payment_date}, 'localtime')`, currentMonth))
        .get();
    const incomeMonth = incomeMonthQuery?.total || 0;
    // HPP (Modal Sparepart) untuk transaksi yang diselesaikan bulan ini
    const hppMonthQuery = db_1.default.drizzle.select({ hpp: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.serviceItems.cost_price})` })
        .from(drizzleSchema_1.serviceItems)
        .innerJoin(drizzleSchema_1.serviceOrders, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.service_order_id, drizzleSchema_1.serviceOrders.id))
        .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `strftime('%Y-%m', ${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')`, currentMonth))
        .get();
    const hppMonth = hppMonthQuery?.hpp || 0;
    const labaBersih = incomeMonth - hppMonth;
    // Chart Data (Income last 6 months) - using raw sql for complex group by
    const chartDataRaw = db_1.default.prepare(`
        SELECT strftime('%Y-%m', payment_date, 'localtime') as month, SUM(amount) as total 
        FROM payments 
        WHERE date(payment_date, 'localtime') >= date('now', 'localtime', 'start of month', '-5 months')
        GROUP BY month 
        ORDER BY month ASC
    `).all();
    const chartLabels = [];
    const chartValues = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1); // Prevent date overflow bug
        d.setMonth(new Date().getMonth() - i);
        const yyyymm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('id-ID', { month: 'short' });
        const row = chartDataRaw.find((r) => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }
    // Get threshold from settings
    let threshold = 3; // default
    try {
        const row = db_1.default.drizzle.select({ value: drizzleSchema_1.settings.value }).from(drizzleSchema_1.settings)
            .where((0, drizzle_orm_1.eq)(drizzleSchema_1.settings.key, 'low_stock_threshold')).get();
        if (row && row.value !== undefined && row.value !== null) {
            threshold = Number(row.value);
        }
    }
    catch (e) {
        // ignore
    }
    // Peringatan Stok Menipis
    const lowStockParts = db_1.default.drizzle.select().from(drizzleSchema_1.spareParts)
        .where((0, drizzle_orm_1.lte)(drizzleSchema_1.spareParts.stock, threshold))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.stock))
        .limit(20).all();
    // Barang Terlantar / Follow Up
    // 1. Menunggu Sparepart > 7 hari
    const waitingQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        customer_name: drizzleSchema_1.customers.name,
        customer_phone: drizzleSchema_1.customers.phone,
        service_status: drizzleSchema_1.serviceOrders.service_status,
        days_pending: (0, drizzle_orm_1.sql) `CAST(julianday('now', 'localtime') - julianday(${drizzleSchema_1.serviceOrders.created_at}, 'localtime') AS INTEGER)`
    }).from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.service_status, 'Menunggu Sparepart'), (0, drizzle_orm_1.sql) `(julianday('now', 'localtime') - julianday(${drizzleSchema_1.serviceOrders.created_at}, 'localtime')) > 7`)).all();
    // 2. Selesai (Belum Diambil) > 14 hari
    const completedNotPickedQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        customer_name: drizzleSchema_1.customers.name,
        customer_phone: drizzleSchema_1.customers.phone,
        service_status: drizzleSchema_1.serviceOrders.service_status,
        days_pending: (0, drizzle_orm_1.sql) `CAST(julianday('now', 'localtime') - julianday(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime') AS INTEGER)`
    }).from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.service_status, 'Selesai (Belum Diambil)'), (0, drizzle_orm_1.isNotNull)(drizzleSchema_1.serviceOrders.completed_date), (0, drizzle_orm_1.sql) `(julianday('now', 'localtime') - julianday(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')) > 14`)).all();
    const abandonedServices = [
        ...waitingQuery,
        ...completedNotPickedQuery
    ];
    // Service Status Distribution (Donut Chart)
    const statusData = db_1.default.prepare(`
        SELECT service_status, COUNT(*) as count 
        FROM service_orders 
        GROUP BY service_status
    `).all();
    const serviceStatusChart = {
        labels: statusData.map((s) => s.service_status),
        values: statusData.map((s) => s.count)
    };
    // Top 5 Spare Parts (Bar Chart) - Complex union all
    const topPartsData = db_1.default.prepare(`
        SELECT sp.name, SUM(total_qty) as qty FROM (
            SELECT spare_part_id, quantity as total_qty FROM sale_items
            UNION ALL
            SELECT spare_part_id, quantity as total_qty FROM service_items WHERE item_type = 'Sparepart'
        ) items
        JOIN spare_parts sp ON sp.id = items.spare_part_id
        GROUP BY sp.id
        ORDER BY qty DESC
        LIMIT 5
    `).all();
    const topPartsChart = {
        labels: topPartsData.map((p) => p.name),
        values: topPartsData.map((p) => p.qty)
    };
    // Todo Items untuk Teknisi
    // 1. Deadline Hari Ini atau Terlewat (Overdue)
    const deadlineQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        type: (0, drizzle_orm_1.sql) `CASE WHEN date(${drizzleSchema_1.serviceOrders.estimated_completion_date}, 'localtime') < ${today} THEN 'overdue' ELSE 'deadline_today' END`,
        description: (0, drizzle_orm_1.sql) `'Deadline ' || date(${drizzleSchema_1.serviceOrders.estimated_completion_date}, 'localtime')`
    }).from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(drizzleSchema_1.serviceOrders.estimated_completion_date), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.serviceOrders.estimated_completion_date}, 'localtime')`, today), (0, drizzle_orm_1.notLike)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'), (0, drizzle_orm_1.notInArray)(drizzleSchema_1.serviceOrders.service_status, ['Batal', 'Dibatalkan']))).all();
    // 2. Menunggu Sparepart
    const waitingPartQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        type: (0, drizzle_orm_1.sql) `'waiting_part'`,
        description: (0, drizzle_orm_1.sql) `'Menunggu sparepart'`
    }).from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.service_status, 'Menunggu Sparepart')).all();
    const todoItems = [
        ...deadlineQuery,
        ...waitingPartQuery
    ];
    return {
        todayServices,
        inProgress,
        completed,
        incomeMonth,
        labaBersih,
        chartData: { labels: chartLabels, values: chartValues },
        serviceStatusChart,
        topPartsChart,
        lowStockParts,
        abandonedServices,
        todoItems
    };
}
