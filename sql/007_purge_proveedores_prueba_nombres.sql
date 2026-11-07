-- Limpieza defensiva en nube por nombre/código (por si alguna PC los re-sube).
-- Objetivos: Filtros Norte/Sur, venamerican, Yldemaro Uribe y códigos de prueba.

ALTER TABLE movimientos_inventario DISABLE TRIGGER trg_movimientos_inventario_inmutable;
ALTER TABLE productos DISABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE proveedores DISABLE TRIGGER trg_soft_delete_instead;

WITH doomed AS (
  SELECT id
  FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id
  FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id
  FROM producto_proveedores pp
  WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM historico_ref WHERE producto_id IN (SELECT id FROM prod);
WITH doomed AS (
  SELECT id FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id FROM producto_proveedores pp WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM solicitudes_restock WHERE producto_id IN (SELECT id FROM prod);
WITH doomed AS (
  SELECT id FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id FROM producto_proveedores pp WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM producto_imagenes WHERE producto_id IN (SELECT id FROM prod);
WITH doomed AS (
  SELECT id FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id FROM producto_proveedores pp WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM movimientos_inventario
WHERE producto_id IN (SELECT id FROM prod)
   OR proveedor_id IN (SELECT id FROM doomed);
WITH doomed AS (
  SELECT id FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id FROM producto_proveedores pp WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM producto_proveedores
WHERE producto_id IN (SELECT id FROM prod)
   OR proveedor_id IN (SELECT id FROM doomed);
WITH doomed AS (
  SELECT id FROM proveedores
  WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
     OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)'
),
prod AS (
  SELECT p.id FROM productos p
  WHERE p.proveedor_id IN (SELECT id FROM doomed)
     OR lower(coalesce(p.codigo, '')) IN ('flt-1', '52156', '77553')
  UNION
  SELECT pp.producto_id FROM producto_proveedores pp WHERE pp.proveedor_id IN (SELECT id FROM doomed)
)
DELETE FROM productos WHERE id IN (SELECT id FROM prod);
DELETE FROM proveedores
WHERE lower(coalesce(codigo_proveedor, '')) IN ('p-norte', 'p-sur', '552255', '455221663')
   OR lower(coalesce(razon_social, '')) ~ '(filtro[s]? norte|filtro[s]? sur|venamerican|yldemaro|uribe|v-552255)';

ALTER TABLE productos ENABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE proveedores ENABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE movimientos_inventario ENABLE TRIGGER trg_movimientos_inventario_inmutable;

SELECT count(*) AS proveedores_restantes FROM proveedores;
