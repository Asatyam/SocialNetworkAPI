const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/', authController.index);
router.post('/signup', authController.signup);

router.get('/auth/facebook', passport.authenticate('facebook-login'));
router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook-login', {
    failureRedirect: '/api',
    scope: ['email'],
  }),
  (req, res) => {
    res.redirect('/api');
  }
);

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
