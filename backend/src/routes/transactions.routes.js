const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const auth = require('../middleware/auth');
const checkUsageLimit = require('../middleware/subscription'); // Novo middleware

// Todas as rotas precisam de autenticação
router.use(auth);

// Rotas de leitura e edição (sem limite)
router.get('/', transactionsController.getAll);
router.get('/:id', transactionsController.getById);
router.put('/:id', transactionsController.update);
router.delete('/:id', transactionsController.remove);

// Rota de criação (com verificação de limite freemium)
router.post('/', checkUsageLimit, transactionsController.create);

module.exports = router;