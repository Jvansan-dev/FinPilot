import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/mailer.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN_LENGTH = 8;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function gerarTokenVerificacao() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

async function enviarEmailVerificacao(user, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const linkVerificacao = `${frontendUrl}/verificar-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  try {
    await sendVerificationEmail(user.email, user.nome, linkVerificacao);
  } catch (emailErr) {
    // O cadastro não deve falhar por causa de um problema no envio do e-mail;
    // o usuário sempre pode pedir para reenviar a confirmação depois.
    console.error('Falha ao enviar e-mail de verificação:', emailErr);
  }
}

export async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    if (senha.length < SENHA_MIN_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no mínimo ${SENHA_MIN_LENGTH} caracteres` });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [emailNormalizado]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const { token, tokenHash, expiresAt } = gerarTokenVerificacao();

    const result = await pool.query(
      `INSERT INTO users (nome, email, senha_hash, verification_token_hash, verification_token_expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, plano, created_at`,
      [nome, emailNormalizado, senhaHash, tokenHash, expiresAt]
    );

    const user = result.rows[0];
    await enviarEmailVerificacao(user, token);

    // Sem token de acesso aqui de propósito: o login fica bloqueado até
    // o e-mail ser confirmado (ver função login abaixo).
    res.status(201).json({
      message: 'Conta criada! Enviamos um link de confirmação para o seu e-mail — confirme para poder entrar.',
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, nome, email, email_verificado FROM users WHERE email = $1',
      [emailNormalizado]
    );
    const user = result.rows[0];

    // Resposta genérica sempre, pra não revelar quais e-mails existem no sistema.
    const respostaGenerica = {
      message: 'Se esse e-mail estiver cadastrado e ainda não confirmado, vamos reenviar o link de confirmação.',
    };

    if (!user || user.email_verificado) {
      return res.json(respostaGenerica);
    }

    const { token, tokenHash, expiresAt } = gerarTokenVerificacao();
    await pool.query(
      'UPDATE users SET verification_token_hash = $1, verification_token_expires_at = $2 WHERE id = $3',
      [tokenHash, expiresAt, user.id]
    );
    await enviarEmailVerificacao(user, token);

    res.json(respostaGenerica);
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ error: 'email e token são obrigatórios' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT id FROM users
       WHERE email = $1 AND verification_token_hash = $2 AND verification_token_expires_at > now()`,
      [emailNormalizado, tokenHash]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo e-mail de confirmação.' });
    }

    await pool.query(
      `UPDATE users
       SET email_verificado = true, verification_token_hash = NULL, verification_token_expires_at = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({ message: 'E-mail confirmado com sucesso! Você já pode entrar.' });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'email e senha são obrigatórios' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailNormalizado]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.email_verificado) {
      return res.status(403).json({
        error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
        code: 'EMAIL_NAO_CONFIRMADO',
      });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, nome: user.nome, email: user.email, plano: user.plano },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const result = await pool.query('SELECT id, nome FROM users WHERE email = $1', [emailNormalizado]);
    const user = result.rows[0];

    // Mesma resposta exista ou não o e-mail, para não revelar quais e-mails estão cadastrados
    const respostaGenerica = {
      message: 'Se esse e-mail estiver cadastrado, você vai receber um link de redefinição de senha.',
    };

    if (!user) {
      return res.json(respostaGenerica);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      'UPDATE users SET reset_token_hash = $1, reset_token_expires_at = $2 WHERE id = $3',
      [tokenHash, expiresAt, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkRedefinicao = `${frontendUrl}/redefinir-senha?token=${token}&email=${encodeURIComponent(emailNormalizado)}`;

    try {
      await sendPasswordResetEmail(emailNormalizado, linkRedefinicao);
    } catch (emailErr) {
      // Nunca deixamos o erro de envio vazar pro cliente: além de ser um detalhe
      // interno, isso poderia ser usado para descobrir quais e-mails existem.
      console.error('Falha ao enviar e-mail de redefinição de senha:', emailErr);
    }

    res.json(respostaGenerica);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, token, novaSenha } = req.body;
    if (!email || !token || !novaSenha) {
      return res.status(400).json({ error: 'email, token e novaSenha são obrigatórios' });
    }

    if (novaSenha.length < SENHA_MIN_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no mínimo ${SENHA_MIN_LENGTH} caracteres` });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT id FROM users
       WHERE email = $1 AND reset_token_hash = $2 AND reset_token_expires_at > now()`,
      [emailNormalizado, tokenHash]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite uma nova redefinição de senha.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      'UPDATE users SET senha_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [senhaHash, user.id]
    );

    res.json({ message: 'Senha redefinida com sucesso. Você já pode entrar com a nova senha.' });
  } catch (err) {
    next(err);
  }
}
