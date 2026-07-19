import { useState, useRef } from 'react';
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
  // PERSONAJES
  {
    id: 'p1',
    emoji: '🧙‍♂️',
    title: 'Mago Olvidadizo',
    description: 'Un hechicero centenario que confunde los hechizos de fuego con recetas de repostería.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p2',
    emoji: '🤖',
    title: 'Cyborg Poeta',
    description: 'Un autómata diseñado para la minería que de pronto solo quiere recitar haikus.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p3',
    emoji: '🕵️‍♀️',
    title: 'Detective de Sueños',
    description: 'Investigadora que se infiltra en las pesadillas ajenas para resolver crímenes reales.',
    category: 'personaje',
    genre: 'realismo'
  },
  {
    id: 'p4',
    emoji: '🦊',
    title: 'Zorro con Botas',
    description: 'Un astuto embustero que habla siete idiomas y comercia mapas del tesoro falsos.',
    category: 'personaje',
    genre: 'fantasia'
  },
  {
    id: 'p5',
    emoji: '👩‍🚀',
    title: 'Astronauta Perdida',
    description: 'Viajera espacial atrapada en una anomalía temporal con su fiel mascota alienígena.',
    category: 'personaje',
    genre: 'scifi'
  },
  {
    id: 'p6',
    emoji: '🎻',
    title: 'Músico Callejero',
    description: 'Un violinista cuyo instrumento puede cambiar el clima según la melodía que interprete.',
    category: 'personaje',
    genre: 'realismo'
  },

  // ENTORNOS
  {
    id: 'e1',
    emoji: '🏰',
    title: 'Castillo Flotante',
    description: 'Una fortaleza suspendida sobre nubes de tormenta eternas.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e2',
    emoji: '🪐',
    title: 'Estación Abandonada',
    description: 'Una base de investigación espacial en la órbita de un gigante gaseoso.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e3',
    emoji: '🪵',
    title: 'Bosque Susurrante',
    description: 'Un espeso laberinto de árboles cuyas hojas cantan secretos al atardecer.',
    category: 'entorno',
    genre: 'realismo'
  },
  {
    id: 'e4',
    emoji: '🏜️',
    title: 'Desierto de Cristal',
    description: 'Un páramo infinito donde la arena se ha fusionado en espejos resplandecientes.',
    category: 'entorno',
    genre: 'fantasia'
  },
  {
    id: 'e5',
    emoji: '🌊',
    title: 'Ciudad Sumergida',
    description: 'Ruinas submarinas protegidas por una cúpula de energía bioluminiscente.',
    category: 'entorno',
    genre: 'scifi'
  },
  {
    id: 'e6',
    emoji: '☕',
    title: 'Cafetería del Tiempo',
    description: 'Un rincón acogedor donde cada mesa pertenece a una década distinta del siglo pasado.',
    category: 'entorno',
    genre: 'realismo'
  },

  // ATMOSFERAS
  {
    id: 'a1',
    emoji: '✨',
    title: 'Magia Latente',
    description: 'Una vibración chispeante en el aire que hace flotar los objetos pequeños.',
    category: 'atmosfera',
    genre: 'fantasia'
  },
  {
    id: 'a2',
    emoji: '🌫️',
    title: 'Neblina de Neon',
    description: 'Una bruma densa iluminada por carteles holográficos y luces de cibercafé.',
    category: 'atmosfera',
    genre: 'scifi'
  },
  {
    id: 'a3',
    emoji: '⛈️',
    title: 'Tormenta Eléctrica',
    description: 'Un ambiente cargado de truenos, lluvia torrencial y sombras que cobran vida.',
    category: 'atmosfera',
    genre: 'todos'
  },
  {
    id: 'a4',
    emoji: '🌅',
    title: 'Calma Melancólica',
    description: 'La quietud pacífica pero triste de un atardecer que nunca termina.',
    category: 'atmosfera',
    genre: 'realismo'
  },
  {
    id: 'a5',
    emoji: '⏳',
    title: 'Suspenso Temporal',
    description: 'El tiempo parece transcurrir diez veces más lento; el silencio es ensordecedor.',
    category: 'atmosfera',
    genre: 'todos'
  },
  {
    id: 'a6',
    emoji: '🎪',
    title: 'Misterio Festivo',
    description: 'Música de carrusel lejana, olor a palomitas y la sensación de que alguien te observa.',
    category: 'atmosfera',
    genre: 'realismo'
  },

  // MOTIVACIONES
  {
    id: 'm1',
    emoji: '🔑',
    title: 'Buscar la Llave',
    description: 'Encontrar el objeto sagrado que abrirá el portal de regreso a su hogar.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm2',
    emoji: '🔌',
    title: 'Reiniciar la Red',
    description: 'Evitar que la inteligencia artificial central borre los recuerdos de la humanidad.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm3',
    emoji: '💌',
    title: 'Entregar una Carta',
    description: 'Hacer llegar un mensaje crucial escrito hace cincuenta años a su destinatario.',
    category: 'motivacion',
    genre: 'realismo'
  },
  {
    id: 'm4',
    emoji: '🏆',
    title: 'Romper la Maldición',
    description: 'Deshacer un encantamiento ancestral que convierte todo lo que toca en piedra.',
    category: 'motivacion',
    genre: 'fantasia'
  },
  {
    id: 'm5',
    emoji: '🧠',
    title: 'Descubrir la Verdad',
    description: 'Desentrañar un misterio científico que desafía las leyes conocidas de la física.',
    category: 'motivacion',
    genre: 'scifi'
  },
  {
    id: 'm6',
    emoji: '🌱',
    title: 'Hacer Florecer la Semilla',
    description: 'Cuidar y hacer germinar la última planta natural del planeta.',
    category: 'motivacion',
    genre: 'todos'
  }
];

export default function StoryMachine() {
  const [genreFilter, setGenreFilter] = useState<'todos' | 'fantasia' | 'scifi' | 'realismo'>('todos');
  const [reels, setReels] = useState({
    personaje: { current: ITEMS_POOL[0], locked: false, isSpinning: false },
    entorno: { current: ITEMS_POOL[6], locked: false, isSpinning: false },
    atmosfera: { current: ITEMS_POOL[12], locked: false, isSpinning: false },
    motivacion: { current: ITEMS_POOL[18], locked: false, isSpinning: false }
  });
  
  const [isAnyReelSpinning, setIsAnyReelSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSynthesizedSound = (type: 'spin' | 'stop' | 'success') => {
    if (!soundEnabled) return;
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

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
        // Play a nice happy arpeggio
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
      console.warn('Web Audio API not supported or blocked by browser policies.', e);
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

    // Determine which reels will spin
    const spinningReels = categories.filter(cat => !reels[cat].locked);
    if (spinningReels.length === 0) return; // All locked!

    setIsAnyReelSpinning(true);

    // Set spinning state to true for those that are not locked
    setReels(prev => {
      const updated = { ...prev };
      categories.forEach(cat => {
        if (!prev[cat].locked) {
          updated[cat] = { ...prev[cat], isSpinning: true };
        }
      });
      return updated;
    });

    // Start tick sounds during spinning
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      if (tickCount < 15) {
        playSynthesizedSound('spin');
        tickCount++;
      } else {
        clearInterval(tickInterval);
      }
    }, 120);

    // Spin fast intervals for values
    const intervals: { [key: string]: any } = {};
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

    // Schedule staggered stops
    const stopTimes = { personaje: 800, entorno: 1400, atmosfera: 2000, motivacion: 2600 };

    categories.forEach((cat, index) => {
      if (!reels[cat].locked) {
        setTimeout(() => {
          clearInterval(intervals[cat]);
          
          // Select final random item
          const pool = getFilteredItems(cat);
          const finalItem = pool[Math.floor(Math.random() * pool.length)];
          
          setReels(prev => ({
            ...prev,
            [cat]: { ...prev[cat], current: finalItem, isSpinning: false }
          }));

          playSynthesizedSound('stop');

          // If it is the last spinning reel, trigger success fanfare
          const remainingSpinning = spinningReels.filter((_, idx) => idx > index);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCombinedPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sm-container">
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
              onChange={(e) => setGenreFilter(e.target.value as any)}
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

          <div className="sm-prompt-actions">
            <button className="sm-spin-btn" onClick={copyToClipboard} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              {copied ? '✅ ¡Copiado!' : '📋 Copiar Prompt'}
            </button>
          </div>
        </div>
      )}

      <div className="sm-info-banner">
        💡 <strong>Evidencia Científica:</strong> La anticipación táctil y auditiva (efecto jackpot) enfoca la atención de los participantes, mientras que la recompensa variable estimula la resolución creativa de problemas y activa el flujo narrativo de forma espontánea.
      </div>
    </div>
  );
}
