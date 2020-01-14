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
    return mongoose.connect(TEST_DATABASE_URL,{'useNewUrlParser': true, 'useCreateIndex': true})
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
            // console.log('data[',i,'].vendor: ', data[i].vendor);
            // console.log('item.vendor._id: ', item.vendor._id);
            // console.log('item.vendor: ', item.vendor);
            // console.log('')
              expect(item).to.be.a('object');
              expect(item).to.include.all.keys(
              'userId',  
              'orderNumber',
              'orderDate', 
              'orderDescription',
              'orderSize',
              'vendor', 
              'pickup', 
              'delivery',            
              'deliveryDate', 
              'destination' 
            );
            item.OrderDate = new Date(item.orderDate);
            item.DeliveryDate = new Date(item.deliveryDate);
            expect(item.orderNumber).to.equal(data[i].orderNumber);
            expect(item.OrderDate).to.eql(new Date(data[i].orderDate));
            expect(item.orderDescription).to.equal(data[i].orderDescription);
            expect(item.orderSize).to.equal(data[i].orderSize);
            expect(item.vendor._id).to.equal(data[i].vendor);
            expect(item.pickup._id).to.equal(data[i].pickup);
            expect(item.delivery._id).to.equal(data[i].delivery);
            expect(item.DeliveryDate).to.eql(new Date(data[i].deliveryDate));
            expect(item.destination.businessName).to.equal(data[i].destination.businessName);
            expect(item.destination.geocode.coordinates).to.eql(data[i].destination.geocode.coordinates);
            expect(item.destination.streetAddress).to.equal(data[i].destination.streetAddress);
            expect(item.destination.city).to.equal(data[i].destination.city);
            expect(item.destination.state).to.equal(data[i].destination.state);
            expect(item.destination.zipcode).to.equal(data[i].destination.zipcode);
            expect(item.destination.instructions).to.equal(data[i].destination.instructions);
            expect(item.destination.recipient).to.equal(data[i].destination.recipient);
            expect(item.destination.recipientPhone).to.equal(data[i].destination.recipientPhone);      
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
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'userId',  
            'orderNumber',
            'orderDate', 
            'orderDescription',
            'orderSize',
            'vendor', 
            'pickup', 
            'delivery',            
            'deliveryDate', 
            'destination' 
      );
      item.OrderDate = new Date(item.orderDate);
      item.DeliveryDate = new Date(item.deliveryDate);
      expect(item.orderNumber).to.equal(data.orderNumber);
      expect(item.OrderDate).to.eql(new Date(data.orderDate));
      expect(item.orderDescription).to.equal(data.orderDescription);
      expect(item.orderSize).to.equal(data.orderSize);
      expect(item.vendor._id).to.equal(data.vendor);
      expect(item.pickup._id).to.equal(data.pickup);
      expect(item.delivery._id).to.equal(data.delivery);
      expect(item.DeliveryDate).to.eql(new Date(data.deliveryDate));
      expect(item.destination.businessName).to.equal(data.destination.businessName);
      expect(item.destination.geocode.coordinates).to.eql(data.destination.geocode.coordinates);
      expect(item.destination.streetAddress).to.equal(data.destination.streetAddress);
      expect(item.destination.city).to.equal(data.destination.city);
      expect(item.destination.state).to.equal(data.destination.state);
      expect(item.destination.zipcode).to.equal(data.destination.zipcode);
      expect(item.destination.instructions).to.equal(data.destination.instructions);
      expect(item.destination.recipient).to.equal(data.destination.recipient);
      expect(item.destination.recipientPhone).to.equal(data.destination.recipientPhone);      
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

    it('should create and return a new order when provided valid data', function () {
      const newItem = {
          "userId": "111111111111111111111001",
          "vendor": "222222222222222222222001",
          "orderDate": "2019-11-21T00:00:00.000Z",
          "orderNumber": "CAT140",
          "orderDescription": "12 Red Roses",
          "orderStatus": "pending",
          "orderSize": "1",
          "deliveryDate": "2019-11-22T00:00:00.000Z",
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
              "recipientPhone": "555-555-1212"
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
            'userId',
            'orderDate', 
            'vendor',
            'deliveryDate', 
            'orderNumber', 
            'orderDescription',
            'orderStatus',
            'orderSize',
            'destination',
            'pickup', 
            'delivery',
            '__v',
            '_id',
            'createdAt',
            'updatedAt'
          );
          return Order.findById(res.body._id);
        })
        .then(data => {
          let strOrderDate = new Date(newItem.orderDate);
          let strDeliveryDate = new Date(newItem.deliveryDate);
          expect(strOrderDate).to.eql(data.orderDate);
          expect(newItem.pickupVendor).to.equal(data.pickupVendor);
          expect(strDeliveryDate).to.eql(data.deliveryDate);
          expect(newItem.orderNumber).to.equal(data.orderNumber);
          expect(newItem.orderDescription).to.equal(data.orderDescription);
          expect(newItem.orderStatus).to.equal(data.orderStatus);
          expect(newItem.orderSize).to.equal(data.orderSize);
          expect(newItem.destination.geocode.coordinates).to.eql(data.destination.geocode.coordinates);
          expect(newItem.destination.businessName).to.equal(data.destination.businessName);
          expect(newItem.destination.streetAddress).to.equal(data.destination.streetAddress);
          expect(newItem.destination.city).to.equal(data.destination.city);
          expect(newItem.destination.state).to.equal(data.destination.state);
          expect(newItem.destination.zipcode).to.equal(data.destination.zipcode);
          expect(newItem.destination.instructions).to.equal(data.destination.instructions);
          expect(newItem.destination.recipient).to.equal(data.destination.recipient);
          expect(newItem.destination.recipientPhone).to.equal(data.destination.recipientPhone);      
          expect(newItem.pickups_id).to.eql(data.pickups);
          expect(newItem.deliveries_id).to.eql(data.deliveries);
        });
    });
  });
  describe('PUT /api/orders/:id', function () {
    it('should update the order when provided valid data', function () {
      let order;
      let res;
      const updateOrder = { 
        'orderDate': '12-20-2019', 
        'orderSize': '2',
        'orderNumber': 'XXX100', 
        'orderDescription': '12 Yellow Roses',
        'orderStatus': 'ready',
        'destination.businessName': 'Bloomz' 
      };

      return Order.findOne()
        .then(_order => {
          order = _order;
          return chai.request(app)
          .put(`/api/orders/${order.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateOrder);
        })
        .then(_res => {
          res =_res;
          // console.log('****res.body: ', res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(
            '_id',
            'userId',
            'orderDate', 
            'orderSize',
            'orderNumber', 
            'orderDescription',
            'orderStatus',
            'destination',
            'vendor',
            'pickup',
            'delivery',
            'deliveryDate',
            'createdAt',
            'updatedAt'
          );
          expect(res.body._id).to.equal(order.id);
          expect(res.body.name).to.equal(updateOrder.name);
          expect(new Date(res.body.createdAt)).to.eql(order.createdAt);
          expect(res.body.userId).to.equal(order.userId);
          expect(res.body.orderName).to.equal(order.orderName);
          expect(res.body.orderPhone).to.equal(order.orderPhone);      
          expect(res.body.orderVehicleMake).to.equal(order.orderVehicleMake);
          expect(res.body.orderVehicleModel).to.equal(order.orderVehicleModel);
          expect(res.body.orderVehiclePlate).to.equal(order.orderVehiclePlate);
          expect(res.body.pickup).to.equal(order.pickup);      
          expect(res.body.delivery).to.equal(order.delivery);      
          // expect item to have been updated
        });
    });
  });
});  