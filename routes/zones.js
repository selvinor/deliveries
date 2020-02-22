'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Zone = require('../models/zones');
const Pickup = require('../models/pickups');
const Delivery = require('../models/deliveries');
const Driver = require('../models/drivers');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Zone.find()
  .populate(
    {
      path: 'pickups', 
      model: 'Pickup',
      select: 'pickupDate pickupTimeSlot pickupStatus ',
      populate: [{
        path: 'pickupDriver', 
        model: 'Driver', 
        select: 'name driverPhone'
      },
      {
        path: 'pickupVendor',
        model: 'Vendor',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
  .populate(
    {
      path: 'deliveries', 
      model: 'Delivery',
      select: 'deliveryDate  deliveryStatus ',
      populate: [{
        path: 'deliveryDriver', 
        model: 'Driver', 
        select: 'name driverPhone'
      },
      {
        path: 'order',
        model: 'Order',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
  .populate(
    {
      path: 'drivers', 
      model: 'Driver',
      select: 'name driverPhone',
      populate: [{
        path: 'pickups', 
        model: 'Pickup', 
        select: 'pickupDate pickupTimeSlot pickupStatus ',
        populate: [{
          path: 'pickupVendor',
          model: 'Vendor',
          select: 'name vendorLocation vendorPhone',
          populate: {
            path: 'orders',
            model: 'Order',
            select: 'orderNumber deliveryDate destination'
          }
        }]
        },
      {
        path: 'order',
        model: 'Order',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
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

  Zone.findOne({ _id: id })
  .populate(
    {
      path: 'pickups', 
      model: 'Pickup',
      select: 'pickupDate pickupTimeSlot pickupStatus ',
      populate: [{
        path: 'pickupDriver', 
        model: 'Driver', 
        select: 'name driverPhone'
      },
      {
        path: 'pickupVendor',
        model: 'Vendor',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
  .populate(
    {
      path: 'deliveries', 
      model: 'Delivery',
      select: 'deliveryDate  deliveryStatus ',
      populate: [{
        path: 'deliveryDriver', 
        model: 'Driver', 
        select: 'name driverPhone'
      },
      {
        path: 'order',
        model: 'Order',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
  .populate(
    {
      path: 'drivers', 
      model: 'Driver',
      select: 'name driverPhone',
      populate: [{
        path: 'pickups', 
        model: 'Pickup', 
        select: 'pickupDate pickupTimeSlot pickupStatus ',
        populate: [{
          path: 'pickupVendor',
          model: 'Vendor',
          select: 'name vendorLocation vendorPhone',
          populate: {
            path: 'orders',
            model: 'Order',
            select: 'orderNumber deliveryDate destination'
          }
        }]
        },
      {
        path: 'order',
        model: 'Order',
        select: 'name vendorLocation vendorPhone',
        populate: {
          path: 'orders',
          model: 'Order',
          select: 'orderNumber deliveryDate destination'
        }
      }]
    }
  )
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
    const err = new Error('Missing `Zone` in request body');
    err.status = 400;
    return next(err);
  }

  Zone.create(req.body).then(result => {
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
  const updateZone = {};
  const updateFields = ['zoneName', 'zoneBoundaries']
  updateFields.forEach(field => {
    if (field in req.body) {
      updateZone[field] = req.body[field];
    }
  });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Zone.findByIdAndUpdate( {_id: id}, updateZone,   { $push: { zone: updateZone } })
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

 const zoneRemovePromise = Zone.findByIdAndRemove({ _id: id, userId });
 const pickupUpdatePromise = Pickup.update({ pickups: id, userId }, { $pull: { pickups: id } })
 const deliveryUpdatePromise = Delivery.update({deliveries: id, userId }, { $pull: { deliveries: id }})
 const ddiversUpdatePromise = Driver.update({drivers: id, userId }, { $pull: { drivers: id }})

  Promise.all([zoneRemovePromise /* , pickupUpdatePromise,  deliveryUpdatePromise */])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
 
});

module.exports = router;