export interface ReelItem {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: 'personaje' | 'entorno' | 'atmosfera' | 'motivacion';
  genre: 'fantasia' | 'scifi' | 'realismo' | 'todos';
  trait?: string; // Rasgo singular, defecto cómico o superpoder inesperado
}

export interface PlotTwistItem {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  effect: string;
}

export const PLOT_TWISTS_POOL: PlotTwistItem[] = [
  {
    id: 'tw1',
    emoji: '⏳',
    title: 'Anomalía Temporal',
    prompt: '¡El tiempo de repente corre al revés cada vez que alguien duda!',
    effect: 'Causa errores de predicción y eleva el cortisol por urgencia de decisión.'
  },
  {
    id: 'tw2',
    emoji: '🥚',
    title: 'El Artefacto es una Criatura',
    prompt: '¡El tesoro que buscaban no era una joya ni un arma, sino un huevo de dragón estelar a punto de eclosionar!',
    effect: 'Dispara la oxitocina inmediata y transforma la misión de conquista en cuidado.'
  },
  {
    id: 'tw3',
    emoji: '🎭',
    title: 'El Villano Era un Aliado',
    prompt: '¡El supuesto adversario en realidad intentaba protegerlos de una catástrofe mayor!',
    effect: 'Quiebre de teoría de la mente: reconfiguración de esquemas cognitivos previos.'
  },
  {
    id: 'tw4',
    emoji: '🔇',
    title: 'Pacto de Silencio Forzoso',
    prompt: '¡Una onda acústica cancela la voz hablada: solo pueden comunicarse mediante señas, dibujos o ritmo!',
    effect: 'Obliga a activar la memoria visuoespacial y el lenguaje simbólico en el relato.'
  },
  {
    id: 'tw5',
    emoji: '🌀',
    title: 'Gravedad Traviesa',
    prompt: '¡La gravedad local se reduce al 10%: los libros, herramientas y personajes flotan sin control!',
    effect: 'Inyección de endorfinas por alivio cómico y pensamiento lateral físico.'
  },
  {
    id: 'tw6',
    emoji: '🗝️',
    title: 'El Secreto Invertido',
    prompt: '¡El mapa estaba dibujado al revés y la llave estaba en el bolsillo del personaje desde el inicio!',
    effect: 'Efecto ¡Eureka! (Insight) con descarga masiva de dopamina.'
  },
  {
    id: 'tw7',
    emoji: '🌿',
    title: 'La Tecnología Habla con la Naturaleza',
    prompt: '¡El motor averiado solo responde si se le recita un poema en un idioma ancestral o se le riega con savia de ceiba!',
    effect: 'Fusión interdisciplinar STEAM: mitología, botánica e ingeniería.'
  },
  {
    id: 'tw8',
    emoji: '👥',
    title: 'El Reflejo Rebelde',
    prompt: '¡El reflejo del protagonista en los espejos cobra vida propia y toma decisiones contrarias por prudencia!',
    effect: 'Exploración de la dualidad psicológica: conflicto interno exteriorizado.'
  }
];

export const ITEMS_POOL: ReelItem[] = [
  // ─────────────────────────────────────────────────────────────
  // ── PERSONAJES (30 OPCIONES DIVERSAS, EDUCATIVAS Y DIVERTIDAS) ──
  // ─────────────────────────────────────────────────────────────
  {
    id: 'p1',
    emoji: '🧙‍♂️',
    title: 'Mago Olvidadizo',
    description: 'Un hechicero centenario que confunde los conjuros de meteoritos con recetas de pastel de plátano.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Pierde sus pergaminos mágicos en los momentos de mayor peligro.'
  },
  {
    id: 'p2',
    emoji: '🤖',
    title: 'Cyborg Poeta',
    description: 'Un autómata de minería pesada que de pronto solo quiere declamar sonetos y descifrar emociones humanas.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Recita haikus cuando la presión hidráulica sube al 100%.'
  },
  {
    id: 'p3',
    emoji: '🕵️‍♀️',
    title: 'Detective de Sueños',
    description: 'Investigadora que se infiltra en las pesadillas ajenas para resolver enigmas del mundo despierto.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Anota cada pista en un cuaderno de hojas fluorescentes.'
  },
  {
    id: 'p4',
    emoji: '🦊',
    title: 'Zorro Políglota',
    description: 'Un astuto embustero que habla siete idiomas mesoamericanos y comercia mapas de ríos subterráneos.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Siempre exige el pago en acertijos matemáticos.'
  },
  {
    id: 'p5',
    emoji: '👩‍🚀',
    title: 'Astronauta Botánica',
    description: 'Viajera espacial atrapada en una órbita remota cultivando orquídeas que producen oxígeno musical.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Lleva consigo un colibrí mecánico como copiloto.'
  },
  {
    id: 'p6',
    emoji: '🎻',
    title: 'Músico de la Lluvia',
    description: 'Un virtuoso cuyo instrumento acústico altera la condensación de las nubes y guía a los campesinos.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Toca en compases ternarios para calmar a los truenos.'
  },
  {
    id: 'p7',
    emoji: '🐉',
    title: 'Dragoncito Boticario',
    description: 'Un pequeño reptil alado que en lugar de fuego escupe vapores medicinales de hierbabuena.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Teme a las alturas y prefiere viajar en mochilas escolares.'
  },
  {
    id: 'p8',
    emoji: '👨‍🔬',
    title: 'Alquimista de Frecuencias',
    description: 'Científico rebelde que transforma ondas de radio olvidadas en cristales de cuarzo de alta energía.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Usa gafas con filtros de espectrometría de colores primarios.'
  },
  {
    id: 'p9',
    emoji: '👑',
    title: 'Princesa Ajedrecista',
    description: 'Heredera de un reino montañoso que resuelve tratados de paz y dilemas éticos sobre un tablero hexagonal.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Piensa siempre tres jugadas antes de emitir un juicio.'
  },
  {
    id: 'p10',
    emoji: '🐦',
    title: 'Colibrí Mensajero Astral',
    description: 'Ave veloz que transporta micro-cápsulas de datos entre satélites antes de la aurora.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Bate sus alas a 90 hercios exactos para no ser detectado por radares.'
  },
  {
    id: 'p11',
    emoji: '🦉',
    title: 'Búho Cronista',
    description: 'Guardián nocturno del archivo de los abuelos que se niega a cerrar los ojos hasta verificar la verdad histórica.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Corrige las faltas de ortografía de los reyes con plumas de jade.'
  },
  {
    id: 'p12',
    emoji: '🛠️',
    title: 'Niño Mecatrónico',
    description: 'Estudiante de primaria que construye prótesis y bicicletas voladoras con chatarra de electrodomésticos.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Lleva imanes potentes cosidos en el forro de su chaqueta.'
  },
  {
    id: 'p13',
    emoji: '🐆',
    title: 'Jaguar de Humo y Obsidiana',
    description: 'Espíritu protector de las cuevas que se materializa solo cuando la selva es amenazada por el fuego.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Sus pisadas apagan las brasas y dejan brotar semillas de ceiba.'
  },
  {
    id: 'p14',
    emoji: '🤿',
    title: 'Arqueóloga de Cenotes',
    description: 'Buceadora experta que busca vasijas con glifos calendáricos en las fosas más hondas de Atitlán.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Puede retener la respiración tres minutos calculando fracciones mentales.'
  },
  {
    id: 'p15',
    emoji: '💡',
    title: 'Droide Solar Sin Brújula',
    description: 'Pequeño robot rodante con paneles solares que busca la colina más alta para no perder su carga.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Se apaga cómico 5 segundos si una nube grande tapa el sol.'
  },
  {
    id: 'p16',
    emoji: '🧶',
    title: 'Tejedora de Constelaciones',
    description: 'Abuela centenaria que hila hilos de lana teñidos con pigmentos de meteorito para predecir las cosechas.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Codifica ecuaciones astronómicas en los patrones del huipil.'
  },
  {
    id: 'p17',
    emoji: '🎨',
    title: 'Pintora Callejera de Neón',
    description: 'Joven muralista cuyas obras cobran volumen tridimensional al recibir luz ultravioleta.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Nunca utiliza el color negro: sombras creadas solo con azul cobalto.'
  },
  {
    id: 'p18',
    emoji: '🧭',
    title: 'Cartógrafo del Viento',
    description: 'Navegante que dibuja mapas de corrientes de aire para globos aerostáticos y papalotes gigantes.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Predice tormentas con un frasco de agua y arena de cuarzo.'
  },
  {
    id: 'p19',
    emoji: '🦎',
    title: 'Ajolote Matemático',
    description: 'Criatura anfibia con branquias de arcoíris que calcula geometrías fractales para regenerar corales.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Usa unos diminutos anteojos de concha nacarada.'
  },
  {
    id: 'p20',
    emoji: '👩‍🏫',
    title: 'Maestra de Ciencias Extrema',
    description: 'Profesora que viaja en un furgón escolar convertido en laboratorio móvil de física cuántica.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Resuelve cualquier conflicto entre alumnos con un experimento de presión de aire.'
  },
  {
    id: 'p21',
    emoji: '🛸',
    title: 'Alienígena Archivista',
    description: 'Ser gelatinoso de Alfa Centauri que visita la Tierra exclusivamente para aprender a hacer chocolate.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Toma notas en una tableta holográfica que vibra al ritmo de la marimba.'
  },
  {
    id: 'p22',
    emoji: '🌱',
    title: 'Planta Carnívora Vegetariana',
    description: 'Un espécimen botánico mutante con boca parlante que solo consume luz solar y té de manzanilla.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Canta baladas para atraer abejas polinizadoras.'
  },
  {
    id: 'p23',
    emoji: '⚡',
    title: 'Ingeniera de Volcanes',
    description: 'Geofísica intrépida que canaliza el calor de la lava hacia turbinas limpias para dar luz a su aldea.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Viste un traje ignífugo hecho de fibras de maguey y kevlar.'
  },
  {
    id: 'p24',
    emoji: '📜',
    title: 'Escriba Maya del Futuro',
    description: 'Cronista que talla glifos en placas de silicio para que sobrevivan durante diez mil años.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Habla únicamente en oraciones con ritmo métrico de octosílabos.'
  },
  {
    id: 'p25',
    emoji: '🚴',
    title: 'Cartera de Mensajes Imposibles',
    description: 'Ciclista veloz que entrega cartas que debieron ser enviadas hace cincuenta años a sus destinatarios.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Su bicicleta no tiene frenos: solo se detiene pedaleando hacia atrás.'
  },
  {
    id: 'p26',
    emoji: '🦇',
    title: 'Camazotz Arrepentido',
    description: 'Murciélago guardián del inframundo Popol Vuh que ahora busca la luz y ayuda a los exploradores perdidos.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Posee una ecolocación tan fina que puede escuchar los latidos de un grillo a 2 kilómetros.'
  },
  {
    id: 'p27',
    emoji: '👨‍🍳',
    title: 'Chef de Sabores Científicos',
    description: 'Cocinero que explica la tabla periódica a través de platillos con puntos de fusión y ebullición insólitos.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Lleva una balanza milimétrica colgada al cuello como amuleto.'
  },
  {
    id: 'p28',
    emoji: '🪐',
    title: 'Minero de Polvo de Estrellas',
    description: 'Operario que recoge escarcha de cometas en las noches despejadas de los volcanes de fuego.',
    category: 'personaje',
    genre: 'scifi',
    trait: 'Almacena la luz cósmica en termos de doble pared al vacío.'
  },
  {
    id: 'p29',
    emoji: '🐕',
    title: 'Perro Rescatista con Brújula',
    description: 'Un sabueso inteligente con chaleco de herramientas capaz de olfatear corrientes de aire frío bajo los escombros.',
    category: 'personaje',
    genre: 'realismo',
    trait: 'Ladra en código Morse cuando encuentra agua pura.'
  },
  {
    id: 'p30',
    emoji: '🎭',
    title: 'Actor de Sombras Chinas',
    description: 'Titiritero errante cuyas siluetas sobre la manta blanca revelan secretos del futuro a quienes las contemplan.',
    category: 'personaje',
    genre: 'fantasia',
    trait: 'Mueve hasta doce dedos articulados simultáneamente.'
  },

  // ─────────────────────────────────────────────────────────────
  // ── ENTORNOS (26 ESCENARIOS RICOS, SUGERENTES Y FORMATIVOS) ──
  // ─────────────────────────────────────────────────────────────
  {
    id: 'e1',
    emoji: '🌌',
    title: 'Cenote de Datos Cuánticos',
    description: 'Un pozo de aguas cristalinas iluminado por glifos digitales flotantes que reflejan constelaciones.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e2',
    emoji: '📚',
    title: 'Biblioteca Infinita Flotante',
    description: 'Torres de estantes de caoba que levitan sobre el lago Atitlán unidas por puentes de liana.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e3',
    emoji: '🌋',
    title: 'Vientre del Volcán de Jade',
    description: 'Cavernas geotérmicas con ríos de obsidiana líquida y plataformas de roca basáltica resonante.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e4',
    emoji: '🛰️',
    title: 'Estación Orbital Solaria',
    description: 'Complejo espacial cilíndrico en órbita ecuatorial con invernaderos de microgravedad y paneles dorados.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e5',
    emoji: '🌳',
    title: 'Bosque de Ceibas Milenarias',
    description: 'Una espesa selva donde las raíces gigantes forman túneles naturales habitados por luciérnagas parlantes.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e6',
    emoji: '🧪',
    title: 'Laboratorio Escolar a Medianoche',
    description: 'El aula de ciencias donde los microscopios proyectan hologramas y los matraces despiden vapor azul.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e7',
    emoji: '🛸',
    title: 'Cementerio de Naves Estelares',
    description: 'Un valle desértico de dunas púrpuras cubierto de fuselajes oxidados y procesadores cuánticos inertes.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e8',
    emoji: '🏛️',
    title: 'Observatorio Maya de la Cumbre',
    description: 'Estructura de piedra caliza con miradores alineados exactamente con el orto helíaco de Venus.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e9',
    emoji: '🎪',
    title: 'Mercado Interdimensional de Recuerdos',
    description: 'Bazares flotantes bajo carpas de seda donde se intercambian frascos con melodías y mapas olfativos.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e10',
    emoji: '🌊',
    title: 'Arrecife Submarino Bioluminiscente',
    description: 'Jardines de coral fosforescente donde peces linterna guían expediciones arqueológicas subacuáticas.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e11',
    emoji: '🏙️',
    title: 'Metrópolis Subterránea Neón',
    description: 'Ciudad vertical construida dentro de una falla tectónica con tranvías magnéticos y jardines hidropónicos.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e12',
    emoji: '🏰',
    title: 'Fortaleza en la Isla de las Nieblas',
    description: 'Castillo de piedra volcánica rodeado por olas espumosas y gaviotas mensajeras.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e13',
    emoji: '🚂',
    title: 'Tren Transandino a Vapor Solar',
    description: 'Convoy ferroviario que cruza puentes colgantes vertiginosos propulsado por vapor y energía solar.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e14',
    emoji: '🏕️',
    title: 'Campamento Científico en la Selva Lacandona',
    description: 'Tiendas geodésicas de campaña equipadas con computadoras portátiles y antenas satelitales entre la bruma.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e15',
    emoji: '💎',
    title: 'Caverna de Cristales de Cuarzo Gigantes',
    description: 'Cueva donde los minerales miden diez metros de altura y afinan las ondas sonoras de las voces.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e16',
    emoji: '🌾',
    title: 'Milpa Sagrada bajo la Aurora Boreal',
    description: 'Campos de maíz silvestre cuyas espigas despiden chispas doradas bajo un cielo electromagnético.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e17',
    emoji: '🏫',
    title: 'Patio Central de la Escuela en Recreo',
    description: 'Espacio lleno de canchas de baloncesto, murales coloridos y niños armando circuitos con plastilina.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e18',
    emoji: '🛰️',
    title: 'Base Lunar con Cúpula Hidropónica',
    description: 'Invernadero cerrado con vistas a la canica azul de la Tierra y suelo de regolito enriquecido.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e19',
    emoji: '🛶',
    title: 'Canal de Manglares en Marea Baja',
    description: 'Laberinto de raíces zancudas donde conviven garzas tigre, manatíes y pescadores artesanales.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e20',
    emoji: '🕰️',
    title: 'Taller de Relojes de Arena Cósmica',
    description: 'Buhardilla llena de engranajes de latón, péndulos resonantes y mapas celestes con esferas armilares.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e21',
    emoji: '🤖',
    title: 'Fábrica Automatizada de Nanopartículas',
    description: 'Línea de ensamblaje quirúrgica donde brazos robóticos manipulan moléculas con lásers de precisión.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e22',
    emoji: '⛺',
    title: 'Feria Comunal del Trueque',
    description: 'Plaza de adoquín donde las comunidades intercambian semillas de frijol, telares y libros ilustrados.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e23',
    emoji: '🏔️',
    title: 'Paso Nevado de los Cuchumatanes',
    description: 'Sendero a cuatro mil metros sobre el nivel del mar donde los pastores ovinos conversan con el viento.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e24',
    emoji: '🕳️',
    title: 'Umbral del Xibalbá Mitológico',
    description: 'La mítica entrada al inframundo maya con casas de navajas, de frío y de jaguares enigmáticos.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e25',
    emoji: '🛰️',
    title: 'Túnel de Acelerador de Hadrones Escolar',
    description: 'Anillo electromagnético circular bajo el suelo de la academia para colisionar partículas atómicas.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e26',
    emoji: '🌴',
    title: 'Archipiélago de Atolones de Coral',
    description: 'Islotes arenosos de palmeras dobladas por el alisio y faros antiguos con espejos de Fresnel.',
    category: 'entorno',
    genre: 'realismo'
  },

  // ─────────────────────────────────────────────────────────────
  // ── ATMÓSFERAS Y CONDICIONES SENSORIALES (22 OPCIONES) ───────
  // ─────────────────────────────────────────────────────────────
  {
    id: 'a1',
    emoji: '⚡',
    title: 'Tormenta Electromagnética',
    description: 'Rayos violetas silenciosos que hacen chisporrotear los compases y levantan el vello de los brazos.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a2',
    emoji: '🌫️',
    title: 'Niebla de Susurros Antiguos',
    description: 'Una bruma densa y fresca que transporta ecos de palabras habladas hace cientos de años.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a3',
    emoji: '🌧️',
    title: 'Lluvia Torrencial de Madrugada',
    description: 'El sonido incesante de gotas pesadas sobre el tejado mientras los faroles titilan con el viento.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a4',
    emoji: '🕯️',
    title: 'Penumbra Mística de Copal',
    description: 'El aroma penetrante del incienso sagrado entre velas de cera que dibujan sombras protectoras.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a5',
    emoji: '❄️',
    title: 'Frío Cósmico de Gravedad Cero',
    description: 'Una calma gélida donde el aliento forma cristales geométricos suspendidos en el aire.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a6',
    emoji: '🔥',
    title: 'Calor Sofocante con Viento Seco',
    description: 'El aire ardiente ondea sobre los caminos y las chicharras marcan el compás de la siesta obligatoria.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a7',
    emoji: '✨',
    title: 'Lluvia de Polvo de Estrellas',
    description: 'Una suave cascada de partículas doradas que iluminan la noche y despiertan a los animales dormidos.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a8',
    emoji: '🚨',
    title: 'Cuenta Regresiva con Sirenas Rojas',
    description: 'Pulsos de luz de emergencia y alarmas rítmicas anunciando que solo restan tres minutos de oxígeno.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a9',
    emoji: '🤫',
    title: 'Silencio Táctico Absoluto',
    description: 'Una quietud tan profunda que se escucha el tic-tac de un reloj de cuerda a cuarenta metros.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a10',
    emoji: '🌕',
    title: 'Claridad Plateada de Luna Llena',
    description: 'La luz lunar proyecta sombras tan nítidas como las del mediodía sobre los volcanes y maizales.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a11',
    emoji: '🌈',
    title: 'Refracción Óptica de Doble Arcoíris',
    description: 'Prismas gigantescos en la atmósfera que descomponen la luz solar en siete gamas cromáticas puras.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a12',
    emoji: '📻',
    title: 'Interferencia de Estática y Ruido Blanco',
    description: 'Ondas radiales erráticas que llenan los audífonos con fragmentos de transmisiones lejanas.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a13',
    emoji: '🍃',
    title: 'Viento Alisio con Aroma a Pino y Resina',
    description: 'Brizas montañosas frescas que despejan los cielos y mecen los columpios de los huertos.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a14',
    emoji: '🧪',
    title: 'Atmósfera Saturada de Ozono',
    description: 'Un olor metálico penetrante que anticipa la llegada de una descarga de energía masiva.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a15',
    emoji: '🌸',
    title: 'Florecimiento Súbito Primaveral',
    description: 'Millones de pétalos de jacaranda flotando en el aire al compás de la campana escolar.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a16',
    emoji: '🌀',
    title: 'Vórtice Dimensional Intermitente',
    description: 'El espacio se distorsiona en espirales de luz que cambian el tamaño de los objetos cercanos.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a17',
    emoji: '🌅',
    title: 'Crepúsculo Dorado de Cinco Minutos',
    description: 'Los últimos rayos horizontales del sol transforman las nubes en franjas de fuego naranja y cobrizo.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a18',
    emoji: '📡',
    title: 'Zumbido Sub-sónico Profundo',
    description: 'Una vibración sorda que se siente en el pecho antes de que ocurra un movimiento tectónico.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a19',
    emoji: '🕯️',
    title: 'Vigilia Escolar tras el Corte de Luz',
    description: 'Lámparas de mano iluminando pizarras mientras afuera los truenos retumban en el valle.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a20',
    emoji: '🌟',
    title: 'Fosforescencia Vegetal Nocturna',
    description: 'Musgos y líquenes en las paredes que brillan en color cian cuando alguien se aproxima con calma.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a21',
    emoji: '⏳',
    title: 'Tensión de los Últimos Sesenta Segundos',
    description: 'El segundero del reloj de pared resuena como un martillo en la sala de examen.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a22',
    emoji: '🌌',
    title: 'Eclipse Solar Total al Mediodía',
    description: 'La corona solar reluce en un cielo negro como la tinta donde asoman los planetas en pleno día.',
    category: 'atmosfera',
    genre: 'fantasia'
  },

  // ─────────────────────────────────────────────────────────────
  // ── MOTIVACIONES Y CONFLICTOS DRAMÁTICOS (24 OPCIONES) ───────
  // ─────────────────────────────────────────────────────────────
  {
    id: 'm1',
    emoji: '🌽',
    title: 'Recuperar la Semilla Madre Sagrada',
    description: 'Encontrar el grano originario antes del eclipse para garantizar que los campos vuelvan a florecer.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm2',
    emoji: '🔋',
    title: 'Restaurar la Energía de Emergencia',
    description: 'Conectar las baterías auxiliares de la estación antes de que los soportes vitales se agoten.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm3',
    emoji: '🤝',
    title: 'Demostrar la Inocencia de su Compañero',
    description: 'Reunir pruebas científicas inapelables para revocar una acusación injusta en la escuela.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm4',
    emoji: '📜',
    title: 'Descifrar el Glifo Perdido del Popol Vuh',
    description: 'Traducir una inscripción antes de que la humedad de la cueva borre los pigmentos minerales.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm5',
    emoji: '🛡️',
    title: 'Detener el Algoritmo Rebelde',
    description: 'Reescribir las directivas éticas de la inteligencia artificial central antes de que bloquee las compuertas.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm6',
    emoji: '🏆',
    title: 'Ganar la Feria de Ciencias con Piezas Recicladas',
    description: 'Construir un purificador de agua con botellas y carbón activado frente a los jueces escépticos.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm7',
    emoji: '❤️',
    title: 'Sanar el Corazón Petrificado del Guardián',
    description: 'Descubrir qué palabra bondadosa romperá el hechizo de piedra que congela al guardián del bosque.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm8',
    emoji: '📡',
    title: 'Transmitir la Señal de Esperanza al Planeta',
    description: 'Alinear la antena parabólica manual en la torre más alta durante la tormenta para pedir auxilio.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm9',
    emoji: '🕊️',
    title: 'Reconciliar a Dos Familias Enfrentadas',
    description: 'Organizar un concierto con la marimba del pueblo para que recuerden su historia compartida.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm10',
    emoji: '💧',
    title: 'Encontrar el Manantial de Agua Pura',
    description: 'Guiar a la comunidad hacia una fuente subterránea no contaminada siguiendo el vuelo de las golondrinas.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm11',
    emoji: '🗺️',
    title: 'Completar el Atlas de las Estrellas Olvidadas',
    description: 'Registrar diez constelaciones que ya no figuran en las cartas celestes modernas.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm12',
    emoji: '🚀',
    title: 'Evitar la Colisión del Asteroide',
    description: 'Calcular el ángulo de desvío preciso disparando un cohete propulsor casero en el momento exacto.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm13',
    emoji: '🎭',
    title: 'Superar el Miedo a Hablar en Público',
    description: 'Subir al escenario escolar para defender la preservación de los bosques locales ante trescientas personas.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm14',
    emoji: '🗝️',
    title: 'Abrir el Cofre que Guarda los Colores',
    description: 'Encontrar los tres prismas mágicos antes de que el mundo quede sumido en blanco y negro para siempre.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm15',
    emoji: '💾',
    title: 'Rescatar la Memoria del Robot Antiguo',
    description: 'Extraer el chip con los recuerdos del abuelo del androide antes de que su batería se degrade al 0%.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm16',
    emoji: '🏕️',
    title: 'Construir un Refugio Seguro antes del Anochecer',
    description: 'Usar ramas de pino y lianas con nudos marineros para proteger a sus hermanos menores de la lluvia.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm17',
    emoji: '🔥',
    title: 'Proteger la Llama de la Noche Más Fría',
    description: 'Alimentar la fogata comunal con leña seca sin que los vientos huracanados apaguen la única fuente de calor.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm18',
    emoji: '🩺',
    title: 'Encontrar el Antídoto Botánico',
    description: 'Identificar la hoja medicinal correcta en el herbario para neutralizar la picadura de un insecto raro.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm19',
    emoji: '🕰️',
    title: 'Sincronizar el Reloj Central de la Ciudad',
    description: 'Alinear los tres engranajes maestros para que el tren de pasajeros no parta con retraso fatal.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm20',
    emoji: '🦅',
    title: 'Liberar al Quetzal del Encierro',
    description: 'Burlar a los cazadores furtivos y abrir la jaula en la cima de la reserva natural.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm21',
    emoji: '🌟',
    title: 'Hacer Reír a la Tormenta Furiosa',
    description: 'Descubrir qué chiste o cuento popular calmará la ira del dios del viento Juracán.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm22',
    emoji: '💻',
    title: 'Restablecer el Servidor Comunitario',
    description: 'Configurar una red local Wi-Fi con antenas de lata para que los niños del caserío puedan estudiar.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm23',
    emoji: '🕳️',
    title: 'Tapar la Fisura del Casco Espacial',
    description: 'Improvisar un parche hermético con resina epóxica antes de que la cabina pierda atmósfera.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm24',
    emoji: '🤝',
    title: 'Aprender a Pedir Ayuda a Tiempo',
    description: 'Reconocer que el desafío supera sus fuerzas individuales y forjar una alianza con su rival de clase.',
    category: 'motivacion',
    genre: 'realismo'
  }
];
