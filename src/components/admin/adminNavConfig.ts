export type AdminTabType = 
  | 'inicio' 
  | 'videos'
  | 'neurociencia'
  | 'libros'
  | 'mapa'
  | 'techtree'
  | 'creatika' 
  | '100tek' 
  | 'laboratorios'
  | 'bingo' 
  | 'tienda' 
  | 'viaje_del_heroe'
  | 'inscripciones' 
  | 'cotizador' 
  | 'colors'
  | 'ajustes';

// =========================================================================
// 🌟 ARQUITECTURA DE CLASIFICACIÓN POR PILARES EDUCATIVOS
// =========================================================================

export type EducationalPillar = 'creatika' | '100tek' | 'sutz' | 'laboratorio';
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

// 🏛️ REGISTRO CENTRAL DE LOS 4 PILARES EDUCATIVOS FUNDAMENTALES
export const PILLAR_REGISTRY: Record<EducationalPillar, PillarDefinition> = {
  creatika: {
    id: 'creatika',
    title: 'Creatika',
    tagline: 'Todo lo Artístico, Narrativo y Creativo',
    focusArea: 'Arte, Narrativa, Diseño & Escritura',
    description: 'Máquina de Cuentos, Teoría del Color, Creación de Personajes, Literatura Infantil y Códigos Didácticos.',
    icon: '✨',
    targetTab: 'creatika',
    color: '#ec4899',
    secondaryColor: '#c084fc',
    badge: 'Creatividad & Arte',
    publicHubRoute: '/creatika'
  },
  '100tek': {
    id: '100tek',
    title: '100tek',
    tagline: 'Todo lo Lógico, Matemática y Ciencia',
    focusArea: 'Ciencia, Lógica, Matemáticas & STEM',
    description: 'Secuencias numéricas, simulación astronómica 3D, desafíos de agilidad mental y retos lógicos.',
    icon: '⚡',
    targetTab: '100tek',
    color: '#f59e0b',
    secondaryColor: '#fbbf24',
    badge: 'Ciencia & STEM',
    publicHubRoute: '/100tek/secuencias-numericas'
  },
  sutz: {
    id: 'sutz',
    title: 'Sutz',
    tagline: 'El Mapa Virtual que Engloba Todas las Rutas Didácticas',
    focusArea: 'Mundo Virtual Maya K\'iche\' & Árbol Tecnológico',
    description: 'Mapa hexagonal que centraliza los pueblos, reinos y caminos pedagógicos hacia las herramientas y ejercicios.',
    icon: '☁️',
    targetTab: 'mapa',
    color: '#10b981',
    secondaryColor: '#34d399',
    badge: 'Mundo Virtual',
    publicHubRoute: '/sutz'
  },
  laboratorio: {
    id: 'laboratorio',
    title: 'Laboratorio',
    tagline: 'Talleres y Proyectos para Experimentar',
    focusArea: 'Laboratorios Prácticos, Animación & Multimedia',
    description: '10 módulos formativos estructurados por grado, proyectos multimedia prácticos y experimentación.',
    icon: '🧪',
    targetTab: 'laboratorios',
    color: '#0ea5e9',
    secondaryColor: '#38bdf8',
    badge: 'Talleres & LAB',
    publicHubRoute: '/laboratorios'
  }
};

export const PROJECT_PILLARS: PillarDefinition[] = Object.values(PILLAR_REGISTRY);

// 🗂️ CATEGORÍAS ADMINISTRATIVAS ORGANIZADAS POR PILARES
export const ADMIN_NAV_CATEGORIES: AdminCategory[] = [
  // =========================================================================
  // 1. ✨ CREATIKA: Todo lo artístico y creativo
  // =========================================================================
  {
    id: 'cat_creatika',
    title: '✨ Proyecto Creatika',
    icon: '✨',
    projectPillar: 'creatika',
    badge: 'ARTE & CREATIVIDAD',
    badgeColor: '#ec4899',
    items: [
      {
        id: 'creatika',
        label: '✨ Suite Creatika',
        icon: '✨',
        description: 'Máquina de Cuentos, Teoría del Color, Código Docente y Estudiante',
        keywords: ['creatika', 'cuentos', 'color', 'docente', 'estudiante', 'arte', 'escritura', 'maquina de cuentos'],
        pillar: 'creatika',
        publicRoute: '/creatika',
        roleDescription: 'Centro creativo de creación literaria y cromática'
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
        label: '📖 Nuestros Libros & Cuentos',
        icon: '📖',
        description: 'Gestión de textos escolares, cuentos pedagógicos y constelación literaria',
        keywords: ['libros', 'juracan', 'libros pedagogicos', 'cuentos', 'textos', 'editorial', 'creatika', 'literatura'],
        pillar: 'creatika',
        publicRoute: '/nuestros-libros',
        roleDescription: 'Biblioteca literaria y textos creativos de la editorial'
      },
      {
        id: 'tienda',
        label: '🛍️ Tienda de Cuentos',
        icon: '🛍️',
        description: 'Catálogo de cuentos infantiles: portadas, precios, sinopsis y disponibilidad',
        keywords: ['tienda', 'cuentos', 'libros', 'precios', 'productos', 'carrito', 'portadas', 'creatika'],
        pillar: 'creatika',
        publicRoute: '/tienda',
        roleDescription: 'Vitrina comercial de cuentos y publicaciones infantiles'
      }
    ]
  },

  // =========================================================================
  // 2. ⚡ 100TEK: Todo lo lógico, matemática y ciencia
  // =========================================================================
  {
    id: 'cat_100tek',
    title: '⚡ Proyecto 100tek',
    icon: '⚡',
    projectPillar: '100tek',
    badge: 'LÓGICA, MATEMÁTICA & CIENCIA',
    badgeColor: '#f59e0b',
    items: [
      {
        id: '100tek',
        label: '⚡ 100tek (Ciencia & STEM)',
        icon: '⚡',
        description: 'Secuencias numéricas, Sistema Solar 3D interactivo y retos lógicos/matemáticos',
        keywords: ['100tek', 'stem', 'matematica', 'secuencias', 'sistema solar', 'ciencia', 'astronomia', 'logica', 'calculo'],
        pillar: '100tek',
        publicRoute: '/100tek/secuencias-numericas',
        roleDescription: 'Plataforma interactiva de ciencia, patrones numéricos y cosmos'
      }
    ]
  },

  // =========================================================================
  // 3. ☁️ SUTZ: El mapa virtual que engloba todas las rutas
  // =========================================================================
  {
    id: 'cat_sutz',
    title: '☁️ Proyecto Sutz',
    icon: '☁️',
    projectPillar: 'sutz',
    badge: 'MAPA VIRTUAL & RUTAS',
    badgeColor: '#10b981',
    items: [
      {
        id: 'mapa',
        label: '🗺️ Sutz Editor (Mapa Hexagonal)',
        icon: '🗺️',
        description: 'Editor del mapa hexagonal del mundo virtual Maya K\'iche\', reinos y narrativa didáctica',
        keywords: ['sutz', 'editor', 'mundo virtual', 'mapa', 'hexágonos', 'juracan', 'historias', 'kiche', 'reinos'],
        pillar: 'sutz',
        publicRoute: '/sutz',
        roleDescription: 'Mapa virtual que centraliza y conecta todas las rutas a ejercicios'
      },
      {
        id: 'techtree',
        label: '🌳 Árbol Tecnológico & Habilidades',
        icon: '🌳',
        description: 'Nodos pedagógicos, habilidades por reino y conexiones didácticas a herramientas',
        keywords: ['sutz', 'nube', 'mundo virtual', 'arbol tecnologico', 'techtree', 'habilidades', 'kiche', 'competencias'],
        pillar: 'sutz',
        publicRoute: '/sutz',
        roleDescription: 'Rutas pedagógicas y árbol de progreso del estudiante'
      }
    ]
  },

  // =========================================================================
  // 4. 🧪 LABORATORIO: Talleres y proyectos para experimentar
  // =========================================================================
  {
    id: 'cat_laboratorios',
    title: '🧪 Proyecto Laboratorio',
    icon: '🧪',
    projectPillar: 'laboratorio',
    badge: 'TALLERES & PROYECTOS',
    badgeColor: '#0ea5e9',
    items: [
      {
        id: 'laboratorios',
        label: '🧪 Laboratorios & Animación',
        icon: '🧪',
        description: '10 módulos formativos de animación educativa, talleres prácticos y proyectos multimedia',
        keywords: ['laboratorios', 'animacion', 'multimedia', 'experimentos', 'proyectos', 'formativo', 'habilidades', 'talleres'],
        pillar: 'laboratorio',
        publicRoute: '/laboratorios',
        roleDescription: 'Talleres prácticos y proyectos de experimentación por grado'
      }
    ]
  },

  // =========================================================================
  // 🚀 MÓDULOS OPERATIVOS Y DE SOPORTE COMPLEMENTARIO
  // =========================================================================
  {
    id: 'cat_juegos',
    title: '🎮 Juegos & Dinámicas',
    icon: '🎮',
    items: [
      {
        id: 'bingo',
        label: '🎲 Bingotenango (Bingo Digital)',
        icon: '🎲',
        description: 'Control de tómbola 3D, cartones, códigos, patrocinadores y promotores',
        keywords: ['bingotenango', 'bingo', 'juegos', 'cartones', 'bingo virtual', 'masivo', 'tombola', 'premios'],
        pillar: 'soporte',
        publicRoute: '/juegos/bingo',
        roleDescription: 'Dinámica interactiva y lúdica masiva'
      }
    ]
  },
  {
    id: 'cat_portal',
    title: '🌐 Portal Institucional',
    icon: '🌐',
    items: [
      {
        id: 'inicio',
        label: '🏠 Portada & Hero',
        icon: '🏠',
        description: 'Encabezado principal, tarjetas de los 4 proyectos y leyendas de portada',
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
      }
    ]
  },
  {
    id: 'cat_gestion',
    title: '💼 Gestión Comercial & Ventas',
    icon: '💼',
    items: [
      {
        id: 'cotizador',
        label: '💼 Cotizador Web',
        icon: '💼',
        description: 'Generación de cotizaciones profesionales en PDF y propuestas',
        keywords: ['cotizador', 'cotizacion', 'pdf', 'propuestas', 'precios', 'presupuesto', 'comercial'],
        pillar: 'soporte'
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
