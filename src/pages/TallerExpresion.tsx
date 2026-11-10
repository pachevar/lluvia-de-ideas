import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundEffects } from '../utils/soundEffects';
import './TallerExpresion.css';

// ============================================================================
// DATOS PEDAGÓGICOS DEL TALLER DE ESCRITURA CREATIVA, VOZ Y LECTURA EXPRESIVA
// ============================================================================

interface ShowDontTellCase {
  id: string;
  title: string;
  emotion: string;
  flatSentence: string;
  sensoryUpgrades: {
    vista: string;
    oido: string;
    tacto: string;
    cinestesia: string;
  };
  masterVersion: string;
  neuroExplanation: string;
}

const SHOW_DONT_TELL_CASES: ShowDontTellCase[] = [
  {
    id: 'miedo',
    title: 'El Bosque Nocturno',
    emotion: 'Miedo / Tensión',
    flatSentence: 'El niño tenía mucho miedo mientras caminaba por el bosque oscuro.',
    sensoryUpgrades: {
      vista: 'Las ramas retorcidas proyectaban garras de sombra sobre la niebla espesa.',
      oido: 'Un crujido seco de hojas rotas resonó a su espalda, seguido de un siseo helado.',
      tacto: 'El sudor frío le pegaba la camisa a la piel mientras el viento cortaba sus mejillas.',
      cinestesia: 'Su corazón golpeaba las costillas como un pájaro atrapado y sus rodillas temblaban.'
    },
    masterVersion: 'Las ramas proyectaban garras de sombra sobre la niebla. Un crujido seco resonó a su espalda; el sudor frío heló su nuca y su corazón golpeó las costillas como un pájaro atrapado.',
    neuroExplanation: 'Al sustituir la palabra abstracta "miedo" por estímulos físicos, activas la corteza visual, auditiva y la ínsula del lector, generando simulación encarnada.'
  },
  {
    id: 'alegria',
    title: 'El Descubrimiento Mágico',
    emotion: 'Asombro / Euforia',
    flatSentence: 'Lucía se puso muy feliz cuando encontró el libro antiguo en el baúl.',
    sensoryUpgrades: {
      vista: 'Destellos dorados brotaron de las páginas de pergamino iluminando sus pupilas dilatadas.',
      oido: 'Una carcajada cristalina escapó de su garganta mientras el broche de bronce hacía ¡clic!',
      tacto: 'Sus dedos recorrieron el relieve tibio y aterciopelado de las letras grabadas en oro.',
      cinestesia: 'Un cosquilleo eléctrico subió desde sus talones y dio un salto que hizo vibrar el desván.'
    },
    masterVersion: 'Al sonar el ¡clic! del broche de bronce, destellos dorados iluminaron sus pupilas. Sus dedos acariciaron el relieve tibio del pergamino mientras una risa cristalina y un cosquilleo eléctrico la hicieron saltar.',
    neuroExplanation: 'Los verbos dinámicos y las texturas táctiles disparan dopamina en el circuito de recompensa y sincronizan las neuronas espejo de quien escucha.'
  },
  {
    id: 'enojo',
    title: 'La Tormenta Interior',
    emotion: 'Ira / Determinación',
    flatSentence: 'El capitán estaba muy enojado porque perdieron el mapa.',
    sensoryUpgrades: {
      vista: 'Sus venas resaltaron en el cuello y su mirada clavó dos carbones encendidos en la mesa.',
      oido: 'Un golpe seco de su puño hizo saltar las tazas de lata en un estruendo metálico.',
      tacto: 'Apretó la madera áspera del timón hasta que sus nudillos quedaron blancos.',
      cinestesia: 'El aire ardía en sus pulmones con respiraciones cortas entre dientes apretados.'
    },
    masterVersion: 'El puño del capitán cayó sobre la mesa haciendo saltar las tazas en un estruendo metálico. Con los nudillos blancos aferrados al timón y la respiración ardiendo entre dientes, clavó dos carbones encendidos en la tripulación.',
    neuroExplanation: 'El contraste sonoro ("estruendo metálico") y la tensión muscular descrita activan la corteza motora primaria del oyente en menos de 200 milisegundos.'
  }
];

interface RhetoricFigure {
  id: string;
  name: string;
  icon: string;
  badge: string;
  definition: string;
  plainExample: string;
  literaryExample: string;
  voiceTip: string;
}

const RHETORIC_FIGURES: RhetoricFigure[] = [
  {
    id: 'metafora',
    name: 'Metáfora Viva',
    icon: '🔮',
    badge: 'Asociación Directa',
    definition: 'Transforma una realidad en otra sin usar conectores comparativos, fusionando dos mundos en la mente.',
    plainExample: 'Sus ojos brillaban mucho en la noche.',
    literaryExample: 'Dos luciérnagas cautivas ardían bajo sus pestañas.',
    voiceTip: 'En lectura expresiva: acaricia las palabras clave ("luciérnagas", "ardían") alargando ligeramente las vocales.'
  },
  {
    id: 'personificacion',
    name: 'Prosopopeya / Personificación',
    icon: '🌬️',
    badge: 'Alma en las Cosas',
    definition: 'Otorga voluntad, voz y emociones humanas a elementos de la naturaleza o a objetos inanimados.',
    plainExample: 'El viento hacía ruido entre los árboles del volcán.',
    literaryExample: 'El viento anciano susurraba secretos antiguos en los oídos del pinar.',
    voiceTip: 'En lectura expresiva: adopta un timbre aireado y misterioso al pronunciar "susurraba secretos".'
  },
  {
    id: 'onomatopeya',
    name: 'Armonía Imitativa & Onomatopeya',
    icon: '⚡',
    badge: 'Música Verbal',
    definition: 'Recrea físicamente el sonido de la realidad mediante la repetición de consonantes o palabras sonoras.',
    plainExample: 'El río bajaba rápido chocando con las piedras.',
    literaryExample: 'El río rugía, rodaba y rompía su espuma contra la roca viva.',
    voiceTip: 'En lectura expresiva: haz vibrar con fuerza la consonante "R" para que el público sienta el agua chocar.'
  },
  {
    id: 'antitesis',
    name: 'Antítesis Dramática',
    icon: '☯️',
    badge: 'Contraste Polar',
    definition: 'Enfrenta dos ideas o sensaciones opuestas en la misma frase para crear alto voltaje poético.',
    plainExample: 'Aunque había silencio, sentía muchas ideas en su mente.',
    literaryExample: 'En aquel silencio sepulcral, gritaban mil tormentas en su pecho.',
    voiceTip: 'En lectura expresiva: lee la primera mitad en susurro grave y proyecta la segunda mitad con fuerza.'
  }
];

interface VoiceArchetype {
  id: string;
  name: string;
  icon: string;
  pitch: number; // 0.5 a 1.8
  rate: number;  // 0.6 a 1.6
  volume: number; // 0.3 a 1.0
  resonance: string;
  desc: string;
  sampleText: string;
  color: string;
}

const VOICE_ARCHETYPES: VoiceArchetype[] = [
  {
    id: 'misterio',
    name: 'Guardián del Misterio',
    icon: '🕯️',
    pitch: 0.75,
    rate: 0.80,
    volume: 0.55,
    resonance: 'Pecho y Laringe Baja (Voz Intimista)',
    desc: 'Tono grave, velocidad pausada y volumen contenido. Obliga al auditorio a inclinarse hacia adelante para escuchar.',
    sampleText: 'Nadie sabía qué aguardaba detrás de la puerta de obsidiana... hasta que la sombra respiró.',
    color: '#818cf8'
  },
  {
    id: 'epico',
    name: 'Heraldo Épico',
    icon: '🦁',
    pitch: 0.90,
    rate: 1.05,
    volume: 1.0,
    resonance: 'Diafragma Pleno y Caja Torácica',
    desc: 'Voz proyectada, firme y resonante. Ideal para clímax heroicos, discursos y momentos de valentía.',
    sampleText: '¡Levántense, navegantes de las estrellas! ¡Hoy escribiremos nuestro nombre en el horizonte!',
    color: '#f59e0b'
  },
  {
    id: 'euforia',
    name: 'Chispa de Asombro',
    icon: '✨',
    pitch: 1.35,
    rate: 1.25,
    volume: 0.90,
    resonance: 'Máscara Facial y Paladar Alto (Brillo)',
    desc: 'Entonación ascendente, ritmo ágil y luminoso. Transmite hallazgos mágicos, alegría e ingenio.',
    sampleText: '¡Funcionó! ¡Las ruedas empezaron a girar solas lanzando chispas de colores por todo el taller!',
    color: '#10b981'
  },
  {
    id: 'sabio',
    name: 'Abuelo Contador de Mitos',
    icon: '🐢',
    pitch: 0.70,
    rate: 0.75,
    volume: 0.80,
    resonance: 'Cavidad Faríngea Cálida (Tempo Pausado)',
    desc: 'Cadencia ceremonial con silencios largos y cálidos. Evoca memoria ancestral, calma y sabiduría profunda.',
    sampleText: 'Antes de que existiera el sol, cuentan los antiguos que el mundo dormía envuelto en agua y silencio.',
    color: '#38bdf8'
  }
];

interface AnnotatedScript {
  id: string;
  title: string;
  author: string;
  genre: string;
  targetPpm: number;
  lines: {
    cue: string;
    cueType: 'whisper' | 'crescendo' | 'pause' | 'staccato' | 'warm';
    text: string;
    emphasisWords: string[];
    pauseAfterMs: number;
  }[];
}

const ANNOTATED_SCRIPTS: AnnotatedScript[] = [
  {
    id: 'camazotz-echo',
    title: 'El Eco de la Caverna de Xibalbá',
    author: 'Adaptación Pedagógica Popol Vuh',
    genre: 'Suspenso Mítico',
    targetPpm: 115,
    lines: [
      {
        cue: '🔉 [Susurro grave · Lento]',
        cueType: 'whisper',
        text: 'El aire se volvió frío como el filo de un espejo de piedra. //',
        emphasisWords: ['frío', 'espejo', 'piedra'],
        pauseAfterMs: 1200
      },
      {
        cue: '⏸️ [Pausa dramática de 2 segundos · Mirar al público]',
        cueType: 'pause',
        text: 'Hunahpú contuvo el aliento. // En la bóveda oscura... // algo abrió los ojos. ▲',
        emphasisWords: ['contuvo', 'oscura', 'abrió'],
        pauseAfterMs: 1500
      },
      {
        cue: '⚡ [Staccato · Ritmo rápido y cortante]',
        cueType: 'staccato',
        text: '¡Un aleteo! ¡Dos! ¡Diez mil alas de cuero batiendo la sombra al mismo tiempo!',
        emphasisWords: ['aleteo', 'Diez', 'alas', 'sombra'],
        pauseAfterMs: 1000
      },
      {
        cue: '🌊 [Crescendo a Calma · Inflexión descendente ▼]',
        cueType: 'warm',
        text: 'Pero en el centro del huracán nocturno, // una pequeña semilla de luz comenzó a latir. ▼',
        emphasisWords: ['huracán', 'semilla', 'luz', 'latir'],
        pauseAfterMs: 1800
      }
    ]
  },
  {
    id: 'reloj-arena',
    title: 'El Relojero de las Nubes',
    author: 'Cuento de Taller Creatika',
    genre: 'Fantasía Lírica',
    targetPpm: 130,
    lines: [
      {
        cue: '🎵 [Tono Cálido y Melódico · Legato]',
        cueType: 'warm',
        text: 'En lo más alto de la torre de cobre, // don Aurelio daba cuerda a las tormentas. ▲',
        emphasisWords: ['alto', 'cobre', 'tormentas'],
        pauseAfterMs: 1000
      },
      {
        cue: '⚡ [Ritmo Ágil · Articulando cada R y T]',
        cueType: 'staccato',
        text: 'Tic-tac, giraba el trueno; // tic-tac, caía la primera gota sobre los tejados rojos.',
        emphasisWords: ['Tic-tac', 'trueno', 'primera', 'gota'],
        pauseAfterMs: 1200
      },
      {
        cue: '📈 [Crescendo Emocional · Voz brillante]',
        cueType: 'crescendo',
        text: '¡Y cuando el gran péndulo dorado tocó el mediodía, // un arcoíris entero estalló sobre la plaza! ▲',
        emphasisWords: ['péndulo', 'mediodía', 'arcoíris', 'estalló'],
        pauseAfterMs: 1500
      }
    ]
  }
];

interface DictionChallenge {
  id: string;
  level: 'Bronce' | 'Plata' | 'Oro' | 'Maestro';
  focus: string;
  text: string;
  targetSeconds: number;
  tip: string;
}

const DICTION_CHALLENGES: DictionChallenge[] = [
  {
    id: 'dic-1',
    level: 'Bronce',
    focus: 'Bilabiales y Vibrantes (P - B - R)',
    text: 'Pedro Pablo Pérez Pereira, pobre pintor portugués, pinta preciosos paisajes por poca plata para poder pasar por París.',
    targetSeconds: 9,
    tip: 'Exagera el movimiento de los labios en cada "P" y "B" sin perder claridad.'
  },
  {
    id: 'dic-2',
    level: 'Plata',
    focus: 'Grupos Consonánticos (TR - DR - GR)',
    text: 'Tres tristes tigres tragaban trigo en tres tristes trastos sentados tras un trigal; en tres tristes trastos tragaban trigo tres tristes tigres.',
    targetSeconds: 10,
    tip: 'Apoya la punta de la lengua firme detrás de los dientes superiores antes de soltar cada "TR".'
  },
  {
    id: 'dic-3',
    level: 'Oro',
    focus: 'Alveolares y Sibilantes (S - C - Z - L)',
    text: 'El cielo de Xelajú está enladrillado, ¿quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.',
    targetSeconds: 8,
    tip: 'No aceleres en "desenladrillará": separa mentalmente cada sílaba para que no se tropiece la lengua.'
  },
  {
    id: 'dic-4',
    level: 'Maestro',
    focus: 'Articulación Teatral Compleja (TL - TZ - K)',
    text: 'Bajo el tzolkin ancestral de Quetzaltenango, el quetzal despliega plumas de jade y tlapalería mientras el viento de Sutz susurra trabalenguas.',
    targetSeconds: 11,
    tip: 'Mantén la mandíbula relajada y proyecta el aire desde el diafragma en los fonemas "TZ" y "TL".'
  }
];

const IMPRO_PHRASES = [
  'Se acabó el pan y la leche en la cocina.',
  'Mañana tenemos examen de matemáticas a primera hora.',
  'Encontré una llave oxidada debajo de la alfombra.',
  'El autobús acaba de pasar sin detenerse en la esquina.',
  'Alguien dejó una caja misteriosa frente al salón.'
];

const IMPRO_EMOTIONS = [
  '🤫 Como si revelaras un secreto prohibido hace mil años',
  '🎉 Como si acabaras de ganar el campeonato mundial',
  '😱 Con terror absoluto viendo acercarse una sombra',
  '👑 Con la solemnidad de un rey antiguo ante su pueblo',
  '😂 Conteniendo un ataque de risa contagiosa'
];

const IMPRO_CHARACTERS = [
  '🕵️ Un detective privado bajo una tormenta nocturna',
  '🧙‍♂️ Un anciano hechicero que olvidó su propio conjuro',
  '🤖 Un robot explorador cuya batería está al 2%',
  '🎭 Un narrador de ópera exagerado y dramático',
  '🐿️ Un explorador diminuto hablando desde la rama de un árbol'
];

export default function TallerExpresion() {
  const navigate = useNavigate();

  // Pestaña activa principal
  const [activeTab, setActiveTab] = useState<'escritura' | 'modulacion' | 'lectura' | 'gimnasio'>('escritura');
  const [projectorMode, setProjectorMode] = useState<boolean>(false);

  // ============================================================================
  // ESTADOS MÓDULO 1: ESCRITURA CREATIVA ("SHOW, DON'T TELL" & RITMO)
  // ============================================================================
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [activeSenses, setActiveSenses] = useState<{
    vista: boolean;
    oido: boolean;
    tacto: boolean;
    cinestesia: boolean;
  }>({
    vista: true,
    oido: true,
    tacto: false,
    cinestesia: false
  });
  const [selectedFigureId, setSelectedFigureId] = useState<string>('metafora');
  const [rhythmMode, setRhythmMode] = useState<'staccato' | 'legato'>('staccato');
  const [studentDraft, setStudentDraft] = useState<string>('');

  // ============================================================================
  // ESTADOS MÓDULO 2: MODULACIÓN DE VOZ Y PROSODIA
  // ============================================================================
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceRate, setVoiceRate] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.9);
  const [customPhrase, setCustomPhrase] = useState<string>(VOICE_ARCHETYPES[0].sampleText);
  const [activeArchetypeId, setActiveArchetypeId] = useState<string>('misterio');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // ============================================================================
  // ESTADOS MÓDULO 3: LECTURA EXPRESIVA & PARTITURA LITERARIA
  // ============================================================================
  const [selectedScriptIdx, setSelectedScriptIdx] = useState<number>(0);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);
  const [isTeleprompterPlaying, setIsTeleprompterPlaying] = useState<boolean>(false);
  const [showPauseMarks, setShowPauseMarks] = useState<boolean>(true);
  const [commaDemoMode, setCommaDemoMode] = useState<'a' | 'b'>('a');
  const teleprompterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================================
  // ESTADOS MÓDULO 4: GIMNASIO ESCÉNICO (DICCIÓN, IMPRO Y RESPIRACIÓN)
  // ============================================================================
  const [selectedDictionIdx, setSelectedDictionIdx] = useState<number>(0);
  const [dictionTimer, setDictionTimer] = useState<number>(0);
  const [isDictionRunning, setIsDictionRunning] = useState<boolean>(false);
  const dictionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [improCombo, setImproCombo] = useState({
    phrase: IMPRO_PHRASES[0],
    emotion: IMPRO_EMOTIONS[0],
    character: IMPRO_CHARACTERS[0]
  });
  const [isImproSpinning, setIsImproSpinning] = useState<boolean>(false);

  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCounter, setBreathCounter] = useState<number>(4);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (teleprompterTimerRef.current) clearTimeout(teleprompterTimerRef.current);
      if (dictionIntervalRef.current) clearInterval(dictionIntervalRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  // ============================================================================
  // LÓGICA MÓDULO 1: CONSTRUCCIÓN SENSORIAL
  // ============================================================================
  const currentCase = SHOW_DONT_TELL_CASES[selectedCaseIdx];

  const activeSensoryCount = useMemo(() => {
    return Object.values(activeSenses).filter(Boolean).length;
  }, [activeSenses]);

  const builtSensoryParagraph = useMemo(() => {
    if (activeSensoryCount === 0) return currentCase.flatSentence;
    if (activeSensoryCount === 4) return currentCase.masterVersion;

    const parts: string[] = [];
    if (activeSenses.vista) parts.push(currentCase.sensoryUpgrades.vista);
    if (activeSenses.oido) parts.push(currentCase.sensoryUpgrades.oido);
    if (activeSenses.tacto) parts.push(currentCase.sensoryUpgrades.tacto);
    if (activeSenses.cinestesia) parts.push(currentCase.sensoryUpgrades.cinestesia);
    return parts.join(' ');
  }, [activeSenses, activeSensoryCount, currentCase]);

  const toggleSense = (sense: keyof typeof activeSenses) => {
    soundEffects.playClick();
    setActiveSenses(prev => ({ ...prev, [sense]: !prev[sense] }));
  };

  // ============================================================================
  // LÓGICA MÓDULO 2: SÍNTESIS VOCAL Y ARQUETIPOS
  // ============================================================================
  const applyVoiceArchetype = (arch: VoiceArchetype) => {
    soundEffects.playClick();
    setActiveArchetypeId(arch.id);
    setVoicePitch(arch.pitch);
    setVoiceRate(arch.rate);
    setVoiceVolume(arch.volume);
    setCustomPhrase(arch.sampleText);
  };

  const handleSpeakSample = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura de voz automática, ¡pero puedes interpretarla con tu propia voz siguiendo el medidor!');
      return;
    }

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(customPhrase);
    utterance.lang = 'es-MX';
    utterance.pitch = voicePitch;
    utterance.rate = voiceRate;
    utterance.volume = voiceVolume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // ============================================================================
  // LÓGICA MÓDULO 3: TELEPROMPTER DE LECTURA EXPRESIVA
  // ============================================================================
  const currentScript = ANNOTATED_SCRIPTS[selectedScriptIdx];

  useEffect(() => {
    if (!isTeleprompterPlaying) {
      if (teleprompterTimerRef.current) clearTimeout(teleprompterTimerRef.current);
      return;
    }

    const currentLine = currentScript.lines[activeLineIdx];
    const wordCount = currentLine.text.split(/\s+/).length;
    const readingTimeMs = Math.max(2400, (wordCount / currentScript.targetPpm) * 60000 + currentLine.pauseAfterMs);

    teleprompterTimerRef.current = setTimeout(() => {
      if (activeLineIdx < currentScript.lines.length - 1) {
        setActiveLineIdx(prev => prev + 1);
      } else {
        setIsTeleprompterPlaying(false);
        setActiveLineIdx(0);
      }
    }, readingTimeMs);

    return () => {
      if (teleprompterTimerRef.current) clearTimeout(teleprompterTimerRef.current);
    };
  }, [isTeleprompterPlaying, activeLineIdx, currentScript]);

  // ============================================================================
  // LÓGICA MÓDULO 4: GIMNASIO ESCÉNICO (CRONÓMETRO, RULETA Y RESPIRACIÓN)
  // ============================================================================
  const toggleDictionTimer = () => {
    soundEffects.playClick();
    if (isDictionRunning) {
      if (dictionIntervalRef.current) clearInterval(dictionIntervalRef.current);
      setIsDictionRunning(false);
    } else {
      setDictionTimer(0);
      setIsDictionRunning(true);
      const start = Date.now();
      dictionIntervalRef.current = setInterval(() => {
        setDictionTimer(Number(((Date.now() - start) / 1000).toFixed(1)));
      }, 100);
    }
  };

  const spinImproWheel = () => {
    if (isImproSpinning) return;
    soundEffects.playClick();
    setIsImproSpinning(true);

    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setImproCombo({
        phrase: IMPRO_PHRASES[Math.floor(Math.random() * IMPRO_PHRASES.length)],
        emotion: IMPRO_EMOTIONS[Math.floor(Math.random() * IMPRO_EMOTIONS.length)],
        character: IMPRO_CHARACTERS[Math.floor(Math.random() * IMPRO_CHARACTERS.length)]
      });
      if (ticks >= 10) {
        clearInterval(interval);
        setIsImproSpinning(false);
        soundEffects.playSuccess();
      }
    }, 90);
  };

  const toggleBreathingExercise = () => {
    soundEffects.playClick();
    if (breathPhase !== 'idle') {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathPhase('idle');
      setBreathCounter(4);
      return;
    }

    let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let count = 4;
    setBreathPhase('inhale');
    setBreathCounter(4);

    breathIntervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        if (phase === 'inhale') {
          phase = 'hold';
          count = 4;
        } else if (phase === 'hold') {
          phase = 'exhale';
          count = 6;
        } else {
          phase = 'inhale';
          count = 4;
        }
        setBreathPhase(phase);
      }
      setBreathCounter(count);
    }, 1000);
  };

  const selectedFigure = RHETORIC_FIGURES.find(f => f.id === selectedFigureId) || RHETORIC_FIGURES[0];
  const currentDiction = DICTION_CHALLENGES[selectedDictionIdx];

  return (
    <div className={`taller-expresion-page ${projectorMode ? 'projector-mode' : ''}`}>
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <header className="taller-header">
        <div className="taller-header-left">
          <button
            type="button"
            className="taller-back-btn"
            onClick={() => {
              soundEffects.playClick();
              navigate('/creatika');
            }}
          >
            ← Suite Creatika
          </button>
          <div className="taller-brand-badge">
            <span className="taller-badge-dot" />
            <span>PILAR CREATIKA · EXPRESIÓN & ORATORIA</span>
          </div>
        </div>

        <div className="taller-header-actions">
          <button
            type="button"
            className={`taller-projector-btn ${projectorMode ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setProjectorMode(!projectorMode);
            }}
            title="Aumentar contraste y tamaño para proyectar en clase"
          >
            🖥️ {projectorMode ? 'Modo Aula Activo' : 'Modo Proyector Aula'}
          </button>
          <button
            type="button"
            className="taller-storymachine-link"
            onClick={() => {
              soundEffects.playClick();
              navigate('/creatika/maquina-de-cuentos');
            }}
          >
            🎰 Ir a Máquina de Cuentos
          </button>
        </div>
      </header>

      {/* HERO DEL TALLER */}
      <section className="taller-hero">
        <div className="taller-hero-tag">🎙️ LABORATORIO INTERACTIVO DE LA PALABRA Y LA VOZ</div>
        <h1 className="taller-hero-title">
          Taller de <span className="taller-gradient-text">Escritura Creativa, Modulación de Voz</span> y Lectura Expresiva
        </h1>
        <p className="taller-hero-subtitle">
          Aprende a esculpir imágenes en la mente del lector, dominar las cuatro dimensiones acústicas de tu voz y transformar cualquier texto en una experiencia escénica inolvidable.
        </p>

        {/* PESTAÑAS DE NAVEGACIÓN DEL TALLER */}
        <nav className="taller-tabs-nav" aria-label="Módulos del Taller">
          <button
            type="button"
            className={`taller-tab-btn ${activeTab === 'escritura' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('escritura');
            }}
          >
            <span className="tab-icon">✍️</span>
            <div className="tab-text">
              <span className="tab-title">1. Escritura Creativa</span>
              <span className="tab-sub">Mostrar vs Contar & Ritmo</span>
            </div>
          </button>

          <button
            type="button"
            className={`taller-tab-btn ${activeTab === 'modulacion' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('modulacion');
            }}
          >
            <span className="tab-icon">🎙️</span>
            <div className="tab-text">
              <span className="tab-title">2. Modulación de Voz</span>
              <span className="tab-sub">Tono, Timbre, Ritmo y Volumen</span>
            </div>
          </button>

          <button
            type="button"
            className={`taller-tab-btn ${activeTab === 'lectura' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('lectura');
            }}
          >
            <span className="tab-icon">📖</span>
            <div className="tab-text">
              <span className="tab-title">3. Lectura Expresiva</span>
              <span className="tab-sub">Partitura Vocal & Pausas</span>
            </div>
          </button>

          <button
            type="button"
            className={`taller-tab-btn ${activeTab === 'gimnasio' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('gimnasio');
            }}
          >
            <span className="tab-icon">🎯</span>
            <div className="tab-text">
              <span className="tab-title">4. Gimnasio Escénico</span>
              <span className="tab-sub">Dicción, Impro & Respiración</span>
            </div>
          </button>
        </nav>
      </section>

      {/* ========================================================================
          MÓDULO 1: ESCRITURA CREATIVA Y SENSORIAL
          ======================================================================== */}
      {activeTab === 'escritura' && (
        <main className="taller-module-container animate-fade-in">
          {/* SUBMÓDULO 1.1: LABORATORIO "MOSTRAR, NO CONTAR" (SHOW, DON'T TELL) */}
          <section className="taller-card">
            <div className="taller-card-header">
              <div>
                <span className="taller-section-pill">REGLA DE ORO NARRATIVA</span>
                <h2 className="taller-card-title">🔬 Transformador Sensorial: «Mostrar, No Contar»</h2>
              </div>
              <div className="taller-case-selector">
                {SHOW_DONT_TELL_CASES.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`taller-chip-btn ${selectedCaseIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedCaseIdx(idx);
                    }}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            <p className="taller-card-lead">
              Un escritor novato <strong>cuenta</strong> la emoción con un adjetivo abstracto (<em>«tenía miedo»</em>). Un maestro narrador <strong>muestra</strong> lo que ven los ojos, lo que escucha el oído y lo que siente el cuerpo para que el lector experimente la emoción por sí mismo.
            </p>

            <div className="sdt-comparison-grid">
              {/* LADO A: FRASE PLANA */}
              <div className="sdt-box flat-box">
                <div className="sdt-box-label">❌ TEXTO PLANO («CONTAR»)</div>
                <p className="sdt-flat-quote">“{currentCase.flatSentence}”</p>
                <div className="sdt-meter-row">
                  <span>Activación Cerebral del Lector:</span>
                  <strong className="text-muted">20% (Solo área léxica)</strong>
                </div>
              </div>

              {/* LADO B: CONSOLA DE SENTIDOS */}
              <div className="sdt-senses-controls">
                <div className="sdt-controls-title">⚡ Activa las Capas Sensoriales:</div>
                <div className="sdt-sense-buttons">
                  <button
                    type="button"
                    className={`sdt-sense-btn ${activeSenses.vista ? 'on' : ''}`}
                    onClick={() => toggleSense('vista')}
                  >
                    <span>👁️ Vista (Imagen)</span>
                    <span className="sense-status">{activeSenses.vista ? 'ACTIVO' : 'OFF'}</span>
                  </button>
                  <button
                    type="button"
                    className={`sdt-sense-btn ${activeSenses.oido ? 'on' : ''}`}
                    onClick={() => toggleSense('oido')}
                  >
                    <span>👂 Oído (Paisaje Sonoro)</span>
                    <span className="sense-status">{activeSenses.oido ? 'ACTIVO' : 'OFF'}</span>
                  </button>
                  <button
                    type="button"
                    className={`sdt-sense-btn ${activeSenses.tacto ? 'on' : ''}`}
                    onClick={() => toggleSense('tacto')}
                  >
                    <span>✋ Tacto (Textura/Temperatura)</span>
                    <span className="sense-status">{activeSenses.tacto ? 'ACTIVO' : 'OFF'}</span>
                  </button>
                  <button
                    type="button"
                    className={`sdt-sense-btn ${activeSenses.cinestesia ? 'on' : ''}`}
                    onClick={() => toggleSense('cinestesia')}
                  >
                    <span>💓 Cinestesia (Latido/Cuerpo)</span>
                    <span className="sense-status">{activeSenses.cinestesia ? 'ACTIVO' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* LADO C: ESCENA VIVA */}
              <div className="sdt-box vivid-box">
                <div className="sdt-box-label">✨ ESCENA SENSORIAL («MOSTRAR» · {activeSensoryCount}/4 sentidos)</div>
                <p className="sdt-vivid-quote">“{builtSensoryParagraph}”</p>
                <div className="sdt-meter-row">
                  <span>Inmersión Neurocognitiva:</span>
                  <strong className="text-emerald">{20 + activeSensoryCount * 20}% ({activeSensoryCount >= 3 ? 'Simulación Encarnada Total' : 'En progreso'})</strong>
                </div>
              </div>
            </div>

            <div className="taller-neuro-insight">
              <span className="neuro-icon">🧠</span>
              <div>
                <strong>Fundamento Neuroeducativo:</strong> {currentCase.neuroExplanation}
              </div>
            </div>
          </section>

          {/* SUBMÓDULO 1.2: FORJA DE FIGURAS LITERARIAS Y MUSICALIDAD */}
          <div className="taller-two-cols">
            <section className="taller-card">
              <span className="taller-section-pill">ALQUIMIA DE LAS PALABRAS</span>
              <h3 className="taller-card-title">🔮 Figuras Retóricas que Despiertan la Voz</h3>
              <div className="rhetoric-selector-row">
                {RHETORIC_FIGURES.map(fig => (
                  <button
                    key={fig.id}
                    type="button"
                    className={`rhetoric-pill-btn ${selectedFigureId === fig.id ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedFigureId(fig.id);
                    }}
                  >
                    <span>{fig.icon}</span>
                    <span>{fig.name}</span>
                  </button>
                ))}
              </div>

              <div className="rhetoric-detail-box">
                <div className="rhetoric-badge-row">
                  <span className="rhetoric-tag">{selectedFigure.badge}</span>
                </div>
                <p className="rhetoric-def">{selectedFigure.definition}</p>
                <div className="rhetoric-examples">
                  <div className="rhetoric-ex plain">
                    <small>Expresión común:</small>
                    <p>“{selectedFigure.plainExample}”</p>
                  </div>
                  <div className="rhetoric-ex literary">
                    <small>Expresión literaria:</small>
                    <p>“{selectedFigure.literaryExample}”</p>
                  </div>
                </div>
                <div className="rhetoric-voice-tip">
                  🎙️ <strong>Consejo de Interpretación Vocal:</strong> {selectedFigure.voiceTip}
                </div>
              </div>
            </section>

            {/* SUBMÓDULO 1.3: CADENCIA Y RITMO SINTÁCTICO */}
            <section className="taller-card">
              <span className="taller-section-pill">LA MÚSICA DE LA PUNTUACIÓN</span>
              <h3 className="taller-card-title">🥁 El Ritmo de la Frase: Staccato vs. Legato</h3>
              <p className="taller-card-lead">
                La longitud de tus oraciones controla la respiración del lector y el pulso cardíaco de la escena.
              </p>

              <div className="rhythm-toggle-group">
                <button
                  type="button"
                  className={`rhythm-mode-btn ${rhythmMode === 'staccato' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setRhythmMode('staccato');
                  }}
                >
                  ⚡ Ritmo Staccato (Acción y Vértigo)
                </button>
                <button
                  type="button"
                  className={`rhythm-mode-btn ${rhythmMode === 'legato' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setRhythmMode('legato');
                  }}
                >
                  🌊 Ritmo Legato (Contemplación y Misterio)
                </button>
              </div>

              {rhythmMode === 'staccato' ? (
                <div className="rhythm-showcase staccato">
                  <div className="rhythm-bars">
                    <span style={{ height: '85%' }} />
                    <span style={{ height: '40%' }} />
                    <span style={{ height: '95%' }} />
                    <span style={{ height: '35%' }} />
                    <span style={{ height: '90%' }} />
                    <span style={{ height: '45%' }} />
                    <span style={{ height: '100%' }} />
                  </div>
                  <p className="rhythm-quote">
                    “Corrió. El puente crujió bajo sus botas. Una tabla cayó al vacío. Miró atrás. La niebla avanzaba. Saltó.”
                  </p>
                  <p className="rhythm-analysis">
                    <strong>Efecto Técnico:</strong> Oraciones de 1 a 6 palabras separadas por punto y seguido. Crean jadeo respiratorio, urgencia e impacto percusivo.
                  </p>
                </div>
              ) : (
                <div className="rhythm-showcase legato">
                  <div className="rhythm-bars legato-bars">
                    <span style={{ height: '50%' }} />
                    <span style={{ height: '65%' }} />
                    <span style={{ height: '75%' }} />
                    <span style={{ height: '70%' }} />
                    <span style={{ height: '55%' }} />
                    <span style={{ height: '60%' }} />
                    <span style={{ height: '50%' }} />
                  </div>
                  <p className="rhythm-quote">
                    “Mientras la tarde descendía suavemente sobre los volcanes dormidos, el lago reflejaba las primeras estrellas como un espejo de plata líquida que invitaba al silencio.”
                  </p>
                  <p className="rhythm-analysis">
                    <strong>Efecto Técnico:</strong> Cláusulas subordinadas amplias y melodiosas. Inducen ondas alfa de calma, ensoñación poética y respiración profunda.
                  </p>
                </div>
              )}

              {/* MINI RETO DE ESCRITURA EN VIVO */}
              <div className="mini-writing-sandbox">
                <label className="sandbox-label">
                  ✍️ <strong>Prueba tu Pluma:</strong> Escribe una frase describiendo una tormenta sin usar la palabra «lluvia» ni «miedo»:
                </label>
                <textarea
                  className="sandbox-textarea"
                  rows={2}
                  value={studentDraft}
                  onChange={(e) => setStudentDraft(e.target.value)}
                  placeholder="Ej: Mil agujas de cristal golpearon el tejado de zinc mientras el cielo rugía..."
                />
                {studentDraft.trim().length > 10 && (
                  <div className="sandbox-feedback">
                    <span>✨ ¡Excelente! Has escrito <strong>{studentDraft.trim().split(/\s+/).length} palabras</strong>.</span>
                    {(/lluvia|miedo/i.test(studentDraft)) ? (
                      <span className="warn"> ⚠️ ¡Cuidado! Usaste una palabra prohibida ("lluvia" o "miedo"). ¡Reemplázala por una imagen sensorial!</span>
                    ) : (
                      <span className="ok"> ✅ ¡Cumpliste el reto sin usar palabras prohibidas!</span>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* ========================================================================
          MÓDULO 2: MODULACIÓN DE VOZ Y PROSODIA
          ======================================================================== */}
      {activeTab === 'modulacion' && (
        <main className="taller-module-container animate-fade-in">
          <section className="taller-card">
            <div className="taller-card-header">
              <div>
                <span className="taller-section-pill">EL INSTRUMENTO HUMANO</span>
                <h2 className="taller-card-title">🎚️ Consola Interactiva de Modulación Prosódica</h2>
              </div>
              <button
                type="button"
                className={`voice-synth-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleSpeakSample}
              >
                {isSpeaking ? '⏹️ Detener Voz' : '🔊 Escuchar Modulación en Vivo'}
              </button>
            </div>

            <p className="taller-card-lead">
              La monotonía es el enemigo de la atención. Cuando hablas o lees en público, tu voz posee <strong>4 variables acústicas fundamentales</strong> que puedes combinar como un director de orquesta:
            </p>

            {/* SELECTOR DE ARQUETIPOS VOCALES */}
            <div className="voice-archetypes-grid">
              {VOICE_ARCHETYPES.map((arch) => (
                <button
                  key={arch.id}
                  type="button"
                  className={`voice-arch-card ${activeArchetypeId === arch.id ? 'active' : ''}`}
                  style={{ '--arch-color': arch.color } as React.CSSProperties}
                  onClick={() => applyVoiceArchetype(arch)}
                >
                  <div className="arch-card-top">
                    <span className="arch-icon">{arch.icon}</span>
                    <span className="arch-name">{arch.name}</span>
                  </div>
                  <p className="arch-desc">{arch.desc}</p>
                  <div className="arch-resonance">🫁 {arch.resonance}</div>
                </button>
              ))}
            </div>

            {/* DESLIZADORES ACÚSTICOS INTERACTIVOS */}
            <div className="voice-sliders-console">
              <div className="voice-slider-box">
                <div className="slider-label-row">
                  <span>🎵 1. Tono / Altura (Pitch)</span>
                  <strong className="slider-val">
                    {voicePitch < 0.85 ? 'Grave (Solemnidad / Misterio)' : voicePitch > 1.15 ? 'Agudo (Brillo / Asombro)' : 'Medio Natural'} ({voicePitch.toFixed(2)}x)
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.6"
                  step="0.05"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch( parseFloat(e.target.value) )}
                  className="taller-range"
                />
                <div className="slider-extremes">
                  <span>Grave Profundo</span>
                  <span>Equilibrado</span>
                  <span>Agudo Brillante</span>
                </div>
              </div>

              <div className="voice-slider-box">
                <div className="slider-label-row">
                  <span>⏱️ 2. Velocidad / Tempo (Rate)</span>
                  <strong className="slider-val">
                    {voiceRate < 0.85 ? 'Pausado (Suspenso / Reflexión)' : voiceRate > 1.15 ? 'Rápido (Acción / Euforia)' : 'Moderado Conversacional'} ({voiceRate.toFixed(2)}x)
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate( parseFloat(e.target.value) )}
                  className="taller-range"
                />
                <div className="slider-extremes">
                  <span>Lento Ceremonial</span>
                  <span>Fluido</span>
                  <span>Vértigo / Acción</span>
                </div>
              </div>

              <div className="voice-slider-box">
                <div className="slider-label-row">
                  <span>📢 3. Intensidad / Volumen (Dynamics)</span>
                  <strong className="slider-val">
                    {voiceVolume < 0.6 ? 'Pianissimo (Susurro Íntimo)' : voiceVolume > 0.85 ? 'Forte (Proyección Escénica)' : 'Mezzoforte (Natural)'} ({Math.round(voiceVolume * 100)}%)
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1.0"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume( parseFloat(e.target.value) )}
                  className="taller-range"
                />
                <div className="slider-extremes">
                  <span>Susurro Confidencial</span>
                  <span>Sala Media</span>
                  <span>Auditorio Completo</span>
                </div>
              </div>
            </div>

            {/* VISUALIZADOR DE ONDA Y FRASE DE PRUEBA */}
            <div className="voice-wave-monitor">
              <div className="wave-bars-visualizer">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const baseHeight = Math.sin((idx / 24) * Math.PI) * 70 * voiceVolume + 15;
                  return (
                    <span
                      key={idx}
                      className={`wave-bar ${isSpeaking ? 'animating' : ''}`}
                      style={{
                        height: `${Math.min(100, Math.max(12, baseHeight))}%`,
                        animationDuration: `${(0.8 / voiceRate).toFixed(2)}s`,
                        backgroundColor: voicePitch > 1.15 ? '#10b981' : voicePitch < 0.85 ? '#818cf8' : '#f59e0b'
                      }}
                    />
                  );
                })}
              </div>

              <div className="voice-phrase-input-box">
                <label>Frase para modular e interpretar en voz alta:</label>
                <input
                  type="text"
                  className="voice-phrase-input"
                  value={customPhrase}
                  onChange={(e) => setCustomPhrase(e.target.value)}
                />
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================
          MÓDULO 3: LECTURA EXPRESIVA & PARTITURA LITERARIA
          ======================================================================== */}
      {activeTab === 'lectura' && (
        <main className="taller-module-container animate-fade-in">
          <section className="taller-card">
            <div className="taller-card-header">
              <div>
                <span className="taller-section-pill">TEATRO EN ATRIL Y ENTONACIÓN</span>
                <h2 className="taller-card-title">🎼 Teleprompter de Partitura Literaria</h2>
              </div>

              <div className="teleprompter-controls">
                {ANNOTATED_SCRIPTS.map((sc, i) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`taller-chip-btn ${selectedScriptIdx === i ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setIsTeleprompterPlaying(false);
                      setSelectedScriptIdx(i);
                      setActiveLineIdx(0);
                    }}
                  >
                    📜 {sc.title}
                  </button>
                ))}
                <button
                  type="button"
                  className={`teleprompter-play-btn ${isTeleprompterPlaying ? 'playing' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setIsTeleprompterPlaying(!isTeleprompterPlaying);
                  }}
                >
                  {isTeleprompterPlaying ? '⏸️ Pausar Guía' : '▶️ Iniciar Lectura Guiada'}
                </button>
              </div>
            </div>

            {/* LEYENDA DE SIGNOS DE NOTACIÓN VOCAL */}
            <div className="notation-legend">
              <div className="legend-item">
                <span className="legend-symbol">//</span>
                <span>Pausa respiratoria o silencio psicológico</span>
              </div>
              <div className="legend-item">
                <span className="legend-symbol">▲</span>
                <span>Inflexión ascendente (expectativa / pregunta)</span>
              </div>
              <div className="legend-item">
                <span className="legend-symbol">▼</span>
                <span>Inflexión descendente (certeza / cierre grave)</span>
              </div>
              <div className="legend-item">
                <span className="legend-symbol">Subrayado Ámbar</span>
                <span>Palabra cumbre (golpe de voz enfático)</span>
              </div>
              <button
                type="button"
                className="toggle-marks-btn"
                onClick={() => setShowPauseMarks(!showPauseMarks)}
              >
                {showPauseMarks ? '👁️ Ocultar Marcas Técnicas' : '👁️ Mostrar Marcas Técnicas'}
              </button>
            </div>

            {/* ESCENARIO DEL TEXTO ANOTADO */}
            <div className="script-stage">
              {currentScript.lines.map((line, idx) => {
                const isCurrent = activeLineIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`script-line-card ${isCurrent ? 'active-line' : ''} cue-${line.cueType}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveLineIdx(idx);
                    }}
                  >
                    {showPauseMarks && (
                      <div className="script-cue-badge">{line.cue}</div>
                    )}
                    <p className="script-line-text">
                      {line.text.split(' ').map((word, wIdx) => {
                        const cleanWord = word.replace(/[.,¡!¿?;:]/g, '');
                        const isEmphasized = line.emphasisWords.includes(cleanWord);
                        if (!showPauseMarks && (word === '//' || word === '▲' || word === '▼')) {
                          return null;
                        }
                        if (word === '//' || word === '▲' || word === '▼') {
                          return <span key={wIdx} className="notation-mark"> {word} </span>;
                        }
                        return (
                          <span
                            key={wIdx}
                            className={isEmphasized && showPauseMarks ? 'emphasized-word' : ''}
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LABORATORIO DE LA PAUSA Y LA COMA */}
          <section className="taller-card">
            <span className="taller-section-pill">EL PODER DEL SILENCIO</span>
            <h3 className="taller-card-title">⏸️ Cómo una Pausa Cambia el Destino de una Frase</h3>
            <p className="taller-card-lead">
              En la lectura expresiva, <strong>el silencio habla tanto como la voz</strong>. Observa cómo la ubicación de una sola pausa transforma por completo el sentido:
            </p>

            <div className="comma-lab-grid">
              <div
                className={`comma-card ${commaDemoMode === 'a' ? 'selected' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setCommaDemoMode('a');
                }}
              >
                <span className="comma-badge">VERSIÓN A · Con Pausa Tras el «No»</span>
                <p className="comma-sentence">“<strong>No,</strong> // espere.”</p>
                <p className="comma-meaning">
                  🎯 <strong>Significado:</strong> ¡Clemencia! Le pides a la persona que se detenga y espere.
                </p>
              </div>

              <div
                className={`comma-card ${commaDemoMode === 'b' ? 'selected' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setCommaDemoMode('b');
                }}
              >
                <span className="comma-badge">VERSIÓN B · Sin Pausa (Corrido)</span>
                <p className="comma-sentence">“<strong>No espere.</strong> ▼”</p>
                <p className="comma-meaning">
                  ⚡ <strong>Significado:</strong> Orden inmediata de actuar ahora mismo sin detenerse.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================
          MÓDULO 4: GIMNASIO ESCÉNICO (DICCIÓN, IMPRO Y RESPIRACIÓN)
          ======================================================================== */}
      {activeTab === 'gimnasio' && (
        <main className="taller-module-container animate-fade-in">
          <div className="taller-two-cols">
            {/* EJERCICIO 4.1: RETO DE DICCIÓN Y ARTICULACIÓN */}
            <section className="taller-card">
              <span className="taller-section-pill">AGILIDAD ARTICULATORIA</span>
              <h3 className="taller-card-title">👅 Gimnasio de Dicción con Cronómetro</h3>
              <div className="diction-levels-row">
                {DICTION_CHALLENGES.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`taller-chip-btn ${selectedDictionIdx === i ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedDictionIdx(i);
                      if (dictionIntervalRef.current) clearInterval(dictionIntervalRef.current);
                      setIsDictionRunning(false);
                      setDictionTimer(0);
                    }}
                  >
                    🏅 Nivel {d.level}
                  </button>
                ))}
              </div>

              <div className="diction-stage-box">
                <div className="diction-focus-tag">Foco Muscular: {currentDiction.focus}</div>
                <p className="diction-tongue-twister">“{currentDiction.text}”</p>
                <div className="diction-tip">💡 <strong>Técnica:</strong> {currentDiction.tip}</div>

                <div className="diction-timer-bar">
                  <div className="timer-readout">
                    <span>⏱️ Tiempo: <strong>{dictionTimer.toFixed(1)}s</strong></span>
                    <span className="target-time">Meta: ≤ {currentDiction.targetSeconds}s con dicción limpia</span>
                  </div>
                  <button
                    type="button"
                    className={`diction-start-btn ${isDictionRunning ? 'stop' : ''}`}
                    onClick={toggleDictionTimer}
                  >
                    {isDictionRunning ? '🛑 ¡Terminé de Leer!' : '🏁 Iniciar Cronómetro'}
                  </button>
                </div>

                {!isDictionRunning && dictionTimer > 0 && (
                  <div className={`diction-result ${dictionTimer <= currentDiction.targetSeconds ? 'win' : 'try'}`}>
                    {dictionTimer <= currentDiction.targetSeconds
                      ? `🏆 ¡Impresionante! Lo lograste en ${dictionTimer.toFixed(1)}s superando la meta de ${currentDiction.targetSeconds}s.`
                      : `👏 ¡Buen intento (${dictionTimer.toFixed(1)}s)! Respira profundo y vuelve a intentarlo articulando cada sílaba.`}
                  </div>
                )}
              </div>
            </section>

            {/* EJERCICIO 4.2: RULETA DEL CAMALEÓN VOCAL */}
            <section className="taller-card">
              <span className="taller-section-pill">IMPROVISACIÓN EXPRESIVA</span>
              <h3 className="taller-card-title">🎭 Ruleta del Camaleón Vocal</h3>
              <p className="taller-card-lead">
                El significado de una frase no está solo en el diccionario, sino en la <strong>intención emocional</strong> con que la dices. ¡Gira la ruleta y actúa el reto frente al grupo!
              </p>

              <div className="impro-slots-box">
                <div className="impro-slot">
                  <span className="slot-label">1. TEXTO A LEER EN VOZ ALTA</span>
                  <div className="slot-val phrase">“{improCombo.phrase}”</div>
                </div>
                <div className="impro-slot">
                  <span className="slot-label">2. INTENCIÓN EMOCIONAL</span>
                  <div className="slot-val emotion">{improCombo.emotion}</div>
                </div>
                <div className="impro-slot">
                  <span className="slot-label">3. PERSONAJE ESCÉNICO</span>
                  <div className="slot-val char">{improCombo.character}</div>
                </div>
              </div>

              <button
                type="button"
                className="impro-spin-btn"
                onClick={spinImproWheel}
                disabled={isImproSpinning}
              >
                {isImproSpinning ? '🎰 Combinando Reto Escénico...' : '🎲 Girar Ruleta de Improvisación'}
              </button>
            </section>
          </div>

          {/* EJERCICIO 4.3: RESPIRACIÓN DIAFRAGMÁTICA GUIADA */}
          <section className="taller-card breath-card">
            <div className="breath-info-col">
              <span className="taller-section-pill">APOYO RESPIRATORIO Y CALMA ESCÉNICA</span>
              <h3 className="taller-card-title">🫁 Entrenador de Respiración Diafragmática (4 - 4 - 6)</h3>
              <p className="taller-card-lead">
                Antes de leer en público o grabar un relato, oxigena tu cerebro y apoya la columna de aire en el músculo diafragma:
              </p>
              <ul className="breath-steps-list">
                <li><strong>1. Inhala en 4 segundos:</strong> Lleva el aire hacia el abdomen bajo sin levantar los hombros.</li>
                <li><strong>2. Retén en 4 segundos:</strong> Siente las costillas flotantes expandidas con calma.</li>
                <li><strong>3. Exhala en 6 segundos:</strong> Suelta el aire pronunciando una «S» suave y constante (<em>ssssss...</em>).</li>
              </ul>
              <button
                type="button"
                className={`breath-toggle-btn ${breathPhase !== 'idle' ? 'active' : ''}`}
                onClick={toggleBreathingExercise}
              >
                {breathPhase !== 'idle' ? '⏹️ Detener Ejercicio' : '🌬️ Iniciar Guía de Respiración'}
              </button>
            </div>

            <div className="breath-visualizer-col">
              <div className={`breath-orb phase-${breathPhase}`}>
                <span className="breath-phase-label">
                  {breathPhase === 'idle' && 'LISTO'}
                  {breathPhase === 'inhale' && 'INHALA'}
                  {breathPhase === 'hold' && 'SOSTÉN'}
                  {breathPhase === 'exhale' && 'EXHALA (Ssss)'}
                </span>
                {breathPhase !== 'idle' && (
                  <span className="breath-seconds">{breathCounter}s</span>
                )}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

