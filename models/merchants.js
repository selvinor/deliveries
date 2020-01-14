'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streetAddress: {type: String, default: ''},
  businessName: {type: String, default: ''},
  contactPerson: {type: String, default: ''},
  email: {type: String, default: ''},
  phone: {type: String, default: ''},
  orders: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'order' }
    }
  ]
});

userSchema.methods.serialize = function() { 
  return {
    userId: this.user || '',
    streetAddress: this.streetAddress || '',
    businessName: this.businessName || '',
    contactPerson: this.businessName || '',
    email: this.email|| '',
    phone: this.phone|| '',
    orders: this.orders|| ''
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('user', userSchema);
// Add `createdAt` and `updatedAt` fields
userSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
userSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.password; // delete `_id`
    delete ret.__v;
  }
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, 
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
    delete ret.__v;
  }
});

module.exports = { User };
