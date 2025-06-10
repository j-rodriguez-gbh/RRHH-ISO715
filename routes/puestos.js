const express = require('express');
const router = express.Router();
const { Puesto } = require('../models');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

router.use(authenticated);

router.get('/', async (req, res) => {
  try {
    const { activo, limit } = req.query;
    
    let whereClause = {};
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const options = { where: whereClause };
    if (limit) {
      options.limit = parseInt(limit);
    }

    const puestos = await Puesto.findAll(options);
    res.json({ puestos });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const puesto = await Puesto.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'No encontrado' });
    res.json(puesto);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', hrManagerOrAdmin, async (req, res) => {
  try {
    const puesto = await Puesto.create(req.body);
    res.status(201).json(puesto);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', hrManagerOrAdmin, async (req, res) => {
  try {
    const puesto = await Puesto.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'No encontrado' });
    await puesto.update(req.body);
    res.json(puesto);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', hrManagerOrAdmin, async (req, res) => {
  try {
    const puesto = await Puesto.findByPk(req.params.id);
    if (!puesto) return res.status(404).json({ error: 'No encontrado' });
    await puesto.update({ activo: false });
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 