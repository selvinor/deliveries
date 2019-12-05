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

describe('Vendors API', function () {

  before(function () {
    return mongoose.connect(TEST_DATABASE_URL,{useNewUrlParser: true })
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

  describe('GET /api/vendors', function () {

    it('should return a list of vendors', function () {

      const dbPromise = Vendor.find();

      const apiPromise = chai.request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${token}`); 

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list of Vendors with the correct fields', function () {

      const dbPromise = Vendor.find();

      const apiPromise = chai.request(app)
        .get('/api/vendors')
        .set('Authorization', `Bearer ${token}`); 

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          console.log('DATA: ', data);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
              expect(item).to.be.a('object');
              expect(item).to.include.all.keys(
              'vendorName',  
              'user',
              'streetAddress', 
              'city',
              'state', 
              'zipcode', 
              'phone', 
              'orders',
              'geocode',
              '_id',
              'createdAt',
              'updatedAt'            
            );
            // console.log('item: ', item);
            // console.log('data[i]: ',data[i]);
            expect(item.user).to.equal(data[i].user);
            expect(item.vendorName).to.equal(data[i].vendorName);
            expect(item.streetAddress).to.equal(data[i].streetAddress);
            expect(item.city).to.equal(data[i].city);
            expect(item.state).to.equal(data[i].state);
            expect(item.zipcode).to.equal(data[i].zipcode);
            expect(item.phone).to.equal(data[i].phone);
            expect(item.geocode.coordinates).to.eql(data[i].geocode.coordinates);
            expect(item.orders[0]._id).to.equal(data[i].orders[0]);
            // expect(item.orders[0].vendorOrderRef).to.equal(data[i].orders[0].vendorOrderRef);
            // expect(item.orders[0].destination).to.equal(data[i].orders[0].destination);
            // expect(item.orders[0].pickup.pickupDate).to.equal(data[i].pickups[0].pickupDate);
            // expect(item.orders[0].pickup.status).to.equal(data[i].pickups[0].status);
            // expect(item.orders[0].pickup.driver).to.equal(data[i].pickups[0].driver);
            // expect(item.orders[0].delivery.deliveryDate).to.equal(data[i].deliveries[0].deliveryDate);
            // expect(item.orders[0].delivery.status).to.equal(data[i].deliveries[0].status);
            // expect(item.orders[0].delivery.driver).to.equal(data[i].deliveries[0].driver);
        });
        });

    });

  });

  describe.only('GET /api/vendors/:id', function () {
    it('should return correct vendors', function () {
      let data;
      return Vendor.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/vendors/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          const item = res.body;
          console.log('item is: ', item);
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'vendorName',  
            'user',
            'streetAddress', 
            'city',
            'state', 
            'zipcode', 
            'phone', 
            'orders',
            'geocode',
            '_id',
            'createdAt',
            'updatedAt'            
          );
          // console.log('item: ', item);
          console.log('data: ',data);
          expect(item.user).to.equal(data.user);
          expect(item.vendorName).to.equal(data.vendorName);
          expect(item.streetAddress).to.equal(data.streetAddress);
          expect(item.city).to.equal(data.city);
          expect(item.state).to.equal(data.state);
          expect(item.zipcode).to.equal(data.zipcode);
          expect(item.phone).to.equal(data.phone);
          expect(item.geocode.coordinates).to.eql(data.geocode.coordinates);
          expect(item.orders[0]._id).to.equal(data.orders[0]);
});
  });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/vendors/NOT-A-VALID-ID').set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });

  describe('POST /api/vendors', function () {

    it('should create and return a new vendor when provided valid data', function () {
      const newItem = 
        {
            "geocode": {
                "coordinates": [
                    -122.88389,
                    45.536223
                ],
                "type": "Point"
            },
            "vendorName": "NewVendor",
            "streetAddress": "900 SW 5th Ave.",
            "city": "Portland",
            "state": "Oregon",
            "zipcode": "97204",
            "phone": "555-555-1111",
            "_id": "222222222222222222222001",
            "user": "111111111111111111111001",
            "createdAt": "2019-12-04T21:23:52.263Z",
            "updatedAt": "2019-12-04T21:23:52.263Z"
        }      
      let res;
      return chai.request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(
            'geocode.coordinates', 
            'user', 
            'vendorName', 
            'streetAddress', 
            'city', 
            'state', 
            'zipcode', 
            'geocode', 
            'phone', 
            'pickups', 
            'deliveries', 
            'orders'
          );
          return Vendor.findById(res.body._id);
        })
        .then(data => {
          // console.log('newItem: ', newItem, ' data: ', data);
          expect(newItem.vendorName).to.equal(data.vendorName);
          expect(newItem.geocode.coordinates).to.eql(data.geocode.coordinates);
          expect(newItem.user).to.equal(data.user);
          expect(newItem.streetAddress).to.equal(data.streetAddress);
          expect(newItem.city).to.equal(data.city);
          expect(newItem.state).to.equal(data.state);
          expect(newItem.zipcode).to.equal(data.zipcode);
          expect(newItem.phone).to.equal(data.phone);      
          expect(newItem.pickups).to.equal(data.pickups);      
          expect(newItem.deliveries).to.equal(data.deliveries);      
          expect(newItem.orders_id).to.equal(data.orders);      
      });
    });
  });
});
