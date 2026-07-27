import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Provedores hospedados (Supabase, Neon, Render, etc.) exigem conexão via SSL.
// Em desenvolvimento local com Postgres na própria máquina, SSL geralmente não é usado.
const useSSL = process.env.DATABASE_SSL !== 'false';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do Postgres', err);
});
