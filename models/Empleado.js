const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define('Empleado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidatoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Candidatos',
      key: 'id'
    }
  },
  puestoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Puestos',
      key: 'id'
    }
  },
  codigo_empleado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  fecha_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  salario_acordado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tipo_contrato: {
    type: DataTypes.ENUM('indefinido', 'temporal', 'practicas', 'consultoria'),
    allowNull: false,
    defaultValue: 'indefinido'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'vacaciones', 'licencia'),
    defaultValue: 'activo'
  },
  fecha_fin_contrato: {
    type: DataTypes.DATE
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Empleados',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['codigo_empleado']
    },
    {
      fields: ['fecha_ingreso']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Empleado; 