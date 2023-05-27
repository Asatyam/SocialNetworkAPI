const express = require('express');
// const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();
router.get('/', authController.index);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
module.exports = router;
