"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParts = getParts;
exports.getPartById = getPartById;
exports.addPart = addPart;
exports.updatePart = updatePart;
exports.updatePartStock = updatePartStock;
exports.checkPartHasServiceItems = checkPartHasServiceItems;
exports.deletePart = deletePart;
exports.importParts = importParts;
exports.getLowStockParts = getLowStockParts;
exports.getPartLogs = getPartLogs;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getParts(searchQuery = '') {
    if (searchQuery) {
        const queryStr = `%${searchQuery}%`;
        return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.name, queryStr), (0, drizzle_orm_1.like)(drizzleSchema_1.spareParts.part_code, queryStr)))
            .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.name)).all();
    }
    return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.name)).all();
}
function getPartById(id) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).get();
}
function getLowStockParts(threshold) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.spareParts)
        .where((0, drizzle_orm_1.lte)(drizzleSchema_1.spareParts.stock, threshold))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.spareParts.stock)).all();
}
function addPart(data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
        const result = db_1.default.drizzle.insert(drizzleSchema_1.spareParts).values({
            part_code, name, category, stock, buy_price, sell_price, unit, notes
        }).run();
        const partId = result.lastInsertRowid;
        if (stock > 0) {
            db_1.default.drizzle.insert(drizzleSchema_1.partLogs).values({
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
function updatePart(id, data) {
    return db_1.default.transaction(() => {
        const { part_code, name, category, stock, buy_price, sell_price, unit, notes } = data;
        const oldPart = db_1.default.drizzle.select({ stock: drizzleSchema_1.spareParts.stock }).from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).get();
        db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
            part_code, name, category, stock, buy_price, sell_price, unit, notes, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
        }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
        if (oldPart && oldPart.stock !== stock) {
            db_1.default.drizzle.insert(drizzleSchema_1.partLogs).values({
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
function updatePartStock(id, change, reason = 'Penyesuaian Stok', ref_id = '') {
    const tx = db_1.default.transaction(() => {
        // Ambil stok terbaru dulu (jika menggunakan Drizzle bisa langsung update, tapi kita perlu new_stock untuk log)
        db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
            stock: (0, drizzle_orm_1.sql) `stock + ${change}`,
            updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
        }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).run();
        const updatedPart = db_1.default.drizzle.select({ stock: drizzleSchema_1.spareParts.stock }).from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, Number(id))).get();
        db_1.default.drizzle.insert(drizzleSchema_1.partLogs).values({
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
function getPartLogs(partId) {
    return db_1.default.drizzle.select().from(drizzleSchema_1.partLogs)
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.partLogs.spare_part_id, Number(partId)))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.partLogs.created_at))
        .all();
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
function importParts(dataArray) {
    const tx = db_1.default.transaction((arr) => {
        let imported = 0;
        let updated = 0;
        for (const row of arr) {
            const part_code = row['Kode'] || row['part_code'];
            const name = row['Nama'] || row['name'] || row['Nama Sparepart'];
            if (!name)
                continue;
            const category = row['Kategori'] || row['category'] || '';
            const stock = parseInt(String(row['Stok'] || row['stock'] || 0), 10);
            const buy_price = parseFloat(String(row['Harga Beli'] || row['buy_price'] || 0));
            const sell_price = parseFloat(String(row['Harga Jual'] || row['sell_price'] || 0));
            const unit = row['Satuan'] || row['unit'] || 'pcs';
            const notes = row['Keterangan'] || row['notes'] || '';
            if (part_code) {
                const existing = db_1.default.drizzle.select({ id: drizzleSchema_1.spareParts.id }).from(drizzleSchema_1.spareParts)
                    .where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.part_code, String(part_code))).get();
                if (existing) {
                    db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
                        name, category, stock: (0, drizzle_orm_1.sql) `stock + ${stock || 0}`, buy_price: buy_price || 0,
                        sell_price: sell_price || 0, unit, notes, updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`
                    }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, existing.id)).run();
                    updated++;
                    continue;
                }
            }
            db_1.default.drizzle.insert(drizzleSchema_1.spareParts).values({
                part_code: part_code || null, name, category, stock: stock || 0,
                buy_price: buy_price || 0, sell_price: sell_price || 0, unit, notes
            }).run();
            imported++;
        }
        return { imported, updated };
    });
    return tx(dataArray);
}
