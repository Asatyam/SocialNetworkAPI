const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getPost = async (req, res) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findById(req.params.postid).populate('author likes').exec(),
      Comment.find({ post: req.params.postid }).exec(),
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
exports.likePost = async (req, res) => {
  try {
    const [post, user] = await Promise.all([
      Post.findById(req.params.postid).exec(),
      User.findById(req.user.user._id).exec(),
    ]);
    const userIndex = post.likes.indexOf(user._id);
    if (userIndex === -1) {
      post.likes.push(req.user.user._id);
      user.likes.push(post._id);
      console.log(post._id);
      await post.save();
      await user.save();
      return res.status(200).send('Liked post successfully');
    }

    return res.status(402).send('Already liked the post');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.unlikePost = async (req, res) => {
  try {
    const [post, user] = await Promise.all([
      Post.findById(req.params.postid).exec(),
      User.findById(req.user.user._id).exec(),
    ]);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    const userIndex = post.likes.indexOf(user._id);
    const postIndex = user.likes.indexOf(post._id);
    if (userIndex !== -1 && postIndex !== -1) {
      user.likes.splice(postIndex, 1);
      post.likes.splice(userIndex, 1);
      await post.save();
      await user.save();
      return res.status(200).send('Unliked post successfully');
    }
    return res.status(200).send('Something is not right');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
// add image
