// Almacén del modo Artifact: datos en la capacidad `db` (privados, bajo data/users/<uid>/plantas)
// y fotos en `assets`. Si `assets` no está disponible, las fotos van al almacén local de respaldo.

export function createDbStore(db, uid, { assets = null, localPhotos = null } = {}) {
  const base = () => db.doc(`data/users/${uid}/plantas`);
  const plants = () => base().collection("plants");
  const events = () => base().collection("events");
  const data = s => ({ id: s.id, ...s.data() });

  return {
    kind: "artifact",
    photosAvailable: !!(assets || localPhotos),

    async listPlants() {
      const snap = await plants().get();
      return snap.docs.map(data);
    },
    async getPlant(id) {
      const s = await plants().doc(id).get();
      return s.exists ? data(s) : null;
    },
    async savePlant(plant) {
      const ref = plant.id ? plants().doc(plant.id) : plants().doc();
      const { id: _, ...rest } = plant;
      const doc = { ...rest, createdAt: rest.createdAt ?? Date.now(), updatedAt: Date.now() };
      await ref.set(doc);
      return { id: ref.id, ...doc };
    },
    async deletePlant(id) {
      const evs = await events().where("plantId", "==", id).get();
      for (const d of evs.docs) await events().doc(d.id).delete();
      await plants().doc(id).delete();
    },
    async listEvents(plantId) {
      const snap = plantId ? await events().where("plantId", "==", plantId).get() : await events().get();
      return snap.docs.map(data).sort((a, b) => b.at - a.at);
    },
    async addEvent(event) {
      const ref = events().doc();
      await ref.set(event);
      return { id: ref.id, ...event };
    },
    deleteEvent: id => events().doc(id).delete(),
    async getSettings() {
      const s = await base().get();
      return s.exists ? s.data().settings ?? {} : {};
    },
    saveSettings: settings => base().set({ settings }),

    async putPhoto(blob) {
      if (assets) {
        const r = await assets.upload(blob);
        return { ref: `asset:${r.id}`, url: r.url };
      }
      if (localPhotos) return localPhotos.putPhoto(blob);
      throw Object.assign(new Error("photos unavailable"), { code: "photos_unavailable" });
    },
    async photoUrl(photo) {
      if (!photo?.ref) return null;
      if (photo.ref.startsWith("asset:")) return photo.url ?? `/_blob/${photo.ref.slice(6)}`;
      return localPhotos ? localPhotos.photoUrl(photo) : null;
    },
    async photoBlob(photo) {
      if (!photo?.ref) return null;
      if (photo.ref.startsWith("asset:")) {
        const res = await fetch(await this.photoUrl(photo));
        return res.ok ? res.blob() : null;
      }
      return localPhotos ? localPhotos.photoBlob(photo) : null;
    },
    async deletePhoto(photo) {
      if (!photo?.ref) return;
      if (photo.ref.startsWith("asset:")) await assets?.delete(photo.ref.slice(6)).catch(() => {});
      else await localPhotos?.deletePhoto(photo);
    },
  };
}
