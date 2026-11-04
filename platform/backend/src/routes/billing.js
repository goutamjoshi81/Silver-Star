import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET all contract billings
router.get('/contracts', async (req, res) => {
  try {
    const { clientId, status } = req.query;
    let sql = `
      SELECT con.*, c.name as client_name
      FROM contract_billings con
      JOIN clients c ON con.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (clientId) {
      params.push(clientId);
      sql += ` AND con.client_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND con.status = $${params.length}`;
    }
    sql += ' ORDER BY con.created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      contractNumber: r.contract_number,
      startDate: r.start_date ? r.start_date.toISOString().split('T')[0] : '',
      endDate: r.end_date ? r.end_date.toISOString().split('T')[0] : '',
      billingFrequency: r.billing_frequency,
      totalValue: parseFloat(r.total_value),
      monthlyAmount: parseFloat(r.monthly_amount),
      status: r.status,
      lastInvoiceDate: r.last_invoice_date ? r.last_invoice_date.toISOString().split('T')[0] : '',
      lastInvoiceStatus: r.last_invoice_status,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new contract billing
router.post('/contracts', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `CON${Date.now().toString().slice(-6)}`;
    const { rows } = await query(
      `INSERT INTO contract_billings (
        id, client_id, contract_number, start_date, end_date, billing_frequency, total_value, monthly_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id,
        b.clientId,
        b.contractNumber,
        b.startDate,
        b.endDate,
        b.billingFrequency || 'Monthly',
        b.totalValue || 0,
        b.monthlyAmount || 0,
        b.status || 'Active',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all GST invoices
router.get('/invoices', async (req, res) => {
  try {
    const { clientId, status } = req.query;
    let sql = `
      SELECT inv.*, c.name as client_name
      FROM gst_invoices inv
      JOIN clients c ON inv.client_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (clientId) {
      params.push(clientId);
      sql += ` AND inv.client_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND inv.status = $${params.length}`;
    }
    sql += ' ORDER BY inv.invoice_date DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      clientId: r.client_id,
      clientName: r.client_name,
      contractId: r.contract_id,
      invoiceDate: r.invoice_date ? r.invoice_date.toISOString().split('T')[0] : '',
      dueDate: r.due_date ? r.due_date.toISOString().split('T')[0] : '',
      billingPeriodStart: r.billing_period_start ? r.billing_period_start.toISOString().split('T')[0] : '',
      billingPeriodEnd: r.billing_period_end ? r.billing_period_end.toISOString().split('T')[0] : '',
      subtotal: parseFloat(r.subtotal),
      cgstRate: parseFloat(r.cgst_rate),
      cgstAmount: parseFloat(r.cgst_amount),
      sgstRate: parseFloat(r.sgst_rate),
      sgstAmount: parseFloat(r.sgst_amount),
      igstRate: parseFloat(r.igst_rate),
      igstAmount: parseFloat(r.igst_amount),
      totalAmount: parseFloat(r.total_amount),
      status: r.status,
      gstBillFileUrl: r.gst_bill_file_url,
      paymentDate: r.payment_date ? r.payment_date.toISOString().split('T')[0] : null,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload / create GST invoice
router.post('/invoices', async (req, res) => {
  try {
    const b = req.body;
    const id = b.id || `INV${Date.now().toString().slice(-6)}`;
    const invoiceNumber = b.invoiceNumber || `SS-INV-${Date.now().toString().slice(-6)}`;
    
    const subtotal = parseFloat(b.subtotal || 0);
    const isInterstate = !!b.isInterstate;
    
    let cgstRate = 9.0;
    let sgstRate = 9.0;
    let igstRate = 0.0;
    let cgstAmount = +(subtotal * 0.09).toFixed(2);
    let sgstAmount = +(subtotal * 0.09).toFixed(2);
    let igstAmount = 0.0;

    if (isInterstate) {
      cgstRate = 0.0;
      sgstRate = 0.0;
      igstRate = 18.0;
      cgstAmount = 0.0;
      sgstAmount = 0.0;
      igstAmount = +(subtotal * 0.18).toFixed(2);
    }

    const totalAmount = +(subtotal + cgstAmount + sgstAmount + igstAmount).toFixed(2);

    const { rows } = await query(
      `INSERT INTO gst_invoices (
        id, invoice_number, client_id, contract_id, invoice_date, due_date,
        billing_period_start, billing_period_end, subtotal, cgst_rate, cgst_amount,
        sgst_rate, sgst_amount, igst_rate, igst_amount, total_amount, status, gst_bill_file_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        id,
        invoiceNumber,
        b.clientId,
        b.contractId || null,
        b.invoiceDate || new Date().toISOString().split('T')[0],
        b.dueDate || new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0],
        b.billingPeriodStart || null,
        b.billingPeriodEnd || null,
        subtotal,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalAmount,
        b.status || 'Pending',
        b.gstBillFileUrl || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
