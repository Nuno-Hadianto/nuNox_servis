import { Customer } from '../shared/types';
const db = require('../database/db');
const { customers, serviceOrders } = require('../database/drizzleSchema');
const { eq, like, or, asc, sql } = require('drizzle-orm');

function getCustomers(searchQuery: string = '', page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    let data, total;
    
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const filter = or(like(customers.name, queryStr), like(customers.phone, queryStr));
        
        data = db.drizzle.select().from(customers)
            .where(filter)
            .orderBy(asc(customers.name))
            .limit(limit)
            .offset(offset)
            .all();
            
        total = db.drizzle.select({ count: sql`count(*)` }).from(customers)
            .where(filter).get().count;
    } else {
        data = db.drizzle.select().from(customers)
            .orderBy(asc(customers.name))
            .limit(limit)
            .offset(offset)
            .all();
            
        total = db.drizzle.select({ count: sql`count(*)` }).from(customers).get().count;
    }
    return { data, total, page, limit };
}

function getCustomerById(id: number | string) {
    return db.drizzle.select().from(customers).where(eq(customers.id, Number(id))).get();
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
    db.drizzle.delete(customers).where(eq(customers.id, Number(id))).run();
    return true;
}

module.exports = {
    getCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    checkCustomerHasServiceOrders,
    deleteCustomer
};
