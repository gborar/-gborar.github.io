// Cuándo toca revisar cada planta. Todo en milisegundos; los días se cuentan en hora local.
import { getSpecies, suggestedInterval } from "./species.js";

export const DAY = 86_400_000;

const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
// Días naturales entre dos instantes (positivo si `to` es posterior). Redondea por los cambios de hora.
export const dayDiff = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / DAY);

// El intervalo propio de la planta manda; si no tiene, el sugerido por especie, estación y ubicación.
export function effectiveInterval(plant, now = Date.now()) {
  const own = Number(plant.intervalDays);
  if (Number.isFinite(own) && own >= 1) return Math.round(own);
  return suggestedInterval(getSpecies(plant.speciesId), now, plant.location);
}

// Si al revisar la tierra sigue húmeda: volver a mirar en un tercio del intervalo, entre 1 y 4 días.
export const moistDelay = interval => Math.min(4, Math.max(1, Math.round(interval / 3)));

// Aplica un evento del historial y devuelve los campos de la planta que cambian.
export function applyEvent(plant, event, now = Date.now()) {
  const interval = effectiveInterval(plant, event.at ?? now);
  if (event.type === "riego") {
    return { lastWateredAt: event.at, lastCheckedAt: event.at, nextCheckAt: event.at + interval * DAY };
  }
  if (event.type === "humeda") {
    return { lastCheckedAt: event.at, nextCheckAt: event.at + moistDelay(interval) * DAY };
  }
  return {};
}

// Tras cambiar especie, ubicación o intervalo: se cuenta desde el último riego, o desde ahora si no hay.
// Una revisión "húmeda" posterior al último riego se respeta si cae antes.
export function recompute(plant, now = Date.now()) {
  const interval = effectiveInterval(plant, now);
  if (!plant.lastWateredAt) {
    return { nextCheckAt: plant.lastCheckedAt ? plant.lastCheckedAt + moistDelay(interval) * DAY : now };
  }
  let next = plant.lastWateredAt + interval * DAY;
  if (plant.lastCheckedAt && plant.lastCheckedAt > plant.lastWateredAt) {
    next = Math.min(next, plant.lastCheckedAt + moistDelay(interval) * DAY);
  }
  return { nextCheckAt: next };
}

// atrasada | hoy | pronto (1-2 días) | al-dia | sin-fecha
export function statusOf(plant, now = Date.now()) {
  if (!plant.nextCheckAt) return "sin-fecha";
  const d = dayDiff(now, plant.nextCheckAt);
  if (d < 0) return "atrasada";
  if (d === 0) return "hoy";
  if (d <= 2) return "pronto";
  return "al-dia";
}

export const needsCheck = (plant, now = Date.now()) => ["atrasada", "hoy", "sin-fecha"].includes(statusOf(plant, now));

export function sortByUrgency(plants, now = Date.now()) {
  const key = p => p.nextCheckAt ?? -Infinity;
  return [...plants].sort((a, b) => key(a) - key(b) || String(a.name).localeCompare(String(b.name), "es"));
}

export function relativeDay(t, now = Date.now()) {
  const d = dayDiff(now, t);
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  if (d === -1) return "ayer";
  if (d > 1) return `en ${d} días`;
  return `hace ${-d} días`;
}

export function statusText(plant, now = Date.now()) {
  const s = statusOf(plant, now);
  if (s === "sin-fecha") return "Revisa la tierra cuando puedas";
  if (s === "atrasada") return `Revisión atrasada (${relativeDay(plant.nextCheckAt, now)})`;
  if (s === "hoy") return "Toca revisar la tierra hoy";
  return `Próxima revisión ${relativeDay(plant.nextCheckAt, now)}`;
}
