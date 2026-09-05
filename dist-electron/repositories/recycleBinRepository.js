"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeletedItems = getDeletedItems;
exports.restoreItem = restoreItem;
exports.hardDeleteItem = hardDeleteItem;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getDeletedItems() {
    const items = [];
    // Customers
    const deletedCustomers = db_1.default.drizzle.select()
        .from(drizzleSchema_1.customers)
        .where((0, drizzle_orm_1.isNotNull)(drizzleSchema_1.customers.deleted_at))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.customers.deleted_at))
        .all();
    deletedCustomers.forEach((c) => {
        items.push({
            id: c.id,
            type: 'customer',
            name: c.name,
            deleted_at: c.deleted_at
        });
    });
    // Devices
    const deletedDevices = db_1.default.drizzle.select()
        .from(drizzleSchema_1.devices)
        .where((0, drizzle_orm_1.isNotNull)(drizzleSchema_1.devices.deleted_at))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.devices.deleted_at))
        .all();
    deletedDevices.forEach((d) => {
        items.push({
            id: d.id,
            type: 'device',
            name: `${d.brand} ${d.model}`,
            deleted_at: d.deleted_at
        });
    });
    // Services
    const deletedServices = db_1.default.drizzle.select()
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.isNotNull)(drizzleSchema_1.serviceOrders.deleted_at))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.serviceOrders.deleted_at))
        .all();
    deletedServices.forEach((s) => {
        items.push({
            id: s.id,
            type: 'service',
            name: s.ticket_number,
            deleted_at: s.deleted_at
        });
    });
    // Parts
    const deletedParts = db_1.default.drizzle.select()
        .from(drizzleSchema_1.spareParts)
        .where((0, drizzle_orm_1.isNotNull)(drizzleSchema_1.spareParts.deleted_at))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.spareParts.deleted_at))
        .all();
    deletedParts.forEach((p) => {
        items.push({
            id: p.id,
            type: 'part',
            name: p.name,
            deleted_at: p.deleted_at
        });
    });
    // Sort all items by deleted_at descending
    return items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
}
function restoreItem(id, type) {
    switch (type) {
        case 'customer':
            db_1.default.drizzle.update(drizzleSchema_1.customers).set({ deleted_at: null }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.customers.id, id)).run();
            break;
        case 'device':
            db_1.default.drizzle.update(drizzleSchema_1.devices).set({ deleted_at: null }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.id, id)).run();
            break;
        case 'service':
            db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({ deleted_at: null }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, id)).run();
            break;
        case 'part':
            db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({ deleted_at: null }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, id)).run();
            break;
    }
    return true;
}
function hardDeleteItem(id, type) {
    switch (type) {
        case 'customer':
            db_1.default.drizzle.delete(drizzleSchema_1.customers).where((0, drizzle_orm_1.eq)(drizzleSchema_1.customers.id, id)).run();
            break;
        case 'device':
            db_1.default.drizzle.delete(drizzleSchema_1.devices).where((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.id, id)).run();
            break;
        case 'service':
            db_1.default.drizzle.delete(drizzleSchema_1.serviceOrders).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, id)).run();
            break;
        case 'part':
            db_1.default.drizzle.delete(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, id)).run();
            break;
    }
    return true;
}
