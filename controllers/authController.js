const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');

exports.signup = [
  body('first_name').trim().notEmpty().escape(),

  body('last_name').trim().notEmpty().escape(),

  body('email')
    .trim()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        return Promise.reject(new Error('Email already in use'));
      }
      return true;
    })
    .notEmpty()
    .isEmail()
    .withMessage('Enter a valid email')
    .normalizeEmail({
      all_lowercase: true,
    }),
  body('password')
    .trim()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be of 8 characters with 1 lowercase, 1 uppercase, 1 number and 1 special symbols'
    ),
  body('confirm')
    .trim()
    .custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        res.send(err);
        return;
      }
      try {
        const user = new User({
          email: req.body.email,
          password: hashedPassword,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
        });
        await user.save();
        req.login(user, (err) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).json({ message: 'User created', user });
          }
        });
      } catch (err) {
        // eslint-disable-next-line consistent-return
        return next(err);
      }
    });
  },
];
