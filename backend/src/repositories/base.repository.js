const db = require('../config/database');
const { buildPaginationMeta } = require('../utils/pagination.utils');

class BaseRepository {
  constructor(tableName) {
    this.table = tableName;
    this.db = db;
  }

  findAll({ filters = {}, sort = 'id', order = 'ASC', page = 1, limit = 20 } = {}) {
    const conditions = ['is_deleted = 0'];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const total = this.db
      .prepare(`SELECT COUNT(*) as count FROM ${this.table} WHERE ${where}`)
      .get(...params).count;

    const data = this.db
      .prepare(`SELECT * FROM ${this.table} WHERE ${where} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  findById(id) {
    return this.db
      .prepare(`SELECT * FROM ${this.table} WHERE id = ? AND is_deleted = 0`)
      .get(id) || null;
  }

  findOne(conditions = {}) {
    const keys = Object.keys(conditions);
    const where = keys.map(k => `${k} = ?`).join(' AND ');
    return this.db
      .prepare(`SELECT * FROM ${this.table} WHERE ${where} LIMIT 1`)
      .get(...Object.values(conditions)) || null;
  }

  create(data, userId = null) {
    const stamped = { ...data, created_by: userId, updated_by: userId };
    const keys = Object.keys(stamped);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = this.db.prepare(
      `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders})`
    );
    const result = stmt.run(...Object.values(stamped));
    return this.findById(result.lastInsertRowid);
  }

  update(id, data, userId = null) {
    const stamped = { ...data, updated_by: userId, updated_at: new Date().toISOString() };
    const sets = Object.keys(stamped).map(k => `${k} = ?`).join(', ');
    this.db
      .prepare(`UPDATE ${this.table} SET ${sets} WHERE id = ? AND is_deleted = 0`)
      .run(...Object.values(stamped), id);
    return this.findById(id);
  }

  softDelete(id, userId = null) {
    this.db
      .prepare(
        `UPDATE ${this.table} SET is_deleted = 1, updated_by = ?, updated_at = ? WHERE id = ?`
      )
      .run(userId, new Date().toISOString(), id);
    return true;
  }

  count(filters = {}) {
    const conditions = ['is_deleted = 0'];
    const params = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }
    return this.db
      .prepare(`SELECT COUNT(*) as count FROM ${this.table} WHERE ${conditions.join(' AND ')}`)
      .get(...params).count;
  }

  rawQuery(sql, params = []) {
    return this.db.prepare(sql).all(...params);
  }

  rawGet(sql, params = []) {
    return this.db.prepare(sql).get(...params);
  }

  transaction(fn) {
    return this.db.transaction(fn)();
  }
}

module.exports = BaseRepository;
