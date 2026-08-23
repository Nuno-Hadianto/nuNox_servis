export {};
const db = require('../database/db');
const { serviceOrders, payments, serviceItems, spareParts, settings, customers } = require('../database/drizzleSchema');
const { eq, notLike, like, notInArray, lte, asc, sql, and, isNotNull } = require('drizzle-orm');

function getDashboardStats() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Servis Hari Ini
    const todayServicesQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(eq(sql`DATE(${serviceOrders.created_at}, 'localtime')`, today))
        .get();
    const todayServices = todayServicesQuery?.count || 0;

    // Sedang Dikerjakan
    const inProgressQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(and(
            notLike(serviceOrders.service_status, '%Selesai%'),
            notInArray(serviceOrders.service_status, ['Batal', 'Dibatalkan'])
        ))
        .get();
    const inProgress = inProgressQuery?.count || 0;

    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(like(serviceOrders.service_status, '%Selesai%'))
        .get();
    const completed = completedQuery?.count || 0;

    // Pendapatan Bulan Ini (Total dari payments)
    const incomeMonthQuery = db.drizzle.select({ total: sql`SUM(${payments.amount})` })
        .from(payments)
        .where(eq(sql`strftime('%Y-%m', ${payments.payment_date}, 'localtime')`, currentMonth))
        .get();
    const incomeMonth = incomeMonthQuery?.total || 0;

    // HPP (Modal Sparepart) untuk transaksi yang diselesaikan bulan ini
    const hppMonthQuery = db.drizzle.select({ hpp: sql`SUM(${serviceItems.cost_price})` })
        .from(serviceItems)
        .innerJoin(serviceOrders, eq(serviceItems.service_order_id, serviceOrders.id))
        .where(eq(sql`strftime('%Y-%m', ${serviceOrders.completed_date}, 'localtime')`, currentMonth))
        .get();
    const hppMonth = hppMonthQuery?.hpp || 0;
    const labaBersih = incomeMonth - hppMonth;

    // Chart Data (Income last 6 months) - using raw sql for complex group by
    const chartDataRaw = db.prepare(`
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
        
        const row = chartDataRaw.find((r: any) => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }

    // Get threshold from settings
    let threshold = 3; // default
    try {
        const row = db.drizzle.select({ value: settings.value }).from(settings)
            .where(eq(settings.key, 'low_stock_threshold')).get();
        if (row && row.value !== undefined && row.value !== null) {
            threshold = Number(row.value);
        }
    } catch (e) {
        // ignore
    }

    // Peringatan Stok Menipis
    const lowStockParts = db.drizzle.select().from(spareParts)
        .where(lte(spareParts.stock, threshold))
        .orderBy(asc(spareParts.stock))
        .limit(20).all();

    // Barang Terlantar / Follow Up
    // 1. Menunggu Sparepart > 7 hari
    const waitingQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_name: customers.name,
        customer_phone: customers.phone,
        service_status: serviceOrders.service_status,
        days_pending: sql`CAST(julianday('now', 'localtime') - julianday(${serviceOrders.created_at}, 'localtime') AS INTEGER)`
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .where(and(
          eq(serviceOrders.service_status, 'Menunggu Sparepart'),
          sql`(julianday('now', 'localtime') - julianday(${serviceOrders.created_at}, 'localtime')) > 7`
      )).all();
    
    // 2. Selesai (Belum Diambil) > 14 hari
    const completedNotPickedQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_name: customers.name,
        customer_phone: customers.phone,
        service_status: serviceOrders.service_status,
        days_pending: sql`CAST(julianday('now', 'localtime') - julianday(${serviceOrders.completed_date}, 'localtime') AS INTEGER)`
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .where(and(
          eq(serviceOrders.service_status, 'Selesai (Belum Diambil)'),
          isNotNull(serviceOrders.completed_date),
          sql`(julianday('now', 'localtime') - julianday(${serviceOrders.completed_date}, 'localtime')) > 14`
      )).all();

    const abandonedServices = [
        ...waitingQuery,
        ...completedNotPickedQuery
    ];

    // Service Status Distribution (Donut Chart)
    const statusData = db.prepare(`
        SELECT service_status, COUNT(*) as count 
        FROM service_orders 
        GROUP BY service_status
    `).all();
    
    const serviceStatusChart = {
        labels: statusData.map((s: any) => s.service_status),
        values: statusData.map((s: any) => s.count)
    };

    // Top 5 Spare Parts (Bar Chart) - Complex union all
    const topPartsData = db.prepare(`
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
        labels: topPartsData.map((p: any) => p.name),
        values: topPartsData.map((p: any) => p.qty)
    };

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
        abandonedServices
    };
}

module.exports = {
    getDashboardStats
};
