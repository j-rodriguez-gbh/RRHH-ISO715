const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Configuración para conectarse a PostgreSQL (sin especificar base de datos)
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres' // Conectarse a la base de datos por defecto
  });

  const dbName = process.env.DB_NAME || 'rrhh_system';
  const dbUser = process.env.DB_USER || 'postgres';

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await adminClient.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos ya existe
    console.log(`🔍 Verificando si la base de datos '${dbName}' existe...`);
    const dbCheckResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (dbCheckResult.rows.length > 0) {
      console.log(`ℹ️  La base de datos '${dbName}' ya existe`);
    } else {
      // Crear la base de datos
      console.log(`📦 Creando base de datos '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    }

    // Verificar si el usuario tiene permisos
    console.log(`🔐 Verificando permisos para el usuario '${dbUser}'...`);
    
    // Otorgar permisos completos al usuario sobre la base de datos
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`);
    console.log(`✅ Permisos otorgados al usuario '${dbUser}'`);

    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\n📋 Información de la base de datos:');
    console.log(`   📝 Nombre: ${dbName}`);
    console.log(`   🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   🚪 Puerto: ${process.env.DB_PORT || 5432}`);
    console.log(`   👤 Usuario: ${dbUser}`);
    console.log('\n🚀 Ahora puedes ejecutar:');
    console.log('   npm run seed    # Para poblar con datos de ejemplo');
    console.log('   npm run dev     # Para iniciar el servidor');

  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencias:');
      console.error('   1. Verifica que PostgreSQL esté ejecutándose');
      console.error('   2. Verifica las credenciales en el archivo .env');
      console.error('   3. Verifica la configuración de red de PostgreSQL');
    } else if (error.code === '28P01') {
      console.error('\n💡 Error de autenticación:');
      console.error('   1. Verifica el usuario y contraseña en .env');
      console.error('   2. Verifica que el usuario tenga permisos de creación');
    } else if (error.code === '42P04') {
      console.error('\n💡 La base de datos ya existe');
    }
    
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase; 