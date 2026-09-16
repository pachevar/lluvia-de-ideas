export type AdminTabType = 
  | 'inicio' 
  | 'videos'
  | 'neurociencia'
  | 'libros'
  | 'mapa'
  | 'techtree'
  | 'creatika' 
  | '100tek' 
  | 'sistema_solar'
  | 'laboratorios'
  | 'bingo' 
  | 'tienda' 
  | 'viaje_del_heroe'
  | 'inscripciones' 
  | 'cotizador' 
  | 'colors'
  | 'pozo_ideas'
  | 'ajustes';

// =========================================================================
// 🌟 ARQUITECTURA DE CLASIFICACIÓN DEL ECOSISTEMA SUTZ Y SUS PILARES
// =========================================================================

export type EducationalPillar = 'creatika' | '100tek' | 'lab' | 'mercado' | 'pozo_ideas' | 'sutz' | 'laboratorio';
export type ToolPillarCategory = EducationalPillar | 'soporte';

export interface PillarDefinition {
  id: EducationalPillar;
  title: string;
  tagline: string;
  focusArea: string;
  description: string;
  icon: string;
  targetTab: AdminTabType;
  color: string;
  secondaryColor: string;
  badge: string;
  publicHubRoute: string;
}

export interface AdminNavItem {
  id: AdminTabType;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
  pillar: ToolPillarCategory;
  badge?: string;
  publicRoute?: string;
  roleDescription?: string;
}

export interface AdminCategory {
  id: string;
  title: string;
  icon: string;
  projectPillar?: EducationalPillar;
  badge?: string;
  badgeColor?: string;
  items: AdminNavItem[];
}

// 🏛️ REGISTRO CENTRAL DE PILARES Y CATEGORÍAS DEL ECOSISTEMA SUTZ
export const PILLAR_REGISTRY: Record<EducationalPillar, PillarDefinition> = {
  sutz: {
    id: 'sutz',
    title: 'Sutz',
    tagline: 'El Gran Ecosistema que Aglutina Todo el Mundo Educativo',
    focusArea: 'Mundo Virtual Maya K\'iche\' & Conexión Universal',
    description: 'Ecosistema central que articula Creatika, 100tek, LAB, Mercado y Pozo de Ideas mediante el mapa hexagonal y árbol tecnológico.',
    icon: '☁️',
    targetTab: 'mapa',
    color: '#10b981',
    secondaryColor: '#34d399',
    badge: 'Ecosistema Global',
    publicHubRoute: '/sutz'
  },
  creatika: {
    id: 'creatika',
    title: 'Creatika',
    tagline: 'Artes y Humanidades',
    focusArea: 'Artes, Narrativa, Diseño & Creación Literaria',
    description: 'Máquina de Cuentos, Teoría del Color, Creación de Personajes, Literatura Infantil y Códigos Didácticos.',
    icon: '✨',
    targetTab: 'creatika',
    color: '#ec4899',
    secondaryColor: '#c084fc',
    badge: 'Artes & Humanidades',
    publicHubRoute: '/creatika'
  },
  '100tek': {
    id: '100tek',
    title: '100tek',
    tagline: 'Ciencia, Lógica y Tecnología',
    focusArea: 'Ciencia, Lógica, Matemáticas & STEM',
    description: 'Secuencias numéricas, simulación astronómica 3D, desafíos de agilidad mental y retos científicos.',
    icon: '⚡',
    targetTab: '100tek',
    color: '#f59e0b',
    secondaryColor: '#fbbf24',
    badge: 'Ciencia, Lógica & STEM',
    publicHubRoute: '/100tek/secuencias-numericas'
  },
  lab: {
    id: 'lab',
    title: 'LAB',
    tagline: 'Prácticas, Talleres y Guías',
    focusArea: 'Talleres Prácticos, Animación & Ejercicios',
    description: 'Módulos formativos estructurados por grado, guías prácticas para ejercicios, talleres y tareas escolares.',
    icon: '🧪',
    targetTab: 'laboratorios',
    color: '#0ea5e9',
    secondaryColor: '#38bdf8',
    badge: 'Prácticas & Talleres',
    publicHubRoute: '/laboratorios'
  },
  laboratorio: {
    id: 'laboratorio',
    title: 'LAB',
    tagline: 'Prácticas, Talleres y Guías',
    focusArea: 'Talleres Prácticos, Animación & Ejercicios',
    description: 'Módulos formativos estructurados por grado, guías prácticas para ejercicios, talleres y tareas escolares.',
    icon: '🧪',
    targetTab: 'laboratorios',
    color: '#0ea5e9',
    secondaryColor: '#38bdf8',
    badge: 'Prácticas & Talleres',
    publicHubRoute: '/laboratorios'
  },
  mercado: {
    id: 'mercado',
    title: 'Mercado',
    tagline: 'Tienda en Línea y Servicios',
    focusArea: 'Catálogo de Cuentos, Boletos y Cotizaciones',
    description: 'Tienda oficial en línea: catálogo de cuentos infantiles, taquilla digital de boletos y cotizador web.',
    icon: '🛍️',
    targetTab: 'tienda',
    color: '#14b8a6',
    secondaryColor: '#2dd4bf',
    badge: 'Tienda en Línea',
    publicHubRoute: '/tienda'
  },
  pozo_ideas: {
    id: 'pozo_ideas',
    title: 'Pozo de Ideas',
    tagline: 'Banco de Proyectos e Innovación',
    focusArea: 'Incubadora de Ideas, Propuestas Pedagógicas & Futuras Funciones',
    description: 'Espacio de ideación para registrar, incubar y priorizar proyectos futuros para Creatika, 100tek, LAB y Sutz.',
    icon: '💡',
    targetTab: 'pozo_ideas',
    color: '#8b5cf6',
    secondaryColor: '#a78bfa',
    badge: 'Incubadora & Proyectos',
    publicHubRoute: '/sutz'
  }
};

export const PROJECT_PILLARS: PillarDefinition[] = [
  PILLAR_REGISTRY.sutz,
  PILLAR_REGISTRY.creatika,
  PILLAR_REGISTRY['100tek'],
  PILLAR_REGISTRY.lab,
  PILLAR_REGISTRY.mercado,
  PILLAR_REGISTRY.pozo_ideas
];

// =========================================================================
// ☁️ CATEGORÍAS DEL ECOSISTEMA SUTZ EN EL PANEL DE GERENCIA
// =========================================================================
export const PILLAR_NAV_CATEGORIES: AdminCategory[] = [
  // 1. ☁️ SUTZ NÚCLEO: Mapa y Árbol Tecnológico
  {
    id: 'cat_sutz',
    title: '☁️ Sutz (Ecosistema Central)',
    icon: '☁️',
    projectPillar: 'sutz',
    badge: 'MAPA & NÚCLEO',
    badgeColor: '#10b981',
    items: [
      {
        id: 'mapa',
        label: '🗺️ Editor del Mapa Hexagonal',
        icon: '🗺️',
        description: 'Editor del mapa virtual Maya K\'iche\', conexión de pueblos y reinos con herramientas de todos los pilares',
        keywords: ['sutz', 'editor', 'mundo virtual', 'mapa', 'hexágonos', 'juracan', 'historias', 'kiche', 'reinos'],
        pillar: 'sutz',
        publicRoute: '/sutz',
        roleDescription: 'Mapa virtual que centraliza y conecta todas las rutas a ejercicios y pilares'
      },
      {
        id: 'techtree',
        label: '🌳 Árbol Tecnológico & Habilidades',
        icon: '🌳',
        description: 'Nodos pedagógicos, habilidades por reino y progresión didáctica que articula los proyectos',
        keywords: ['sutz', 'nube', 'mundo virtual', 'arbol tecnologico', 'techtree', 'habilidades', 'kiche', 'competencias'],
        pillar: 'sutz',
        publicRoute: '/sutz',
        roleDescription: 'Rutas pedagógicas y árbol de progreso del estudiante'
      }
    ]
  },

  // 2. ✨ CREATIKA: Artes y Humanidades
  {
    id: 'cat_creatika',
    title: '✨ Creatika (Artes y Humanidades)',
    icon: '✨',
    projectPillar: 'creatika',
    badge: 'ARTES & HUMANIDADES',
    badgeColor: '#ec4899',
    items: [
      {
        id: 'creatika',
        label: '✨ Suite Creatika',
        icon: '✨',
        description: 'Máquina de Cuentos, Teoría del Color, Códigos Docente y Estudiante',
        keywords: ['creatika', 'cuentos', 'color', 'docente', 'estudiante', 'arte', 'escritura', 'maquina de cuentos'],
        pillar: 'creatika',
        publicRoute: '/creatika',
        roleDescription: 'Centro creativo de creación literaria, color y humanidades'
      },
      {
        id: 'viaje_del_heroe',
        label: '🦸 El Viaje del Héroe',
        icon: '🦸',
        description: 'Construyendo Personaje, arquetipos, galería oficial de ilustraciones y guion narrativo',
        keywords: ['viaje del heroe', 'personajes', 'arquetipos', 'construyendo personaje', 'imagenes', 'narrativa', 'guion'],
        pillar: 'creatika',
        publicRoute: '/creatika/construyendo-personaje',
        roleDescription: 'Diseño arquetípico y caracterización de héroes'
      },
      {
        id: 'libros',
        label: '📖 Libros & Cuentos Pedagógicos',
        icon: '📖',
        description: 'Gestión de textos escolares, cuentos pedagógicos y constelación literaria',
        keywords: ['libros', 'juracan', 'libros pedagogicos', 'cuentos', 'textos', 'editorial', 'creatika', 'literatura'],
        pillar: 'creatika',
        publicRoute: '/nuestros-libros',
        roleDescription: 'Biblioteca literaria y textos creativos de la editorial'
      }
    ]
  },

  // 3. ⚡ 100TEK: Ciencia, Lógica y Tecnología
  {
    id: 'cat_100tek',
    title: '⚡ 100tek (Ciencia, Lógica y Tecnología)',
    icon: '⚡',
    projectPillar: '100tek',
    badge: 'CIENCIA & TECNOLOGÍA',
    badgeColor: '#f59e0b',
    items: [
      {
        id: '100tek',
        label: '⚡ 100tek (Secuencias Numéricas)',
        icon: '⚡',
        description: 'Secuencias numéricas, sucesiones algebraicas y retos de lógica matemática',
        keywords: ['100tek', 'stem', 'matematica', 'secuencias', 'algebra', 'ciencia', 'logica', 'calculo'],
        pillar: '100tek',
        publicRoute: '/100tek/secuencias-numericas',
        roleDescription: 'Plataforma interactiva de secuencias numéricas y razonamiento abstracto'
      },
      {
        id: 'sistema_solar',
        label: '🪐 Sistema Solar 3D',
        icon: '🪐',
        description: 'Simulador astronómico 3D: órbitas planetarias, satélites, magnitudes y exploración cósmica',
        keywords: ['sistema solar', 'astronomia', 'planetas', 'sol', 'cosmos', '100tek', '3d', 'espacio', 'orbitas'],
        pillar: '100tek',
        publicRoute: '/100tek/sistema-solar',
        roleDescription: 'Simulación 3D interactiva del cosmos y astronomía educativa'
      }
    ]
  },

  // 4. 🧪 LAB: Prácticas, Talleres y Guías
  {
    id: 'cat_lab',
    title: '🧪 LAB (Prácticas, Talleres y Guías)',
    icon: '🧪',
    projectPillar: 'lab',
    badge: 'PRÁCTICAS & TALLERES',
    badgeColor: '#0ea5e9',
    items: [
      {
        id: 'laboratorios',
        label: '🧪 LAB (Talleres, Guías & Multimedia)',
        icon: '🧪',
        description: 'Módulos formativos prácticos, guías de ejercicios, talleres de animación y proyectos escolares',
        keywords: ['lab', 'laboratorios', 'animacion', 'multimedia', 'experimentos', 'proyectos', 'formativo', 'habilidades', 'talleres', 'guias', 'ejercicios'],
        pillar: 'lab',
        publicRoute: '/laboratorios',
        roleDescription: 'Talleres prácticos y guías de ejercicios para tareas escolares'
      }
    ]
  },

  // 5. 🛍️ MERCADO: Tienda en Línea
  {
    id: 'cat_mercado',
    title: '🛍️ Mercado (Tienda en Línea & Boletos)',
    icon: '🛍️',
    projectPillar: 'mercado',
    badge: 'TIENDA & COMERCIO',
    badgeColor: '#14b8a6',
    items: [
      {
        id: 'tienda',
        label: '🛍️ Catálogo de Cuentos & Libros',
        icon: '🛍️',
        description: 'Tienda en línea: portadas, precios, sinopsis y disponibilidad de cuentos infantiles',
        keywords: ['tienda', 'mercado', 'cuentos', 'libros', 'precios', 'productos', 'carrito', 'ventas'],
        pillar: 'mercado',
        publicRoute: '/tienda',
        roleDescription: 'Vitrina comercial de cuentos y publicaciones infantiles'
      },
      {
        id: 'bingo',
        label: '🎲 Bingotenango (Bingo Digital, Tómbola & Boletos)',
        icon: '🎲',
        description: 'Control de tómbola 3D, cartones, códigos, patrocinadores y venta de boletos digitales',
        keywords: ['bingotenango', 'bingo', 'juegos', 'cartones', 'bingo virtual', 'masivo', 'tombola', 'premios', 'boletos', 'mercado'],
        pillar: 'mercado',
        publicRoute: '/juegos/bingo',
        roleDescription: 'Dinámica comercial y lúdica masiva con venta de boletos y tómbola virtual'
      },
      {
        id: 'cotizador',
        label: '💼 Cotizador Web & Presupuestos',
        icon: '💼',
        description: 'Generación de cotizaciones profesionales en PDF para colegios y padres de familia',
        keywords: ['cotizador', 'cotizacion', 'pdf', 'propuestas', 'precios', 'presupuesto', 'mercado', 'comercial'],
        pillar: 'mercado',
        roleDescription: 'Herramienta de presupuestos y propuestas comerciales'
      }
    ]
  },

  // 6. 💡 POZO DE IDEAS: Incubadora y proyectos futuros
  {
    id: 'cat_pozo_ideas',
    title: '💡 Pozo de Ideas (Incubadora)',
    icon: '💡',
    projectPillar: 'pozo_ideas',
    badge: 'INNOVACIÓN & PROYECTOS',
    badgeColor: '#8b5cf6',
    items: [
      {
        id: 'pozo_ideas',
        label: '💡 Pozo de Ideas & Banco de Proyectos',
        icon: '💡',
        description: 'Banco de ideas para nuevas funciones, talleres, ejercicios y desarrollos organizados por pilar de Sutz',
        keywords: ['pozo', 'ideas', 'innovacion', 'proyectos', 'incubadora', 'propuestas', 'futuro', 'sutz'],
        pillar: 'pozo_ideas',
        roleDescription: 'Incubadora y banco de ideas para el ecosistema educativo'
      }
    ]
  }
];

// =========================================================================
// 🚀 CATEGORÍAS OPERATIVAS, PORTAL INSTITUCIONAL Y SISTEMA
// =========================================================================
export const OPERATIONAL_NAV_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat_portal',
    title: '🌐 Portal Institucional',
    icon: '🌐',
    items: [
      {
        id: 'inicio',
        label: '🏠 Portada & Hero',
        icon: '🏠',
        description: 'Encabezado principal, tarjetas del ecosistema Sutz y leyendas de portada',
        keywords: ['inicio', 'hero', 'landing', 'fichas', 'leyendas', 'promocional', 'portada'],
        pillar: 'soporte',
        publicRoute: '/'
      },
      {
        id: 'videos',
        label: '🎬 Videos & Consejos',
        icon: '🎬',
        description: 'Videos de YouTube, Shorts, modal de consejos dinámico y secciones',
        keywords: ['videos', 'youtube', 'shorts', 'consejos', 'modal', 'promocional', 'secciones', 'links'],
        pillar: 'soporte'
      },
      {
        id: 'neurociencia',
        label: '🧠 Neurociencia en el Aula',
        icon: '🧠',
        description: 'Estrategias didácticas y etapas de neurodesarrollo para docentes',
        keywords: ['neurociencia', 'etapas', 'cerebro', 'desarrollo', 'aula', 'docentes', 'pedagogia'],
        pillar: 'soporte',
        publicRoute: '/neurociencia'
      },
      {
        id: 'inscripciones',
        label: '📝 Maestros Inscritos',
        icon: '📝',
        description: 'Registro de docentes, instituciones y solicitudes de capacitación',
        keywords: ['maestros', 'inscripciones', 'docentes', 'profesores', 'registros', 'contactos', 'colegios'],
        pillar: 'soporte'
      }
    ]
  },
  {
    id: 'cat_sistema',
    title: '🎨 Apariencia & Sistema',
    icon: '🎨',
    items: [
      {
        id: 'colors',
        label: '🎨 Colores & Tema Visual',
        icon: '🎨',
        description: 'Variables CSS de colores HSL, efectos de brillo y sombras del portal',
        keywords: ['colores', 'tema', 'estilos', 'apariencia', 'css', 'hsl', 'neon', 'paleta'],
        pillar: 'soporte'
      }
    ]
  }
];

// 🗂️ CATEGORÍAS ADMINISTRATIVAS COMPLETAS (Mantiene retrocompatibilidad)
export const ADMIN_NAV_CATEGORIES: AdminCategory[] = [
  ...PILLAR_NAV_CATEGORIES,
  ...OPERATIONAL_NAV_CATEGORIES
];

// =========================================================================
// 🛠️ FUNCIONES DE UTILIDAD Y CLASIFICADOR EXTENSIBLE
// =========================================================================

/**
 * Obtiene la definición completa de un pilar educativo por su identificador.
 */
export function getPillarDefinition(pillarId: EducationalPillar): PillarDefinition {
  return PILLAR_REGISTRY[pillarId];
}

/**
 * Determina a qué pilar educativo pertenece una pestaña o herramienta específica.
 */
export function getPillarForTab(tabId: AdminTabType): PillarDefinition | undefined {
  for (const cat of ADMIN_NAV_CATEGORIES) {
    const item = cat.items.find(i => i.id === tabId);
    if (item && item.pillar && item.pillar !== 'soporte') {
      return PILLAR_REGISTRY[item.pillar];
    }
  }
  return undefined;
}

/**
 * Obtiene todas las herramientas registradas en un pilar educativo específico.
 */
export function getToolsForPillar(pillarId: EducationalPillar): AdminNavItem[] {
  const tools: AdminNavItem[] = [];
  for (const cat of ADMIN_NAV_CATEGORIES) {
    for (const item of cat.items) {
      if (item.pillar === pillarId) {
        tools.push(item);
      }
    }
  }
  return tools;
}

/**
 * Clasifica y enruta una nueva herramienta al pilar educativo correspondiente.
 * Úsalo para registrar futuras secciones o ejercicios asegurando consistencia.
 */
export function classifyTool(tool: {
  id: AdminTabType;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
  pillar: ToolPillarCategory;
  badge?: string;
  publicRoute?: string;
  roleDescription?: string;
}): AdminNavItem {
  return {
    ...tool,
    badge: tool.badge || (tool.pillar !== 'soporte' ? PILLAR_REGISTRY[tool.pillar].badge : undefined)
  };
}
