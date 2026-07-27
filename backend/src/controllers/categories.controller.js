import { pool } from '../config/db.js';

export async function listCategories(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY nome',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { nome, tipo, cor, icone } = req.body;
    if (!nome || !tipo) {
      return res.status(400).json({ error: 'nome e tipo são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, nome, tipo, cor, icone)
       VALUES ($1, $2, $3, COALESCE($4, '#6B7280'), $5) RETURNING *`,
      [req.userId, nome, tipo, cor, icone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
