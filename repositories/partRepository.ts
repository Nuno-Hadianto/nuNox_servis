// @ts-nocheck
import { Part } from '../shared/types';
import db from '../database/db';
import {  spareParts, serviceItems  } from '../database/drizzleSchema';
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

function addPart(data: Part) {
    const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
    const result = db.drizzle.insert(spareParts).values({
        part_code, name, category, stock, buy_price, sell_price, unit, notes
    }).run();
    return result.lastInsertRowid;
}

function updatePart(id: number | string, data: Part) {
    const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
    db.drizzle.update(spareParts).set({
        part_code, name, category, stock, buy_price, sell_price, unit, notes, updated_at: sql`CURRENT_TIMESTAMP`
    }).where(eq(spareParts.id, Number(id))).run();
    return true;
}

function updatePartStock(id: number | string, change: number) {
    db.drizzle.update(spareParts).set({
        stock: sql`stock + ${change}`,
        updated_at: sql`CURRENT_TIMESTAMP`
    }).where(eq(spareParts.id, Number(id))).run();
    return true;
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

function importParts(dataArray: Record<string, string | number>[]) {
    const tx = db.transaction((arr: Record<string, string | number>[]) => {
        let imported = 0;
        let updated = 0;
        
        for (const row of arr) {
            const part_code = row['Kode'] || row['part_code'];
            const name = row['Nama'] || row['name'] || row['Nama Sparepart'];
            if (!name) continue; 
            
            const category = row['Kategori'] || row['category'] || '';
            const stock = parseInt(String(row['Stok'] || row['stock'] || 0), 10);
            const buy_price = parseFloat(String(row['Harga Beli'] || row['buy_price'] || 0));
            const sell_price = parseFloat(String(row['Harga Jual'] || row['sell_price'] || 0));
            const unit = row['Satuan'] || row['unit'] || 'pcs';
            const notes = row['Keterangan'] || row['notes'] || '';

            if (part_code) {
                const existing = db.drizzle.select({ id: spareParts.id }).from(spareParts)
                    .where(eq(spareParts.part_code, part_code)).get();
                if (existing) {
                    db.drizzle.update(spareParts).set({
                        name, category, stock: sql`stock + ${stock || 0}`, buy_price: buy_price || 0, 
                        sell_price: sell_price || 0, unit, notes, updated_at: sql`CURRENT_TIMESTAMP`
                    }).where(eq(spareParts.id, existing.id)).run();
                    updated++;
                    continue;
                }
            }
            
            db.drizzle.insert(spareParts).values({
                part_code: part_code || null, name, category, stock: stock || 0, 
                buy_price: buy_price || 0, sell_price: sell_price || 0, unit, notes
            }).run();
            imported++;
        }
        
        return { imported, updated };
    });
    
    return tx(dataArray);
}

export { 
    getParts,
    getPartById,
    addPart,
    updatePart,
    updatePartStock,
    checkPartHasServiceItems,
    deletePart,
    importParts,
    getLowStockParts
 };

