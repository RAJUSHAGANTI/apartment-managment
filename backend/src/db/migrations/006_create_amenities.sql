CREATE TABLE IF NOT EXISTS amenities (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL UNIQUE,
  category         TEXT    NOT NULL CHECK(category IN ('Recreation','Health','Utility','Security','Transport','Other')),
  description      TEXT,
  capacity         INTEGER,
  location         TEXT,
  operating_hours  TEXT,
  monthly_cost     REAL    NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Under Maintenance','Closed')),
  icon             TEXT,
  booking_required INTEGER NOT NULL DEFAULT 0,
  is_deleted       INTEGER NOT NULL DEFAULT 0,
  created_by       INTEGER REFERENCES users(id),
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by       INTEGER REFERENCES users(id),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS amenity_charges (
  id                          INTEGER PRIMARY KEY AUTOINCREMENT,
  amenity_id                  INTEGER NOT NULL REFERENCES amenities(id),
  apartment_id                INTEGER NOT NULL REFERENCES apartments(id),
  month_year                  TEXT    NOT NULL,
  amount                      REAL    NOT NULL,
  is_included_in_maintenance  INTEGER NOT NULL DEFAULT 1,
  created_by                  INTEGER REFERENCES users(id),
  created_at                  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by                  INTEGER REFERENCES users(id),
  updated_at                  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(amenity_id, apartment_id, month_year)
);
