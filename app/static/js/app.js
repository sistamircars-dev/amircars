import { startArchiveVault } from "./archiveVault.js?v=70";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=70";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=70";
import { startRouter } from "./router.js?v=70";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=70";

async function boot() {
  startRuntime();
  startSyncEngine();
  ensureFreshApp().catch(() => {});
  await startRouter();
  startArchiveVault();
  refreshRateChip();
  syncTodayRate();
  bootSync().catch(() => {});
}

boot();
