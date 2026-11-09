/** Compara marcas de tiempo reales. El texto ISO de la nube y el del navegador no se pueden ordenar como cadenas. */

const SKEW_MS = 2000;

export function timeMs(value) {
  if (value == null || value === "") {
    return 0;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** True si el dato local es más nuevo que la nube, fuera del desfase de reloj. */
export function localIsNewer(localStamp, remoteStamp, skewMs = SKEW_MS) {
  const local = timeMs(localStamp);
  const remote = timeMs(remoteStamp);
  if (!local) {
    return false;
  }
  if (!remote) {
    return true;
  }
  return local > remote + skewMs;
}
