'use strict';

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: {type: String, default: ''},
  driverPhone: {type: String, default: ''},
  driverVehicleMake: {type: String, default: ''},
  driverVehicleModel: {type: String, default: ''},
  driverVehiclePlate: {type: String, default: ''},
  pickups: [
    {
      pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' }
    }
  ],
  deliveries: [
    {
      delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' }
    }
  ]
});

driverSchema.methods.serialize = function() {
  return {
    userId: this.userId || '',
    driverName: this.driverName || '',
    driverPhone: this.driverPhone|| '',
    driverVehicleMake: this.driverVehicleMake|| '',
    driverVehicleModel: this.driverVehicleModel|| '',
    driverVehiclePlate: this.driverVehiclePlate|| '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries|| ''
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
