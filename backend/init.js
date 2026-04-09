const fs = require('fs');
const path = require('path');
const { query } = require('./db');

async function initDB() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await query(sql);
        console.log('Database tables created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating database tables:', err);
        process.exit(1);
    }
}

initDB();
