const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String },
  password: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  first_name: { type: String },
  last_name: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  facebook_id: { type: String, default: '' },
  image_url: { type: String, default: '' },
});
UserSchema.virtual('full_name').get(function fullName() {
  return `${this.first_name} ${this.last_name}`;
});
module.exports = mongoose.model('User', UserSchema);
