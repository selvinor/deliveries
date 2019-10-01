'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/users');

// ===== Define and create basicStrategy =====
const localStrategy = new LocalStrategy((userId, password, done) => {
  let user;
  User.findOne({ userId })
    .then(results => {
      user = results;
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect userId',
          location: 'userId'
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user.toObject());
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});

module.exports = localStrategy;
