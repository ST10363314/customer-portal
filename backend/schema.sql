-- =========================
-- customer-portal schema
-- =========================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(80)  NOT NULL,
  id_number      CHAR(13)     NOT NULL,
  account_number VARCHAR(20)  NOT NULL,
  password_hash  TEXT         NOT NULL,   -- bcrypt hash
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (id_number),
  UNIQUE (account_number)
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (full_name);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id            SERIAL PRIMARY KEY,
  customer_id   INTEGER,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency      CHAR(3)       NOT NULL,
  provider      VARCHAR(16)   NOT NULL,   -- SWIFT/SEPA/ACH
  payee_account VARCHAR(18)   NOT NULL,
  payee_swift   VARCHAR(11)   NOT NULL,
  status        VARCHAR(12)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','submitted')),
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Ensure missing columns exist if table was created earlier
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS customer_id INTEGER;
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS currency CHAR(3);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS provider VARCHAR(16);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payee_account VARCHAR(18);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payee_swift VARCHAR(11);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS status VARCHAR(12);
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Add FK now that customers exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_tx_customer'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT fk_tx_customer
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_tx_customer ON transactions (customer_id);

-- Employees (seeded; NO registration in app)
CREATE TABLE IF NOT EXISTS employees (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(64)  UNIQUE NOT NULL,
  email         VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,   -- bcrypt hash
  role          VARCHAR(20)  NOT NULL DEFAULT 'employee' CHECK (role IN ('employee','admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees (username);

-- Seed employees
INSERT INTO employees (username, email, password_hash, role) VALUES
('Jane Supervisor', 'jane.supervisor@bank.com', '$2b$12$4k7YdeNf2O7J3rG3gqk3b.Vp6bRFZ8u8Qq7zj7z0qgkO/4Cqs3fNi', 'admin'),
('Thabo Clerk',     'thabo.clerk@bank.com',     '$2b$12$4k7YdeNf2O7J3rG3gqk3b.Vp6bRFZ8u8Qq7zj7z0qgkO/4Cqs3fNi', 'employee')
ON CONFLICT DO NOTHING;


-- node -e "console.log(require('bcrypt').hashSync('Aa1!abcd',12))"
INSERT INTO customers (full_name, id_number, account_number, password_hash) VALUES
('Test User', '9001011234567', '1234567890', '$2b$12$y0uRPlAcehOlDerHAshxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
ON CONFLICT DO NOTHING;