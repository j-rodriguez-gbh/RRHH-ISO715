const express = require('express');
const router = express.Router();
const { Empleado, Candidato, Puesto } = require('../models');
const { authenticated, hrManagerOrAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

router.use(authenticated);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, search, fecha_inicio, fecha_fin } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (estado) whereClause.estado = estado;
    
    // Filtros por fecha de ingreso
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_ingreso = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    } else if (fecha_inicio) {
      whereClause.fecha_ingreso = {
        [Op.gte]: fecha_inicio
      };
    } else if (fecha_fin) {
      whereClause.fecha_ingreso = {
        [Op.lte]: fecha_fin
      };
    }

    let candidatoWhere = {};
    if (search) {
      candidatoWhere[Op.or] = [
        { nombres: { [Op.iLike]: `%${search}%` } },
        { apellidos: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Get total count
    const totalCount = await Empleado.count({
      where: whereClause,
      include: search ? [{
        model: Candidato,
        where: candidatoWhere,
        required: true
      }] : []
    });

    // Get paginated results
    const empleados = await Empleado.findAll({
      where: whereClause,
      include: [
        { 
          model: Candidato, 
          attributes: ['nombres', 'apellidos', 'email'],
          where: search ? candidatoWhere : undefined,
          required: search ? true : false
        },
        { model: Puesto, attributes: ['nombre', 'departamento'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_ingreso', 'DESC']]
    });

    res.json({
      empleados: empleados,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      total: totalCount
    });
  } catch (error) {
    console.error('Error getting empleados:', error);
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

// Convertir candidato a empleado
router.post('/from-candidato/:candidatoId', hrManagerOrAdmin, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { candidatoId } = req.params;
    const { codigo_empleado, puestoId, fecha_ingreso, salario_acordado, estado = 'activo', tipo_contrato = 'indefinido' } = req.body;

    // Verificar que el candidato existe y está aprobado
    const candidato = await Candidato.findByPk(candidatoId, { transaction });
    if (!candidato) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }
    
    if (candidato.estado !== 'aprobado') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Solo candidatos aprobados pueden ser contratados' });
    }

    // Verificar que no ya sea empleado
    const existingEmpleado = await Empleado.findOne({
      where: { candidatoId: candidatoId },
      transaction
    });
    
    if (existingEmpleado) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Este candidato ya es empleado' });
    }

    // Crear empleado
    const empleado = await Empleado.create({
      codigo_empleado,
      candidatoId: parseInt(candidatoId),
      puestoId: parseInt(puestoId),
      fecha_ingreso,
      salario_acordado: parseFloat(salario_acordado),
      estado,
      tipo_contrato
    }, { transaction });

    // Actualizar estado del candidato a 'contratado'
    await candidato.update({ estado: 'contratado' }, { transaction });
    
    // Commit transaction
    await transaction.commit();

    // Devolver empleado con relaciones (fuera de la transacción)
    const empleadoCompleto = await Empleado.findByPk(empleado.id, {
      include: [
        { model: Candidato },
        { model: Puesto }
      ]
    });

    res.status(201).json(empleadoCompleto);
  } catch (error) {
    await transaction.rollback();
    console.error('Error converting candidato to empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

module.exports = router; 