'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Zone = require('../models/zones');

const router = express.Router();

/* ===============USE PASSPORT AUTH JWT ============= */
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Zone.find()
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
//   const { searchTerm, zoneId } = req.query;
//   const userId = req.user.id;

//   let filter = {};

//   if (searchTerm) {
//     filter.title = { $regex: searchTerm, $options: 'i' };

//     // Mini-Challenge: Search both `title` and `content`
//     // const re = new RegExp(searchTerm, 'i');
//     // filter.$or = [{ 'title': re }, { 'content': re }];
//   }

//   if (zoneId) {
//     filter.zoneId = zoneId;
//   }

//   if (userId) {
//     filter.userId = userId;
//   }

//   Zone.find(filter) //
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

  Zone.findOne({ _id: id, userId })
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
  const { title, content, zoneId } = req.body;
  const userId = req.user.id;
  //console.log('req.user', req.user);
  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (zoneId && !mongoose.Types.ObjectId.isValid(zoneId)) {
    const err = new Error('The `zoneId` is not valid');
    err.status = 400;
    return next(err);
  }

  const newZone = { zone };

  Zone.create(newZone) //
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
  const { zoneId } = req.body;
  const updateZone = {};
  const updateFields = ['zoneId']

  updateFields.forEach(field => {
    if (field in req.body) {
      updateZone[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (zoneId && !mongoose.Types.ObjectId.isValid(zoneId)) {
    const err = new Error('The `zoneId` is not valid');
    err.status = 400;
    return next(err);
  }
  if (zoneId === '') {
    const err = new Error('Missing `zoneId` in request body');
    err.status = 400;
    return next(err);
  }

  Zone.findByIdAndUpdate(id, updateZone, { new: true })
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

  Zone.deleteOne({ _id: id, userId })
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