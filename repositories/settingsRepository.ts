import { Settings } from '../shared/types';
const db = require('../database/db');
const { settings } = require('../database/drizzleSchema');
const { sql } = require('drizzle-orm');

function getSettings() {
    const rows = db.drizzle.select({ key: settings.key, value: settings.value }).from(settings).all();
    const result: any = {};
    rows.forEach((row: any) => {
        result[row.key] = row.value;
    });
    return result;
}

function updateSettings(data: any) {
    // We can still use better-sqlite3 transactions if needed, or simply run multiple queries
    const transaction = db.transaction((settingsData: any) => {
        for (const [key, value] of Object.entries(settingsData)) {
            db.drizzle.insert(settings)
                .values({ key, value: String(value) })
                .onConflictDoUpdate({
                    target: settings.key,
                    set: { value: String(value), updated_at: sql`CURRENT_TIMESTAMP` }
                }).run();
        }
    });
    transaction(data);
    return true;
}

module.exports = {
    getSettings,
    updateSettings
};
