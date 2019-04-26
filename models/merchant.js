'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const merchantSchema = new mongoose.Schema({
  merchantId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streetAddress: {type: String, default: ''},
  businessName: {type: String, default: ''},
  email: {type: String, default: ''},
  phone: {type: String, default: ''},
  deliveries: [
    {
      delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'delivery' }
    }
  ]
});

merchantSchema.methods.serialize = function() {
  return {
    merchantId: this.merchant || '',
    streetAddress: this.streetAddress || '',
    businessName: this.businessName || '',
    email: this.email|| '',
    phone: this.phone|| '',
    deliveries: this.deliveries|| ''
  };
};

merchantSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

merchantSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const merchant = mongoose.model('merchant', merchantSchema);
// Add `createdAt` and `updatedAt` fields
merchantSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
merchantSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.password; // delete `_id`
  }
});


module.exports = {merchant};
