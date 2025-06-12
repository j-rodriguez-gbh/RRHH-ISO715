const { sequelize, User, Competencia, Idioma, Capacitacion, Puesto, Candidato, Empleado, Departamento } = require('../models/index');

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

    // Create comprehensive Competencias
    const competencias = await Competencia.bulkCreate([
      // Tecnológicas - Frontend
      { nombre: 'HTML/CSS', descripcion: 'Desarrollo de interfaces web modernas', tipo: 'tecnica', nivel_requerido: 'basico' },
      { nombre: 'JavaScript', descripcion: 'Programación en JavaScript ES6+', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'TypeScript', descripcion: 'Desarrollo con tipado estático', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'React', descripcion: 'Desarrollo frontend con React', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Vue.js', descripcion: 'Framework progresivo para UI', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Angular', descripcion: 'Framework completo para SPAs', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      
      // Tecnológicas - Backend
      { nombre: 'Node.js', descripcion: 'Desarrollo backend con Node.js', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Python', descripcion: 'Programación en Python', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Java', descripcion: 'Desarrollo empresarial con Java', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      { nombre: 'C#/.NET', descripcion: 'Desarrollo con tecnologías Microsoft', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      { nombre: 'PHP', descripcion: 'Desarrollo web con PHP', tipo: 'tecnica', nivel_requerido: 'basico' },
      
      // Bases de datos
      { nombre: 'PostgreSQL', descripcion: 'Base de datos relacional avanzada', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'MySQL', descripcion: 'Sistema de gestión de bases de datos', tipo: 'tecnica', nivel_requerido: 'basico' },
      { nombre: 'MongoDB', descripcion: 'Base de datos NoSQL', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Redis', descripcion: 'Base de datos en memoria', tipo: 'tecnica', nivel_requerido: 'basico' },
      
      // Cloud y DevOps
      { nombre: 'AWS', descripcion: 'Amazon Web Services', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Docker', descripcion: 'Containerización de aplicaciones', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Kubernetes', descripcion: 'Orquestación de contenedores', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      { nombre: 'CI/CD', descripcion: 'Integración y entrega continua', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      
      // Habilidades blandas
      { nombre: 'Liderazgo', descripcion: 'Capacidad de liderazgo de equipos', tipo: 'blanda', nivel_requerido: 'avanzado' },
      { nombre: 'Comunicación', descripcion: 'Habilidades de comunicación efectiva', tipo: 'blanda', nivel_requerido: 'intermedio' },
      { nombre: 'Trabajo en Equipo', descripcion: 'Colaboración efectiva en equipos', tipo: 'blanda', nivel_requerido: 'intermedio' },
      { nombre: 'Resolución de Problemas', descripcion: 'Análisis y solución de problemas complejos', tipo: 'blanda', nivel_requerido: 'avanzado' },
      { nombre: 'Creatividad', descripcion: 'Pensamiento creativo e innovador', tipo: 'blanda', nivel_requerido: 'intermedio' },
      { nombre: 'Adaptabilidad', descripcion: 'Capacidad de adaptarse a cambios', tipo: 'blanda', nivel_requerido: 'intermedio' },
      
      // Gerenciales
      { nombre: 'Gestión de Proyectos', descripcion: 'Planificación y ejecución de proyectos', tipo: 'gerencial', nivel_requerido: 'avanzado' },
      { nombre: 'Gestión de Equipos', descripcion: 'Dirección y motivación de equipos', tipo: 'gerencial', nivel_requerido: 'avanzado' },
      { nombre: 'Gestión Financiera', descripcion: 'Análisis y control financiero', tipo: 'gerencial', nivel_requerido: 'avanzado' },
      { nombre: 'Estrategia Empresarial', descripcion: 'Planificación estratégica organizacional', tipo: 'gerencial', nivel_requerido: 'avanzado' },
      
      // Específicas por área (usando tipo técnico)
      { nombre: 'Marketing Digital', descripcion: 'Estrategias de marketing online', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'SEO/SEM', descripcion: 'Optimización para motores de búsqueda', tipo: 'tecnica', nivel_requerido: 'intermedio' },
      { nombre: 'Diseño UX/UI', descripcion: 'Experiencia e interfaz de usuario', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      { nombre: 'Análisis de Datos', descripcion: 'Interpretación y análisis de datos', tipo: 'tecnica', nivel_requerido: 'avanzado' },
      { nombre: 'Ciberseguridad', descripcion: 'Seguridad informática y protección de datos', tipo: 'tecnica', nivel_requerido: 'avanzado' }
    ]);
    console.log('✅ Competencias creadas:', competencias.length);

    // Create comprehensive Idiomas
    const idiomas = await Idioma.bulkCreate([
      { nombre: 'Español', codigo: 'ES' },
      { nombre: 'Inglés', codigo: 'EN' },
      { nombre: 'Francés', codigo: 'FR' },
      { nombre: 'Portugués', codigo: 'PT' },
      { nombre: 'Alemán', codigo: 'DE' },
      { nombre: 'Italiano', codigo: 'IT' },
      { nombre: 'Chino Mandarín', codigo: 'ZH' },
      { nombre: 'Japonés', codigo: 'JA' }
    ]);
    console.log('✅ Idiomas creados:', idiomas.length);

    // Create comprehensive Capacitaciones
    const capacitaciones = await Capacitacion.bulkCreate([
      { 
        nombre: 'Ingeniería de Sistemas',
        descripcion: 'Carrera universitaria en ingeniería de sistemas', 
        tipo: 'curso',
        duracion_horas: 4800,
        fecha_inicio: '2015-01-15',
        fecha_fin: '2019-12-15',
        institucion: 'Universidad Nacional de Colombia'
      },
      { 
        nombre: 'Maestría en Gestión de Tecnología',
        descripcion: 'Posgrado en gestión estratégica de tecnología', 
        tipo: 'curso',
        duracion_horas: 1200,
        fecha_inicio: '2020-01-15',
        fecha_fin: '2022-06-15',
        institucion: 'Universidad de los Andes'
      },
      { 
        nombre: 'Técnico en Programación',
        descripcion: 'Técnico laboral en desarrollo de software', 
        tipo: 'curso',
        duracion_horas: 800,
        fecha_inicio: '2018-02-01',
        fecha_fin: '2018-11-30',
        institucion: 'SENA'
      },
      { 
        nombre: 'AWS Cloud Practitioner',
        descripcion: 'Certificación en fundamentos de AWS', 
        tipo: 'certificacion',
        duracion_horas: 40,
        fecha_inicio: '2023-03-01',
        fecha_fin: '2023-03-15',
        institucion: 'Amazon Web Services'
      },
      { 
        nombre: 'Scrum Master',
        descripcion: 'Certificación en metodologías ágiles Scrum', 
        tipo: 'certificacion',
        duracion_horas: 16,
        fecha_inicio: '2022-08-01',
        fecha_fin: '2022-08-30',
        institucion: 'Scrum Alliance'
      },
      { 
        nombre: 'Marketing Digital',
        descripcion: 'Diplomado en estrategias de marketing digital', 
        tipo: 'diplomado',
        duracion_horas: 120,
        fecha_inicio: '2021-05-01',
        fecha_fin: '2021-08-31',
        institucion: 'Universidad Javeriana'
      },
      { 
        nombre: 'Administración de Empresas',
        descripcion: 'Carrera universitaria en administración', 
        tipo: 'curso',
        duracion_horas: 4200,
        fecha_inicio: '2016-01-15',
        fecha_fin: '2020-12-15',
        institucion: 'Universidad EAN'
      },
      { 
        nombre: 'Especialización en Finanzas',
        descripcion: 'Especialización en análisis y gestión financiera', 
        tipo: 'curso',
        duracion_horas: 300,
        fecha_inicio: '2021-01-15',
        fecha_fin: '2021-12-15',
        institucion: 'Universidad ICESI'
      }
    ]);
    console.log('✅ Capacitaciones creadas:', capacitaciones.length);

    // Create comprehensive Departamentos
    const departamentos = await Departamento.bulkCreate([
      {
        nombre: 'Tecnología',
        descripcion: 'Departamento de desarrollo de software e infraestructura tecnológica',
        gerente: 'Carlos Mendoza',
        codigo: 'TECH',
        activo: true
      },
      {
        nombre: 'Recursos Humanos',
        descripcion: 'Gestión del talento humano y desarrollo organizacional',
        gerente: 'María González',
        codigo: 'RRHH',
        activo: true
      },
      {
        nombre: 'Finanzas',
        descripcion: 'Administración financiera y contabilidad',
        gerente: 'Roberto Silva',
        codigo: 'FIN',
        activo: true
      },
      {
        nombre: 'Marketing',
        descripcion: 'Estrategias de marketing digital y comunicación',
        gerente: 'Ana Jiménez',
        codigo: 'MKT',
        activo: true
      },
      {
        nombre: 'Ventas',
        descripcion: 'Comercialización y desarrollo de negocios',
        gerente: 'Luis Herrera',
        codigo: 'VNT',
        activo: true
      },
      {
        nombre: 'Operaciones',
        descripcion: 'Gestión operativa y logística',
        gerente: 'Patricia López',
        codigo: 'OPS',
        activo: false
      }
    ]);
    console.log('✅ Departamentos creados:', departamentos.length);

    // Create comprehensive Puestos
    const puestos = await Puesto.bulkCreate([
      // Departamento de Tecnología
      {
        nombre: 'Desarrollador Frontend Junior',
        descripcion: 'Desarrollo de interfaces de usuario modernas y responsivas',
        departamento: 'Tecnología',
        nivel: 'junior',
        salario_min: 35000,
        salario_max: 55000,
        requisitos: 'Experiencia con HTML, CSS, JavaScript',
        experiencia_minima: 1,
        activo: true
      },
      {
        nombre: 'Desarrollador Frontend Senior',
        descripcion: 'Liderazgo técnico en desarrollo frontend y arquitectura',
        departamento: 'Tecnología',
        nivel: 'senior',
        salario_min: 80000,
        salario_max: 120000,
        requisitos: 'React, TypeScript, arquitectura frontend',
        experiencia_minima: 4,
        activo: true
      },
      {
        nombre: 'Desarrollador Backend Junior',
        descripcion: 'Desarrollo de APIs y servicios backend',
        departamento: 'Tecnología',
        nivel: 'junior',
        salario_min: 40000,
        salario_max: 65000,
        requisitos: 'Node.js, PostgreSQL, APIs REST',
        experiencia_minima: 1,
        activo: true
      },
      {
        nombre: 'Desarrollador Backend Senior',
        descripcion: 'Arquitectura de sistemas y liderazgo técnico backend',
        departamento: 'Tecnología',
        nivel: 'senior',
        salario_min: 90000,
        salario_max: 130000,
        requisitos: 'Arquitectura de microservicios, bases de datos',
        experiencia_minima: 5,
        activo: true
      },
      {
        nombre: 'Desarrollador Full Stack',
        descripcion: 'Desarrollo completo de aplicaciones web',
        departamento: 'Tecnología',
        nivel: 'mid',
        salario_min: 70000,
        salario_max: 110000,
        requisitos: 'Frontend y backend, experiencia integral',
        experiencia_minima: 3,
        activo: true
      },
      {
        nombre: 'Arquitecto de Software',
        descripcion: 'Diseño de arquitecturas de software escalables',
        departamento: 'Tecnología',
        nivel: 'lead',
        salario_min: 160000,
        salario_max: 240000,
        requisitos: 'Experiencia en arquitecturas distribuidas',
        experiencia_minima: 8,
        activo: true
      },
      {
        nombre: 'DevOps Engineer',
        descripcion: 'Automatización de despliegues e infraestructura',
        departamento: 'Tecnología',
        nivel: 'senior',
        salario_min: 100000,
        salario_max: 150000,
        requisitos: 'Docker, Kubernetes, CI/CD, AWS',
        experiencia_minima: 4,
        activo: true
      },
      {
        nombre: 'QA Tester',
        descripcion: 'Pruebas de calidad y automatización',
        departamento: 'Tecnología',
        nivel: 'mid',
        salario_min: 45000,
        salario_max: 70000,
        requisitos: 'Automatización de pruebas, Selenium',
        experiencia_minima: 2,
        activo: true
      },
      
      // Departamento de Gestión
      {
        nombre: 'Gerente de Proyectos',
        descripcion: 'Gestión y coordinación de proyectos tecnológicos',
        departamento: 'Gestión',
        nivel: 'manager',
        salario_min: 100000,
        salario_max: 160000,
        requisitos: 'PMP, metodologías ágiles, liderazgo',
        experiencia_minima: 5,
        activo: true
      },
      {
        nombre: 'Product Manager',
        descripcion: 'Gestión de productos digitales y roadmap',
        departamento: 'Gestión',
        nivel: 'manager',
        salario_min: 120000,
        salario_max: 180000,
        requisitos: 'Experiencia en productos digitales',
        experiencia_minima: 4,
        activo: true
      },
      {
        nombre: 'Scrum Master',
        descripcion: 'Facilitación de metodologías ágiles',
        departamento: 'Gestión',
        nivel: 'mid',
        salario_min: 80000,
        salario_max: 120000,
        requisitos: 'Certificación Scrum Master',
        experiencia_minima: 3,
        activo: true
      },
      
      // Departamento de Marketing
      {
        nombre: 'Especialista en Marketing Digital',
        descripcion: 'Estrategias de marketing online y redes sociales',
        departamento: 'Marketing',
        nivel: 'mid',
        salario_min: 55000,
        salario_max: 90000,
        requisitos: 'Google Ads, redes sociales, analytics',
        experiencia_minima: 2,
        activo: true
      },
      {
        nombre: 'Diseñador UX/UI',
        descripcion: 'Diseño de experiencia e interfaz de usuario',
        departamento: 'Marketing',
        nivel: 'mid',
        salario_min: 65000,
        salario_max: 100000,
        requisitos: 'Figma, Adobe XD, prototipado',
        experiencia_minima: 3,
        activo: true
      },
      {
        nombre: 'Community Manager',
        descripcion: 'Gestión de redes sociales y comunidades online',
        departamento: 'Marketing',
        nivel: 'junior',
        salario_min: 30000,
        salario_max: 50000,
        requisitos: 'Gestión de redes sociales',
        experiencia_minima: 1,
        activo: true
      },
      
      // Departamento de Ventas
      {
        nombre: 'Ejecutivo de Ventas',
        descripcion: 'Gestión de clientes y cierre de ventas',
        departamento: 'Ventas',
        nivel: 'mid',
        salario_min: 50000,
        salario_max: 80000,
        requisitos: 'CRM, técnicas de ventas',
        experiencia_minima: 2,
        activo: true
      },
      {
        nombre: 'Gerente de Ventas',
        descripcion: 'Liderazgo del equipo de ventas y estrategia comercial',
        departamento: 'Ventas',
        nivel: 'manager',
        salario_min: 110000,
        salario_max: 170000,
        requisitos: 'Liderazgo de equipos comerciales',
        experiencia_minima: 5,
        activo: true
      },
      
      // Departamento de Finanzas
      {
        nombre: 'Analista Financiero',
        descripcion: 'Análisis financiero y reportes ejecutivos',
        departamento: 'Finanzas',
        nivel: 'mid',
        salario_min: 60000,
        salario_max: 90000,
        requisitos: 'Excel avanzado, análisis financiero',
        experiencia_minima: 2,
        activo: true
      },
      {
        nombre: 'Controller Financiero',
        descripcion: 'Control financiero y gestión contable',
        departamento: 'Finanzas',
        nivel: 'manager',
        salario_min: 120000,
        salario_max: 180000,
        requisitos: 'CPA, experiencia en control financiero',
        experiencia_minima: 6,
        activo: true
      },
      
      // Departamento de Recursos Humanos
      {
        nombre: 'Especialista en Reclutamiento',
        descripcion: 'Búsqueda y selección de talento',
        departamento: 'Recursos Humanos',
        nivel: 'mid',
        salario_min: 55000,
        salario_max: 80000,
        requisitos: 'Experiencia en reclutamiento IT',
        experiencia_minima: 2,
        activo: true
      },
      {
        nombre: 'Business Partner de RRHH',
        descripcion: 'Socio estratégico de negocio en recursos humanos',
        departamento: 'Recursos Humanos',
        nivel: 'senior',
        salario_min: 100000,
        salario_max: 150000,
        requisitos: 'Psicología, experiencia en RRHH estratégico',
        experiencia_minima: 5,
        activo: true
      }
    ]);
    console.log('✅ Puestos creados:', puestos.length);

    // Generate 100 realistic candidates with varied data
    const candidatosData = [];
    const nombres = ['Ana', 'Luis', 'Carmen', 'Roberto', 'Isabella', 'Diego', 'Sofía', 'Miguel', 'Valeria', 'Carlos', 'Gabriela', 'Fernando', 'Mariana', 'Andrés', 'Paola', 'José', 'María', 'Pedro', 'Luz', 'David', 'Andrea', 'Alejandro', 'Patricia', 'Ricardo', 'Elena', 'Juan', 'Natalia', 'Sebastián', 'Carolina', 'Daniel', 'Mónica', 'Javier', 'Claudia', 'Eduardo', 'Silvia', 'Mauricio', 'Teresa', 'Guillermo', 'Beatriz', 'Pablo', 'Gloria', 'Antonio', 'Rosa', 'Jorge', 'Sandra', 'Raúl', 'Esperanza', 'Francisco', 'Pilar', 'Enrique'];
    const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez'];
    const ciudades = ['Santo Domingo', 'Santiago', 'Puerto Plata', 'San Cristóbal', 'La Romana', 'San Pedro de Macorís', 'Higüey', 'Moca', 'Bani', 'Azua'];
    const sectores = ['Piantini', 'Naco', 'Bella Vista', 'Gazcue', 'Zona Colonial', 'Los Cacicazgos', 'Serrallés', 'Villa Mella', 'Los Alcarrizos', 'Boca Chica'];
    const estados = ['aplicado', 'en_revision', 'preseleccionado', 'entrevista_inicial', 'entrevista_tecnica', 'entrevista_final', 'aprobado', 'rechazado', 'contratado'];
    const disponibilidades = ['inmediata', '15_dias', '30_dias', 'a_convenir'];

    // Create distribution for states (realistic distribution)
    const stateDistribution = {
      'aplicado': 20,          // 20%
      'en_revision': 18,       // 18%
      'preseleccionado': 15,   // 15%
      'entrevista_inicial': 12, // 12%
      'entrevista_tecnica': 10, // 10%
      'entrevista_final': 8,   // 8%
      'aprobado': 7,           // 7%
      'rechazado': 6,          // 6%
      'contratado': 4          // 4% (estos se convertirán en empleados)
    };

    let candidateCount = 0;
    for (const [estado, count] of Object.entries(stateDistribution)) {
      for (let i = 0; i < count; i++) {
        candidateCount++;
        const nombre = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
        const sector = sectores[Math.floor(Math.random() * sectores.length)];
        
        candidatosData.push({
          nombres: nombre,
          apellidos: `${apellido1} ${apellido2}`,
          email: `${nombre.toLowerCase()}.${apellido1.toLowerCase()}${candidateCount}@email.com`,
          telefono: `809 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
          documento_identidad: `402${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
          fecha_nacimiento: `${1985 + Math.floor(Math.random() * 15)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          direccion: `${sector} #${Math.floor(Math.random() * 200) + 1}, ${ciudad}`,
          salario_aspirado: 55000 + Math.floor(Math.random() * 90000), // 55K - 145K
          disponibilidad: disponibilidades[Math.floor(Math.random() * disponibilidades.length)],
          estado: estado,
          fecha_aplicacion: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
        });
      }
    }

    // Create candidatos
    const candidatos = [];
    for (const candidatoData of candidatosData) {
      const candidato = await Candidato.create(candidatoData);
      candidatos.push(candidato);
    }
    console.log('✅ Candidatos creados:', candidatos.length);

    // Create 30+ employees with varied levels and hiring dates across different months
    const empleadosData = [];
    const contratadosCandidatos = candidatos.filter(c => c.estado === 'contratado' || c.estado === 'aprobado');
    
    // Generate dates from January 2024 to current date for more realistic data
    const generateRandomDate = () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date();
      const timeDiff = endDate.getTime() - startDate.getTime();
      const randomTime = Math.random() * timeDiff;
      const randomDate = new Date(startDate.getTime() + randomTime);
      return randomDate.toISOString().split('T')[0];
    };

    // Create employees from contracted candidates
    for (let i = 0; i < Math.min(contratadosCandidatos.length, 35); i++) {
      const candidato = contratadosCandidatos[i];
      const puesto = puestos[Math.floor(Math.random() * puestos.length)];
      
      // Calculate salary within the position range
      const salarioMin = puesto.salario_min;
      const salarioMax = puesto.salario_max;
      const salarioAcordado = salarioMin + Math.floor(Math.random() * (salarioMax - salarioMin));
      
      empleadosData.push({
        codigo_empleado: `EMP${String(i + 1).padStart(3, '0')}`,
        candidatoId: candidato.id,
        puestoId: puesto.id,
        fecha_ingreso: generateRandomDate(),
        salario_acordado: salarioAcordado,
        estado: Math.random() > 0.95 ? 'inactivo' : 'activo', // 5% inactive
        tipo_contrato: Math.random() > 0.8 ? 'temporal' : 'indefinido' // 20% temporal
      });
    }

    const empleados = await Empleado.bulkCreate(empleadosData);
    console.log('✅ Empleados creados:', empleados.length);

    // Update candidato states to 'contratado' for those who became employees
    const empleadoCandidatoIds = empleados.map(emp => emp.candidatoId);
    await Candidato.update(
      { estado: 'contratado' },
      { where: { id: empleadoCandidatoIds } }
    );

    // Create associations manually using direct table insertions
    console.log('🔗 Creando asociaciones de candidatos...');
    
    try {
      // Generate random competencia associations
      const competenciaAssociations = [];
      candidatos.forEach((candidato, index) => {
        // Each candidato gets 3-6 random competencias
        const numCompetencias = 3 + Math.floor(Math.random() * 4);
        const selectedCompetencias = [];
        
        for (let i = 0; i < numCompetencias; i++) {
          let randomCompetencia;
          do {
            randomCompetencia = competencias[Math.floor(Math.random() * competencias.length)];
          } while (selectedCompetencias.includes(randomCompetencia.id));
          
          selectedCompetencias.push(randomCompetencia.id);
          competenciaAssociations.push({
            candidatoId: candidato.id,
            competenciaId: randomCompetencia.id
          });
        }
      });

      // Insert competencia associations
      await sequelize.getQueryInterface().bulkInsert('CandidatoCompetencias', 
        competenciaAssociations.map(assoc => ({
          ...assoc,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      // Generate random idioma associations
      const idiomaAssociations = [];
      candidatos.forEach(candidato => {
        // Each candidato knows at least Spanish and 1-3 other languages
        idiomaAssociations.push({
          candidatoId: candidato.id,
          idiomaId: idiomas[0].id // Spanish
        });
        
        const numOtherLanguages = 1 + Math.floor(Math.random() * 3);
        const selectedIdiomas = [idiomas[0].id];
        
        for (let i = 0; i < numOtherLanguages; i++) {
          let randomIdioma;
          do {
            randomIdioma = idiomas[Math.floor(Math.random() * idiomas.length)];
          } while (selectedIdiomas.includes(randomIdioma.id));
          
          selectedIdiomas.push(randomIdioma.id);
          idiomaAssociations.push({
            candidatoId: candidato.id,
            idiomaId: randomIdioma.id
          });
        }
      });

      // Insert idioma associations
      await sequelize.getQueryInterface().bulkInsert('CandidatoIdiomas', 
        idiomaAssociations.map(assoc => ({
          ...assoc,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );

      // Generate random capacitacion associations
      const capacitacionAssociations = [];
      candidatos.forEach(candidato => {
        // Each candidato has 1-3 capacitaciones
        const numCapacitaciones = 1 + Math.floor(Math.random() * 3);
        const selectedCapacitaciones = [];
        
        for (let i = 0; i < numCapacitaciones; i++) {
          let randomCapacitacion;
          do {
            randomCapacitacion = capacitaciones[Math.floor(Math.random() * capacitaciones.length)];
          } while (selectedCapacitaciones.includes(randomCapacitacion.id));
          
          selectedCapacitaciones.push(randomCapacitacion.id);
          capacitacionAssociations.push({
            candidatoId: candidato.id,
            capacitacionId: randomCapacitacion.id
          });
        }
      });

      // Insert capacitacion associations
      await sequelize.getQueryInterface().bulkInsert('CandidatoCapacitacions', 
        capacitacionAssociations.map(assoc => ({
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

    // Create comprehensive work experience
    console.log('💼 Creando experiencias laborales...');
    try {
      const { ExperienciaLaboral } = require('../models');
      
      const experienciasData = [];
      
      // Generate 1-3 work experiences per candidato
      candidatos.forEach(candidato => {
        const numExperiencias = 1 + Math.floor(Math.random() * 3);
        const empresas = [
          'TechCorp SAS', 'Digital Solutions Ltda', 'InnovaSoft SA', 'DataTech Colombia',
          'CloudSystems SAS', 'WebDev Partners', 'StartupLab Ltda', 'Enterprise Solutions',
          'AgileTeam SAS', 'CodeFactory Ltda', 'NextGen Tech', 'FutureTech SA'
        ];
        
        const puestos = [
          'Desarrollador Junior', 'Desarrollador Senior', 'Analista de Sistemas',
          'Coordinador de Proyectos', 'Especialista en QA', 'DevOps Engineer',
          'Product Owner', 'Scrum Master', 'Architect', 'Tech Lead'
        ];
        
        for (let i = 0; i < numExperiencias; i++) {
          const startYear = 2018 + Math.floor(Math.random() * 5);
          const endYear = startYear + 1 + Math.floor(Math.random() * 3);
          const isCurrent = i === 0 && Math.random() > 0.5;
          
          experienciasData.push({
            candidatoId: candidato.id,
            empresa: empresas[Math.floor(Math.random() * empresas.length)],
            puesto: puestos[Math.floor(Math.random() * puestos.length)],
            descripcion: 'Desarrollo de aplicaciones web y móviles utilizando tecnologías modernas',
            fecha_inicio: `${startYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
            fecha_fin: isCurrent ? null : `${endYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
            trabajo_actual: isCurrent,
            salario: 40000 + Math.floor(Math.random() * 80000),
            motivo_salida: isCurrent ? null : ['Crecimiento profesional', 'Mejor oportunidad', 'Finalización de contrato'][Math.floor(Math.random() * 3)]
          });
        }
      });
      
      await ExperienciaLaboral.bulkCreate(experienciasData);
      console.log('✅ Experiencias laborales creadas:', experienciasData.length);
    } catch (expError) {
      console.error('⚠️  Error creando experiencias laborales:', expError.message);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📋 Usuarios creados:');
    console.log('   Admin: admin@empresa.com / admin123');
    console.log('   HR Manager: hr@empresa.com / hr123');
    console.log('   Recruiter: recruiter@empresa.com / recruiter123');
    console.log('\n📊 Datos de ejemplo creados:');
    console.log(`   ${competencias.length} competencias`);
    console.log(`   ${idiomas.length} idiomas`);
    console.log(`   ${capacitaciones.length} capacitaciones`);
    console.log(`   ${puestos.length} puestos`);
    console.log(`   ${candidatos.length} candidatos (distribución realista)`);
    console.log(`   ${empleados.length} empleados (con fechas de ingreso variadas)`);
    console.log('\n📈 Estados de candidatos distribuidos:');
    
    // Count candidatos by state
    const estadoCounts = {};
    candidatos.forEach(c => {
      estadoCounts[c.estado] = (estadoCounts[c.estado] || 0) + 1;
    });
    
    Object.entries(estadoCounts).forEach(([estado, count]) => {
      console.log(`   ${estado}: ${count} candidatos`);
    });

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