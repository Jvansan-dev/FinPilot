-- Adicione estas colunas na sua tabela de usuários (ex: users)
ALTER TABLE users 
ADD COLUMN plan_type VARCHAR(20) DEFAULT 'free', -- 'free' ou 'premium'
ADD COLUMN gateway_customer_id VARCHAR(100),     -- ID do cliente no Stripe/Mercado Pago
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active'; -- 'active', 'past_due', 'canceled'