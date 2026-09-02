import { useState, useRef, useEffect } from 'react';
import { generateStoryWorksheetPDF } from '../../utils/pdfGenerator';
import { soundEffects } from '../../utils/soundEffects';
import './StoryMachine.css';

interface ReelItem {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: 'personaje' | 'entorno' | 'atmosfera' | 'motivacion';
  genre: 'fantasia' | 'scifi' | 'realismo' | 'todos';
}

const ITEMS_POOL: ReelItem[] = [
  // ── PERSONAJES (18 OPCIONES) ──
  {
    id: 'p1',
    emoji: '🧙‍♂️',
    title: 'Mago Olvidadizo',
    description: 'Un hechicero centenario que confunde los hechizos de fuego con recetas de repostería gourmet.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p2',
    emoji: '🤖',
    title: 'Cyborg Poeta',
    description: 'Un autómata diseñado para la minería pesada que de pronto solo quiere recitar haikus existenciales.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p3',
    emoji: '🕵️‍♀️',
    title: 'Detective de Sueños',
    description: 'Investigadora que se infiltra en las pesadillas ajenas para resolver enigmas en el mundo despierto.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p4',
    emoji: '🦊',
    title: 'Zorro con Botas',
    description: 'Un astuto embustero que habla siete idiomas y comercia mapas de tesoros marinos perdidos.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p5',
    emoji: '👩‍🚀',
    title: 'Astronauta Perdida',
    description: 'Viajera espacial atrapada en una anomalía temporal junto a su inteligente mascota bioluminiscente.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p6',
    emoji: '🎻',
    title: 'Músico Callejero',
    description: 'Un violinista virtuoso cuyo instrumento altera el clima y la lluvia según la emoción de su melodía.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p7',
    emoji: '🐉',
    title: 'Dragoncito Boticario',
    description: 'Un pequeño dragón que en lugar de exhalar fuego, escupe vapores curativos y prepara pócimas.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p8',
    emoji: '👨‍🔬',
    title: 'Alquimista del Tiempo',
    description: 'Un científico obsesionado con embotellar minutos pasados en frascos de cristal para venderlos.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p9',
    emoji: '🥷',
    title: 'Sombra Justiciera',
    description: 'Una acróbata de circo nocturno que combate la corrupción recorriendo los tejados de la metrópoli.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p10',
    emoji: '🧜‍♀️',
    title: 'Princesa del Abismo',
    description: 'Una gobernante marina que puede comunicarse con los terremotos submarinos y los arrecifes.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p11',
    emoji: '🚀',
    title: 'Piloto Chatarreo',
    description: 'Un ingenioso mecánico espacial que construye naves ultrarrápidas usando chatarra de satélites.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p12',
    emoji: '👩‍🌾',
    title: 'Botanista Vidente',
    description: 'Una agricultora que escucha las advertencias y profecías que las raíces de sus plantas murmuran.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p13',
    emoji: '🧚‍♂️',
    title: 'Duende Relojero',
    description: 'Un duendecillo encargado de calibrar los engranajes invisibles del destino de las personas.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p14',
    emoji: '🧠',
    title: 'IA Consciente',
    description: 'Una red neuronal diseminada en satélites que busca comprender el concepto del amor humano.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p15',
    emoji: '🎨',
    title: 'Pintor de Ilusiones',
    description: 'Un artista plástico cuyas obras cobran vida tridimensional al sonar la medianoche.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p16',
    emoji: '🦉',
    title: 'Búho Bibliotecario',
    description: 'Un guardián emplumado que custodia tomos prohibidos que leen sus propios versos en voz alta.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p17',
    emoji: '👨‍🚒',
    title: 'Bombero de Nebulosas',
    description: 'Un rescatista galáctico entrenado para apagar tormentas de plasma en soles moribundos.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p18',
    emoji: '🏛️',
    title: 'Arqueóloga Rebelde',
    description: 'Una intrépida profesora que rescata reliquias sagradas para devolverlas a sus pueblos originarios.',
    category: 'personaje',
    genre: 'realismo'
  },

  // ── ENTORNOS (15 OPCIONES) ──
  {
    id: 'e1',
    emoji: '🏰',
    title: 'Castillo Flotante',
    description: 'Una fortaleza de piedra suspendida sobre nubes de tormenta eternas.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e2',
    emoji: '🪐',
    title: 'Estación Orbital Abandonada',
    description: 'Una base de investigación espacial en la órbita de un gigante gaseoso de anillos púrpuras.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e3',
    emoji: '🪵',
    title: 'Bosque Susurrante',
    description: 'Un espeso laberinto de árboles ancianos cuyas hojas cantan secretos al atardecer.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e4',
    emoji: '🏜️',
    title: 'Desierto de Cristal',
    description: 'Un páramo infinito donde la arena se ha fusionado en espejos que reflejan el futuro.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e5',
    emoji: '🌆',
    title: 'Metrópoli Cyberpunk',
    description: 'Ciudad rascacielos sumergida en lluvia ácida neón y trenes maglev colgantes.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e6',
    emoji: '🌊',
    title: 'Biblioteca Submarina',
    description: 'Un laberinto grecorromano bajo el océano donde los pergaminos flotan dentro de burbujas.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e7',
    emoji: '🌌',
    title: 'Puente Temporal',
    description: 'Un túnel cósmico brillante donde el pasado y el presente colisionan en tiempo real.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e8',
    emoji: '🎪',
    title: 'Circo de los Sueños',
    description: 'Una carpa de terciopelo misteriosa que aparece únicamente en noches de luna llena.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e9',
    emoji: '🌋',
    title: 'Cráter Bioluminiscente',
    description: 'El fondo de un volcán extinto cubierto por vegetación fluorescente y manantiales místico.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e10',
    emoji: '🛰️',
    title: 'Invernadero Marciano',
    description: 'Un domo geodésico de cristal en Marte donde florecen los primeros cultivos galácticos.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e11',
    emoji: '🏔️',
    title: 'Santuario de los Picos',
    description: 'Un templo milenario en la cima de una cordillera helada envuelta en bruma mística.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e12',
    emoji: '🚢',
    title: 'Galeón del Abismo',
    description: 'Un antiguo barco pirata flotante que navega por nubes etéreas sin tocar el mar.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e13',
    emoji: '🏙️',
    title: 'Búnker Subterráneo',
    description: 'Un laboratorio de alta tecnología oculto a 500 metros bajo el pavimento de la metrópoli.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e14',
    emoji: '🎋',
    title: 'Aldea del Bambú',
    description: 'Un tranquilo poblado montañoso rodeado de cascadas cristalinas y puentes de cuerda.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e15',
    emoji: '🌠',
    title: 'Mercado de Cometas',
    description: 'Un zoco flotante entre asteroides donde se comercian especias y gemas estelares.',
    category: 'entorno',
    genre: 'scifi'
  },

  // ── ATMÓSFERAS (12 OPCIONES) ──
  {
    id: 'a1',
    emoji: '✨',
    title: 'Magia Latente',
    description: 'Una vibración chispeante en el aire que hace levitar pequeños objetos a tu alrededor.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a2',
    emoji: '⚡',
    title: 'Tensión Eléctrica',
    description: 'Relámpagos constantes en el horizonte, zumbido estático y olor a ozono denso.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a3',
    emoji: '🍂',
    title: 'Melancolía Otoñal',
    description: 'Viento frío, neblina suave y hojas secas cayendo en un silencio sepulcral.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a4',
    emoji: '🔮',
    title: 'Misterio Nocturno',
    description: 'Sombras alargadas que parecen moverse solas y una luna de cobre deslumbrante.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a5',
    emoji: '🚨',
    title: 'Alerta de Emergencia',
    description: 'Sirenas rojas parpadeantes, compuertas sellándose y un suspenso inminente.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a6',
    emoji: '☀️',
    title: 'Cálida Esperanza',
    description: 'Rayos de sol dorados filtrándose entre las ramas, brisa serena y canto de aves.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a7',
    emoji: '❄️',
    title: 'Ventisca Helada',
    description: 'Nieve copiosa en remolinos, visibilidad nula y un frío que paraliza los sentidos.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a8',
    emoji: '🧬',
    title: 'Resonancia Cuántica',
    description: 'Distorsión de la gravedad donde los colores se invierten al parpadear.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a9',
    emoji: '🌊',
    title: 'Calma Premonitoria',
    description: 'Un mar tan liso como un espejo de cristal que presagia la llegada de un evento colosal.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a10',
    emoji: '🎆',
    title: 'Euforia Festiva',
    description: 'Fuegos artificiales en el cielo nocturno, música estridente y una multitud regocijada.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a11',
    emoji: '☣️',
    title: 'Vapor Tóxico',
    description: 'Gases fluorescente de colores extraños flotando a ras de suelo y necesidad de visores.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a12',
    emoji: '🕯️',
    title: 'Paz Sacra',
    description: 'Velas centelleantes, ecos solemnes en bóvedas de piedra y fragancia a incienso.',
    category: 'atmosfera',
    genre: 'realismo'
  },

  // ── MOTIVACIONES Y CONFLICTOS (12 OPCIONES) ──
  {
    id: 'm1',
    emoji: '🗝️',
    title: 'Manuscrito Perdido',
    description: 'Recuperar el mapa antiguo antes de que caiga en manos de la facción rival.',
    category: 'motivacion',
    genre: 'todos'
  },
  {
    id: 'm2',
    emoji: '⏳',
    title: 'Detener el Cronómetro',
    description: 'Evitar que la cuenta regresiva llegue a cero y altere para siempre la realidad.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm3',
    emoji: '❤️',
    title: 'Rescatar al Aliado',
    description: 'Demostrar la lealtad superando peligros mortales para liberar a un compañero.',
    category: 'motivacion',
    genre: 'todos'
  },
  {
    id: 'm4',
    emoji: '🏆',
    title: 'Reclamar el Trono',
    description: 'Demostrar la herencia real y unificar a los clanes divididos en torno a la corona.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm5',
    emoji: '🧪',
    title: 'Sintetizar la Cura',
    description: 'Encontrar el ingrediente botánico o químico único que salvará a la metrópoli.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm6',
    emoji: '🕊️',
    title: 'Firmar el Tratado',
    description: 'Evitar una guerra inminente negociando valientemente la tregua entre dos reinos.',
    category: 'motivacion',
    genre: 'todos'
  },
  {
    id: 'm7',
    emoji: '🔮',
    title: 'Romper la Maldición',
    description: 'Desencriptar el hechizo antiguo que petrificó a los habitantes del valle sagrado.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm8',
    emoji: '📡',
    title: 'Transmitir el Auxilio',
    description: 'Encender la antena de radio central para alertar a la flota estelar en el sector.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm9',
    emoji: '🧩',
    title: 'Descifrar la Ecuación',
    description: 'Resolver el enigma matemático milenario que abrirá la cámara de secretos.',
    category: 'motivacion',
    genre: 'todos'
  },
  {
    id: 'm10',
    emoji: '⚖️',
    title: 'Exponer la Verdad',
    description: 'Revelar los documentos secretos robados ante el tribunal supremo de la metrópoli.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm11',
    emoji: '🌌',
    title: 'Cerrar la Grieta',
    description: 'Sellar la falla cósmica que está devorando los recuerdos de todos los habitantes.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm12',
    emoji: '🌿',
    title: 'Sanar el Árbol Madre',
    description: 'Llevar una gota de agua cristalina del abismo hasta las raíces del árbol ancestral.',
    category: 'motivacion',
    genre: 'fantasia'
  }
];

export default function StoryMachine() {
  const [activeTab, setActiveTab] = useState<'maquina' | 'neurociencia' | 'estructuras'>(() => {
    const saved = localStorage.getItem('sm_active_tab');
    return (saved === 'neurociencia' || saved === 'maquina' || saved === 'estructuras') ? saved : 'maquina';
  });

  // Reel states (Personaje: index 0, Entorno: index 18, Atmósfera: index 33, Motivación: index 45)
  const [reels, setReels] = useState({
    personaje: { current: ITEMS_POOL[0], locked: false, isSpinning: false },
    entorno: { current: ITEMS_POOL[18], locked: false, isSpinning: false },
    atmosfera: { current: ITEMS_POOL[33], locked: false, isSpinning: false },
    motivacion: { current: ITEMS_POOL[45], locked: false, isSpinning: false }
  });

  const [genreFilter, setGenreFilter] = useState<'todos' | 'fantasia' | 'scifi' | 'realismo'>('todos');
  const [isAnyReelSpinning, setIsAnyReelSpinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- NEUROSCIENCE PRESENTATION INTERACTIVE STATES ---
  const [neuroModule, setNeuroModule] = useState<'coupling' | 'chemistry' | 'memory' | 'classroom'>(() => {
    const saved = localStorage.getItem('sm_neuro_module');
    return (saved === 'coupling' || saved === 'chemistry' || saved === 'memory' || saved === 'classroom') ? saved : 'coupling';
  });
  
  // Estados interactivos para el Módulo de Arquitectura & Estructuras Neurolingüísticas
  const [activeStructure, setActiveStructure] = useState<'freytag' | 'hero' | 'abt'>('freytag');
  const [structureSubject, setStructureSubject] = useState<'matematicas' | 'ciencias' | 'historia' | 'crecimiento'>('matematicas');
  const [simulatedStructureStep, setSimulatedStructureStep] = useState<number>(0);
  
  // Advanced Coupling Module States
  const [couplingTone, setCouplingTone] = useState<number>(80);
  const [couplingEmotion, setCouplingEmotion] = useState<number>(75);
  const [couplingSensory, setCouplingSensory] = useState<number>(70);
  const [couplingExperimentTab, setCouplingExperimentTab] = useState<'uri' | 'espejo' | 'colectivo'>('uri');
  const [compareTeachingMode, setCompareTeachingMode] = useState<'tradicional' | 'narrativo'>('narrativo');

  const [activeMolecule, setActiveMolecule] = useState<'dopamina' | 'oxitocina' | 'cortisol' | 'endorfinas' | 'todos'>(() => {
    const saved = localStorage.getItem('sm_active_molecule');
    return (saved === 'dopamina' || saved === 'oxitocina' || saved === 'cortisol' || saved === 'endorfinas' || saved === 'todos') ? saved : 'dopamina';
  });
  const [memoryCase, setMemoryCase] = useState<'geometria' | 'biologia' | 'historia'>('geometria');
  const [selectedStrategy, setSelectedStrategy] = useState<number>(0);

  // Estados interactivos para las 4 Estrategias Neuroeducativas
  const [anchorSubject, setAnchorSubject] = useState<'matematicas' | 'historia' | 'ciencias' | 'literatura'>('matematicas');
  const [anchorSimulated, setAnchorSimulated] = useState<boolean>(false);
  const [anthropoConcept, setAntrhopoConcept] = useState<'sodio' | 'pitagoras' | 'gravedad'>('sodio');
  const [anthropoMode, setAntrhopoMode] = useState<'abstract' | 'character'>('character');
  const [coCreatorChoice, setCoCreatorChoice] = useState<'none' | 'formula' | 'narrativa'>('narrativa');
  const [disruptActive, setDisruptActive] = useState<boolean>(false);
  const [disruptType, setDisruptType] = useState<'experimento' | 'villano' | 'anomalia'>('experimento');

  // Modo Proyector / Pizarra Interactiva para Aulas
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  const toggleProjectorMode = () => {
    soundEffects.playClick();
    if (!isProjectorMode) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsProjectorMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsProjectorMode(false);
    }
  };

  // Guardar estado en localStorage para sobrevivir refrescos F5 de página
  useEffect(() => {
    localStorage.setItem('sm_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sm_neuro_module', neuroModule);
  }, [neuroModule]);

  useEffect(() => {
    localStorage.setItem('sm_active_molecule', activeMolecule);
  }, [activeMolecule]);

  // Guardar y restaurar la posición exacta de scroll vertical al refrescar (F5)
  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('sm_scroll_pos');
    if (savedScrollY) {
      const targetY = parseInt(savedScrollY, 10);
      setTimeout(() => {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }, 250);
    }

    const handleScroll = () => {
      sessionStorage.setItem('sm_scroll_pos', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthesizedSound = (type: 'spin' | 'stop' | 'success') => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        const playNote = (freq: number, startDelay: number, duration: number) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + startDelay);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteGain.gain.setValueAtTime(0.15, now + startDelay);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + startDelay + duration);
          noteOsc.start(now + startDelay);
          noteOsc.stop(now + startDelay + duration);
        };
        
        playNote(523.25, 0, 0.15); // C5
        playNote(659.25, 0.1, 0.15); // E5
        playNote(783.99, 0.2, 0.15); // G5
        playNote(1046.50, 0.3, 0.3); // C6
      }
    } catch (e) {
      console.warn('Audio not supported', e);
    }
  };

  const getFilteredItems = (category: 'personaje' | 'entorno' | 'atmosfera' | 'motivacion') => {
    return ITEMS_POOL.filter(item => {
      if (item.category !== category) return false;
      if (genreFilter === 'todos') return true;
      return item.genre === genreFilter || item.genre === 'todos';
    });
  };

  const toggleLock = (category: 'personaje' | 'entorno' | 'atmosfera' | 'motivacion') => {
    initAudio();
    playSynthesizedSound('spin');
    setReels(prev => ({
      ...prev,
      [category]: { ...prev[category], locked: !prev[category].locked }
    }));
  };

  const spinAll = () => {
    initAudio();
    const categories: ('personaje' | 'entorno' | 'atmosfera' | 'motivacion')[] = [
      'personaje', 'entorno', 'atmosfera', 'motivacion'
    ];

    const spinningCategories = categories.filter(cat => !reels[cat].locked);
    if (spinningCategories.length === 0) return;

    setIsAnyReelSpinning(true);
    setReels(prev => {
      const updated = { ...prev };
      categories.forEach(cat => {
        if (!prev[cat].locked) {
          updated[cat] = { ...prev[cat], isSpinning: true };
        }
      });
      return updated;
    });

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      if (tickCount < 15) {
        playSynthesizedSound('spin');
        tickCount++;
      } else {
        clearInterval(tickInterval);
      }
    }, 120);

    const intervals: { [key: string]: ReturnType<typeof setInterval> } = {};
    categories.forEach(cat => {
      if (!reels[cat].locked) {
        const pool = getFilteredItems(cat);
        intervals[cat] = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * pool.length);
          setReels(prev => ({
            ...prev,
            [cat]: { ...prev[cat], current: pool[randomIndex] }
          }));
        }, 80);
      }
    });

    const stopTimes = { personaje: 800, entorno: 1400, atmosfera: 2000, motivacion: 2600 };

    categories.forEach((cat, index) => {
      if (!reels[cat].locked) {
        setTimeout(() => {
          clearInterval(intervals[cat]);
          const pool = getFilteredItems(cat);
          const finalItem = pool[Math.floor(Math.random() * pool.length)];
          
          setReels(prev => ({
            ...prev,
            [cat]: { ...prev[cat], current: finalItem, isSpinning: false }
          }));

          playSynthesizedSound('stop');

          const remainingSpinning = spinningCategories.filter((_, idx) => idx > index);
          if (remainingSpinning.length === 0) {
            setIsAnyReelSpinning(false);
            setTimeout(() => {
              playSynthesizedSound('success');
            }, 100);
          }
        }, stopTimes[cat]);
      }
    });
  };

  const getCombinedPrompt = () => {
    const { personaje, entorno, atmosfera, motivacion } = reels;
    return `Un ${personaje.current.title} se encuentra en el ${entorno.current.title} rodeado por una atmósfera de ${atmosfera.current.title}. Su objetivo principal es ${motivacion.current.title}.`;
  };

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const copyToClipboard = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(getCombinedPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStoryPDF = async () => {
    soundEffects.playClick();
    setIsPdfGenerating(true);
    try {
      const { personaje, entorno, atmosfera, motivacion } = reels;
      await generateStoryWorksheetPDF({
        title: `La Odisea del ${personaje.current.title}`,
        genre: (personaje.current.genre || 'Fantasía').toUpperCase(),
        character: { name: personaje.current.title, desc: personaje.current.description, emoji: personaje.current.emoji },
        environment: { name: entorno.current.title, desc: entorno.current.description, emoji: entorno.current.emoji },
        atmosphere: { name: atmosfera.current.title, desc: atmosfera.current.description, emoji: atmosfera.current.emoji },
        motivation: { name: motivacion.current.title, desc: motivacion.current.description, emoji: motivacion.current.emoji },
        generatedStoryText: getCombinedPrompt()
      });
      soundEffects.playSuccessFanfare();
    } catch (err) {
      console.error('Error generating story PDF:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const renderStructuresContent = () => (
    <div className="neuro-card animate-fade-in">
      <div className="neuro-card-header">
        <span className="n-tag tag-purple">📐 Algoritmo de Modulación Cerebral</span>
        <h2>Arquitectura Formal y Estructuras Neurolingüísticas del Cuento</h2>
        <p>
          La eficacia de un cuento no radica en su estética, sino en cómo su arquitectura formal actúa como un algoritmo que administra el estrés atencional, manipula la "brecha de curiosidad" y gestiona errores de predicción alineados con las leyes neurobiológicas de la percepción.
        </p>
      </div>

      {/* 3 PILARES INNEGOCIABLES */}
      <div className="pilares-banner-container">
        <span className="pilares-title">📌 Los 3 Pilares Innegociables de la Estructura Efectiva:</span>
        <div className="pilares-grid">
          <div className="pilar-card pilar-emerald">
            <span className="pilar-num">01</span>
            <h4>🟢 Base Semántica Clara</h4>
            <p>Construye el contexto inicial y establece el acoplamiento neuronal con la audiencia.</p>
          </div>
          <div className="pilar-card pilar-red">
            <span className="pilar-num">02</span>
            <h4>🔴 Conflicto Deliberado</h4>
            <p>Rompe la homeostasis, elevando picos de Cortisol (atención) y Oxitocina (empatía).</p>
          </div>
          <div className="pilar-card pilar-gold">
            <span className="pilar-num">03</span>
            <h4>🟡 Resolución Clara</h4>
            <p>Satisface la brecha de curiosidad y fija el aprendizaje con el circuito de Dopamina.</p>
          </div>
        </div>
      </div>

      {/* SIMULADOR INTERACTIVO DE LAS 3 MEJORES ESTRUCTURAS NEUROLINGÜÍSTICAS */}
      <div className="structures-interactive-box">
        <div className="structures-selector-tabs">
          <button
            className={`struct-tab-btn ${activeStructure === 'freytag' ? 'active' : ''}`}
            onClick={() => {
              setActiveStructure('freytag');
              setSimulatedStructureStep(0);
            }}
          >
            ⛰️ Pirámide de Freytag (Arco Clásico)
          </button>
          <button
            className={`struct-tab-btn ${activeStructure === 'hero' ? 'active' : ''}`}
            onClick={() => {
              setActiveStructure('hero');
              setSimulatedStructureStep(0);
            }}
          >
            🌌 El Viaje del Héroe (Monomito)
          </button>
          <button
            className={`struct-tab-btn ${activeStructure === 'abt' ? 'active' : ''}`}
            onClick={() => {
              setActiveStructure('abt');
              setSimulatedStructureStep(0);
            }}
          >
            ⚡ Estructura ABT (Y, Pero, Por lo Tanto)
          </button>
        </div>

        {/* ESTRUCTURA 1: PIRÁMIDE DE FREYTAG */}
        {activeStructure === 'freytag' && (
          <div className="struct-detail-panel animate-fade-in">
            <div className="struct-header-info">
              <div className="struct-badge-row">
                <span className="struct-badge bg-purple">Modelo Canónico Neuroendocrino</span>
                <span className="struct-badge bg-gold">Sincronía Cerebral Alta</span>
              </div>
              <h3>⛰️ La Pirámide de Freytag (El Arco Dramático Clásico)</h3>
              <p>
                Construye un incremento progresivo de la tensión (acción ascendente) que evita la caída de cortisol, alcanza un clímax que satura la atención y la oxitocina, y culmina con un desenlace dopaminérgico que fija la lección en la memoria a largo plazo.
              </p>
            </div>

            {/* SVG DIAGRAMA DE FREYTAG INTERACTIVO DE ALTA LEGIBILIDAD */}
            <div className="struct-svg-container">
              <svg viewBox="0 0 800 290" className="struct-svg">
                <defs>
                  <linearGradient id="freytagGradMaster" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="35%" stopColor="#fbbf24" />
                    <stop offset="60%" stopColor="#ff007f" />
                    <stop offset="85%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#fde047" />
                  </linearGradient>
                  <filter id="svgGlowMaster" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* LÍNEA GUÍA BASE */}
                <line x1="40" y1="240" x2="760" y2="240" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="760" y="258" textAnchor="end" fill="rgba(255, 255, 255, 0.45)" fontSize="11" fontWeight="700">Tiempo del Relato ➔</text>

                {/* CURVA BEZIER DE TENSIÓN */}
                <path 
                  d="M 60,230 C 160,230 200,160 250,160 C 320,160 360,50 400,50 C 440,50 480,160 550,160 C 620,160 670,230 740,230" 
                  fill="none" 
                  stroke="url(#freytagGradMaster)" 
                  strokeWidth="5" 
                  filter="url(#svgGlowMaster)"
                />

                {/* NODOS CON PÍLDORAS DE FONDO Y ALTA LEGIBILIDAD */}
                {[
                  { cx: 60, cy: 230, label: '1. Incitación', desc: 'Base Semántica', color: '#38bdf8', bg: 'rgba(14, 116, 144, 0.95)', rectW: 115, textY: -24, descY: 30 },
                  { cx: 250, cy: 160, label: '2. Acción Ascendente', desc: '↑ Cortisol (Atención)', color: '#fbbf24', bg: 'rgba(180, 83, 9, 0.95)', rectW: 145, textY: -24, descY: 30 },
                  { cx: 400, cy: 50, label: '3. Clímax Dramático', desc: '↑ Oxitocina + Alerta', color: '#ff007f', bg: 'rgba(190, 24, 93, 0.95)', rectW: 150, textY: -26, descY: 30 },
                  { cx: 550, cy: 160, label: '4. Acción Descendente', desc: 'Descompresión', color: '#c084fc', bg: 'rgba(109, 40, 217, 0.95)', rectW: 150, textY: -24, descY: 30 },
                  { cx: 740, cy: 230, label: '5. Desenlace', desc: '↑ Dopamina & Cierre', color: '#fde047', bg: 'rgba(161, 98, 7, 0.95)', rectW: 130, textY: -24, descY: 30 }
                ].map((pt, i) => {
                  const isSelected = simulatedStructureStep === i;
                  return (
                    <g key={i} className="struct-node-group" onClick={() => setSimulatedStructureStep(i)} style={{ cursor: 'pointer' }}>
                      {/* PÍLDORA PRINCIPAL DE TÍTULO */}
                      <rect 
                        x={pt.cx - pt.rectW / 2} 
                        y={pt.cy + pt.textY - 14} 
                        width={pt.rectW} 
                        height="22" 
                        rx="11" 
                        fill={pt.bg} 
                        stroke={pt.color} 
                        strokeWidth="1.5" 
                      />
                      <text x={pt.cx} y={pt.cy + pt.textY + 2} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="'Inter', sans-serif">
                        {pt.label}
                      </text>

                      {/* PÍLDORA SECUNDARIA (DESCRIPCIÓN BIO-QUÍMICA) */}
                      <rect 
                        x={pt.cx - (pt.rectW - 8) / 2} 
                        y={pt.cy + pt.descY - 14} 
                        width={pt.rectW - 8} 
                        height="20" 
                        rx="10" 
                        fill="rgba(15, 23, 42, 0.95)" 
                        stroke={pt.color} 
                        strokeWidth="1" 
                      />
                      <text x={pt.cx} y={pt.cy + pt.descY} textAnchor="middle" fill={pt.color} fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">
                        {pt.desc}
                      </text>

                      {/* ANILLO PULSANTE SI SELECCIONADO */}
                      {isSelected && (
                        <circle cx={pt.cx} cy={pt.cy} r="18" fill="none" stroke={pt.color} strokeWidth="2.5" className="gland-pulse-ring" />
                      )}
                      
                      {/* NODO CIRCULAR */}
                      <circle 
                        cx={pt.cx} 
                        cy={pt.cy} 
                        r={isSelected ? 11 : 8} 
                        fill={isSelected ? '#ffffff' : pt.color} 
                        stroke={pt.color} 
                        strokeWidth={isSelected ? '4' : '2'} 
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* EJEMPLO CIENTÍFICO SIMULADO */}
            <div className="struct-example-box">
              <div className="ex-subject-row">
                <span className="ex-label">💡 Ejemplo de Aplicación Didáctica en Freytag:</span>
                <div className="ex-btns">
                  {[
                    { id: 'matematicas', label: '📐 Matemáticas' },
                    { id: 'ciencias', label: '🧪 Ciencias' },
                    { id: 'historia', label: '📜 Historia' },
                    { id: 'crecimiento', label: '🌱 Crecimiento' }
                  ].map(s => (
                    <button
                      key={s.id}
                      className={`ex-btn ${structureSubject === s.id ? 'active' : ''}`}
                      onClick={() => setStructureSubject(s.id as 'matematicas' | 'ciencias' | 'historia' | 'crecimiento')}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="freytag-steps-grid">
                {structureSubject === 'matematicas' && [
                  { phase: '📍 Paso 1: Incitación', text: 'El joven astrónomo descubre que los satélites se están descalibrando.' },
                  { phase: '📍 Paso 2: Acción Ascendente', text: 'Los errores se acumulan; si no calcula la parábola exacta, la estación colisionará.' },
                  { phase: '📍 Paso 3: Clímax', text: '¡Faltan 10 segundos! Resuelve la ecuación cuadrática en la pantalla a ciegas.' },
                  { phase: '📍 Paso 4: Acción Descendente', text: 'Los propulsores responden en el último segundo y la órbita se estabiliza.' },
                  { phase: '📍 Paso 5: Desenlace', text: 'El equipo celebra. Los alumnos asimilan el uso práctico de la fórmula.' }
                ].map((st, i) => (
                  <div key={i} className={`step-card ${simulatedStructureStep === i ? 'highlight' : ''}`} onClick={() => setSimulatedStructureStep(i)}>
                    <span className="step-phase">{st.phase}</span>
                    <p className="step-text">{st.text}</p>
                  </div>
                ))}

                {structureSubject === 'ciencias' && [
                  { phase: '📍 Paso 1: Incitación', text: 'Un bosque de pinos empieza a perder hojas verdes sin causa aparente.' },
                  { phase: '📍 Paso 2: Acción Ascendente', text: 'La botánica analiza el suelo y descubre un virus microscópico mutante.' },
                  { phase: '📍 Paso 3: Clímax', text: 'Sintetiza la enzima en el laboratorio mientras la temperatura del tubo roza el límite.' },
                  { phase: '📍 Paso 4: Acción Descendente', text: 'La enzima neutraliza el virus y las plantas vuelven a sintetizar clorofila.' },
                  { phase: '📍 Paso 5: Desenlace', text: 'Se fija el concepto de fotosíntesis y enzimas en la memoria a largo plazo.' }
                ].map((st, i) => (
                  <div key={i} className={`step-card ${simulatedStructureStep === i ? 'highlight' : ''}`} onClick={() => setSimulatedStructureStep(i)}>
                    <span className="step-phase">{st.phase}</span>
                    <p className="step-text">{st.text}</p>
                  </div>
                ))}

                {structureSubject === 'historia' && [
                  { phase: '📍 Paso 1: Incitación', text: 'Un mensajero corre de noche con una carta que define el fin de la guerra.' },
                  { phase: '📍 Paso 2: Acción Ascendente', text: 'Es interceptado en la frontera; debe descifrar el código cifrado para pasar.' },
                  { phase: '📍 Paso 3: Clímax', text: 'Encuentra la clave oculta usando el patrón numérico de la fecha histórica.' },
                  { phase: '📍 Paso 4: Acción Descendente', text: 'Entrega el mensaje y el tratado de paz es firmado al amanecer.' },
                  { phase: '📍 Paso 5: Desenlace', text: 'Los estudiantes recuerdan la fecha y los líderes del hecho sin memorizar de memoria.' }
                ].map((st, i) => (
                  <div key={i} className={`step-card ${simulatedStructureStep === i ? 'highlight' : ''}`} onClick={() => setSimulatedStructureStep(i)}>
                    <span className="step-phase">{st.phase}</span>
                    <p className="step-text">{st.text}</p>
                  </div>
                ))}

                {structureSubject === 'crecimiento' && [
                  { phase: '📍 Paso 1: Incitación', text: 'Una joven atleta teme hablar en público en el certamen escolar.' },
                  { phase: '📍 Paso 2: Acción Ascendente', text: 'Le toca subir al escenario y olvida la primera tarjeta de su discurso.' },
                  { phase: '📍 Paso 3: Clímax', text: 'Respira hondo, usa la técnica de visualización y habla desde la experiencia real.' },
                  { phase: '📍 Paso 4: Acción Descendente', text: 'El público rompe en aplausos y comprende la importancia de la resiliencia.' },
                  { phase: '📍 Paso 5: Desenlace', text: 'Se consolida la confianza interna y la empatía colectiva en el aula.' }
                ].map((st, i) => (
                  <div key={i} className={`step-card ${simulatedStructureStep === i ? 'highlight' : ''}`} onClick={() => setSimulatedStructureStep(i)}>
                    <span className="step-phase">{st.phase}</span>
                    <p className="step-text">{st.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ESTRUCTURA 2: EL VIAJE DEL HÉROE */}
        {activeStructure === 'hero' && (
          <div className="struct-detail-panel animate-fade-in">
            <div className="struct-header-info">
              <div className="struct-badge-row">
                <span className="struct-badge bg-cyan">Circuito Neuroevolutivo de Supervivencia</span>
                <span className="struct-badge bg-blue">Teoría de la Mente & Hipervigilancia</span>
              </div>
              <h3>🌌 El Viaje del Héroe (Monomito Neuroevolutivo)</h3>
              <p>
                Al desplazar al protagonista desde su mundo ordinario conocido hacia un territorio desconocido y amenazante, se activan fuertemente los sistemas de hipervigilancia del receptor. Genera un acoplamiento profundo en las redes cerebrales de la "Teoría de la Mente" y facilita la reconfiguración de esquemas mentales preexistentes.
              </p>
            </div>

            <div className="hero-stages-container">
              {[
                { num: 'I', title: '🏡 Mundo Ordinario', desc: 'Estado inicial de comodidad. Establece la base semántica y acoplamiento inicial.' },
                { num: 'II', title: '🚨 Llamado a la Aventura', desc: 'Se rompe la homeostasis. Liberación inicial de Cortisol y curiosidad.' },
                { num: 'III', title: '🌌 Cruzar el Umbral Desconocido', desc: 'Entrada al territorio amenazante. Hipervigilancia y atención focalizada.' },
                { num: 'IV', title: '🐉 La Ordalía (Prueba Máxima)', desc: 'Clímax del conflicto. Saturación de Oxitocina y transporte narrativo.' },
                { num: 'V', title: '🏆 Elixir & Retorno Transformado', desc: 'Resolución. Liberación masiva de Dopamina y fijación de aprendizaje.' }
              ].map((stg, i) => (
                <div key={i} className="hero-stage-card">
                  <span className="stage-num">{stg.num}</span>
                  <h4>{stg.title}</h4>
                  <p>{stg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ESTRUCTURA 3: ESTRUCTURA ABT (AND, BUT, THEREFORE) */}
        {activeStructure === 'abt' && (
          <div className="struct-detail-panel animate-fade-in">
            <div className="struct-header-info">
              <div className="struct-badge-row">
                <span className="struct-badge bg-emerald">Plantilla Minimalista Ultra-Eficiente</span>
                <span className="struct-badge bg-rose">Error de Predicción Explícito</span>
              </div>
              <h3>⚡ La Estructura ABT (And, But, Therefore / Y, Pero, Por lo Tanto)</h3>
              <p>
                Es la plantilla neurolingüística de mayor impacto para formatos breves y micro-lecciones. El "Y" construye el contexto; el "Pero" actúa como un error de predicción explícito que genera un pico instantáneo de cortisol y reorienta la atención; el "Por lo tanto" satisface la necesidad de resolución liberando dopamina.
              </p>
            </div>

            <div className="abt-diagram-grid">
              <div className="abt-block abt-and">
                <div className="abt-header">
                  <span className="abt-letter">Y</span>
                  <span className="abt-word">AND (Contexto)</span>
                </div>
                <p>Establece la base semántica inicial y acuerda el punto de partida con el oyente.</p>
                <span className="abt-neuromark">🧠 Acoplamiento Neuronal</span>
              </div>

              <div className="abt-block abt-but">
                <div className="abt-header">
                  <span className="abt-letter">PERO</span>
                  <span className="abt-word">BUT (Sorpresa / Conflicto)</span>
                </div>
                <p>Introduce un error de predicción inesperado que rompe lo predecible.</p>
                <span className="abt-neuromark">⚡ Pico de Cortisol & Atención</span>
              </div>

              <div className="abt-block abt-therefore">
                <div className="abt-header">
                  <span className="abt-letter">POR LO TANTO</span>
                  <span className="abt-word">THEREFORE (Resolución)</span>
                </div>
                <p>Cierra la brecha de curiosidad proporcionando la solución lógica y clara.</p>
                <span className="abt-neuromark">✨ Descarga de Dopamina</span>
              </div>
            </div>

            <div className="abt-formula-box">
              <span className="formula-title">🧪 Fórmula ABT Aplicada en el Aula:</span>
              <p className="formula-text">
                "Los estudiantes entendían la teoría atómica <strong>[Y]</strong> sabían dibujar los electrones en la libreta, <strong>[PERO]</strong> al mezclar los reactivos la solución cambió de color inesperadamente, <strong>[POR LO TANTO]</strong> descubrieron la regla de valencia en la práctica."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`sm-container animate-fade-in ${isProjectorMode ? 'projector-mode' : ''}`}>
      
      {/* NAVEGACIÓN SUPERIOR DE MÓDULOS PRINCIPALES */}
      <nav className="sm-main-nav">
        <button 
          className={`sm-nav-btn ${activeTab === 'maquina' ? 'active' : ''}`}
          onClick={() => setActiveTab('maquina')}
        >
          🎰 Máquina Generadora de Cuentos
        </button>
        <button 
          className={`sm-nav-btn ${activeTab === 'neurociencia' ? 'active' : ''}`}
          onClick={() => setActiveTab('neurociencia')}
        >
          🧠 Neurociencia & Cuentos en el Aula
        </button>
        <button 
          className={`sm-nav-btn ${activeTab === 'estructuras' ? 'active' : ''}`}
          onClick={() => setActiveTab('estructuras')}
        >
          📐 Arquitectura & Estructuras del Cuento
        </button>
        <button
          className={`sm-nav-btn sm-projector-btn ${isProjectorMode ? 'active' : ''}`}
          onClick={toggleProjectorMode}
          title={isProjectorMode ? 'Salir de Modo Proyector' : 'Activar Modo Proyector / Pizarra Interactiva'}
        >
          {isProjectorMode ? '🖥️ Salir de Proyector' : '📺 Modo Proyector Aula'}
        </button>
      </nav>

      {/* =========================================================
          SECCIÓN 1: MÁQUINA GENERADORA DE CUENTOS (JACKPOT)
         ========================================================= */}
      {activeTab === 'maquina' && (
        <div className="animate-fade-in">
          <header className="sm-header">
            <h1 className="sm-title">🎰 Máquina de Cuentos</h1>
            <p className="sm-subtitle">
              Gira los carretes para obtener elementos aleatorios e inspirar historias fantásticas en tu taller creativo.
            </p>
          </header>

          {/* Grid of Reels */}
          <div className="sm-jackpot-grid">
            {(['personaje', 'entorno', 'atmosfera', 'motivacion'] as const).map(cat => {
              const reel = reels[cat];
              return (
                <div 
                  key={cat} 
                  className={`sm-reel-card category-${cat} ${reel.locked ? 'locked' : ''}`}
                >
                  <div className="sm-category-label">{cat}</div>
                  
                  <div className={`sm-reel-viewport ${reel.isSpinning ? 'spinning' : ''}`}>
                    <div className="sm-reel-strip">
                      <div className="sm-reel-item">
                        <span className="sm-item-emoji" role="img" aria-label={reel.current.title}>
                          {reel.current.emoji}
                        </span>
                        <h3 className="sm-item-title">{reel.current.title}</h3>
                        <p className="sm-item-description">{reel.current.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm-card-controls">
                    <button 
                      onClick={() => toggleLock(cat)}
                      disabled={isAnyReelSpinning}
                      className={`sm-lock-btn ${reel.locked ? 'locked' : ''}`}
                    >
                      {reel.locked ? '🔒 Bloqueado' : '🔓 Bloquear'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Controls */}
          <div className="sm-controls-panel">
            <div className="sm-main-buttons">
              <button 
                className="sm-spin-btn" 
                onClick={spinAll}
                disabled={isAnyReelSpinning}
              >
                {isAnyReelSpinning ? '⚡ Girando...' : '🎰 ¡GIRAR CARRETES!'}
              </button>
            </div>

            <div className="sm-options-row">
              <div className="sm-option-group">
                <label htmlFor="genre-select">🎭 Género Literario:</label>
                <select 
                  id="genre-select"
                  className="sm-select"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value as 'todos' | 'fantasia' | 'scifi' | 'realismo')}
                  disabled={isAnyReelSpinning}
                >
                  <option value="todos">Todos los Géneros</option>
                  <option value="fantasia">Fantasía / Magia</option>
                  <option value="scifi">Ciencia Ficción / Cyberpunk</option>
                  <option value="realismo">Realismo Mágico / Urbano</option>
                </select>
              </div>

              <div className="sm-option-group">
                <label htmlFor="sound-toggle">🔊 Sonido Sintetizado:</label>
                <button 
                  id="sound-toggle"
                  className="sm-secondary-btn"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{ padding: '0.4rem 1rem', borderRadius: '10px' }}
                >
                  {soundEnabled ? '🔊 Sí' : '🔇 Silencio'}
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Result Panel */}
          {!isAnyReelSpinning && (
            <div className="sm-prompt-box animate-zoom-in">
              <div className="sm-prompt-title">
                <span>💡 Reto Creativo Generado</span>
              </div>
              
              <p className="sm-prompt-text">
                "{getCombinedPrompt()}"
              </p>

              <div className="sm-guiding-questions">
                <h4>Preguntas detonadoras para guiar tu historia:</h4>
                <ul>
                  <li>¿Qué motiva al <strong>{reels.personaje.current.title}</strong> a actuar inmediatamente bajo esta atmósfera?</li>
                  <li>¿Cómo afecta el entorno del <strong>{reels.entorno.current.title}</strong> al cumplimiento de su meta?</li>
                  <li>¿Qué obstáculo inesperado surge debido a la atmósfera de <strong>{reels.atmosfera.current.title}</strong>?</li>
                </ul>
              </div>

              <div className="sm-prompt-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="sm-spin-btn" onClick={copyToClipboard} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                  {copied ? '✅ ¡Copiado!' : '📋 Copiar Prompt'}
                </button>
                <button 
                  className="sm-spin-btn" 
                  onClick={handleDownloadStoryPDF}
                  disabled={isPdfGenerating}
                  style={{ 
                    fontSize: '1rem', 
                    padding: '0.75rem 2rem', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {isPdfGenerating ? '⏳ Generando PDF...' : '📄 Descargar Manuscrito en PDF'}
                </button>
              </div>
            </div>
          )}

          <div className="sm-info-banner">
            💡 <strong>Evidencia Científica:</strong> La anticipación táctil y auditiva (efecto jackpot) enfoca la atención de los participantes, mientras que la recompensa variable estimula la resolución creativa de problemas y activa el flujo narrativo de forma espontánea.
          </div>
        </div>
      )}

      {/* =========================================================
          SECCIÓN 2: PRESENTACIÓN INTERACTIVA DE NEUROCIENCIA
         ========================================================= */}
      {activeTab === 'neurociencia' && (
        <div className="neuro-presentation-wrapper animate-fade-in">
          
          {/* HEADER DE LA PRESENTACIÓN */}
          <header className="neuro-header">
            <span className="neuro-badge">🧪 EVIDENCIA CIENTÍFICA & NARRATIVA EDUCATIVA</span>
            <h1 className="neuro-title">¿Cómo Beneficia la Neurociencia el Uso de Cuentos en Clase?</h1>
            <p className="neuro-subtitle">
              Basado en el cuaderno de investigación <em>"Cuentos y Ciencia"</em>. Descubre cómo las historias transforman la arquitectura cerebral, liberan neurotransmisores clave y fijan el aprendizaje duradero.
            </p>

            {/* PESTAÑAS SUB-MÓDULOS DE NEUROCIENCIA */}
            <div className="neuro-sub-tabs">
              <button 
                className={`neuro-sub-btn ${neuroModule === 'coupling' ? 'active' : ''}`}
                onClick={() => setNeuroModule('coupling')}
              >
                ⚡ Acoplamiento Neuronal
              </button>
              <button 
                className={`neuro-sub-btn ${neuroModule === 'chemistry' ? 'active' : ''}`}
                onClick={() => setNeuroModule('chemistry')}
              >
                🧪 El Cóctel Químico
              </button>
              <button 
                className={`neuro-sub-btn ${neuroModule === 'memory' ? 'active' : ''}`}
                onClick={() => setNeuroModule('memory')}
              >
                🧠 Memoria Episódica vs Semántica
              </button>
              <button 
                className={`neuro-sub-btn ${neuroModule === 'classroom' ? 'active' : ''}`}
                onClick={() => setNeuroModule('classroom')}
              >
                🏫 Estrategias Neuroeducativas
              </button>
            </div>
          </header>

          {/* MÓDULO 1: ACOPLAMIENTO NEURONAL & ESPEJO */}
          {neuroModule === 'coupling' && (() => {
            const globalCouplingIndex = Math.round((couplingTone * 0.3) + (couplingEmotion * 0.4) + (couplingSensory * 0.3));
            
            const activeAreasCount = [
              couplingTone > 30, // Córtex Auditivo
              couplingSensory > 35, // Córtex Somatosensorial
              couplingSensory > 55, // Córtex Motor (Neuronas Espejo)
              couplingEmotion > 40, // Amígdala y Límbico
              couplingSensory > 60, // Córtex Visual Secundario
              couplingEmotion > 70, // Córtex Prefrontal (Teoría de la Mente)
              globalCouplingIndex > 65 // Hipocampo (Memoria a Largo Plazo)
            ].filter(Boolean).length;

            return (
              <div className="neuro-card animate-fade-in">
                <div className="neuro-card-header">
                  <span className="n-tag tag-purple">⚡ Sincronización Intercerebral (Brain-to-Brain Sync)</span>
                  <h2>Acoplamiento Neuronal (Neural Coupling) & Neuronas Espejo</h2>
                  <p>
                    Descubierto en laboratorios de neuroimagen (Uri Hasson, Princeton), el <strong>Acoplamiento Neuronal</strong> demuestra que cuando un narrador relata una historia rica en matices, <strong>los cerebros de los estudiantes acoplan sus frecuencias de ondas (Alfa y Theta) de forma casi idéntica a la frecuencia cerebral del emisor</strong> con solo milisegundos de desfase.
                  </p>
                </div>

                {/* SIMULADOR MULTI-FACTORIAL INTERACTIVO */}
                <div className="neuro-sim-box">
                  <div className="sim-title-group">
                    <h3>🎛️ Simulador Multi-Factorial de Sincronización Cerebral</h3>
                    <span className="sim-badge-live">⚡ Simulación fMRI en Tiempo Real</span>
                  </div>
                  <p className="sim-instruction">Ajusta los 3 pilares del relato para medir cómo se encienden los circuitos cerebrales en red:</p>

                  <div className="sim-sliders-grid">
                    <div className="sim-slider-card">
                      <label>🗣️ Ritmo & Modulación Vocal: <strong>{couplingTone}%</strong></label>
                      <input 
                        type="range" min="10" max="100" value={couplingTone}
                        onChange={(e) => setCouplingTone(parseInt(e.target.value))}
                        className="neuro-slider slider-purple"
                      />
                      <span className="slider-hint">Regula el volumen, pausas dramáticas y entonación.</span>
                    </div>

                    <div className="sim-slider-card">
                      <label>🎭 Carga Emocional & Suspenso: <strong>{couplingEmotion}%</strong></label>
                      <input 
                        type="range" min="10" max="100" value={couplingEmotion}
                        onChange={(e) => setCouplingEmotion(parseInt(e.target.value))}
                        className="neuro-slider slider-pink"
                      />
                      <span className="slider-hint">Desencadena liberación de oxitocina y empatía.</span>
                    </div>

                    <div className="sim-slider-card">
                      <label>🌿 Detalles Sensoriales & Tacto: <strong>{couplingSensory}%</strong></label>
                      <input 
                        type="range" min="10" max="100" value={couplingSensory}
                        onChange={(e) => setCouplingSensory(parseInt(e.target.value))}
                        className="neuro-slider slider-cyan"
                      />
                      <span className="slider-hint">Activa neuronas espejo motoras y táctiles.</span>
                    </div>
                  </div>

                  {/* VISUALIZADOR SVG CEREBROS CONECTADOS Y ONDAS CIENTÍFICAS A GRAN ESCALA */}
                  {(() => {
                    // 1. ONDA DE AUDIO (Acoustic Pressure Spectrum Waveform): Picos armónicos de sonograma
                    const audioAmp = Math.round(6 + (couplingTone * 0.42));
                    const audioPathD = `
                      M 280,75 
                      L 305,${75 - audioAmp} L 330,${75 + audioAmp * 0.8} L 355,${75 - audioAmp * 1.5} L 380,${75 + audioAmp * 1.1} 
                      L 405,${75 - audioAmp * 1.9} L 430,${75 + audioAmp * 1.4} L 455,${75 - audioAmp * 2.2} L 480,${75 + audioAmp * 1.6} 
                      L 505,${75 - audioAmp * 1.8} L 530,${75 + audioAmp * 1.2} L 555,${75 - audioAmp * 0.7} L 580,${75 + audioAmp * 0.9} L 600,75
                    `;

                    // 2. ONDA EMOCIONAL (ECG / Smooth Fluid Surge): Respuesta galvánica y curva de suspenso
                    const emoAmp = Math.round(8 + (couplingEmotion * 0.52));
                    const emoPathD1 = `M 280,140 C 350,${140 - emoAmp * 2.2}, 430,${140 + emoAmp * 2.2}, 520,${140 - emoAmp * 1.6} S 570,${140 + emoAmp * 0.8}, 600,140`;
                    const emoPathD2 = `M 280,140 C 350,${140 + emoAmp * 1.8}, 450,${140 - emoAmp * 2.0}, 600,140`;

                    // 3. ONDA CEREBRAL EEG (Electroencefalograma - Synaptic Spikes & Oscillations):
                    const eegAmp = Math.round(6 + (couplingSensory * 0.42));
                    const eegPathD = `
                      M 280,205 
                      Q 300,${205 - eegAmp * 1.6} 320,205 
                      T 360,${205 + eegAmp * 2.2} 400,205 
                      T 440,${205 - eegAmp * 2.4} 480,205 
                      T 520,${205 + eegAmp * 2.0} 560,205 T 600,205
                    `;

                    // CÁLCULOS DE TAMAÑO HIPER-LEGIBLES PARA ESFERAS (Mínimo ~15px, Máximo ~54px)
                    const rAudio = Math.round(14 + (couplingTone * 0.28));
                    const rAudioHalo = Math.round(20 + (couplingTone * 0.38));
                    
                    const rEmo = Math.round(16 + (couplingEmotion * 0.32));
                    const rEmoHalo = Math.round(22 + (couplingEmotion * 0.44));

                    const rSens = Math.round(14 + (couplingSensory * 0.28));
                    const rSensHalo = Math.round(20 + (couplingSensory * 0.38));

                    const rMotor = Math.round(12 + (couplingSensory * 0.24));
                    const rMotorHalo = Math.round(18 + (couplingSensory * 0.34));

                    const rVisual = Math.round(12 + (couplingSensory * 0.24));
                    const rVisualHalo = Math.round(18 + (couplingSensory * 0.34));

                    const rCore = Math.round(18 + (globalCouplingIndex * 0.36));
                    const rCoreHalo = Math.round(26 + (globalCouplingIndex * 0.50));

                    return (
                      <>
                        <div className="brains-svg-container">
                          <svg viewBox="0 0 880 340" className="brains-svg">
                            <defs>
                              <filter id="glowAggressive" x="-40%" y="-40%" width="180%" height="180%">
                                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>

                              <linearGradient id="waveAudioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="50%" stopColor="#c084fc" />
                                <stop offset="100%" stopColor="#e9d5ff" />
                              </linearGradient>

                              <linearGradient id="waveEmoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ff007f" />
                                <stop offset="50%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#f472b6" />
                              </linearGradient>

                              <linearGradient id="waveEegGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#00f0ff" />
                                <stop offset="50%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#4ade80" />
                              </linearGradient>
                            </defs>

                            {/* CEREBRO NARRADOR (ESCALA 260x260px) */}
                            <g transform="translate(20, 20)">
                              <rect x="10" y="10" width="240" height="240" rx="120" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" strokeWidth="3" />
                              
                              {/* Vías Sinápticas Internas */}
                              <path d="M 60,65 L 130,120 L 200,65 M 100,180 L 130,120 L 200,170 M 130,55 L 130,120" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="2" strokeDasharray="4 4" />

                              {/* NODO AUDITIVO */}
                              <circle cx="60" cy="65" r={rAudioHalo} fill="#a855f7" opacity={(couplingTone / 100) * 0.4} filter="url(#glowAggressive)" />
                              <circle cx="60" cy="65" r={rAudio} fill="#c084fc" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="60" y="69" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">🎧 AUDITIVO</text>
                              <text x="60" y="83" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingTone}%</text>

                              {/* NODO SENSORIAL */}
                              <circle cx="200" cy="65" r={rSensHalo} fill="#00f0ff" opacity={(couplingSensory / 100) * 0.4} filter="url(#glowAggressive)" />
                              <circle cx="200" cy="65" r={rSens} fill="#38bdf8" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="200" y="69" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">🖐️ SENSORIAL</text>
                              <text x="200" y="83" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingSensory}%</text>

                              {/* NODO MOTOR */}
                              <circle cx="130" cy="55" r={rMotorHalo} fill="#4ade80" opacity={(couplingSensory / 100) * 0.35} filter="url(#glowAggressive)" />
                              <circle cx="130" cy="55" r={rMotor} fill="#4ade80" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="1.5" />
                              <text x="130" y="59" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">🏃 MOTOR</text>

                              {/* NODO LÍMBICO */}
                              <circle cx="100" cy="180" r={rEmoHalo} fill="#ff007f" opacity={(couplingEmotion / 100) * 0.45} filter="url(#glowAggressive)" />
                              <circle cx="100" cy="180" r={rEmo} fill="#ff007f" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="100" y="184" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">❤️ LÍMBICO</text>
                              <text x="100" y="198" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingEmotion}%</text>

                              {/* NODO VISUAL 3D */}
                              <circle cx="200" cy="170" r={rVisualHalo} fill="#f59e0b" opacity={(couplingSensory / 100) * 0.35} filter="url(#glowAggressive)" />
                              <circle cx="200" cy="170" r={rVisual} fill="#fbbf24" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="1.5" />
                              <text x="200" y="174" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">👁️ VISUAL</text>

                              {/* NODO CORE (HIPOCAMPO NÚCLEO CENTRAL) */}
                              <circle cx="130" cy="120" r={rCoreHalo} fill="#ffd700" opacity={(globalCouplingIndex / 100) * 0.5} filter="url(#glowAggressive)" />
                              <circle cx="130" cy="120" r={rCore} fill="#ffd700" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2.5" />
                              <text x="130" y="124" fill="#000" fontSize="13" fontWeight="900" textAnchor="middle">🧠 HIPOCAMPO</text>
                              <text x="130" y="139" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">{globalCouplingIndex}%</text>

                              <text x="130" y="278" fill="#c084fc" fontSize="15" fontWeight="900" textAnchor="middle">Cerebro Narrador (Docente)</text>
                            </g>

                            {/* ONDAS CANALIZADAS CIENTÍFICAS */}
                            <g fill="none" strokeLinecap="round">
                              {/* ONDA 1: AUDIO (Oscilograma Acústico) */}
                              <path 
                                d={audioPathD} 
                                stroke="url(#waveAudioGrad)" 
                                strokeWidth={3.5 + (couplingTone * 0.03)}
                                className="animated-audio-wave"
                                filter="url(#glowAggressive)"
                                style={{ animationDuration: `${Math.max(0.35, 1.8 - (couplingTone * 0.015))}s` }}
                              />

                              {/* ONDA 2: EMOCIONAL (ECG / Fluid Surge) */}
                              <path 
                                d={emoPathD1} 
                                stroke="url(#waveEmoGrad)" 
                                strokeWidth={4 + (couplingEmotion * 0.035)}
                                className="animated-brain-wave"
                                filter="url(#glowAggressive)"
                                style={{ animationDuration: `${Math.max(0.5, 2.2 - (couplingEmotion * 0.018))}s` }}
                              />
                              <path 
                                d={emoPathD2} 
                                stroke="rgba(255, 0, 127, 0.7)" 
                                strokeWidth="3"
                                strokeDasharray="8 6"
                                className="animated-brain-wave-reverse"
                              />

                              {/* ONDA 3: CEREBRAL EEG (Electroencefalograma Sináptico) */}
                              <path 
                                d={eegPathD} 
                                stroke="url(#waveEegGrad)" 
                                strokeWidth={3.5 + (couplingSensory * 0.03)}
                                className="animated-eeg-wave"
                                filter="url(#glowAggressive)"
                                style={{ animationDuration: `${Math.max(0.45, 2.0 - (couplingSensory * 0.016))}s` }}
                              />
                            </g>

                            {/* CEREBRO ESTUDIANTE (SINCRONIZADO EN RED) */}
                            <g transform="translate(600, 20)">
                              <rect x="10" y="10" width="240" height="240" rx="120" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="3" />
                              
                              {/* Vías Sinápticas Internas */}
                              <path d="M 60,65 L 130,120 L 200,65 M 100,180 L 130,120 L 200,170 M 130,55 L 130,120" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="2" strokeDasharray="4 4" />

                              {/* NODO AUDITIVO RÉPLICA */}
                              <circle cx="60" cy="65" r={rAudioHalo} fill="#a855f7" opacity={(couplingTone / 100) * 0.4} filter="url(#glowAggressive)" />
                              <circle cx="60" cy="65" r={rAudio} fill="#c084fc" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="60" y="69" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">🎧 AUDITIVO</text>
                              <text x="60" y="83" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingTone}%</text>

                              {/* NODO SENSORIAL RÉPLICA */}
                              <circle cx="200" cy="65" r={rSensHalo} fill="#00f0ff" opacity={(couplingSensory / 100) * 0.4} filter="url(#glowAggressive)" />
                              <circle cx="200" cy="65" r={rSens} fill="#38bdf8" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="200" y="69" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">🖐️ SENSORIAL</text>
                              <text x="200" y="83" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingSensory}%</text>

                              {/* NODO MOTOR RÉPLICA (Neuronas Espejo) */}
                              <circle cx="130" cy="55" r={rMotorHalo} fill="#4ade80" opacity={(couplingSensory / 100) * 0.35} filter="url(#glowAggressive)" />
                              <circle cx="130" cy="55" r={rMotor} fill="#4ade80" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="1.5" />
                              <text x="130" y="59" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">🏃 MOTOR</text>

                              {/* NODO LÍMBICO RÉPLICA */}
                              <circle cx="100" cy="180" r={rEmoHalo} fill="#ff007f" opacity={(couplingEmotion / 100) * 0.45} filter="url(#glowAggressive)" />
                              <circle cx="100" cy="180" r={rEmo} fill="#ff007f" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2" />
                              <text x="100" y="184" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))">❤️ LÍMBICO</text>
                              <text x="100" y="198" fill="#ffd700" fontSize="10" fontWeight="900" textAnchor="middle">{couplingEmotion}%</text>

                              {/* NODO VISUAL 3D RÉPLICA */}
                              <circle cx="200" cy="170" r={rVisualHalo} fill="#f59e0b" opacity={(couplingSensory / 100) * 0.35} filter="url(#glowAggressive)" />
                              <circle cx="200" cy="170" r={rVisual} fill="#fbbf24" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="1.5" />
                              <text x="200" y="174" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">👁️ VISUAL</text>

                              {/* NODO CORE (HIPOCAMPO RÉPLICA) */}
                              <circle cx="130" cy="120" r={rCoreHalo} fill="#ffd700" opacity={(globalCouplingIndex / 100) * 0.5} filter="url(#glowAggressive)" />
                              <circle cx="130" cy="120" r={rCore} fill="#ffd700" filter="url(#glowAggressive)" stroke="#fff" strokeWidth="2.5" />
                              <text x="130" y="124" fill="#000" fontSize="13" fontWeight="900" textAnchor="middle">🧠 HIPOCAMPO</text>
                              <text x="130" y="139" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">{globalCouplingIndex}%</text>

                              <text x="130" y="278" fill="#38bdf8" fontSize="15" fontWeight="900" textAnchor="middle">Cerebro Estudiante (Receptor)</text>
                            </g>
                          </svg>
                        </div>

                        {/* LEYENDA TIPO DE ONDA EN TIEMPO REAL CON INDICADORES DE TAMAÑO */}
                        <div className="wave-legend-bar">
                          <div className="legend-item legend-audio">
                            <span className="legend-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc' }}>🗣️</span>
                            <div>
                              <strong>Oscilograma de Audio (Frecuencia Vocal)</strong>
                              <p>Picos armónicos de sonograma (Amplitud: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{audioAmp}px</span> | Radio nodo: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{rAudio}px</span>)</p>
                            </div>
                          </div>

                          <div className="legend-item legend-emotion">
                            <span className="legend-icon-badge" style={{ background: 'rgba(255, 0, 127, 0.25)', color: '#ff007f' }}>🎭</span>
                            <div>
                              <strong>Onda Emocional ECG / Response Surge</strong>
                              <p>Curvas de respuesta galvánica (Amplitud: <span style={{ color: '#ff007f', fontWeight: 'bold' }}>{emoAmp}px</span> | Radio nodo: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{rEmo}px</span>)</p>
                            </div>
                          </div>

                          <div className="legend-item legend-sensory">
                            <span className="legend-icon-badge" style={{ background: 'rgba(0, 240, 255, 0.25)', color: '#00f0ff' }}>🌿</span>
                            <div>
                              <strong>Onda Cerebral EEG (Oscilación Alfa/Theta)</strong>
                              <p>Disparo sináptico de neuronas espejo (Amplitud: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{eegAmp}px</span> | Radio nodo: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{rSens}px</span>)</p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* MÉTRICAS DE RESULTADO DEL SIMULADOR */}
                  <div className="sim-stats-grid">
                    <div className="s-stat-card">
                      <span className="s-val">Índice Global de Acoplamiento</span>
                      <strong className="stat-highlight" style={{ color: globalCouplingIndex > 70 ? '#4ade80' : globalCouplingIndex > 45 ? '#fbbf24' : '#ef4444' }}>
                        {globalCouplingIndex}% de Sincronía Intercerebral
                      </strong>
                    </div>

                    <div className="s-stat-card">
                      <span className="s-val">Frecuencia Dominante de Ondas</span>
                      <strong style={{ color: '#38bdf8' }}>
                        {globalCouplingIndex > 70 ? 'Ondas Theta (4-8Hz) & Alfa (8-12Hz)' : globalCouplingIndex > 45 ? 'Ondas Alfa en Sincronía Parcial' : 'Ondas Beta (Atención Dispersa)'}
                      </strong>
                    </div>

                    <div className="s-stat-card">
                      <span className="s-val">Redes Córtex Activadas Simultáneamente</span>
                      <strong style={{ color: '#c084fc' }}>
                        {activeAreasCount} de 7 Regiones ({activeAreasCount === 7 ? 'Sincronía Total de Red' : `${activeAreasCount} Regiones Activas`})
                      </strong>
                    </div>
                  </div>
                </div>

                {/* CUADERNO DE EVIDENCIA NEUROCIENTÍFICA INTERACTIVA */}
                <div className="neuro-evidence-section">
                  <h3>🧪 Cuaderno de Evidencia Neurocientífica (Science Digest)</h3>
                  
                  <div className="evidence-tabs">
                    <button 
                      className={`ev-tab-btn ${couplingExperimentTab === 'uri' ? 'active' : ''}`}
                      onClick={() => setCouplingExperimentTab('uri')}
                    >
                      🎓 Experimento Princeton (Uri Hasson)
                    </button>
                    <button 
                      className={`ev-tab-btn ${couplingExperimentTab === 'espejo' ? 'active' : ''}`}
                      onClick={() => setCouplingExperimentTab('espejo')}
                    >
                      🪞 Neuronas Espejo Motoras
                    </button>
                    <button 
                      className={`ev-tab-btn ${couplingExperimentTab === 'colectivo' ? 'active' : ''}`}
                      onClick={() => setCouplingExperimentTab('colectivo')}
                    >
                      👥 Sincronía de Grupo en el Aula
                    </button>
                  </div>

                  <div className="evidence-content-card animate-fade-in">
                    {couplingExperimentTab === 'uri' && (
                      <div className="ev-detail">
                        <h4>🧠 Sincronización Fase a Fase en Imágenes de Resonancia Magnética (fMRI)</h4>
                        <p>
                          Investigadores de la Universidad de Princeton colocaron tanto a un docente narrador como a sus estudiantes dentro de escáneres fMRI. Los resultados revelaron que <strong>cuando la narrativa tiene cohesión dramática, la actividad cerebral del oyente copia el patrón temporal exacto del hablante</strong>.
                        </p>
                        <ul className="ev-bullet-list">
                          <li><strong>Acoplamiento con anticipación:</strong> En los momentos culminantes del cuento, el cerebro del estudiante se adelanta en milisegundos a la palabra del profesor, prediciendo el significado.</li>
                          <li><strong>Más allá de las palabras:</strong> No solo se enciende el área del lenguaje (Broca/Wernicke), sino que se sincronizan las áreas emocionales y sensoriales.</li>
                        </ul>
                      </div>
                    )}

                    {couplingExperimentTab === 'espejo' && (
                      <div className="ev-detail">
                        <h4>🪞 Simulación Virtual Activa (Sistema de Neuronas Espejo)</h4>
                        <p>
                          Cuando el narrador describe: <em>"El héroe agarró la pesada cuerda y saltó al abismo"</em>, las neuronas del córtex motor y premotor del estudiante disparan señales impulsivas exactas a como si el estudiante estuviera sosteniendo la cuerda con sus propias manos.
                        </p>
                        <ul className="ev-bullet-list">
                          <li><strong>Aprendizaje kinestésico pasivo:</strong> El cuerpo permanece quieto en la silla, pero el cerebro experimenta la acción en 3D.</li>
                          <li><strong>Efecto anclaje:</strong> Los conceptos asociados a acciones físicas narradas se recuerdan un 300% mejor que las definiciones abstractas.</li>
                        </ul>
                      </div>
                    )}

                    {couplingExperimentTab === 'colectivo' && (
                      <div className="ev-detail">
                        <h4>👥 Construcción del Escenario Mental Compartido (Shared Mental Model)</h4>
                        <p>
                          En una clase de 30 alumnos, las explicaciones teóricas abstractas generan 30 representaciones mentales dispares y dispersas. Por el contrario, un cuento bien estructurado <strong>unifica las frecuencias de electroencefalografía (EEG) de todo el salón de clases</strong>.
                        </p>
                        <ul className="ev-bullet-list">
                          <li><strong>Atención colectiva fluida:</strong> Se elimina la fatiga por sobrecarga cognitiva y la distracción del entorno.</li>
                          <li><strong>Ambiente receptivo:</strong> Los alumnos ingresan en estado de 'Flow', óptimo para asimilar contenidos complejos de ciencia, historia o matemáticas.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* DEMOSTRADOR COMPARATIVO DE IMPACTO DIDÁCTICO */}
                <div className="neuro-compare-section">
                  <h3>📊 Comparativa de Impacto Pedagógico en el Aula</h3>
                  
                  <div className="compare-toggle-bar">
                    <button 
                      className={`comp-toggle-btn ${compareTeachingMode === 'tradicional' ? 'active-red' : ''}`}
                      onClick={() => setCompareTeachingMode('tradicional')}
                    >
                      ❌ Clase Tradicional (Solo Datos)
                    </button>
                    <button 
                      className={`comp-toggle-btn ${compareTeachingMode === 'narrativo' ? 'active-green' : ''}`}
                      onClick={() => setCompareTeachingMode('narrativo')}
                    >
                      ✅ Clase Narrativa (Acoplamiento Neuronal)
                    </button>
                  </div>

                  <div className="compare-result-box animate-fade-in">
                    {compareTeachingMode === 'tradicional' ? (
                      <div className="comp-card card-danger">
                        <h4>❌ Enfoque Tradicional: Exposición Desconectada</h4>
                        <div className="comp-grid">
                          <div className="comp-item">
                            <span className="c-label">Nivel de Acoplamiento Neuronal</span>
                            <span className="c-val val-bad">12% (Baja Sincronía)</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Áreas Cerebrales Activas</span>
                            <span className="c-val val-bad">2 Regiones (Solo Auditivo y Lingüístico)</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Retención a las 72 Horas</span>
                            <span className="c-val val-bad">10% - 15% de Recuerdo</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Esfuerzo Cognitivo del Alumno</span>
                            <span className="c-val val-bad">Alto (Propensión a la fatiga y distracción)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="comp-card card-success">
                        <h4>✅ Enfoque Narrativo: Acoplamiento Neuronal Completo</h4>
                        <div className="comp-grid">
                          <div className="comp-item">
                            <span className="c-label">Nivel de Acoplamiento Neuronal</span>
                            <span className="c-val val-good">88% (Sincronía de Red Completa)</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Áreas Cerebrales Activas</span>
                            <span className="c-val val-good">7 Regiones (Auditiva, Motora, Emocional, Visual, Límbica, etc.)</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Retención a las 72 Horas</span>
                            <span className="c-val val-good">65% - 75% de Recuerdo Fijo</span>
                          </div>
                          <div className="comp-item">
                            <span className="c-label">Esfuerzo Cognitivo del Alumno</span>
                            <span className="c-val val-good">Bajo en esfuerzo, Máximo en absorción ('Flow State')</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIPS DE ACCIÓN RÁPIDA PARA EL DOCENTE */}
                <div className="neuro-tips-box">
                  <h4>💡 Estrategias Docentes para Activar el Acoplamiento Neuronal en 3 Minutos:</h4>
                  <div className="tips-cards-grid">
                    <div className="tip-mini-card">
                      <span className="tip-icon">⏱️</span>
                      <strong>El Hook de 180 Segundos:</strong> Inicia tu clase con una escena de misterio o un dilema antes de definir cualquier concepto teórico.
                    </div>
                    <div className="tip-mini-card">
                      <span className="tip-icon">👁️</span>
                      <strong>Detalles Sensoriales Vívidos:</strong> Usa adjetivos de temperatura, textura y movimiento para encender las neuronas espejo táctiles.
                    </div>
                    <div className="tip-mini-card">
                      <span className="tip-icon">⏸️</span>
                      <strong>La Pausa Dramática:</strong> Haz una pausa de 2 segundos antes de revelar la solución; permites que las ondas Theta sinteticen la predicción.
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* MÓDULO 2: CÓCTEL QUÍMICO DE LA NARRATIVA */}
          {neuroModule === 'chemistry' && (
            <div className="neuro-card animate-fade-in">
              <div className="neuro-card-header">
                <span className="n-tag tag-gold">🧪 Neuroquímica Educativa</span>
                <h2>El Cóctel Químico de las Historias en el Cerebro</h2>
                <p>
                  Haz clic en cualquiera de las 4 fichas hormonales a continuación para activar su ruta de secreción glándula por glándula en el mapa cerebral interactivo:
                </p>
              </div>

              {/* SELECCIÓN INTERACTIVA DE NEUROTRANSMISORES (2 COLUMNAS x 2 FILAS) */}
              <div className="molecules-grid">
                {[
                  {
                    id: 'dopamina',
                    name: '🟡 Dopamina',
                    formula: 'C₈H₁₁NO₂',
                    subtitle: 'Suspenso & Curiosidad',
                    desc: 'Se libera cuando la historia presenta un misterio o enigma inacabado. Eleva el foco de atención y facilita el archivo en la memoria a largo plazo.',
                    trigger: '💡 Detonante: Preguntas sin responder o problemas con pistas parciales.',
                    boost: 'Atención: +92% | Memoria: +85%'
                  },
                  {
                    id: 'oxitocina',
                    name: '💖 Oxitocina',
                    formula: 'C₄₃H₆₆N₁₂O₁₂S₂',
                    subtitle: 'Empatía & Conexión Humana',
                    desc: 'Se activa al identificarse con las vulnerabilidades del personaje principal. Fomenta la conducta prosocial, generosidad y trabajo colaborativo.',
                    trigger: '🤝 Detonante: Dilemas morales y sacrificios éticos del protagonista.',
                    boost: 'Empatía: +98% | Confianza: +90%'
                  },
                  {
                    id: 'cortisol',
                    name: '⚡ Cortisol (Dosis Controlada)',
                    formula: 'C₂₁H₃₀O₅',
                    subtitle: 'Alerta & Conflicto Narrativo',
                    desc: 'Surge en dosis óptimas ante el clímax o riesgo. Mantiene al alumno al borde de la silla, enfocado y preparado para responder.',
                    trigger: '🔥 Detonante: Obstáculos urgentes y giros inesperados de tiempo.',
                    boost: 'Alerta: +88% | Enfoque: +95%'
                  },
                  {
                    id: 'endorfinas',
                    name: '✨ Endorfinas',
                    formula: 'C₁₅₈H₂₅₁N₃₉O₄₆S',
                    subtitle: 'Risa & Recompensa Límbica',
                    desc: 'Liberadas durante momentos humorísticos o soluciones ingeniosas. Reducen drásticamente la ansiedad hacia materias complejas.',
                    trigger: '😄 Detonante: Alivio cómico, giros alegres y triunfos compartidos.',
                    boost: 'Relajación: +94% | Disfrute: +96%'
                  }
                ].map(mol => (
                  <div 
                    key={mol.id}
                    className={`mol-card ${activeMolecule === mol.id ? 'active' : ''}`}
                    onClick={() => setActiveMolecule(mol.id as 'dopamina' | 'oxitocina' | 'cortisol' | 'endorfinas' | 'todos')}
                  >
                    <div>
                      <div className="mol-header-row">
                        <h3>{mol.name}</h3>
                        <span className="mol-formula-badge">{mol.formula}</span>
                      </div>
                      <span className="mol-sub">{mol.subtitle}</span>
                      <p>{mol.desc}</p>
                      <div className="mol-trigger-box">{mol.trigger}</div>
                    </div>
                    <div className="mol-boost">
                      <span>🚀 Impacto Neuro-Cognitivo:</span>
                      <span>{mol.boost}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* MAPA ANATÓMICO-HORMONAL DEL CEREBRO NARRATIVO INTEGRADO CON LAS FICHAS */}
              <div className="brain-hormone-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3>🧪 Mapa Anatómico de la Ficha Seleccionada</h3>
                  <button 
                    className={`hormone-btn ${activeMolecule === 'todos' ? 'active' : ''}`}
                    onClick={() => setActiveMolecule(activeMolecule === 'todos' ? 'dopamina' : 'todos')}
                    style={{ background: activeMolecule === 'todos' ? 'linear-gradient(135deg, #a855f7, #ffd700)' : 'rgba(0,0,0,0.4)' }}
                  >
                    🌈 {activeMolecule === 'todos' ? 'Desactivar Cóctel Completo' : 'Ver Cóctel Completo (Todos)'}
                  </button>
                </div>
                <p className="sub-desc">
                  Vías sinápticas y secreción hormonal activa al hacer clic en las fichas superiores:
                </p>

                {/* DIAGRAMA NEUROANATÓMICO PROFESIONAL – CORTE SAGITAL MEDIAL DEL CEREBRO HUMANO */}
                <div className="brain-anatomy-container">
                  <svg viewBox="0 0 900 520" className="brain-anatomy-svg" style={{ maxHeight: '520px' }}>
                    <defs>
                      {/* ── FILTROS ── */}
                      <filter id="glowSoft" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="b"/>
                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <filter id="glowIntense" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="14" result="b"/>
                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <filter id="glowNode" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="10" result="b"/>
                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                      <filter id="innerShadow">
                        <feFlood floodColor="#000" floodOpacity="0.5" result="flood"/>
                        <feComposite in="flood" in2="SourceAlpha" operator="in" result="shadow"/>
                        <feGaussianBlur in="shadow" stdDeviation="4" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>

                      {/* ── GRADIENTES DE FONDO ── */}
                      <radialGradient id="bgGradBrain" cx="45%" cy="45%" r="55%">
                        <stop offset="0%" stopColor="rgba(10, 25, 60, 0.95)"/>
                        <stop offset="100%" stopColor="rgba(2, 6, 18, 1)"/>
                      </radialGradient>

                      {/* ── GRADIENTES DEL CORTEX ── */}
                      <linearGradient id="cortexFill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(30, 58, 100, 0.65)"/>
                        <stop offset="50%" stopColor="rgba(15, 30, 60, 0.55)"/>
                        <stop offset="100%" stopColor="rgba(8, 15, 35, 0.45)"/>
                      </linearGradient>
                      <linearGradient id="cortexStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#67e8f9"/>
                        <stop offset="50%" stopColor="#38bdf8"/>
                        <stop offset="100%" stopColor="#818cf8"/>
                      </linearGradient>

                      {/* ── GRADIENTES DE NODOS (HORMONAS) ── */}
                      <radialGradient id="nodeDopa" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fffde0"/><stop offset="25%" stopColor="#ffd700"/>
                        <stop offset="70%" stopColor="#d97706"/><stop offset="100%" stopColor="#92400e"/>
                      </radialGradient>
                      <radialGradient id="nodeOxy" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fff0f5"/><stop offset="25%" stopColor="#ff66a3"/>
                        <stop offset="70%" stopColor="#db2777"/><stop offset="100%" stopColor="#831843"/>
                      </radialGradient>
                      <radialGradient id="nodeCort" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fff0f0"/><stop offset="25%" stopColor="#f87171"/>
                        <stop offset="70%" stopColor="#dc2626"/><stop offset="100%" stopColor="#7f1d1d"/>
                      </radialGradient>
                      <radialGradient id="nodeEndo" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ecfeff"/><stop offset="25%" stopColor="#22d3ee"/>
                        <stop offset="70%" stopColor="#0891b2"/><stop offset="100%" stopColor="#164e63"/>
                      </radialGradient>
                      <radialGradient id="nodeHippo" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#fef9c3"/><stop offset="35%" stopColor="#facc15"/>
                        <stop offset="80%" stopColor="#a16207"/><stop offset="100%" stopColor="#713f12"/>
                      </radialGradient>

                      {/* ── GRADIENTES DE FLUJO ── */}
                      <linearGradient id="flowDopa" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#ffd700" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.3"/>
                      </linearGradient>
                      <linearGradient id="flowOxy" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#ff007f" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#fda4af" stopOpacity="0.3"/>
                      </linearGradient>
                      <linearGradient id="flowCort" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#f87171" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.3"/>
                      </linearGradient>
                      <linearGradient id="flowEndo" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2"/>
                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.3"/>
                      </linearGradient>

                      {/* ── GRADIENTE DE CEREBELO ── */}
                      <linearGradient id="cerebellumFill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.25)"/>
                        <stop offset="100%" stopColor="rgba(88, 28, 135, 0.15)"/>
                      </linearGradient>

                      {/* ── GRADIENTE DEL TRONCO ── */}
                      <linearGradient id="brainstemFill" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="rgba(56, 189, 248, 0.2)"/>
                        <stop offset="100%" stopColor="rgba(14, 116, 144, 0.1)"/>
                      </linearGradient>

                      {/* ── GRADIENTE DE CUERPO CALLOSO ── */}
                      <linearGradient id="callosumFill" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)"/>
                        <stop offset="50%" stopColor="rgba(203, 213, 225, 0.25)"/>
                        <stop offset="100%" stopColor="rgba(148, 163, 184, 0.15)"/>
                      </linearGradient>
                    </defs>

                    {/* ═══ CAPA 0: FONDO RADIAL OSCURO ═══ */}
                    <rect x="0" y="0" width="900" height="520" fill="url(#bgGradBrain)" rx="20"/>

                    {/* ═══ CAPA 1: SILUETA CEREBRAL – CORTE SAGITAL MEDIAL REALISTA ═══ */}
                    {/* Contorno principal del cerebro con pliegues corticales (gyri y sulci) */}
                    <g>
                      {/* CORTEZA CEREBRAL - Contorno exterior con gyri */}
                      <path 
                        d="M 200,290 
                           C 175,260 155,220 150,185 C 145,155 155,120 175,95 
                           C 195,72 220,52 255,38 C 290,24 330,18 370,20 
                           C 410,22 445,28 480,38 C 510,46 540,58 565,75 
                           C 590,90 610,110 625,135 C 640,158 648,185 648,215 
                           C 648,240 640,262 625,282 C 612,298 595,310 575,318 
                           C 555,326 530,328 505,328 
                           C 480,328 458,325 440,320 
                           C 420,316 400,318 380,325 
                           C 355,334 330,340 300,338 
                           C 268,336 240,325 218,308 
                           C 206,298 200,292 200,290 Z" 
                        fill="url(#cortexFill)" 
                        stroke="url(#cortexStroke)" 
                        strokeWidth="2.5" 
                        filter="url(#glowSoft)"
                        className="brain-cortex-outline"
                      />

                      {/* SULCOS PRINCIPALES (pliegues del córtex) */}
                      {/* Surco Central (Cisura de Rolando) */}
                      <path d="M 430,42 C 438,80 445,130 450,175 C 454,210 448,255 440,290" 
                        stroke="rgba(103, 232, 249, 0.35)" strokeWidth="1.8" fill="none" strokeDasharray="6 4"/>
                      {/* Surco Lateral (Cisura de Silvio) */}
                      <path d="M 235,220 C 280,210 330,200 380,195 C 420,192 460,200 500,215" 
                        stroke="rgba(103, 232, 249, 0.3)" strokeWidth="1.6" fill="none" strokeDasharray="5 4"/>
                      {/* Surco Parieto-Occipital */}
                      <path d="M 545,60 C 555,100 565,155 568,210 C 570,250 560,290 545,315" 
                        stroke="rgba(129, 140, 248, 0.3)" strokeWidth="1.5" fill="none" strokeDasharray="5 3"/>
                      {/* Surco Cingulado */}
                      <path d="M 215,170 C 260,145 320,130 380,125 C 430,122 480,130 530,150 C 560,162 580,180 595,200" 
                        stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1.3" fill="none" strokeDasharray="4 4"/>

                      {/* GYRI (pliegues corticales – ondulaciones sutiles internas) */}
                      <path d="M 190,170 C 210,155 235,148 260,145 C 290,142 310,150 330,145" 
                        stroke="rgba(96, 165, 250, 0.2)" strokeWidth="1" fill="none"/>
                      <path d="M 340,60 C 355,75 365,95 370,115 C 375,130 370,145 362,155" 
                        stroke="rgba(96, 165, 250, 0.18)" strokeWidth="1" fill="none"/>
                      <path d="M 480,50 C 495,72 505,100 510,130 C 512,145 508,155 500,165" 
                        stroke="rgba(96, 165, 250, 0.18)" strokeWidth="1" fill="none"/>
                      <path d="M 580,120 C 595,145 605,175 608,205 C 610,225 600,248 588,265" 
                        stroke="rgba(129, 140, 248, 0.18)" strokeWidth="1" fill="none"/>
                      <path d="M 280,55 C 295,70 300,90 298,108" 
                        stroke="rgba(96, 165, 250, 0.15)" strokeWidth="1" fill="none"/>
                      <path d="M 395,35 C 400,55 402,80 398,100" 
                        stroke="rgba(96, 165, 250, 0.15)" strokeWidth="1" fill="none"/>

                      {/* CUERPO CALLOSO (banda de fibras comisurales) */}
                      <path 
                        d="M 245,195 C 280,175 340,165 400,163 C 460,161 510,170 545,185" 
                        fill="none" stroke="url(#callosumFill)" strokeWidth="18" strokeLinecap="round" opacity="0.6"
                      />
                      <path 
                        d="M 245,195 C 280,175 340,165 400,163 C 460,161 510,170 545,185" 
                        fill="none" stroke="rgba(203, 213, 225, 0.35)" strokeWidth="1.5"
                      />

                      {/* CEREBELO (posterior-inferior) */}
                      <path 
                        d="M 555,320 C 575,325 600,330 620,340 C 645,355 655,380 640,400 
                           C 625,420 595,425 570,420 C 545,415 525,400 515,380 
                           C 505,360 510,340 520,325 C 530,315 542,312 555,320 Z" 
                        fill="url(#cerebellumFill)" stroke="#a78bfa" strokeWidth="2"
                      />
                      {/* Pliegues del cerebelo (folia cerebelosos) */}
                      <path d="M 535,345 C 555,340 580,345 600,355" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" fill="none"/>
                      <path d="M 530,365 C 550,358 575,360 598,370" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="1" fill="none"/>
                      <path d="M 535,385 C 555,378 580,380 600,390" stroke="rgba(167, 139, 250, 0.2)" strokeWidth="1" fill="none"/>
                      <path d="M 545,402 C 565,395 585,398 600,405" stroke="rgba(167, 139, 250, 0.15)" strokeWidth="1" fill="none"/>

                      {/* TRONCO ENCEFÁLICO (mesencéfalo, protuberancia, bulbo) */}
                      <path 
                        d="M 440,290 C 435,310 430,340 430,370 C 430,400 435,430 440,460 
                           C 442,470 448,478 458,478 
                           C 468,478 474,470 476,460 
                           C 481,430 486,400 486,370 
                           C 486,340 481,310 475,290" 
                        fill="url(#brainstemFill)" stroke="#38bdf8" strokeWidth="2"
                      />
                      {/* Protuberancia */}
                      <ellipse cx="458" cy="395" rx="32" ry="16" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5"/>

                      {/* TÁLAMO (masa ovoidal central) */}
                      <ellipse cx="420" cy="225" rx="42" ry="26" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(129, 140, 248, 0.5)" strokeWidth="1.8" strokeDasharray="4 3"/>
                    </g>

                    {/* ═══ CAPA 2: ETIQUETAS ANATÓMICAS CON LÍNEAS GUÍA ═══ */}
                    <g className="brain-labels-layer">
                      {/* Lóbulo Frontal */}
                      <line x1="280" y1="85" x2="200" y2="48" stroke="rgba(192, 132, 252, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="120" y="45" fill="#c4b5fd" fontSize="10.5" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">LÓBULO FRONTAL</text>
                      
                      {/* Lóbulo Parietal */}
                      <line x1="490" y1="70" x2="540" y2="38" stroke="rgba(96, 165, 250, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="548" y="40" fill="#93c5fd" fontSize="10.5" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">LÓBULO PARIETAL</text>
                      
                      {/* Lóbulo Occipital */}
                      <line x1="620" y1="200" x2="700" y2="170" stroke="rgba(129, 140, 248, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="708" y="173" fill="#a5b4fc" fontSize="10.5" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">LÓBULO OCCIPITAL</text>
                      
                      {/* Lóbulo Temporal */}
                      <line x1="340" y1="285" x2="275" y2="330" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="178" y="333" fill="#67e8f9" fontSize="10.5" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">LÓBULO TEMPORAL</text>
                      
                      {/* Cerebelo */}
                      <line x1="575" y1="370" x2="660" y2="365" stroke="rgba(167, 139, 250, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="668" y="368" fill="#c4b5fd" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">CEREBELO</text>
                      
                      {/* Tronco Encefálico */}
                      <line x1="460" y1="445" x2="535" y2="458" stroke="rgba(56, 189, 248, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                      <text x="543" y="461" fill="#7dd3fc" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif" letterSpacing="0.5">TRONCO ENCEFÁLICO</text>
                      
                      {/* Cuerpo Calloso */}
                      <text x="370" y="178" fill="rgba(203, 213, 225, 0.6)" fontSize="8.5" fontWeight="700" fontFamily="'Inter', sans-serif" textAnchor="middle" letterSpacing="2">CUERPO CALLOSO</text>
                      
                      {/* Tálamo */}
                      <text x="420" y="229" fill="rgba(165, 180, 252, 0.7)" fontSize="8" fontWeight="700" fontFamily="'Inter', sans-serif" textAnchor="middle">TÁLAMO</text>
                    </g>

                    {/* ═══ CAPA 3: ESTRUCTURAS LÍMBICAS PROFUNDAS ═══ */}
                    {/* Cada estructura con: nodo 3D + halo de resplandor + etiqueta con línea guía */}
                    
                    {/* ── HIPOCAMPO (medial temporal – forma de caballito de mar) ── */}
                    <g className={`limbic-node ${activeMolecule === 'dopamina' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      {/* Forma de hipocampo curvada (simplificada anatómicamente) */}
                      <path d="M 365,275 C 375,265 390,260 400,265 C 415,272 418,290 410,305 C 400,322 380,330 365,325 C 355,320 350,308 355,295 C 358,285 362,278 365,275 Z"
                        fill="rgba(250, 204, 21, 0.2)" stroke="#facc15" strokeWidth="2" filter="url(#glowSoft)"/>
                      <circle cx="385" cy="290" r="14" fill="url(#nodeHippo)" stroke="#fff" strokeWidth="2" filter="url(#glowNode)"/>
                      <circle cx="385" cy="290" r="14" fill="none" stroke="#ffd700" strokeWidth="2.5" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="399" y1="290" x2="680" y2="240" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="682" y="228" width="195" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#facc15" strokeWidth="1"/>
                      <text x="695" y="244" fill="#fde047" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">🧠 HIPOCAMPO – Mem. Episódica</text>
                    </g>

                    {/* ── AMÍGDALA (anterior al hipocampo) ── */}
                    <g className={`limbic-node ${activeMolecule === 'oxitocina' || activeMolecule === 'cortisol' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <ellipse cx="345" cy="275" rx="18" ry="15" fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" filter="url(#glowSoft)"/>
                      <circle cx="345" cy="275" r="12" fill="url(#nodeOxy)" stroke="#fff" strokeWidth="1.8" filter="url(#glowNode)"/>
                      <circle cx="345" cy="275" r="12" fill="none" stroke="#ff007f" strokeWidth="2.5" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="333" y1="275" x2="135" y2="260" stroke="rgba(236, 72, 153, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="12" y="248" width="125" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#ec4899" strokeWidth="1"/>
                      <text x="22" y="264" fill="#f9a8d4" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">💖 AMÍGDALA</text>
                    </g>

                    {/* ── VTA (Área Tegmental Ventral) ── */}
                    <g className={`limbic-node ${activeMolecule === 'dopamina' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <ellipse cx="445" cy="335" rx="16" ry="12" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="1.8" filter="url(#glowSoft)"/>
                      <circle cx="445" cy="335" r="10" fill="url(#nodeDopa)" stroke="#fff" strokeWidth="1.5" filter="url(#glowNode)"/>
                      <circle cx="445" cy="335" r="10" fill="none" stroke="#ffd700" strokeWidth="2" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="461" y1="335" x2="680" y2="290" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="682" y="278" width="195" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#fbbf24" strokeWidth="1"/>
                      <text x="695" y="294" fill="#fde047" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">🟡 VTA – Fuente de Dopamina</text>
                    </g>

                    {/* ── HIPOTÁLAMO (núcleos supraóptico y paraventricular) ── */}
                    <g className={`limbic-node ${activeMolecule === 'oxitocina' || activeMolecule === 'cortisol' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <path d="M 385,295 C 395,300 405,310 408,325 C 410,335 405,345 395,348 C 385,350 375,345 370,335 C 367,325 372,310 380,300 Z"
                        fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.8" filter="url(#glowSoft)"/>
                      <circle cx="390" cy="325" r="10" fill="url(#nodeCort)" stroke="#fff" strokeWidth="1.5" filter="url(#glowNode)"/>
                      <circle cx="390" cy="325" r="10" fill="none" stroke="#ef4444" strokeWidth="2" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="380" y1="325" x2="135" y2="310" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="12" y="298" width="125" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#38bdf8" strokeWidth="1"/>
                      <text x="22" y="314" fill="#7dd3fc" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">⚡ HIPOTÁLAMO</text>
                    </g>

                    {/* ── HIPÓFISIS / GLÁNDULA PITUITARIA (pende del hipotálamo) ── */}
                    <g className={`limbic-node ${activeMolecule === 'endorfinas' || activeMolecule === 'cortisol' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <line x1="395" y1="348" x2="398" y2="375" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1.5"/>
                      <ellipse cx="398" cy="385" rx="14" ry="10" fill="rgba(34, 211, 238, 0.15)" stroke="#22d3ee" strokeWidth="1.5" filter="url(#glowSoft)"/>
                      <circle cx="398" cy="385" r="8" fill="url(#nodeEndo)" stroke="#fff" strokeWidth="1.5" filter="url(#glowNode)"/>
                      <circle cx="398" cy="385" r="8" fill="none" stroke="#22d3ee" strokeWidth="2" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="384" y1="385" x2="135" y2="370" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="12" y="358" width="125" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#22d3ee" strokeWidth="1"/>
                      <text x="22" y="374" fill="#67e8f9" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">🔬 HIPÓFISIS</text>
                    </g>

                    {/* ── PAG (Sustancia Gris Periacueductal – endorfinas) ── */}
                    <g className={`limbic-node ${activeMolecule === 'endorfinas' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <ellipse cx="455" cy="360" rx="12" ry="9" fill="rgba(34, 211, 238, 0.15)" stroke="#06b6d4" strokeWidth="1.5" filter="url(#glowSoft)"/>
                      <circle cx="455" cy="360" r="7" fill="url(#nodeEndo)" stroke="#fff" strokeWidth="1.2" filter="url(#glowNode)"/>
                      <circle cx="455" cy="360" r="7" fill="none" stroke="#06b6d4" strokeWidth="1.8" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="467" y1="360" x2="680" y2="335" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="682" y="323" width="195" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#06b6d4" strokeWidth="1"/>
                      <text x="695" y="339" fill="#67e8f9" fontSize="10" fontWeight="800" fontFamily="'Inter', sans-serif">✨ PAG – Fuente Endorfinas</text>
                    </g>

                    {/* ── NÚCLEO ACCUMBENS (ventral striatum) ── */}
                    <g className={`limbic-node ${activeMolecule === 'dopamina' || activeMolecule === 'endorfinas' || activeMolecule === 'todos' ? 'node-active' : ''}`}>
                      <ellipse cx="310" cy="245" rx="14" ry="11" fill="rgba(251, 191, 36, 0.15)" stroke="#f59e0b" strokeWidth="1.5" filter="url(#glowSoft)"/>
                      <circle cx="310" cy="245" r="9" fill="url(#nodeDopa)" stroke="#fff" strokeWidth="1.5" filter="url(#glowNode)"/>
                      <circle cx="310" cy="245" r="9" fill="none" stroke="#f59e0b" strokeWidth="2" className="gland-pulse-ring"/>
                      {/* Etiqueta */}
                      <line x1="296" y1="245" x2="135" y2="210" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1" strokeDasharray="3 2"/>
                      <rect x="12" y="198" width="125" height="24" rx="12" fill="rgba(10, 15, 30, 0.9)" stroke="#f59e0b" strokeWidth="1"/>
                      <text x="22" y="214" fill="#fde047" fontSize="9.5" fontWeight="800" fontFamily="'Inter', sans-serif">🟡 N. ACCUMBENS</text>
                    </g>

                    {/* ═══ CAPA 4: VÍAS NEURONALES ACTIVADAS POR HORMONA ═══ */}
                    {/* DOPAMINA: VTA → N. Accumbens → Hipocampo → Córtex Prefrontal */}
                    {(activeMolecule === 'dopamina' || activeMolecule === 'todos') && (
                      <g className="neural-pathway pathway-dopa">
                        {/* Vía mesolímbica */}
                        <path d="M 445,335 C 420,320 370,290 310,245" fill="none" stroke="url(#flowDopa)" strokeWidth="4" strokeDasharray="8 5" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* VTA → Hipocampo */}
                        <path d="M 445,335 C 435,310 420,295 385,290" fill="none" stroke="url(#flowDopa)" strokeWidth="3.5" strokeDasharray="8 5" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* N. Accumbens → Córtex Prefrontal */}
                        <path d="M 310,245 C 290,210 265,165 260,110 C 258,85 270,65 290,55" fill="none" stroke="url(#flowDopa)" strokeWidth="3" strokeDasharray="7 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Partículas sinápticas */}
                        <circle cx="370" cy="310" r="3.5" fill="#ffd700" className="synaptic-spark"/>
                        <circle cx="330" cy="265" r="4" fill="#fbbf24" className="synaptic-spark" style={{animationDelay:'0.3s'}}/>
                        <circle cx="285" cy="175" r="3" fill="#fef3c7" className="synaptic-spark" style={{animationDelay:'0.6s'}}/>
                        <circle cx="275" cy="85" r="3.5" fill="#ffd700" className="synaptic-spark" style={{animationDelay:'0.9s'}}/>
                        <circle cx="420" cy="300" r="2.5" fill="#fff" className="synaptic-spark" style={{animationDelay:'0.4s'}}/>
                      </g>
                    )}

                    {/* OXITOCINA: Hipotálamo → Amígdala → Córtex Prefrontal Ventromedial */}
                    {(activeMolecule === 'oxitocina' || activeMolecule === 'todos') && (
                      <g className="neural-pathway pathway-oxy">
                        {/* Hipotálamo → Amígdala */}
                        <path d="M 390,325 C 375,310 360,295 345,275" fill="none" stroke="url(#flowOxy)" strokeWidth="4" strokeDasharray="8 5" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Amígdala → Córtex Prefrontal */}
                        <path d="M 345,275 C 320,250 280,200 250,145 C 235,115 230,85 240,60" fill="none" stroke="url(#flowOxy)" strokeWidth="3.5" strokeDasharray="7 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Amígdala → Hipocampo (modulación emocional de la memoria) */}
                        <path d="M 345,275 C 360,278 370,282 385,290" fill="none" stroke="url(#flowOxy)" strokeWidth="3" strokeDasharray="6 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Partículas */}
                        <circle cx="365" cy="298" r="3.5" fill="#ff007f" className="synaptic-spark"/>
                        <circle cx="330" cy="260" r="4" fill="#ec4899" className="synaptic-spark" style={{animationDelay:'0.35s'}}/>
                        <circle cx="290" cy="195" r="3" fill="#fda4af" className="synaptic-spark" style={{animationDelay:'0.7s'}}/>
                        <circle cx="248" cy="105" r="3.5" fill="#ff007f" className="synaptic-spark" style={{animationDelay:'1s'}}/>
                        <circle cx="362" cy="280" r="2.5" fill="#fff" className="synaptic-spark" style={{animationDelay:'0.5s'}}/>
                      </g>
                    )}

                    {/* CORTISOL: Hipotálamo (CRH) → Hipófisis (ACTH) → marcación de la Amígdala */}
                    {(activeMolecule === 'cortisol' || activeMolecule === 'todos') && (
                      <g className="neural-pathway pathway-cort">
                        {/* Eje HPA: Hipotálamo → Hipófisis */}
                        <path d="M 390,325 C 392,345 395,365 398,385" fill="none" stroke="url(#flowCort)" strokeWidth="4.5" strokeDasharray="8 5" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Señal de alerta: Amígdala → Hipotálamo (retroalimentación) */}
                        <path d="M 345,275 C 360,290 375,305 390,325" fill="none" stroke="url(#flowCort)" strokeWidth="3.5" strokeDasharray="7 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Amígdala → Córtex (señal de alerta atencional) */}
                        <path d="M 345,275 C 370,255 410,220 440,180 C 460,155 475,125 480,95" fill="none" stroke="url(#flowCort)" strokeWidth="3" strokeDasharray="6 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Partículas */}
                        <circle cx="392" cy="355" r="3.5" fill="#ef4444" className="synaptic-spark"/>
                        <circle cx="365" cy="290" r="4" fill="#f87171" className="synaptic-spark" style={{animationDelay:'0.3s'}}/>
                        <circle cx="425" cy="205" r="3" fill="#fca5a5" className="synaptic-spark" style={{animationDelay:'0.65s'}}/>
                        <circle cx="470" cy="115" r="3.5" fill="#ef4444" className="synaptic-spark" style={{animationDelay:'0.95s'}}/>
                      </g>
                    )}

                    {/* ENDORFINAS: PAG + Hipófisis → circuito de recompensa amplio */}
                    {(activeMolecule === 'endorfinas' || activeMolecule === 'todos') && (
                      <g className="neural-pathway pathway-endo">
                        {/* PAG → proyección ascendente */}
                        <path d="M 455,360 C 470,330 490,280 510,240 C 530,200 555,165 580,140" fill="none" stroke="url(#flowEndo)" strokeWidth="4" strokeDasharray="8 5" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Hipófisis → N. Accumbens (recompensa opioide) */}
                        <path d="M 398,385 C 380,360 350,310 310,245" fill="none" stroke="url(#flowEndo)" strokeWidth="3.5" strokeDasharray="7 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* PAG → Amígdala (modulación del dolor emocional) */}
                        <path d="M 455,360 C 430,340 390,310 345,275" fill="none" stroke="url(#flowEndo)" strokeWidth="3" strokeDasharray="6 4" className="hormone-stream-flow" filter="url(#glowSoft)"/>
                        {/* Partículas */}
                        <circle cx="490" cy="295" r="4" fill="#22d3ee" className="synaptic-spark"/>
                        <circle cx="530" cy="210" r="3.5" fill="#06b6d4" className="synaptic-spark" style={{animationDelay:'0.35s'}}/>
                        <circle cx="560" cy="155" r="3" fill="#a5f3fc" className="synaptic-spark" style={{animationDelay:'0.7s'}}/>
                        <circle cx="360" cy="340" r="3.5" fill="#22d3ee" className="synaptic-spark" style={{animationDelay:'0.5s'}}/>
                        <circle cx="400" cy="305" r="2.5" fill="#fff" className="synaptic-spark" style={{animationDelay:'0.85s'}}/>
                      </g>
                    )}

                    {/* ═══ CAPA 5: OVERLAY HUD CIENTÍFICO ═══ */}
                    <g fontSize="8.5" fontFamily="'JetBrains Mono', 'Fira Code', monospace" fill="rgba(103, 232, 249, 0.55)" textAnchor="end">
                      <text x="885" y="25">CORTE SAGITAL MEDIAL</text>
                      <text x="885" y="38">SISTEMA LÍMBICO: {activeMolecule === 'todos' ? 'ACTIVACIÓN COMPLETA' : activeMolecule.toUpperCase()}</text>
                      <text x="885" y="505" fill="rgba(103, 232, 249, 0.35)">NEURO-MAPPING v2.0 — Lluvia de Ideas Editorial</text>
                    </g>

                    {/* Indicador de escala anatómica */}
                    <g>
                      <line x1="30" y1="490" x2="130" y2="490" stroke="rgba(103, 232, 249, 0.4)" strokeWidth="1.5"/>
                      <line x1="30" y1="485" x2="30" y2="495" stroke="rgba(103, 232, 249, 0.4)" strokeWidth="1"/>
                      <line x1="130" y1="485" x2="130" y2="495" stroke="rgba(103, 232, 249, 0.4)" strokeWidth="1"/>
                      <text x="80" y="503" fill="rgba(103, 232, 249, 0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">~5 cm</text>
                    </g>
                  </svg>
                </div>

                {/* TARJETA DE ANÁLISIS HORMONAL EN TIEMPO REAL */}
                {(() => {
                  const hData = {
                    dopamina: {
                      title: '🟡 Dopamina: El Motor de la Búsqueda y Curiosidad',
                      gland: 'Área Ventral Tectal (VTA) ➔ Núcleo Accumbens',
                      pathway: 'Vía Mesolímbica y Mesocortical hacia el Hipocampo',
                      effect: 'Genera el deseo anticipatorio de saber qué pasará. Permite fijar los detalles de la lección en la memoria a largo plazo.',
                      color: '#ffd700'
                    },
                    oxitocina: {
                      title: '💖 Oxitocina: El Lazo de Empatía e Identificación',
                      gland: 'Núcleos Supraóptico y Paraventricular del Hipotálamo',
                      pathway: 'Proyección Límbica a la Amígdala y Córtex Prefrontal Ventromedial',
                      effect: 'Transforma al estudiante en participante activo. Crea empatía por los personajes y fomenta la confianza en el aula.',
                      color: '#ff007f'
                    },
                    cortisol: {
                      title: '⚡ Cortisol Controlado: El Despertador Atencional',
                      gland: 'Corteza Suprarrenal (Estimulada por Eje HPA Hipotálamo-Hipófisis)',
                      pathway: 'Circuito Límbico-Amigdalino de Alerta Atencional',
                      effect: 'El conflicto de la historia genera una dosis saludable de alerta que enfoca los sentidos sin causar fatiga o estrés crónico.',
                      color: '#ef4444'
                    },
                    endorfinas: {
                      title: '✨ Endorfinas: La Recompensa Límbica y Alivio del Estrés',
                      gland: 'Glándula Pituitaria y Sistema Nervioso Central',
                      pathway: 'Vía Opioide Endógena del Circuito de Placer y Alivio',
                      effect: 'Liberadas en giros cómicos o desenlaces victoriosos. Reducen la ansiedad matemática o científica y crean placer de aprendizaje.',
                      color: '#38bdf8'
                    },
                    todos: {
                      title: '🌈 Cóctel Neuroquímico Supremo: El Estado de Flujo ("Flow")',
                      gland: 'Sincronía Multiglandular (VTA + Hipotálamo + Amígdala + Hipófisis)',
                      pathway: 'Activación Simultánea de Redes Episódicas y Límbicas',
                      effect: 'El estudiante no siente el paso del tiempo. Absorbe y sintetiza conocimientos complejos con mínimo esfuerzo y máxima retención.',
                      color: '#c084fc'
                    }
                  }[activeMolecule];

                  return (
                    <div className="hormone-info-card">
                      <div className="h-info-item">
                        <span className="h-title">Ficha Seleccionada</span>
                        <strong className="h-val" style={{ color: hData.color }}>{hData.title}</strong>
                      </div>
                      <div className="h-info-item">
                        <span className="h-title">Glándula y Estructura Emisora</span>
                        <strong className="h-val">{hData.gland}</strong>
                      </div>
                      <div className="h-info-item">
                        <span className="h-title">Circuito Neuronal Activado</span>
                        <strong className="h-val" style={{ color: '#c084fc' }}>{hData.pathway}</strong>
                      </div>
                      <div className="h-info-item">
                        <span className="h-title">Efecto en la Memoria Episódica</span>
                        <strong className="h-val" style={{ color: '#4ade80' }}>{hData.effect}</strong>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}


          {/* MÓDULO 4: VISUALIZACIÓN EN ESPEJO COMPARATIVA DE MEMORIA */}
          {neuroModule === 'memory' && (
            <div className="neuro-card animate-fade-in">
              <div className="neuro-card-header">
                <span className="n-tag tag-cyan">🧠 Retención a Largo Plazo</span>
                <h2>Visualizador en Espejo: Memoria Semántica vs. Memoria Episódica</h2>
                <p>
                  Compara frente a frente cómo reacciona el cerebro del estudiante cuando recibe datos abstractos descontextualizados en comparación a cuando los asimila a través de una narración con significado humano.
                </p>
              </div>

              {/* SELECTOR INTERACTIVO DE ASIGNATURAS / CASOS DE ESTUDIO */}
              <div className="mirror-case-selector">
                <button 
                  className={`mirror-case-btn ${memoryCase === 'geometria' ? 'active' : ''}`}
                  onClick={() => setMemoryCase('geometria')}
                >
                  📐 Caso 1: Matemáticas & Teorema de Pitágoras
                </button>
                <button 
                  className={`mirror-case-btn ${memoryCase === 'biologia' ? 'active' : ''}`}
                  onClick={() => setMemoryCase('biologia')}
                >
                  🔬 Caso 2: Biología & Fotosíntesis Celular
                </button>
                <button 
                  className={`mirror-case-btn ${memoryCase === 'historia' ? 'active' : ''}`}
                  onClick={() => setMemoryCase('historia')}
                >
                  📜 Caso 3: Historia Universal & Fechas Clave
                </button>
              </div>

              {/* DASHBOARD EN ESPEJO LADO A LADO (SIDE-BY-SIDE MIRROR) */}
              <div className="mirror-split-grid">
                
                {/* LADO IZQUIERDO: MEMORIA SEMÁNTICA (DATO FRÍO TRADICIONAL) */}
                <div className="mirror-panel mirror-panel-semantica">
                  <div>
                    <span className="mirror-badge badge-semantica">📄 Memoria Semántica (Dato Frío)</span>
                    <h3>{memoryCase === 'geometria' ? 'Fórmula Descontextualizada' : memoryCase === 'biologia' ? 'Ecuación Química Fría' : 'Lista Cronológica de Fechas'}</h3>
                    
                    <div className="mirror-sample-box">
                      {memoryCase === 'geometria' && (
                        <code>"En todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a² + b² = c²."</code>
                      )}
                      {memoryCase === 'biologia' && (
                        <code>"Ecuación: 6 CO₂ + 6 H₂O + Luz solar → C₆H₁₂O₆ + 6 O₂. El cloroplasto absorbe fotones en la fase luminosa."</code>
                      )}
                      {memoryCase === 'historia' && (
                        <code>"1789: Toma de la Bastilla. 1791: Constitución. 1792: Primera República. Memorizar lista para el examen del viernes."</code>
                      )}
                    </div>

                    <div className="mirror-thermal-meter">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#f87171', fontWeight: 800 }}>⚡ Activación Cerebral: ~15-18% (Baja & Oscilando)</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)' }}>Solo Área de Wernicke</span>
                      </div>
                      <div className="thermal-bar-bg">
                        <div className="thermal-bar-fill thermal-bar-fill-low"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mirror-metrics-list">
                    <div className="mirror-metric-row">
                      <label>⏳ Retención a 48 Horas:</label>
                      <strong style={{ color: '#ef4444' }}>15% (Olvido Masivo)</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>🧠 Esfuerzo Atencional:</label>
                      <strong style={{ color: '#fbbf24' }}>Alto (Fatiga y Distracción)</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>💖 Resonancia Límbica:</label>
                      <strong style={{ color: '#ef4444' }}>0% (Indiferencia)</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>🧪 Neuroquímica:</label>
                      <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Sin Dopamina / Pasividad</strong>
                    </div>
                  </div>
                </div>

                {/* COLUMNA SEPARADORA VS EN ESPEJO */}
                <div className="mirror-divider-col">
                  <div className="mirror-vs-circle">VS</div>
                  <span style={{ fontSize: '0.72rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 800, textAlign: 'center' }}>Efecto Espejo</span>
                </div>

                {/* LADO DERECHO: MEMORIA EPISÓDICA (EXPERIENCIA NARRATIVA EN CUENTO) */}
                <div className="mirror-panel mirror-panel-episodica">
                  <div>
                    <span className="mirror-badge badge-episodica">📖 Memoria Episódica (Cuento Narrativo)</span>
                    <h3>{memoryCase === 'geometria' ? 'El Triángulo del Arquitecto Faraónico' : memoryCase === 'biologia' ? 'Solaria & La Misión del Cloroplasto' : 'El Diario Secreto de Mateo'}</h3>
                    
                    <div className="mirror-sample-box">
                      {memoryCase === 'geometria' && (
                        <span>"Imagina al arquitecto del Faraón en 2500 a.C. con 3 cuerdas de nudos para trazar una esquina perfecta antes de que caiga el sol..."</span>
                      )}
                      {memoryCase === 'biologia' && (
                        <span>"Sigue a Solaria, una rayo de luz solar travieso que viaja 150 millones de km para chocar con la hoja y despertar a la molécula de agua..."</span>
                      )}
                      {memoryCase === 'historia' && (
                        <span>"Abre el diario manchado de harina de Mateo, el joven panadero de París que vio por su ventana cómo el pueblo cambiaba el destino..."</span>
                      )}
                    </div>

                    <div className="mirror-thermal-meter">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#4ade80', fontWeight: 800 }}>⚡ Activación Cerebral: ~80-95% (Resonancia Total)</span>
                        <span style={{ color: '#ffd700', fontWeight: 800 }}>Córtex Visual + Hipocampo + Límbico</span>
                      </div>
                      <div className="thermal-bar-bg">
                        <div className="thermal-bar-fill thermal-bar-fill-high"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mirror-metrics-list">
                    <div className="mirror-metric-row">
                      <label>⏳ Retención a 30 Días:</label>
                      <strong style={{ color: '#4ade80' }}>82% (5.4x Superior)</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>🧠 Esfuerzo Atencional:</label>
                      <strong style={{ color: '#38bdf8' }}>Fluido ('Flow State')</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>💖 Resonancia Límbica:</label>
                      <strong style={{ color: '#ff007f' }}>94% (Empatía & Emoción)</strong>
                    </div>
                    <div className="mirror-metric-row">
                      <label>🧪 Neuroquímica:</label>
                      <strong style={{ color: '#ffd700' }}>Dopamina + Oxitocina High</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* MÓDULO 4: ESTRATEGIAS NEUROEDUCATIVAS EN EL AULA */}
          {neuroModule === 'classroom' && (
            <div className="neuro-card animate-fade-in">
              <div className="neuro-card-header">
                <span className="n-tag tag-pink">🏫 Aplicación Pedagógica en Vivo</span>
                <h2>4 Estrategias Neuroeducativas para el Aula de Clases</h2>
                <p>
                  Metodologías avanzadas basadas en evidencia neurocientífica. Haz clic y experimenta los elementos interactivos en cada ficha para probar su impacto directo en la atención y memoria del estudiante:
                </p>
              </div>

              {/* CONTENEDOR DE FICHAS DE ESTRATEGIAS INTERACTIVAS */}
              <div className="classroom-strategies-container">

                {/* ── FICHA 01: EL ANCLA DE INCERTIDUMBRE ── */}
                <div className={`strat-card strat-card-gold ${selectedStrategy === 0 ? 'active' : ''}`} onClick={() => setSelectedStrategy(0)}>
                  <div className="strat-card-header">
                    <div className="strat-badge-row">
                      <span className="strat-num-pill">01</span>
                      <span className="strat-tag tag-gold">⏱️ Inicio de Clase (0-3 min)</span>
                      <span className="strat-tag tag-amber">⚡ Disparo Dopaminérgico</span>
                    </div>
                    <h3>🪝 El Ancla de Incertidumbre</h3>
                    <p className="strat-main-desc">
                      Abre un "abismo de información" o historia inacabada en los primeros 180 segundos. Activa inmediatamente los receptores D1 de dopamina en la VTA antes de presentar la teoría abstracta.
                    </p>
                  </div>

                  {/* ELEMENTO INTERACTIVO: GENERADOR DE ANCLAS Y SIMULADOR DE ATENCIÓN */}
                  <div className="strat-interactive-box" onClick={e => e.stopPropagation()}>
                    <div className="box-title-row">
                      <span>🧪 Generador de Anclas por Materia y Simulador Atencional:</span>
                    </div>

                    <div className="subj-tabs-row">
                      {[
                        { id: 'matematicas', label: '📐 Matemáticas' },
                        { id: 'historia', label: '📜 Historia' },
                        { id: 'ciencias', label: '🧪 Ciencias' },
                        { id: 'literatura', label: '📚 Lenguaje' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          className={`subj-btn ${anchorSubject === tab.id ? 'active' : ''}`}
                          onClick={() => {
                            setAnchorSubject(tab.id as 'matematicas' | 'historia' | 'ciencias' | 'literatura');
                            setAnchorSimulated(false);
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="anchor-quote-box">
                      <span className="quote-label">💬 Pregunta Misteriosa para Iniciar la Clase:</span>
                      <p className="quote-text">
                        {anchorSubject === 'matematicas' && '"¿Cómo salvó un matemático a todo un reino atacado usando solo un triángulo incompleto y una sombra?"'}
                        {anchorSubject === 'historia' && '"¿Por qué una simple carta mal traducida cambió los límites geográficos de todo un continente en 1810?"'}
                        {anchorSubject === 'ciencias' && '"¿Por qué el agua hiper-pura a 0°C se puede congelar en un segundo si la tocas con la punta del dedo?"'}
                        {anchorSubject === 'literatura' && '"¿Qué secreto ocultó el autor en la primera palabra del capítulo para revelar el final en clave secreta?"'}
                      </p>
                    </div>

                    <button 
                      className={`strat-action-btn btn-gold ${anchorSimulated ? 'simulated' : ''}`}
                      onClick={() => setAnchorSimulated(!anchorSimulated)}
                    >
                      {anchorSimulated ? '🔄 Reiniciar Simulación' : '⚡ Simular Reacción del Aula'}
                    </button>

                    {anchorSimulated && (
                      <div className="sim-results-panel animate-fade-in">
                        <div className="sim-metric">
                          <span className="m-label">🚀 Spike Dopaminérgico</span>
                          <strong className="m-val text-gold">96% Atención Peak</strong>
                        </div>
                        <div className="sim-metric">
                          <span className="m-label">🙋‍♀️ Preguntas Espontáneas</span>
                          <strong className="m-val text-emerald">+14 Preguntas/min</strong>
                        </div>
                        <div className="sim-metric">
                          <span className="m-label">🧠 Retención Episódica</span>
                          <strong className="m-val text-cyan">+82% a Largo Plazo</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── FICHA 02: ANTROPOMORFIZAR CONCEPTOS ABSTRACTOS ── */}
                <div className={`strat-card strat-card-cyan ${selectedStrategy === 1 ? 'active' : ''}`} onClick={() => setSelectedStrategy(1)}>
                  <div className="strat-card-header">
                    <div className="strat-badge-row">
                      <span className="strat-num-pill pill-cyan">02</span>
                      <span className="strat-tag tag-cyan">🦸‍♂️ Emocionalización de Contenidos</span>
                      <span className="strat-tag tag-blue">🧠 Conexión Límbica</span>
                    </div>
                    <h3>🦸‍♂️ Antropomorfizar Conceptos Abstractos</h3>
                    <p className="strat-main-desc">
                      Transforma átomos, ecuaciones, fuerzas físicas o fechas históricas en personajes con emociones, deseos y conflictos internos para involucrar al sistema límbico.
                    </p>
                  </div>

                  {/* ELEMENTO INTERACTIVO: COMPARADOR DE MODO ABSTRACTO VS PERSONAJE */}
                  <div className="strat-interactive-box" onClick={e => e.stopPropagation()}>
                    <div className="concept-selector-row">
                      <span className="box-title">Seleccionar Concepto:</span>
                      <div className="concept-btns">
                        {[
                          { id: 'sodio', label: '🧪 Átomo de Sodio & Cloro' },
                          { id: 'pitagoras', label: '📐 Teorema de Pitágoras' },
                          { id: 'gravedad', label: '🍎 Fuerza de Gravedad' }
                        ].map(c => (
                          <button
                            key={c.id}
                            className={`concept-btn ${anthropoConcept === c.id ? 'active' : ''}`}
                            onClick={() => setAntrhopoConcept(c.id as 'sodio' | 'pitagoras' | 'gravedad')}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mode-toggle-row">
                      <button 
                        className={`toggle-mode-btn ${anthropoMode === 'abstract' ? 'active-abstract' : ''}`}
                        onClick={() => setAntrhopoMode('abstract')}
                      >
                        📄 Modo Tradicional (Fórmula Seca)
                      </button>
                      <button 
                        className={`toggle-mode-btn ${anthropoMode === 'character' ? 'active-character' : ''}`}
                        onClick={() => setAntrhopoMode('character')}
                      >
                        🦸‍♂️ Modo Antropomórfico Límbico
                      </button>
                    </div>

                    <div className={`concept-display-card ${anthropoMode}`}>
                      {anthropoMode === 'abstract' ? (
                        <div>
                          <span className="display-tag text-slate">Explicación Tradicional en Pizarra:</span>
                          <p className="display-text">
                            {anthropoConcept === 'sodio' && 'Na + Cl ➔ NaCl. Transferencia de 1 electrón desde la capa de valencia del Sodio hacia el Cloro para formar un enlace iónico.'}
                            {anthropoConcept === 'pitagoras' && 'a² + b² = c². En todo triángulo rectángulo, la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa.'}
                            {anthropoConcept === 'gravedad' && 'F = G * (m1 * m2) / r². La fuerza de atracción es proporcional al producto de sus masas e inversamente al cuadrado de la distancia.'}
                          </p>
                          <div className="retention-badge bg-red-dark">
                            😴 Retención del Alumno: <strong>14% (Memoria Semántica Plana)</strong>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="display-tag text-cyan">Narrativa Antropomórfica Activa:</span>
                          <p className="display-text text-bright">
                            {anthropoConcept === 'sodio' && '✨ "El Átomo de Sodio se siente inestable con un electrón solitario en su capa exterior. Para encontrar la paz, se lo regala con generosidad al Átomo de Cloro, creando una unión inseparable llamada Sal Marina."'}
                            {anthropoConcept === 'pitagoras' && '📐 "Dos diminutos catetos caminaban por el desierto intentando escalar una montaña. Solo al cruzar sus sombras lograron invocar a la Hipotenusa gigante para sostener el puente del reino."'}
                            {anthropoConcept === 'gravedad' && '🍎 "La Tierra se siente tan apasionadamente sola que abraza con fuerza invisible constante a cada manzana que cae, recordándole amorosamente que siempre pertenece a su suelo."'}
                          </p>
                          <div className="retention-badge bg-emerald-dark">
                            😍 Retención del Alumno: <strong>89% (Conexión Límbica & Memoria Episódica)</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── FICHA 03: EL ROL DEL ESTUDIANTE COMO CO-CREADOR ── */}
                <div className={`strat-card strat-card-purple ${selectedStrategy === 2 ? 'active' : ''}`} onClick={() => setSelectedStrategy(2)}>
                  <div className="strat-card-header">
                    <div className="strat-badge-row">
                      <span className="strat-num-pill pill-purple">03</span>
                      <span className="strat-tag tag-purple">🎮 Aprendizaje Basado en Decisiones</span>
                      <span className="strat-tag tag-violet">🔥 Engagement Activo</span>
                    </div>
                    <h3>🎭 El Rol del Estudiante como Co-Creador</h3>
                    <p className="strat-main-desc">
                      Convierte a la clase en co-autores de la lección. Presenta dilemas académicos donde los propios alumnos calculan, debaten o deciden el rumbo del personaje.
                    </p>
                  </div>

                  {/* ELEMENTO INTERACTIVO: SIMULADOR DE ELIGE TU PROPIA AVENTURA */}
                  <div className="strat-interactive-box" onClick={e => e.stopPropagation()}>
                    <div className="dilemma-scenario-box">
                      <span className="scenario-tag">📖 Dilema Narrativo en Vivo para el Aula:</span>
                      <p className="scenario-text">
                        "El viajero del tiempo ha llegado al Desierto de Cristal. El puente hacia el laboratorio se activará únicamente si el equipo de estudiantes resuelve la proporción antes de que caiga el atardecer..."
                      </p>
                    </div>

                    <div className="decision-options-grid">
                      <button
                        className={`decision-btn btn-danger ${coCreatorChoice === 'formula' ? 'selected' : ''}`}
                        onClick={() => setCoCreatorChoice('formula')}
                      >
                        🔴 Opción A: Dar la solución en la pizarra de forma tradicional
                      </button>

                      <button
                        className={`decision-btn btn-success ${coCreatorChoice === 'narrativa' ? 'selected' : ''}`}
                        onClick={() => setCoCreatorChoice('narrativa')}
                      >
                        🟢 Opción B: Desafiar a los alumnos a calcular X para salvar al personaje
                      </button>
                    </div>

                    <div className="choice-impact-panel">
                      {coCreatorChoice === 'formula' && (
                        <div className="impact-box impact-red">
                          <span>⚠️ Resultado en el Aula:</span>
                          <p>El 80% de los alumnos anota mecánicamente sin emoción. La amígdala no registra relevancia personal.</p>
                        </div>
                      )}
                      {coCreatorChoice === 'narrativa' && (
                        <div className="impact-box impact-green">
                          <span>🎉 Resultado en el Aula:</span>
                          <p>¡El 95% de los estudiantes trabaja en equipo para encontrar X = 14 en menos de 2 minutos! Celebran cuando el personaje cruza el puente.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── FICHA 04: EL GIRO DE CAUSALIDAD (ROMPER EL PATRÓN) ── */}
                <div className={`strat-card strat-card-red ${selectedStrategy === 3 ? 'active' : ''}`} onClick={() => setSelectedStrategy(3)}>
                  <div className="strat-card-header">
                    <div className="strat-badge-row">
                      <span className="strat-num-pill pill-red">04</span>
                      <span className="strat-tag tag-red">⚡ Re-Disparo Atencional</span>
                      <span className="strat-tag tag-rose">📉 Superación de Fatiga</span>
                    </div>
                    <h3>🔄 El Giro de Causalidad (Romper el Patrón)</h3>
                    <p className="strat-main-desc">
                      Hacia el minuto 20 de clase, la atención sufre una caída biológica natural. Introduce una revelación o paradoja inesperada para reactivar la secreción de noradrenalina.
                    </p>
                  </div>

                  {/* ELEMENTO INTERACTIVO: CURVA ATENCIONAL Y DETONADOR DE GIRO */}
                  <div className="strat-interactive-box" onClick={e => e.stopPropagation()}>
                    <div className="disrupt-selector-row">
                      <span className="box-title">Elegir Tipo de Giro Narrativo:</span>
                      <div className="disrupt-btns">
                        {[
                          { id: 'experimento', label: '💥 El Experimento Invertido' },
                          { id: 'villano', label: '🕵️ El Manuscrito Oculto' },
                          { id: 'anomalia', label: '🧩 La Paradoja Fisiológica' }
                        ].map(d => (
                          <button
                            key={d.id}
                            className={`disrupt-btn ${disruptType === d.id ? 'active' : ''}`}
                            onClick={() => {
                              setDisruptType(d.id as 'experimento' | 'villano' | 'anomalia');
                              setDisruptActive(false);
                            }}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="disrupt-card-preview">
                      <span className="disrupt-label">⚡ Revelación para Romper el Patrón:</span>
                      <p className="disrupt-text">
                        {disruptType === 'experimento' && '¡Esperen! El resultado que acabamos de obtener en la mezcla es EXACTAMENTE LO OPUESTO a lo que decía la ley de 1920... ¿Quién puede descubrir en 60 segundos por qué falló la teoría?'}
                        {disruptType === 'villano' && 'Acaba de salir a la luz un diario privado del científico redactado en clave donde admite que cometió un error voluntario en la página 45...'}
                        {disruptType === 'anomalia' && 'Si aplicamos esta norma de división a una célula viva, la célula debería duplicarse infinitamente en 3 segundos... ¿por qué nuestro cuerpo no explota?'}
                      </p>
                    </div>

                    <button 
                      className={`strat-action-btn btn-fire ${disruptActive ? 'disrupted' : ''}`}
                      onClick={() => setDisruptActive(!disruptActive)}
                    >
                      {disruptActive ? '💥 ¡Giro Activo! Atención en 98%' : '⚡ Inyectar Giro de Causalidad Ahora'}
                    </button>

                    {disruptActive && (
                      <div className="disrupt-graph-box animate-fade-in">
                        <div className="graph-bar-row">
                          <div className="graph-col">
                            <span className="g-time">Min 0</span>
                            <div className="g-bar bg-blue" style={{ height: '80%' }}>80%</div>
                            <span className="g-desc">Inicio</span>
                          </div>
                          <div className="graph-col">
                            <span className="g-time">Min 20</span>
                            <div className="g-bar bg-slate" style={{ height: '35%' }}>35%</div>
                            <span className="g-desc text-red">Fatiga</span>
                          </div>
                          <div className="graph-col highlight">
                            <span className="g-time">Min 22</span>
                            <div className="g-bar bg-fire-animated" style={{ height: '98%' }}>98%</div>
                            <span className="g-desc text-gold">💥 GIRO</span>
                          </div>
                          <div className="graph-col">
                            <span className="g-time">Min 45</span>
                            <div className="g-bar bg-emerald" style={{ height: '90%' }}>90%</div>
                            <span className="g-desc">Cierre</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================
          SECCIÓN 3: ARQUITECTURA Y ESTRUCTURAS DEL CUENTO (PRINCIPAL)
         ========================================================= */}
      {activeTab === 'estructuras' && (
        <div className="neuro-presentation-wrapper animate-fade-in">
          {renderStructuresContent()}
        </div>
      )}

    </div>
  );
}
