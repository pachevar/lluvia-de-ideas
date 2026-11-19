import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import './ArteTerapia.css';

type NeuroTheme = 'warm-paper' | 'night-calm' | 'high-contrast';
type TabSection = 'inicio' | 'neurociencia' | 'herramientas' | 'taller' | 'gamificacion';

interface EtcLevel {
  id: string;
  title: string;
  polarity: string;
  brainFocus: string;
  classroomActivity: string;
}

const ETC_LEVELS: EtcLevel[] = [
  {
    id: 'kinestesico',
    title: '1. Nivel Kinestésico / Sensorial',
    polarity: 'Movimiento corporal ↔ Percepción táctil y visual',
    brainFocus: 'Corteza sensoriomotora y sistema límbico: libera tensión física acumulada antes de exigir palabras.',
    classroomActivity: 'Trazos rítmicos libres al ritmo de la respiración o amasado sensorial en silencio durante 3 minutos.',
  },
  {
    id: 'perceptual',
    title: '2. Nivel Perceptual / Afectivo',
    polarity: 'Forma y límites ↔ Expresión emocional cromática',
    brainFocus: 'Regulación de la amígdala mediante el color, la simetría y la contención espacial de la emoción.',
    classroomActivity: 'Dibujar un mandala o elegir 3 colores que representen el clima emocional del grupo hoy.',
  },
  {
    id: 'cognitivo',
    title: '3. Nivel Cognitivo / Simbólico',
    polarity: 'Planificación lógica ↔ Metáfora e historia personal',
    brainFocus: 'Corteza prefrontal integrando narrativa, memoria autobiográfica y resolución simbólica de conflictos.',
    classroomActivity: 'Crear un símbolo o personaje que represente un reto escolar y narrar cómo supera el obstáculo.',
  },
  {
    id: 'creativo',
    title: '4. Nivel Creativo Integrador',
    polarity: 'Síntesis plena de cuerpo, emoción y pensamiento',
    brainFocus: 'Coherencia interhemisférica y estado de flujo (flow) con sensación de bienestar y agencia.',
    classroomActivity: 'Exposición compartida con escucha activa sin juicios estéticos ("¿Qué nos cuenta tu obra?").',
  },
];

const EMOTION_THERMOMETER = [
  {
    id: 'ansioso',
    label: '⚡ Acelerado / Ansioso',
    colorName: 'Verde Salvia + Índigo',
    suggestion:
      'Activa el modo Mandala 8x con trazos lentos desde el centro hacia afuera mientras exhalas en 6 tiempos.',
  },
  {
    id: 'triste',
    label: '🌧️ Apagado / Melancólico',
    colorName: 'Terracota Cálido + Ámbar',
    suggestion:
      'Usa trazos amplios con tonos cálidos para activar energía sin forzar el habla; acompaña con una palabra clave en la bitácora.',
  },
  {
    id: 'frustrado',
    label: '🔥 Frustrado / Con Enojo',
    colorName: 'Carbón + Terracota -> Salvia',
    suggestion:
      'Descarga energía en el Nivel Kinestésico (líneas firmes y libres) y luego envuelve el trazo con un círculo de contención color salvia.',
  },
  {
    id: 'sereno',
    label: '🌿 Sereno / Curioso',
    colorName: 'Paleta Libre Armónica',
    suggestion:
      'Ideal para explorar el Nivel Cognitivo/Simbólico creando metáforas visuales o colaborando en clima escolar positivo.',
  },
];

const STUDIO_SWATCHES = [
  { name: 'Salvia Calma', hsl: 'hsl(148, 38%, 36%)' },
  { name: 'Terracota Cálida', hsl: 'hsl(18, 60%, 50%)' },
  { name: 'Índigo Profundo', hsl: 'hsl(228, 45%, 38%)' },
  { name: 'Ámbar Solar', hsl: 'hsl(38, 88%, 52%)' },
  { name: 'Cian Sutz', hsl: 'hsl(198, 75%, 45%)' },
  { name: 'Carbón Suave', hsl: 'hsl(225, 22%, 20%)' },
  { name: 'Papel Borrador', hsl: 'hsl(40, 45%, 99%)' },
];

export default function ArteTerapia() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSec = (searchParams.get('sec') as TabSection) || 'inicio';
  const [activeTab, setActiveTab] = useState<TabSection>(
    ['inicio', 'neurociencia', 'herramientas', 'taller', 'gamificacion'].includes(initialSec)
      ? initialSec
      : 'inicio'
  );
  const [theme, setTheme] = useState<NeuroTheme>('warm-paper');

  // Gamificación XP Sensorial
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('sutz_neuroarte_xp');
    const parsed = saved ? parseInt(saved, 10) : 20;
    return Number.isNaN(parsed) ? 20 : parsed;
  });
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sutz_neuroarte_badges');
      return raw ? JSON.parse(raw) : ['Bienvenida Sensorial'];
    } catch {
      return ['Bienvenida Sensorial'];
    }
  });
  const [toastMsg, setToastMsg] = useState('');

  // Respiración 4-4-6
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathLabel, setBreathLabel] = useState('Listo para respirar');

  // ETC & Termómetro & Bitácora
  const [selectedEtcId, setSelectedEtcId] = useState('kinestesico');
  const [selectedEmotionId, setSelectedEmotionId] = useState('ansioso');
  const [reflectionNote, setReflectionNote] = useState('');

  // Taller Creativo Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const [brushColor, setBrushColor] = useState(STUDIO_SWATCHES[0].hsl);
  const [brushSize, setBrushSize] = useState(6);
  const [symmetry, setSymmetry] = useState<1 | 6 | 8>(6);
  const [strokeCount, setStrokeCount] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 2600);
  }, []);

  const awardXp = useCallback(
    (amount: number, reason: string, badgeName?: string) => {
      setXp((prev) => {
        const next = prev + amount;
        localStorage.setItem('sutz_neuroarte_xp', String(next));
        return next;
      });
      if (badgeName) {
        setUnlockedBadges((prev) => {
          if (prev.includes(badgeName)) return prev;
          const updated = [...prev, badgeName];
          localStorage.setItem('sutz_neuroarte_badges', JSON.stringify(updated));
          return updated;
        });
      }
      showToast(`+${amount} XP · ${reason}`);
    },
    [showToast]
  );

  const xpRank = useMemo(() => {
    if (xp >= 150) return 'Maestro NeuroArte';
    if (xp >= 90) return 'Guardián de la Calma';
    if (xp >= 50) return 'Explorador Cromático';
    return 'Aprendiz Sensorial';
  }, [xp]);

  const changeTab = (tab: TabSection) => {
    soundEffects.playClick();
    setActiveTab(tab);
    setSearchParams({ sec: tab }, { replace: true });
  };

  // Ciclo de Respiración Guiada 4-4-6
  useEffect(() => {
    if (!breathRunning) {
      setBreathPhase('idle');
      setBreathLabel('Listo para respirar');
      return;
    }

    let cancelled = false;
    const runCycle = () => {
      if (cancelled) return;
      setBreathPhase('inhale');
      setBreathLabel('Inhala suave (4s)');

      setTimeout(() => {
        if (cancelled) return;
        setBreathPhase('hold');
        setBreathLabel('Sostén (4s)');

        setTimeout(() => {
          if (cancelled) return;
          setBreathPhase('exhale');
          setBreathLabel('Exhala largo (6s)');

          setTimeout(() => {
            if (cancelled) return;
            soundEffects.playSuccess();
            awardXp(15, 'Ciclo de calma 4-4-6 completado', 'Respiración Consciente');
            setBreathRunning(false);
          }, 6000);
        }, 4000);
      }, 4000);
    };

    runCycle();
    return () => {
      cancelled = true;
    };
  }, [breathRunning, awardXp]);

  // Inicializar Canvas en Taller Creativo
  useEffect(() => {
    if (activeTab !== 'taller' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.max(300, Math.floor(rect.width * dpr));
    const targetH = Math.max(280, Math.floor(rect.height * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'hsl(40, 45%, 99%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        historyRef.current = [canvas.toDataURL()];
      }
    }
  }, [activeTab]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawSymmetricalSegment = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize * (window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const count = symmetry;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(p1.x - cx, p1.y - cy);
      ctx.lineTo(p2.x - cx, p2.y - cy);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    canvasRef.current.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasCoords(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !lastPointRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const nextPt = getCanvasCoords(e);
    drawSymmetricalSegment(ctx, lastPointRef.current, nextPt);
    lastPointRef.current = nextPt;
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    historyRef.current.push(canvasRef.current.toDataURL());
    if (historyRef.current.length > 15) historyRef.current.shift();

    setStrokeCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        awardXp(20, 'Expresión plástica en el Taller', 'Trazos de Calma');
      }
      return next;
    });
  };

  const handleClearCanvas = () => {
    soundEffects.playClick();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'hsl(40, 45%, 99%)';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    historyRef.current = [canvasRef.current.toDataURL()];
  };

  const handleUndoCanvas = () => {
    soundEffects.playClick();
    if (!canvasRef.current || historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prevUrl = historyRef.current[historyRef.current.length - 1];
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = prevUrl;
  };

  const handleDownloadArtwork = () => {
    if (!canvasRef.current) return;
    soundEffects.playSuccess();
    const link = document.createElement('a');
    link.download = `neuroarte_sutz_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    awardXp(15, 'Obra terapéutica guardada', 'Creador Visual');
  };

  const selectedEtc = ETC_LEVELS.find((l) => l.id === selectedEtcId) || ETC_LEVELS[0];
  const selectedEmotion =
    EMOTION_THERMOMETER.find((em) => em.id === selectedEmotionId) || EMOTION_THERMOMETER[0];

  return (
    <div className="na-shell" data-theme={theme}>
      <LandingTopBar slogan="Suite Creatika · NeuroArte Lab (Arte Terapia & Sutz)" showHomeButton />

      {/* Sub-barra de NeuroArte Lab con Navegación SPA, Tema HSL y XP */}
      <header className="na-subbar">
        <div className="na-container na-subbar-inner">
          <div className="na-brand">
            <span className="na-brand-mark" aria-hidden="true">
              ✦
            </span>
            <span>NeuroArte Lab · Sutz</span>
          </div>

          <nav className="na-nav-links" aria-label="Navegación de Arte Terapia">
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'neurociencia', label: 'Neurociencia & ETC' },
              { id: 'herramientas', label: 'Herramientas' },
              { id: 'taller', label: 'Taller Creativo' },
              { id: 'gamificacion', label: 'Gamificación' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`na-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => changeTab(item.id as TabSection)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="na-header-controls">
            <select
              aria-label="Modo de Neurodiseño HSL"
              className="na-theme-select"
              value={theme}
              onChange={(e) => {
                soundEffects.playClick();
                setTheme(e.target.value as NeuroTheme);
              }}
            >
              <option value="warm-paper">Papel Cálido (HSL)</option>
              <option value="night-calm">Calma Nocturna</option>
              <option value="high-contrast">Alto Contraste</option>
            </select>

            <span className="na-xp-pill">
              <span>✨ {xp} XP</span>
              <span>· {xpRank}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="na-container na-main">
        {/* 1. INICIO */}
        {activeTab === 'inicio' && (
          <div>
            <section className="na-hero">
              <div>
                <span className="na-badge">🎨 MÓDULO 4 · CREATIKA &amp; SUTZ</span>
                <h1 className="na-hero-title">
                  Arte Terapia, Neurociencia y Contención Emocional en el Aula
                </h1>
                <p className="na-hero-subtitle">
                  Utiliza la expresión plástica y visual como un canal de contención emocional,
                  autoconocimiento y diagnóstico del clima escolar, combinando el modelo{' '}
                  <strong>ETC</strong> con neurodiseño HSL de baja fatiga cognitiva.
                </p>
                <div className="na-hero-actions">
                  <button
                    type="button"
                    className="na-btn na-btn-primary"
                    onClick={() => changeTab('taller')}
                  >
                    🎨 Abrir Taller Creativo
                  </button>
                  <button
                    type="button"
                    className="na-btn na-btn-secondary"
                    onClick={() => changeTab('herramientas')}
                  >
                    🫁 Dinámicas de Regulación
                  </button>
                  <button
                    type="button"
                    className="na-btn na-btn-secondary"
                    onClick={() => navigate('/creatika')}
                  >
                    ← Volver a Creatika
                  </button>
                </div>
              </div>

              <div className="na-card soft" style={{ textAlign: 'center' }}>
                <span className="na-badge warm">Estudio Sensorial Sutz</span>
                <svg
                  viewBox="0 0 360 220"
                  style={{ width: '100%', maxWidth: '340px', margin: '14px auto 8px' }}
                  aria-hidden="true"
                >
                  <circle cx="180" cy="110" r="88" fill="none" stroke="var(--na-accent-calm)" strokeWidth="2" strokeDasharray="6 6" />
                  <circle cx="180" cy="110" r="60" fill="hsla(148, 34%, 35%, 0.14)" stroke="var(--na-accent-neural)" strokeWidth="2" />
                  <circle cx="180" cy="110" r="32" fill="hsla(18, 56%, 48%, 0.22)" stroke="var(--na-accent-warm)" strokeWidth="2" />
                  <path d="M92 110 Q180 35 268 110 Q180 185 92 110 Z" fill="none" stroke="var(--na-accent-calm)" strokeWidth="1.8" />
                </svg>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--na-text-secondary)' }}>
                  Empatía · Escucha activa a través del arte · Sensibilidad estética · Resolución de conflictos mediante color y forma.
                </p>
              </div>
            </section>

            <section className="na-grid-3">
              <div className="na-card">
                <span className="na-badge">🧠 Base Neurocientífica</span>
                <h3 style={{ margin: '10px 0 6px' }}>Modelo ETC Interactivo</h3>
                <p style={{ margin: '0 0 14px', fontSize: '0.92rem', color: 'var(--na-text-secondary)' }}>
                  Explora cómo el trazo y el color regulan la amígdala y conectan lo sensorial con lo simbólico.
                </p>
                <button
                  type="button"
                  className="na-btn na-btn-secondary"
                  onClick={() => changeTab('neurociencia')}
                >
                  Explorar ETC ➔
                </button>
              </div>

              <div className="na-card">
                <span className="na-badge warm">🫁 Aula en Calma</span>
                <h3 style={{ margin: '10px 0 6px' }}>Termómetro &amp; Respiración</h3>
                <p style={{ margin: '0 0 14px', fontSize: '0.92rem', color: 'var(--na-text-secondary)' }}>
                  Guía de respiración 4-4-6 y diagnóstico cromático del clima emocional del grupo.
                </p>
                <button
                  type="button"
                  className="na-btn na-btn-secondary"
                  onClick={() => changeTab('herramientas')}
                >
                  Usar Herramientas ➔
                </button>
              </div>

              <div className="na-card">
                <span className="na-badge">🖌️ Lienzo Terapéutico</span>
                <h3 style={{ margin: '10px 0 6px' }}>Mandala &amp; Trazo Libre</h3>
                <p style={{ margin: '0 0 14px', fontSize: '0.92rem', color: 'var(--na-text-secondary)' }}>
                  Dibuja en simetría radial o trazo libre con paleta HSL calmante y descarga tu obra.
                </p>
                <button
                  type="button"
                  className="na-btn na-btn-primary"
                  onClick={() => changeTab('taller')}
                >
                  Ir al Lienzo ➔
                </button>
              </div>
            </section>
          </div>
        )}

        {/* 2. NEUROCIENCIA & ETC */}
        {activeTab === 'neurociencia' && (
          <section className="na-grid-2">
            <div className="na-card">
              <span className="na-badge">🧠 Expressive Therapies Continuum</span>
              <h2 style={{ margin: '10px 0 14px' }}>Los 4 Niveles del Modelo ETC</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ETC_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    className={`na-choice-btn ${selectedEtcId === lvl.id ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedEtcId(lvl.id);
                    }}
                  >
                    <strong>{lvl.title}</strong>
                    <div style={{ fontSize: '0.84rem', color: 'var(--na-text-secondary)', marginTop: '4px' }}>
                      {lvl.polarity}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="na-card soft">
              <span className="na-badge warm">Detalle Psicopedagógico</span>
              <h2 style={{ margin: '10px 0 12px' }}>{selectedEtc.title}</h2>
              <p style={{ margin: '0 0 12px' }}>
                <strong>Enfoque Neurobiológico:</strong> {selectedEtc.brainFocus}
              </p>
              <p style={{ margin: '0 0 18px' }}>
                <strong>Dinámica sugerida en el aula:</strong> {selectedEtc.classroomActivity}
              </p>
              <button
                type="button"
                className="na-btn na-btn-primary"
                onClick={() => awardXp(10, `Nivel ETC explorado: ${selectedEtc.title}`, 'Explorador ETC')}
              >
                ✓ Registrar Comprensión (+10 XP)
              </button>
            </div>
          </section>
        )}

        {/* 3. HERRAMIENTAS */}
        {activeTab === 'herramientas' && (
          <section className="na-grid-2">
            {/* Respiración 4-4-6 */}
            <div className="na-card" style={{ textAlign: 'center' }}>
              <span className="na-badge">🫁 Regulación Autonómica</span>
              <h2 style={{ margin: '10px 0 6px' }}>Respiración Guiada 4-4-6</h2>
              <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: 'var(--na-text-secondary)' }}>
                Reduce la activación de la amígdala antes de iniciar el trabajo plástico.
              </p>

              <div className={`na-breathing-circle ${breathPhase}`}>
                <span>{breathLabel}</span>
              </div>

              <button
                type="button"
                className={`na-btn ${breathRunning ? 'na-btn-warm' : 'na-btn-primary'}`}
                onClick={() => {
                  soundEffects.playClick();
                  setBreathRunning((prev) => !prev);
                }}
              >
                {breathRunning ? '⏹ Detener ciclo' : '▶ Iniciar ciclo (14s)'}
              </button>
            </div>

            {/* Termómetro Emocional Cromático */}
            <div className="na-card">
              <span className="na-badge warm">🎨 Clima Escolar &amp; Contención</span>
              <h2 style={{ margin: '10px 0 10px' }}>Termómetro Emocional Cromático</h2>
              <div className="na-grid-2" style={{ gap: '8px', marginBottom: '14px' }}>
                {EMOTION_THERMOMETER.map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    className={`na-choice-btn ${selectedEmotionId === em.id ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedEmotionId(em.id);
                    }}
                  >
                    <strong>{em.label}</strong>
                  </button>
                ))}
              </div>

              <div className="na-card soft" style={{ padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.84rem', color: 'var(--na-accent-calm)', fontWeight: 700 }}>
                  Paleta recomendada: {selectedEmotion.colorName}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.92rem' }}>{selectedEmotion.suggestion}</p>
              </div>

              <label htmlFor="na-reflection" style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', marginBottom: '6px' }}>
                Bitácora de Escucha Activa (sin juicios estéticos):
              </label>
              <textarea
                id="na-reflection"
                className="na-textarea"
                placeholder="¿Qué emoción observas en tu trazo o en el clima del aula hoy?"
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
              />
              <button
                type="button"
                className="na-btn na-btn-secondary"
                style={{ marginTop: '10px' }}
                onClick={() => {
                  if (!reflectionNote.trim()) {
                    showToast('Escribe una breve observación primero.');
                    return;
                  }
                  awardXp(15, 'Reflexión emocional registrada', 'Escucha Activa');
                  setReflectionNote('');
                }}
              >
                💾 Guardar en Bitácora (+15 XP)
              </button>
            </div>
          </section>
        )}

        {/* 4. TALLER CREATIVO */}
        {activeTab === 'taller' && (
          <section className="na-studio-grid">
            <div className="na-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <h2 style={{ margin: 0 }}>🖌️ Lienzo de Arte Terapia</h2>
                <span className="na-badge">
                  Modo: {symmetry === 1 ? 'Trazo Libre' : `Mandala ${symmetry}x`} · {strokeCount} trazos
                </span>
              </div>

              <div className="na-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  className="na-studio-canvas"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>
            </div>

            <div className="na-card soft">
              <h3 style={{ marginTop: 0 }}>Paleta Emocional HSL</h3>
              <div className="na-swatch-row">
                {STUDIO_SWATCHES.map((sw) => (
                  <button
                    key={sw.name}
                    type="button"
                    className={`na-swatch ${brushColor === sw.hsl ? 'active' : ''}`}
                    style={{ backgroundColor: sw.hsl }}
                    title={sw.name}
                    aria-label={sw.name}
                    onClick={() => {
                      soundEffects.playClick();
                      setBrushColor(sw.hsl);
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: '18px' }}>
                <label htmlFor="na-brush-size" style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
                  Grosor del trazo: {brushSize}px
                </label>
                <input
                  id="na-brush-size"
                  type="range"
                  min={2}
                  max={24}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '18px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                  Geometría de Contención:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { val: 1 as const, label: 'Libre' },
                    { val: 6 as const, label: 'Mandala 6x' },
                    { val: 8 as const, label: 'Mandala 8x' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      className={`na-btn ${symmetry === opt.val ? 'na-btn-primary' : 'na-btn-secondary'}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSymmetry(opt.val);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '22px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="na-btn na-btn-secondary" style={{ flex: 1 }} onClick={handleUndoCanvas}>
                    ↩ Deshacer
                  </button>
                  <button type="button" className="na-btn na-btn-secondary" style={{ flex: 1 }} onClick={handleClearCanvas}>
                    🧹 Limpiar
                  </button>
                </div>
                <button type="button" className="na-btn na-btn-primary" onClick={handleDownloadArtwork}>
                  💾 Descargar Obra (PNG)
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 5. GAMIFICACIÓN */}
        {activeTab === 'gamificacion' && (
          <section className="na-grid-2">
            <div className="na-card">
              <span className="na-badge">🏆 Progreso NeuroCreativo</span>
              <h2 style={{ margin: '10px 0 6px' }}>{xp} XP · {xpRank}</h2>
              <p style={{ margin: '0 0 16px', color: 'var(--na-text-secondary)' }}>
                Ganas experiencia sensorial al practicar respiración consciente, explorar el modelo ETC, registrar escucha activa y crear obras en el lienzo.
              </p>

              <div style={{ height: '14px', borderRadius: '999px', backgroundColor: 'var(--na-bg-elevated)', overflow: 'hidden', border: '1px solid var(--na-border-subtle)' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.round((xp / 180) * 100))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--na-accent-calm), var(--na-accent-warm))',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>

            <div className="na-card soft">
              <h3 style={{ marginTop: 0 }}>Insignias Desbloqueadas ({unlockedBadges.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {unlockedBadges.map((b) => (
                  <span key={b} className="na-badge warm">
                    ✦ {b}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {toastMsg && (
        <div className="na-toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
