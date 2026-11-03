export interface ArcPhase {
  id: string;
  name: string;
  percent: number; // 0 to 100 on timeline
  tension: number; // 0 to 100 dramatic tension
  cortisol: number; // 0 to 100 alertness & stress
  dopamine: number; // 0 to 100 curiosity & reward
  oxytocin: number; // 0 to 100 empathy & bonding
  brainRegion: string;
  explanation: string;
  pedagogicalTip: string;
}

export interface DramaticStructureData {
  id: 'freytag' | 'hero' | 'fichte' | 'three_act' | 'circular' | 'abt';
  name: string;
  subtitle: string;
  icon: string;
  categoryBadge: string;
  neuroBadge: string;
  description: string;
  svgPath: string; // SVG path data for the tension curve (normalized for 800x260 viewBox)
  phases: ArcPhase[];
  examples: Record<'matematicas' | 'ciencias' | 'historia' | 'crecimiento', Array<{ phase: string; text: string }>>;
}

export const DRAMATIC_STRUCTURES: Record<string, DramaticStructureData> = {
  freytag: {
    id: 'freytag',
    name: 'Pirámide de Freytag',
    subtitle: 'Arco Clásico Quíntuple Canónico',
    icon: '⛰️',
    categoryBadge: 'Modelo Canónico Aristotélico',
    neuroBadge: 'Sincronía EEG Progresiva',
    description: 'Propuesta por Gustav Freytag en 1863, modula la atención del estudiante a través de un ascenso progresivo del estrés cognitivo, alcanzando un clímax que satura la atención y desembocando en una catarsis dopaminérgica.',
    svgPath: 'M 50,230 C 150,230 180,180 230,170 C 310,150 360,50 400,50 C 440,50 490,150 570,170 C 620,180 660,230 750,230',
    phases: [
      {
        id: 'f1',
        name: '1. Incitación / Exposición',
        percent: 10,
        tension: 20,
        cortisol: 25,
        dopamine: 40,
        oxytocin: 30,
        brainRegion: 'Corteza Auditiva & Hipocampo',
        explanation: 'Construye la base semántica y homeostasis inicial. Si no hay calma al inicio, el cerebro no tiene punto de referencia.',
        pedagogicalTip: 'Presenta el personaje y su cotidianidad antes de lanzar el problema.'
      },
      {
        id: 'f2',
        name: '2. Acción Ascendente',
        percent: 35,
        tension: 55,
        cortisol: 65,
        dopamine: 70,
        oxytocin: 50,
        brainRegion: 'Lóbulo Parietal & Amígdala',
        explanation: 'Los obstáculos crecientes elevan el cortisol, cerrando los filtros atencionales para evitar la distracción en el aula.',
        pedagogicalTip: 'Introduce complicaciones técnicas o errores en la fórmula que amenazan el éxito.'
      },
      {
        id: 'f3',
        name: '3. Clímax Dramático',
        percent: 50,
        tension: 95,
        cortisol: 90,
        dopamine: 85,
        oxytocin: 80,
        brainRegion: 'Corteza Prefrontal Dorsolateral',
        explanation: 'Punto de máxima saturación atencional. Todo el salón de clases unifica sus patrones de electroencefalografía.',
        pedagogicalTip: 'Es el instante de decisión irreversible donde el alumno debe aplicar el conocimiento clave.'
      },
      {
        id: 'f4',
        name: '4. Acción Descendente',
        percent: 75,
        tension: 50,
        cortisol: 45,
        dopamine: 75,
        oxytocin: 70,
        brainRegion: 'Ínsula Anterior & Giro Cingulado',
        explanation: 'Descompresión emocional paulatina. El cerebro analiza las consecuencias del clímax y verifica que el peligro pasó.',
        pedagogicalTip: 'Muestra el efecto inmediato de la solución sobre los personajes secundarios.'
      },
      {
        id: 'f5',
        name: '5. Desenlace & Catarsis',
        percent: 95,
        tension: 15,
        cortisol: 20,
        dopamine: 95,
        oxytocin: 85,
        brainRegion: 'Núcleo Accumbens (Vía Dopaminérgica)',
        explanation: 'Liberación masiva de recompensa química. Se consolida el recuerdo en la memoria episódica a largo plazo.',
        pedagogicalTip: 'Sintetiza la moraleja o principio pedagógico mientras la mente está receptiva.'
      }
    ],
    examples: {
      matematicas: [
        { phase: '1. Incitación', text: 'El joven astrónomo de la estación descubre que los satélites se están descalibrando.' },
        { phase: '2. Acción Ascendente', text: 'Los errores se acumulan; si no calcula la parábola cuadrática exacta, la estación colisionará.' },
        { phase: '3. Clímax', text: '¡Faltan 10 segundos! Resuelve la ecuación en la pantalla a ciegas con los datos correctos.' },
        { phase: '4. Acción Descendente', text: 'Los propulsores responden en el último segundo y la órbita se estabiliza con precisión.' },
        { phase: '5. Desenlace', text: 'El equipo celebra. Los alumnos asimilan el uso práctico de la parábola sin memorización árida.' }
      ],
      ciencias: [
        { phase: '1. Incitación', text: 'Un bosque de pinos empieza a perder hojas verdes sin causa biológica aparente.' },
        { phase: '2. Acción Ascendente', text: 'La botánica analiza el suelo y descubre un compuesto alcalino mutante en el agua.' },
        { phase: '3. Clímax', text: 'Sintetiza la enzima en el laboratorio mientras la temperatura del tubo roza el límite de ebullición.' },
        { phase: '4. Acción Descendente', text: 'La enzima neutraliza el pH y las raíces vuelven a sintetizar clorofila.' },
        { phase: '5. Desenlace', text: 'Se fija el concepto de fotosíntesis, enzimas y acidez en la memoria a largo plazo.' }
      ],
      historia: [
        { phase: '1. Incitación', text: 'Un mensajero corre de noche con una carta que define el fin del asedio a la fortaleza.' },
        { phase: '2. Acción Ascendente', text: 'Es interceptado en la frontera; debe descifrar el código numérico para no ser descubierto.' },
        { phase: '3. Clímax', text: 'Encuentra la clave oculta usando el patrón calendárico de la fecha histórica del tratado.' },
        { phase: '4. Acción Descendente', text: 'Entrega el mensaje y el cese al fuego es firmado al amanecer en el campamento.' },
        { phase: '5. Desenlace', text: 'Los estudiantes retienen la fecha y los líderes del suceso histórico por su contexto vivido.' }
      ],
      crecimiento: [
        { phase: '1. Incitación', text: 'Una joven atleta teme hablar en público en el certamen de debate escolar.' },
        { phase: '2. Acción Ascendente', text: 'Le toca subir al estrado y olvida la primera tarjeta de su discurso ensayado.' },
        { phase: '3. Clímax', text: 'Respira hondo, usa la técnica de visualización y habla desde su experiencia real de esfuerzo.' },
        { phase: '4. Acción Descendente', text: 'El auditorio rompe en aplausos y sus compañeros se identifican con su vulnerabilidad.' },
        { phase: '5. Desenlace', text: 'Se consolida la confianza interna y la empatía colectiva en el aula escolar.' }
      ]
    }
  },

  hero: {
    id: 'hero',
    name: 'El Viaje del Héroe',
    subtitle: 'Círculo de Transformación y Monomito',
    icon: '🌌',
    categoryBadge: 'Monomito de Campbell & Harmon',
    neuroBadge: 'Reconfiguración de Esquemas',
    description: 'Basado en los estudios de Joseph Campbell y adaptado por Dan Harmon en 8 cuadrantes circulares. El protagonista se desplaza de su zona de confort hacia un territorio caótico, paga un precio de sacrificio y retorna transformado.',
    svgPath: 'M 50,150 C 120,110 200,90 270,120 C 340,150 370,240 430,240 C 490,240 520,140 590,90 C 660,40 700,70 750,150',
    phases: [
      {
        id: 'h1',
        name: 'I. Zona de Confort (El Mundo Ordinario)',
        percent: 12,
        tension: 15,
        cortisol: 20,
        dopamine: 30,
        oxytocin: 35,
        brainRegion: 'Red Neuronal por Defecto (DMN)',
        explanation: 'Estabilidad conocida. El protagonista vive en rutina pero siente una carencia interna latente.',
        pedagogicalTip: 'Permite que los alumnos se sientan reflejados en las dudas iniciales del protagonista.'
      },
      {
        id: 'h2',
        name: 'II. El Llamado y la Necesidad',
        percent: 25,
        tension: 40,
        cortisol: 55,
        dopamine: 60,
        oxytocin: 40,
        brainRegion: 'Corteza Cingulada Anterior',
        explanation: 'Aparece un quiebre que obliga al protagonista a desear algo fuera de su zona segura.',
        pedagogicalTip: 'Plantea una pregunta abierta que no pueda responderse con lo que ya saben.'
      },
      {
        id: 'h3',
        name: 'III. Cruce del Umbral hacia lo Desconocido',
        percent: 38,
        tension: 65,
        cortisol: 75,
        dopamine: 65,
        oxytocin: 60,
        brainRegion: 'Lóbulo Temporal & Amígdala',
        explanation: 'Entrada a territorio hostil o inexplorado. Se activa la hipervigilancia neuroevolutiva.',
        pedagogicalTip: 'Crea reglas del juego nuevas: fórmulas distintas, ecosistemas extraños o épocas remotas.'
      },
      {
        id: 'h4',
        name: 'IV. Pruebas, Adaptación & Aliados',
        percent: 50,
        tension: 70,
        cortisol: 70,
        dopamine: 75,
        oxytocin: 75,
        brainRegion: 'Neuronas Espejo & Corteza Premotora',
        explanation: 'Enfrentamiento a desafíos intermedios. El protagonista falla primero y debe aprender a adaptarse.',
        pedagogicalTip: 'Enseña que el error es parte inherente del método científico y del aprendizaje.'
      },
      {
        id: 'h5',
        name: 'V. El Abismo (La Ordalía Suprema)',
        percent: 63,
        tension: 95,
        cortisol: 95,
        dopamine: 70,
        oxytocin: 85,
        brainRegion: 'Corteza Prefrontal Ventromedial',
        explanation: 'El momento más oscuro. El héroe debe morir a su antigua identidad o pagar un precio doloroso.',
        pedagogicalTip: 'Lleva al personaje a elegir entre el beneficio egoísta y el bien colectivo.'
      },
      {
        id: 'h6',
        name: 'VI. La Conquista del Elixir',
        percent: 75,
        tension: 80,
        cortisol: 55,
        dopamine: 90,
        oxytocin: 80,
        brainRegion: 'Área Tegmental Ventral',
        explanation: 'Obtención de la clave, la fórmula o el autoconocimiento tras superar la prueba máxima.',
        pedagogicalTip: 'El premio nunca debe ser material, sino un entendimiento profundo del universo.'
      },
      {
        id: 'h7',
        name: 'VII. El Regreso al Hogar Transformado',
        percent: 88,
        tension: 40,
        cortisol: 30,
        dopamine: 85,
        oxytocin: 90,
        brainRegion: 'Hipocampo & Corteza Motora',
        explanation: 'El protagonista vuelve al punto de partida, pero su mirada sobre la realidad ha cambiado para siempre.',
        pedagogicalTip: 'Demuestra cómo el nuevo aprendizaje beneficia a toda la comunidad escolar.'
      },
      {
        id: 'h8',
        name: 'VIII. Maestro de Dos Mundos (Nuevo Equilibrio)',
        percent: 100,
        tension: 10,
        cortisol: 15,
        dopamine: 95,
        oxytocin: 95,
        brainRegion: 'Red de Control Ejecutivo',
        explanation: 'Cierre armónico. El aprendizaje se integra en la identidad del estudiante.',
        pedagogicalTip: 'Pide a los alumnos formular cómo aplicarán esta lección en su vida cotidiana.'
      }
    ],
    examples: {
      matematicas: [
        { phase: 'I. Zona de Confort', text: 'Un estudiante cree que las fracciones solo sirven para rebanar pizzas en los libros de texto.' },
        { phase: 'II. El Llamado', text: 'El puente colgante de su aldea se fractura y solo él tiene el plano con medidas métricas.' },
        { phase: 'III. Cruce del Umbral', text: 'Baja al barranco con su cinta métrica donde el viento dificulta cualquier cálculo simple.' },
        { phase: 'IV. Pruebas & Aliados', text: 'Calcula proporciones erróneas y la cuerda cede. Su abuela carpintera le enseña razones equivalentes.' },
        { phase: 'V. El Abismo', text: 'Solo queda una viga maestra: debe calcular la carga exacta de tensión o el puente caerá al río.' },
        { phase: 'VI. El Elixir', text: 'Aplica el mínimo común múltiplo en las tensiones y la estructura encaja a la perfección.' },
        { phase: 'VII. El Regreso', text: 'Los vecinos cruzan a salvo hacia el mercado comarcal vitoreando al joven ingeniero.' },
        { phase: 'VIII. Nuevo Equilibrio', text: 'En clase, comprende que las fracciones son el lenguaje secreto con el que se sostiene el mundo.' }
      ],
      ciencias: [
        { phase: 'I. Zona de Confort', text: 'Una niña piensa que el agua que sale del grifo es infinita y mágica.' },
        { phase: 'II. El Llamado', text: 'El pozo de su escuela se seca de golpe durante la sequía de primavera.' },
        { phase: 'III. Cruce del Umbral', text: 'Viaja con un hidrólogo hacia las entrañas de los acuíferos subterráneos.' },
        { phase: 'IV. Pruebas & Aliados', text: 'Descubren que pesticidas en la superficie están bloqueando la filtración natural del suelo.' },
        { phase: 'V. El Abismo', text: 'Queda atrapada en una caverna con una sola cantimplora mientras busca la vertiente limpia.' },
        { phase: 'VI. El Elixir', text: 'Construye un filtro con arena de río, grava volcánica y carbón vegetal que purifica el caudal.' },
        { phase: 'VII. El Regreso', text: 'Guía a la comunidad a reforestar la cuenca para recargar el manto freático.' },
        { phase: 'VIII. Nuevo Equilibrio', text: 'El agua vuelve al colegio; ahora es la defensora ecológica del río en su comunidad.' }
      ],
      historia: [
        { phase: 'I. Zona de Confort', text: 'Un campesino maya vive tranquilo sembrando maíz según el calendario tradicional.' },
        { phase: 'II. El Llamado', text: 'Los sabios advierten que un eclipse de tres días requerirá predecir la posición de Venus.' },
        { phase: 'III. Cruce del Umbral', text: 'Sube a la pirámide de Uaxactún para medir las alineaciones solares en el solsticio.' },
        { phase: 'IV. Pruebas & Aliados', text: 'Las nubes tapan el horizonte tres noches seguidas; recurre a la matemática vigesimal de los códices.' },
        { phase: 'V. El Abismo', text: 'Falta una hora para el alineamiento y pierde la cuenta de los kʼatunes en la oscuridad.' },
        { phase: 'VI. El Elixir', text: 'El conteo con el punto y la barra revela la fecha exacta del ciclo de 584 días de Venus.' },
        { phase: 'VII. El Regreso', text: 'Anuncia al pueblo la llegada de la lluvia estacional y siembran a tiempo.' },
        { phase: 'VIII. Nuevo Equilibrio', text: 'Se convierte en el cronista de la memoria astronómica de las nuevas generaciones.' }
      ],
      crecimiento: [
        { phase: 'I. Zona de Confort', text: 'Un niño solitario prefiere jugar videojuegos antes que interactuar con sus compañeros.' },
        { phase: 'II. El Llamado', text: 'El profesor le asigna liderar el equipo de teatro escolar para el festival cívico.' },
        { phase: 'III. Cruce del Umbral', text: 'Primer ensayo general: todos discuten y la utilería se rompe frente al director.' },
        { phase: 'IV. Pruebas & Aliados', text: 'Aprende a escuchar las fortalezas de cada uno: el tímido hace luces, la inquieta actúa.' },
        { phase: 'V. El Abismo', text: 'El actor principal enferma cinco minutos antes de levantarse el telón.' },
        { phase: 'VI. El Elixir', text: 'Él mismo sube al escenario y vence su pánico escénico hablando desde el corazón.' },
        { phase: 'VII. El Regreso', text: 'La obra es un éxito y todo el grupo se abraza al bajar el telón.' },
        { phase: 'VIII. Nuevo Equilibrio', text: 'Comprende que la verdadera fuerza radica en la colaboración y la empatía compartida.' }
      ]
    }
  },

  fichte: {
    id: 'fichte',
    name: 'Curva de Fichte',
    subtitle: 'Escalada de Crisis y Retos Continuos',
    icon: '📈',
    categoryBadge: 'Pedagogía Basada en Retos (PBL)',
    neuroBadge: 'Micro-Ciclos de Dopamina',
    description: 'Popularizada en novelas de misterio y diseño de videojuegos educativos. En lugar de un solo ascenso paulatino, introduce una crisis tras otra en oleadas ascendentes, manteniendo al estudiante en constante atención activa sin decaimiento.',
    svgPath: 'M 50,220 C 100,220 120,170 160,170 C 180,170 210,200 240,200 C 290,200 320,130 360,130 C 390,130 420,170 450,170 C 500,170 540,80 590,80 C 640,80 670,220 750,220',
    phases: [
      {
        id: 'fc1',
        name: 'In medias res (Detonante Inmediato)',
        percent: 10,
        tension: 40,
        cortisol: 50,
        dopamine: 60,
        oxytocin: 30,
        brainRegion: 'Sistema Reticular Activador Ascendente',
        explanation: 'Comienza directamente con una emergencia sin preámbulos lentos, capturando de inmediato la atención del grupo.',
        pedagogicalTip: 'Abre la clase con un problema en llamas antes de dar la teoría.'
      },
      {
        id: 'fc2',
        name: 'Crisis 1: Primer Obstáculo Superado',
        percent: 28,
        tension: 60,
        cortisol: 65,
        dopamine: 75,
        oxytocin: 40,
        brainRegion: 'Corteza Motora & Lóbulo Parietal',
        explanation: 'Se resuelve un primer reto, liberando dopamina temprana y dando autoconfianza al alumno.',
        pedagogicalTip: 'Un acertijo intermedio rápido que valide el concepto básico.'
      },
      {
        id: 'fc3',
        name: 'Crisis 2: Complicación Inesperada Mayor',
        percent: 52,
        tension: 75,
        cortisol: 80,
        dopamine: 80,
        oxytocin: 60,
        brainRegion: 'Corteza Frontopolar',
        explanation: 'La solución anterior generó un efecto secundario peor. Exige pensamiento crítico avanzado.',
        pedagogicalTip: 'Introduce una variable no prevista que desmonte las soluciones mecánicas.'
      },
      {
        id: 'fc4',
        name: 'Crisis 3: El Gran Clímax Culminante',
        percent: 78,
        tension: 98,
        cortisol: 95,
        dopamine: 90,
        oxytocin: 85,
        brainRegion: 'Corteza Prefrontal Bilateral',
        explanation: 'Todas las subtramas y retos convergen en una prueba crítica final simultánea.',
        pedagogicalTip: 'El reto maestro donde se combinan todos los contenidos de la unidad.'
      },
      {
        id: 'fc5',
        name: 'Acción Descendente & Resolución Rápida',
        percent: 95,
        tension: 20,
        cortisol: 20,
        dopamine: 95,
        oxytocin: 90,
        brainRegion: 'Núcleo Accumbens & Hipocampo',
        explanation: 'Frenado veloz tras la victoria. La mente almacena la serie de éxitos encadenados como dominio de competencia.',
        pedagogicalTip: 'Cierre con felicitación y rúbrica clara de logros alcanzados.'
      }
    ],
    examples: {
      matematicas: [
        { phase: '1. In Medias Res', text: '¡Alarma en el submarino! Se rompió una tubería a 200 metros de profundidad.' },
        { phase: '2. Crisis 1', text: 'Calculan la presión hidrostática y sellan la válvula con una abrazadera.' },
        { phase: '3. Crisis 2', text: '¡El lastre falla! El ángulo de ascenso debe calcularse con trigonometría o chocarán con el arrecife.' },
        { phase: '4. Gran Clímax', text: 'Las baterías se apagan en el túnel submarino: resuelven el sistema de dos incógnitas en 30 segundos.' },
        { phase: '5. Resolución', text: 'Emergen a la superficie bajo el sol. La tripulación comprende la física de fluidos para siempre.' }
      ],
      ciencias: [
        { phase: '1. In Medias Res', text: 'Un vertido de ácido amenaza con llegar al río del caserío en quince minutos.' },
        { phase: '2. Crisis 1', text: 'Miden el pH del agua con tiras reactivas y descubren que está en nivel 2 extremadamente corrosivo.' },
        { phase: '3. Crisis 2', text: 'Agregan una base para neutralizarlo, pero la reacción térmica eleva peligrosamente la temperatura.' },
        { phase: '4. Gran Clímax', text: 'Debe calcular la masa exacta de bicarbonato requerida para amortiguar la cuenca sin matar los peces.' },
        { phase: '5. Resolución', text: 'El agua vuelve a pH neutro 7. Los macroinvertebrados sobreviven y la comunidad celebra el rescate.' }
      ],
      historia: [
        { phase: '1. In Medias Res', text: 'Un grupo de arqueólogos queda encerrado en una cámara oculta bajo Tikal.' },
        { phase: '2. Crisis 1', text: 'La puerta se trabó: deben presionar los tres glifos numéricos que correspondan al baktún 13.' },
        { phase: '3. Crisis 2', text: 'El agua empieza a filtrarse por el techo: tienen que alinear el espejo estelar con el solsticio.' },
        { phase: '4. Gran Clímax', text: 'Solo queda una antorcha: decodifican la última estela funeraria que abre el túnel de escape.' },
        { phase: '5. Resolución', text: 'Salen a la luz en la Plaza Mayor sosteniendo intacto el registro del rey Jasaw Chan Kʼawiil.' }
      ],
      crecimiento: [
        { phase: '1. In Medias Res', text: 'Se desata un incendio accidental en el laboratorio escolar durante un experimento.' },
        { phase: '2. Crisis 1', text: 'El humo nubla la visión: activan la alarma y guían a los niños de primaria por la ruta verde.' },
        { phase: '3. Crisis 2', text: 'Un alumno con movilidad reducida quedó rezagado en el segundo piso del edificio.' },
        { phase: '4. Gran Clímax', text: 'La brigada de estudiantes coordina la camilla improvisada y superan el bloqueo de la escalera.' },
        { phase: '5. Resolución', text: 'Llegan al punto de encuentro sin heridos. Descubren el inmenso valor de la templanza cívica.' }
      ]
    }
  },

  three_act: {
    id: 'three_act',
    name: 'Estructura en Tres Actos',
    subtitle: 'El Paradigma de Syd Field & Aristóteles',
    icon: '🎭',
    categoryBadge: 'Guion Cinematográfico Universal',
    neuroBadge: 'Puntos de Inflexión Cognitiva',
    description: 'La arquitectura cinematográfica por excelencia: Acto I (Planteamiento hasta el Plot Point 1), Acto II (Confrontación, Punto Medio y Todo Perdido) y Acto III (Clímax y Resolución). Administra dos grandes giros que transforman radicalmente las hipótesis del receptor.',
    svgPath: 'M 50,220 C 130,220 180,180 230,180 C 270,180 340,140 420,140 C 470,140 500,190 560,190 C 620,190 650,40 700,40 C 730,40 740,210 750,210',
    phases: [
      {
        id: 'ta1',
        name: 'Acto I: Incidente Incitador',
        percent: 15,
        tension: 30,
        cortisol: 35,
        dopamine: 45,
        oxytocin: 30,
        brainRegion: 'Corteza Prefrontal Medial',
        explanation: 'Ruptura del orden inicial. El personaje se resiste al cambio hasta que un suceso lo empuja.',
        pedagogicalTip: 'Muestra qué ocurre si nadie hace nada respecto al problema planteado.'
      },
      {
        id: 'ta2',
        name: 'Plot Point 1 (Punto de Giro 1)',
        percent: 28,
        tension: 55,
        cortisol: 65,
        dopamine: 70,
        oxytocin: 50,
        brainRegion: 'Giro Fusiforme & Ínsula',
        explanation: 'Punto de no retorno. El personaje cruza la frontera y el objetivo queda fijado.',
        pedagogicalTip: 'Compromete al alumno con una hipótesis de la que no puede retractarse sin comprobarla.'
      },
      {
        id: 'ta3',
        name: 'Acto II: Punto Medio (Midpoint)',
        percent: 50,
        tension: 65,
        cortisol: 70,
        dopamine: 80,
        oxytocin: 65,
        brainRegion: 'Corteza Cingulada Posterior',
        explanation: 'Falsa victoria o falsa derrota. Se descubre la verdadera magnitud de la misión.',
        pedagogicalTip: 'Revela que la respuesta sencilla de libro de texto era insuficiente para el caso real.'
      },
      {
        id: 'ta4',
        name: 'Plot Point 2: La Noche Oscura del Alma',
        percent: 72,
        tension: 85,
        cortisol: 90,
        dopamine: 60,
        oxytocin: 85,
        brainRegion: 'Amígdala Basolateral',
        explanation: 'Todo parece perdido. La estrategia falló y solo queda una única alternativa arriesgada.',
        pedagogicalTip: 'Obliga a los estudiantes a repensar su marco teórico desde cero.'
      },
      {
        id: 'ta5',
        name: 'Acto III: Clímax & Resolución Definitiva',
        percent: 92,
        tension: 98,
        cortisol: 85,
        dopamine: 98,
        oxytocin: 90,
        brainRegion: 'Corteza Orbitofrontal',
        explanation: 'Enfrentamiento final. Aplicación de la lección aprendida y clausura del arco dramático.',
        pedagogicalTip: 'Conexión del aprendizaje con un propósito ético o social tangible.'
      }
    ],
    examples: {
      matematicas: [
        { phase: 'Acto I: Incidente', text: 'Una cooperativa agrícola gasta el doble de combustible repartiendo verduras a cinco aldeas.' },
        { phase: 'Plot Point 1', text: 'El estudiante asume el compromiso de rediseñar las rutas usando la teoría de grafos de Euler.' },
        { phase: 'Acto II: Midpoint', text: 'Crea una ruta en estrella, pero descubre que los derrumbes de lluvia bloquean dos caminos clave.' },
        { phase: 'Plot Point 2', text: 'El combustible se agota y los camiones quedan varados: su modelo geométrico teórico parece inútil.' },
        { phase: 'Acto III: Clímax', text: 'Aplica el algoritmo del árbol de expansión mínima y encuentra la ruta óptima alterna más corta.' }
      ],
      ciencias: [
        { phase: 'Acto I: Incidente', text: 'Las abejas de los apiarios escolares disminuyen en un 60% en dos meses.' },
        { phase: 'Plot Point 1', text: 'El equipo de ciencias inicia una auditoría biológica de las plantas circundantes.' },
        { phase: 'Acto II: Midpoint', text: 'Descubren que no es una bacteria, sino un pesticida neurotóxico usado a cinco kilómetros.' },
        { phase: 'Plot Point 2', text: 'Las autoridades se niegan a intervenir sin una prueba molecular reproducible en laboratorio.' },
        { phase: 'Acto III: Clímax', text: 'Realizan una cromatografía en capa fina en vivo frente al concejo municipal y logran la prohibición del químico.' }
      ],
      historia: [
        { phase: 'Acto I: Incidente', text: 'Un joven tejedor de Momostenango descubre que los tintes industriales están borrando los tintes naturales de cochinilla.' },
        { phase: 'Plot Point 1', text: 'Emprende un viaje a las montañas para buscar a la última familia que cultiva el nopal con grana cochinilla.' },
        { phase: 'Acto II: Midpoint', text: 'Aprende la receta del mordiente con alumbre, pero una helada amenaza con matar las pencas del nopal.' },
        { phase: 'Plot Point 2', text: 'Las pencas se congelan en un 80%: parece el fin definitivo de una tradición de cuatrocientos años.' },
        { phase: 'Acto III: Clímax', text: 'Construyen un invernadero de emergencia con sábanas y rescatan la colonia madre de insectos tintóreos.' }
      ],
      crecimiento: [
        { phase: 'Acto I: Incidente', text: 'Dos mejores amigos compiten por la única beca deportiva para la universidad regional.' },
        { phase: 'Plot Point 1', text: 'Acuerdan entrenar juntos para impulsarse mutuamente sin trucos sucios.' },
        { phase: 'Acto II: Midpoint', text: 'Uno de ellos rompe el récord de velocidad, generando celos y distanciamiento entre ambos.' },
        { phase: 'Plot Point 2', text: 'En la final, el puntero sufre un calambre a diez metros de la meta y cae en la pista.' },
        { phase: 'Acto III: Clímax', text: 'El segundo atleta se detiene, lo levanta del hombro y cruzan juntos la meta ante la ovación general.' }
      ]
    }
  },

  circular: {
    id: 'circular',
    name: 'Espiral Cíclica Ancestral',
    subtitle: 'La Cosmovisión Maya del Popol Vuh',
    icon: '🌀',
    categoryBadge: 'Narrativa No Lineal Ancestral',
    neuroBadge: 'Consolidación Holística',
    description: 'A diferencia del modelo occidental lineal, la estructura circular maya (Kʼatun) no busca vencer al enemigo para destruirlo, sino restaurar el equilibrio cósmico. El desenlace regresa al inicio pero con una elevación de conciencia (espiral ascendente).',
    svgPath: 'M 50,150 C 150,70 280,70 380,150 C 480,230 610,230 710,150 C 730,130 750,150 750,150',
    phases: [
      {
        id: 'cr1',
        name: '1. El Amanecer Cósmico (El Equilibrio)',
        percent: 10,
        tension: 10,
        cortisol: 15,
        dopamine: 40,
        oxytocin: 50,
        brainRegion: 'Corteza Visual & Temporal',
        explanation: 'Presentación del cosmos en armonía: la tierra, el cielo y las criaturas vivientes.',
        pedagogicalTip: 'Establece la relación de respeto mutuo entre el ser humano y el entorno.'
      },
      {
        id: 'cr2',
        name: '2. La Soberbia y la Pérdida del Eje',
        percent: 32,
        tension: 50,
        cortisol: 60,
        dopamine: 65,
        oxytocin: 40,
        brainRegion: 'Corteza Orbitofrontal',
        explanation: 'Aparece una fuerza que se cree superior al orden universal (como Vucub Caquix creyéndose el sol).',
        pedagogicalTip: 'Discute las consecuencias del orgullo desmedido y la falta de humildad intelectual.'
      },
      {
        id: 'cr3',
        name: '3. El Descenso al Inframundo (Las Pruebas de Xibalbá)',
        percent: 55,
        tension: 88,
        cortisol: 85,
        dopamine: 75,
        oxytocin: 80,
        brainRegion: 'Amígdala & Corteza Prefrontal',
        explanation: 'Los gemelos divinos entran a las casas del frío, las navajas y los jaguares con ingenio pacífico.',
        pedagogicalTip: 'La victoria nunca se logra con fuerza bruta, sino con astucia colectiva y perseverancia.'
      },
      {
        id: 'cr4',
        name: '4. El Sacrificio y la Resurrección',
        percent: 78,
        tension: 92,
        cortisol: 70,
        dopamine: 90,
        oxytocin: 90,
        brainRegion: 'Giro Angular & Red de Empatía',
        explanation: 'La entrega voluntaria para germinar un orden nuevo: la muerte fecunda de los granos de maíz.',
        pedagogicalTip: 'Explica cómo las generaciones anteriores siembran los frutos que hoy disfrutamos.'
      },
      {
        id: 'cr5',
        name: '5. La Espiral Elevada (El Nuevo Sol y Luna)',
        percent: 100,
        tension: 15,
        cortisol: 10,
        dopamine: 98,
        oxytocin: 98,
        brainRegion: 'Red de Integración Perceptiva',
        explanation: 'Hunahpú e Ixbalanqué ascienden al cielo como el Sol y la Luna. El ciclo vuelve a comenzar iluminado.',
        pedagogicalTip: 'Cierra vinculando el tema aprendido con la responsabilidad del estudiante hacia su comunidad.'
      }
    ],
    examples: {
      matematicas: [
        { phase: '1. El Amanecer', text: 'Los astrónomos mayas contemplan el ciclo de las estaciones marcado por los equinoccios.' },
        { phase: '2. La Pérdida del Eje', text: 'Un sacerdote comete un error en el conteo de los días bisiestos y las siembras se adelantan con sequía.' },
        { phase: '3. Las Pruebas', text: 'Deben contrastar el calendario solar Haab (365 días) con el ritual Tzolkʼin (260 días) en la Rueda Calendárica.' },
        { phase: '4. El Sacrificio', text: 'Tras 52 años de observaciones acumuladas, descubren que el ciclo se sincroniza exactamente en 18,980 días.' },
        { phase: '5. La Espiral', text: 'Encienden el Fuego Nuevo en la cima del templo: el tiempo regresa al punto cero, pero con precisión matemática absoluta.' }
      ],
      ciencias: [
        { phase: '1. El Amanecer', text: 'Una gota de agua cae en la cumbre del volcán y alimenta los manantiales de la cuenca.' },
        { phase: '2. La Pérdida del Eje', text: 'La deforestación interrumpe el ciclo: el suelo se erosiona y los ríos se enturbian con lodo.' },
        { phase: '3. Las Pruebas', text: 'Los estudiantes monitorean la transpiración de los árboles y la condensación de niebla en las hojas.' },
        { phase: '4. El Sacrificio', text: 'Siembran diez mil ceibas y alisos nativos para recuperar la esponja vegetal de la montaña.' },
        { phase: '5. La Espiral', text: 'La gota de agua vuelve a evaporarse hacia la nube: el ciclo hidrológico se restablece en un ecosistema restaurado.' }
      ],
      historia: [
        { phase: '1. El Amanecer', text: 'Las abuelas enseñan a moldear tinajas de barro cocido con técnicas heredadas de generación en generación.' },
        { phase: '2. La Pérdida del Eje', text: 'La llegada masiva de recipientes de plástico desechable hace que los jóvenes abandonen el oficio alfarero.' },
        { phase: '3. Las Pruebas', text: 'La basura sintética colapsa los desagües del pueblo durante la tormenta tropical.' },
        { phase: '4. El Sacrificio', text: 'Los jóvenes recuperan los hornos comunitarios de leña y rediseñan filtros de barro para purificar agua.' },
        { phase: '5. La Espiral', text: 'El barro vuelve a las cocinas: no por nostalgia, sino como tecnología ecológica del futuro.' }
      ],
      crecimiento: [
        { phase: '1. El Amanecer', text: 'La familia comparte el desayuno en torno al comal antes de salir a la escuela y al campo.' },
        { phase: '2. La Pérdida del Eje', text: 'Los teléfonos celulares provocan que nadie hable ni se mire a los ojos durante la cena.' },
        { phase: '3. Las Pruebas', text: 'Ocurre una emergencia médica en el pueblo y la incomunicación emocional retrasa la ayuda.' },
        { phase: '4. El Sacrificio', text: 'Deciden apagar las pantallas dos horas al día para cocinar juntos y escuchar los relatos de los ancianos.' },
        { phase: '5. La Espiral', text: 'La mesa vuelve a reunir a la familia: la tecnología se usa como herramienta y no como sustituto del afecto.' }
      ]
    }
  },

  abt: {
    id: 'abt',
    name: 'Estructura ABT',
    subtitle: 'And, But, Therefore (Y, Pero, Por lo Tanto)',
    icon: '⚡',
    categoryBadge: 'Modelo Neurocognitivo de Randy Olson',
    neuroBadge: 'Error de Predicción Rápido',
    description: 'Diseñada por el biólogo marino y cineasta Randy Olson. Es la herramienta de mayor eficiencia atencional para explicaciones científicas y micro-narrativas escolares: el "Y" construye el acuerdo, el "PERO" genera el error de predicción, y el "POR LO TANTO" libera la dopamina resolutiva.',
    svgPath: 'M 50,200 C 150,200 230,200 300,200 C 320,80 370,80 430,80 C 490,80 550,220 750,220',
    phases: [
      {
        id: 'ab1',
        name: 'Y (AND): Acuerdo & Contexto Semántico',
        percent: 25,
        tension: 15,
        cortisol: 20,
        dopamine: 40,
        oxytocin: 40,
        brainRegion: 'Corteza Temporal Superior',
        explanation: 'Enlaza dos verdades compartidas que la audiencia ya conoce para sincronizar el canal atencional.',
        pedagogicalTip: 'Usa oraciones simples unidas por "Y" que todos en el salón consideren ciertas.'
      },
      {
        id: 'ab2',
        name: 'PERO (BUT): Quiebre & Error de Predicción',
        percent: 55,
        tension: 90,
        cortisol: 90,
        dopamine: 75,
        oxytocin: 65,
        brainRegion: 'Corteza Cingulada Anterior & Amígdala',
        explanation: 'El giro contradictorio. El cerebro detecta una discrepancia entre lo esperado y lo real y focaliza el 100% de la energía.',
        pedagogicalTip: 'Es el pivote dramático: debe plantear el obstáculo que derriba la complacencia.'
      },
      {
        id: 'ab3',
        name: 'POR LO TANTO (THEREFORE): Acción Resolutiva',
        percent: 90,
        tension: 25,
        cortisol: 25,
        dopamine: 98,
        oxytocin: 85,
        brainRegion: 'Corteza Prefrontal Dorsolateral & Striatum',
        explanation: 'La consecuencia lógica. Satisface la brecha de curiosidad y entrega el aprendizaje formal.',
        pedagogicalTip: 'Aquí se enuncia la conclusión científica o la tesis del estudiante.'
      }
    ],
    examples: {
      matematicas: [
        { phase: 'Y (AND)', text: 'Las computadoras procesan millones de datos por segundo Y los satélites se comunican a la velocidad de la luz,' },
        { phase: 'PERO (BUT)', text: 'PERO si un solo dígito binario se corrompe por radiación solar, toda la trayectoria espacial se vuelve caótica e impredecible,' },
        { phase: 'POR LO TANTO (THEREFORE)', text: 'POR LO TANTO los matemáticos inventaron los códigos de corrección de errores de Hamming para salvar las misiones espaciales.' }
      ],
      ciencias: [
        { phase: 'Y (AND)', text: 'Las plantas absorben dióxido de carbono por sus estomas Y la luz solar energiza los cloroplastos con fotones,' },
        { phase: 'PERO (BUT)', text: 'PERO si la temperatura del aire supera los 40 grados, los estomas se cierran para no deshidratarse, frenando la fotosíntesis,' },
        { phase: 'POR LO TANTO (THEREFORE)', text: 'POR LO TANTO las plantas del desierto evolucionaron la ruta metabólica CAM para abrir sus poros únicamente de noche.' }
      ],
      historia: [
        { phase: 'Y (AND)', text: 'La civilización de Caral construyó pirámides monumentales Y desarrolló redes comerciales por miles de kilómetros,' },
        { phase: 'PERO (BUT)', text: 'PERO un megaevento climatológico de El Niño provocó 30 años de sequías seguidas de aluviones catastróficos,' },
        { phase: 'POR LO TANTO (THEREFORE)', text: 'POR LO TANTO la población abandonó pacíficamente las urbes para reorganizarse en valles fértiles más pequeños.' }
      ],
      crecimiento: [
        { phase: 'Y (AND)', text: 'Todos los estudiantes quieren sacar buenas notas Y desean ser admirados por sus maestros y compañeros,' },
        { phase: 'PERO (BUT)', text: 'PERO copiar en un examen entrega una nota vacía que los deja indefensos cuando enfrentan un reto de la vida real,' },
        { phase: 'POR LO TANTO (THEREFORE)', text: 'POR LO TANTO el verdadero éxito reside en el esfuerzo honesto que forja criterio y carácter personal.' }
      ]
    }
  }
};
