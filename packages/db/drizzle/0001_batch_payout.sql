CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  item_count INTEGER NOT NULL DEFAULT 0,
  total_usdc NUMERIC(18, 7) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255) NOT NULL,
  destination_address VARCHAR(56) NOT NULL,
  amount_usdc NUMERIC(18, 7) NOT NULL,
  memo VARCHAR(28),
  sep7_uri TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  transaction_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS batches_user_id_idx ON batches(user_id);
CREATE INDEX IF NOT EXISTS batch_items_batch_id_idx ON batch_items(batch_id);
