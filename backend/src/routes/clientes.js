// Rutas de Clientes
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { autenticar } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(autenticar);

router.get('/', clientesController.obtenerTodos);
router.get('/:id', clientesController.obtenerPorId);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.delete('/:id', clientesController.eliminar);

module.exports = router;
