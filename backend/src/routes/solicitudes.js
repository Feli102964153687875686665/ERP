// Rutas de Solicitudes
const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudesController');
const { autenticar } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/authorize');

router.use(autenticar);

// Lectura: todos pueden ver
router.get('/', solicitudesController.obtenerTodos);
router.get('/:id', solicitudesController.obtenerPorId);

// Escritura: solo admin y coordinador
router.post('/', authorizeRole('administrador', 'coordinador'), solicitudesController.crear);
router.put('/:id', authorizeRole('administrador', 'coordinador'), solicitudesController.actualizar);
router.delete('/:id', authorizeRole('administrador', 'coordinador'), solicitudesController.eliminar);

module.exports = router;
