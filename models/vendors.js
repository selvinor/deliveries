'use strict';

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorName: {type: String, default: ''},
  streetAddress: {type: String, default: ''},
  city: {type: String, default: ''},
  state: {type: String, default: ''},
  zipcode: {type: String, default: ''},
  geocode: {
    type: { type: String },
    coordinates: []
  },
  phone: {type: String, default: ''},
  pickups : [{pickup:{ type: mongoose.Schema.Types.ObjectId, ref: 'Pickup'} }],  
  deliveries :[{delivery:{ type: mongoose.Schema.Types.ObjectId, ref: 'Delivery'} }],  
  orders: [{order:{ type: mongoose.Schema.Types.ObjectId, ref: 'Order'} }]  
});

vendorSchema.methods.serialize = function() {
  return {
    userId: this.userId || '',
    vendorName: this.vendorName || '',
    streetAddress: this.streetAddress|| '',
    city: this.city|| '',
    state: this.state|| '',
    zipcode: this.zipcode|| '',
    geocode: this.geocode|| '',
    phone: this.phone|| '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries || '',
    orders: this.orders || ''
  };
};

vendorSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
vendorSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Vendor', vendorSchema);

