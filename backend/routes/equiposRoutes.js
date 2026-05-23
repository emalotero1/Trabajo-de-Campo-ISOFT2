const express = require('express');
const router = express.Router();
const equiposController = require('../Controllers/equiposController'); 

// Importamos el portero (Token)
const { auth } = require('../middlewares/authenticated'); 
// Importamos el guardia de rango (Roles)
const { isAdmin, isStaff } = require('../middlewares/auth');

// --- RUTAS PROTEGIDAS DE EQUIPOS ---

// 1. Alta de un nuevo equipo (vinculado a un cliente)
router.post('/register', [auth], equiposController.register);

// 2. Listar todos los equipos registrados (con datos del cliente populados)
router.get('/list', [auth], equiposController.list);

// 3. Modificar/Editar los datos de un equipo existente
router.put('/update/:id', [auth], equiposController.update);


module.exports = router;