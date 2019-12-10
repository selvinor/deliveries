'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupDate: { type: Date},
  depot   : { type: mongoose.Schema.Types.Object, ref: 'Depot' },   
  driver  : { type: mongoose.Schema.Types.Object, ref: 'Driver' },  
  status  : {type: String, default: ''},
  zone    : { type: mongoose.Schema.Types.Object, ref: 'Zone' },
  vendors: [{
    type: mongoose.Schema.Types.Object, ref: 'Vendor'
  }],  
  orders: [{
    type: mongoose.Schema.Types.Object, ref: 'Order'
  }]  
});


pickupSchema.methods.serialize = function() { 
  return {
    pickupDate:  this.pickupDate || '',
    depot   :  this.depot || '', 
    driver  :  this.driver || '',
    status    :  this.status || '',
    zone      : this.zone|| '',
    vendors    : this.vendors|| '',
    orders    : this.orders|| ''
  };
};


// Add `createdAt` and `updatedAt` fields
pickupSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
pickupSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Pickup', pickupSchema);
