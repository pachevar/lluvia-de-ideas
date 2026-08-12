import { useRef, useEffect, useState } from 'react';
import '../../styles/juracan-theme.css';

export interface StoryNode {
  id: string;
  title: string;
  tagline: string;
  accent: 'cyan' | 'yellow' | 'lilac';
  pos: { x: number; y: number }; // Porcentajes 0-100
  coverEmoji?: string;
  description?: string;
  gradeLevel?: string;
  price?: number;
}

export const DEFAULT_STORIES: StoryNode[] = [
  { 
    id: '1', 
    title: 'El Código del Maíz', 
    tagline: 'Origen y Sustento', 
    accent: 'yellow', 
    pos: { x: 20, y: 30 },
    coverEmoji: '🌽',
    description: 'Un viaje fantástico por los orígenes del maíz sagrado, donde la biotecnología ancestral y la mitología se entrelazan para proteger los cultivos del futuro.',
    gradeLevel: '4to a 6to Primaria',
    price: 14.99
  },
  { 
    id: '2', 
    title: 'Cenote de Datos', 
    tagline: 'Memoria Ancestral', 
    accent: 'cyan', 
    pos: { x: 50, y: 15 },
    coverEmoji: '🌊',
    description: 'Las profundidades cristalinas esconden registros digitales de antiguas civilizaciones. Los jóvenes exploradores descifran glifos informáticos.',
    gradeLevel: '1ro a 3ro Básico',
    price: 16.50
  },
  { 
    id: '3', 
    title: 'Jaguar Binario', 
    tagline: 'Guardián del Umbral', 
    accent: 'lilac', 
    pos: { x: 80, y: 35 },
    coverEmoji: '🐆',
    description: 'El felino sagrado vigila la entrada al reino de la inteligencia artificial ética y enseña a los estudiantes el valor del criterio y la prudencia.',
    gradeLevel: 'Diversificado',
    price: 18.00
  },
  { 
    id: '4', 
    title: 'Tejedoras del Tiempo', 
    tagline: 'Algoritmos Cíclicos', 
    accent: 'cyan', 
    pos: { x: 35, y: 75 },
    coverEmoji: '🧶',
    description: 'Los patrones geométricos de los textiles tradicionales Maya revelan secuencias lógicas avanzadas y matemática fractal.',
    gradeLevel: '3ro a 6to Primaria',
    price: 15.00
  },
  { 
    id: '5', 
    title: 'Fuego Nuevo Solar', 
    tagline: 'Renacimiento Digital', 
    accent: 'yellow', 
    pos: { x: 65, y: 70 },
    coverEmoji: '🔥',
    description: 'Cada 52 ciclos el sol renace con nueva energía. Una aventura sobre energías renovables, astronomía y física cuántica para niños.',
    gradeLevel: '5to y 6to Primaria',
    price: 17.25
  },
  { 
    id: '6', 
    title: 'El Sueño del Popol Vuh', 
    tagline: 'Corazón del Cielo', 
    accent: 'lilac', 
    pos: { x: 50, y: 48 },
    coverEmoji: '📜',
    description: 'Adaptación narrativa completa ilustrada con actividades interactivas del Popol Vuh, enfocada en la formación en valores y comprensión lectora.',
    gradeLevel: 'Todos los grados',
    price: 19.99
  }
];

interface JuracanConstellationProps {
  stories?: StoryNode[];
  onSelectStory?: (story: StoryNode) => void;
}

export default function JuracanConstellation({ 
  stories = DEFAULT_STORIES,
  onSelectStory 
}: JuracanConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  useEffect(() => {
    const updateConnections = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      
      // Definir conexiones lógicas entre cuentos (índices en la lista)
      const links = [[0, 1], [1, 2], [0, 3], [2, 4], [3, 4], [1, 5], [5, 4], [0, 5], [2, 5]];
      
      const newPaths = links
        .filter(([a, b]) => a < stories.length && b < stories.length)
        .map(([a, b]) => {
          const x1 = (stories[a].pos.x / 100) * w;
          const y1 = (stories[a].pos.y / 100) * h;
          const x2 = (stories[b].pos.x / 100) * w;
          const y2 = (stories[b].pos.y / 100) * h;
          
          // Curva de Bézier para efecto fluido/orgánico
          const cx = (x1 + x2) / 2;
          const cy = Math.min(y1, y2) - 45; 
          return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        });
      
      setPaths(newPaths);
    };

    updateConnections();
    window.addEventListener('resize', updateConnections);
    return () => window.removeEventListener('resize', updateConnections);
  }, [stories]);

  const handleNodeClick = (story: StoryNode) => {
    setActiveStoryId(story.id);
    if (onSelectStory) {
      onSelectStory(story);
    }
  };

  return (
    <div ref={containerRef} className="constellation-wrapper">
      {/* Capa SVG Interactiva */}
      <svg className="connector-svg" aria-hidden="true">
        <defs>
          <linearGradient id="neonFlow" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="var(--neon-lilac)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--neon-yellow)" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {paths.map((d, i) => (
          <path key={i} d={d} stroke="url(#neonFlow)" strokeWidth="2.5" fill="none" className="flow-line" />
        ))}
      </svg>

      {/* Nodos de Cuentos */}
      {stories.map((story) => {
        const isSelected = activeStoryId === story.id;
        return (
          <div
            key={story.id}
            onClick={() => handleNodeClick(story)}
            className={`story-node glass-panel accent-${story.accent} ${isSelected ? 'selected' : ''}`}
            style={{ left: `${story.pos.x}%`, top: `${story.pos.y}%` }}
            role="button"
            tabIndex={0}
          >
            <div className="node-top-bar">
              <span className="node-id hud-label">LIBRO 0{story.id}</span>
              {story.coverEmoji && <span className="node-emoji">{story.coverEmoji}</span>}
            </div>
            <h3>{story.title}</h3>
            <p>{story.tagline}</p>
          </div>
        );
      })}

      <style>{`
        .constellation-wrapper {
          position: relative;
          width: 100%;
          height: 80vh;
          min-height: 520px;
          max-width: 1400px;
          margin: 0 auto;
          overflow: hidden;
        }
        .connector-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .flow-line {
          stroke-dasharray: 12 6;
          animation: flowDash 18s linear infinite;
        }
        .story-node {
          position: absolute;
          transform: translate(-50%, -50%);
          padding: 1.25rem 1.75rem;
          min-width: 220px;
          text-align: center;
          z-index: 2;
          text-decoration: none;
          color: white;
          cursor: pointer;
          user-select: none;
        }
        .node-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .node-id { 
          font-size: 0.7rem; 
          color: rgba(255, 255, 255, 0.7); 
          font-weight: 700;
        }
        .node-emoji {
          font-size: 1.3rem;
        }
        .story-node h3 { 
          font-size: 1.15rem; 
          margin-bottom: 0.35rem; 
          color: #fff;
          line-height: 1.2;
        }
        .story-node p { 
          font-size: 0.88rem; 
          opacity: 0.85; 
          color: #d1d5db;
        }
        
        /* Acentos por nodo */
        .accent-cyan:hover, .accent-cyan.selected { 
          box-shadow: var(--glow-cyan); 
          border-color: var(--neon-cyan); 
        }
        .accent-yellow:hover, .accent-yellow.selected { 
          box-shadow: var(--glow-yellow); 
          border-color: var(--neon-yellow); 
        }
        .accent-lilac:hover, .accent-lilac.selected { 
          box-shadow: var(--glow-lilac); 
          border-color: var(--neon-lilac); 
        }
        
        @keyframes flowDash { 
          to { stroke-dashoffset: -1000; } 
        }
        
        @media (max-width: 768px) {
          .constellation-wrapper { 
            height: auto; 
            min-height: 100vh; 
            display: flex; 
            flex-direction: column; 
            gap: 1.5rem; 
            padding: 2rem 1rem; 
          }
          .story-node { 
            position: relative !important; 
            transform: none !important; 
            left: auto !important; 
            top: auto !important; 
            width: 100%; 
            margin: 0 auto; 
          }
          .connector-svg { 
            display: none; 
          } /* En móvil ocultamos líneas complejas */
        }
      `}</style>
    </div>
  );
}
