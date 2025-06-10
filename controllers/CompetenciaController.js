const { Competencia } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

class CompetenciaController {
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, tipo, activa } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      // Filtro por estado activa - respeta el parámetro del frontend
      if (activa !== undefined) {
        whereClause.activa = activa === 'true';
      }
      
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (tipo) whereClause.tipo = tipo;

      const competencias = await Competencia.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });

      res.json({
        competencias: competencias.rows,
        totalPages: Math.ceil(competencias.count / limit),
        currentPage: parseInt(page),
        total: competencias.count
      });
    } catch (error) {
      console.error('Error getting competencias:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const competencia = await Competencia.findByPk(id);

      if (!competencia) {
        return res.status(404).json({ error: 'Competencia no encontrada' });
      }

      res.json(competencia);
    } catch (error) {
      console.error('Error getting competencia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().max(100).required(),
        descripcion: Joi.string().optional(),
        tipo: Joi.string().valid('tecnica', 'blanda', 'gerencial').required(),
        nivel_requerido: Joi.string().valid('basico', 'intermedio', 'avanzado', 'experto').optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const existingCompetencia = await Competencia.findOne({ where: { nombre: value.nombre } });
      if (existingCompetencia) {
        return res.status(409).json({ error: 'Ya existe una competencia con este nombre' });
      }

      const competencia = await Competencia.create(value);
      res.status(201).json(competencia);
    } catch (error) {
      console.error('Error creating competencia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const competencia = await Competencia.findByPk(id);

      if (!competencia) {
        return res.status(404).json({ error: 'Competencia no encontrada' });
      }

      const schema = Joi.object({
        nombre: Joi.string().max(100).optional(),
        descripcion: Joi.string().optional(),
        tipo: Joi.string().valid('tecnica', 'blanda', 'gerencial').optional(),
        nivel_requerido: Joi.string().valid('basico', 'intermedio', 'avanzado', 'experto').optional(),
        activa: Joi.boolean().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await competencia.update(value);
      res.json(competencia);
    } catch (error) {
      console.error('Error updating competencia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const competencia = await Competencia.findByPk(id);

      if (!competencia) {
        return res.status(404).json({ error: 'Competencia no encontrada' });
      }

      // Soft delete
      await competencia.update({ activa: false });
      res.json({ message: 'Competencia eliminada exitosamente' });
    } catch (error) {
      console.error('Error deleting competencia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = CompetenciaController; 