import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { PortalConfig } from '../types';
import { generateDefaultTechTree } from '../utils/techTreeUtils';
import { CONTACT } from '../constants';

interface PortalConfigContextProps {
  config: PortalConfig;
  loading: boolean;
  saveConfigToFirestore: (newConfig: PortalConfig) => Promise<void>;
  resetConfigToFirestore: () => Promise<void>;
}

export const DEFAULT_CONFIG: PortalConfig = {
  hero: {
    slogan: "jugamos para aprender, aprendemos para crear"
  },
  minecraft: {
    ip: "mc.lluviadeideaseditorial.com",
    url: "https://mc.lluviadeideaseditorial.com/"
  },
  stories: [
    {
      id: "camazotz",
      title: "Camazotz (El Dios Murciélago)",
      role: "Señor de la Noche y la Muerte en Xibalbá",
      summary: "En la cosmología maya y el libro sagrado del Popol Vuh, Camazotz es un temible dios murciélago asociado con la oscuridad, la noche y el sacrificio. Habita en Zotzilha (la Casa de los Murciélagos) en el inframundo de Xibalbá. Cuando los gemelos héroes, Hunahpú e Ixbalanqué, tuvieron que pernoctar en este lúgubre recinto, Hunahpú asomó su cabeza para comprobar si ya amanecía y fue decapitado por el veloz vuelo de Camazotz, quien llevó su cabeza al juego de pelota para regocijo de los señores de Xibalbá."
    },
    {
      id: "ixkik",
      title: "Ixkik (Luna de Sangre)",
      role: "Madre de los Gemelos Héroes del Popol Vuh",
      summary: "Ixkik, hija del señor de Xibalbá Cuchumaquic, es una figura de audacia femenina y maternidad mística. Atraída por la prohibición, se acercó al árbol de morro donde colgaba la cabeza de Hun-Hunahpú. La calavera escupió en su palma y le concedió la descendencia de los héroes gemelos. Acusada de deshonra en el inframundo, esquivó a sus verdugos entregándoles un corazón falso hecho de savia roja y ascendió a la superficie de la tierra para ganarse la confianza de Ixmukané y proteger a sus hijos."
    },
    {
      id: "ixmukanne",
      title: "Ixmukané (La Abuela Creadora)",
      role: "Diosa Primordial del Maíz y Adivina Sagrada",
      summary: "Ixmukané (también llamada Xmucané) es la abuela divina, sabia y tejedora del destino de la creación en el Popol Vuh. Junto a su consorte Ixpiyacoc, participó en los tres intentos de creación del universo. Es ella quien mole la mazorca de maíz amarillo y blanco nueve veces para moldear la carne y la sangre de los primeros cuatro hombres de maíz verdaderos. Su sabiduría espiritual guía a las generaciones y representa la conexión con las raíces de la tierra."
    },
    {
      id: "juracan",
      title: "Juracán (El Corazón del Cielo)",
      role: "Dios Primordial de las Tormentas, el Viento y el Fuego",
      summary: "Juracán (U K'ux Kaj, el Corazón del Cielo) es el dios creador del viento y las tormentas en el Popol Vuh. Su soplo cósmico y su relámpago dieron el impulso inicial para moldear la geografía terrestre y las aguas primordiales. Desató el gran diluvio que castigó a los hombres de madera en la segunda creación por su falta de memoria e ingratitud. Su nombre ha trascendido el tiempo dando origen al término lingüístico moderno 'huracán'."
    },
    {
      id: "ququmatz",
      title: "Ququmatz (La Serpiente Emplumada)",
      role: "Dios Soberano de la Sabiduría, el Agua y el Viento",
      summary: "Ququmatz es el dios creador representado como la Serpiente Emplumada de plumas verdes y azules resplandecientes. En el Popol Vuh, se une a Tepeu y Juracán para diseñar y dar vida al mundo habitado. Es una deidad con facultades chamánicas excepcionales: capaz de descender al inframundo, transformarse en jaguar, águila o serpiente de cascabel, y ascender a los cielos. Simboliza la perfecta armonía entre el conocimiento celestial y la fuerza de la tierra."
    }
  ],
  gateways: {
    labDesc: "¡Conviértete en un experto en herramientas pedagógicas de vanguardia! Explora metodologías activas a través del arte, el teatro, la gamificación y el diseño sostenible para transformar tu aula.",
    casaDesc: "Una antigua mansión embrujada esconde los relatos del Sombrerón, la Siguanaba y el Cadejo. Recorre cada habitación, resuelve los acertijos cifrados con astucia y libera los mitos de Guatemala."
  },
  laboratorios: {
    intro: "¡Conviértete en un experto en herramientas de vanguardia para hacer de tu clase un lugar innovador, dinámico y creativo! Explora nuestros 10 módulos formativos diseñados para transformar la práctica docente y cautivar a tus estudiantes a través de experiencias de aprendizaje basadas en la narrativa, el juego y la expresión artística.",
    modules: [
      {
        id: 1,
        title: "Máquina de Cuentos",
        icon: "🎭",
        competency: "Diseña estrategias lúdicas para el desbloqueo creativo y la estructuración espontánea de relatos en el aula.",
        skills: ["Fluidez e imaginación narrativa", "Agilidad mental", "Pensamiento asociativo", "Capacidad para guiar a los alumnos en la superación del 'miedo a la hoja en blanco'"],
        date: "Viernes, 12 de Junio",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 2,
        title: "Creación de Personajes e Historias (El Viaje del Héroe)",
        icon: "🗺️",
        competency: "Aplica la estructura arquetípica del Viaje del Héroe para diseñar secuencias didácticas motivadoras donde el estudiante se convierta en el protagonista de su propio aprendizaje.",
        skills: ["Pensamiento de diseño narrativo (storytelling)", "Análisis de personajes", "Estructuración de metas y desafíos pedagógicos", "Fomento de la resiliencia en los alumnos"],
        date: "Viernes, 3 de Julio",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 3,
        title: "Lectura Creativa",
        icon: "📖",
        competency: "Transforma el acto pasivo de la lectura en una experiencia sensorial y escénica interactiva (lectura dramatizada, paisajes sonoros, etc.).",
        skills: ["Comprensión lectora profunda", "Interpretación vocal", "Animación lectora", "Capacidad para despertar el hábito de la lectura mediante el juego"],
        date: "Viernes, 17 de Julio",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 4,
        title: "Arte Terapia y sus Herramientas",
        icon: "🎨",
        competency: "Utiliza la expresión plástica y visual como un canal de contención emocional, autoconocimiento y diagnóstico del clima escolar.",
        skills: ["Empatía", "Escucha activa a través del arte", "Sensibilidad estética", "Manejo de dinámicas de relajación y resolución de conflictos mediante el color y la forma"],
        date: "Viernes, 31 de Julio",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 5,
        title: "Construcción de Personajes (Taller Práctico con Reciclaje)",
        icon: "🛠️",
        competency: "Desarrolla proyectos tridimensionales utilizando materiales de descarte, vinculando la conciencia ambiental con la conceptualización de personajes.",
        skills: ["Psicomotricidad fina", "Pensamiento ecológico y sostenible", "Resolución de problemas con recursos limitados", "Pedagogía basada en el diseño manual (maker)"],
        date: "Viernes, 14 de Agosto",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 6,
        title: "Escritura Creativa en el Universo de Juracán",
        icon: "🌪️",
        competency: "Integra la mitología e identidad cultural local como detonantes para la creación de textos literarios y el análisis crítico de textos históricos.",
        skills: ["Redacción literaria", "Contextualización cultural", "Investigación histórica-mitológica", "Reinterpretación de narrativas ancestrales aplicadas al currículo"],
        date: "Viernes, 28 de Agosto",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 7,
        title: "El Escenario para Enseñar (Herramientas de Teatro)",
        icon: "🎪",
        competency: "Domina el espacio áulico utilizando la voz, el cuerpo y la presencia escénica como recursos didácticos de alto impacto para captar la atención.",
        skills: ["Expresión corporal", "Modulación de la voz", "Manejo de la improvisación frente a imprevistos", "Proyección escénica para mantener el interés del grupo"],
        date: "Viernes, 11 de Septiembre",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 8,
        title: "Emprendiendo en el Aula",
        icon: "🚀",
        competency: "Implementa metodologías activas que ayuden a los estudiantes a identificar sus talentos individuales, pasiones y potencial emprendedor.",
        skills: ["Pensamiento crítico", "Visión de liderazgo", "Orientación al logro", "Resiliencia ante el fracaso", "Metodologías para el descubrimiento vocacional"],
        date: "Viernes, 25 de Septiembre",
        time: "2:00 PM a 5:00 PM",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 9,
        title: "Danza Ancestral",
        icon: "💃",
        competency: "Utiliza el movimiento corporal rítmico y la reconexión con las raíces culturales para liberar tensiones y desbloquear barreras emocionales colectivas.",
        skills: ["Expresión rítmica", "Superación del pánico escénico", "Desinhibición formativa", "Cohesión grupal", "Autoconfianza física"],
        date: "Por acordar con el grupo (antes de finalizar sep.)",
        time: "Por definir (con el grupo)",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      },
      {
        id: 10,
        title: "Gamificación: Construyendo Narrativas Interactivas",
        icon: "🎮",
        competency: "Diseña entornos de aprendizaje basados en la mecánica de los juegos (puntos, niveles, misiones) para potenciar la motivación intrínseca del estudiante.",
        skills: ["Pensamiento lógico-lúdico", "Diseño de experiencias de usuario (UX) pedagógicas", "Estructuración de sistemas de recompensa", "Evaluación formativa interactiva"],
        date: "Por acordar con el grupo (antes de finalizar sep.)",
        time: "Por definir (con el grupo)",
        location: "Lugar céntrico por confirmar",
        type: "Presencial"
      }
    ]
  },
  colors: {
    primary: "#a855f7",
    tertiary: "#ec4899",
    'bg-main': "#fbf9ff",
    'text-title': "#1a082e"
  },
  creatika: {
    storyMachineIntro: "Combina personaje, escenario y conflicto para generar ideas de historias al instante.",
    colorTheoryIntro: "Explora la ciencia del color, modos HSL, contrastes y armonías interactivas."
  },
  tek100: {
    numberSequencesIntro: "Descubre patrones lógicos, sucesiones algebraicas y retos de agilidad mental.",
    solarSystemIntro: "Navega en 3D por la órbita de los planetas y sus magnitudes astronómicas."
  },
  catalogoConfig: {
    announcement: "¡Nuevas publicaciones y guías pedagógicas disponibles para el ciclo escolar!",
    whatsappPhone: CONTACT.whatsappPhone
  },
  landingConfig: {
    cards: {
      sutz: {
        title: 'Sutz Descubre',
        badge: 'Mundo Virtual',
        kicheTag: "Nube en K'iche'",
        desc: 'Un mundo virtual que evoluciona con el estudiante y su aprendizaje.'
      },
      creatika: {
        title: 'Creatika',
        badge: 'Expresión & Arte',
        kicheTag: 'Creatividad',
        desc: 'Suite de herramientas para el desarrollo de la creatividad y las habilidades artísticas y estéticas.'
      },
      tek100: {
        title: '100tek',
        badge: 'Metodología STEAM',
        kicheTag: 'Ciencia & STEM',
        desc: 'Espacio para la metodología STEAM o STEM.'
      },
      lab: {
        title: 'LAB',
        badge: 'Integración Educativa',
        kicheTag: 'Talleres & Materiales',
        desc: 'Talleres y materiales originales para una perfecta integración educativa.'
      }
    },
    sections: {
      sutz: {
        title: 'Sutz Descubre',
        badge: 'MUNDO VIRTUAL',
        body: "Un mundo virtual que evoluciona con el estudiante y su aprendizaje. En idioma K'iche', Sutz significa Nube. Es un mapa hexagonal interactivo diseñado para adaptar el conocimiento, las leyendas culturales y las lecciones didácticas al ritmo de cada alumno.",
        bullets: [
          'Aprendizaje Evolutivo: Adaptación constante según el avance del estudiante.',
          'Navegación Hexagonal: Descubrimiento de biomas, montañas, bosques y desafíos.',
          'Raíces Culturales: Integración de la mitología del Popol Vuh y saberes ancestrales.'
        ],
        bgImage: ''
      },
      creatika: {
        title: 'Creatika',
        badge: 'EXPRESIÓN & ARTE',
        body: 'Suite de herramientas para el desarrollo de la creatividad y las habilidades artísticas y estéticas. Estimula el pensamiento divergente, la composición cromática y la creación literaria interactiva.',
        bullets: [
          'Código del Estudiante: Manifiesto de autonomía, criterio ético y pensamiento crítico.',
          'Código Docente: Marco interactivo de competencias para el maestro contemporáneo.',
          'Teoría del Color: Explorador interactivo de armonías visuales y sensibilidad estética.',
          'Máquina de Cuentos: Generador creativo para la escritura de narrativas originales.'
        ],
        bgImage: ''
      },
      tek100: {
        title: '100tek',
        badge: 'METODOLOGÍA STEAM / STEM',
        body: 'Espacio para la metodología STEAM o STEM (Science, Technology, Engineering, Arts, Mathematics). Integra simulaciones astronómicas, secuencias lógicas y pensamiento computacional.',
        bullets: [
          'Sistema Solar 3D: Simulación del espacio para la comprensión de fenómenos astronómicos.',
          'Secuencias Numéricas: Desafíos para fortalecer el razonamiento matemático abstracto.',
          'Pensamiento Científico: Enfoque interdisciplinario centrado en la investigación.'
        ],
        bgImage: ''
      },
      lab: {
        title: 'LAB',
        badge: 'INTEGRACIÓN EDUCATIVA',
        body: 'Talleres y materiales originales para una perfecta integración educativa. Recursos diseñados para facilitar la labor docente y enriquecer las dinámicas en el aula.',
        bullets: [
          'Materiales Didácticos: Recursos pedagógicos alineados a las competencias clave.',
          'Animación Educativa: Laboratorios audiovisuales que potencian la comprensión.',
          'Talleres Integrales: Guías metodológicas para docentes y estudiantes.'
        ],
        bgImage: ''
      }
    }
  },
  techTreeNodes: generateDefaultTechTree(),
  map: [

    {
      id: "0,0",
      row: 0,
      col: 0,
      title: "Portal Lluvia de Ideas",
      glowColor: "rgba(255, 255, 255, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🌌" },
      action: { type: "none", target: "" }
    },
    {
      id: "-1,-1",
      row: -1,
      col: -1,
      title: "Máquina de Cuentos",
      glowColor: "rgba(236, 72, 153, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🎰" },
      action: { type: "navigate", target: "/creatika/maquina-de-cuentos" }
    },
    {
      id: "1,-1",
      row: 1,
      col: -1,
      title: "Teoría del Color",
      glowColor: "rgba(245, 158, 11, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🎨" },
      action: { type: "navigate", target: "/creatika/teoria-del-color" }
    },
    {
      id: "1,1",
      row: 1,
      col: 1,
      title: "Secuencias Numéricas",
      glowColor: "rgba(56, 189, 248, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🔢" },
      action: { type: "navigate", target: "/100tek/secuencias-numericas" }
    },
    {
      id: "0,2",
      row: 0,
      col: 2,
      title: "Sistema Solar Interactivo",
      glowColor: "rgba(168, 85, 247, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🪐" },
      action: { type: "navigate", target: "/100tek/sistema-solar" }
    },
    {
      id: "-1,0",
      row: -1,
      col: 0,
      title: "Bingo Virtual",
      glowColor: "rgba(239, 68, 68, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🎲" },
      action: { type: "navigate", target: "/juegos/bingo" }
    },
    {
      id: "1,0",
      row: 1,
      col: 0,
      title: "Catálogo Editorial",
      glowColor: "rgba(59, 130, 246, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "📚" },
      action: { type: "navigate", target: "/catalogo" }
    },
    {
      id: "0,-1",
      row: 0,
      col: -1,
      title: "Laboratorios Pedagógicos",
      glowColor: "rgba(34, 197, 94, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🧪" },
      action: { type: "navigate", target: "/laboratorios" }
    },
    {
      id: "0,1",
      row: 0,
      col: 1,
      title: "Minecraft",
      glowColor: "rgba(16, 185, 129, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "⚔️" },
      action: { type: "external", target: "https://mc.lluviadeideaseditorial.com/" }
    },
    {
      id: "-1,1",
      row: -1,
      col: 1,
      title: "Universo de Juracán",
      glowColor: "rgba(168, 85, 247, 0.85)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "icon", value: "🌪️" },
      action: { type: "navigate", target: "/universo-de-juracan" }
    },
    {
      id: "2,-1",
      row: 2,
      col: -1,
      title: "Camazotz",
      glowColor: "rgba(255, 200, 100, 0.6)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "image", value: "/assets/Camazotz%20titulo-C5JiC7dN.png" },
      action: { type: "modal", target: "story-camazotz" }
    },
    {
      id: "2,0",
      row: 2,
      col: 0,
      title: "Ixkik",
      glowColor: "rgba(255, 200, 100, 0.6)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "image", value: "/assets/Ixkik%20titulo-DSlfuPJ0.png" },
      action: { type: "modal", target: "story-ixkik" }
    },
    {
      id: "-2,0",
      row: -2,
      col: 0,
      title: "Ixmukané",
      glowColor: "rgba(255, 200, 100, 0.6)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "image", value: "/assets/Ixmukanne%20titulo-DLpUcWwx.png" },
      action: { type: "modal", target: "story-ixmukanne" }
    },
    {
      id: "-2,1",
      row: -2,
      col: 1,
      title: "Juracán (Mito)",
      glowColor: "rgba(255, 200, 100, 0.6)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "image", value: "/assets/Juracan%20titulo-CJ--KpLx.png" },
      action: { type: "modal", target: "story-juracan" }
    },
    {
      id: "-1,2",
      row: -1,
      col: 2,
      title: "Ququmatz",
      glowColor: "rgba(255, 200, 100, 0.6)",
      layerBg: { type: "none", value: "" },
      layerDeco: { type: "none", value: "" },
      layerInteractive: { type: "image", value: "/assets/Ququmatz%20titulo-DSHBqZmr.png" },
      action: { type: "modal", target: "story-ququmatz" }
    }
  ]
};

const PortalConfigContext = createContext<PortalConfigContextProps | undefined>(undefined);

const getInitialConfig = (): PortalConfig => {
  try {
    const cached = localStorage.getItem('portal_config_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    }
  } catch (err) {
    console.warn("Could not read cached config from localStorage:", err);
  }
  return DEFAULT_CONFIG;
};

export const PortalConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PortalConfig>(getInitialConfig);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const configDocRef = doc(db, 'config', 'portal');
    const unsubscribe = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PortalConfig;
        if (!data.map) {
          data.map = DEFAULT_CONFIG.map;
        }
        if (!data.creatika) {
          data.creatika = DEFAULT_CONFIG.creatika;
        }
        if (!data.tek100) {
          data.tek100 = DEFAULT_CONFIG.tek100;
        }
        if (!data.catalogoConfig) {
          data.catalogoConfig = DEFAULT_CONFIG.catalogoConfig;
        }
        if (!data.techTreeNodes) {
          data.techTreeNodes = DEFAULT_CONFIG.techTreeNodes;
        }
        
        // Cache to localStorage for instant 0ms loads on page refresh
        try {
          localStorage.setItem('portal_config_cache', JSON.stringify(data));
        } catch (e) {
          // ignore quota limits
        }

        setConfig(data);
      } else {
        setDoc(configDocRef, DEFAULT_CONFIG).catch(err => {
          console.error("Error initializing config in firestore:", err);
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (config && config.colors) {
      Object.entries(config.colors).forEach(([key, val]) => {
        document.documentElement.style.setProperty(`--${key}`, val);
      });
    }
  }, [config]);

  const saveConfigToFirestore = async (newConfig: PortalConfig) => {
    const configDocRef = doc(db, 'config', 'portal');
    await setDoc(configDocRef, newConfig);
  };

  const resetConfigToFirestore = async () => {
    const configDocRef = doc(db, 'config', 'portal');
    await setDoc(configDocRef, DEFAULT_CONFIG);
  };

  return (
    <PortalConfigContext.Provider value={{ config, loading, saveConfigToFirestore, resetConfigToFirestore }}>
      {children}
    </PortalConfigContext.Provider>
  );
};

export const usePortalConfig = () => {
  const context = useContext(PortalConfigContext);
  if (context === undefined) {
    throw new Error('usePortalConfig must be used within a PortalConfigProvider');
  }
  return context;
};
