"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParts = getParts;
exports.getPartById = getPartById;
exports.addPart = addPart;
exports.updatePart = updatePart;
exports.checkPartHasServiceItems = checkPartHasServiceItems;
exports.deletePart = deletePart;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getParts(searchQuery = '', page = 1, limit = 15) {
    const offset = (page - 1) * limit;
    let query = db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).$dynamic();
    let countQuery = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.spareParts).$dynamic();
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        const searchFilter = (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.name, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.part_code, queryStr));
        query = query.where(searchFilter);
        countQuery = countQuery.where(searchFilter);
    }
    const data = query.orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.name)).limit(limit).offset(offset).all();
    const totalResult = countQuery.get();
    const total = totalResult ? Number(totalResult.count) : 0;
    return { data, total };
}
function getPartById(id) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).get();
}
function addPart(data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, buy_price, sell_price, unit, notes } = data;
        const result = db_1.default.drizzle.insert(drizzleSchema_1.spareParts).values({
            part_code, name, category, buy_price, sell_price, unit, notes
        }).run();
        const partId = result.lastInsertRowid;
        return partId;
    })();
}
function updatePart(id, data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, buy_price, sell_price, unit, notes } = data;
        db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
            part_code, name, category, buy_price, sell_price, unit, notes, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
        }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
        return true;
    })();
}
function checkPartHasServiceItems(id) {
    const result = db_1.default.drizzle.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(drizzleSchema_1.serviceItems)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.spare_part_id, Number(id))).get();
    return result.count > 0;
}
function deletePart(id) {
    db_1.default.drizzle.delete(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
    return true;
}
