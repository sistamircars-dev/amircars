import { startArchiveVault } from "./archiveVault.js?v=73";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=73";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=73";
import { startRouter } from "./router.js?v=73";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=73";

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
