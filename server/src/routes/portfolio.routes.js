
const express = require('express');
const { getPortfolio, addHolding } = require('../controllers/portfolio.controller');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply the verifyToken middleware to all routes in this file
router.use(verifyToken);

router.get('/', getPortfolio);
router.post('/holdings', addHolding);

module.exports = router;