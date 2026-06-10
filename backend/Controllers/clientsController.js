const Client = require('../models/Client'); 
const Equipo = require('../models/Equipos'); 
const OrdenReparacion = require('../models/OrdenReparacion'); 
const { validationResult } = require('express-validator');

// --- 1. REGISTRAR (ALTA DE CLIENTE) ---
const register = async (req, res) => {
    const { name, lastname, email, domicilio, cel } = req.body;

    try {
        let emailLower = undefined; // Usamos undefined para que Mongoose no intente guardar un string vacío como unique

        // Solo verificamos duplicados si enviaron un email
        if (email && email.trim() !== "") {
            emailLower = email.toLowerCase().trim();
            const existingClient = await Client.findOne({ email: emailLower });

            if (existingClient) {
                return res.status(409).json({ status: "error", message: "EL EMAIL YA ESTÁ REGISTRADO EN OTRO CLIENTE" });
            }
        }

        const userLogueado = req.user && req.user.username ? req.user.username : 'SYSTEM ROOT';

        // Crear cliente (los campos vacíos se guardarán como manda tu Schema relajado)
        const newClient = new Client({
            name: name ? name.trim() : "",
            lastname: lastname ? lastname.trim() : "",
            email: emailLower, 
            domicilio: domicilio ? domicilio.trim() : "",
            cel: cel || null,
            createdBy: userLogueado,
            active: true
        });

        await newClient.save();

        return res.status(201).json({
            status: "success",
            message: "CLIENTE REGISTRADO OK",
            client: newClient
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR INTERNO DEL SERVIDOR" });
    }
};

// --- 2. LISTAR ---
const list = async (req, res) => {
    try {
        // Quitamos el filtro { active: true } para verificar si aparecen
        const clients = await Client.find({}) 
            .select("-__v") 
            .sort({ lastname: 1 }); 

        return res.status(200).json({
            status: "success",
            clients
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR AL LISTAR" });
    }
};

// --- 3. EDITAR ---
const update = async (req, res) => {
    const clientId = req.params.id;
    const dataToUpdate = { ...req.body };

    try {
        const clientToEdit = await Client.findById(clientId);
        if (!clientToEdit) return res.status(404).json({ status: "error", message: "CLIENTE NO ENCONTRADO" });

        // Si se actualiza el email, nos aseguramos de guardarlo en minúsculas y sin espacios
        if (dataToUpdate.email && dataToUpdate.email.trim() !== "") {
            dataToUpdate.email = dataToUpdate.email.toLowerCase().trim();
        } else if (dataToUpdate.email === "") {
            // Si mandan un string vacío, lo limpiamos para no chocar con el índice unique
            dataToUpdate.email = undefined; 
        }

        const clientUpdated = await Client.findByIdAndUpdate(
            clientId, 
            { $set: dataToUpdate }, 
            { new: true, runValidators: true } 
        ).select("-__v");

        return res.status(200).json({ status: "success", client: clientUpdated });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", message: "EL EMAIL YA ESTÁ EN USO POR OTRO CLIENTE" });
        }
        return res.status(500).json({ status: "error", message: "ERROR ACTUALIZACION" });
    }
};

// --- 4. ELIMINAR (BORRADO LÓGICO CON INTEGRIDAD REFERENCIAL) ---
const removeLogical = async (req, res) => {
    const clientId = req.params.id;

    try {
        // 1. Buscamos todos los equipos asociados a este cliente
        const equiposDelCliente = await Equipo.find({ cliente: clientId });
        
        if (equiposDelCliente.length > 0) {
            // Extraemos los IDs de los equipos en un arreglo
            const idsEquipos = equiposDelCliente.map(eq => eq._id);

            // 2. Buscamos si existe alguna orden de reparación abierta para esos equipos
            // (Consideramos que ENTREGADO y PRESUPUESTO RECHAZADO son circuitos cerrados)
            const ordenActiva = await OrdenReparacion.findOne({
                id_equipo: { $in: idsEquipos },
                estado: { $nin: ['ENTREGADO', 'PRESUPUESTO RECHAZADO'] } 
            });

            // 3. Si hay una orden activa, frenamos la ejecución y enviamos el error 400
            if (ordenActiva) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "NO SE PUEDE DESACTIVAR: EL CLIENTE TIENE EQUIPOS EN EL TALLER." 
                });
            }
        }

        // 4. Si no hay órdenes activas (o no tiene equipos), procedemos a desactivarlo
        const clientDeleted = await Client.findByIdAndUpdate(
            clientId, 
            { active: false }, 
            { new: true }
        );

        if (!clientDeleted) {
            return res.status(404).json({ status: "error", message: "CLIENTE INEXISTENTE" });
        }

        return res.status(200).json({ status: "success", message: "CLIENTE DESACTIVADO CORRECTAMENTE" });
        
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR INTERNO DEL SERVIDOR AL ELIMINAR" });
    }
};

module.exports = { register, list, update, removeLogical };