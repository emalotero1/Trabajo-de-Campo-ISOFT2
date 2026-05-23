const Equipo = require('../models/Equipo'); 
const Client = require('../models/Client'); // Importamos el modelo de cliente para validar su existencia
const { validationResult } = require('express-validator');

// --- 1. REGISTRAR (ALTA DE EQUIPO) ---
const register = async (req, res) => {
    const { clienteId, cpu, ram, gpu, fuente, gabinete, fallaReportada } = req.body;

    // Validación estricta: No se puede registrar un equipo sin un cliente asociado
    if (!clienteId) {
        return res.status(400).json({ status: "error", message: "EL EQUIPO DEBE ESTAR ASOCIADO A UN CLIENTE" });
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
            cpu: cpu ? cpu.trim() : "",
            ram: ram ? ram.trim() : "",
            gpu: gpu ? gpu.trim() : "",
            fuente: fuente ? fuente.trim() : "",
            gabinete: gabinete ? gabinete.trim() : "",
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
        console.error("ERROR EN REGISTRO DE EQUIPO:", error);
        return res.status(500).json({ status: "error", message: "ERROR INTERNO DEL SERVIDOR" });
    }
};

// --- 2. LISTAR ---
const list = async (req, res) => {
    try {
        // Usamos populate('cliente') para traer los datos del dueño del equipo
        const equipos = await Equipo.find()
            .populate('cliente', 'name lastname email dni cel') // Trae solo los datos útiles del cliente
            .select("-__v") 
            .sort({ _id: -1 }); // Ordenamos del más nuevo al más viejo

        return res.status(200).json({
            status: "success",
            equipos
        });
    } catch (error) {
        console.error("ERROR AL LISTAR EQUIPOS:", error);
        return res.status(500).json({ status: "error", message: "ERRORAL LISTAR" });
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
        const equipoToEdit = await Equipo.findById(equipoId);
        if (!equipoToEdit) return res.status(404).json({ status: "error", message: "EQUIPO NO ENCONTRADO" });

        const equipoUpdated = await Equipo.findByIdAndUpdate(
            equipoId, 
            { $set: dataToUpdate }, 
            { new: true, runValidators: true } 
        ).populate('cliente', 'name lastname').select("-__v");

        return res.status(200).json({ status: "success", equipo: equipoUpdated });
    } catch (error) {
        console.error("ERROR ACTUALIZANDO EQUIPO:", error);
        return res.status(500).json({ status: "error", message: "ERROR ACTUALIZACION" });
    }
};


module.exports = { register, list, update };