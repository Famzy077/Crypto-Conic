const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const passport = require('passport');
const {  verifyToken  } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// 1. The route to start the Google login process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. The callback route that Google redirects to
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user;
    
    // Create our application's JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect the user back to the frontend dashboard with the token
    res.redirect(`https://crypto-conic.vercel.app/dashboard?token=${token}`);
  }
);

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

module.exports = router;