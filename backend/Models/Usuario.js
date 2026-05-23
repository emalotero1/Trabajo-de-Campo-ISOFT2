const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  cel: Number,
  // ACTUALIZADO: Agregamos "control" al enum
  rol: { 
    type: String, 

    enum: ["administrador", "tecnico", "recepcionista"], 
    default: "recepcionista",

    lowercase: true 
  },
  created_at: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'SYSTEM_ROOT' },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "Users");