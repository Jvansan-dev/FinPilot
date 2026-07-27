import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import budgetsRoutes from './routes/budgets.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/accounts', authMiddleware, accountsRoutes);
app.use('/api/categories', authMiddleware, categoriesRoutes);
app.use('/api/transactions', authMiddleware, transactionsRoutes);
app.use('/api/budgets', authMiddleware, budgetsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
