const express = require('express');
const router = express.Router();
const { Empleado, Candidato, Puesto } = require('../models');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');

router.use(authenticated);

router.get('/', async (req, res) => {
  try {
    const empleados = await Empleado.findAll({
      include: [
        { model: Candidato, attributes: ['nombres', 'apellidos', 'email'] },
        { model: Puesto, attributes: ['nombre', 'departamento'] }
      ]
    });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id, {
      include: [
        { model: Candidato },
        { model: Puesto }
      ]
    });
    if (!empleado) return res.status(404).json({ error: 'No encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', hrManagerOrAdmin, async (req, res) => {
  try {
    const empleado = await Empleado.create(req.body);
    res.status(201).json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/:id', hrManagerOrAdmin, async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'No encontrado' });
    await empleado.update(req.body);
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 