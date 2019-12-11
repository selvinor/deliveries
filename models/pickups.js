'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupDate: { type: Date},
  depot   : { type: mongoose.Schema.Types.Object, ref: 'Depot' },   
  pickupDriver  : { type: mongoose.Schema.Types.Object, ref: 'Driver' },  
  pickupStatus  : {type: String, default: ''},
  zone    : { type: mongoose.Schema.Types.Object, ref: 'Zone' },
  vendor: {
    type: mongoose.Schema.Types.Object, ref: 'Vendor'
  }  
});


pickupSchema.methods.serialize = function() { 
  return {
    pickupDate:  this.pickupDate || '',
    depot   :  this.depot || '', 
    pickupDriver  :  this.pickupDriver || '',
    pickupStatus    :  this.pickupStatus || '',
    zone      : this.zone|| '',
    vendor    : this.vendor|| ''
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
