CREATE TABLE IF NOT EXISTS expense_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  description TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS expenses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id     INTEGER NOT NULL REFERENCES expense_categories(id),
  title           TEXT    NOT NULL,
  description     TEXT,
  amount          REAL    NOT NULL,
  expense_date    TEXT    NOT NULL,
  vendor_name     TEXT,
  invoice_number  TEXT,
  payment_mode    TEXT    CHECK(payment_mode IN ('Cash','Cheque','NEFT','IMPS','UPI','Online')),
  payment_ref     TEXT,
  receipt_path    TEXT,
  month_year      TEXT    NOT NULL,
  approved_by     INTEGER REFERENCES users(id),
  approval_status TEXT    NOT NULL DEFAULT 'Pending' CHECK(approval_status IN ('Pending','Approved','Rejected')),
  is_deleted      INTEGER NOT NULL DEFAULT 0,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_by      INTEGER REFERENCES users(id),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month    ON expenses(month_year);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(expense_date);
