'use strict';
const mongoose = require('mongoose');


const zoneSchema = new mongoose.Schema({ 
  zone :   {type: String, default: ''},
  drivers : [{driver:{ type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }}],  
  pickups : [{pickup:{ type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' }}],  
  deliveries :[{delivery:{ type: mongoose.Schema.Types.ObjectId, ref: 'Delivery'} }]  
});

zoneSchema.methods.serialize = function() { 
  return {
    zone: this.zone|| '',
    drivers: this.drivers || '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries || ''
  };
};


// Add `createdAt` and `updatedAt` fields
zoneSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
zoneSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Zone', zoneSchema);
