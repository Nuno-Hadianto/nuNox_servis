"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const db_1 = __importDefault(require("../database/db"));
const drizzleSchema_1 = require("../database/drizzleSchema");
const drizzle_orm_1 = require("drizzle-orm");
function getSettings() {
    const rows = db_1.default.drizzle.select({ key: drizzleSchema_1.settings.key, value: drizzleSchema_1.settings.value }).from(drizzleSchema_1.settings).all();
    const result = {};
    rows.forEach((row) => {
        result[row.key] = row.value;
    });
    return result;
}
function updateSettings(data) {
    // We can still use better-sqlite3 transactions if needed, or simply run multiple queries
    const transaction = db_1.default.transaction((settingsData) => {
        for (const [key, value] of Object.entries(settingsData)) {
            db_1.default.drizzle.insert(drizzleSchema_1.settings)
                .values({ key, value: String(value) })
                .onConflictDoUpdate({
                target: drizzleSchema_1.settings.key,
                set: { value: String(value), updated_at: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` }
            }).run();
        }
    });
    transaction(data);
    return true;
}
