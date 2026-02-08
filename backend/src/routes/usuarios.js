// Rutas de Usuarios
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { autenticar } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/authorize');

// Rutas públicas
router.post('/auth/login', usuariosController.login);
router.post('/auth/logout', usuariosController.logout);

// Rutas protegidas - obtener datos
router.get('/', autenticar, usuariosController.obtenerTodos);
// Obtener sólo técnicos activos para listas de asignación
router.get('/tecnicos/activos', autenticar, usuariosController.obtenerTecnicosActivos);
router.get('/:id', autenticar, usuariosController.obtenerPorId);

// Rutas solo para administrador
router.post('/', autenticar, authorizeRole('administrador'), usuariosController.crear);
router.put('/:id', autenticar, authorizeRole('administrador'), usuariosController.actualizar);
router.delete('/:id', autenticar, authorizeRole('administrador'), usuariosController.eliminar);

module.exports = router;
