-- Borra SOLO proveedores inactivos de prueba y su rastro.
-- Objetivos: P-NORTE, P-SUR, 552255, 455221663 + productos FLT-1, 52156, 77553.
-- No toca los 9 proveedores activos ni el catálogo real.
-- Desactiva temporalmente triggers de soft-delete e inmutabilidad de movimientos.

ALTER TABLE movimientos_inventario DISABLE TRIGGER trg_movimientos_inventario_inmutable;
ALTER TABLE productos DISABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE proveedores DISABLE TRIGGER trg_soft_delete_instead;

DELETE FROM historico_ref WHERE producto_id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
);
DELETE FROM solicitudes_restock WHERE producto_id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
);
DELETE FROM producto_imagenes WHERE producto_id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
);
DELETE FROM movimientos_inventario WHERE producto_id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
) OR proveedor_id IN (
  '7b4fd608-db93-4090-9602-db8bb34e7082'::uuid,
  'ea1bea0d-0fe8-4e81-a5b6-d18940a47ffa'::uuid,
  '168c1504-64a8-4b8c-aba5-7a2861fdcf62'::uuid,
  'c915589a-c2e1-46fd-bf8d-3fd29069887a'::uuid
);
DELETE FROM producto_proveedores WHERE producto_id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
) OR proveedor_id IN (
  '7b4fd608-db93-4090-9602-db8bb34e7082'::uuid,
  'ea1bea0d-0fe8-4e81-a5b6-d18940a47ffa'::uuid,
  '168c1504-64a8-4b8c-aba5-7a2861fdcf62'::uuid,
  'c915589a-c2e1-46fd-bf8d-3fd29069887a'::uuid
);
DELETE FROM productos WHERE id IN (
  'f70fedee-47c0-4ae5-af98-43819b9d1c0f'::uuid,
  'b53c8ae7-abf8-4c80-af47-fcfac0f0e44c'::uuid,
  '96c1c2dd-4975-429e-8c98-7764ae9b2dda'::uuid
) AND is_active IS DISTINCT FROM true;
DELETE FROM proveedores WHERE id IN (
  '7b4fd608-db93-4090-9602-db8bb34e7082'::uuid,
  'ea1bea0d-0fe8-4e81-a5b6-d18940a47ffa'::uuid,
  '168c1504-64a8-4b8c-aba5-7a2861fdcf62'::uuid,
  'c915589a-c2e1-46fd-bf8d-3fd29069887a'::uuid
) AND is_active IS DISTINCT FROM true;

ALTER TABLE productos ENABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE proveedores ENABLE TRIGGER trg_soft_delete_instead;
ALTER TABLE movimientos_inventario ENABLE TRIGGER trg_movimientos_inventario_inmutable;

SELECT 'ok' AS status,
  (SELECT count(*) FROM proveedores WHERE codigo_proveedor IN ('P-NORTE','P-SUR','552255','455221663')) AS prov_prueba,
  (SELECT count(*) FROM productos WHERE codigo IN ('FLT-1','52156','77553')) AS prod_prueba,
  (SELECT count(*) FROM proveedores WHERE is_active IS NOT DISTINCT FROM true) AS prov_activos;
