import { Payment } from '../shared/types';
import db from '../database/db';
import {  payments, serviceOrders  } from '../database/drizzleSchema';
import {  eq, like, desc, asc, sql  } from 'drizzle-orm';

function generatePaymentNumber() {
    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;
    
    const lastPayment = db.drizzle.select({ payment_number: payments.payment_number })
        .from(payments)
        .where(like(payments.payment_number, `${prefix}%`))
        .orderBy(desc(payments.id))
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

function getPaymentsByServiceId(serviceOrderId: number | string) {
    return db.drizzle.select().from(payments)
        .where(eq(payments.service_order_id, Number(serviceOrderId)))
        .orderBy(asc(payments.id))
        .all();
}

function updateServicePaymentStatus(serviceOrderId: number | string) {
    // 1. Get total cost
    const so = db.drizzle.select({ total_cost: serviceOrders.total_cost })
        .from(serviceOrders)
        .where(eq(serviceOrders.id, Number(serviceOrderId)))
        .get();
        
    if (!so) return;
    const totalCost = so.total_cost || 0;
    
    // 2. Get total paid
    const p = db.drizzle.select({ total_paid: sql`SUM(${payments.amount})` })
        .from(payments)
        .where(eq(payments.service_order_id, Number(serviceOrderId)))
        .get();
        
    const totalPaid = p?.total_paid || 0;
    
    // 3. Determine status
    let status = 'Belum Bayar';
    if (totalPaid >= totalCost && totalCost > 0) {
        status = 'Lunas';
    } else if (totalPaid > 0) {
        status = 'DP / Sebagian';
    } else if (totalPaid === 0 && totalCost === 0) {
        status = 'Gratis';
    }
    
    db.drizzle.update(serviceOrders)
        .set({ payment_status: status })
        .where(eq(serviceOrders.id, Number(serviceOrderId)))
        .run();
}

function addPayment(data: Omit<Payment, 'id'>) {
    const { service_order_id, amount, payment_method, notes } = data;
    const payment_number = generatePaymentNumber();
    
    return db.transaction(() => {
        const info = db.drizzle.insert(payments).values({
            service_order_id, payment_number, amount, payment_method, notes
        }).run();
        
        // Check payment status
        updateServicePaymentStatus(service_order_id);
        
        return info.lastInsertRowid;
    })();
}

function getPaymentById(id: number | string) {
    return db.drizzle.select({ service_order_id: payments.service_order_id })
        .from(payments)
        .where(eq(payments.id, Number(id)))
        .get();
}

function deletePayment(id: number | string) {
    const payment = getPaymentById(id);
    if (!payment) return false;
    
    return db.transaction(() => {
        db.drizzle.delete(payments).where(eq(payments.id, Number(id))).run();
        updateServicePaymentStatus(payment.service_order_id);
        return true;
    })();
}

export { 
    getPaymentsByServiceId,
    addPayment,
    deletePayment,
    updateServicePaymentStatus
 };

