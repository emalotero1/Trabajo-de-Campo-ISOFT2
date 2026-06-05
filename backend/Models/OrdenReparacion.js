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
      precioUnitario: { type: Number, default: 0 } // Reemplaza 'costo' para calcular cantidad * precio unitario
    }],
    manoDeObra: {
      descripcion: { type: String, default: 'Reparación electrónica nivel componente + Mantenimiento' },
      precio: { type: Number, default: 0 }
    },
    notasCliente: {
      type: String,
      default: '' // Para el campo de texto inferior derecho de tu mockup ("Notas para el Cliente")
    },
    total: {
      type: Number,
      default: 0
    }
  }

}, { 
  versionKey: false,
  timestamps: true  // crea createdAt y updatedAt automáticamente para saber cuándo se editó por última vez.
});

module.exports = mongoose.models.OrdenReparacion || mongoose.model('OrdenReparacion', OrdenReparacionSchema, 'ordenes_reparacion');