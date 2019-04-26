'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {merchant} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new merchant
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['merchant', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['merchant', 'password', 'firstName', 'businessName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the merchant and password aren't trimmed we give an error.  merchants might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the merchants know what's happening, rather than silently
  // trimming them and expecting the merchant to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['merchant', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    merchant: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {merchant, password, firstName = '', businessName = ''} = req.body;
  // merchant and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  businessName = businessName.trim();

  return merchant.find({merchant})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing merchant with the same merchant
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'merchant already taken',
          location: 'merchant'
        });
      }
      // If there is no existing merchant, hash the password
      return merchant.hashPassword(password);
    })
    .then(hash => {
      return merchant.create({
        merchant,
        password: hash,
        firstName,
        businessName
      });
    })
    .then(merchant => {
      return res.status(201).json(merchant.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// // Never expose all your merchants like below in a prod application
// // we're just doing this so we have a quick way to see
// // if we're creating merchants. keep in mind, you can also
// // verify this in the Mongo shell.
// router.get('/', (req, res) => {
//   return merchant.find()
//     .then(merchants => res.json(merchants.map(merchant => merchant.serialize())))
//     .catch(err => res.status(500).json({message: 'Internal server error'}));
// });

module.exports = {router};
