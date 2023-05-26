const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  content: { type: String, required: true, default: '' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  image: { type: String },
});

module.exports = mongoose.model('Post', PostSchema);
