'use strict';
const mongoose = require('mongoose');


const deliverySchema = new mongoose.Schema({
  deliveryDate: { type: Date, default: Date.now},
  depot   : { type: mongoose.Schema.Types.Object, ref: 'Depot' },   
  deliveryStatus    : [{
    status:  { type: String, default: 'dispatching'}, 
     timestamp: {type : Date, default: Date.now}
  }],
  deliveryDriver  : { type: mongoose.Schema.Types.Object, ref: 'Driver' },  
  order: {type: mongoose.Schema.Types.Object, ref: 'Order'  },
  zone      : { type: mongoose.Schema.Types.Object, ref: 'Zone' },
 });

deliverySchema.methods.serialize = function() { 
  return {
    deliveryDate: this.deliveryDate || '',
    depot   :  this.depot || '', 
    deliveryStatus    :  this.deliveryStatus || '',
    deliveryDriver  :  this.deliveryDriver || '',
    order    : this.order || '',
    zone      : this.zone|| ''
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
