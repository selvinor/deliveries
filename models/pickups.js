'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  pickupDate: Date,
  depotId   : { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },   
  driverId  : { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },  
  status    : {type: String, default: ''},
  zone      : { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  vendors: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Vendor'
  }]  
});


pickupSchema.methods.serialize = function() { 
  return {
    pickupDate:  this.pickupDate || '',
    depotId   :  this.depotId || '', 
    driverId  :  this.driverId || '',
    status    :  this.status || '',
    zone      : this.zone|| '',
    vendors    : this.orders|| ''
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
