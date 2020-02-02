'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Driver = require('../models/drivers');
const Pickup = require('../models/pickups');
const Delivery = require('../models/deliveries');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Driver.find()
  .populate('pickupVendor', 'vendorName vendorLocation vendorPhone orders')
  .populate('pickups', 'pickupDate pickupTimeSlot depot pickupStatus updatedAt')
  .populate('deliveries', 'deliveryDate depot zone deliveryStatus order updatedAt')
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

  Driver.findOne({ _id: id })
  .populate({
    path: 'pickups',
    select: 'pickupDate pickupTimeSlot depot pickupStatus updatedAt',
    populate: { 
      path: 'pickupVendor', 
      select: 'vendorName vendorLocation vendorPhone', 
      populate: {
        path: 'orders',
        select: 'orderNumber orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
      }
    }
  })
  .populate({
    path: 'deliveries',
    select: 'deliveryDate zone depot deliveryStatus updatedAt',
    populate: {
      path: 'order',
      select: 'orderNumber orderDescription orderSize  destination.recipient destination.phone  destination.businessName  destination.streetAddress  destination.city  destination.state  destination.zipcode  destination.instructions',
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
  const { driverName, driverPhone, driverVehicleMake, driverVehicleModel, driverVehiclePlate } = req.body;
  const userId = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!driverName) {
    const err = new Error('Missing `driverName` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!driverPhone) {
    const err = new Error('Missing `driverPhone` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!driverVehicleMake) {
    const err = new Error('Missing `driverVehicleMake` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!driverVehicleModel) {
    const err = new Error('Missing `driverVehicleModel` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (!driverVehiclePlate) {
    const err = new Error('Missing `driverVehiclePlate` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newDriver = {  userId, driverName, driverPhone, driverVehicleMake, driverVehicleModel, driverVehiclePlate };
// console.log('newDriver: ', newDriver);
  Driver.create(newDriver).then(result => {
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
  // const { id } = req.params;
  const id = req.params.id;
  const updateDriver = {};
  const updateFields = ['driverName', 'driverPhone', 'driverVehicleMake', 'driverVehicleModel', 'driverVehiclePlate', 'deliveries', 'pickups']
  updateFields.forEach(field => {
    if (field in req.body) {
      updateDriver[field] = req.body[field];
    }
  });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Driver.findOneAndUpdate( {_id: id}, updateDriver,   { $push: { driver: updateDriver } })
  .then(result => {
    if (result) {
      res.json(result);
    } else {
      next();
    }
  })
  .catch(err => {
    if (err.name === 'MongoError' && err.code === 11000) {
      err = new Error('Driver Vehicle Plate already exists');
      err.status = 400;
      return next(err);
    } 
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

  const driverRemovePromise = Driver.findOneAndDelete({ _id: id, userId });
  const pickupUpdatePromise = Pickup.updateOne({ pickupDriver: id, userId }, { $pull: { pickupDriver: id } })
  const deliveryUpdatePromise = Delivery.updateOne({deliveryDriver: id, userId }, { $pull: { deliveryDriver: id }})

  Promise.all([driverRemovePromise, pickupUpdatePromise, deliveryUpdatePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;