'use strict';
const mongoose = require('mongoose');


const deliverySchema = new mongoose.Schema({
  deliveryDate: { type: Date},
  depot   : { type: mongoose.Schema.Types.Object, ref: 'Depot' },   
  driver  : { type: mongoose.Schema.Types.Object, ref: 'Driver' },  
  status    : {type: String, default: ''},
  zone      : { type: mongoose.Schema.Types.Object, ref: 'Zone' },
  // vendors    : [{ 
  //   type: mongoose.Schema.Types.Object, ref: 'Vendor' 
  // }],
  orders    : [{ 
    type: mongoose.Schema.Types.Object, ref: 'Order' 
  }]
 });

deliverySchema.methods.serialize = function() { 
  return {
    deliveryDate: this.deliveryDate || '',
    depot   :  this.depot || '', 
    driver  :  this.driver || '',
    status    :  this.status || '',
    zone      : this.zone|| '',
    // vendors    : this.vendors|| '',
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
