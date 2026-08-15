import type { BookProduct } from '../types';

export const DEFAULT_BOOKS: BookProduct[] = [
  {
    id: '1',
    title: 'El Código del Maíz',
    tagline: 'Origen y Sustento',
    accent: 'yellow',
    category: 'primaria',
    price: 14.99,
    description: 'Un viaje fantástico por los orígenes del maíz sagrado, donde la biotecnología ancestral y la mitología se entrelazan para proteger los cultivos del futuro.',
    gradeLevel: '4to a 6to Primaria',
    badge: 'Clásico',
    coverEmoji: '🌽',
    available: true,
    featured: true,
    pos: { x: 20, y: 30 }
  },
  {
    id: '2',
    title: 'Cenote de Datos',
    tagline: 'Memoria Ancestral',
    accent: 'cyan',
    category: 'basico',
    price: 16.50,
    description: 'Las profundidades cristalinas esconden registros digitales de antiguas civilizaciones. Los jóvenes exploradores descifran glifos informáticos.',
    gradeLevel: '1ro a 3ro Básico',
    badge: 'Nuevo',
    coverEmoji: '🌊',
    available: true,
    pos: { x: 50, y: 15 }
  },
  {
    id: '3',
    title: 'Jaguar Binario',
    tagline: 'Guardián del Umbral',
    accent: 'lilac',
    category: 'diversificado',
    price: 18.00,
    description: 'El felino sagrado vigila la entrada al reino de la inteligencia artificial ética y enseña a los estudiantes el valor del criterio y la prudencia.',
    gradeLevel: 'Diversificado',
    coverEmoji: '🐆',
    available: true,
    pos: { x: 80, y: 35 }
  },
  {
    id: '4',
    title: 'Tejedoras del Tiempo',
    tagline: 'Algoritmos Cíclicos',
    accent: 'cyan',
    category: 'primaria',
    price: 15.00,
    description: 'Los patrones geométricos de los textiles tradicionales Maya revelan secuencias lógicas avanzadas y matemática fractal.',
    gradeLevel: '3ro a 6to Primaria',
    coverEmoji: '🧶',
    available: true,
    pos: { x: 35, y: 75 }
  },
  {
    id: '5',
    title: 'Fuego Nuevo Solar',
    tagline: 'Renacimiento Digital',
    accent: 'yellow',
    category: 'primaria',
    price: 17.25,
    description: 'Cada 52 ciclos el sol renace con nueva energía. Una aventura sobre energías renovables, astronomía y física cuántica para niños.',
    gradeLevel: '5to y 6to Primaria',
    coverEmoji: '🔥',
    available: true,
    pos: { x: 65, y: 70 }
  },
  {
    id: '6',
    title: 'El Sueño del Popol Vuh',
    tagline: 'Corazón del Cielo',
    accent: 'lilac',
    category: 'todos',
    price: 19.99,
    description: 'Adaptación narrativa completa ilustrada con actividades interactivas del Popol Vuh, enfocada en la formación en valores y comprensión lectora.',
    gradeLevel: 'Todos los grados',
    badge: 'Best Seller',
    coverEmoji: '📜',
    available: true,
    featured: true,
    pos: { x: 50, y: 48 }
  }
];
