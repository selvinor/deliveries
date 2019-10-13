'use strict';
const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  businessName: {type: String, default: ''},
  streetAddress: {type: String, default: ''},
  contactEmail: {type: String, default: ''},
  phone: {type: String, default: ''},
  orders: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'order' }
    }
  ]
});

pickupSchema.methods.serialize = function() { 
  return {
    user: this.user || '',
    businessName: this.businessName || '',
    streetAddress: this.streetAddress || '',
    contactEmail: this.businessName || '',
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

module.exports = mongoose.model('Merchant', pickupSchema);
