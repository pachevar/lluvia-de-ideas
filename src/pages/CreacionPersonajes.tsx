import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { soundEffects } from '../utils/soundEffects';
import {
  CLASSIC_ARCHETYPES,
  CHARACTER_DIMENSIONS,
  type CharacterArchetype
} from '../data/archetypesData';
import ImageFramingModal from '../components/common/ImageFramingModal';
import './CreacionPersonajes.css';

// Ilustraciones base curadas para cada uno de los 12 arquetipos clásicos
const DEFAULT_ARCHETYPE_IMAGES: Record<string, string> = {
  heroe: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80',
  mentor: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  sombra: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80',
  picaro: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
  guardian: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  aliado: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80',
  camaleon: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=80',
  heraldo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80',
  inocente: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
  rebelde: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
  amante: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80',
  soberano: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=700&q=80'
};

type ArtFilterType = 'normal' | 'codice' | 'cyber' | 'pergamino' | 'acuarela';

interface SavedCharacterProfile {
  id: string;
  name: string;
  title: string;
  archetypeId: string;
  quote: string;
  wound: string;
  lie: string;
  desire: string;
  need: string;
  contradiction: string;
  physical: string;
  social: string;
  image: string;
  filter: ArtFilterType;
  imgZoom: number;
  imgPosY: number;
  physiological: number;
  sociological: number;
  psychological: number;
}

// Perfiles de ejemplo listos para explorar en clase
const PRESET_PROFILES: SavedCharacterProfile[] = [
  {
    id: 'hunahpu',
    name: 'Hunahpú',
    title: 'Héroe Solar del Popol Vuh',
    archetypeId: 'heroe',
    quote: '«El inframundo de Xibalbá no podrá apagar la luz de nuestra memoria.»',
    wound: 'La derrota de su padre y su tío en el juego de pelota ante los Señores del Miedo.',
    lie: '«Debo cargar solo el destino de mi linaje sin mostrar jamás temor.»',
    desire: 'Vencer en la cancha de Xibalbá y recuperar el honor familiar.',
    need: 'Aprender que la sabiduría colectiva y el sacrificio compartido superan a la fuerza individual.',
    contradiction: 'Es un semidiós certero con la cerbatana, pero duda en silencio antes de cada prueba nocturna.',
    physical: 'Complexión ágil de jugador de pelota, marca solar en el hombro y mirada color ámbar.',
    social: 'Criado en la casa de la abuela Ixmukané bajo las leyes sagradas del maíz y la selva.',
    image: DEFAULT_ARCHETYPE_IMAGES.heroe,
    filter: 'codice',
    imgZoom: 100,
    imgPosY: 50,
    physiological: 85,
    sociological: 85,
    psychological: 92
  },
  {
    id: 'ikal',
    name: 'Ikal Chan',
    title: 'Guardiana del Ceibal Antiguo',
    archetypeId: 'guardian',
    quote: '«Nadie cruza las raíces sagradas sin enfrentar primero sus propias intenciones.»',
    wound: 'Confiar en un expedicionario que robó las semillas luminosas de su santuario.',
    lie: '«Todo forastero trae consigo la destrucción; abrir la puerta es traicionar al bosque.»',
    desire: 'Mantener la frontera de niebla cerrada para siempre.',
    need: 'Distinguir entre quienes buscan saquear y quienes vienen a sanar la tierra.',
    contradiction: 'Porta una lanza de obsidiana intimidante, pero rescata y cura insectos heridos en secreto.',
    physical: 'Postura firme de centinela, cicatriz de corteza en el antebrazo, capa tejida con musgo.',
    social: 'Última integrante de la orden de vigías del Petén; respetada pero aislada de las aldeas.',
    image: DEFAULT_ARCHETYPE_IMAGES.guardian,
    filter: 'acuarela',
    imgZoom: 105,
    imgPosY: 40,
    physiological: 80,
    sociological: 78,
    psychological: 88
  },
  {
    id: 'najab',
    name: 'Maestro Najab',
    title: 'Astrónomo de las Pléyades',
    archetypeId: 'mentor',
    quote: '«Las estrellas no dictan tu destino, solo iluminan las piedras del sendero.»',
    wound: 'Su mejor aprendiz se perdió en la montaña por seguir un cálculo erróneo suyo.',
    lie: '«Si no tengo la respuesta exacta para todo, volveré a poner en peligro a mis alumnos.»',
    desire: 'Completar el gran códice de los eclipses antes de perder la vista.',
    need: 'Soltar el control y confiar en que sus discípulos sabrán encontrar su propio rumbo.',
    contradiction: 'Conoce la ruta de mil constelaciones lejanas, pero suele olvidar dónde dejó su bastón.',
    physical: 'Cabello cano recogido, manos manchadas de tinta de carbón y andar pausado.',
    social: 'Consejero del observatorio escolar; venerado por los jóvenes pero cuestionado por el consejo.',
    image: DEFAULT_ARCHETYPE_IMAGES.mentor,
    filter: 'pergamino',
    imgZoom: 100,
    imgPosY: 45,
    physiological: 76,
    sociological: 84,
    psychological: 90
  },
  {
    id: 'ixchel_net',
    name: 'Ixchel Cyber',
    title: 'Tejedora de Códigos Libres',
    archetypeId: 'picaro',
    quote: '«Las reglas rígidas son solo acertijos esperando a que alguien les encuentre el truco.»',
    wound: 'Fue expulsada del taller real por modificar los telares para ayudar a las familias sin recursos.',
    lie: '«Tomarse las cosas en serio solo sirve para que te atrapen.»',
    desire: 'Descifrar la bóveda central de datos y demostrar su ingenio ante todos.',
    need: 'Comprometerse de verdad con una comunidad cuando sus amigos más la necesitan.',
    contradiction: 'Hace bromas sarcásticas constantemente justo cuando siente más miedo por dentro.',
    physical: 'Dedos veloces, lentes con reflejos cian y un brazalete tejido con hilos de cobre.',
    social: 'Habita entre los mercados populares y las redes subterráneas de inventores.',
    image: DEFAULT_ARCHETYPE_IMAGES.picaro,
    filter: 'cyber',
    imgZoom: 100,
    imgPosY: 50,
    physiological: 82,
    sociological: 80,
    psychological: 89
  }
];

// Bancos de ideas rápidas para que el estudiante construya con clics prácticos
const NEURO_CIRCUITS_DATA = [
  {
    id: 'tom',
    stepNum: 'Circuito 1',
    name: 'Teoría de la Mente (ToM)',
    subtitle: 'La Mentira Nuclear del Personaje',
    brainRegion: 'Córtex Prefrontal Medial y Unión Temporoparietal',
    neurotransmitter: 'Sincronización Cognitiva',
    color: '#38bdf8',
    icon: '🔮',
    conceptExplanation:
      'Nuestro cerebro intenta adivinar todo el tiempo qué piensa el otro. Cuando un personaje actúa guiado por una «Mentira Nuclear» (una creencia equivocada sobre sí mismo o el mundo), el lector detecta el error antes que el personaje y siente una urgencia magnética por ver cuándo descubrirá la verdad.',
    classroomQuestion: '¿Qué creencia falsa tiene tu personaje al inicio de la historia que le impide ser plenamente feliz?',
    fieldKey: 'lie' as const,
    fieldLabel: 'Mentira Nuclear de tu Personaje',
    quickIdeas: [
      '«Si pido ayuda o muestro duda, todos descubrirán que soy débil.»',
      '«Solo tengo valor para mi familia si logro ser perfecto en todo.»',
      '«Confiar en los demás siempre termina en traición; es mejor caminar solo.»',
      '«El fin justifica cualquier medio cuando se trata de proteger a los míos.»'
    ]
  },
  {
    id: 'oxitocina',
    stepNum: 'Circuito 2',
    name: 'Química de la Empatía',
    subtitle: 'La Herida del Pasado (Vulnerabilidad)',
    brainRegion: 'Sistema Límbico, Amígdala e Hipotálamo',
    neurotransmitter: 'Liberación de Oxitocina',
    color: '#f43f5e',
    icon: '💓',
    conceptExplanation:
      'Los estudios del neuroeconomista Paul Zak demostraron que el cerebro no libera oxitocina ante héroes perfectos o invencibles. La oxitocina (la molécula del vínculo empático) solo se activa cuando presenciamos una herida emocional genuina, una pérdida o un temor oculto.',
    classroomQuestion: '¿Qué suceso doloroso del pasado dejó una huella que tu personaje aún intenta ocultar o superar?',
    fieldKey: 'wound' as const,
    fieldLabel: 'Herida del Pasado (El Fantasma)',
    quickIdeas: [
      'Rompió una promesa importante y alguien querido pagó las consecuencias.',
      'Perdió su hogar en una catástrofe y siente culpa por haber sobrevivido.',
      'Fue rechazado por su propio maestro cuando cometió su primer gran error.',
      'Guardó silencio ante una injusticia por miedo y aún busca redimirse.'
    ]
  },
  {
    id: 'dopamina',
    stepNum: 'Circuito 3',
    name: 'Error de Predicción',
    subtitle: 'La Contradicción Neurocreativa',
    brainRegion: 'Estriado Ventral y Núcleo Accumbens',
    neurotransmitter: 'Pico de Dopamina Curiosa',
    color: '#f59e0b',
    icon: '⚡',
    conceptExplanation:
      'El cerebro se aburre de inmediato ante los estereotipos porque ya sabe qué va a pasar (predicción = 0 sorpresa). Cuando le das al personaje una contradicción humana inesperada, provocas un «Error de Predicción» positivo que despierta la dopamina y fija al personaje en la memoria a largo plazo.',
    classroomQuestion: '¿Qué hábito, gusto o reacción tiene tu personaje que rompe por completo con su apariencia inicial?',
    fieldKey: 'contradiction' as const,
    fieldLabel: 'Contradicción que Rompe el Cliché',
    quickIdeas: [
      'Un guerrero imponente que escribe poesía botánica y cuida semillas frágiles.',
      'Una líder brillante y valiente en público que le teme profundamente a la oscuridad.',
      'Un villano calculador que jamás miente a los niños y respeta la naturaleza.',
      'Un sabio anciano y solemne que se emociona como un niño con los juegos de ingenio.'
    ]
  },
  {
    id: 'espejo',
    stepNum: 'Circuito 4',
    name: 'Neuronas Espejo',
    subtitle: 'El Anclaje Físico y Sensorial',
    brainRegion: 'Corteza Premotora y Corteza Somatosensorial',
    neurotransmitter: 'Simulación Motora Directa',
    color: '#10b981',
    icon: '🧬',
    conceptExplanation:
      'Las neuronas espejo hacen que el lector sienta en su propio cuerpo los gestos, el cansancio o la tensión del personaje. Para activarlas, no uses adjetivos vagos («era nervioso»); describe acciones y marcas concretas («frotaba la cicatriz de su pulgar cada vez que mentía»).',
    classroomQuestion: '¿Qué rasgo físico, cicatriz, objeto o gesto corporal hace único e inolvidable a tu personaje?',
    fieldKey: 'physical' as const,
    fieldLabel: 'Anclaje Físico y Gesto Característico',
    quickIdeas: [
      'Toca inconscientemente un amuleto de jade en su cuello cuando presiente peligro.',
      'Tiene una cicatriz luminosa en el antebrazo y camina sin hacer el menor ruido.',
      'Su voz baja de volumen hasta volverse un susurro cuando está verdaderamente furioso.',
      'Lleva siempre los dedos manchados de carbón y ajusta sus lentes antes de hablar.'
    ]
  }
];

const DIMENSION_QUICK_CHIPS: Record<'fisiologica' | 'sociologica' | 'psicologica', string[]> = {
  fisiologica: [
    'Mirada aguda color ámbar',
    'Cicatriz antigua en el hombro',
    'Andar silencioso y ágil',
    'Manos curtidas por el trabajo artesanal',
    'Voz pausada que transmite calma',
    'Amuleto familiar que nunca se quita'
  ],
  sociologica: [
    'Criado por los sabios de su aldea',
    'Exiliado injustamente de su gremio',
    'Defensor de las tradiciones del bosque',
    'Puente entre dos culturas enfrentadas',
    'Aprendiz rebelde de una academia estricta',
    'Huérfano adoptado por comerciantes viajeros'
  ],
  psicologica: [
    'Desea proteger a su comunidad a cualquier costo',
    'Necesita aprender a perdonarse un error pasado',
    'Oculta su inseguridad detrás del humor irónico',
    'Teme convertirse en aquello que más combate',
    'Le cuesta pedir ayuda aunque esté al límite',
    'Su lealtad es puesta a prueba en momentos críticos'
  ]
};

export default function CreacionPersonajes() {
  const location = useLocation();

  // Etapa activa del desarrollo pedagógico (1 a 4)
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(() => {
    const saved = localStorage.getItem('cp_active_stage');
    if (saved === '1' || saved === '2' || saved === '3' || saved === '4') {
      return Number(saved) as 1 | 2 | 3 | 4;
    }
    return 1;
  });

  // Modo Pizarra / Proyector de Aula
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  // Conexión en tiempo real con la configuración de Gerencia
  const { config } = usePortalConfig();
  const archetypeImages = config?.archetypeImages || {};

  // Resuelve la imagen del arquetipo desde Firestore / Gerencia, con soporte de alias
  const getArchetypeImage = (id: string): string => {
    if (archetypeImages[id]) return archetypeImages[id];
    if (id === 'heroe' && archetypeImages['protagonista']) return archetypeImages['protagonista'];
    if (id === 'protagonista' && archetypeImages['heroe']) return archetypeImages['heroe'];
    if (id === 'picaro' && archetypeImages['embaucador']) return archetypeImages['embaucador'];
    if (id === 'embaucador' && archetypeImages['picaro']) return archetypeImages['picaro'];
    return DEFAULT_ARCHETYPE_IMAGES[id] || DEFAULT_ARCHETYPE_IMAGES.heroe;
  };

  // =========================================================================
  // ESTADO ETAPA 1: EXPLORADOR DE ARQUETIPOS
  // =========================================================================
  const [archetypeCategory, setArchetypeCategory] = useState<'todos' | 'luz' | 'sombra' | 'catalizador'>('todos');
  const [selectedSpotArchetypeId, setSelectedSpotArchetypeId] = useState<string>('heroe');
  const [polarityView, setPolarityView] = useState<'ambos' | 'luz' | 'sombra'>('ambos');
  const [archSubTab, setArchSubTab] = useState<'ejemplos' | 'relaciones' | 'crisol'>('ejemplos');

  // =========================================================================
  // ESTADO ETAPA 2: LABORATORIO NEUROCOGNITIVO
  // =========================================================================
  const [experimentMode, setExperimentMode] = useState<'plano' | 'tridimensional'>('tridimensional');
  const [activeCircuitId, setActiveCircuitId] = useState<string>('tom');

  // =========================================================================
  // ESTADO ETAPA 3: LAS 3 DIMENSIONES (CONSTRUCTOR POR CAPAS)
  // =========================================================================
  const [activeDimensionTab, setActiveDimensionTab] = useState<'fisiologica' | 'sociologica' | 'psicologica'>('psicologica');
  const [dimPhysiological, setDimPhysiological] = useState<number>(85);
  const [dimSociological, setDimSociological] = useState<number>(82);
  const [dimPsychological, setDimPsychological] = useState<number>(90);

  // =========================================================================
  // ESTADO ETAPA 4: PERSONAJE ACTIVO Y ESTUDIO VISUAL
  // =========================================================================
  const [charName, setCharName] = useState<string>(PRESET_PROFILES[0].name);
  const [charTitle, setCharTitle] = useState<string>(PRESET_PROFILES[0].title);
  const [charArchetypeId, setCharArchetypeId] = useState<string>(PRESET_PROFILES[0].archetypeId);
  const [charQuote, setCharQuote] = useState<string>(PRESET_PROFILES[0].quote);
  const [charWound, setCharWound] = useState<string>(PRESET_PROFILES[0].wound);
  const [charLie, setCharLie] = useState<string>(PRESET_PROFILES[0].lie);
  const [charDesire, setCharDesire] = useState<string>(PRESET_PROFILES[0].desire);
  const [charNeed, setCharNeed] = useState<string>(PRESET_PROFILES[0].need);
  const [charContradiction, setCharContradiction] = useState<string>(PRESET_PROFILES[0].contradiction);
  const [charPhysical, setCharPhysical] = useState<string>(PRESET_PROFILES[0].physical);
  const [charSocial, setCharSocial] = useState<string>(PRESET_PROFILES[0].social);

  const [charImage, setCharImage] = useState<string>(PRESET_PROFILES[0].image);
  const [activeFilter, setActiveFilter] = useState<ArtFilterType>(PRESET_PROFILES[0].filter);
  const [imgZoom, setImgZoom] = useState<number>(100);
  const [imgPosY, setImgPosY] = useState<number>(50);

  const [previewFormat, setPreviewFormat] = useState<'cromo' | 'expediente'>('cromo');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Modal de visualización expandida de la ilustración del arquetipo
  const [expandedArchetype, setExpandedArchetype] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
    image: string;
    quote: string;
    neuroBadge: string;
    description: string;
    role: string;
    lightAspect: string;
    shadowAspect: string;
    personalityTraits: string[];
  } | null>(null);

  // Modal de encuadre y centrado profesional para el avatar del personaje
  const [framingModalOpen, setFramingModalOpen] = useState<boolean>(false);
  const [framingImageSrc, setFramingImageSrc] = useState<string | File | null>(null);

  // Galería de personajes guardados por el estudiante en clase
  const [savedRoster, setSavedRoster] = useState<SavedCharacterProfile[]>(() => {
    try {
      const saved = localStorage.getItem('cp_student_roster');
      return saved ? JSON.parse(saved) : PRESET_PROFILES;
    } catch {
      return PRESET_PROFILES;
    }
  });

  const charFileInputRef = useRef<HTMLInputElement | null>(null);
  const cardExportRef = useRef<HTMLDivElement | null>(null);

  // Persistir etapa activa
  useEffect(() => {
    localStorage.setItem('cp_active_stage', String(activeStage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStage]);

  // Restaurar borrador o recibir datos desde la Máquina de Cuentos
  useEffect(() => {
    const navState = location.state as { characterName?: string; description?: string } | null;
    if (navState?.characterName) {
      setCharName(navState.characterName);
      if (navState.description) {
        setCharTitle(navState.description);
      }
      setActiveStage(4);
      return;
    }

    try {
      const savedDraft = localStorage.getItem('cp_draft_character_v2');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setCharName(parsed.name);
        if (parsed.title) setCharTitle(parsed.title);
        if (parsed.archetypeId) {
          setCharArchetypeId(parsed.archetypeId);
          setSelectedSpotArchetypeId(parsed.archetypeId);
        }
        if (parsed.quote) setCharQuote(parsed.quote);
        if (parsed.wound) setCharWound(parsed.wound);
        if (parsed.lie) setCharLie(parsed.lie);
        if (parsed.desire) setCharDesire(parsed.desire);
        if (parsed.need) setCharNeed(parsed.need);
        if (parsed.contradiction) setCharContradiction(parsed.contradiction);
        if (parsed.physical) setCharPhysical(parsed.physical);
        if (parsed.social) setCharSocial(parsed.social);
        if (parsed.image) setCharImage(parsed.image);
        if (parsed.filter) setActiveFilter(parsed.filter);
        if (typeof parsed.imgZoom === 'number') setImgZoom(parsed.imgZoom);
        if (typeof parsed.imgPosY === 'number') setImgPosY(parsed.imgPosY);
        if (typeof parsed.physiological === 'number') setDimPhysiological(parsed.physiological);
        if (typeof parsed.sociological === 'number') setDimSociological(parsed.sociological);
        if (typeof parsed.psychological === 'number') setDimPsychological(parsed.psychological);
      }
    } catch {
      // Ignorar errores de lectura
    }
  }, [location.state]);

  // Autoguardado del personaje actual
  useEffect(() => {
    const draft = {
      name: charName,
      title: charTitle,
      archetypeId: charArchetypeId,
      quote: charQuote,
      wound: charWound,
      lie: charLie,
      desire: charDesire,
      need: charNeed,
      contradiction: charContradiction,
      physical: charPhysical,
      social: charSocial,
      image: charImage,
      filter: activeFilter,
      imgZoom,
      imgPosY,
      physiological: dimPhysiological,
      sociological: dimSociological,
      psychological: dimPsychological
    };
    try {
      localStorage.setItem('cp_draft_character_v2', JSON.stringify(draft));
    } catch {
      // Ignorar quota exceeded
    }
  }, [
    charName, charTitle, charArchetypeId, charQuote, charWound, charLie,
    charDesire, charNeed, charContradiction, charPhysical, charSocial,
    charImage, activeFilter, imgZoom, imgPosY,
    dimPhysiological, dimSociological, dimPsychological
  ]);

  // Arquetipo activo en el Escenario de Etapa 1
  const spotlightArchetype = useMemo(() => {
    return CLASSIC_ARCHETYPES.find(a => a.id === selectedSpotArchetypeId) || CLASSIC_ARCHETYPES[0];
  }, [selectedSpotArchetypeId]);

  // Imagen oficial del arquetipo en Etapa 1 (resuelta desde Firestore / Gerencia)
  const spotlightArchetypeImg = getArchetypeImage(spotlightArchetype.id);

  // Arquetipo asignado al personaje del estudiante
  const currentCharacterArchetype = useMemo(() => {
    return CLASSIC_ARCHETYPES.find(a => a.id === charArchetypeId) || CLASSIC_ARCHETYPES[0];
  }, [charArchetypeId]);

  // Lista filtrada de arquetipos en Etapa 1
  const filteredArchetypes = useMemo(() => {
    return CLASSIC_ARCHETYPES.filter(arc => {
      if (archetypeCategory === 'todos') return true;
      if (archetypeCategory === 'luz') return ['heroe', 'mentor', 'aliado', 'inocente', 'soberano'].includes(arc.id);
      if (archetypeCategory === 'sombra') return ['sombra', 'guardian', 'camaleon', 'rebelde'].includes(arc.id);
      if (archetypeCategory === 'catalizador') return ['picaro', 'heraldo', 'amante'].includes(arc.id);
      return true;
    });
  }, [archetypeCategory]);

  // Circuito neurocognitivo activo en Etapa 2
  const activeCircuit = useMemo(() => {
    return NEURO_CIRCUITS_DATA.find(c => c.id === activeCircuitId) || NEURO_CIRCUITS_DATA[0];
  }, [activeCircuitId]);

  // Cálculo de Tridimensionalidad y Diagnóstico Semántico
  const threeDimensionalScore = useMemo(() => {
    const raw = (dimPhysiological * 0.3) + (dimSociological * 0.3) + (dimPsychological * 0.4);
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [dimPhysiological, dimSociological, dimPsychological]);

  const neuroDiagnostic = useMemo(() => {
    if (dimPsychological < 40) {
      return {
        level: 'Alerta: Personaje Plano (Falta Conflicto Interior)',
        color: '#f43f5e',
        summary: 'El cerebro lector se desconecta cuando no percibe vulnerabilidad ni contradicción.',
        tip: 'Fortalece la Dimensión Psicológica definiendo su Mentira Nuclear y su Herida del Pasado.'
      };
    }
    if (dimPhysiological < 40) {
      return {
        level: 'Atención: Falta Anclaje Sensorial y Físico',
        color: '#f59e0b',
        summary: 'Las neuronas espejo necesitan gestos, postura o marcas visibles para simular al personaje.',
        tip: 'Añade detalles en la Dimensión Fisiológica (cómo se mueve, qué objeto porta, cómo reacciona su cuerpo).'
      };
    }
    if (dimSociological < 40) {
      return {
        level: 'Atención: Personaje sin Contexto Cultural',
        color: '#f59e0b',
        summary: 'El personaje parece flotar en el vacío sin comunidad, reglas ni lealtades que lo presionen.',
        tip: 'Enriquece la Dimensión Sociológica indicando su origen, su rol en el grupo y sus alianzas.'
      };
    }
    if (threeDimensionalScore >= 78) {
      return {
        level: 'Óptimo: Personaje Tridimensional de Alta Empatía',
        color: '#10b981',
        summary: 'Las 3 dimensiones están en equilibrio. Activa Teoría de la Mente, Oxitocina y Dopamina.',
        tip: 'Tu personaje está listo para protagonizar una gran historia y ser exportado en la Etapa 4.'
      };
    }
    return {
      level: 'En Progreso: Estructura Tridimensional en Construcción',
      color: '#38bdf8',
      summary: 'Buen balance inicial entre cuerpo, entorno social y mundo interior.',
      tip: 'Puedes usar las fichas rápidas de inspiración para elevar el relieve de cada dimensión.'
    };
  }, [threeDimensionalScore, dimPhysiological, dimSociological, dimPsychological]);

  // Progreso pedagógico general
  const completionPercentage = useMemo(() => {
    let points = 25; // Etapa 1 base
    if (charLie.trim().length > 5 && charWound.trim().length > 5) points += 25;
    if (charPhysical.trim().length > 5 && charSocial.trim().length > 5 && threeDimensionalScore >= 60) points += 25;
    if (charName.trim().length > 1 && charImage) points += 25;
    return points;
  }, [charLie, charWound, charPhysical, charSocial, threeDimensionalScore, charName, charImage]);

  // =========================================================================
  // SUBIDA Y ENCUADRE PROFESIONAL DE IMAGEN DEL PERSONAJE (ETAPA 4)
  // =========================================================================

  const openFramingForFile = (file: File) => {
    setUploadError(null);
    setFramingImageSrc(file);
    setFramingModalOpen(true);
    soundEffects.playClick();
  };

  const openFramingForCurrent = () => {
    if (!charImage) return;
    setUploadError(null);
    setFramingImageSrc(charImage);
    setFramingModalOpen(true);
    soundEffects.playClick();
  };

  const handleFramingSave = (_framedFile: File, dataUrl: string) => {
    setCharImage(dataUrl);
    setImgZoom(100);
    setImgPosY(50);
    setFramingModalOpen(false);
    setFramingImageSrc(null);
    soundEffects.playSuccess();
  };

  const handleCharacterImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      openFramingForFile(file);
      e.target.value = '';
    }
  };

  const handleCharacterDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      openFramingForFile(file);
    }
  };

  // Adoptar el arquetipo de Etapa 1 para nuestro personaje y avanzar
  const handleSelectArchetypeForCharacter = (arc: CharacterArchetype, advanceStage = false) => {
    soundEffects.playSuccess();
    setCharArchetypeId(arc.id);
    setCharTitle(arc.roleSubtitle);
    setCharQuote(arc.quote);
    setCharDesire(arc.coreDesire);
    setCharNeed(`Superar su sombra: ${arc.shadowWeakness}`);
    // Asignar la ilustración oficial canónica del arquetipo como base para el personaje
    const officialImg = getArchetypeImage(arc.id);
    if (officialImg) setCharImage(officialImg);

    if (advanceStage) {
      setActiveStage(2);
    }
  };

  // Cargar un personaje de la galería
  const handleLoadProfile = (profile: SavedCharacterProfile) => {
    soundEffects.playClick();
    setCharName(profile.name);
    setCharTitle(profile.title);
    setCharArchetypeId(profile.archetypeId);
    setSelectedSpotArchetypeId(profile.archetypeId);
    setCharQuote(profile.quote);
    setCharWound(profile.wound);
    setCharLie(profile.lie);
    setCharDesire(profile.desire);
    setCharNeed(profile.need);
    setCharContradiction(profile.contradiction);
    setCharPhysical(profile.physical);
    setCharSocial(profile.social);
    setCharImage(profile.image);
    setActiveFilter(profile.filter);
    setImgZoom(profile.imgZoom || 100);
    setImgPosY(profile.imgPosY || 50);
    setDimPhysiological(profile.physiological);
    setDimSociological(profile.sociological);
    setDimPsychological(profile.psychological);
  };

  // Guardar personaje actual en la Galería de Clase
  const handleSaveToRoster = () => {
    soundEffects.playSuccess();
    const newEntry: SavedCharacterProfile = {
      id: `char_${Date.now()}`,
      name: charName || 'Personaje sin nombre',
      title: charTitle || currentCharacterArchetype.roleSubtitle,
      archetypeId: charArchetypeId,
      quote: charQuote,
      wound: charWound,
      lie: charLie,
      desire: charDesire,
      need: charNeed,
      contradiction: charContradiction,
      physical: charPhysical,
      social: charSocial,
      image: charImage,
      filter: activeFilter,
      imgZoom,
      imgPosY,
      physiological: dimPhysiological,
      sociological: dimSociological,
      psychological: dimPsychological
    };

    const updated = [newEntry, ...savedRoster.filter(p => p.name !== newEntry.name)].slice(0, 8);
    setSavedRoster(updated);
    try {
      localStorage.setItem('cp_student_roster', JSON.stringify(updated));
    } catch {
      // Ignorar si la imagen base64 llena el storage
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Exportar a PNG
  const handleExportPNG = async () => {
    if (!cardExportRef.current) return;
    setIsExporting(true);
    soundEffects.playClick();

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardExportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#090e1a'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Personaje-${(charName || 'Creatika').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      soundEffects.playSuccess();
    } catch {
      soundEffects.playError();
    } finally {
      setIsExporting(false);
    }
  };

  // Copiar Ficha Pedagógica Completa
  const handleCopySheet = () => {
    soundEffects.playClick();
    const text = `
══════════════════════════════════════════════════════════
🎭 EXPEDIENTE DE PERSONAJE · SUITE CREATIKA
══════════════════════════════════════════════════════════
NOMBRE: ${charName}
EPÍTETO / ROL: ${charTitle}
ARQUETIPO BASE: ${currentCharacterArchetype.name} (${currentCharacterArchetype.roleSubtitle})
FRASE INSIGNIA: ${charQuote}

─── 1. DIMENSIÓN FISIOLÓGICA (${dimPhysiological}%) ───
• Cuerpo, Gestos y Anclaje Sensorial:
  ${charPhysical}

─── 2. DIMENSIÓN SOCIOLÓGICA (${dimSociological}%) ───
• Comunidad, Cultura y Reglas de su Entorno:
  ${charSocial}

─── 3. DIMENSIÓN PSICOLÓGICA Y NEUROCIENCIA (${dimPsychological}%) ───
• Mentira Nuclear (Teoría de la Mente): ${charLie}
• Herida del Pasado (Oxitocina / Empatía): ${charWound}
• Deseo Consciente (Meta Externa): ${charDesire}
• Necesidad Profunda (Aprendizaje Interno): ${charNeed}
• Contradicción Neurocreativa (Dopamina / Sorpresa): ${charContradiction}

─── DIAGNÓSTICO DE TRIDIMENSIONALIDAD: ${threeDimensionalScore}% ───
• Nivel: ${neuroDiagnostic.level}
• Mecanismo Cerebral del Arquetipo: ${currentCharacterArchetype.neuroTrigger}
══════════════════════════════════════════════════════════
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      soundEffects.playSuccess();
      setTimeout(() => setCopySuccess(false), 2600);
    }).catch(() => {
      soundEffects.playError();
    });
  };

  // Coordenadas dinámicas del polígono en el radar triangular (Etapa 3)
  const radarPoints = useMemo(() => {
    // Centro del triángulo en (130, 115), radio máximo 80
    const cx = 130;
    const cy = 115;
    const rMax = 78;

    // Arriba: Psicológica (-90 deg)
    const rPsico = (dimPsychological / 100) * rMax;
    const x1 = cx;
    const y1 = cy - rPsico;

    // Abajo Izquierda: Fisiológica (150 deg)
    const rFisio = (dimPhysiological / 100) * rMax;
    const x2 = cx - rFisio * Math.cos(Math.PI / 6);
    const y2 = cy + rFisio * Math.sin(Math.PI / 6);

    // Abajo Derecha: Sociológica (30 deg)
    const rSocio = (dimSociological / 100) * rMax;
    const x3 = cx + rSocio * Math.cos(Math.PI / 6);
    const y3 = cy + rSocio * Math.sin(Math.PI / 6);

    return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
  }, [dimPhysiological, dimSociological, dimPsychological]);

  return (
    <div className={`cp-container ${isProjectorMode ? 'projector-mode' : ''}`}>
      <LandingTopBar
        slogan="Suite Creatika · Laboratorio Pedagógico de Creación de Personajes"
        showHomeButton
      />

      <main className="cp-main-content">
        {/* =====================================================================
            CABECERA PRINCIPAL CON PERSONAJE EN CONSTRUCCIÓN Y MODO PIZARRA
           ===================================================================== */}
        <header className="cp-hero-bar">
          <div className="cp-hero-left">
            <div className="cp-badge-top">
              <span>🎭 SUITE CREATIKA</span> · RUTA GUIADA EN 4 ETAPAS
            </div>
            <h1 className="cp-hero-title">
              Laboratorio de <span>Creación de Personajes</span>
            </h1>
            <p className="cp-hero-subtitle">
              Aprende paso a paso cómo transformar una idea básica en un personaje inolvidable:
              explora los <strong>arquetipos clásicos</strong>, comprende su impacto en el <strong>cerebro lector</strong>,
              equilibra sus <strong>3 dimensiones</strong> y personalízalo con <strong>tus propias imágenes</strong>.
            </p>
          </div>

          <div className="cp-hero-right">
            <div className="cp-active-char-pill" title="Personaje actualmente en desarrollo">
              <img
                src={charImage}
                alt={charName}
                className={`cp-active-char-avatar filter-${activeFilter}`}
              />
              <div className="cp-active-char-info">
                <span>Personaje en Forja ({threeDimensionalScore}% 3D)</span>
                <strong>{charName || 'Sin nombre'} · {currentCharacterArchetype.icon} {currentCharacterArchetype.name.split('/')[0]}</strong>
              </div>
            </div>

            <button
              className={`cp-projector-btn ${isProjectorMode ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setIsProjectorMode(prev => !prev);
              }}
            >
              <span>{isProjectorMode ? '🖥️' : '📺'}</span>
              {isProjectorMode ? 'Modo Pizarra Activo (Salir)' : 'Modo Pizarra / Aula'}
            </button>
          </div>
        </header>

        {/* =====================================================================
            STEPPER DE DESARROLLO POR ETAPAS (1 -> 2 -> 3 -> 4)
           ===================================================================== */}
        <nav className="cp-stages-stepper" aria-label="Etapas de desarrollo del personaje">
          <div className="cp-stepper-header">
            <div className="cp-stepper-label">
              <span>🧭</span> Ruta Pedagógica Paso a Paso · Etapa {activeStage} de 4
            </div>
            <div className="cp-stepper-progress-wrap">
              <div className="cp-stepper-progress-bar">
                <div
                  className="cp-stepper-progress-fill"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="cp-stepper-progress-text">{completionPercentage}% Completado</span>
            </div>
          </div>

          <div className="cp-stages-grid">
            {[
              {
                stage: 1 as const,
                kicker: 'ETAPA 1 · CIMIENTO',
                title: 'Arquetipos Clásicos',
                desc: 'Explora los 12 moldes universales y elige la base de tu personaje.'
              },
              {
                stage: 2 as const,
                kicker: 'ETAPA 2 · EMPATÍA',
                title: 'Neurociencia del Carácter',
                desc: 'Descubre por qué las heridas y contradicciones conectan al cerebro.'
              },
              {
                stage: 3 as const,
                kicker: 'ETAPA 3 · ESTRUCTURA',
                title: 'Las 3 Dimensiones',
                desc: 'Construye Cuerpo, Entorno Social y Mundo Interior en equilibrio.'
              },
              {
                stage: 4 as const,
                kicker: 'ETAPA 4 · IDENTIDAD',
                title: 'Estudio Visual y Ficha',
                desc: 'Sube tu ilustración, aplica filtros y descarga tu Cromo o Expediente.'
              }
            ].map((item) => {
              const isCurrent = activeStage === item.stage;
              const isDone = activeStage > item.stage;
              return (
                <button
                  key={item.stage}
                  className={`cp-stage-step-btn ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveStage(item.stage);
                  }}
                >
                  <div className="cp-stage-num-badge">
                    {isDone ? '✓' : item.stage}
                  </div>
                  <div className="cp-stage-step-text">
                    <span className="cp-stage-step-kicker">{item.kicker}</span>
                    <h3 className="cp-stage-step-title">{item.title}</h3>
                    <p className="cp-stage-step-desc">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* =====================================================================
            ETAPA 1: EXPLORADOR DE ARQUETIPOS CANÓNICOS
           ===================================================================== */}
        {activeStage === 1 && (
          <section className="animate-fade-in">
            {/* Guía clara de la Etapa 1 */}
            <div className="cp-stage-guide-banner">
              <div className="cp-stage-guide-info">
                <h2>
                  <span>🎭</span> Etapa 1: Los 12 Arquetipos Universales (Galería Oficial)
                </h2>
                <p>
                  Un <strong>arquetipo</strong> es un modelo ancestral de comportamiento humano presente en los mitos de todas las culturas
                  (desde el <em>Popol Vuh</em> hasta la literatura contemporánea). Examina la <strong>Luz</strong> y la <strong>Sombra</strong> de cada modelo,
                  sus detonantes neuroquímicos y selecciona el arquetipo base que moldeará a tu personaje.
                </p>
              </div>
              <div className="cp-stage-goal-box">
                <span>🎯 Meta Práctica de esta Etapa</span>
                <strong>Explora los 12 moldes canónicos y elige el arquetipo que mejor resuene con tu historia para avanzar a la Etapa 2.</strong>
              </div>
            </div>

            {/* Filtro por Familia Dramática */}
            <div className="cp-archetype-filter-bar">
              <div className="cp-category-pills">
                {[
                  { id: 'todos', label: '🌟 Todos los Arquetipos (12)' },
                  { id: 'luz', label: '☀️ Motores de Orden y Guía (5)' },
                  { id: 'sombra', label: '🌑 Sombras, Retos y Fronteras (4)' },
                  { id: 'catalizador', label: '⚡ Catalizadores de Cambio (3)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    className={`cp-cat-pill ${archetypeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setArchetypeCategory(cat.id as any);
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tira Visual de Selección de Arquetipo */}
            <div className="cp-archetype-selector-strip">
              {filteredArchetypes.map(arc => {
                const isSelected = spotlightArchetype.id === arc.id;
                return (
                  <button
                    key={arc.id}
                    className={`cp-arch-select-btn ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? arc.color : undefined
                    }}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSpotArchetypeId(arc.id);
                    }}
                  >
                    <div
                      className="cp-arch-select-icon"
                      style={{ border: `2px solid ${arc.color}` }}
                    >
                      <img src={getArchetypeImage(arc.id)} alt={arc.name} />
                    </div>
                    <div className="cp-arch-select-meta">
                      <strong>{arc.name.split('/')[0].trim()}</strong>
                      <span style={{ color: isSelected ? arc.color : undefined }}>
                        {arc.neuroBadge.split('·')[0].trim()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ESCENARIO PRINCIPAL (MASTER-DETAIL) DEL ARQUETIPO SELECCIONADO */}
            <div
              className="cp-archetype-spotlight"
              style={{ borderColor: `${spotlightArchetype.color}88` }}
            >
              {/* Columna Izquierda: Retrato Canónico Oficial */}
              <div className="cp-spotlight-visual-col">
                <div
                  className="cp-concept-portrait-frame cp-clickable-portrait"
                  style={{ borderColor: spotlightArchetype.color }}
                  onClick={() => {
                    soundEffects.playClick();
                    setExpandedArchetype({
                      id: spotlightArchetype.id,
                      name: spotlightArchetype.name,
                      icon: spotlightArchetype.icon,
                      color: spotlightArchetype.color,
                      image: spotlightArchetypeImg,
                      quote: spotlightArchetype.quote,
                      neuroBadge: spotlightArchetype.neuroBadge,
                      description: spotlightArchetype.functionDesc,
                      role: spotlightArchetype.roleSubtitle,
                      lightAspect: spotlightArchetype.coreDesire,
                      shadowAspect: spotlightArchetype.shadowWeakness,
                      personalityTraits: spotlightArchetype.personalityTraits
                    });
                  }}
                  title="Haz clic sobre la imagen para verla en pantalla completa"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedArchetype({
                        id: spotlightArchetype.id,
                        name: spotlightArchetype.name,
                        icon: spotlightArchetype.icon,
                        color: spotlightArchetype.color,
                        image: spotlightArchetypeImg,
                        quote: spotlightArchetype.quote,
                        neuroBadge: spotlightArchetype.neuroBadge,
                        description: spotlightArchetype.functionDesc,
                        role: spotlightArchetype.roleSubtitle,
                        lightAspect: spotlightArchetype.coreDesire,
                        shadowAspect: spotlightArchetype.shadowWeakness,
                        personalityTraits: spotlightArchetype.personalityTraits
                      });
                    }
                  }}
                >
                  <img
                    src={spotlightArchetypeImg}
                    alt={spotlightArchetype.name}
                    className="cp-concept-portrait-img"
                  />
                  <div className="cp-concept-overlay-badge">
                    <span>{spotlightArchetype.icon}</span>
                    <span>{spotlightArchetype.name.split('/')[0]}</span>
                  </div>
                  <div className="cp-concept-zoom-hint">
                    <span>🔍 Clic para expandir imagen</span>
                  </div>
                </div>

                {/* Botón rápido para expandir */}
                <button
                  type="button"
                  className="cp-btn-expand-artwork"
                  onClick={() => {
                    soundEffects.playClick();
                    setExpandedArchetype({
                      id: spotlightArchetype.id,
                      name: spotlightArchetype.name,
                      icon: spotlightArchetype.icon,
                      color: spotlightArchetype.color,
                      image: spotlightArchetypeImg,
                      quote: spotlightArchetype.quote,
                      neuroBadge: spotlightArchetype.neuroBadge,
                      description: spotlightArchetype.functionDesc,
                      role: spotlightArchetype.roleSubtitle,
                      lightAspect: spotlightArchetype.coreDesire,
                      shadowAspect: spotlightArchetype.shadowWeakness,
                      personalityTraits: spotlightArchetype.personalityTraits
                    });
                  }}
                >
                  <span>🔍</span> Ver Ilustración en Alta Resolución
                </button>

                {/* Aviso Editorial Institucional */}
                <div className="cp-concept-official-notice">
                  <div className="cp-concept-official-header">
                    <span className="cp-official-badge">🏛️ ILUSTRACIÓN CANÓNICA OFICIAL</span>
                    <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>GERENCIA EDITORIAL</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                    Esta es la ilustración canónica oficial de <strong>{spotlightArchetype.name.split('/')[0]}</strong>,
                    gestionada y respaldada en la base de datos de Gerencia.
                  </p>
                  <div style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    color: '#7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>💡</span> En la <strong>Etapa 4</strong> podrás subir y personalizar la ilustración de tu propio héroe.
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Conceptos Claros y Dinámicos */}
              <div className="cp-spotlight-content-col">
                <div className="cp-spotlight-header">
                  <div className="cp-spotlight-title-block">
                    <h3>
                      <span>{spotlightArchetype.icon}</span> {spotlightArchetype.name}
                    </h3>
                    <p>{spotlightArchetype.roleSubtitle}</p>
                  </div>

                  {/* Conmutador de Polaridad: Luz vs Sombra */}
                  <div className="cp-polarity-toggle" role="group" aria-label="Filtro de polaridad del arquetipo">
                    <button
                      className={`cp-polarity-btn ${polarityView === 'ambos' ? 'active-both' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setPolarityView('ambos');
                      }}
                    >
                      ⚖️ Luz y Sombra
                    </button>
                    <button
                      className={`cp-polarity-btn ${polarityView === 'luz' ? 'active-light' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setPolarityView('luz');
                      }}
                    >
                      ☀️ Solo Luz
                    </button>
                    <button
                      className={`cp-polarity-btn ${polarityView === 'sombra' ? 'active-shadow' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setPolarityView('sombra');
                      }}
                    >
                      🌑 Solo Sombra
                    </button>
                  </div>
                </div>

                {/* Frase Insignia y Disparador Cerebral */}
                <div className="cp-spotlight-quote" style={{ borderLeftColor: spotlightArchetype.color }}>
                  {spotlightArchetype.quote}
                  <div style={{ marginTop: '8px', fontSize: '0.86rem', fontStyle: 'normal', color: '#38bdf8', fontWeight: 700 }}>
                    🧠 Efecto en el Cerebro Lector: {spotlightArchetype.neuroTrigger} — {spotlightArchetype.neuroExplanation}
                  </div>
                </div>

                {/* Tarjetas de Contraste: Cara Luminosa vs Sombra Trágica */}
                <div className="cp-dual-polarity-grid">
                  {(polarityView === 'ambos' || polarityView === 'luz') && (
                    <div className="cp-polarity-card light-card animate-fade-in">
                      <div className="cp-polarity-card-header">
                        <span>☀️</span> DIMENSIÓN LUMINOSA (VIRTUD Y MOTOR)
                      </div>
                      <div className="cp-polarity-item">
                        <strong>Función en la Historia:</strong>
                        <p>{spotlightArchetype.functionDesc}</p>
                      </div>
                      <div className="cp-polarity-item">
                        <strong>Deseo Central Consciente:</strong>
                        <p>{spotlightArchetype.coreDesire}</p>
                      </div>
                    </div>
                  )}

                  {(polarityView === 'ambos' || polarityView === 'sombra') && (
                    <div className="cp-polarity-card shadow-card animate-fade-in">
                      <div className="cp-polarity-card-header">
                        <span>🌑</span> LA SOMBRA (DEBILIDAD Y RIESGO DE CAÍDA)
                      </div>
                      <div className="cp-polarity-item">
                        <strong>Mayor Miedo Oculto:</strong>
                        <p>{spotlightArchetype.greatestFear}</p>
                      </div>
                      <div className="cp-polarity-item">
                        <strong>Defecto Trágico (Cuando pierde el equilibrio):</strong>
                        <p>{spotlightArchetype.shadowWeakness}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* LISTA DE CARACTERÍSTICAS Y RASGOS DE PERSONALIDAD */}
                <div
                  className="cp-personality-traits-box"
                  style={{
                    borderLeftColor: spotlightArchetype.color,
                    boxShadow: `0 8px 24px -6px ${spotlightArchetype.color}18`
                  }}
                >
                  <div className="cp-personality-traits-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        className="cp-traits-badge"
                        style={{
                          background: `${spotlightArchetype.color}1c`,
                          color: spotlightArchetype.color,
                          borderColor: `${spotlightArchetype.color}55`
                        }}
                      >
                        🎭 RASGOS Y PATRONES DE PERSONALIDAD
                      </span>
                      <span className="cp-traits-count">
                        {spotlightArchetype.personalityTraits?.length || 0} características clave
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Conducta observable, temperamento y actitudes ante la vida
                    </span>
                  </div>

                  <div className="cp-personality-traits-grid">
                    {(spotlightArchetype.personalityTraits || []).map((trait, idx) => (
                      <div
                        key={idx}
                        className="cp-trait-pill"
                        style={{ borderLeftColor: spotlightArchetype.color }}
                      >
                        <span className="cp-trait-bullet" style={{ color: spotlightArchetype.color }}>✦</span>
                        <span className="cp-trait-text">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-pestañas para no saturar la vista */}
                <div>
                  <div className="cp-arch-subtabs">
                    <button
                      className={`cp-arch-subtab-btn ${archSubTab === 'ejemplos' ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setArchSubTab('ejemplos');
                      }}
                    >
                      🏛️ Ejemplos (Popol Vuh y Literatura)
                    </button>
                    <button
                      className={`cp-arch-subtab-btn ${archSubTab === 'relaciones' ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setArchSubTab('relaciones');
                      }}
                    >
                      ⚡ Chispas con Otros Personajes ({spotlightArchetype.relations.length})
                    </button>
                    <button
                      className={`cp-arch-subtab-btn ${archSubTab === 'crisol' ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setArchSubTab('crisol');
                      }}
                    >
                      🔥 Prueba de Fuego y Consejo Práctico
                    </button>
                  </div>

                  {archSubTab === 'ejemplos' && (
                    <div className="cp-examples-showcase animate-fade-in">
                      <div className="cp-example-showcase-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                        <span style={{ color: '#fbbf24' }}>🌿 Raíz Mesoamericana (Popol Vuh)</span>
                        <p>{spotlightArchetype.mayanExample}</p>
                      </div>
                      <div className="cp-example-showcase-card">
                        <span>📜 Literatura Clásica Universal</span>
                        <p>{spotlightArchetype.classicExample}</p>
                      </div>
                      <div className="cp-example-showcase-card">
                        <span>🎬 Narrativa Contemporánea</span>
                        <p>{spotlightArchetype.modernExample}</p>
                      </div>
                    </div>
                  )}

                  {archSubTab === 'relaciones' && (
                    <div className="cp-examples-showcase animate-fade-in">
                      {spotlightArchetype.relations.map((rel, idx) => (
                        <div key={idx} className="cp-example-showcase-card">
                          <span>⚡ Frente a {rel.targetArchetype} ({rel.relationRole})</span>
                          <p>{rel.sparkDescription}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {archSubTab === 'crisol' && (
                    <div className="cp-dual-polarity-grid animate-fade-in">
                      <div className="cp-example-showcase-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                        <span style={{ color: '#fbbf24' }}>🔥 La Prueba del Crisol (Momento Clímax)</span>
                        <p>{spotlightArchetype.crucibleTrial}</p>
                      </div>
                      <div className="cp-example-showcase-card" style={{ borderColor: 'rgba(56, 189, 248, 0.45)' }}>
                        <span>💡 Consejo de Oro para el Estudiante</span>
                        <p>{spotlightArchetype.writingTip}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Acción directa para usar este arquetipo */}
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                    Arquetipo actual de tu personaje: <strong style={{ color: '#38bdf8' }}>{currentCharacterArchetype.icon} {currentCharacterArchetype.name}</strong>
                  </div>

                  <button
                    className="cp-btn-stage-next"
                    onClick={() => handleSelectArchetypeForCharacter(spotlightArchetype, true)}
                  >
                    <span>✨</span> Elegir «{spotlightArchetype.name.split('/')[0].trim()}» y Avanzar a Etapa 2 →
                  </button>
                </div>
              </div>
            </div>

            {/* Pie de Navegación Etapa 1 */}
            <div className="cp-stage-footer-nav">
              <div>
                <strong style={{ color: '#f8fafc', display: 'block', fontSize: '1rem' }}>
                  ¿Ya exploraste los arquetipos clásicos?
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  En la Etapa 2 descubrirás cómo hacer que el cerebro del lector sienta empatía real por tu personaje.
                </span>
              </div>
              <button
                className="cp-btn-stage-next"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(2);
                }}
              >
                Continuar a Etapa 2: Neurociencia del Carácter →
              </button>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 2: LABORATORIO NEUROCOGNITIVO DEL CARÁCTER
           ===================================================================== */}
        {activeStage === 2 && (
          <section className="animate-fade-in">
            {/* Guía clara de la Etapa 2 */}
            <div className="cp-stage-guide-banner">
              <div className="cp-stage-guide-info">
                <h2>
                  <span>🧠</span> Etapa 2: ¿Por qué el Cerebro Necesita Personajes con Carácter y Dimensiones?
                </h2>
                <p>
                  Un error común al empezar a escribir es crear personajes <strong>perfectos e invencibles</strong>.
                  Sin embargo, la neurociencia demuestra que el cerebro humano es un simulador de supervivencia:
                  si no hay vulnerabilidad, error ni contradicción, <strong>la atención cerebral se apaga</strong>.
                </p>
              </div>
              <div className="cp-stage-goal-box">
                <span>🎯 Meta Práctica de esta Etapa</span>
                <strong>Compara un personaje plano contra uno profundo y activa los 4 circuitos cerebrales en tu propio personaje.</strong>
              </div>
            </div>

            {/* EXPERIMENTO INTERACTIVO A/B: PERSONAJE PLANO VS TRIDIMENSIONAL */}
            <div className="cp-neuro-experiment-box">
              <div className="cp-experiment-header">
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    🔬 SIMULADOR EXPERIMENTAL DE LECTURA
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: '#f8fafc', fontWeight: 900 }}>
                    Prueba cómo reacciona el cerebro ante dos versiones de la misma escena
                  </h3>
                </div>

                <div className="cp-experiment-switch">
                  <button
                    className={`cp-exp-mode-btn ${experimentMode === 'plano' ? 'active-flat' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setExperimentMode('plano');
                    }}
                  >
                    🔴 Versión A: Héroe Perfecto (Plano)
                  </button>
                  <button
                    className={`cp-exp-mode-btn ${experimentMode === 'tridimensional' ? 'active-deep' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setExperimentMode('tridimensional');
                    }}
                  >
                    🟢 Versión B: Héroe con Carácter y Dimensiones
                  </button>
                </div>
              </div>

              <div className="cp-experiment-comparison-grid">
                {/* Muestra Narrativa */}
                <div
                  className="cp-exp-narrative-sample"
                  style={{
                    borderLeft: `5px solid ${experimentMode === 'plano' ? '#f43f5e' : '#10b981'}`
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    marginBottom: '12px',
                    background: experimentMode === 'plano' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: experimentMode === 'plano' ? '#fda4af' : '#6ee7b7'
                  }}>
                    {experimentMode === 'plano'
                      ? '❌ TEXTO PLANO (CERO TENSIÓN COGNITIVA)'
                      : '✅ TEXTO TRIDIMENSIONAL (ALTA RESONANCIA EMPÁTICA)'}
                  </span>

                  <p style={{ fontSize: '1.08rem', lineHeight: 1.7, color: '#f8fafc', fontStyle: 'italic', margin: '0 0 16px 0' }}>
                    {experimentMode === 'plano'
                      ? '«El capitán Kael entró a la cueva oscura sin sentir ningún miedo. Como era el guerrero más fuerte y perfecto del reino, derrotó a los guardias de un solo golpe sin despeinarse, tomó el cristal sagrado y salió sonriendo hacia su siguiente victoria.»'
                      : '«Antes de entrar a la cueva, Kael apretó con dedos temblorosos el amuleto roto de su hermano menor. Sabía que si el fuego volvía a rodearlo, sus pulmones recordarían el incendio del que huyó años atrás. Aun así, ocultó su miedo tras una broma seca para no alarmar a su aprendiz y dio el primer paso en la sombra.»'}
                  </p>

                  <div style={{
                    background: 'rgba(9, 14, 26, 0.65)',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontSize: '0.94rem',
                    color: '#cbd5e1',
                    lineHeight: 1.55
                  }}>
                    <strong style={{ color: experimentMode === 'plano' ? '#fb7185' : '#34d399', display: 'block', marginBottom: '4px' }}>
                      {experimentMode === 'plano' ? '¿Qué ocurre en el cerebro del lector?' : '¿Por qué este fragmento sí atrapa al cerebro?'}
                    </strong>
                    {experimentMode === 'plano'
                      ? 'Al no existir riesgo real, duda interna ni rastro sensorial, el cerebro predice el final desde la primera línea. No se libera oxitocina ni dopamina; el lector olvida al personaje en pocos minutos.'
                      : '1) El amuleto y los dedos temblorosos activan las Neuronas Espejo. 2) El trauma del incendio despierta Oxitocina por empatía. 3) Ocultar el terror con una broma activa la Teoría de la Mente (subtexto emocional).'}
                  </div>
                </div>

                {/* Barras de Telemetría Cerebral en Vivo */}
                <div className="cp-exp-telemetry-bars">
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                    📊 Respuesta Neurobiológica del Lector
                  </h4>

                  {[
                    {
                      label: '🔮 Teoría de la Mente (Subtexto e Intención)',
                      val: experimentMode === 'plano' ? 15 : 94,
                      color: '#38bdf8'
                    },
                    {
                      label: '💓 Oxitocina (Vínculo por Vulnerabilidad)',
                      val: experimentMode === 'plano' ? 10 : 92,
                      color: '#f43f5e'
                    },
                    {
                      label: '⚡ Dopamina (Curiosidad y Error de Predicción)',
                      val: experimentMode === 'plano' ? 20 : 88,
                      color: '#f59e0b'
                    },
                    {
                      label: '🧬 Neuronas Espejo (Sensación Corporal)',
                      val: experimentMode === 'plano' ? 18 : 90,
                      color: '#10b981'
                    }
                  ].map((metric, idx) => (
                    <div key={idx} className="cp-telemetry-row">
                      <div className="cp-telemetry-label-row">
                        <span style={{ color: '#e2e8f0' }}>{metric.label}</span>
                        <span style={{ color: metric.color, fontWeight: 900 }}>{metric.val}%</span>
                      </div>
                      <div className="cp-telemetry-track">
                        <div
                          className="cp-telemetry-fill"
                          style={{
                            width: `${metric.val}%`,
                            background: metric.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TALLER PRÁCTICO DE LOS 4 INTERRUPTORES CEREBRALES */}
            <div className="cp-neuro-circuits-layout">
              {/* Columna Izquierda: Selector de Circuito + Mapa Cerebral SVG */}
              <div className="cp-circuit-selector-col">
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Activa cada circuito en tu personaje:
                </span>

                {NEURO_CIRCUITS_DATA.map((circ) => {
                  const isActive = activeCircuit.id === circ.id;
                  return (
                    <button
                      key={circ.id}
                      className={`cp-circuit-btn ${isActive ? 'active' : ''}`}
                      style={{ borderColor: isActive ? circ.color : undefined }}
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveCircuitId(circ.id);
                      }}
                    >
                      <span style={{ fontSize: '1.7rem' }}>{circ.icon}</span>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: circ.color, textTransform: 'uppercase', display: 'block' }}>
                          {circ.stepNum} · {circ.neurotransmitter}
                        </span>
                        <strong style={{ fontSize: '0.98rem', color: '#f8fafc', display: 'block' }}>
                          {circ.name}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {circ.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Mapa Cerebral Interactivo que ilumina la región activa */}
                <div style={{
                  background: 'var(--cp-surface-2)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid var(--cp-border-subtle)',
                  textAlign: 'center',
                  marginTop: '6px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Región Cerebral Estimulada
                  </span>
                  <svg viewBox="0 0 240 160" width="210" height="140" style={{ margin: '0 auto', display: 'block' }}>
                    {/* Silueta del Cerebro */}
                    <path
                      d="M55 45 C30 45, 18 70, 22 98 C25 122, 55 135, 95 135 C120 135, 145 142, 172 128 C202 112, 212 72, 185 45 C160 22, 95 20, 55 45 Z"
                      fill="#0d1526"
                      stroke="#475569"
                      strokeWidth="3"
                    />
                    {/* Surcos corticales */}
                    <path d="M60 75 Q110 60 160 80" fill="none" stroke="#334155" strokeWidth="2" />
                    <path d="M85 40 Q105 85 95 130" fill="none" stroke="#334155" strokeWidth="2" />

                    {/* Nodo 1: Córtex Prefrontal (ToM) */}
                    <circle
                      cx="52"
                      cy="75"
                      r={activeCircuit.id === 'tom' ? 22 : 12}
                      fill="#38bdf8"
                      opacity={activeCircuit.id === 'tom' ? 0.85 : 0.25}
                    />
                    <text x="52" y="79" fill="#090e1a" fontSize="10" fontWeight="900" textAnchor="middle">ToM</text>

                    {/* Nodo 2: Sistema Límbico (Oxitocina) */}
                    <circle
                      cx="118"
                      cy="95"
                      r={activeCircuit.id === 'oxitocina' ? 22 : 12}
                      fill="#f43f5e"
                      opacity={activeCircuit.id === 'oxitocina' ? 0.85 : 0.25}
                    />
                    <text x="118" y="99" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">OXI</text>

                    {/* Nodo 3: Estriado Ventral (Dopamina) */}
                    <circle
                      cx="105"
                      cy="65"
                      r={activeCircuit.id === 'dopamina' ? 22 : 12}
                      fill="#f59e0b"
                      opacity={activeCircuit.id === 'dopamina' ? 0.85 : 0.25}
                    />
                    <text x="105" y="69" fill="#090e1a" fontSize="10" fontWeight="900" textAnchor="middle">DOP</text>

                    {/* Nodo 4: Corteza Premotora (Espejo) */}
                    <circle
                      cx="155"
                      cy="58"
                      r={activeCircuit.id === 'espejo' ? 22 : 12}
                      fill="#10b981"
                      opacity={activeCircuit.id === 'espejo' ? 0.85 : 0.25}
                    />
                    <text x="155" y="62" fill="#090e1a" fontSize="10" fontWeight="900" textAnchor="middle">ESP</text>
                  </svg>
                  <strong style={{ fontSize: '0.84rem', color: activeCircuit.color, display: 'block', marginTop: '6px' }}>
                    {activeCircuit.brainRegion}
                  </strong>
                </div>
              </div>

              {/* Columna Derecha: Explicación Clara + Aplicación Práctica Directa al Personaje */}
              <div className="cp-circuit-detail-col animate-fade-in" key={activeCircuit.id}>
                <div>
                  <span style={{
                    background: `${activeCircuit.color}22`,
                    color: activeCircuit.color,
                    border: `1px solid ${activeCircuit.color}66`,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {activeCircuit.stepNum} · {activeCircuit.brainRegion}
                  </span>
                  <h3 style={{ margin: '10px 0 6px 0', fontSize: '1.6rem', color: '#f8fafc', fontWeight: 900 }}>
                    {activeCircuit.icon} {activeCircuit.name}: {activeCircuit.subtitle}
                  </h3>
                  <p style={{ margin: 0, fontSize: '1.04rem', color: '#e2e8f0', lineHeight: 1.65 }}>
                    {activeCircuit.conceptExplanation}
                  </p>
                </div>

                {/* Pregunta Guía para el Estudiante */}
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  borderLeft: `4px solid ${activeCircuit.color}`,
                  padding: '14px 18px',
                  borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeCircuit.color, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    💡 Pregunta Clave para tu Personaje ({charName}):
                  </span>
                  <strong style={{ fontSize: '1.02rem', color: '#f8fafc' }}>
                    {activeCircuit.classroomQuestion}
                  </strong>
                </div>

                {/* Chips Clicables de Ideas Rápidas */}
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    ⚡ Haz clic en una idea de ejemplo o escribe la tuya propia abajo:
                  </span>
                  <div className="cp-quick-idea-chips">
                    {activeCircuit.quickIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        className="cp-idea-chip"
                        onClick={() => {
                          soundEffects.playClick();
                          if (activeCircuit.fieldKey === 'lie') setCharLie(idea);
                          if (activeCircuit.fieldKey === 'wound') setCharWound(idea);
                          if (activeCircuit.fieldKey === 'contradiction') setCharContradiction(idea);
                          if (activeCircuit.fieldKey === 'physical') setCharPhysical(idea);
                        }}
                      >
                        + {idea}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campo Directo Conectado al Personaje */}
                <div className="cp-form-group" style={{ marginTop: 'auto' }}>
                  <label style={{ color: activeCircuit.color }}>
                    ✍️ {activeCircuit.fieldLabel} de «{charName}»:
                  </label>
                  <textarea
                    rows={2}
                    value={
                      activeCircuit.fieldKey === 'lie'
                        ? charLie
                        : activeCircuit.fieldKey === 'wound'
                          ? charWound
                          : activeCircuit.fieldKey === 'contradiction'
                            ? charContradiction
                            : charPhysical
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeCircuit.fieldKey === 'lie') setCharLie(val);
                      if (activeCircuit.fieldKey === 'wound') setCharWound(val);
                      if (activeCircuit.fieldKey === 'contradiction') setCharContradiction(val);
                      if (activeCircuit.fieldKey === 'physical') setCharPhysical(val);
                    }}
                    placeholder="Escribe aquí o selecciona una de las ideas superiores..."
                  />
                </div>
              </div>
            </div>

            {/* Pie de Navegación Etapa 2 */}
            <div className="cp-stage-footer-nav">
              <button
                className="cp-btn-stage-prev"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(1);
                }}
              >
                ← Volver a Etapa 1: Arquetipos
              </button>
              <button
                className="cp-btn-stage-next"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(3);
                }}
              >
                Continuar a Etapa 3: Construir las 3 Dimensiones →
              </button>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 3: ARQUITECTURA DE LAS 3 DIMENSIONES (LAJOS EGRI)
           ===================================================================== */}
        {activeStage === 3 && (
          <section className="animate-fade-in">
            {/* Guía clara de la Etapa 3 */}
            <div className="cp-stage-guide-banner">
              <div className="cp-stage-guide-info">
                <h2>
                  <span>🧬</span> Etapa 3: Arquitectura de las 3 Dimensiones del Personaje
                </h2>
                <p>
                  Para que un personaje se sienta tan real como una persona de carne y hueso, el dramaturgo <strong>Lajos Egri</strong>
                  estableció tres pilares inseparables: <strong>1. Fisiología (Cuerpo)</strong>, <strong>2. Sociología (Entorno)</strong> y
                  <strong> 3. Psicología (Mente y Corazón)</strong>. Configura cada capa a la izquierda y observa el radar de equilibrio a la derecha.
                </p>
              </div>
              <div className="cp-stage-goal-box">
                <span>🎯 Meta Práctica de esta Etapa</span>
                <strong>Completa las 3 capas de tu personaje logrando un Índice de Tridimensionalidad superior al 75%.</strong>
              </div>
            </div>

            <div className="cp-dimensions-workspace">
              {/* Columna Izquierda: Constructor Guiado de las 3 Dimensiones */}
              <div className="cp-dim-builder-card">
                {/* Selector de las 3 Capas */}
                <div className="cp-dim-tabs-row">
                  {[
                    {
                      id: 'fisiologica' as const,
                      icon: '🧬',
                      title: '1. Fisiológica',
                      sub: 'Cuerpo y Sentidos',
                      val: dimPhysiological,
                      color: '#38bdf8'
                    },
                    {
                      id: 'sociologica' as const,
                      icon: '🌍',
                      title: '2. Sociológica',
                      sub: 'Cultura y Entorno',
                      val: dimSociological,
                      color: '#f59e0b'
                    },
                    {
                      id: 'psicologica' as const,
                      icon: '🧠',
                      title: '3. Psicológica',
                      sub: 'Deseo y Necesidad',
                      val: dimPsychological,
                      color: '#f43f5e'
                    }
                  ].map(tab => {
                    const isActive = activeDimensionTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        className={`cp-dim-tab-btn ${isActive ? 'active' : ''}`}
                        style={{ borderColor: isActive ? tab.color : undefined }}
                        onClick={() => {
                          soundEffects.playClick();
                          setActiveDimensionTab(tab.id);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.4rem' }}>{tab.icon}</span>
                          <strong style={{ color: tab.color, fontSize: '1rem' }}>{tab.val}%</strong>
                        </div>
                        <strong style={{ display: 'block', color: '#f8fafc', fontSize: '0.98rem' }}>{tab.title}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{tab.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Contenido Dinámico de la Dimensión Seleccionada */}
                {CHARACTER_DIMENSIONS.filter(d => d.id === activeDimensionTab).map(dim => (
                  <div key={dim.id} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{
                      background: 'var(--cp-surface-2)',
                      padding: '18px 20px',
                      borderRadius: '16px',
                      borderLeft: `5px solid ${dim.color}`
                    }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', color: '#f8fafc', fontWeight: 900 }}>
                        {dim.icon} {dim.name}
                      </h3>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.98rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                        {dim.description}
                      </p>
                      <div style={{ fontSize: '0.86rem', color: dim.color, fontWeight: 700 }}>
                        🔬 Fundamento Neurocognitivo: {dim.scientificMechanism}
                      </div>
                    </div>

                    {/* Banco de Píldoras de Inspiración Rápida */}
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        ✨ Píldoras de Inspiración Rápida (Haz clic para agregar a tu personaje):
                      </span>
                      <div className="cp-quick-idea-chips">
                        {DIMENSION_QUICK_CHIPS[activeDimensionTab].map((chip, idx) => (
                          <button
                            key={idx}
                            className="cp-idea-chip"
                            onClick={() => {
                              soundEffects.playClick();
                              if (activeDimensionTab === 'fisiologica') {
                                setCharPhysical(prev => prev ? `${prev}. ${chip}` : chip);
                                setDimPhysiological(prev => Math.min(100, prev + 10));
                              } else if (activeDimensionTab === 'sociologica') {
                                setCharSocial(prev => prev ? `${prev}. ${chip}` : chip);
                                setDimSociological(prev => Math.min(100, prev + 10));
                              } else {
                                setCharNeed(prev => prev ? `${prev}. ${chip}` : chip);
                                setDimPsychological(prev => Math.min(100, prev + 10));
                              }
                            }}
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Campos de Edición según la Dimensión */}
                    {activeDimensionTab === 'fisiologica' && (
                      <div className="cp-form-group">
                        <label>🧬 Describe la Fisonomía, Gestos, Voz y Objetos de «{charName}»:</label>
                        <textarea
                          rows={3}
                          value={charPhysical}
                          onChange={(e) => setCharPhysical(e.target.value)}
                          placeholder="¿Cómo luce, cómo se mueve bajo presión, qué objeto o cicatriz lleva consigo?"
                        />
                      </div>
                    )}

                    {activeDimensionTab === 'sociologica' && (
                      <div className="cp-form-group">
                        <label>🌍 Describe la Comunidad, Origen, Oficio y Reglas Sociales de «{charName}»:</label>
                        <textarea
                          rows={3}
                          value={charSocial}
                          onChange={(e) => setCharSocial(e.target.value)}
                          placeholder="¿En qué entorno creció, a quién protege y qué normas de su mundo desafía?"
                        />
                      </div>
                    )}

                    {activeDimensionTab === 'psicologica' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                        <div className="cp-form-group">
                          <label>🎯 Deseo Consciente (Lo que cree querer):</label>
                          <textarea
                            rows={2}
                            value={charDesire}
                            onChange={(e) => setCharDesire(e.target.value)}
                            placeholder="La meta visible o externa que persigue..."
                          />
                        </div>
                        <div className="cp-form-group">
                          <label>🌱 Necesidad Profunda (Lo que debe aprender):</label>
                          <textarea
                            rows={2}
                            value={charNeed}
                            onChange={(e) => setCharNeed(e.target.value)}
                            placeholder="La lección interna o transformación moral..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Control Deslizante de Nivel de Desarrollo de esta Dimensión */}
                    <div style={{
                      background: 'var(--cp-surface-2)',
                      padding: '16px 18px',
                      borderRadius: '14px',
                      border: '1px solid var(--cp-border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                          🎚️ Nivel de Profundidad {dim.name.split('(')[0]}:
                        </strong>
                        <strong style={{ fontSize: '1.05rem', color: dim.color }}>
                          {activeDimensionTab === 'fisiologica'
                            ? dimPhysiological
                            : activeDimensionTab === 'sociologica'
                              ? dimSociological
                              : dimPsychological}%
                        </strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        className="cp-slider-input"
                        value={
                          activeDimensionTab === 'fisiologica'
                            ? dimPhysiological
                            : activeDimensionTab === 'sociologica'
                              ? dimSociological
                              : dimPsychological
                        }
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (activeDimensionTab === 'fisiologica') setDimPhysiological(val);
                          if (activeDimensionTab === 'sociologica') setDimSociological(val);
                          if (activeDimensionTab === 'psicologica') setDimPsychological(val);
                        }}
                      />
                    </div>

                    {/* Preguntas de Verificación para el Aula */}
                    <div style={{
                      background: 'var(--cp-bg-base)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid var(--cp-border-subtle)'
                    }}>
                      <strong style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        📋 Preguntas Guía para Reflexionar en Clase:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {dim.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna Derecha: Radar Triangular en Tiempo Real y Diagnóstico */}
              <div className="cp-dim-radar-card">
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    RADAR DE EQUILIBRIO 3D
                  </span>
                  <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: neuroDiagnostic.color }}>
                    {threeDimensionalScore}%
                  </strong>
                </div>

                {/* Gráfico SVG de Triángulo de las 3 Dimensiones */}
                <svg viewBox="0 0 260 220" width="250" height="210">
                  {/* Triángulos guía concéntricos */}
                  <polygon
                    points="130,37 62,154 198,154"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <polygon
                    points="130,76 96,135 164,135"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="1"
                  />

                  {/* Ejes desde el centro */}
                  <line x1="130" y1="115" x2="130" y2="37" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                  <line x1="130" y1="115" x2="62" y2="154" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
                  <line x1="130" y1="115" x2="198" y2="154" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />

                  {/* Polígono Dinámico del Personaje */}
                  <polygon
                    points={radarPoints}
                    fill={`${neuroDiagnostic.color}33`}
                    stroke={neuroDiagnostic.color}
                    strokeWidth="3"
                  />

                  {/* Etiquetas de los 3 Vértices */}
                  <text x="130" y="24" fill="#f43f5e" fontSize="11" fontWeight="800" textAnchor="middle">
                    🧠 PSICOLÓGICA ({dimPsychological}%)
                  </text>
                  <text x="55" y="178" fill="#38bdf8" fontSize="11" fontWeight="800" textAnchor="middle">
                    🧬 FISIO ({dimPhysiological}%)
                  </text>
                  <text x="205" y="178" fill="#f59e0b" fontSize="11" fontWeight="800" textAnchor="middle">
                    🌍 SOCIO ({dimSociological}%)
                  </text>
                </svg>

                {/* Semáforo de Diagnóstico */}
                <div style={{
                  width: '100%',
                  background: `${neuroDiagnostic.color}18`,
                  border: `1.5px solid ${neuroDiagnostic.color}`,
                  borderRadius: '14px',
                  padding: '14px 16px',
                  textAlign: 'center'
                }}>
                  <strong style={{ color: neuroDiagnostic.color, fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>
                    {neuroDiagnostic.level}
                  </strong>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.45 }}>
                    {neuroDiagnostic.summary}
                  </p>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    💡 {neuroDiagnostic.tip}
                  </span>
                </div>

                {/* Botones rápidos de prueba */}
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setDimPhysiological(88);
                      setDimSociological(85);
                      setDimPsychological(92);
                    }}
                    style={{
                      flex: 1,
                      background: 'var(--cp-surface-2)',
                      border: '1px solid var(--cp-border-strong)',
                      color: '#34d399',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Nivelar al Óptimo
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setDimPhysiological(25);
                      setDimSociological(30);
                      setDimPsychological(25);
                    }}
                    style={{
                      flex: 1,
                      background: 'var(--cp-surface-2)',
                      border: '1px solid var(--cp-border-strong)',
                      color: '#fb7185',
                      padding: '9px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ⚠️ Simular Cliché
                  </button>
                </div>
              </div>
            </div>

            {/* Pie de Navegación Etapa 3 */}
            <div className="cp-stage-footer-nav">
              <button
                className="cp-btn-stage-prev"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(2);
                }}
              >
                ← Volver a Etapa 2: Neurociencia
              </button>
              <button
                className="cp-btn-stage-next"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(4);
                }}
              >
                Continuar a Etapa 4: Estudio Visual y Exportación →
              </button>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 4: ESTUDIO VISUAL, SUBIDA DE IMAGEN Y FICHA MAESTRA
           ===================================================================== */}
        {activeStage === 4 && (
          <section className="animate-fade-in">
            {/* Guía clara de la Etapa 4 */}
            <div className="cp-stage-guide-banner">
              <div className="cp-stage-guide-info">
                <h2>
                  <span>🎨</span> Etapa 4: Estudio Visual con Imagen Propia y Ficha Exportable
                </h2>
                <p>
                  ¡Todo lo que construiste en las etapas anteriores está reunido aquí! Ahora dale un <strong>rostro único</strong> a tu personaje:
                  sube una ilustración o fotografía desde tu dispositivo, ajusta el <strong>encuadre y filtro artístico</strong>, y descarga tu
                  <strong> Cromo Coleccionable</strong> o el <strong>Expediente Pedagógico Completo</strong>.
                </p>
              </div>
              <div className="cp-stage-goal-box">
                <span>🎯 Meta Práctica de esta Etapa</span>
                <strong>Sube y encuadra la imagen de tu personaje, guárdalo en tu galería y descarga su ficha final.</strong>
              </div>
            </div>

            {/* Galería Rápida de Personajes Guardados / Ejemplos */}
            <div style={{
              background: 'var(--cp-surface-1)',
              border: '1px solid var(--cp-border-subtle)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                  📚 Galería de Personajes (Cargar plantilla o guardado):
                </span>
                {savedRoster.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => handleLoadProfile(prof)}
                    style={{
                      background: charName === prof.name ? 'var(--cp-cyan)' : 'var(--cp-surface-2)',
                      color: charName === prof.name ? '#090e1a' : '#f8fafc',
                      border: '1px solid var(--cp-border-strong)',
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🎭</span> {prof.name}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSaveToRoster}
                style={{
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {saveSuccess ? '✅ ¡Guardado en Galería!' : '💾 Guardar Personaje Actual en Galería'}
              </button>
            </div>

            <div className="cp-forge-layout">
              {/* Columna Izquierda: Configuración de Imagen y Datos */}
              <div className="cp-form-panel">
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
                  🖼️ 1. Subida y Configuración de Imagen del Personaje
                </h3>

                {/* Zona Drag & Drop para subir imagen */}
                <div
                  className="cp-upload-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCharacterDrop}
                  onClick={() => charFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={charFileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleCharacterImageInput}
                    style={{ display: 'none' }}
                  />
                  <div>
                    <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>📤</div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>
                      Haz clic aquí para subir tu imagen o arrástrala desde tu carpeta
                    </strong>
                    <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                      Formatos JPG, PNG o WebP · Se abrirá el editor para encuadrar y centrar a la perfección
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <div style={{ color: '#fb7185', fontSize: '0.88rem', fontWeight: 700 }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Botón de apertura de módulo de encuadre profesional */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={openFramingForCurrent}
                    className="cp-btn-framing-editor"
                  >
                    <span>🎯</span> Abrir Editor de Encuadre, Zoom y Rotación Profesional
                  </button>
                </div>

                {/* Controles de Encuadre (Zoom y Posición Vertical) */}
                <div style={{
                  background: 'var(--cp-surface-2)',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid var(--cp-border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span>🔍 Zoom de Imagen</span>
                      <span style={{ color: '#38bdf8' }}>{imgZoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="160"
                      value={imgZoom}
                      onChange={(e) => setImgZoom(Number(e.target.value))}
                      className="cp-slider-input"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span>↕️ Encuadre Vertical</span>
                      <span style={{ color: '#38bdf8' }}>{imgPosY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imgPosY}
                      onChange={(e) => setImgPosY(Number(e.target.value))}
                      className="cp-slider-input"
                    />
                  </div>
                </div>

                {/* Filtros Artísticos */}
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    🎨 Filtro Artístico del Retrato:
                  </span>
                  <div className="cp-filter-chips-row">
                    {[
                      { id: 'normal', label: 'Sin Filtro (Natural)' },
                      { id: 'codice', label: '🏺 Códice Maya' },
                      { id: 'cyber', label: '⚡ Cyber Neón' },
                      { id: 'pergamino', label: '📜 Pergamino Ancestral' },
                      { id: 'acuarela', label: '🎨 Acuarela Onírica' }
                    ].map(f => (
                      <button
                        key={f.id}
                        className={`cp-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setActiveFilter(f.id as ArtFilterType);
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--cp-border-subtle)', margin: '4px 0' }} />

                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
                  ✍️ 2. Síntesis de Identidad del Personaje
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div className="cp-form-group">
                    <label>Nombre del Personaje</label>
                    <input
                      type="text"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="Ej. Hunahpú, Ikal, Dr. Zeno..."
                    />
                  </div>

                  <div className="cp-form-group">
                    <label>Título / Vocación</label>
                    <input
                      type="text"
                      value={charTitle}
                      onChange={(e) => setCharTitle(e.target.value)}
                      placeholder="Ej. Guardián del Códice..."
                    />
                  </div>
                </div>

                <div className="cp-form-group">
                  <label>Arquetipo Base (Definido en Etapa 1)</label>
                  <select
                    value={charArchetypeId}
                    onChange={(e) => {
                      soundEffects.playClick();
                      setCharArchetypeId(e.target.value);
                    }}
                  >
                    {CLASSIC_ARCHETYPES.map(arc => (
                      <option key={arc.id} value={arc.id}>
                        {arc.icon} {arc.name} — {arc.roleSubtitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cp-form-group">
                  <label>Frase Insignia o Lema</label>
                  <input
                    type="text"
                    value={charQuote}
                    onChange={(e) => setCharQuote(e.target.value)}
                    placeholder="Una frase que exprese la voz de tu personaje..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div className="cp-form-group">
                    <label>🔮 Mentira Nuclear (Etapa 2)</label>
                    <textarea
                      rows={2}
                      value={charLie}
                      onChange={(e) => setCharLie(e.target.value)}
                    />
                  </div>
                  <div className="cp-form-group">
                    <label>⚡ Contradicción Única (Etapa 2)</label>
                    <textarea
                      rows={2}
                      value={charContradiction}
                      onChange={(e) => setCharContradiction(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Vista Previa en Tiempo Real (Cromo / Expediente) y Descarga */}
              <div className="cp-card-preview-container">
                {/* Selector de Formato Visual */}
                <div style={{
                  width: '100%',
                  maxWidth: '420px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Formato de Ficha:
                  </span>
                  <div className="cp-polarity-toggle">
                    <button
                      className={`cp-polarity-btn ${previewFormat === 'cromo' ? 'active-both' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setPreviewFormat('cromo');
                      }}
                    >
                      🎴 Cromo Visual
                    </button>
                    <button
                      className={`cp-polarity-btn ${previewFormat === 'expediente' ? 'active-both' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setPreviewFormat('expediente');
                      }}
                    >
                      📋 Expediente Completo
                    </button>
                  </div>
                </div>

                {/* TARJETA EXPORTABLE */}
                <div
                  ref={cardExportRef}
                  className="cp-collectible-card"
                  style={{ borderColor: currentCharacterArchetype.color }}
                >
                  {/* Marco de Ilustración con Zoom y Posición */}
                  <div className="cp-card-art-holder">
                    <img
                      src={charImage}
                      alt={charName}
                      className={`cp-card-art-img filter-${activeFilter}`}
                      style={{
                        objectPosition: `50% ${imgPosY}%`,
                        transform: `scale(${imgZoom / 100})`
                      }}
                      crossOrigin="anonymous"
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(9, 14, 26, 0.9)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: '#f8fafc',
                      border: `1px solid ${currentCharacterArchetype.color}`
                    }}>
                      {currentCharacterArchetype.icon} {currentCharacterArchetype.name.split('/')[0]}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(9, 14, 26, 0.9)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.5)'
                    }}>
                      {threeDimensionalScore}% 3D
                    </div>
                  </div>

                  {/* Nombre y Epíteto */}
                  <div>
                    <h4 className="cp-card-name-title">{charName || 'Personaje Creatika'}</h4>
                    <span style={{ fontSize: '0.88rem', color: currentCharacterArchetype.color, fontWeight: 700 }}>
                      {charTitle || currentCharacterArchetype.roleSubtitle}
                    </span>
                  </div>

                  {/* Cita */}
                  <div style={{
                    background: 'rgba(24, 35, 56, 0.85)',
                    borderLeft: `4px solid ${currentCharacterArchetype.color}`,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontStyle: 'italic',
                    color: '#f8fafc',
                    lineHeight: 1.45
                  }}>
                    {charQuote || '«...»'}
                  </div>

                  {/* Estadísticas de las 3 Dimensiones */}
                  <div className="cp-card-stats-grid">
                    <div className="cp-card-stat">
                      <span>🧬 Fisiológica</span>
                      <strong style={{ color: '#38bdf8' }}>{dimPhysiological}%</strong>
                    </div>
                    <div className="cp-card-stat">
                      <span>🌍 Sociológica</span>
                      <strong style={{ color: '#f59e0b' }}>{dimSociological}%</strong>
                    </div>
                    <div className="cp-card-stat">
                      <span>🧠 Psicológica</span>
                      <strong style={{ color: '#f43f5e' }}>{dimPsychological}%</strong>
                    </div>
                    <div className="cp-card-stat">
                      <span>⚡ Neuro-Impulso</span>
                      <strong style={{ color: '#10b981', fontSize: '0.8rem' }}>
                        {currentCharacterArchetype.neuroBadge.split('·')[0]}
                      </strong>
                    </div>
                  </div>

                  {/* Detalles según formato elegido */}
                  <div style={{
                    background: 'rgba(9, 14, 26, 0.75)',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    lineHeight: 1.45
                  }}>
                    <div>
                      <strong style={{ color: '#f43f5e' }}>MENTIRA NUCLEAR: </strong>
                      <span style={{ color: '#e2e8f0' }}>{charLie}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#f59e0b' }}>CONTRADICCIÓN: </strong>
                      <span style={{ color: '#e2e8f0' }}>{charContradiction}</span>
                    </div>

                    {previewFormat === 'expediente' && (
                      <>
                        <div>
                          <strong style={{ color: '#fb7185' }}>HERIDA DEL PASADO: </strong>
                          <span style={{ color: '#e2e8f0' }}>{charWound}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#38bdf8' }}>CUERPO Y GESTOS: </strong>
                          <span style={{ color: '#e2e8f0' }}>{charPhysical}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#fbbf24' }}>ENTORNO SOCIAL: </strong>
                          <span style={{ color: '#e2e8f0' }}>{charSocial}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#34d399' }}>NECESIDAD PROFUNDA: </strong>
                          <span style={{ color: '#e2e8f0' }}>{charNeed}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                    fontWeight: 700,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: '8px'
                  }}>
                    <span>EDITORIAL LLUVIA DE IDEAS</span>
                    <span>SUITE CREATIKA · FORJA 3D</span>
                  </div>
                </div>

                {/* Botones de Acción Final */}
                <div className="cp-export-actions">
                  <button
                    onClick={handleExportPNG}
                    disabled={isExporting}
                    className="cp-btn-export cp-btn-primary"
                  >
                    <span>{isExporting ? '⏳' : '📸'}</span>
                    {isExporting ? 'Renderizando PNG...' : 'Descargar Ficha PNG'}
                  </button>

                  <button
                    onClick={handleCopySheet}
                    className="cp-btn-export cp-btn-glass"
                  >
                    <span>{copySuccess ? '✅' : '📋'}</span>
                    {copySuccess ? '¡Expediente Copiado!' : 'Copiar Texto Completo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pie de Navegación Etapa 4 */}
            <div className="cp-stage-footer-nav">
              <button
                className="cp-btn-stage-prev"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(3);
                }}
              >
                ← Volver a Etapa 3: Las 3 Dimensiones
              </button>
              <button
                className="cp-btn-stage-prev"
                onClick={() => {
                  soundEffects.playClick();
                  setActiveStage(1);
                }}
              >
                🔄 Explorar otro Arquetipo en Etapa 1
              </button>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          LIGHTBOX EXPANDIDO: VISUALIZACIÓN DE ILUSTRACIÓN DE ARQUETIPO
          ========================================================================= */}
      {expandedArchetype && (
        <div
          className="cp-lightbox-backdrop"
          onClick={() => {
            soundEffects.playClick();
            setExpandedArchetype(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cp-lightbox-card"
            style={{ borderColor: `${expandedArchetype.color}99` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Lightbox */}
            <div className="cp-lightbox-header">
              <div className="cp-lightbox-header-info">
                <span className="cp-lightbox-icon">{expandedArchetype.icon}</span>
                <div>
                  <h3 className="cp-lightbox-title" style={{ color: expandedArchetype.color }}>
                    {expandedArchetype.name}
                  </h3>
                  <span className="cp-lightbox-subtitle">{expandedArchetype.role}</span>
                </div>
              </div>
              <button
                type="button"
                className="cp-lightbox-close-btn"
                onClick={() => {
                  soundEffects.playClick();
                  setExpandedArchetype(null);
                }}
                aria-label="Cerrar vista expandida"
              >
                ✕
              </button>
            </div>

            {/* Imagen Principal en Alta Definición */}
            <div className="cp-lightbox-image-container">
              <img
                src={expandedArchetype.image}
                alt={expandedArchetype.name}
                className="cp-lightbox-img"
              />
              <div className="cp-lightbox-badge-floating">
                <span>🧠 {expandedArchetype.neuroBadge}</span>
              </div>
            </div>

            {/* Cita y Cimentación Arquetípica */}
            <div className="cp-lightbox-footer">
              <blockquote className="cp-lightbox-quote">
                {expandedArchetype.quote}
              </blockquote>
              <div className="cp-lightbox-meta-grid">
                <div className="cp-lightbox-meta-item light">
                  <span className="cp-lightbox-meta-label">☀️ Expresión Luminosa:</span>
                  <p>{expandedArchetype.lightAspect}</p>
                </div>
                <div className="cp-lightbox-meta-item shadow">
                  <span className="cp-lightbox-meta-label">🌑 Sombra / Riesgo:</span>
                  <p>{expandedArchetype.shadowAspect}</p>
                </div>
              </div>

              {/* Características de Personalidad en Lightbox */}
              {expandedArchetype.personalityTraits && expandedArchetype.personalityTraits.length > 0 && (
                <div className="cp-lightbox-traits-block">
                  <span className="cp-lightbox-traits-title">🎭 Rasgos Clave de Personalidad:</span>
                  <div className="cp-lightbox-traits-list">
                    {expandedArchetype.personalityTraits.map((t, idx) => (
                      <div key={idx} className="cp-lightbox-trait-badge">
                        <span style={{ color: expandedArchetype.color }}>✦</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO DE ENCUADRE Y CENTRADO PROFESIONAL DE IMAGEN
          ========================================================================= */}
      <ImageFramingModal
        isOpen={framingModalOpen}
        imageSrc={framingImageSrc}
        title="Encuadre y Centrado Profesional del Retrato"
        subtitle="Ajusta el zoom, arrastra para centrar el área focal perfecta y rota tu personaje."
        aspectRatio={null}
        targetWidth={1000}
        targetHeight={1000}
        onSave={handleFramingSave}
        onClose={() => {
          setFramingModalOpen(false);
          setFramingImageSrc(null);
        }}
      />
    </div>
  );
}
