'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Order = require('../models/orders');
const Pickup = require('../models/pickups');
const Vendor = require('../models/vendors');
const Delivery = require('../models/deliveries');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */

router.get('/', (req, res, next) => {
  const { searchTerm, vendorId } = req.query;
  const userId = req.user.id;
  let filter = {};

  if (searchTerm) {
    // filter.orderNumber = { $regex: searchTerm, $options: 'i' };
    filter.orderNumber = searchTerm;
  }

  if (vendorId) {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      const err = new Error('The `vendor id` is not valid');
      err.status = 400;
      return next(err);
    }
    filter.vendorId = vendorId;
  }
// console.log('filter: ', filter);
  Order.find(filter)
    .populate('pickupDetails', 'vendorName phone')
    .populate('vendor' , 'vendorLocation vendorName vendorPhone')
    .populate('pickup',  'pickupDate pickupTimeSlot pickupStatus  pickupDriver createdAt updatedAt')
    .populate('delivery' ,'zone deliveryDate deliveryStatus deliveryDriver createdAt updatedAt')
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

  Order.findOne({ _id: id })
  .populate('pickupDetails', 'vendorName phone')
  .populate('vendor' , 'vendorLocation vendorName vendorPhone')
  .populate('pickup',  'pickupDate pickupTimeSlot pickupStatus  pickupDriver createdAt updatedAt')
  .populate('delivery' ,'zone deliveryDate deliveryStatus deliveryDriver createdAt updatedAt')
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
  const { userId, vendor, orderDate, deliveryDate, orderNumber, destination, pickup, delivery } = req.body;
  const user = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!orderNumber) {
    const err = new Error('Missing `orderNumber` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!destination) {
    const err = new Error('Missing `destination` in request body');
    err.status = 400;
    return next(err);
  }

  if (vendor && !mongoose.Types.Object.isValid(vendor)) {
    const err = new Error('The `vendor` is not valid');
    err.status = 400;
    return next(err);
  }

  if (userId && !mongoose.Types.Object.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }

  const newOrder = { userId, vendor, orderDate, orderDetails, orderStatus, orderSize, deliveryDate, orderNumber, destination, pickup, delivery };
// console.log('newOrder: ', newOrder);
  Order.create(newOrder) //
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result); //
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;
  const updateOrder = {};
  const updateFields = [
    'orderDate', 
    'pickupDetails',
    'deliveryDate', 
    'orderNumber', 
    'orderDetails',
    'orderStatus',
    'orderSize',
    'destination.geocode.coordinates', 
    'destination.businessName', 
    'destination.streetAddress', 
    'destination.city', 
    'destination.state', 
    'destination.zipcode', 
    'destination.instructions', 
    'destination.recipient', 
    'destination.contactPhone'
  ]
//  console.log('req.body: ', req.body);
  updateFields.forEach(field => {
    if (field in req.body) {
      updateOrder[field] = req.body[field];
    }
  });
  // console.log('updateOrder: ', updateOrder);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Order.findByIdAndUpdate( {_id: id}, updateOrder,   { $push: { order: updateOrder } })
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

  const orderRemovePromise = Order.findByIdAndRemove({ _id: id, userId });
  const vendorUpdatePromise = Vendor.update({  "orders": id, userId }, { "$pull": { orders: id } })
  const deliveryUpdatePromise = Delivery.update({ "order": id, userId }, { $pull: { order: id } })

  Promise.all([orderRemovePromise, vendorUpdatePromise])
  // Promise.all([orderRemovePromise, vendorUpdatePromise, pickupUpdatePromise, deliveryUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});
module.exports = router;