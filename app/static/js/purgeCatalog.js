import { db } from "./db.js";

export const PURGED_TEST_IDS = {
  proveedores: [
    "7b4fd608-db93-4090-9602-db8bb34e7082",
    "ea1bea0d-0fe8-4e81-a5b6-d18940a47ffa",
    "168c1504-64a8-4b8c-aba5-7a2861fdcf62",
    "c915589a-c2e1-46fd-bf8d-3fd29069887a",
  ],
  productos: [
    "f70fedee-47c0-4ae5-af98-43819b9d1c0f",
    "b53c8ae7-abf8-4c80-af47-fcfac0f0e44c",
    "96c1c2dd-4975-429e-8c98-7764ae9b2dda",
  ],
};

export const PURGED_PROVIDER_CODES = new Set(["p-norte", "p-sur", "552255", "455221663"]);
export const PURGED_PRODUCT_CODES = new Set(["flt-1", "52156", "77553"]);
const PURGED_PROVIDER_RE = /filtro[s]?\s*norte|filtro[s]?\s*sur|venamerican|yldemaro|\buribe\b|v-552255/;

export function foldPurgeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isPurgedTestProvider(row) {
  if (!row) {
    return false;
  }
  if (row.id && PURGED_TEST_IDS.proveedores.includes(row.id)) {
    return true;
  }
  const code = foldPurgeText(row.codigo_proveedor);
  if (code && PURGED_PROVIDER_CODES.has(code)) {
    return true;
  }
  const name = foldPurgeText(row.razon_social);
  return Boolean(name && PURGED_PROVIDER_RE.test(name));
}

export function isPurgedTestProduct(row, providerIds = null) {
  if (!row) {
    return false;
  }
  if (row.id && PURGED_TEST_IDS.productos.includes(row.id)) {
    return true;
  }
  const code = foldPurgeText(row.codigo);
  if (code && PURGED_PRODUCT_CODES.has(code)) {
    return true;
  }
  return Boolean(providerIds && row.proveedor_id && providerIds.has(row.proveedor_id));
}

/** Borra de IndexedDB los proveedores/artículos de prueba y limpia su cola. */
export async function discardPurgedTestData() {
  const dropEntity = async (id) => {
    if (!id) {
      return;
    }
    const queued = await db.sync_queue.where("entity_id").equals(id).toArray();
    for (const row of queued) {
      await db.sync_queue.delete(row.id);
    }
  };

  const providers = await db.proveedores.toArray();
  const providerIds = new Set(providers.filter((row) => isPurgedTestProvider(row)).map((row) => row.id));
  PURGED_TEST_IDS.proveedores.forEach((id) => providerIds.add(id));

  const products = await db.productos.toArray();
  const productIds = new Set(products.filter((row) => isPurgedTestProduct(row, providerIds)).map((row) => row.id));
  PURGED_TEST_IDS.productos.forEach((id) => productIds.add(id));

  const links = await db.producto_proveedores.toArray();
  links
    .filter((row) => providerIds.has(row.proveedor_id) || productIds.has(row.producto_id))
    .forEach((row) => {
      if (row.producto_id) {
        productIds.add(row.producto_id);
      }
    });

  for (const id of productIds) {
    await db.historico_ref.where("producto_id").equals(id).delete();
    await db.solicitudes_restock.where("producto_id").equals(id).delete();
    await db.producto_imagenes.where("producto_id").equals(id).delete();
    await db.producto_proveedores.where("producto_id").equals(id).delete();
    await db.movimientos_inventario.where("producto_id").equals(id).delete();
    await db.offline_media_queue.where("producto_id").equals(id).delete();
    await db.productos.delete(id);
    await dropEntity(id);
  }
  for (const id of providerIds) {
    await db.producto_proveedores.where("proveedor_id").equals(id).delete();
    const moves = await db.movimientos_inventario.where("proveedor_id").equals(id).toArray();
    for (const move of moves) {
      await db.movimientos_inventario.delete(move.id);
      await dropEntity(move.id);
    }
    await db.proveedores.delete(id);
    await dropEntity(id);
  }

  const queued = await db.sync_queue.toArray();
  for (const row of queued) {
    if (row.table === "proveedores" && isPurgedTestProvider(row.payload || { id: row.entity_id })) {
      await db.sync_queue.delete(row.id);
      continue;
    }
    if (row.table === "productos" && isPurgedTestProduct(row.payload || { id: row.entity_id }, providerIds)) {
      await db.sync_queue.delete(row.id);
    }
  }

  return { providers: providerIds.size, products: productIds.size };
}
