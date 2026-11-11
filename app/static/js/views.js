import { renderBitacora } from "./bitacora.js?v=73";
import { renderConfig } from "./bcvView.js?v=73";
import { renderEntradas } from "./entradas.js?v=73";
import { renderFallas } from "./fallas.js?v=73";
import { renderInventory } from "./inventory.js?v=73";
import { renderPedidos } from "./pedidos.js?v=73";
import { renderProveedores } from "./proveedores.js?v=73";
import { renderSalidas } from "./salidas.js?v=73";
import { renderTaxonomy } from "./taxonomy.js?v=73";

export const VIEWS = {
  inventario: { label: "Inventario", icon: "▣", render: renderInventory },
  entradas: { label: "Entradas", icon: "＋", render: renderEntradas },
  salidas: { label: "Salidas", icon: "－", render: renderSalidas },
  fallas: { label: "Fallas", icon: "✕", render: renderFallas },
  proveedores: { label: "Proveedores", icon: "◎", render: renderProveedores },
  pedidos: { label: "Sugerencia de pedido", icon: "↻", render: renderPedidos },
  categorias: { label: "Categorías", icon: "☰", render: renderTaxonomy },
  bitacora: { label: "Bitácora", icon: "≡", render: renderBitacora },
  configuracion: { label: "Configuración", icon: "⚙", render: renderConfig },
};
