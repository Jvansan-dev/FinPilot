import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// Limita tentativas de login para dificultar ataques de força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

// Limita criação de contas para dificultar abuso/spam de cadastro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' },
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

export default router;
