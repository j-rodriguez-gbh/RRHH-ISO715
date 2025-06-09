const jwt = require('jsonwebtoken');
const { User } = require('../models');
const Joi = require('joi');

class AuthController {
  static async login(req, res) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = value;

      // Find user
      const user = await User.findOne({ where: { email, active: true } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async register(req, res) {
    try {
      const schema = Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'hr_manager', 'recruiter').default('recruiter')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          $or: [
            { email: value.email },
            { username: value.username }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Usuario o email ya existe' });
      }

      // Create user
      const user = await User.create(value);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  static async profile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = AuthController; 