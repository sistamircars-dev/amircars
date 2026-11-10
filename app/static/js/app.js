import { startArchiveVault } from "./archiveVault.js?v=72";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=72";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=72";
import { startRouter } from "./router.js?v=72";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=72";

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
