'use strict';
const mongoose = require('mongoose');


const zoneSchema = new mongoose.Schema({ 
  zones : [{type: String, default: ''}]
});

zoneSchema.methods.serialize = function() { 
  return {
    zones: this.zones|| ''
  };
};


// Add `createdAt` and `updatedAt` fields
zoneSchema.set('timestamps', true);

// Customize output for `res.json(data)`, `console.log(data)` etc.
zoneSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Zone', zoneSchema);
