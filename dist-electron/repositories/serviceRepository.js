"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketNumber = generateTicketNumber;
exports.getServices = getServices;
exports.getServiceById = getServiceById;
exports.getServiceByTicketNumber = getServiceByTicketNumber;
exports.getServiceStatusHistory = getServiceStatusHistory;
exports.addService = addService;
exports.updateServiceStatus = updateServiceStatus;
exports.updateServiceDetails = updateServiceDetails;
exports.deleteService = deleteService;
exports.checkWarranty = checkWarranty;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function generateTicketNumber() {
    const year = new Date().getFullYear();
    const prefix = `NSV-${year}-`;
    const lastOrder = db_1.default.drizzle.select({ ticket_number: drizzleSchema_1.serviceOrders.ticket_number })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.ticket_number, `${prefix}%`))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.serviceOrders.id))
        .limit(1).get();
    let nextNum = 1;
    if (lastOrder && lastOrder.ticket_number) {
        const parts = lastOrder.ticket_number.split('-');
        if (parts.length === 3) {
            nextNum = parseInt(parts[2], 10) + 1;
        }
    }
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}
function getServices(searchQuery = '', page = 1, limit = 50, technicianFilter) {
    const offset = (page - 1) * limit;
    const baseQuery = db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        customer_id: drizzleSchema_1.serviceOrders.customer_id,
        device_id: drizzleSchema_1.serviceOrders.device_id,
        received_date: drizzleSchema_1.serviceOrders.received_date,
        estimated_completion_date: drizzleSchema_1.serviceOrders.estimated_completion_date,
        technician: drizzleSchema_1.serviceOrders.technician,
        customer_complaint: drizzleSchema_1.serviceOrders.customer_complaint,
        diagnosis_result: drizzleSchema_1.serviceOrders.diagnosis_result,
        actions_taken: drizzleSchema_1.serviceOrders.actions_taken,
        technician_notes: drizzleSchema_1.serviceOrders.technician_notes,
        estimated_cost: drizzleSchema_1.serviceOrders.estimated_cost,
        total_cost: drizzleSchema_1.serviceOrders.total_cost,
        service_status: drizzleSchema_1.serviceOrders.service_status,
        payment_status: drizzleSchema_1.serviceOrders.payment_status,
        completed_date: drizzleSchema_1.serviceOrders.completed_date,
        created_at: drizzleSchema_1.serviceOrders.created_at,
        updated_at: drizzleSchema_1.serviceOrders.updated_at,
        customer_name: drizzleSchema_1.customers.name,
        brand: drizzleSchema_1.devices.brand,
        model: drizzleSchema_1.devices.model,
        device_type: drizzleSchema_1.devices.device_type
    }).from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .innerJoin(drizzleSchema_1.devices, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, drizzleSchema_1.devices.id));
    const countQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .innerJoin(drizzleSchema_1.devices, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, drizzleSchema_1.devices.id));
    let data, total;
    let condition = undefined;
    if (searchQuery) {
        if (searchQuery === 'Sedang Dikerjakan') {
            condition = (0, drizzle_orm_1.and)((0, drizzle_orm_1.notLike)(drizzleSchema_1.serviceOrders.service_status, '%Selesai%'), (0, drizzle_orm_1.notInArray)(drizzleSchema_1.serviceOrders.service_status, ['Batal', 'Dibatalkan']));
        }
        else if (searchQuery === 'Hari Ini') {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            condition = (0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `DATE(${drizzleSchema_1.serviceOrders.created_at}, 'localtime')`, today);
        }
        else {
            const qStr = `%${searchQuery}%`;
            condition = (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.ticket_number, qStr), (0, drizzle_orm_1.like)(drizzleSchema_1.customers.name, qStr), (0, drizzle_orm_1.like)(drizzleSchema_1.devices.brand, qStr), (0, drizzle_orm_1.like)(drizzleSchema_1.serviceOrders.service_status, qStr));
        }
    }
    if (technicianFilter) {
        const techCondition = (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.technician, technicianFilter);
        if (condition) {
            condition = (0, drizzle_orm_1.and)(condition, techCondition);
        }
        else {
            condition = techCondition;
        }
    }
    if (condition) {
        data = baseQuery.where(condition).orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.serviceOrders.id)).limit(limit).offset(offset).all();
        const t = countQuery.where(condition).get();
        total = t?.count || 0;
    }
    else {
        data = baseQuery.orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.serviceOrders.id)).limit(limit).offset(offset).all();
        const t = countQuery.get();
        total = t?.count || 0;
    }
    return { data, total, page, limit };
}
function getServiceById(id) {
    return db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceOrders.id,
        ticket_number: drizzleSchema_1.serviceOrders.ticket_number,
        customer_id: drizzleSchema_1.serviceOrders.customer_id,
        device_id: drizzleSchema_1.serviceOrders.device_id,
        received_date: drizzleSchema_1.serviceOrders.received_date,
        estimated_completion_date: drizzleSchema_1.serviceOrders.estimated_completion_date,
        technician: drizzleSchema_1.serviceOrders.technician,
        customer_complaint: drizzleSchema_1.serviceOrders.customer_complaint,
        diagnosis_result: drizzleSchema_1.serviceOrders.diagnosis_result,
        actions_taken: drizzleSchema_1.serviceOrders.actions_taken,
        technician_notes: drizzleSchema_1.serviceOrders.technician_notes,
        estimated_cost: drizzleSchema_1.serviceOrders.estimated_cost,
        total_cost: drizzleSchema_1.serviceOrders.total_cost,
        service_status: drizzleSchema_1.serviceOrders.service_status,
        payment_status: drizzleSchema_1.serviceOrders.payment_status,
        completed_date: drizzleSchema_1.serviceOrders.completed_date,
        created_at: drizzleSchema_1.serviceOrders.created_at,
        updated_at: drizzleSchema_1.serviceOrders.updated_at,
        warranty_end_date: drizzleSchema_1.serviceOrders.warranty_end_date,
        customer_name: drizzleSchema_1.customers.name,
        customer_phone: drizzleSchema_1.customers.phone,
        customer_address: drizzleSchema_1.customers.address,
        brand: drizzleSchema_1.devices.brand,
        model: drizzleSchema_1.devices.model,
        device_type: drizzleSchema_1.devices.device_type,
        serial_number: drizzleSchema_1.devices.serial_number,
        color: drizzleSchema_1.devices.color,
        accessories: drizzleSchema_1.devices.accessories
    }).from(drizzleSchema_1.serviceOrders)
        .innerJoin(drizzleSchema_1.customers, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.customer_id, drizzleSchema_1.customers.id))
        .innerJoin(drizzleSchema_1.devices, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, drizzleSchema_1.devices.id))
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id)))
        .get();
}
function getServiceByTicketNumber(ticketNumber) {
    return db_1.default.drizzle.select({ id: drizzleSchema_1.serviceOrders.id }).from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.ticket_number, ticketNumber)).get();
}
function getServiceStatusHistory(serviceOrderId) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.serviceStatusHistory)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceStatusHistory.service_order_id, Number(serviceOrderId)))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.serviceStatusHistory.id)).all();
}
function addService(data) {
    const { customer_id, device_id, estimated_completion_date, technician, customer_complaint, estimated_cost } = data;
    const ticket_number = generateTicketNumber();
    return db_1.default.transaction(() => {
        const info = db_1.default.drizzle.insert(drizzleSchema_1.serviceOrders).values({
            ticket_number,
            customer_id,
            device_id,
            estimated_completion_date,
            technician,
            customer_complaint,
            estimated_cost: estimated_cost || 0,
            service_status: 'Diterima'
        }).run();
        const serviceOrderId = info.lastInsertRowid;
        db_1.default.drizzle.insert(drizzleSchema_1.serviceStatusHistory).values({
            service_order_id: serviceOrderId,
            status: 'Diterima',
            notes: 'Servis diterima'
        }).run();
        return serviceOrderId;
    })();
}
function updateServiceStatus(id, status, notes, warrantyDays = 0) {
    return db_1.default.transaction(() => {
        db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({
            service_status: status,
            updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
        }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).run();
        db_1.default.drizzle.insert(drizzleSchema_1.serviceStatusHistory).values({
            service_order_id: Number(id),
            status,
            notes
        }).run();
        if (status === 'Selesai (Belum Diambil)' || status === 'Selesai (Sudah Diambil)' || status.includes('Selesai')) {
            const so = db_1.default.drizzle.select({ completed_date: drizzleSchema_1.serviceOrders.completed_date })
                .from(drizzleSchema_1.serviceOrders).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).get();
            if (so && !so.completed_date) {
                db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({ completed_date: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).run();
            }
            if (warrantyDays > 0) {
                db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({
                    warranty_end_date: (0, drizzle_orm_1.sql) `datetime('now', '+' || ${warrantyDays} || ' days')`
                }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).run();
            }
        }
        return true;
    })();
}
function updateServiceDetails(id, data) {
    const { diagnosis_result, actions_taken, technician_notes } = data;
    db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({
        diagnosis_result,
        actions_taken,
        technician_notes,
        updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
    }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).run();
    return true;
}
function deleteService(id) {
    return db_1.default.transaction(() => {
        db_1.default.drizzle.delete(drizzleSchema_1.serviceOrders).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(id))).run();
        return true;
    })();
}
// Warranty Logic
function checkWarranty(deviceId) {
    return db_1.default.drizzle.select({ ticket_number: drizzleSchema_1.serviceOrders.ticket_number, warranty_end_date: drizzleSchema_1.serviceOrders.warranty_end_date })
        .from(drizzleSchema_1.serviceOrders)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.device_id, Number(deviceId)), (0, drizzle_orm_1.isNotNull)(drizzleSchema_1.serviceOrders.warranty_end_date), (0, drizzle_orm_1.gte)(drizzleSchema_1.serviceOrders.warranty_end_date, (0, drizzle_orm_1.sql) `datetime('now')`)))
        .orderBy((0, drizzle_orm_1.desc)(drizzleSchema_1.serviceOrders.warranty_end_date))
        .limit(1)
        .get() || null;
}
