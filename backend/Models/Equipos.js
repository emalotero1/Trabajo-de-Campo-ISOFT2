const mongoose = require("mongoose");

const equipoSchema = new mongoose.Schema({
  // Relación obligatoria con el cliente (guarda el _id del cliente)
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Client",
    required: true 
  },
  
  // Especificaciones técnicas
  mother: { type: String, trim: true, default: "" },
  cpu: { type: String, trim: true, default: "" },
  ram: { type: String, trim: true, default: "" },
  gpu: { type: String, trim: true, default: "" }, 
  fuente: { type: String, trim: true, default: "" },
  gabinete: { type: String, trim: true, default: "" },
  discos: { type: String, trim: true, default: "" },
  // Reporte del problema
  fallaReportada: { type: String, trim: true, default: "" },
  
  // Bandera de disponibilidad lógica
  asignadoAOrden: { type: Boolean, default: false },
  
  // Datos de auditoría
  created_at: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'SYSTEM_ROOT' }
});

// Exportamos el modelo forzando el nombre de la colección a "Equipos" para que coincida con tu MongoDB
module.exports = mongoose.models.Equipo || mongoose.model("Equipo", equipoSchema, "Equipos");