import { h, field } from "./dom.js";
import { bar, busy, photoButtons, archPhoto, confirmButton } from "./common.js";
import { identifyPanel } from "./identify.js";
import { OTHER, searchSpecies, getSpecies } from "../species.js";
import { createPlant, updatePlant, addPhoto, logEvent, deletePlant } from "../garden.js";
import { shrinkPhoto } from "../image.js";
import { navigate } from "../router.js";

// Alta (sin id) y edición de una planta.
export async function editScreen({ id }, ctx) {
  const existing = id ? await ctx.store.getPlant(id) : null;
  if (id && !existing) { navigate("/"); return null; }
  const state = {
    speciesId: existing?.speciesId ?? null,
    customCare: existing?.customCare ?? null,
    photo: null,              // Blob nuevo pendiente de guardar
  };

  const name = h("input", { type: "text", required: true, maxlength: 60, autocomplete: "off", value: existing?.name ?? "", placeholder: "Gitanillas del balcón" });
  const location = h("select", {},
    h("option", { value: "interior" }, "Interior"),
    h("option", { value: "exterior" }, "Exterior (balcón, terraza, patio)"));
  location.value = existing?.location ?? "interior";
  const notes = h("textarea", { rows: 2, maxlength: 400, placeholder: "Dónde está, maceta, de quién fue…" }, existing?.notes ?? "");
  const wateredToday = h("input", { type: "checkbox" });

  // Selector de especie con búsqueda (sin tildes).
  const search = h("input", { type: "search", placeholder: "Buscar: hiedra, gitanilla, potos…", autocomplete: "off" });
  const chosen = h("p", { class: "chosen" });
  const list = h("div", { class: "species-list", role: "listbox", "aria-label": "Especies" });
  const showChosen = () => {
    const s = state.speciesId ? getSpecies(state.speciesId) : null;
    chosen.textContent = !s ? "Sin elegir"
      : s.id === "otra" ? (state.customCare?.speciesName ? `${state.customCare.speciesName} (cuidados orientativos de IA)` : "Otra planta (cuidados generales)")
      : `${s.name} · ${s.scientific}`;
  };
  const renderList = () => {
    const found = searchSpecies(search.value);
    list.replaceChildren(...[...found, OTHER].map(s => h("button", {
      type: "button", role: "option", class: `species-opt${s.id === state.speciesId ? " on" : ""}`, "aria-selected": s.id === state.speciesId ? "true" : "false",
      onclick: () => {
        state.speciesId = s.id;
        if (s.id !== "otra") state.customCare = null;
        if (!name.value.trim() && s.id !== "otra") name.value = s.name;
        showChosen(); renderList();
      },
    }, s.name)));
  };
  search.addEventListener("input", renderList);
  showChosen(); renderList();

  // Foto + identificación.
  const preview = h("div", { class: "photo-preview" }, existing?.photos?.[0] ? archPhoto(ctx, existing.photos[0], { size: "md" }) : null);
  const idSlot = h("div");
  const idButton = h("button", { class: "btn primary", type: "button", hidden: true }, "Identificar con IA");
  idButton.addEventListener("click", () => {
    idButton.hidden = true;
    idSlot.replaceChildren(identifyPanel(ctx, state.photo, (pick, cand) => {
      state.speciesId = pick.speciesId;
      state.customCare = pick.customCare;
      if (!name.value.trim()) name.value = cand.commonName;
      showChosen(); renderList();
      idSlot.replaceChildren(h("p", { class: "notice ok" }, `Elegida: ${cand.commonName}. Puedes cambiarla abajo si no te convence.`));
    }, { onManual: () => search.focus() }));
  });
  const identifyHelp = ctx.identifier ? null
    : h("p", { class: "hint" }, ctx.mode === "artifact"
      ? "La identificación por foto no está disponible en esta vista. Elige la especie abajo."
      : "La identificación por foto necesita configurar un servicio (Ajustes). Mientras, elige la especie abajo.");

  const onFile = async file => {
    try {
      state.photo = await shrinkPhoto(file);
    } catch { return ctx.toast("No se ha podido abrir la foto. Prueba con otra."); }
    const url = URL.createObjectURL(state.photo);
    preview.replaceChildren(h("div", { class: "arch arch-md" }, h("img", { src: url, alt: "Foto nueva" })));
    idSlot.replaceChildren();
    idButton.hidden = !ctx.identifier;
  };

  const save = h("button", { class: "btn primary big", type: "submit" }, existing ? "Guardar cambios" : "Añadir planta");
  const form = h("form", { class: "form", novalidate: true },
    h("section", { class: "panel" },
      h("h2", {}, "Foto"),
      preview,
      ctx.store.photosAvailable ? photoButtons(onFile) : h("p", { class: "hint" }, "En esta vista no se pueden guardar fotos."),
      idButton, identifyHelp, idSlot),
    h("section", { class: "panel" },
      field("Nombre", name),
      h("div", { class: "field" }, h("span", { class: "label" }, "Especie"), chosen, search, list),
      field("Dónde está", location, "En exterior y en verano la tierra se seca antes: la app acorta el intervalo sugerido."),
      field("Notas", notes),
      existing ? null : h("label", { class: "check" }, wateredToday, " La he regado hoy")),
    save,
    existing ? confirmButton("Eliminar planta", "Toca otra vez para eliminarla con sus fotos e historial", async () => {
      await deletePlant(ctx.store, existing);
      ctx.toast(`${existing.name} eliminada`);
      navigate("/");
    }) : null);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!name.value.trim()) { name.focus(); return ctx.toast("Ponle un nombre a la planta."); }
    busy(save, async () => {
      const fields = {
        name: name.value.trim(), location: location.value, notes: notes.value.trim(),
        speciesId: state.speciesId ?? "otra", customCare: state.customCare,
      };
      try {
        let plant = existing ? await updatePlant(ctx.store, existing, fields) : await createPlant(ctx.store, fields);
        if (state.photo) plant = await addPhoto(ctx.store, plant, state.photo);
        if (!existing && wateredToday.checked) ({ plant } = await logEvent(ctx.store, plant, { type: "riego" }));
        ctx.toast(existing ? "Cambios guardados" : `${plant.name} añadida`);
        navigate(`/planta/${plant.id}`);
      } catch (err) {
        console.warn(err);
        ctx.toast("No se ha podido guardar. Comprueba la conexión y vuelve a intentarlo.");
      }
    });
  });

  return [bar(existing ? `Editar ${existing.name}` : "Nueva planta", existing ? `#/planta/${existing.id}` : "#/"), form];
}
