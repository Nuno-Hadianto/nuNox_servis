import { RecycleBinItem } from '../shared/types';
import db from '../database/db';
import { customers, devices, serviceOrders, spareParts } from '../database/drizzleSchema';
import { eq, isNotNull, desc, InferSelectModel } from 'drizzle-orm';

type CustomerModel = InferSelectModel<typeof customers>;
type DeviceModel = InferSelectModel<typeof devices>;
type ServiceOrderModel = InferSelectModel<typeof serviceOrders>;
type SparePartModel = InferSelectModel<typeof spareParts>;

function getDeletedItems(): RecycleBinItem[] {
    const items: RecycleBinItem[] = [];

    // Customers
    const deletedCustomers = db.drizzle.select()
        .from(customers)
        .where(isNotNull(customers.deleted_at))
        .orderBy(desc(customers.deleted_at))
        .all();
    
    deletedCustomers.forEach((c: CustomerModel) => {
        items.push({
            id: c.id,
            type: 'customer',
            name: c.name,
            deleted_at: c.deleted_at as string
        });
    });

    // Devices
    const deletedDevices = db.drizzle.select()
        .from(devices)
        .where(isNotNull(devices.deleted_at))
        .orderBy(desc(devices.deleted_at))
        .all();
    
    deletedDevices.forEach((d: DeviceModel) => {
        items.push({
            id: d.id,
            type: 'device',
            name: `${d.brand} ${d.model}`,
            deleted_at: d.deleted_at as string
        });
    });

    // Services
    const deletedServices = db.drizzle.select()
        .from(serviceOrders)
        .where(isNotNull(serviceOrders.deleted_at))
        .orderBy(desc(serviceOrders.deleted_at))
        .all();
    
    deletedServices.forEach((s: ServiceOrderModel) => {
        items.push({
            id: s.id,
            type: 'service',
            name: s.ticket_number,
            deleted_at: s.deleted_at as string
        });
    });

    // Parts
    const deletedParts = db.drizzle.select()
        .from(spareParts)
        .where(isNotNull(spareParts.deleted_at))
        .orderBy(desc(spareParts.deleted_at))
        .all();
    
    deletedParts.forEach((p: SparePartModel) => {
        items.push({
            id: p.id,
            type: 'part',
            name: p.name,
            deleted_at: p.deleted_at as string
        });
    });

    // Sort all items by deleted_at descending
    return items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
}

function restoreItem(id: number, type: 'customer' | 'device' | 'service' | 'part'): boolean {
    switch (type) {
        case 'customer':
            db.drizzle.update(customers).set({ deleted_at: null }).where(eq(customers.id, id)).run();
            break;
        case 'device':
            db.drizzle.update(devices).set({ deleted_at: null }).where(eq(devices.id, id)).run();
            break;
        case 'service':
            db.drizzle.update(serviceOrders).set({ deleted_at: null }).where(eq(serviceOrders.id, id)).run();
            break;
        case 'part':
            db.drizzle.update(spareParts).set({ deleted_at: null }).where(eq(spareParts.id, id)).run();
            break;
    }
    return true;
}

function hardDeleteItem(id: number, type: 'customer' | 'device' | 'service' | 'part'): boolean {
    switch (type) {
        case 'customer':
            db.drizzle.delete(customers).where(eq(customers.id, id)).run();
            break;
        case 'device':
            db.drizzle.delete(devices).where(eq(devices.id, id)).run();
            break;
        case 'service':
            db.drizzle.delete(serviceOrders).where(eq(serviceOrders.id, id)).run();
            break;
        case 'part':
            db.drizzle.delete(spareParts).where(eq(spareParts.id, id)).run();
            break;
    }
    return true;
}

export {
    getDeletedItems,
    restoreItem,
    hardDeleteItem
};
