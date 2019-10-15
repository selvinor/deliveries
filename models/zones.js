'use strict';
const mongoose = require('mongoose');


const zoneSchema = new mongoose.Schema({ 
  zone : [
    {type: String, default: ''}
  ],
  pickups : [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Pickup'}
  ],
  deliveries : [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Delivery'}
  ]
});

zoneSchema.methods.serialize = function() { 
  return {
    zone: this.zone|| ''
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
