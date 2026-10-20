import { h, field } from "./dom.js";
import { bar, busy } from "./common.js";
import { buildIcs, generalReminder, googleCalendarUrl } from "../calendar.js";
import { exportBackup, importBackup } from "../backup.js";
import { notificationState, enableNotifications } from "../notify.js";

const pad = n => String(n).padStart(2, "0");

export async function settingsScreen(_, ctx) {
  const s = ctx.settings;

  // Aviso general.
  const every = h("select", {}, [1, 2, 3, 4, 5, 7].map(n => h("option", { value: n }, n === 1 ? "Cada día" : `Cada ${n} días`)));
  every.value = String(s.everyDays);
  const time = h("input", { type: "time", value: `${pad(s.hour)}:${pad(s.minute)}`, required: true });
  const reminder = () => generalReminder({ everyDays: Number(every.value), hour: s.hour, minute: s.minute });
  const persist = async () => {
    const [hh, mm] = (time.value || "19:00").split(":").map(Number);
    await ctx.saveSettings({ everyDays: Number(every.value), hour: hh, minute: mm });
    gcal.href = googleCalendarUrl(reminder());
  };
  every.addEventListener("change", persist);
  time.addEventListener("change", persist);
  const gcal = h("a", { class: "btn ghost", href: googleCalendarUrl(reminder()), target: "_blank", rel: "noopener" }, "Añadir a Google Calendar");

  const notifState = notificationState(ctx);
  const notifBlock = ctx.mode === "local" ? h("div", { class: "sub" },
    h("h3", {}, "Número en el icono"),
    notifState === "unsupported"
      ? h("p", { class: "hint" }, "Este navegador no permite notificaciones. En iPhone necesitas iOS 16.4 o posterior y abrir la app desde su icono en la pantalla de inicio.")
      : notifState === "granted"
        ? h("p", { class: "notice ok" }, "Activado. El icono de la app muestra cuántas plantas tocaba revisar la última vez que la abriste.")
        : notifState === "denied"
          ? h("p", { class: "hint" }, "Las tienes bloqueadas. Actívalas en Ajustes del iPhone › Notificaciones › Mis plantas.")
          : h("button", { class: "btn secondary", type: "button", onclick: async e => busy(e.currentTarget, async () => {
              const r = await enableNotifications(ctx);
              ctx.toast(r === "granted" ? "Número en el icono activado" : "No se ha dado permiso");
              ctx.refresh({ keepScroll: true });
            }) }, "Activar el número en el icono"),
    h("p", { class: "hint" }, "Sin un servidor de avisos, una web no puede despertarse sola en el iPhone: el número del icono se actualiza al abrir la app. El aviso que suena con la app cerrada es el del calendario de arriba.")) : null;

  // Identificación.
  let idBlock;
  if (ctx.mode === "artifact") {
    idBlock = ctx.identifier
      ? h("p", { class: "notice ok" }, "Disponible con Claude, usando tu cuenta de claude.ai. No hay ninguna clave guardada en la app. La primera vez te pedirá permiso para enviar la foto.")
      : h("p", { class: "hint" }, "No disponible en esta vista. Puedes elegir la especie a mano.");
  } else {
    const url = h("input", { type: "url", inputmode: "url", placeholder: "https://mis-plantas.tu-cuenta.workers.dev", value: s.serverUrl ?? "", autocomplete: "off" });
    const code = h("input", { type: "password", autocomplete: "off", value: s.accessCode ?? "" });
    idBlock = h("div", {},
      h("p", { class: "hint" }, ctx.identifier
        ? "Configurada con tu servidor. La clave de la IA está en el servidor, no en el móvil."
        : "Sin configurar: elige la especie a mano. Para identificar por foto hace falta tu propio servidor (instrucciones en plantas/servidor/LEEME.md). Nunca pegues una clave de OpenAI o Anthropic aquí: va en el servidor."),
      field("Dirección del servidor", url),
      field("Código de acceso", code, "El código que pusiste como CODIGO_ACCESO en el servidor. No es la clave de la IA."),
      h("button", { class: "btn secondary", type: "button", onclick: async e => busy(e.currentTarget, async () => {
        const v = url.value.trim();
        if (v && !/^https:\/\//.test(v)) return ctx.toast("La dirección debe empezar por https://");
        await ctx.saveSettings({ serverUrl: v || null, accessCode: code.value || null });
        ctx.toast(v ? "Servidor guardado" : "Servidor quitado");
        ctx.refresh({ keepScroll: true });
      }) }, "Guardar"));
  }

  // Copia de seguridad.
  const importInput = h("input", { type: "file", accept: "application/json,.json", class: "visually-hidden" });
  importInput.addEventListener("change", async () => {
    const f = importInput.files?.[0];
    importInput.value = "";
    if (!f) return;
    try {
      const n = await importBackup(ctx.store, JSON.parse(await f.text()));
      ctx.toast(n ? `${n} ${n === 1 ? "planta importada" : "plantas importadas"}` : "No había plantas nuevas que importar");
    } catch { ctx.toast("Ese archivo no es una copia de Mis plantas."); }
  });

  return [
    bar("Ajustes y avisos", "#/"),

    h("section", { class: "panel" },
      h("h2", {}, "Aviso para revisar tus plantas"),
      h("p", {}, "Un recordatorio que se repite en el calendario de tu móvil y suena aunque la app esté cerrada. Solo te dice que abras la app: ella sabe qué planta toca y te recordará comprobar la tierra antes de regar."),
      h("div", { class: "row2" }, field("Frecuencia", every), field("Hora", time)),
      h("div", { class: "actions" },
        ctx.mode === "local" ? h("button", { class: "btn primary", type: "button", onclick: () => ctx.saveIcs("revisar-plantas.ics", buildIcs([reminder()])) }, "Añadir al Calendario del iPhone") : null,
        gcal),
      h("details", {},
        h("summary", {}, "Cómo funciona en el iPhone"),
        ctx.mode === "local"
          ? h("ol", {},
              h("li", {}, "Toca «Añadir al Calendario del iPhone» y luego «Añadir todo»."),
              h("li", {}, "Comprueba en Ajustes › Calendario › Alertas por omisión que no esté en «Ninguna» y que Calendario tenga permiso de notificaciones."),
              h("li", {}, "Si cambias la frecuencia, borra el evento antiguo «Revisa tus plantas» del Calendario y vuelve a añadirlo."))
          : h("ol", {},
              h("li", {}, "Desde aquí no se puede descargar un archivo de calendario: usa «Añadir a Google Calendar» y guarda el evento."),
              h("li", {}, "Para que suene en el iPhone, ten la app de Google Calendar con notificaciones, o añade tu cuenta de Google en Ajustes › Calendario › Cuentas."),
              h("li", {}, "En cada planta puedes añadir también un aviso suelto para su próxima revisión."))),
      notifBlock),

    h("section", { class: "panel" }, h("h2", {}, "Identificar plantas por foto"), idBlock),

    h("section", { class: "panel" },
      h("h2", {}, "Copia de seguridad"),
      h("p", { class: "hint" }, ctx.mode === "artifact"
        ? "Tus plantas están guardadas en tu cuenta de claude.ai. La copia sirve para pasarlas a la app instalada o guardarlas aparte."
        : "Tus plantas solo están en este móvil. Si borras la app o los datos de Safari, se pierden: guarda una copia de vez en cuando (por ejemplo, en Archivos o iCloud Drive)."),
      h("div", { class: "actions" },
        h("button", { class: "btn secondary", type: "button", onclick: async e => busy(e.currentTarget, async () => {
          const data = await exportBackup(ctx.store);
          const day = new Date().toISOString().slice(0, 10);
          await ctx.saveFile(`mis-plantas-${day}.json`, JSON.stringify(data), "application/json");
        }) }, "Guardar copia"),
        h("label", { class: "btn ghost" }, "Recuperar copia", importInput))),

    h("section", { class: "panel" },
      h("h2", {}, "Tenerla en la pantalla de inicio"),
      ctx.mode === "local"
        ? h("ol", {},
            h("li", {}, "Abre esta página en Safari (no desde otra app)."),
            h("li", {}, "Toca Compartir (el cuadrado con la flecha) y luego «Añadir a pantalla de inicio»."),
            h("li", {}, "Deja activado «Abrir como app web» y toca «Añadir». Aparecerá el icono de la gota con el brote."),
            h("li", {}, "Ábrela siempre desde ese icono: así funciona sin conexión y puede enviarte notificaciones."))
        : h("div", {},
            h("p", {}, "Esta versión vive dentro de claude.ai. Puedes añadirla a la pantalla de inicio desde Safari (Compartir › Añadir a pantalla de inicio), pero el icono será el de Claude y necesitarás tener la sesión iniciada."),
            h("p", { class: "hint" }, "Para tener icono propio y funcionar sin conexión, usa la versión instalable (PWA). Las instrucciones están en plantas/LEEME.md del repositorio. Puedes pasar tus plantas con la copia de seguridad."))),

    h("section", { class: "panel" },
      h("h2", {}, "Privacidad y seguridad"),
      h("ul", {},
        h("li", {}, ctx.mode === "artifact" ? "Tus plantas y tu historial se guardan en tu espacio privado de claude.ai, y la app es privada mientras no compartas su enlace. No lo compartas: las fotos se guardan junto a la app." : "Tus plantas y fotos se guardan solo en este móvil. La app no tiene cuentas ni envía tus datos a ningún sitio."),
        h("li", {}, "Las fotos solo salen del móvil cuando pulsas «Identificar», y van únicamente al servicio de identificación."),
        h("li", {}, "No hay publicidad, analítica ni rastreadores. La app no guarda claves de API."))),
  ];
}
