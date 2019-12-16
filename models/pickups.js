'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupDate: { type: Date},
  depot   : { type: mongoose.Schema.Types.Object, ref: 'Depot' },   
  pickupTimeSlot: { type: String, default: 'pm'},
  pickupDetails: { type: mongoose.Schema.Types.Object, ref: 'Vendor' },
  pickupStatus : {type: String, default: ''},
  pickupDriver: { type: mongoose.Schema.Types.Object, ref: 'Driver', required: false },  
  zone   : { type: mongoose.Schema.Types.Object, ref: 'Zone' }
});


pickupSchema.methods.serialize = function() { 
  return {
    pickupDate:  this.pickupDate || '',
    depot   :  this.depot || '', 
    pickupTimeSlot    : this.pickupTimeSlot|| '',
    pickupDetails    : this.pickupDetails|| '',
    pickupStatus    :  this.pickupStatus || '',
    pickupDriver  :  this.pickupDriver || '',
    zone      : this.zone|| ''
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
