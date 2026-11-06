import { query } from './index.js';

export async function runMobileMigrations() {
  console.log('[Migration] Applying database changes for Mobile App personas...');

  // 1. Add password_hash to employees
  await query(`
    ALTER TABLE employees 
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT 'Silverstar@123';
  `);
  await query(`
    UPDATE employees 
    SET password_hash = 'Silverstar@123' 
    WHERE password_hash IS NULL OR password_hash = '';
  `);
  console.log(' - Employees table password_hash set to default "Silverstar@123".');

  // 2. Add password_hash to clients (default to contact phone number)
  await query(`
    ALTER TABLE clients 
    ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
  `);
  await query(`
    UPDATE clients 
    SET password_hash = COALESCE(NULLIF(phone, ''), '9876543210')
    WHERE password_hash IS NULL OR password_hash = '';
  `);
  console.log(' - Clients table password_hash set to default contact phone numbers.');

  // 3. Add mobile punch attributes to attendance table
  await query(`
    ALTER TABLE attendance 
    ADD COLUMN IF NOT EXISTS punch_type VARCHAR(20) DEFAULT 'IN',
    ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS geofence_status VARCHAR(50) DEFAULT 'INSIDE',
    ADD COLUMN IF NOT EXISTS selfie_url TEXT,
    ADD COLUMN IF NOT EXISTS device_info TEXT;
  `);
  console.log(' - Attendance table enhanced with geofence & mobile punch columns.');

  // 4. Update user_accounts passwords for operations & staff
  await query(`
    UPDATE user_accounts 
    SET password_hash = 'Silverstar@123'
    WHERE role IN ('Operations Manager', 'Supervisor', 'Employee') 
      AND password_hash != 'Silverstar@123';
  `);
  console.log(' - Operations user_accounts updated with Silverstar@123.');

  // 5. Ensure core employees are deployed to active sites for testing
  // Get active sites
  const sites = await query('SELECT id, client_id FROM sites LIMIT 3');
  const emps = await query("SELECT id, employee_code, name FROM employees WHERE status = 'Active'");

  if (sites.rows.length > 0 && emps.rows.length > 0) {
    const s1 = sites.rows[0];
    for (let i = 0; i < emps.rows.length; i++) {
      const emp = emps.rows[i];
      const depSite = sites.rows[i % sites.rows.length];
      
      // Update employee deployed_site_id
      await query(
        `UPDATE employees SET deployed_site_id = $1, deployed_client_id = $2 WHERE id = $3`,
        [depSite.id, depSite.client_id, emp.id]
      );

      // Upsert active deployment
      await query(
        `INSERT INTO deployments (id, site_id, client_id, employee_id, shift_id, start_date, status, deployed_by)
         VALUES ($1, $2, $3, $4, 'SHF001', CURRENT_DATE, 'Active', 'Operations Manager')
         ON CONFLICT (id) DO NOTHING`,
        [`DEP_AUTO_${emp.employee_code.replace(/[^A-Za-z0-9]/g, '_')}`, depSite.id, depSite.client_id, emp.id]
      );
    }
    console.log(` - Deployed ${emps.rows.length} employees across active sites for live testing.`);
  }

  console.log('[Migration] Mobile schema updates completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('mobile_migrations.js')) {
  runMobileMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
