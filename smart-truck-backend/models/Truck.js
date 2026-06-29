const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  truckId: { type: Number, required: true },
  truckType: {
    type: String,
    enum: ['Dump Truck', 'Fuso'],
    required: true
  },
  driver: { type: String, required: true },
  status: {
    type: String,
    enum: ['onprogress', 'finished', 'trouble'],
    default: 'onprogress'
  },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('Truck', truckSchema);
