import { Router } from 'express';
import {
    listTransactions, createTransaction, updateTransaction, deleteTransaction,
} from '../controllers/transactions.controller.js';
import { checkUsageLimit } from '../middleware/subscription.js';

const router = Router();

// Rotas de leitura e edição (sem limite)
router.get('/', listTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

// Rota de criação (com verificação de limite freemium)
router.post('/', checkUsageLimit, createTransaction);

export default router;