-- Schema PostgreSQL — Controle Financeiro
-- Já preparado com user_id em todas as tabelas para facilitar migração multi-tenant

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    plano VARCHAR(20) NOT NULL DEFAULT 'free',
    reset_token_hash VARCHAR(64),
    reset_token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('carteira', 'conta_corrente', 'poupanca', 'cartao_credito', 'investimento')),
    saldo_inicial NUMERIC(14,2) NOT NULL DEFAULT 0,
    cor VARCHAR(7) DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome VARCHAR(60) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    cor VARCHAR(7) DEFAULT '#6B7280',
    icone VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    valor NUMERIC(14,2) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao VARCHAR(255),
    data DATE NOT NULL,
    recorrente BOOLEAN NOT NULL DEFAULT false,
    recorrencia_intervalo VARCHAR(20), -- 'mensal', 'semanal', 'anual'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    valor_limite NUMERIC(14,2) NOT NULL,
    periodo VARCHAR(10) NOT NULL DEFAULT 'mensal' CHECK (periodo IN ('mensal', 'anual')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, category_id, periodo)
);

CREATE INDEX idx_transactions_user_data ON transactions(user_id, data);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_users_reset_token ON users(reset_token_hash);
