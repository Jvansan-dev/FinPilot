const db = require('../config/db'); // Ajuste para o seu arquivo de conexão

const checkUsageLimit = async (req, res, next) => {
  try {
    const userId = req.user.id; // Injetado pelo middleware de autenticação (auth.js)
    const FREE_PLAN_LIMIT = 50;

    // 1. Busca os dados do plano do usuário
    const [userRows] = await db.query(
      'SELECT plan_type, subscription_status FROM users WHERE id = ?', 
      [userId]
    );

    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 2. Se for premium e estiver ativo, libera o acesso imediatamente
    if (user.plan_type === 'premium' && user.subscription_status === 'active') {
      return next();
    }

    // 3. Se for plano gratuito, verifica o limite de transações no mês atual
    const [countRows] = await db.query(`
      SELECT COUNT(*) as total_transactions 
      FROM transactions 
      WHERE user_id = ? 
      AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `, [userId]);

    const currentUsage = countRows[0].total_transactions;

    // 4. Bloqueia se atingiu o limite
    if (currentUsage >= FREE_PLAN_LIMIT) {
      return res.status(403).json({ 
        error: 'LIMIT_REACHED', 
        message: 'Você atingiu o limite do plano gratuito. Faça o upgrade para continuar.' 
      });
    }

    // Se não atingiu o limite, permite a criação
    next();
  } catch (error) {
    console.error('Erro ao verificar limite de uso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = checkUsageLimit;