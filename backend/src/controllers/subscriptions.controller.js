const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db'); // Seu arquivo de conexão com o Supabase

const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id; // Vem do seu middleware auth.js

    // Busca o email do usuário no banco (ajuste a query conforme sua estrutura)
    const { rows } = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = rows[0]?.email;

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID, 
          quantity: 1,
        },
      ],
      // Para onde o usuário volta após pagar ou cancelar
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/planos`,
      // Envia o ID do usuário escondido para o Stripe. 
      // Isso será essencial no Webhook para sabermos quem pagou!
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    // Retorna a URL para o frontend redirecionar o usuário
    res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ error: 'Erro ao gerar link de pagamento' });
  }
};

module.exports = { createCheckoutSession };