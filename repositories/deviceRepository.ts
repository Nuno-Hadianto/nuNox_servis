import { Device } from '../shared/types';
const db = require('../database/db');
const { devices, customers, serviceOrders } = require('../database/drizzleSchema');
const { eq, like, or, desc, sql } = require('drizzle-orm');

function getDevices(searchQuery = '') {
    const baseQuery = db.drizzle.select({
        id: devices.id,
        customer_id: devices.customer_id,
        device_type: devices.device_type,
        brand: devices.brand,
        model: devices.model,
        serial_number: devices.serial_number,
        color: devices.color,
        accessories: devices.accessories,
        physical_condition: devices.physical_condition,
        notes: devices.notes,
        created_at: devices.created_at,
        updated_at: devices.updated_at,
        customer_name: customers.name,
        customer_phone: customers.phone
    }).from(devices).innerJoin(customers, eq(devices.customer_id, customers.id));

    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        return baseQuery.where(
            or(
                like(devices.brand, queryStr),
                like(devices.model, queryStr),
                like(devices.serial_number, queryStr),
                like(customers.name, queryStr)
            )
        ).orderBy(desc(devices.id)).all();
    }
    
    return baseQuery.orderBy(desc(devices.id)).all();
}

function getDeviceById(id: number | string) {
    return db.drizzle.select().from(devices).where(eq(devices.id, Number(id))).get();
}

function getDevicesByCustomerId(customerId) {
    return db.drizzle.select().from(devices)
        .where(eq(devices.customer_id, Number(customerId)))
        .orderBy(desc(devices.id)).all();
}

function addDevice(data: Device) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    const result = db.drizzle.insert(devices).values({
        customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes
    }).run();
    return result.lastInsertRowid;
}

function updateDevice(id: number | string, data: Device) {
    const { customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes } = data;
    db.drizzle.update(devices).set({
        customer_id, device_type, brand, model, serial_number, color, accessories, physical_condition, notes, updated_at: sql`CURRENT_TIMESTAMP`
    }).where(eq(devices.id, Number(id))).run();
    return true;
}

function checkDeviceHasServiceOrders(id) {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(serviceOrders)
        .where(eq(serviceOrders.device_id, Number(id))).get();
    return result.count > 0;
}

function deleteDevice(id: number | string) {
    db.drizzle.delete(devices).where(eq(devices.id, Number(id))).run();
    return true;
}

module.exports = {
    getDevices,
    getDeviceById,
    getDevicesByCustomerId,
    addDevice,
    updateDevice,
    checkDeviceHasServiceOrders,
    deleteDevice
};
