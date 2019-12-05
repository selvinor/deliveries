'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Vendor = require('../models/vendors');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Vendor.find()
  // .populate('pickups', 'pickupDate status updatedAt')
  // .populate('deliveries', 'deliveryDate status updatedAt')
  .populate('orders', 'vendorOrderRef orderDate deliveryDate pickup delivery') 
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
  .populate('orders', 'vendorOrderRef destination pickup delivery')
  // .populate('pickups', 'pickupDate status driver')
  // .populate('deliveries', 'deliveryDate status driver')
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
  const { vendorName, streetAddress, city, state, zipcode, geocode, phone, pickups, deliveries, orders } = req.body;
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

  const newVendor = {  user, vendorName, streetAddress, city, state, zipcode, geocode, phone, pickups, deliveries, orders };
// console.log('newVendor: ', newVendor);
  Vendor.create(req.body).then(result => {
    res
      .location(`${req.originalUrl}/${result.id}`)
      .status(201)
      .json(result);
  })
    .catch(err => {
      next(err);
    });
}); 
/* ========== GET/READ A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;

  const updateVendor = {};
  const updateFields = ['geocode.coordinates', 'vendorName', 'streetAddress', 'city', 'state', 'zipcode', 'geocode', 'phone', 'pickups', 'deliveries', 'orders']
  updateFields.forEach(field => {
    if (field in req.body) {
      updateVendor[field] = req.body[field];
    }
  });

  if (!mongoose.Types.Object.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Vendor.findByAndUpdate(id, updateVendor,   { $push: { vendors: updateVendor } })
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

  Vendor.deleteOne({ _id: id, user })
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