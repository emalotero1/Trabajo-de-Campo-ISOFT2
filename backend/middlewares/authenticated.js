const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

/**
 * Middleware de Autenticación Base
 * Verifica que el usuario haya enviado un token válido en los headers.
 */
exports.auth = (req, res, next) => {
    // 1. Obtener el header de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            status: "error",
            message: "Token no proporcionado. Debes iniciar sesión."
        });
    }

    try {
        // 2. Limpiar el token (quitar 'Bearer ' si existe)
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        // 3. Verificar el token con el secreto del servidor
        const payload = jwt.verify(token, secret);

        // 4. Inyectar los datos del usuario en el objeto Request
        // Esto permite que el siguiente middleware (como isAdmin) sepa quién es el usuario
        req.user = payload;

        // 5. Dar paso al siguiente proceso
        next();
    } catch (error) {
        console.error("Error en validación de token:", error.message);
        return res.status(401).json({
            status: "error",
            message: "Token inválido o expirado. Por favor, vuelve a loguearte."
        });
    }
};