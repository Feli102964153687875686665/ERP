// Rutas de Inventario
const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', inventarioController.obtenerTodos);
router.get('/:id', inventarioController.obtenerPorId);
router.get('/bajo/alertas', inventarioController.obtenerBajo);
router.post('/', inventarioController.crear);
router.put('/:id', inventarioController.actualizar);
router.delete('/:id', inventarioController.eliminar);

module.exports = router;
