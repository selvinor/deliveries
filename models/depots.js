'use strict';
const mongoose = require('mongoose');


const depotSchema = new mongoose.Schema({ 
  depotName:  { type: String, required: true },
  streetAddress:  {type: String, required: true },
  city:  {type: String,  required: true },
  state:  {type: String,  required: true },
  zipcode:  { type: String, required: true, default: '' },
  geocode: {
    type:  {type: String, default: 'Point'},
    coordinates: []
  },
  zones : [{
   type: mongoose.Schema.Types.ObjectId, ref: 'Zone' 
  }],
  drivers : [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Driver' 
  }],  
  pickups : [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' 
  }],  
  deliveries :[{
    type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' 
  }],  
  orders: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Order'
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
    zones: this.zones || '',
    drivers: this.drivers || '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries || '',
    orders: this.orders || ''
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
