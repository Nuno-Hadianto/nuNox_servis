import { Customer } from '../shared/types';
import db from '../database/db';
import {  customers, serviceOrders  } from '../database/drizzleSchema';
import {  eq, like, or, and, asc, desc, sql, isNull  } from 'drizzle-orm';

function getCustomers(searchQuery: string = '', page: number = 1, limit: number = 50, sortBy: string = 'name_asc') {
    const offset = (page - 1) * limit;
    let data, total;
    
    let orderCondition;
    switch (sortBy) {
        case 'name_desc': orderCondition = desc(customers.name); break;
        case 'id_desc': orderCondition = desc(customers.id); break;
        case 'id_asc': orderCondition = asc(customers.id); break;
        case 'name_asc':
        default: orderCondition = asc(customers.name); break;
    }
    
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const filter = and(
            or(like(customers.name, queryStr), like(customers.phone, queryStr)),
            isNull(customers.deleted_at)
        );
        
        data = db.drizzle.select().from(customers)
            .where(filter)
            .orderBy(orderCondition)
            .limit(limit)
            .offset(offset)
            .all();
            
        total = db.drizzle.select({ count: sql`count(*)` }).from(customers)
            .where(filter).get().count;
    } else {
        data = db.drizzle.select().from(customers)
            .where(isNull(customers.deleted_at))
            .orderBy(orderCondition)
            .limit(limit)
            .offset(offset)
            .all();
            
        total = db.drizzle.select({ count: sql`count(*)` }).from(customers)
            .where(isNull(customers.deleted_at)).get().count;
    }
    return { data, total, page, limit };
}

function getCustomerById(id: number | string) {
    return db.drizzle.select().from(customers).where(and(eq(customers.id, Number(id)), isNull(customers.deleted_at))).get();
}

function addCustomer(data: Customer) {
    const { name, phone, address, notes } = data;
    const result = db.drizzle.insert(customers).values({ name, phone, address, notes }).run();
    return result.lastInsertRowid;
}

function updateCustomer(id: number | string, data: Customer) {
    const { name, phone, address, notes } = data;
    db.drizzle.update(customers)
        .set({ name, phone, address, notes, updated_at: sql`CURRENT_TIMESTAMP` })
        .where(eq(customers.id, Number(id))).run();
    return true;
}

function checkCustomerHasServiceOrders(id: number | string) {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(serviceOrders)
        .where(eq(serviceOrders.customer_id, Number(id))).get();
    return result.count > 0;
}

function deleteCustomer(id: number | string) {
    db.drizzle.update(customers)
        .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
        .where(eq(customers.id, Number(id))).run();
    return true;
}

export { 
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    checkCustomerHasServiceOrders,
    deleteCustomer
 };

