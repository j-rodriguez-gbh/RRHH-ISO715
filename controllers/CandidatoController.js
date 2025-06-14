const { Candidato, Competencia, Idioma, Capacitacion, ExperienciaLaboral } = require('../models');
const CandidateStateService = require('../services/CandidateStateMachine');
const Joi = require('joi');
const { Op } = require('sequelize');

class CandidatoController {
  constructor() {
    this.stateService = new CandidateStateService();
  }

  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, estado, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (estado) whereClause.estado = estado;
      if (search) {
        whereClause[Op.or] = [
          { nombres: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const candidatos = await Candidato.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Competencia, 
            as: 'Competencias',
            through: { attributes: [] } 
          },
          { 
            model: Idioma, 
            as: 'Idiomas',
            through: { attributes: [] } 
          },
          { 
            model: Capacitacion, 
            as: 'Capacitacions',
            through: { attributes: [] } 
          },
          { 
            model: ExperienciaLaboral,
            as: 'ExperienciaLaborals'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        distinct: true,
        col: 'id'
      });

      res.json({
        candidatos: candidatos.rows,
        totalPages: Math.ceil(candidatos.count / limit),
        currentPage: parseInt(page),
        total: candidatos.count
      });
    } catch (error) {
      console.error('Error getting candidatos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const candidato = await Candidato.findByPk(id, {
        include: [
          { 
            model: Competencia, 
            as: 'Competencias',
            through: { attributes: [] } 
          },
          { 
            model: Idioma, 
            as: 'Idiomas',
            through: { attributes: [] } 
          },
          { 
            model: Capacitacion, 
            as: 'Capacitacions',
            through: { attributes: [] } 
          },
          { 
            model: ExperienciaLaboral,
            as: 'ExperienciaLaborals'
          }
        ]
      });

      if (!candidato) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      // Get valid transitions for current state
      const validTransitions = this.stateService.getValidTransitions(candidato.estado);

      res.json({
        candidato,
        validTransitions
      });
    } catch (error) {
      console.error('Error getting candidato:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async create(req, res) {
    try {
      const schema = Joi.object({
        nombres: Joi.string().max(100).required(),
        apellidos: Joi.string().max(100).required(),
        email: Joi.string().email({ tlds: { allow: false } }).max(100).required(),
        telefono: Joi.string().max(20).optional(),
        documento_identidad: Joi.string().max(20).optional(),
        fecha_nacimiento: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional(),
        direccion: Joi.string().optional(),
        salario_aspirado: Joi.number().positive().optional().allow(null),
        disponibilidad: Joi.string().valid('inmediata', '15_dias', '30_dias', 'a_convenir').optional(),
        observaciones: Joi.string().optional(),
        competencias: Joi.array().items(Joi.number()).optional(),
        idiomas: Joi.array().items(Joi.number()).optional(),
        capacitaciones: Joi.array().items(Joi.number()).optional(),
        experiencias: Joi.array().items(Joi.object({
          empresa: Joi.string().max(100).required(),
          puesto: Joi.string().max(100).required(),
          fecha_desde: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).required(),
          fecha_hasta: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional().allow(null),
          salario: Joi.number().positive().optional().allow(null)
        })).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if email already exists
      const existingCandidato = await Candidato.findOne({ where: { email: value.email } });
      if (existingCandidato) {
        return res.status(409).json({ error: 'Ya existe un candidato con este email' });
      }

      const candidato = await Candidato.create(value);

      // Associate competencias, idiomas, capacitaciones
      if (value.competencias) await candidato.setCompetencias(value.competencias);
      if (value.idiomas) await candidato.setIdiomas(value.idiomas);
      if (value.capacitaciones) await candidato.setCapacitacions(value.capacitaciones);

      // Create experiencias laborales
      if (value.experiencias) {
        for (const experiencia of value.experiencias) {
          // Convert date strings to Date objects if needed
          const fechaInicio = experiencia.fecha_desde ? new Date(experiencia.fecha_desde) : null;
          const fechaFin = experiencia.fecha_hasta ? new Date(experiencia.fecha_hasta) : null;
          
          console.log('Creating experience with dates:', {
            empresa: experiencia.empresa,
            fecha_desde_original: experiencia.fecha_desde,
            fecha_hasta_original: experiencia.fecha_hasta,
            fecha_inicio_converted: fechaInicio,
            fecha_fin_converted: fechaFin
          });
          
          await candidato.createExperienciaLaboral({
            empresa: experiencia.empresa,
            puesto: experiencia.puesto,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            salario: experiencia.salario
          });
        }
      }

      res.status(201).json(candidato);
    } catch (error) {
      console.error('Error creating candidato:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const candidato = await Candidato.findByPk(id);

      if (!candidato) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      const schema = Joi.object({
        nombres: Joi.string().max(100).optional(),
        apellidos: Joi.string().max(100).optional(),
        email: Joi.string().email({ tlds: { allow: false } }).max(100).optional(),
        telefono: Joi.string().max(20).optional(),
        documento_identidad: Joi.string().max(20).optional(),
        fecha_nacimiento: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional(),
        direccion: Joi.string().optional(),
        salario_aspirado: Joi.number().positive().optional().allow(null),
        disponibilidad: Joi.string().valid('inmediata', '15_dias', '30_dias', 'a_convenir').optional(),
        observaciones: Joi.string().optional(),
        competencias: Joi.array().items(Joi.number()).optional(),
        idiomas: Joi.array().items(Joi.number()).optional(),
        capacitaciones: Joi.array().items(Joi.number()).optional(),
        experiencias: Joi.array().items(Joi.object({
          empresa: Joi.string().max(100).required(),
          puesto: Joi.string().max(100).required(),
          fecha_desde: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).required(),
          fecha_hasta: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional().allow(null),
          salario: Joi.number().positive().optional().allow(null)
        })).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      await candidato.update(value);

      // Update associations
      if (value.competencias) await candidato.setCompetencias(value.competencias);
      if (value.idiomas) await candidato.setIdiomas(value.idiomas);
      if (value.capacitaciones) await candidato.setCapacitacions(value.capacitaciones);

      // Update experiencias laborales
      if (value.experiencias) {
        // Delete existing experiences
        await candidato.getExperienciaLaborals().then(experiences => {
          return Promise.all(experiences.map(exp => exp.destroy()));
        });
        
        // Create new experiences
        for (const experiencia of value.experiencias) {
          // Convert date strings to Date objects if needed
          const fechaInicio = experiencia.fecha_desde ? new Date(experiencia.fecha_desde) : null;
          const fechaFin = experiencia.fecha_hasta ? new Date(experiencia.fecha_hasta) : null;
          
          console.log('Creating experience with dates:', {
            empresa: experiencia.empresa,
            fecha_desde_original: experiencia.fecha_desde,
            fecha_hasta_original: experiencia.fecha_hasta,
            fecha_inicio_converted: fechaInicio,
            fecha_fin_converted: fechaFin
          });
          
          await candidato.createExperienciaLaboral({
            empresa: experiencia.empresa,
            puesto: experiencia.puesto,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            salario: experiencia.salario
          });
        }
      }

      res.json(candidato);
    } catch (error) {
      console.error('Error updating candidato:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async changeState(req, res) {
    try {
      const { id } = req.params;
      const { event, observaciones } = req.body;

      const candidato = await Candidato.findByPk(id);
      if (!candidato) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      // Validate transition
      if (!this.stateService.canTransition(candidato.estado, event)) {
        return res.status(400).json({ error: 'Transición de estado no válida' });
      }

      const newState = this.stateService.getNextState(candidato.estado, event);
      
      // Create historical observation entry
      let updatedObservaciones = candidato.observaciones || '';
      
      if (observaciones && observaciones.trim()) {
        const timestamp = new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Santo_Domingo'
        });
        
        const stateChangeDescription = this.stateService.getTransitionDescription(event);
        const newEntry = `[${timestamp}] ${stateChangeDescription}: ${observaciones.trim()}`;
        
        if (updatedObservaciones) {
          updatedObservaciones += '\n\n' + newEntry;
        } else {
          updatedObservaciones = newEntry;
        }
      }
      
      await candidato.update({ 
        estado: newState,
        observaciones: updatedObservaciones
      });

      res.json({
        candidato,
        previousState: candidato.estado,
        newState: newState
      });
    } catch (error) {
      console.error('Error changing candidato state:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const candidato = await Candidato.findByPk(id);

      if (!candidato) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      await candidato.destroy();
      res.json({ message: 'Candidato eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting candidato:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async search(req, res) {
    try {
      const { puestoId, competencias, idiomas, capacitaciones, experiencia_min } = req.query;

      console.log('Search parameters:', { puestoId, competencias, idiomas, capacitaciones, experiencia_min });

      // Start with base include clause - always get all associations
      let includeClause = [
        {
          model: Competencia,
          as: 'Competencias',
          through: { attributes: [] },
          required: false
        },
        {
          model: Idioma,
          as: 'Idiomas',
          through: { attributes: [] },
          required: false
        },
        {
          model: Capacitacion,
          as: 'Capacitacions',
          through: { attributes: [] },
          required: false
        },
        {
          model: ExperienciaLaboral,
          as: 'ExperienciaLaborals',
          required: false
        }
      ];

      // Modify include clause based on filters
      // Only make associations required if there are specific filters
      if (competencias) {
        const competenciaIds = competencias.split(',').map(id => parseInt(id));
        includeClause[0] = {
          model: Competencia,
          as: 'Competencias',
          where: { id: { [Op.in]: competenciaIds } },
          through: { attributes: [] },
          required: true
        };
      }

      if (idiomas) {
        const idiomaIds = idiomas.split(',').map(id => parseInt(id));
        includeClause[1] = {
          model: Idioma,
          as: 'Idiomas',
          where: { id: { [Op.in]: idiomaIds } },
          through: { attributes: [] },
          required: true
        };
      }

      if (capacitaciones) {
        const capacitacionIds = capacitaciones.split(',').map(id => parseInt(id));
        includeClause[2] = {
          model: Capacitacion,
          as: 'Capacitacions',
          where: { id: { [Op.in]: capacitacionIds } },
          through: { attributes: [] },
          required: true
        };
      }

      // Get all candidates with complete data
      let candidatos = await Candidato.findAll({
        include: includeClause,
        distinct: true,
        order: [['fecha_aplicacion', 'DESC']]
      });

      console.log(`Found ${candidatos.length} candidates before experience filter`);

      // Filter by experience if specified
      if (experiencia_min) {
        const minExperience = parseInt(experiencia_min);
        candidatos = candidatos.filter(candidato => {
          const experienceCount = candidato.ExperienciaLaborals ? candidato.ExperienciaLaborals.length : 0;
          return experienceCount >= minExperience;
        });
      }

      console.log(`Returning ${candidatos.length} candidates after all filters`);

      res.json({ candidatos });
    } catch (error) {
      console.error('Error searching candidatos:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = CandidatoController; 