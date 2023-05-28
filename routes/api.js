const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

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

router.get(
  '/isAuth',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

// User routes
router.get(
  '/users/:userid',
  passport.authenticate('jwt', { session: false }),
  userController.profile
);
router.get(
  '/users/:userid/friends',
  passport.authenticate('jwt', { session: false }),
  userController.friends
);
router.get(
  '/users/:userid/likedPosts',
  passport.authenticate('jwt', { session: false }),
  userController.likedPosts
);
router.get(
  '/users/:userid/requests',
  passport.authenticate('jwt', { session: false }),
  userController.friendRequests
);
router.get(
  '/users/:userid/posts',
  passport.authenticate('jwt', { session: false }),
  userController.posts
);
router.post(
  '/users/:userid/editProfile',
  passport.authenticate('jwt', { session: false }),
  userController.updateProfile
);
router.get(
  '/users/:userid/getMutuals',
  passport.authenticate('jwt', { session: false }),
  userController.getMutuals
);

// Post routes
router.get(
  '/posts/:postid',
  passport.authenticate('jwt', { session: false }),
  postController.getPost
);
router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  postController.addPost
);
module.exports = router;
