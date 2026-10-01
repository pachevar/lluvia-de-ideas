export interface MercadoProduct {
  id: string;
  title: string;
  category: 'cuentos' | 'juegos' | 'personajes' | 'tarjetas' | 'proyectos' | 'utiles';
  categoryLabel: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  description: string;
  longDescription: string;
  badge?: string;
  icon: string;
  gradeOrAge: string;
  features: string[];
  contents?: string[];
  featured?: boolean;
}

export const MERCADO_CATEGORIES = [
  { id: 'todos', label: 'Todos los Productos', icon: '🌟' },
  { id: 'cuentos', label: 'Cuentos', icon: '📚' },
  { id: 'juegos', label: 'Juegos de Mesa', icon: '🎲' },
  { id: 'personajes', label: 'Personajes', icon: '🎭' },
  { id: 'tarjetas', label: 'Tarjetas', icon: '🎴' },
  { id: 'proyectos', label: 'Proyectos', icon: '🚀' },
  { id: 'utiles', label: 'Útiles', icon: '🎨' }
] as const;

export const DEFAULT_MERCADO_PRODUCTS: MercadoProduct[] = [
  // ==========================================
  // 1. CUENTOS
  // ==========================================
  {
    id: 'c-1',
    title: 'El Código del Maíz: Origen y Sustento',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Literatura',
    price: 95.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 38,
    badge: 'Más Vendido',
    icon: '🌽',
    gradeOrAge: '4to a 6to Primaria',
    description: 'Un viaje fantástico donde la biotecnología ancestral y la cosmovisión maya se entrelazan para proteger los cultivos del futuro.',
    longDescription: 'Este libro ilustrado transporta a los estudiantes a través de una aventura épica donde descifran el mapa genético del grano sagrado. Incluye glosario en Kʼicheʼ, desafíos de comprensión lectora y actividades transversales STEAM.',
    features: [
      'Edición de lujo con pasta dura e ilustraciones a todo color',
      'Actividades de comprensión lectora y resolución de dilemas éticos',
      'Glosario etimológico e integración curricular'
    ],
    contents: ['1 Libro impreso de 64 páginas', '1 Separador de lectura coleccionable', 'Acceso digital a la guía docente'],
    featured: true
  },
  {
    id: 'c-2',
    title: 'Cenote de Datos: Memoria y Algoritmos',
    category: 'cuentos',
    categoryLabel: 'Cuentos y Literatura',
    price: 110.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 26,
    badge: 'Nuevo',
    icon: '🌊',
    gradeOrAge: '1ro a 3ro Básico',
    description: 'Novela gráfica juvenil sobre exploradores que descubren glifos informáticos y registros ocultos en cavernas subterráneas.',
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
    categoryLabel: 'Cuentos y Literatura',
    price: 105.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 42,
    badge: 'Recomendado',
    icon: '🐆',
    gradeOrAge: 'Diversificado y Docentes',
    description: 'El felino mítico protege el umbral de la inteligencia artificial y enseña el valor del criterio, la prudencia y la empatía.',
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
    categoryLabel: 'Cuentos y Literatura',
    price: 90.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 31,
    badge: 'Arte & Ciencia',
    icon: '🧶',
    gradeOrAge: '3ro a 6to Primaria',
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

  // ==========================================
  // 2. JUEGOS DE MESA
  // ==========================================
  {
    id: 'j-1',
    title: 'Bingotenango: La Gran Lotería Cultural',
    category: 'juegos',
    categoryLabel: 'Juegos de Mesa',
    price: 185.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 64,
    badge: 'Popular',
    icon: '🎲',
    gradeOrAge: 'Familiar y Escolar (6+)',
    description: 'El juego de mesa de lotería interactiva con 54 cartas ilustradas, fichas de madera y modalidades de canto pedagógico.',
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
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 19,
    badge: 'Estrategia',
    icon: '🏛️',
    gradeOrAge: 'A partir de 10 años',
    description: 'Tablero de juego de estrategia cooperativa donde los jugadores guían a los gemelos Junajpu e Ixb’alanke a través de los retos del inframundo.',
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
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 22,
    badge: 'Matemática',
    icon: '🀄',
    gradeOrAge: 'Primaria (8 a 12 años)',
    description: 'Juego de dominó didáctico para asociar fracciones visuales, porcentajes y notación vigesimal maya mediante el juego.',
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
    categoryLabel: 'Personajes y Figuras',
    price: 135.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 35,
    badge: 'Teatro en Aula',
    icon: '🎭',
    gradeOrAge: 'Preprimaria y Primaria',
    description: 'Pareja de títeres de varilla articulados confeccionados a mano para dramatizaciones de cuentos y expresión socioemocional.',
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
    categoryLabel: 'Personajes y Figuras',
    price: 160.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 28,
    badge: 'Edición Especial',
    icon: '🦇',
    gradeOrAge: 'Coleccionistas y Escuelas',
    description: 'Figura de colección elaborada en madera tallada y pintura vegetal no tóxica inspirada en la deidad de la noche y el conocimiento.',
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
    title: 'Mini Teatro de Sombras Portátil + Siluetas',
    category: 'personajes',
    categoryLabel: 'Personajes y Figuras',
    price: 145.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 17,
    badge: 'Creatividad',
    icon: '🎪',
    gradeOrAge: 'Todas las edades',
    description: 'Estructura plegable con pantalla traslúcida, linterna LED y 12 siluetas troqueladas de personajes para proyectar sombras mágicas.',
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
    categoryLabel: 'Tarjetas Didácticas',
    price: 85.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 53,
    badge: 'Top Docentes',
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
    categoryLabel: 'Tarjetas Didácticas',
    price: 95.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 41,
    badge: 'Socioemocional',
    icon: '🧠',
    gradeOrAge: 'Docentes, Psicólogos y Familias',
    description: '40 tarjetas ilustradas con técnicas de autorregulación emocional, pausas activas cerebro-compatibles y manejo del clima escolar.',
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
    categoryLabel: 'Tarjetas Didácticas',
    price: 80.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 15,
    badge: 'Matemática Ancestral',
    icon: '🔢',
    gradeOrAge: '4to Primaria a Básico',
    description: 'Tarjetas de desafíos de cálculo vigesimal, conversión de unidades y calendarios sagrados para aprender jugando.',
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
    categoryLabel: 'Proyectos y Kits STEAM',
    price: 245.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 47,
    badge: 'Kit Completo',
    icon: '🚀',
    gradeOrAge: 'Primaria, Básico y Talleres',
    description: 'Trípode móvil ajustable, set de plastilinas pro para animación, 4 fondos temáticos impresos, plantillas de storyboard y guía paso a paso.',
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
    categoryLabel: 'Proyectos y Kits STEAM',
    price: 175.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 23,
    badge: 'Mecánica & Arte',
    icon: '⚙️',
    gradeOrAge: '8 a 16 años',
    description: 'Piezas de madera pre-cortadas en láser para ensamblar un jaguar mecánico con engranajes, manivela y movimiento real.',
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
    categoryLabel: 'Proyectos y Kits STEAM',
    price: 120.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 19,
    badge: 'Ciencias Naturales',
    icon: '🌱',
    gradeOrAge: 'Todas las edades',
    description: 'Semillas nativas de frijol, maíz criollo y calabaza, macetas de fibra de coco biodegradables y bitácora de observación biológica.',
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
    categoryLabel: 'Útiles y Materiales',
    price: 65.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 61,
    badge: 'Fórmula Pro',
    icon: '🎨',
    gradeOrAge: 'Todas las edades',
    description: 'Plastilina de grado profesional para modelado y stop-motion: consistencia firme, no se deforma con el calor de las luces y no mancha.',
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
    categoryLabel: 'Útiles y Materiales',
    price: 85.00,
    currency: 'Q',
    rating: 4.8,
    reviewsCount: 29,
    badge: 'Ecológico',
    icon: '🖌️',
    gradeOrAge: 'Escolar y Artístico',
    description: 'Paleta de 16 pastillas de acuarela extraídas de tierras volcánicas, añil, cochinilla y tintes vegetales no tóxicos.',
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
    categoryLabel: 'Útiles y Materiales',
    price: 55.00,
    currency: 'Q',
    rating: 5.0,
    reviewsCount: 34,
    badge: 'Esencial',
    icon: '📓',
    gradeOrAge: 'A partir de 8 años',
    description: 'Cuaderno cosido de 100 páginas con plantillas panorámicas 16:9 para bocetar secuencias de animación, cómics y guiones.',
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
    categoryLabel: 'Útiles y Materiales',
    price: 70.00,
    currency: 'Q',
    rating: 4.9,
    reviewsCount: 18,
    badge: 'Herramientas',
    icon: '✂️',
    gradeOrAge: 'Estudiantes y Docentes',
    description: 'Set de 8 estecas y espátulas de madera pulida y puntas de silicona para detallar expresiones faciales y texturas.',
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
