
const express = require('express');
const { getPortfolio, addHolding, deleteHolding } = require('../controllers/portfolio.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply the verifyToken middleware to all routes in this file
router.use(verifyToken);

router.get('/', getPortfolio);
router.post('/holdings', addHolding);
router.delete('/holdings/:id', deleteHolding);

module.exports = router;