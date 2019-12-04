'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Order = require('../models/orders');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */

router.get('/', (req, res, next) => {
  const { searchTerm, vendorId } = req.query;
  const userId = req.user.id;
  let filter = {};

  if (searchTerm) {
    // filter.vendorOrderRef = { $regex: searchTerm, $options: 'i' };
    filter.vendorOrderRef = searchTerm;
  }

  if (vendorId) {
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      const err = new Error('The `vendor id` is not valid');
      err.status = 400;
      return next(err);
    }
    filter.vendorId = vendorId;
  }
  // if (userId) {
  //   filter.userId = userId;
  // }
console.log('filter: ', filter);
  return Order.find(filter)
    .populate('vendor', 'vendorName phone')
    .populate('pickup', 'pickupDate status driver')
    .populate('delivery', 'deliveryDate status driver')
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
  .populate('vendor', 'vendorName phone')
  .populate('pickup', 'pickupDate status driver')
  .populate('delivery', 'deliveryDate status driver')
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
  const { userId, vendor, orderDate, deliveryDate, vendorOrderRef, destination, pickup, delivery } = req.body;
  const user = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!vendorOrderRef) {
    const err = new Error('Missing `vendorOrderRef` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!destination) {
    const err = new Error('Missing `destination` in request body');
    err.status = 400;
    return next(err);
  }

  // if (vendor && !mongoose.Types.Object.isValid(vendor)) {
  //   const err = new Error('The `vendor` is not valid');
  //   err.status = 400;
  //   return next(err);
  // }
  // console.log('req.user', req.user);
  // if (userId && !mongoose.Types.Object.isValid(userId)) {
  //   const err = new Error('The `user` is not valid');
  //   err.status = 400;
  //   return next(err);
  // }

  const newOrder = { userId, vendor, orderDate, deliveryDate, vendorOrderRef, destination, pickup, delivery };
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
  const { id } = req.params;
  const { title, content, driver } = req.body;
  const updateOrder = {};
  const updateFields = ['orderDate', 'deliveryDate', 'vendorOrderRef', 'destination', 'pickup', 'delivery']

  updateFields.forEach(field => {
    if (field in req.body) {
      updateOrder[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (vendor && !mongoose.Types.Object.isValid(vendor)) {
    const err = new Error('The `vendor` is not valid');
    err.status = 400;
    return next(err);
  }
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

  if (!vendorOrderRef) {
    const err = new Error('Missing `vendorOrderRef` in request body');
    err.status = 400;
    return next(err);
  }

  Order.findByAndUpdate(id, updateOrder, { new: true })
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
  const user = req.user.id;

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

  Order.deleteOne({ _id: id, userId })
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