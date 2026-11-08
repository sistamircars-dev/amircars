import { startArchiveVault } from "./archiveVault.js?v=54";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=66";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=66";
import { startRouter } from "./router.js?v=59";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=53";

async function boot() {
  const fresh = await ensureFreshApp();
  if (fresh.reloaded) {
    return;
  }
  startRuntime();
  startSyncEngine();
  try {
    await bootSync();
  } catch (_err) {
    /* El heartbeat sigue intentando. */
  }
  await startRouter();
  startArchiveVault();
  refreshRateChip();
  syncTodayRate();
}

boot();
