const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5555,
    user: process.env.DB_ADMIN_USER || 'postgres', // Usuario administrador
    password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD,
    database: 'postgres'
  });

  const dbName = process.env.DB_NAME || 'rrhh_system';
  const dbUser = process.env.DB_USER || 'rrhh_user';
  const dbPassword = process.env.DB_PASSWORD || 'rrhh_password';

  try {
    console.log('🔌 Conectando a PostgreSQL como administrador...');
    await adminClient.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar/Crear usuario
    console.log(`👤 Verificando si el usuario '${dbUser}' existe...`);
    const userCheckResult = await adminClient.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [dbUser]
    );

    if (userCheckResult.rows.length === 0 && dbUser !== 'postgres') {
      console.log(`👤 Creando usuario '${dbUser}'...`);
      await adminClient.query(
        `CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`
      );
      console.log(`✅ Usuario '${dbUser}' creado exitosamente`);
    } else {
      console.log(`ℹ️  El usuario '${dbUser}' ya existe`);
    }

    // Verificar/Crear base de datos
    console.log(`🔍 Verificando si la base de datos '${dbName}' existe...`);
    const dbCheckResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 Creando base de datos '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE "${dbName}" OWNER "${dbUser}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    } else {
      console.log(`ℹ️  La base de datos '${dbName}' ya existe`);
    }

    // Otorgar permisos
    console.log(`🔐 Configurando permisos para '${dbUser}'...`);
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`);
    await adminClient.query(`ALTER USER "${dbUser}" CREATEDB`);
    console.log(`✅ Permisos configurados para '${dbUser}'`);

    // Conectarse a la nueva base de datos para crear extensiones si es necesario
    await adminClient.end();
    
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    console.log(`🔌 Conectando a la base de datos '${dbName}'...`);
    await dbClient.connect();

    // Crear extensiones útiles
    console.log('🧩 Creando extensiones...');
    try {
      await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Extensión uuid-ossp creada');
    } catch (err) {
      console.log('ℹ️  Extensión uuid-ossp no disponible (opcional)');
    }

    try {
      await dbClient.query('CREATE EXTENSION IF NOT EXISTS "unaccent"');
      console.log('✅ Extensión unaccent creada');
    } catch (err) {
      console.log('ℹ️  Extensión unaccent no disponible (opcional)');
    }

    await dbClient.end();

    console.log('\n🎉 ¡Configuración de base de datos completada!');
    console.log('\n📋 Resumen de la configuración:');
    console.log(`   📝 Base de datos: ${dbName}`);
    console.log(`   👤 Usuario: ${dbUser}`);
    console.log(`   🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   🚪 Puerto: ${process.env.DB_PORT || 5432}`);
    
    console.log('\n📄 Asegúrate de que tu archivo .env contenga:');
    console.log(`   DB_NAME=${dbName}`);
    console.log(`   DB_USER=${dbUser}`);
    console.log(`   DB_PASSWORD=${dbPassword}`);
    console.log(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
    console.log(`   DB_PORT=${process.env.DB_PORT || 5432}`);

    console.log('\n🚀 Próximos pasos:');
    console.log('   1. npm run seed    # Para poblar con datos de ejemplo');
    console.log('   2. npm run dev     # Para iniciar el servidor');

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL no está ejecutándose o no es accesible');
      console.error('   Verifica que PostgreSQL esté instalado y ejecutándose');
    } else if (error.code === '28P01') {
      console.error('\n💡 Error de autenticación');
      console.error('   Verifica las credenciales del usuario administrador');
    }
    
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 