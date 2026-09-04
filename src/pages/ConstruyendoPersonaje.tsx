import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useAuth } from '../context/AuthContext';
import { compressImageWebP } from '../utils/imageUpload';
import { generateCharacterWorksheetPDF } from '../utils/pdfGenerator';
import { soundEffects } from '../utils/soundEffects';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import './ConstruyendoPersonaje.css';

interface ArchetypeRelation {
  targetArchetype: string;
  relationRole: string;
  sparkDescription: string;
}

interface ArchetypeData {
  id: string;
  name: string;
  roleSubtitle: string;
  icon: string;
  quote: string;
  functionDesc: string;
  shadowWeakness: string;
  classicExample: string;
  modernExample: string;
  writingTip: string;
  crucibleTrial: string;
  relations: ArchetypeRelation[];
  color: string;
}

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'protagonista',
    name: 'El Héroe / Protagonista',
    roleSubtitle: 'El motor del cambio y portador del arco dramático',
    icon: '🦸',
    quote: '«No soy lo que me pasó, soy lo que elijo ser.»',
    functionDesc: 'Es el centro de gravedad moral y emocional del relato. Debe tomar decisiones difíciles que revelen quién es realmente bajo presión extrema.',
    shadowWeakness: 'Arrogancia, ceguera ante su propia herida o insistencia en perseguir su deseo superficial en vez de su necesidad espiritual.',
    classicExample: 'Odiseo (La Odisea), Hunahpú e Ixbalanqué (Popol Vuh)',
    modernExample: 'Katniss Everdeen (Los Juegos del Hambre), Miles Morales (Spider-Verse)',
    writingTip: 'Dale una creencia falsa sobre sí mismo o el mundo en el acto 1; su victoria dependerá de desmantelar esa mentira.',
    crucibleTrial: 'Debe sacrificar su ambición egoísta en el abismo para salvar a su comunidad y abrazar su verdadera transformación espiritual.',
    relations: [
      { targetArchetype: 'El Mentor', relationRole: 'Pupilo y Heredero', sparkDescription: 'Acepta sus enseñanzas, pero debe romper con su tutela para forjar su propio camino.' },
      { targetArchetype: 'La Sombra', relationRole: 'Espejo Oscuro', sparkDescription: 'Enfrenta en el villano aquello en lo que él mismo se convertiría si cediera al rencor.' },
      { targetArchetype: 'El Aliado', relationRole: 'Hermano de Armas', sparkDescription: 'Su ancla de cordura cuando la carga del destino amenaza con aplastarlo.' }
    ],
    color: '#38bdf8'
  },
  {
    id: 'mentor',
    name: 'El Mentor',
    roleSubtitle: 'El guía, guardián de la sabiduría y catalizador moral',
    icon: '🧙‍♂️',
    quote: '«El conocimiento sin coraje es un mapa sin caminante.»',
    functionDesc: 'Proporciona entrenamiento, artefactos mágicos o perspectivas que el héroe aún no puede ver por sí mismo. Suele desaparecer antes del clímax para obligar al héroe a volar solo.',
    shadowWeakness: 'Dogmatismo, secretos oscuros del pasado o sobreprotección que asfixia el crecimiento.',
    classicExample: 'Quirón (Mitología Griega), Ixmukané (Popol Vuh)',
    modernExample: 'Gandalf (El Señor de los Anillos), Haymitch Abernathy (Los Juegos del Hambre)',
    writingTip: 'Haz que el mentor haya fracasado en el pasado en lo mismo que el héroe intenta lograr; eso le da vulnerabilidad y verdad.',
    crucibleTrial: 'Aceptar que ya no es el héroe de la historia y renunciar al control para dejar que la nueva generación enfrente el peligro.',
    relations: [
      { targetArchetype: 'El Protagonista', relationRole: 'Guía y Catalizador', sparkDescription: 'Transfiere el fuego de la experiencia y le entrega la herramienta para cruzar el umbral.' },
      { targetArchetype: 'La Sombra', relationRole: 'Rival Histórico', sparkDescription: 'A menudo comparte un pasado trágico con el antagonista o no pudo evitar su caída.' },
      { targetArchetype: 'El Heraldo', relationRole: 'Intérprete del Destino', sparkDescription: 'Ayuda al protagonista a descifrar la urgencia del llamado que trae el heraldo.' }
    ],
    color: '#a855f7'
  },
  {
    id: 'sombra',
    name: 'La Sombra / El Antagonista',
    roleSubtitle: 'El espejo oscuro y la fuerza opuesta ineludible',
    icon: '🌑',
    quote: '«Tú y yo no somos tan distintos; solo que yo acepté la verdad primero.»',
    functionDesc: 'Encarna el mayor miedo del héroe o una versión distorsionada de su mismo deseo. No se considera el malo: en su mente, su causa es justa y necesaria.',
    shadowWeakness: 'Incapacidad de perdonar, obsesión de control absoluto o vacío existencial que busca llenar con poder.',
    classicExample: 'Señores de Xibalbá (Popol Vuh), Sauron (Tolkien)',
    modernExample: 'Killmonger (Black Panther), Darth Vader (Star Wars)',
    writingTip: 'El mejor antagonista tiene metas tan comprensibles que el lector casi duda de si tiene razón.',
    crucibleTrial: 'Frente a la posibilidad de redimirse, redobla su apuesta destructiva porque no concibe un mundo sin su propia supremacía.',
    relations: [
      { targetArchetype: 'El Protagonista', relationRole: 'Antítesis Viva', sparkDescription: 'Fuerza al héroe al límite ético; no pueden coexistir sin que uno de los dos cambie.' },
      { targetArchetype: 'El Aliado', relationRole: 'Blanco de Quiebre', sparkDescription: 'Intenta corromper o eliminar al aliado para dejar al héroe completamente aislado.' },
      { targetArchetype: 'El Embaucador', relationRole: 'Amenaza Impredecible', sparkDescription: 'Desprecia al embaucador porque el caos desmantela sus planes milimétricos.' }
    ],
    color: '#f43f5e'
  },
  {
    id: 'aliado',
    name: 'El Aliado y el Escudero',
    roleSubtitle: 'El ancla emocional, la lealtad y el contrapunto humano',
    icon: '🛡️',
    quote: '«Tal vez no pueda llevar la carga por ti, pero puedo caminar a tu lado.»',
    functionDesc: 'Cuestiona las decisiones del protagonista cuando este pierde el rumbo, aporta habilidades complementarias y ofrece alivio cómico o profundidad emocional.',
    shadowWeakness: 'Dependencia del líder, celos silenciosos o vulnerabilidad física frente a los enemigos.',
    classicExample: 'Sancho Panza (Don Quijote), Enkidu (Epopeya de Gilgamesh)',
    modernExample: 'Samwise Gamgee (El Señor de los Anillos), Hermione Granger (Harry Potter)',
    writingTip: 'No lo conviertas en un simple adulador; haz que tenga sus propios sueños y desacuerdos éticos con el protagonista.',
    crucibleTrial: 'Debe arriesgar su propia vida o valores para rescatar al héroe cuando este cae en la desesperación o el abismo.',
    relations: [
      { targetArchetype: 'El Protagonista', relationRole: 'Voz de la Conciencia', sparkDescription: 'Le recuerda quién era antes de que la misión lo endureciera.' },
      { targetArchetype: 'El Mentor', relationRole: 'Ejecutor Práctico', sparkDescription: 'Traduce las frases enigmáticas del mentor a soluciones inmediatas para el día a día.' },
      { targetArchetype: 'El Embaucador', relationRole: 'Contrapeso de Juicio', sparkDescription: 'Desconfía de sus trampas, aunque a veces debe cooperar con él para sobrevivir.' }
    ],
    color: '#22c55e'
  },
  {
    id: 'heraldo',
    name: 'El Heraldo',
    roleSubtitle: 'La llamada al cambio que destruye el statu quo',
    icon: '⚡',
    quote: '«El mundo que conocías ha terminado. La tormenta ha comenzado.»',
    functionDesc: 'Trae la noticia, el desafío o la catástrofe que rompe la rutina del mundo ordinario y obliga al héroe a tomar una postura.',
    shadowWeakness: 'Mensajero imparcial que puede ser portador de dolor o causar pánico involuntario.',
    classicExample: 'El oráculo de Delfos, Hermes (Mensajero de los Dioses)',
    modernExample: 'Hagrid con la carta de Hogwarts, Morfeo ofreciendo la pastilla en Matrix',
    writingTip: 'El heraldo no siempre es una persona; puede ser un evento, un eclipse, una carta sellada o un rayo inesperado.',
    crucibleTrial: 'Entregar la verdad cruda sin filtros, asumiendo el riesgo de ser perseguido o castigado por quebrar la ilusión de paz.',
    relations: [
      { targetArchetype: 'El Protagonista', relationRole: 'Despertador Inflexible', sparkDescription: 'Le arranca la venda de los ojos y destruye la comodidad del mundo ordinario.' },
      { targetArchetype: 'La Sombra', relationRole: 'Señal de Alarma', sparkDescription: 'Su llegada anuncia que el poder del antagonista ha alcanzado un punto crítico.' },
      { targetArchetype: 'El Mentor', relationRole: 'Sincronía del Tiempo', sparkDescription: 'El heraldo detona la crisis justo en el momento en que el mentor está listo para guiar.' }
    ],
    color: '#eab308'
  },
  {
    id: 'embaucador',
    name: 'El Camaleón / El Embaucador',
    roleSubtitle: 'Máscaras cambiantes, ambigüedad moral y sabiduría caótica',
    icon: '🎭',
    quote: '«Las reglas son solo sugerencias escritas por quienes temen reír.»',
    functionDesc: 'Desafía la solemnidad, expone las hipocresías del sistema y desestabiliza tanto al héroe como al villano mediante el ingenio y el engaño.',
    shadowWeakness: 'Egoísmo puro, nihilismo o traición por puro capricho personal.',
    classicExample: 'Loki (Mitología Nórdica), Jun Batz y Jun Chowén (Popol Vuh)',
    modernExample: 'Jack Sparrow (Piratas del Caribe), Tyrion Lannister (Juego de Tronos)',
    writingTip: 'Usa al Embaucador para obligar al héroe a pensar fuera de la caja y abandonar su rigidez mental.',
    crucibleTrial: 'Elegir por una sola vez dejar de bromear y asumir una causa noble cuando el chiste ya no basta para salvar vidas.',
    relations: [
      { targetArchetype: 'El Protagonista', relationRole: 'Espejo Cómico y Desafío', sparkDescription: 'Pincha el globo de su solemnidad y le enseña que a veces se gana perdiendo las formas.' },
      { targetArchetype: 'La Sombra', relationRole: 'Saboteador Inesperado', sparkDescription: 'Humilla el orgullo del villano usando sus propias trampas en su contra.' },
      { targetArchetype: 'El Aliado', relationRole: 'Provocador Constante', sparkDescription: 'Pone a prueba la paciencia del escudero para obligarlo a ser más ingenioso.' }
    ],
    color: '#ec4899'
  }
];

const JOURNEY_STAGES_DATA = [
  {
    id: 'mundo_ordinario',
    stepNumber: '01',
    name: 'El Mundo Ordinario',
    icon: '🏡',
    tension: 15,
    summary: 'La zona de confort donde el personaje sobrevive aferrado a su mentira o herida del pasado. El entorno refleja su estancamiento interno.',
    psychologicalState: 'Inconsciencia del verdadero potencial. Creencia falsa activa.',
    archetypeRoles: {
      heroe: 'Vive en una rutina segura pero vacía; siente que no encaja del todo.',
      mentor: 'Observa en las sombras esperando el momento propicio para intervenir.',
      sombra: 'Su influencia aún es un rumor lejano o una opresión invisible.'
    }
  },
  {
    id: 'llamada_umbral',
    stepNumber: '02',
    name: 'La Llamada & El Umbral',
    icon: '⚡',
    tension: 45,
    summary: 'El Heraldo o una crisis rompe el equilibrio. Tras resistirse por miedo, el héroe cruza el umbral hacia lo desconocido (el Mundo Especial).',
    psychologicalState: 'Despojo de viejas certezas. Primer paso irreversible.',
    archetypeRoles: {
      heroe: 'Rechaza la llamada por miedo hasta que una pérdida lo empuja a cruzar.',
      heraldo: 'Trae la noticia cataclísmica que hace imposible quedarse.',
      mentor: 'Le entrega el amuleto o la lección inicial antes de la partida.'
    }
  },
  {
    id: 'abismo_crisis',
    stepNumber: '03',
    name: 'El Abismo / La Crisis',
    icon: '🔥',
    tension: 95,
    summary: 'La prueba suprema. El héroe enfrenta a la Sombra y sus viejos métodos fallan por completo. Debe renunciar a su "Deseo" superficial para abrazar su "Necesidad".',
    psychologicalState: 'Muerte del ego y desmantelamiento de la mentira fundacional.',
    archetypeRoles: {
      heroe: 'Toca fondo. Reconoce su fallo y renace transformado.',
      sombra: 'Parece haber ganado y exige la capitulación total.',
      aliado: 'Sostiene al héroe al borde del colapso emocional o físico.'
    }
  },
  {
    id: 'transformacion',
    stepNumber: '04',
    name: 'La Transformación & El Elixir',
    icon: '🌟',
    tension: 60,
    summary: 'El personaje renace con sabiduría integrada. Regresa al mundo ordinario no como el que se marchó, sino como un agente capaz de sanar y renovar a su comunidad.',
    psychologicalState: 'Integración ética, libertad interior y maestría de ambos mundos.',
    archetypeRoles: {
      heroe: 'Comparte el elixir y funda un nuevo orden de justicia y equilibrio.',
      mentor: 'Lo reconoce como un igual y culmina su ciclo pedagógico.',
      embaucador: 'Ríe satisfecho porque el statu quo viejo fue quebrado para bien.'
    }
  }
];

const SUBTEXT_SCENARIOS = [
  {
    title: 'Despedida al amanecer',
    plainText: '—Te voy a extrañar mucho cuando te vayas al bosque prohibido. Cuídate de los lobos y recuerda no comer nada que te ofrezcan.',
    subtextText: '—Empaqué doble ración de salvia seca en tu morral. Y afilaron tu hacha anoche... no dejes que nadie se acerque a tu lumbre.',
    analysis: 'El diálogo plano sobre-explica el afecto. El diálogo con subtexto transmite el mismo amor desesperado a través de acciones protectoras y silencios tensos.'
  },
  {
    title: 'Duda de lealtad entre camaradas',
    plainText: '—Sospecho que tú eres el traidor que le dio el mapa a los señores de Xibalbá y me siento muy traicionado.',
    subtextText: '—Extraño, tu capa huele a humo de copal negro. El mismo humo que arde en las pirámides del norte donde nos emboscaron.',
    analysis: 'En vez de acusar con palabras directas que detienen la escena, confronta con evidencia sensorial ineludible que acelera la tensión.'
  },
  {
    title: 'Consejo del Mentor ante la duda',
    plainText: '—Debes tener mucha fe en ti mismo porque eres el elegido de la profecía y vas a vencer a la Sombra.',
    subtextText: '—Tu abuelo se equivocó en tres cosas la noche que cayó el templo. Pero jamás dudó al saltar. Toma el bastón y no me mires más.',
    analysis: 'El subtexto humaniza al mentor al admitir fallos ancestrales y exigir resolución sin discursos vacíos.'
  }
];

const RANDOM_PRESETS = [
  {
    name: 'Kaan el Tejedor de Vientos',
    archetype: 'El Héroe / Protagonista',
    occupation: 'Navegante de Cenotes y Escriba de Mapas',
    want: 'Encontrar el último códice de obsidiana para demostrar el valor de su linaje',
    need: 'Aceptar que el honor no se hereda en piedras, sino en el cuidado a su pueblo',
    wound: 'Vio hundirse la barca de su hermano por desobedecer las cartas náuticas',
    fear: 'Ser recordado como el cobarde que dejó extinguir el fuego de su casa',
    virtue: 'Agudeza visual insuperable y lealtad a toda prueba',
    flaw: 'Orgullo herido y obsesión con las señales del pasado',
    contradiction: 'Navega los ríos más traicioneros con serenidad, pero tiembla al mirar a los ojos a quien ama'
  },
  {
    name: 'Ixchel la Curandera de Sombras',
    archetype: 'El Mentor',
    occupation: 'Guardiana de los Jardines Subterráneos de Ixmukané',
    want: 'Mantener oculta la entrada a la cueva sagrada cueste lo que cueste',
    need: 'Comprender que la sabiduría que no se comparte termina pudriéndose',
    wound: 'Entrenó a un pupilo que vendió sus pócimas a los invasores de Xibalbá',
    fear: 'Ver repetida la traición en un nuevo estudiante ingenuo',
    virtue: 'Conocimiento milenario de plantas y calma frente al caos',
    flaw: 'Sospecha compulsiva y frialdad protectora',
    contradiction: 'Sana las heridas más mortales con dulzura, pero no permite que nadie toque su propia piel'
  },
  {
    name: 'Balam el Rostro de Humo',
    archetype: 'La Sombra / El Antagonista',
    occupation: 'Juez de los Laberintos de Ceniza',
    want: 'Erradicar toda compasión del reino para imponer un orden incorruptible',
    need: 'Darse cuenta de que el dolor no se cura sometiendo a los demás',
    wound: 'Fue desterrado de niño por un error de adivinación de los sacerdotes',
    fear: 'Volver a sentirse indefenso ante la voluntad de otros',
    virtue: 'Disciplina implacable y sentido estricto de la justicia',
    flaw: 'Incapacidad absoluta de perdonar o dudar de su propia ley',
    contradiction: 'Destruye imperios en nombre de la paz y llora a solas en el templo de su madre'
  },
  {
    name: 'Pek el Saltamontes',
    archetype: 'El Camaleón / El Embaucador',
    occupation: 'Comerciante de Reliquias Falsas y Jugador de Pelota',
    want: 'Amasar suficiente oro para comprar su propia isla y no rendir cuentas a nadie',
    need: 'Descubrir que pertenecer a una causa compartida da más libertad que el aislamiento',
    wound: 'Creció como esclavo en las canteras y juró que nadie volvería a enjaular su risa',
    fear: 'Quedar atrapado en la solemnidad o la seriedad de los héroes',
    virtue: 'Improvisación mágica y desparpajo que desarma a los tiranos',
    flaw: 'Cleptomanía ocasional y tendencia a escapar al primer signo de peligro real',
    contradiction: 'Vende amuletos que no sirven para nada, pero regala secretos invaluables a los niños hambrientos'
  }
];

export interface PillarConnection {
  targetId: 'deseo' | 'herida' | 'mascara' | 'paradoja';
  targetTitle: string;
  dynamicLabel: string;
  explanation: string;
  practicalExample: string;
}

export interface PillarData {
  id: 'deseo' | 'herida' | 'mascara' | 'paradoja';
  number: string;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  glowColor: string;
  triggerQuestion: string;
  conceptA: {
    badge: string;
    name: string;
    summary: string;
  };
  conceptB: {
    badge: string;
    name: string;
    summary: string;
  };
  goldenLaw: string;
  connections: PillarConnection[];
  classicEcho: {
    character: string;
    story: string;
    breakdown: string;
  };
}

export const FOUR_PILLARS_DATA: PillarData[] = [
  {
    id: 'deseo',
    number: '01',
    title: 'El Deseo Consciente vs. La Necesidad Profunda',
    subtitle: 'La Meta Externa Tangible frente a la Transformación Espiritual',
    icon: '🎯',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    triggerQuestion: '¿Qué cree querer para ser feliz y qué verdad se niega a admitir para estar en paz?',
    conceptA: {
      badge: 'Meta Externa',
      name: 'El Deseo (La Obsesión Visible)',
      summary: 'La conquista física o el trofeo del mundo ordinario: ganar el campeonato, vengar a su familia, acumular riquezas o ser coronado rey.'
    },
    conceptB: {
      badge: 'Transformación Interior',
      name: 'La Necesidad (El Despertar Espiritual)',
      summary: 'La lección ética que el protagonista ignora o rechaza: aprender a perdonar, admitir su vulnerabilidad, soltar el rencor o amar sin condiciones.'
    },
    goldenLaw: 'El clímax de una gran historia se desata cuando el protagonista es obligado a sacrificar su Deseo Externo para abrazar su Verdadera Necesidad.',
    connections: [
      {
        targetId: 'herida',
        targetTitle: 'La Herida Original',
        dynamicLabel: 'Origen de la Carencia',
        explanation: 'El personaje persigue su Deseo con desesperación porque cree erróneamente que ese trofeo sanará la Herida del pasado.',
        practicalExample: 'Si fue abandonado de niño (Herida), deseará conquistar un reino (Deseo) creyendo que el poder impedirá que lo vuelvan a desechar.'
      },
      {
        targetId: 'mascara',
        targetTitle: 'La Máscara Social',
        dynamicLabel: 'Herramienta de Búsqueda',
        explanation: 'Usa su Máscara pública como armadura cotidiana para perseguir el Deseo sin que nadie descubra su verdadera debilidad.',
        practicalExample: 'El rebelde indiferente usa su pose desafiante para manipular alianzas y alcanzar su meta sin apegarse a nadie.'
      },
      {
        targetId: 'paradoja',
        targetTitle: 'La Paradoja Viva',
        dynamicLabel: 'Punto de Fricción',
        explanation: 'El choque frontal entre lo que quiere (Deseo) y lo que necesita (Necesidad) es la llama viva que produce sus contradicciones morales.',
        practicalExample: 'Un justiciero implacable que busca la paz destruyendo todo a su paso hasta que debe perdonar a su mayor enemigo.'
      }
    ],
    classicEcho: {
      character: 'Odiseo',
      story: 'La Odisea de Homero',
      breakdown: 'Deseo: Llegar a Ítaca como un rey conquistador y arrogante. Necesidad: Desprenderse de la soberbia mortal y honrar a los dioses y a su tripulación.'
    }
  },
  {
    id: 'herida',
    number: '02',
    title: 'La Herida Original y la Falsa Creencia',
    subtitle: 'El Fantasma del Pasado y el Escudo Psicológico Deformado',
    icon: '🥀',
    themeColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    triggerQuestion: '¿Qué suceso trágico partió su vida en dos y qué regla equivocada juró para sobrevivir?',
    conceptA: {
      badge: 'Trauma Fundacional',
      name: 'El Fantasma del Pasado (La Herida)',
      summary: 'El evento doloroso no resuelto: una traición desgarradora, una pérdida irreparable o una culpa del pasado que tiñe su mirada de desconfianza.'
    },
    conceptB: {
      badge: 'Escudo Deformado',
      name: 'La Falsa Creencia (La Mentira)',
      summary: 'La conclusión torcida que adoptó para protegerse: «Nadie es leal», «El valor solo se mide por victorias» o «Si demuestras afecto, te destruyen».'
    },
    goldenLaw: 'El arco del personaje consiste en el desmantelamiento progresivo y doloroso de la Falsa Creencia hasta contemplar la verdad sin armadura.',
    connections: [
      {
        targetId: 'deseo',
        targetTitle: 'El Deseo Consciente',
        dynamicLabel: 'Búsqueda de Alivio',
        explanation: 'La Falsa Creencia le dicta al personaje qué meta externa debe perseguir para sentirse blindado contra su dolor.',
        practicalExample: 'Cree que «el dinero es la única seguridad» (Mentira) porque vio morir a su familia en la miseria (Herida), desatando una codicia voraz.'
      },
      {
        targetId: 'mascara',
        targetTitle: 'La Máscara Social',
        dynamicLabel: 'Mecanismo de Defensa',
        explanation: 'Para que nadie toque la cicatriz de su Herida, el personaje fabrica una fachada protectora que aleja a los demás.',
        practicalExample: 'Se muestra frío y sarcástico para intimidar a cualquiera antes de que puedan descubrir lo aterrado que está de ser lastimado.'
      },
      {
        targetId: 'paradoja',
        targetTitle: 'La Paradoja Viva',
        dynamicLabel: 'Síntoma Visible',
        explanation: 'La herida abierta es la causa directa de que sus virtudes luminosas se retuerzan en defectos trágicos.',
        practicalExample: 'Su profundo instinto protector se convierte en celos asfixiantes y control obsesivo sobre quienes ama.'
      }
    ],
    classicEcho: {
      character: 'Katniss Everdeen',
      story: 'Los Juegos del Hambre',
      breakdown: 'Herida: La muerte de su padre y la hambruna infantil. Falsa Creencia: «Nadie en el Distrito 12 sobrevivirá si se permite confiar en los demás; la ternura es un lujo mortal».'
    }
  },
  {
    id: 'mascara',
    number: '03',
    title: 'El Miedo Inconfesable y la Máscara Social',
    subtitle: 'La Fachada Protectora frente al Pavor Íntimo',
    icon: '🛡️',
    themeColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    triggerQuestion: '¿Qué secreto le aterra revelar y qué personaje interpreta ante los demás?',
    conceptA: {
      badge: 'Pavor Íntimo',
      name: 'El Miedo Inconfesable',
      summary: 'El abismo emocional que no admitiría ni frente a su propio reflejo: el terror a la soledad, el pánico a ser considerado débil, o la culpa de sentirse indigno de ser amado.'
    },
    conceptB: {
      badge: 'Fachada Pública',
      name: 'La Máscara Social (El Personaje)',
      summary: 'La pose deliberada con la que se desenvuelve: el guerrero invencible, el bufón burlón, el erudito solemne o el solitario autosuficiente.'
    },
    goldenLaw: 'Las escenas de mayor magnetismo narrativo ocurren cuando una crisis fractura la Máscara y deja al descubierto el Miedo Inconfesable.',
    connections: [
      {
        targetId: 'herida',
        targetTitle: 'La Herida Original',
        dynamicLabel: 'Muralla Protectora',
        explanation: 'La Máscara actúa como un foso con cocodrilos alrededor de la Herida: nadie puede ver el trauma si solo ve la pose.',
        practicalExample: 'Finge ser un borracho olvidadizo para que nadie sospeche el remordimiento insoportable que corroe sus noches.'
      },
      {
        targetId: 'deseo',
        targetTitle: 'El Deseo Consciente',
        dynamicLabel: 'Disfraz Operativo',
        explanation: 'Utiliza su máscara para conseguir ventajas en el mundo exterior mientras persigue su meta tangible.',
        practicalExample: 'El político encantador seduce a las masas con sonrisas calculadas para amasar el poder que calmará su inseguridad.'
      },
      {
        targetId: 'paradoja',
        targetTitle: 'La Paradoja Viva',
        dynamicLabel: 'Grieta Dramática',
        explanation: 'Cuando la Máscara no coincide con la verdadera esencia moral del personaje, estalla la contradicción humana.',
        practicalExample: 'Alardea de no tener corazón y cobrar por cada favor, pero dona medicinas de contrabando a los huérfanos sin que nadie lo vea.'
      }
    ],
    classicEcho: {
      character: 'Haymitch Abernathy',
      story: 'Trilogía del Capitolio',
      breakdown: 'Miedo: Ver morir a más jóvenes bajo su tutela como mentor. Máscara: El borracho sarcástico e indiferente que aparenta no importarle nada ni nadie.'
    }
  },
  {
    id: 'paradoja',
    number: '04',
    title: 'La Paradoja Viva y la Virtud Distorsionada',
    subtitle: 'La Contradicción Humana y el Peligro de los Extremos',
    icon: '🔄',
    themeColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    triggerQuestion: '¿Cuál es su contradicción irresistible y cuándo su mayor virtud se vuelve peligrosa?',
    conceptA: {
      badge: 'Luz Desbordada',
      name: 'La Virtud Distorsionada',
      summary: 'El talento o principio luminoso que, llevado al fanatismo o acorralado por el miedo, se vuelve dañino: la lealtad se vuelve ceguera cómplice; la valentía, temeridad imprudente.'
    },
    conceptB: {
      badge: 'Tensión de Opuestos',
      name: 'La Contradicción Humana',
      summary: 'La coexistencia de dos impulsos aparentemente incompatibles que conviven en su pecho y lo convierten en un ser multidimensional que sorprende al lector.'
    },
    goldenLaw: 'Los personajes planos son exclusivamente buenos o malos; los seres inolvidables están construidos con paradojas éticas que desafían las etiquetas simples.',
    connections: [
      {
        targetId: 'deseo',
        targetTitle: 'El Deseo vs Necesidad',
        dynamicLabel: 'Detonante del Cambio',
        explanation: 'La paradoja obliga al personaje a dudar de su Deseo egoísta y lo empuja hacia su verdadera Necesidad transformadora.',
        practicalExample: 'Su orgullo le exige ganar, pero su empatía oculta le impide rematar a su rival indefenso.'
      },
      {
        targetId: 'herida',
        targetTitle: 'La Herida Original',
        dynamicLabel: 'Herida en Carne Viva',
        explanation: 'La contradicción es la prueba viviente de que la herida ancestral sigue ardiendo bajo la piel.',
        practicalExample: 'Odia la guerra porque destruyó su hogar, pero es el combatiente más despiadado del campo de batalla.'
      },
      {
        targetId: 'mascara',
        targetTitle: 'La Máscara Social',
        dynamicLabel: 'Quiebre de la Pose',
        explanation: 'La paradoja traiciona continuamente a la Máscara, revelando al ser compasivo o temeroso que se esconde detrás.',
        practicalExample: 'El sicario implacable que no puede evitar adoptar a un gato callejero herido en un callejón lluvioso.'
      }
    ],
    classicEcho: {
      character: 'Hunahpú e Ixbalanqué',
      story: 'Popol Vuh (Cosmogonía Maya)',
      breakdown: 'Virtud distorsionada: Astucia y desconfianza sagrada. Paradoja: Se dejan arrojar y triturar en una hoguera de Xibalbá para renacer como maestros de la ilusión y el milagro.'
    }
  }
];

export const CAUSAL_CASE_STUDIES = [
  {
    id: 'katniss',
    name: 'Katniss Everdeen',
    archetypeTitle: 'La Protectora Desconfiada (Heroína)',
    icon: '🏹',
    color: '#38bdf8',
    herida: 'Muerte de su padre en la explosión minera y el abandono catatónico de su madre.',
    mentira: '«El afecto te vuelve vulnerable y dependiente; solo en el aislamiento se sobrevive».',
    mascara: 'Frialdad cortante, silencio impenetrable y desdén hacia cualquier muestra de ternura.',
    deseo: 'Mantener a salvo únicamente a su hermana Prim y regresar a su bosque en paz.',
    necesidad: 'Asumir el liderazgo colectivo y convertirse en la esperanza que derribe la tiranía.',
    paradoja: 'Desafía al imperio más letal del planeta por amor fraterno, pero es incapaz de pronunciar palabras cariñosas.',
    climaxKey: 'Ofrece bayas venenosas junto a Peeta, prefiriendo morir antes que acatar las reglas del Capitolio.'
  },
  {
    id: 'gemelos',
    name: 'Hunahpú e Ixbalanqué',
    archetypeTitle: 'Los Vindicadores Sagrados (Héroes Míticos)',
    icon: '🌽',
    color: '#22c55e',
    herida: 'La decapitación y afrenta sufrida por su padre y tío en las canchas de Xibalbá.',
    mentira: '«Frente a los señores de la muerte la bondad es suicidio; solo la astucia sin piedad restaura el honor».',
    mascara: 'Jóvenes cazadores despreocupados con cerbatanas mágicas y adivinadores itinerantes.',
    deseo: 'Recuperar la pelota sagrada y humillar en su propio juego a los señores del inframundo.',
    necesidad: 'Completar el ciclo de purificación cósmica para permitir el florecimiento de los hombres de maíz.',
    paradoja: 'Utilizan el engaño, la trampa y el disfraz para instaurar la verdad y el orden sagrado del cielo.',
    climaxKey: 'Aceptan saltar voluntariamente al fuego de los señores de la muerte para renacer convertidos en el Sol y la Luna.'
  },
  {
    id: 'haymitch',
    name: 'Haymitch Abernathy',
    archetypeTitle: 'El Mentor Desencantado',
    icon: '🧙‍♂️',
    color: '#a855f7',
    herida: 'El asesinato de su familia por orden del Capitolio tras ganar sus propios juegos con un truco de ingenio.',
    mentira: '«Cualquier tributo que guíes morirá de todos modos; encariñarse es cavar tu propia tumba».',
    mascara: 'El alcohólico incoherente, burlón y grosero que nunca presta atención a las ceremonias.',
    deseo: 'Emborracharse hasta el olvido para no escuchar los nombres de los caídos.',
    necesidad: 'Volver a creer en una causa superior y arriesgar su vida para articular la rebelión tras bambalinas.',
    paradoja: 'Insulta despiadadamente a sus pupilos mientras negocia patrocinios desesperados para enviarles medicina al campo de batalla.',
    climaxKey: 'Entiende que Katniss y Peeta merecen vivir y coordina en las sombras la fuga hacia el Distrito 13.'
  },
  {
    id: 'killmonger',
    name: 'Erik Killmonger',
    archetypeTitle: 'La Sombra con Causa Justa',
    icon: '🌑',
    color: '#f43f5e',
    herida: 'El asesinato de su padre a manos de su propio tío rey y el abandono infantil en Oakland.',
    mentira: '«El mundo solo entiende el lenguaje de la pólvora y las cadenas; para liberar a los oprimidos debes convertirte en un opresor más despiadado».',
    mascara: 'Guerrero de operaciones encubiertas implacable, cínico y sin patria.',
    deseo: 'Conquistar el trono de Wakanda e iniciar una guerra global armada.',
    necesidad: 'Reconocer que el odio heredado destruye la misma libertad que pretende defender.',
    paradoja: 'Llora la opresión de millones de inocentes mientras asesina a sangre fría a quienes se interponen en su camino.',
    climaxKey: 'Prefiere ser arrojado al océano libre como sus ancestros antes que aceptar la jaula de un perdón misericordioso.'
  }
];

export default function ConstruyendoPersonaje() {
  const { config, saveConfigToFirestore } = usePortalConfig();
  const { user } = useAuth();

  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData>(ARCHETYPES[0]);
  const [archetypeTab, setArchetypeTab] = useState<'perfil' | 'relaciones' | 'prueba'>('perfil');
  const [activeTab, setActiveTab] = useState<'psicologia' | 'arquetipos' | 'viaje' | 'herramientas' | 'taller'>('psicologia');

  // Journey interactive stage
  const [activeJourneyStageId, setActiveJourneyStageId] = useState<string>('abismo_crisis');

  // Tools Subtext state
  const [activeSubtextIdx, setActiveSubtextIdx] = useState(0);

  // Psychology Interactive Comparator
  const [selectedVirtue, setSelectedVirtue] = useState('Valentía Indomable');
  const [selectedFlaw, setSelectedFlaw] = useState('Arrogancia Ciega');

  // Estados interactivos para las 4 Fichas Psicológicas y el Telar Causal de Conceptos
  const [selectedPillarId, setSelectedPillarId] = useState<'deseo' | 'herida' | 'mascara' | 'paradoja'>('deseo');
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string>('katniss');
  const [isCustomCausalMode, setIsCustomCausalMode] = useState<boolean>(false);
  const [customCausalChain, setCustomCausalChain] = useState({
    herida: 'Traición del maestro en quien más confiaba durante una batalla decisiva.',
    mentira: '«Nadie es leal cuando arrecia la tormenta; solo en soledad se está a salvo».',
    mascara: 'El guerrero cínico y distante que cobra oro por cada palabra y favor.',
    deseo: 'Vengar a su linaje y derribar al consejo que lo traicionó.',
    necesidad: 'Aprender a perdonar y aceptar la mano extendida de sus compañeros.',
    paradoja: 'Salva vidas en secreto a mitad de la noche, pero de día proclama no creer en nadie.'
  });

  // Local state for images fallback/cache
  const [localArchetypeImages, setLocalArchetypeImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('local_archetype_images');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Lightbox & Uploader states
  const [isInlineUploaderOpen, setIsInlineUploaderOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadStatusText, setUploadStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Character Forge State
  const [charName, setCharName] = useState('Ixchel de la Selva');
  const [charArchetype, setCharArchetype] = useState('El Héroe / Protagonista');
  const [charOccupation, setCharOccupation] = useState('Guardiana de las Semillas Sagradas');
  const [charWant, setCharWant] = useState('Recuperar el libro robado de su aldea ancestral');
  const [charNeed, setCharNeed] = useState('Aprender a confiar en los demás y soltar el control absoluto');
  const [charWound, setCharWound] = useState('Fue traicionada por su antiguo mentor durante la gran sequía');
  const [charFear, setCharFear] = useState('Quedar indefensa y ver destruido a su pueblo por su culpa');
  const [charVirtue, setCharVirtue] = useState('Valentía indomable y memoria enciclopédica de las estrellas');
  const [charFlaw, setCharFlaw] = useState('Terquedad extrema y sospecha compulsiva hacia los extraños');
  const [charContradiction, setCharContradiction] = useState('Protege la vida a toda costa, pero no permite que nadie se acerque a su corazón');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const sectionRefs = {
    psicologia: useRef<HTMLDivElement>(null),
    arquetipos: useRef<HTMLDivElement>(null),
    viaje: useRef<HTMLDivElement>(null),
    herramientas: useRef<HTMLDivElement>(null),
    taller: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  // Keyboard navigation for Lightbox (Left / Right arrows & Escape)
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowRight') navigateArchetype(1);
        if (e.key === 'ArrowLeft') navigateArchetype(-1);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isLightboxOpen, selectedArchetype]);

  const navigateArchetype = (direction: number) => {
    const currentIndex = ARCHETYPES.findIndex(a => a.id === selectedArchetype.id);
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = ARCHETYPES.length - 1;
    if (nextIndex >= ARCHETYPES.length) nextIndex = 0;
    setSelectedArchetype(ARCHETYPES[nextIndex]);
  };

  // Determine current image for active archetype with priority on Firestore config
  const getArchetypeImage = (archetypeId: string): string => {
    return (
      config.archetypeImages?.[archetypeId] ||
      localArchetypeImages[archetypeId] ||
      ''
    );
  };

  const currentArchetypeImg = getArchetypeImage(selectedArchetype.id);

  const scrollToSection = (tab: 'psicologia' | 'arquetipos' | 'viaje' | 'herramientas' | 'taller') => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Process and upload an image file
  const processImageFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadStatusText('Optimizando imagen en formato WebP...');

      const compressedBlob = await compressImageWebP(file, 1280, 720, 0.85);
      let finalUrl = '';

      if (user) {
        setUploadStatusText('Guardando en la nube...');
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') + '.webp';
        const fileRef = ref(storage, `archetypes-assets/${Date.now()}_${cleanName}`);
        await uploadBytes(fileRef, compressedBlob, { contentType: 'image/webp' });
        finalUrl = await getDownloadURL(fileRef);

        const updatedImages = {
          ...(config.archetypeImages || {}),
          [selectedArchetype.id]: finalUrl
        };
        await saveConfigToFirestore({
          ...config,
          archetypeImages: updatedImages
        });
      } else {
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
      }

      const updatedLocal = { ...localArchetypeImages, [selectedArchetype.id]: finalUrl };
      setLocalArchetypeImages(updatedLocal);
      try {
        localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));
      } catch {}

      setIsInlineUploaderOpen(false);
      setUploadStatusText('');
      soundEffects.playClick();
    } catch (err) {
      console.error('Error al procesar imagen de arquetipo:', err);
      alert('Hubo un inconveniente al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSaveCustomUrl = async () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();

    if (user) {
      const updatedImages = {
        ...(config.archetypeImages || {}),
        [selectedArchetype.id]: url
      };
      await saveConfigToFirestore({
        ...config,
        archetypeImages: updatedImages
      });
    }

    const updatedLocal = { ...localArchetypeImages, [selectedArchetype.id]: url };
    setLocalArchetypeImages(updatedLocal);
    try {
      localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));
    } catch {}

    setCustomUrlInput('');
    setIsInlineUploaderOpen(false);
    soundEffects.playClick();
  };

  const handleRemoveImage = async () => {
    if (!confirm('¿Deseas retirar esta imagen para volver al arte emblemático por defecto?')) return;

    if (user) {
      const updated = { ...(config.archetypeImages || {}) };
      delete updated[selectedArchetype.id];
      await saveConfigToFirestore({
        ...config,
        archetypeImages: updated
      });
    }

    const updatedLocal = { ...localArchetypeImages };
    delete updatedLocal[selectedArchetype.id];
    setLocalArchetypeImages(updatedLocal);
    try {
      localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));
    } catch {}
    soundEffects.playClick();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // Preset loader & Randomizer
  const loadPresetExample = (presetType: 'guerrero' | 'sabio' | 'rebelde') => {
    soundEffects.playClick();
    if (presetType === 'guerrero') {
      const p = RANDOM_PRESETS[0];
      applyPresetData(p);
    } else if (presetType === 'sabio') {
      const p = RANDOM_PRESETS[1];
      applyPresetData(p);
    } else {
      const p = RANDOM_PRESETS[3];
      applyPresetData(p);
    }
  };

  const applyPresetData = (p: typeof RANDOM_PRESETS[0]) => {
    setCharName(p.name);
    setCharArchetype(p.archetype);
    setCharOccupation(p.occupation);
    setCharWant(p.want);
    setCharNeed(p.need);
    setCharWound(p.wound);
    setCharFear(p.fear);
    setCharVirtue(p.virtue);
    setCharFlaw(p.flaw);
    setCharContradiction(p.contradiction);
  };

  const triggerRandomSpark = () => {
    soundEffects.playSuccessFanfare();
    const randomPreset = RANDOM_PRESETS[Math.floor(Math.random() * RANDOM_PRESETS.length)];
    applyPresetData(randomPreset);
  };

  const handleCopyPassport = async () => {
    const textToCopy = `=== FICHA DE CREACIÓN DE PERSONAJE ===
Nombre: ${charName}
Arquetipo: ${charArchetype}
Ocupación: ${charOccupation}
Meta Consciente / Deseo Externo: ${charWant}
Transformación / Necesidad Profunda: ${charNeed}
Herida del Pasado / Fantasma Interior: ${charWound}
Mayor Miedo / Vulnerabilidad Oculta: ${charFear}
Virtud Luminosa: ${charVirtue}
Defecto Trágico / Punto Ciego: ${charFlaw}
Paradoja Central: "${charContradiction}"
Plataforma Editorial Lluvia de Ideas | Creatika 2026`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(true);
      soundEffects.playClick();
      setTimeout(() => setCopiedNotification(false), 3500);
    } catch {
      alert('No se pudo copiar automáticamente. Por favor, selecciona y copia manualmente.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsPdfGenerating(true);
      soundEffects.playClick();
      await generateCharacterWorksheetPDF({
        name: charName,
        archetype: charArchetype,
        occupation: charOccupation,
        want: charWant,
        need: charNeed,
        wound: charWound,
        fear: charFear,
        virtue: charVirtue,
        flaw: charFlaw,
        contradiction: charContradiction,
        authorName: user?.displayName || 'Autor Creador',
        schoolName: 'Taller Literario Creatika - Lluvia de Ideas',
        grade: 'Narrativa y Diseño de Personajes'
      });
      soundEffects.playSuccessFanfare();
    } catch (err) {
      console.error('Error generando PDF de personaje:', err);
      alert('Hubo un problema al compilar el PDF.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const activeStageData = useMemo(() => {
    return JOURNEY_STAGES_DATA.find(s => s.id === activeJourneyStageId) || JOURNEY_STAGES_DATA[2];
  }, [activeJourneyStageId]);

  const activePillar = useMemo(() => {
    return FOUR_PILLARS_DATA.find(p => p.id === selectedPillarId) || FOUR_PILLARS_DATA[0];
  }, [selectedPillarId]);

  const activeCaseStudy = useMemo(() => {
    return CAUSAL_CASE_STUDIES.find(c => c.id === selectedCaseStudyId) || CAUSAL_CASE_STUDIES[0];
  }, [selectedCaseStudyId]);

  return (
    <div className="personaje-page-container">
      <LandingTopBar />

      {/* Hero Section */}
      <section className="personaje-hero">
        <div className="personaje-badge-pill animate-pop-in">
          <span>✨</span> CREATIKA • CLASE MAGISTRAL NARRATIVA
        </div>
        <h1 className="personaje-hero-title">
          Construyendo el Personaje: <br />
          <span className="personaje-hero-accent">El Arte de Dar Vida a Seres Inolvidables</span>
        </h1>
        <p className="personaje-hero-subtitle">
          De la mitología ancestral a la literatura contemporánea: descubre los principios dramáticos,
          psicológicos y arquetípicos para forjar personajes con alma, paradoja y trascendencia.
        </p>

        {/* Section Navigation Ribbon */}
        <nav className="personaje-nav-ribbon" aria-label="Navegación por módulos de personajes">
          <button 
            className={`personaje-nav-btn ${activeTab === 'psicologia' ? 'active' : ''}`}
            onClick={() => scrollToSection('psicologia')}
          >
            <span>🧠</span> 01. Psicología Profunda
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'arquetipos' ? 'active' : ''}`}
            onClick={() => scrollToSection('arquetipos')}
          >
            <span>🎭</span> 02. Arquetipos Dinámicos
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'viaje' ? 'active' : ''}`}
            onClick={() => scrollToSection('viaje')}
          >
            <span>🗺️</span> 03. El Viaje del Héroe
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'herramientas' ? 'active' : ''}`}
            onClick={() => scrollToSection('herramientas')}
          >
            <span>✍️</span> 04. Herramientas de Guion
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'taller' ? 'active' : ''}`}
            onClick={() => scrollToSection('taller')}
          >
            <span>⚡</span> 05. La Forja (Taller)
          </button>
        </nav>
      </section>

      {/* =========================================================================
          MÓDULO 1: PSICOLOGÍA PROFUNDA DEL PERSONAJE (LAS 4 FICHAS DEL ALMA)
          ========================================================================= */}
      <section ref={sectionRefs.psicologia} className="personaje-section" id="psicologia">
        <div className="section-header-block">
          <span className="section-tag">Módulo 1</span>
          <h2 className="section-main-title">La Anatomía Interna: Los Cuatro Pilares del Alma</h2>
          <p className="section-description">
            Un gran personaje no se define por su vestimenta ni por sus poderes, sino por sus
            <strong> contradicciones éticas</strong> y el encadenamiento causal entre su pasado, su máscara, su deseo y su necesidad espiritual.
          </p>
        </div>

        {/* Las 4 Fichas Psicológicas Maestras */}
        <div className="pillars-four-grid">
          {FOUR_PILLARS_DATA.map((pillar) => {
            const isSelected = selectedPillarId === pillar.id;
            return (
              <div 
                key={pillar.id}
                className={`narrative-card pillar-v2-card ${isSelected ? 'pillar-active' : ''}`}
                style={{
                  borderColor: isSelected ? pillar.themeColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? `0 0 30px ${pillar.glowColor}` : undefined
                }}
              >
                {/* Header de la Ficha */}
                <div className="pillar-v2-header">
                  <span className="pillar-v2-number" style={{ color: pillar.themeColor }}>
                    {pillar.number}
                  </span>
                  <div className="pillar-v2-icon-wrap" style={{ borderColor: pillar.themeColor }}>
                    <span>{pillar.icon}</span>
                  </div>
                  <div className="pillar-v2-title-box">
                    <h3 className="pillar-v2-title" style={{ color: isSelected ? pillar.themeColor : '#fff' }}>
                      {pillar.title}
                    </h3>
                    <span className="pillar-v2-sub">{pillar.subtitle}</span>
                  </div>
                </div>

                {/* Pregunta Clave */}
                <div className="pillar-v2-question-box">
                  <span className="question-icon">❓</span>
                  <p className="question-text">«{pillar.triggerQuestion}»</p>
                </div>

                {/* Bloques Conceptuales en Contraste (A vs B) */}
                <div className="pillar-v2-concepts-grid">
                  <div className="concept-contrast-card concept-a">
                    <div className="concept-tag" style={{ color: pillar.themeColor, borderColor: `${pillar.themeColor}55` }}>
                      {pillar.conceptA.badge}
                    </div>
                    <h4 className="concept-name">{pillar.conceptA.name}</h4>
                    <p className="concept-desc">{pillar.conceptA.summary}</p>
                  </div>

                  <div className="concept-contrast-card concept-b">
                    <div className="concept-tag" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.35)' }}>
                      {pillar.conceptB.badge}
                    </div>
                    <h4 className="concept-name">{pillar.conceptB.name}</h4>
                    <p className="concept-desc">{pillar.conceptB.summary}</p>
                  </div>
                </div>

                {/* Regla de Oro Dramatúrgica */}
                <div className="pillar-v2-golden-rule">
                  <strong>💡 Ley Narrativa:</strong> {pillar.goldenLaw}
                </div>

                {/* Ejemplo Canónico */}
                <div className="pillar-v2-canon-echo">
                  <span className="canon-tag">📖 Ejemplo Magistral:</span>
                  <strong>{pillar.classicEcho.character}</strong> <em>({pillar.classicEcho.story})</em>
                  <p>{pillar.classicEcho.breakdown}</p>
                </div>

                {/* Botón de Interconexión Causal */}
                <button 
                  className={`pillar-explore-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, ${pillar.themeColor}33, #0f172a)` : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isSelected ? pillar.themeColor : 'rgba(255, 255, 255, 0.15)',
                    color: isSelected ? '#fff' : '#cbd5e1'
                  }}
                  onClick={() => {
                    setSelectedPillarId(pillar.id);
                    soundEffects.playClick();
                  }}
                >
                  <span>⚡</span> {isSelected ? 'Pilar en Enfoque Activo' : 'Explorar Relación con los Otros 3 Pilares'}
                </button>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            EL TELAR CAUSAL: CONECTOR DINÁMICO DE CONCEPTOS E IDEAS
            ========================================================================= */}
        <div className="causal-loom-container card-glass animate-fade-in">
          <div className="causal-loom-header">
            <div className="causal-badge">
              <span>🕸️</span> EL TELAR CAUSAL DE LA PSIQUE
            </div>
            <h3 className="causal-title">
              Cómo se Relacionan los Cuatro Pilares: <span style={{ color: activePillar.themeColor }}>{activePillar.title}</span>
            </h3>
            <p className="causal-subtitle">
              Los conceptos psicológicos no existen aislados. Un trauma engendra una creencia, la creencia erige una máscara, la máscara persigue un deseo y el deseo choca contra la verdad en el clímax.
            </p>
          </div>

          {/* Selector de Perspectiva de Pilar */}
          <div className="causal-pillar-tabs" role="tablist">
            {FOUR_PILLARS_DATA.map((p) => {
              const isActive = selectedPillarId === p.id;
              return (
                <button
                  key={p.id}
                  className={`causal-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPillarId(p.id);
                    soundEffects.playClick();
                  }}
                  style={{
                    borderBottomColor: isActive ? p.themeColor : 'transparent',
                    boxShadow: isActive ? `0 4px 15px ${p.glowColor}` : undefined
                  }}
                >
                  <span>{p.icon}</span>
                  <strong>{p.number}. {p.title.split(' vs.')[0].split(' y ')[0]}</strong>
                </button>
              );
            })}
          </div>

          {/* Diagrama de Flujo Causal de los 4 Conceptos */}
          <div className="causal-flow-diagram">
            <div className="flow-step">
              <span className="flow-step-icon">🥀</span>
              <span className="flow-step-num">01</span>
              <strong className="flow-step-title">Herida del Pasado</strong>
              <small className="flow-step-desc">El trauma original que rompe el equilibrio</small>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step">
              <span className="flow-step-icon">🎭</span>
              <span className="flow-step-num">02</span>
              <strong className="flow-step-title">Falsa Creencia</strong>
              <small className="flow-step-desc">La mentira adoptada para no sufrir</small>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step">
              <span className="flow-step-icon">🛡️</span>
              <span className="flow-step-num">03</span>
              <strong className="flow-step-title">Máscara & Miedo</strong>
              <small className="flow-step-desc">La fachada que oculta la fragilidad</small>
            </div>
            <div className="flow-arrow">➔</div>
            <div className="flow-step">
              <span className="flow-step-icon">🎯</span>
              <span className="flow-step-num">04</span>
              <strong className="flow-step-title">Deseo vs Necesidad</strong>
              <small className="flow-step-desc">El choque moral definitivo en el abismo</small>
            </div>
          </div>

          {/* Matriz de Conexiones Activas desde el Pilar Seleccionado */}
          <div className="causal-connections-grid">
            {activePillar.connections.map((conn, idx) => (
              <div key={idx} className="causal-conn-card">
                <div className="conn-card-header">
                  <span className="conn-direction-tag">
                    {activePillar.icon} ➔ {conn.targetTitle}
                  </span>
                  <span className="conn-dynamic-label">{conn.dynamicLabel}</span>
                </div>
                <p className="conn-explanation">{conn.explanation}</p>
                <div className="conn-scene-box">
                  <strong>🎬 En Escena:</strong>
                  <span>{conn.practicalExample}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Banco de Casos de Estudio Reales (Relaciones en Vivo) */}
          <div className="causal-case-studies-block">
            <div className="case-studies-header">
              <span className="case-studies-badge">🎭 CASOS DE ESTUDIO MAGISTRALES</span>
              <h4>Observa cómo se articulan los cuatro pilares en personajes célebres:</h4>
            </div>

            <div className="case-studies-buttons-row">
              {CAUSAL_CASE_STUDIES.map((cs) => {
                const isThisActive = selectedCaseStudyId === cs.id && !isCustomCausalMode;
                return (
                  <button
                    key={cs.id}
                    className={`case-study-select-btn ${isThisActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCaseStudyId(cs.id);
                      setIsCustomCausalMode(false);
                      soundEffects.playClick();
                    }}
                    style={{
                      borderColor: isThisActive ? cs.color : 'rgba(255,255,255,0.12)'
                    }}
                  >
                    <span>{cs.icon}</span>
                    <div>
                      <strong>{cs.name}</strong>
                      <small>{cs.archetypeTitle.split('(')[0]}</small>
                    </div>
                  </button>
                );
              })}

              <button
                className={`case-study-select-btn ${isCustomCausalMode ? 'active' : ''}`}
                onClick={() => {
                  setIsCustomCausalMode(true);
                  soundEffects.playClick();
                }}
                style={{
                  borderColor: isCustomCausalMode ? '#ec4899' : 'rgba(255,255,255,0.12)'
                }}
              >
                <span>⚡</span>
                <div>
                  <strong>Modo Creador Libre</strong>
                  <small>Forja tu propia cadena causal</small>
                </div>
              </button>
            </div>

            {/* Ficha Desplegada del Caso Activo */}
            {!isCustomCausalMode ? (
              <div className="case-study-active-display" style={{ borderTopColor: activeCaseStudy.color }}>
                <div className="case-display-top">
                  <div className="case-display-identity">
                    <span className="case-avatar">{activeCaseStudy.icon}</span>
                    <div>
                      <h4 className="case-name">{activeCaseStudy.name}</h4>
                      <span className="case-role">{activeCaseStudy.archetypeTitle}</span>
                    </div>
                  </div>

                  <button 
                    className="case-inject-btn"
                    onClick={() => {
                      soundEffects.playSuccessFanfare();
                      setCharName(activeCaseStudy.name);
                      setCharArchetype(
                        activeCaseStudy.archetypeTitle.includes('Heroína') || activeCaseStudy.archetypeTitle.includes('Héroes')
                          ? 'El Héroe / Protagonista'
                          : activeCaseStudy.archetypeTitle.includes('Mentor')
                          ? 'El Mentor'
                          : 'La Sombra / El Antagonista'
                      );
                      setCharWant(activeCaseStudy.deseo);
                      setCharNeed(activeCaseStudy.necesidad);
                      setCharWound(activeCaseStudy.herida);
                      setCharFear(activeCaseStudy.mascara);
                      setCharContradiction(activeCaseStudy.paradoja);
                      scrollToSection('taller');
                    }}
                  >
                    <span>⚡</span> Inyectar este Arco a la Forja de Personajes ➔
                  </button>
                </div>

                <div className="case-chain-grid">
                  <div className="chain-node-box">
                    <span className="chain-node-tag" style={{ color: '#a855f7' }}>🥀 1. Herida Original</span>
                    <p>{activeCaseStudy.herida}</p>
                  </div>
                  <div className="chain-node-box">
                    <span className="chain-node-tag" style={{ color: '#ec4899' }}>🎭 2. Falsa Creencia</span>
                    <p>{activeCaseStudy.mentira}</p>
                  </div>
                  <div className="chain-node-box">
                    <span className="chain-node-tag" style={{ color: '#f59e0b' }}>🛡️ 3. Máscara & Miedo</span>
                    <p>{activeCaseStudy.mascara}</p>
                  </div>
                  <div className="chain-node-box">
                    <span className="chain-node-tag" style={{ color: '#38bdf8' }}>🎯 4. Deseo vs Necesidad</span>
                    <p><strong>Deseo:</strong> {activeCaseStudy.deseo}<br /><strong>Necesidad:</strong> {activeCaseStudy.necesidad}</p>
                  </div>
                </div>

                <div className="case-climax-banner">
                  <strong>🔥 Paradoja en el Clímax:</strong> {activeCaseStudy.paradoja}
                  <div style={{ marginTop: '6px', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <em>Resolución:</em> {activeCaseStudy.climaxKey}
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Creador Libre */
              <div className="case-custom-editor-box">
                <div className="case-display-top">
                  <div>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>🧪 Forja Tu Propia Cadena Causal</h4>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Escribe o modifica libremente cada eslabón y transfiérelo al taller literario:</p>
                  </div>

                  <button 
                    className="case-inject-btn"
                    onClick={() => {
                      soundEffects.playSuccessFanfare();
                      setCharName('Personaje Libre');
                      setCharWant(customCausalChain.deseo);
                      setCharNeed(customCausalChain.necesidad);
                      setCharWound(customCausalChain.herida);
                      setCharFear(customCausalChain.mascara);
                      setCharContradiction(customCausalChain.paradoja);
                      scrollToSection('taller');
                    }}
                  >
                    <span>⚡</span> Transferir a la Forja ➔
                  </button>
                </div>

                <div className="custom-chain-inputs-grid">
                  <div className="custom-input-group">
                    <label>🥀 1. Herida Original (El Trauma):</label>
                    <textarea 
                      className="forge-textarea"
                      value={customCausalChain.herida}
                      onChange={e => setCustomCausalChain(prev => ({ ...prev, herida: e.target.value }))}
                    />
                  </div>
                  <div className="custom-input-group">
                    <label>🎭 2. Falsa Creencia (La Mentira):</label>
                    <textarea 
                      className="forge-textarea"
                      value={customCausalChain.mentira}
                      onChange={e => setCustomCausalChain(prev => ({ ...prev, mentira: e.target.value }))}
                    />
                  </div>
                  <div className="custom-input-group">
                    <label>🛡️ 3. Máscara Social (La Fachada):</label>
                    <textarea 
                      className="forge-textarea"
                      value={customCausalChain.mascara}
                      onChange={e => setCustomCausalChain(prev => ({ ...prev, mascara: e.target.value }))}
                    />
                  </div>
                  <div className="custom-input-group">
                    <label>🎯 4. Deseo Externo vs Necesidad:</label>
                    <textarea 
                      className="forge-textarea"
                      value={`Deseo: ${customCausalChain.deseo}\nNecesidad: ${customCausalChain.necesidad}`}
                      onChange={e => {
                        const lines = e.target.value.split('\n');
                        setCustomCausalChain(prev => ({
                          ...prev,
                          deseo: lines[0]?.replace('Deseo:', '').trim() || prev.deseo,
                          necesidad: lines[1]?.replace('Necesidad:', '').trim() || prev.necesidad
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simulador Interactivo: Mezclador de Paradoja Humana */}
        <div className="interactive-paradox-box card-glass animate-fade-in" style={{ marginTop: '40px' }}>
          <div className="paradox-header">
            <span style={{ fontSize: '1.8rem' }}>🧪</span>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Laboratorio de Paradojas de Personalidad</h4>
              <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Combina una virtud noble con un defecto visceral y observa cómo nace un personaje tridimensional:</p>
            </div>
          </div>

          <div className="paradox-controls-grid">
            <div>
              <label className="paradox-label">✨ Virtud Luminosa:</label>
              <select className="forge-select" value={selectedVirtue} onChange={e => setSelectedVirtue(e.target.value)}>
                <option value="Valentía Indomable">Valentía Indomable</option>
                <option value="Lealtad Absoluta">Lealtad Absoluta</option>
                <option value="Empatía Infinita">Empatía Infinita</option>
                <option value="Sabiduría Mística">Sabiduría Mística</option>
                <option value="Ingenio Brillante">Ingenio Brillante</option>
              </select>
            </div>

            <div>
              <label className="paradox-label">⚠️ Defecto Visceral:</label>
              <select className="forge-select" value={selectedFlaw} onChange={e => setSelectedFlaw(e.target.value)}>
                <option value="Arrogancia Ciega">Arrogancia Ciega</option>
                <option value="Rencor Incurable">Rencor Incurable</option>
                <option value="Pánico al Abandono">Pánico al Abandono</option>
                <option value="Sospecha Compulsiva">Sospecha Compulsiva</option>
                <option value="Avaricia de Control">Avaricia de Control</option>
              </select>
            </div>
          </div>

          <div className="paradox-result-display">
            <div className="paradox-spark-tag">🔥 Contradicción Generada:</div>
            <p className="paradox-result-quote">
              «Posee una <strong>{selectedVirtue}</strong> que inspira a ejércitos enteros, pero en el fondo de su corazón carga con un <strong>{selectedFlaw}</strong> que amenaza con quemar a quienes más ama.»
            </p>
            <div className="paradox-hint">
              <span>💡 Pista Dramática:</span> Coloca a tu personaje en una escena donde actuar según su virtud desencadene accidentalmente su mayor defecto.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 2: ARQUETIPOS DE PERSONAJES (CON IMAGEN GRANDE Y COMPRESIÓN)
          ========================================================================= */}
      <section ref={sectionRefs.arquetipos} className="personaje-section" id="arquetipos">
        <div className="section-header-block">
          <span className="section-tag">Módulo 2</span>
          <h2 className="section-main-title">Arquetipos Dinámicos: Más Allá del Héroe</h2>
          <p className="section-description">
            Explora las seis figuras esenciales de la narrativa universal. Las ilustraciones oficiales configuradas desde Gerencia se transmiten en tiempo real con calidad cinematográfica.
          </p>
        </div>

        <div className="archetypes-explorer">
          {/* Selector de Arquetipos con Miniatura / Icono */}
          <div className="archetypes-list" role="tablist">
            {ARCHETYPES.map((arch) => {
              const archImg = getArchetypeImage(arch.id);
              const isActive = selectedArchetype.id === arch.id;
              return (
                <button
                  key={arch.id}
                  className={`archetype-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedArchetype(arch);
                    setIsInlineUploaderOpen(false);
                    soundEffects.playClick();
                  }}
                  role="tab"
                  aria-selected={isActive}
                  style={{
                    borderLeftColor: isActive ? arch.color : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 20px ${arch.color}33` : undefined
                  }}
                >
                  <div className="arch-btn-thumb-wrap" style={{ borderColor: arch.color }}>
                    {archImg ? (
                      <img 
                        src={archImg} 
                        alt={arch.name} 
                        className="arch-btn-thumb-img" 
                        loading="lazy" 
                        decoding="async" 
                      />
                    ) : (
                      <span className="arch-btn-icon">{arch.icon}</span>
                    )}
                  </div>
                  <div className="arch-btn-info">
                    <strong style={{ color: isActive ? arch.color : '#fff' }}>{arch.name}</strong>
                    <small>{arch.roleSubtitle}</small>
                  </div>
                  {config.archetypeImages?.[arch.id] && (
                    <span className="arch-official-badge" title="Ilustración Oficial de Editorial">🎨</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Panel Detallado del Arquetipo Seleccionado con Gran Banner de Presentación */}
          <div className="archetype-detail-panel animate-fade-in" key={selectedArchetype.id}>
            
            {/* Visual Showcase Banner de Alta Calidad con Soporte Drag & Drop */}
            <div 
              className={`arch-visual-showcase ${isDragActive ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                boxShadow: `0 18px 45px rgba(0, 0, 0, 0.65), 0 0 35px ${selectedArchetype.color}25`,
                border: `1.5px solid ${selectedArchetype.color}44`
              }}
            >
              {currentArchetypeImg ? (
                <>
                  <img
                    src={currentArchetypeImg}
                    alt={`Presentación visual de ${selectedArchetype.name}`}
                    className="arch-banner-img"
                    loading="lazy"
                    decoding="async"
                    onClick={() => setIsLightboxOpen(true)}
                    style={{ cursor: 'zoom-in' }}
                  />
                  <div className="arch-banner-gradient-overlay" />
                </>
              ) : (
                <div className="arch-banner-default-art" style={{ background: `radial-gradient(circle at 50% 40%, ${selectedArchetype.color}22 0%, rgba(15,23,42,0.95) 100%)` }}>
                  <div className="arch-default-emblem" style={{ filter: `drop-shadow(0 0 25px ${selectedArchetype.color}66)` }}>
                    {selectedArchetype.icon}
                  </div>
                  <span className="arch-default-title" style={{ color: selectedArchetype.color }}>
                    {selectedArchetype.name}
                  </span>
                  <p className="arch-default-sub">
                    Configura la ilustración oficial para este arquetipo desde el Panel de Gerencia o sube una imagen directamente.
                  </p>
                  <div className="arch-banner-gradient-overlay" />
                </div>
              )}

              {/* Uploading Indicator */}
              {isUploading && (
                <div className="arch-uploading-pill">
                  <div className="arch-spinner" />
                  <span>{uploadStatusText || 'Optimizando imagen...'}</span>
                </div>
              )}

              {/* Controles del Banner */}
              <div className="arch-banner-controls">
                {currentArchetypeImg && (
                  <button 
                    className="arch-ctrl-btn" 
                    onClick={() => setIsLightboxOpen(true)}
                    title="Ver imagen en pantalla completa (teclas flechas para navegar)"
                  >
                    <span>🔍</span> Ampliar
                  </button>
                )}
                <button 
                  className="arch-ctrl-btn" 
                  onClick={() => setIsInlineUploaderOpen(!isInlineUploaderOpen)}
                  title="Subir o cambiar imagen para este arquetipo"
                >
                  <span>📷</span> {currentArchetypeImg ? 'Cambiar Imagen' : 'Subir Imagen'}
                </button>
                {currentArchetypeImg && (
                  <button 
                    className="arch-ctrl-btn danger" 
                    onClick={handleRemoveImage}
                    title="Restablecer arte por defecto"
                  >
                    <span>🗑️</span>
                  </button>
                )}
              </div>

              {/* Cita en Banner Inferior */}
              <div className="arch-banner-caption">
                <blockquote className="arch-caption-quote" style={{ borderLeftColor: selectedArchetype.color }}>
                  {selectedArchetype.quote}
                </blockquote>
              </div>
            </div>

            {/* In-Place Contextual Uploader Tray */}
            {isInlineUploaderOpen && (
              <div className="arch-inline-uploader animate-fade-in">
                <div className="arch-inline-uploader-header">
                  <h4>📷 Imagen para {selectedArchetype.name}</h4>
                  <button 
                    className="arch-inline-close-btn" 
                    onClick={() => setIsInlineUploaderOpen(false)}
                    title="Cerrar panel"
                  >
                    ✕
                  </button>
                </div>

                <div 
                  className={`arch-drop-zone ${isDragActive ? 'drag-active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="arch-drop-icon">🖼️</div>
                  <p><strong>Haz clic aquí o arrastra tu imagen</strong></p>
                  <small>Optimización instantánea en formato WebP de alta velocidad</small>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" 
                    style={{ display: 'none' }} 
                    onChange={handleImageFileChange} 
                  />
                </div>

                <div className="arch-url-input-row">
                  <input 
                    type="url" 
                    className="forge-input" 
                    placeholder="O pega aquí una URL directa de imagen (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomUrl()}
                  />
                  <button 
                    className="forge-btn forge-btn-primary" 
                    onClick={handleSaveCustomUrl}
                    style={{ width: 'auto', padding: '0 20px', whiteSpace: 'nowrap' }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Cabecera Informativa con Navegación Rápida */}
            <div className="arch-header">
              <div className="arch-large-icon" style={{ borderColor: selectedArchetype.color }}>
                {selectedArchetype.icon}
              </div>
              <div className="arch-header-titles">
                <h3 style={{ color: selectedArchetype.color }}>{selectedArchetype.name}</h3>
                <p className="arch-tagline">{selectedArchetype.roleSubtitle}</p>
              </div>

              {/* Botones Anterior y Siguiente */}
              <div className="arch-nav-arrows">
                <button 
                  className="arch-arrow-btn" 
                  onClick={() => navigateArchetype(-1)}
                  title="Arquetipo anterior"
                >
                  ←
                </button>
                <button 
                  className="arch-arrow-btn" 
                  onClick={() => navigateArchetype(1)}
                  title="Siguiente arquetipo"
                >
                  →
                </button>
              </div>
            </div>

            {/* Sub-pestañas de Exploración del Arquetipo */}
            <div className="arch-details-subtabs">
              <button 
                className={`arch-subtab-btn ${archetypeTab === 'perfil' ? 'active' : ''}`}
                onClick={() => setArchetypeTab('perfil')}
              >
                📜 Perfil Dramático
              </button>
              <button 
                className={`arch-subtab-btn ${archetypeTab === 'relaciones' ? 'active' : ''}`}
                onClick={() => setArchetypeTab('relaciones')}
              >
                🤝 Matriz de Relaciones
              </button>
              <button 
                className={`arch-subtab-btn ${archetypeTab === 'prueba' ? 'active' : ''}`}
                onClick={() => setArchetypeTab('prueba')}
              >
                ⚔️ Prueba de Fuego
              </button>
            </div>

            {/* Contenido según pestaña */}
            {archetypeTab === 'perfil' && (
              <div className="animate-fade-in">
                <div className="arch-info-grid">
                  <div className="arch-info-box">
                    <h4>🎯 Función Dramática</h4>
                    <p>{selectedArchetype.functionDesc}</p>
                  </div>

                  <div className="arch-info-box">
                    <h4>⚠️ Sombra y Debilidad</h4>
                    <p>{selectedArchetype.shadowWeakness}</p>
                  </div>

                  <div className="arch-info-box">
                    <h4>📜 Ejemplos Clásicos</h4>
                    <p>{selectedArchetype.classicExample}</p>
                  </div>

                  <div className="arch-info-box">
                    <h4>🎬 Ejemplos Contemporáneos</h4>
                    <p>{selectedArchetype.modernExample}</p>
                  </div>
                </div>

                <div className="arch-prompt-box" style={{ borderColor: selectedArchetype.color }}>
                  <strong style={{ color: selectedArchetype.color }}>💡 Consejo de Escritura Aplicada:</strong>
                  <p>{selectedArchetype.writingTip}</p>
                </div>
              </div>
            )}

            {archetypeTab === 'relaciones' && (
              <div className="arch-relations-grid animate-fade-in">
                {selectedArchetype.relations.map((rel, idx) => (
                  <div key={idx} className="arch-relation-card">
                    <div className="rel-header">
                      <span className="rel-tag">{rel.relationRole}</span>
                      <strong className="rel-target">{rel.targetArchetype}</strong>
                    </div>
                    <p className="rel-desc">{rel.sparkDescription}</p>
                  </div>
                ))}
              </div>
            )}

            {archetypeTab === 'prueba' && (
              <div className="arch-trial-box animate-fade-in">
                <div className="trial-badge">🔥 El Dilema Supremo</div>
                <h4>La Prueba de Fuego de {selectedArchetype.name}</h4>
                <p>{selectedArchetype.crucibleTrial}</p>
                <div className="trial-takeaway">
                  <em>Pregunta para el autor:</em> ¿Qué tendría que perder tu {selectedArchetype.name.toLowerCase()} para finalmente aprender esta lección?
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Lightbox Modal de Pantalla Completa con Navegación por Teclado */}
      {isLightboxOpen && currentArchetypeImg && typeof document !== 'undefined' && createPortal(
        <div className="arch-lightbox-overlay animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <div className="arch-lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
            <span className="arch-lightbox-tag" style={{ borderColor: selectedArchetype.color }}>
              <span>{selectedArchetype.icon}</span> {selectedArchetype.name}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="arch-lightbox-btn" onClick={() => navigateArchetype(-1)} title="Anterior (Flecha izquierda)">
                ← Anterior
              </button>
              <button className="arch-lightbox-btn" onClick={() => navigateArchetype(1)} title="Siguiente (Flecha derecha)">
                Siguiente →
              </button>
              <button className="arch-lightbox-close-btn" onClick={() => setIsLightboxOpen(false)} title="Cerrar (Esc)">
                ✕ Cerrar
              </button>
            </div>
          </div>

          <div className="arch-lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentArchetypeImg} 
              alt={selectedArchetype.name} 
              className="arch-lightbox-img" 
            />
          </div>

          <div className="arch-lightbox-caption" onClick={(e) => e.stopPropagation()}>
            <span style={{ color: selectedArchetype.color }}>{selectedArchetype.name}</span> — <small>{selectedArchetype.roleSubtitle}</small>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          MÓDULO 3: EL VIAJE DEL HÉROE Y LA EVOLUCIÓN DEL PERSONAJE
          ========================================================================= */}
      <section ref={sectionRefs.viaje} className="personaje-section" id="viaje">
        <div className="section-header-block">
          <span className="section-tag">Módulo 3</span>
          <h2 className="section-main-title">El Viaje del Héroe y el Arco de Tensión Dramática</h2>
          <p className="section-description">
            Un arco dramático no es solo una travesía geográfica, sino una <strong>metamorfosis interior</strong>. Explora la curva de tensión y haz clic en cada etapa para descubrir cómo evoluciona cada arquetipo.
          </p>
        </div>

        {/* Curva de Tensión Dramática Interactiva (SVG Dinámico) */}
        <div className="journey-tension-visualizer card-glass">
          <div className="tension-graph-header">
            <span style={{ fontSize: '1.4rem' }}>📈</span>
            <div>
              <h4 style={{ margin: 0, color: '#fff' }}>Curva de Intensidad Dramática</h4>
              <small style={{ color: '#94a3b8' }}>Haz clic en los nodos de la curva para explorar cada etapa:</small>
            </div>
          </div>

          <div className="tension-svg-wrap">
            <svg viewBox="0 0 800 180" className="tension-svg">
              <defs>
                <linearGradient id="tensionLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#a855f7" />
                  <stop offset="70%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="tensionAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(244, 63, 94, 0.25)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                </linearGradient>
              </defs>

              {/* Área bajo la curva */}
              <path 
                d="M 100 150 Q 280 110 320 100 T 550 30 T 700 80 L 700 160 L 100 160 Z" 
                fill="url(#tensionAreaGrad)" 
              />

              {/* Línea de Tensión */}
              <path 
                d="M 100 150 Q 280 110 320 100 T 550 30 T 700 80" 
                fill="none" 
                stroke="url(#tensionLineGrad)" 
                strokeWidth="4" 
                strokeLinecap="round"
              />

              {/* Nodos Interactivos */}
              {[
                { id: 'mundo_ordinario', cx: 100, cy: 150, label: '01. Ordinario (15%)' },
                { id: 'llamada_umbral', cx: 320, cy: 100, label: '02. Umbral (45%)' },
                { id: 'abismo_crisis', cx: 550, cy: 30, label: '03. Abismo (95%)' },
                { id: 'transformacion', cx: 700, cy: 80, label: '04. Elixir (60%)' }
              ].map(node => {
                const isSelected = activeJourneyStageId === node.id;
                return (
                  <g 
                    key={node.id} 
                    onClick={() => {
                      setActiveJourneyStageId(node.id);
                      soundEffects.playClick();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle 
                      cx={node.cx} 
                      cy={node.cy} 
                      r={isSelected ? "11" : "8"} 
                      fill={isSelected ? "#ffffff" : "#0f172a"} 
                      stroke={isSelected ? "#00f0ff" : "#38bdf8"} 
                      strokeWidth="3"
                      filter={isSelected ? "drop-shadow(0 0 8px #00f0ff)" : undefined}
                    />
                    <text 
                      x={node.cx} 
                      y={node.cy - 16} 
                      textAnchor="middle" 
                      fill={isSelected ? "#38bdf8" : "#94a3b8"} 
                      fontSize="12" 
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Detalle de la Etapa Seleccionada */}
        <div className="journey-stage-detail-card card-glass animate-fade-in" key={activeStageData.id}>
          <div className="stage-detail-top">
            <div className="stage-detail-badge">
              <span>{activeStageData.icon}</span> ETAPA {activeStageData.stepNumber}
            </div>
            <h3 className="stage-detail-title">{activeStageData.name}</h3>
            <p className="stage-detail-summary">{activeStageData.summary}</p>
          </div>

          {/* Imagen de etapa configurada en Gerencia si existe */}
          {config.journeyStageImages?.[activeStageData.id] && (
            <div className="stage-banner-img-wrap">
              <img 
                src={config.journeyStageImages[activeStageData.id]} 
                alt={activeStageData.name} 
                className="stage-banner-img"
              />
              <div className="stage-banner-overlay"></div>
            </div>
          )}

          <div className="stage-detail-grid">
            <div className="stage-detail-box">
              <strong style={{ color: '#38bdf8' }}>🧠 Estado Psicológico del Héroe:</strong>
              <p>{activeStageData.psychologicalState}</p>
            </div>
            <div className="stage-detail-box">
              <strong style={{ color: '#a855f7' }}>🎭 ¿Qué hacen los otros arquetipos aquí?</strong>
              <ul className="stage-roles-list">
                {Object.entries(activeStageData.archetypeRoles).map(([role, desc]) => (
                  <li key={role}>
                    <strong>{role.toUpperCase()}:</strong> {desc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Grilla resumen de las 4 etapas */}
        <div className="journey-timeline" style={{ marginTop: '30px' }}>
          {JOURNEY_STAGES_DATA.map((stage) => {
            const isCurrent = activeJourneyStageId === stage.id;
            return (
              <div 
                key={stage.id} 
                className={`narrative-card journey-step-card ${isCurrent ? 'active-step' : ''}`}
                onClick={() => {
                  setActiveJourneyStageId(stage.id);
                  soundEffects.playClick();
                }}
                style={{ cursor: 'pointer' }}
              >
                {config.journeyStageImages?.[stage.id] && (
                  <div style={{ width: '100%', height: '110px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img 
                      src={config.journeyStageImages[stage.id]} 
                      alt={stage.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      loading="lazy" 
                    />
                  </div>
                )}
                <span className="journey-step-number">{stage.stepNumber}</span>
                <span className="journey-step-badge">{stage.icon}</span>
                <h3 className="journey-step-title">{stage.name}</h3>
                <p className="journey-step-desc">{stage.summary}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 4: HERRAMIENTAS NARRATIVAS Y GUION
          ========================================================================= */}
      <section ref={sectionRefs.herramientas} className="personaje-section" id="herramientas">
        <div className="section-header-block">
          <span className="section-tag">Módulo 4</span>
          <h2 className="section-main-title">Herramientas de Guion: Voz, Diálogo y Subtexto</h2>
          <p className="section-description">
            Cómo plasmar la personalidad en la página sin recurrir a párrafos descriptivos aburridos. Haz que el lector conozca a tus personajes por lo que dicen, cómo lo callan y qué hacen.
          </p>
        </div>

        {/* Laboratorio Interactivo de Subtexto */}
        <div className="subtext-lab-container card-glass">
          <div className="subtext-lab-header">
            <span style={{ fontSize: '1.6rem' }}>💬</span>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Laboratorio de Subtexto: «Muestra la Acción, No la Expliques»</h3>
              <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
                Selecciona una escena para comparar el diálogo plano frente al diálogo con carga dramática:
              </p>
            </div>
          </div>

          <div className="subtext-scenarios-selector">
            {SUBTEXT_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                className={`subtext-scenario-btn ${activeSubtextIdx === idx ? 'active' : ''}`}
                onClick={() => {
                  setActiveSubtextIdx(idx);
                  soundEffects.playClick();
                }}
              >
                {sc.title}
              </button>
            ))}
          </div>

          <div className="subtext-comparison-grid">
            <div className="subtext-card plain">
              <span className="subtext-tag plain">❌ Diálogo Plano (Expositivo)</span>
              <blockquote className="subtext-quote">
                {SUBTEXT_SCENARIOS[activeSubtextIdx].plainText}
              </blockquote>
              <small>El personaje dice exactamente lo que piensa; la escena pierde tensión y misterio.</small>
            </div>

            <div className="subtext-card cinematic">
              <span className="subtext-tag cinematic">✨ Diálogo con Subtexto (Cinematográfico)</span>
              <blockquote className="subtext-quote">
                {SUBTEXT_SCENARIOS[activeSubtextIdx].subtextText}
              </blockquote>
              <small>El personaje habla de objetos y acciones cotidianas, pero el conflicto subyacente es transparente.</small>
            </div>
          </div>

          <div className="subtext-analysis-bar">
            <strong>🔍 Lección Dramatúrgica:</strong> {SUBTEXT_SCENARIOS[activeSubtextIdx].analysis}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 5: TALLER INTERACTIVO / FORJA DEL PERSONAJE
          ========================================================================= */}
      <section ref={sectionRefs.taller} className="personaje-section" id="taller">
        <div className="section-header-block">
          <span className="section-tag">Taller Práctico</span>
          <h2 className="section-main-title">La Forja del Personaje (Character Forge)</h2>
          <p className="section-description">
            Esculpe la ficha tridimensional de tu protagonista o antagonista. La ficha integra automáticamente la ilustración oficial configurada desde Gerencia.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            <button className="personaje-nav-btn spark-btn animate-pulse-subtle" onClick={triggerRandomSpark} title="Genera un personaje completo con personalidad aleatoria">
              ⚡ ¡Chispa Creativa Aleatoria!
            </button>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('guerrero')}>
              🦸 Kaan (Guerrero)
            </button>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('sabio')}>
              🧙 Ixchel (Sabia)
            </button>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('rebelde')}>
              🎭 Pek (Pícaro)
            </button>
          </div>
        </div>

        <div className="forge-container">
          <div className="forge-layout">
            {/* Formulario de Construcción */}
            <div className="forge-form">
              <div className="forge-field-group">
                <label>🏷️ Nombre del Personaje</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charName} 
                  onChange={(e) => setCharName(e.target.value)} 
                  placeholder="Ej: Kaan el Errante"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="forge-field-group">
                  <label>🎭 Arquetipo</label>
                  <select 
                    className="forge-select" 
                    value={charArchetype} 
                    onChange={(e) => setCharArchetype(e.target.value)}
                  >
                    {ARCHETYPES.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="forge-field-group">
                  <label>💼 Ocupación / Rol</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charOccupation} 
                    onChange={(e) => setCharOccupation(e.target.value)} 
                    placeholder="Ej: Guardiana, Sanador, Alquimista"
                  />
                </div>
              </div>

              <div className="forge-field-group">
                <label>🎯 Meta Inmediata / Deseo Externo (Lo que cree querer)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charWant} 
                  onChange={(e) => setCharWant(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>💎 Transformación / Necesidad Espiritual (La verdad que debe aprender)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charNeed} 
                  onChange={(e) => setCharNeed(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>🥀 Herida del Pasado (El Fantasma Interior)</label>
                <textarea 
                  className="forge-textarea" 
                  value={charWound} 
                  onChange={(e) => setCharWound(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>⚡ Mayor Miedo (Vulnerabilidad Oculta)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charFear} 
                  onChange={(e) => setCharFear(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="forge-field-group">
                  <label>✨ Virtud Luminosa</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charVirtue} 
                    onChange={(e) => setCharVirtue(e.target.value)} 
                  />
                </div>
                <div className="forge-field-group">
                  <label>⚠️ Defecto Trágico</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charFlaw} 
                    onChange={(e) => setCharFlaw(e.target.value)} 
                  />
                </div>
              </div>

              <div className="forge-field-group">
                <label>🔄 Paradoja / Contradicción Interna</label>
                <textarea 
                  className="forge-textarea" 
                  value={charContradiction} 
                  onChange={(e) => setCharContradiction(e.target.value)} 
                />
              </div>
            </div>

            {/* Vista Previa del Pasaporte Narrativo */}
            <div className="passport-card">
              {/* Imagen del arquetipo asociado en la ficha */}
              {(() => {
                const foundArch = ARCHETYPES.find(a => a.name === charArchetype);
                const archImg = foundArch ? getArchetypeImage(foundArch.id) : null;
                if (archImg) {
                  return (
                    <div className="passport-visual-banner">
                      <img src={archImg} alt={charName} className="passport-visual-img" />
                      <div className="passport-visual-overlay"></div>
                      <span className="passport-visual-tag">{foundArch?.icon} {foundArch?.name.split('/')[0]}</span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="passport-header">
                <div className="passport-avatar">
                  {charArchetype.includes('Mentor') ? '🧙‍♂️' : charArchetype.includes('Sombra') ? '🌑' : charArchetype.includes('Aliado') ? '🛡️' : charArchetype.includes('Camaleón') ? '🎭' : '🦸'}
                </div>
                <div>
                  <h3 className="passport-name">{charName || 'Nombre del Personaje'}</h3>
                  <span className="passport-archetype-tag">{charArchetype}</span>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{charOccupation || 'Rol Narrativo'}</p>
                </div>
              </div>

              <div className="passport-grid">
                <div className="passport-entry">
                  <small>Deseo Externo</small>
                  <span>{charWant || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Necesidad Profunda</small>
                  <span>{charNeed || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Herida del Pasado</small>
                  <span>{charWound || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Mayor Miedo</small>
                  <span>{charFear || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Virtud</small>
                  <span>{charVirtue || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Defecto</small>
                  <span>{charFlaw || 'Sin definir'}</span>
                </div>
              </div>

              <div className="passport-entry" style={{ background: 'rgba(147, 51, 234, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                <small style={{ color: '#c084fc' }}>Paradoja Central</small>
                <span style={{ color: '#f8fafc', fontStyle: 'italic' }}>«{charContradiction || 'Sin definir'}»</span>
              </div>

              <div className="passport-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="forge-btn forge-btn-primary" onClick={handleCopyPassport} style={{ flex: 1 }}>
                  <span>📋</span> {copiedNotification ? '¡Ficha Copiada!' : 'Copiar Ficha'}
                </button>
                <button 
                  className="forge-btn" 
                  onClick={handleDownloadPDF} 
                  disabled={isPdfGenerating}
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(90deg, #f43f5e, #e11d48)', 
                    color: '#fff', 
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.3)' 
                  }}
                >
                  <span>🖨️</span> {isPdfGenerating ? 'Generando PDF...' : 'Descargar PDF Imprimible'}
                </button>
              </div>

              {copiedNotification && (
                <div style={{ textAlign: 'center', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ✓ Formato de texto copiado al portapapeles con éxito
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
