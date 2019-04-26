"use strict";
require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const bodyParser = require('body-parser');
const {Delivery} = require('./models/deliveries');
const mongoose = require('mongoose');
const cors = require("cors");
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require("./config");
const jsonParser = bodyParser.json();
// Here we use destructuring assignment with renaming so the two variables
// called router (from ./merchants and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
const { router: merchantsRouter } = require('./merchants');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { dbConnect } = require("./db-mongoose");
//const {dbConnect} = require("./db-knex");
const jwtAuth = passport.authenticate('jwt', { session: false });

const app = express();  
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});



app.use('/api/merchants/', merchantsRouter);
app.use('/api/auth/', authRouter);

// A protected endpoint which needs a valid JWT to access it
// app.get('/api/protected', jwtAuth, (req, res) => {
//   return res.json({
//     data: 'rosebud'
//   });
// });
// Logging
//app.use(morgan('common'));
app.use(
  morgan(process.env.NODE_ENV === "production" ? "common" : "dev", {
    skip: (req, res) => process.env.NODE_ENV === "test"
  })
);
// A protected endpoint which needs a valid JWT to access it
// app.get('/api/protected', jwtAuth, (req, res) => {
//   return res.json({
//     data: 'rosebud'
//   });
// });

//app.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

app.get("/api/protected/deliveries", jwtAuth, (req, res, next) => {
  Delivery.find()
  .then(results => {
    res.json(results);  //
  })
  .catch(err => {
    next(err);
  });
  
  //const deliveries = getDeliverys()

  });
  app.get('/api/protected/deliveries/:id', jwtAuth, jsonParser, (req, res, next) => {
    const { id } = req.params;
    const merchant = req.merchant.id;
  // console.log('req: ', req);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }
    //Delivery.findOne({ _id: id})  
    Delivery.findOne({ _id: id, merchant })
      .populate('recipients')
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
  
  // app.post("/api/protected/deliveries", jwtAuth, jsonParser, (req, res, next) => {
    app.post("/api/deliveries",  jsonParser, (req, res, next) => {
    console.log('deliveries req.body: ', req.body);
    const { merchant, deliveries } = req.body;
    // const { deliveryZone, deliveryNumber, deliveryInstructions, deliveryRecipient, deliveryRecipientPhone, deliveryStatus } = deliveries;
    // const newDelivery = {  merchant, deliveryZone, deliveryNumber, deliveryInstructions, deliveryRecipient, deliveryRecipientPhone, deliveryStatus   };  
// Can this be simplified?
    // const newDelivery = {  merchant, deliveryZone, deliveryNumber, deliveryInstructions, deliveryRecipient, deliveryRecipientPhone, deliveryStatus   };
    const newDelivery = { merchant, deliveries };

    Delivery.create(newDelivery) //
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
app.put('/api/deliveries/:id', jsonParser,  (req, res, next) => {
  // console.log('put called. req.body = ', req.body);

  const updateDelivery = {};
  const updateFields = [deliveryZone, deliveryNumber, deliveryInstructions, deliveryRecipient, deliveryRecipientPhone, deliveryStatus];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateDelivery[field] = req.body[field];
    }
  });
  const id = req.params.id;

  // console.log(`Updating delivery \`${req.params.id}\``);
  Delivery.findByIdAndUpdate(id, updateDelivery, { new: true })
    .then(result => {
      if (result) {
        // console.log('put request response is: ', res);
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
  });
// when DELETE request comes in with an id in path,
// try to delete that item 
  app.delete('/api/deliveries/:id', (req, res, next) => {
    const { id } = req.params;
    const merchant = req.merchant.id;
  
    /***** Never trust merchants - validate input *****/
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }
    //Delivery.deleteOne({ _id: id})
    Delivery.deleteOne({ _id: id, merchant })
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

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on("error", err => {
      console.error("Express failed to start");
      console.error(err);
    });
}


if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
