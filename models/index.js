const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const Competencia = require('./Competencia');
const Idioma = require('./Idioma');
const Capacitacion = require('./Capacitacion');
const Puesto = require('./Puesto');
const Candidato = require('./Candidato');
const ExperienciaLaboral = require('./ExperienciaLaboral');
const Empleado = require('./Empleado');

// Define relationships
// Candidato relationships
Candidato.belongsToMany(Competencia, { through: 'CandidatoCompetencias', foreignKey: 'candidatoId' });
Competencia.belongsToMany(Candidato, { through: 'CandidatoCompetencias', foreignKey: 'competenciaId' });

Candidato.belongsToMany(Idioma, { through: 'CandidatoIdiomas', foreignKey: 'candidatoId' });
Idioma.belongsToMany(Candidato, { through: 'CandidatoIdiomas', foreignKey: 'idiomaId' });

Candidato.belongsToMany(Capacitacion, { through: 'CandidatoCapacitaciones', foreignKey: 'candidatoId' });
Capacitacion.belongsToMany(Candidato, { through: 'CandidatoCapacitaciones', foreignKey: 'capacitacionId' });

Candidato.hasMany(ExperienciaLaboral, { foreignKey: 'candidatoId' });
ExperienciaLaboral.belongsTo(Candidato, { foreignKey: 'candidatoId' });

// Puesto relationships
Puesto.belongsToMany(Competencia, { through: 'PuestoCompetencias', foreignKey: 'puestoId' });
Competencia.belongsToMany(Puesto, { through: 'PuestoCompetencias', foreignKey: 'competenciaId' });

Puesto.belongsToMany(Idioma, { through: 'PuestoIdiomas', foreignKey: 'puestoId' });
Idioma.belongsToMany(Puesto, { through: 'PuestoIdiomas', foreignKey: 'idiomaId' });

// Empleado relationships
Candidato.hasOne(Empleado, { foreignKey: 'candidatoId' });
Empleado.belongsTo(Candidato, { foreignKey: 'candidatoId' });

Puesto.hasMany(Empleado, { foreignKey: 'puestoId' });
Empleado.belongsTo(Puesto, { foreignKey: 'puestoId' });

module.exports = {
  sequelize,
  User,
  Competencia,
  Idioma,
  Capacitacion,
  Puesto,
  Candidato,
  ExperienciaLaboral,
  Empleado
}; 