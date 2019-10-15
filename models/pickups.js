'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orders: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }
  ]
});

pickupSchema.methods.serialize = function() { 
  return {
    user: this.user || '',
    vendorName: this.vendorName || '',
    streetAddress: this.streetAddress || '',
    vendorEmail: this.vendorName || '',
    phone: this.phone|| '',
    orders: this.orders|| ''
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
