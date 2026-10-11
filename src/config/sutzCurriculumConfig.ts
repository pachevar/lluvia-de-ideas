// src/config/sutzCurriculumConfig.ts
// Catálogo curricular maestro y sistema de codificación de contenidos, módulos, retos y proyectos en SUTZ.
// Estándar SUTZ-CODE: [PILAR]-[MÓDULO]-[TIPO][CORRELATIVO]

export type SutzPillarId = '100tek' | 'creatika' | 'sutz' | 'lab' | 'mercado' | 'tienda';

export type SutzDifficulty = 'iniciado' | 'navegante' | 'guardian' | 'maestro';

export type SutzContentType = 'contenido' | 'simulador' | 'laboratorio' | 'codice' | 'taller' | 'juego';

export interface SutzChallengeReward {
  puntosXp: number;
  gemas: number;
  pergaminos: number;
  monedas: number;
}

export interface SutzChallenge {
  code: string;               // Ej: 'TEK-ATLAS-R01'
  moduleCode: string;         // Ej: 'TEK-ATLAS-C01'
  title: string;
  description: string;
  difficulty: SutzDifficulty;
  targetRoute: string;
  defaultMaxScore: number;    // Punteo escolar estándar (ej: 20 pts)
  rewards: SutzChallengeReward;
}

export interface SutzProject {
  code: string;               // Ej: 'TEK-ATLAS-P01'
  moduleCode: string;         // Ej: 'TEK-ATLAS-C01'
  title: string;
  description: string;
  deliverableType: 'galeria_imagen' | 'cuento_texto' | 'video_demostracion' | 'rubrica_docente';
  targetRoute: string;
  defaultMaxScore: number;
  rewards: SutzChallengeReward;
}

export interface SutzModuleContent {
  code: string;               // Código oficial de contenido, ej: 'TEK-ATLAS-C01'
  pillarId: SutzPillarId;
  pillarName: string;
  title: string;
  icon: string;
  type: SutzContentType;
  route: string;
  hexCoord?: { row: number; col: number }; // Coordenada en mapa por defecto
  summary: string;
  pedagogicalCompetency: string;
  challenges: SutzChallenge[];
  projects: SutzProject[];
}

/**
 * Catálogo Maestro Oficial de Contenidos SUTZ
 */
export const SUTZ_CURRICULUM_MODULES: SutzModuleContent[] = [
  // =========================================================================
  // ⚡ 100TEK (Ciencia, Lógica, Anatomía & Salud)
  // =========================================================================
  {
    code: 'TEK-ATLAS-C01',
    pillarId: '100tek',
    pillarName: '100tek',
    title: 'Cuerpo Humano Virtual 3D',
    icon: '🫀',
    type: 'simulador',
    route: '/atlas',
    summary: 'Atlas anatómico interactivo en 3D en tiempo real con más de 3,400 piezas modeladas, disección, capas y sistemas orgánicos.',
    pedagogicalCompetency: 'Comprensión tridimensional de la anatomía humana, fisiología de los órganos y correlación de sistemas biológicos.',
    challenges: [
      {
        code: 'TEK-ATLAS-R01',
        moduleCode: 'TEK-ATLAS-C01',
        title: 'Exploración del Sistema Esquelético',
        description: 'Aislar el esqueleto axial e identificar las 5 regiones vertebrales (cervical, torácica, lumbar, sacro y cóccix).',
        difficulty: 'iniciado',
        targetRoute: '/atlas',
        defaultMaxScore: 20,
        rewards: { puntosXp: 200, gemas: 5, pergaminos: 1, monedas: 50 }
      },
      {
        code: 'TEK-ATLAS-R02',
        moduleCode: 'TEK-ATLAS-C01',
        title: 'Circulación y Cavidades Cardíacas',
        description: 'Ubicar el corazón y diferenciar la anatomía de las arterias principales de las venas cavas y pulmonares.',
        difficulty: 'navegante',
        targetRoute: '/atlas',
        defaultMaxScore: 20,
        rewards: { puntosXp: 250, gemas: 6, pergaminos: 1, monedas: 60 }
      }
    ],
    projects: [
      {
        code: 'TEK-ATLAS-P01',
        moduleCode: 'TEK-ATLAS-C01',
        title: 'Lámina Anatómica Clínica Digital',
        description: 'Elaborar un informe ilustrado con capturas del visor analizando una patología funcional de un órgano a elección.',
        deliverableType: 'galeria_imagen',
        targetRoute: '/atlas',
        defaultMaxScore: 25,
        rewards: { puntosXp: 350, gemas: 10, pergaminos: 2, monedas: 100 }
      }
    ]
  },
  {
    code: 'TEK-SOLAR-C01',
    pillarId: '100tek',
    pillarName: '100tek',
    title: 'Sistema Solar 3D',
    icon: '🪐',
    type: 'simulador',
    route: '/100tek/sistema-solar',
    hexCoord: { row: 0, col: 2 },
    summary: 'Simulación gravitacional y cinemática en Three.js con planetas del sistema solar, lunas y órbitas relativas.',
    pedagogicalCompetency: 'Astronomía básica, leyes del movimiento planetario y proporciones del espacio.',
    challenges: [
      {
        code: 'TEK-SOLAR-R01',
        moduleCode: 'TEK-SOLAR-C01',
        title: 'Navegación de Planetas Rocosos',
        description: 'Calcular el período orbital de Mercurio, Venus, Tierra y Marte comparado con los gigantes gaseosos.',
        difficulty: 'iniciado',
        targetRoute: '/100tek/sistema-solar',
        defaultMaxScore: 20,
        rewards: { puntosXp: 200, gemas: 5, pergaminos: 1, monedas: 50 }
      }
    ],
    projects: [
      {
        code: 'TEK-SOLAR-P01',
        moduleCode: 'TEK-SOLAR-C01',
        title: 'Misión de Exploración Interplanetaria',
        description: 'Trazar una ruta de vuelo orbital con asistencia gravitacional entre Júpiter y Saturno.',
        deliverableType: 'galeria_imagen',
        targetRoute: '/100tek/sistema-solar',
        defaultMaxScore: 25,
        rewards: { puntosXp: 300, gemas: 8, pergaminos: 2, monedas: 90 }
      }
    ]
  },
  {
    code: 'TEK-SECUENCIAS-C01',
    pillarId: '100tek',
    pillarName: '100tek',
    title: 'Secuencias Numéricas',
    icon: '🔢',
    type: 'juego',
    route: '/100tek/secuencias-numericas',
    hexCoord: { row: 1, col: 1 },
    summary: 'Entorno de desafíos progresivos de series aritméticas, geométricas, Fibonacci y patrones algebraicos.',
    pedagogicalCompetency: 'Pensamiento lógico abstracto, reconocimiento de patrones y formulación de reglas matemáticas.',
    challenges: [
      {
        code: 'TEK-SECUENCIAS-R01',
        moduleCode: 'TEK-SECUENCIAS-C01',
        title: 'Desafío de Patrones Aritméticos',
        description: 'Resolver 10 patrones numéricos consecutivos en el menor tiempo posible.',
        difficulty: 'iniciado',
        targetRoute: '/100tek/secuencias-numericas',
        defaultMaxScore: 20,
        rewards: { puntosXp: 180, gemas: 4, pergaminos: 1, monedas: 45 }
      }
    ],
    projects: []
  },
  {
    code: 'TEK-MINECRAFT-C01',
    pillarId: '100tek',
    pillarName: '100tek',
    title: 'Servidor Minecraft Educativo',
    icon: '⚔️',
    type: 'laboratorio',
    route: 'https://mc.lluviadeideaseditorial.com/',
    hexCoord: { row: 0, col: 1 },
    summary: 'Mundo cooperativo multijugador en Minecraft enfocado en arquitectura bioclimática y desafíos matemáticos espaciales.',
    pedagogicalCompetency: 'Trabajo colaborativo, resolución espacial en 3D y pensamiento de diseño estructural.',
    challenges: [],
    projects: []
  },

  // =========================================================================
  // ✨ CREATIKA (Artes, Literatura, Narrativa & Creatividad)
  // =========================================================================
  {
    code: 'CRK-STORY-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Máquina de Cuentos',
    icon: '🎰',
    type: 'taller',
    route: '/creatika/maquina-de-cuentos',
    hexCoord: { row: -1, col: -1 },
    summary: 'Ruleta generativa interactiva para estructurar historias espontáneas con personajes, escenarios y detonantes.',
    pedagogicalCompetency: 'Fluidez y cohesión narrativa, estructura en 3 actos y desbloqueo de la hoja en blanco.',
    challenges: [
      {
        code: 'CRK-STORY-R01',
        moduleCode: 'CRK-STORY-C01',
        title: 'Micro-relato con Cuatro Elementos',
        description: 'Escribir un microrrelato integrando armónicamente los 4 detonantes arrojados por la ruleta.',
        difficulty: 'iniciado',
        targetRoute: '/creatika/maquina-de-cuentos',
        defaultMaxScore: 20,
        rewards: { puntosXp: 200, gemas: 5, pergaminos: 1, monedas: 50 }
      }
    ],
    projects: [
      {
        code: 'CRK-STORY-P01',
        moduleCode: 'CRK-STORY-C01',
        title: 'Cuento Ilustrado Completo',
        description: 'Redactar un cuento extendido con inicio, nudo y desenlace y publicarlo en la Gran Galería.',
        deliverableType: 'cuento_texto',
        targetRoute: '/creatika/maquina-de-cuentos',
        defaultMaxScore: 30,
        rewards: { puntosXp: 400, gemas: 12, pergaminos: 3, monedas: 120 }
      }
    ]
  },
  {
    code: 'CRK-COLOR-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Teoría del Color',
    icon: '🎨',
    type: 'laboratorio',
    route: '/creatika/teoria-del-color',
    hexCoord: { row: 1, col: -1 },
    summary: 'Mezclador cromático interactivo con ruedas de armonía, saturación, complementarios y psicología del color.',
    pedagogicalCompetency: 'Educación visual, armonías cromáticas y aplicación estética en artes visuales y diseño.',
    challenges: [
      {
        code: 'CRK-COLOR-R01',
        moduleCode: 'CRK-COLOR-C01',
        title: 'Búsqueda de Armonías Complementarias',
        description: 'Construir una paleta armónica utilizando la tríada de contrastes complementarios exactos.',
        difficulty: 'iniciado',
        targetRoute: '/creatika/teoria-del-color',
        defaultMaxScore: 20,
        rewards: { puntosXp: 180, gemas: 4, pergaminos: 1, monedas: 45 }
      }
    ],
    projects: []
  },
  {
    code: 'CRK-PERSONAJE-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Construyendo el Personaje',
    icon: '🎭',
    type: 'taller',
    route: '/creatika/construyendo-el-personaje',
    summary: 'Taller guiado para concebir arquetipos literarios, psicología de personajes, defectos y motivaciones profundas.',
    pedagogicalCompetency: 'Empatía narrativa, caracterización psicológica y creación de protagonistas dimensionales.',
    challenges: [
      {
        code: 'CRK-PERSONAJE-R01',
        moduleCode: 'CRK-PERSONAJE-C01',
        title: 'Diseño del Dilema Moral',
        description: 'Definir el objetivo, el obstáculo interno y la necesidad emocional de un protagonista.',
        difficulty: 'iniciado',
        targetRoute: '/creatika/construyendo-el-personaje',
        defaultMaxScore: 20,
        rewards: { puntosXp: 220, gemas: 5, pergaminos: 1, monedas: 55 }
      }
    ],
    projects: []
  },
  {
    code: 'CRK-GALERIA-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Gran Galería y Pergamino del Escriba',
    icon: '🏛️',
    type: 'contenido',
    route: '/gran-galeria',
    hexCoord: { row: 0, col: -2 },
    summary: 'Espacio de exposición colectiva donde los estudiantes exhiben sus obras, cómics, cuentos y videos escolares.',
    pedagogicalCompetency: 'Apreciación crítica, retroalimentación entre pares y socialización del trabajo académico.',
    challenges: [],
    projects: []
  },
  {
    code: 'CRK-DOCENTE-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Código Docente',
    icon: '📜',
    type: 'contenido',
    route: '/codigo-docente',
    summary: 'Banco de metodologías pedagógicas activas, instrumentos de evaluación y rúbricas formativas para maestros.',
    pedagogicalCompetency: 'Actualización docente, diseño curricular lúdico y evaluación cualitativa formativa.',
    challenges: [],
    projects: []
  },
  {
    code: 'CRK-ESTUDIANTE-C01',
    pillarId: 'creatika',
    pillarName: 'Creatika',
    title: 'Código Estudiante',
    icon: '🎓',
    type: 'contenido',
    route: '/codigo-estudiante',
    summary: 'Bitácora de misiones, pasaporte estudiantil y seguimiento de insignias alcanzadas.',
    pedagogicalCompetency: 'Autonomía en el aprendizaje, autogestión de metas y metacognición.',
    challenges: [],
    projects: []
  },

  // =========================================================================
  // ☁️ SUTZ (Mundo Virtual, Popol Vuh & Neurociencia)
  // =========================================================================
  {
    code: 'STZ-MAPA-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Mundo Virtual Sutz',
    icon: '🗺️',
    type: 'simulador',
    route: '/sutz',
    hexCoord: { row: 0, col: 0 },
    summary: 'Lienzo cartográfico hexagonal para la exploración del universo educativo con niebla procedural.',
    pedagogicalCompetency: 'Orientación espacial, exploración por curiosidad y gamificación del conocimiento.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-JURACAN-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Universo de Juracán',
    icon: '🌪️',
    type: 'simulador',
    route: '/universo-de-juracan',
    hexCoord: { row: -1, col: 1 },
    summary: 'Mapa estelar interactivo con mitos, constelaciones mesoamericanas y las fuerzas primordiales.',
    pedagogicalCompetency: 'Cosmovisión maya, mitología comparada y astronomía ancestral.',
    challenges: [
      {
        code: 'STZ-JURACAN-R01',
        moduleCode: 'STZ-JURACAN-C01',
        title: 'Trazo de Constelaciones Mesoamericanas',
        description: 'Localizar las 3 constelaciones cardinales del mito y activar sus estrellas principales.',
        difficulty: 'navegante',
        targetRoute: '/universo-de-juracan',
        defaultMaxScore: 20,
        rewards: { puntosXp: 220, gemas: 6, pergaminos: 1, monedas: 55 }
      }
    ],
    projects: []
  },
  {
    code: 'STZ-CAMAZOTZ-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Popol Vuh: Camazotz (Señor de Xibalbá)',
    icon: '🦇',
    type: 'codice',
    route: '/sutz?modal=camazotz',
    hexCoord: { row: 2, col: -1 },
    summary: 'Códice interactivo del murciélago de la muerte en la Casa de los Murciélagos de Xibalbá.',
    pedagogicalCompetency: 'Comprensión lectora, simbolismo de la noche y el desafío de los gemelos héroes.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-IXKIK-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Popol Vuh: Ixkik (Luna de Sangre)',
    icon: '🌸',
    type: 'codice',
    route: '/sutz?modal=ixkik',
    hexCoord: { row: 2, col: 0 },
    summary: 'Códice interactivo de la audacia femenina, el árbol de morro y la superación del inframundo.',
    pedagogicalCompetency: 'Pensamiento reflexivo, resiliencia y el origen de los gemelos míticos.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-IXMUKANE-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Popol Vuh: Ixmukané (Abuela del Maíz)',
    icon: '🌾',
    type: 'codice',
    route: '/sutz?modal=ixmukanne',
    hexCoord: { row: -2, col: 0 },
    summary: 'Códice de la adivina primordial y la molienda de los nueve granos de maíz para crear la humanidad.',
    pedagogicalCompetency: 'Identidad cultural, sabiduría ancestral y respeto por los ciclos agrícolas.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-QUQUMATZ-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Popol Vuh: Q\'uq\'umatz (Serpiente Emplumada)',
    icon: '🐍',
    type: 'codice',
    route: '/sutz?modal=ququmatz',
    hexCoord: { row: -1, col: 2 },
    summary: 'Códice del soberano de la sabiduría, las plumas quetzal y la creación del cielo y la tierra.',
    pedagogicalCompetency: 'Filosofía maya, ecología espiritual y metáforas del viento y el agua.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-JURACANMITO-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Popol Vuh: Juracán (Corazón del Cielo)',
    icon: '⛈️',
    type: 'codice',
    route: '/sutz?modal=juracan',
    hexCoord: { row: -2, col: 1 },
    summary: 'Códice del dios primordial del trueno, el relámpago y el diluvio cosmogónico.',
    pedagogicalCompetency: 'Análisis textual de mitos fundacionales y evolución del lenguaje.',
    challenges: [],
    projects: []
  },
  {
    code: 'STZ-NEURO-C01',
    pillarId: 'sutz',
    pillarName: 'Sutz',
    title: 'Neurociencia Educativa',
    icon: '🧠',
    type: 'contenido',
    route: '/neurociencia',
    summary: 'Guía de ergonomía cognitiva, neuroaprendizaje, ondas alfa y diseño instruccional.',
    pedagogicalCompetency: 'Fundamentos científicos del aprendizaje humano y reducción de fatiga cognitiva.',
    challenges: [],
    projects: []
  },

  // =========================================================================
  // 🧪 LAB (Laboratorios Pedagógicos & Prácticas)
  // =========================================================================
  {
    code: 'LAB-HOME-C01',
    pillarId: 'lab',
    pillarName: 'LAB',
    title: 'Laboratorios Pedagógicos Formativos',
    icon: '🧪',
    type: 'laboratorio',
    route: '/laboratorios',
    hexCoord: { row: 0, col: -1 },
    summary: 'Centro de formación integral para docentes y estudiantes con 10 módulos metodológicos en artes, narrativa, ciencia y gamificación.',
    pedagogicalCompetency: 'Metodologías activas de aula, diseño de experiencias pedagógicas e innovación educativa.',
    challenges: [],
    projects: []
  },
  {
    code: 'LAB-ANIMACION-C01',
    pillarId: 'lab',
    pillarName: 'LAB',
    title: 'LAB Animación Educativa',
    icon: '🎬',
    type: 'laboratorio',
    route: '/animacion-educativa',
    summary: 'Taller de producción audiovisual escolar, stop-motion y narrativas transmedia.',
    pedagogicalCompetency: 'Alfabetización audiovisual y edición técnica creativa.',
    challenges: [],
    projects: []
  },
  {
    code: 'LAB-ROBOTICA-C01',
    pillarId: 'lab',
    pillarName: 'LAB',
    title: 'LAB Robótica Educativa',
    icon: '🤖',
    type: 'laboratorio',
    route: '/robotica-educativa',
    summary: 'Laboratorio de electrónica básica, sensores, actuadores y robótica con materiales accesibles.',
    pedagogicalCompetency: 'Pensamiento computacional, lógica de circuitos y metodología STEAM.',
    challenges: [],
    projects: []
  },
  {
    code: 'LAB-CIENTIFICO-C01',
    pillarId: 'lab',
    pillarName: 'LAB',
    title: 'LAB Pensamiento Científico',
    icon: '💡',
    type: 'laboratorio',
    route: '/pensamiento-cientifico',
    summary: 'Guía de formulación de hipótesis, experimentación rigurosa y divulgación científica.',
    pedagogicalCompetency: 'Método científico empírico, análisis crítico de datos y pensamiento escéptico.',
    challenges: [],
    projects: []
  },

  // =========================================================================
  // 🛍️ MERCADO & 📚 TIENDA (Lúdica, Economía & Catálogo)
  // =========================================================================
  {
    code: 'MKT-BINGO-C01',
    pillarId: 'mercado',
    pillarName: 'Mercado',
    title: 'Bingotenango',
    icon: '🎲',
    type: 'juego',
    route: '/juegos/bingo',
    hexCoord: { row: -1, col: 0 },
    summary: 'Plataforma multijugador interactiva de bingo tradicional guatemalteco con bolillero y cartones en línea.',
    pedagogicalCompetency: 'Atención focalizada, agilidad auditiva y convivencia lúdica comunitaria.',
    challenges: [],
    projects: []
  },
  {
    code: 'TND-LIBROS-C01',
    pillarId: 'tienda',
    pillarName: 'Tienda',
    title: 'Catálogo de Libros y Cuentos',
    icon: '📚',
    type: 'contenido',
    route: '/libros',
    hexCoord: { row: 1, col: 0 },
    summary: 'Tienda editorial interactiva de obras impresas, cuentos ilustrados y publicaciones educativas.',
    pedagogicalCompetency: 'Fomento a la lectura, apreciación estética de libros y literatura infantil y juvenil.',
    challenges: [],
    projects: []
  }
];

// =========================================================================
// FUNCIONES AUXILIARES DE BÚSQUEDA Y EVALUACIÓN
// =========================================================================

/**
 * Busca un módulo por su código oficial (ej: 'TEK-ATLAS-C01')
 */
export function getModuleByCode(code: string): SutzModuleContent | undefined {
  return SUTZ_CURRICULUM_MODULES.find(m => m.code.toUpperCase() === code.toUpperCase());
}

/**
 * Busca un módulo por su ruta relativa (ej: '/atlas' o '/100tek/sistema-solar')
 */
export function getModuleByRoute(route: string): SutzModuleContent | undefined {
  const cleanRoute = route.split('?')[0].replace(/\/+$/, '');
  return SUTZ_CURRICULUM_MODULES.find(m => {
    const modRoute = m.route.split('?')[0].replace(/\/+$/, '');
    return modRoute === cleanRoute;
  });
}

/**
 * Retorna todos los retos asociados a un código de módulo
 */
export function getChallengesByModuleCode(moduleCode: string): SutzChallenge[] {
  const mod = getModuleByCode(moduleCode);
  return mod?.challenges || [];
}

/**
 * Calcula las recompensas de gamificación obtenidas según el porcentaje de logro
 */
export function calculateRewards(challenge: SutzChallenge, percentage: number): SutzChallengeReward {
  const factor = Math.max(0, Math.min(100, percentage)) / 100;
  return {
    puntosXp: Math.round(challenge.rewards.puntosXp * factor),
    gemas: percentage >= 80 ? challenge.rewards.gemas : Math.floor(challenge.rewards.gemas * factor),
    pergaminos: percentage >= 95 ? challenge.rewards.pergaminos : 0,
    monedas: Math.round(challenge.rewards.monedas * factor)
  };
}

/**
 * Traduce el resultado hacia la escala de AcademiaQR
 */
export function formatScoreForAcademiaQr(params: {
  challenge: SutzChallenge;
  percentage: number;
  customMaxScore?: number;
}) {
  const maxScore = params.customMaxScore || params.challenge.defaultMaxScore || 20;
  const score = Math.round((Math.max(0, Math.min(100, params.percentage)) / 100) * maxScore);
  return {
    score,
    maxScore,
    percentage: Math.round(params.percentage),
    isApproved: score >= (maxScore * 0.6)
  };
}

import { BUILTIN_PILLAR_ROUTES } from './pillarProjectsConfig';

// =========================================================================
// CORRELACIÓN CURRICULAR CON EL MAPA VIRTUAL DE SUTZ
// =========================================================================

export interface SutzAssignedHex {
  id: string;
  row: number;
  col: number;
  title: string;
}

export interface SutzModuleMapStatus {
  module: SutzModuleContent;
  isActive: boolean;
  assignedHexes: SutzAssignedHex[];
}

export interface SutzCurriculumCoverageSummary {
  totalModules: number;
  activeCount: number;
  inactiveCount: number;
  activePercentage: number;
  items: SutzModuleMapStatus[];
}

/**
 * Verifica si un hexágono corresponde a un módulo curricular específico
 */
export function matchHexagonToModule(
  hex: { code?: string; action?: { type?: string; target?: string } },
  module: SutzModuleContent
): boolean {
  if (!hex) return false;

  // 1. Coincidencia directa por código oficial
  if (hex.code && hex.code.trim().toUpperCase() === module.code.trim().toUpperCase()) {
    return true;
  }

  const target = hex.action?.target?.trim();
  if (!target) return false;

  // 2. Coincidencia por ruta del módulo
  const cleanTarget = target.split('?')[0].replace(/\/+$/, '').toLowerCase();
  const cleanModuleRoute = module.route.split('?')[0].replace(/\/+$/, '').toLowerCase();
  if (cleanTarget && cleanModuleRoute && cleanTarget === cleanModuleRoute) {
    return true;
  }

  // 3. Coincidencia de modales de Popol Vuh (ej: /sutz?story=camazotz vs 'camazotz')
  if (module.route.includes('=')) {
    const storyKey = module.route.split('=')[1]?.toLowerCase();
    if (storyKey && (cleanTarget === storyKey || cleanTarget === `story-${storyKey}`)) {
      return true;
    }
  }

  // 4. Coincidencia mediante catálogo de rutas builtin
  const routeMatch = BUILTIN_PILLAR_ROUTES.find(r => r.code === module.code);
  if (routeMatch && routeMatch.target.toLowerCase() === target.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Obtiene el módulo curricular correspondiente a un hexágono
 */
export function getCurriculumModuleForHex(
  hex: { code?: string; action?: { type?: string; target?: string } }
): SutzModuleContent | undefined {
  if (!hex) return undefined;
  if (hex.code) {
    const mod = getModuleByCode(hex.code);
    if (mod) return mod;
  }
  return SUTZ_CURRICULUM_MODULES.find(m => matchHexagonToModule(hex, m));
}

/**
 * Calcula la cobertura de contenidos curriculares en el mapa virtual actual
 */
export function getCurriculumCoverageSummary(
  mapHexagons: Array<{ id?: string; row: number; col: number; title?: string; code?: string; action?: { type?: string; target?: string } }>
): SutzCurriculumCoverageSummary {
  const items: SutzModuleMapStatus[] = SUTZ_CURRICULUM_MODULES.map(module => {
    const assignedHexes: SutzAssignedHex[] = (mapHexagons || [])
      .filter(h => matchHexagonToModule(h, module))
      .map(h => ({
        id: h.id || `${h.row},${h.col}`,
        row: h.row,
        col: h.col,
        title: h.title || module.title
      }));

    return {
      module,
      isActive: assignedHexes.length > 0,
      assignedHexes
    };
  });

  const activeCount = items.filter(it => it.isActive).length;
  const totalModules = items.length;
  const inactiveCount = totalModules - activeCount;
  const activePercentage = totalModules > 0 ? Math.round((activeCount / totalModules) * 100) : 0;

  return {
    totalModules,
    activeCount,
    inactiveCount,
    activePercentage,
    items
  };
}

