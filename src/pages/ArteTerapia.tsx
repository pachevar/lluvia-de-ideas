import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import './ArteTerapia.css';

type NeuroTheme = 'warm-paper' | 'night-calm' | 'high-contrast';
type TabSection = 'taller_guiado' | 'neurociencia' | 'gamificacion';
type WorkshopStep = 1 | 2 | 3 | 4;
type BrushMode = 'soft' | 'stars' | 'bubbles';

const EMOTIONS = [
  { id: 'alegria', icon: '☀️', label: 'Entusiasmo / Alegría', hint: 'Energía luminosa para expandir ideas.' },
  { id: 'calma', icon: '🌿', label: 'Calma / Curiosidad', hint: 'Mente abierta para observar detalles.' },
  { id: 'tormenta', icon: '⚡', label: 'Enojo / Frustración', hint: 'Fuerza intensa que busca transformarse.' },
  { id: 'lluvia', icon: '🌧️', label: 'Tristeza / Nostalgia', hint: 'Emoción profunda que pide escucha suave.' },
  { id: 'nervios', icon: '🌀', label: 'Nervios / Incertidumbre', hint: 'Necesidad de ritmo y contención.' },
  { id: 'orgullo', icon: '🏆', label: 'Orgullo / Logro', hint: 'Reconocer tu propio avance y esfuerzo.' },
];

const MOTIVATIONS = [
  { id: 'reto', icon: '⛰️', label: 'Superar un reto difícil' },
  { id: 'ayudar', icon: '🤝', label: 'Ayudar o cuidar a alguien' },
  { id: 'imaginar', icon: '🚀', label: 'Imaginar y crear mundos' },
  { id: 'aprender', icon: '🔍', label: 'Descubrir algo nuevo' },
  { id: 'expresar', icon: '💬', label: 'Expresar lo que a veces callo' },
];

const CREATIVE_PROMPTS = [
  'Pinta tu emoción actual como si fuera un paisaje climático (sol, viento, lluvia, arcoíris o montaña).',
  'Dibuja un escudo mágico donde el centro sea tu mayor motivación para seguir adelante.',
  'Traza un camino de colores desde cómo llegaste hoy hasta cómo te gustaría sentirte al terminar.',
  'Crea una criatura o símbolo que represente la fuerza que te ayuda cuando algo sale mal.',
  'Usa líneas y burbujas para soltar lo que te preocupa y rodéalo con tu color de calma.',
];

const STUDIO_SWATCHES = [
  { name: 'Salvia Calma', meaning: 'Equilibrio', hsl: 'hsl(148, 42%, 38%)' },
  { name: 'Terracota', meaning: 'Valentía', hsl: 'hsl(18, 68%, 52%)' },
  { name: 'Índigo', meaning: 'Introspección', hsl: 'hsl(228, 52%, 44%)' },
  { name: 'Ámbar Solar', meaning: 'Motivación', hsl: 'hsl(38, 92%, 52%)' },
  { name: 'Cian Sutz', meaning: 'Claridad', hsl: 'hsl(198, 82%, 48%)' },
  { name: 'Coral Vivo', meaning: 'Alegría', hsl: 'hsl(348, 78%, 58%)' },
  { name: 'Carbón', meaning: 'Descarga', hsl: 'hsl(225, 24%, 20%)' },
  { name: 'Papel', meaning: 'Luz / Borrar', hsl: '#fffdf8' },
];

const ETC_LEVELS = [
  {
    id: 'kinestesico',
    title: '1. Nivel Kinestésico / Sensorial',
    polarity: 'Movimiento ↔ Sensación táctil y ritmo',
    brainFocus: 'Corteza sensoriomotora: libera tensión física acumulada antes de exigir palabras.',
    classroomActivity: 'Trazos amplios y burbujas al ritmo de la respiración durante 2 minutos.',
  },
  {
    id: 'perceptual',
    title: '2. Nivel Perceptual / Afectivo',
    polarity: 'Forma y límites ↔ Emoción cromática',
    brainFocus: 'Regulación de la amígdala mediante el color, la simetría y la contención visual.',
    classroomActivity: 'Mandala simétrico para ordenar pensamientos dispersos y bajar ansiedad.',
  },
  {
    id: 'cognitivo',
    title: '3. Nivel Cognitivo / Simbólico',
    polarity: 'Planificación ↔ Metáfora y motivación',
    brainFocus: 'Corteza prefrontal conectando la obra pintada con decisiones y metas personales.',
    classroomActivity: 'Dar título a la pintura y descubrir qué motivación representa.',
  },
  {
    id: 'creativo',
    title: '4. Nivel Creativo Integrador',
    polarity: 'Síntesis de emoción, cuerpo y propósito',
    brainFocus: 'Coherencia interhemisférica y estado de flujo con bienestar y agencia.',
    classroomActivity: 'Compartir voluntariamente en círculo de escucha activa sin juicios estéticos.',
  },
];

export default function ArteTerapia() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSec = (searchParams.get('sec') as TabSection) || 'taller_guiado';
  const [activeTab, setActiveTab] = useState<TabSection>(
    ['taller_guiado', 'neurociencia', 'gamificacion'].includes(initialSec)
      ? initialSec
      : 'taller_guiado'
  );
  const [theme, setTheme] = useState<NeuroTheme>('night-calm');
  const [step, setStep] = useState<WorkshopStep>(1);

  // Gamificación XP
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

  // Paso 1: Emoción, Motivación & Reto Lúdico
  const [selectedEmotionId, setSelectedEmotionId] = useState('alegria');
  const [selectedMotivationId, setSelectedMotivationId] = useState('imaginar');
  const [promptIndex, setPromptIndex] = useState(0);

  // Paso 2: Respiración 4-4-6 (Smartwatch)
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathLabel, setBreathLabel] = useState('Listo para iniciar');
  const [breathElapsed, setBreathElapsed] = useState(0);

  // Paso 3: Lienzo de Pintura
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const [brushColor, setBrushColor] = useState(STUDIO_SWATCHES[0].hsl);
  const [brushSize, setBrushSize] = useState(7);
  const [brushMode, setBrushMode] = useState<BrushMode>('soft');
  const [symmetry, setSymmetry] = useState<1 | 6 | 8>(1);
  const [strokeCount, setStrokeCount] = useState(0);
  const [artworkSnapshot, setArtworkSnapshot] = useState<string>('');

  // Paso 4: Reflexión sobre su dibujo
  const [artTitle, setArtTitle] = useState('');
  const [feelingVoice, setFeelingVoice] = useState('');
  const [motivationSpark, setMotivationSpark] = useState('');
  const [nextStepAction, setNextStepAction] = useState('');

  // ETC tab
  const [selectedEtcId, setSelectedEtcId] = useState('kinestesico');

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

  // Ciclo de Respiración 4-4-6 con progreso por segundo para Smartwatch
  useEffect(() => {
    if (!breathRunning) {
      setBreathPhase('idle');
      setBreathLabel('Listo para iniciar');
      setBreathElapsed(0);
      return;
    }

    setBreathElapsed(0);
    setBreathPhase('inhale');
    setBreathLabel('Inhala luz');

    const interval = setInterval(() => {
      setBreathElapsed((prev) => {
        const next = prev + 1;
        if (next < 4) {
          setBreathPhase('inhale');
          setBreathLabel('Inhala luz');
        } else if (next < 8) {
          setBreathPhase('hold');
          setBreathLabel('Sostén calma');
        } else if (next < 14) {
          setBreathPhase('exhale');
          setBreathLabel('Exhala tensión');
        } else {
          clearInterval(interval);
          soundEffects.playSuccess();
          awardXp(15, 'Mente lista para pintar', 'Respiración Consciente');
          setBreathRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathRunning, awardXp]);

  // Inicializar / restaurar canvas al entrar al Paso 3
  useEffect(() => {
    if (activeTab !== 'taller_guiado' || step !== 3 || !canvasRef.current) return;
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
        ctx.fillStyle = '#fffdf8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (artworkSnapshot) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = artworkSnapshot;
        } else {
          historyRef.current = [canvas.toDataURL()];
        }
      }
    }
  }, [activeTab, step, artworkSnapshot]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const drawWithBrush = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scaledSize = brushSize * dpr;

    for (let i = 0; i < symmetry; i++) {
      const angle = (Math.PI * 2 * i) / symmetry;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const x1 = p1.x - cx;
      const y1 = p1.y - cy;
      const x2 = p2.x - cx;
      const y2 = p2.y - cy;

      if (brushMode === 'soft') {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = scaledSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (brushMode === 'bubbles') {
        ctx.fillStyle = brushColor;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(x2, y2, scaledSize * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = brushColor;
        ctx.stroke();
      } else {
        // stars / destellos
        ctx.fillStyle = brushColor;
        const r = scaledSize * 1.1;
        ctx.beginPath();
        ctx.moveTo(x2, y2 - r);
        ctx.lineTo(x2 + r * 0.35, y2 - r * 0.35);
        ctx.lineTo(x2 + r, y2);
        ctx.lineTo(x2 + r * 0.35, y2 + r * 0.35);
        ctx.lineTo(x2, y2 + r);
        ctx.lineTo(x2 - r * 0.35, y2 + r * 0.35);
        ctx.lineTo(x2 - r, y2);
        ctx.lineTo(x2 - r * 0.35, y2 - r * 0.35);
        ctx.closePath();
        ctx.fill();
      }

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
    drawWithBrush(ctx, lastPointRef.current, nextPt);
    lastPointRef.current = nextPt;
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const snapshot = canvasRef.current.toDataURL();
    setArtworkSnapshot(snapshot);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 18) historyRef.current.shift();

    setStrokeCount((prev) => {
      const next = prev + 1;
      if (next === 3) {
        awardXp(20, 'Expresión artística desbloqueada', 'Trazos de Calma');
      }
      return next;
    });
  };

  const handleClearCanvas = () => {
    soundEffects.playClick();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const blank = canvasRef.current.toDataURL();
    setArtworkSnapshot(blank);
    historyRef.current = [blank];
  };

  const handleUndoCanvas = () => {
    soundEffects.playClick();
    if (!canvasRef.current || historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prevUrl = historyRef.current[historyRef.current.length - 1];
    setArtworkSnapshot(prevUrl);
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

  const handleGoToReflection = () => {
    soundEffects.playClick();
    if (canvasRef.current) {
      setArtworkSnapshot(canvasRef.current.toDataURL('image/png'));
    }
    setStep(4);
  };

  const handleDownloadArtwork = () => {
    if (!canvasRef.current && !artworkSnapshot) return;
    soundEffects.playSuccess();
    const link = document.createElement('a');
    link.download = `pintura_emocional_sutz_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current ? canvasRef.current.toDataURL('image/png') : artworkSnapshot;
    link.click();
    awardXp(15, 'Pintura descargada', 'Creador Visual');
  };

  const handleDownloadReflectionPdf = () => {
    soundEffects.playSuccess();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(artTitle.trim() || 'Mi Obra de Arte Terapia · Sutz', 16, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Emoción inicial: ${selectedEmotion.label}  |  Motivación: ${selectedMotivation.label}`,
      16,
      27
    );

    let y = 34;
    if (artworkSnapshot) {
      try {
        doc.addImage(artworkSnapshot, 'PNG', 16, y, 178, 100);
        y += 108;
      } catch {
        // Continuar si el navegador restringe el formato
      }
    }

    const blocks: Array<[string, string]> = [
      ['Si mi pintura pudiera hablar, diría que siente', feelingVoice || 'Sin completar'],
      ['La motivación o fuerza escondida en mi dibujo', motivationSpark || 'Sin completar'],
      ['Mi pequeño paso para esta semana', nextStepAction || 'Sin completar'],
    ];

    blocks.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${label}:`, 16, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(val, 178);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 5;
    });

    doc.save(`diario_pintura_${(artTitle || 'sutz').toLowerCase().replace(/\s+/g, '_')}.pdf`);
    awardXp(25, 'Reflexión emocional completada', 'Artista Reflexivo');
  };

  const selectedEmotion = EMOTIONS.find((e) => e.id === selectedEmotionId) || EMOTIONS[0];
  const selectedMotivation =
    MOTIVATIONS.find((m) => m.id === selectedMotivationId) || MOTIVATIONS[0];
  const selectedEtc = ETC_LEVELS.find((l) => l.id === selectedEtcId) || ETC_LEVELS[0];

  return (
    <div className="na-shell" data-theme={theme}>
      {/* Orbes cromáticos animados de fondo */}
      <div className="na-bg-orbs" aria-hidden="true">
        <div className="na-orb na-orb-1" />
        <div className="na-orb na-orb-2" />
        <div className="na-orb na-orb-3" />
      </div>

      <LandingTopBar slogan="Suite Creatika · Taller Lúdico de Arte Terapia Sutz" showHomeButton />

      {/* Sub-barra sticky */}
      <header className="na-subbar">
        <div className="na-container na-subbar-inner">
          <div className="na-brand">
            <span className="na-brand-mark" aria-hidden="true">
              🎨
            </span>
            <span>NeuroArte Lab · Taller de Pintura</span>
          </div>

          <nav className="na-nav-links" aria-label="Navegación de Arte Terapia">
            {[
              { id: 'taller_guiado', label: '🎨 Taller de Pintura (4 Pasos)' },
              { id: 'neurociencia', label: '🧠 Neurociencia & ETC' },
              { id: 'gamificacion', label: '🏆 Logros XP' },
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
              aria-label="Modo visual"
              className="na-theme-select"
              value={theme}
              onChange={(e) => {
                soundEffects.playClick();
                setTheme(e.target.value as NeuroTheme);
              }}
            >
              <option value="night-calm">🌙 Calma Nocturna</option>
              <option value="warm-paper">📜 Papel Cálido</option>
              <option value="high-contrast">👁️ Alto Contraste</option>
            </select>

            <span className="na-xp-pill">
              <span>✨ {xp} XP</span>
              <span>· {xpRank}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="na-container na-main">
        {/* ====================================================================
            TALLER GUIADO DE PINTURA, EMOCIONES Y MOTIVACIONES
            ==================================================================== */}
        {activeTab === 'taller_guiado' && (
          <div className="na-pop-in">
            {/* Hero compacto y alegre */}
            <section className="na-hero">
              <div>
                <span className="na-badge warm">🪷 MÓDULO 4 · ARTE TERAPIA VIVA EN CREATIKA</span>
                <h1 className="na-hero-title">
                  Pinta lo que sientes, descubre qué te motiva
                </h1>
                <p className="na-hero-subtitle">
                  Un taller interactivo en 4 pasos para que cada estudiante explore sus{' '}
                  <strong>emociones</strong> y <strong>motivaciones</strong> a través del color,
                  pinceles mágicos y una reflexión guiada sobre su propia obra.
                </p>
                <div className="na-hero-actions">
                  <button
                    type="button"
                    className="na-btn na-btn-primary"
                    onClick={() => {
                      soundEffects.playClick();
                      setStep(3);
                    }}
                  >
                    🖌️ Ir directo a Pintar
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

              <div className="na-card soft interactive">
                <span className="na-badge">Tu Brújula Actual</span>
                <h3 style={{ margin: '10px 0 6px' }}>
                  {selectedEmotion.icon} {selectedEmotion.label}
                </h3>
                <p style={{ margin: '0 0 10px', fontSize: '0.9rem' }}>
                  Motivación elegida: <strong>{selectedMotivation.icon} {selectedMotivation.label}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.86rem' }}>
                  Reto activo: <em>“{CREATIVE_PROMPTS[promptIndex]}”</em>
                </p>
              </div>
            </section>

            {/* Stepper 4 Pasos */}
            <div className="na-stepper" role="tablist" aria-label="Pasos del taller de pintura">
              {[
                { num: 1 as const, label: '1. 🎭 Emoción & Motivación' },
                { num: 2 as const, label: '2. 🫁 Respirar y Soltar' },
                { num: 3 as const, label: '3. 🎨 Pintar la Obra' },
                { num: 4 as const, label: '4. 🪞 Espejo Reflexivo' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  role="tab"
                  aria-selected={step === s.num}
                  className={`na-step-pill ${step === s.num ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    if (s.num === 4 && canvasRef.current) {
                      setArtworkSnapshot(canvasRef.current.toDataURL('image/png'));
                    }
                    setStep(s.num);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* PASO 1: EMOCIÓN, MOTIVACIÓN & DADO LÚDICO */}
            {step === 1 && (
              <section className="na-card na-pop-in">
                <h2 style={{ marginTop: 0 }}>🎭 Paso 1: ¿Cómo late tu mundo hoy y qué te impulsa?</h2>
                <p>Elige la emoción que más se parece a tu momento actual y tu motor interior:</p>

                <div className="na-grid-3" style={{ marginBottom: '20px' }}>
                  {EMOTIONS.map((em) => (
                    <button
                      key={em.id}
                      type="button"
                      className={`na-choice-btn ${selectedEmotionId === em.id ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedEmotionId(em.id);
                      }}
                    >
                      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                        {em.icon} {em.label}
                      </div>
                      <div style={{ fontSize: '0.84rem', marginTop: '4px', color: 'var(--na-text-secondary)' }}>
                        {em.hint}
                      </div>
                    </button>
                  ))}
                </div>

                <h3>🔥 ¿Qué motivación te mueve hoy?</h3>
                <div className="na-grid-3">
                  {MOTIVATIONS.map((mot) => (
                    <button
                      key={mot.id}
                      type="button"
                      className={`na-choice-btn ${selectedMotivationId === mot.id ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedMotivationId(mot.id);
                      }}
                    >
                      <strong>
                        {mot.icon} {mot.label}
                      </strong>
                    </button>
                  ))}
                </div>

                <div className="na-prompt-banner">
                  <div>
                    <span className="na-badge warm">🎲 Consigna Lúdica de Pintura</span>
                    <p style={{ margin: '8px 0 0', fontWeight: 700, color: 'var(--na-text-primary)' }}>
                      “{CREATIVE_PROMPTS[promptIndex]}”
                    </p>
                  </div>
                  <button
                    type="button"
                    className="na-btn na-btn-warm"
                    onClick={() => {
                      soundEffects.playClick();
                      setPromptIndex((prev) => (prev + 1) % CREATIVE_PROMPTS.length);
                    }}
                  >
                    🎲 Cambiar reto
                  </button>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="na-btn na-btn-primary"
                    onClick={() => {
                      soundEffects.playClick();
                      setStep(2);
                    }}
                  >
                    Siguiente: Respirar y Preparar la Mano ➔
                  </button>
                </div>
              </section>
            )}

            {/* PASO 2: SMARTWATCH DE RESPIRACIÓN & CORAZÓN */}
            {step === 2 && (() => {
              const phaseSecondsLeft = !breathRunning
                ? 14
                : breathElapsed < 4
                  ? 4 - breathElapsed
                  : breathElapsed < 8
                    ? 8 - breathElapsed
                    : 14 - breathElapsed;
              const liveBpm = !breathRunning
                ? 76
                : breathPhase === 'inhale'
                  ? 78
                  : breathPhase === 'hold'
                    ? 70
                    : 62;
              const ringRadius = 112;
              const ringCirc = 2 * Math.PI * ringRadius;
              const ringOffset = ringCirc * (1 - (breathRunning ? breathElapsed / 14 : 0));

              return (
                <section className="na-card na-pop-in" style={{ textAlign: 'center' }}>
                  <span className="na-badge">⌚ Paso 2 · Calma antes del Trazo</span>
                  <h2 style={{ margin: '10px 0 6px' }}>Respirar y Soltar · Reloj de Calma</h2>
                  <p style={{ maxWidth: '620px', margin: '0 auto 18px' }}>
                    Sigue el pulso del corazón en tu smartwatch sensorial: inhala 4s, sostén 4s y
                    exhala suave 6s para relajar la mano antes de pintar.
                  </p>

                  <div className="na-breath-bubble-stage">
                    <div className={`na-breath-bubble ${breathPhase}`}>
                      <svg className="na-watch-ring-svg" viewBox="0 0 250 250" aria-hidden="true">
                        <defs>
                          <linearGradient id="watchRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="50%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#fb7185" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="125"
                          cy="125"
                          r={ringRadius}
                          stroke="rgba(148, 163, 184, 0.16)"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          cx="125"
                          cy="125"
                          r={ringRadius}
                          stroke="url(#watchRingGrad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={ringCirc}
                          strokeDashoffset={ringOffset}
                          transform="rotate(-90 125 125)"
                          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                        />
                      </svg>

                      <div className={`na-watch-aura ${breathPhase}`} aria-hidden="true" />

                      <div className={`na-watch-heart-box ${breathPhase}`}>
                        <svg
                          className="na-watch-heart-svg"
                          viewBox="0 0 24 24"
                          fill="url(#heartGrad)"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#fb7185" />
                              <stop offset="100%" stopColor="#f43f5e" />
                            </linearGradient>
                          </defs>
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>

                        <div className="na-watch-phase-text">{breathLabel}</div>
                        <div className="na-watch-timer-num">
                          {breathRunning ? `${phaseSecondsLeft}s` : '14s'}
                        </div>
                      </div>
                    </div>

                    <div className="na-watch-metrics compact">
                      <div className="na-watch-bpm">
                        <span className="na-bpm-heart">♥</span>
                        <span>{liveBpm} BPM</span>
                      </div>
                      <div className="na-watch-ecg" aria-hidden="true">
                        <svg viewBox="0 0 80 20" fill="none">
                          <polyline
                            points="0,10 18,10 24,3 30,17 36,6 42,12 48,10 80,10"
                            stroke="#34d399"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '22px' }}>
                    <button
                      type="button"
                      className={`na-btn ${breathRunning ? 'na-btn-warm' : 'na-btn-primary'}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setBreathRunning((prev) => !prev);
                      }}
                    >
                      {breathRunning ? '⏹ Detener ciclo' : '▶ Iniciar ciclo en reloj (14s)'}
                    </button>

                    <button
                      type="button"
                      className="na-btn na-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setStep(3);
                      }}
                    >
                      Ir al Estudio de Pintura ➔
                    </button>
                  </div>
                </section>
              );
            })()}

            {/* PASO 3: ESTUDIO DE PINTURA LÚDICO */}
            {step === 3 && (
              <section className="na-studio-grid na-pop-in">
                <div className="na-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <h2 style={{ margin: 0 }}>🎨 Paso 3: Pinta tu Mundo Interior</h2>
                    <span className="na-badge">
                      {symmetry === 1 ? 'Trazo Libre' : `Mandala ${symmetry}x`} · {strokeCount} trazos
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>
                    <strong>Reto:</strong> {CREATIVE_PROMPTS[promptIndex]}
                  </p>

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
                  <h3 style={{ marginTop: 0 }}>1. Elige un Color con Sentido</h3>
                  <div className="na-swatch-row">
                    {STUDIO_SWATCHES.map((sw) => (
                      <button
                        key={sw.name}
                        type="button"
                        className={`na-swatch-btn ${brushColor === sw.hsl ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setBrushColor(sw.hsl);
                        }}
                      >
                        <span className="na-swatch-dot" style={{ backgroundColor: sw.hsl }} />
                        <span>{sw.meaning}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <h3 style={{ margin: '0 0 8px' }}>2. Tipo de Pincel Lúdico</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'soft' as const, label: '🖌️ Suave' },
                        { id: 'bubbles' as const, label: '🫧 Burbujas' },
                        { id: 'stars' as const, label: '✨ Estrellas' },
                      ].map((bm) => (
                        <button
                          key={bm.id}
                          type="button"
                          className={`na-btn ${brushMode === bm.id ? 'na-btn-warm' : 'na-btn-secondary'}`}
                          onClick={() => {
                            soundEffects.playClick();
                            setBrushMode(bm.id);
                          }}
                        >
                          {bm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label htmlFor="na-brush-size" style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>
                      Tamaño del pincel: {brushSize}px
                    </label>
                    <input
                      id="na-brush-size"
                      type="range"
                      min={3}
                      max={24}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <h3 style={{ margin: '0 0 8px' }}>3. Geometría (Libre o Mandala)</h3>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="na-btn na-btn-secondary" style={{ flex: 1 }} onClick={handleUndoCanvas}>
                        ↩ Deshacer
                      </button>
                      <button type="button" className="na-btn na-btn-secondary" style={{ flex: 1 }} onClick={handleClearCanvas}>
                        🧹 Limpiar
                      </button>
                    </div>
                    <button type="button" className="na-btn na-btn-secondary" onClick={handleDownloadArtwork}>
                      💾 Descargar solo Pintura (PNG)
                    </button>
                    <button type="button" className="na-btn na-btn-primary" onClick={handleGoToReflection}>
                      🪞 Reflexionar sobre mi Dibujo ➔
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* PASO 4: ESPEJO DE EMOCIONES Y MOTIVACIONES */}
            {step === 4 && (
              <section className="na-grid-2 na-pop-in">
                <div className="na-card soft">
                  <span className="na-badge warm">🖼️ Tu Obra Terminada</span>
                  <h2 style={{ margin: '10px 0 12px' }}>Observa tu pintura con curiosidad</h2>
                  {artworkSnapshot ? (
                    <img
                      src={artworkSnapshot}
                      alt="Pintura emocional creada en el taller"
                      className="na-reflection-preview"
                    />
                  ) : (
                    <p>Aún no has trazado en el lienzo. ¡Regresa al Paso 3 para pintar!</p>
                  )}

                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="na-btn na-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setStep(3);
                      }}
                    >
                      ← Seguir pintando
                    </button>
                  </div>
                </div>

                <div className="na-card">
                  <span className="na-badge">🪞 Paso 4 · Descubriendo Emociones y Motivaciones</span>
                  <h2 style={{ margin: '10px 0 14px' }}>Diario de tu Pintura</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label htmlFor="na-art-title" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                        1. Ponle un título a tu obra
                      </label>
                      <input
                        id="na-art-title"
                        type="text"
                        className="na-input"
                        placeholder="Ej. El cielo después de la lluvia, Mi escudo de calma..."
                        value={artTitle}
                        onChange={(e) => setArtTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="na-feeling-voice" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                        2. Si tu pintura pudiera hablar, ¿qué emoción diría que siente?
                      </label>
                      <textarea
                        id="na-feeling-voice"
                        className="na-textarea"
                        placeholder="¿Qué parte del color o de la forma expresa cómo te sientes?"
                        value={feelingVoice}
                        onChange={(e) => setFeelingVoice(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="na-motivation-spark" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                        3. ¿Qué detalle del dibujo muestra tu motivación o lo que te da fuerza?
                      </label>
                      <textarea
                        id="na-motivation-spark"
                        className="na-textarea"
                        placeholder="Ej. Las estrellas amarillas son mis ganas de aprender..."
                        value={motivationSpark}
                        onChange={(e) => setMotivationSpark(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="na-next-step" style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>
                        4. Un paso pequeño para esta semana guiado por esa motivación
                      </label>
                      <input
                        id="na-next-step"
                        type="text"
                        className="na-input"
                        placeholder="Ej. Pedir ayuda si me trabo o dedicar 15 min a mi meta..."
                        value={nextStepAction}
                        onChange={(e) => setNextStepAction(e.target.value)}
                      />
                    </div>

                    <button type="button" className="na-btn na-btn-primary" onClick={handleDownloadReflectionPdf}>
                      📄 Descargar Diario + Pintura en PDF (+25 XP)
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ====================================================================
            NEUROCIENCIA & ETC
            ==================================================================== */}
        {activeTab === 'neurociencia' && (
          <section className="na-grid-2 na-pop-in">
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
              <span className="na-badge warm">Sustento para Docentes</span>
              <h2 style={{ margin: '10px 0 12px' }}>{selectedEtc.title}</h2>
              <p>
                <strong>Base Neurobiológica:</strong> {selectedEtc.brainFocus}
              </p>
              <p>
                <strong>Aplicación en el Taller de Pintura:</strong> {selectedEtc.classroomActivity}
              </p>
              <button
                type="button"
                className="na-btn na-btn-primary"
                onClick={() => awardXp(10, `Nivel ETC explorado`, 'Explorador ETC')}
              >
                ✓ Registrar Comprensión (+10 XP)
              </button>
            </div>
          </section>
        )}

        {/* ====================================================================
            GAMIFICACIÓN XP
            ==================================================================== */}
        {activeTab === 'gamificacion' && (
          <section className="na-grid-2 na-pop-in">
            <div className="na-card">
              <span className="na-badge">🏆 Progreso NeuroCreativo</span>
              <h2 style={{ margin: '10px 0 6px' }}>
                {xp} XP · {xpRank}
              </h2>
              <p>
                Suma experiencia al respirar conscientemente, pintar con propósito y completar tu espejo reflexivo de emociones y motivaciones.
              </p>
              <div
                style={{
                  height: '16px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--na-bg-elevated)',
                  overflow: 'hidden',
                  border: '1px solid var(--na-border-subtle)',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((xp / 180) * 100))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #34d399, #38bdf8, #fb923c)',
                    transition: 'width 350ms ease',
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
