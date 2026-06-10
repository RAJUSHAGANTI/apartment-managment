const BaseRepository = require('./base.repository');

class OwnerRepository extends BaseRepository {
  constructor() {
    super('owners');
  }

  findAllWithApartments({ page = 1, limit = 20, search } = {}) {
    const conditions = ['o.is_deleted = 0'];
    const params = [];

    if (search) {
      conditions.push('(o.first_name LIKE ? OR o.last_name LIKE ? OR o.email LIKE ? OR o.phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db.prepare(`SELECT COUNT(*) as count FROM owners o WHERE ${where}`).get(...params).count;

    const data = this.db.prepare(`
      SELECT o.*,
        (SELECT COUNT(*) FROM apartment_owners ao WHERE ao.owner_id = o.id AND ao.is_current = 1) as apartment_count
      FROM owners o WHERE ${where}
      ORDER BY o.first_name, o.last_name
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const { buildPaginationMeta } = require('../utils/pagination.utils');
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  findOwnerApartments(ownerId) {
    return this.db.prepare(`
      SELECT a.*, b.name as block_name, ao.ownership_from, ao.ownership_to, ao.ownership_share, ao.is_current
      FROM apartment_owners ao
      JOIN apartments a ON ao.apartment_id = a.id
      JOIN blocks b ON a.block_id = b.id
      WHERE ao.owner_id = ? AND a.is_deleted = 0
      ORDER BY ao.is_current DESC, ao.ownership_from DESC
    `).all(ownerId);
  }

  assignApartment(ownerId, apartmentId, ownershipFrom, ownershipShare, userId) {
    // End any current ownership for this apartment-owner pair
    this.db.prepare(`
      UPDATE apartment_owners SET is_current = 0, ownership_to = ? WHERE owner_id = ? AND apartment_id = ? AND is_current = 1
    `).run(ownershipFrom, ownerId, apartmentId);

    return this.db.prepare(`
      INSERT INTO apartment_owners (apartment_id, owner_id, ownership_from, ownership_share, is_current, created_by, updated_by)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(apartmentId, ownerId, ownershipFrom, ownershipShare || 100, userId, userId);
  }

  removeApartmentAssignment(ownerId, apartmentId, userId) {
    this.db.prepare(`
      UPDATE apartment_owners SET is_current = 0, ownership_to = date('now'), updated_by = ?
      WHERE owner_id = ? AND apartment_id = ? AND is_current = 1
    `).run(userId, ownerId, apartmentId);
  }
}

module.exports = new OwnerRepository();
