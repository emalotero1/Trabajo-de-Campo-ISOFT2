const mongoose = require("mongoose");

const equipoSchema = new mongoose.Schema({
  // Relación obligatoria con el cliente (guarda el _id del cliente)
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Client", // Debe coincidir exactamente con el nombre del modelo de Cliente
    required: true 
  },
  
  // Especificaciones técnicas
  cpu: { type: String, trim: true, default: "" },
  ram: { type: String, trim: true, default: "" },
  gpu: { type: String, trim: true, default: "" }, // Placa de video
  fuente: { type: String, trim: true, default: "" },
  gabinete: { type: String, trim: true, default: "" },
  
  // Reporte del problema
  fallaReportada: { type: String, trim: true, default: "" },
  
  // Datos de auditoría
  created_at: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'SYSTEM_ROOT' }
});

// Exportamos el modelo forzando el nombre de la colección a "Equipos" para que coincida con tu MongoDB
module.exports = mongoose.models.Equipo || mongoose.model("Equipo", equipoSchema, "Equipos");