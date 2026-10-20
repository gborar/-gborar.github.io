// Catálogo curado de especies. Los intervalos son días entre REVISIONES de la tierra, no entre riegos:
// al llegar la fecha se comprueba la humedad y solo se riega si hace falta.

const CHECK_FINGER = "Mete un dedo 2-3 cm en la tierra o pincha un palillo de madera: si sale seco y limpio, toca regar; si sale húmedo o con tierra pegada, espera. Levantar la maceta también ayuda: seca pesa mucho menos.";
const CHECK_DRY = "Riega solo cuando la tierra esté seca del todo, también en el fondo: pincha un palillo largo hasta abajo o espera a que la maceta pese muy poco.";

export const SPECIES = [
  {
    id: "hiedra", name: "Hiedra", scientific: "Hedera helix", aliases: ["hiedra comun", "yedra"],
    intervals: { verano: 4, entretiempo: 7, invierno: 10 },
    light: "Luz abundante pero indirecta, o semisombra. Aguanta rincones con poca luz, aunque crece menos. El sol fuerte del mediodía le quema las hojas, sobre todo las variegadas.",
    water: "Mantén la tierra ligeramente húmeda: riega cuando se sequen los 2-3 cm de arriba. Peor el encharcamiento que un día de sed. En invierno, bastante menos.",
    drainage: "Maceta con agujeros y sustrato universal con algo de perlita. Vacía el plato 15 minutos después de regar.",
    feed: "Abono líquido para plantas verdes cada 15 días de primavera a final de verano, a media dosis. En otoño e invierno, nada.",
    problems: [
      "Araña roja (puntitos amarillos y telillas) con calor y aire seco: duchas de hojas y pulverizar; si persiste, jabón potásico.",
      "Cochinilla algodonosa en tallos y envés: retírala con un algodón con alcohol.",
      "Hojas amarillas y blandas: exceso de riego. Puntas secas y marrones: aire seco o falta de agua.",
      "Variegadas que se vuelven verdes: le falta luz.",
    ],
    toxicity: "Tóxica si se come (perros, gatos y personas). La savia puede irritar la piel: usa guantes al podar.",
    check: CHECK_FINGER,
  },
  {
    id: "gitanilla", name: "Gitanilla", scientific: "Pelargonium peltatum", aliases: ["geranio hiedra", "geranio de hiedra", "gitanillas", "geranio colgante"],
    intervals: { verano: 2, entretiempo: 4, invierno: 8 },
    light: "Mucho sol: es la reina de balcones y patios. En pleno verano andaluz agradece algo de sombra en las horas centrales para que no se achicharren las hojas.",
    water: "Deja que se seque la capa de arriba entre riegos y riega a fondo. No soporta el encharcamiento. En verano, en balcón y maceta pequeña, puede pedir agua casi a diario: compruébalo cada tarde.",
    drainage: "Imprescindible buen drenaje: agujeros amplios, sustrato con arena o perlita y nada de agua retenida en el plato.",
    feed: "Abono para plantas de flor (rico en potasio) cada 15 días de primavera a principios de otoño. Quita las flores secas para que siga floreciendo.",
    problems: [
      "Taladro o mariposa del geranio (Cacyreus marshalli): tallos huecos o negros y capullos agujereados. Corta lo dañado y trata de forma preventiva con Bacillus thuringiensis en primavera y verano.",
      "Pudrición del tallo (base negra y blanda) por exceso de agua.",
      "Roya (pústulas marrones en el envés) y botritis (moho gris) con humedad: retira hojas afectadas y no mojes las hojas al regar.",
      "Hojas rojizas: frío o falta de nutrientes.",
    ],
    toxicity: "Ligeramente tóxica para perros y gatos (vómitos, irritación).",
    check: CHECK_FINGER,
  },
  {
    id: "geranio", name: "Geranio", scientific: "Pelargonium × hortorum", aliases: ["geranio comun", "geranios", "gitana"],
    intervals: { verano: 2, entretiempo: 4, invierno: 8 },
    light: "Pleno sol o muchas horas de luz. Con poca luz florece poco y se estira.",
    water: "Riega a fondo cuando la capa de arriba esté seca. Prefiere quedarse corto a pasarse.",
    drainage: "Sustrato suelto con perlita o arena y maceta con buenos agujeros.",
    feed: "Abono de floración cada 15 días en primavera y verano. Despunta flores secas.",
    problems: [
      "Taladro del geranio: tallos huecos y capullos comidos. Bacillus thuringiensis preventivo.",
      "Tallo negro en la base: pudrición por exceso de riego.",
      "Mosca blanca en el envés: jabón potásico.",
    ],
    toxicity: "Ligeramente tóxico para perros y gatos.",
    check: CHECK_FINGER,
  },
  {
    id: "potos", name: "Potos", scientific: "Epipremnum aureum", aliases: ["poto", "pothos", "potus"],
    intervals: { verano: 6, entretiempo: 9, invierno: 14 },
    light: "Luz indirecta media o abundante. Tolera poca luz, pero pierde el jaspeado. Nada de sol directo fuerte.",
    water: "Riega cuando se haya secado la mitad superior de la tierra. Hojas lacias que se recuperan al regar: tenía sed.",
    drainage: "Sustrato universal aireado y maceta con agujeros. Vacía el plato.",
    feed: "Abono para plantas verdes una vez al mes en primavera y verano.",
    problems: [
      "Hojas amarillas: casi siempre exceso de riego.",
      "Tallos largos y hojas pequeñas: falta de luz. Poda para que se ramifique.",
      "Cochinilla en las axilas de las hojas.",
    ],
    toxicity: "Tóxico para perros y gatos (oxalatos): irrita boca y garganta.",
    check: CHECK_FINGER,
  },
  {
    id: "sansevieria", name: "Sansevieria", scientific: "Dracaena trifasciata", aliases: ["lengua de suegra", "espada de san jorge", "sanseveria"],
    intervals: { verano: 14, entretiempo: 21, invierno: 30 },
    light: "De todo: desde mucha luz (incluso algo de sol) hasta rincones oscuros, donde crece muy despacio.",
    water: "Muy poca agua: solo con la tierra completamente seca. En invierno, a veces una vez al mes o menos.",
    drainage: "Sustrato para cactus o universal con mucha arena/perlita. Maceta de barro mejor que de plástico.",
    feed: "Abono para cactus 2-3 veces en primavera y verano. Nada más.",
    problems: [
      "Hojas blandas, que se doblan o con la base podrida: exceso de riego. Es su principal causa de muerte.",
      "Manchas marrones secas: golpe de sol tras estar en sombra.",
    ],
    toxicity: "Ligeramente tóxica para perros y gatos.",
    check: CHECK_DRY,
  },
  {
    id: "monstera", name: "Monstera", scientific: "Monstera deliciosa", aliases: ["costilla de adan", "costilla de adán"],
    intervals: { verano: 6, entretiempo: 9, invierno: 14 },
    light: "Mucha luz indirecta. Con poca luz las hojas nuevas salen sin agujeros.",
    water: "Riega cuando se seque la mitad superior de la tierra. Odia el encharcamiento.",
    drainage: "Sustrato aireado (universal con corteza y perlita) y maceta con agujeros.",
    feed: "Abono para plantas verdes cada 3-4 semanas en primavera y verano.",
    problems: [
      "Hojas amarillas: exceso de agua. Bordes marrones y secos: aire seco o sed.",
      "Gotitas en las hojas (gutación): riego algo abundante, no es grave.",
      "Cochinilla y trips: revisa el envés.",
    ],
    toxicity: "Tóxica para perros y gatos (oxalatos).",
    check: CHECK_FINGER,
  },
  {
    id: "cinta", name: "Cinta", scientific: "Chlorophytum comosum", aliases: ["malamadre", "lazo de amor", "planta arana", "planta araña"],
    intervals: { verano: 4, entretiempo: 7, invierno: 10 },
    light: "Luz abundante e indirecta. Tolera algo de sol suave.",
    water: "Riega cuando se seque la capa superior. Sus raíces gruesas guardan agua, así que aguanta algún olvido.",
    drainage: "Sustrato universal y maceta con agujeros.",
    feed: "Abono para plantas verdes cada 15-20 días en primavera y verano.",
    problems: [
      "Puntas marrones: cal o cloro del agua, aire seco o exceso de abono. Usa agua reposada o de lluvia.",
      "Hojas pálidas: demasiado sol o falta de abono.",
    ],
    toxicity: "No se considera tóxica para perros ni gatos.",
    check: CHECK_FINGER,
  },
  {
    id: "aloe", name: "Aloe vera", scientific: "Aloe vera", aliases: ["aloe", "sabila", "sábila"],
    intervals: { verano: 10, entretiempo: 14, invierno: 25 },
    light: "Mucha luz y sol, acostumbrándolo poco a poco. En interior, junto a la ventana más luminosa.",
    water: "Solo con la tierra seca del todo. En invierno casi nada.",
    drainage: "Sustrato para cactus y maceta de barro con agujero. Nunca agua en el plato.",
    feed: "Abono para cactus una o dos veces en primavera y verano.",
    problems: [
      "Hojas blandas o translúcidas: exceso de agua.",
      "Hojas que se ponen marrones o rojizas: exceso de sol brusco.",
      "Hojas finas y curvadas hacia dentro: le falta agua o luz.",
    ],
    toxicity: "Tóxico para perros y gatos si lo comen (aloína).",
    check: CHECK_DRY,
  },
  {
    id: "cactus", name: "Cactus", scientific: "Cactaceae", aliases: ["cactus", "cactaceas", "cactáceas"],
    intervals: { verano: 10, entretiempo: 15, invierno: 30 },
    light: "Máxima luz y sol directo (acostumbrándolo poco a poco).",
    water: "Riega a fondo solo con la tierra seca del todo. En invierno, en reposo, apenas nada o nada.",
    drainage: "Sustrato específico para cactus, muy drenante, y maceta con agujero.",
    feed: "Abono para cactus una vez al mes en primavera y verano.",
    problems: [
      "Base blanda y oscura: pudrición por exceso de agua.",
      "Crece fino y pálido hacia la luz: le falta sol.",
      "Cochinilla algodonosa entre las espinas.",
    ],
    toxicity: "La mayoría no son tóxicos; el peligro son las espinas.",
    check: CHECK_DRY,
  },
  {
    id: "suculenta", name: "Suculenta", scientific: "Crassulaceae (Echeveria, Crassula…)", aliases: ["suculentas", "crasa", "crasas", "echeveria", "arbol de jade", "árbol de jade", "crassula"],
    intervals: { verano: 7, entretiempo: 10, invierno: 20 },
    light: "Mucha luz y algo de sol directo. Con poca luz se estiran y pierden color.",
    water: "Riega cuando la tierra esté totalmente seca; mejor poco frecuente y a fondo.",
    drainage: "Sustrato para cactus y suculentas y maceta con agujero.",
    feed: "Abono para cactus diluido una vez al mes en primavera y verano.",
    problems: [
      "Hojas blandas y transparentes: exceso de agua.",
      "Hojas arrugadas: sed (riega a fondo).",
      "Tallo estirado con hojas separadas: falta de luz.",
    ],
    toxicity: "Depende de la especie: el árbol de jade (Crassula) es tóxico para perros y gatos.",
    check: CHECK_DRY,
  },
  {
    id: "lavanda", name: "Lavanda", scientific: "Lavandula angustifolia", aliases: ["espliego", "lavandula"],
    intervals: { verano: 4, entretiempo: 7, invierno: 12 },
    light: "Pleno sol, en exterior. En sombra florece poco.",
    water: "Poca: riega cuando la tierra esté seca. En maceta y en pleno verano, revisa más a menudo.",
    drainage: "Muy importante: sustrato pobre y suelto con arena y maceta con buen drenaje.",
    feed: "Casi nada: un poco de abono de flor en primavera basta.",
    problems: [
      "Se pone gris y seca desde la base: exceso de riego o mal drenaje.",
      "Poda después de la floración sin llegar a la madera vieja.",
    ],
    toxicity: "Ligeramente tóxica para perros y gatos en cantidad.",
    check: CHECK_FINGER,
  },
  {
    id: "romero", name: "Romero", scientific: "Salvia rosmarinus", aliases: ["rosmarinus officinalis"],
    intervals: { verano: 5, entretiempo: 8, invierno: 14 },
    light: "Pleno sol, en exterior o junto a la ventana más soleada.",
    water: "Poca. Riega cuando la tierra esté seca; resiste mucho mejor la sequía que el encharcamiento.",
    drainage: "Sustrato suelto y arenoso; maceta con agujeros.",
    feed: "Muy poco: algo de abono orgánico en primavera.",
    problems: [
      "Hojas amarillas o negras en la base: exceso de agua.",
      "Oídio (polvillo blanco) con poca ventilación.",
    ],
    toxicity: "No se considera tóxico para perros ni gatos.",
    check: CHECK_FINGER,
  },
  {
    id: "albahaca", name: "Albahaca", scientific: "Ocimum basilicum", aliases: ["alfabega"],
    intervals: { verano: 2, entretiempo: 3, invierno: 5 },
    light: "Mucha luz y sol suave. En pleno verano andaluz, sombra a mediodía.",
    water: "Le gusta la tierra fresca, sin encharcar. Se mustia rápido si se seca: revisa a menudo en verano.",
    drainage: "Sustrato universal con buen drenaje.",
    feed: "Abono orgánico suave cada 15 días si la cosechas mucho.",
    problems: [
      "Flores: córtalas para que siga dando hojas.",
      "Pulgón y mosca blanca: jabón potásico.",
      "Es anual: al llegar el frío decae, es normal.",
    ],
    toxicity: "No se considera tóxica para perros ni gatos.",
    check: CHECK_FINGER,
  },
  {
    id: "hierbabuena", name: "Hierbabuena", scientific: "Mentha spicata", aliases: ["menta", "yerbabuena", "mentha"],
    intervals: { verano: 2, entretiempo: 3, invierno: 6 },
    light: "Semisombra o sol suave.",
    water: "Le gusta la tierra siempre algo húmeda. Es de las que más agua piden.",
    drainage: "Sustrato universal; drenaje normal.",
    feed: "Abono suave cada mes en primavera y verano.",
    problems: [
      "Roya (puntos naranjas en el envés): corta lo afectado.",
      "Se extiende muchísimo: mejor en su propia maceta.",
    ],
    toxicity: "En cantidad puede sentar mal a perros y gatos (molestias digestivas).",
    check: CHECK_FINGER,
  },
  {
    id: "ficus", name: "Ficus benjamina", scientific: "Ficus benjamina", aliases: ["ficus", "benjamina"],
    intervals: { verano: 5, entretiempo: 8, invierno: 12 },
    light: "Mucha luz indirecta y estable. No le gusta que la cambies de sitio.",
    water: "Riega cuando se seque la capa superior.",
    drainage: "Sustrato universal y maceta con agujeros.",
    feed: "Abono para plantas verdes cada 15-20 días en primavera y verano.",
    problems: [
      "Pierde muchas hojas de golpe: cambio de sitio, corrientes o cambios de temperatura.",
      "Cochinilla y hojas pegajosas (melaza).",
    ],
    toxicity: "Tóxico para perros y gatos (látex irritante).",
    check: CHECK_FINGER,
  },
  {
    id: "orquidea", name: "Orquídea", scientific: "Phalaenopsis", aliases: ["orquidea", "phalaenopsis", "falenopsis"],
    intervals: { verano: 6, entretiempo: 8, invierno: 12 },
    light: "Luz abundante e indirecta, sin sol directo.",
    water: "Riega cuando las raíces se vean plateadas (si están verdes, aún tienen agua). Mejor por inmersión 10 minutos y escurrir bien.",
    drainage: "Corteza de pino específica, nunca tierra. Maceta transparente con agujeros.",
    feed: "Abono para orquídeas a media dosis cada 2-3 riegos.",
    problems: [
      "Raíces marrones y blandas: exceso de agua.",
      "No vuelve a florecer: necesita una diferencia de temperatura entre el día y la noche en otoño.",
    ],
    toxicity: "No se considera tóxica para perros ni gatos.",
    check: "Mira el color de las raíces a través de la maceta: plateadas = toca regar; verdes = aún tienen agua.",
  },
  {
    id: "helecho", name: "Helecho", scientific: "Nephrolepis exaltata", aliases: ["helecho de boston", "nephrolepis"],
    intervals: { verano: 3, entretiempo: 5, invierno: 8 },
    light: "Luz indirecta o semisombra. Nada de sol directo.",
    water: "Tierra siempre algo húmeda, sin encharcar. Agradece humedad ambiental.",
    drainage: "Sustrato universal con turba o fibra de coco y maceta con agujeros.",
    feed: "Abono para plantas verdes a media dosis cada mes en primavera y verano.",
    problems: [
      "Frondas secas y que sueltan hojitas: aire seco o falta de agua.",
      "Cochinilla en el envés.",
    ],
    toxicity: "No se considera tóxico para perros ni gatos.",
    check: CHECK_FINGER,
  },
  {
    id: "buganvilla", name: "Buganvilla", scientific: "Bougainvillea", aliases: ["bugambilia", "buganvilia", "santa rita"],
    intervals: { verano: 3, entretiempo: 6, invierno: 12 },
    light: "Pleno sol: cuanto más, más flor.",
    water: "Moderado: deja secar bien entre riegos. Un poco de sed favorece la floración.",
    drainage: "Buen drenaje; en maceta, que no quede agua en el plato.",
    feed: "Abono de floración cada 15 días en primavera y verano.",
    problems: [
      "Pocas flores: falta de sol, exceso de agua o de abono nitrogenado.",
      "Pierde hojas con el frío: normal en invierno.",
    ],
    toxicity: "Poco tóxica; las espinas pueden irritar la piel.",
    check: CHECK_FINGER,
  },
  {
    id: "jazmin", name: "Jazmín", scientific: "Jasminum officinale", aliases: ["jazmin", "jasminum", "jazmin de invierno"],
    intervals: { verano: 3, entretiempo: 5, invierno: 10 },
    light: "Sol o semisombra luminosa.",
    water: "Regular en verano, dejando secar la capa de arriba. Menos en invierno.",
    drainage: "Sustrato universal y maceta con agujeros.",
    feed: "Abono de floración cada 15 días en primavera y verano.",
    problems: [
      "Pulgón en los brotes tiernos: jabón potásico.",
      "Hojas amarillas: exceso de agua o falta de hierro (agua muy calcárea).",
      "Ojo: el «falso jazmín» (Trachelospermum) y el jazmín amarillo (Gelsemium) son plantas distintas.",
    ],
    toxicity: "El jazmín verdadero (Jasminum) no se considera tóxico; el Gelsemium sí lo es.",
    check: CHECK_FINGER,
  },
  {
    id: "kalanchoe", name: "Kalanchoe", scientific: "Kalanchoe blossfeldiana", aliases: ["calanchoe"],
    intervals: { verano: 7, entretiempo: 10, invierno: 18 },
    light: "Mucha luz, algo de sol suave.",
    water: "Como una suculenta: solo con la tierra seca.",
    drainage: "Sustrato para cactus o universal con perlita.",
    feed: "Abono de floración una vez al mes en primavera y verano.",
    problems: [
      "Tallos blandos: exceso de agua.",
      "No vuelve a florecer: necesita noches largas (unas 14 h de oscuridad) durante varias semanas en otoño.",
    ],
    toxicity: "Tóxico para perros y gatos.",
    check: CHECK_DRY,
  },
  {
    id: "zamioculca", name: "Zamioculca", scientific: "Zamioculcas zamiifolia", aliases: ["zamioculcas", "zz", "planta zz"],
    intervals: { verano: 10, entretiempo: 14, invierno: 25 },
    light: "Luz indirecta; tolera poca luz.",
    water: "Muy poca: guarda agua en sus rizomas. Solo con la tierra seca del todo.",
    drainage: "Sustrato drenante y maceta con agujero.",
    feed: "Abono para plantas verdes 2-3 veces en primavera y verano.",
    problems: [
      "Tallos amarillos y blandos: exceso de riego.",
    ],
    toxicity: "Tóxica para perros y gatos (oxalatos).",
    check: CHECK_DRY,
  },
  {
    id: "dipladenia", name: "Dipladenia", scientific: "Mandevilla sanderi", aliases: ["mandevilla", "dipladenia"],
    intervals: { verano: 3, entretiempo: 5, invierno: 10 },
    light: "Mucha luz y sol suave; en pleno verano, mejor sin sol de mediodía.",
    water: "Riega cuando se seque la capa superior. Con calor, a menudo.",
    drainage: "Sustrato universal con perlita y buen drenaje.",
    feed: "Abono de floración cada 15 días en primavera y verano.",
    problems: [
      "Hojas amarillas: exceso de agua o frío.",
      "Pulgón y cochinilla en brotes.",
    ],
    toxicity: "Su savia lechosa puede irritar; evita que las mascotas la mordisqueen.",
    check: CHECK_FINGER,
  },
];

export const OTHER = {
  id: "otra", name: "Otra planta", scientific: "", aliases: [],
  intervals: { verano: 4, entretiempo: 7, invierno: 12 },
  light: "Depende de la especie. Observa: hojas pálidas o tallos estirados suelen indicar falta de luz; manchas secas, exceso de sol.",
  water: "Regla general: riega cuando se seque la capa superior de la tierra, a fondo, y vacía el plato.",
  drainage: "Maceta con agujeros y sustrato adecuado. Sin agujeros, el agua se acumula y pudre las raíces.",
  feed: "Abono adecuado en primavera y verano, a la dosis del envase o menos.",
  problems: ["Hojas amarillas y blandas suelen ser exceso de agua; hojas secas y crujientes, falta de agua o de humedad."],
  toxicity: null,
  check: CHECK_FINGER,
};

const BY_ID = new Map([...SPECIES, OTHER].map(s => [s.id, s]));

export const getSpecies = id => BY_ID.get(id) ?? null;

export const normalize = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9× ]+/g, " ").replace(/\s+/g, " ").trim();

const keysOf = s => [s.name, s.scientific, ...s.aliases].map(normalize).filter(Boolean);

// Búsqueda para el selector manual: coincide por nombre, alias o nombre científico, ignorando tildes.
export function searchSpecies(query) {
  const q = normalize(query);
  if (!q) return [...SPECIES];
  return SPECIES.filter(s => keysOf(s).some(k => k.includes(q)));
}

// Empareja un nombre devuelto por la IA (común o científico) con el catálogo. Exige coincidencia exacta
// de alguna clave, o del género para nombres científicos; si no, null: mejor "Otra" que un cuidado equivocado.
export function matchSpecies(...names) {
  for (const raw of names) {
    const n = normalize(raw);
    if (!n) continue;
    const hit = SPECIES.find(s => keysOf(s).includes(n));
    if (hit) return hit.id;
  }
  for (const raw of names) {
    const genus = normalize(raw).split(" ")[0];
    if (!genus || genus.length < 4) continue;
    const hits = SPECIES.filter(s => normalize(s.scientific).split(" ")[0] === genus);
    if (hits.length === 1) return hits[0].id;
  }
  return null;
}

// Hemisferio norte (Andalucía): verano de junio a septiembre, invierno de noviembre a febrero.
export function seasonOf(date = new Date()) {
  const m = new Date(date).getMonth() + 1;
  if (m >= 6 && m <= 9) return "verano";
  if (m === 11 || m === 12 || m <= 2) return "invierno";
  return "entretiempo";
}

export const SEASON_LABEL = { verano: "verano", entretiempo: "primavera/otoño", invierno: "invierno" };

// Intervalo sugerido en días. En exterior y en verano, las macetas se secan antes: un 30 % menos.
export function suggestedInterval(species, date = new Date(), location = "interior") {
  const s = species ?? OTHER;
  const season = seasonOf(date);
  let days = s.intervals[season];
  if (location === "exterior" && season === "verano") days = Math.round(days * 0.7);
  return Math.max(1, days);
}
