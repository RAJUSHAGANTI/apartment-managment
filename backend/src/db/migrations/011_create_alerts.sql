CREATE TABLE IF NOT EXISTS alerts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT    NOT NULL,
  message       TEXT    NOT NULL,
  alert_type    TEXT    NOT NULL CHECK(alert_type IN ('Water Shutdown','Power Maintenance','Security','Gas','Lift','Other')),
  severity      TEXT    NOT NULL DEFAULT 'Info' CHECK(severity IN ('Info','Warning','Critical')),
  start_time    TEXT    NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_type   ON alerts(alert_type);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id),
  action     TEXT    NOT NULL,
  table_name TEXT    NOT NULL,
  record_id  INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user  ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_date  ON audit_log(created_at);
