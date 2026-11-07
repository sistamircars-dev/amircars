import { startArchiveVault } from "./archiveVault.js?v=54";
import { startRuntime } from "./pwa.js?v=52";
import { startSyncEngine } from "./syncEngine.js?v=65";
import { startRouter } from "./router.js?v=58";
import { refreshRateChip, syncTodayRate } from "./bcvView.js?v=53";

startRuntime();
startSyncEngine();
startRouter();
startArchiveVault();
refreshRateChip();
syncTodayRate();
