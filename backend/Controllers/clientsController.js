const Client = require('../models/Client'); 
const { validationResult } = require('express-validator');

// --- 1. REGISTRAR (ALTA DE CLIENTE) ---
const register = async (req, res) => {
    const { name, lastname, email, domicilio, cel } = req.body;

    // ELIMINAMOS el bloque de if(!name || !lastname...) para permitir datos opcionales

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

        const adminLogueado = req.user && req.user.username ? req.user.username : 'SYSTEM_ROOT';

        // Crear cliente (los campos vacíos se guardarán como manda tu Schema relajado)
        const newClient = new Client({
            name: name ? name.trim() : "",
            lastname: lastname ? lastname.trim() : "",
            email: emailLower, 
            domicilio: domicilio ? domicilio.trim() : "",
            cel: cel || null,
            createdBy: adminLogueado,
            active: true
        });

        await newClient.save();

        return res.status(201).json({
            status: "success",
            message: "CLIENTE REGISTRADO CON ÉXITO",
            client: newClient
        });

    } catch (error) {
        console.error("ERROR EN REGISTRO DE CLIENTE:", error);
        return res.status(500).json({ status: "error", message: "ERROR_INTERNO_SERVIDOR" });
    }
};

// --- 2. LISTAR ---
const list = async (req, res) => {
    try {
        const clients = await Client.find({ active: true })
            .select("-__v") 
            .sort({ lastname: 1 }); 

        return res.status(200).json({
            status: "success",
            clients
        });
    } catch (error) {
        console.error("ERROR AL LISTAR CLIENTES:", error);
        return res.status(500).json({ status: "error", message: "ERROR_AL_LISTAR" });
    }
};

// --- 3. EDITAR ---
const update = async (req, res) => {
    const clientId = req.params.id;
    const dataToUpdate = { ...req.body };

    try {
        const clientToEdit = await Client.findById(clientId);
        if (!clientToEdit) return res.status(404).json({ status: "error", message: "CLIENTE_NO_ENCONTRADO" });

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
        console.error("ERROR ACTUALIZANDO CLIENTE:", error);
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", message: "EL EMAIL YA ESTÁ EN USO POR OTRO CLIENTE" });
        }
        return res.status(500).json({ status: "error", message: "ERROR_ACTUALIZACION" });
    }
};

// --- 4. ELIMINAR (BORRADO LÓGICO) ---
const removeLogical = async (req, res) => {
    const clientId = req.params.id;

    try {
        const clientDeleted = await Client.findByIdAndUpdate(
            clientId, 
            { active: false }, 
            { new: true }
        );

        if (!clientDeleted) return res.status(404).json({ status: "error", message: "CLIENTE_INEXISTENTE" });

        return res.status(200).json({ status: "success", message: "CLIENTE_DESACTIVADO" });
    } catch (error) {
        console.error("ERROR ELIMINANDO CLIENTE:", error);
        return res.status(500).json({ status: "error", message: "ERROR_ELIMINACION" });
    }
};

module.exports = { register, list, update, removeLogical };