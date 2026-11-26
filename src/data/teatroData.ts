export type RouteId = 'inicio' | 'proceso' | 'ejercicios' | 'organizacion' | 'consejos';

export interface NavItem {
  id: RouteId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface ThermometerItem {
  id: string;
  label: string;
  hint: string;
  score: number; // 1 a 5
}

export interface ProcessPhase {
  id: number;
  title: string;
  subtitle: string;
  durationHint: string;
  objective: string;
  deliverables: string[];
  commonMistakes: string[];
  checklist: { id: string; text: string }[];
}

export type ExerciseCategory =
  | 'Todos'
  | 'Cuerpo y Espacio'
  | 'Voz y Dicción'
  | 'Improvisación'
  | 'Cohesión Grupal';

export interface TheaterExercise {
  id: string;
  title: string;
  category: Exclude<ExerciseCategory, 'Todos'>;
  durationMinutes: number;
  level: 'Inicial' | 'Intermedio' | 'Avanzado';
  objective: string;
  steps: string[];
  teacherTip: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  tagline: string;
  mission: string;
  responsibilities: string[];
  idealProfile: string;
  proTip: string;
  colorToken: string;
}

export type PlayFormat = 'corta' | 'clasica' | 'coral';

export interface GoldenRule {
  id: string;
  title: string;
  category: string;
  summary: string;
  practicalSteps: string[];
  emergencyPhrase?: string;
  iconName: 'volume' | 'eye' | 'heart' | 'shield' | 'award';
}

export const VALID_THEATER_ROUTES: RouteId[] = [
  'inicio',
  'proceso',
  'ejercicios',
  'organizacion',
  'consejos',
];

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    shortLabel: 'Inicio',
    description: 'Fundamentos del teatro escolar y diagnóstico escénico',
  },
  {
    id: 'proceso',
    label: 'El Proceso Teatral',
    shortLabel: 'Proceso',
    description: 'Ruta de montaje paso a paso en 6 fases profesionales',
  },
  {
    id: 'ejercicios',
    label: 'Laboratorio de Ejercicios',
    shortLabel: 'Ejercicios',
    description: 'Dinámicas prácticas de cuerpo, voz, improvisación y grupo',
  },
  {
    id: 'organizacion',
    label: 'Organización de Grupos',
    shortLabel: 'Grupos',
    description: 'Departamentos teatrales, distribuidor de elenco y cronograma',
  },
  {
    id: 'consejos',
    label: 'Consejos de Escena',
    shortLabel: 'Consejos',
    description: 'Reglas de oro, salvavidas en vivo y control del miedo escénico',
  },
];

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'Todos',
  'Cuerpo y Espacio',
  'Voz y Dicción',
  'Improvisación',
  'Cohesión Grupal',
];

export const INITIAL_THERMOMETER_PILLARS: ThermometerItem[] = [
  {
    id: 'texto',
    label: 'Texto y concepto definidos',
    hint: '¿El grupo ya leyó la obra completa y entiende el mensaje central?',
    score: 3,
  },
  {
    id: 'compromiso',
    label: 'Asistencia y compromiso grupal',
    hint: '¿Los ensayos inician a tiempo y hay respeto por el acuerdo del equipo?',
    score: 4,
  },
  {
    id: 'cuerpoVoz',
    label: 'Entrenamiento de cuerpo y voz',
    hint: '¿Hacen calentamientos vocales y físicos antes de ensayar escenas?',
    score: 2,
  },
  {
    id: 'roles',
    label: 'Equilibrio entre elenco y equipo técnico',
    hint: '¿Hay responsables claros de luces, sonido, utilería y vestuario?',
    score: 3,
  },
  {
    id: 'plan',
    label: 'Calendario hacia el estreno',
    hint: '¿Tienen fechas límite para dejar el guion y hacer el ensayo general?',
    score: 3,
  },
];

export const PROCESS_PHASES: ProcessPhase[] = [
  {
    id: 1,
    title: 'Elección del texto y concepto',
    subtitle: 'El punto de partida artístico',
    durationHint: 'Semana 1',
    objective:
      'Seleccionar una obra acorde al tamaño, madurez y tiempo del grupo, definiendo una propuesta estética clara (época, tono y mensaje central).',
    deliverables: [
      'Guion impreso y numerado por páginas y escenas para todo el equipo.',
      'Manifiesto de concepto en una página (tema central, paleta de colores y atmósfera).',
      'Desglose preliminar de necesidades técnicas (espacios, utilería clave y vestuario).',
    ],
    commonMistakes: [
      'Elegir obras demasiado largas o con demasiados cambios complejos de escenografía.',
      'No verificar si el reparto real coincide con los personajes principales.',
      'Empezar a memorizar sin entender el conflicto central de la historia.',
    ],
    checklist: [
      { id: 'p1-1', text: 'El texto completo fue leído y aprobado según el tiempo real disponible.' },
      { id: 'p1-2', text: 'Definimos en una frase de qué trata nuestra obra y qué queremos provocar.' },
      { id: 'p1-3', text: 'Cada estudiante cuenta con su copia física o digital del guion.' },
    ],
  },
  {
    id: 2,
    title: 'Lectura de mesa y análisis de personajes',
    subtitle: 'Comprender antes de moverse',
    durationHint: 'Semana 2',
    objective:
      'Desmenuzar el texto en grupo para identificar conflictos, objetivos de cada personaje, subtextos y el arco dramático de principio a fin.',
    deliverables: [
      'Guion rayado con unidades de acción, pausas e intenciones emocionales.',
      'Ficha de personaje completa (qué quiere, qué se lo impide, cómo habla y camina).',
      'Glosario de palabras poco comunes o referencias históricas del texto.',
    ],
    commonMistakes: [
      'Leer rápido o de forma monótona solo para terminar la sesión.',
      'Saltarse esta fase por ansiedad de "pararse ya a actuar".',
      'Juzgar al personaje en lugar de comprender sus motivaciones reales.',
    ],
    checklist: [
      { id: 'p2-1', text: 'Realizamos al menos dos lecturas completas en mesa escuchándonos.' },
      { id: 'p2-2', text: 'Cada actor conoce el objetivo principal de su personaje en cada escena.' },
      { id: 'p2-3', text: 'El equipo técnico asistió a la lectura para detectar necesidades.' },
    ],
  },
  {
    id: 3,
    title: 'Trazo escénico (Blocking)',
    subtitle: 'Arquitectura del movimiento en el escenario',
    durationHint: 'Semanas 3 y 4',
    objective:
      'Establecer entradas, salidas, desplazamientos, niveles corporales y relaciones espaciales claras para que la historia se entienda incluso sin sonido.',
    deliverables: [
      'Plano básico del escenario con zonas marcadas (proscenio, centro, foro, laterales).',
      'Cuaderno de dirección con anotaciones de cada movimiento clave.',
      'Escenas levantadas de pie con marcas de piso (cinta adhesiva) simulando la escenografía.',
    ],
    commonMistakes: [
      'Dar la espalda al público sin justificación dramática o tapar a compañeros.',
      'Aglomerar a todos los personajes en una sola línea horizontal.',
      'Caminar sin intención mientras se dicen parlamentos importantes.',
    ],
    checklist: [
      { id: 'p3-1', text: 'Todas las escenas tienen entradas, salidas y desplazamientos definidos.' },
      { id: 'p3-2', text: 'Los actores anotaron sus movimientos con lápiz en el margen del guion.' },
      { id: 'p3-3', text: 'La visibilidad desde todos los ángulos del público fue revisada.' },
    ],
  },
  {
    id: 4,
    title: 'Ensayos parciales y ritmo',
    subtitle: 'Precisión, verdad y memoria orgánica',
    durationHint: 'Semanas 5 y 6',
    objective:
      'Consolidar la memorización sin guion en mano, afinar la escucha entre actores, pulir el ritmo de las réplicas y profundizar la verdad emocional.',
    deliverables: [
      'Fecha límite "sin libreto" cumplida por todo el elenco.',
      'Transiciones entre escenas cronometradas (máximo 15-20 segundos en oscuros).',
      'Integración de utilería de ensayo (objetos sustitutos de peso y tamaño similar).',
    ],
    commonMistakes: [
      'Dejar pausas muertas entre un diálogo y otro por esperar a que el otro termine.',
      'Repetir la escena siempre igual, perdiendo frescura y escucha real.',
      'Ensayar sin objetos hasta el último día, generando torpeza en el estreno.',
    ],
    checklist: [
      { id: 'p4-1', text: 'El elenco domina el texto sin depender del guion ni de apuntadores.' },
      { id: 'p4-2', text: 'El ritmo de las escenas mantiene la tensión y la atención del espectador.' },
      { id: 'p4-3', text: 'Los cambios de escena están coreografiados con el equipo de tramoya.' },
    ],
  },
  {
    id: 5,
    title: 'Ensayo técnico y general',
    subtitle: 'Integración total de la maquinaria teatral',
    durationHint: 'Semana 7',
    objective:
      'Sincronizar actuación con iluminación, sonido, vestuario, maquillaje y escenografía definitiva. El ensayo general se corre sin interrupciones como si ya hubiera público.',
    deliverables: [
      'Guion técnico (Cue Sheet) numerado para operadores de luz y sonido.',
      'Mesa de utilería organizada por orden de entrada en ambos laterales.',
      'Al menos dos corridas completas (ensayos generales) con vestuario y tiempos reales.',
    ],
    commonMistakes: [
      'Detener el ensayo general ante pequeños errores en vez de practicar cómo resolverlos.',
      'Probar pistas de audio o micrófonos el mismo día de la función.',
      'Olvidar planificar los saludos finales (cortina) con energía y orden.',
    ],
    checklist: [
      { id: 'p5-1', text: 'Luces, música y efectos tienen sus pies (cues) probados y anotados.' },
      { id: 'p5-2', text: 'El vestuario permite moverse, sentarse y cambiarse con agilidad.' },
      { id: 'p5-3', text: 'Realizamos una corrida completa sin cortes, incluyendo saludo final.' },
    ],
  },
  {
    id: 6,
    title: 'Función y retroalimentación',
    subtitle: 'El encuentro vivo con el público',
    durationHint: 'Semana 8',
    objective:
      'Entregar el trabajo con presencia, calma y disfrute colectivo, y cerrar el proceso pedagógico con una sesión de reflexión constructiva post-función.',
    deliverables: [
      'Calentamiento grupal de cuerpo y voz 45 minutos antes de abrir puertas.',
      'Check-list de escenario y camerinos antes y después de la función.',
      'Círculo de cierre: aprendizajes, logros del equipo y archivo fotográfico/video.',
    ],
    commonMistakes: [
      'Llegar tarde o pasar los minutos previos mirando el celular en lugar de conectar.',
      'Acelerar los diálogos por los nervios o reírse si alguien comete un error.',
      'Desarmar todo sin celebrar ni reflexionar sobre lo aprendido en el proceso.',
    ],
    checklist: [
      { id: 'p6-1', text: 'Completamos el calentamiento físico, vocal y círculo de energía.' },
      { id: 'p6-2', text: 'El espacio quedó limpio, ordenado y con toda la utilería inventariada.' },
      { id: 'p6-3', text: 'Realizamos una sesión de retroalimentación respetuosa y formativa.' },
    ],
  },
];

export const THEATER_EXERCISES: TheaterExercise[] = [
  {
    id: 'ex-1',
    title: 'Equilibrio del Espacio (El Tablero)',
    category: 'Cuerpo y Espacio',
    durationMinutes: 6,
    level: 'Inicial',
    objective:
      'Desarrollar conciencia espacial colectiva, ritmo grupal y presencia escénica sin hablar.',
    steps: [
      'Todo el grupo camina por el salón imaginando que el piso es una tabla equilibrada sobre un punto central.',
      'Sin ponerse de acuerdo verbalmente, deben ocupar todo el espacio de forma equitativa para que "la tabla no se vuelque".',
      'El docente indica niveles de energía del 1 (cámara lenta) al 5 (prisa contenida sin correr).',
      'A una palmada, todo el grupo debe detenerse exactamente al mismo segundo mirando un punto fijo.',
    ],
    teacherTip:
      'Pide que mantengan la mirada horizontal (nunca al suelo) y usen la visión periférica para percibir a sus compañeros.',
  },
  {
    id: 'ex-2',
    title: 'Esculturas de Emoción y Niveles',
    category: 'Cuerpo y Espacio',
    durationMinutes: 8,
    level: 'Intermedio',
    objective:
      'Explorar la expresividad corporal, el uso de niveles (bajo, medio, alto) y la composición visual.',
    steps: [
      'En parejas, uno es "escultor" y el otro es "arcilla" neutral.',
      'El escultor moldea suavemente (o indicando a distancia) una postura que exprese un concepto: "traición", "esperanza", "urgencia" o "secreto".',
      'La arcilla mantiene la postura 15 segundos y añade una expresión facial coherente.',
      'El resto recorre la "galería" observando qué hace legible cada postura; luego cambian roles.',
    ],
    teacherTip:
      'Recuerda enfatizar el respeto físico: se puede moldear indicando con gestos sin necesidad de contacto directo.',
  },
  {
    id: 'ex-3',
    title: 'Respiración Diafragmática y Flecha Vocal',
    category: 'Voz y Dicción',
    durationMinutes: 5,
    level: 'Inicial',
    objective:
      'Activar el apoyo respiratorio para proyectar la voz sin lastimar la garganta.',
    steps: [
      'De pie, pies al ancho de los hombros y rodillas ligeramente flexibles. Coloca una mano en el abdomen.',
      'Inhala por la nariz en 4 tiempos sintiendo cómo se expande el abdomen (sin levantar los hombros).',
      'Exhala emitiendo una "S" continua y constante durante 10 segundos, imaginando un hilo de aire firme.',
      'Repite lanzando la sílaba "MA" hacia la pared del fondo como si fuera una flecha con arco, nunca gritando.',
    ],
    teacherTip:
      'Si un estudiante levanta los hombros o tensa el cuello, pídele que suelte los brazos y gire suavemente la cabeza antes de repetir.',
  },
  {
    id: 'ex-4',
    title: 'Trabalenguas con Intención Dramática',
    category: 'Voz y Dicción',
    durationMinutes: 7,
    level: 'Intermedio',
    objective:
      'Mejorar la articulación consonántica mientras se entrena el cambio de emoción y subtexto.',
    steps: [
      'Todos practican un trabalenguas clásico exagerando el movimiento de labios y lengua (ej. "Tres tristes tigres..." o "El cielo está enladrillado...").',
      'Primero se dice en susurro proyectado (que se entienda en todo el salón sin volumen alto).',
      'Luego, por turnos, cada estudiante dice el mismo trabalenguas como si fuera una confesión secreta, una noticia urgente o un discurso solemne.',
      'El grupo adivina qué intención eligió el intérprete evaluando claridad y verdad.',
    ],
    teacherTip:
      'Asegúrate de que las consonantes finales (s, d, r, t) no se pierdan al terminar cada frase.',
  },
  {
    id: 'ex-5',
    title: 'La Regla de Oro: "Sí, y además..."',
    category: 'Improvisación',
    durationMinutes: 8,
    level: 'Inicial',
    objective:
      'Entrenar la escucha activa, la aceptación de propuestas y la construcción colaborativa de escenas.',
    steps: [
      'En parejas o en círculo, un estudiante propone una situación concreta (ej. "Qué bueno que trajiste las llaves de la nave espacial").',
      'El compañero debe responder empezando mental o literalmente con "Sí, y además..." sumando un dato nuevo.',
      'Está prohibido negar la realidad del otro (nunca decir "no, no es una nave, es un salón").',
      'Construyan 6 a 8 intercambios rápidos hasta encontrar un cierre natural.',
    ],
    teacherTip:
      'Esta es la mejor herramienta para que el elenco aprenda a rescatarse mutuamente si alguien olvida una línea en escena.',
  },
  {
    id: 'ex-6',
    title: 'Cambio de Estatus en la Sala de Espera',
    category: 'Improvisación',
    durationMinutes: 10,
    level: 'Avanzado',
    objective:
      'Comprender cómo la postura, la mirada y el ritmo comunican jerarquía y conflicto entre personajes.',
    steps: [
      'Se colocan tres sillas formando una sala de espera (médico, oficina o estación).',
      'Entran dos actores con un estatus asignado en secreto del 1 (muy inseguro) al 10 (autoridad absoluta).',
      'Deben interactuar durante 2 minutos sin mencionar su número, usando solo postura, uso del espacio y tono vocal.',
      'A la señal del docente, intercambian estatus drásticamente dentro de la misma escena.',
    ],
    teacherTip:
      'Al terminar, pregunta al grupo qué señales físicas revelaron quién tenía el estatus alto y quién el bajo.',
  },
  {
    id: 'ex-7',
    title: 'Contar hasta 20 sin Superponerse',
    category: 'Cohesión Grupal',
    durationMinutes: 5,
    level: 'Inicial',
    objective:
      'Generar silencio activo, concentración colectiva y sentido de tiempo compartido antes de ensayar.',
    steps: [
      'El grupo forma un círculo mirando hacia el centro (puede hacerse con ojos abiertos enfocando al grupo).',
      'El objetivo es contar del 1 al 20 diciendo un número por persona, en orden aleatorio y sin pactar turnos.',
      'Si dos personas dicen un número al mismo tiempo, el conteo regresa inmediatamente a 1 con calma y sin reproches.',
      'Al lograrlo, observen cómo cambió la respiración y la atención del grupo.',
    ],
    teacherTip:
      'Ideal para iniciar un ensayo cuando el grupo llega disperso o agitado después de clases.',
  },
  {
    id: 'ex-8',
    title: 'El Espejo Coral',
    category: 'Cohesión Grupal',
    durationMinutes: 7,
    level: 'Intermedio',
    objective:
      'Fomentar la empatía física, la observación profunda y el liderazgo rotativo en escena.',
    steps: [
      'En parejas frente a frente, uno guía movimientos lentos y fluidos mientras el otro los refleja con exactitud.',
      'Tras 2 minutos, el docente dice "cambio" sin que el movimiento se detenga: el seguidor pasa a liderar.',
      'Nivel grupal: forman un diamante de 4 personas; quien queda al frente guía a los otros tres; al girar 90 grados, cambia automáticamente el líder.',
      'Cierren respirando juntos 3 veces al unísono.',
    ],
    teacherTip:
      'Recuerda al líder que su trabajo no es "confundir" al compañero, sino hacerlo brillar con movimientos claros y fluidos.',
  },
];

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'direccion',
    name: 'Dirección y Asistencia',
    tagline: 'La brújula artística y organizativa del montaje',
    mission:
      'Unificar la visión estética de la obra, guiar el trabajo actoral, coordinar a todos los departamentos y cuidar el cumplimiento del calendario de ensayos.',
    responsibilities: [
      'Dirigir la lectura de mesa, el trazo escénico y el ritmo de los ensayos.',
      'Llevar el cuaderno de dirección (asistente) con marcas, tiempos y faltas.',
      'Resolver dudas creativas manteniendo un ambiente respetuoso y exigente.',
    ],
    idealProfile: 'Estudiantes observadores, organizados, con escucha empática y capacidad de liderazgo sereno.',
    proTip:
      'En teatro escolar, contar con un Asistente de Dirección estudiantil libera al docente para enfocarse en el acompañamiento pedagógico.',
    colorToken: 'hsl(350, 65%, 35%)',
  },
  {
    id: 'actuacion',
    name: 'Elenco Actoral',
    tagline: 'Cuerpo, voz y verdad emocional en escena',
    mission:
      'Dar vida a los personajes con compromiso físico, claridad vocal y generosidad hacia sus compañeros, sosteniendo la historia de principio a fin.',
    responsibilities: [
      'Memorizar sus textos y movimientos dentro de las fechas acordadas.',
      'Asistir con ropa cómoda de ensayo, lápiz y agua.',
      'Cuidar su utilería de mano y respetar el silencio absoluto tras bambalinas.',
    ],
    idealProfile: 'Estudiantes dispuestos a explorar emociones, trabajar en equipo y aceptar correcciones con madurez.',
    proTip:
      'No existen "papeles pequeños": un personaje breve bien construido puede transformar el ritmo de toda una escena.',
    colorToken: 'hsl(38, 75%, 45%)',
  },
  {
    id: 'escenografia',
    name: 'Escenografía y Utilería',
    tagline: 'Arquitectos del mundo donde vive la historia',
    mission:
      'Diseñar, construir y gestionar el espacio escénico y los objetos manipulados por los actores, logrando máxima expresividad con recursos escolares inteligentes.',
    responsibilities: [
      'Crear bocetos y planos sencillos adaptados al escenario o salón real.',
      'Elaborar la lista de utilería (mesa de objetos) y verificarla antes de cada función.',
      'Ejecutar los cambios de escena (tramoya) de forma silenciosa y cronometrada.',
    ],
    idealProfile: 'Estudiantes creativos con habilidades manuales, visión espacial y gusto por el diseño o reciclaje creativo.',
    proTip:
      'Menos es más: tres cubos de madera bien pintados pueden ser bancas, mesas, muros o barcos según cómo los usen los actores.',
    colorToken: 'hsl(152, 38%, 36%)',
  },
  {
    id: 'vestuario',
    name: 'Vestuario y Maquillaje',
    tagline: 'Identidad visual y carácter de cada personaje',
    mission:
      'Definir la paleta cromática y las prendas que cuentan quién es cada personaje antes de que diga su primera palabra, cuidando la coherencia estética.',
    responsibilities: [
      'Diseñar fichas de vestuario por personaje usando prendas base y detalles clave.',
      'Organizar percheros etiquetados y kit de emergencia (alfileres, aguja, hilo, cinta).',
      'Aplicar maquillaje escénico limpio que ayude a definir rasgos bajo las luces.',
    ],
    idealProfile: 'Estudiantes detallistas, con sensibilidad estética, sentido del color y orden logístico.',
    proTip:
      'Unifica la paleta de colores de toda la obra (ej. tonos tierra y un acento borgoña) para lograr un aspecto inmediatamente profesional.',
    colorToken: 'hsl(268, 35%, 45%)',
  },
  {
    id: 'iluminacion',
    name: 'Iluminación y Sonido',
    tagline: 'Atmósfera, emoción y ritmo técnico',
    mission:
      'Construir el clima sensorial de cada escena mediante cambios de luz, música incidental y efectos sonoros ejecutados con precisión milimétrica.',
    responsibilities: [
      'Seleccionar y editar pistas de audio libres de derechos y efectos limpios.',
      'Armar el guion técnico (Cue Sheet) indicando la frase exacta donde entra cada luz o sonido.',
      'Realizar pruebas de volumen y visibilidad desde la última fila del público.',
    ],
    idealProfile: 'Estudiantes atentos, serenos bajo presión, con interés en tecnología, música y precisión.',
    proTip:
      'Descarga siempre todos los audios localmente en formato MP3/WAV y ten un respaldo en USB; nunca dependas del Wi-Fi en una función.',
    colorToken: 'hsl(210, 50%, 40%)',
  },
  {
    id: 'produccion',
    name: 'Producción y Comunicación',
    tagline: 'El puente entre el montaje y la comunidad escolar',
    mission:
      'Asegurar los permisos, recursos, difusión, programas de mano y recepción del público para que la función se viva como un verdadero evento cultural.',
    responsibilities: [
      'Diseñar el cartel, invitaciones digitales y el programa de mano con todos los créditos.',
      'Gestionar préstamos de espacios, sillas, permisos institucionales y control de presupuesto.',
      'Recibir y acomodar al público el día de la función, coordinando fotografía y video.',
    ],
    idealProfile: 'Estudiantes comunicativos, resolutivos, con talento en diseño gráfico, escritura o gestión.',
    proTip:
      'Incluye en el programa de mano los nombres de TODO el equipo (técnicos y actores por igual): el teatro es un arte colectivo.',
    colorToken: 'hsl(18, 65%, 45%)',
  },
];

export const GOLDEN_RULES: GoldenRule[] = [
  {
    id: 'rule-1',
    title: 'Proyección Vocal: Hablar para la última fila sin gritar',
    category: 'Voz y Presencia',
    summary:
      'Proyectar no es subir el volumen desde la garganta, sino dirigir el aire apoyado en el diafragma hacia un punto lejano con excelente articulación.',
    practicalSteps: [
      'Apunta tu voz hacia la persona sentada en la última fila del auditorio, incluso cuando hables en tono íntimo.',
      'Articula claramente las consonantes (sobre todo las finales) para que el texto no se "mastique".',
      'Evita bajar el volumen al final de las oraciones: las últimas dos palabras suelen contener el sentido de la frase.',
    ],
    iconName: 'volume',
  },
  {
    id: 'rule-2',
    title: 'Lenguaje Corporal y la Regla de los Tres Cuartos',
    category: 'Cuerpo y Escenario',
    summary:
      'El público lee tu cuerpo antes de escuchar tus palabras. Mantén una postura abierta hacia la audiencia sin perder conexión con tus compañeros.',
    practicalSteps: [
      'Gira tu torso en ángulo de 3/4 hacia el público cuando dialogas en lateral para compartir tu rostro y proyección.',
      'Evita balancearte sobre los pies o mover las manos repetitivamente por nervios; cada gesto debe nacer de una intención.',
      'Mantén las piernas firmes al decir una línea crucial: la quietud bien usada genera magnetismo escénico.',
    ],
    iconName: 'eye',
  },
  {
    id: 'rule-3',
    title: 'Escucha Activa: Actuar es reaccionar',
    category: 'Trabajo en Equipo',
    summary:
      'Un gran actor no es el que espera su turno para recitar, sino el que escucha al otro como si oyera esas palabras por primera vez en su vida.',
    practicalSteps: [
      'Mantente en personaje incluso cuando no tienes diálogo: tus reacciones silenciosas cuentan la mitad de la escena.',
      'Mira a los ojos de tu compañero cuando te habla; el contacto real calma los nervios y vuelve creíble el vínculo.',
      'Permite que las palabras del otro te afecten antes de responder, respetando el ritmo vivo de la escena.',
    ],
    iconName: 'heart',
  },
  {
    id: 'rule-4',
    title: 'Protocolo de Emergencia: ¿Qué hacer si alguien olvida un parlamento?',
    category: 'Salvavidas en Vivo',
    summary:
      'Los "blancos" de memoria le ocurren hasta a actores profesionales. El público no tiene el guion en la mano: si no entras en pánico, nadie lo notará.',
    practicalSteps: [
      'Nunca te disculpes, te rías ni mires hacia los laterales buscando ayuda; mantente dentro de la situación.',
      'Si el olvido es tuyo: respira, mira a tu compañero y di con tus propias palabras la idea central que necesitabas comunicar.',
      'Si el olvido es de un compañero: lánzale una pregunta o comentario que contenga la pista de su siguiente acción (ej. "Todavía no me has dicho qué encontraste en la carta...").',
    ],
    emergencyPhrase:
      'Regla de oro en vivo: El público nunca sabe lo que "debía" pasar; solo percibe si el actor confía en lo que está pasando.',
    iconName: 'shield',
  },
  {
    id: 'rule-5',
    title: 'Ética de Camerino y Disciplina Profesional',
    category: 'Cultura Teatral',
    summary:
      'La magia de una función escolar profesional nace del respeto silencioso que ocurre detrás del telón.',
    practicalSteps: [
      'Tras bambalinas reina el silencio absoluto: si tú puedes ver al público, el público también puede verte a ti.',
      'Nunca toques la utilería de otro compañero ni cambies objetos de la mesa técnica sin avisar a utilería.',
      'Llega con puntualidad (15 minutos antes es estar a tiempo) y deja el escenario más limpio de como lo encontraste.',
    ],
    iconName: 'award',
  },
];
