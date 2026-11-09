import { startArchiveVault } from "./archiveVault.js?v=69";
import { ensureFreshApp, startRuntime } from "./pwa.js?v=69";
import { bootSync, startSyncEngine } from "./syncEngine.js?v=69";
import { startRouter } from "./router.js?v=69";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=69";

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
