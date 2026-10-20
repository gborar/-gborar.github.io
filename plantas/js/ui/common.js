import { h } from "./dom.js";
import { statusOf, statusText } from "../schedule.js";
import { getSpecies, OTHER } from "../species.js";

// Ejecuta una acción asíncrona con el botón desactivado mientras dura.
export async function busy(btn, fn) {
  btn.disabled = true;
  try { return await fn(); } finally { btn.disabled = false; }
}

export function bar(title, backHref, ...actions) {
  return h("header", { class: "bar" },
    backHref ? h("a", { class: "back", href: backHref, "aria-label": "Volver" }, "‹") : null,
    h("h1", {}, title),
    actions.length ? h("div", { class: "bar-actions" }, actions) : null);
}

const LEAF = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 58V30" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M32 34c-14 0-20-10-20-22 12 0 20 6 20 22Z" fill="currentColor" opacity=".55"/><path d="M32 30c0-14 8-22 22-22 0 14-8 22-22 22Z" fill="currentColor"/></svg>';

// Foto recortada en arco, como las ventanas de un patio. Sin foto, una hoja dibujada.
export function archPhoto(ctx, photo, { size = "md", alt = "" } = {}) {
  const box = h("div", { class: `arch arch-${size}` });
  if (photo?.ref) {
    const img = h("img", { alt, loading: "lazy", decoding: "async" });
    box.append(img);
    ctx.store.photoUrl(photo).then(url => { if (url) img.src = url; else box.classList.add("empty"); }).catch(() => box.classList.add("empty"));
  } else {
    box.classList.add("empty");
    box.innerHTML = LEAF;
  }
  return box;
}

export function statusPill(plant, now = Date.now()) {
  return h("span", { class: `pill st-${statusOf(plant, now)}` }, statusText(plant, now));
}

export const speciesOf = plant => getSpecies(plant.speciesId) ?? OTHER;

export function speciesLabel(plant) {
  if (plant.speciesId === "otra" && plant.customCare?.speciesName) return plant.customCare.speciesName;
  const s = speciesOf(plant);
  return s.id === "otra" ? "Especie sin indicar" : s.name;
}

// Dos botones: cámara y galería. En iPhone, `capture` abre directamente la cámara trasera.
export function photoButtons(onFile, { cameraText = "Hacer foto", galleryText = "Elegir de la galería" } = {}) {
  const make = (text, capture, cls) => {
    const input = h("input", { type: "file", accept: "image/*", capture, class: "visually-hidden" });
    input.addEventListener("change", () => { const f = input.files?.[0]; input.value = ""; if (f) onFile(f); });
    return h("label", { class: `btn ${cls}` }, text, input);
  };
  return h("div", { class: "photo-buttons" }, make(cameraText, "environment", "secondary"), make(galleryText, null, "ghost"));
}

// Botón destructivo de dos toques: el primero pide confirmación (los diálogos del sistema no siempre
// funcionan dentro de claude.ai).
export function confirmButton(text, confirmText, onConfirm, cls = "danger") {
  let armed = false, timer;
  const btn = h("button", { type: "button", class: `btn ${cls}` }, text);
  btn.addEventListener("click", async () => {
    if (!armed) {
      armed = true; btn.textContent = confirmText; btn.classList.add("armed");
      timer = setTimeout(() => { armed = false; btn.textContent = text; btn.classList.remove("armed"); }, 4000);
      return;
    }
    clearTimeout(timer);
    await busy(btn, onConfirm);
  });
  return btn;
}

const CARE_ROWS = [
  ["light", "Luz"], ["water", "Riego"], ["drainage", "Drenaje"], ["feed", "Abono"], ["problems", "Problemas habituales"],
];

// Ficha de cuidados: del catálogo o, si la especie no está en él, los que dio la IA marcados como orientativos.
export function careSheet(plant) {
  const s = speciesOf(plant);
  const ai = s.id === "otra" && plant.customCare?.source === "ia" ? plant.customCare : null;
  const value = k => (ai?.[k] ? ai[k] : s[k]);
  const rows = CARE_ROWS.map(([k, label]) => {
    const v = value(k);
    return h("div", { class: "care-row" }, h("h3", {}, label),
      Array.isArray(v) ? h("ul", {}, v.map(x => h("li", {}, x))) : h("p", {}, v));
  });
  return h("section", { class: "care" },
    h("h2", {}, "Cuidados"),
    ai ? h("p", { class: "notice" }, `Cuidados orientativos sugeridos por IA para ${ai.speciesName}${ai.scientificName ? ` (${ai.scientificName})` : ""}. Contrástalos si dudas.`) : null,
    h("div", { class: "care-row care-check" }, h("h3", {}, "Antes de regar"), h("p", {}, s.check)),
    rows,
    s.toxicity ? h("div", { class: "care-row" }, h("h3", {}, "Mascotas y niños"), h("p", {}, s.toxicity)) : null);
}
