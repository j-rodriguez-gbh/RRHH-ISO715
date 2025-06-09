const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Puesto = sequelize.define('Puesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  departamento: {
    type: DataTypes.STRING(100)
  },
  nivel: {
    type: DataTypes.ENUM('junior', 'mid', 'senior', 'lead', 'manager', 'director'),
    allowNull: false
  },
  salario_min: {
    type: DataTypes.DECIMAL(10, 2)
  },
  salario_max: {
    type: DataTypes.DECIMAL(10, 2)
  },
  requisitos: {
    type: DataTypes.TEXT
  },
  experiencia_minima: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['nombre']
    },
    {
      fields: ['departamento']
    },
    {
      fields: ['nivel']
    }
  ]
});

module.exports = Puesto; 