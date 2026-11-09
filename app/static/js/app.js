import { startArchiveVault } from "./archiveVault.js?v=68";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=68";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=68";
import { startRouter } from "./router.js?v=68";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=68";

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
