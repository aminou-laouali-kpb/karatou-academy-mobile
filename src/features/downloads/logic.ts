/**
 * Règles pures des téléchargements (E17) et du réglage « Vidéos en Wi-Fi
 * uniquement » : testées sans React ni réseau.
 */

/** Taille en octets d'une valeur sérialisée en JSON (UTF-8, comme dans MMKV). */
export function jsonBytes(value: unknown): number {
  const json = JSON.stringify(value) ?? '';
  let bytes = 0;
  for (let i = 0; i < json.length; i += 1) {
    const code = json.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4; // paire de substitution : un seul caractère sur 4 octets
      i += 1;
    } else bytes += 3;
  }
  return bytes;
}

/** Taille lisible : « 850 ko », « 1,2 Mo » (séparateur décimal selon la langue). */
export function formatSize(bytes: number, locale: string, units: { kb: string; mb: string }): string {
  if (bytes < 1000 * 1000) {
    return `${Math.max(1, Math.round(bytes / 1000)).toLocaleString(locale)} ${units.kb}`;
  }
  const mb = bytes / (1000 * 1000);
  return `${mb.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} ${units.mb}`;
}

export type VideoAccess = 'ok' | 'offline' | 'wifiOnly';

/**
 * Peut-on lancer une vidéo ? Hors ligne : non. Réglage « Wi-Fi uniquement » :
 * seulement en Wi-Fi ou en Ethernet ; un type inconnu est traité comme des
 * données mobiles (on ne fait pas payer l'apprenant par erreur).
 */
export function videoAccess({
  offline,
  wifiOnly,
  connectionType,
}: {
  offline: boolean;
  wifiOnly: boolean;
  connectionType: string | null | undefined;
}): VideoAccess {
  if (offline) return 'offline';
  if (wifiOnly && connectionType !== 'wifi' && connectionType !== 'ethernet') return 'wifiOnly';
  return 'ok';
}

/** Langues téléchargées : les trois, pour changer de langue en mode avion. */
export const DOWNLOAD_LANGS = ['fr', 'en', 'ha'] as const;
