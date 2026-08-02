import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, forgotPassword, resetPassword,
  verifyEmail, resendVerification,
} from '../controllers/auth.controller.js';

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

// Limita pedidos de redefinição de senha para evitar spam de e-mails
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
});

// Limita reenvio de e-mail de confirmação para evitar spam de e-mails
const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações. Tente novamente em alguns minutos.' },
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);

export default router;
