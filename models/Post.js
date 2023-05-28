const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  content: { type: String, required: true, default: '' },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String },
  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model('Post', PostSchema);
