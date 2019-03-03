'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const OrderSchema = new mongoose.Schema({
  userId:         {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName :  {type: String, default: ''},
  email :         {type: String, default: ''},
  phone :         {type: String, default: ''},
  productCode:    {type: String, default: ''},
  productName:    {type: String, default: ''},
  productSize:    {type: String, default: ''},
  status:         {type: String, default: 'active'},
  orderDate:      {type: Date, default: null},
  description :   {type: String, default: ''},
  message :       {type: String, default: ''},
  expectedTime :  {type: String, default: null},

});

OrderSchema.methods.serialize = function() {
  return {
    userId:        this.userId || '',
    customerName : this.customerName || '',
    email :        this.email || '',
    phone :        this.phone || '',
    productCode:   this.productCode || '',
    productName:   this.productName || '',
    productSize:   this.productSize || '',
    status:        this.status || '',
    orderDate:     this.orderDate || '',
    description :  this.description || '',
    message :      this.message || '',
    expectedTime : this.expectedTime || '',
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
module.exports = {Order};
