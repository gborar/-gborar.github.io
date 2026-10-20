import { h } from "./dom.js";
import { archPhoto, statusPill, speciesLabel, busy } from "./common.js";
import { sortByUrgency, needsCheck } from "../schedule.js";
import { logEvent } from "../garden.js";
import { updateBadge } from "../notify.js";

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
    h("a", { class: "fab", href: "#/nueva" }, "+ Añadir planta"),
    modeNote(ctx)];
}

function dueRow(ctx, plant) {
  const log = type => async e => busy(e.currentTarget, async () => {
    await logEvent(ctx.store, plant, { type });
    ctx.toast(type === "riego" ? `${plant.name}: riego apuntado` : `${plant.name}: volverás a mirar en unos días`);
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
