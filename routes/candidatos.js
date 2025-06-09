const express = require('express');
const router = express.Router();
const CandidatoController = require('../controllers/CandidatoController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

// Create an instance of the controller
const candidatoController = new CandidatoController();

// All candidato routes require authentication
router.use(authenticated);

// Candidato CRUD routes
router.get('/', candidatoController.getAll.bind(candidatoController));
router.get('/search', candidatoController.search.bind(candidatoController));

// State management routes (must come before /:id route)
router.post('/:id/change-state', candidatoController.changeState.bind(candidatoController));

// ID-specific routes (more general patterns should come after specific ones)
router.get('/:id', candidatoController.getById.bind(candidatoController));
router.post('/', candidatoController.create.bind(candidatoController));
router.put('/:id', candidatoController.update.bind(candidatoController));
router.delete('/:id', hrManagerOrAdmin, candidatoController.delete.bind(candidatoController));

module.exports = router; 