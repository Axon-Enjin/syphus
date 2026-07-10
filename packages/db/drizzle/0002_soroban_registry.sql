-- PRD-F9: Soroban registry on-chain status fields
ALTER TABLE payment_links
  ADD COLUMN IF NOT EXISTS register_tx_hash varchar(64),
  ADD COLUMN IF NOT EXISTS on_chain_status varchar(16) NOT NULL DEFAULT 'skipped';

ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS register_tx_hash varchar(64),
  ADD COLUMN IF NOT EXISTS on_chain_status varchar(16) NOT NULL DEFAULT 'skipped';
