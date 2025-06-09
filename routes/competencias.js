const express = require('express');
const router = express.Router();
const CompetenciaController = require('../controllers/CompetenciaController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

// All competencia routes require authentication
router.use(authenticated);

// Competencia CRUD routes
router.get('/', CompetenciaController.getAll);
router.get('/:id', CompetenciaController.getById);
router.post('/', hrManagerOrAdmin, CompetenciaController.create);
router.put('/:id', hrManagerOrAdmin, CompetenciaController.update);
router.delete('/:id', hrManagerOrAdmin, CompetenciaController.delete);

module.exports = router; 