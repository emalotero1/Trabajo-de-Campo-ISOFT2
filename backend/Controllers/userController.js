const bcrypt = require('bcryptjs');
const User = require('../models/Usuario');
const { validationResult } = require('express-validator'); // Recomendado usar express-validator

// --- 1. REGISTRAR (ALTA DE STAFF) ---
const register = async (req, res) => {
    const { email, password, username, rol, name, lastname, cel } = req.body;

    // 1. Validación de datos obligatorios
    if (!email || !password || !username || !rol || !name || !lastname) {
        return res.status(400).json({ status: "error", message: "FALTAN_DATOS_OBLIGATORIOS" });
    }

    try {
        const emailLower = email.toLowerCase().trim();
        
        // 2. Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            $or: [{ email: emailLower }, { username: username.trim() }] 
        });

        if (existingUser) {
            return res.status(409).json({ status: "error", message: "EL USUARIO O EMAIL YA EXISTE" });
        }

        // 3. Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. EL TRUCO: Sacar el creador del token decodificado (inyectado por tu middleware)
        // Si por alguna razón no hay token (desarrollo), usamos 'SYSTEM_ROOT'
        const adminLogueado = req.user ? req.user.username : 'SYSTEM_ROOT';


        // 5. Crear usuario
        const newUser = new User({
            name: name.trim(),
            lastname: lastname.trim(),
            username: username.trim(),
            email: emailLower,
            password: hashedPassword,
            rol: rol.toLowerCase(),
            cel: cel || "",
            createdBy: adminLogueado, // <--- Ahora sí tendrá valor
            active: true
        });

        await newUser.save();

        return res.status(201).json({
            status: "success",
            message: "USUARIO CREADO CON ÉXITO",
            user: { username: newUser.username, createdBy: newUser.createdBy }
        });

    } catch (error) {
        console.error("ERROR EN REGISTRO:", error);
        return res.status(500).json({ status: "error", message: "ERROR_INTERNO_SERVIDOR" });
    }
};

// --- 2. LISTAR (CON FILTRO DE SEGURIDAD) ---
const list = async (req, res) => {
    try {
        // Solo traemos usuarios activos y ocultamos información sensible
        const users = await User.find({ active: true })
            .select("-password -__v -tokens") 
            .sort({ lastname: 1 });

        return res.status(200).json({
            status: "success",
            users
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR_AL_LISTAR" });
    }
};

// --- 3. EDITAR (CON PROTECCIÓN DE ROL) ---
const update = async (req, res) => {
    const userId = req.params.id;
    const dataToUpdate = { ...req.body };

    try {
        // SEGURIDAD: Buscar el usuario original antes de editar
        const userToEdit = await User.findById(userId);
        if (!userToEdit) return res.status(404).json({ status: "error", message: "USUARIO_NO_ENCONTRADO" });

        // PROTECCIÓN: No permitir que un admin cambie su propio rol a algo inferior por accidente
        if (req.user.id === userId && dataToUpdate.rol && dataToUpdate.rol !== 'administrador') {
            return res.status(403).json({ status: "error", message: "NO_PUEDES_QUITARTE_EL_ROL_ADMIN" });
        }

        // Si hay password, se hashea. Si está vacío, se elimina del objeto para no pisar el anterior
        if (dataToUpdate.password && dataToUpdate.password.trim() !== "") {
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        } else {
            delete dataToUpdate.password;
        }

        const userUpdated = await User.findByIdAndUpdate(
            userId, 
            { $set: dataToUpdate }, 
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({ status: "success", user: userUpdated });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR_ACTUALIZACION" });
    }
};

// --- 4. ELIMINAR (BORRADO LÓGICO Y PREVENCIÓN DE SUICIDIO) ---
const removeLogical = async (req, res) => {
    const userId = req.params.id;
    const adminId = req.user.id; // Asumiendo que el middleware de auth inyecta el ID del admin

    try {
        // SEGURIDAD: Un administrador no puede eliminarse a sí mismo
        if (userId === adminId) {
            return res.status(403).json({
                status: "error",
                message: "OPERACION_DENEGADA: No puedes eliminar tu propia cuenta administrativa."
            });
        }

        const userDeleted = await User.findByIdAndUpdate(
            userId, 
            { active: false }, 
            { new: true }
        );

        if (!userDeleted) return res.status(404).json({ status: "error", message: "USUARIO_INEXISTENTE" });

        return res.status(200).json({ status: "success", message: "USUARIO_DESACTIVADO" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "ERROR_ELIMINACION" });
    }
};

module.exports = { register, list, update, removeLogical };