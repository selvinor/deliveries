'use strict';

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Object, ref: 'User', required: false },  
  orderNumber: {type: String, unique: false },
  orderDate: { type: Date},
  orderDetails : {type: String, default: ''},
  orderStatus : {type: String, default: 'pending'},
  orderSize : {type: String, default: ''},
  vendor: { type: mongoose.Schema.Types.Object, ref: 'Vendor' },
  pickup: { type: mongoose.Schema.Types.Object, ref: 'Pickup' },
  delivery: { type: mongoose.Schema.Types.Object, ref: 'Delivery' },
  deliveryDate: { type: Date},
  destination : {
    recipient : {type: String, default: ''},
    recipientPhone :  {type: String, default: ''},  
    businessName :  {type: String, default: ''},
    streetAddress :  {type: String, default: ''},
    city: {type: String, default: ''},
    state: {type: String, default: ''},
    zipcode: {type: String, default: ''},
    geocode: {
      type: { type: String },
      coordinates: []
    },
    instructions:{type: String, default: ''}
  },
});

orderSchema.methods.serialize = function() {
  return {
    userId:this.userId || '',
    orderNumber: this.orderNumber || '',
    orderDate: this.orderDate || '',
    orderDetails: this.orderDetails|| '',
    orderStatus: this.orderNumber || '',
    orderSize: this.orderSize || '',
    vendor: this.vendor || {},
    pickup: this.pickup || {},
    delivery: this.delivery || {},                    
    deliveryDate: this.deliveryDate || '',                    
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
