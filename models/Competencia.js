const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Competencia = sequelize.define('Competencia', {
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
  tipo: {
    type: DataTypes.ENUM('tecnica', 'blanda', 'gerencial'),
    allowNull: false
  },
  nivel_requerido: {
    type: DataTypes.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
    defaultValue: 'basico'
  },
  activa: {
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
      fields: ['tipo']
    }
  ]
});

module.exports = Competencia; 