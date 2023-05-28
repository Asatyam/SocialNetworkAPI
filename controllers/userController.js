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
