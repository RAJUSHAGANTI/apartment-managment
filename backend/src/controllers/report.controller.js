const svc = require('../services/report.service');
const { success } = require('../utils/response.utils');

const maintenance = (req, res, next) => {
  try {
    const { rows, summary } = svc.getMaintenanceReport(req.query);
    const totalCollection = summary.reduce((s, r) => s + (r.collected || 0), 0);
    const totalPending = rows.filter(r => r.payment_status !== 'Paid').reduce((s, r) => s + (r.total_amount - r.paid_amount), 0);
    const paidCount = rows.filter(r => r.payment_status === 'Paid').length;
    const overdueCount = rows.filter(r => r.payment_status === 'Overdue').length;
    success(res, { bills: rows, summary, totalCollection, totalPending, paidCount, overdueCount });
  } catch (e) { next(e); }
};

const expenses = (req, res, next) => {
  try {
    const { rows, byCategory } = svc.getExpenseReport(req.query);
    const totalExpenses = rows.reduce((s, r) => s + r.amount, 0);
    const approvedCount = rows.filter(r => r.approval_status === 'Approved').length;
    const pendingCount = rows.filter(r => r.approval_status === 'Pending').length;
    success(res, { rows, byCategory: byCategory.map(c => ({ category_name: c.name, total: c.total, count: c.count })), totalExpenses, approvedCount, pendingCount });
  } catch (e) { next(e); }
};

const occupancy = (req, res, next) => {
  try {
    const db = require('../config/database');
    const apartments = db.prepare(`
      SELECT a.*, b.name as block_name,
        (SELECT t.first_name || ' ' || t.last_name FROM tenants t WHERE t.apartment_id = a.id AND t.move_out_date IS NULL AND t.is_deleted = 0 LIMIT 1) as tenant_name,
        (SELECT t.move_in_date FROM tenants t WHERE t.apartment_id = a.id AND t.move_out_date IS NULL AND t.is_deleted = 0 LIMIT 1) as move_in_date
      FROM apartments a JOIN blocks b ON a.block_id = b.id
      WHERE a.is_deleted = 0 ORDER BY b.name, a.flat_number
    `).all();
    const totalApartments = apartments.length;
    const occupied = apartments.filter(a => a.status === 'Occupied').length;
    const vacant = apartments.filter(a => a.status === 'Vacant').length;
    const occupancyRate = totalApartments ? Math.round((occupied / totalApartments) * 100) : 0;
    success(res, { apartments, totalApartments, occupied, vacant, occupancyRate });
  } catch (e) { next(e); }
};

const defaulters = (req, res, next) => {
  try {
    const rows = svc.getDefaulters(req.query);
    const totalOverdue = rows.reduce((s, r) => s + (r.total_amount - r.paid_amount), 0);
    const totalDefaulters = new Set(rows.map(r => r.apartment_id)).size;
    // group by apartment to get months overdue
    const byApartment = {};
    rows.forEach(r => {
      const key = r.apartment_id;
      if (!byApartment[key]) byApartment[key] = { ...r, months_overdue: 0, outstanding: 0, oldest_due_date: r.due_date };
      byApartment[key].months_overdue++;
      byApartment[key].outstanding += (r.total_amount - r.paid_amount);
      if (r.due_date < byApartment[key].oldest_due_date) byApartment[key].oldest_due_date = r.due_date;
      byApartment[key].tenant_name = r.owner_first ? `${r.owner_first} ${r.owner_last}` : 'N/A';
      byApartment[key].phone = r.owner_phone;
    });
    success(res, { defaulters: Object.values(byApartment), totalOverdue, totalDefaulters, overdueCount: rows.length });
  } catch (e) { next(e); }
};

const ALLOWED_REPORT_TYPES = new Set(['maintenance', 'expense', 'occupancy', 'defaulters']);

const exportPDF = async (req, res, next) => {
  try {
    const type = ALLOWED_REPORT_TYPES.has(req.query.type) ? req.query.type : 'maintenance';
    const buf = await svc.exportPDF(type, req.query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    res.send(buf);
  } catch (e) { next(e); }
};

const exportExcel = async (req, res, next) => {
  try {
    const type = ALLOWED_REPORT_TYPES.has(req.query.type) ? req.query.type : 'maintenance';
    const buf = await svc.exportExcel(type, req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.xlsx"`);
    res.send(buf);
  } catch (e) { next(e); }
};

module.exports = { maintenance, expenses, occupancy, defaulters, exportPDF, exportExcel };
