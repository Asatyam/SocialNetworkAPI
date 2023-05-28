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
exports.addPost = [
  body('content', 'content cannot be empty').trim().notEmpty().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = new Post({
        content: req.body.content,
        author: req.user.user._id,
      });
      await post.save();
      return res.status(200).send('post added successfully');
    } catch (err) {
      console.log(err);
      return res.status(403).send('Something went wrong');
    }
  },
];
exports.updatePost = [
  body('content', 'content cannot be empty').trim().notEmpty().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.postid);
      const sameUser = req.user.user._id === post.author.toString();
      if (!sameUser) {
        return res.status(403).send('You are not authorized');
      }
      await Post.findByIdAndUpdate(req.params.postid, {
        $set: { content: req.body.content },
      });
      return res.status(200).send('post updated successfully');
    } catch (err) {
      console.log(err);
      return res.status(403).send('Something went wrong');
    }
  },
];
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid).exec();
    const sameUser = req.user.user._id === post.author.toString();
    if (!sameUser) {
      return res.status(403).send('You are not authorized');
    }
    await Post.findByIdAndDelete(req.params.postid).exec();
    return res.status(200).send('Post deleted succesfully');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
