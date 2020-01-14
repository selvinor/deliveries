'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Pickup = require('../models/pickups');
const Vendor = require('../models/vendors');
const Order = require('../models/orders');
const Delivery = require('../models/deliveries');

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
  const { userId, vendorName, vendorLocation, vendorPhone, orders } = req.body;
  const user = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!vendorName) {
    const err = new Error('Missing `vendorName` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newVendor = {  userId, vendorName, vendorLocation, vendorPhone, orders };
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
  const updateFields = ['geocode', 'vendorName', 'vendorLocation.streetAddress', 'vendorLocation.city', 'vendorLocation.state', 'vendorLocation.zipcode', 'vendorPhone', 'pickup', 'delivery', 'order']
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
  // const { id } = req.params;
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const vendorRemovePromise = Vendor.findByIdAndRemove({ _id: id, userId });
  const ordersUpdatePromise = Order.update({ pickup: id, userId }, { $pull: { pickup: id } })
  const pickupUpdatePromise = Pickup.update({pickupVendor: id, userId }, { $pull: { pickupVendor: id }})
  const deliveryUpdatePromise = Delivery.update({deliveryVendor: id, userId }, { $pull: { deliveryVendor: id }})

  // Promise.all([vendorRemovePromise, orderUpdatePromise, pickupUpdatePromise, deliveryupUpdatePromise])
  Promise.all([vendorRemovePromise])
  // Promise.all([orderUpdatePromise])
  // Promise.all([pickupRemovePromise, vendorUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});

module.exports = router;