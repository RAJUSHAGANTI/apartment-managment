const BaseRepository = require('./base.repository');

class TenantRepository extends BaseRepository {
  constructor() {
    super('tenants');
  }

  findAllWithApartment({ page = 1, limit = 20, is_active, search, apartment_id } = {}) {
    const conditions = ['t.is_deleted = 0'];
    const params = [];

    if (is_active !== undefined) { conditions.push('t.is_active = ?'); params.push(is_active); }
    if (apartment_id) { conditions.push('t.apartment_id = ?'); params.push(apartment_id); }
    if (search) {
      conditions.push('(t.first_name LIKE ? OR t.last_name LIKE ? OR t.email LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db.prepare(`SELECT COUNT(*) as count FROM tenants t WHERE ${where}`).get(...params).count;
    const data = this.db.prepare(`
      SELECT t.*, a.flat_number, b.name as block_name
      FROM tenants t
      LEFT JOIN apartments a ON t.apartment_id = a.id
      LEFT JOIN blocks b ON a.block_id = b.id
      WHERE ${where}
      ORDER BY t.first_name, t.last_name
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const { buildPaginationMeta } = require('../utils/pagination.utils');
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  moveOut(id, moveOutDate, userId) {
    this.db.prepare(`
      UPDATE tenants SET move_out_date = ?, is_active = 0, updated_by = ?, updated_at = datetime('now') WHERE id = ?
    `).run(moveOutDate, userId, id);
  }
}

module.exports = new TenantRepository();
