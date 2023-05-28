const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.profile = async (req, res) => {
  try {
    let sameUser = false;

    const [user, posts] = await Promise.all([
      User.findById(req.params.userid).exec(),
      Post.find({ author: req.params.userid }).exec(),
    ]);
    if (user._id.toString() === req.user.user._id) {
      sameUser = true;
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
    const { friends } = user;
    return res.status(200).send({ friends });
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
    const { likes } = user;
    return res.status(200).send({ likes });
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
