const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptions.controller');
const auth = require('../middleware/auth'); // Protege a rota

router.post('/create-checkout', auth, subscriptionsController.createCheckoutSession);

module.exports = router;