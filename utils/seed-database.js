'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const Delivery = require('../models/deliveries');
const merchant = require('../models/merchants');

const seedDeliverys = require('../db/seed/deliveries');
const seedmerchants = require('../db/seed/merchants');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([

      Delivery.insertMany(seedDeliverys),
      Delivery.createIndexes(),

      merchant.insertMany(seedmerchants),
      merchant.createIndexes()

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
