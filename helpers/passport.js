const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const FBStrategy = require('passport-facebook').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { messsage: 'User not found' });
      }
      bcryptjs.compare(password, user.password, (err, res) => {
        if (res) {
          return done(null, user);
        }
        return done(null, false, { message: 'Incorrect Password' });
      });
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    },
    (jwtPayload, done) => done(null, jwtPayload)
  )
);
