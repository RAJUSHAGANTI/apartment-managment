CREATE TABLE IF NOT EXISTS apartments (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  flat_number         TEXT    NOT NULL,
  block_id            INTEGER NOT NULL REFERENCES blocks(id),
  floor               INTEGER NOT NULL,
  flat_type           TEXT    NOT NULL CHECK(flat_type IN ('1BHK','2BHK','3BHK','4BHK','Penthouse','Villa','Studio')),
  area_sqft           REAL    NOT NULL,
  facing              TEXT    CHECK(facing IN ('North','South','East','West','NE','NW','SE','SW')),
  status              TEXT    NOT NULL DEFAULT 'Vacant' CHECK(status IN ('Occupied','Vacant','Under Maintenance')),
  monthly_maintenance REAL    NOT NULL DEFAULT 0,
  description         TEXT,
  is_deleted          INTEGER NOT NULL DEFAULT 0,
  created_by          INTEGER REFERENCES users(id),
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by          INTEGER REFERENCES users(id),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(flat_number, block_id)
);
CREATE INDEX IF NOT EXISTS idx_apartments_block  ON apartments(block_id);
CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status);
CREATE INDEX IF NOT EXISTS idx_apartments_type   ON apartments(flat_type);
