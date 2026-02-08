// Rutas de Auditoría
const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', auditoriaController.obtenerTodos);
router.get('/:id', auditoriaController.obtenerPorId);
router.post('/', auditoriaController.registrar);

module.exports = router;
