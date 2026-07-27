import { Router } from 'express';
import { listBudgets, upsertBudget, deleteBudget } from '../controllers/budgets.controller.js';

const router = Router();

router.get('/', listBudgets);
router.post('/', upsertBudget);
router.delete('/:id', deleteBudget);

export default router;
