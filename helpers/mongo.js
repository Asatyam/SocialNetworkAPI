const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const mongoDb = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.zomngs9.mongodb.net/social_network?retryWrites=true&w=majority`;

    mongoose.set('strictQuery', false);
    mongoose.connect(mongoDb, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongo connection error'));
  } catch (err) {
    console.log(err);
  }
};
