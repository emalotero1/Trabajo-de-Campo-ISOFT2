const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  lastname: { type: String, trim: true },
  email: { 
    type: String, 
    unique: true, 
    sparse: true, // <-- Evita errores si guardas varios clientes sin email
    lowercase: true, 
    trim: true 
  },
  domicilio: { type: String, trim: true },
  cel: Number,
  created_at: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'SYSTEM_ROOT' },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.models.Client || mongoose.model("Client", userSchema, "Clients");