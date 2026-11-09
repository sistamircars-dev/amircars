import { healthCheck, runtimeInfo } from "./api.js?v=68";

/** Build que está ejecutando este archivo. Tiene que coincidir con APP_REVISION. */
export const APP_BUILD = "68";

const REVISION_KEY = "amircars-revision";
const REVISION_POLL_MS = 20000;
let deferredInstall = null;
let reloading = false;
let revisionTimer = null;

function currentRevision() {
  return window.localStorage.getItem(REVISION_KEY) || "";
}

function rememberRevision(revision) {
  if (revision) {
    window.localStorage.setItem(REVISION_KEY, revision);
  }
}

async function persistStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      await navigator.storage.persist();
    } catch (_err) {
      /* El navegador decide si concede persistencia. */
    }
  }
}

function reloadOnce() {
  if (reloading) {
    return;
  }
  reloading = true;
  window.location.reload();
}

async function clearAppCaches() {
  if (!("caches" in window)) {
    return;
  }
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch (_err) {
    /* Sin caches o sin permiso. */
  }
}

async function waitForWorker(worker) {
  if (!worker) {
    return;
  }
  return new Promise((resolve) => {
    if (worker.state === "installed" || worker.state === "activated") {
      resolve();
      return;
    }
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" || worker.state === "activated") {
        resolve();
      }
    });
  });
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) {
        return;
      }
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          worker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", reloadOnce);
    return registration;
  } catch (_err) {
    return null;
  }
}

async function activateWaitingWorker(registration) {
  if (!registration) {
    return false;
  }
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    await waitForWorker(registration.waiting);
    return true;
  }
  if (registration.installing) {
    await waitForWorker(registration.installing);
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      return true;
    }
  }
  return false;
}

function buildMatches(remote) {
  return Boolean(remote) && String(remote) === APP_BUILD;
}

/**
 * El equipo está en línea con la nube pero corre otro build.
 * No se fía de localStorage: eso marcaba “actualizado” antes de cargar el JS nuevo.
 */
async function forceAppUpdate(remote) {
  if (reloading) {
    return { changed: true, revision: remote, build: APP_BUILD };
  }
  const flag = `amircars-forced-${remote}`;
  const attempts = Number(window.sessionStorage.getItem(flag) || "0");
  if (attempts >= 2) {
    return { changed: false, revision: remote, build: APP_BUILD, stuck: true };
  }
  window.sessionStorage.setItem(flag, String(attempts + 1));
  await clearAppCaches();
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      try {
        await registration.update();
      } catch (_err) {
        /* Se recarga de todos modos. */
      }
      await activateWaitingWorker(registration);
    }
  }
  if (attempts >= 1) {
    const url = new URL(window.location.href);
    url.searchParams.set("app", remote);
    reloading = true;
    window.location.replace(url.toString());
  } else {
    reloadOnce();
  }
  return { changed: true, revision: remote, build: APP_BUILD };
}

/** La sync (Supabase / Cloudinary) trae la revisión: si no es este build, recarga ya. */
export async function applyKnownRevision(revision) {
  if (!navigator.onLine) {
    return { changed: false, offline: true };
  }
  if (!revision) {
    return { changed: false };
  }
  const remote = String(revision);
  if (buildMatches(remote)) {
    rememberRevision(remote);
    return { changed: false, revision: remote, build: APP_BUILD };
  }
  return forceAppUpdate(remote);
}

/** Compara el build en ejecución con /api/health y fuerza recarga (sin Ctrl+F5). */
export async function applyRemoteRevision() {
  if (!navigator.onLine) {
    return { changed: false, offline: true };
  }
  const info = await runtimeInfo();
  if (!info || !info.revision) {
    return { changed: false };
  }
  return applyKnownRevision(info.revision);
}

export async function refreshServiceWorker() {
  if (!("serviceWorker" in navigator) || !navigator.onLine) {
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    return registerServiceWorker();
  }
  try {
    await registration.update();
  } catch (_err) {
    return registration;
  }
  const activated = await activateWaitingWorker(registration);
  if (activated) {
    return registration;
  }
  return registration;
}

/** Arranque: actualiza SW + revisión antes de iniciar la app. */
export async function ensureFreshApp() {
  await persistStorage();
  const registration = await registerServiceWorker();
  if (registration && navigator.onLine) {
    try {
      await registration.update();
      await activateWaitingWorker(registration);
    } catch (_err) {
      /* Continúa con la copia actual. */
    }
  }
  const result = await applyRemoteRevision();
  if (result.changed) {
    return { reloaded: true, revision: result.revision };
  }
  return { reloaded: false, revision: result.revision || currentRevision() };
}

function startRevisionPolling() {
  if (revisionTimer) {
    clearInterval(revisionTimer);
  }
  revisionTimer = window.setInterval(() => {
    if (!navigator.onLine || document.visibilityState === "hidden") {
      return;
    }
    refreshServiceWorker();
    applyRemoteRevision();
  }, REVISION_POLL_MS);
}

export function downloadClientScript() {
  const link = document.createElement("a");
  link.href = `${window.location.origin}/install/amircars-pc.cmd`;
  link.download = "amircars-acceso.cmd";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function consumeInstallPrompt() {
  const event = deferredInstall;
  deferredInstall = null;
  return event;
}

export async function runInstallSetup() {
  await persistStorage();
  await registerServiceWorker();
  if (deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => {});
    deferredInstall = null;
  }
  return true;
}

export function startRuntime() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstall = event;
  });
  window.addEventListener("appinstalled", () => {
    persistStorage();
    downloadClientScript();
  });
  window.addEventListener("online", () => {
    const loaded = Number(window.sessionStorage.getItem("amircars-loaded") || "0");
    if (loaded && Date.now() - loaded > 6 * 60 * 60 * 1000) {
      window.sessionStorage.setItem("amircars-loaded", String(Date.now()));
      reloadOnce();
      return;
    }
    refreshServiceWorker();
    applyRemoteRevision();
    healthCheck();
  });
  if (!window.sessionStorage.getItem("amircars-loaded")) {
    window.sessionStorage.setItem("amircars-loaded", String(Date.now()));
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      refreshServiceWorker();
      applyRemoteRevision();
    }
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data || {};
      if (data.type === "AMIRCARS_APP") {
        applyKnownRevision(data.revision);
      }
    });
  }
  startRevisionPolling();
  if (navigator.onLine) {
    applyRemoteRevision();
  }
}
