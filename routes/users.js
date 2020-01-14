'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {merchant} = require('./models');

const router = express.Router();
router.get('/', (req, res, next) => {
  User.find()
    .then(result => {
      return res
      .status(200)
      .json(result);
    })
    .catch(err => {
      next(err);
    });
});
/* ========== GET/READ A SINGLE ITEM ========== */

router.get('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  User.findOne({ _id: id })
  .populate({
    path: 'vendor', 
    select: 'vendorName vendorLocation vendorPhone', 
    populate: {
      path: 'orders',
      select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      populate: {
        path: 'pickup',
        select: 'pickupStatus updatedAt' 
      }
    }
  })
  .populate({
    path: 'vendor', 
    populate: {
      path: 'orders',
      populate: {
        path: 'delivery',
        select: 'deliveryStatus updatedAt' 
      }
    }
  })
  .populate({
    path: 'driver', 
    select: 'driverName driverPhone',
    populate: {
      path: 'pickups',
      select: 'pickupDate pickupTimeSlot pickupStatus updatedAt',
      populate: { 
        path: 'pickupVendor', 
        select: 'vendorName vendorLocation vendorPhone', 
        populate: {
          path: 'orders',
          select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
        }
      }
    }
  })
  .populate({
    path: 'driver', 
    populate: {
      path: 'pickups',
      populate: { 
        path: 'depot', 
        select: 'depotName', 
      }
    }
  })
  .populate({
    path: 'driver', 
    populate: {
      path: 'deliveries',
      select: 'deliveryDate depot deliveryStatus updatedAt',
      populate: {
        path: 'orders',
        select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    }
  })

  .populate({
    path: 'depot', 
    select: 'depotName streetAddress city state zipcode geocode.coordinates phone', 
    populate: {
      path: 'zones',
      select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
    }
  })
  .populate({
    path: 'depot', 
    populate: {
      path: 'drivers', 
      populate: {
        path: 'deliveries',
        select: 'deliveryDate depot deliveryStatus updatedAt',
        populate: {
          path: 'orders',
          select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
        }
      }
    }
  })
  .populate({
    path: 'depot', 
    populate: {
      path: 'drivers', 
      populate: {
        path: 'pickups',
        select: 'pickupDate pickupTimeSlot depot pickupStatus updatedAt',
        populate: { 
          path: 'pickupVendor', 
          select: 'vendorName vendorLocation vendorPhone', 
          populate: {
            path: 'orders',
            select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
          }
        }
      }
    }
  })
  .populate({
    path: 'depot',  
    populate: {
      path: 'pickups', 
      select: 'pickupDate depot pickupTimeSlot pickupStatus pickupDriver updatedAt',
      populate: {
        path: 'pickupVendor',
        select: 'vendorName vendorLocation vendorPhone', 
        populate: {
          path: 'orders',
          select: 'orderNumber orderDescription orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions'
        }
      }
    }
  })
  .populate({
    path: 'depot',  
    populate: {
      path: 'deliveries',
      select: 'deliveryDate depot zone deliveryStatus updatedAt',
      populate: {
        path: 'order',
        select: 'orderNumber orderDescription orderSize vendor destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
        populate: { 
          path: 'vendor', 
          select: 'vendorName vendorLocation vendorPhone'
        }
      }
    }
  })
  .populate({
    path: 'depot',  
    populate: {
      path: 'deliveries',
      populate: {
        path: 'deliveryDriver',
        select: 'driverName driverStatus updatedAt'
      }
    }
  })
  .populate({
    path: 'depot',  
    populate: {
      path: 'deliveries',
      populate: {
        path: 'zone',
        select: 'zoneName'
      }
    }
  })

  .populate({
    path: 'depot',  
    populate: {
      path: 'vendors',
      select: 'vendorName vendorLocation.streetAddress vendorLocation.streetAddress vendorLocation.city vendorLocation.state vendorLocation.zipcode vendorPhone',
      populate: {
        path: 'orders',
        select: 'orderNumber orderDescription orderStatus orderSize  destination.recipient destination.recipientPhone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    }
  })
  .then(result => {
    return res
    .status(200)
    .json(result);
  })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  const { username, email, password  } = req.body;
  const requiredFields = ['username', 'email', 'password'];
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

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        email,
        password: digest
      };
      return User.create(newUser);
    })
    .then(hash => {
      return merchant.create({
        merchant,
        password: hash,
        firstName,
        businessName
      });
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
        err.reason = 'ValidationError';
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const user = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(user)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  User.findByAndDelete(user)
    .then(() => {

      res.sendStatus(204);
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
