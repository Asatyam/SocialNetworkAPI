/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable-next-line consistent-return */
const bcryptjs = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

require('dotenv').config();

module.exports = function setUpPassport(passport) {
  passport.serializeUser((user, done) => {
    console.log('working');
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
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ email: username });
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
      }
    )
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
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:4000/api/auth/facebook/callback',
        profileFields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'picture.type(album)',
        ],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const picture = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`;
          let user = await User.findOne({ facebook_id: profile.id });
          console.log({ profile, picture });
          if (!user) {
            user = new User({
              first_name: profile._json.first_name,
              last_name: profile._json.last_name,
              facebook_id: profile.id,
              email: profile.emails ? profile.emails[0].value : '',
              image_url: picture,
            });
            await user.save();
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
