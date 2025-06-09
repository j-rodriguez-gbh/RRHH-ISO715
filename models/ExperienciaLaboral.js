const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExperienciaLaboral = sequelize.define('ExperienciaLaboral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidatoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Candidatos',
      key: 'id'
    }
  },
  empresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  puesto: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  trabajo_actual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  salario: {
    type: DataTypes.DECIMAL(10, 2)
  },
  motivo_salida: {
    type: DataTypes.STRING(255)
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['candidatoId']
    },
    {
      fields: ['fecha_inicio']
    }
  ]
});

module.exports = ExperienciaLaboral; 