---9.0 Consultas generales de las tablas

SELECT * FROM geovisor_data.nivel_wsel_tm ORDER BY nivel_wsel ASC; 
SELECT * FROM geovisor_data.manchas_inundacion_wsel_p01 ORDER BY nivel_wsel_p01 ASC;
SELECT * FROM geovisor_data.manchas_inundacion_velocity ORDER BY id_velocity ASC;

SELECT id_nivel_rios, COUNT(*) as total_rasters FROM geovisor_data.manchas_inundacion_wsel GROUP BY id_nivel_rios ORDER BY id_nivel_rios;
SELECT id_nivel_rios, COUNT(*) as total_rasters FROM geovisor_data.manchas_inundacion_velocity GROUP BY id_nivel_rios ORDER BY id_nivel_rios;

SELECT id_wsel, fecha_data, id_nivel_rios FROM geovisor_data.manchas_inundacion_wsel WHERE id_nivel_rios = 4;  --- cambiar los valores de los niveles de rios si es necesario
SELECT id_velocity, fecha_data, id_nivel_rios FROM geovisor_data.manchas_inundacion_velocity WHERE id_nivel_rios = 3;  --- cambiar los valores de niveles de rios si es necesario

SELECT id_wsel, fecha_data, id_nivel_rios FROM geovisor_data.manchas_inundacion_wsel ORDER BY id_nivel_rios ASC, fecha_data ASC LIMIT 50;
SELECT id_wsel, fecha_data, id_nivel_rios FROM geovisor_data.manchas_inundacion_velocity ORDER BY id_nivel_rios ASC, fecha_data ASC LIMIT 50;

SELECT id_wsel, fecha_data, id_nivel_rios, (ST_Metadata(raster_wsel)).*FROM geovisor_data.manchas_inundacion_wsel LIMIT 10;
SELECT id_velocity, fecha_data, id_nivel_rios, (ST_Metadata(raster_vel)).*FROM geovisor_data.manchas_inundacion_velocity LIMIT 10;