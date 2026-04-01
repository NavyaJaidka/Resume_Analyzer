import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initializeDatabase = async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'init-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Initializing database...');
    await pool.query(sql);
    console.log('✅ Database initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initializeDatabase();
