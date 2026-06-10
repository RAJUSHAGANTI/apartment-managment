const BaseRepository = require('./base.repository');

class ApartmentRepository extends BaseRepository {
  constructor() {
    super('apartments');
  }

  findAllWithBlock({ page = 1, limit = 20, status, flat_type, block_id, search } = {}) {
    const conditions = ['a.is_deleted = 0'];
    const params = [];

    if (status) { conditions.push('a.status = ?'); params.push(status); }
    if (flat_type) { conditions.push('a.flat_type = ?'); params.push(flat_type); }
    if (block_id) { conditions.push('a.block_id = ?'); params.push(block_id); }
    if (search) {
      conditions.push('(a.flat_number LIKE ? OR b.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db
      .prepare(`SELECT COUNT(*) as count FROM apartments a JOIN blocks b ON a.block_id = b.id WHERE ${where}`)
      .get(...params).count;

    const data = this.db
      .prepare(`
        SELECT a.*, b.name as block_name, b.total_floors
        FROM apartments a
        JOIN blocks b ON a.block_id = b.id
        WHERE ${where}
        ORDER BY b.name, a.floor, a.flat_number
        LIMIT ? OFFSET ?
      `)
      .all(...params, limit, offset);

    const { buildPaginationMeta } = require('../utils/pagination.utils');
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  findByIdWithDetails(id) {
    return this.db.prepare(`
      SELECT a.*, b.name as block_name,
        (SELECT json_group_array(json_object('id', o.id, 'first_name', o.first_name, 'last_name', o.last_name, 'email', o.email))
         FROM apartment_owners ao JOIN owners o ON ao.owner_id = o.id
         WHERE ao.apartment_id = a.id AND ao.is_current = 1 AND o.is_deleted = 0) as current_owners,
        (SELECT json_object('id', t.id, 'first_name', t.first_name, 'last_name', t.last_name, 'email', t.email, 'move_in_date', t.move_in_date)
         FROM tenants t WHERE t.apartment_id = a.id AND t.is_active = 1 AND t.is_deleted = 0 LIMIT 1) as current_tenant
      FROM apartments a
      JOIN blocks b ON a.block_id = b.id
      WHERE a.id = ? AND a.is_deleted = 0
    `).get(id) || null;
  }

  getOwnerHistory(apartmentId) {
    return this.db.prepare(`
      SELECT ao.*, o.first_name, o.last_name, o.email, o.phone
      FROM apartment_owners ao JOIN owners o ON ao.owner_id = o.id
      WHERE ao.apartment_id = ?
      ORDER BY ao.ownership_from DESC
    `).all(apartmentId);
  }

  getTenantHistory(apartmentId) {
    return this.db.prepare(`
      SELECT * FROM tenants WHERE apartment_id = ? AND is_deleted = 0 ORDER BY move_in_date DESC
    `).all(apartmentId);
  }
}

module.exports = new ApartmentRepository();
