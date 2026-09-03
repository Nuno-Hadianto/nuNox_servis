
import { Part } from '../shared/types';
import db from '../database/db';
import {  spareParts, serviceItems, partLogs  } from '../database/drizzleSchema';
import {  eq, like, or, asc, lte, sql  } from 'drizzle-orm';

function getParts(searchQuery = '') {
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        return db.drizzle.select().from(spareParts)
            .where(or(like(spareParts.name, queryStr), like(spareParts.part_code, queryStr)))
            .orderBy(asc(spareParts.name)).all();
    }
    return db.drizzle.select().from(spareParts).orderBy(asc(spareParts.name)).all();
}

function getPartById(id: number | string) {
    return db.drizzle.select().from(spareParts).where(eq(spareParts.id, Number(id))).get();
}

function getLowStockParts(threshold: number) {
    return db.drizzle.select().from(spareParts)
        .where(lte(spareParts.stock, threshold))
        .orderBy(asc(spareParts.stock)).all();
}

function addPart(data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data as Part;
        const result = db.drizzle.insert(spareParts).values({
            part_code, name, category, stock, buy_price, sell_price, unit, notes
        }).run();
        const partId = result.lastInsertRowid;
        
        if (stock > 0) {
            db.drizzle.insert(partLogs).values({
                spare_part_id: Number(partId),
                change_amount: stock,
                new_stock: stock,
                reason: 'Stok Awal',
                reference_id: null
            }).run();
        }
        
        return partId;
    })();
}

function updatePart(id: number | string, data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data as Part;
        
        const oldPart = db.drizzle.select({ stock: spareParts.stock }).from(spareParts).where(eq(spareParts.id, Number(id))).get();
        
        db.drizzle.update(spareParts).set({
            part_code, name, category, stock, buy_price, sell_price, unit, notes, updated_at: sql`CURRENT_TIMESTAMP`
        }).where(eq(spareParts.id, Number(id))).run();
        
        if (oldPart && oldPart.stock !== stock) {
            db.drizzle.insert(partLogs).values({
                spare_part_id: Number(id),
                change_amount: stock - oldPart.stock,
                new_stock: stock,
                reason: 'Edit Manual',
                reference_id: null
            }).run();
        }
        
        return true;
    })();
}

function updatePartStock(id: number | string, change: number, reason: string = 'Penyesuaian Stok', ref_id: string = '') {
    const tx = db.transaction(() => {
        // Ambil stok terbaru dulu (jika menggunakan Drizzle bisa langsung update, tapi kita perlu new_stock untuk log)
        db.drizzle.update(spareParts).set({
            stock: sql`stock + ${change}`,
            updated_at: sql`CURRENT_TIMESTAMP`
        }).where(eq(spareParts.id, Number(id))).run();

        const updatedPart = db.drizzle.select({ stock: spareParts.stock }).from(spareParts).where(eq(spareParts.id, Number(id))).get();

        db.drizzle.insert(partLogs).values({
            spare_part_id: Number(id),
            change_amount: change,
            new_stock: updatedPart ? updatedPart.stock : 0,
            reason: reason,
            reference_id: ref_id || null
        }).run();
    });
    tx();
    return true;
}

function getPartLogs(partId: number | string) {
    return db.drizzle.select().from(partLogs)
        .where(eq(partLogs.spare_part_id, Number(partId)))
        .orderBy(asc(partLogs.created_at))
        .all();
}

function checkPartHasServiceItems(id: number | string) {
    const result = db.drizzle.select({ count: sql`count(*)` }).from(serviceItems)
        .where(eq(serviceItems.spare_part_id, Number(id))).get();
    return result.count > 0;
}

function deletePart(id: number | string) {
    db.drizzle.delete(spareParts).where(eq(spareParts.id, Number(id))).run();
    return true;
}

export { 
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    checkPartHasServiceItems,
    deletePart,
    getLowStockParts,
    getPartLogs
 };

