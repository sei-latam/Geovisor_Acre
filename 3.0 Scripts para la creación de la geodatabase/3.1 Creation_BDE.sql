/*
Importación de archivos GIS y creación de una Base de Datos Espaciales (BDE)
*/

--- Pasos Generales
--- 1.0 Registre un nuevo servidor, por ejemplo 'GeovisorTest'

--- 2.0 Creación de una base de datos, por ejemplo 'geovisor_db' 
CREATE DATABASE "geovisor-db"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LOCALE_PROVIDER = 'libc'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

--- 3.0 Creación de un schema en la base de datos, por ejemplo 'geovisor_data'
---- (opcional) puede usarse el schema public o topology.
CREATE SCHEMA geovisor_data AUTHORIZATION postgres;

--- 4.0 Creación de las extensiones de GIS (PostGIS)
create EXTENSION postgis;
create EXTENSION fuzzystrmatch;
create EXTENSION postgis_raster;
create EXTENSION postgis_topology;
create EXTENSION postgis_sfcgal;
create EXTENSION postgis_tiger_geocoder;

	
--- 5.0 Creación de un nuevo rol, por ejemplo 'administrador' con contraseña 'xxxxxx' y asignarle los permisos necesarios para administrar la base de datos.
CREATE ROLE administrador WITH
	LOGIN
	NOSUPERUSER
	CREATEDB
	CREATEROLE
	INHERIT
	REPLICATION
	BYPASSRLS
	CONNECTION LIMIT -1
	PASSWORD 'xxxxxx';
/*
Permisos especiales requeridos para la inserción de las tablas de manchas de inundación y niveles de rios.
En este caso se utiliza el rol de administrador, pero en caso de errores se puede utilizar el root de postgres que por defecto funciona
*/

-- Conceder permisos de uso sobre el esquema
GRANT USAGE ON SCHEMA geovisor_data TO administrador;

-- Conceder todos los privilegios sobre las tablas existentes en ese esquema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA geovisor_data TO administrador;

-- Conceder permisos sobre las secuencias (necesario para los campos SERIAL / llaves primarias)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA geovisor_data TO administrador;

-- Asegurar que las tablas que se creen en el futuro también tengan permisos automáticos
ALTER DEFAULT PRIVILEGES IN SCHEMA geovisor_data 
GRANT ALL PRIVILEGES ON TABLES TO administrador;

ALTER DEFAULT PRIVILEGES IN SCHEMA geovisor_data 
GRANT ALL PRIVILEGES ON SEQUENCES TO administrador;
	

-- 6.0 Creación de la tabla maestra de niveles de ríos WSEL
CREATE TABLE IF NOT EXISTS geovisor_data.nivel_wsel_tm (
    id_nivel_wsel SERIAL PRIMARY KEY, 
    nivel_wsel NUMERIC(10,4) NOT NULL,
    plan CHAR(3) NOT NULL,
    CONSTRAINT uq_nivel_plan UNIQUE (nivel_wsel, plan) 
);

---DROP TABLE IF EXISTS geovisor_data.nivel_wsel_tm;

-- 7.0 Creación de la tablas para almacenar las manchas de inundación de WSEL por planes (p01, p02, p03, p04 y p05) 

-- 7.1 Plan p01
CREATE TABLE IF NOT EXISTS geovisor_data.manchas_inundacion_wsel_p01 (
    id_wsel_p01 SERIAL PRIMARY KEY, 
    fecha_data_p01 TIMESTAMP, 
    nivel_wsel_p01 NUMERIC(10,4) NOT NULL, 
    plan_p01 CHAR(3) NOT NULL,
    raster_wsel_p01 raster,
    -- Corregido: Vincula los dos campos juntos a la restricción única compuesta
    CONSTRAINT fk_nivel_wsel_01 FOREIGN KEY (nivel_wsel_p01, plan_p01) 
        REFERENCES geovisor_data.nivel_wsel_tm (nivel_wsel, plan) ON DELETE CASCADE
);

-- 7.2 Plan p02
CREATE TABLE IF NOT EXISTS geovisor_data.manchas_inundacion_wsel_p02 (
    id_wsel_p02 SERIAL PRIMARY KEY, 
    fecha_data_p02 TIMESTAMP, 
    nivel_wsel_p02 NUMERIC(10,4) NOT NULL, 
    plan_p02 CHAR(3) NOT NULL,
    raster_wsel_p02 raster,
    CONSTRAINT fk_nivel_wsel_02 FOREIGN KEY (nivel_wsel_p02, plan_p02) 
        REFERENCES geovisor_data.nivel_wsel_tm (nivel_wsel, plan) ON DELETE CASCADE
);

-- 7.3 Plan p03
CREATE TABLE IF NOT EXISTS geovisor_data.manchas_inundacion_wsel_p03 (
    id_wsel_p03 SERIAL PRIMARY KEY, 
    fecha_data_p03 TIMESTAMP, 
    nivel_wsel_p03 NUMERIC(10,4) NOT NULL, 
    plan_p03 CHAR(3) NOT NULL,
    raster_wsel_p03 raster,
    CONSTRAINT fk_nivel_wsel_03 FOREIGN KEY (nivel_wsel_p03, plan_p03) 
        REFERENCES geovisor_data.nivel_wsel_tm (nivel_wsel, plan) ON DELETE CASCADE
);

-- 7.4 Plan p04
CREATE TABLE IF NOT EXISTS geovisor_data.manchas_inundacion_wsel_p04 (
    id_wsel_p04 SERIAL PRIMARY KEY, 
    fecha_data_p04 TIMESTAMP, 
    nivel_wsel_p04 NUMERIC(10,4) NOT NULL, 
    plan_p04 CHAR(3) NOT NULL,
    raster_wsel_p04 raster,
    CONSTRAINT fk_nivel_wsel_04 FOREIGN KEY (nivel_wsel_p04, plan_p04) 
        REFERENCES geovisor_data.nivel_wsel_tm (nivel_wsel, plan) ON DELETE CASCADE
);

-- 7.5 Plan p05
CREATE TABLE IF NOT EXISTS geovisor_data.manchas_inundacion_wsel_p05 (
    id_wsel_p05 SERIAL PRIMARY KEY, 
    fecha_data_p05 TIMESTAMP, 
    nivel_wsel_p05 NUMERIC(10,4) NOT NULL, 
    plan_p05 CHAR(3) NOT NULL,
    raster_wsel_p05 raster,
    CONSTRAINT fk_nivel_wsel_05 FOREIGN KEY (nivel_wsel_p05, plan_p05) 
        REFERENCES geovisor_data.nivel_wsel_tm (nivel_wsel, plan) ON DELETE CASCADE
);



---8.0 Creación de la tabla para almacenar las manchas de inundación de velocity (Face Velocity)
CREATE TABLE geovisor_data.manchas_inundacion_velocity (id_velocity SERIAL PRIMARY KEY, fecha_data TIMESTAMP, id_nivel_rios INTEGER,
    raster_vel raster,
    CONSTRAINT fk_velocity_nivel_rios FOREIGN KEY (id_nivel_rios) 
        REFERENCES geovisor_data.nivel_rios (id_nivel_rios) ON DELETE CASCADE);

		