'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/users');

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
      path: 'vendor',   //user is a Vendor so populate the vendor's orders data
      select: 'vendorName vendorLocation vendorPhone',
      populate: {
        path: 'orders',
        select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
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
      path: 'driver', //user is a Driver so populate the Driver's Pickups and Deliveries 
      select: 'driverName driverPhone',
      populate: {
        path: 'pickups',
        select: 'pickupDate pickupTimeSlot pickupStatus updatedAt',
        populate: {
          path: 'pickupVendor',
          select: 'vendorName vendorLocation vendorPhone',
          populate: {
            path: 'orders',
            select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
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
          path: 'order',
          select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
        }
      }
    })

    .populate({
      path: 'depot', //user is a Depot so populate the Depot's Zones, Pickups, Deliveries and Drivers 
      select: 'depotName streetAddress city state zipcode geocode.coordinates phone',
      populate: {
        path: 'zones',
        select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    })
    .populate({
      path: 'depot',
      populate: {
        path: 'drivers',
        populate: {
          path: 'deliveries',
          select: 'deliveryDate deliveryStatus updatedAt'
        }
      }
    })
    .populate({
      path: 'depot',
      populate: {
        path: 'drivers',
        populate: {
          path: 'deliveries',
          populate: {
            path: 'order',
            select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions'
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
              select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions'
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
            select: 'orderNumber orderStatus orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions'
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
          select: 'orderNumber orderStatus orderDescription orderSize vendor destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
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
          select: 'orderNumber orderStatus orderDescription  orderSize destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
        }
      }
    })
    .populate({
      path: 'depot',
      populate: {
        path: 'vendors',
        populate: {
          path: 'orders',
          populate: {
            path: 'vendor',
            select: 'vendorName  vendorPhone' 
          }
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
  const { username, email, password } = req.body;
  const requiredFields = ['username', 'email', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'email', 'password'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  const explicitlyTrimmedFields = ['username', 'email', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(
      `Field: '${nonTrimmedField}' cannot start or end with whitespace`
    );
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 }
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

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(
      `Field: '${tooSmallField}' must be at least ${min} characters long`
    );
    err.status = 422;
    return next(err);
  }

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(
      `Field: '${tooLargeField}' must be at most ${max} characters long`
    );
    err.status = 422;
    return next(err);
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
    .then(result => {
      return res
        .status(201)
        .location(`/api/users/${result.id}`)
        .json(result);
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
      next(err);
    });
});

module.exports = router;