import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import type { TechNode } from '../../types';
import './TechTreeModal.css';

interface TechTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodesMap?: Record<string, TechNode>;
}

interface TechItem {
  id: string;
  tier: number;
  name: string;
  cost: number;
  income: number;
  deps: string[];
  icon: string;
  desc: string;
}

const DEFAULT_TECHS: TechItem[] = [
  { id: 'alfabetizacion', tier: 1, name: 'Alfabetización Digital', cost: 50, income: 2, deps: [], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1825802c4-1d7f-4425-bc45-477c2f37f797.png', desc: 'Domina dispositivos y herramientas digitales para aprender sin límites.' },
  { id: 'logica', tier: 1, name: 'Pensamiento Lógico', cost: 50, income: 2, deps: [], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/111b7c14e-cd28-45c0-b539-d707d4ddb9d7.png', desc: 'Entrena el razonamiento y la resolución de problemas paso a paso.' },
  { id: 'colaboracion', tier: 1, name: 'Trabajo Colaborativo', cost: 50, income: 2, deps: [], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/13d388f36-d166-4eb0-b000-e3f46b021d6d.png', desc: 'Construye conocimiento en equipo y comparte lo que sabes.' },
  { id: 'programacion', tier: 2, name: 'Programación Básica', cost: 80, income: 4, deps: ['logica'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1713ed7e0-9ff4-404e-bfa2-e6f7dd40c7bb.png', desc: 'Escribe tu primer código y convierte ideas en soluciones.' },
  { id: 'robotica', tier: 2, name: 'Robótica Educativa', cost: 80, income: 4, deps: ['logica', 'alfabetizacion'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1b7ae764d-fb46-40eb-ae7e-ba7bbecf605d.png', desc: 'Construye robots y aprende ciencia dándoles vida.' },
  { id: 'diseno', tier: 2, name: 'Diseño Digital', cost: 80, income: 4, deps: ['alfabetizacion'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/142aad3cb-d009-4020-bafa-0beb1312ff5c.png', desc: 'Crea piezas visuales que comuniquen tus ideas con impacto.' },
  { id: 'multimedia', tier: 2, name: 'Producción Multimedia', cost: 80, income: 4, deps: ['alfabetizacion', 'colaboracion'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/187f2a081-f448-40ed-b254-2fe66db5ffc4.png', desc: 'Produce videos, podcasts y contenidos que educan.' },
  { id: 'datos', tier: 2, name: 'Análisis de Datos', cost: 80, income: 4, deps: ['logica'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/19c87a36e-0bae-4cba-b9ad-8aa566e25265.png', desc: 'Interpreta información y toma decisiones con evidencia.' },
  { id: 'ciudadania', tier: 2, name: 'Ciudadanía Digital', cost: 80, income: 4, deps: ['colaboracion'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1f9838923-277f-412b-b10b-4609ea81233e.png', desc: 'Participa en línea con ética, respeto y seguridad.' },
  { id: 'ia', tier: 3, name: 'Inteligencia Artificial', cost: 120, income: 6, deps: ['programacion', 'datos'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/128cedd36-34b7-4c12-a558-4cead478bae0.png', desc: 'Entrena modelos inteligentes que personalizan el aprendizaje.' },
  { id: 'videojuegos', tier: 3, name: 'Videojuegos Educativos', cost: 120, income: 6, deps: ['programacion', 'diseno'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1726508df-cf96-40fb-9dc8-8f7a101d2e0d.png', desc: 'Diseña juegos que transforman estudiar en aventura.' },
  { id: 'ciberseguridad', tier: 3, name: 'Ciberseguridad', cost: 120, income: 6, deps: ['ciudadania', 'datos'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1c38384f2-b8cd-44de-a2c0-2dc14e2be549.png', desc: 'Protege la información y navega blindado en la red.' },
  { id: 'iot', tier: 3, name: 'Internet de las Cosas', cost: 120, income: 6, deps: ['robotica', 'programacion'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1d168c422-cfc8-4fc8-a39e-32f25a03628a.png', desc: 'Conecta objetos inteligentes al servicio del aula.' },
  { id: 'ra', tier: 3, name: 'Realidad Aumentada', cost: 120, income: 6, deps: ['diseno', 'multimedia'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1b242740b-662e-476d-b0e8-366d5e0e006d.png', desc: 'Superpón capas digitales y haz tus clases inmersivas.' },
  { id: 'bigdata', tier: 3, name: 'Big Data Educativo', cost: 120, income: 6, deps: ['datos', 'multimedia'], icon: 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1eaaae314-6008-408c-aaae-eb0552c8a81e.png', desc: 'Analiza grandes datos para mejorar la educación.' }
];

const TIER_COLOR: Record<number, string> = {
  1: '#00e5ff',
  2: '#ff2ec4',
  3: '#ffc24d',
  4: '#8b5cff',
  5: '#3dffb0'
};

export const TechTreeModal: React.FC<TechTreeModalProps> = ({
  isOpen,
  onClose,
  nodesMap
}) => {
  const [points, setPoints] = useState<number>(100);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [winShown, setWinShown] = useState<boolean>(false);
  const [showWinOverlay, setShowWinOverlay] = useState<boolean>(false);
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);

  // Floating text feedback and toast messages state
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'ok' | 'warn' | 'err' }[]>([]);
  const [floatTexts, setFloatTexts] = useState<{ id: number; x: number; y: number; txt: string; color: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ show: boolean; tech: TechItem | null; x: number; y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Map nodes from nodesMap prop or use DEFAULT_TECHS
  const techsList: TechItem[] = useMemo(() => {
    if (nodesMap && Object.keys(nodesMap).length > 0) {
      return Object.values(nodesMap).map(n => ({
        id: n.id,
        tier: n.col,
        name: n.title,
        cost: 50 + (n.col - 1) * 35,
        income: 2 + (n.col - 1) * 2,
        deps: n.parents || [],
        icon: n.image || 'https://image.qwenlm.ai/public_source/e91b88c4-947d-4a76-b7ca-d8baaae65dc3/1825802c4-1d7f-4425-bc45-477c2f37f797.png',
        desc: n.shortDescription
      }));
    }
    return DEFAULT_TECHS;
  }, [nodesMap]);

  const byId = useMemo(() => {
    return Object.fromEntries(techsList.map(t => [t.id, t]));
  }, [techsList]);

  // Group columns (tiers)
  const columnsList = useMemo(() => {
    const tiers = Array.from(new Set(techsList.map(t => t.tier))).sort((a, b) => a - b);
    return tiers.map(tier => ({
      tier,
      techs: techsList.filter(t => t.tier === tier)
    }));
  }, [techsList]);

  // Calculate passive income per second
  const currentIncome = useMemo(() => {
    return techsList.reduce((s, t) => s + (unlocked.has(t.id) ? t.income : 0), 0);
  }, [techsList, unlocked]);

  // Passive income ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPoints(prev => prev + currentIncome / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, currentIncome]);

  // Layout wire calculation for SVG SVG connectors
  const updateWiresLayout = () => {
    if (!boardRef.current || !svgRef.current) return;
    const boardEl = boardRef.current;
    const svgEl = svgRef.current;
    const b = boardEl.getBoundingClientRect();

    svgEl.setAttribute('width', `${b.width}`);
    svgEl.setAttribute('height', `${b.height}`);
    svgEl.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);

    techsList.forEach(t => {
      t.deps.forEach(d => {
        const fromCard = cardRefs.current[d];
        const toCard = cardRefs.current[t.id];
        const pathEl = document.getElementById(`path-${d}-${t.id}`);
        const c1El = document.getElementById(`c1-${d}-${t.id}`);
        const c2El = document.getElementById(`c2-${d}-${t.id}`);
        const gradEl = document.getElementById(`g-${d}-${t.id}`);

        if (fromCard && toCard && pathEl && c1El && c2El && gradEl) {
          const f = fromCard.getBoundingClientRect();
          const toRect = toCard.getBoundingClientRect();

          const x1 = f.right - b.left;
          const y1 = f.top + f.height / 2 - b.top;
          const x2 = toRect.left - b.left;
          const y2 = toRect.top + toRect.height / 2 - b.top;
          const dx = Math.max(46, (x2 - x1) * 0.5);

          pathEl.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
          c1El.setAttribute('cx', `${x1}`);
          c1El.setAttribute('cy', `${y1}`);
          c2El.setAttribute('cx', `${x2}`);
          c2El.setAttribute('cy', `${y2}`);

          gradEl.setAttribute('x1', `${x1}`);
          gradEl.setAttribute('y1', `${y1}`);
          gradEl.setAttribute('x2', `${x2}`);
          gradEl.setAttribute('y2', `${y2}`);
        }
      });
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateWiresLayout();
    const timer = setTimeout(updateWiresLayout, 300);
    window.addEventListener('resize', updateWiresLayout);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWiresLayout);
    };
  }, [isOpen, techsList, unlocked]);

  if (!isOpen) return null;

  const addToast = (msg: string, type: 'ok' | 'warn' | 'err') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const triggerFloatText = (x: number, y: number, txt: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatTexts(prev => [...prev, { id, x, y, txt, color }]);
    setTimeout(() => {
      setFloatTexts(prev => prev.filter(f => f.id !== id));
    }, 900);
  };

  const tryUnlock = (t: TechItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (unlocked.has(t.id)) {
      addToast(`⚡ Ya dominas <b>${t.name}</b>`, 'warn');
      return;
    }
    const missing = t.deps.filter(d => !unlocked.has(d));
    if (missing.length > 0) {
      addToast(`🔒 Primero desbloquea: ${missing.map(d => byId[d]?.name || d).join(' + ')}`, 'err');
      return;
    }
    if (points < t.cost) {
      addToast(`◈ Te faltan ${Math.ceil(t.cost - points)} puntos. ¡Sigue estudiando!`, 'err');
      return;
    }

    setPoints(prev => prev - t.cost);
    setUnlocked(prev => new Set(prev).add(t.id));

    const r = e.currentTarget.getBoundingClientRect();
    const color = TIER_COLOR[t.tier] || '#00e5ff';
    triggerFloatText(r.left + r.width / 2, r.top, `-${t.cost} ◈`, '#ff4d6d');
    triggerFloatText(r.left + r.width / 2, r.top + 22, '⚡ DESBLOQUEADA', color);
    addToast(`⚡ ¡<b>${t.name}</b> desbloqueada! +${t.income} ◈/s`, 'ok');

    if (unlocked.size + 1 === techsList.length && !winShown) {
      setWinShown(true);
      setTimeout(() => setShowWinOverlay(true), 600);
    }
  };

  const handleStudy = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPoints(prev => prev + 5);
    const r = e.currentTarget.getBoundingClientRect();
    triggerFloatText(r.left + r.width / 2, r.top - 4, '+5 ◈', '#00e5ff');
  };

  const handleReset = () => {
    setPoints(100);
    setUnlocked(new Set());
    setWinShown(false);
    setShowWinOverlay(false);
    addToast('↺ Árbol reiniciado. ¡Nueva partida!', 'warn');
  };

  const getCardStatus = (t: TechItem) => {
    if (unlocked.has(t.id)) return 'unlocked';
    if (t.deps.every(d => unlocked.has(d))) return 'ready';
    return 'locked';
  };

  return (
    <div className="nexo-tech-tree-modal nexo-overlay" onClick={onClose}>
      <div className="nexo-container" onClick={(e) => e.stopPropagation()}>

        {/* HEADER / HUD */}
        <header className="nexo-header">
          <div className="brand">
            <div className="logo">◢◤ SUTZ<span>EDU</span></div>
            <h1>ÁRBOL DE TECNOLOGÍA</h1>
            <p className="tag">Ruta de habilidades para la educación del futuro</p>
          </div>

          <div className="nexo-hud">
            <div className="nexo-stat">
              <label>Puntos de conocimiento</label>
              <div className="val">{Math.floor(points)}<span className="unit">◈</span></div>
            </div>
            <div className="nexo-stat inc">
              <label>Ingresos</label>
              <div className="val">+{currentIncome} ◈/s</div>
            </div>
            <div className="nexo-stat">
              <label>Progreso <b style={{ color: 'var(--text)' }}>{unlocked.size}/{techsList.length}</b></label>
              <div className="nexo-bar">
                <i style={{ width: `${(unlocked.size / techsList.length) * 100}%` }}></i>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="nexo-btn neon" onClick={handleStudy}>⚡ ESTUDIAR +5</button>
              <button className="nexo-btn ghost" onClick={handleReset}>↺ REINICIAR</button>
              <button className="nexo-close-btn" onClick={onClose} title="Cerrar modal">✕</button>
            </div>
          </div>
        </header>

        {/* LEYENDA */}
        <div className="nexo-legend">
          <span><i className="dot off"></i>Bloqueada</span>
          <span><i className="dot ready"></i>Disponible</span>
          <span><i className="dot on"></i>Desbloqueada</span>
          <span className="hint">Pasa el cursor sobre una tecnología para ver sus dependencias · Haz clic para desbloquearla</span>
        </div>

        {/* TABLERO & CONECTORES SVG */}
        <div 
          className="nexo-board-wrap" 
          ref={boardWrapRef}
          onScroll={() => { setTooltip(null); updateWiresLayout(); }}
        >
          <div className="nexo-board" ref={boardRef}>
            
            <svg id="nexo-wires" ref={svgRef}>
              <defs>
                {techsList.flatMap(t => t.deps.map(d => {
                  const colorFrom = TIER_COLOR[byId[d]?.tier || 1] || '#00e5ff';
                  const colorTo = TIER_COLOR[t.tier] || '#ff2ec4';
                  return (
                    <linearGradient key={`grad-${d}-${t.id}`} id={`g-${d}-${t.id}`} gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor={colorFrom} />
                      <stop offset="1" stopColor={colorTo} />
                    </linearGradient>
                  );
                }))}
              </defs>

              {techsList.flatMap(t => t.deps.map(d => {
                const color = TIER_COLOR[t.tier] || '#00e5ff';
                const isWireOn = unlocked.has(t.id);
                const isWireReady = unlocked.has(d) && !isWireOn;
                const isWireHl = hoveredTechId === t.id || hoveredTechId === d;
                const wireStateClass = isWireOn ? 'on' : isWireReady ? 'ready' : 'off';

                return (
                  <g 
                    key={`wire-${d}-${t.id}`} 
                    className={`wire-g ${wireStateClass} ${isWireHl ? 'hl' : ''}`}
                    style={{ '--c': color } as React.CSSProperties}
                  >
                    <path id={`path-${d}-${t.id}`} stroke={`url(#g-${d}-${t.id})`} />
                    <circle id={`c1-${d}-${t.id}`} r="3.4" />
                    <circle id={`c2-${d}-${t.id}`} r="3.4" />
                  </g>
                );
              }))}
            </svg>

            {/* COLUMNAS */}
            {columnsList.map(({ tier, techs }) => {
              const colClass = `c${Math.min(tier, 5)}`;

              return (
                <div key={tier} className={`nexo-col ${colClass}`}>
                  <div className="nexo-col-head">
                    <span className="nexo-col-tag">NIVEL {tier}</span>
                    <h2>Columna {tier}</h2>
                    <span className="nexo-col-count">{techs.length} tecnologías</span>
                  </div>

                  <div className="nexo-col-cards">
                    {techs.map(t => {
                      const status = getCardStatus(t);
                      const isPoor = status === 'ready' && points < t.cost;
                      const isDepHl = hoveredTechId ? byId[hoveredTechId]?.deps.includes(t.id) : false;

                      return (
                        <div
                          key={t.id}
                          ref={el => { cardRefs.current[t.id] = el; }}
                          className={`nexo-card ${status} ${isPoor ? 'poor' : ''} ${isDepHl ? 'dep-hl' : ''}`}
                          onClick={(e) => tryUnlock(t, e)}
                          onMouseEnter={(e) => {
                            setHoveredTechId(t.id);
                            const r = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              show: true,
                              tech: t,
                              x: Math.max(140, Math.min(window.innerWidth - 140, r.left + r.width / 2)),
                              y: Math.max(70, r.top - 100)
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredTechId(null);
                            setTooltip(null);
                          }}
                        >
                          <div className="imgbox">
                            {t.icon.startsWith('http') || t.icon.startsWith('/') ? (
                              <img src={t.icon} alt={t.name} loading="lazy" />
                            ) : (
                              <span style={{ fontSize: '1.8rem' }}>{t.icon}</span>
                            )}
                            <div className="badge lock">🔒</div>
                            <div className="badge check">✓</div>
                          </div>

                          <div className="info">
                            <div className="name-row">
                              <h3>{t.name}</h3>
                              <span className="lvl">N{t.tier}</span>
                            </div>
                            <p>{t.desc}</p>
                            <div className="meta">
                              <span className="chip cost">◆ {t.cost}</span>
                              <span className="chip gain">+{t.income} ◈/s</span>
                              <span className="status">
                                {status === 'unlocked' ? 'ACTIVA' : status === 'ready' ? 'DISPONIBLE' : 'BLOQUEADA'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOOLTIP FLOATING */}
        {tooltip && tooltip.tech && (
          <div 
            className={`nexo-tooltip ${tooltip.show ? 'show' : ''}`}
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <h4>{tooltip.tech.name}</h4>
            <div className="tip-req">
              {tooltip.tech.deps.length > 0 ? (
                <>
                  <span style={{ color: 'var(--dim)', border: 'none', padding: 0 }}>Requiere:</span>
                  {tooltip.tech.deps.map(d => {
                    const isOk = unlocked.has(d);
                    return (
                      <span key={d} className={isOk ? 'ok' : 'no'}>
                        {byId[d]?.name || d} {isOk ? '✓' : '🔒'}
                      </span>
                    );
                  })}
                </>
              ) : (
                <span className="ok">Sin requisitos previos</span>
              )}
            </div>
            <div className="tip-meta">
              {unlocked.has(tooltip.tech.id) ? (
                <>⚡ Activa · genera +{tooltip.tech.income} ◈/s</>
              ) : (
                <>Costo: <b>{tooltip.tech.cost} ◈</b> · genera +{tooltip.tech.income} ◈/s</>
              )}
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATIONS */}
        <div id="nexo-toasts">
          {toasts.map(t => (
            <div key={t.id} className={`nexo-toast in ${t.type}`} dangerouslySetInnerHTML={{ __html: t.msg }} />
          ))}
        </div>

        {/* FLOATING NUMBERS */}
        {floatTexts.map(f => (
          <span 
            key={f.id} 
            className="nexo-float-txt" 
            style={{ left: `${f.x}px`, top: `${f.y}px`, color: f.color }}
          >
            {f.txt}
          </span>
        ))}

        {/* WIN OVERLAY */}
        <div id="nexo-winOverlay" className={showWinOverlay ? 'show' : ''}>
          <div className="win-card">
            <div className="sparks">
              {Array.from({ length: 30 }).map((_, i) => {
                const a = Math.random() * Math.PI * 2;
                const d = 90 + Math.random() * 170;
                const cols = ['#00e5ff', '#ff2ec4', '#ffc24d', '#8b5cff', '#3dffb0'];
                const col = cols[i % cols.length];
                return (
                  <i 
                    key={i} 
                    style={{
                      '--tx': `${Math.cos(a) * d}px`,
                      '--ty': `${Math.sin(a) * d}px`,
                      '--dl': `${Math.random() * 0.5}s`,
                      background: col,
                      boxShadow: `0 0 8px ${col}`
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
            <h2>¡RUTA COMPLETADA!</h2>
            <p>Desbloqueaste las tecnologías del aprendizaje del futuro.<br />La educación ya no será la misma. 🚀</p>
            <button className="nexo-btn neon" onClick={() => setShowWinOverlay(false)}>
              SEGUIR EXPLORANDO
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
