// Identificación por foto. Nunca se inventa un resultado: si no hay IA disponible, la app lo dice
// y ofrece elegir la especie a mano. La respuesta de la IA se valida antes de mostrarse.
import { SPECIES, getSpecies, matchSpecies } from "./species.js";

const CARE_KEYS = ["light", "water", "drainage", "feed", "problems"];

export function buildPrompt() {
  const catalog = SPECIES.map(s => `${s.id} = ${s.name} (${s.scientific})`).join("; ");
  return `Eres botánico y jardinero experto. Mira la foto e identifica la planta.

Reglas:
- Da entre 1 y 3 candidatas, de la más probable a la menos probable.
- "confidence" es tu probabilidad real (de 0 a 1) de que esa candidata sea correcta. Sé honesto: si la foto es borrosa, muestra solo una parte o la planta no tiene rasgos claros, usa valores bajos. Las confianzas de las candidatas no deben sumar más de 1.
- "reasons": en una frase, los rasgos visibles en los que te basas (forma de hoja, tallo, flor…).
- "catalogId": si la candidata es una de estas especies del catálogo de la app, pon su id; si no, null. Catálogo: ${catalog}.
- "care": cuidados para la candidata más probable, en español de España, prácticos y breves (una o dos frases por apartado): luz, riego (recordando comprobar la humedad de la tierra antes de regar), drenaje, abono y problemas habituales.
- "health": si ves síntomas (hojas amarillas, manchas, plagas, tallos podridos…), descríbelos en una frase; si no, null.
- "isPlant": false si en la foto no hay ninguna planta reconocible.
- "notes": una frase con lo que ayudaría a confirmar la identificación (otra foto de la flor, del envés…), o null.

Responde SOLO con JSON con esta forma exacta:
{"isPlant": true, "candidates": [{"commonName": "…", "scientificName": "…", "confidence": 0.0, "reasons": "…", "catalogId": null}], "care": {"light": "…", "water": "…", "drainage": "…", "feed": "…", "problems": "…"}, "health": null, "notes": null}`;
}

const str = (v, max = 600) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

function confidenceOf(v) {
  let n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return null;
  if (n > 1 && n <= 100) n /= 100;
  return Math.min(1, Math.max(0, n));
}

export class IdentificationError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Normaliza y comprueba la respuesta. Lanza IdentificationError("invalid") si no sirve.
export function validateIdentification(raw) {
  if (!raw || typeof raw !== "object") throw new IdentificationError("invalid", "Respuesta vacía");
  const isPlant = raw.isPlant !== false;
  const candidates = (Array.isArray(raw.candidates) ? raw.candidates : [])
    .map(c => {
      const commonName = str(c?.commonName, 80);
      const scientificName = str(c?.scientificName, 80);
      const confidence = confidenceOf(c?.confidence);
      if (!(commonName || scientificName) || confidence == null) return null;
      const catalogId = getSpecies(c.catalogId) && c.catalogId !== "otra" ? c.catalogId : matchSpecies(scientificName, commonName);
      return { commonName: commonName ?? scientificName, scientificName: scientificName ?? "", confidence, reasons: str(c?.reasons, 300) ?? "", catalogId };
    })
    .filter(Boolean)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
  if (isPlant && !candidates.length) throw new IdentificationError("invalid", "Sin candidatas válidas");
  const care = {};
  for (const k of CARE_KEYS) {
    const v = raw.care?.[k];
    care[k] = Array.isArray(v) ? str(v.filter(x => typeof x === "string").join(" "), 800) : str(v, 800);
  }
  return { isPlant, candidates: isPlant ? candidates : [], care, health: str(raw.health, 300), notes: str(raw.notes, 300) };
}

export function confidenceLabel(c) {
  const pct = Math.round(c * 100);
  if (c >= 0.75) return { level: "alta", text: `Seguridad alta (${pct} %)` };
  if (c >= 0.45) return { level: "media", text: `Seguridad media (${pct} %)` };
  return { level: "baja", text: `Seguridad baja (${pct} %)` };
}

// Cuidados a guardar al aceptar una candidata: los del catálogo si casa; si no, los de la IA, marcados.
export function careFromCandidate(result, candidate) {
  if (candidate.catalogId) return { speciesId: candidate.catalogId, customCare: null };
  const c = result.care;
  const hasCare = CARE_KEYS.some(k => c[k]);
  return {
    speciesId: "otra",
    customCare: hasCare ? { ...c, source: "ia", speciesName: candidate.commonName, scientificName: candidate.scientificName } : null,
  };
}

const ERRORS = {
  not_granted: "No has dado permiso para usar Claude en esta app. Puedes elegir la especie a mano.",
  images_unavailable: "Esta vista no puede enviar fotos a Claude. Elige la especie a mano.",
  image_rejected: "La foto no es válida para identificar (formato o tamaño). Prueba con otra.",
  rate_limited: "Demasiadas consultas seguidas. Espera un minuto y vuelve a probar.",
  invalid: "La respuesta de la IA no tenía un formato válido. Vuelve a intentarlo o elige la especie a mano.",
  invalid_json: "La respuesta de la IA no tenía un formato válido. Vuelve a intentarlo o elige la especie a mano.",
  network: "No se ha podido conectar con el servicio de identificación. Comprueba la conexión.",
  unauthorized: "El código de acceso del servicio de identificación no es correcto (revísalo en Ajustes).",
  server: "El servicio de identificación ha fallado. Vuelve a intentarlo más tarde o elige la especie a mano.",
};
export const errorText = code => ERRORS[code] ?? "No se ha podido identificar la planta. Vuelve a intentarlo o elige la especie a mano.";

// Proveedor 1: Claude desde el Artifact (capacidad sample con imágenes). Sin claves en ningún sitio.
export function claudeIdentifier(sample, limits) {
  return {
    kind: "claude",
    label: "Claude",
    accepts: limits?.images?.mediaTypes ?? ["image/jpeg", "image/png", "image/webp"],
    async identify(blob) {
      let raw;
      try {
        raw = await sample.json(buildPrompt(), { images: [blob], modelTier: "default", cache: false });
      } catch (e) {
        throw new IdentificationError(e?.code ?? "unknown", e?.message ?? "error");
      }
      return validateIdentification(raw);
    },
  };
}

export async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Proveedor 2: servidor propio (plantas/servidor/). La clave de la IA vive allí como secreto; la app
// solo conoce la URL y un código de acceso que limita quién puede usar el servidor.
export function serverIdentifier({ url, accessCode }, fetchImpl = globalThis.fetch) {
  return {
    kind: "server",
    label: "tu servidor",
    accepts: ["image/jpeg", "image/png", "image/webp"],
    async identify(blob) {
      let res;
      try {
        res = await fetchImpl(url.replace(/\/+$/, "") + "/identificar", {
          method: "POST",
          headers: { "content-type": "application/json", "x-codigo-acceso": accessCode ?? "" },
          body: JSON.stringify({ image: await blobToBase64(blob), mediaType: blob.type || "image/jpeg" }),
        });
      } catch {
        throw new IdentificationError("network", "fetch failed");
      }
      if (res.status === 401) throw new IdentificationError("unauthorized", "401");
      if (res.status === 429) throw new IdentificationError("rate_limited", "429");
      if (!res.ok) throw new IdentificationError("server", String(res.status));
      return validateIdentification(await res.json().catch(() => null));
    },
  };
}
