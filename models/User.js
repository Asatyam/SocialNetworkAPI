const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String },
  password: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  first_name: { type: String },
  last_name: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  facebook_id: { type: String, default: '' },
  image_url: { type: String, default: '' },
});

module.exports = mongoose.model('User', UserSchema);
