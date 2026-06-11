const Equipo = require('../Models/Equipos');
const OrdenReparacion = require('../Models/OrdenReparacion');
const Client = require('../models/Client');
const { validationResult } = require('express-validator');

// --- 1. REGISTRAR (ALTA DE EQUIPO) ---
const register = async (req, res) => {
    const { clienteId, mother, cpu, ram, gpu, fuente, gabinete, discos, fallaReportada } = req.body;

    // Validación estricta: No se puede registrar un equipo sin un cliente asociado
    if (!clienteId) {
        return res.status(400).json({ status: "error", message: "DEBE VINCULAR UN CLIENTE AL EQUIPO OBLIGATORIAMENTE." });
    }

    // Validación estricta: Todos los componentes de hardware son obligatorios
    if (!mother || !cpu || !ram || !gpu || !fuente || !gabinete || !discos) {
        return res.status(400).json({ status: "error", message: "TODOS LOS COMPONENTES SON OBLIGATORIOS." });
    }

    // Validación estricta: La falla reportada debe tener al menos 15 caracteres para asegurar una descripción mínima del problema
    if (!fallaReportada || fallaReportada.trim().length < 15) {
        return res.status(400).json({ status: "error", message: "EL REPORTE DE SERVICIO DEBE DETALLAR AL MENOS 15 CARACTERES." });
    }
    try {
        // Verificamos que el cliente realmente exista en la base de datos
        const existingClient = await Client.findById(clienteId);
        if (!existingClient || !existingClient.active) {
            return res.status(404).json({ status: "error", message: "CLIENTE NO ENCONTRADO O INACTIVO" });
        }

        const userLogueado = req.user && req.user.username ? req.user.username : 'SYSTEM ROOT';

        // Crear el equipo relacionándolo con el ObjectId del cliente
        const newEquipo = new Equipo({
            cliente: clienteId, // Acá establecemos la relación
            mother: mother.trim(),
            cpu: cpu.trim(),
            ram: ram.trim(),
            gpu: gpu.trim(),
            fuente: fuente.trim(),
            gabinete: gabinete.trim(),
            discos: discos.trim(),
            fallaReportada: fallaReportada ? fallaReportada.trim() : "", 
            createdBy: userLogueado
        });

        await newEquipo.save();

        return res.status(201).json({
            status: "success",
            message: "EQUIPO REGISTRADO OK",
            equipo: newEquipo
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR INTERNO DEL SERVIDOR" });
    }
};
// --- 2. LISTAR EQUIPOS EN ESPERA ---
const list = async (req, res) => {
    try {
        // Traemos directamente los equipos que NO estén marcados como asignados.
      
        const equipos = await Equipo.find({
            asignadoAOrden: false // Solo traemos los equipos que no están asignados a ninguna orden de reparación
        })
        .populate('cliente', 'name lastname email dni cel') 
        .select("-__v") 
        .sort({ _id: -1 }); 

        return res.status(200).json({
            status: "success",
            count: equipos.length,
            equipos
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR AL LISTAR" });
    }
};

// --- 3. EDITAR ---
const update = async (req, res) => {
    const equipoId = req.params.id;
    const dataToUpdate = { ...req.body };

    // Evitamos que cambien el cliente asignado por error en una actualización
    if (dataToUpdate.clienteId || dataToUpdate.cliente) {
        delete dataToUpdate.clienteId;
        delete dataToUpdate.cliente;
    }

    try {
        const equipoUpdated = await Equipo.findByIdAndUpdate(
            equipoId, 
            { $set: dataToUpdate }, 
            { new: true, runValidators: true } 
        ).populate('cliente', 'name lastname').select("-__v");

        return res.status(200).json({ status: "success", equipo: equipoUpdated });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR ACTUALIZACION" });
    }
};


module.exports = { register, list, update };