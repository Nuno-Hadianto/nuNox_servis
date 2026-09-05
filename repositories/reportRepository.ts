import db from '../database/db';
import {  payments, serviceOrders, customers, devices, serviceItems, spareParts  } from '../database/drizzleSchema';
import {  sql, and, gte, lte, eq, inArray  } from 'drizzle-orm';
import { ServiceStatus } from '../shared/types';

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
          inArray(serviceOrders.service_status, [ServiceStatus.SELESAI_BELUM_DIAMBIL, ServiceStatus.SELESAI_SUDAH_DIAMBIL]),
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
          inArray(serviceOrders.service_status, [ServiceStatus.SELESAI_BELUM_DIAMBIL, ServiceStatus.SELESAI_SUDAH_DIAMBIL]),
          gte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${startDate})`),
          lte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${endDate})`)
      ))
      .groupBy(spareParts.id)
      .orderBy(sql`SUM(${serviceItems.quantity}) DESC`)
      .limit(5)
      .all();
}

function getReportBreakdown(startDate: string, endDate: string) {
    const data = db.drizzle.select({
        item_type: serviceItems.item_type,
        total_omset: sql`SUM(${serviceItems.total})`,
        total_modal: sql`SUM(${serviceItems.cost_price})`
    }).from(serviceItems)
      .innerJoin(serviceOrders, eq(serviceItems.service_order_id, serviceOrders.id))
      .where(and(
          inArray(serviceOrders.service_status, [ServiceStatus.SELESAI_BELUM_DIAMBIL, ServiceStatus.SELESAI_SUDAH_DIAMBIL]),
          gte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${startDate})`),
          lte(sql`date(${serviceOrders.completed_date}, 'localtime')`, sql`date(${endDate})`)
      ))
      .groupBy(serviceItems.item_type)
      .all();
      
    // Default values if empty
    const breakdown = {
        jasa: { omset: 0, modal: 0 },
        sparepart: { omset: 0, modal: 0 },
        diskon: { omset: 0, modal: 0 },
        lainnya: { omset: 0, modal: 0 }
    };
    
    data.forEach((row: { item_type: string | null; total_omset: number | null; total_modal: number | null; }) => {
        const type = row.item_type === 'Jasa' ? 'jasa' :
                     row.item_type === 'Sparepart' ? 'sparepart' :
                     row.item_type === 'Diskon' ? 'diskon' : 'lainnya';
        
        breakdown[type].omset += (row.total_omset || 0);
        breakdown[type].modal += (row.total_modal || 0);
    });
    
    return breakdown;
}

export { 
    getIncomeReport,
    getCompletedServices,
    getTopSpareparts,
    getReportBreakdown
 };

