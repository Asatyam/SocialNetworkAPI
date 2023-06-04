const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

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
router.post(
  '/logout',
  passport.authenticate('jwt', { session: false }),
  authController.logout
);

router.get(
  '/isAuth',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

// User routes
router.get(
  '/feed',
  passport.authenticate('jwt', { session: false }),
  postController.feed
);
router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  userController.users
);
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
  '/users/:userid/mutuals',
  passport.authenticate('jwt', { session: false }),
  userController.getMutuals
);
router.patch(
  '/users/:userid/sendRequest',
  passport.authenticate('jwt', { session: false }),
  userController.sendRequest
);
router.patch(
  '/users/:userid/acceptRequest',
  passport.authenticate('jwt', { session: false }),
  userController.acceptRequest
);
router.patch(
  '/users/:userid/removeFriend',
  passport.authenticate('jwt', { session: false }),
  userController.removeFriend
);
router.patch(
  '/users/:userid/rejectRequest',
  passport.authenticate('jwt', { session: false }),
  userController.rejectRequest
);
router.patch(
  '/users/:userid/cancelRequest',
  passport.authenticate('jwt', { session: false }),
  userController.cancelRequest
);
router.get(
  '/users/:userid/sentRequests',
  passport.authenticate('jwt', { session: false }),
  userController.sentRequests
);
router.patch(
  '/users/:userid/deletePhoto',
  passport.authenticate('jwt', { session: false }),
  userController.deletePhoto
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
router.patch(
  '/posts/:postid',
  passport.authenticate('jwt', { session: false }),
  postController.updatePost
);
router.delete(
  '/posts/:postid',
  passport.authenticate('jwt', { session: false }),
  postController.deletePost
);
router.patch(
  '/posts/:postid/like',
  passport.authenticate('jwt', { session: false }),
  postController.likePost
);
router.patch(
  '/posts/:postid/unlike',
  passport.authenticate('jwt', { session: false }),
  postController.unlikePost
);
// comment routes
router.get(
  '/posts/:postid/comments',
  passport.authenticate('jwt', { session: false }),
  commentController.getComments
);
router.post(
  '/posts/:postid/comments',
  passport.authenticate('jwt', { session: false }),
  commentController.postComment
);
router.delete(
  '/posts/:postid/comments/:commentid',
  passport.authenticate('jwt', { session: false }),
  commentController.deleteComment
);
router.patch(
  '/posts/:postid/comments/:commentid/like',
  passport.authenticate('jwt', { session: false }),
  commentController.likeComment
);
router.patch(
  '/posts/:postid/comments/:commentid/unlike',
  passport.authenticate('jwt', { session: false }),
  commentController.unlikeComment
);

module.exports = router;
