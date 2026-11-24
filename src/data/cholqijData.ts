export interface KicheNawal {
  index: number;
  slug: string;
  name: string;
  yucatec: string;
  element: 'Agua' | 'Aire' | 'Fuego' | 'Tierra';
  cardinal: string;
  animal: string;
  essence: string;
  desc: string;
  strengths: string[];
  advice: string;
  emoji: string;
}

export interface CholqijQuizItem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const KICHE_NAWALES: KicheNawal[] = [
  { index: 0, slug: 'imox', name: 'Imox', yucatec: 'Imix', element: 'Agua', cardinal: 'Este (Rojo)', animal: 'Lagarto / Delfín', essence: 'Origen, sensibilidad, mundo interior e intuición', desc: 'Representa las aguas primordiales y la mente creativa sin fronteras. Es el punto de partida donde nacen las ideas nuevas antes de tomar forma.', strengths: ['Imaginación profunda', 'Empatía natural', 'Sensibilidad artística'], advice: 'Aterriza tus ideas en un cuaderno o proyecto concreto para que no se queden solo en sueños.', emoji: '🌊' },
  { index: 1, slug: 'iq', name: "Iq'", yucatec: "Ik'", element: 'Aire', cardinal: 'Norte (Blanco)', animal: 'Colibrí', essence: 'Viento, aliento de vida, palabra y movimiento', desc: 'Simboliza el viento que limpia las nubes y lleva mensajes. Se asocia con la comunicación clara, la música y el pensamiento ágil.', strengths: ['Comunicación elocuente', 'Adaptabilidad', 'Curiosidad intelectual'], advice: 'Cuida el tono de tus palabras: el viento puede refrescar o desordenar.', emoji: '🌬️' },
  { index: 2, slug: 'aqabal', name: "Aq'ab'al", yucatec: "Ak'b'al", element: 'Fuego', cardinal: 'Oeste (Negro)', animal: 'Guacamaya / Murciélago', essence: 'Amanecer, dualidad luz-sombra y renovación', desc: 'Es el instante exacto en que la noche da paso al primer rayo del alba. Invita a superar miedos y descubrir oportunidades nuevas.', strengths: ['Resiliencia ante cambios', 'Claridad en momentos difíciles', 'Energía renovadora'], advice: 'No temas empezar de cero en una materia o meta; cada amanecer trae un nuevo intento.', emoji: '🌅' },
  { index: 3, slug: 'kat', name: "K'at", yucatec: "K'an", element: 'Tierra', cardinal: 'Sur (Amarillo)', animal: 'Araña / Lagartija', essence: 'Red, tejido comunitario, memoria y cosecha', desc: 'Representa la red de pesca y el tejido de la vida. Nos recuerda que todo aprendizaje se construye en red junto a familia, docentes y amigos.', strengths: ['Capacidad de conectar personas', 'Memoria organizativa', 'Trabajo en equipo'], advice: 'Suelta los enredos innecesarios y prioriza lo que realmente aporta a tu crecimiento.', emoji: '🕸️' },
  { index: 4, slug: 'kan', name: 'Kan', yucatec: 'Chikchan', element: 'Fuego', cardinal: 'Este (Rojo)', animal: 'Serpiente Emplumada', essence: 'Fuerza vital, sabiduría práctica y justicia', desc: 'Es la energía en movimiento que conecta la tierra con el cielo. Representa inteligencia despierta y verdad.', strengths: ['Liderazgo ético', 'Agudeza mental', 'Sentido de justicia'], advice: 'Canaliza tu energía intensa a través del deporte, la ciencia o el arte.', emoji: '🐍' },
  { index: 5, slug: 'kame', name: 'Kame', yucatec: 'Kimi', element: 'Tierra', cardinal: 'Norte (Blanco)', animal: 'Búho / Tecolote', essence: 'Transformación, cierre de ciclos y sabiduría ancestral', desc: 'Lejos de ser negativo, Kame enseña que cerrar etapas permite que nazca algo mejor, igual que una semilla se transforma en planta.', strengths: ['Calma bajo presión', 'Capacidad de transformación', 'Respeto por la historia'], advice: 'Aprende a soltar hábitos que ya no te ayudan para abrir espacio a nuevos aprendizajes.', emoji: '🦉' },
  { index: 6, slug: 'kej', name: 'Kej', yucatec: "Manik'", element: 'Tierra', cardinal: 'Oeste (Negro)', animal: 'Venado', essence: 'Armonía con la naturaleza, cuatro pilares y fortaleza', desc: 'El venado camina con elegancia y equilibrio sobre las montañas. Simboliza los cuatro puntos cardinales y el cuidado de los bosques.', strengths: ['Equilibrio emocional', 'Conciencia ecológica', 'Fuerza serena'], advice: 'Busca momentos al aire libre para recargar tu atención y reducir el estrés escolar.', emoji: '🦌' },
  { index: 7, slug: 'qanil', name: "Q'anil", yucatec: 'Lamat', element: 'Tierra', cardinal: 'Sur (Amarillo)', animal: 'Conejo', essence: 'Semilla, germinación, abundancia y talento', desc: 'Representa los cuatro colores del maíz sagrado y todo proyecto que siembras hoy para cosechar en el futuro.', strengths: ['Paciencia productiva', 'Creatividad fértil', 'Optimismo realista'], advice: 'Cada pequeño hábito de estudio diario es una semilla que dará fruto a fin de año.', emoji: '🌱' },
  { index: 8, slug: 'toj', name: 'Toj', yucatec: 'Muluk', element: 'Fuego', cardinal: 'Este (Rojo)', animal: 'Puma / Tiburón', essence: 'Gratitud, fuego sagrado, equilibrio y reciprocidad', desc: 'Es el día de agradecer por lo recibido y mantener el balance entre dar y recibir en la comunidad.', strengths: ['Generosidad', 'Gratitud consciente', 'Capacidad de reconciliación'], advice: 'Agradece a quienes te enseñan y devuelve con respeto el apoyo que recibes.', emoji: '🔥' },
  { index: 9, slug: 'tzi', name: "Tz'i'", yucatec: 'Ok', element: 'Tierra', cardinal: 'Norte (Blanco)', animal: 'Perro / Coyote', essence: 'Lealtad, ley natural, amistad y honestidad', desc: 'Guardián de la verdad y la fidelidad. Recuerda la importancia de ser un amigo confiable y actuar con integridad.', strengths: ['Lealtad genuina', 'Honestidad', 'Protección del grupo'], advice: 'Sé fiel a tus valores incluso cuando nadie te esté observando.', emoji: '🐺' },
  { index: 10, slug: 'batz', name: "B'atz'", yucatec: 'Chuwen', element: 'Aire', cardinal: 'Oeste (Negro)', animal: 'Mono aullador', essence: 'Hilo del tiempo, arte, tejido y comienzo del ciclo sagrado', desc: "En la tradición K'iche', B'atz' es el tejedor del tiempo y patrón de las artes. En este día se celebra el Wajxaqib' B'atz' (8 B'atz').", strengths: ['Talento artístico y musical', 'Planificación a largo plazo', 'Alegría creativa'], advice: 'Teje tus metas paso a paso: cada hilo cuenta para completar tu propio diseño.', emoji: '🐒' },
  { index: 11, slug: 'e', name: 'E', yucatec: "Eb'", element: 'Tierra', cardinal: 'Sur (Amarillo)', animal: 'Gato de monte', essence: 'Camino, destino, viajes y aprendizaje continuo', desc: 'Simboliza la vereda que recorremos en la vida y las escaleras del conocimiento. Ideal para iniciar estudios o proyectos.', strengths: ['Determinación', 'Espíritu explorador', 'Constancia en la ruta'], advice: 'Disfruta el recorrido de aprender, no solo la nota final.', emoji: '🧭' },
  { index: 12, slug: 'aj', name: 'Aj', yucatec: "B'en", element: 'Tierra', cardinal: 'Este (Rojo)', animal: 'Armadillo', essence: 'Caña tierna, hogar, rectitud y crecimiento vertical', desc: 'La caña de maíz que crece firme hacia el sol representa la estabilidad familiar, la autoridad justa y la renovación juvenil.', strengths: ['Firmeza de carácter', 'Amor por el hogar', 'Capacidad de mediación'], advice: 'Mantén tus raíces firmes en tu cultura mientras creces hacia nuevas metas.', emoji: '🎋' },
  { index: 13, slug: 'ix', name: "I'x", yucatec: 'Ix', element: 'Tierra', cardinal: 'Norte (Blanco)', animal: 'Jaguar', essence: 'Madre Tierra, energía femenina, valentía y misterio', desc: 'El jaguar es el guardián silencioso de la selva y las montañas. Representa la fuerza interior, la intuición y el respeto por la naturaleza.', strengths: ['Valentía serena', 'Observación aguda', 'Conexión con la tierra'], advice: 'Observa antes de actuar y confía en tu intuición bien informada.', emoji: '🐆' },
  { index: 14, slug: 'tzikin', name: "Tz'ikin", yucatec: 'Men', element: 'Aire', cardinal: 'Oeste (Negro)', animal: 'Águila / Quetzal', essence: 'Visión panorámica, libertad, sueños y prosperidad', desc: 'El ave sagrada que vuela alto puede ver todo el valle desde arriba. Invita a pensar en grande y mirar los problemas con perspectiva.', strengths: ['Visión estratégica', 'Independencia', 'Pensamiento elevado'], advice: 'Cuando te sientas abrumado, toma distancia como el águila para ver el panorama completo.', emoji: '🦅' },
  { index: 15, slug: 'ajmaq', name: 'Ajmaq', yucatec: "Kib'", element: 'Aire', cardinal: 'Sur (Amarillo)', animal: 'Abeja / Búho', essence: 'Perdón, aprendizaje de los errores y memoria de los abuelos', desc: 'Recuerda que equivocarse forma parte del aprendizaje humano. Como la abeja, transforma experiencias difíciles en miel de sabiduría.', strengths: ['Humildad para aprender', 'Capacidad de perdonar', 'Reflexión profunda'], advice: 'Un error en un examen o proyecto no te define; úsalo como mapa para mejorar.', emoji: '🐝' },
  { index: 16, slug: 'noj', name: "No'j", yucatec: "Kab'an", element: 'Aire', cardinal: 'Este (Rojo)', animal: 'Pájaro carpintero', essence: 'Sabiduría, inteligencia, ciencia y buen consejo', desc: 'El nawal de la mente lúcida y el conocimiento colectivo. En el altiplano se honra para pedir claridad en los estudios.', strengths: ['Pensamiento lógico y científico', 'Curiosidad académica', 'Buen juicio'], advice: 'Combina la inteligencia racional con la empatía hacia los demás.', emoji: '🧠' },
  { index: 17, slug: 'tijax', name: 'Tijax', yucatec: "Etz'nab'", element: 'Fuego', cardinal: 'Norte (Blanco)', animal: 'Tucán / Pez espada', essence: 'Obsidiana, verdad cortante, sanación y discernimiento', desc: 'La navaja de obsidiana corta lo falso para revelar la verdad y sanar heridas. Representa precisión y claridad ética.', strengths: ['Pensamiento crítico', 'Sinceridad directa', 'Precisión técnica'], advice: 'Usa la verdad para sanar y construir, nunca para herir gratuitamente.', emoji: '💎' },
  { index: 18, slug: 'kawoq', name: 'Kawoq', yucatec: 'Kawak', element: 'Agua', cardinal: 'Oeste (Negro)', animal: 'Tortuga', essence: 'Lluvia fértil, comunidad, familia y expansión', desc: 'La tormenta que riega los campos trae abundancia tras los truenos. Representa la fuerza colectiva y el cuidado comunitario.', strengths: ['Cooperación solidaria', 'Vitalidad', 'Protección comunitaria'], advice: 'Las dificultades pasajeras son como la lluvia: preparan el terreno para crecer.', emoji: '⛈️' },
  { index: 19, slug: 'ajpu', name: 'Ajpu', yucatec: 'Ajaw', element: 'Fuego', cardinal: 'Sur (Amarillo)', animal: 'Gavilán / Sol', essence: 'Luz solar, certeza, superación de pruebas y plenitud', desc: 'Inspirado en Junajpu del Popol Wuj, simboliza la luz que vence la oscuridad, la precisión y el brillo interior de cada persona.', strengths: ['Determinación luminosa', 'Autoestima saludable', 'Excelencia'], advice: 'Brilla con luz propia y anima a tus compañeros a descubrir su propio talento.', emoji: '☀️' }
];

export const CHOLQIJ_QUIZ: CholqijQuizItem[] = [
  { id: 'q1', question: "¿Cuántos días dura un ciclo completo del calendario sagrado maya Cholq'ij (Tzolk'in)?", options: ['365 días (como el año solar)', '260 días (13 energías × 20 nahuales)', '100 días exactos'], correct: 1, explanation: 'Al multiplicar 13 números de trecena por 20 nahuales (13 × 20), obtenemos exactamente 260 días únicos.' },
  { id: 'q2', question: "En la tradición K'iche', ¿qué nahual simboliza el hilo del tiempo, el arte y el comienzo del ciclo (Wajxaqib' B'atz')?", options: ["B'atz'", 'Tijax', 'Imox'], correct: 0, explanation: "B'atz' representa el hilo del tiempo, el tejido y las artes; cada 260 días se celebra el 8 B'atz'." },
  { id: 'q3', question: '¿Cómo se representa el número 13 en la numeración vigesimal maya?', options: ['Tres barras y ningún punto', 'Dos barras (5+5) y tres puntos (1+1+1)', 'Una barra y ocho puntos'], correct: 1, explanation: 'Cada barra vale 5 y cada punto vale 1. Por eso 2 barras (10) + 3 puntos (3) = 13.' },
  { id: 'q4', question: "¿Cuál es el nahual K'iche' asociado con la sabiduría, la ciencia y el buen consejo?", options: ["No'j", 'Kame', "Tz'i'"], correct: 0, explanation: "No'j representa la sabiduría, la inteligencia reflexiva y el pensamiento claro." },
  { id: 'q5', question: 'Si hoy es 1 Imox, ¿qué combinación seguirá al día siguiente cuando avancen ambos engranajes 1 diente?', options: ['2 Imox', "1 Iq'", "2 Iq'"], correct: 2, explanation: "Ambos engranajes avanzan simultáneamente un diente: la energía pasa a 2 y el nahual pasa a Iq' (2 Iq')." }
];

const HAAB_MONTHS = [
  'Pop', "Wo'", 'Sip', 'Sotz’', 'Sek', 'Xul', "Yaxk'in", 'Mol', "Ch'en",
  'Yax', 'Sak’', 'Keh', 'Mak', "K'ank'in", 'Muwan', 'Pax', "K'ayab'", "Kumk'u", "Wayeb'"
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function gregorianToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

export interface CholqijResult {
  energy: number;
  nawal: KicheNawal;
  cycleDay: number;
  longCount: [number, number, number, number, number];
  haabLabel: string;
}

export function calcCholqij(dateStr: string): CholqijResult {
  const parts = dateStr.split('-').map(Number);
  const y = parts[0] || 2026;
  const m = parts[1] || 11;
  const d = parts[2] || 24;
  const jdn = gregorianToJdn(y, m, d);
  const days = jdn - 584283; // Correlación GMT 584283

  const energy = mod(days + 3, 13) + 1;
  const nawalIdx = mod(days + 19, 20);
  const cycleDay = mod(days + 159, 260) + 1;

  const nn = Math.max(0, days);
  const b = Math.floor(nn / 144000);
  const r1 = nn % 144000;
  const k = Math.floor(r1 / 7200);
  const r2 = r1 % 7200;
  const t = Math.floor(r2 / 360);
  const r3 = r2 % 360;
  const w = Math.floor(r3 / 20);
  const kin = r3 % 20;

  // Haab' (365 días, 0 Pop = inicio)
  const haabDayOfYear = mod(days + 348, 365);
  const haabMonthIdx = Math.floor(haabDayOfYear / 20);
  const haabDay = haabDayOfYear % 20;
  const haabLabel = `${haabDay} ${HAAB_MONTHS[haabMonthIdx]}`;

  return {
    energy,
    nawal: KICHE_NAWALES[nawalIdx],
    cycleDay,
    longCount: [b, k, t, w, kin],
    haabLabel,
  };
}

export function shiftDate(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y || 2026, (m || 11) - 1, (d || 24) + delta));
  return dt.toISOString().slice(0, 10);
}

export function createGearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  teeth: number
): string {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.32;
    const a3 = a0 + step * 0.68;
    const a4 = a0 + step * 0.78;
    const p = (r: number, a: number) =>
      `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    d +=
      (i === 0 ? 'M ' : 'L ') +
      p(innerR, a0) +
      ' L ' +
      p(innerR, a1) +
      ' L ' +
      p(outerR, a2) +
      ' L ' +
      p(outerR, a3) +
      ' L ' +
      p(innerR, a4) +
      ' ';
  }
  return `${d}Z`;
}
