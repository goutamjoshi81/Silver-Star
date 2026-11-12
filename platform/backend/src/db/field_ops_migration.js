import { query } from './index.js';

export async function runFieldOpsMigrations() {
  console.log('[Migration] Applying database changes for Field Officer & Night Patrol Operations...');

  // 1. Enhance sites table for Temporary & Emergency Geofences
  await query(`
    ALTER TABLE sites 
    ADD COLUMN IF NOT EXISTS site_type VARCHAR(50) DEFAULT 'Permanent',
    ADD COLUMN IF NOT EXISTS valid_from DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS valid_until DATE,
    ADD COLUMN IF NOT EXISTS emergency_notes TEXT,
    ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;
  `);
  console.log(' - Sites table enhanced with Temporary & Emergency Geofence columns.');

  // 2. Enhance attendance table for Field Officer roll-call & muster audits
  await query(`
    ALTER TABLE attendance 
    ADD COLUMN IF NOT EXISTS marked_by_officer_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS audit_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS muster_photo_url TEXT;
  `);
  console.log(' - Attendance table enhanced with Field Officer audit tracking.');

  // 3. Create patrol_logs table for Night Patrolling with Photo Evidence
  await query(`
    CREATE TABLE IF NOT EXISTS patrol_logs (
      id VARCHAR(50) PRIMARY KEY,
      officer_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      site_id VARCHAR(50) REFERENCES sites(id) ON DELETE SET NULL,
      checkpoint_name VARCHAR(255) NOT NULL,
      patrol_shift VARCHAR(100) DEFAULT 'Night Patrol',
      status VARCHAR(100) DEFAULT 'All Normal & Secure',
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      is_geofence_verified BOOLEAN DEFAULT FALSE,
      distance_meters INTEGER,
      photo_url TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log(' - Patrol logs table created for Night Patrolling inspection logs.');

  // 4. Create site_muster_audits table for Field Roll-Call Verification
  await query(`
    CREATE TABLE IF NOT EXISTS site_muster_audits (
      id VARCHAR(50) PRIMARY KEY,
      officer_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      site_id VARCHAR(50) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      shift VARCHAR(50) DEFAULT 'Day Shift',
      total_sanctioned INTEGER NOT NULL DEFAULT 0,
      total_present INTEGER NOT NULL DEFAULT 0,
      total_absent INTEGER NOT NULL DEFAULT 0,
      muster_photo_url TEXT NOT NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      is_geofence_verified BOOLEAN DEFAULT FALSE,
      distance_meters INTEGER,
      notes TEXT,
      staff_records JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log(' - Site muster audits table created for frontline roll-call audits.');

  // 5. Seed initial temporary emergency geofence site if not present
  const tempSiteCheck = await query("SELECT id FROM sites WHERE id = 'SITE_TEMP_001'");
  if (tempSiteCheck.rows.length === 0) {
    const client = await query("SELECT id FROM clients LIMIT 1");
    const clientId = client.rows.length > 0 ? client.rows[0].id : 'CLI001';
    await query(`
      INSERT INTO sites (id, name, client_id, address, latitude, longitude, geofence_radius, sanctioned_strength, status, site_type, is_emergency, emergency_notes, valid_from, valid_until)
      VALUES (
        'SITE_TEMP_001',
        'Emergency Reserve - Manyata Tech Park Gate 5',
        $1,
        'Gate 5, Manyata Embassy Business Park, Outer Ring Road, Bengaluru',
        13.0494,
        77.6200,
        150,
        6,
        'Active',
        'Emergency',
        TRUE,
        'Temporary deployment for perimeter security reinforcement during facility maintenance.',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days'
      )
      ON CONFLICT (id) DO NOTHING;
    `, [clientId]);
    console.log(' - Seeded initial Emergency Geofence site SITE_TEMP_001.');
  }

  // 6. Seed initial patrol logs if empty
  const patrolCheck = await query("SELECT COUNT(*) FROM patrol_logs");
  if (parseInt(patrolCheck.rows[0].count, 10) === 0) {
    const officer = await query("SELECT id FROM employees LIMIT 1");
    const site = await query("SELECT id FROM sites LIMIT 1");
    if (officer.rows.length > 0 && site.rows.length > 0) {
      const offId = officer.rows[0].id;
      const sId = site.rows[0].id;
      await query(`
        INSERT INTO patrol_logs (id, officer_id, site_id, checkpoint_name, patrol_shift, status, latitude, longitude, is_geofence_verified, distance_meters, photo_url, notes)
        VALUES 
        ('PATROL_001', $1, $2, 'North Perimeter Gate & Guard Shack', 'Night Patrol (Round 1: 23:00)', 'All Normal & Secure', 12.8453, 77.6602, TRUE, 12, '/silverstar-icon-512.png', 'Both security guards alert and in full uniform. Boundary floodlights operational.'),
        ('PATROL_002', $1, $2, 'Rear Loading Dock & Transformer Yard', 'Night Patrol (Round 2: 02:30)', 'Gate Locked & Verified', 12.8455, 77.6605, TRUE, 22, '/silverstar-icon-512.png', 'Padlocks verified. Generator fuel level checked. Fire extinguisher seals intact.');
      `, [offId, sId]);
      console.log(' - Seeded demo night patrol inspection logs.');
    }
  }

  // 7. Create patrol_assignments table for Night Patrol assignments by Operations
  await query(`
    CREATE TABLE IF NOT EXISTS patrol_assignments (
      id VARCHAR(50) PRIMARY KEY,
      officer_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
      site_id VARCHAR(50) REFERENCES sites(id) ON DELETE SET NULL,
      location_type VARCHAR(20) DEFAULT 'client' CHECK (location_type IN ('client', 'custom')),
      location_name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      geofence_radius INTEGER DEFAULT 150,
      checkpoint_name VARCHAR(255) NOT NULL,
      shift VARCHAR(100) DEFAULT 'Night Shift (22:00 - 06:00)',
      assigned_date DATE DEFAULT CURRENT_DATE,
      instructions TEXT,
      status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log(' - Patrol assignments table created for Night Patrolling dispatch.');

  // 8. Create client_inspection_assignments table for Field Officer day roll-call & client visits
  await query(`
    CREATE TABLE IF NOT EXISTS client_inspection_assignments (
      id VARCHAR(50) PRIMARY KEY,
      officer_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      client_id VARCHAR(50) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      site_id VARCHAR(50) REFERENCES sites(id) ON DELETE CASCADE,
      assigned_date DATE DEFAULT CURRENT_DATE,
      shift VARCHAR(100) DEFAULT 'Day Shift (06:00 - 14:00)',
      status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_officer_site_date UNIQUE (officer_id, site_id, assigned_date)
    );
  `);
  console.log(' - Client inspection assignments table created for Field Officer roll-call visits.');

  // 9. Seed initial assignments for default field officer if empty
  const assignCheck = await query("SELECT COUNT(*) FROM patrol_assignments");
  if (parseInt(assignCheck.rows[0].count, 10) === 0) {
    const officer = await query("SELECT id FROM employees WHERE designation_id LIKE '%FLD%' OR employee_code = 'SS-10001' OR name ILIKE '%Ramesh%' LIMIT 1");
    const anyOfficer = officer.rows.length > 0 ? officer.rows[0].id : (await query("SELECT id FROM employees LIMIT 1")).rows[0]?.id;
    const client = await query("SELECT id, name FROM clients LIMIT 1");
    const site = await query("SELECT id, name, address, latitude, longitude, geofence_radius FROM sites LIMIT 1");

    if (anyOfficer && site.rows.length > 0) {
      const s = site.rows[0];
      const cId = client.rows[0]?.id || 'CLI001';

      // 1. Assign client to officer
      await query(`
        INSERT INTO client_inspection_assignments (id, officer_id, client_id, site_id, assigned_date, shift, status, notes)
        VALUES ('CIA_001', $1, $2, $3, CURRENT_DATE, 'Morning Shift (06:00 - 14:00)', 'Pending', 'Perform physical roll-call of deployed guards and housekeepers. Verify turnout & photo.')
        ON CONFLICT (officer_id, site_id, assigned_date) DO NOTHING;
      `, [anyOfficer, cId, s.id]);

      // Set supervisor on site
      await query(`UPDATE sites SET supervisor_id = $1 WHERE id = $2`, [anyOfficer, s.id]);

      // 2. Assign night patrol to officer
      await query(`
        INSERT INTO patrol_assignments (
          id, officer_id, client_id, site_id, location_type, location_name, address, latitude, longitude, geofence_radius, checkpoint_name, shift, assigned_date, instructions, status
        )
        VALUES (
          'PASG_001', $1, $2, $3, 'client', $4, $5, $6, $7, $8,
          'Main Security Gate & Perimeter Fence', 'Night Shift 1 (20:00 - 00:00)', CURRENT_DATE,
          'Conduct comprehensive perimeter sweep, check gate logbook, inspect floodlights and snap photo.', 'Pending'
        )
        ON CONFLICT (id) DO NOTHING;
      `, [anyOfficer, cId, s.id, s.name, s.address, s.latitude, s.longitude, s.geofence_radius || 150]);

      console.log(' - Seeded initial sample client and night patrol assignments.');
    }
  }

  console.log('[Migration] Field Ops database changes completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('field_ops_migration.js')) {
  runFieldOpsMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

