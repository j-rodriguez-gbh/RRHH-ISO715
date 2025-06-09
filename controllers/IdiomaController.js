const { Idioma } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

class IdiomaController {
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { activo: true };
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const idiomas = await Idioma.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });

      res.json({
        idiomas: idiomas.rows,
        totalPages: Math.ceil(idiomas.count / limit),
        currentPage: parseInt(page),
        total: idiomas.count
      });
    } catch (error) {
      console.error('Error getting idiomas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const idioma = await Idioma.findByPk(id);

      if (!idioma) {
        return res.status(404).json({ error: 'Idioma no encontrado' });
      }

      res.json(idioma);
    } catch (error) {
      console.error('Error getting idioma:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async create(req, res) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().max(50).required(),
        codigo: Joi.string().max(5).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const existingIdioma = await Idioma.findOne({ 
        where: { 
          [Op.or]: [
            { nombre: value.nombre },
            { codigo: value.codigo }
          ]
        } 
      });
      
      if (existingIdioma) {
        return res.status(409).json({ error: 'Ya existe un idioma con este nombre o código' });
      }

      const idioma = await Idioma.create(value);
      res.status(201).json(idioma);
    } catch (error) {
      console.error('Error creating idioma:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const idioma = await Idioma.findByPk(id);

      if (!idioma) {
        return res.status(404).json({ error: 'Idioma no encontrado' });
      }

      const schema = Joi.object({
        nombre: Joi.string().max(50).optional(),
        codigo: Joi.string().max(5).optional(),
        activo: Joi.boolean().optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await idioma.update(value);
      res.json(idioma);
    } catch (error) {
      console.error('Error updating idioma:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const idioma = await Idioma.findByPk(id);

      if (!idioma) {
        return res.status(404).json({ error: 'Idioma no encontrado' });
      }

      await idioma.update({ activo: false });
      res.json({ message: 'Idioma eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting idioma:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = IdiomaController; 