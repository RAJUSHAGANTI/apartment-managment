CREATE TABLE IF NOT EXISTS notices (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  content         TEXT    NOT NULL,
  notice_type     TEXT    NOT NULL DEFAULT 'General' CHECK(notice_type IN ('General','Maintenance','Legal','Financial','Community')),
  target_role     TEXT    DEFAULT 'All' CHECK(target_role IN ('All','Owner','Tenant')),
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
CREATE INDEX IF NOT EXISTS idx_notices_type   ON notices(notice_type);
CREATE INDEX IF NOT EXISTS idx_notices_active ON notices(is_active);
