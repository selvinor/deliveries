'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
	email:  { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
	vendor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor'},
	driver: {type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
	depot: {type: mongoose.Schema.Types.ObjectId, ref: 'Depot'}
})

userSchema.set('toObject', {
	virtuals: true,
	versionKey: false,
	transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
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

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};


module.exports = mongoose.model('User', userSchema);