'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup', required: true },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
  depot: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  orderId: {type: String, unique: true, required:true },
  orderAddress :  {type: String, default: ''},
  orderBusinessName :  {type: String, default: ''},
  orderInstructions:{type: String, default: ''},
  orderRecipient : {type: String, default: ''},
  orderContactPhone :  {type: String, default: ''},
  orderStatus: {type: String, default: 'pending'},
});

orderSchema.methods.serialize = function() {
  return {
    pickup: this.pickup || '',
    delivery: this.delivery || '',
    depot: this.depot || '',
    driver: this.driver || '',
    orderId: this.orderId || '',
    orderAddress :  this.orderAddress || '',
    orderBusinessName :  this.orderBusinessName || '',    
    orderInstructions: this.orderInstructions || '',
    orderRecipient: this.orderRecipient || '',
    orderContactPhone :  this.orderContactPhone || '',
    orderStatus: this.orderStatus || '',
    orderOrderRef :  this.orderOrderRef || ''
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
