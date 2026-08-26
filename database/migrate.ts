export {};
const db = require('./db');
const { app } = require('electron');
const path = require('path');
const log = require('electron-log');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

function seedDefaultSettings() {
  try {
    const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
    if (settingsCount.count === 0) {
      log.info('Seeding default settings...');
      const insertDefaultSettings = `
        INSERT OR IGNORE INTO settings (key, value) VALUES 
        ('business_name', 'NUNOX_SERVIS'),
        ('app_name', 'nuNox_servis'),
        ('business_type', 'Laptop & Computer Service'),
        ('owner_name', ''),
        ('phone', ''),
        ('whatsapp', ''),
        ('address', ''),
        ('email', ''),
        ('receipt_footer', 'Terima kasih telah menggunakan jasa NUNOX_SERVIS.'),
        ('wa_template_status', 'Halo Kak {nama}, perangkat Anda dengan No Tiket *{tiket}* saat ini berstatus: *{status}*. Mohon konfirmasinya. Terima kasih.');
      `;
      db.exec(insertDefaultSettings);
    }
  } catch (err) {
    log.error('Error seeding default settings:', err);
  }
}

function runMigrations() {
  try {
    let migrationsFolder;
    if (app) {
      if (app.isPackaged) {
        migrationsFolder = path.join(process.resourcesPath, 'app.asar', 'database', 'migrations');
      } else {
        migrationsFolder = path.join(__dirname, '..', '..', 'database', 'migrations');
      }
    } else {
       // fallback for test
       migrationsFolder = path.join(__dirname, '..', '..', 'database', 'migrations');
    }

    log.info(`Running migrations from ${migrationsFolder}...`);
    migrate(db.drizzle, { migrationsFolder });
    log.info('Database migration completed successfully.');
    
    seedDefaultSettings();
  } catch (error) {
    log.error('Database migration failed:', error);
    throw error;
  }
}

module.exports = runMigrations;
