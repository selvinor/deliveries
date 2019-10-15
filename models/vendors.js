'use strict';

const mongoose = require('mongoose');

// mongoose.Promise = global.Promise;

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorName: {type: String, default: ''},
  vendorAddress: {type: String, default: ''},
  vendorCity: {type: String, default: ''},
  vendorState: {type: String, default: ''},
  vendorZipcode: {type: String, default: ''},
  vendorPhone: {type: String, default: ''},
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
    userId: this.user || '',
    vendorName: this.vendorName || '',
    streetAddress: this.vendorAddress|| '',
    city: this.vendorCity|| '',
    state: this.vendorState|| '',
    zipcode: this.vendorZipcode|| '',
    phone: this.vendorPhone|| '',
    orders: this.orders|| '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries|| '',
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
