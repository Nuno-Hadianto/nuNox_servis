"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncomeReport = getIncomeReport;
exports.getCompletedServices = getCompletedServices;
exports.getTopSpareparts = getTopSpareparts;
// @ts-nocheck
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getIncomeReport(startDate, endDate) {
    const report = db_1.default.drizzle.select({
        total_income: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.payments.amount})`,
        transaction_count: (0, drizzle_orm_1.sql) `COUNT(${drizzleSchema_1.payments.id})`
    }).from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.payments.payment_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${startDate})`), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.payments.payment_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${endDate})`))).get();
    return report || { total_income: 0, transaction_count: 0 };
}
function getCompletedServices(startDate, endDate) {
    return db_1.default.drizzle.select({
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        customer_name: drizzleSchema_1.customers.name,
        brand: drizzleSchema_1.devices.brand,
        model: drizzleSchema_1.devices.model,
        total_cost: drizzleSchema_1.serviceOrders.total_cost,
        completed_date: drizzleSchema_1.serviceOrders.completed_date,
        total_modal: (0, drizzle_orm_1.sql) `(SELECT SUM(cost_price) FROM service_items WHERE service_order_id = ${drizzleSchema_1.serviceOrders.id})`
    }).from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .innerJoin(drizzleSchema_1.devices, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, drizzleSchema_1.devices.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${startDate})`), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${endDate})`))).all();
}
function getTopSpareparts(startDate, endDate) {
    return db_1.default.drizzle.select({
        part_name: drizzleSchema_1.spareParts.name,
        total_sold: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.serviceItems.quantity})`
    }).from(drizzleSchema_1.serviceItems)
        .innerJoin(drizzleSchema_1.serviceOrders, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.service_order_id, drizzleSchema_1.serviceOrders.id))
        .innerJoin(drizzleSchema_1.spareParts, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.spare_part_id, drizzleSchema_1.spareParts.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${startDate})`), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.serviceOrders.completed_date}, 'localtime')`, (0, drizzle_orm_1.sql) `date(${endDate})`)))
        .groupBy(drizzleSchema_1.spareParts.id)
        .orderBy((0, drizzle_orm_1.sql) `total_sold DESC`)
        .limit(5)
        .all();
}
