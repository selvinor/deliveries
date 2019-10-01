'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

// const Order = require('../models/orders');
const User = require('../models/users');

// const seedOrders = require('../db/seed/orders');
const seedUsers = require('../db/seed/users');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([

      // Order.insertMany(seedOrders),
      // Order.createIndexes(),

      User.insertMany(seedUsers),
      User.createIndexes()

    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
