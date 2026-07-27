import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN_LENGTH = 8;

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
    const result = await pool.query(
      `INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3)
       RETURNING id, nome, email, plano, created_at`,
      [nome, emailNormalizado, senhaHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
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

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, nome: user.nome, email: user.email, plano: user.plano },
      token,
    });
  } catch (err) {
    next(err);
  }
}
