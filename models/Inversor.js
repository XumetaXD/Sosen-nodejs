const mongoose = require('mongoose');

const InversorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    required: true
  },
  soc: {
    type: Number,
    required: false
  },
  potencia: {
    type: Number,
    required: false
  },
  CargaDescarga: {
    type: Number,
    required: false
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inversor', InversorSchema);
