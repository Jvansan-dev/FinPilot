-- Adiciona suporte a "esqueci minha senha"
-- Rode este arquivo no banco que já está em produção (Supabase), via SQL Editor ou psql.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token_hash);
