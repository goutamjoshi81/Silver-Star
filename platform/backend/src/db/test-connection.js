import { pool } from './index.js';

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log(`Host: ${process.env.DB_HOST || '10.93.223.85'}`);
  console.log(`Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`Database: ${process.env.DB_NAME || 'silverstardb'}`);
  console.log(`User: ${process.env.DB_USER || 'postgres'}`);

  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version();');
    console.log(' Connection Successful!');
    console.log('Database:', res.rows[0].db_name);
    console.log('Server Time:', res.rows[0].current_time);
    console.log('Version:', res.rows[0].version);
    process.exit(0);
  } catch (err) {
    console.error(' Connection Failed!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    process.exit(1);
  }
}

testConnection();
