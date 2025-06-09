const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Capacitacion = sequelize.define('Capacitacion', {
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
  institucion: {
    type: DataTypes.STRING(100)
  },
  tipo: {
    type: DataTypes.ENUM('certificacion', 'curso', 'diplomado', 'seminario', 'taller'),
    allowNull: false
  },
  duracion_horas: {
    type: DataTypes.INTEGER
  },
  fecha_inicio: {
    type: DataTypes.DATE
  },
  fecha_fin: {
    type: DataTypes.DATE
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

module.exports = Capacitacion; 