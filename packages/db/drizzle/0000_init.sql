CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password_hash TEXT NOT NULL,
  tier VARCHAR(32) NOT NULL DEFAULT 'solo',
  monthly_volume_usdc NUMERIC(18, 7) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key VARCHAR(56) NOT NULL UNIQUE,
  encrypted_secret TEXT NOT NULL,
  trustline_ready BOOLEAN NOT NULL DEFAULT FALSE,
  anchor_kyc_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  amount_usdc NUMERIC(18, 7),
  memo VARCHAR(28),
  label VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(64) NOT NULL UNIQUE,
  sender_address VARCHAR(56) NOT NULL,
  amount_usdc NUMERIC(18, 7) NOT NULL,
  memo VARCHAR(28),
  stellar_created_at TIMESTAMPTZ NOT NULL,
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(32) NOT NULL,
  anchor_session_id VARCHAR(128) NOT NULL,
  amount_usdc NUMERIC(18, 7) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  redirect_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS indexer_cursors (
  wallet_id UUID PRIMARY KEY REFERENCES wallets(id) ON DELETE CASCADE,
  paging_token TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anchor_health (
  provider VARCHAR(32) PRIMARY KEY,
  status VARCHAR(16) NOT NULL DEFAULT 'healthy',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fail_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stellar_created_at ON transactions(stellar_created_at);
