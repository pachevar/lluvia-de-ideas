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
  items: AdminNavItem[];
}

export const ADMIN_NAV_CATEGORIES: AdminCategory[] = [
  {
    id: 'portal',
    title: '🌐 Portal & Páginas Públicas',
    icon: '🌐',
    items: [
      {
        id: 'inicio',
        label: '🏠 Inicio & Hero',
        icon: '🏠',
        description: 'Editar encabezado principal, tarjetas y leyendas del portal',
        keywords: ['inicio', 'hero', 'landing', 'fichas', 'leyendas', 'promocional', 'portada']
      },
      {
        id: 'videos',
        label: '🎬 Videos & Secciones',
        icon: '🎬',
        description: 'Configuración de enlaces de YouTube, Shorts, modal de consejos y secciones dinámicas',
        keywords: ['videos', 'youtube', 'shorts', 'consejos', 'modal', 'promocional', 'secciones', 'links']
      },
      {
        id: 'neurociencia',
        label: '🧠 Neurociencia Aula',
        icon: '🧠',
        description: 'Estrategias pedagógicas por etapas de neurodesarrollo',
        keywords: ['neurociencia', 'etapas', 'cerebro', 'desarrollo', 'aula', 'docentes']
      },
      {
        id: 'libros',
        label: '📖 Nuestros Libros',
        icon: '📖',
        description: 'Gestión de textos escolares y constelación pedagógica',
        keywords: ['libros', 'juracan', 'libros pedagogicos', 'cuentos', 'textos', 'editorial']
      },
      {
        id: 'mapa',
        label: '☁️ Sutz Editor',
        icon: '☁️',
        description: 'Editor del mapa hexagonal del mundo virtual y narrativa didáctica',
        keywords: ['sutz', 'editor', 'mundo virtual', 'mapa', 'hexágonos', 'juracan', 'historias', 'kiche']
      }
    ]
  },
  {
    id: 'ecosistema',
    title: '🚀 Ecosistema Educativo & Módulos',
    icon: '🚀',
    items: [
      {
        id: 'techtree',
        label: '☁️ Sutz & Árbol Tecnológico',
        icon: '🌳',
        description: 'Mundo Virtual K\'iche\', mapa hexagonal y habilidades',
        keywords: ['sutz', 'nube', 'mundo virtual', 'arbol tecnologico', 'techtree', 'habilidades', 'kiche']
      },
      {
        id: 'creatika',
        label: '✨ Suite Creatika',
        icon: '✨',
        description: 'Máquina de Cuentos, Teoría del Color, Código Docente y Estudiante',
        keywords: ['creatika', 'cuentos', 'color', 'docente', 'estudiante', 'arte', 'escritura']
      },
      {
        id: '100tek',
        label: '⚡ 100tek (STEM)',
        icon: '⚡',
        description: 'Secuencias numéricas, Sistema Solar y laboratorios lógicos',
        keywords: ['100tek', 'stem', 'matematica', 'secuencias', 'sistema solar', 'ciencia']
      },
      {
        id: 'laboratorios',
        label: '🧪 Laboratorios & Animación',
        icon: '🧪',
        description: 'Módulos prácticos y proyectos multimedia interactivos',
        keywords: ['laboratorios', 'animacion', 'multimedia', 'experimentos', 'proyectos']
      },
      {
        id: 'bingo',
        label: '🎮 Juegos (Bingo Masivo)',
        icon: '🎮',
        description: 'Generación y control de cartones de Bingo Virtual',
        keywords: ['bingo', 'juegos', 'cartones', 'bingo virtual', 'masivo']
      }
    ]
  },
  {
    id: 'gestion',
    title: '💼 Gestión Comercial & Registro',
    icon: '💼',
    items: [
      {
        id: 'inscripciones',
        label: '📝 Maestros Inscritos',
        icon: '📝',
        description: 'Registro de docentes y solicitudes de capacitación',
        keywords: ['maestros', 'inscripciones', 'docentes', 'profesores', 'registros', 'contactos']
      },
      {
        id: 'cotizador',
        label: '💼 Cotizador Web',
        icon: '💼',
        description: 'Generación de cotizaciones en PDF y propuestas comerciales',
        keywords: ['cotizador', 'cotizacion', 'pdf', 'propuestas', 'precios', 'presupuesto']
      },
      {
        id: 'tienda',
        label: '🛍️ Tienda de Cuentos',
        icon: '🛍️',
        description: 'Cuentos de la tienda: portadas con imagen, descripciones, precios y disponibilidad',
        keywords: ['tienda', 'cuentos', 'libros', 'precios', 'productos', 'carrito', 'portadas']
      }
    ]
  },
  {
    id: 'sistema',
    title: '🎨 Apariencia & Sistema',
    icon: '🎨',
    items: [
      {
        id: 'colors',
        label: '🎨 Colores & Tema Visual',
        icon: '🎨',
        description: 'Variables CSS de colores HSL, efectos de brillo y sombras',
        keywords: ['colores', 'tema', 'estilos', 'apariencia', 'css', 'hsl', 'neon']
      }
    ]
  }
];
