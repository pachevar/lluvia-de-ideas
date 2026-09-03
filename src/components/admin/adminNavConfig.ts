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

export interface AdminNavItem {
  id: AdminTabType;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
  badge?: string;
}

export interface AdminCategory {
  id: string;
  title: string;
  icon: string;
  projectPillar?: 'creatika' | '100tek' | 'sutz' | 'laboratorio';
  badge?: string;
  badgeColor?: string;
  items: AdminNavItem[];
}

export interface ProjectPillarInfo {
  id: 'creatika' | '100tek' | 'sutz' | 'laboratorio';
  title: string;
  icon: string;
  targetTab: AdminTabType;
  color: string;
  badge: string;
  description: string;
}

export const PROJECT_PILLARS: ProjectPillarInfo[] = [
  {
    id: 'creatika',
    title: 'Creatika',
    icon: '✨',
    targetTab: 'creatika',
    color: '#ec4899',
    badge: 'Narrativa & Arte',
    description: 'Suite Creatika, El Viaje del Héroe y Tienda'
  },
  {
    id: '100tek',
    title: '100tek',
    icon: '⚡',
    targetTab: '100tek',
    color: '#f59e0b',
    badge: 'Ciencia & STEM',
    description: 'Secuencias numéricas, Sistema Solar y retos lógicos'
  },
  {
    id: 'sutz',
    title: 'Sutz',
    icon: '☁️',
    targetTab: 'mapa',
    color: '#10b981',
    badge: 'Mundo Virtual',
    description: 'Mapa Hexagonal K\'iche\' y Árbol Tecnológico'
  },
  {
    id: 'laboratorio',
    title: 'Laboratorio',
    icon: '🧪',
    targetTab: 'laboratorios',
    color: '#0ea5e9',
    badge: 'Animación & Práctica',
    description: '10 módulos formativos y proyectos multimedia'
  }
];

export const ADMIN_NAV_CATEGORIES: AdminCategory[] = [
  // =========================================================================
  // 🌟 LOS 4 PROYECTOS EDUCATIVOS PILARES DE LA EDITORIAL
  // =========================================================================
  {
    id: 'cat_creatika',
    title: '✨ Proyecto Creatika',
    icon: '✨',
    projectPillar: 'creatika',
    badge: 'PROYECTO',
    badgeColor: '#ec4899',
    items: [
      {
        id: 'creatika',
        label: '✨ Suite Creatika',
        icon: '✨',
        description: 'Máquina de Cuentos, Teoría del Color, Código Docente y Estudiante',
        keywords: ['creatika', 'cuentos', 'color', 'docente', 'estudiante', 'arte', 'escritura', 'maquina de cuentos']
      },
      {
        id: 'viaje_del_heroe',
        label: '🦸 El Viaje del Héroe',
        icon: '🦸',
        description: 'Construyendo Personaje, arquetipos, galería oficial y narrativa',
        keywords: ['viaje del heroe', 'personajes', 'arquetipos', 'construyendo personaje', 'imagenes', 'narrativa', 'guion']
      },
      {
        id: 'tienda',
        label: '🛍️ Tienda de Cuentos',
        icon: '🛍️',
        description: 'Catálogo de cuentos infantiles: portadas, precios, descripciones y disponibilidad',
        keywords: ['tienda', 'cuentos', 'libros', 'precios', 'productos', 'carrito', 'portadas', 'creatika']
      }
    ]
  },
  {
    id: 'cat_100tek',
    title: '⚡ Proyecto 100tek',
    icon: '⚡',
    projectPillar: '100tek',
    badge: 'PROYECTO',
    badgeColor: '#f59e0b',
    items: [
      {
        id: '100tek',
        label: '⚡ 100tek (Ciencia & STEM)',
        icon: '⚡',
        description: 'Secuencias numéricas, Sistema Solar 3D interactivo y retos lógicos',
        keywords: ['100tek', 'stem', 'matematica', 'secuencias', 'sistema solar', 'ciencia', 'astronomia', 'logica']
      }
    ]
  },
  {
    id: 'cat_sutz',
    title: '☁️ Proyecto Sutz',
    icon: '☁️',
    projectPillar: 'sutz',
    badge: 'PROYECTO',
    badgeColor: '#10b981',
    items: [
      {
        id: 'mapa',
        label: '🗺️ Sutz Editor (Mapa Hexagonal)',
        icon: '🗺️',
        description: 'Editor del mapa hexagonal del mundo virtual Maya K\'iche\', reinos y narrativa',
        keywords: ['sutz', 'editor', 'mundo virtual', 'mapa', 'hexágonos', 'juracan', 'historias', 'kiche', 'reinos']
      },
      {
        id: 'techtree',
        label: '🌳 Árbol Tecnológico & Habilidades',
        icon: '🌳',
        description: 'Nodos pedagógicos, habilidades por reino y conexiones de aprendizaje',
        keywords: ['sutz', 'nube', 'mundo virtual', 'arbol tecnologico', 'techtree', 'habilidades', 'kiche', 'competencias']
      }
    ]
  },
  {
    id: 'cat_laboratorios',
    title: '🧪 Proyecto Laboratorio',
    icon: '🧪',
    projectPillar: 'laboratorio',
    badge: 'PROYECTO',
    badgeColor: '#0ea5e9',
    items: [
      {
        id: 'laboratorios',
        label: '🧪 Laboratorios & Animación',
        icon: '🧪',
        description: '10 módulos formativos de animación educativa y proyectos prácticos',
        keywords: ['laboratorios', 'animacion', 'multimedia', 'experimentos', 'proyectos', 'formativo', 'habilidades']
      }
    ]
  },

  // =========================================================================
  // 🚀 MÓDULOS DE SOPORTE, COMUNICACIÓN & OPERACIONES
  // =========================================================================
  {
    id: 'cat_juegos',
    title: '🎮 Juegos & Dinámicas',
    icon: '🎮',
    items: [
      {
        id: 'bingo',
        label: '🎲 Bingo Virtual Masivo',
        icon: '🎲',
        description: 'Control de tómbola 3D, cartones, códigos, patrocinadores y promotores',
        keywords: ['bingo', 'juegos', 'cartones', 'bingo virtual', 'masivo', 'tombola', 'premios']
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
        keywords: ['inicio', 'hero', 'landing', 'fichas', 'leyendas', 'promocional', 'portada']
      },
      {
        id: 'videos',
        label: '🎬 Videos & Consejos',
        icon: '🎬',
        description: 'Videos de YouTube, Shorts, modal de consejos dinámico y secciones',
        keywords: ['videos', 'youtube', 'shorts', 'consejos', 'modal', 'promocional', 'secciones', 'links']
      },
      {
        id: 'neurociencia',
        label: '🧠 Neurociencia en el Aula',
        icon: '🧠',
        description: 'Estrategias didácticas y etapas de neurodesarrollo para docentes',
        keywords: ['neurociencia', 'etapas', 'cerebro', 'desarrollo', 'aula', 'docentes', 'pedagogia']
      },
      {
        id: 'libros',
        label: '📖 Nuestros Libros',
        icon: '📖',
        description: 'Gestión de textos escolares, cuentos y constelación pedagógica',
        keywords: ['libros', 'juracan', 'libros pedagogicos', 'cuentos', 'textos', 'editorial']
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
        keywords: ['cotizador', 'cotizacion', 'pdf', 'propuestas', 'precios', 'presupuesto', 'comercial']
      },
      {
        id: 'inscripciones',
        label: '📝 Maestros Inscritos',
        icon: '📝',
        description: 'Registro de docentes, instituciones y solicitudes de capacitación',
        keywords: ['maestros', 'inscripciones', 'docentes', 'profesores', 'registros', 'contactos', 'colegios']
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
        keywords: ['colores', 'tema', 'estilos', 'apariencia', 'css', 'hsl', 'neon', 'paleta']
      }
    ]
  }
];
