import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

router.get('/kpis', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      activeEmpRes,
      kycPendingRes,
      deployedRes,
      notDeployedRes,
      attendanceRes,
      activeClientsRes,
      activeSitesRes,
      pendingIncidentsRes,
      pendingDocsRes,
    ] = await Promise.all([
      query(`SELECT COUNT(*) FROM employees WHERE status = 'Active'`),
      query(`SELECT COUNT(*) FROM employees WHERE kyc_status = 'Pending'`),
      query(`SELECT COUNT(*) FROM employees WHERE deployed_site_id IS NOT NULL AND status = 'Active'`),
      query(`SELECT COUNT(*) FROM employees WHERE deployed_site_id IS NULL AND status = 'Active'`),
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('Present', 'Late')) as present_count,
          COUNT(*) FILTER (WHERE status = 'Absent') as absent_count
        FROM attendance WHERE date = $1
      `, [today]),
      query(`SELECT COUNT(*) FROM clients WHERE status = 'Active'`),
      query(`SELECT COUNT(*) FROM sites WHERE status = 'Active'`),
      query(`SELECT COUNT(*) FROM incidents WHERE status != 'Resolved'`),
      query(`SELECT COUNT(*) FROM employee_documents WHERE status = 'Pending'`),
    ]);

    const totalActiveEmployees = parseInt(activeEmpRes.rows[0].count, 10);
    const kycPending = parseInt(kycPendingRes.rows[0].count, 10);
    const employeesDeployed = parseInt(deployedRes.rows[0].count, 10);
    const employeesNotDeployed = parseInt(notDeployedRes.rows[0].count, 10);
    const presentToday = parseInt(attendanceRes.rows[0]?.present_count || 0, 10);
    const absentToday = parseInt(attendanceRes.rows[0]?.absent_count || 0, 10);
    const activeClientContracts = parseInt(activeClientsRes.rows[0].count, 10);
    const activeWorkLocations = parseInt(activeSitesRes.rows[0].count, 10);
    const pendingComplaints = parseInt(pendingIncidentsRes.rows[0].count, 10);
    const pendingApprovals = parseInt(pendingDocsRes.rows[0].count, 10);

    res.json({
      totalActiveEmployees,
      newRegistrationsMTD: 0,
      kycPending,
      employeesDeployed,
      employeesNotDeployed,
      presentToday,
      absentToday,
      activeClientContracts,
      activeWorkLocations,
      pendingComplaints,
      pendingApprovals,
      monthlyManpowerCost: totalActiveEmployees * 20000,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT * FROM notifications';
    const params = [];
    if (role) {
      params.push(role);
      sql += ' WHERE target_role IS NULL OR target_role = $1';
    }
    sql += ' ORDER BY created_at DESC LIMIT 20';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
