"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevices = getDevices;
exports.getDeviceById = getDeviceById;
exports.getDevicesByCustomerId = getDevicesByCustomerId;
exports.addDevice = addDevice;
exports.updateDevice = updateDevice;
exports.checkDeviceHasServiceOrders = checkDeviceHasServiceOrders;
exports.deleteDevice = deleteDevice;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getDevices(searchQuery = '', sortBy = 'name_asc') {
    const baseQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.devices.id,
        customer_id: drizzleSchema_1.devices.customer_id,
        device_type: drizzleSchema_1.devices.device_type,
        brand: drizzleSchema_1.devices.brand,
        model: drizzleSchema_1.devices.model,
        serial_number: drizzleSchema_1.devices.serial_number,
        color: drizzleSchema_1.devices.color,
        accessories: drizzleSchema_1.devices.accessories,
        physical_condition: drizzleSchema_1.devices.physical_condition,
        notes: drizzleSchema_1.devices.notes,
        created_at: drizzleSchema_1.devices.created_at,
        updated_at: drizzleSchema_1.devices.updated_at,
        customer_name: drizzleSchema_1.customers.name,
        customer_phone: drizzleSchema_1.customers.phone
    }).from(drizzleSchema_1.devices).innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.devices.customer_id, drizzleSchema_1.customers.id));
    let query = baseQuery;
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        query = baseQuery.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.devices.brand, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.devices.model, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.devices.serial_number, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.customers.name, queryStr)), (0, drizzle_orm_1.isNull)(drizzleSchema_1.devices.deleted_at)));
    }
    else {
        query = baseQuery.where((0, drizzle_orm_1.isNull)(drizzleSchema_1.devices.deleted_at));
    }
    switch (sortBy) {
        case 'name_asc':
            return query.orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.devices.brand), (0, drizzle_orm_1.asc)(drizzleSchema_1.devices.model)).all();
        case 'name_desc':
            return query.orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.devices.brand), (0, drizzle_orm_1.desc)(drizzleSchema_1.devices.model)).all();
        case 'id_desc':
            return query.orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.devices.id)).all();
        case 'id_asc':
            return query.orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.devices.id)).all();
        default:
            return query.orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.devices.id)).all();
    }
}
function getDeviceById(id) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.devices).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.id, Number(id)), (0, drizzle_orm_1.isNull)(drizzleSchema_1.devices.deleted_at))).get();
}
function getDevicesByCustomerId(customerId) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.devices)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.customer_id, Number(customerId)), (0, drizzle_orm_1.isNull)(drizzleSchema_1.devices.deleted_at)))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.devices.id)).all();
}
function addDevice(data) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    const result = db_1.default.drizzle.insert(drizzleSchema_1.devices).values({
        customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes
    }).run();
    return result.lastInsertRowid;
}
function updateDevice(id, data) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    db_1.default.drizzle.update(drizzleSchema_1.devices).set({
        customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
    }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.id, Number(id))).run();
    return true;
}
function checkDeviceHasServiceOrders(id) {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, Number(id))).get();
    return result.count > 0;
}
function deleteDevice(id) {
    db_1.default.drizzle.update(drizzleSchema_1.devices).set({ deleted_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.devices.id, Number(id))).run();
    return true;
}
