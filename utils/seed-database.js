'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

// const Orders = require('../models/orders');
const Users = require('../models/users');
const Zones = require('../models/zones');
const Depots = require('../models/depots');
const Drivers = require('../models/drivers');
const Vendors = require('../models/vendors');
const Orders = require('../models/orders');
const Pickups = require('../models/pickups');
const Deliveries = require('../models/deliveries');

const seedUsers = require('../db/seed/users');
const seedZones = require('../db/seed/zones');
const seedDepots = require('../db/seed/depots');
const seedDrivers = require('../db/seed/drivers');
const seedVendors = require('../db/seed/vendors');
const seedOrders = require('../db/seed/orders');
const seedPickups = require('../db/seed/pickups');
const seedDeliveries = require('../db/seed/deliveries');

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    delete mongoose.connection.models['Depot'];
    console.info('Seeding Database');
    return Promise.all([
      Depots.insertMany(seedDepots),
      Depots.createIndexes(),
      Orders.insertMany(seedOrders),
      Orders.createIndexes(),
      Users.insertMany(seedUsers),
      Users.createIndexes()
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

  // .then(() => {
  //   console.info('Seeding Database');
  //   return Promise.all([

  //     Users.insertMany(seedUsers),
  //     Users.createIndexes(),

  //     Vendors.insertMany(seedVendors),
  //     Vendors.createIndexes()

      // Orders.insertMany(seedOrders),
      // Orders.createIndexes()

      // Zones.insertMany(seedZones),
      // Zones.createIndexes()

      // Depots.insertMany(seedDepots),
      // Depots.createIndexes()

      // Drivers.insertMany(seedDrivers),
      // Drivers.createIndexes(),


      // Pickups.insertMany(seedPickups),
      // Pickups.createIndexes(),

      // Deliveries.insertMany(seedDeliveries),
      // Deliveries.createIndexes()
