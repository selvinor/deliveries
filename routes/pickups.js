'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Pickup = require('../models/pickups');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Pickup.find()
    .then(result => {
      return res
      .status(200)
      .json(result);
    })
    .catch(err => {
      next(err);
    });
});

// router.get('/', (req, res, next) => {
//   const { searchTerm, driverId } = req.query;
//   const userId = req.user.id;

//   let filter = {};

//   if (searchTerm) {
//     filter.title = { $regex: searchTerm, $options: 'i' };

//     // Mini-Challenge: Search both `title` and `content`
//     // const re = new RegExp(searchTerm, 'i');
//     // filter.$or = [{ 'title': re }, { 'content': re }];
//   }

//   if (driverId) {
//     filter.driverId = driverId;
//   }

//   if (userId) {
//     filter.userId = userId;
//   }

//   Pickup.find(filter) //
//     .sort({ updatedAt: 'desc' })
//     .then(results => {
//       console.log('RESULTS: ', res.json(results));
//       res.json(results);  //
//     })
//     .catch(err => {
//       next(err);
//     });
// });

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Pickup.findOne({ _id: id, userId })
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, driverId } = req.body;
  const userId = req.user.id;
  //console.log('req.user', req.user);
  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (driverId && !mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `driverId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (driverId && !mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }

  const newPickup = { title, content, driverId, userId };

  Pickup.create(newPickup) //
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
  const { title, content, driverId } = req.body;
  const updatePickup = {};
  const updateFields = ['title', 'content', 'driverId']

  updateFields.forEach(field => {
    if (field in req.body) {
      updatePickup[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (driverId && !mongoose.Types.ObjectId.isValid(driverId)) {
    const err = new Error('The `driverId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Pickup.findByIdAndUpdate(id, updatePickup, { new: true })
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
  const userId = req.user.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Pickup.deleteOne({ _id: id, userId })
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