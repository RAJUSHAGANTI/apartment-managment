CREATE TABLE IF NOT EXISTS owners (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER REFERENCES users(id),
  first_name      TEXT    NOT NULL,
  last_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL UNIQUE,
  phone           TEXT    NOT NULL,
  alternate_phone TEXT,
  aadhar_number   TEXT    UNIQUE,
  pan_number      TEXT    UNIQUE,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  bank_account    TEXT,
  bank_ifsc       TEXT,
  bank_name       TEXT,
  notes           TEXT,
  is_deleted      INTEGER NOT NULL DEFAULT 0,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by      INTEGER REFERENCES users(id),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_owners_email   ON owners(email);
CREATE INDEX IF NOT EXISTS idx_owners_user_id ON owners(user_id);

CREATE TABLE IF NOT EXISTS apartment_owners (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id    INTEGER NOT NULL REFERENCES apartments(id),
  owner_id        INTEGER NOT NULL REFERENCES owners(id),
  ownership_from  TEXT    NOT NULL,
  ownership_to    TEXT,
  ownership_share REAL    NOT NULL DEFAULT 100,
  is_current      INTEGER NOT NULL DEFAULT 1,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by      INTEGER REFERENCES users(id),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_apt_owners_apt   ON apartment_owners(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apt_owners_owner ON apartment_owners(owner_id);
