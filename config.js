'use strict';

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  // DATABASE_URL: process.env.DATABASE_URL,
  // MONGODB_URI: process.env.DATABASE_URL,
  DATABASE_URL: 'mongodb://localhost/deliveryDb',
  MONGODB_URI: 'mongodb://localhost/deliveryDb',
  TEST_DATABASE_URL:    
  'mongodb://localhost/deliveryDb',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d'
};
