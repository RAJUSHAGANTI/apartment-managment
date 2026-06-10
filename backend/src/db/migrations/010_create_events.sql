CREATE TABLE IF NOT EXISTS events (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  title                TEXT    NOT NULL,
  description          TEXT,
  event_date           TEXT    NOT NULL,
  start_time           TEXT,
  end_time             TEXT,
  venue                TEXT,
  event_type           TEXT    NOT NULL CHECK(event_type IN ('Cultural','Sports','Meeting','Celebration','Other')),
  organizer            TEXT,
  max_attendees        INTEGER,
  registration_required INTEGER NOT NULL DEFAULT 0,
  attachment_path      TEXT,
  is_cancelled         INTEGER NOT NULL DEFAULT 0,
  is_deleted           INTEGER NOT NULL DEFAULT 0,
  created_by           INTEGER REFERENCES users(id),
  created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by           INTEGER REFERENCES users(id),
  updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
