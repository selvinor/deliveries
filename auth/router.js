'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const createAuthToken = function(merchant) {
  return jwt.sign({merchant}, config.JWT_SECRET, {
    subject: merchant.merchant,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());
// The merchant provides a merchant and password to login
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.merchant.serialize());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

// The merchant exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.merchant);
  res.json({authToken});
});

module.exports = {router};
