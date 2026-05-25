const express = require('express');
const router = express.Router();

const ordenesController = require('../Controllers/ordenController');
const { auth } = require('../middlewares/authenticated'); 

// --- RUTAS PROTEGIDAS DE ÓRDENES ---
router.post('/', [auth], ordenesController.crearOrden);
router.get('/', [auth], ordenesController.obtenerOrdenes);

module.exports = router;