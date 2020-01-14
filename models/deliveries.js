'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const DeliverySchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'merchant', required: true },
  deliveryNumber: {type: String, default: ''},
  deliveryAddress :  {type: String, default: ''},
  deliveryBusinessName :  {type: String, default: ''},
  deliveryInstructions:{type: String, default: ''},
  deliveryRecipient : {type: String, default: ''},
  deliveryRecipientPhone :  {type: String, default: ''},
  deliveryStatus: {type: String, default: 'pending'},
  deliveryOrderRef: {type: String, default: ''},
  deliveryZone: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryZone' }
});

DeliverySchema.methods.serialize = function() {
  return {
    merchant: this.merchant || '',
    deliveryNumber: this.deliveryNumber || '',
    deliveryAddress :  this.deliveryAddress || '',
    deliveryBusinessName :  this.deliveryBusinessName || '',    
    deliveryInstructions: this.deliveryInstructions || '',
    deliveryRecipient: this.deliveryRecipient || '',
    deliveryRecipientPhone :  this.deliveryRecipientPhone || '',
    deliveryStatus: this.deliveryStatus || '',
    deliveryOrderRef :  this.deliveryOrderRef || '',
    deliveryZone: this.deliveryZone || ''
  };
};
const Delivery = mongoose.model('Delivery', DeliverySchema);
// Add `createdAt` and `updatedAt` fields
DeliverySchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
DeliverySchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});
module.exports = {Delivery};
