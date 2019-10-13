'use strict';');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  driverName: {type: String, default: ''},
  driverPhone: {type: String, default: ''},
  driverVehicleMake: {type: String, default: ''},
  driverVehicleModel: {type: String, default: ''},
  driverVehiclePlate: {type: String, default: ''},
  driverDeliveries: [
    {
      order: { type: mongoose.Schema.Types.ObjectId, ref: 'order' }
    }
  ]
});

driverSchema.methods.serialize = function() {
  return {
    userId: this.user || '',
    driverName: this.driverName || '',
    driverPhone: this.driverPhone|| '',
    driverVehicleType: this.driverVehicleType|| '',
    driverPhone: this.driverPhone|| '',
    driverVehiclePlate: this.driverVehiclePlate|| '',
    driverDeliveries: this.driverDeliveries|| ''
  };
};

const Driver = mongoose.model('driver', driverSchema);
// Add `createdAt` and `updatedAt` fields
driverSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
driverSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = {Driver};
