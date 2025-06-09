const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidato = sequelize.define('Candidato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20)
  },
  documento_identidad: {
    type: DataTypes.STRING(20),
    unique: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATE
  },
  direccion: {
    type: DataTypes.TEXT
  },
  cv_path: {
    type: DataTypes.STRING(255)
  },
  estado: {
    type: DataTypes.ENUM(
      'aplicado', 
      'en_revision', 
      'preseleccionado', 
      'entrevista_inicial', 
      'entrevista_tecnica', 
      'entrevista_final', 
      'aprobado', 
      'rechazado', 
      'contratado'
    ),
    defaultValue: 'aplicado'
  },
  fecha_aplicacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  salario_aspirado: {
    type: DataTypes.DECIMAL(10, 2)
  },
  disponibilidad: {
    type: DataTypes.ENUM('inmediata', '15_dias', '30_dias', 'a_convenir'),
    defaultValue: 'a_convenir'
  },
  observaciones: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_aplicacion']
    }
  ]
});

module.exports = Candidato; 