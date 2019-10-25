'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  pickupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup', required: true },
  deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
  vendorOrderNum: {type: String, unique: false, required:true },
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
});

orderSchema.methods.serialize = function() {
  return {
    vendor: this.vendor || '',
    pickupId: this.pickupId || '',
    deliveryId: this.deliveryId || '',
    vendorOrderNum: this.vendorOrderNum || '',
    destination: this.destination|| ''
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
