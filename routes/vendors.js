'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Vendor = require('../models/vendors');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Vendor.find()
  .populate('pickups', 'pickupDate pickupStatus updatedAt')
  .populate('deliveries', 'deliveryDate deliveryStatus updatedAt')
  .populate('orders', 'orderNumber orderDate deliveryDate pickup delivery') 
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

  Vendor.findOne({ _id: id })
  .populate('pickups', 'pickupDate pickupStatus updatedAt')
  .populate('deliveries', 'deliveryDate deliveryStatus updatedAt')
  .populate('orders', 'orderNumber orderDate deliveryDate pickup delivery') 
  .then(result => {
    return res
    .status(200)
    .json(result);
})
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { userId, vendorName, streetAddress, city, state, zipcode, geocode, phone, orders } = req.body;
  const user = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!vendorName) {
    const err = new Error('Missing `vendorName` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newVendor = {  userId, vendorName, streetAddress, city, state, zipcode, geocode, phone, orders };
// console.log('newVendor: ', newVendor);
  Vendor.create(newVendor)
  .then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  })
    .catch(err => {
      next(err);
    });
}); 

router.put('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;
  const updateVendor = {};
  const updateFields = ['geocode', 'vendorName', 'streetAddress', 'city', 'state', 'zipcode', 'phone', 'pickup', 'delivery', 'order']
//  console.log('req.body: ', req.body);
  updateFields.forEach(field => {
    if (field in req.body) {
      updateVendor[field] = req.body[field];
    }
  });
  // console.log('updateVendor: ', updateVendor);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Vendor.findByIdAndUpdate( {_id: id}, updateVendor,   { $push: { vendor: updateVendor } })
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
  });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.Object.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (userId && !mongoose.Types.Object.isValid(userId)) {
    const err = new Error('The `user` is not valid');
    err.status = 400;
    return next(err);
  }

  Vendor.findByIdAndRemove({ _id: id })
    .then(result => {
      if (result.n) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;