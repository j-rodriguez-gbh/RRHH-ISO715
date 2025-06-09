const express = require('express');
const router = express.Router();
const CandidatoController = require('../controllers/CandidatoController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

// All candidato routes require authentication
router.use(authenticated);

// Candidato CRUD routes
router.get('/', CandidatoController.getAll);
router.get('/search', CandidatoController.search);
router.get('/:id', CandidatoController.getById);
router.post('/', CandidatoController.create);
router.put('/:id', CandidatoController.update);
router.delete('/:id', hrManagerOrAdmin, CandidatoController.delete);

// State management routes
router.post('/:id/change-state', CandidatoController.changeState);

module.exports = router; 