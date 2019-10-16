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
  orders: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }
  ],
  pickups: [
    {
      pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' }
    }
  ],
  deliveries: [
    {
      delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' }
    }
  ]
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
    orders: this.orders|| '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries|| ''
  };
};

const Vendor = mongoose.model('vendor', vendorSchema);
// Add `createdAt` and `updatedAt` fields
vendorSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
vendorSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = {Vendor};
