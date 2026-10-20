// Almacén de la PWA: todo en IndexedDB del navegador (plantas, historial, ajustes y fotos como Blob).
// También sirve de almacén de fotos de respaldo en el modo Artifact cuando `assets` no está disponible.

const DB_NAME = "mis-plantas";
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

function openDb(name = DB_NAME) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore("plants", { keyPath: "id" });
      db.createObjectStore("events", { keyPath: "id" }).createIndex("plantId", "plantId");
      db.createObjectStore("settings");
      db.createObjectStore("photos");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const done = req => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });

export async function createIdbStore({ name } = {}) {
  const db = await openDb(name);
  const tx = (store, mode = "readonly") => db.transaction(store, mode).objectStore(store);
  const urls = new Map();
  // Pide al navegador que no borre los datos por falta de espacio (en iPhone ayuda si la app está instalada).
  navigator.storage?.persist?.().catch(() => {});

  const photos = {
    async putPhoto(blob) {
      const id = newId();
      await done(tx("photos", "readwrite").put(blob, id));
      return { ref: `idb:${id}` };
    },
    async photoBlob(photo) {
      if (!photo?.ref?.startsWith("idb:")) return null;
      return (await done(tx("photos").get(photo.ref.slice(4)))) ?? null;
    },
    async photoUrl(photo) {
      if (!photo?.ref?.startsWith("idb:")) return null;
      if (urls.has(photo.ref)) return urls.get(photo.ref);
      const blob = await photos.photoBlob(photo);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      urls.set(photo.ref, url);
      return url;
    },
    async deletePhoto(photo) {
      if (!photo?.ref?.startsWith("idb:")) return;
      await done(tx("photos", "readwrite").delete(photo.ref.slice(4)));
      const url = urls.get(photo.ref);
      if (url) { URL.revokeObjectURL(url); urls.delete(photo.ref); }
    },
  };

  return {
    kind: "local",
    photosAvailable: true,
    photos,
    listPlants: () => done(tx("plants").getAll()),
    getPlant: async id => (await done(tx("plants").get(id))) ?? null,
    async savePlant(plant) {
      const doc = { ...plant, id: plant.id ?? newId(), createdAt: plant.createdAt ?? Date.now(), updatedAt: Date.now() };
      await done(tx("plants", "readwrite").put(doc));
      return doc;
    },
    async deletePlant(id) {
      const t = db.transaction(["plants", "events"], "readwrite");
      const keys = await done(t.objectStore("events").index("plantId").getAllKeys(id));
      for (const k of keys) t.objectStore("events").delete(k);
      t.objectStore("plants").delete(id);
      await new Promise((resolve, reject) => { t.oncomplete = resolve; t.onerror = () => reject(t.error); });
    },
    async listEvents(plantId) {
      const list = plantId ? await done(tx("events").index("plantId").getAll(plantId)) : await done(tx("events").getAll());
      return list.sort((a, b) => b.at - a.at);
    },
    async addEvent(event) {
      const doc = { ...event, id: newId() };
      await done(tx("events", "readwrite").put(doc));
      return doc;
    },
    deleteEvent: id => done(tx("events", "readwrite").delete(id)),
    getSettings: async () => (await done(tx("settings").get("settings"))) ?? {},
    saveSettings: s => done(tx("settings", "readwrite").put(s, "settings")),
    ...photos,
  };
}
