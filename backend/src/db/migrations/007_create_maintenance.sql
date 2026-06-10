CREATE TABLE IF NOT EXISTS maintenance_bills (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id    INTEGER NOT NULL REFERENCES apartments(id),
  bill_month      TEXT    NOT NULL,
  base_amount     REAL    NOT NULL DEFAULT 0,
  amenity_amount  REAL    NOT NULL DEFAULT 0,
  penalty_amount  REAL    NOT NULL DEFAULT 0,
  discount_amount REAL    NOT NULL DEFAULT 0,
  total_amount    REAL    NOT NULL DEFAULT 0,
  due_date        TEXT    NOT NULL,
  payment_status  TEXT    NOT NULL DEFAULT 'Pending' CHECK(payment_status IN ('Pending','Paid','Overdue','Waived','Partial')),
  paid_amount     REAL    NOT NULL DEFAULT 0,
  paid_date       TEXT,
  payment_mode    TEXT    CHECK(payment_mode IN ('Cash','Cheque','NEFT','IMPS','UPI','Online')),
  transaction_ref TEXT,
  receipt_number  TEXT    UNIQUE,
  notes           TEXT,
  generated_by    INTEGER REFERENCES users(id),
  is_deleted      INTEGER NOT NULL DEFAULT 0,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by      INTEGER REFERENCES users(id),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(apartment_id, bill_month)
);
CREATE INDEX IF NOT EXISTS idx_bills_apartment ON maintenance_bills(apartment_id);
CREATE INDEX IF NOT EXISTS idx_bills_status    ON maintenance_bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bills_month     ON maintenance_bills(bill_month);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id     INTEGER NOT NULL REFERENCES apartments(id),
  tenant_id        INTEGER REFERENCES tenants(id),
  category         TEXT    NOT NULL CHECK(category IN ('Plumbing','Electrical','Carpentry','Painting','Cleaning','Pest Control','Other')),
  subject          TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  priority         TEXT    NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High','Emergency')),
  status           TEXT    NOT NULL DEFAULT 'Open' CHECK(status IN ('Open','In Progress','Resolved','Closed','Rejected')),
  assigned_to      INTEGER REFERENCES users(id),
  resolved_date    TEXT,
  resolution_note  TEXT,
  attachment_path  TEXT,
  is_deleted       INTEGER NOT NULL DEFAULT 0,
  created_by       INTEGER REFERENCES users(id),
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by       INTEGER REFERENCES users(id),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_maint_req_apartment ON maintenance_requests(apartment_id);
CREATE INDEX IF NOT EXISTS idx_maint_req_status    ON maintenance_requests(status);
