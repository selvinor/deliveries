'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Object, ref: 'User', required: true },
  order: {
    orderDate: { type: Date},
    deliveryDate: { type: Date},
    vendor: { type: mongoose.Schema.Types.Object, ref: 'Vendor', required: true },
    vendorOrderRef: {type: String, unique: false, required:true },
    destination : {
      businessName :  {type: String, default: ''},
      streetAddress :  {type: String, default: ''},
      city: {type: String, default: ''},
      state: {type: String, default: ''},
      zipcode: {type: String, default: ''},
      geocode: {
        type: { type: String },
        coordinates: []
      },
      instructions:{type: String, default: ''},
      recipient : {type: String, default: ''},
      contactPhone :  {type: String, default: ''}  
    }  
  },
  pickup: { type: mongoose.Schema.Types.Object, ref: 'Pickup', required: true },
  delivery: { type: mongoose.Schema.Types.Object, ref: 'Delivery', required: true }

});

orderSchema.methods.serialize = function() {
  return {
    userId:this.userId || '',
    orderDate: this.order.orderDate || '',
    deliveryDate: this.order.deliveryDate || '',                    
    vendor: this.order.vendor || '',
    vendorOrderRef: this.order.vendorOrderRef || '',
    destination: this.order.destination|| '',
    pickup: this.order.pickup|| '',
    delivery: this.order.delivery|| ''
  };
};
// const Order = mongoose.model('Order', OrderSchema);
// Add `createdAt` and `updatedAt` fields
orderSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
orderSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});
module.exports = mongoose.model('Order', orderSchema);
