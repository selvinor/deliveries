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

describe('Drivers API', function () {

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

  describe('GET /api/drivers', function () {

    it('should return a list of drivers', function () {

      const dbPromise = Driver.find();

      const apiPromise = chai.request(app)
        .get('/api/drivers')
        .set('Authorization', `Bearer ${token}`); 

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list of Drivers with the correct fields', function () {

      const dbPromise = Driver.find();

      const apiPromise = chai.request(app)
        .get('/api/drivers')
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
              'user',
              'driverName',  
              'driverVehicleMake', 
              'driverVehicleModel',
              'driverVehiclePlate', 
              'driverPhone', 
              'pickups',
              'deliveries',
              '_id',
              'createdAt',
              'updatedAt'            
            );
            console.log('item: ', item);
            console.log('data[i]: ',data[i]);
            expect(item.user).to.equal(data[i].user);
            expect(item.driverName).to.equal(data[i].driverName);
            expect(item.driverVehicleMake).to.equal(data[i].driverVehicleMake);
            expect(item.driverVehicleModel).to.equal(data[i].driverVehicleModel);
            expect(item.driverVehiclePlate).to.equal(data[i].driverVehiclePlate);
            expect(item.driverPhone).to.equal(data[i].driverPhone);
            if(item.pickups[0]){
              expect(item.pickups[0]._id).to.equal(data[i].pickups[0]);
            }
            if(item.deliveries[0]){
              expect(item.deliveries[0]._id).to.equal(data[i].deliveries[0]);
            }
        });
        });

    });

  });

  describe('GET /api/drivers/:id', function () {
    it('should return correct drivers', function () {
      let data;
      return Driver.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/drivers/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          const item = res.body;
          console.log('item is: ', item);
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'user',
            'driverName',  
            'driverVehicleMake', 
            'driverVehicleModel',
            'driverVehiclePlate', 
            'driverPhone', 
            'pickups',
            'deliveries',
            '_id',
            'createdAt',
            'updatedAt'            
          );
          // console.log('item: ', item);
          // console.log('data[i]: ',data[i]);
          expect(item.user).to.equal(data.user);
          expect(item.driverName).to.equal(data.driverName);
          expect(item.driverVehicleMake).to.equal(data.driverVehicleMake);
          expect(item.driverVehicleModel).to.equal(data.driverVehicleModel);
          expect(item.driverVehiclePlate).to.equal(data.driverVehiclePlate);
          expect(item.driverPhone).to.equal(data.driverPhone);
          if (item.pickups[0]) {
            expect(item.pickups[0]._id).to.equal(data.pickups[0]);
          }
          if (item.deliveries[0]) {
            expect(item.deliveries[0]._id).to.equal(data.deliveries[0]);            
          }
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/drivers/NOT-A-VALID-ID').set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });

  describe('POST /api/drivers', function () {

    it('should create and return a new driver when provided valid data', function () {
      const newItem = 
      {
            "user": "111111111111111111111001",
            "driverName": "NewDriver",
            "driverPhone": "555-555-1212",
            "driverVehicleMake": "Toyota",
            "driverVehicleModel": "RAV4",
            "driverVehiclePlate": "MYRAV4",
            "createdAt": "2019-12-04T21:23:52.263Z",
            "updatedAt": "2019-12-04T21:23:52.263Z"
        }      
      let res;
      return chai.request(app)
        .post('/api/drivers')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(
            'user', 
            'driverName', 
            'driverVehicleMake', 
            'driverVehicleModel', 
            'driverVehiclePlate', 
            'driverPhone', 
            'pickups', 
            'deliveries' 
          );
          return Driver.findById(res.body._id);
        })
        .then(data => {
          // console.log('newItem: ', newItem, ' data: ', data);
          expect(newItem.user).to.equal(data.user);
          expect(newItem.driverName).to.equal(data.driverName);
          expect(newItem.driverPhone).to.equal(data.driverPhone);      
          expect(newItem.driverVehicleMake).to.equal(data.driverVehicleMake);
          expect(newItem.driverVehicleModel).to.equal(data.driverVehicleModel);
          expect(newItem.driverVehiclePlate).to.equal(data.driverVehiclePlate);
          expect(newItem.pickups._id).to.equal(data.pickups);      
          expect(newItem.deliveries._id).to.equal(data.deliveries);      
      });
    });
  });

  describe('PUT /api/drivers/:id', function () {
    it('should update the driver when provided valid data', function () {
      let driver;
      let res;
      const updateDriver = { 
        'driverName': 'Updated DriverName', 
        'driverVehicleMake': 'Mecury', 
        'driverVehicleModel': 'Cougar', 
        'driverVehiclePlate': 'Updated Plate', 
        'driverPhone': 'Updated phone', 
        'pickups': [], 
        'deliveries': [] 
      };

      return Driver.findOne()
        .then(_driver => {
          driver = _driver;
          return chai.request(app)
          .put(`/api/drivers/${driver.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateDriver);
      })
        .then(_res => {
          res =_res;
          //console.log('****res: ', res);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys(
            'user', 
            'driverName', 
            'driverVehicleMake', 
            'driverVehicleModel', 
            'driverVehiclePlate', 
            'driverPhone', 
            'pickups', 
            'deliveries' 
          );
          expect(res.body.id).to.equal(driver.id);
          expect(res.body.name).to.equal(updateDriver.name);
          expect(new Date(res.body.createdAt)).to.eql(driver.createdAt);
          expect(res.body.user).to.equal(data.user);
          expect(res.body.driverName).to.equal(data.driverName);
          expect(res.body.driverPhone).to.equal(data.driverPhone);      
          expect(res.body.driverVehicleMake).to.equal(data.driverVehicleMake);
          expect(res.body.driverVehicleModel).to.equal(data.driverVehicleModel);
          expect(res.body.driverVehiclePlate).to.equal(data.driverVehiclePlate);
          expect(res.body.pickups._id).to.equal(data.pickups);      
          expect(res.body.deliveries._id).to.equal(data.deliveries);      
          // expect item to have been updated
          expect(new Date(res.body.updatedAt)).to.greaterThan(driver.updatedAt);
        });
    });


    it('should respond with a 400 for an invalid id', function () {
      let res;
      const updateDriver = { 
        'driverName': 'Updated DriverName', 
        'driverVehicleMake': 'Mecury', 
        'driverVehicleModel': 'Cougar', 
        'driverVehiclePlate': 'Updated Plate', 
        'driverPhone': 'Updated phone', 
        'pickups': [], 
        'deliveries': [] 
      };
      return chai.request(app)
        .put('/api/drivers/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDriver)
        .then(_res => {
          res =_res;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function () {
      let res;
      const updateDriver = { 
        'driverName': 'Updated DriverName', 
        'driverVehicleMake': 'Mecury', 
        'driverVehicleModel': 'Cougar', 
        'driverVehiclePlate': 'Updated Plate', 
        'driverPhone': 'Updated phone', 
        'pickups': [], 
        'deliveries': [] 
      };
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      return chai.request(app)
        .put('/api/drivers/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDriver)
        .then(_res => {
          res =_res;
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "driverName" field', function () {
      let driver;
      let res;
      const updateDriver = {};
      return Driver.findOne()
        .then(_driver => {
          driver = _driver;
          return chai.request(app)
            .put(`/api/drivers/${driver.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateDriver);
        })
        .then(_res => {
          res =_res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `driverName` in request body');
        });
    });

    it('should return an error when "driverName" field is empty string', function () {
      let driver;
      let res;
      const updateDriver = { driverName: '' };
      return Driver.findOne()
        .then(_driver => {
          driver = _driver;
          return chai.request(app)
            .put(`/api/drivers/${driver.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateDriver);
        })
        .then(_res => {
          res =_res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `driverName` in request body');
        });
    });

    it('should return an error when given a duplicate driverVehiclePlate', function () {
      let res;
      return Driver.find().limit(2)
        .then(results => {
          const [item1, item2] = results;
          item1.driverVehiclePlate = item2.driverVehiclePlate;
          return chai.request(app)
            .put(`/api/drivers/${item1._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(item1);
        })
        .then(_res => {
          res =_res;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Driver Vehicle Plate already exists');
        });
    });
  });

  describe('DELETE /api/drivers/:id', function () {
    it('should delete an existing driver and respond with 204', function () {
      let driver;
      let res;
      return Driver.findOne()
        .then(_driver => {
          driver = _driver;
          return chai.request(app)
            .delete(`/api/drivers/${driver._id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then( _res => {
          res = _res;
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Driver.count({ _id: driver._id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with a 400 for an invalid id', function () {

      return chai.request(app)
        .delete('/api/drivers/NOT-A-VALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .then(_res => {
          res =_res;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });
});
