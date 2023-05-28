const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

function isSameUser(requestingUser, loggedInUser) {
  return requestingUser === loggedInUser;
}

exports.profile = async (req, res) => {
  try {
    const [user, posts] = await Promise.all([
      User.findById(req.params.userid).exec(),
      Post.find({ author: req.params.userid }).exec(),
    ]);
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    if (!user) {
      return res.status(400).send('User not found');
    }
    return res.status(200).send({
      user,
      posts,
      sameUser,
    });
  } catch (err) {
    return res.status(404).send({ message: 'User not found' });
  }
};
exports.friends = async (req, res) => {
  try {
    const user = await User.findById(req.params.userid)
      .populate('friends')
      .exec();
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    const { friends } = user;
    return res.status(200).send({ friends, sameUser });
  } catch (err) {
    console.log(err);
    return res.status(404).send({ message: 'There are no friends' });
  }
};
exports.likedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.userid)
      .populate('likes')
      .exec();
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    const { likes } = user;
    return res.status(200).send({ likes, sameUser });
  } catch (err) {
    return res.status(404).send({ message: ' No liked posts' });
  }
};
exports.friendRequests = async (req, res) => {
  if (req.user.user._id !== req.params.userid) {
    return res
      .status(403)
      .send('You are not allowed to see others friend requests');
  }
  try {
    const user = await User.findById(req.params.userid)
      .populate('requests')
      .exec();
    const { requests } = user;
    return res.status(200).send({ requests });
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.posts = async (req, res) => {
  try {
    const user = await User.findById(req.params.userid).populate('posts').exec();
    if (!user) {
      return res.status(400).send('User not found');
    }
    const { posts } = user;
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    return res.status(200).send({ posts, sameUser });
  } catch (err) {
    console.log(err);
    return res.status(403).send('Something went wrong');
  }
};
