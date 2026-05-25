const mongoose = require('mongoose');

const OrdenReparacionSchema = new mongoose.Schema({
  nro_orden: {
    type: Number,
    required: true,
    unique: true
  },
  id_equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipos',
    required: true
  },
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', 
    required: true
  },
  estado: {
    type: String,
    enum: ['INGRESADO', 'EN REVISION', 'PRESUPUESTADO', 'EN REPARACION', 'ENTREGADO', 'RECHAZADO'],
    default: 'INGRESADO'
  },
  fecha_alta: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

module.exports = mongoose.model('OrdenReparacion', OrdenReparacionSchema, 'ordenes_reparacion');