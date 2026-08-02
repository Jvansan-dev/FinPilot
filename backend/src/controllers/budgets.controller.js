import { pool } from '../config/db.js';

export async function listBudgets(req, res, next) {
  try {
    // Traz o orçamento junto com o total já gasto na categoria no período vigente
    const result = await pool.query(
      `SELECT
         b.*,
         c.nome AS categoria_nome,
         COALESCE((
           SELECT SUM(ABS(t.valor)) FROM transactions t
           WHERE t.category_id = b.category_id
             AND t.user_id = b.user_id
             AND t.tipo = 'despesa'
             AND date_trunc('month', t.data) = date_trunc('month', CURRENT_DATE)
         ), 0) AS gasto_atual
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.user_id = $1
       ORDER BY c.nome`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function upsertBudget(req, res, next) {
  try {
    const { category_id, valor_limite, periodo = 'mensal' } = req.body;
    if (!category_id || !valor_limite) {
      return res.status(400).json({ error: 'category_id e valor_limite são obrigatórios' });
    }

    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [category_id, req.userId]
    );
    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category_id, valor_limite, periodo)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, category_id, periodo)
       DO UPDATE SET valor_limite = EXCLUDED.valor_limite
       RETURNING *`,
      [req.userId, category_id, valor_limite, periodo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteBudget(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
