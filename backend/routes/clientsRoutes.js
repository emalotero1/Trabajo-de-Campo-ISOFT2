const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

// Importamos el portero (Token)
const { auth } = require('../middlewares/authenticated'); 
// Importamos el guardia de rango (Roles)
const { isAdmin, isStaff } = require('../middlewares/auth');

// --- RUTAS PROTEGIDAS ---

router.post('/register', [auth], clientsController.register);
router.get('/list', [auth], clientsController.list);
router.put('/update/:id', [auth], clientsController.update);

// AQUÍ ESTABA EL ERROR: Cambiamos '/delete/:id' por '/remove/:id'
router.delete('/remove/:id', [auth], clientsController.removeLogical);

module.exports = router;