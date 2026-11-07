import { h } from "./dom.js";
import { archPhoto, statusPill, speciesLabel, busy } from "./common.js";
import { sortByUrgency, needsCheck } from "../schedule.js";
import { logEvent } from "../garden.js";
import { updateBadge } from "../notify.js";
import { buildIcs, plantsReminders, generalReminder, googleCalendarUrl } from "../calendar.js";
import { dayText } from "./plant.js";

export async function homeScreen(_, ctx) {
  const now = Date.now();
  const plants = sortByUrgency(await ctx.store.listPlants(), now);
  const due = plants.filter(p => needsCheck(p, now));
  if (ctx.mode === "local") updateBadge(due.length);

  const head = h("header", { class: "mast" },
    h("div", {},
      h("h1", {}, "Mis plantas"),
      h("p", { class: "mast-sub" }, plants.length
        ? (due.length ? `${due.length === 1 ? "Una planta pide" : `${due.length} plantas piden`} que mires la tierra` : "Todas al día. Nada que revisar hoy.")
        : "Empieza añadiendo tu primera planta")),
    h("a", { class: "icon-btn", href: "#/ajustes", "aria-label": "Ajustes y avisos" }, "⚙︎"));

  if (!plants.length) {
    return [head, h("section", { class: "empty-state" },
      h("p", {}, "Añade la hiedra, las gitanillas o cualquier otra. Con una foto, la app puede ayudarte a saber qué especie es."),
      h("a", { class: "btn primary big", href: "#/nueva" }, "Añadir una planta")), modeNote(ctx)];
  }

  const quick = due.length ? h("section", { class: "due" },
    h("h2", {}, "Toca revisar"),
    h("p", { class: "hint" }, "Mete un dedo en la tierra antes de regar. Si sigue húmeda, no riegues: apúntalo y la app te avisará en unos días."),
    due.map(p => dueRow(ctx, p))) : null;

  return [head, quick,
    h("section", { class: "all" },
      h("h2", {}, due.length ? "Todas" : "Tus plantas"),
      h("ul", { class: "plant-list" }, plants.map(p => h("li", {},
        h("a", { class: "plant-row", href: `#/planta/${p.id}` },
          archPhoto(ctx, p.photos?.[0], { size: "sm" }),
          h("div", { class: "plant-row-text" },
            h("strong", {}, p.name),
            h("span", { class: "species" }, speciesLabel(p)),
            statusPill(p, now))))))),
    remindersCard(ctx, plants),
    h("a", { class: "fab", href: "#/nueva" }, "+ Añadir planta"),
    modeNote(ctx)];
}

function dueRow(ctx, plant) {
  const log = type => async e => busy(e.currentTarget, async () => {
    const { plant: saved } = await logEvent(ctx.store, plant, { type });
    ctx.toast(`${plant.name}: ${type === "riego" ? "riego apuntado" : "sin regar"}. Próxima revisión: ${dayText(saved.nextCheckAt)}`);
    ctx.refresh({ keepScroll: true });
  });
  return h("div", { class: "due-row" },
    h("a", { class: "due-name", href: `#/planta/${plant.id}` }, archPhoto(ctx, plant.photos?.[0], { size: "xs" }), h("span", {}, plant.name)),
    h("div", { class: "due-actions" },
      h("button", { class: "btn water", type: "button", onclick: log("riego") }, "Regada"),
      h("button", { class: "btn ghost", type: "button", onclick: log("humeda") }, "Aún húmeda")));
}

function modeNote(ctx) {
  return h("p", { class: "mode-note" }, ctx.mode === "artifact"
    ? "Guardado en tu cuenta de claude.ai."
    : "Guardado en este dispositivo. Haz copias de seguridad en Ajustes.");
}

const pad = n => String(n).padStart(2, "0");

// Avisos que suenan con la app cerrada: el calendario del móvil.
function remindersCard(ctx, plants) {
  const s = ctx.settings;
  const hour = `${pad(s.hour)}:${pad(s.minute)}`;
  if (ctx.mode !== "local") {
    return h("section", { class: "panel reminders" },
      h("h2", {}, "🔔 Avisos de riego"),
      h("p", {}, `Pon un recordatorio que se repite cada ${s.everyDays === 1 ? "día" : `${s.everyDays} días`} a las ${hour} en Google Calendar. Te avisa aunque la app esté cerrada, y aquí verás qué planta toca.`),
      h("a", { class: "btn primary", href: googleCalendarUrl(generalReminder(s)), target: "_blank", rel: "noopener" }, "Añadir a Google Calendar"),
      h("p", { class: "hint" }, h("a", { href: "#/ajustes" }, "Cambiar la hora o la frecuencia")));
  }
  // Plantas cuya próxima revisión ha cambiado desde la última vez que se añadieron avisos.
  const pending = s.remindersAddedAt ? plants.filter(p => p.nextCheckAt && (p.updatedAt ?? 0) > s.remindersAddedAt).length : plants.length;
  return h("section", { class: "panel reminders" },
    h("h2", {}, "🔔 Avisos de riego"),
    h("p", {}, `El Calendario del iPhone te avisará a las ${hour} el día que toque mirar la tierra de cada planta, aunque la app esté cerrada.`),
    s.remindersAddedAt && pending
      ? h("p", { class: "notice warn" }, `${pending === 1 ? "Una planta tiene" : `${pending} plantas tienen`} una revisión nueva sin aviso. Vuelve a pulsar el botón.`)
      : s.remindersAddedAt ? h("p", { class: "notice ok" }, "Tus avisos están al día.") : null,
    h("button", { class: "btn primary", type: "button", onclick: async () => {
      ctx.saveIcs("avisos-plantas.ics", buildIcs(plantsReminders(plants, s)));
      await ctx.saveSettings({ remindersAddedAt: Date.now() });
      ctx.toast("En el Calendario, toca «Añadir todo»");
      ctx.refresh({ keepScroll: true });
    } }, s.remindersAddedAt ? "Actualizar avisos en el Calendario" : "Avisarme en el Calendario"),
    h("p", { class: "hint" }, "Después de regar, vuelve a pulsarlo para programar el siguiente aviso. ", h("a", { href: "#/ajustes" }, "Cambiar la hora")));
}
