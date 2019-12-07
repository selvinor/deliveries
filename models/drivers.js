'use strict';

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.Object, ref: 'User', required: true },
  driverName: {type: String, default: ''},
  driverPhone: {type: String, default: ''},
  driverVehicleMake: {type: String, default: ''},
  driverVehicleModel: {type: String, default: ''},
  driverVehiclePlate: {type: String, default: '', unique: true},
   pickups : [{
     type: mongoose.Schema.Types.Object, ref: 'Pickup' 
   }],  
   deliveries :[{
     type: mongoose.Schema.Types.Object, ref: 'Delivery' 
   }]
  });

driverSchema.methods.serialize = function() {
  return {
    user: this.user || '',
    driverName: this.driverName || '',
    driverPhone: this.driverPhone|| '',
    driverVehicleMake: this.driverVehicleMake|| '',
    driverVehicleModel: this.driverVehicleModel|| '',
    driverVehiclePlate: this.driverVehiclePlate|| '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries|| ''
  };
};


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

module.exports = mongoose.model('Driver', driverSchema);
