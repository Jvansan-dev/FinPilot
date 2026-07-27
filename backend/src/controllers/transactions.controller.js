import { pool } from '../config/db.js';

export async function listTransactions(req, res, next) {
  try {
    const { mes, ano, category_id, account_id } = req.query;

    const conditions = ['user_id = $1'];
    const values = [req.userId];
    let idx = 2;

    if (mes && ano) {
      conditions.push(`EXTRACT(MONTH FROM data) = $${idx} AND EXTRACT(YEAR FROM data) = $${idx + 1}`);
      values.push(mes, ano);
      idx += 2;
    }
    if (category_id) {
      conditions.push(`category_id = $${idx}`);
      values.push(category_id);
      idx += 1;
    }
    if (account_id) {
      conditions.push(`account_id = $${idx}`);
      values.push(account_id);
      idx += 1;
    }

    const result = await pool.query(
      `SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY data DESC, created_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req, res, next) {
  try {
    const {
      account_id, category_id, valor, tipo, descricao, data,
      recorrente = false, recorrencia_intervalo,
    } = req.body;

    if (!account_id || !valor || !tipo || !data) {
      return res.status(400).json({ error: 'account_id, valor, tipo e data são obrigatórios' });
    }

    const accountCheck = await pool.query(
      'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
      [account_id, req.userId]
    );
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    if (category_id) {
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category_id, req.userId]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
    }

    const result = await pool.query(
      `INSERT INTO transactions
         (user_id, account_id, category_id, valor, tipo, descricao, data, recorrente, recorrencia_intervalo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.userId, account_id, category_id, valor, tipo, descricao, data, recorrente, recorrencia_intervalo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const { account_id, category_id, valor, tipo, descricao, data } = req.body;

    if (account_id) {
      const accountCheck = await pool.query(
        'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
        [account_id, req.userId]
      );
      if (accountCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
    }

    if (category_id) {
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category_id, req.userId]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
    }

    const result = await pool.query(
      `UPDATE transactions SET
         account_id = COALESCE($1, account_id),
         category_id = COALESCE($2, category_id),
         valor = COALESCE($3, valor),
         tipo = COALESCE($4, tipo),
         descricao = COALESCE($5, descricao),
         data = COALESCE($6, data)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [account_id, category_id, valor, tipo, descricao, data, id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Transação não encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
