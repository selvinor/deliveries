'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const driverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  driverPassword: { type: String, required: true },
  driverName: {type: String, default: ''},
  driverEmail: {type: String, default: ''},
  driverPhone: {type: String, default: ''},
  driverVehicleType: {type: String, default: ''},
  driverVehiclePlate: {type: String, default: ''},
  driverDeliveries: [
    {
      delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'delivery' }
    }
  ]
});

driverSchema.methods.serialize = function() {
  return {
    driverId: this.driverId || '',
    driverPassword: { type: String, required: true },
    driverName: this.driverName || '',
    driverEmail: this.driverEmail|| '',
    driverPhone: this.driverPhone|| '',
    driverVehicleType: this.driverVehicleType|| '',
    driverPhone: this.driverPhone|| '',
    driverVehiclePlate: this.driverVehiclePlate|| '',
    driverDeliveries: this.driverDeliveries|| ''
  };
};

driverSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

driverSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const driver = mongoose.model('driver', driverSchema);
// Add `createdAt` and `updatedAt` fields
driverSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
driverSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.password; // delete `_id`
  }
});


module.exports = {driver};
