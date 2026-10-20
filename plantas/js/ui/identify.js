import { h } from "./dom.js";
import { confidenceLabel, careFromCandidate, errorText } from "../identify.js";
import { getSpecies } from "../species.js";

// Panel que identifica la foto y deja elegir: una candidata, o ninguna (elegir a mano).
// onPick recibe { speciesId, customCare } y, si la planta no tiene nombre, una sugerencia de nombre.
export function identifyPanel(ctx, blob, onPick, { onManual } = {}) {
  const box = h("div", { class: "identify", "aria-live": "polite" });
  // replaceChildren(null) escribiría "null": se filtran los huecos.
  const show = (...nodes) => box.replaceChildren(...nodes.filter(Boolean));
  const run = async () => {
    box.replaceChildren(h("p", { class: "thinking" }, `Mirando la foto con ${ctx.identifier.label}… puede tardar hasta un minuto.`));
    let result;
    try {
      result = await ctx.identifier.identify(blob);
    } catch (e) {
      box.replaceChildren(h("p", { class: "notice bad" }, errorText(e?.code)),
        h("button", { class: "btn ghost small", type: "button", onclick: run }, "Volver a intentarlo"));
      return;
    }
    render(result);
  };

  function render(result) {
    if (!result.isPlant) {
      box.replaceChildren(h("p", { class: "notice bad" }, "No reconozco ninguna planta en esta foto. Prueba con otra más cercana y con buena luz."));
      return;
    }
    const top = result.candidates[0];
    show(
      h("p", { class: "notice" }, top.confidence < 0.45
        ? "No estoy seguro. Compara con tu planta antes de elegir, o elige la especie a mano."
        : "Esto es una orientación, no una certeza. Elige la que encaje con tu planta."),
      h("ol", { class: "candidates" }, result.candidates.map(c => {
        const conf = confidenceLabel(c.confidence);
        const inCatalog = c.catalogId ? getSpecies(c.catalogId) : null;
        return h("li", { class: `cand conf-${conf.level}` },
          h("div", { class: "cand-head" },
            h("strong", {}, c.commonName),
            c.scientificName ? h("i", {}, c.scientificName) : null),
          meter(c.confidence, conf.text),
          h("p", { class: "conf-text" }, conf.text),
          c.reasons ? h("p", { class: "reasons" }, c.reasons) : null,
          h("p", { class: "hint" }, inCatalog ? `Usará la ficha de cuidados de ${inCatalog.name}.` : "No está en el catálogo: guardará los cuidados orientativos de la IA."),
          h("button", { class: "btn primary small", type: "button", onclick: e => { e.currentTarget.disabled = true; onPick(careFromCandidate(result, c), c); } }, "Es esta"));
      })),
      result.health ? h("p", { class: "notice warn" }, `Lo que se ve en la foto: ${result.health}`) : null,
      result.notes ? h("p", { class: "hint" }, `Para confirmarlo: ${result.notes}`) : null,
      h("button", { class: "btn ghost small", type: "button", onclick: () => { box.replaceChildren(); onManual?.(); } }, "Ninguna, la elijo a mano"));
  }

  run();
  return box;
}

// El ancho se fija por CSSOM (no con un atributo style) para cumplir la CSP de la PWA.
function meter(value, label) {
  const bar = h("span");
  bar.style.width = `${Math.round(value * 100)}%`;
  return h("div", { class: "meter", role: "img", "aria-label": label }, bar);
}
