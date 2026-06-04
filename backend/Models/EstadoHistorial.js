const mongoose = require('mongoose');

const EstadoHistorialSchema = new mongoose.Schema({
  id_orden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrdenReparacion', // Apunta al nombre del modelo de abajo
    required: true
  },
  estado: {
    type: String,
    enum: ['PENDIENTE DE REVISION', 'EN DIAGNOSTICO', 'PRESUPUESTADO', 'PRESUPUESTO ACEPTADO', 'PRESUPUESTO RECHAZADO', 'REPARADO', 'ENTREGADO'],
    required: true
  },
  id_usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Apunta al modelo de tus usuarios
    required: true
  },
  fecha_modificacion: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });

module.exports = mongoose.model('EstadoHistorial', EstadoHistorialSchema, 'estados_historial');