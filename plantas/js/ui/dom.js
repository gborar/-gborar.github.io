// Pequeño constructor de nodos. El texto siempre entra como textContent.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "value") el.value = v;
    else if (k === "checked") el.checked = !!v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

let fieldSeq = 0;
// Campo con etiqueta asociada (para lectores de pantalla y para getByLabel).
export function field(labelText, input, hint) {
  if (!input.id) input.id = `f${++fieldSeq}`;
  return h("div", { class: "field" }, h("label", { for: input.id }, labelText), input, hint ? h("p", { class: "hint" }, hint) : null);
}
