const BaseRepository = require('./base.repository');
const { buildPaginationMeta } = require('../utils/pagination.utils');

class MaintenanceRepository extends BaseRepository {
  constructor() {
    super('maintenance_bills');
  }

  findBillsWithApartment({ page = 1, limit = 20, payment_status, bill_month, apartment_id } = {}) {
    const conditions = ['mb.is_deleted = 0'];
    const params = [];

    if (payment_status) { conditions.push('mb.payment_status = ?'); params.push(payment_status); }
    if (bill_month) { conditions.push('mb.bill_month = ?'); params.push(bill_month); }
    if (apartment_id) { conditions.push('mb.apartment_id = ?'); params.push(apartment_id); }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db
      .prepare(`SELECT COUNT(*) as count FROM maintenance_bills mb WHERE ${where}`)
      .get(...params).count;

    const data = this.db.prepare(`
      SELECT mb.*, a.flat_number, b.name as block_name
      FROM maintenance_bills mb
      JOIN apartments a ON mb.apartment_id = a.id
      JOIN blocks b ON a.block_id = b.id
      WHERE ${where}
      ORDER BY mb.bill_month DESC, b.name, a.flat_number
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  generateMonthlyBills(billMonth, dueDate, userId) {
    const apartments = this.db.prepare(`
      SELECT id, monthly_maintenance FROM apartments WHERE status = 'Occupied' AND is_deleted = 0
    `).all();

    const receiptBase = `RCP-${billMonth.replace('-', '')}-`;
    let generated = 0;

    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO maintenance_bills
        (apartment_id, bill_month, base_amount, total_amount, due_date, payment_status, receipt_number, generated_by, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?)
    `);

    this.db.transaction(() => {
      apartments.forEach((apt, idx) => {
        const receipt = `${receiptBase}${apt.id}-${idx + 1}`;
        const result = insert.run(apt.id, billMonth, apt.monthly_maintenance, apt.monthly_maintenance, dueDate, receipt, userId, userId, userId);
        if (result.changes > 0) generated++;
      });
    })();

    return { generated, total: apartments.length };
  }

  recordPayment(id, { paid_amount, payment_mode, transaction_ref, notes }, userId) {
    const bill = this.findById(id);
    if (!bill) return null;

    const status = paid_amount >= bill.total_amount ? 'Paid' : 'Partial';
    const paidDate = new Date().toISOString().split('T')[0];

    this.db.prepare(`
      UPDATE maintenance_bills SET
        paid_amount = ?, payment_status = ?, paid_date = ?,
        payment_mode = ?, transaction_ref = ?, notes = ?,
        updated_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(paid_amount, status, paidDate, payment_mode, transaction_ref, notes, userId, id);

    return this.findById(id);
  }

  // Maintenance requests
  findRequests({ page = 1, limit = 20, status, apartment_id, tenant_id } = {}) {
    const conditions = ['mr.is_deleted = 0'];
    const params = [];

    if (status) { conditions.push('mr.status = ?'); params.push(status); }
    if (apartment_id) { conditions.push('mr.apartment_id = ?'); params.push(apartment_id); }
    if (tenant_id) { conditions.push('mr.tenant_id = ?'); params.push(tenant_id); }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db.prepare(`SELECT COUNT(*) as count FROM maintenance_requests mr WHERE ${where}`).get(...params).count;
    const data = this.db.prepare(`
      SELECT mr.*, a.flat_number, b.name as block_name
      FROM maintenance_requests mr
      JOIN apartments a ON mr.apartment_id = a.id
      JOIN blocks b ON a.block_id = b.id
      WHERE ${where}
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  findRequestById(id) {
    return this.db.prepare(`
      SELECT mr.*, a.flat_number, b.name as block_name
      FROM maintenance_requests mr
      JOIN apartments a ON mr.apartment_id = a.id
      JOIN blocks b ON a.block_id = b.id
      WHERE mr.id = ? AND mr.is_deleted = 0
    `).get(id) || null;
  }

  createRequest(data, userId) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const result = this.db.prepare(
      `INSERT INTO maintenance_requests (${keys.join(', ')}, created_by, updated_by) VALUES (${placeholders}, ?, ?)`
    ).run(...Object.values(data), userId, userId);
    return this.findRequestById(result.lastInsertRowid);
  }

  updateRequest(id, data, userId) {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    this.db.prepare(`
      UPDATE maintenance_requests SET ${sets}, updated_by = ?, updated_at = datetime('now') WHERE id = ?
    `).run(...Object.values(data), userId, id);
    return this.findRequestById(id);
  }

  deleteRequest(id, userId) {
    this.db.prepare(`
      UPDATE maintenance_requests SET is_deleted = 1, updated_by = ? WHERE id = ?
    `).run(userId, id);
  }
}

module.exports = new MaintenanceRepository();
