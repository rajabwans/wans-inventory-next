-- WANPLAN Database Schema for Supabase
-- Multi-tenant SaaS inventory system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table (multi-tenant root)
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  currency TEXT DEFAULT 'UGX',
  logo TEXT,
  about TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'pending',
  paid_until TIMESTAMP,
  upgrade_requested BOOLEAN DEFAULT FALSE,
  upgrade_note TEXT,
  upgrade_proof TEXT,
  upgrade_requested_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, username)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  name TEXT NOT NULL,
  kind TEXT DEFAULT 'product',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, kind, name)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  publisher TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  buying_price REAL DEFAULT 0,
  selling_price REAL DEFAULT 0,
  notes TEXT,
  expiry_date TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT,
  quantity_sold INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_amount REAL NOT NULL,
  profit REAL NOT NULL,
  payment_status TEXT DEFAULT 'paid',
  amount_paid REAL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  due_date TEXT,
  sale_date TIMESTAMP DEFAULT NOW()
);

-- Sale payments table (payment ledger)
CREATE TABLE IF NOT EXISTS sale_payments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  amount REAL NOT NULL,
  method TEXT DEFAULT 'cash',
  note TEXT,
  recorded_by INTEGER REFERENCES users(id),
  paid_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchases table (procurement)
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  total_amount REAL DEFAULT 0,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  purchase_id INTEGER NOT NULL REFERENCES purchases(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost REAL DEFAULT 0,
  line_total REAL DEFAULT 0,
  expiry_date TEXT
);

-- Sale returns table
CREATE TABLE IF NOT EXISTS sale_returns (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  sale_id INTEGER NOT NULL REFERENCES sales(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_sold INTEGER DEFAULT 0,
  quantity_returned INTEGER NOT NULL,
  refund_amount REAL DEFAULT 0,
  reason TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Till closures table
CREATE TABLE IF NOT EXISTS till_closures (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  close_date TEXT NOT NULL,
  cash_counted REAL DEFAULT 0,
  momo_counted REAL DEFAULT 0,
  card_counted REAL DEFAULT 0,
  note TEXT,
  closed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product batches table (FEFO inventory tracking)
CREATE TABLE IF NOT EXISTS product_batches (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  expiry_date TEXT,
  received_date TIMESTAMP DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  source_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  user_id INTEGER REFERENCES users(id),
  expense_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  adjustment_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL DEFAULT 1 REFERENCES businesses(id),
  user_id INTEGER REFERENCES users(id),
  username TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_business_id ON audit_log(business_id);

-- Seed default business
INSERT INTO businesses (name, slug, status, is_active, trial_ends_at)
VALUES ('WANS COLLECTION', 'wans', 'active', TRUE, NOW() + INTERVAL '7 days')
ON CONFLICT (slug) DO NOTHING;

-- Seed default admin user (password: admin123)
-- Note: In production, this should be hashed properly
INSERT INTO users (business_id, username, password_hash, full_name, role)
VALUES (1, 'admin', '$2b$12$EQymdo9n7X.cegEApun2c.AzlCG4NMIOqSwK7.yufskXH.VYTvMNy', 'Administrator', 'superadmin')
ON CONFLICT (business_id, username) DO NOTHING;

-- Seed default categories for WANS business
INSERT INTO categories (business_id, name, kind) VALUES
(1, 'Perfumes', 'product'),
(1, 'Scented Oils', 'product'),
(1, 'Toys', 'product'),
(1, 'Womens Bags', 'product'),
(1, 'Suitcases', 'product'),
(1, 'Rent', 'expense'),
(1, 'Utilities', 'expense'),
(1, 'Transport', 'expense'),
(1, 'Salaries', 'expense'),
(1, 'Marketing', 'expense'),
(1, 'Other', 'expense')
ON CONFLICT (business_id, kind, name) DO NOTHING;
