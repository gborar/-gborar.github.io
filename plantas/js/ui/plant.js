import { h } from "./dom.js";
import { bar, archPhoto, statusPill, speciesOf, speciesLabel, busy, photoButtons, careSheet, confirmButton } from "./common.js";
import { identifyPanel } from "./identify.js";
import { effectiveInterval, relativeDay } from "../schedule.js";
import { suggestedInterval, seasonOf, SEASON_LABEL } from "../species.js";
import { logEvent, removeEvent, updatePlant, addPhoto, removePhoto } from "../garden.js";
import { plantReminder, buildIcs, googleCalendarUrl } from "../calendar.js";
import { shrinkPhoto } from "../image.js";
import { navigate } from "../router.js";

const EVENT_TEXT = { riego: "Regada", humeda: "Tierra húmeda, sin regar", abono: "Abonada", nota: "Nota" };
const dateText = t => new Date(t).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

export async function plantScreen({ id }, ctx) {
  let plant = await ctx.store.getPlant(id);
  if (!plant) { navigate("/"); return null; }
  const now = Date.now();
  const species = speciesOf(plant);
  const events = await ctx.store.listEvents(id);
  const reload = () => ctx.refresh({ keepScroll: true });

  const log = (type, msg) => async e => busy(e.currentTarget, async () => {
    const note = type === "nota" || type === "abono" ? noteInput.value.trim() : "";
    if (type === "nota" && !note) { noteInput.focus(); return ctx.toast("Escribe la nota primero."); }
    await logEvent(ctx.store, plant, { type, note });
    ctx.toast(msg);
    reload();
  });
  const noteInput = h("input", { type: "text", placeholder: "Nota opcional (p. ej. hojas amarillas)", "aria-label": "Nota", maxlength: 200 });

  // Intervalo ajustable con − y +. Vacío = el sugerido por especie y estación.
  const suggested = suggestedInterval(species, now, plant.location);
  const interval = effectiveInterval(plant, now);
  const setInterval_ = days => async e => busy(e.currentTarget, async () => {
    plant = await updatePlant(ctx.store, plant, { intervalDays: days });
    reload();
  });

  const reminders = ctx.settings;
  const calendarLinks = plant.nextCheckAt ? h("div", { class: "cal-links" },
    ctx.mode === "local" ? h("button", { class: "btn ghost small", type: "button", onclick: () => ctx.saveIcs(`revisar-${slug(plant.name)}.ics`, buildIcs([plantReminder(plant, reminders)])) }, "Aviso en el Calendario") : null,
    h("a", { class: "btn ghost small", href: googleCalendarUrl(plantReminder(plant, reminders)), target: "_blank", rel: "noopener" }, "Aviso en Google Calendar")) : null;

  const photos = plant.photos ?? [];
  const idSlot = h("div");
  const canIdentify = ctx.identifier && photos.length;

  return [
    bar(plant.name, "#/", h("a", { class: "icon-btn", href: `#/planta/${id}/editar`, "aria-label": "Editar planta" }, "✎")),
    h("section", { class: "hero" },
      archPhoto(ctx, photos[0], { size: "lg", alt: `Foto de ${plant.name}` }),
      h("div", { class: "hero-text" },
        h("p", { class: "species" }, speciesLabel(plant), species.scientific && species.id !== "otra" ? h("i", {}, ` · ${species.scientific}`) : null),
        h("p", {}, plant.location === "exterior" ? "En exterior" : "En interior"),
        statusPill(plant, now))),

    h("section", { class: "panel check-panel" },
      h("h2", {}, "¿Has mirado la tierra?"),
      h("p", { class: "hint" }, species.check),
      h("div", { class: "actions" },
        h("button", { class: "btn water big", type: "button", onclick: log("riego", "Riego apuntado") }, "Estaba seca: la he regado"),
        h("button", { class: "btn secondary big", type: "button", onclick: log("humeda", "Apuntado: volverás a mirar en unos días") }, "Sigue húmeda: no riego")),
      h("div", { class: "note-line" }, noteInput,
        h("button", { class: "btn ghost small", type: "button", onclick: log("abono", "Abono apuntado") }, "Abonada"),
        h("button", { class: "btn ghost small", type: "button", onclick: log("nota", "Nota guardada") }, "Guardar nota")),
      plant.lastWateredAt ? h("p", { class: "meta" }, `Último riego: ${relativeDay(plant.lastWateredAt, now)} (${dateText(plant.lastWateredAt)})`) : null),

    h("section", { class: "panel" },
      h("h2", {}, "Cada cuánto revisar"),
      h("div", { class: "stepper", role: "group", "aria-label": "Días entre revisiones" },
        h("button", { class: "btn ghost", type: "button", "aria-label": "Un día menos", disabled: interval <= 1, onclick: setInterval_(interval - 1) }, "−"),
        h("output", { "aria-live": "polite" }, interval === 1 ? "Cada día" : `Cada ${interval} días`),
        h("button", { class: "btn ghost", type: "button", "aria-label": "Un día más", disabled: interval >= 60, onclick: setInterval_(interval + 1) }, "+")),
      h("p", { class: "hint" }, plant.intervalDays
        ? [`Lo has ajustado tú. Sugerido para ${SEASON_LABEL[seasonOf(now)]}: cada ${suggested} días. `, h("button", { class: "link", type: "button", onclick: setInterval_(null) }, "Volver al sugerido")]
        : `Sugerido para ${species.id === "otra" ? "una planta genérica" : species.name.toLowerCase()} en ${SEASON_LABEL[seasonOf(now)]}${plant.location === "exterior" ? " y en exterior" : ""}. Cambia solo con la estación.`),
      calendarLinks),

    careSheet(plant),

    h("section", { class: "panel" },
      h("h2", {}, "Fotos"),
      photos.length ? h("div", { class: "gallery" }, photos.map(ph => h("figure", {},
        archPhoto(ctx, ph, { size: "sm", alt: `Foto del ${dateText(ph.at)}` }),
        h("figcaption", {}, dateText(ph.at)),
        confirmButton("Quitar", "¿Seguro?", async () => { plant = await removePhoto(ctx.store, plant, ph.ref); reload(); }, "link danger-link")))) : null,
      ctx.store.photosAvailable
        ? photoButtons(async file => {
            try {
              plant = await addPhoto(ctx.store, plant, await shrinkPhoto(file));
              ctx.toast("Foto guardada");
              reload();
            } catch { ctx.toast("No se ha podido guardar la foto. Prueba con otra."); }
          }, { cameraText: "Añadir foto", galleryText: "Desde la galería" })
        : h("p", { class: "hint" }, "En esta vista no se pueden guardar fotos."),
      canIdentify ? h("button", { class: "btn ghost", type: "button", onclick: async e => {
        const blob = await ctx.store.photoBlob(photos[0]).catch(() => null);
        if (!blob) return ctx.toast("No se ha podido leer la foto.");
        idSlot.replaceChildren(identifyPanel(ctx, blob, async pick => {
          plant = await updatePlant(ctx.store, plant, pick);
          ctx.toast("Especie actualizada");
          reload();
        }));
        e.currentTarget.remove();
      } }, "Identificar con la última foto") : null,
      idSlot),

    h("section", { class: "panel" },
      h("h2", {}, "Historial"),
      events.length ? h("ul", { class: "history" }, events.slice(0, 60).map(ev => h("li", { class: `ev-${ev.type}` },
        h("span", { class: "ev-date" }, dateText(ev.at)),
        h("span", { class: "ev-text" }, EVENT_TEXT[ev.type] ?? ev.type, ev.note ? h("em", {}, ` — ${ev.note}`) : null),
        confirmButton("Deshacer", "¿Borrar?", async () => { plant = await removeEvent(ctx.store, plant, ev.id); reload(); }, "link")))) : h("p", { class: "hint" }, "Aún no hay nada apuntado."),
      plant.notes ? h("p", { class: "notes" }, plant.notes) : null),
  ];
}

export const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "planta";
