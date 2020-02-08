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
    return mongoose.connect(TEST_DATABASE_URL,{'useNewUrlParser': true, 'useCreateIndex': true,  useFindAndModify: false })
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
          // console.log('DATA: ', data);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
              expect(item).to.be.a('object');
              expect(item).to.include.all.keys(
              'userId',
              'vendorName', 
              'vendorLocation', 
              'vendorPhone', 
              'orders',
              '_id',
              'createdAt',
              'updatedAt'            
            );
            // console.log('item: ', item);
            // console.log('data[i]: ',data[i]);
            expect(item.userId).to.equal(data[i].userId);
            expect(item.vendorName).to.equal(data[i].vendorName);
            expect(item.vendorLocation.streetAddress).to.equal(data[i].vendorLocation.streetAddress);
            expect(item.vendorLocation.city).to.equal(data[i].vendorLocation.city);
            expect(item.vendorLocation.state).to.equal(data[i].vendorLocation.state);
            expect(item.vendorLocation.zipcode).to.equal(data[i].vendorLocation.zipcode);
            expect(item.vendorPhone).to.equal(data[i].vendorPhone);
            expect(item.vendorLocation.geocode.coordinates).to.eql(data[i].vendorLocation.geocode.coordinates);
            expect(item.orders[0]._id).to.equal(data[i].orders[0]);
            if(item.orders[0]){
              expect(item.orders[0]._id).to.equal(data[i].orders[0]);
            }
          });
        });

    });

  });

  describe('GET /api/vendors/:id', function () {
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
          // console.log('item is: ', item);
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'userId',
            'vendorName', 
            'vendorLocation', 
            'vendorPhone', 
            'orders',
            '_id',
            'createdAt',
            'updatedAt'            
        );
          // console.log('item: ', item);
          // console.log('data: ',data);
          expect(item.userId).to.equal(data.userId);
          expect(item.vendorName).to.equal(data.vendorName);
          expect(item.vendorLocation.streetAddress).to.equal(data.vendorLocation.streetAddress);
          expect(item.vendorLocation.city).to.equal(data.vendorLocation.city);
          expect(item.vendorLocation.state).to.equal(data.vendorLocation.state);
          expect(item.vendorLocation.zipcode).to.equal(data.vendorLocation.zipcode);
          expect(item.vendorPhone).to.equal(data.vendorPhone);
          expect(item.vendorLocation.geocode.coordinates).to.eql(data.vendorLocation.geocode.coordinates);
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
      const newItem = {
        "userId": "111111111111111111111001",
        "vendorName": "NewVendor",
            "vendorLocation" :{
              "geocode": {
                  "coordinates": [
                      -122.88389,
                      45.536223
                  ],
                  "type": "Point"
              },  
              "streetAddress": "900 SW 5th Ave.",
              "city": "Portland",
              "state": "Oregon",
              "zipcode": "97204"
            },
            "vendorPhone": "555-555-1111",
            "orders":[],
            "pickups": [],
            "deliveries": []
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
            'userId', 
            'vendorName', 
            'vendorLocation', 
            'vendorPhone', 
            'orders', 
            'pickups',
            'deliveries',
            '_id',
            '__v',
            'createdAt',
            'updatedAt'

          );
          return Vendor.findById(res.body._id);
        })
        .then(data => {
          // console.log('newItem: ', newItem, ' data: ', data);
          expect(newItem.vendorName).to.equal(data.vendorName);
          expect(newItem.vendorLocation.geocode.coordinates).to.eql(data.vendorLocation.geocode.coordinates);
          expect(newItem.userId).to.equal(data.userId);
          expect(newItem.vendorLocation.streetAddress).to.equal(data.vendorLocation.streetAddress);
          expect(newItem.vendorLocation.city).to.equal(data.vendorLocation.city);
          expect(newItem.vendorLocation.state).to.equal(data.vendorLocation.state);
          expect(newItem.vendorLocation.zipcode).to.equal(data.vendorLocation.zipcode);
          expect(newItem.vendorPhone).to.equal(data.vendorPhone);  
          expect(newItem.orders).to.eql(data.orders);  
          expect(newItem.pickups).to.eql(data.pickups);  
          expect(newItem.deliveries).to.eql(data.deliveries);                  
      });
    });
  });
});
