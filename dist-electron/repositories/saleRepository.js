"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSale = createSale;
exports.getSales = getSales;
exports.getSaleItems = getSaleItems;
exports.getSaleById = getSaleById;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function createSale(saleData, items) {
    return db_1.default.transaction(() => {
        // Create Sale
        const saleResult = db_1.default.drizzle.insert(drizzleSchema_1.sales).values({
            invoice_number: saleData.invoice_number,
            customer_name: saleData.customer_name || '',
            total_amount: saleData.total_amount,
            payment_method: saleData.payment_method
        }).run();
        const saleId = saleResult.lastInsertRowid;
        // Insert Items and Deduct Stock
        for (const item of items) {
            db_1.default.drizzle.insert(drizzleSchema_1.saleItems).values({
                sale_id: saleId,
                spare_part_id: item.spare_part_id,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            }).run();
            db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
                stock: (0, drizzle_orm_1.sql) `stock - ${item.quantity}`,
                updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
            }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, item.spare_part_id)).run();
        }
        return saleId;
    })();
}
function getSales(startDate, endDate) {
    const baseQuery = db_1.default.drizzle.select().from(drizzleSchema_1.sales);
    if (startDate && endDate) {
        // Using sql to format date
        const condition = (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.sales.created_at}, 'localtime')`, startDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `date(${drizzleSchema_1.sales.created_at}, 'localtime')`, endDate));
        return baseQuery.where(condition).orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.sales.created_at)).all();
    }
    else {
        return baseQuery.orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.sales.created_at)).limit(50).all();
    }
}
function getSaleItems(saleId) {
    return db_1.default.drizzle.select({
        id: drizzleSchema_1.saleItems.id,
        sale_id: drizzleSchema_1.saleItems.sale_id,
        spare_part_id: drizzleSchema_1.saleItems.spare_part_id,
        quantity: drizzleSchema_1.saleItems.quantity,
        price: drizzleSchema_1.saleItems.price,
        total: drizzleSchema_1.saleItems.total,
        part_name: drizzleSchema_1.spareParts.name,
        part_code: drizzleSchema_1.spareParts.part_code
    }).from(drizzleSchema_1.saleItems)
        .leftJoin(drizzleSchema_1.spareParts, (0, drizzle_orm_1.eq)(drizzleSchema_1.saleItems.spare_part_id, drizzleSchema_1.spareParts.id))
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.saleItems.sale_id, Number(saleId))).all();
}
function getSaleById(saleId) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.sales).where((0, drizzle_orm_1.eq)(drizzleSchema_1.sales.id, Number(saleId))).get();
}
