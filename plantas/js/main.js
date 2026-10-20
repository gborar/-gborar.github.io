import { route, startRouter } from "./router.js";
import { h } from "./ui/dom.js";
import { homeScreen } from "./ui/home.js";
import { plantScreen } from "./ui/plant.js";
import { editScreen } from "./ui/edit.js";
import { settingsScreen } from "./ui/settings.js";
import { createDbStore } from "./store-db.js";
import { createIdbStore } from "./store-idb.js";
import { claudeIdentifier, serverIdentifier } from "./identify.js";

export const DEFAULT_SETTINGS = { everyDays: 2, hour: 19, minute: 0, serverUrl: null, accessCode: null };

const app = document.getElementById("app");

let toastTimer;
function toast(msg) {
  document.querySelector(".toast")?.remove();
  const el = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 3500);
}

function fatal(msg) {
  app.replaceChildren(h("header", { class: "mast" }, h("div", {}, h("h1", {}, "Mis plantas"))), h("p", { class: "notice bad" }, msg));
}

// Dentro de claude.ai: datos en `db`, fotos en `assets`, identificación con Claude. `null` si no es el caso.
async function artifactPlatform() {
  const c = window.claude;
  if (!c?.use) return null;
  const [db, user, sample, assets, downloads] = await Promise.all(
    ["db", "user", "sample", "assets", "downloads"].map(n => Promise.resolve().then(() => c.use(n)).catch(() => null)));
  const uid = user ? await user.id().catch(() => null) : null;
  if (!db || !uid) return null;
  // Si no hay `assets` (p. ej. sin permiso de edición), las fotos van al almacén local del navegador.
  const localPhotos = assets ? null : await createIdbStore().then(s => s.photos).catch(() => null);
  const limits = sample ? await sample.limits().catch(() => null) : null;
  return {
    mode: "artifact",
    store: createDbStore(db, uid, { assets, localPhotos }),
    identifier: sample && limits?.images ? claudeIdentifier(sample, limits) : null,
    downloads,
  };
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function boot() {
  app.replaceChildren(h("p", { class: "loading" }, "Cargando tus plantas…"));
  let platform = await artifactPlatform().catch(() => null);
  if (!platform) {
    try {
      platform = { mode: "local", store: await createIdbStore(), identifier: null, downloads: null };
    } catch {
      return fatal("Este navegador no deja guardar datos (¿modo privado?). Abre la app en Safari normal.");
    }
  }

  const ctx = { ...platform, toast };
  ctx.settings = { ...DEFAULT_SETTINGS, ...(await ctx.store.getSettings().catch(() => ({}))) };
  const configureServer = () => {
    if (ctx.mode === "local") ctx.identifier = ctx.settings.serverUrl ? serverIdentifier({ url: ctx.settings.serverUrl, accessCode: ctx.settings.accessCode }) : null;
  };
  configureServer();
  ctx.saveSettings = async patch => {
    ctx.settings = { ...ctx.settings, ...patch };
    await ctx.store.saveSettings(ctx.settings);
    configureServer();
  };
  ctx.saveFile = async (filename, text, type) => {
    if (ctx.downloads) {
      try { await ctx.downloads.save({ filename, data: text }); }
      catch (e) { if (e?.code !== "declined") toast("No se ha podido guardar el archivo."); }
      return;
    }
    downloadBlob(filename, new Blob([text], { type }));
  };
  ctx.saveIcs = (filename, ics) => downloadBlob(filename, new Blob([ics], { type: "text/calendar;charset=utf-8" }));

  route("/", homeScreen);
  route("/nueva", editScreen);
  route("/planta/:id", plantScreen);
  route("/planta/:id/editar", editScreen);
  route("/ajustes", settingsScreen);
  let rerun = null;
  ctx.refresh = opts => rerun?.(opts);
  rerun = startRouter(app, ctx);

  if (ctx.mode === "local") {
    if ("serviceWorker" in navigator && window.top === window && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }
}

boot();
