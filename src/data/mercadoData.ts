import camazotzTitulo from '../cuentos/Camazotz titulo.png';
import ixkikTitulo from '../cuentos/Ixkik titulo.png';
import ixmukanneTitulo from '../cuentos/Ixmukanne titulo.png';
import juracanTitulo from '../cuentos/Juracan titulo.png';
import ququmatzTitulo from '../cuentos/Ququmatz titulo.png';

export interface MercadoProduct {
  id: string;
  title: string;
  category: 'cuentos' | 'juegos' | 'personajes' | 'tarjetas' | 'proyectos' | 'utiles';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  soldCount?: number;
  deliveryTime?: string;
  description: string;
  longDescription: string;
  badge?: string;
  icon: string;
  image?: string;
  gradeOrAge: string;
  features: string[];
  contents?: string[];
  featured?: boolean;
  inStock?: boolean;
  collectionId?: string;
  collectionName?: string;
  author?: string;
  pages?: number;
  formatType?: string;
  isbn?: string;
  coverTheme?: 'amber' | 'cyan' | 'emerald' | 'purple' | 'ruby';
}

export interface CollectionIncludedBook {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  pages?: number;
  gradeOrAge?: string;
  description?: string;
  image?: string;
  coverTheme?: 'amber' | 'cyan' | 'emerald' | 'purple' | 'ruby';
  isbn?: string;
}

export interface BookCollection {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  price: number;
  originalPrice: number;
  currency: string;
  gradeOrAge: string;
  rating: number;
  reviewsCount: number;
  soldCount: number;
  bookIds?: string[];
  includedBooks?: CollectionIncludedBook[];
  image?: string;
  themeColor?: string;
  accentGradient?: string;
  features: string[];
  onlySoldAsPack?: boolean;
}

export const DEFAULT_BOOK_COLLECTIONS: BookCollection[] = [
  {
    id: 'col-popol-vuh',
    title: 'Saga Mítica Popol Vuh: Dioses & Creación',
    subtitle: 'Colección de 5 Obras Maestras Ilustradas',
    badge: 'COLECCIÓN ESTRELLA',
    description: 'La gesta cosmogónica y mítica maya narrada con rigor pedagógico, poesía viva y arte visual contemporáneo. Reúne las historias épicas de Juracán, Camazotz, Ixkik, Ixmukané y Ququmatz.',
    price: 440.00,
    originalPrice: 550.00,
    currency: 'Q',
    gradeOrAge: 'Primaria & Ciclo Básico',
    rating: 5.0,
    reviewsCount: 164,
    soldCount: 310,
    bookIds: ['c-5', 'c-6', 'c-7', 'c-8', 'c-9'],
    themeColor: '#0284c7',
    accentGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
    features: [
      '5 Libros en pasta dura e ilustraciones a todo color formato Kindle',
      'Glosario etimológico Kʼicheʼ y mapa cosmológico desplegable',
      'Guías pedagógicas transversales de literatura y cosmovisión'
    ]
  },
  {
    id: 'col-steam',
    title: 'Colección STEAM: Sabiduría Ancestral & Algoritmos',
    subtitle: 'Colección de 4 Libros de Ciencia, Lógica y Arte',
    badge: 'INNOVACIÓN EDUCATIVA',
    description: 'Aventuras narrativas que articulan biotecnología, matemática fractal en textiles, inteligencia artificial ética y pensamiento computacional, dialogando con las raíces culturales.',
    price: 320.00,
    originalPrice: 400.00,
    currency: 'Q',
    gradeOrAge: '4to Primaria a Diversificado',
    rating: 4.9,
    reviewsCount: 215,
    soldCount: 450,
    bookIds: ['c-1', 'c-2', 'c-3', 'c-4'],
    themeColor: '#d97706',
    accentGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
    features: [
      '4 Libros con desafíos prácticos STEAM y acertijos integrados',
      'Enfoque en pensamiento crítico, lógica binaria y ética digital',
      'Acceso digital complementario a guías y fichas didácticas'
    ]
  },
  {
    id: 'col-magna',
    title: 'Gran Biblioteca Escolar: Antología Completa',
    subtitle: 'Pack Integral de 9 Títulos de la Editorial',
    badge: 'BOX SET COMPLETO',
    description: 'El catálogo literario integral de Editorial Lluvia de Ideas. La solución definitiva para bibliotecas escolares, centros de recursos para el aprendizaje y familias apasionadas por la lectura.',
    price: 699.00,
    originalPrice: 950.00,
    currency: 'Q',
    gradeOrAge: 'Todos los Grados (Primaria, Básico y Diversificado)',
    rating: 5.0,
    reviewsCount: 320,
    soldCount: 190,
    bookIds: ['c-1', 'c-2', 'c-3', 'c-4', 'c-5', 'c-6', 'c-7', 'c-8', 'c-9'],
    themeColor: '#059669',
    accentGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    features: [
      'Los 9 libros editoriales en caja estuche coleccionable de lujo',
      'Separadores de lectura exclusivos y láminas de arte coleccionables',
      'Membresía digital para recursos pedagógicos de aula y proyectos'
    ]
  }
];

export const MERCADO_CATEGORIES = [
  { id: 'todos', label: 'Todo el Catálogo', icon: '⚡' },
  { id: 'cuentos', label: 'Cuentos y Libros', icon: '📚' },
  { id: 'juegos', label: 'Juegos de Mesa', icon: '🎲' },
  { id: 'personajes', label: 'Personajes y Títeres', icon: '🎭' },
  { id: 'tarjetas', label: 'Tarjetas y Barajas', icon: '🎴' },
  { id: 'proyectos', label: 'Proyectos STEAM', icon: '🚀' },
  { id: 'utiles', label: 'Útiles y Arte', icon: '🎨' }
] as const;

export const DEFAULT_MERCADO_PRODUCTS: MercadoProduct[] = [
  // ==========================================
  // 1. CUENTOS Y LIBROS (Formato Amazon Kindle)
  // ==========================================
  {
    id: 'c-1',
    title: 'El Código del Maíz: Origen y Sustento',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 95.00,
    originalPrice: 120.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 138,
    soldCount: 420,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'MÁS VENDIDO',
    icon: '🌽',
    gradeOrAge: '4to a 6to Primaria',
    author: 'Editorial Lluvia de Ideas',
    pages: 64,
    formatType: 'Kindle eBook & Tapa Dura',
    collectionId: 'col-steam',
    collectionName: 'Colección STEAM: Sabiduría Ancestral',
    coverTheme: 'amber',
    description: 'Aventura STEAM donde la biotecnología ancestral y la cosmovisión maya protegen los cultivos del futuro.',
    longDescription: 'Este libro ilustrado transporta a los estudiantes a través de una aventura épica donde descifran el mapa genético del grano sagrado. Incluye glosario en Kʼicheʼ, desafíos de comprensión lectora y actividades transversales STEAM.',
    features: [
      'Edición de lujo con pasta dura e ilustraciones a todo color',
      'Actividades de comprensión lectora y resolución de dilemas éticos',
      'Glosario etimológico e integración curricular CNB'
    ],
    contents: ['1 Libro impreso de 64 páginas', '1 Separador de lectura coleccionable', 'Acceso digital a la guía docente'],
    featured: true
  },
  {
    id: 'c-2',
    title: 'Cenote de Datos: Memoria y Algoritmos',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 110.00,
    originalPrice: 145.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 96,
    soldCount: 280,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'NUEVO',
    icon: '🌊',
    gradeOrAge: '1ro a 3ro Básico',
    author: 'Editorial Lluvia de Ideas',
    pages: 88,
    formatType: 'Novela Gráfica & Kindle',
    collectionId: 'col-steam',
    collectionName: 'Colección STEAM: Sabiduría Ancestral',
    coverTheme: 'cyan',
    description: 'Novela gráfica juvenil sobre exploradores que descubren glifos informáticos y registros ocultos.',
    longDescription: 'Una historia trepidante de ciencia ficción y patrimonio cultural donde un equipo de jóvenes investigadores resuelve acertijos binarios en templos inundados, enseñando fundamentos de pensamiento lógico y ciberseguridad escolar.',
    features: [
      'Formato Novela Gráfica / Cómic de alta resolución',
      'Acertijos lógicos interactivos dentro de la trama',
      'Enfoque en ética digital y preservación del patrimonio'
    ],
    contents: ['1 Novela gráfica de 88 páginas', 'Hoja de retos y cifrados para resolver en equipo'],
    featured: true
  },
  {
    id: 'c-3',
    title: 'Jaguar Binario: Guardián del Umbral',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 105.00,
    originalPrice: 135.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 142,
    soldCount: 390,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'TOP RATED',
    icon: '🐆',
    gradeOrAge: 'Diversificado y Docentes',
    author: 'Editorial Lluvia de Ideas',
    pages: 72,
    formatType: 'Kindle eBook & Libro Filosófico',
    collectionId: 'col-steam',
    collectionName: 'Colección STEAM: Sabiduría Ancestral',
    coverTheme: 'purple',
    description: 'El felino mítico protege el umbral de la inteligencia artificial y enseña el valor del criterio y la empatía.',
    longDescription: 'Obra reflexiva y narrativa diseñada para debatir en el aula sobre el impacto de los algoritmos y la tecnología en la sociedad moderna, guiados por la sabiduría de las tradiciones mesoamericanas.',
    features: [
      'Guía de debate socrático incluida para profesores',
      'Ilustraciones conceptuales de gran impacto visual',
      'Conexión con contenidos de filosofía y tecnología'
    ],
    contents: ['1 Libro de lectura crítica de 72 páginas', 'Guía pedagógica de preguntas socráticas'],
    featured: false
  },
  {
    id: 'c-4',
    title: 'Tejedoras del Tiempo: Patrones y Fractales',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 90.00,
    originalPrice: 115.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 88,
    soldCount: 310,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'ARTE & CIENCIA',
    icon: '🧶',
    gradeOrAge: '3ro a 6to Primaria',
    author: 'Editorial Lluvia de Ideas',
    pages: 56,
    formatType: 'Kindle eBook & Libro de Arte',
    collectionId: 'col-steam',
    collectionName: 'Colección STEAM: Sabiduría Ancestral',
    coverTheme: 'emerald',
    description: 'Los textiles tradicionales mayas revelan geometrías fractales y algoritmos cíclicos en una historia conmovedora.',
    longDescription: 'Sigue a dos niñas que descubren cómo los hilos y telares de cintura de sus abuelas esconden fórmulas matemáticas complejas para predecir los ciclos lunares y las temporadas de siembra.',
    features: [
      'Diagramas explicativos de patrones geométricos y simetría',
      'Actividades de diseño textil con papel cuadriculado',
      'Fomento de la equidad de género en carreras STEAM'
    ],
    contents: ['1 Libro ilustrado de 56 páginas', 'Plantilla de patrones geométricos desmontable'],
    featured: false
  },
  {
    id: 'c-5',
    title: 'Juracán: Corazón del Cielo y Origen de los Vientos',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 115.00,
    originalPrice: 140.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 178,
    soldCount: 460,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SAGA POPOL VUH',
    icon: '🌪️',
    image: juracanTitulo,
    gradeOrAge: 'Primaria & Básicos',
    author: 'Editorial Lluvia de Ideas',
    pages: 96,
    formatType: 'Kindle eBook & Edición de Lujo',
    collectionId: 'col-popol-vuh',
    collectionName: 'Saga Mítica Popol Vuh: Dioses & Creación',
    coverTheme: 'cyan',
    description: 'El rugido de los vientos primordiales y la tormenta cósmica que da inicio a la creación de los mundos.',
    longDescription: 'Una adaptación épica y visual del mito kʼicheʼ de Juracán (Huracán), narrando el despertar de los tres relámpagos creadores y el origen del aliento de vida sobre la faz de las aguas primigenias.',
    features: [
      'Ilustraciones originales de gran formato a todo color',
      'Guía pedagógica de mitología mesoamericana y cosmovisión kʼicheʼ',
      'Actividades de comprensión y respeto a las fuerzas de la naturaleza'
    ],
    contents: ['1 Libro ilustrado de 96 páginas en tapa dura', '1 Mapa cósmico plegable', 'Acceso a narración sonora'],
    featured: true
  },
  {
    id: 'c-6',
    title: 'Camazotz: Guardián de la Noche y Sombras de Xibalbá',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 110.00,
    originalPrice: 135.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 154,
    soldCount: 380,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SAGA POPOL VUH',
    icon: '🦇',
    image: camazotzTitulo,
    gradeOrAge: 'Primaria & Básicos',
    author: 'Editorial Lluvia de Ideas',
    pages: 80,
    formatType: 'Kindle eBook & Edición de Lujo',
    collectionId: 'col-popol-vuh',
    collectionName: 'Saga Mítica Popol Vuh: Dioses & Creación',
    coverTheme: 'purple',
    description: 'El mítico murciélago de la noche y las pruebas de valor, templanza e ingenio en las cavernas.',
    longDescription: 'Acompaña la prueba de la Casa de los Murciélagos donde los héroes deben mantener la serenidad frente a las sombras y aprender a transformar el miedo en sabiduría y estrategia.',
    features: [
      'Narrativa inmersiva sobre valentía y autorregulación emocional',
      'Ilustraciones nocturnas de alto contraste artístico',
      'Preguntas de debate para el aula y el hogar'
    ],
    contents: ['1 Libro ilustrado de 80 páginas', 'Sticker holográfico de Camazotz'],
    featured: true
  },
  {
    id: 'c-7',
    title: 'Ixkik: La Semilla Rebelde y el Árbol de Jícara',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 105.00,
    originalPrice: 130.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 139,
    soldCount: 340,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SAGA POPOL VUH',
    icon: '🌱',
    image: ixkikTitulo,
    gradeOrAge: 'Primaria & Básicos',
    author: 'Editorial Lluvia de Ideas',
    pages: 76,
    formatType: 'Kindle eBook & Edición de Lujo',
    collectionId: 'col-popol-vuh',
    collectionName: 'Saga Mítica Popol Vuh: Dioses & Creación',
    coverTheme: 'emerald',
    description: 'La doncella valiente que desafía los mandatos de la oscuridad para dar vida al nuevo linaje solar.',
    longDescription: 'Una historia conmovedora sobre el coraje femenino, la justicia y la fertilidad de la tierra, mostrando cómo la determinación de Ixkik logra florecer la esperanza incluso ante las adversidades más oscuras.',
    features: [
      'Enfoque en liderazgo femenino ancestral y perseverancia',
      'Glosario botánico de plantas y frutos tradicionales',
      'Ficha didáctica de valores para primaria'
    ],
    contents: ['1 Libro de 76 páginas en encuadernación cosida', '1 Marcapáginas temático'],
    featured: false
  },
  {
    id: 'c-8',
    title: 'Ixmukané: La Abuela de la Luz y Creadora del Maíz',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 110.00,
    originalPrice: 135.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 162,
    soldCount: 410,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SAGA POPOL VUH',
    icon: '🌾',
    image: ixmukanneTitulo,
    gradeOrAge: 'Primaria & Básicos',
    author: 'Editorial Lluvia de Ideas',
    pages: 84,
    formatType: 'Kindle eBook & Edición de Lujo',
    collectionId: 'col-popol-vuh',
    collectionName: 'Saga Mítica Popol Vuh: Dioses & Creación',
    coverTheme: 'amber',
    description: 'La sabia anciana que muele los nueve granos de maíz sagrado para formar la carne y el espíritu humano.',
    longDescription: 'Homenaje a la memoria de las abuelas, la tradición oral y las raíces alimentarias de Mesoamérica, mostrando el valor del cuidado mutuo, la paciencia y el conocimiento intergeneracional.',
    features: [
      'Relato poético con énfasis en respeto intergeneracional',
      'Infografía sobre el ciclo agrícola ancestral del maíz',
      'Actividad de escritura creativa para los estudiantes'
    ],
    contents: ['1 Libro ilustrado de 84 páginas', 'Guía docente de comprensión lectora'],
    featured: false
  },
  {
    id: 'c-9',
    title: 'Ququmatz: La Serpiente Emplumada y Señor de las Aguas',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Libros',
    price: 115.00,
    originalPrice: 140.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 185,
    soldCount: 470,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SAGA POPOL VUH',
    icon: '🐉',
    image: ququmatzTitulo,
    gradeOrAge: 'Primaria & Básicos',
    author: 'Editorial Lluvia de Ideas',
    pages: 92,
    formatType: 'Kindle eBook & Edición de Lujo',
    collectionId: 'col-popol-vuh',
    collectionName: 'Saga Mítica Popol Vuh: Dioses & Creación',
    coverTheme: 'cyan',
    description: 'La deidad celeste de plumaje esmeralda que danza sobre los ríos tejiendo los horizontes del mundo.',
    longDescription: 'Un viaje deslumbrante por las corrientes fluviales y celestes de la cosmovisión maya, donde Ququmatz personifica el agua vivificadora, el equilibrio ecológico y la creatividad cósmica.',
    features: [
      'Ilustraciones a doble página con paleta esmeralda y oro',
      'Conexión con contenidos de ciencias naturales y ecología de cuencas',
      'Reto visual de glifos escondidos en cada ilustración'
    ],
    contents: ['1 Libro de 92 páginas en tapa dura', '1 Lámina artística coleccionable'],
    featured: true
  },

  // ==========================================
  // 2. JUEGOS DE MESA
  // ==========================================
  {
    id: 'j-1',
    title: 'Bingotenango: La Gran Lotería Cultural',
    category: 'juegos',
    categoryLabel: 'Juegos de Mesa',
    price: 185.00,
    originalPrice: 230.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 364,
    soldCount: 1200,
    deliveryTime: 'Envío Gratis ⚡',
    badge: 'SUPERVENTAS',
    icon: '🎲',
    gradeOrAge: 'Familiar y Escolar (6+)',
    description: 'Lotería interactiva con 54 cartas ilustradas, fichas de madera y modalidades de canto pedagógico.',
    longDescription: 'Bingotenango reinventa la tradicional lotería convirtiéndola en una experiencia lúdica de aprendizaje sobre geografía, fauna, relatos orales e historia de Guatemala. Acompaña partidas de 2 a 24 jugadores simultáneos.',
    features: [
      '24 Cartones plastificados de alta durabilidad',
      '54 Cartas de personajes y elementos con versos para cantar',
      '100 Fichas de madera reutilizables y bolsa ecológica'
    ],
    contents: ['24 Cartones de juego', '54 Baraja de cartas', '100 Fichas de madera', '1 Manual de reglas y datos curiosos'],
    featured: true
  },
  {
    id: 'j-2',
    title: 'Batalla en Xibalbá: Juego de Estrategia',
    category: 'juegos',
    categoryLabel: 'Juegos de Mesa',
    price: 220.00,
    originalPrice: 280.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 119,
    soldCount: 450,
    deliveryTime: 'Envío Gratis ⚡',
    badge: 'ESTRATEGIA',
    icon: '🏛️',
    gradeOrAge: 'A partir de 10 años',
    description: 'Tablero de estrategia cooperativa donde los jugadores guían a los gemelos Junajpu e Ixb’alanke.',
    longDescription: 'Inspirado en los pasajes del Popol Vuh, los jugadores deben combinar cartas de habilidades, recursos de maíz y juicio moral para superar la Casa de los Murciélagos, la Casa del Frío y el Juego de Pelota.',
    features: [
      'Tablero modular con 6 casas de desafío',
      'Figuras troqueladas de héroes y señores de Xibalbá',
      'Modo cooperativo y modo competitivo familiar'
    ],
    contents: ['1 Tablero plegable', '4 Miniaturas de personajes', '80 Cartas de eventos y hechizos', '2 Dados especiales de madera'],
    featured: false
  },
  {
    id: 'j-3',
    title: 'Dominó de Fracciones y Glifos Numéricos',
    category: 'juegos',
    categoryLabel: 'Juegos de Mesa',
    price: 75.00,
    originalPrice: 95.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 82,
    soldCount: 520,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'MATEMÁTICAS',
    icon: '🀄',
    gradeOrAge: 'Primaria (8 a 12 años)',
    description: 'Dominó didáctico para asociar fracciones visuales, porcentajes y notación vigesimal maya.',
    longDescription: 'Transforma la enseñanza de fracciones y decimales en una partida dinámica donde los niños asocian representaciones gráficas de pizzas, barras, glifos de puntos/barras y números estándar.',
    features: [
      '28 Fichas gruesas de cartón prensado con laminado mate',
      'Código de colores nemotécnico para rápida identificación',
      'Guía rápida con 5 variantes de juego en grupo'
    ],
    contents: ['28 Fichas de dominó resistente', '1 Estuche protector de viaje', '1 Guía didáctica para docentes'],
    featured: false
  },

  // ==========================================
  // 3. PERSONAJES
  // ==========================================
  {
    id: 'p-1',
    title: 'Set de Títeres Articulados: Sutzik y Ajpop',
    category: 'personajes',
    categoryLabel: 'Personajes y Títeres',
    price: 135.00,
    originalPrice: 170.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 155,
    soldCount: 680,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'TEATRO EN AULA',
    icon: '🎭',
    gradeOrAge: 'Preprimaria y Primaria',
    description: 'Pareja de títeres de varilla articulados confeccionados a mano para dramatizaciones y socioemocional.',
    longDescription: 'Herramienta pedagógica ideal para dinamizar la narración de cuentos en el aula. Sutzik (el murciélago guardián del cielo) y Ajpop (el sabio líder) permiten a los maestros captar la atención de los estudiantes y trabajar resolución pacífica de conflictos.',
    features: [
      'Brazos articulados mediante varillas de madera suave',
      'Telas textiles típicas y acabados reforzados de larga vida',
      'Guión teatral corto incluido para la primera sesión'
    ],
    contents: ['2 Títeres articulados (35cm)', '4 Varillas de control de movimiento', 'Folleto con 3 obras teatrales escolares'],
    featured: true
  },
  {
    id: 'p-2',
    title: 'Figura Coleccionable: Camazotz Guardián',
    category: 'personajes',
    categoryLabel: 'Personajes y Títeres',
    price: 160.00,
    originalPrice: 200.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 78,
    soldCount: 340,
    deliveryTime: 'Edición Limitada',
    badge: 'COLECCIÓN',
    icon: '🦇',
    gradeOrAge: 'Coleccionistas y Escuelas',
    description: 'Figura de colección elaborada en madera tallada y pintura vegetal no tóxica con alas expandibles.',
    longDescription: 'Una hermosa pieza decorativa y de narración táctil que representa al mítico Camazotz con alas expandibles y peana de exposición.',
    features: [
      'Alas con bisagras de madera móviles',
      'Pintura artesanal a mano por artistas locales',
      'Certificado de autenticidad numerado'
    ],
    contents: ['1 Figura artesanal de Camazotz (18 cm)', '1 Base de exhibición en madera de cedro tratada'],
    featured: false
  },
  {
    id: 'p-3',
    title: 'Mini Teatro de Sombras Portátil + 12 Siluetas',
    category: 'personajes',
    categoryLabel: 'Personajes y Títeres',
    price: 145.00,
    originalPrice: 190.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 97,
    soldCount: 410,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'CREATIVIDAD',
    icon: '🎪',
    gradeOrAge: 'Todas las edades',
    description: 'Estructura plegable con pantalla traslúcida, linterna LED y 12 siluetas troqueladas de personajes.',
    longDescription: 'Permite convertir cualquier rincón del aula o la casa en un teatro de sombras chinescas. Fomenta la expresión oral, el ritmo narrativo y la experimentación con luz y penumbras.',
    features: [
      'Montaje en menos de 1 minuto sin herramientas',
      'Pantalla de tela difusora de alta luminosidad',
      '12 Siluetas con varillas de madera y linterna compacta'
    ],
    contents: ['1 Marco de teatro plegable (45x35 cm)', '12 Siluetas de cuentos', '1 Mini linterna LED de alta potencia', 'Guía de dramatización'],
    featured: false
  },

  // ==========================================
  // 4. TARJETAS
  // ==========================================
  {
    id: 't-1',
    title: 'Baraja de Detonantes Narrativos STEAM (54 Cartas)',
    category: 'tarjetas',
    categoryLabel: 'Tarjetas y Barajas',
    price: 85.00,
    originalPrice: 110.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 253,
    soldCount: 950,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'RECOMENDADO DOCENTE',
    icon: '🎴',
    gradeOrAge: 'Docentes y Estudiantes (8+)',
    description: '54 cartas combinables divididas en Protagonistas, Ambientes Mesoamericanos, Conflictos STEAM y Objetos Mágicos.',
    longDescription: 'La herramienta definitiva para desbloquear el bloqueo del escritor en el aula. Permite generar más de 10,000 combinaciones de historias únicas en segundos, impulsando la redacción creativa y la inventiva.',
    features: [
      'Acabado plastificado resistente al agua y uso intensivo',
      '4 Categorías con códigos de color para juego ágil',
      'Manual con 8 dinámicas grupales para el salón de clases'
    ],
    contents: ['54 Cartas plastificadas premium', '1 Caja rígida tipo tuckbox', '1 Folleto de dinámicas pedagógicas'],
    featured: true
  },
  {
    id: 't-2',
    title: 'Flashcards de Neurociencia y Emociones Escolares',
    category: 'tarjetas',
    categoryLabel: 'Tarjetas y Barajas',
    price: 95.00,
    originalPrice: 125.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 141,
    soldCount: 620,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'SOCIOEMOCIONAL',
    icon: '🧠',
    gradeOrAge: 'Docentes, Psicólogos y Familias',
    description: '40 tarjetas ilustradas con técnicas de autorregulación emocional y pausas activas cerebro-compatibles.',
    longDescription: 'Diseñadas en base a principios de neuroeducación para ayudar a los docentes a gestionar momentos de alta energía, estrés o dispersión en el aula, con estrategias visuales que los alumnos comprenden de inmediato.',
    features: [
      'Tarjetas de gran tamaño (15x10 cm) de fácil visualización',
      'Ilustraciones amigables y ejercicios de respiración guiada',
      'Respaldado en investigación sobre desarrollo neurocognitivo'
    ],
    contents: ['40 Tarjetas ilustradas tamaño grande', 'Guía de aplicación para asambleas de aula'],
    featured: false
  },
  {
    id: 't-3',
    title: 'Baraja de Glifos y Retos Matemáticos Mayas',
    category: 'tarjetas',
    categoryLabel: 'Tarjetas y Barajas',
    price: 80.00,
    originalPrice: 100.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 65,
    soldCount: 380,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'CÁLCULO VIGESIMAL',
    icon: '🔢',
    gradeOrAge: '4to Primaria a Básico',
    description: 'Tarjetas de desafíos de cálculo vigesimal, conversión de unidades y calendarios sagrados.',
    longDescription: 'Cada tarjeta presenta un enigma o problema matemático contextualizado en la construcción de pirámides, observación de Venus y comercio ancestral de jade y cacao.',
    features: [
      'Respuestas explicadas y datos históricos al reverso',
      'Nivel de dificultad gradual (Básico, Intermedio, Maestro)',
      'Compatible con el Currículo Nacional Base'
    ],
    contents: ['48 Tarjetas de desafíos matemáticos', 'Tabla de consulta rápida del sistema vigesimal'],
    featured: false
  },

  // ==========================================
  // 5. PROYECTOS
  // ==========================================
  {
    id: 'pr-1',
    title: 'Kit STEAM: Laboratorio de Stop-Motion en el Aula',
    category: 'proyectos',
    categoryLabel: 'Proyectos STEAM',
    price: 245.00,
    originalPrice: 320.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 147,
    soldCount: 560,
    deliveryTime: 'Envío Gratis ⚡',
    badge: 'KIT COMPLETO',
    icon: '🚀',
    gradeOrAge: 'Primaria, Básico y Talleres',
    description: 'Trípode móvil ajustable, set de plastilinas pro para animación, 4 fondos temáticos y plantillas de storyboard.',
    longDescription: 'Todo lo necesario para que un grupo de estudiantes o un docente inicie de inmediato su producción de cortometrajes animados cuadro por cuadro en el aula con su teléfono inteligente o tableta.',
    features: [
      'Trípode flexible con soporte universal para smartphone',
      '4 Escenarios de fondo ilustrados en cartulina de alto gramaje',
      'Set de 6 barras de plastilina especial anti-adhesiva',
      'Cuaderno de guiones y storyboard técnico'
    ],
    contents: ['1 Trípode universal flexible', '6 Barras de plastilina pro', '4 Fondos escénicos dobles', '1 Cuaderno de Storyboard', 'Guía metodológica'],
    featured: true
  },
  {
    id: 'pr-2',
    title: 'Kit STEAM: Autómata Mecánico de Madera',
    category: 'proyectos',
    categoryLabel: 'Proyectos STEAM',
    price: 175.00,
    originalPrice: 220.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 83,
    soldCount: 390,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'MECÁNICA & ARTE',
    icon: '⚙️',
    gradeOrAge: '8 a 16 años',
    description: 'Piezas de madera pre-cortadas en láser para ensamblar un jaguar mecánico con engranajes y manivela.',
    longDescription: 'Enseña conceptos fundamentales de cinemática, levas, engranajes y transferencia de energía sin necesidad de pegamentos peligrosos ni herramientas complejas. Los alumnos pueden pintar y personalizar su autómata una vez montado.',
    features: [
      'Corte láser de precisión en madera sostenible',
      'Ensamble intuitivo mediante encajes tipo rompecabezas 3D',
      'Explicación científica de los principios mecánicos'
    ],
    contents: ['4 Láminas de piezas de madera', 'Ejes y manivela metálica', 'Pinturas acrílicas y pincel', 'Manual ilustrado'],
    featured: false
  },
  {
    id: 'pr-3',
    title: 'Kit de Botánica Ancestral: El Huerto de Ixmukané',
    category: 'proyectos',
    categoryLabel: 'Proyectos STEAM',
    price: 120.00,
    originalPrice: 155.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 79,
    soldCount: 310,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'ECOLOGÍA',
    icon: '🌱',
    gradeOrAge: 'Todas las edades',
    description: 'Semillas nativas de frijol, maíz criollo y calabaza con macetas de coco biodegradables y bitácora.',
    longDescription: 'Proyecto vivencial basado en el sistema de la Milpa tradicional mesoamericana, donde los niños registran el crecimiento de las plantas, aprenden sobre simbiosis natural y cuidado del medio ambiente.',
    features: [
      'Semillas orgánicas certificadas de rápida germinación',
      'Macetas 100% biodegradables listas para trasplante',
      'Bitácora científica ilustrada con actividades por semana'
    ],
    contents: ['3 Paquetes de semillas nativas', '3 Macetas de fibra de coco', 'Sustrato orgánico comprimido', '1 Bitácora del pequeño botánico'],
    featured: false
  },

  // ==========================================
  // 6. ÚTILES
  // ==========================================
  {
    id: 'u-1',
    title: 'Plastilina de Animación Pro (12 Colores)',
    category: 'utiles',
    categoryLabel: 'Útiles y Arte',
    price: 65.00,
    originalPrice: 85.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 261,
    soldCount: 1450,
    deliveryTime: 'Entrega Inmediata ⚡',
    badge: 'FÓRMULA PRO',
    icon: '🎨',
    gradeOrAge: 'Todas las edades',
    description: 'Plastilina de grado profesional para stop-motion: consistencia firme, no se deforma con el calor.',
    longDescription: 'Desarrollada especialmente para proyectos audiovisuales escolares. Mantiene su forma entre tomas fotográficas, permite mezclas homogéneas y no se seca al aire libre.',
    features: [
      '12 Colores vivos de alta pigmentación (500g en total)',
      'No tóxica, libre de gluten y biodegradable',
      'Resistente al calor de lámparas y luces de rodaje'
    ],
    contents: ['12 Barras de plastilina pro de 42g cada una', 'Estuche plástico resellable'],
    featured: true
  },
  {
    id: 'u-2',
    title: 'Set de Acuarelas Ecológicas de Pigmentos Naturales',
    category: 'utiles',
    categoryLabel: 'Útiles y Arte',
    price: 85.00,
    originalPrice: 110.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 119,
    soldCount: 520,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: '100% ECOLÓGICO',
    icon: '🖌️',
    gradeOrAge: 'Escolar y Artístico',
    description: 'Paleta de 16 pastillas de acuarela extraídas de tierras volcánicas, añil, cochinilla y tintes vegetales.',
    longDescription: 'Permite a los estudiantes conectar con la historia del color y la pintura mientras crean ilustraciones con tonos cálidos y orgánicos de alta cobertura.',
    features: [
      '16 Pastillas de pigmentos naturales con bandeja metálica',
      'Incluye 2 pinceles con depósito de agua recargable',
      'Seguro para uso infantil escolar'
    ],
    contents: ['1 Caja metálica con 16 pastillas de acuarela', '2 Pinceles de agua', '1 Esponja de difuminado'],
    featured: false
  },
  {
    id: 'u-3',
    title: 'Bitácora del Creador: Cuaderno de Storyboard 16:9',
    category: 'utiles',
    categoryLabel: 'Útiles y Arte',
    price: 55.00,
    originalPrice: 70.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 134,
    soldCount: 890,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'ESENCIAL',
    icon: '📓',
    gradeOrAge: 'A partir de 8 años',
    description: 'Cuaderno cosido de 100 páginas con plantillas panorámicas 16:9 para ilustrar guiones y cómics.',
    longDescription: 'Con papel libre de ácido de 120g que no traspasa la tinta de marcadores. Cada página contiene 4 recuadros panorámicos con líneas guía para diálogos, efectos de sonido y notas de dirección.',
    features: [
      '100 Páginas con más de 300 cuadros de storyboard',
      'Papel de 120g compatible con tinta, plumón y grafito',
      'Regla impresa en la guarda y elástico de cierre'
    ],
    contents: ['1 Cuaderno de Storyboard pasta blanda reforzada (A5)'],
    featured: false
  },
  {
    id: 'u-4',
    title: 'Estuche de Herramientas de Modelado y Escultura',
    category: 'utiles',
    categoryLabel: 'Útiles y Arte',
    price: 70.00,
    originalPrice: 90.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 98,
    soldCount: 470,
    deliveryTime: 'Entrega 24-48 hrs',
    badge: 'HERRAMIENTAS',
    icon: '✂️',
    gradeOrAge: 'Estudiantes y Docentes',
    description: 'Set de 8 estecas y espátulas de madera pulida y puntas de silicona para detallar expresiones.',
    longDescription: 'Ideal para esculpir personajes tridimensionales en plastilina, arcilla o masa flexible con acabados prolijos y profesionales.',
    features: [
      '8 Herramientas de doble punta (16 formas de modelado)',
      'Madera de bambú suave y ligera para manos infantiles',
      'Estuche de tela enrollable con bolsillos individuales'
    ],
    contents: ['8 Estecas de doble punta', '1 Estuche textil enrollable'],
    featured: false
  }
];

export const getCollectionBooks = (
  collectionOrId: string | BookCollection,
  products: MercadoProduct[] = DEFAULT_MERCADO_PRODUCTS,
  allCollections: BookCollection[] = DEFAULT_BOOK_COLLECTIONS
): MercadoProduct[] => {
  const collection: BookCollection | undefined = typeof collectionOrId === 'string'
    ? allCollections.find(c => c.id === collectionOrId)
    : collectionOrId;

  if (!collection) return [];

  // Si tiene libros incluidos directamente en la colección
  if (collection.includedBooks && collection.includedBooks.length > 0) {
    return collection.includedBooks.map((b, idx) => ({
      id: b.id || `inc-book-${collection.id}-${idx}`,
      title: b.title,
      category: 'cuentos',
      categoryLabel: 'Libro de Colección',
      price: collection.onlySoldAsPack ? 0 : (collection.price / collection.includedBooks!.length),
      originalPrice: collection.onlySoldAsPack ? undefined : (collection.originalPrice / collection.includedBooks!.length),
      currency: collection.currency || 'Q',
      rating: collection.rating || 5.0,
      reviewsCount: collection.reviewsCount || 1,
      deliveryTime: 'Incluido en la colección',
      description: b.description || '',
      longDescription: b.description || '',
      badge: collection.onlySoldAsPack ? 'EXCLUSIVO DEL PACK' : 'PARTE DE COLECCIÓN',
      icon: '📖',
      image: b.image || collection.image,
      gradeOrAge: b.gradeOrAge || collection.gradeOrAge,
      features: collection.features || [],
      collectionId: collection.id,
      collectionName: collection.title,
      author: b.author || 'Editorial Lluvia de Ideas',
      pages: b.pages,
      formatType: 'Kindle eBook & Tapa Dura',
      coverTheme: b.coverTheme || (idx % 2 === 0 ? 'cyan' : 'amber'),
      isbn: b.isbn,
      inStock: true
    }));
  }

  // Si referencia productos existentes por bookIds
  if (collection.bookIds && collection.bookIds.length > 0) {
    return collection.bookIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is MercadoProduct => Boolean(p));
  }

  return [];
};

