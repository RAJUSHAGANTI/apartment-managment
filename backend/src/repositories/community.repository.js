const db = require('../config/database');
const { buildPaginationMeta } = require('../utils/pagination.utils');

// Notices
const findNotices = ({ page = 1, limit = 20, notice_type, target_role, is_active } = {}) => {
  const conditions = ['is_deleted = 0'];
  const params = [];

  if (notice_type) { conditions.push('notice_type = ?'); params.push(notice_type); }
  if (target_role) { conditions.push("(target_role = ? OR target_role = 'All')"); params.push(target_role); }
  if (is_active !== undefined) { conditions.push('is_active = ?'); params.push(is_active); }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const total = db.prepare(`SELECT COUNT(*) as count FROM notices WHERE ${where}`).get(...params).count;
  const data = db.prepare(`SELECT * FROM notices WHERE ${where} ORDER BY is_pinned DESC, created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const createNotice = (data, userId) => {
  const keys = Object.keys(data);
  const result = db.prepare(`INSERT INTO notices (${keys.join(',')}, created_by, updated_by) VALUES (${keys.map(() => '?').join(',')}, ?, ?)`).run(...Object.values(data), userId, userId);
  return db.prepare('SELECT * FROM notices WHERE id = ?').get(result.lastInsertRowid);
};

const updateNotice = (id, data, userId) => {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE notices SET ${sets}, updated_by = ?, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(data), userId, id);
  return db.prepare('SELECT * FROM notices WHERE id = ?').get(id);
};

const deleteNotice = (id, userId) => db.prepare(`UPDATE notices SET is_deleted = 1, updated_by = ? WHERE id = ?`).run(userId, id);
const findNoticeById = (id) => db.prepare('SELECT * FROM notices WHERE id = ? AND is_deleted = 0').get(id) || null;

// Events
const findEvents = ({ page = 1, limit = 20, event_type } = {}) => {
  const conditions = ['is_deleted = 0'];
  const params = [];
  if (event_type) { conditions.push('event_type = ?'); params.push(event_type); }
  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const total = db.prepare(`SELECT COUNT(*) as count FROM events WHERE ${where}`).get(...params).count;
  const data = db.prepare(`SELECT * FROM events WHERE ${where} ORDER BY event_date DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const createEvent = (data, userId) => {
  const keys = Object.keys(data);
  const result = db.prepare(`INSERT INTO events (${keys.join(',')}, created_by, updated_by) VALUES (${keys.map(() => '?').join(',')}, ?, ?)`).run(...Object.values(data), userId, userId);
  return db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
};

const updateEvent = (id, data, userId) => {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE events SET ${sets}, updated_by = ?, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(data), userId, id);
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id);
};

const deleteEvent = (id, userId) => db.prepare(`UPDATE events SET is_deleted = 1, updated_by = ? WHERE id = ?`).run(userId, id);
const findEventById = (id) => db.prepare('SELECT * FROM events WHERE id = ? AND is_deleted = 0').get(id) || null;

// Alerts
const findAlerts = ({ page = 1, limit = 20, is_active, alert_type } = {}) => {
  const conditions = ['is_deleted = 0'];
  const params = [];
  if (is_active !== undefined) { conditions.push('is_active = ?'); params.push(is_active); }
  if (alert_type) { conditions.push('alert_type = ?'); params.push(alert_type); }
  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;
  const total = db.prepare(`SELECT COUNT(*) as count FROM alerts WHERE ${where}`).get(...params).count;
  const data = db.prepare(`SELECT * FROM alerts WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const createAlert = (data, userId) => {
  const keys = Object.keys(data);
  const result = db.prepare(`INSERT INTO alerts (${keys.join(',')}, created_by, updated_by) VALUES (${keys.map(() => '?').join(',')}, ?, ?)`).run(...Object.values(data), userId, userId);
  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(result.lastInsertRowid);
};

const updateAlert = (id, data, userId) => {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE alerts SET ${sets}, updated_by = ?, updated_at = datetime('now') WHERE id = ?`).run(...Object.values(data), userId, id);
  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
};

const deleteAlert = (id, userId) => db.prepare(`UPDATE alerts SET is_deleted = 1, updated_by = ? WHERE id = ?`).run(userId, id);
const findAlertById = (id) => db.prepare('SELECT * FROM alerts WHERE id = ? AND is_deleted = 0').get(id) || null;

module.exports = {
  findNotices, createNotice, updateNotice, deleteNotice, findNoticeById,
  findEvents, createEvent, updateEvent, deleteEvent, findEventById,
  findAlerts, createAlert, updateAlert, deleteAlert, findAlertById,
};
