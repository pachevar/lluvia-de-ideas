import { useState, useEffect, useRef } from 'react';
import { 
  mixWeightedPaintColors, 
  GAME_TARGET_COLORS, 
  calculateColorMatch, 
  generateRandomTargetColor, 
  rgbToHex,
  generateColorShadesAndTints
} from '../utils/colorUtils';
import type { GameColorTarget } from '../utils/colorUtils';
import html2canvas from 'html2canvas';
import './ColorTheory.css';

// Interfaz para conejos guardianes
interface RabbitGuardian {
  id: string;
  name: string;
  hex: string;
  category: 'primario' | 'secundario' | 'terciario' | 'neutro';
  temperature: 'cálido' | 'frío' | 'neutro';
  desc: string;
  complementaryHex: string;
  complementaryName: string;
}

const GUARDIANS: RabbitGuardian[] = [
  {
    id: 'rojo',
    name: 'Rojo Carmesí',
    hex: '#FE2712',
    category: 'primario',
    temperature: 'cálido',
    desc: 'El Guardián del Fuego y de las flores de achiote. Es rápido, enérgico y siempre está lleno de calor. ¡No se puede crear mezclando otros colores!',
    complementaryHex: '#34B233',
    complementaryName: 'Verde Selva'
  },
  {
    id: 'amarillo',
    name: 'Amarillo Maíz',
    hex: '#FBE903',
    category: 'primario',
    temperature: 'cálido',
    desc: 'El Guardián del Sol y de las mazorcas tiernas. Llena de alegría e inteligencia la madriguera. ¡Es un color de partida primario!',
    complementaryHex: '#8601AF',
    complementaryName: 'Morado Místico'
  },
  {
    id: 'azul',
    name: 'Azul Cenote',
    hex: '#0A54B4',
    category: 'primario',
    temperature: 'frío',
    desc: 'El Guardián de los lagos y el cielo despejado. Es calmado, sabio y ayuda a todos los conejos a pensar con tranquilidad y paz.',
    complementaryHex: '#FB9902',
    complementaryName: 'Naranja Atardecer'
  },
  {
    id: 'naranja',
    name: 'Naranja Atardecer',
    hex: '#FB9902',
    category: 'secundario',
    temperature: 'cálido',
    desc: 'Nace de la unión alegre entre el conejo Rojo y el Amarillo. Custodia los frutos maduros y el radiante color de la tarde.',
    complementaryHex: '#0A54B4',
    complementaryName: 'Azul Cenote'
  },
  {
    id: 'verde',
    name: 'Verde Selva',
    hex: '#34B233',
    category: 'secundario',
    temperature: 'frío',
    desc: 'Se crea cuando el conejo Amarillo y el Azul se abrazan en la madriguera. Cuida las hojas, los árboles gigantes y las plumas del quetzal.',
    complementaryHex: '#FE2712',
    complementaryName: 'Rojo Carmesí'
  },
  {
    id: 'violeta',
    name: 'Morado Místico',
    hex: '#8601AF',
    category: 'secundario',
    temperature: 'frío',
    desc: 'Nace al unir al conejo Rojo y al Azul. Cuida de las noches estrelladas, las amatistas brillantes y las orquídeas silvestres.',
    complementaryHex: '#FBE903',
    complementaryName: 'Amarillo Maíz'
  },
  {
    id: 'blanco',
    name: 'Blanco Nube',
    hex: '#FFFFFF',
    category: 'neutro',
    temperature: 'neutro',
    desc: 'Cuida de la niebla mañanera y de la flor Monja Blanca. Su poder especial es aclarar las mezclas y darles suavidad pastel.',
    complementaryHex: '#1A082E',
    complementaryName: 'Negro Xibalbá'
  },
  {
    id: 'negro',
    name: 'Negro Xibalbá',
    hex: '#1A082E',
    category: 'neutro',
    temperature: 'neutro',
    desc: 'Cuida las cuevas misteriosas y los secretos nocturnos. Su magia oscurece las mezclas y les da hermosas sombras oscuras.',
    complementaryHex: '#FFFFFF',
    complementaryName: 'Blanco Nube'
  },
  {
    id: 'turquesa',
    name: 'Turquesa Cenote',
    hex: '#168039',
    category: 'terciario',
    temperature: 'frío',
    desc: 'Una mezcla fresca y calma entre el conejo Azul y el Verde. Cuida las aguas cristalinas y mágicas de los estanques selváticos.',
    complementaryHex: '#FB9902',
    complementaryName: 'Naranja Atardecer'
  },
  {
    id: 'ladrillo',
    name: 'Naranja Ladrillo',
    hex: '#D35400',
    category: 'terciario',
    temperature: 'cálido',
    desc: 'Una mezcla terrosa y cálida de Rojo, Amarillo y Negro. Cuida la arcilla cocida y los cántaros de los artesanos.',
    complementaryHex: '#0A54B4',
    complementaryName: 'Azul Cenote'
  },
  {
    id: 'lavanda',
    name: 'Lavanda Pastel',
    hex: '#C39BD3',
    category: 'terciario',
    temperature: 'frío',
    desc: 'Una mezcla muy dulce de Rojo, Azul y Blanco. Cuida las flores aromáticas y silvestres que crecen en las colinas altas.',
    complementaryHex: '#FBE903',
    complementaryName: 'Amarillo Maíz'
  },
  {
    id: 'gris',
    name: 'Gris Neblina',
    hex: '#7F8C8D',
    category: 'neutro',
    temperature: 'neutro',
    desc: 'Nace del abrazo pacífico entre Blanco y Negro. Cuida el equilibrio entre el día y la noche en el bosque nuboso.',
    complementaryHex: '#1A082E',
    complementaryName: 'Negro Xibalbá'
  }
];

// Componente SVG del Conejo - Ilustración Neón de Alta Precisión
function ColorRabbit({ color, size = 100, animClass = '' }: { color: string; size?: number; animClass?: string }) {
  const isWhite = color.toLowerCase() === '#ffffff';
  const gradId = `rabbit-grad-${color.replace('#', '')}-${size}-${Math.random().toString(36).substr(2, 4)}`;
  const isDark = color.toLowerCase() === '#1a082e';
  const stopColorEnd = isWhite 
    ? '#E2E8F0' 
    : isDark 
      ? '#090312' 
      : `${color}BB`;

  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={`rabbit-svg ${animClass}`}
      style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={stopColorEnd} />
        </linearGradient>
        <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Sombra de apoyo */}
      <ellipse cx="50" cy="88" rx="26" ry="5.5" fill="#000" opacity="0.25" />
      
      {/* Orejas largas */}
      <path 
        d="M36 38 C31 8 41 6 43 38 Z" 
        fill="#FFFFFF" 
        stroke="#1A082E" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M64 38 C69 8 59 6 57 38 Z" 
        fill="#FFFFFF" 
        stroke="#1A082E" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Interior Orejas */}
      <path d="M37 36 C33 14 40 12 41 36 Z" fill={`url(#${gradId})`} opacity="0.9" />
      <path d="M63 36 C67 14 60 12 59 36 Z" fill={`url(#${gradId})`} opacity="0.9" />
      
      {/* Cuerpo principal */}
      <path 
        d="M26 78 C26 58 74 58 74 78 C74 88 26 88 26 78 Z" 
        fill="#FFFFFF" 
        stroke="#1A082E" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gema brillante de color en el pecho */}
      <circle cx="50" cy="74" r="10" fill={`url(#${gradId})`} stroke="#1A082E" strokeWidth="1.5" />
      <circle cx="47.5" cy="71.5" r="2.5" fill="#FFFFFF" opacity="0.85" />

      {/* Cabeza */}
      <ellipse 
        cx="50" 
        cy="51" 
        rx="18" 
        ry="16.5" 
        fill="#FFFFFF" 
        stroke="#1A082E" 
        strokeWidth="2" 
      />
      
      {/* Ojos expresivos */}
      <circle cx="43" cy="49" r="2.2" fill="#1A082E" />
      <circle cx="57" cy="49" r="2.2" fill="#1A082E" />
      
      {/* Mejillas rosadas */}
      <circle cx="37" cy="53.5" r="2.8" fill="#FFB6C1" opacity="0.6" />
      <circle cx="63" cy="53.5" r="2.8" fill="#FFB6C1" opacity="0.6" />

      {/* Hocico */}
      <path d="M48.5 52.5 Q50 54 51.5 52.5" stroke="#1A082E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      
      {/* Bigotes */}
      <line x1="25" y1="52" x2="20" y2="51.5" stroke="#1A082E" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="25" y1="54.5" x2="19.5" y2="55.5" stroke="#1A082E" strokeWidth="1.2" strokeLinecap="round" />
      
      <line x1="75" y1="52" x2="80" y2="51.5" stroke="#1A082E" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="75" y1="54.5" x2="80.5" y2="55.5" stroke="#1A082E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function ColorTheory() {
  // --- Estados de los Guardianes ---
  const [activeFilter, setActiveFilter] = useState<'todos' | 'primario' | 'secundario' | 'terciario' | 'neutro'>('todos');
  const [selectedGuardian, setSelectedGuardian] = useState<RabbitGuardian>(GUARDIANS[0]);
  const [activeTabSection, setActiveTabSection] = useState<'guardianes' | 'mezcla' | 'tonos' | 'luz' | 'armonias'>('guardianes');

  // --- Estados de Mezcla Proporcional ---
  const [weightedMix, setWeightedMix] = useState<{ guardian: RabbitGuardian; weight: number }[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixResult, setMixResult] = useState<{
    hex: string;
    rgb: [number, number, number];
    name: string;
    description: string;
  } | null>(null);

  // Manejo de Mezcla Proporcional
  const handleAddWeightForMix = (guardian: RabbitGuardian) => {
    setWeightedMix(prev => {
      const existing = prev.find(item => item.guardian.id === guardian.id);
      let updated;
      if (existing) {
        updated = prev.map(item => 
          item.guardian.id === guardian.id 
            ? { ...item, weight: Math.min(5, item.weight + 1) }
            : item
        );
      } else {
        if (prev.length >= 4) return prev; // Máximo 4 ingredientes
        updated = [...prev, { guardian, weight: 1 }];
      }
      triggerWeightedMix(updated);
      return updated;
    });
  };

  const handleUpdateWeight = (id: string, delta: number) => {
    setWeightedMix(prev => {
      const updated = prev.map(item => {
        if (item.guardian.id === id) {
          const newW = item.weight + delta;
          return newW > 0 ? { ...item, weight: newW } : null;
        }
        return item;
      }).filter((item): item is { guardian: RabbitGuardian; weight: number } => item !== null);

      if (updated.length === 0) {
        setMixResult(null);
      } else {
        triggerWeightedMix(updated);
      }
      return updated;
    });
  };

  const resetMix = () => {
    setWeightedMix([]);
    setMixResult(null);
  };

  const triggerWeightedMix = (list: { guardian: RabbitGuardian; weight: number }[]) => {
    setIsMixing(true);
    setTimeout(() => {
      const weightedList = list.map(item => {
        const g = item.guardian;
        let rybVal: [number, number, number] = [0, 0, 0];
        if (g.id === 'rojo') rybVal = [1, 0, 0];
        else if (g.id === 'amarillo') rybVal = [0, 1, 0];
        else if (g.id === 'azul') rybVal = [0, 0, 1];

        return {
          color: {
            id: g.id,
            name: g.name,
            hex: g.hex,
            ryb: rybVal,
            isWhite: g.id === 'blanco',
            isBlack: g.id === 'negro',
            description: g.desc
          },
          weight: item.weight
        };
      });

      const result = mixWeightedPaintColors(weightedList);
      setMixResult(result);
      setIsMixing(false);
    }, 450);
  };

  // --- Estados de Laboratorio de Tonalidades (Tintes & Sombras) ---
  const [labHexColor, setLabHexColor] = useState<string>('#FE2712');
  const labShades = generateColorShadesAndTints(labHexColor);

  // Send current mix result to Laboratory
  const handleSendToLab = (hex: string) => {
    setLabHexColor(hex);
    setActiveTabSection('tonos');
    const elem = document.getElementById('tonos');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Estados del Mezclador RGB (Luciérnagas) ---
  const [gameLevel, setGameLevel] = useState(1);
  const [gameTarget, setGameTarget] = useState<GameColorTarget>(GAME_TARGET_COLORS[0]);
  const [userR, setUserR] = useState(128);
  const [userG, setUserG] = useState(128);
  const [userB, setUserB] = useState(128);
  const [showVictory, setShowVictory] = useState(false);

  const userRgb: [number, number, number] = [userR, userG, userB];
  const matchPercentage = calculateColorMatch(gameTarget.rgb, userRgb);

  useEffect(() => {
    if (matchPercentage >= 93 && !showVictory) {
      const timer = setTimeout(() => {
        setShowVictory(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [matchPercentage, showVictory]);

  const handleNextChallenge = () => {
    setShowVictory(false);
    const nextLevel = gameLevel + 1;
    setGameLevel(nextLevel);

    if (nextLevel <= GAME_TARGET_COLORS.length) {
      setGameTarget(GAME_TARGET_COLORS[nextLevel - 1]);
    } else {
      setGameTarget(generateRandomTargetColor());
    }

    setUserR(128);
    setUserG(128);
    setUserB(128);
  };

  // --- Estados de Rueda de Armonías Cromáticas ---
  const [harmonyBaseAngle, setHarmonyBaseAngle] = useState(0); 
  const [harmonyType, setHarmonyType] = useState<'complementaria' | 'triadica' | 'analoga' | 'tetradica' | 'monocromatica'>('complementaria');
  const wheelSvgRef = useRef<SVGSVGElement>(null);
  const paletteExportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const HslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  // Colores armónicos avanzados (Soporta 5 tipos de armonías)
  const getHarmonyColors = () => {
    const angle = harmonyBaseAngle;
    const baseColor = HslToHex(angle, 85, 52);
    
    if (harmonyType === 'complementaria') {
      return [
        { role: 'Base', angle: angle, hex: baseColor },
        { role: 'Complementario', angle: (angle + 180) % 360, hex: HslToHex((angle + 180) % 360, 85, 52) }
      ];
    } else if (harmonyType === 'triadica') {
      return [
        { role: 'Base', angle: angle, hex: baseColor },
        { role: 'Armónico 1', angle: (angle + 120) % 360, hex: HslToHex((angle + 120) % 360, 85, 52) },
        { role: 'Armónico 2', angle: (angle + 240) % 360, hex: HslToHex((angle + 240) % 360, 85, 52) }
      ];
    } else if (harmonyType === 'analoga') { 
      return [
        { role: 'Análogo Izq', angle: (angle - 30 + 360) % 360, hex: HslToHex((angle - 30 + 360) % 360, 85, 52) },
        { role: 'Base', angle: angle, hex: baseColor },
        { role: 'Análogo Der', angle: (angle + 30) % 360, hex: HslToHex((angle + 30) % 360, 85, 52) }
      ];
    } else if (harmonyType === 'tetradica') {
      return [
        { role: 'Base', angle: angle, hex: baseColor },
        { role: 'Secundario', angle: (angle + 90) % 360, hex: HslToHex((angle + 90) % 360, 85, 52) },
        { role: 'Complementario 1', angle: (angle + 180) % 360, hex: HslToHex((angle + 180) % 360, 85, 52) },
        { role: 'Complementario 2', angle: (angle + 270) % 360, hex: HslToHex((angle + 270) % 360, 85, 52) }
      ];
    } else {
      // Monocromática (Gama de luminosidad del mismo ángulo)
      return [
        { role: 'Luz Pastel', angle: angle, hex: HslToHex(angle, 85, 80) },
        { role: 'Tono Vivo (Base)', angle: angle, hex: baseColor },
        { role: 'Sombra Media', angle: angle, hex: HslToHex(angle, 85, 35) },
        { role: 'Sombra Profunda', angle: angle, hex: HslToHex(angle, 85, 20) }
      ];
    }
  };

  const handleWheelUpdate = (clientX: number, clientY: number) => {
    if (!wheelSvgRef.current) return;
    const rect = wheelSvgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;
    if (angleDeg >= 360) angleDeg -= 360;
    
    setHarmonyBaseAngle(Math.round(angleDeg));
  };

  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    handleWheelUpdate(clientX, clientY);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleWheelUpdate(e.clientX, e.clientY);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleWheelUpdate(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);

  const harmonyColors = getHarmonyColors();

  // Exportar paleta a imagen PNG
  const exportPaletteImage = async () => {
    if (!paletteExportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(paletteExportRef.current, {
        scale: 3,
        backgroundColor: '#0d061c',
        useCORS: true
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Paleta_Guardianes_${harmonyType}_${harmonyBaseAngle}deg.png`;
      link.click();
    } catch (err) {
      console.error("Error al exportar paleta:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const describeArcPath = (x: number, y: number, rOut: number, rIn: number, startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1_out = x + rOut * Math.cos(startRad);
    const y1_out = y + rOut * Math.sin(startRad);
    const x2_out = x + rOut * Math.cos(endRad);
    const y2_out = y + rOut * Math.sin(endRad);

    const x1_in = x + rIn * Math.cos(startRad);
    const y1_in = y + rIn * Math.sin(startRad);
    const x2_in = x + rIn * Math.cos(endRad);
    const y2_in = y + rIn * Math.sin(endRad);

    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return `
      M ${x1_out} ${y1_out}
      A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2_out} ${y2_out}
      L ${x2_in} ${y2_in}
      A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1_in} ${y1_in}
      Z
    `;
  };

  const getNodoCoordinates = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 120 + radius * Math.cos(rad),
      y: 120 + radius * Math.sin(rad)
    };
  };

  const filteredGuardians = GUARDIANS.filter(g => {
    if (activeFilter === 'todos') return true;
    return g.category === activeFilter;
  });

  return (
    <div className="colortheory-container">
      {/* Fondo de Destellos Mágicos */}
      <div className="magic-particles-bg">
        <div className="particle p1" />
        <div className="particle p2" />
        <div className="particle p3" />
        <div className="particle p4" />
      </div>

      <div className="colortheory-content">
        
        {/* Encabezado Principal */}
        <header className="colortheory-header">
          <div className="colortheory-badge">✨ MADRIGUERA CROMÁTICA VIRTUAL</div>
          <h1 className="gradient-text colortheory-title">El Reino de los Guardianes del Color</h1>
          <p className="colortheory-subtitle">
            ¡Hola explorador! Adéntrate en el laboratorio cósmico de los conejos guardianes.
            Mezcla dosis de pintura sustractiva, experimenta con sombras y luces RGB y gira la rueda de armonías profesionales.
          </p>

          {/* Navegación rápida por pestañas */}
          <nav className="quick-nav-pills">
            <button 
              className={`pill-item ${activeTabSection === 'guardianes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTabSection('guardianes');
                document.getElementById('guardianes')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              🐰 1. Guardianes
            </button>
            <button 
              className={`pill-item ${activeTabSection === 'mezcla' ? 'active' : ''}`}
              onClick={() => {
                setActiveTabSection('mezcla');
                document.getElementById('mezcla')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              🧪 2. Caldera RYB
            </button>
            <button 
              className={`pill-item ${activeTabSection === 'tonos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTabSection('tonos');
                document.getElementById('tonos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              🎨 3. Tonalidades & Sombras
            </button>
            <button 
              className={`pill-item ${activeTabSection === 'luz' ? 'active' : ''}`}
              onClick={() => {
                setActiveTabSection('luz');
                document.getElementById('luz-rgb')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              💡 4. Luz RGB
            </button>
            <button 
              className={`pill-item ${activeTabSection === 'armonias' ? 'active' : ''}`}
              onClick={() => {
                setActiveTabSection('armonias');
                document.getElementById('armonias')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              🎡 5. Rueda de Armonías
            </button>
          </nav>
        </header>

        {/* --- SECCIÓN 1: LOS GUARDIANES DEL COLOR --- */}
        <section className="colortheory-section-card" id="guardianes">
          <div className="section-header-box">
            <h2 className="section-title">🐰 1. Los Guardianes del Color</h2>
            <p className="section-desc">
              Cada conejo en la madriguera resguarda un tono sagrado. Selecciona un conejo para abrir su ficha y agrega dosis a la caldera de mezcla.
            </p>
          </div>

          <div className="tabs-container">
            {(['todos', 'primario', 'secundario', 'terciario', 'neutro'] as const).map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="classification-layout">
            <div className="guardians-grid">
              {filteredGuardians.map((guardian) => {
                const isSelected = selectedGuardian.id === guardian.id;
                const mixItem = weightedMix.find(m => m.guardian.id === guardian.id);
                return (
                  <div
                    key={guardian.id}
                    className={`guardian-card ${isSelected ? 'active' : ''} ${mixItem ? 'in-mix' : ''}`}
                    onClick={() => setSelectedGuardian(guardian)}
                    style={{ borderColor: isSelected ? guardian.hex : 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="guardian-rabbit-holder">
                      <ColorRabbit 
                        color={guardian.hex} 
                        size={80} 
                        animClass={isSelected ? 'jump-loop' : 'wiggle-hover'} 
                      />
                    </div>
                    <span className="guardian-card-name">{guardian.name}</span>
                    <span className="guardian-card-badge" style={{ backgroundColor: guardian.hex, color: guardian.hex === '#FFFFFF' || guardian.hex === '#FBE903' ? '#000' : '#fff' }}>
                      {guardian.category}
                    </span>
                    
                    <button
                      className="add-to-mix-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWeightForMix(guardian);
                      }}
                      disabled={weightedMix.length >= 4 && !mixItem}
                    >
                      {mixItem ? `＋ Dosis (${mixItem.weight}x)` : '＋ Mezclar'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Ficha Lateral Neón */}
            <div className="color-info-panel animate-zoom-in" style={{ borderColor: selectedGuardian.hex, boxShadow: `0 0 25px ${selectedGuardian.hex}44` }}>
              <div className="info-color-header">
                <div className="info-rabbit-frame">
                  <ColorRabbit color={selectedGuardian.hex} size={95} animClass="jump" />
                </div>
                <div className="info-text-block">
                  <h3 className="info-color-title">{selectedGuardian.name}</h3>
                  <span className="hex-tag">
                    Hexadecimal: <span className="monospace">{selectedGuardian.hex}</span>
                  </span>
                </div>
              </div>

              <div className="info-badge-row">
                <span className={`info-badge ${selectedGuardian.category}`}>
                  ★ {selectedGuardian.category}
                </span>
                <span className={`info-badge ${selectedGuardian.temperature === 'cálido' ? 'warm' : 'cold'}`}>
                  {selectedGuardian.temperature === 'cálido' ? '🔥 cálido' : selectedGuardian.temperature === 'frío' ? '❄️ frío' : '☀️ neutro'}
                </span>
              </div>

              <p className="info-text-desc">{selectedGuardian.desc}</p>

              <div className="complementary-showcase">
                <span className="complementary-label">🎨 Su Complementario Opuesto:</span>
                <div className="complementary-colors-box">
                  <div className="comp-rabbit-preview">
                    <ColorRabbit color={selectedGuardian.complementaryHex} size={42} />
                  </div>
                  <span className="comp-name-text">
                    {selectedGuardian.complementaryName}
                  </span>
                </div>
              </div>

              <button 
                className="btn-send-to-lab" 
                style={{ background: `linear-gradient(135deg, ${selectedGuardian.hex} 0%, #3b82f6 100%)` }}
                onClick={() => handleSendToLab(selectedGuardian.hex)}
              >
                🎨 Probar Tonalidades y Sombras ➔
              </button>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 2: MEZCLA DE CONEJOS (SUSTRACTIVO PROPORCIONAL) --- */}
        <section className="colortheory-section-card" id="mezcla">
          <div className="section-header-box">
            <h2 className="section-title">🧪 2. La Caldera de Pintura Proporcional</h2>
            <p className="section-desc">
              Agrega conejos guardianes a la caldera mágica y ajusta las **dosis de pintura (1x a 5x)** para simular la alquimia física real.
            </p>
          </div>

          <div className="mixer-layout">
            <div className="madriguera-stage">
              <div className="madriguera-cave">
                <div className="cave-rim" style={{ borderColor: mixResult?.hex || 'var(--cyber-cyan)' }}>
                  {isMixing && (
                    <div className="smoke-animation-box">
                      <div className="smoke-puff smoke-r" />
                      <div className="smoke-puff smoke-y" />
                      <div className="smoke-puff smoke-b" />
                    </div>
                  )}

                  {!isMixing && mixResult && (
                    <div className="result-rabbit-wrapper animate-bounce-in">
                      <ColorRabbit color={mixResult.hex} size={135} animClass="float-loop" />
                    </div>
                  )}

                  {!isMixing && !mixResult && (
                    <div className="cave-empty-text">
                      <span>🧪 Caldera Vaciada</span>
                      <small>Agrega conejos arriba</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Dosis de Ingredientes */}
              <div className="cave-passengers">
                {weightedMix.map((item) => (
                  <div key={item.guardian.id} className="passenger-pill animate-zoom-in" style={{ borderColor: item.guardian.hex }}>
                    <span className="passenger-dot" style={{ backgroundColor: item.guardian.hex }} />
                    <span className="passenger-name">{item.guardian.name}</span>
                    
                    {/* Controles de Dosis Proporcional */}
                    <div className="dose-controls">
                      <button className="dose-btn" onClick={() => handleUpdateWeight(item.guardian.id, -1)}>-</button>
                      <span className="dose-count">{item.weight}x</span>
                      <button className="dose-btn" onClick={() => handleUpdateWeight(item.guardian.id, 1)}>+</button>
                    </div>

                    <button className="remove-passenger-btn" onClick={() => handleUpdateWeight(item.guardian.id, -99)}>×</button>
                  </div>
                ))}
                {weightedMix.length === 0 && (
                  <span className="cave-placeholder-info">Caldera vacía. Haz clic en "＋ Mezclar" en las tarjetas de arriba.</span>
                )}
              </div>

              {weightedMix.length > 0 && (
                <button className="btn-cauldron-reset" onClick={resetMix}>
                  🧹 Vaciar Caldera
                </button>
              )}
            </div>

            <div className="mixer-result-box card-glass">
              {mixResult ? (
                <>
                  <div className="result-swatch-wrapper" style={{ backgroundColor: mixResult.hex, boxShadow: `0 0 30px ${mixResult.hex}88` }}>
                    <span style={{ fontSize: '2.5rem' }}>✨</span>
                  </div>
                  <div className="result-text-area">
                    <span className="result-mini-title">RESULTADO DE LA MEZCLA</span>
                    <h3 className="result-main-name">{mixResult.name}</h3>
                    <p className="result-description">{mixResult.description}</p>
                    <div className="result-specs">
                      <span>RGB: <span className="monospace">rgb({mixResult.rgb.join(', ')})</span></span>
                      <span>Hex: <span className="monospace">{mixResult.hex}</span></span>
                    </div>

                    <button 
                      className="btn-send-to-lab" 
                      style={{ marginTop: '15px', background: mixResult.hex, color: mixResult.hex === '#FFFFFF' || mixResult.hex === '#FBE903' ? '#000' : '#fff' }}
                      onClick={() => handleSendToLab(mixResult.hex)}
                    >
                      🎨 Abrir Tonalidades de este Color ➔
                    </button>
                  </div>
                </>
              ) : (
                <div className="result-box-empty">
                  <span>Esperando mezcla...</span>
                  <small>Agrega conejos a la caldera y ajusta sus dosis para ver la magia.</small>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 3: LABORATORIO DE TONALIDADES Y SOMBRAS (NUEVO) --- */}
        <section className="colortheory-section-card" id="tonos">
          <div className="section-header-box">
            <h2 className="section-title">🎨 3. Laboratorio de Tonalidades y Sombras</h2>
            <p className="section-desc">
              Descubre cómo cambia un tono al agregar **Blanco (Tinte Pastel)**, **Gris (Desaturado)** o **Negro (Sombra Profunda)**.
            </p>
          </div>

          <div className="lab-layout">
            <div className="lab-color-picker-box">
              <span className="lab-picker-label">Elige un color base para analizar:</span>
              <div className="lab-color-input-wrapper">
                <input 
                  type="color" 
                  value={labHexColor} 
                  onChange={(e) => setLabHexColor(e.target.value.toUpperCase())}
                  className="lab-color-input"
                />
                <input 
                  type="text" 
                  value={labHexColor}
                  onChange={(e) => setLabHexColor(e.target.value.toUpperCase())}
                  className="lab-hex-text-input monospace"
                />
              </div>

              <div className="lab-guardian-quick-palette">
                {GUARDIANS.slice(0, 8).map(g => (
                  <button 
                    key={g.id}
                    className="quick-swatch-btn"
                    style={{ backgroundColor: g.hex }}
                    title={g.name}
                    onClick={() => setLabHexColor(g.hex)}
                  />
                ))}
              </div>
            </div>

            {/* Tira de Paleta Monocromática de 5 Tonos */}
            <div className="lab-shades-strip">
              {labShades.map((shade, idx) => (
                <div 
                  key={idx} 
                  className="lab-shade-card animate-zoom-in"
                  style={{ backgroundColor: shade.hex, color: idx <= 1 ? '#000' : '#fff' }}
                  onClick={() => {
                    navigator.clipboard.writeText(shade.hex);
                    alert(`¡Código HEX ${shade.hex} copiado al portapapeles! 📋`);
                  }}
                  title="Haz clic para copiar el código HEX"
                >
                  <div className="shade-rabbit-holder">
                    <ColorRabbit color={shade.hex} size={55} />
                  </div>
                  <span className="shade-label">{shade.label}</span>
                  <code className="shade-hex">{shade.hex}</code>
                  <span className="shade-desc">{shade.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 4: EL TEMPLO DE LUZ RGB (ADITIVO) --- */}
        <section className="colortheory-section-card" id="luz-rgb">
          <div className="section-header-box">
            <h2 className="section-title">💡 4. Las Luciérnagas RGB de la Madriguera</h2>
            <p className="section-desc">
              Las luces en pantalla se mezclan de forma aditiva: **Rojo (Red)**, **Verde (Green)** y **Azul (Blue)**. 
              Mueve los cristales deslizadores para sincronizar el cristal de luz con la gema objetivo.
            </p>
          </div>

          <div className="temple-layout">
            <div className="temple-challenge-board">
              <div className="challenge-left-info">
                <span className="challenge-badge-level">Desafío de Luz {gameLevel}</span>
                <h3 className="challenge-name-text">Gema Objetivo: {gameTarget.name}</h3>
                <p className="challenge-hint-text">💡 Pista: {gameTarget.hint}</p>
              </div>

              <div className="challenge-target-preview">
                <div 
                  className="target-circle" 
                  style={{ backgroundColor: rgbToHex(gameTarget.rgb[0], gameTarget.rgb[1], gameTarget.rgb[2]), boxShadow: `0 0 20px ${rgbToHex(gameTarget.rgb[0], gameTarget.rgb[1], gameTarget.rgb[2])}` }}
                />
                <span className="target-label-hex">HEX: {rgbToHex(gameTarget.rgb[0], gameTarget.rgb[1], gameTarget.rgb[2])}</span>
              </div>
            </div>

            <div className="temple-stage">
              <div className="firefly-pilar pilar-r" style={{ opacity: userR / 255 }}>
                <div className="firefly-glow-r" />
              </div>
              <div className="firefly-pilar pilar-g" style={{ opacity: userG / 255 }}>
                <div className="firefly-glow-g" />
              </div>
              <div className="firefly-pilar pilar-b" style={{ opacity: userB / 255 }}>
                <div className="firefly-glow-b" />
              </div>

              <div className="combination-light-field" style={{ backgroundColor: `rgb(${userR}, ${userG}, ${userB})`, boxShadow: `0 0 35px rgb(${userR}, ${userG}, ${userB})` }}>
                <ColorRabbit color={rgbToHex(userR, userG, userB)} size={115} animClass="float-loop" />
              </div>

              {showVictory && (
                <div className="temple-victory-screen animate-zoom-in">
                  <span className="victory-icon-shining">✨💎✨</span>
                  <h3 className="victory-title-text">¡Luz Sincronizada!</h3>
                  <p className="victory-desc-text">
                    Has mezclado las luciérnagas con un **{matchPercentage}% de precisión**.
                    ¡El cristal brilla con energía pura!
                  </p>
                  <button className="btn-temple-next" onClick={handleNextChallenge}>
                    Siguiente Desafío ➔
                  </button>
                </div>
              )}
            </div>

            <div className="temple-controls-panel">
              <div className="sliders-grid">
                <div className="slider-group">
                  <span className="slider-label-color" style={{ color: '#ef4444' }}>❤️ Luz Roja (R)</span>
                  <input 
                    type="range" min="0" max="255" value={userR}
                    onChange={(e) => setUserR(parseInt(e.target.value))}
                    className="slider-range-input input-red"
                  />
                  <span className="slider-value-display">{userR}</span>
                </div>

                <div className="slider-group">
                  <span className="slider-label-color" style={{ color: '#22c55e' }}>💚 Luz Verde (G)</span>
                  <input 
                    type="range" min="0" max="255" value={userG}
                    onChange={(e) => setUserG(parseInt(e.target.value))}
                    className="slider-range-input input-green"
                  />
                  <span className="slider-value-display">{userG}</span>
                </div>

                <div className="slider-group">
                  <span className="slider-label-color" style={{ color: '#3b82f6' }}>💙 Luz Azul (B)</span>
                  <input 
                    type="range" min="0" max="255" value={userB}
                    onChange={(e) => setUserB(parseInt(e.target.value))}
                    className="slider-range-input input-blue"
                  />
                  <span className="slider-value-display">{userB}</span>
                </div>
              </div>

              <div className="temple-footer-actions">
                <div className="current-mix-label-box">
                  <span>CÓDIGO HEX RESULTANTE:</span>
                  <div className="current-mix-code-hex">{rgbToHex(userR, userG, userB)}</div>
                </div>

                <div className="precision-score-badge">
                  <span>Precisión de Luz</span>
                  <span className="score-num" style={{ color: matchPercentage >= 93 ? '#22c55e' : '#a855f7' }}>
                    {matchPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN 5: RUEDA DE ARMONÍAS & EXPORTADOR DE PALETAS --- */}
        <section className="colortheory-section-card" id="armonias">
          <div className="section-header-box">
            <h2 className="section-title">🎡 5. La Rueda de Armonías y Paleta del Artista</h2>
            <p className="section-desc">
              Explora cómo armonizan los colores en el círculo cromático de 360°. Elige el tipo de armonía y exporta tu paleta como imagen de diseñador.
            </p>
          </div>

          <div className="harmony-layout">
            <div className="harmony-wheel-area">
              <svg
                ref={wheelSvgRef}
                width="250"
                height="250"
                viewBox="0 0 240 240"
                className="harmony-svg-wheel"
                onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches.length > 0) {
                    handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <circle cx="120" cy="120" r="118" fill="#0d061c" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <circle cx="120" cy="120" r="75" fill="#180b30" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                {Array.from({ length: 12 }).map((_, idx) => {
                  const startAngle = idx * 30;
                  const endAngle = startAngle + 30;
                  const segColor = HslToHex(startAngle, 85, 52);
                  return (
                    <path
                      key={idx}
                      d={describeArcPath(120, 120, 114, 78, startAngle, endAngle)}
                      fill={segColor}
                      stroke="#0d061c"
                      strokeWidth="1.2"
                    />
                  );
                })}

                {harmonyType === 'complementaria' && (() => {
                  const pBase = getNodoCoordinates(harmonyBaseAngle, 65);
                  const pComp = getNodoCoordinates((harmonyBaseAngle + 180) % 360, 65);
                  return (
                    <>
                      <line x1={pBase.x} y1={pBase.y} x2={pComp.x} y2={pComp.y} stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="3 3" />
                      <circle cx="120" cy="120" r="6" fill="#FFFFFF" />
                    </>
                  );
                })()}

                {harmonyType === 'triadica' && (() => {
                  const pBase = getNodoCoordinates(harmonyBaseAngle, 65);
                  const p1 = getNodoCoordinates((harmonyBaseAngle + 120) % 360, 65);
                  const p2 = getNodoCoordinates((harmonyBaseAngle + 240) % 360, 65);
                  return (
                    <polygon
                      points={`${pBase.x},${pBase.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                      fill="rgba(255, 255, 255, 0.08)"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  );
                })()}

                {harmonyType === 'analoga' && (() => {
                  const pBase = getNodoCoordinates(harmonyBaseAngle, 65);
                  const pIzq = getNodoCoordinates((harmonyBaseAngle - 30 + 360) % 360, 65);
                  const pDer = getNodoCoordinates((harmonyBaseAngle + 30) % 360, 65);
                  return (
                    <polygon
                      points={`${pIzq.x},${pIzq.y} ${pBase.x},${pBase.y} ${pDer.x},${pDer.y}`}
                      fill="rgba(255, 255, 255, 0.08)"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeDasharray="2 2"
                      strokeLinejoin="round"
                    />
                  );
                })()}

                {harmonyType === 'tetradica' && (() => {
                  const pBase = getNodoCoordinates(harmonyBaseAngle, 65);
                  const p1 = getNodoCoordinates((harmonyBaseAngle + 90) % 360, 65);
                  const p2 = getNodoCoordinates((harmonyBaseAngle + 180) % 360, 65);
                  const p3 = getNodoCoordinates((harmonyBaseAngle + 270) % 360, 65);
                  return (
                    <polygon
                      points={`${pBase.x},${pBase.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                      fill="rgba(255, 255, 255, 0.08)"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  );
                })()}

                {harmonyColors.map((h, idx) => {
                  const coord = getNodoCoordinates(h.angle, 96);
                  const isBase = h.role === 'Base';
                  return (
                    <g key={idx} className="harmony-node-group">
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isBase ? "11" : "8"}
                        fill={h.hex}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className={isBase ? "harmony-node-base-pulse" : ""}
                      />
                      {isBase && <circle cx={coord.x} cy={coord.y} r="4" fill="#FFFFFF" />}
                    </g>
                  );
                })}

                <circle cx="120" cy="120" r="14" fill="#FFFFFF" stroke="#1A082E" strokeWidth="2" />
                <circle cx="120" cy="120" r="6" fill="#1A082E" />
              </svg>

              <div className="wheel-angle-label">
                Dirección Ángulo Base: <span className="monospace">{harmonyBaseAngle}°</span>
              </div>
            </div>

            <div className="harmony-controls-area">
              <div className="harmony-selector-tabs">
                {(['complementaria', 'triadica', 'analoga', 'tetradica', 'monocromatica'] as const).map(type => (
                  <button
                    key={type}
                    className={`harmony-type-btn ${harmonyType === type ? 'active' : ''}`}
                    onClick={() => setHarmonyType(type)}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="harmony-explanation-box">
                {harmonyType === 'complementaria' && (
                  <p>💡 **Armonía Complementaria**: Combina el color opuesto en la rueda (180°). Ofrece un contraste alto y vibrante.</p>
                )}
                {harmonyType === 'triadica' && (
                  <p>💡 **Armonía Triádica**: Elige tres colores a 120° de distancia. Ofrece una paleta alegre, equilibrada y diversa.</p>
                )}
                {harmonyType === 'analoga' && (
                  <p>💡 **Armonía Análoga**: Colores vecinos (a 30° de distancia). Transmite calma, serenidad y fluidez visual.</p>
                )}
                {harmonyType === 'tetradica' && (
                  <p>💡 **Armonía Tetrádica**: Cuatro colores formando un cuadrado cromático (a 90°). Ideal para paletas complejas y ricas.</p>
                )}
                {harmonyType === 'monocromatica' && (
                  <p>💡 **Armonía Monocromática**: Variaciones de luminosidad del mismo matiz. Elegante y muy unificada.</p>
                )}
              </div>

              {/* Tarjetas de conejos armónicos (Área Exportable) */}
              <div ref={paletteExportRef} className="palette-export-card-wrapper" style={{ padding: '16px', borderRadius: '16px', background: '#0d061c', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    PALETA DEL ARTISTA - GUARDIANES DEL COLOR
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Modo: {harmonyType.toUpperCase()}
                  </span>
                </div>

                <div className="harmonic-rabbits-container">
                  {harmonyColors.map((h, i) => (
                    <div key={i} className="harmonic-rabbit-card animate-zoom-in" style={{ borderColor: h.hex }}>
                      <span className="harmonic-role-badge">{h.role}</span>
                      <div className="harmonic-rabbit-holder">
                        <ColorRabbit color={h.hex} size={65} animClass="float-loop" />
                      </div>
                      <span className="harmonic-hex-code">{h.hex}</span>
                      <small className="monospace">{h.angle}°</small>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className="btn-export-palette" 
                onClick={exportPaletteImage}
                disabled={isExporting}
              >
                {isExporting ? 'Generando PNG...' : '🎨 Descargar Paleta como Imagen PNG 📥'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
