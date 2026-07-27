import { pool } from '../config/db.js';

export async function listAccounts(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req, res, next) {
  try {
    const { nome, tipo, saldo_inicial = 0, cor } = req.body;
    if (!nome || !tipo) {
      return res.status(400).json({ error: 'nome e tipo são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO accounts (user_id, nome, tipo, saldo_inicial, cor)
       VALUES ($1, $2, $3, $4, COALESCE($5, '#4F46E5')) RETURNING *`,
      [req.userId, nome, tipo, saldo_inicial, cor]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { nome, tipo, saldo_inicial, cor } = req.body;

    const result = await pool.query(
      `UPDATE accounts SET
         nome = COALESCE($1, nome),
         tipo = COALESCE($2, tipo),
         saldo_inicial = COALESCE($3, saldo_inicial),
         cor = COALESCE($4, cor)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [nome, tipo, saldo_inicial, cor, id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
