'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  pickup: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  depot: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  orderId: {type: String, unique: true, required:true },
  orderAddress :  {type: String, default: ''},
  orderBusinessName :  {type: String, default: ''},
  orderInstructions:{type: String, default: ''},
  orderRecipient : {type: String, default: ''},
  orderRecipientPhone :  {type: String, default: ''},
  orderStatus: {type: String, default: 'pending'},
  orderZone: { type: mongoose.Schema.Types.ObjectId, ref: 'orderZone' }
});

orderSchema.methods.serialize = function() {
  return {
    pickup: this.user || '',
    depot: this.user || '',
    driver: this.user || '',
    orderId: this.orderId || '',
    orderAddress :  this.orderAddress || '',
    orderBusinessName :  this.orderBusinessName || '',    
    orderInstructions: this.orderInstructions || '',
    orderRecipient: this.orderRecipient || '',
    orderRecipientPhone :  this.orderRecipientPhone || '',
    orderStatus: this.orderStatus || '',
    orderOrderRef :  this.orderOrderRef || '',
    orderZone: this.orderZone || ''
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
