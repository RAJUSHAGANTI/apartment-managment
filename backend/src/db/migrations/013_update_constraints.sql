-- Recreate notices with relaxed check constraints
CREATE TABLE IF NOT EXISTS notices_new (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  content         TEXT    NOT NULL,
  notice_type     TEXT    NOT NULL DEFAULT 'General',
  target_role     TEXT    DEFAULT 'All',
  publish_date    TEXT    NOT NULL DEFAULT (date('now')),
  expiry_date     TEXT,
  attachment_path TEXT,
  is_pinned       INTEGER NOT NULL DEFAULT 0,
  is_active       INTEGER NOT NULL DEFAULT 1,
  is_deleted      INTEGER NOT NULL DEFAULT 0,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by      INTEGER REFERENCES users(id),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO notices_new SELECT * FROM notices;
DROP TABLE notices;
ALTER TABLE notices_new RENAME TO notices;
CREATE INDEX IF NOT EXISTS idx_notices_type   ON notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);

-- Recreate alerts with relaxed check constraints
CREATE TABLE IF NOT EXISTS alerts_new (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  message       TEXT    NOT NULL,
  alert_type    TEXT    NOT NULL DEFAULT 'General',
  severity      TEXT    NOT NULL DEFAULT 'Medium',
  start_time    TEXT,
  end_time      TEXT,
  affected_area TEXT,
  target_role   TEXT    DEFAULT 'All',
  is_active     INTEGER NOT NULL DEFAULT 1,
  is_deleted    INTEGER NOT NULL DEFAULT 0,
  created_by    INTEGER REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by    INTEGER REFERENCES users(id),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO alerts_new SELECT * FROM alerts;
DROP TABLE alerts;
ALTER TABLE alerts_new RENAME TO alerts;
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_type   ON alerts(alert_type);
