const express = require('express');
const router = express.Router();
const DepartamentoController = require('../controllers/DepartamentoController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

router.use(authenticated);

// Departamento CRUD routes
router.get('/', DepartamentoController.getAll);
router.get('/:id', DepartamentoController.getById);
router.post('/', hrManagerOrAdmin, DepartamentoController.create);
router.put('/:id', hrManagerOrAdmin, DepartamentoController.update);
router.delete('/:id', hrManagerOrAdmin, DepartamentoController.delete);

module.exports = router; 