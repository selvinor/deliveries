'use strict';
const mongoose = require('mongoose');


const deliverySchema = new mongoose.Schema({
  depotId   : { type: mongoose.Schema.Types.ObjectId, ref: 'Depot' },   
  driverId  : { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },  
  status    : {type: String, default: ''},
  zone      : { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  orders    : [
    { order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }}
  ]
 });

deliverySchema.methods.serialize = function() { 
  return {
    depotId   :  this.depotId || '', 
    driverId  :  this.driverId || '',
    status    :  this.status || '',
    zone      : this.zone|| '',
    orders    : this.orders|| ''
   };
};


// Add `createdAt` and `updatedAt` fields
deliverySchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
deliverySchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Delivery', deliverySchema);
