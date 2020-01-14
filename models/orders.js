'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  orderNumber: {type: String, default: ''},
  orderAddress :  {type: String, default: ''},
  orderBusinessName :  {type: String, default: ''},
  orderInstructions:{type: String, default: ''},
  orderRecipient : {type: String, default: ''},
  orderRecipientPhone :  {type: String, default: ''},
  orderStatus: {type: String, default: 'pending'},
  orderOrderRef: {type: String, default: ''},
  orderZone: { type: mongoose.Schema.Types.ObjectId, ref: 'orderZone' }
});

OrderSchema.methods.serialize = function() {
  return {
    user: this.user || '',
    orderNumber: this.orderNumber || '',
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
const Order = mongoose.model('Order', OrderSchema);
// Add `createdAt` and `updatedAt` fields
OrderSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
OrderSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});
module.exports = { Order };
