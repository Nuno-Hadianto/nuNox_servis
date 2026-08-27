"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceItems = getServiceItems;
exports.addServiceItem = addServiceItem;
exports.deleteServiceItem = deleteServiceItem;
const db_1 = __importDefault(require("../database/db"));
const paymentRepository = __importStar(require("./paymentRepository"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getServiceItems(serviceOrderId) {
    return db_1.default.drizzle.select({
        id: drizzleSchema_1.serviceItems.id,
        service_order_id: drizzleSchema_1.serviceItems.service_order_id,
        item_type: drizzleSchema_1.serviceItems.item_type,
        spare_part_id: drizzleSchema_1.serviceItems.spare_part_id,
        description: drizzleSchema_1.serviceItems.description,
        quantity: drizzleSchema_1.serviceItems.quantity,
        price: drizzleSchema_1.serviceItems.price,
        cost_price: drizzleSchema_1.serviceItems.cost_price,
        total: drizzleSchema_1.serviceItems.total,
        part_name: drizzleSchema_1.spareParts.name
    }).from(drizzleSchema_1.serviceItems)
        .leftJoin(drizzleSchema_1.spareParts, (0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.spare_part_id, drizzleSchema_1.spareParts.id))
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.service_order_id, Number(serviceOrderId)))
        .orderBy((0, drizzle_orm_1.asc)(drizzleSchema_1.serviceItems.id))
        .all();
}
function addServiceItem(data) {
    const { service_order_id, item_type, spare_part_id, description, quantity, price } = data;
    // Diskon uses negative total
    let total = quantity * price;
    if (item_type === 'Diskon') {
        total = -Math.abs(total);
    }
    let cost_price = 0;
    if (item_type === 'Sparepart' && spare_part_id) {
        const part = db_1.default.drizzle.select({ stock: drizzleSchema_1.spareParts.stock, buy_price: drizzleSchema_1.spareParts.buy_price })
            .from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, spare_part_id)).get();
        if (part) {
            if (part.stock < quantity) {
                throw new Error(`Stok sparepart tidak mencukupi (Tersisa: ${part.stock})`);
            }
            cost_price = part.buy_price * quantity;
        }
    }
    return db_1.default.transaction(() => {
        const info = db_1.default.drizzle.insert(drizzleSchema_1.serviceItems).values({
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
            db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
                stock: (0, drizzle_orm_1.sql) `stock - ${quantity}`
            }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, spare_part_id)).run();
            const updatedPart = db_1.default.drizzle.select({ stock: drizzleSchema_1.spareParts.stock }).from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, spare_part_id)).get();
            if (updatedPart) {
                const service = db_1.default.drizzle.select({ ticket_number: drizzleSchema_1.serviceOrders.ticket_number }).from(drizzleSchema_1.serviceOrders).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, service_order_id)).get();
                db_1.default.drizzle.insert(drizzleSchema_1.partLogs).values({
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
function deleteServiceItem(id) {
    const item = db_1.default.drizzle.select().from(drizzleSchema_1.serviceItems).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.id, Number(id))).get();
    if (!item)
        return false;
    return db_1.default.transaction(() => {
        db_1.default.drizzle.delete(drizzleSchema_1.serviceItems).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.id, Number(id))).run();
        // Return stock if it was a spare part
        if (item.item_type === 'Sparepart' && item.spare_part_id) {
            db_1.default.drizzle.update(drizzleSchema_1.spareParts).set({
                stock: (0, drizzle_orm_1.sql) `stock + ${item.quantity}`
            }).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, item.spare_part_id)).run();
            const updatedPart = db_1.default.drizzle.select({ stock: drizzleSchema_1.spareParts.stock }).from(drizzleSchema_1.spareParts).where((0, drizzle_orm_1.eq)(drizzleSchema_1.spareParts.id, item.spare_part_id)).get();
            if (updatedPart) {
                const service = db_1.default.drizzle.select({ ticket_number: drizzleSchema_1.serviceOrders.ticket_number }).from(drizzleSchema_1.serviceOrders).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, item.service_order_id)).get();
                db_1.default.drizzle.insert(drizzleSchema_1.partLogs).values({
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
function recalculateServiceTotal(serviceOrderId) {
    const items = db_1.default.drizzle.select({ grand_total: (0, drizzle_orm_1.sql) `SUM(${drizzleSchema_1.serviceItems.total})` })
        .from(drizzleSchema_1.serviceItems).where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceItems.service_order_id, Number(serviceOrderId))).get();
    const total = items?.grand_total || 0;
    db_1.default.drizzle.update(drizzleSchema_1.serviceOrders).set({ total_cost: total })
        .where((0, drizzle_orm_1.eq)(drizzleSchema_1.serviceOrders.id, Number(serviceOrderId))).run();
    paymentRepository.updateServicePaymentStatus(serviceOrderId);
}
