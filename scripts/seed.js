const { sequelize, User, Competencia, Idioma, Capacitacion, Puesto, Candidato } = require('../models/index');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Sync database and wait for it to complete
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');
    
    // Wait a moment for associations to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@empresa.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Usuario admin creado');

    // Create HR Manager
    const hrManager = await User.create({
      username: 'hr_manager',
      email: 'hr@empresa.com',
      password: 'hr123',
      role: 'hr_manager'
    });
    console.log('✅ Usuario HR Manager creado');

    // Create Recruiter
    const recruiter = await User.create({
      username: 'recruiter',
      email: 'recruiter@empresa.com',
      password: 'recruiter123',
      role: 'recruiter'
    });
    console.log('✅ Usuario Recruiter creado');

    // Create Competencias
    const competencias = await Competencia.bulkCreate([
      { nombre: 'JavaScript', descripcion: 'Programación en JavaScript', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Node.js', descripcion: 'Desarrollo backend con Node.js', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'React', descripcion: 'Desarrollo frontend con React', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'PostgreSQL', descripcion: 'Base de datos PostgreSQL', tipo: 'tecnica', nivel_requerido: 'basico' },
      { nombre: 'Liderazgo', descripcion: 'Capacidad de liderazgo de equipos', tipo: 'gerencial', nivel_requerido: 'avanzado' },
      { nombre: 'Comunicación', descripcion: 'Habilidades de comunicación efectiva', tipo: 'blanda', nivel_requerido: 'intermedio' },
      { nombre: 'Trabajo en Equipo', descripcion: 'Colaboración efectiva en equipos', tipo: 'blanda', nivel_requerido: 'intermedio' }
    ]);
    console.log('✅ Competencias creadas');

    // Create Idiomas
    const idiomas = await Idioma.bulkCreate([
      { nombre: 'Español', codigo: 'ES' },
      { nombre: 'Inglés', codigo: 'EN' },
      { nombre: 'Francés', codigo: 'FR' },
      { nombre: 'Portugués', codigo: 'PT' }
    ]);
    console.log('✅ Idiomas creados');

    // Create Capacitaciones
    const capacitaciones = await Capacitacion.bulkCreate([
      { 
        nombre: 'Curso de React Avanzado', 
        descripcion: 'Curso completo de React con hooks y context',
        institucion: 'Tech Academy',
        tipo: 'curso',
        duracion_horas: 40
      },
      { 
        nombre: 'Certificación AWS', 
        descripcion: 'Certificación en Amazon Web Services',
        institucion: 'Amazon',
        tipo: 'certificacion',
        duracion_horas: 80
      },
      { 
        nombre: 'Diplomado en Gestión de Proyectos', 
        descripcion: 'Diplomado en metodologías ágiles',
        institucion: 'Universidad Nacional',
        tipo: 'diplomado',
        duracion_horas: 120
      }
    ]);
    console.log('✅ Capacitaciones creadas');

    // Create Puestos
    const puestos = await Puesto.bulkCreate([
      {
        nombre: 'Desarrollador Frontend',
        descripcion: 'Desarrollo de interfaces de usuario',
        departamento: 'Tecnología',
        nivel: 'mid',
        salario_min: 2500000,
        salario_max: 4000000,
        requisitos: 'Experiencia en React, JavaScript, CSS',
        experiencia_minima: 2
      },
      {
        nombre: 'Desarrollador Backend',
        descripcion: 'Desarrollo de APIs y servicios backend',
        departamento: 'Tecnología',
        nivel: 'mid',
        salario_min: 3000000,
        salario_max: 4500000,
        requisitos: 'Experiencia en Node.js, PostgreSQL, APIs REST',
        experiencia_minima: 3
      },
      {
        nombre: 'Gerente de Proyectos',
        descripcion: 'Gestión y coordinación de proyectos tecnológicos',
        departamento: 'Gestión',
        nivel: 'senior',
        salario_min: 5000000,
        salario_max: 7000000,
        requisitos: 'Experiencia en gestión de proyectos, metodologías ágiles',
        experiencia_minima: 5
      }
    ]);
    console.log('✅ Puestos creados');

    // Create Candidatos individually to have access to associations
    const candidato1 = await Candidato.create({
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567',
      documento_identidad: '12345678',
      fecha_nacimiento: '1990-05-15',
      direccion: 'Calle 123 #45-67, Bogotá',
      salario_aspirado: 3500000,
      disponibilidad: '15_dias',
      estado: 'aplicado'
    });

    const candidato2 = await Candidato.create({
      nombres: 'María Elena',
      apellidos: 'Rodríguez López',
      email: 'maria.rodriguez@email.com',
      telefono: '+57 301 234 5678',
      documento_identidad: '87654321',
      fecha_nacimiento: '1988-08-22',
      direccion: 'Carrera 45 #12-34, Medellín',
      salario_aspirado: 4000000,
      disponibilidad: 'inmediata',
      estado: 'en_revision'
    });

    const candidato3 = await Candidato.create({
      nombres: 'Carlos Alberto',
      apellidos: 'Martínez Silva',
      email: 'carlos.martinez@email.com',
      telefono: '+57 302 345 6789',
      documento_identidad: '11223344',
      fecha_nacimiento: '1985-12-10',
      direccion: 'Avenida 80 #23-45, Cali',
      salario_aspirado: 6000000,
      disponibilidad: '30_dias',
      estado: 'preseleccionado'
    });

    const candidatos = [candidato1, candidato2, candidato3];
    console.log('✅ Candidatos creados');

    // Create associations manually using direct table insertions
    console.log('🔗 Creando asociaciones de candidatos...');
    
    try {
      // Create competencia associations for candidatos
      const competenciaAssociations = [
        // Juan - JS, React, Comunicación
        { candidatoId: candidato1.id, competenciaId: competencias[0].id },
        { candidatoId: candidato1.id, competenciaId: competencias[2].id },
        { candidatoId: candidato1.id, competenciaId: competencias[5].id },
        
        // María - Node, PostgreSQL, Trabajo en equipo
        { candidatoId: candidato2.id, competenciaId: competencias[1].id },
        { candidatoId: candidato2.id, competenciaId: competencias[3].id },
        { candidatoId: candidato2.id, competenciaId: competencias[6].id },
        
        // Carlos - Liderazgo, Comunicación
        { candidatoId: candidato3.id, competenciaId: competencias[4].id },
        { candidatoId: candidato3.id, competenciaId: competencias[5].id }
      ];

      // Insert competencia associations
      await sequelize.getQueryInterface().bulkInsert('CandidatoCompetencias', 
        competenciaAssociations.map(assoc => ({
          ...assoc,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      // Create idioma associations for candidatos
      const idiomaAssociations = [
        // Juan - Español, Inglés
        { candidatoId: candidato1.id, idiomaId: idiomas[0].id },
        { candidatoId: candidato1.id, idiomaId: idiomas[1].id },
        
        // María - Español, Inglés, Francés
        { candidatoId: candidato2.id, idiomaId: idiomas[0].id },
        { candidatoId: candidato2.id, idiomaId: idiomas[1].id },
        { candidatoId: candidato2.id, idiomaId: idiomas[2].id },
        
        // Carlos - Español, Inglés
        { candidatoId: candidato3.id, idiomaId: idiomas[0].id },
        { candidatoId: candidato3.id, idiomaId: idiomas[1].id }
      ];

      // Insert idioma associations
      await sequelize.getQueryInterface().bulkInsert('CandidatoIdiomas', 
        idiomaAssociations.map(assoc => ({
          ...assoc,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      console.log('✅ Asociaciones creadas exitosamente');
    } catch (associationError) {
      console.error('⚠️  Error en asociaciones:', associationError.message);
      console.log('ℹ️  Los datos básicos se crearon correctamente');
    }

    // Create some work experience examples
    console.log('💼 Creando experiencias laborales...');
    try {
      const { ExperienciaLaboral } = require('../models');
      
      await ExperienciaLaboral.bulkCreate([
        {
          candidatoId: candidato1.id,
          empresa: 'Tech Solutions SAS',
          puesto: 'Desarrollador Frontend Junior',
          descripcion: 'Desarrollo de interfaces web con React y JavaScript',
          fecha_inicio: '2020-01-15',
          fecha_fin: '2022-12-31',
          trabajo_actual: false,
          salario: 2800000,
          motivo_salida: 'Búsqueda de nuevas oportunidades'
        },
        {
          candidatoId: candidato2.id,
          empresa: 'Digital Innovations Ltda',
          puesto: 'Desarrolladora Full Stack',
          descripcion: 'Desarrollo de aplicaciones web completas con Node.js y React',
          fecha_inicio: '2019-03-10',
          fecha_fin: null,
          trabajo_actual: true,
          salario: 3800000
        },
        {
          candidatoId: candidato3.id,
          empresa: 'Consulting Group SA',
          puesto: 'Gerente de Proyectos Senior',
          descripcion: 'Gestión de proyectos tecnológicos y equipos multidisciplinarios',
          fecha_inicio: '2018-06-01',
          fecha_fin: '2023-11-30',
          trabajo_actual: false,
          salario: 5500000,
          motivo_salida: 'Finalización de contrato'
        }
      ]);
      
      console.log('✅ Experiencias laborales creadas');
    } catch (expError) {
      console.error('⚠️  Error creando experiencias laborales:', expError.message);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('   Admin: admin@empresa.com / 123456');
    console.log('   HR Manager: hr@empresa.com / 123456');
    console.log('   Recruiter: recruiter@empresa.com / 123456');
    console.log('\n📊 Datos de ejemplo creados:');
    console.log(`   ${competencias.length} competencias`);
    console.log(`   ${idiomas.length} idiomas`);
    console.log(`   ${capacitaciones.length} capacitaciones`);
    console.log(`   ${puestos.length} puestos`);
    console.log(`   ${candidatos.length} candidatos`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 