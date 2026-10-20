// Operaciones de dominio sobre cualquier almacén (db/assets o IndexedDB).
import { applyEvent, recompute } from "./schedule.js";

export const MAX_PHOTOS = 12;
const SCHEDULE_FIELDS = ["speciesId", "location", "intervalDays"];

export async function createPlant(store, fields, now = Date.now()) {
  const plant = { name: "", speciesId: "otra", location: "interior", intervalDays: null, notes: "", photos: [], customCare: null, ...fields };
  Object.assign(plant, recompute(plant, now));
  return store.savePlant(plant);
}

export async function updatePlant(store, plant, changes, now = Date.now()) {
  const next = { ...plant, ...changes };
  if (SCHEDULE_FIELDS.some(k => k in changes && changes[k] !== plant[k])) Object.assign(next, recompute(next, now));
  return store.savePlant(next);
}

// type: riego | humeda | abono | nota
export async function logEvent(store, plant, { type, at = Date.now(), note = "" }) {
  const event = await store.addEvent({ plantId: plant.id, type, at, note });
  const saved = await store.savePlant({ ...plant, ...applyEvent(plant, event) });
  return { plant: saved, event };
}

// Deshacer un apunte: se reconstruye el estado de riego con lo que queda del historial.
export async function removeEvent(store, plant, eventId, now = Date.now()) {
  await store.deleteEvent(eventId);
  const events = await store.listEvents(plant.id);
  const lastWateredAt = events.find(e => e.type === "riego")?.at ?? null;
  const lastCheckedAt = events.find(e => e.type === "riego" || e.type === "humeda")?.at ?? null;
  const next = { ...plant, lastWateredAt, lastCheckedAt };
  return store.savePlant({ ...next, ...recompute(next, now) });
}

export async function addPhoto(store, plant, blob, now = Date.now()) {
  const photo = { ...(await store.putPhoto(blob)), at: now };
  const photos = [photo, ...(plant.photos ?? [])];
  for (const old of photos.splice(MAX_PHOTOS)) await store.deletePhoto(old);
  return store.savePlant({ ...plant, photos });
}

export async function removePhoto(store, plant, ref) {
  const photo = (plant.photos ?? []).find(p => p.ref === ref);
  if (photo) await store.deletePhoto(photo);
  return store.savePlant({ ...plant, photos: (plant.photos ?? []).filter(p => p.ref !== ref) });
}

export async function deletePlant(store, plant) {
  for (const p of plant.photos ?? []) await store.deletePhoto(p);
  await store.deletePlant(plant.id);
}
