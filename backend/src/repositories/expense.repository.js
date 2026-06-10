const BaseRepository = require('./base.repository');
const { buildPaginationMeta } = require('../utils/pagination.utils');

class ExpenseRepository extends BaseRepository {
  constructor() {
    super('expenses');
  }

  findAllWithCategory({ page = 1, limit = 20, category_id, month_year, approval_status, search } = {}) {
    const conditions = ['e.is_deleted = 0'];
    const params = [];

    if (category_id) { conditions.push('e.category_id = ?'); params.push(category_id); }
    if (month_year) { conditions.push('e.month_year = ?'); params.push(month_year); }
    if (approval_status) { conditions.push('e.approval_status = ?'); params.push(approval_status); }
    if (search) {
      conditions.push('(e.title LIKE ? OR e.vendor_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db.prepare(`SELECT COUNT(*) as count FROM expenses e WHERE ${where}`).get(...params).count;
    const data = this.db.prepare(`
      SELECT e.*, ec.name as category_name
      FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
      WHERE ${where}
      ORDER BY e.expense_date DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  getMonthlySummary(year) {
    return this.db.prepare(`
      SELECT ec.name as category, e.month_year,
        SUM(e.amount) as total, COUNT(*) as count
      FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.is_deleted = 0 AND e.approval_status = 'Approved'
        AND e.month_year LIKE ?
      GROUP BY ec.name, e.month_year
      ORDER BY e.month_year, ec.name
    `).all(`${year}%`);
  }

  getCategoryTotals(month_year) {
    return this.db.prepare(`
      SELECT ec.name as category, ec.id as category_id,
        SUM(CASE WHEN e.approval_status = 'Approved' THEN e.amount ELSE 0 END) as approved_total,
        SUM(e.amount) as total, COUNT(*) as count
      FROM expense_categories ec
      LEFT JOIN expenses e ON e.category_id = ec.id AND e.is_deleted = 0
        AND (? IS NULL OR e.month_year = ?)
      WHERE ec.is_active = 1
      GROUP BY ec.id, ec.name
    `).all(month_year || null, month_year || null);
  }

  approve(id, userId, status) {
    this.db.prepare(`
      UPDATE expenses SET approval_status = ?, approved_by = ?, updated_by = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, userId, userId, id);
    return this.findById(id);
  }
}

module.exports = new ExpenseRepository();
