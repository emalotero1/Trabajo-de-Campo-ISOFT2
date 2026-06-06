const express = require('express');
const router = express.Router();

const ordenesController = require('../Controllers/ordenController');
const { auth } = require('../middlewares/authenticated'); 

// --- RUTAS PROTEGIDAS DE ÓRDENES ---
router.post('/', [auth], ordenesController.crearOrden);
router.get('/', [auth], ordenesController.obtenerOrdenes);
router.get('/pendientes', [auth], ordenesController.getTrabajosPendientes);
router.get('/:id', [auth], ordenesController.obtenerOrdenPorId);
router.put('/:id/trabajo', [auth], ordenesController.actualizarTrabajo);
router.put('/:id/asignar', [auth], ordenesController.asignarTecnico);
module.exports = router;