'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  vendors: [
    {
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }
    }
  ]
});

pickupSchema.methods.serialize = function() { 
  return {
    vendors: this.vendors || ''
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
