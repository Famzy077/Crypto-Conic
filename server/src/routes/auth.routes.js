const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// 1. The route to start the Google login process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. The callback route that Google redirects to
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // At this point, `req.user` is the user object from our database
    const user = req.user;
    
    // Create our application's JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect the user back to the frontend dashboard with the token
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

router.post('/register', register);
router.post('/login', login);

module.exports = router;