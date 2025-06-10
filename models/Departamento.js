const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  gerente: {
    type: DataTypes.STRING(100)
  },
  codigo: {
    type: DataTypes.STRING(10),
    unique: true
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
      fields: ['codigo']
    }
  ]
});

module.exports = Departamento; 