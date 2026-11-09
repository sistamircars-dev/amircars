import { startArchiveVault } from "./archiveVault.js?v=71";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=71";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=71";
import { startRouter } from "./router.js?v=71";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=71";

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
