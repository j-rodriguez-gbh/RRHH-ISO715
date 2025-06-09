const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idioma = sequelize.define('Idioma', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  codigo: {
    type: DataTypes.STRING(5),
    allowNull: false,
    unique: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Idioma; 