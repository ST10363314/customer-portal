CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100),
  id_number VARCHAR(20),
  account_number VARCHAR(30),
  password_hash TEXT
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount NUMERIC(10,2),
  currency VARCHAR(5),
  provider VARCHAR(50),
  payee_account VARCHAR(30),
  swift_code VARCHAR(11)
);
