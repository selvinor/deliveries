'use strict';
const mongoose = require('mongoose');


const zoneSchema = new mongoose.Schema({ 
  zone :   {type: String, default: ''},
  zoneName :   {type: String, default: ''},
  zoneBoundaries :   {type: String, default: ''},
   drivers : [{
     type: mongoose.Schema.Types.Object, ref: 'Driver' 
   }],  
   pickups : [{
     type: mongoose.Schema.Types.Object, ref: 'Pickup' 
   }],  
   deliveries :[{
     type: mongoose.Schema.Types.Object, ref: 'Delivery' 
   }]  
 });

zoneSchema.methods.serialize = function() { 
  return {
    zone: this.zone|| '',
    zoneName: this.zone|| '',
    zoneBoundaries: this.zone|| '',
    drivers: this.drivers || '',
    pickups: this.pickups|| '',
    deliveries: this.deliveries || ''
  };
};


// Add `createdAt` and `updatedAt` fields
zoneSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
zoneSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Zone', zoneSchema);
