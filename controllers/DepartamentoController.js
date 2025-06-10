const { Departamento } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

class DepartamentoController {
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, activo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      // Filtro por estado activo - respeta el parámetro del frontend
      if (activo !== undefined) {
        whereClause.activo = activo === 'true';
      }
      
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } },
          { codigo: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const departamentos = await Departamento.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });

      res.json({
        departamentos: departamentos.rows,
        totalPages: Math.ceil(departamentos.count / limit),
        currentPage: parseInt(page),
        total: departamentos.count
      });
    } catch (error) {
      console.error('Error getting departamentos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const departamento = await Departamento.findByPk(id);

      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      res.json(departamento);
    } catch (error) {
      console.error('Error getting departamento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().max(100).required(),
        descripcion: Joi.string().optional(),
        gerente: Joi.string().max(100).optional(),
        codigo: Joi.string().max(10).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const existingDepartamento = await Departamento.findOne({ 
        where: { 
          [Op.or]: [
            { nombre: value.nombre },
            ...(value.codigo ? [{ codigo: value.codigo }] : [])
          ]
        } 
      });
      
      if (existingDepartamento) {
        return res.status(409).json({ error: 'Ya existe un departamento con este nombre o código' });
      }

      const departamento = await Departamento.create(value);
      res.status(201).json(departamento);
    } catch (error) {
      console.error('Error creating departamento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const departamento = await Departamento.findByPk(id);

      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      const schema = Joi.object({
        nombre: Joi.string().max(100).optional(),
        descripcion: Joi.string().optional(),
        gerente: Joi.string().max(100).optional(),
        codigo: Joi.string().max(10).optional(),
        activo: Joi.boolean().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await departamento.update(value);
      res.json(departamento);
    } catch (error) {
      console.error('Error updating departamento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const departamento = await Departamento.findByPk(id);

      if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
      }

      // Soft delete
      await departamento.update({ activo: false });
      res.json({ message: 'Departamento eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting departamento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = DepartamentoController; 