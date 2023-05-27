const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
// const passport = require('../helpers/passport');

const router = express.Router();
router.get('/', authController.index);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.post(
  '/login/facebook',
  passport.authenticate('facebook-login', {
    scope: ['email'],
    session: false,
  })
);
router.get(
  '/login/facebook/callback',
  passport.authenticate('facebook-login', {
    successRedirect: '/api',
    failureRedirect: '/api',
  })
);
module.exports = router;
