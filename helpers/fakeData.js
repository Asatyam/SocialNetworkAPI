/* eslint-disable no-await-in-loop */
const faker = require('@faker-js/faker').fakerEN;
const User = require('../models/User');
const Post = require('../models/Post');
require('dotenv').config();

const populateDB = async () => {
  const testUser = await User.findById(process.env.TEST_USER_ID);
  if (!testUser) return;

  for (let i = 0; i < 10; i++) {
    const user = new User({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      image_url: faker.image.avatar(),
      password: faker.internet.password(),
    });
    for (let j = 0; j < 20; j++) {
      const post = await Post.create({
        content: faker.lorem.paragraph(),
        author: user.id,
      });
      console.log(`adding post no ${j + 1}`);
      user.posts.push(post);
    }
    testUser.friends.push(user.id);
    user.friends.push(testUser.id);
    await user.save();
    console.log(`adding user ${i + 1}`);
  }
  await testUser.save();
};
module.exports = populateDB;
