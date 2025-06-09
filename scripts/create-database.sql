-- Script SQL para crear la base de datos del Sistema de RRHH
-- Ejecutar como usuario administrador de PostgreSQL (por ejemplo: postgres)

-- Crear usuario para la aplicación (opcional)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'rrhh_user') THEN
      
      CREATE ROLE rrhh_user LOGIN PASSWORD 'rrhh_password';
   END IF;
END
$do$;

-- Crear base de datos
CREATE DATABASE rrhh_system
    WITH OWNER = rrhh_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'es_ES.UTF-8'
    LC_CTYPE = 'es_ES.UTF-8'
    TEMPLATE = template0;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE rrhh_system TO rrhh_user;

-- Permitir al usuario crear bases de datos (útil para testing)
ALTER USER rrhh_user CREATEDB;

-- Conectarse a la nueva base de datos y crear extensiones
\c rrhh_system;

-- Crear extensiones útiles (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Mostrar información
\echo 'Base de datos rrhh_system creada exitosamente!'
\echo 'Usuario: rrhh_user'
\echo 'Contraseña: rrhh_password'
\echo ''
\echo 'Configuración .env recomendada:'
\echo 'DB_NAME=rrhh_system'
\echo 'DB_USER=rrhh_user'
\echo 'DB_PASSWORD=rrhh_password'
\echo 'DB_HOST=localhost'
\echo 'DB_PORT=5432' 