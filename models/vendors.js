'use strict';

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Object, ref: 'User', required: true },
  vendorName: {type: String, default: ''},
  vendorLocation: {
    streetAddress: {type: String, default: ''},
    city: {type: String, default: ''},
    state: {type: String, default: ''},
    zipcode: {type: String, default: ''},
    geocode: {
      type: { type: String },
      coordinates: []
    }
  },
  vendorPhone: {type: String, default: ''},
  orders: [{
    type: mongoose.Schema.Types.Object, ref: 'Order', required: false
  }],  
  pickups: [{
    type: mongoose.Schema.Types.Object, ref: 'Pickup', required: false
  }],  
  deliveries: [{
    type: mongoose.Schema.Types.Object, ref: 'Delivery', required: false
  }]  
});

vendorSchema.methods.serialize = function() {
  return {
    userId: this.user || '',
    vendorName: this.vendorName || '',
    vendorLocation: this.location|| '',
    vendorPhone: this.vendorPhone|| '',
    orders: this.orders || '',
    pickups: this.pickups || '',
    deliveries: this.deliveries || []
  };
};

vendorSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
vendorSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v; // delete `__v`
  }
});

module.exports = mongoose.model('Vendor', vendorSchema);

