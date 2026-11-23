const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: 'silverstardb',
});

async function run() {
  await pool.query("UPDATE user_accounts SET password_hash = '1234' WHERE id = 'USR523453'");
  const res = await pool.query("SELECT id, name, email, password_hash, role FROM user_accounts WHERE id = 'USR523453'");
  console.log('TEST_ADMIN UPDATED:', res.rows[0]);
  await pool.end();
}

run().catch(console.error);
