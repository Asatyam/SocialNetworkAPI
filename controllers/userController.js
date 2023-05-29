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
      Post.find({ author: req.params.userid }).sort({ date: -1 }).exec(),
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
exports.sendRequest = async (req, res) => {
  try {
    if (req.user.user._id === req.params.userid) {
      return res.status(402).send('You cannot send friend request to yourself');
    }
    const sentUser = await User.findById(req.params.userid).exec();
    const user = await User.findById(req.user.user._id).exec();
    const alreadyFriend = user.friends.indexOf(req.params.userid);
    if (alreadyFriend !== -1) {
      return res.status(402).send('You are already friends');
    }
    const requestAlreadySent = sentUser.requests.indexOf(req.user.user._id);
    if (requestAlreadySent !== -1) {
      return res.status(402).send('You have already sent the request');
    }
    sentUser.requests.push(req.user.user._id);
    await sentUser.save();
    return res.status(200).send('Request successfully sent');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.acceptRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.user._id).exec();
    const requestingUser = await User.findById(req.params.userid).exec();
    const indexOfrequest = user.requests.indexOf(req.params.userid);
    if (indexOfrequest !== -1) {
      user.friends.push(req.params.userid);
      requestingUser.friends.push(req.user.user._id);
      user.requests.splice(indexOfrequest, 1);
      await user.save();
      await requestingUser.save();
      return res.status(200).send('accepted request successfully');
    }
    return res
      .status(403)
      .send('Cannot accept friend request of user not in requests');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.removeFriend = async (req, res) => {
  try {
    const [currUser, liveUser] = await Promise.all([
      User.findById(req.user.user._id),
      User.findById(req.params.userid),
    ]);
    const index1 = currUser.friends.indexOf(liveUser._id);
    const index2 = liveUser.friends.indexOf(currUser._id);
    if (index1 !== -1 && index2 !== -1) {
      currUser.friends.splice(index1, 1);
      liveUser.friends.splice(index2, 1);
      await currUser.save();
      await liveUser.save();
      return res.status(200).send('Remvoed friend');
    }
    return res.status(404).send('You are not friends with the user');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.rejectRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.user._id).exec();
    const isRequest = user.requests.indexOf(req.params.userid);
    if (isRequest !== -1) {
      user.requests.splice(isRequest, 1);
      await user.save();
      return res.status(200).send('Rejected friend request');
    }
    return res.status(404).send('User is not in your request list');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.cancelRequest = async (req, res) => {
  try {
    const requestedUser = await User.findById(req.params.userid).exec();
    const isRequest = requestedUser.requests.indexOf(req.user.user._id);
    if (isRequest !== -1) {
      requestedUser.requests.splice(isRequest, 1);
      await requestedUser.save();
      return res.status(200).send('Cancelled friend request');
    }
    return res.status(404).send('No previous request');
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
exports.sentRequests = async (req, res) => {
  try {
    const sentRequests = await User.find({
      requests: req.user.user._id,
    }).exec();
    return res.status(200).send({ sentRequests });
  } catch (err) {
    return res.status(404).send('Something went wrong');
  }
};
// Completed all the user related get routes
// Remaining to do:
// - Delete user
// - Update more user details
// - Maybe even more settings like facebook
// - See user's sent requests ✅
