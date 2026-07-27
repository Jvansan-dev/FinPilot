import { Router } from 'express';
import {
  listTransactions, createTransaction, updateTransaction, deleteTransaction,
} from '../controllers/transactions.controller.js';

const router = Router();

router.get('/', listTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
