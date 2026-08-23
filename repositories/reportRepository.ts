const db = require('../database/db');
const { payments, serviceOrders, customers, devices, serviceItems, spareParts } = require('../database/drizzleSchema');
const { sql, and, gte, lte, eq, like } = require('drizzle-orm');

function getIncomeReport(startDate: string, endDate: string) {
    const report = db.drizzle.select({
        total_income: sql`SUM(${payments.amount})`,
        transaction_count: sql`COUNT(${payments.id})`
    }).from(payments)
      .where(and(
          gte(sql`date(${payments.payment_date}, 'localtime')`, sql`date(${startDate})`),
          lte(sql`date(${payments.payment_date}, 'localtime')`, sql`date(${endDate})`)
      )).get();
      
    return report || { total_income: 0, transaction_count: 0 };
}

function getCompletedServices(startDate: string, endDate: string) {
    return db.drizzle.select({
        ticket_number: serviceOrders.ticket_number,
        customer_name: customers.name,
        brand: devices.brand,
        model: devices.model,
        total_cost: serviceOrders.total_cost,
        completed_date: serviceOrders.completed_date,
        total_modal: sql`(SELECT SUM(cost_price) FROM service_items WHERE service_order_id = ${serviceOrders.id})`
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .innerJoin(devices, eq(serviceOrders.device_id, devices.id))
      .where(and(
          like(serviceOrders.service_status, '%Selesai%'),
          gte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${startDate})`),
          lte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${endDate})`)
      )).all();
}

function getTopSpareparts(startDate: string, endDate: string) {
    return db.drizzle.select({
        part_name: spareParts.name,
        total_sold: sql`SUM(${serviceItems.quantity})`
    }).from(serviceItems)
      .innerJoin(serviceOrders, eq(serviceItems.service_order_id, serviceOrders.id))
      .innerJoin(spareParts, eq(serviceItems.spare_part_id, spareParts.id))
      .where(and(
          like(serviceOrders.service_status, '%Selesai%'),
          gte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${startDate})`),
          lte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${endDate})`)
      ))
      .groupBy(spareParts.id)
      .orderBy(sql`total_sold DESC`)
      .limit(5)
      .all();
}

module.exports = {
    getIncomeReport,
    getCompletedServices,
    getTopSpareparts
};
