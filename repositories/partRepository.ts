
import { Part } from '../shared/types';
import db from '../database/db';
import {  spareParts, serviceItems  } from '../database/drizzleSchema';
import {  eq, like, or, asc, sql  } from 'drizzle-orm';

function getParts(searchQuery = '', page = 1, limit = 15) {
    const offset = (page - 1) * limit;
    let query = db.drizzle.select().from(spareParts).$dynamic();
    let countQuery = db.drizzle.select({ count: sql`count(*)` }).from(spareParts).$dynamic();

    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const searchFilter = or(like(spareParts.name, queryStr), like(spareParts.part_code, queryStr));
        query = query.where(searchFilter);
        countQuery = countQuery.where(searchFilter);
    }

    const data = query.orderBy(asc(spareParts.name)).limit(limit).offset(offset).all();
    const totalResult = countQuery.get();
    const total = totalResult ? Number((totalResult as { count: number }).count) : 0;
    
    return { data, total };
}

function getPartById(id: number | string) {
    return db.drizzle.select().from(spareParts).where(eq(spareParts.id, Number(id))).get();
}

function addPart(data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, buy_price, sell_price, unit, notes } = data as Part;
        const result = db.drizzle.insert(spareParts).values({
            part_code, name, category, buy_price, sell_price, unit, notes
        }).run();
        const partId = result.lastInsertRowid;
        
        return partId;
    })();
}

function updatePart(id: number | string, data: Omit<Part, 'id'>) {
    return db.transaction(() => {
        const { part_code, name, category, buy_price, sell_price, unit, notes } = data as Part;
        
        db.drizzle.update(spareParts).set({
            part_code, name, category, buy_price, sell_price, unit, notes, updated_at: sql`CURRENT_TIMESTAMP`
        }).where(eq(spareParts.id, Number(id))).run();
        
        return true;
    })();
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
    checkPartHasServiceItems,
    deletePart
 };

