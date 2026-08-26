"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.getCustomerById = getCustomerById;
exports.addCustomer = addCustomer;
exports.updateCustomer = updateCustomer;
exports.checkCustomerHasServiceOrders = checkCustomerHasServiceOrders;
exports.deleteCustomer = deleteCustomer;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getCustomers(searchQuery = '', page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    let data, total;
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const filter = (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.customers.name, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.customers.phone, queryStr));
        data = db_1.default.drizzle.select().from(drizzleSchema_1.customers)
            .where(filter)
            .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.customers.name))
            .limit(limit)
            .offset(offset)
            .all();
        total = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.customers)
            .where(filter).get().count;
    }
    else {
        data = db_1.default.drizzle.select().from(drizzleSchema_1.customers)
            .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.customers.name))
            .limit(limit)
            .offset(offset)
            .all();
        total = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.customers).get().count;
    }
    return { data, total, page, limit };
}
function getCustomerById(id) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.customers).where((0, drizzle_orm_1.eq)(drizzleSchema_1.customers.id, Number(id))).get();
}
function addCustomer(data) {
    const { name, phone, address, notes } = data;
    const result = db_1.default.drizzle.insert(drizzleSchema_1.customers).values({ name, phone, address, notes }).run();
    return result.lastInsertRowid;
}
function updateCustomer(id, data) {
    const { name, phone, address, notes } = data;
    db_1.default.drizzle.update(drizzleSchema_1.customers)
        .set({ name, phone, address, notes, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.customers.id, Number(id))).run();
    return true;
}
function checkCustomerHasServiceOrders(id) {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, Number(id))).get();
    return result.count > 0;
}
function deleteCustomer(id) {
    db_1.default.drizzle.delete(drizzleSchema_1.customers).where((0, drizzle_orm_1.eq)(drizzleSchema_1.customers.id, Number(id))).run();
    return true;
}
