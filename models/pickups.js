'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const pickupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  streetAddress: {type: String, default: ''},
  businessName: {type: String, default: ''},
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
    streetAddress: this.streetAddress || '',
    businessName: this.businessName || '',
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
