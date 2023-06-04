/* eslint-disable operator-linebreak */
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const User = require('../models/User');
const Post = require('../models/Post');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  folder: 'demo',
  allowedFormats: ['jpg', 'jpeg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
});
const parser = multer({ storage });

function isSameUser(requestingUser, loggedInUser) {
  return requestingUser === loggedInUser;
}
function shuffle(original) {
  const array = [...original];
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
exports.users = async (req, res) => {
  try {
    const users = await User.find({}).exec();
    return res.status(200).send({ users });
  } catch (err) {
    console.log(err);
    return res.status(404).send({ message: 'Something went wrong' });
  }
};
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
  parser.single('file'),

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
      console.log(req.file);
      const updatedUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        image_url:
          typeof req.file === 'undefined' ? user.image_url : req.file.path,
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
exports.deletePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.params.userid).exec();
    console.log(user);
    const sameUser = isSameUser(user._id.toString(), req.user.user._id);
    if (!sameUser) {
      return res.status(401).send('You are not authorized');
    }
    user.image_url = '';
    console.log(user.image_url);
    await user.save();
    return res.status(200).send({ message: 'Removed profile photo' });
  } catch (err) {
    console.log(err);
    return res.status(404).send('Something went wrong');
  }
};
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
    const users = await User.find({}).exec();
    const friendsid = friends.map((friend) => friend._id.toString());
    const valid = users.filter((u) => {
      const condition =
        u._id.toString() === req.user.user._id ||
        friendsid.includes(u._id.toString());
      if (condition) {
        return false;
      }
      return true;
    });
    const shuffled = shuffle(valid);
    let i = 0;
    while (mutuals.length < 10 && typeof valid[i] !== 'undefined') {
      mutuals.push(shuffled[i++]);
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
