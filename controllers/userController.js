const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');

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
    const [user, posts] = await Promise.all([
      User.findById(req.params.userid).exec(),
      Post.find({ author: req.params.userid }).exec(),
    ]);
    if (!user) {
      return res.status(400).send('User not found');
    }
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    return res.status(200).send({ posts, sameUser });
  } catch (err) {
    console.log(err);
    return res.status(403).send('Something went wrong');
  }
};
exports.updateProfile = [
  body('first_name').trim().notEmpty().escape(),

  body('last_name').trim().notEmpty().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.params.userid);
      const sameUser = isSameUser(user._id.toString(), req.user.user._id);
      if (!sameUser) {
        return res.status(403).send('You are not authorized');
      }
      const updatedUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      };
      await User.findOneAndUpdate(
        { _id: req.user.user._id },
        { $set: updatedUser }
      );
      return res.status(200).send('User updated successfully');
    } catch (err) {
      return res.status(404).send('User not found');
    }
  },
];
exports.getMutuals = async (req, res) => {
  try {
    const user = await User.findById(req.params.userid)
      .populate('friends')
      .exec();
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    if (!sameUser) {
      return res.status(403).send('You are not authorized');
    }
    const { friends } = user;
    const mutuals = [];
    for (let i = 0; i < friends.length; i++) {
      const currFriend = friends[i];
      for (let j = 0; j < currFriend.friends.length; j++) {
        const mutual = currFriend.friends[j].toString();
        if (mutual !== user._id.toString() && !friends.includes(mutual)) {
          mutuals.push(mutual);
          break;
        }
      }
    }
    return res.send(mutuals);
  } catch (err) {
    console.log(err);
    return res.status(404).send('User not found');
  }
};

// Completed all the user related get routes
// Remaining to do:
// - Delete user
// - Update more user details
// - Maybe even more settings like facebook
