CREATE TABLE IF NOT EXISTS tenants (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id                 INTEGER REFERENCES users(id),
  apartment_id            INTEGER REFERENCES apartments(id),
  first_name              TEXT    NOT NULL,
  last_name               TEXT    NOT NULL,
  email                   TEXT    NOT NULL,
  phone                   TEXT    NOT NULL,
  alternate_phone         TEXT,
  aadhar_number           TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  move_in_date            TEXT    NOT NULL,
  move_out_date           TEXT,
  rent_amount             REAL    NOT NULL DEFAULT 0,
  deposit_amount          REAL    NOT NULL DEFAULT 0,
  lease_start             TEXT,
  lease_end               TEXT,
  id_proof_type           TEXT    CHECK(id_proof_type IN ('Aadhar','Passport','DL','VoterId','PAN')),
  id_proof_path           TEXT,
  notes                   TEXT,
  is_active               INTEGER NOT NULL DEFAULT 1,
  is_deleted              INTEGER NOT NULL DEFAULT 0,
  created_by              INTEGER REFERENCES users(id),
  created_at              TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by              INTEGER REFERENCES users(id),
  updated_at              TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tenants_apartment ON tenants(apartment_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email     ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_active    ON tenants(is_active);
