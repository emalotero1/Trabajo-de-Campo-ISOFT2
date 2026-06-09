const express = require('express');
const router = express.Router();

const ordenesController = require('../Controllers/ordenController');
const { auth } = require('../middlewares/authenticated'); 

// --- RUTAS PROTEGIDAS DE ÓRDENES ---
router.post('/', [auth], ordenesController.create);
router.get('/', [auth], ordenesController.list);
router.get('/pendientes', [auth], ordenesController.getPendingJobs);
router.get('/activos', [auth], ordenesController.getActiveJobs);
router.get('/historial', [auth], ordenesController.getHistoryJobs);
router.get('/:id', [auth], ordenesController.getById);
router.put('/:id/trabajo', [auth], ordenesController.update);
router.put('/:id/asignar', [auth], ordenesController.assignTechnician);
module.exports = router;