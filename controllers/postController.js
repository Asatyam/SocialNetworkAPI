const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getPost = async (req, res) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findById(req.params.postid).populate('author likes').exec(),
      Comment.find({ post: req.params.id }).exec(),
    ]);
    return res.status(200).send({ post, comments });
  } catch (err) {
    console.log(err);
    return res.status(404).send('Post was not found');
  }
};
