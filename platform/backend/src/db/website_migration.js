import { pool } from './index.js';

export async function runWebsiteMigrations() {
  const client = await pool.connect();
  try {
    console.log('[Migration] Applying database changes for Public Website, Services & Team Management...');

    // 1. Services Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Facility Management',
        short_description TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        icon_name VARCHAR(100) DEFAULT 'Briefcase',
        features JSONB DEFAULT '[]'::jsonb,
        display_order INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Team Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        department VARCHAR(100) DEFAULT 'Executive Management',
        bio TEXT,
        photo_url TEXT,
        email VARCHAR(255),
        phone VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Website Clientele Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS website_clientele (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Corporate & IT',
        logo_url TEXT NOT NULL,
        website_url TEXT,
        is_featured BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Contact Inquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        service_id VARCHAR(50),
        service_name VARCHAR(255),
        company_name VARCHAR(255),
        city VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Proposal Sent', 'Converted', 'Closed')),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // -------------------------------------------------------------
    // SEED SERVICES (The exact 8 core services from silverstarindia.net)
    // -------------------------------------------------------------
    const serviceCount = await client.query('SELECT COUNT(*) FROM services');
    if (parseInt(serviceCount.rows[0].count) === 0) {
      console.log(' - Seeding 8 core services from silverstarindia.net...');
      const seedServices = [
        {
          id: 'SRV001',
          title: 'Integrated Facilities Management',
          slug: 'integrated-facilities-management',
          category: 'Facility Management',
          short_description: 'One-stop solution for all facility management needs, including housekeeping, cleaning, landscaping, fleet management, and building maintenance.',
          description: 'Silver Star delivers comprehensive Integrated Facility Management (IFM) designed to streamline operations and elevate facility standards. From mechanized housekeeping, deep disinfection, facade cleaning to landscape maintenance, waste management, and fleet coordination, our trained workforce guarantees a pristine, compliant, and productive work environment.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/09/1.jpg',
          icon_name: 'Building2',
          features: [
            'Mechanized Housekeeping & Floor Care',
            'Commercial Deep Cleaning & Disinfection',
            'Horticulture & Landscape Maintenance',
            'Fleet & Logistics Coordination',
            'Waste Segregation & Green Disposal',
            'Facade Cleaning & Window Washing'
          ],
          display_order: 1
        },
        {
          id: 'SRV002',
          title: 'Manufacturing Support Services',
          slug: 'manufacturing-support-services',
          category: 'Industrial & Support',
          short_description: 'Production support services, manpower supply, on-demand labor services, and staff for e-commerce fulfillment.',
          description: 'Optimized workforce solutions for manufacturing plants, assembly lines, and industrial facilities. We provide trained operational crews, line operators, shop floor stewards, and on-demand labor supply fully compliant with statutory labor laws, ESI, PF, and factory safety protocols.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/09/2.jpg',
          icon_name: 'Factory',
          features: [
            'Assembly Line & Production Crew Supply',
            'Shop Floor Stewards & Material Handling',
            'On-Demand Scalable Shift Labor',
            'E-Commerce Sorting & Packing Workforce',
            '100% Statutory & Labor Law Compliance',
            'Industrial Safety & Turnout Training'
          ],
          display_order: 2
        },
        {
          id: 'SRV003',
          title: 'Business Support Services',
          slug: 'business-support-services',
          category: 'Corporate Support',
          short_description: 'Staffing & payroll management, IT desk support, concierge services, helpdesk, and legal statutory compliance.',
          description: 'Comprehensive corporate back-office and front-of-house workforce solutions. Silver Star handles end-to-end recruitment, payroll administration, compliance reporting, reception concierge, mailroom logistics, and corporate desk coordination.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/09/4.jpg',
          icon_name: 'Briefcase',
          features: [
            'Contract Staffing & Payroll Management',
            'Corporate Reception & Concierge Helpdesk',
            'Mailroom & Document Courier Coordination',
            'IT Desk & Meeting Room Stewards',
            'Full Regulatory & Statutory Audits',
            'Dedicated Account Manager'
          ],
          display_order: 3
        },
        {
          id: 'SRV004',
          title: 'Technical Services',
          slug: 'technical-services',
          category: 'Engineering & Maintenance',
          short_description: 'Mechanical and electrical services, annual maintenance contracts (AMC), HVAC, plumbing, and power backup management.',
          description: 'Round-the-clock electro-mechanical operations ensuring zero downtime for critical client infrastructure. Our licensed technicians manage HVAC chillers, diesel generator sets, HT/LT electrical substations, water treatment plants (STP/WTP), and plumbing networks.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr4.jpg',
          icon_name: 'Wrench',
          features: [
            'HT/LT Electrical Substation & Transformer Care',
            'HVAC, Chiller & Air Handling Unit Operations',
            'DG Set & UPS Power Backup Maintenance',
            'STP, WTP & RO Water Treatment Plants',
            'Comprehensive Annual Maintenance Contracts (AMC)',
            '24/7 Breakdown & Emergency Response Team'
          ],
          display_order: 4
        },
        {
          id: 'SRV005',
          title: 'Security Services',
          slug: 'security-services',
          category: 'Security & Guarding',
          short_description: 'PSARA-licensed static guarding, executive protection, Integrated Building Management Systems (IBMS), and CCTV surveillance.',
          description: 'Premier security solutions compliant with PSARA Act. We deploy verified, highly trained security guards, head guards, gunners, and bouncers. Equipped with GPS night patrol monitoring, digital incident logs, and perimeter geofencing.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr5.jpg',
          icon_name: 'ShieldCheck',
          features: [
            'PSARA Certified & Background Verified Guards',
            'Access Control & Visitor Management Software',
            'CCTV Surveillance & IBMS Monitoring',
            'GPS-Logged Night Patrolling & Perimeter Audits',
            'Fire Safety & Emergency Evacuation Marshals',
            'VIP Escort & Executive Protection'
          ],
          display_order: 5
        },
        {
          id: 'SRV006',
          title: 'Warehouse Management',
          slug: 'warehouse-management',
          category: 'Logistics & Warehousing',
          short_description: 'Manpower management, space optimization, inventory audit, forklift operation, and key account logistics coordination.',
          description: 'Specialized logistics staffing and warehouse support services for distribution centers, third-party logistics (3PL), and fulfillment hubs. We supply licensed forklift operators, inventory pickers, dispatch supervisors, and loading staff.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/sr6.jpg',
          icon_name: 'Boxes',
          features: [
            'Certified Forklift & Reach Truck Drivers',
            'Inbound & Outbound Inventory Audits',
            'Dock Staging & Loading Crew Management',
            'Palletization & Barcode Scanning Staff',
            'Peak Season Workforce Scalability',
            'Safety & Material Handling Standards'
          ],
          display_order: 6
        },
        {
          id: 'SRV007',
          title: 'Guest House Management',
          slug: 'guest-house-management',
          category: 'Hospitality',
          short_description: 'Turnkey guest house operations: front desk, housekeeping, chef & catering, room maintenance, and linen care.',
          description: 'Executive guest house and corporate transit facility operations delivering hotel-standard luxury for business travelers. We handle front-desk reservations, gourmet in-house chef catering, pristine linen service, and maintenance.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/09/7.jpg',
          icon_name: 'Coffee',
          features: [
            '24/7 Front Desk & Guest Check-In Handling',
            'Daily Hotel-Grade Linen & Room Sanitization',
            'Executive Chef, Kitchen & Catering Crew',
            'Preventive Property Maintenance & Landscaping',
            'Inventory & Consumables Accounting',
            'VIP Guest Hospitality Protocols'
          ],
          display_order: 7
        },
        {
          id: 'SRV008',
          title: 'Office Support Management',
          slug: 'office-support-management',
          category: 'Corporate Support',
          short_description: 'Administrative assistance, record keeping, pantry operations, office stationery management, and floor coordination.',
          description: 'Pantry boys, office boys, administrative clerks, and reprographics stewards dedicated to smooth day-to-day office life. We ensure clean breakrooms, stocked beverage stations, prompt courier dispatch, and orderly conference rooms.',
          image_url: 'https://silverstarindia.net/wp-content/uploads/2024/09/8.jpg',
          icon_name: 'Users',
          features: [
            'Corporate Pantry & Beverage Stewards',
            'Office Boys & Errand Floor Runners',
            'Meeting Room Setup & Video Conference Prep',
            'Stationery & Consumables Reordering',
            'Physical Archive & Filing Maintenance',
            'Courier & Postal Dispatch Management'
          ],
          display_order: 8
        }
      ];

      for (const s of seedServices) {
        await client.query(`
          INSERT INTO services (id, title, slug, category, short_description, description, image_url, icon_name, features, display_order, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Active')
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            category = EXCLUDED.category,
            short_description = EXCLUDED.short_description,
            description = EXCLUDED.description,
            image_url = EXCLUDED.image_url,
            features = EXCLUDED.features;
        `, [
          s.id,
          s.title,
          s.slug,
          s.category,
          s.short_description,
          s.description,
          s.image_url,
          s.icon_name,
          JSON.stringify(s.features),
          s.display_order
        ]);
      }
    }

    // -------------------------------------------------------------
    // SEED TEAM MEMBERS (The exact 9 leaders from silverstarindia.net/team)
    // -------------------------------------------------------------
    const teamCount = await client.query('SELECT COUNT(*) FROM team_members');
    if (parseInt(teamCount.rows[0].count) === 0) {
      console.log(' - Seeding 9 executive management team members from silverstarindia.net...');
      const seedTeam = [
        {
          id: 'TM001',
          name: 'Ashok Majjige',
          role: 'Founder/CEO',
          department: 'Executive Leadership',
          bio: 'Visionary entrepreneur with over 15 years of industry leadership in Integrated Facility Management, corporate security, and operational scaling across India.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm2.jpg',
          email: 'ashok@silverstarindia.net',
          phone: '+91 9945449802',
          display_order: 1
        },
        {
          id: 'TM002',
          name: 'Asha M.',
          role: 'Managing Director',
          department: 'Executive Leadership',
          bio: 'Spearheading strategic governance, corporate financial administration, and customer relationship excellence at Silver Star.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm3.jpg',
          email: 'asha@silverstarindia.net',
          phone: '+91 08050000524',
          display_order: 2
        },
        {
          id: 'TM003',
          name: 'Avinash R.',
          role: 'Director, Operations',
          department: 'Operations',
          bio: 'Oversees pan-India frontline service execution, quality control audits, and multi-site facility compliance.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm4.jpg',
          email: 'avinash@silverstarindia.net',
          phone: '+91 9611255416',
          display_order: 3
        },
        {
          id: 'TM004',
          name: 'Joe Cherian',
          role: 'Head, BD & Strategy',
          department: 'Business Development',
          bio: 'Drives enterprise growth, public-private partnerships, key account acquisitions, and expansion into emerging industrial corridors.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm5.jpg',
          email: 'joe.cherian@silverstarindia.net',
          phone: '+91 9620000494',
          display_order: 4
        },
        {
          id: 'TM005',
          name: 'Bhaskar',
          role: 'Regional Manager, Operations',
          department: 'Regional Operations',
          bio: 'Leading regional operations, rapid response logistics, field inspector coordination, and client SLA compliance across South India.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm6.jpg',
          email: 'bhaskar@silverstarindia.net',
          phone: '+91 08050000524',
          display_order: 5
        },
        {
          id: 'TM006',
          name: 'Thomson James',
          role: 'Chief Operating Officer',
          department: 'Executive Operations',
          bio: 'Seasoned operations executive managing national service delivery, workforce training academy, and technology modernization.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm7.jpg',
          email: 'thomson@silverstarindia.net',
          phone: '+91 08050000524',
          display_order: 6
        },
        {
          id: 'TM007',
          name: 'Ashish Bhardwaj',
          role: 'Head, BD',
          department: 'Business Development',
          bio: 'Directing North India market penetration, government contracts, and enterprise corporate sales from our Noida regional office.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm8.jpg',
          email: 'ashish@silverstarindia.net',
          phone: '+91 9611255416',
          display_order: 7
        },
        {
          id: 'TM008',
          name: 'Satish Kumar',
          role: 'Executive, Operations',
          department: 'Operations',
          bio: 'Supervises technical teams, HVAC/DG maintenance schedules, and on-site emergency intervention protocols.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm9.jpg',
          email: 'satish@silverstarindia.net',
          phone: '+91 08050000524',
          display_order: 8
        },
        {
          id: 'TM009',
          name: 'Anil Shukla',
          role: 'Manager, Operations',
          department: 'Operations',
          bio: 'Manages industrial manpower supply, security guard turnouts, and client satisfaction benchmarks across key accounts.',
          photo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/tm10.jpg',
          email: 'anil@silverstarindia.net',
          phone: '+91 9620000494',
          display_order: 9
        }
      ];

      for (const t of seedTeam) {
        await client.query(`
          INSERT INTO team_members (id, name, role, department, bio, photo_url, email, phone, display_order, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active')
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            bio = EXCLUDED.bio,
            photo_url = EXCLUDED.photo_url;
        `, [
          t.id,
          t.name,
          t.role,
          t.department,
          t.bio,
          t.photo_url,
          t.email,
          t.phone,
          t.display_order
        ]);
      }
    }

    // -------------------------------------------------------------
    // SEED CLIENTELE (Enterprise client showcase logos)
    // -------------------------------------------------------------
    const clientCount = await client.query('SELECT COUNT(*) FROM website_clientele');
    if (parseInt(clientCount.rows[0].count) === 0) {
      console.log(' - Seeding enterprise clientele logos for corporate showcase...');
      const seedClients = [
        { id: 'CLI001', name: 'Infosys Limited', category: 'IT & Technology', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl42-300x200.jpg', is_featured: true, display_order: 1 },
        { id: 'CLI002', name: 'Wipro Technologies', category: 'IT & Technology', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl41-300x200.jpg', is_featured: true, display_order: 2 },
        { id: 'CLI003', name: 'Manyata Tech Park', category: 'Commercial Parks', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl40-300x200.jpg', is_featured: true, display_order: 3 },
        { id: 'CLI004', name: 'Bagmane Developers', category: 'Commercial Parks', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl39-300x200.jpg', is_featured: true, display_order: 4 },
        { id: 'CLI005', name: 'Prestige Group', category: 'Real Estate & Builders', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl38-300x200.jpg', is_featured: true, display_order: 5 },
        { id: 'CLI006', name: 'Brigade Enterprises', category: 'Real Estate & Builders', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl37-300x200.jpg', is_featured: true, display_order: 6 },
        { id: 'CLI007', name: 'Biocon Biopharmaceuticals', category: 'Healthcare & Pharma', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl36-300x200.jpg', is_featured: true, display_order: 7 },
        { id: 'CLI008', name: 'Titan Industries', category: 'Manufacturing & Retail', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl35-300x200.jpg', is_featured: true, display_order: 8 },
        { id: 'CLI009', name: 'Flipkart Logistics', category: 'Warehousing & E-Commerce', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl34-300x200.jpg', is_featured: true, display_order: 9 },
        { id: 'CLI010', name: 'Amazon Fulfillment', category: 'Warehousing & E-Commerce', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl33-300x200.jpg', is_featured: true, display_order: 10 },
        { id: 'CLI011', name: 'Apollo Hospitals', category: 'Healthcare & Pharma', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl32-300x200.jpg', is_featured: true, display_order: 11 },
        { id: 'CLI012', name: 'Manipal Health Enterprises', category: 'Healthcare & Pharma', logo_url: 'https://silverstarindia.net/wp-content/uploads/2024/08/cl31-1-300x200.jpg', is_featured: true, display_order: 12 },
      ];

      for (const c of seedClients) {
        await client.query(`
          INSERT INTO website_clientele (id, name, category, logo_url, is_featured, display_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            logo_url = EXCLUDED.logo_url;
        `, [c.id, c.name, c.category, c.logo_url, c.is_featured, c.display_order]);
      }
    }

    console.log('[Migration] Website, Services & Team migrations completed successfully.');
  } catch (err) {
    console.error('[Migration Error] Website migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
