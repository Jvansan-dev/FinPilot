-- Adiciona suporte a confirmação de e-mail no cadastro.
-- Rode este arquivo no banco que já está em produção (Supabase), via SQL Editor ou psql.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token_hash);

-- Opcional: se você já tem usuários cadastrados e não quer forçar todos a
-- confirmarem o e-mail retroativamente, marque os existentes como verificados:
-- UPDATE users SET email_verificado = true WHERE created_at < now();
