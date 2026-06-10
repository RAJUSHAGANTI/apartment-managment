CREATE TABLE IF NOT EXISTS blocks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL UNIQUE,
  description  TEXT,
  total_floors INTEGER NOT NULL DEFAULT 1,
  is_deleted   INTEGER NOT NULL DEFAULT 0,
  created_by   INTEGER REFERENCES users(id),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by   INTEGER REFERENCES users(id),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
