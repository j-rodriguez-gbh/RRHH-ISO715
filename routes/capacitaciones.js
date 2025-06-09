const express = require('express');
const router = express.Router();
const { Capacitacion } = require('../models');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

router.use(authenticated);

router.get('/', async (req, res) => {
  try {
    const capacitaciones = await Capacitacion.findAll({ where: { activa: true } });
    res.json(capacitaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const capacitacion = await Capacitacion.findByPk(req.params.id);
    if (!capacitacion) return res.status(404).json({ error: 'No encontrado' });
    res.json(capacitacion);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', hrManagerOrAdmin, async (req, res) => {
  try {
    const capacitacion = await Capacitacion.create(req.body);
    res.status(201).json(capacitacion);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', hrManagerOrAdmin, async (req, res) => {
  try {
    const capacitacion = await Capacitacion.findByPk(req.params.id);
    if (!capacitacion) return res.status(404).json({ error: 'No encontrado' });
    await capacitacion.update(req.body);
    res.json(capacitacion);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.delete('/:id', hrManagerOrAdmin, async (req, res) => {
  try {
    const capacitacion = await Capacitacion.findByPk(req.params.id);
    if (!capacitacion) return res.status(404).json({ error: 'No encontrado' });
    await capacitacion.update({ activa: false });
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 