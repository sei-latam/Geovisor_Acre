# 👨‍💼 Manual de Administración - Geovisor Acre

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Roles y Responsabilidades](#roles-y-responsabilidades)
3. [Administración de Infraestructura](#administración-de-infraestructura)
4. [Administración de GeoServer](#administración-de-geoserver)
5. [Administración de Base de Datos](#administración-de-base-de-datos)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Respaldo y Recuperación](#respaldo-y-recuperación)
8. [Seguridad](#seguridad)
9. [Procedimientos de Emergencia](#procedimientos-de-emergencia)
10. [Contactos](#contactos)

---

## 🎯 Introducción

### Propósito
Este manual está dirigido a administradores de sistemas responsables de:
- Mantener la disponibilidad y rendimiento del Geovisor
- Administrar recursos en GCP
- Gestionar usuarios y permisos
- Implementar backups y recuperación
- Monitorear la infraestructura
- Resolver incidentes

### Audiencia
- Administradores de Sistemas
- DevOps Engineers
- Administradores de Bases de Datos
- Personal de IT

---

## 👥 Roles y Responsabilidades

### Administrador de Infraestructura (DevOps)
- **Responsable**: Disponibilidad de VM, networking, seguridad
- **Tareas**:
  - Provisionar instancias Compute Engine
  - Configurar firewalls y reglas de seguridad
  - Monitorear recursos (CPU, RAM, almacenamiento)
  - Aplicar parches de SO
  - Gestionar backups automáticos

### Administrador de GeoServer
- **Responsable**: Servicio WMS/WFS, capas, estilos, rendimiento
- **Tareas**:
  - Crear y publicar capas
  - Configurar stores (PostGIS)
  - Aplicar estilos SLD
  - Monitorear logs de servicio
  - Optimizar caché

### Administrador de Base de Datos
- **Responsable**: PostgreSQL, PostGIS, integridad de datos
- **Tareas**:
  - Crear bases de datos y usuarios
  - Mantener índices
  - Monitorear performance
  - Hacer backups
  - Restaurar datos

### Administrador de Aplicación
- **Responsable**: Frontend, actualizaciones, contenido
- **Tareas**:
  - Actualizar sitio web
  - Gestionar versiones
  - Responder a usuarios
  - Documentar cambios

---

## 🖥️ Administración de Infraestructura

### 2.1 Gestión de Instancias Compute Engine

#### Ver estado de VM

```bash
# Listar instancias
gcloud compute instances list

# Detalles específicos
gcloud compute instances describe geovisor-server --zone=southamerica-east1-a

# Ver métricas en tiempo real
gcloud monitoring dashboards list
```

#### Conectarse a VM

```bash
# SSH directo
gcloud compute ssh geovisor-server --zone=southamerica-east1-a

# SSH con forwarding de puerto (para GeoServer)
gcloud compute ssh geovisor-server --zone=southamerica-east1-a \
  --ssh-flag="-L 8080:localhost:8080"
# Acceder a: http://localhost:8080/geoserver
```

#### Escalamiento de Recursos

```bash
# Detener instancia
gcloud compute instances stop geovisor-server --zone=southamerica-east1-a

# Cambiar tipo de máquina
gcloud compute instances set-machine-type geovisor-server \
  --machine-type=e2-standard-2 \
  --zone=southamerica-east1-a

# Iniciar instancia
gcloud compute instances start geovisor-server --zone=southamerica-east1-a
```

#### Monitoreo de Recursos

```bash
# Conectar a VM y ejecutar
# CPU
top -b -n 1 | head -20

# Memoria
free -h

# Almacenamiento
df -h

# Procesos de Java (GeoServer)
ps aux | grep java
```

### 2.2 Firewall y Seguridad de Red

#### Crear reglas firewall

```bash
# Permitir HTTP
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server

# Permitir HTTPS
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=https-server

# Permitir GeoServer (solo desde IP específica)
gcloud compute firewall-rules create allow-geoserver \
  --allow=tcp:8080 \
  --source-ranges=203.0.113.0/32 \
  --target-tags=geoserver

# Permitir PostgreSQL (solo desde VM)
gcloud compute firewall-rules create allow-postgres \
  --allow=tcp:5432 \
  --source-tags=geoserver \
  --target-tags=postgres
```

#### Ver reglas activas

```bash
gcloud compute firewall-rules list
gcloud compute firewall-rules describe allow-http
```

---

## 🗺️ Administración de GeoServer

### 3.1 Acceso y Autenticación

#### Cambiar contraseña admin

```bash
# SSH a VM
ssh admin@[VM_IP]

# Acceder a directorio GeoServer
cd /opt/geoserver-2.28.x/data_dir

# Editar archivo de usuarios
nano security/users.properties

# Cambiar contraseña (hash SHA)
# Usar herramienta online o generar con:
echo -n "nueva_contraseña" | sha256sum
```

#### Crear usuarios adicionales

En GUI de GeoServer:
1. Security → Users, Groups, Roles
2. New User
3. Asignar rol (ROLE_ADMIN, ROLE_CATALOG_READ, etc.)

### 3.2 Gestión de Capas y Stores

#### Agregar nuevo store PostGIS

```bash
# En GeoServer Web UI:
# 1. Data Stores → New
# 2. Tipo: PostGIS Connection Pool
# 3. Configurar:
#    - Database: geovisor-db
#    - Host: [IP_CLOUD_SQL]
#    - Port: 5432
#    - User: geoserver_user
#    - Password: [CONTRASEÑA]
#    - Max Connections: 20
# 4. Save
```

#### Publicar nueva capa

```bash
# En GeoServer Web UI:
# 1. Layers → Add Layer
# 2. Seleccionar store
# 3. Publish
# 4. Configurar:
#    - Title: [Nombre descriptivo]
#    - Abstract: Descripción
#    - SRS: EPSG:3857 (Web Mercator)
#    - Bounding Box: Calculate from Data
# 5. Publishing → Default Style
# 6. Save
```

#### Crear estilo SLD personalizado

```bash
# En GeoServer Web UI:
# 1. Styles → Add Style
# 2. Copiar template SLD
# 3. Personalizar colores y simbología
# 4. Validar con XML
# 5. Save
```

**Ejemplo de Estilo para Manchas Inundación:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" 
  xmlns:gml="http://www.opengis.net/gml"
  xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <NamedLayer>
    <Name>manchas_inundacion</Name>
    <UserStyle>
      <Title>Manchas de Inundación</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>0.75</Opacity>
            <ColorMap type="intervals">
              <ColorMapEntry color="#0000FF" quantity="0" label="Sin inundación"/>
              <ColorMapEntry color="#00FF00" quantity="1" label="Inundado leve"/>
              <ColorMapEntry color="#FFFF00" quantity="2" label="Inundado moderado"/>
              <ColorMapEntry color="#FF6600" quantity="3" label="Inundado fuerte"/>
              <ColorMapEntry color="#FF0000" quantity="4" label="Inundado extremo"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```

### 3.3 Monitoreo y Performance

#### Monitorar logs de GeoServer

```bash
# SSH a VM
ssh admin@[VM_IP]

# Ver logs en tiempo real
tail -f /opt/geoserver-2.28.x/data_dir/logs/geoserver.log

# Buscar errores
grep ERROR /opt/geoserver-2.28.x/data_dir/logs/geoserver.log | tail -20

# Ver estadísticas de solicitudes
grep GetMap /opt/geoserver-2.28.x/data_dir/logs/geoserver.log | wc -l
```

#### Configurar caché de tiles

En GeoServer Web UI:
1. Tile Caching → Caches
2. New
3. Configurar:
   - Nombre: default
   - Ruta: /var/cache/geoserver
   - Tipo: Image/PNG

#### Limpiar caché

```bash
# En GeoServer Web UI:
# 1. Tile Caching → Caches
# 2. Seleccionar cache
# 3. Truncate

# O vía línea de comandos:
rm -rf /var/cache/geoserver/*
```

---

## 🗄️ Administración de Base de Datos

### 4.1 Conexión y Acceso

#### Conectar a PostgreSQL

```bash
# Localmente en VM
psql -U postgres -d geovisor-db

# Remotamente desde máquina local
psql -h 35.XXX.XXX.XXX -U postgres -d geovisor-db -p 5432
```

#### Crear usuarios y roles

```sql
-- Crear rol de administrador
CREATE ROLE db_admin WITH LOGIN CREATEDB CREATEROLE;
ALTER ROLE db_admin WITH PASSWORD 'contraseña_segura';

-- Crear rol de lectura
CREATE ROLE db_reader WITH LOGIN NOLOGIN;
GRANT CONNECT ON DATABASE geovisor-db TO db_reader;
GRANT USAGE ON SCHEMA geovisor_data TO db_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA geovisor_data TO db_reader;

-- Crear rol GeoServer
CREATE ROLE geoserver_user WITH LOGIN;
ALTER ROLE geoserver_user WITH PASSWORD 'geoserver_pass';
GRANT CONNECT ON DATABASE geovisor-db TO geoserver_user;
GRANT USAGE ON SCHEMA geovisor_data TO geoserver_user;
```

### 4.2 Mantenimiento de Índices

#### Ver índices existentes

```sql
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'geovisor_data';
```

#### Crear índices espaciales

```sql
-- Índice GIST para raster
CREATE INDEX idx_wsel_p01_raster 
ON geovisor_data.manchas_inundacion_wsel_p01 
USING GIST (st_convexhull(raster_wsel));

-- Índice BRIN para performance
CREATE INDEX idx_wsel_p01_brin 
ON geovisor_data.manchas_inundacion_wsel_p01 
USING BRIN (raster_wsel);
```

#### Reindexar tabla

```sql
REINDEX TABLE geovisor_data.manchas_inundacion_wsel_p01;
```

### 4.3 Analizar Queries

```sql
-- EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT st_astext(st_convexhull(raster_wsel))
FROM geovisor_data.manchas_inundacion_wsel_p01
WHERE nivel_wsel >= 180 AND nivel_wsel <= 185;

-- Ver estadísticas de tabla
SELECT schemaname, tablename, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE schemaname = 'geovisor_data';
```

---

## 📊 Monitoreo y Mantenimiento

### 5.1 Dashboard de Monitoreo

#### Crear dashboard en GCP Console

```bash
gcloud monitoring dashboards create --config-from-file=dashboard.yaml
```

**dashboard.yaml:**

```yaml
displayName: "Geovisor Acre - Monitoring"
dashboardFilters: []
gridLayout:
  widgets:
  - title: "CPU Usage"
    xyChart:
      dataSets:
      - timeSeriesQuery:
          timeSeriesFilter:
            filter: 'resource.type="gce_instance" metric.type="compute.googleapis.com/instance/cpu/utilization"'
  - title: "Memory Usage"
    xyChart:
      dataSets:
      - timeSeriesQuery:
          timeSeriesFilter:
            filter: 'resource.type="gce_instance" metric.type="compute.googleapis.com/instance/memory/usage"'
  - title: "Network In/Out"
    xyChart:
      dataSets:
      - timeSeriesQuery:
          timeSeriesFilter:
            filter: 'resource.type="gce_instance" metric.type="compute.googleapis.com/instance/network/received_bytes_count"'
```

#### Alertas automáticas

```bash
# Crear política de alertas
gcloud alpha monitoring policies create \
  --notification-channels=[CHANNEL_ID] \
  --display-name="High CPU Usage" \
  --condition-display-name="CPU > 80%" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=300s
```

### 5.2 Tareas de Mantenimiento Programado

| Tarea | Frecuencia | Descripción |
|------|-----------|------------|
| VACUUM ANALYZE | Semanal | Optimizar BD |
| Backup DB | Diaria | Respaldar datos |
| Limpiar logs | Mensual | Eliminar logs antiguos |
| Actualizar SO | Trimestral | Parches de seguridad |
| Revisar performance | Semanal | Analizar métricas |

---

## 💾 Respaldo y Recuperación

### 6.1 Backup de Base de Datos

#### Backup automático vía pg_dump

```bash
#!/bin/bash
# backup-db.sh

DB_USER="postgres"
DB_HOST="localhost"
DB_NAME="geovisor-db"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio
mkdir -p $BACKUP_DIR

# Realizar backup
pg_dump -U $DB_USER -h $DB_HOST $DB_NAME | gzip > "$BACKUP_DIR/geovisor_$DATE.sql.gz"

# Eliminar backups antiguos (>30 días)
find $BACKUP_DIR -name "geovisor_*.sql.gz" -mtime +30 -delete

# Copiar a Google Cloud Storage
gsutil cp "$BACKUP_DIR/geovisor_$DATE.sql.gz" gs://geovisor-backups/

echo "Backup completado: $BACKUP_DIR/geovisor_$DATE.sql.gz"
```

#### Configurar cron

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diariamente a las 2 AM)
0 2 * * * /home/admin/backup-db.sh >> /var/log/backup.log 2>&1
```

### 6.2 Recuperación de Backup

```bash
# Descomprimir backup
gunzip geovisor_20260710_020000.sql.gz

# Restaurar en nueva BD
psql -U postgres -d geovisor-db < geovisor_20260710_020000.sql

# O crear nueva BD y restaurar
createdb geovisor-db-restaurada
psql -U postgres -d geovisor-db-restaurada < geovisor_20260710_020000.sql
```

### 6.3 Backup de GeoServer

```bash
# Respaldar data_dir
tar -czf geoserver_backup_$(date +%Y%m%d).tar.gz /opt/geoserver-2.28.x/data_dir

# Copiar a GCS
gsutil cp geoserver_backup_*.tar.gz gs://geovisor-backups/
```

---

## 🔐 Seguridad

### 7.1 Configuración SSL/TLS

#### Generar certificado Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --standalone -d geoserver.coast-wind.org

# Renovación automática
sudo systemctl enable certbot.timer
```

#### Configurar en GeoServer

En GeoServer Web UI:
1. Settings → Global
2. HTTP Proxy Settings
3. Enable Proxy Base URL: `https://geoserver.coast-wind.org/geoserver`

### 7.2 Gestión de Contraseñas

#### Cambiar contraseñas regularmente

- Admin GeoServer: Cada 90 días
- DB admin: Cada 90 días
- Usuarios de aplicación: Cada 6 meses

#### Política de contraseñas

- Mínimo 12 caracteres
- Incluir mayúsculas, minúsculas, números, símbolos
- No reutilizar últimas 5 contraseñas
- Expiración cada 90 días

### 7.3 Auditoría y Logging

```bash
# Ver logs de acceso
grep "GET\|POST" /opt/geoserver-2.28.x/data_dir/logs/geoserver.log | grep -v ".png\|.jpg"

# Logs de errores
grep ERROR /opt/geoserver-2.28.x/data_dir/logs/geoserver.log

# Logs de autenticación
grep "Authentication" /opt/geoserver-2.28.x/data_dir/logs/geoserver.log
```

---

## 🚨 Procedimientos de Emergencia

### 8.1 Servicio GeoServer Caído

```bash
# SSH a VM
ssh admin@[VM_IP]

# Verificar estado
sudo systemctl status geoserver

# Reiniciar
sudo systemctl restart geoserver

# Verificar logs
tail -f /opt/geoserver-2.28.x/data_dir/logs/geoserver.log

# Si persiste, limpiar caché
sudo rm -rf /var/cache/geoserver/*
sudo systemctl restart geoserver
```

### 8.2 Disco Lleno

```bash
# Verificar uso
df -h

# Limpiar logs antiguos
find /opt/geoserver-2.28.x/data_dir/logs -name "*.log" -mtime +30 -delete

# Limpiar caché
rm -rf /var/cache/geoserver/*

# Verificar nuevamente
df -h
```

### 8.3 BD No Responde

```bash
# Verificar servicio
sudo systemctl status postgresql

# Ver conexiones activas
sudo -u postgres psql -c "SELECT pid, usename, application_name FROM pg_stat_activity;"

# Terminar conexiones problemáticas
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();"

# Reiniciar
sudo systemctl restart postgresql
```

---

## 📞 Contactos

### Equipo Técnico

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| Administrador Infraestructura | Carlos Mendez | carlos.mendez@unesp.br | +55 XX XXXXX |
| Administrador GeoServer | SEI Team | info@sei-latam.org | - |
| DBA | SENAMHI Tech | tech@senamhi.gob.pe | - |

### Escalación

1. **Nivel 1**: Administrador local (horario laboral)
2. **Nivel 2**: Equipo SEI (24h)
3. **Nivel 3**: Proveedor GCP (Enterprise support)

### Recursos

- **GCP Console**: https://console.cloud.google.com/
- **GeoServer GUI**: https://geoserver.coast-wind.org:8080/geoserver/web/
- **GitHub Repo**: https://github.com/sei-latam/Geovisor_Acre
- **Documentación**: https://sei-latam.github.io/Geovisor_Acre/

---

**Documento generado**: 2026-07-10  
**Versión**: 1.0  
**Último actualizado**: 2026-07-10
