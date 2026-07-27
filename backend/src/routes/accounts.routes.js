import { Router } from 'express';
import { listAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accounts.controller.js';

const router = Router();

router.get('/', listAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
