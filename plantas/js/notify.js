// Número en el icono de la PWA instalada (Badging API). En iPhone exige iOS 16.4+, la app abierta desde
// la pantalla de inicio y permiso de notificaciones. Sin servidor no hay avisos con la app cerrada:
// para eso está el calendario (calendar.js).

export function notificationState(ctx) {
  if (ctx.mode !== "local" || typeof Notification === "undefined" || !("serviceWorker" in navigator)) return "unsupported";
  return Notification.permission;
}

export async function enableNotifications(ctx) {
  if (notificationState(ctx) === "unsupported") return "unsupported";
  const r = await Notification.requestPermission();
  return r;
}

export async function updateBadge(dueCount) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") return;
    if (dueCount > 0) await navigator.setAppBadge?.(dueCount);
    else await navigator.clearAppBadge?.();
  } catch { /* sin soporte: nada que hacer */ }
}
