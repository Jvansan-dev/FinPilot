import { pool } from '../config/db.js';

const FREE_PLAN_LIMIT = 50;

// Limita a criação de transações pra quem está no plano gratuito.
export async function checkUsageLimit(req, res, next) {
  try {
    const userId = req.userId; // definido pelo authMiddleware (ver middleware/auth.js)

    const userResult = await pool.query(
      'SELECT plan_type, subscription_status FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se for premium e estiver ativo, libera o acesso imediatamente
    if (user.plan_type === 'premium' && user.subscription_status === 'active') {
      return next();
    }

    // Plano gratuito: verifica o limite de transações no mês atual
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM transactions
       WHERE user_id = $1
         AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );
    const currentUsage = countResult.rows[0].total;

    if (currentUsage >= FREE_PLAN_LIMIT) {
      return res.status(403).json({
        error: 'LIMIT_REACHED',
        message: 'Você atingiu o limite do plano gratuito. Faça o upgrade para continuar.',
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de uso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}