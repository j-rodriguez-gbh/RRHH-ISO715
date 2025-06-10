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
const Departamento = require('./Departamento');

// Define relationships
// Candidato relationships
Candidato.belongsToMany(Competencia, { 
  through: 'CandidatoCompetencias', 
  foreignKey: 'candidatoId',
  as: 'Competencias'
});
Competencia.belongsToMany(Candidato, { 
  through: 'CandidatoCompetencias', 
  foreignKey: 'competenciaId',
  as: 'Candidatos'
});

Candidato.belongsToMany(Idioma, { 
  through: 'CandidatoIdiomas', 
  foreignKey: 'candidatoId',
  as: 'Idiomas'
});
Idioma.belongsToMany(Candidato, { 
  through: 'CandidatoIdiomas', 
  foreignKey: 'idiomaId',
  as: 'Candidatos'
});

Candidato.belongsToMany(Capacitacion, { 
  through: 'CandidatoCapacitaciones', 
  foreignKey: 'candidatoId',
  as: 'Capacitacions'
});
Capacitacion.belongsToMany(Candidato, { 
  through: 'CandidatoCapacitaciones', 
  foreignKey: 'capacitacionId',
  as: 'Candidatos'
});

Candidato.hasMany(ExperienciaLaboral, { 
  foreignKey: 'candidatoId',
  as: 'ExperienciaLaborals'
});
ExperienciaLaboral.belongsTo(Candidato, { 
  foreignKey: 'candidatoId',
  as: 'Candidato'
});

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
  Empleado,
  Departamento
}; 