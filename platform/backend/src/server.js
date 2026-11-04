import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/index.js';
import { runMigrations } from './db/migrate.js';

import authRoutes from './routes/auth.js';
import companyRoutes from './routes/company.js';
import employeeRoutes from './routes/employees.js';
import clientRoutes from './routes/clients.js';
import deploymentRoutes from './routes/deployments.js';
import attendanceRoutes from './routes/attendance.js';
import documentRoutes from './routes/documents.js';
import billingRoutes from './routes/billing.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as now, current_database() as db');
    res.json({
      status: 'healthy',
      service: 'Silver Star Digital Platform API',
      database: dbRes.rows[0].db,
      timestamp: dbRes.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api', clientRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start server
async function startServer() {
  try {
    // Verify DB & Run migrations
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Silver Star Platform API running on http://localhost:${PORT}`);
      console.log(`Connected to PostgreSQL: ${process.env.DB_NAME || 'silverstardb'} on port ${process.env.DB_PORT || 5432}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
