
import db from '../database/db';
import {  serviceOrders, payments, serviceItems, customers  } from '../database/drizzleSchema';
import {  eq, notInArray, sql, and, isNotNull, isNull, lte, inArray  } from 'drizzle-orm';
import { ServiceStatus } from '../shared/types';
export {};




function getDashboardStats() {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // Servis Hari Ini
    const todayServicesQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(and(
            eq(sql`DATE(${serviceOrders.created_at}, 'localtime')`, today),
            isNull(serviceOrders.deleted_at)
        ))
        .get();
    const todayServices = todayServicesQuery?.count || 0;

    // Sedang Dikerjakan
    const inProgressQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(and(
            isNull(serviceOrders.deleted_at),
            notInArray(serviceOrders.service_status, [
                ServiceStatus.SELESAI_BELUM_DIAMBIL, 
                ServiceStatus.SELESAI_SUDAH_DIAMBIL, 
                ServiceStatus.BATAL, 
                ServiceStatus.DIBATALKAN
            ])
        ))
        .get();
    const inProgress = inProgressQuery?.count || 0;

    // Selesai (hari ini atau bulan ini atau total?) Let's say all time total completed, or just completed
    const completedQuery = db.drizzle.select({ count: sql`COUNT(*)` })
        .from(serviceOrders)
        .where(and(
            inArray(serviceOrders.service_status, [ServiceStatus.SELESAI_BELUM_DIAMBIL, ServiceStatus.SELESAI_SUDAH_DIAMBIL]),
            isNull(serviceOrders.deleted_at)
        ))
        .get();
    const completed = completedQuery?.count || 0;

    // Pendapatan Bulan Ini (Total dari payments)
    const incomeMonthQuery = db.drizzle.select({ total: sql`SUM(${payments.amount})` })
        .from(payments)
        .innerJoin(serviceOrders, eq(payments.service_order_id, serviceOrders.id))
        .where(and(
            eq(sql`strftime('%Y-%m', ${payments.payment_date}, 'localtime')`, currentMonth),
            isNull(serviceOrders.deleted_at)
        ))
        .get();
    const incomeMonth = incomeMonthQuery?.total || 0;

    // HPP (Modal Sparepart) untuk transaksi yang diselesaikan bulan ini
    const hppMonthQuery = db.drizzle.select({ hpp: sql`SUM(${serviceItems.cost_price})` })
        .from(serviceItems)
        .innerJoin(serviceOrders, eq(serviceItems.service_order_id, serviceOrders.id))
        .where(and(
            eq(sql`strftime('%Y-%m', ${serviceOrders.completed_date}, 'localtime')`, currentMonth),
            isNull(serviceOrders.deleted_at)
        ))
        .get();
    const hppMonth = hppMonthQuery?.hpp || 0;
    const labaBersih = incomeMonth - hppMonth;

    // Chart Data (Income last 6 months) - using raw sql for complex group by
    const chartDataRaw = db.prepare(`
        SELECT strftime('%Y-%m', payment_date, 'localtime') as month, SUM(amount) as total 
        FROM payments 
        JOIN service_orders ON payments.service_order_id = service_orders.id
        WHERE date(payment_date, 'localtime') >= date('now', 'localtime', 'start of month', '-5 months')
        AND service_orders.deleted_at IS NULL
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
        
        const row = chartDataRaw.find((r: { month: string; total: number }) => r.month === yyyymm);
        chartLabels.push(monthName);
        chartValues.push(row ? row.total : 0);
    }


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
          isNull(serviceOrders.deleted_at),
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
          isNull(serviceOrders.deleted_at),
          eq(serviceOrders.service_status, ServiceStatus.SELESAI_BELUM_DIAMBIL),
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
        WHERE deleted_at IS NULL
        GROUP BY service_status
    `).all();
    
    const serviceStatusChart = {
        labels: statusData.map((s: { service_status: string; count: number }) => s.service_status),
        values: statusData.map((s: { service_status: string; count: number }) => s.count)
    };

    // Top 5 Spare Parts (Bar Chart) - Complex union all
    const topPartsData = db.prepare(`
        SELECT sp.name, SUM(total_qty) as qty FROM (
            SELECT spare_part_id, quantity as total_qty FROM service_items 
            JOIN service_orders ON service_items.service_order_id = service_orders.id
            WHERE item_type = 'Sparepart' AND service_orders.deleted_at IS NULL
        ) items
        JOIN spare_parts sp ON sp.id = items.spare_part_id
        GROUP BY sp.id
        ORDER BY qty DESC
        LIMIT 5
    `).all();
    
    const topPartsChart = {
        labels: topPartsData.map((p: { name: string; qty: number }) => p.name),
        values: topPartsData.map((p: { name: string; qty: number }) => p.qty)
    };

    // Todo Items untuk Teknisi
    // 1. Deadline Hari Ini atau Terlewat (Overdue)
    const deadlineQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        type: sql`CASE WHEN date(${serviceOrders.estimated_completion_date}, 'localtime') < ${today} THEN 'overdue' ELSE 'deadline_today' END`,
        description: sql`'Deadline ' || date(${serviceOrders.estimated_completion_date}, 'localtime')`
    }).from(serviceOrders)
      .where(and(
          isNull(serviceOrders.deleted_at),
          isNotNull(serviceOrders.estimated_completion_date),
          lte(sql`date(${serviceOrders.estimated_completion_date}, 'localtime')`, today),
          notInArray(serviceOrders.service_status, [
              ServiceStatus.SELESAI_BELUM_DIAMBIL, 
              ServiceStatus.SELESAI_SUDAH_DIAMBIL, 
              ServiceStatus.BATAL, 
              ServiceStatus.DIBATALKAN
          ])
      )).all();

    // 2. Menunggu Sparepart
    const waitingPartQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        type: sql`'waiting_part'`,
        description: sql`'Menunggu sparepart'`
    }).from(serviceOrders)
      .where(and(
          isNull(serviceOrders.deleted_at),
          eq(serviceOrders.service_status, 'Menunggu Sparepart')
      )).all();

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
        abandonedServices,
        todoItems
    };
}

function getAlerts() {
    // 1. Menunggu Sparepart > 7 hari
    const waitingQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_name: customers.name,
        service_status: serviceOrders.service_status,
        days_pending: sql`CAST(julianday('now', 'localtime') - julianday(${serviceOrders.created_at}, 'localtime') AS INTEGER)`
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .where(and(
          isNull(serviceOrders.deleted_at),
          eq(serviceOrders.service_status, 'Menunggu Sparepart'),
          sql`(julianday('now', 'localtime') - julianday(${serviceOrders.created_at}, 'localtime')) > 7`
      )).all();
    
    // 2. Selesai (Belum Diambil) > 14 hari
    const completedNotPickedQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_name: customers.name,
        service_status: serviceOrders.service_status,
        days_pending: sql`CAST(julianday('now', 'localtime') - julianday(${serviceOrders.completed_date}, 'localtime') AS INTEGER)`
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .where(and(
          isNull(serviceOrders.deleted_at),
          eq(serviceOrders.service_status, ServiceStatus.SELESAI_BELUM_DIAMBIL),
          isNotNull(serviceOrders.completed_date),
          sql`(julianday('now', 'localtime') - julianday(${serviceOrders.completed_date}, 'localtime')) > 14`
      )).all();

    return [
        ...waitingQuery,
        ...completedNotPickedQuery
    ];
}

export { 
    getDashboardStats,
    getAlerts
 };
