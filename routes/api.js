const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/', authController.index);
router.post('/signup', authController.signup);

router.get(
  '/auth/facebook',
  passport.authenticate('facebook-login', { session: false })
);

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook-login', {
    failureRedirect: '/api/failure',
    failureFlash: true,
    successRedirect: '/api/success',
  }),
  // eslint-disable-next-line no-unused-vars
  (err, req, res, next) => {
    if (err) res.redirect('/api/failure');
    next();
  },
  (err, req, res) => {
    if (err) {
      res.redirect('/api');
    }
    res.redirect('/api/success');
  }
);
router.get('/success', (req, res) => {
  res.send('logged in facebook successfully');
});
router.get('/failure', (req, res) => {
  res.send('Failed to login');
});
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
