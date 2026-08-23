"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../database/db');
const { sales, saleItems, spareParts } = require('../database/drizzleSchema');
const { eq, gte, lte, and, desc, sql } = require('drizzle-orm');
function createSale(saleData, items) {
    return db.transaction(() => {
        // Create Sale
        const saleResult = db.drizzle.insert(sales).values({
            invoice_number: saleData.invoice_number,
            customer_name: saleData.customer_name || '',
            total_amount: saleData.total_amount,
            payment_method: saleData.payment_method
        }).run();
        const saleId = saleResult.lastInsertRowid;
        // Insert Items and Deduct Stock
        for (const item of items) {
            db.drizzle.insert(saleItems).values({
                sale_id: saleId,
                spare_part_id: item.spare_part_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            }).run();
            db.drizzle.update(spareParts).set({
                stock: sql `stock - ${item.quantity}`,
                updated_at: sql `CURRENT_TIMESTAMP`
            }).where(eq(spareParts.id, item.spare_part_id)).run();
        }
        return saleId;
    })();
}
function getSales(startDate, endDate) {
    const baseQuery = db.drizzle.select().from(sales);
    if (startDate && endDate) {
        // Using sql to format date
        const condition = and(gte(sql `date(${sales.created_at}, 'localtime')`, startDate), lte(sql `date(${sales.created_at}, 'localtime')`, endDate));
        return baseQuery.where(condition).orderBy(desc(sales.created_at)).all();
    }
    else {
        return baseQuery.orderBy(desc(sales.created_at)).limit(50).all();
    }
}
function getSaleItems(saleId) {
    return db.drizzle.select({
        id: saleItems.id,
        sale_id: saleItems.sale_id,
        spare_part_id: saleItems.spare_part_id,
        quantity: saleItems.quantity,
        price: saleItems.price,
        total: saleItems.total,
        part_name: spareParts.name,
        part_code: spareParts.part_code
    }).from(saleItems)
        .leftJoin(spareParts, eq(saleItems.spare_part_id, spareParts.id))
        .where(eq(saleItems.sale_id, Number(saleId))).all();
}
function getSaleById(saleId) {
    return db.drizzle.select().from(sales).where(eq(sales.id, Number(saleId))).get();
}
module.exports = {
    createSale,
    getSales,
    getSaleItems,
    getSaleById
};
