'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Delivery = require('../models/deliveries');
const Depot = require('../models/depots');
const Driver = require('../models/drivers');
const Vendor = require('../models/vendors');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Delivery.find()
  .populate('depot', 'depotName')
  .populate('deliveryDriver', 'driverName driverPhone')
  .populate('vendor')
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
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Delivery.findOne({ _id: id })
  .populate('depot', 'depotName')
  .populate('deliveryDriver', 'driverName driverPhone')
  .populate('vendor')
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
    const err = new Error('Missing `delivery` in request body');
    err.status = 400;
    return next(err);
  }

  Delivery.create(req.body).then(result => {
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
  // const { id } = req.params;
  const id = req.params.id;
  const updateDelivery = {};
  const updateFields = ['depotName', 'streetAddress', 'city', 'state', 'zipcode', 'zones', 'deliveries, vendors']

  updateFields.forEach(field => {
    if (field in req.body) {
      updateDelivery[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Delivery.findByIdAndUpdate( {_id: id}, updateDelivery,   { $push: { delivery: updateDelivery } })
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
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const depotRemovePromise = Depot.findByIdAndRemove({ _id: id, userId });
  const driverUpdatePromise = Driver.update({ depot: id, userId }, { $pull: { depot: id } })
  const vendorUpdatePromise = Vendor.update({depot: id, userId }, { $pull: { depot: id }})
  const deliveryUpdatePromise = Delivery.update({depot: id, userId }, { $pull: { depot: id }})
  const zoneUpdatePromise = Zone.update({depot: id, userId }, { $pull: { depot: id }})

  // Promise.all([depotRemovePromise , deliveryUpdatePromise, driverUpdatePromise, vendorUpdatePromise, zoneUpdatePromise ])
  Promise.all([depotRemovePromise  ])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});

module.exports = router;