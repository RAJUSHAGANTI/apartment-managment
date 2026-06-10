const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  findByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE email = ? AND is_deleted = 0').get(email) || null;
  }

  findByUsername(username) {
    return this.db.prepare('SELECT * FROM users WHERE username = ? AND is_deleted = 0').get(username) || null;
  }

  findByEmailOrUsername(identifier) {
    return this.db
      .prepare('SELECT * FROM users WHERE (email = ? OR username = ?) AND is_deleted = 0')
      .get(identifier, identifier) || null;
  }

  setRefreshToken(id, token) {
    this.db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(token, id);
  }

  clearRefreshToken(id) {
    this.db.prepare('UPDATE users SET refresh_token = NULL WHERE id = ?').run(id);
  }

  setResetToken(id, token, expires) {
    this.db
      .prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?')
      .run(token, expires, id);
  }

  findByResetToken(token) {
    return this.db
      .prepare("SELECT * FROM users WHERE reset_token = ? AND reset_expires > datetime('now') AND is_deleted = 0")
      .get(token) || null;
  }

  updateLastLogin(id) {
    this.db
      .prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?")
      .run(id);
  }

  updatePassword(id, passwordHash) {
    this.db
      .prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?")
      .run(passwordHash, id);
  }

  safeFields(user) {
    if (!user) return null;
    const { password_hash, refresh_token, reset_token, reset_expires, ...safe } = user;
    return safe;
  }
}

module.exports = new UserRepository();
