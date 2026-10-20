// Copia de seguridad en un JSON con todo (fotos incluidas como data URL). Sirve también para pasar
// las plantas de la versión de claude.ai a la PWA instalada, o al revés.
import { blobToBase64 } from "./identify.js";

export const BACKUP_APP = "mis-plantas";

export async function exportBackup(store, now = Date.now()) {
  const plants = await store.listPlants();
  const events = await store.listEvents();
  const photos = {};
  for (const p of plants) {
    for (const ph of p.photos ?? []) {
      const blob = await store.photoBlob(ph).catch(() => null);
      if (blob) photos[ph.ref] = `data:${blob.type || "image/jpeg"};base64,${await blobToBase64(blob)}`;
    }
  }
  return { app: BACKUP_APP, version: 1, exportedAt: now, settings: await store.getSettings(), plants, events, photos };
}

// Sin fetch(): la CSP de la PWA no permite pedir data: URLs.
export function dataUrlToBlob(dataUrl) {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(String(dataUrl));
  if (!m || !/^image\//.test(m[1])) return null;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: m[1] });
}

const key = p => `${p.name}|${p.createdAt}`;

// Añade lo que no exista ya (misma planta = mismo nombre y misma fecha de alta). Devuelve cuántas plantas importó.
export async function importBackup(store, backup) {
  if (backup?.app !== BACKUP_APP || !Array.isArray(backup.plants)) {
    throw Object.assign(new Error("not a backup"), { code: "invalid_backup" });
  }
  const existing = new Set((await store.listPlants()).map(key));
  let imported = 0;
  for (const p of backup.plants) {
    if (existing.has(key(p))) continue;
    const photos = [];
    for (const ph of p.photos ?? []) {
      const dataUrl = backup.photos?.[ph.ref];
      if (!dataUrl || !store.photosAvailable) continue;
      const blob = dataUrlToBlob(dataUrl);
      if (!blob) continue;
      photos.push({ ...(await store.putPhoto(blob)), at: ph.at });
    }
    const { id: oldId, ...rest } = p;
    const saved = await store.savePlant({ ...rest, photos });
    for (const e of backup.events ?? []) {
      if (e.plantId !== oldId) continue;
      const { id: _, ...ev } = e;
      await store.addEvent({ ...ev, plantId: saved.id });
    }
    imported++;
  }
  if (backup.settings && !Object.keys(await store.getSettings()).length) await store.saveSettings(backup.settings);
  return imported;
}
