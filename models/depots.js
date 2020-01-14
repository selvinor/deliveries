'use strict';
const mongoose = require('mongoose');


const depotSchema = new mongoose.Schema({ 
  depotName:  { type: String },
  streetAddress:  {type: String },
  city:  {type: String },
  state:  {type: String },
  zipcode:  { type: String},
  geocode: {
    type:  {type: String, default: 'Point'},
    coordinates: []
  },
  phone:  { type: String },
  zones : [{
   type: mongoose.Schema.Types.Object, ref: 'Zone' 
  }],
  drivers : [{
    type: mongoose.Schema.Types.Object, ref: 'Driver' 
  }],  
  pickups : [{
    type: mongoose.Schema.Types.Object, ref: 'Pickup' 
  }],  
  deliveries :[{
    type: mongoose.Schema.Types.Object, ref: 'Delivery' 
  }],  
  vendors: [{
    type: mongoose.Schema.Types.Object, ref: 'Vendor'
  }]  
});

depotSchema.methods.serialize = function() { 
  return {
    depotName: this.depotName || '',
    streetAddress: this.streetAddress || '',
    city: this.city || '',
    state: this.state || '',
    zipcode: this.zipcode || '',
    geocode: this.geocode || '',
    phone: this.phone || '',
    zones: this.zones || '',
    drivers: this.drivers || '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries || '',
    vendors: this.vendors || ''
  };
};

// Add `createdAt` and `updatedAt` fields
depotSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
depotSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Depot', depotSchema);
