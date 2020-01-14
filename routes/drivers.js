'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Driver = require('../models/drivers');
const User = require('../models/users');
const Order = require('../models/orders');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, orderId } = req.query;
  const userId = req.user.id;

  let filter = {};

  if (searchTerm) {
    filter.driver = { $regex: searchTerm, $options: 'i' };
  }

  if (orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const err = new Error('The `order id` is not valid');
      err.status = 400;
      return next(err);
    }
    filter.orderId = orderId;
  }

  if (userId) {
    filter.userId = userId;
  }
  Driver.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results); 
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM by order Id and user Id in combo========== */
router.get('/:orderId', (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `user id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error('The `order id` is not valid');
    err.status = 400;
    return next(err);
  }

  Driver.findOne({ orderId: orderId, userId: userId })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(204).send();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { driver, orderId } = req.body;
  const userId = req.user.id;

  if (!driver) {
    const err = new Error('Missing `driver` in request body');
    err.status = 400;
    return next(err);
  }

  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error('The `order id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `user Id` is not valid');
    err.status = 400;
    return next(err);
  }

  const newDriver = { driver, orderId, userId };

  Driver.findOne({ orderId: orderId, userId: userId })  
    .then(result => {
      if (result) {
        const err = new Error('You have already posted a driver');
        err.status = 400;
        err.reason = 'ValidationError';
        return next(err);
      } else {
        Driver.create(newDriver)    
          .then(result => {
            Order.findOne({ _id: orderId })
              .then(order => {
                order.drivers.push(result.id);
                order.save((err,doc,numdocs)=>{
                  updateAvgDrivers(orderId, function() {
                    res
                      .location(`${req.originalUrl}/${result.id}`)
                      .status(201)
                      .json(result);
                  });
                }); 
              });              
            User.findOne({ _id: userId })
              .then(user => {
                user.drivers.push(result.id);
                user.save(); 
              });
          });
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:driverId', (req, res, next) => {
  const { driverId } = req.params;
  const { driver, orderId } = req.body;

  const updateDriver = {};
  const updateFields = ['driver', 'userId', 'orderId'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateDriver[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `driver id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error('The `orderId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (!driver) {
    const err = new Error('Missing `driver` in request body');
    err.status = 400;
    return next(err);
  }
  Driver.findOne({ _id: driverId })
    .then(driver => {
      if (driver) {
        driver.driver = updateDriver.driver;
        driver.save((err,doc,numrows) => {
          if(!err){
            updateAvgDrivers(orderId, function() {
              res.json(driver);
            }); 
          }
        });
        
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

});
/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:orderId', (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Driver.findOneAndDelete({ orderId, userId })
    .then(result => {
      if (result) {
        Order.update({_id: orderId }, { $pull: { drivers: result.id }} )
          .then(() => {
            updateAvgDrivers(orderId, function() {
              res.sendStatus(204);
            }); 
          });
        User.update({userId: userId }, { $pull: { drivers: { _id: result.id } }} );
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

function updateAvgDrivers(orderId, callback) {
  let warmLightingTotal,
    relaxedMusicTotal,
    calmEnvironmentTotal,
    softFabricsTotal,
    comfySeatingTotal,
    hotFoodDrinkTotal;

  warmLightingTotal = relaxedMusicTotal = calmEnvironmentTotal = softFabricsTotal = comfySeatingTotal = hotFoodDrinkTotal = 0;

  let warmLightingAverage,
    relaxedMusicAverage,
    calmEnvironmentAverage,
    softFabricsAverage,
    comfySeatingAverage,
    hotFoodDrinkAverage;

  warmLightingAverage = relaxedMusicAverage = calmEnvironmentAverage = softFabricsAverage = comfySeatingAverage = hotFoodDrinkAverage = 0;


  Driver.find({ orderId: orderId })
    .then((drivers) => {

      let numberOfDrivers = drivers.length; 
      if (numberOfDrivers !== 0) {
        drivers.forEach((driver) => {
          warmLightingTotal += driver.driver.warmLighting;
          relaxedMusicTotal += driver.driver.relaxedMusic;
          calmEnvironmentTotal += driver.driver.calmEnvironment;
          softFabricsTotal += driver.driver.softFabrics;
          comfySeatingTotal += driver.driver.comfySeating;
          hotFoodDrinkTotal += driver.driver.hotFoodDrink;
        });

        warmLightingAverage = (warmLightingTotal / numberOfDrivers) ;
        relaxedMusicAverage = (relaxedMusicTotal / numberOfDrivers);
        calmEnvironmentAverage = (calmEnvironmentTotal / numberOfDrivers);
        softFabricsAverage = (softFabricsTotal / numberOfDrivers);
        comfySeatingAverage = (comfySeatingTotal / numberOfDrivers);
        hotFoodDrinkAverage = (hotFoodDrinkTotal / numberOfDrivers);
      }

      return Order.findOne({ _id: orderId });
    })
    .then((order) => {
      order.averageWarmLighting = +warmLightingAverage.toFixed(2);
      order.averageRelaxedMusic = +relaxedMusicAverage.toFixed(2);
      order.averageCalmEnvironment = +calmEnvironmentAverage.toFixed(2);
      order.averageSoftFabrics = +softFabricsAverage.toFixed(2);
      order.averageComfySeating = +comfySeatingAverage.toFixed(2);
      order.averageHotFoodDrink = +hotFoodDrinkAverage.toFixed(2);
      
      let numb = 
        (
          +order.averageWarmLighting +
          +order.averageRelaxedMusic +
          +order.averageCalmEnvironment +
          +order.averageSoftFabrics +
          +order.averageComfySeating +
          +order.averageHotFoodDrink
        ) / 6;
      order.averageCozyness = +numb.toFixed(2);
      order.save();
      callback();
    })
    .catch((err) => console.error(err));
}

module.exports = router;