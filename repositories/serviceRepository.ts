import { ServiceOrder } from '../shared/types';
import db from '../database/db';
import {  serviceOrders, customers, devices, serviceStatusHistory  } from '../database/drizzleSchema';
import {  eq, like, notLike, notInArray, or, asc, desc, sql, and, gte, isNotNull, SQL  } from 'drizzle-orm';

function generateTicketNumber() {
    const year = new Date().getFullYear();
    const prefix = `NSV-${year}-`;
    
    const lastOrder = db.drizzle.select({ ticket_number: serviceOrders.ticket_number })
        .from(serviceOrders)
        .where(like(serviceOrders.ticket_number, `${prefix}%`))
        .orderBy(desc(serviceOrders.id))
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

function getServices(searchQuery: string = '', page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    
    const baseQuery = db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_id: serviceOrders.customer_id,
        device_id: serviceOrders.device_id,
        received_date: serviceOrders.received_date,
        estimated_completion_date: serviceOrders.estimated_completion_date,
        customer_complaint: serviceOrders.customer_complaint,
        diagnosis_result: serviceOrders.diagnosis_result,
        actions_taken: serviceOrders.actions_taken,
        technician_notes: serviceOrders.technician_notes,
        total_cost: serviceOrders.total_cost,
        service_status: serviceOrders.service_status,
        payment_status: serviceOrders.payment_status,
        completed_date: serviceOrders.completed_date,
        created_at: serviceOrders.created_at,
        updated_at: serviceOrders.updated_at,
        customer_name: customers.name,
        brand: devices.brand,
        model: devices.model,
        device_type: devices.device_type
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .innerJoin(devices, eq(serviceOrders.device_id, devices.id));

    const countQuery = db.drizzle.select({ count: sql`count(*)` })
        .from(serviceOrders)
        .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
        .innerJoin(devices, eq(serviceOrders.device_id, devices.id));

    let data, total;
    let condition: SQL | undefined = undefined;
    
    if (searchQuery) {
        if (searchQuery === 'Sedang Dikerjakan') {
            condition = and(
                notLike(serviceOrders.service_status, '%Selesai%'),
                notInArray(serviceOrders.service_status, ['Batal', 'Dibatalkan'])
            );
        } else if (searchQuery === 'Hari Ini') {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            condition = eq(sql`DATE(${serviceOrders.created_at}, 'localtime')`, today);
        } else {
            const qStr = `%${searchQuery}%`;
            condition = or(
                like(serviceOrders.ticket_number, qStr),
                like(customers.name, qStr),
                like(devices.brand, qStr),
                like(serviceOrders.service_status, qStr)
            );
        }
    }
    
    if (condition) {
        data = baseQuery.where(condition).orderBy(desc(serviceOrders.id)).limit(limit).offset(offset).all();
        const t = countQuery.where(condition).get();
        total = t?.count || 0;
    } else {
        data = baseQuery.orderBy(desc(serviceOrders.id)).limit(limit).offset(offset).all();
        const t = countQuery.get();
        total = t?.count || 0;
    }
    
    return { data, total, page, limit };
}

function getServiceById(id: number | string) {
    return db.drizzle.select({
        id: serviceOrders.id,
        ticket_number: serviceOrders.ticket_number,
        customer_id: serviceOrders.customer_id,
        device_id: serviceOrders.device_id,
        received_date: serviceOrders.received_date,
        estimated_completion_date: serviceOrders.estimated_completion_date,
        customer_complaint: serviceOrders.customer_complaint,
        diagnosis_result: serviceOrders.diagnosis_result,
        actions_taken: serviceOrders.actions_taken,
        technician_notes: serviceOrders.technician_notes,
        total_cost: serviceOrders.total_cost,
        service_status: serviceOrders.service_status,
        payment_status: serviceOrders.payment_status,
        completed_date: serviceOrders.completed_date,
        created_at: serviceOrders.created_at,
        updated_at: serviceOrders.updated_at,
        warranty_end_date: serviceOrders.warranty_end_date,
        customer_name: customers.name,
        customer_phone: customers.phone,
        customer_address: customers.address,
        brand: devices.brand,
        model: devices.model,
        device_type: devices.device_type,
        serial_number: devices.serial_number,
        color: devices.color,
        accessories: devices.accessories
    }).from(serviceOrders)
      .innerJoin(customers, eq(serviceOrders.customer_id, customers.id))
      .innerJoin(devices, eq(serviceOrders.device_id, devices.id))
      .where(eq(serviceOrders.id, Number(id)))
      .get();
}

function getServiceByTicketNumber(ticketNumber: string) {
    return db.drizzle.select({ id: serviceOrders.id }).from(serviceOrders)
        .where(eq(serviceOrders.ticket_number, ticketNumber)).get();
}

function getServiceStatusHistory(serviceOrderId: number | string) {
    return db.drizzle.select().from(serviceStatusHistory)
        .where(eq(serviceStatusHistory.service_order_id, Number(serviceOrderId)))
        .orderBy(asc(serviceStatusHistory.id)).all();
}

function addService(data: ServiceOrder) {
    const { customer_id, device_id, estimated_completion_date, customer_complaint } = data;
    const ticket_number = generateTicketNumber();
    
    return db.transaction(() => {
        const info = db.drizzle.insert(serviceOrders).values({
            ticket_number, 
            customer_id, 
            device_id, 
            estimated_completion_date, 
            customer_complaint, 
            service_status: 'Diterima'
        }).run();
        
        const serviceOrderId = info.lastInsertRowid;
        
        db.drizzle.insert(serviceStatusHistory).values({
            service_order_id: serviceOrderId,
            status: 'Diterima',
            notes: 'Servis diterima'
        }).run();
        
        return serviceOrderId;
    })();
}

function updateServiceStatus(id: number | string, status: string, notes: string, warrantyDays: number = 0) {
    return db.transaction(() => {
        db.drizzle.update(serviceOrders).set({
            service_status: status,
            updated_at: sql`CURRENT_TIMESTAMP`
        }).where(eq(serviceOrders.id, Number(id))).run();
        
        db.drizzle.insert(serviceStatusHistory).values({
            service_order_id: Number(id),
            status,
            notes
        }).run();
        
        if (status === 'Selesai (Belum Diambil)' || status === 'Selesai (Sudah Diambil)' || status.includes('Selesai')) {
            const so = db.drizzle.select({ completed_date: serviceOrders.completed_date })
                .from(serviceOrders).where(eq(serviceOrders.id, Number(id))).get();
                
            if (so && !so.completed_date) {
                db.drizzle.update(serviceOrders).set({ completed_date: sql`CURRENT_TIMESTAMP` })
                    .where(eq(serviceOrders.id, Number(id))).run();
            }
            
            if (warrantyDays > 0) {
                db.drizzle.update(serviceOrders).set({
                    warranty_end_date: sql`datetime('now', '+' || ${warrantyDays} || ' days')`
                }).where(eq(serviceOrders.id, Number(id))).run();
            }
        }
        
        return true;
    })();
}

function updateServiceDetails(id: number | string, data: ServiceOrder) {
    const { diagnosis_result, actions_taken, technician_notes } = data;
    
    db.drizzle.update(serviceOrders).set({
        diagnosis_result,
        actions_taken,
        technician_notes,
        updated_at: sql`CURRENT_TIMESTAMP`
    }).where(eq(serviceOrders.id, Number(id))).run();
    
    return true;
}

function deleteService(id: number | string) {
    return db.transaction(() => {
        db.drizzle.delete(serviceOrders).where(eq(serviceOrders.id, Number(id))).run();
        
        return true;
    })();
}

// Warranty Logic
function checkWarranty(deviceId: number | string) {
    return db.drizzle.select({ ticket_number: serviceOrders.ticket_number, warranty_end_date: serviceOrders.warranty_end_date })
        .from(serviceOrders)
        .where(and(
            eq(serviceOrders.device_id, Number(deviceId)),
            isNotNull(serviceOrders.warranty_end_date),
            gte(serviceOrders.warranty_end_date, sql`datetime('now')`)
        ))
        .orderBy(desc(serviceOrders.warranty_end_date))
        .limit(1)
        .get() || null;
}

export { 
    generateTicketNumber,
    getServices,
    getServiceById,
    getServiceByTicketNumber,
    getServiceStatusHistory,
    addService,
    updateServiceStatus,
    updateServiceDetails,
    deleteService,
    checkWarranty
 };

