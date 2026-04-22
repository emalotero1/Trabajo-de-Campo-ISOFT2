const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Importamos el portero (Token)
const { auth } = require('../middlewares/authenticated'); 
// Importamos el guardia de rango (Roles)
const { isAdmin, isStaff } = require('../middlewares/auth');

// --- RUTAS PROTEGIDAS ---

// Solo un administrador puede registrar, listar, editar o borrar staff
router.post('/register', [auth, isAdmin], userController.register);
router.get('/list', [auth, isAdmin], userController.list);
router.put('/update/:id', [auth, isAdmin], userController.update);
router.delete('/delete/:id', [auth, isAdmin], userController.removeLogical);

// Ejemplo: Una ruta que CUALQUIER logueado puede usar (sin isAdmin)
// router.get('/perfil', auth, userController.getProfile);

module.exports = router;