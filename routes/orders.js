'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Order = require('../models/orders');
const User = require('../models/users');
const Place = require('../models/drivers');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, driverId } = req.query;
  const userId = req.user.id;

  let filter = {};

  if (searchTerm) {
    filter.order = { $regex: searchTerm, $options: 'i' };
  }

  if (driverId) {
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      const err = new Error('The `order id` is not valid');
      err.status = 400;
      return next(err);
    }
    filter.driverId = driverId;
  }

  if (userId) {
    filter.userId = userId;
  }
  Order.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results); 
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM by order Id and user Id in combo========== */
router.get('/:driverId', (req, res, next) => {
  const driverId = req.params.driverId;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `user id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `order id` is not valid');
    err.status = 400;
    return next(err);
  }

  Order.findOne({ driverId: driverId, userId: userId })
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
  const { order, driverId } = req.body;
  const userId = req.user.id;

  if (!order) {
    const err = new Error('Missing `order` in request body');
    err.status = 400;
    return next(err);
  }

  if (driverId && !mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `order id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `user Id` is not valid');
    err.status = 400;
    return next(err);
  }

  const newOrder = { order, driverId, userId };

  Order.findOne({ driverId: driverId, userId: userId })  
    .then(result => {
      if (result) {
        const err = new Error('You have already posted a order');
        err.status = 400;
        err.reason = 'ValidationError';
        return next(err);
      } else {
        Order.create(newOrder)    
          .then(result => {
            Place.findOne({ _id: driverId })
              .then(order => {
                order.orders.push(result.id);
                order.save((err,doc,numdocs)=>{
                  updateAvgOrders(driverId, function() {
                    res
                      .location(`${req.originalUrl}/${result.id}`)
                      .status(201)
                      .json(result);
                  });
                }); 
              });              
            User.findOne({ _id: userId })
              .then(user => {
                user.orders.push(result.id);
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
router.put('/:orderId', (req, res, next) => {
  const { orderId } = req.params;
  const { order, driverId } = req.body;

  const updateOrder = {};
  const updateFields = ['order', 'userId', 'driverId'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateOrder[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = new Error('The `order id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (driverId && !mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `driverId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (!order) {
    const err = new Error('Missing `order` in request body');
    err.status = 400;
    return next(err);
  }
  Order.findOne({ _id: orderId })
    .then(order => {
      if (order) {
        order.order = updateOrder.order;
        order.save((err,doc,numrows) => {
          if(!err){
            updateAvgOrders(driverId, function() {
              res.json(order);
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
router.delete('/:driverId', (req, res, next) => {
  const { driverId } = req.params;
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Order.findOneAndDelete({ driverId, userId })
    .then(result => {
      if (result) {
        Place.update({_id: driverId }, { $pull: { orders: result.id }} )
          .then(() => {
            updateAvgOrders(driverId, function() {
              res.sendStatus(204);
            }); 
          });
        User.update({userId: userId }, { $pull: { orders: { _id: result.id } }} );
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

function updateAvgOrders(driverId, callback) {
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


  Order.find({ driverId: driverId })
    .then((orders) => {

      let numberOfOrders = orders.length; 
      if (numberOfOrders !== 0) {
        orders.forEach((order) => {
          warmLightingTotal += order.order.warmLighting;
          relaxedMusicTotal += order.order.relaxedMusic;
          calmEnvironmentTotal += order.order.calmEnvironment;
          softFabricsTotal += order.order.softFabrics;
          comfySeatingTotal += order.order.comfySeating;
          hotFoodDrinkTotal += order.order.hotFoodDrink;
        });

        warmLightingAverage = (warmLightingTotal / numberOfOrders) ;
        relaxedMusicAverage = (relaxedMusicTotal / numberOfOrders);
        calmEnvironmentAverage = (calmEnvironmentTotal / numberOfOrders);
        softFabricsAverage = (softFabricsTotal / numberOfOrders);
        comfySeatingAverage = (comfySeatingTotal / numberOfOrders);
        hotFoodDrinkAverage = (hotFoodDrinkTotal / numberOfOrders);
      }

      return Place.findOne({ _id: driverId });
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