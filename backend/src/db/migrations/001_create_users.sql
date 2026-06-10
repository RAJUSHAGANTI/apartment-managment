CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK(role IN ('Admin','Owner','Tenant')),
  first_name    TEXT    NOT NULL,
  last_name     TEXT    NOT NULL,
  phone         TEXT,
  profile_photo TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  refresh_token TEXT,
  reset_token   TEXT,
  reset_expires TEXT,
  last_login    TEXT,
  is_deleted    INTEGER NOT NULL DEFAULT 0,
  created_by    INTEGER,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by    INTEGER,
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);
