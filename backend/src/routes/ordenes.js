// Rutas de Órdenes
const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');
const { autenticar } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/authorize');

router.use(autenticar);

// Lectura: todos pueden ver
router.get('/', ordenesController.obtenerTodos);
router.get('/:id', ordenesController.obtenerPorId);

// Escritura: solo admin y coordinador
router.post('/', authorizeRole('administrador', 'coordinador'), ordenesController.crear);
// Permitir a técnicos actualizar estado/observaciones; el controlador limitará campos según rol
router.put('/:id', authorizeRole('administrador', 'coordinador', 'tecnico'), ordenesController.actualizar);
router.delete('/:id', authorizeRole('administrador', 'coordinador'), ordenesController.eliminar);

module.exports = router;
