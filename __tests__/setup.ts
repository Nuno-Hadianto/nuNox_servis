const db = require('../database/db').default;
const runMigrations = require('../database/migrate').default;

if (process.env.NODE_ENV === 'test') {
    runMigrations();
}
