'use strict';

const { TEST_DATABASE_URL, JWT_SECRET  } = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

const Order = require('../models/orders');
const Vendor = require('../models/vendors');
const Delivery = require('../models/deliveries');
const Pickup = require('../models/pickups');
const Driver = require('../models/drivers');

const seedUsers = require('../db/seed/users.json');
const seedVendors = require('../db/seed/vendors.json');
const seedOrders = require('../db/seed/orders.json');
const seedDeliveries = require('../db/seed/deliveries.json');
const seedPickups = require('../db/seed/pickups.json');
const seedDrivers = require('../db/seed/drivers.json');

const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Orders API', function () {

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let token;
  let user;
  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),

      Order.insertMany(seedOrders),
      Order.createIndexes(),

      Vendor.insertMany(seedVendors),
      Vendor.createIndexes(),

      Delivery.insertMany(seedDeliveries),
      Delivery.createIndexes(),

      Pickup.insertMany(seedPickups),
      Pickup.createIndexes(),

      Driver.insertMany(seedDrivers),
      Driver.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/orders', function () {

    it('should return a list of orders', function () {

      const dbPromise = Order.find();

      const apiPromise = chai.request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`); 

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list of Orders with the correct fields', function () {

      const dbPromise = Order.find();

      const apiPromise = chai.request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`); 

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            // // Order: Delivery, Pickup, Driver content are optional
            expect(item).to.include.all.keys(
              'vendor', 
              'vendorOrderRef',
              'orderDate', 
              'deliveryDate', 
              'destination', 
              'pickup', 
              'delivery',
              'createdAt',
              'updatedAt'       
            );
           console.log('data[0]: ', data[0], 'item.vendor: ',item.vendor);
            expect(item.vendor._id).to.equal(data[i].vendor);
            // expect(item.vendorOrderRef).to.equal(data.vendorOrderRef);
            // expect(item.orderDate).to.equal(data.orderDate);
            // expect(item.deliveryDate).to.equal(data.deliveryDate);
            // expect(item.destination).to.equal(data.destination);
            // expect(item.pickup).to.equal(data.pickup);
            // expect(item.delivery).to.equal(data.delivery);
          });
        });

    });

  });

  describe('GET /api/orders/:id', function () {
    it('should return correct orders', function () {
      let data;
      return Order.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/orders/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          const item = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          //console.log('res.body: ', res.body);
          expect(res.body).to.include.all.keys(
            'vendor', 
            'vendorOrderRef',
            'orderDate', 
            'deliveryDate', 
            'destination', 
            'pickup', 
            'delivery',
            'destination.geocode.coordinates'
          );
          expect(item.vendor).to.equal(data.vendor);
          expect(item.vendorOrderRef).to.equal(data.vendorOrderRef);
          expect(item.orderDate).to.equal(data.orderDate);
          expect(item.deliveryDate).to.equal(data.deliveryDate);
          expect(item.destination).to.equal(data.destination);
          expect(item.pickup).to.equal(data.pickup);
          expect(item.delivery).to.equal(data.delivery);
          expect(item.destination.geocode.coordinates[0]).to.equal(data.destination.geocode.coordinates[0]);
          expect(item.location.geocode.coordinates[1]).to.equal(data.destination.geocode.coordinates[1]);
        });
  });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/orders/NOT-A-VALID-ID').set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });

  describe('POST /api/orders', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
          "userId": "111111111111111111111001",
          "vendor": "222222222222222222222001",
          "orderDate": {
              "$date": "2019-11-20T00:00:00.000Z"
          },
          "deliveryDate": {
              "$date": "2019-11-21T00:00:00.000Z"
          },
          "vendorOrderRef": "CAT100",
          "destination": {
              "geocode": {
                  "coordinates": [
                      -122.88389,
                      45.536223
                  ],
                  "type": "Point"
              },
              "businessName": "Insomnia Coffee Co",
              "streetAddress": "2388 NW Amberbrook Dr",
              "city": "Beaverton",
              "state": "OR",
              "zipcode": "97006",
              "instructions": "",
              "recipient": "Betty Sue",
              "contactPhone": "555-555-1212"
          },
          "pickup": "",
          "delivery": ""
      }      
      let res;
      return chai.request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(
            'vendor', 
            'vendorOrderRef',
            'orderDate', 
            'deliveryDate', 
            'destination', 
            'pickup', 
            'delivery',
            'destination.geocode.coordinates'
          );
          return Order.findById(res.body.id);
        })
        .then(data => {
          expect(item.vendor).to.equal(data.vendor);
          expect(item.vendorOrderRef).to.equal(data.vendorOrderRef);
          expect(item.orderDate).to.equal(data.orderDate);
          expect(item.deliveryDate).to.equal(data.deliveryDate);
          expect(item.destination).to.equal(data.destination);
          expect(item.pickup).to.equal(data.pickup);
          expect(item.delivery).to.equal(data.delivery);
          expect(item.destination.geocode.coordinates[0]).to.equal(data.destination.geocode.coordinates[0]);
          expect(item.location.geocode.coordinates[1]).to.equal(data.destination.geocode.coordinates[1]);
        });
    });
  });
});
