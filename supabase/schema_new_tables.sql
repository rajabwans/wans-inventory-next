-- Additional WANPLAN tables (run in Supabase SQL editor)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS amount_paid REAL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS due_date TEXT;

CREATE TABLE IF NOT EXISTS sale_payments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  amount REAL NOT NULL,
  method TEXT DEFAULT 'cash',
  note TEXT,
  recorded_by INTEGER,
  paid_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  supplier_id INTEGER REFERENCES suppliers(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  total_amount REAL DEFAULT 0,
  note TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost REAL DEFAULT 0,
  line_total REAL DEFAULT 0,
  expiry_date TEXT
);

CREATE TABLE IF NOT EXISTS sale_returns (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_sold INTEGER DEFAULT 0,
  quantity_returned INTEGER NOT NULL,
  refund_amount REAL DEFAULT 0,
  reason TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS till_closures (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  close_date TEXT NOT NULL,
  cash_counted REAL DEFAULT 0,
  momo_counted REAL DEFAULT 0,
  card_counted REAL DEFAULT 0,
  note TEXT,
  closed_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_batches (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  expiry_date TEXT,
  received_date TIMESTAMP DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  source_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_payments_sale_id ON sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_sale_returns_sale_id ON sale_returns(sale_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_product_id ON product_batches(product_id);