// @ts-nocheck
import { Settings } from '../shared/types';
import db from '../database/db';
import {  settings  } from '../database/drizzleSchema';
import {  sql  } from 'drizzle-orm';

function getSettings(): Record<string, string | null> {
    const rows = db.drizzle.select({ key: settings.key, value: settings.value }).from(settings).all();
    const result: Record<string, string | null> = {};
    rows.forEach((row: { key: string; value: string | null }) => {
        result[row.key] = row.value;
    });
    return result;
}

function updateSettings(data: Record<string, string | number | boolean>) {
    // We can still use better-sqlite3 transactions if needed, or simply run multiple queries
    const transaction = db.transaction((settingsData: Record<string, string | number | boolean>) => {
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

export { 
    getSettings,
    updateSettings
 };

