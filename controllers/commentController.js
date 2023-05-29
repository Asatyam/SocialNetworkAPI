const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postid })
      .populate('author likes')
      .exec();

    return res.status(200).send({ comments });
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.postComment = [
  body('content', 'comment cannot be empty').trim().notEmpty().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const post = await Post.findById(req.params.postid).exec();
      if (!post) {
        return res.status(404).send('Post does not exist');
      }
      const comment = new Comment({
        content: req.body.content,
        author: req.user.user._id,
        post: req.params.postid,
      });
      await comment.save();
      return res
        .status(200)
        .send({ message: 'Comment added successfuly', comment });
    } catch (err) {
      return res.status(402).send('Something went wrong');
    }
  },
];
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentid).exec();
    const sameUser = req.user.user._id === comment.author.toString();
    if (!sameUser) {
      return res.status(403).send('You are not authorized');
    }
    await Comment.findByIdAndDelete(req.params.commentid).exec();
    return res.status(200).send('Comment deleted successfully');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.likeComment = async (req, res) => {
  try {
    const [comment, user] = await Promise.all([
      Comment.findById(req.params.commentid).exec(),
      User.findById(req.user.user._id).exec(),
    ]);
    const userIndex = comment.likes.indexOf(user._id);
    if (userIndex === -1) {
      comment.likes.push(req.user.user._id);
      await comment.save();
      return res.status(200).send('Liked comment successfully');
    }

    return res.status(402).send('Already liked the comment');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.unlikeComment = async (req, res) => {
  try {
    const [comment, user] = await Promise.all([
      Comment.findById(req.params.commentid).exec(),
      User.findById(req.user.user._id).exec(),
    ]);
    if (!comment) {
      return res.status(404).send('comment not found');
    }
    const userIndex = comment.likes.indexOf(user._id);
    if (userIndex !== -1) {
      comment.likes.splice(userIndex, 1);
      await comment.save();
      return res.status(200).send('Unliked comment successfully');
    }
    return res.status(200).send('Something is not right');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
// Features remaining to implement
// - Reply on comments
// - likes on replies
// - sort comment by likes and date
