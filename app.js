/* eslint-disable comma-dangle */
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const connectDB = require('./helpers/mongo');
require('dotenv').config();

const app = express();
const setUpPassport = require('./helpers/passport');

connectDB();

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
setUpPassport(passport);
app.use(passport.initialize());
app.use(passport.session());
