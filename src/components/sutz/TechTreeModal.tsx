import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TechNode } from '../../types';
import { TECH_TREE_COLUMNS_META, INITIAL_TECH_TREE_DATA } from '../../data/techTreeData';
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
  category?: 'STEM' | 'HUMANIDADES' | 'APRENDIZAJE';
}

export const LINE_COLOR: Record<string, string> = {
  STEM: '#00e5ff',        // Línea 1: Cyan Neón (como está)
  HUMANIDADES: '#d946ef', // Línea 2: Lila / Morado Neón
  APRENDIZAJE: '#ff7700'  // Línea 3: Anaranjado Neón
};

export const getTechColor = (t: TechItem): string => {
  if (t.category && LINE_COLOR[t.category]) {
    return LINE_COLOR[t.category];
  }
  if (t.id.includes('-n1') || t.id.includes('-n2') || t.id.includes('-n3') || t.id.includes('-n4')) return '#00e5ff';
  if (t.id.includes('-n5') || t.id.includes('-n6') || t.id.includes('-n7') || t.id.includes('-n8')) return '#d946ef';
  return '#ff7700';
};

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
  const navigate = useNavigate();
  const [points, setPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sutz_tech_tree_points_v1');
      return saved !== null ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sutz_tech_tree_unlocked_v1');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [winShown, setWinShown] = useState<boolean>(false);
  const [showWinOverlay, setShowWinOverlay] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileViewMode, setMobileViewMode] = useState<'board' | 'list'>('board');
  const [currentActiveCol, setCurrentActiveCol] = useState<number>(1);
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);
  const [inspectNode, setInspectNode] = useState<TechItem | null>(null);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sutz_tech_tree_points_v1', points.toString());
    } catch (e) {
      console.warn('Could not save points to localStorage:', e);
    }
  }, [points]);

  useEffect(() => {
    try {
      localStorage.setItem('sutz_tech_tree_unlocked_v1', JSON.stringify(Array.from(unlocked)));
    } catch (e) {
      console.warn('Could not save unlocked nodes to localStorage:', e);
    }
  }, [unlocked]);

  // Jump smoothly to a specific column on mobile/desktop
  const handleJumpToCol = (colNum: number) => {
    setCurrentActiveCol(colNum);
    const colEl = document.getElementById(`nexo-col-${colNum}`);
    if (colEl && boardWrapRef.current) {
      colEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setTimeout(updateWiresLayout, 350);
    }
  };

  // Floating text feedback and toast messages state
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'ok' | 'warn' | 'err' }[]>([]);
  const [floatTexts, setFloatTexts] = useState<{ id: number; x: number; y: number; txt: string; color: string }[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rafRef = useRef<number | null>(null);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectNode) {
          setInspectNode(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        setCurrentActiveCol(prev => {
          const next = Math.min(30, prev + 1);
          handleJumpToCol(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setCurrentActiveCol(prev => {
          const next = Math.max(1, prev - 1);
          handleJumpToCol(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectNode, onClose]);

  // Map nodes from nodesMap prop or use INITIAL_TECH_TREE_DATA (267 nodes across 30 cols)
  const techsList: TechItem[] = useMemo(() => {
    const activeNodes = (nodesMap && Object.keys(nodesMap).length > 0) ? nodesMap : INITIAL_TECH_TREE_DATA;
    return Object.values(activeNodes).map(n => ({
      id: n.id,
      tier: n.col,
      name: n.title,
      cost: 50 + (n.col - 1) * 20,
      income: 2 + (n.col - 1) * 2,
      deps: n.parents || [],
      icon: n.image || n.icon || '⚙️',
      desc: n.shortDescription,
      category: n.category
    }));
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

  // Active dependency highlight tree when hovering a node
  const hoveredDependencySet = useMemo(() => {
    if (!hoveredTechId) {
      return { ancestors: new Set<string>(), descendants: new Set<string>(), activeWires: new Set<string>() };
    }

    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const activeWires = new Set<string>();

    // Collect ancestors (prerequisites)
    const queueAncestors = [hoveredTechId];
    while (queueAncestors.length > 0) {
      const curr = queueAncestors.shift()!;
      const item = byId[curr];
      if (item && item.deps) {
        for (const parentId of item.deps) {
          activeWires.add(`${parentId}->${curr}`);
          if (!ancestors.has(parentId)) {
            ancestors.add(parentId);
            queueAncestors.push(parentId);
          }
        }
      }
    }

    // Collect descendants (dependent nodes)
    const queueDescendants = [hoveredTechId];
    while (queueDescendants.length > 0) {
      const curr = queueDescendants.shift()!;
      for (const item of techsList) {
        if (item.deps && item.deps.includes(curr)) {
          activeWires.add(`${curr}->${item.id}`);
          if (!descendants.has(item.id)) {
            descendants.add(item.id);
            queueDescendants.push(item.id);
          }
        }
      }
    }

    return { ancestors, descendants, activeWires };
  }, [hoveredTechId, byId, techsList]);

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

  // Layout wire calculation for SVG connectors (requestAnimationFrame optimized at 60fps)
  const updateWiresLayout = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
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
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateWiresLayout();
    const timer = setTimeout(updateWiresLayout, 300);
    window.addEventListener('resize', updateWiresLayout);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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

  const getProjectUrlForNode = (t: TechItem): string => {
    const name = t.name.toLowerCase();
    if (name.includes('color') || name.includes('diseño') || name.includes('arte') || name.includes('estética')) {
      return '/juegos/teoria-color';
    }
    if (name.includes('cuento') || name.includes('lenguaje') || name.includes('literaria') || name.includes('poesía') || name.includes('narrativa')) {
      return '/maquina-de-cuentos';
    }
    if (name.includes('astronomía') || name.includes('cosmos') || name.includes('física') || name.includes('gravedad') || name.includes('espacial')) {
      return '/juegos/sistema-solar';
    }
    if (name.includes('número') || name.includes('cálculo') || name.includes('álgebra') || name.includes('lógica') || name.includes('matemática')) {
      return '/juegos/secuencias-numericas';
    }
    if (name.includes('código') || name.includes('programación') || name.includes('computación') || name.includes('algoritmo')) {
      return '/codigo-estudiante';
    }
    return '/laboratorios';
  };

  const handleLaunchProject = (t: TechItem) => {
    const url = getProjectUrlForNode(t);
    onClose();
    navigate(url);
  };

  const tryUnlock = (t: TechItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

    if (e) {
      const r = e.currentTarget.getBoundingClientRect();
      const color = TIER_COLOR[t.tier] || '#00e5ff';
      triggerFloatText(r.left + r.width / 2, r.top, `-${t.cost} ◈`, '#ff4d6d');
      triggerFloatText(r.left + r.width / 2, r.top + 22, '⚡ DESBLOQUEADA', color);
    }
    addToast(`⚡ ¡<b>${t.name}</b> desbloqueada! +${t.income} ◈/s`, 'ok');

    if (unlocked.size + 1 === techsList.length && !winShown) {
      setWinShown(true);
      setTimeout(() => setShowWinOverlay(true), 600);
    }
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
              <button className="nexo-close-btn" onClick={onClose} title="Cerrar modal">✕</button>
            </div>
          </div>
        </header>

        {/* TOOLBAR NAVEGACIÓN MÓVIL Y BÚSQUEDA RÁPIDA */}
        <div className="nexo-mobile-toolbar">
          <div className="nexo-search-box">
            <input 
              type="text" 
              placeholder="🔍 Buscar tecnología (ej. Fuego, IA, ADN)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nexo-search-input"
            />
            {searchQuery && (
              <button className="nexo-search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="nexo-view-switcher">
            <button 
              className={`nexo-view-btn ${mobileViewMode === 'board' ? 'active' : ''}`}
              onClick={() => {
                setMobileViewMode('board');
                setTimeout(updateWiresLayout, 200);
              }}
              title="Vista de Matriz de Conectores"
            >
              🗺️ Matriz
            </button>
            <button 
              className={`nexo-view-btn ${mobileViewMode === 'list' ? 'active' : ''}`}
              onClick={() => setMobileViewMode('list')}
              title="Vista de Lista Vertical Móvil"
            >
              📱 Lista Móvil
            </button>
          </div>

          <div className="nexo-col-jump-group">
            <span className="jump-label">Ir a Época:</span>
            <select 
              className="nexo-jump-select"
              value={currentActiveCol}
              onChange={(e) => handleJumpToCol(Number(e.target.value))}
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(c => {
                const meta = TECH_TREE_COLUMNS_META[c];
                return (
                  <option key={c} value={c}>
                    {c}: {meta ? meta.title : `Época ${c}`}
                  </option>
                );
              })}
            </select>

            <div className="nexo-jump-pills">
              {[1, 2, 5, 8, 11, 16, 23, 30].map(c => (
                <button key={c} className={`nexo-jump-pill ${currentActiveCol === c ? 'active' : ''}`} onClick={() => handleJumpToCol(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MODO 1: TABLERO & CONECTORES SVG (MATRIZ) */}
        {mobileViewMode === 'board' && (
          <div 
            className="nexo-board-wrap" 
            ref={boardWrapRef}
            onScroll={updateWiresLayout}
          >
            <div className="nexo-board" ref={boardRef}>
              
              <svg id="nexo-wires" ref={svgRef}>
                <defs>
                  {techsList.flatMap(t => t.deps.map(d => {
                    const parent = byId[d];
                    const colorFrom = parent ? getTechColor(parent) : '#00e5ff';
                    const colorTo = getTechColor(t);
                    return (
                      <linearGradient key={`grad-${d}-${t.id}`} id={`g-${d}-${t.id}`} gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor={colorFrom} />
                        <stop offset="1" stopColor={colorTo} />
                      </linearGradient>
                    );
                  }))}
                </defs>

                {techsList.flatMap(t => t.deps.map(d => {
                  const color = getTechColor(t);
                  const isWireOn = unlocked.has(t.id);
                  const isWireReady = unlocked.has(d) && !isWireOn;
                  const wireKey = `${d}->${t.id}`;
                  const isWireHl = hoveredTechId ? hoveredDependencySet.activeWires.has(wireKey) : false;
                  const isWireDim = hoveredTechId ? !isWireHl : false;
                  const wireStateClass = isWireOn ? 'on' : isWireReady ? 'ready' : 'off';

                  return (
                    <g 
                      key={`wire-${d}-${t.id}`} 
                      className={`wire-g ${wireStateClass} ${isWireHl ? 'hl' : ''} ${isWireDim ? 'dim' : ''}`}
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
                const colMeta = TECH_TREE_COLUMNS_META[tier] || { title: `Columna ${tier}`, tier: `Nivel ${tier}`, badgeColor: '#00e5ff' };

                return (
                  <div key={tier} id={`nexo-col-${tier}`} className={`nexo-col ${colClass}`}>
                    <div className="nexo-col-head">
                      <span className="nexo-col-tag" style={{ color: colMeta.badgeColor, borderColor: colMeta.badgeColor }}>{tier}</span>
                      <h2 title={colMeta.title}>{colMeta.title}</h2>
                    </div>

                    <div className="nexo-col-cards">
                      {techs.map(t => {
                        const status = getCardStatus(t);
                        const isPoor = status === 'ready' && points < t.cost;
                        const isHoveredMain = hoveredTechId === t.id;
                        const isAncestor = hoveredDependencySet.ancestors.has(t.id);
                        const isDescendant = hoveredDependencySet.descendants.has(t.id);
                        const isDimUnrelated = hoveredTechId ? (!isHoveredMain && !isAncestor && !isDescendant) : false;
                        const matchesSearch = !searchQuery || 
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());

                        if (searchQuery && !matchesSearch) return null;
                        const techColor = getTechColor(t);

                        return (
                          <div
                            key={t.id}
                            ref={el => { cardRefs.current[t.id] = el; }}
                            className={`nexo-card ${status} ${isPoor ? 'poor' : ''} ${isHoveredMain ? 'hovered-main' : ''} ${isAncestor ? 'dep-ancestor' : ''} ${isDescendant ? 'dep-descendant' : ''} ${isDimUnrelated ? 'dim-unrelated' : ''}`}
                            style={{
                              '--tech-color': techColor,
                              '--tech-glow': techColor + 'cc'
                            } as React.CSSProperties}
                            onClick={() => setInspectNode(t)}
                            onMouseEnter={() => setHoveredTechId(t.id)}
                            onMouseLeave={() => setHoveredTechId(null)}
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
        )}

        {/* MODO 2: VISTA LISTA VERTICAL MÓVIL (ACORDEÓN DE ÉPOCAS) */}
        {mobileViewMode === 'list' && (
          <div className="nexo-mobile-list-container">
            {columnsList.map(({ tier, techs }) => {
              const colMeta = TECH_TREE_COLUMNS_META[tier] || { title: `Columna ${tier}`, tier: `Nivel ${tier}`, badgeColor: '#00e5ff' };
              const filteredTechs = techs.filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()));

              if (searchQuery && filteredTechs.length === 0) return null;

              return (
                <div key={tier} className="mobile-period-section">
                  <div className="mobile-period-header">
                    <span className="mobile-period-badge" style={{ background: colMeta.badgeColor }}>{tier}</span>
                    <h3>{colMeta.title}</h3>
                  </div>

                  <div className="mobile-period-cards-grid">
                    {filteredTechs.map(t => {
                      const status = getCardStatus(t);
                      const techColor = getTechColor(t);

                      return (
                        <div 
                          key={t.id} 
                          className={`mobile-tech-card ${status}`}
                          style={{
                            '--tech-color': techColor,
                            '--tech-glow': techColor + 'cc'
                          } as React.CSSProperties}
                          onClick={() => setInspectNode(t)}
                        >
                          <div className="mobile-tech-icon">
                            {t.icon.startsWith('http') || t.icon.startsWith('/') ? (
                              <img src={t.icon} alt={t.name} />
                            ) : (
                              <span>{t.icon}</span>
                            )}
                          </div>
                          <div className="mobile-tech-info">
                            <div className="mobile-tech-top">
                              <h4>{t.name}</h4>
                              <span className={`mobile-status-badge ${status}`}>
                                {status === 'unlocked' ? '🔓 ACTIVA' : status === 'ready' ? '⚡ DISPONIBLE' : '🔒 BLOQUEADA'}
                              </span>
                            </div>
                            <p>{t.desc}</p>
                            <div className="mobile-tech-actions">
                              <span className="mobile-cost-chip">◆ {t.cost}</span>
                              <button className="mobile-inspect-btn" onClick={(e) => { e.stopPropagation(); setInspectNode(t); }}>
                                👁️ Inspeccionar & Proyecto 🚀
                              </button>
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
        )}

        {/* STICKY BOTTOM CONTROLLER MÓVIL */}
        <div className="nexo-sticky-bottom-bar">
          <button 
            className="sticky-nav-btn"
            onClick={() => handleJumpToCol(Math.max(1, currentActiveCol - 1))}
            disabled={currentActiveCol <= 1}
          >
            ◀ Previa
          </button>

          <span className="sticky-col-indicator">
            ÉPOCA {currentActiveCol} / 30
          </span>

          <button 
            className="sticky-nav-btn"
            onClick={() => handleJumpToCol(Math.min(30, currentActiveCol + 1))}
            disabled={currentActiveCol >= 30}
          >
            Siguiente ▶
          </button>
        </div>

        {/* LARGE NODE INSPECTOR MODAL */}
        {inspectNode && (
          <div className="nexo-inspector-overlay" onClick={() => setInspectNode(null)}>
            <div 
              className="nexo-inspector-card" 
              style={{
                '--tech-color': getTechColor(inspectNode),
                '--tech-glow': getTechColor(inspectNode) + 'aa'
              } as React.CSSProperties}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="nexo-inspector-close" onClick={() => setInspectNode(null)} title="Cerrar visor">✕</button>

              <div className="inspector-header-box">
                <div className="inspector-icon-frame">
                  {inspectNode.icon.startsWith('http') || inspectNode.icon.startsWith('/') ? (
                    <img src={inspectNode.icon} alt={inspectNode.name} />
                  ) : (
                    <span>{inspectNode.icon}</span>
                  )}
                </div>

                <div className="inspector-titles">
                  <div className="inspector-badges">
                    <span className="inspector-badge-pill">COLUMNA {inspectNode.tier}</span>
                    <span 
                      className="inspector-area-badge" 
                      style={{ 
                        borderColor: getTechColor(inspectNode), 
                        color: getTechColor(inspectNode),
                        background: getTechColor(inspectNode) + '22'
                      }}
                    >
                      ÁREA {inspectNode.category || (getTechColor(inspectNode) === '#00e5ff' ? 'STEM' : getTechColor(inspectNode) === '#d946ef' ? 'HUMANIDADES' : 'APRENDIZAJE')}
                    </span>
                    <span className={`inspector-badge-status ${getCardStatus(inspectNode)}`}>
                      {getCardStatus(inspectNode) === 'unlocked' ? '🔓 DESBLOQUEADA (ACTIVA)' : getCardStatus(inspectNode) === 'ready' ? '⚡ DISPONIBLE' : '🔒 BLOQUEADA'}
                    </span>
                  </div>
                  <h3>{inspectNode.name}</h3>
                </div>
              </div>

              <div className="inspector-body-content">
                <div className="inspector-section-block">
                  <h4>📝 Concepto & Descripción Pedagógica</h4>
                  <p>{inspectNode.desc}</p>
                </div>

                <div className="inspector-section-block">
                  <h4>🔗 Antecedentes y Tecnologías Previas</h4>
                  {inspectNode.deps && inspectNode.deps.length > 0 ? (
                    <div className="inspector-parents-grid">
                      {inspectNode.deps.map(depId => {
                        const parent = byId[depId];
                        return (
                          <div 
                            key={depId} 
                            className="inspector-parent-chip"
                            onClick={() => parent && setInspectNode(parent)}
                            title="Haz clic para inspeccionar este antecedente"
                          >
                            <span>{parent ? parent.icon : '⚙️'}</span>
                            <strong>{parent ? parent.name : depId}</strong>
                            <span>{unlocked.has(depId) ? '✓' : '🔒'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', color: 'var(--green)' }}>🌱 Nodo Raíz Inicial (Sin requisitos previos)</p>
                  )}
                </div>

                {/* FEATURED CLASSROOM PROJECT CTA */}
                <div className="inspector-project-cta">
                  <h4>🚀 PROYECTO DE TRABAJO AÚLICO PARA ESTUDIANTES</h4>
                  <p>
                    Abre el laboratorio y herramienta de aprendizaje asociada a <strong>{inspectNode.name}</strong> para trabajar dinámicas de aula, talleres creativos y actividades con los alumnos.
                  </p>

                  <button 
                    className="inspector-btn-launch"
                    onClick={() => handleLaunchProject(inspectNode)}
                  >
                    <span>🚀 INICIAR PROYECTO AÚLICO EN LA PLATAFORMA</span>
                  </button>
                </div>
              </div>

              <div className="inspector-actions-row">
                {!unlocked.has(inspectNode.id) && getCardStatus(inspectNode) === 'ready' && (
                  <button 
                    className="nexo-btn neon"
                    onClick={() => {
                      tryUnlock(inspectNode);
                    }}
                  >
                    ⚡ DESBLOQUEAR NODO (-{inspectNode.cost} ◈)
                  </button>
                )}
                <button className="nexo-btn ghost" onClick={() => setInspectNode(null)}>
                  Cerrar Visor
                </button>
              </div>
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
