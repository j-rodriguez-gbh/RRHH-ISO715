const express = require('express');
const router = express.Router();
const IdiomaController = require('../controllers/IdiomaController');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

router.use(authenticated);

router.get('/', IdiomaController.getAll);
router.get('/:id', IdiomaController.getById);
router.post('/', hrManagerOrAdmin, IdiomaController.create);
router.put('/:id', hrManagerOrAdmin, IdiomaController.update);
router.delete('/:id', hrManagerOrAdmin, IdiomaController.delete);

module.exports = router; 