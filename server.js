'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

const authRouter = require('./routes/auth');
const deliveryRouter = require('./routes/deliveries');
const depotRouter = require('./routes/depots');
const driverRouter = require('./routes/drivers');
const orderRouter = require('./routes/orders');
const pickupRouter = require('./routes/pickups');
const userRouter = require('./routes/users');
const vendorRouter = require('./routes/vendors');
const zoneRouter = require('./routes/zones');

// Create an Express application
const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());


passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/auth', authRouter);
app.use('/api/deliveries', deliveryRouter);
app.use('/api/depots', depotRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/orders', orderRouter);
app.use('/api/pickups', pickupRouter);
app.use('/api/users', userRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/zones', zoneRouter);


app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`Server listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) { 
  dbConnect();
  runServer();
}

module.exports = app; 