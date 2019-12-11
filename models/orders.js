'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Object, ref: 'User', required: false },  
  vendorOrderRef: {type: String, unique: false, required:true },
  orderDate: { type: Date},
  deliveryDate: { type: Date},
  vendor: { type: mongoose.Schema.Types.Object, ref: 'Vendor', required: true },
  pickup: { type: mongoose.Schema.Types.Object, ref: 'Pickup', required: true },
  delivery: { type: mongoose.Schema.Types.Object, ref: 'Delivery', required: true },
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
    userId:this.userId || '',
    vendorOrderRef: this.vendorOrderRef || '',
    orderDate: this.orderDate || '',
    deliveryDate: this.deliveryDate || '',                    
    vendor: this.vendor || '',
    pickup: this.pickup|| '',
    delivery: this.delivery|| '',
    destination: this.destination|| ''
  };
};

orderSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
orderSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`,
    delete ret.__v; // delete `__v`
  }
});
module.exports = mongoose.model('Order', orderSchema);
