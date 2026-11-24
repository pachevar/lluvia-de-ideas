import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import {
  CHOLQIJ_QUIZ,
  KICHE_NAWALES,
  calcCholqij,
  createGearPath,
  gregorianToJdn,
  shiftDate,
  type KicheNawal,
} from '../data/cholqijData';
import './CalendarioMaya.css';

type CholqijTheme = 'observatory-night' | 'solar-parchment' | 'high-contrast';
type TabSection = 'calculadora' | 'nahuales' | 'mecanica' | 'desafio';

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateDiffDays(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split('-').map(Number);
  const [y2, m2, d2] = toIso.split('-').map(Number);
  return gregorianToJdn(y2 || 2026, m2 || 11, d2 || 24) - gregorianToJdn(y1 || 2026, m1 || 11, d1 || 24);
}

function MayaNumeralSvg({ value, size = 54 }: { value: number; size?: number }) {
  const v = Math.max(1, Math.min(13, value));
  const bars = Math.floor(v / 5);
  const dots = v % 5;

  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-label={`Numeral maya ${v}`}>
      {dots > 0 &&
        Array.from({ length: dots }).map((_, i) => {
          const tw = (dots - 1) * 12;
          const x = 30 - tw / 2 + i * 12;
          const y = bars === 0 ? 30 : bars === 1 ? 20 : 14;
          return <circle key={`d-${i}`} cx={x} cy={y} r="4.3" fill="var(--cm-accent-jade)" />;
        })}
      {Array.from({ length: bars }).map((_, b) => {
        const y = dots === 0 ? (bars === 1 ? 27 : 20 + b * 13) : bars === 1 ? 33 : 27 + b * 13;
        return (
          <rect
            key={`b-${b}`}
            x="10"
            y={y}
            width="40"
            height="7"
            rx="3.5"
            fill="var(--cm-accent-jade)"
          />
        );
      })}
    </svg>
  );
}

export default function CalendarioMaya() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSec = searchParams.get('sec') as TabSection | null;
  const [activeTab, setActiveTab] = useState<TabSection>(
    initialSec && ['calculadora', 'nahuales', 'mecanica', 'desafio'].includes(initialSec)
      ? initialSec
      : 'calculadora'
  );
  const [theme, setTheme] = useState<CholqijTheme>('observatory-night');

  // Estado principal de fecha y rotación acumulada diente a diente
  const [dateInput, setDateInput] = useState<string>(() => getTodayIso());
  const prevDateRef = useRef<string>(dateInput);
  const initialRes = useMemo(() => calcCholqij(dateInput), [dateInput]);
  const [angle13, setAngle13] = useState<number>(() => -((initialRes.energy - 1) * (360 / 13)));
  const [angle20, setAngle20] = useState<number>(() => 180 - initialRes.nawal.index * (360 / 20));
  const [autoPlay, setAutoPlay] = useState(false);

  // Enciclopedia, Simulador, Quiz y Gamificación XP
  const [elementFilter, setElementFilter] = useState<'Todos' | 'Agua' | 'Aire' | 'Fuego' | 'Tierra'>('Todos');
  const [simDay, setSimDay] = useState(1);
  const [modalNawal, setModalNawal] = useState<KicheNawal | null>(() => {
    const slug = searchParams.get('nawal');
    return slug ? KICHE_NAWALES.find((n) => n.slug === slug) || null : null;
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('sutz_cholqij_xp');
    const parsed = saved ? parseInt(saved, 10) : 25;
    return Number.isNaN(parsed) ? 25 : parsed;
  });

  const [discovered, setDiscovered] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('sutz_cholqij_discovered');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem('sutz_cholqij_quiz');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? '' : prev));
    }, 2500);
  }, []);

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem('sutz_cholqij_xp', String(next));
      return next;
    });
  }, []);

  const recordDiscovery = useCallback(
    (slug: string, name: string) => {
      setDiscovered((prev) => {
        if (prev.includes(slug)) return prev;
        const next = [...prev, slug];
        localStorage.setItem('sutz_cholqij_discovered', JSON.stringify(next));
        addXp(20);
        showToast(`+20 XP · Nawal ${name} descubierto`);
        return next;
      });
    },
    [addXp, showToast]
  );

  const result = useMemo(() => calcCholqij(dateInput), [dateInput]);

  // Registrar descubrimiento del nawal actual y rotar engranajes suavemente según días avanzados
  useEffect(() => {
    recordDiscovery(result.nawal.slug, result.nawal.name);
  }, [result.nawal.slug, result.nawal.name, recordDiscovery]);

  const updateDateAndRotate = useCallback((nextIso: string) => {
    const delta = dateDiffDays(prevDateRef.current, nextIso);
    prevDateRef.current = nextIso;
    setDateInput(nextIso);

    if (delta !== 0) {
      // Limitar giro visual máximo para saltos largos de años (ej. fecha de nacimiento)
      const clampedVisualDelta = Math.abs(delta) > 40 ? (delta > 0 ? 13 : -13) : delta;
      if (Math.abs(delta) <= 40) {
        setAngle13((a) => a - clampedVisualDelta * (360 / 13));
        setAngle20((a) => a + clampedVisualDelta * (360 / 20));
      } else {
        const nextRes = calcCholqij(nextIso);
        setAngle13(-((nextRes.energy - 1) * (360 / 13)) - 360);
        setAngle20(180 - nextRes.nawal.index * (360 / 20) + 180);
      }
    }
  }, []);

  // Auto-play ciclo
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      updateDateAndRotate(shiftDate(prevDateRef.current, 1));
    }, 1150);
    return () => clearInterval(timer);
  }, [autoPlay, updateDateAndRotate]);

  useEffect(() => {
    if (!modalNawal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalNawal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalNawal]);

  const xpTitle = useMemo(() => {
    if (xp >= 240) return "Ajq'ij Explorador";
    if (xp >= 120) return 'Observador del Tiempo';
    return "Iniciado del Cholq'ij";
  }, [xp]);

  const gear13Path = useMemo(() => createGearPath(175, 210, 118, 102, 13), []);
  const gear20Path = useMemo(() => createGearPath(445, 210, 168, 152, 20), []);

  const changeTab = (tab: TabSection) => {
    soundEffects.playClick();
    if (tab !== 'calculadora') setAutoPlay(false);
    setActiveTab(tab);
    setSearchParams({ sec: tab }, { replace: true });
  };

  const openNawalModal = (n: KicheNawal) => {
    soundEffects.playClick();
    recordDiscovery(n.slug, n.name);
    setModalNawal(n);
    setSearchParams({ sec: activeTab, nawal: n.slug }, { replace: true });
  };

  const closeNawalModal = () => {
    setModalNawal(null);
    setSearchParams({ sec: activeTab }, { replace: true });
  };

  const handleShareNawal = async (n: KicheNawal) => {
    soundEffects.playClick();
    const url = `${window.location.origin}/creatika/calendario-maya?sec=nahuales&nawal=${n.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nawal ${n.name} · Cholq'ij Lab`,
          text: `Descubre la energía y significado del Nawal K'iche' ${n.name} (${n.essence})`,
          url,
        });
        return;
      } catch {
        // Fallback a portapapeles
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast(`🔗 Enlace de ${n.name} copiado`);
    }
  };

  const filteredNawales =
    elementFilter === 'Todos'
      ? KICHE_NAWALES
      : KICHE_NAWALES.filter((n) => n.element === elementFilter);

  const simEnergy = ((simDay - 1) % 13) + 1;
  const simNawal = KICHE_NAWALES[(simDay - 1 + 10) % 20];

  return (
    <div className="cm-shell" data-theme={theme}>
      <div className="cm-stars-bg" aria-hidden="true" />

      <LandingTopBar slogan="Suite Creatika · Cholq'ij Lab (Calendario Maya K'iche')" showHomeButton />

      {/* Sub-barra sticky */}
      <header className="cm-subbar">
        <div className="cm-container cm-subbar-inner">
          <div className="cm-brand">
            <span className="cm-brand-mark" aria-hidden="true">
              ☀️
            </span>
            <span>Cholq'ij Lab</span>
          </div>

          <nav className="cm-nav-links" aria-label="Navegación del Calendario Maya">
            {[
              { id: 'calculadora', label: '⚙️ Calculadora' },
              { id: 'nahuales', label: '🌀 20 Nahuales' },
              { id: 'mecanica', label: '📐 Mecánica 13×20' },
              { id: 'desafio', label: '🏆 Desafío' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`cm-nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => changeTab(item.id as TabSection)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="cm-header-controls">
            <select
              aria-label="Paleta visual HSL"
              className="cm-theme-select"
              value={theme}
              onChange={(e) => {
                soundEffects.playClick();
                setTheme(e.target.value as CholqijTheme);
              }}
            >
              <option value="observatory-night">🌙 Noche de Observatorio</option>
              <option value="solar-parchment">📜 Pergamino Solar</option>
              <option value="high-contrast">👁️ Alto Contraste</option>
            </select>

            <span className="cm-xp-pill">
              ✨ {xp} XP · {xpTitle}
            </span>
          </div>
        </div>
      </header>

      <main className="cm-container cm-main">
        {/* ====================================================================
            1. CALCULADORA MECÁNICA DEL CHOLQ'IJ
            ==================================================================== */}
        {activeTab === 'calculadora' && (
          <div className="cm-pop-in">
            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="cm-badge">Cosmovisión Maya K'iche' · Correlación GMT 584283</span>
                <h1 className="cm-hero-title">
                  Calculadora Mecánica del Calendario Cholq'ij (Tzolk'in)
                </h1>
                <p style={{ maxWidth: '72ch', margin: 0 }}>
                  Ingresa tu fecha de nacimiento o cualquier día para observar cómo giran en sentido opuesto los dos engranajes sagrados: <strong>13 energías</strong> y <strong>20 nahuales K'iche'</strong>.
                </p>
              </div>
              <button
                type="button"
                className="cm-btn cm-btn-secondary"
                onClick={() => {
                  soundEffects.playClick();
                  navigate('/creatika');
                }}
              >
                ← Volver a Creatika
              </button>
            </header>

            <div className="cm-calc-grid">
              {/* Escenario Mecánico SVG */}
              <section>
                <div className="cm-gear-stage">
                  <svg viewBox="0 0 640 420" role="img" aria-label="Engranajes mecánicos del calendario Cholq'ij">
                    <defs>
                      <radialGradient id="cmJadeGrad" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="hsl(152, 42%, 44%)" />
                        <stop offset="100%" stopColor="hsl(152, 46%, 26%)" />
                      </radialGradient>
                      <radialGradient id="cmTerraGrad" cx="50%" cy="50%" r="55%">
                        <stop offset="0%" stopColor="hsl(16, 64%, 54%)" />
                        <stop offset="100%" stopColor="hsl(16, 66%, 36%)" />
                      </radialGradient>
                    </defs>

                    <circle cx="175" cy="210" r="134" fill="none" stroke="var(--cm-border)" strokeDasharray="4 6" />
                    <circle cx="445" cy="210" r="184" fill="none" stroke="var(--cm-border)" strokeDasharray="4 6" />

                    {/* Engranaje de 13 Energías */}
                    <g
                      className="cm-gear-rotator"
                      style={{
                        transform: `rotate(${angle13}deg)`,
                        transformOrigin: '175px 210px',
                      }}
                    >
                      <path d={gear13Path} fill="url(#cmJadeGrad)" stroke="hsl(42, 80%, 56%)" strokeWidth="2" />
                      <circle cx="175" cy="210" r="76" fill="var(--cm-bg-surface)" stroke="hsl(42, 80%, 56%)" strokeWidth="2" />
                      {Array.from({ length: 13 }).map((_, i) => {
                        const deg = i * (360 / 13);
                        const rad = (deg * Math.PI) / 180;
                        const tx = 175 + 88 * Math.cos(rad);
                        const ty = 210 + 88 * Math.sin(rad);
                        const isActive = i + 1 === result.energy;
                        return (
                          <g key={i} transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) rotate(${deg + 90})`}>
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              fontSize="12.5"
                              fontWeight="800"
                              fill={isActive ? '#fde047' : '#ffffff'}
                            >
                              {i + 1}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx="175" cy="210" r="27" fill="var(--cm-accent-jade)" />
                      <text x="175" y="214" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="800">
                        13
                      </text>
                    </g>

                    {/* Engranaje de 20 Nahuales */}
                    <g
                      className="cm-gear-rotator"
                      style={{
                        transform: `rotate(${angle20}deg)`,
                        transformOrigin: '445px 210px',
                      }}
                    >
                      <path d={gear20Path} fill="url(#cmTerraGrad)" stroke="hsl(42, 80%, 56%)" strokeWidth="2" />
                      <circle cx="445" cy="210" r="122" fill="var(--cm-bg-surface)" stroke="hsl(42, 80%, 56%)" strokeWidth="2" />
                      {KICHE_NAWALES.map((n, i) => {
                        const deg = i * (360 / 20);
                        const rad = (deg * Math.PI) / 180;
                        const tx = 445 + 136 * Math.cos(rad);
                        const ty = 210 + 136 * Math.sin(rad);
                        const isActive = i === result.nawal.index;
                        return (
                          <g key={n.slug} transform={`translate(${tx.toFixed(1)}, ${ty.toFixed(1)}) rotate(${deg + 180})`}>
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fontSize="9.5"
                              fontWeight={isActive ? '900' : '600'}
                              fill={isActive ? '#fde047' : '#ffffff'}
                            >
                              {n.name}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx="445" cy="210" r="32" fill="var(--cm-accent-terra)" />
                      <text x="445" y="214" textAnchor="middle" fill="#ffffff" fontSize="11.5" fontWeight="800">
                        20
                      </text>
                    </g>

                    {/* Visor central de engraje */}
                    <g className="cm-pulse-glow">
                      <rect x="262" y="186" width="52" height="48" rx="12" fill="none" stroke="#fbbf24" strokeWidth="3" />
                      <polygon points="288,172 281,184 295,184" fill="#fbbf24" />
                      <text x="288" y="254" textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--cm-text-secondary)">
                        ENGRAJE DEL Q'IJ
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="cm-card" style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate(shiftDate(dateInput, -1));
                      }}
                    >
                      ← -1 Día
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-primary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate(shiftDate(dateInput, 1));
                      }}
                    >
                      +1 Día →
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate(shiftDate(dateInput, 13));
                      }}
                    >
                      +13 (Trecena)
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate(shiftDate(dateInput, 20));
                      }}
                    >
                      +20 (Winal)
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`cm-btn ${autoPlay ? 'cm-btn-warm' : 'cm-btn-secondary'}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setAutoPlay((prev) => !prev);
                    }}
                  >
                    {autoPlay ? '⏸ Pausar Ciclo' : '▶ Animar Ciclo'}
                  </button>
                </div>
              </section>

              {/* Panel derecho de fecha y lectura */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="cm-card">
                  <label htmlFor="cholqij-date" style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>
                    Selecciona una fecha gregoriana (o tu nacimiento):
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      id="cholqij-date"
                      type="date"
                      className="cm-date-input"
                      value={dateInput}
                      onChange={(e) => {
                        if (e.target.value) {
                          setAutoPlay(false);
                          updateDateAndRotate(e.target.value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cm-btn cm-btn-primary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate(getTodayIso());
                      }}
                    >
                      ☀️ Hoy
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        soundEffects.playClick();
                        setAutoPlay(false);
                        updateDateAndRotate('2012-12-21');
                      }}
                    >
                      13 Baktun (2012)
                    </button>
                  </div>
                </div>

                <article className="cm-card soft" style={{ borderLeft: '5px solid var(--cm-accent-terra)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <span className="cm-badge warm">Día {result.cycleDay} de 260</span>
                      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', margin: '8px 0 4px' }}>
                        {result.energy} {result.nawal.name} {result.nawal.emoji}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>
                        <strong>Haab':</strong> {result.haabLabel} · <strong>Cuenta Larga:</strong>{' '}
                        {result.longCount.join('.')}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>
                        <strong>Elemento:</strong> {result.nawal.element} · <strong>Rumbo:</strong>{' '}
                        {result.nawal.cardinal}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: 'center',
                        backgroundColor: 'var(--cm-bg-surface)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: '1px solid var(--cm-border)',
                        flexShrink: 0,
                      }}
                    >
                      <MayaNumeralSvg value={result.energy} size={50} />
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cm-text-muted)' }}>
                        Energía {result.energy}
                      </div>
                    </div>
                  </div>

                  <p style={{ marginTop: '14px' }}>{result.nawal.desc}</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    <strong>Animal guía:</strong> {result.nawal.animal} · <strong>Consejo:</strong>{' '}
                    {result.nawal.advice}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <button
                      type="button"
                      className="cm-btn cm-btn-primary"
                      onClick={() => openNawalModal(result.nawal)}
                    >
                      📖 Ficha de {result.nawal.name}
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => handleShareNawal(result.nawal)}
                    >
                      🔗 Compartir Nawal
                    </button>
                  </div>
                </article>
              </aside>
            </div>
          </div>
        )}

        {/* ====================================================================
            2. ENCICLOPEDIA DE LOS 20 NAHUALES
            ==================================================================== */}
        {activeTab === 'nahuales' && (
          <div className="cm-pop-in">
            <header style={{ marginBottom: '20px' }}>
              <span className="cm-badge">Enciclopedia K'iche' ({discovered.length}/20 explorados)</span>
              <h1 className="cm-hero-title">Los 20 Nahuales del Calendario Cholq'ij</h1>
              <p>Filtra por elemento y abre la ficha completa de cada Nawal o compártela con un enlace directo.</p>
            </header>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {(['Todos', 'Agua', 'Aire', 'Fuego', 'Tierra'] as const).map((el) => (
                <button
                  key={el}
                  type="button"
                  className={`cm-btn ${elementFilter === el ? 'cm-btn-primary' : 'cm-btn-secondary'}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setElementFilter(el);
                  }}
                >
                  {el}
                </button>
              ))}
            </div>

            <div className="cm-grid-3">
              {filteredNawales.map((n) => (
                <article key={n.slug} className="cm-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="cm-badge warm">{n.element}</span>
                      <span style={{ fontSize: '1.5rem' }}>{n.emoji}</span>
                    </div>
                    <h2 style={{ margin: '10px 0 4px' }}>{n.name}</h2>
                    <p style={{ fontSize: '0.84rem', margin: '0 0 8px' }}>Guía: {n.animal}</p>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{n.essence}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', gap: '8px' }}>
                    <button
                      type="button"
                      className="cm-btn cm-btn-primary"
                      onClick={() => openNawalModal(n)}
                    >
                      Aprender más
                    </button>
                    {discovered.includes(n.slug) && <span className="cm-badge">✓ Explorado</span>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            3. MECÁNICA 13 × 20
            ==================================================================== */}
        {activeTab === 'mecanica' && (
          <div className="cm-pop-in">
            <header style={{ marginBottom: '20px' }}>
              <span className="cm-badge">Matemática y Astronomía Maya</span>
              <h1 className="cm-hero-title">¿Cómo funciona la mecánica de 13 × 20 = 260 días?</h1>
              <p style={{ maxWidth: '72ch' }}>
                Como 13 y 20 son números coprimos (su máximo común divisor es 1), sus engranajes giran exactamente 260 días antes de volver a coincidir en la misma pareja.
              </p>
            </header>

            <section className="cm-card" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginTop: 0 }}>Simulador Paso a Paso desde 1 B'atz'</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MayaNumeralSvg value={simEnergy} size={62} />
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                      {simEnergy} {simNawal.name} {simNawal.emoji}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--cm-text-secondary)' }}>
                      Día {simDay} de 260
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={260}
                  value={simDay}
                  onChange={(e) => setSimDay(Number(e.target.value))}
                  style={{ flex: 1, minWidth: '220px' }}
                  aria-label="Día del ciclo 13 por 20"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-primary"
                  onClick={() => {
                    soundEffects.playClick();
                    setSimDay((d) => (d >= 260 ? 1 : d + 1));
                  }}
                >
                  Avanzar 1 día
                </button>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary"
                  onClick={() => {
                    soundEffects.playClick();
                    setSimDay(14);
                  }}
                >
                  Ir al Día 14 (1 Ix)
                </button>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary"
                  onClick={() => {
                    soundEffects.playClick();
                    setSimDay(21);
                  }}
                >
                  Ir al Día 21 (8 B'atz')
                </button>
              </div>
            </section>

            <section className="cm-grid-3">
              <div className="cm-card">
                <span className="cm-badge">1. Rueda de 13</span>
                <h3>Las 13 Energías</h3>
                <p>Del 1 al 13 representan la intensidad del día, inspiradas en las 13 articulaciones principales y niveles celestes.</p>
              </div>
              <div className="cm-card">
                <span className="cm-badge">2. Rueda de 20</span>
                <h3>Los 20 Nahuales</h3>
                <p>Basados en la cuenta vigesimal (20 dedos de manos y pies), simbolizan fuerzas de la naturaleza y valores comunitarios.</p>
              </div>
              <div className="cm-card">
                <span className="cm-badge">3. Ciclo 260</span>
                <h3>Mínimo Común Múltiplo</h3>
                <p>Equivale a 9 meses de gestación humana y al ciclo agrícola tradicional del maíz en el altiplano guatemalteco.</p>
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            4. DESAFÍO NIVEL MEDIO
            ==================================================================== */}
        {activeTab === 'desafio' && (
          <div className="cm-pop-in">
            <header style={{ marginBottom: '20px' }}>
              <span className="cm-badge">Gamificación Educativa</span>
              <h1 className="cm-hero-title">Desafío del Cholq'ij para Nivel Medio</h1>
              <p>Pon a prueba lo aprendido sobre la mecánica 13×20, la numeración vigesimal maya y los nahuales K'iche'.</p>
            </header>

            <section className="cm-card soft" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginTop: 0 }}>
                {xpTitle} — {xp} XP
              </h2>
              <p style={{ margin: 0 }}>
                Has explorado <strong>{discovered.length} de 20</strong> nahuales K'iche'.
              </p>
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {CHOLQIJ_QUIZ.map((q, idx) => {
                const picked = quizAnswers[q.id];
                return (
                  <div key={q.id} className="cm-card">
                    <p style={{ fontWeight: 700, marginTop: 0 }}>
                      {idx + 1}. {q.question}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isPicked = picked === optIdx;
                        const btnClass =
                          picked === undefined
                            ? 'cm-btn-secondary'
                            : isPicked
                              ? optIdx === q.correct
                                ? 'cm-btn-primary'
                                : 'cm-btn-warm'
                              : optIdx === q.correct
                                ? 'cm-btn-primary'
                                : 'cm-btn-secondary';

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={picked !== undefined}
                            className={`cm-btn ${btnClass}`}
                            style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                            onClick={() => {
                              if (picked !== undefined) return;
                              const nextAnswers = { ...quizAnswers, [q.id]: optIdx };
                              setQuizAnswers(nextAnswers);
                              localStorage.setItem('sutz_cholqij_quiz', JSON.stringify(nextAnswers));
                              if (optIdx === q.correct) {
                                soundEffects.playSuccess();
                                addXp(25);
                                showToast('+25 XP · ¡Respuesta correcta!');
                              } else {
                                soundEffects.playClick();
                              }
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {picked !== undefined && (
                      <p style={{ marginBottom: 0, marginTop: '12px', fontSize: '0.9rem' }}>
                        <strong>{picked === q.correct ? '¡Excelente! (+25 XP) ' : 'Dato clave: '}</strong>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Ficha del Nawal */}
      {modalNawal &&
        createPortal(
          <div
            className="cm-modal-backdrop"
            onClick={closeNawalModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Ficha del Nawal ${modalNawal.name}`}
          >
            <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="cm-badge warm">Elemento: {modalNawal.element}</span>
                  <span className="cm-badge">Rumbo: {modalNawal.cardinal}</span>
                  <span className="cm-badge">Yucateco: {modalNawal.yucatec}</span>
                </div>
                <button
                  type="button"
                  className="cm-btn cm-btn-secondary"
                  style={{ minHeight: '38px', padding: '4px 12px' }}
                  onClick={closeNawalModal}
                  aria-label="Cerrar ficha"
                >
                  ✕
                </button>
              </div>

              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2.1rem', margin: '12px 0 6px' }}>
                {modalNawal.emoji} {modalNawal.name}
              </h2>
              <p style={{ fontSize: '1.05rem', marginTop: 0 }}>{modalNawal.essence}</p>

              <div className="cm-grid-2" style={{ marginTop: '16px' }}>
                <div className="cm-card soft">
                  <h3 style={{ marginTop: 0, fontSize: '1.02rem' }}>Significado en la Tradición K'iche'</h3>
                  <p>{modalNawal.desc}</p>
                  <p style={{ marginBottom: 0 }}>
                    <strong>Animal guía:</strong> {modalNawal.animal}
                  </p>
                </div>

                <div>
                  <h3 style={{ marginTop: 0, fontSize: '1.02rem' }}>Fortalezas Asociadas</h3>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                    {modalNawal.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <h3 style={{ fontSize: '1.02rem' }}>Consejo para Estudiantes</h3>
                  <p style={{ marginBottom: 0 }}>{modalNawal.advice}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                <button
                  type="button"
                  className="cm-btn cm-btn-primary"
                  onClick={() => handleShareNawal(modalNawal)}
                >
                  🔗 Compartir Ficha de {modalNawal.name}
                </button>
                <button type="button" className="cm-btn cm-btn-secondary" onClick={closeNawalModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {toastMsg && (
        <div className="cm-toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
