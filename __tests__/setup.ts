const db = require('../database/db');
const schema = require('../database/schema');

if (process.env.NODE_ENV === 'test') {
    db.exec(schema.createTables);
    db.exec(schema.insertDefaultSettings);
}
