'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Driver = require('../models/drivers');

const router = express.Router();

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Driver.find()
  .populate('pickups', 'pickupDate status updatedAt')
  .populate('deliveries', 'deliveryDate status updatedAt')
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
  // .populate('orders', 'vendorOrderRef destination pickup delivery')
  .populate('pickups', 'pickupDate status driver')
  .populate('deliveries', 'deliveryDate status driver')
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
  const user = req.user.id;
  
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
  
  const newDriver = {  user, driverName, driverPhone, driverVehicleMake, driverVehicleModel, driverVehiclePlate };
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
/* ========== GET/READ A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const user = req.user.id;
  
  /***** Never trust users - validate input *****/
  if (!driverName) {
    const err = new Error('Missing `driverName` in request body');
    err.status = 400;
    return next(err);
  }

  const updateDriver = {};
  const updateFields = ['driverName', 'driverPhone', 'driverVehicleMake', 'driverVehicleModel', 'driverVehiclePlate', 'deliveries', 'orders']
  updateFields.forEach(field => {
    if (field in req.body) {
      updateDriver[field] = req.body[field];
    }
  });

  if (!mongoose.Types.Object.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Driver.findByAndUpdate(id, updateDriver,   { $push: { drivers: updateDriver } })
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
  Driver.findByIdAndUpdate( {_id: id}, updateDriver,   { $push: { driver: updateDriver } })
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

  Driver.deleteOne({ _id: id, user })
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