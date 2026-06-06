const mongoose = require('mongoose');

const OrdenReparacionSchema = new mongoose.Schema({
  nro_orden: {
    type: Number,
    required: true,
    unique: true
  },
  id_equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipos', // Ojo acá: asegurate de que el modelo exportado se llame 'Equipos' o 'Equipo' según tu archivo Equipos.js
    required: true
  },
  id_usuario: { // Este es el Recepcionista
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', 
    required: true
  },
  
  // ---> NUEVO CAMPO: TÉCNICO ASIGNADO <---
  tecnico_asignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },

  estado: {
    type: String,
    enum: ['PENDIENTE DE REVISION', 'EN DIAGNOSTICO' ,'PRESUPUESTADO', 'PRESUPUESTO ACEPTADO', 'PRESUPUESTO RECHAZADO', 'REPARADO', 'ENTREGADO'],
    default: 'PENDIENTE DE REVISION'
  },
  observaciones: {
    type: String,
    default: ''
  },
  fecha_alta: {
    type: Date,
    default: Date.now
  },
  diagnostico: {
    informe: {
      type: String,
      default: ''
    },
    notasInternas: {
      type: String,
      default: ''
    }
  },
  presupuesto: {
    repuestos: [{
      descripcion: { type: String, default: '' },
      cantidad: { type: Number, default: 1 },
      precioUnitario: { type: Number, default: 0 } 
    }],
    manoDeObra: {
      descripcion: { type: String, default: 'Reparación electrónica nivel componente + Mantenimiento' },
      precio: { type: Number, default: 0 }
    },
    notasCliente: {
      type: String,
      default: '' 
    },
    total: {
      type: Number,
      default: 0
    }
  }

}, { 
  versionKey: false,
  timestamps: true 
});

module.exports = mongoose.models.OrdenReparacion || mongoose.model('OrdenReparacion', OrdenReparacionSchema, 'ordenes_reparacion');