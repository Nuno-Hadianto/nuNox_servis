import { ServiceItem } from '../shared/types';
import db from '../database/db';
import * as paymentRepository from './paymentRepository';
import {  serviceItems, spareParts, serviceOrders, partLogs  } from '../database/drizzleSchema';
import {  eq, asc, sql  } from 'drizzle-orm';

function getServiceItems(serviceOrderId: number | string) {
    return db.drizzle.select({
        id: serviceItems.id,
        service_order_id: serviceItems.service_order_id,
        item_type: serviceItems.item_type,
        spare_part_id: serviceItems.spare_part_id,
        description: serviceItems.description,
        quantity: serviceItems.quantity,
        price: serviceItems.price,
        cost_price: serviceItems.cost_price,
        total: serviceItems.total,
        part_name: spareParts.name
    }).from(serviceItems)
      .leftJoin(spareParts, eq(serviceItems.spare_part_id, spareParts.id))
      .where(eq(serviceItems.service_order_id, Number(serviceOrderId)))
      .orderBy(asc(serviceItems.id))
      .all();
}

function addServiceItem(data: ServiceItem) {
    const { service_order_id, item_type, spare_part_id, description, quantity, price } = data;

    // Diskon uses negative total
    let total = quantity * price;
    if (item_type === 'Diskon') {
        total = -Math.abs(total);
    }

    let cost_price = 0;
    if (item_type === 'Sparepart' && spare_part_id) {
        const part = db.drizzle.select({ stock: spareParts.stock, buy_price: spareParts.buy_price })
            .from(spareParts).where(eq(spareParts.id, spare_part_id)).get();
            
        if (part) {
            if (part.stock < quantity) {
                throw new Error(`Stok sparepart tidak mencukupi (Tersisa: ${part.stock})`);
            }
            cost_price = part.buy_price * quantity;
        }
    }

    return db.transaction(() => {
        const info = db.drizzle.insert(serviceItems).values({
            service_order_id, 
            item_type, 
            spare_part_id: spare_part_id || null, 
            description, 
            quantity, 
            price, 
            cost_price, 
            total
        }).run();

        // Update stock if it's a spare part
        if (item_type === 'Sparepart' && spare_part_id) {
            db.drizzle.update(spareParts).set({
                stock: sql`stock - ${quantity}`
            }).where(eq(spareParts.id, spare_part_id)).run();

            const updatedPart = db.drizzle.select({ stock: spareParts.stock }).from(spareParts).where(eq(spareParts.id, spare_part_id)).get();
            if (updatedPart) {
                const service = db.drizzle.select({ ticket_number: serviceOrders.ticket_number }).from(serviceOrders).where(eq(serviceOrders.id, service_order_id)).get();
                db.drizzle.insert(partLogs).values({
                    spare_part_id: spare_part_id,
                    change_amount: -quantity,
                    new_stock: updatedPart.stock,
                    reason: 'Dipakai Servis',
                    reference_id: service ? service.ticket_number : ''
                }).run();
            }
        }

        // Recalculate total cost in service_orders
        recalculateServiceTotal(service_order_id);

        return info.lastInsertRowid;
    })();
}

function deleteServiceItem(id: number | string) {
    const item = db.drizzle.select().from(serviceItems).where(eq(serviceItems.id, Number(id))).get();
    if (!item) return false;

    return db.transaction(() => {
        db.drizzle.delete(serviceItems).where(eq(serviceItems.id, Number(id))).run();

        // Return stock if it was a spare part
        if (item.item_type === 'Sparepart' && item.spare_part_id) {
            db.drizzle.update(spareParts).set({
                stock: sql`stock + ${item.quantity}`
            }).where(eq(spareParts.id, item.spare_part_id)).run();
            
            const updatedPart = db.drizzle.select({ stock: spareParts.stock }).from(spareParts).where(eq(spareParts.id, item.spare_part_id)).get();
            if (updatedPart) {
                const service = db.drizzle.select({ ticket_number: serviceOrders.ticket_number }).from(serviceOrders).where(eq(serviceOrders.id, item.service_order_id)).get();
                db.drizzle.insert(partLogs).values({
                    spare_part_id: item.spare_part_id,
                    change_amount: item.quantity,
                    new_stock: updatedPart.stock,
                    reason: 'Pembatalan Item Servis',
                    reference_id: service ? service.ticket_number : ''
                }).run();
            }
        }

        recalculateServiceTotal(item.service_order_id);
        return true;
    })();
}

function recalculateServiceTotal(serviceOrderId: number | string) {
    const items = db.drizzle.select({ grand_total: sql`SUM(${serviceItems.total})` })
        .from(serviceItems).where(eq(serviceItems.service_order_id, Number(serviceOrderId))).get();
        
    const total = items?.grand_total || 0;

    db.drizzle.update(serviceOrders).set({ total_cost: total })
        .where(eq(serviceOrders.id, Number(serviceOrderId))).run();
    
    paymentRepository.updateServicePaymentStatus(serviceOrderId);
}

export { 
    getServiceItems,
    addServiceItem,
    deleteServiceItem
 };

