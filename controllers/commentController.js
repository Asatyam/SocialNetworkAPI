const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

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
