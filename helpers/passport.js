/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable-next-line consistent-return */
const bcryptjs = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const FBStrategy = require('passport-facebook').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

require('dotenv').config();

module.exports = function setUpPassport(passport) {
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
    'local-login',
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
    'jwt',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET,
      },
      (jwtPayload, done) => done(null, jwtPayload)
    )
  );

  passport.use(
    'facebook-login',
    new FBStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:4000/login/facebook/callback',
        profileFields: [
          'id',
          'emails',
          'first_name',
          'last_name',
          'picture.type(medium)',
        ],
      },
      (accessToken, refreshToken, profile, done) => {
        const picture = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&acess_token=${accessToken}`;

        User.findOne({ facebook_id: profile.id }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            user = new User({
              facebook_id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.emails[0].value,
              image_url: picture,
            });
            user.save((err) => {
              if (err) console.log(err);
              return done(err, user);
            });
          } else {
            return done(err, user);
          }
        });
      }
    )
  );
};
