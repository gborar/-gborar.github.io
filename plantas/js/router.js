const routes = [];

export function route(pattern, render) {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
  routes.push({ re, keys, render });
}

export const navigate = hash => { location.hash = hash; };

export function startRouter(mount, ctx) {
  let token = 0;
  // keepScroll: refresco de la misma pantalla (p. ej. tras el feedback) sin volver arriba.
  async function run({ keepScroll = false } = {}) {
    const path = location.hash.replace(/^#/, "") || "/";
    const my = ++token;
    for (const r of routes) {
      const m = path.match(r.re);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      try {
        const node = await r.render(params, ctx);
        if (my === token) { mount.replaceChildren(...[node].flat().filter(x => x != null && x !== false)); if (!keepScroll) window.scrollTo(0, 0); }
      } catch (e) {
        console.warn(e);
        if (my === token) ctx.toast("No se ha podido cargar esta pantalla. Vuelve a intentarlo.");
      }
      return;
    }
    navigate("/");
  }
  addEventListener("hashchange", () => run());
  run();
  return run;
}
