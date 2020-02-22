'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Pickup = require('../models/pickups');
const Vendor = require('../models/vendors');
const Order = require('../models/orders');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Pickup.find()
  .populate('pickupDriver', 'name driverPhone')
  .populate({
    path: 'depot', 
    select: 'name'
  })
  .populate({
    path: 'pickupVendor', 
    select: 'name vendorLocation vendorPhone',
    populate: {
      path: 'orders',
      select: 'orderNumber orderDescription orderSize deliveryDate destination'
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

/* ========== GET/READ A SINGLE ITEM ========== */

router.get('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Pickup.findOne({ _id: id })
  .populate('pickupDriver', 'name driverPhone')
  .populate({
    path: 'depot', 
    select: 'name'
  })
  .populate({
    path: 'pickupVendor', 
    select: 'name vendorLocation vendorPhone',
    populate: {
      path: 'orders',
      select: 'orderNumber orderDescription orderSize deliveryDate destination'
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  if (!req.body) {
    const err = new Error('Missing `pickup` in request body');
    err.status = 400;
    return next(err);
  }

  Pickup.create(req.body).then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  })
    .catch(err => {
      next(err);
    });
}); 
/* ========== UPDATE A SINGLE ITEM ========== */

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updatePickup = {};
  const updateFields = ['depot', 'pickupDriver', 'zone']

  updateFields.forEach(field => {
    if (field in req.body) {
      updatePickup[field] = req.body[field];
    }
  });
  let updateStatus = null;
  let updateParms = null;
  console.log('pickups put req.body:', req.body);

  if ('pickupStatus' in req.body) {
    updateStatus = req.body['pickupStatus'];
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
console.log('pickups put updateStatus:', updateStatus);
  if (updateStatus !== null) {
    Pickup.findByIdAndUpdate( 
      {_id: id}, { $push: { pickupStatus: updateStatus, new: true} })
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
  } else {
    Pickup.findByIdAndUpdate( 
      {_id: id}, updatePickup, { new: true })
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
  }
});

router.delete('/:id', (req, res, next) => {
  // const { id } = req.params;
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
//  When deleting Pickup, remove pointer on the Vendor, Driver and Depot
  const pickupRemovePromise = Pickup.findByIdAndRemove({ _id: id, userId });
  const vendorUpdatePromise = Vendor.update({ pickups: id, userId }, { $pull: { pickups: id } })
  Promise.all([pickupRemovePromise, vendorUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});

module.exports = router;