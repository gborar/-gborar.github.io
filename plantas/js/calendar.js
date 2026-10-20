// Avisos que suenan con la app cerrada a través del calendario del móvil:
// un .ics (Calendario de iPhone) o un enlace de Google Calendar con los mismos datos.

const pad = n => String(n).padStart(2, "0");
// Hora local "flotante" (sin zona): el calendario la interpreta en la zona del teléfono.
export const icsLocal = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const icsUtc = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const icsEscape = s => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// RFC 5545: líneas de 75 octetos como máximo; las siguientes empiezan por un espacio. Sin partir caracteres UTF-8.
export function foldLine(line) {
  const enc = new TextEncoder();
  const out = [];
  let cur = "", bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = out.length ? 74 : 75;
    if (bytes + n > limit) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += n;
  }
  out.push(cur);
  return out.join("\r\n ");
}

// Próxima vez que el reloj marque hh:mm (hoy si aún no ha pasado; si no, mañana).
export function nextAt(hour, minute, now = new Date()) {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

// events: [{ uid, title, description, start: Date, minutes?, everyDays? }]
export function buildIcs(events, now = new Date()) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mis plantas//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    const end = new Date(e.start.getTime() + (e.minutes ?? 15) * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${icsUtc(now)}`,
      `DTSTART:${icsLocal(e.start)}`,
      `DTEND:${icsLocal(end)}`,
      `SUMMARY:${icsEscape(e.title)}`,
      `DESCRIPTION:${icsEscape(e.description)}`,
    );
    if (e.everyDays) lines.push(`RRULE:FREQ=DAILY;INTERVAL=${Math.max(1, Math.round(e.everyDays))}`);
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(e.title)}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function googleCalendarUrl({ title, description, start, minutes = 15, everyDays }) {
  const end = new Date(start.getTime() + minutes * 60_000);
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, details: description, dates: `${icsLocal(start)}/${icsLocal(end)}` });
  if (everyDays) p.set("recur", `RRULE:FREQ=DAILY;INTERVAL=${Math.max(1, Math.round(everyDays))}`);
  return `https://calendar.google.com/calendar/render?${p}`;
}

const CHECK_HINT = "Antes de regar, comprueba la humedad: mete un dedo 2-3 cm en la tierra. Si está húmeda, no riegues y apúntalo en la app.";

// El aviso general recurrente: no se desajusta si riegas antes o después, porque solo te pide abrir la app.
export function generalReminder({ everyDays, hour, minute }, now = new Date()) {
  return {
    uid: "revision-general@mis-plantas",
    title: "🌿 Revisa tus plantas",
    description: `Abre Mis plantas para ver cuáles toca revisar hoy. ${CHECK_HINT}`,
    start: nextAt(hour, minute, now),
    everyDays,
  };
}

// Aviso suelto para la próxima revisión de una planta, a la hora del aviso general.
export function plantReminder(plant, { hour, minute }) {
  const start = new Date(plant.nextCheckAt);
  start.setHours(hour, minute, 0, 0);
  return {
    uid: `revision-${plant.id}-${plant.nextCheckAt}@mis-plantas`,
    title: `🌿 Revisar ${plant.name}`,
    description: CHECK_HINT,
    start,
  };
}
