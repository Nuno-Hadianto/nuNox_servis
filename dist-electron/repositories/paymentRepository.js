"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByServiceId = getPaymentsByServiceId;
exports.addPayment = addPayment;
exports.deletePayment = deletePayment;
exports.updateServicePaymentStatus = updateServicePaymentStatus;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function generatePaymentNumber() {
    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;
    const lastPayment = db_1.default.drizzle.select({ payment_number: drizzleSchema_1.payments.payment_number })
        .from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.like)(drizzleSchema_1.payments.payment_number, `${prefix}%`))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.payments.id))
        .limit(1)
        .get();
    let nextNum = 1;
    if (lastPayment && lastPayment.payment_number) {
        const parts = lastPayment.payment_number.split('-');
        if (parts.length === 3) {
            nextNum = parseInt(parts[2], 10) + 1;
        }
    }
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}
function getPaymentsByServiceId(serviceOrderId) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.payments.service_order_id, Number(serviceOrderId)))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.payments.id))
        .all();
}
function updateServicePaymentStatus(serviceOrderId) {
    // 1. Get total cost
    const so = db_1.default.drizzle.select({ total_cost: drizzleSchema_1.serviceOrders.total_cost })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(serviceOrderId)))
        .get();
    if (!so)
        return;
    const totalCost = so.total_cost || 0;
    // 2. Get total paid
    const p = db_1.default.drizzle.select({ total_paid: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.payments.amount})` })
        .from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.payments.service_order_id, Number(serviceOrderId)))
        .get();
    const totalPaid = p?.total_paid || 0;
    // 3. Determine status
    let status = 'Belum Bayar';
    if (totalPaid >= totalCost && totalCost > 0) {
        status = 'Lunas';
    }
    else if (totalPaid > 0) {
        status = 'DP / Sebagian';
    }
    else if (totalPaid === 0 && totalCost === 0) {
        status = 'Gratis';
    }
    db_1.default.drizzle.update(drizzleSchema_1.serviceOrders)
        .set({ payment_status: status })
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(serviceOrderId)))
        .run();
}
function addPayment(data) {
    const { service_order_id, amount, payment_method, notes } = data;
    const payment_number = generatePaymentNumber();
    return db_1.default.transaction(() => {
        const info = db_1.default.drizzle.insert(drizzleSchema_1.payments).values({
            service_order_id, payment_number, amount, payment_method, notes
        }).run();
        // Check payment status
        updateServicePaymentStatus(service_order_id);
        return info.lastInsertRowid;
    })();
}
function getPaymentById(id) {
    return db_1.default.drizzle.select({ service_order_id: drizzleSchema_1.payments.service_order_id })
        .from(drizzleSchema_1.payments)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.payments.id, Number(id)))
        .get();
}
function deletePayment(id) {
    const payment = getPaymentById(id);
    if (!payment)
        return false;
    return db_1.default.transaction(() => {
        db_1.default.drizzle.delete(drizzleSchema_1.payments).where((0, drizzle_orm_1.eq)(drizzleSchema_1.payments.id, Number(id))).run();
        updateServicePaymentStatus(payment.service_order_id);
        return true;
    })();
}
