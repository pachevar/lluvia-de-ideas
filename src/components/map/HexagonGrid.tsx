import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { HexagonCell } from './HexagonCell';
import type { CustomHexagon } from '../../types';
import './Hexagon.css';

interface HexagonGridProps {
  cells: CustomHexagon[];
  hexWidth?: number;
  hexHeight?: number;
  onHexClick?: (hex: CustomHexagon) => void;
  onHexDoubleClick?: (hex: CustomHexagon) => void;
  onHexLongPress?: (hex: CustomHexagon) => void;
  showLabels?: boolean;
  editingHexRow?: number | null;
  editingHexCol?: number | null;
  selectedHexId?: string | null;
  onTransformReady?: (controls: { zoomIn: () => void; zoomOut: () => void; centerView: () => void }) => void;
  showCartesianAxes?: boolean;
}

interface TransformBridgeProps {
  zoomIn: (step?: number, animationTime?: number, animationType?: any) => void;
  zoomOut: (step?: number, animationTime?: number, animationType?: any) => void;
  centerView: () => void;
  onReady: (controls: { zoomIn: () => void; zoomOut: () => void; centerView: () => void }) => void;
}

const TransformBridge: React.FC<TransformBridgeProps> = ({ zoomIn, zoomOut, centerView, onReady }) => {
  React.useEffect(() => {
    onReady({ 
      zoomIn: () => zoomIn(0.25, 240, 'easeOutQuad'), 
      zoomOut: () => zoomOut(0.25, 240, 'easeOutQuad'), 
      centerView 
    });
  }, [zoomIn, zoomOut, centerView, onReady]);
  return null;
};

export const HexagonGrid: React.FC<HexagonGridProps> = ({
  cells,
  hexWidth = 208,
  hexHeight = 180, // 180 * 1.1547 (flat-topped)
  onHexClick,
  onHexDoubleClick,
  onHexLongPress,
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null,
  selectedHexId = null,
  onTransformReady,
  showCartesianAxes = true
}) => {
  const [internalShowAxes, setInternalShowAxes] = useState<boolean>(showCartesianAxes);

  // Estados de Visibilidad de Capas en Hexágonos
  const [showTitles, setShowTitles] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sutz_hex_show_title');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showIcons, setShowIcons] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sutz_hex_show_icon');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showCategories, setShowCategories] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sutz_hex_show_category');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const visibilityMenuRef = React.useRef<HTMLDivElement>(null);

  const toggleTitles = () => {
    setShowTitles(prev => {
      const next = !prev;
      try { localStorage.setItem('sutz_hex_show_title', String(next)); } catch {}
      return next;
    });
  };

  const toggleIcons = () => {
    setShowIcons(prev => {
      const next = !prev;
      try { localStorage.setItem('sutz_hex_show_icon', String(next)); } catch {}
      return next;
    });
  };

  const toggleCategories = () => {
    setShowCategories(prev => {
      const next = !prev;
      try { localStorage.setItem('sutz_hex_show_category', String(next)); } catch {}
      return next;
    });
  };

  const allHidden = !showTitles && !showIcons && !showCategories;
  const toggleAll = () => {
    const nextState = allHidden; // si estaban todos ocultos, ahora true; de lo contrario false
    setShowTitles(nextState);
    setShowIcons(nextState);
    setShowCategories(nextState);
    try {
      localStorage.setItem('sutz_hex_show_title', String(nextState));
      localStorage.setItem('sutz_hex_show_icon', String(nextState));
      localStorage.setItem('sutz_hex_show_category', String(nextState));
    } catch {}
  };

  // Dynamic cell bounds calculation with generous padding
  const cols = cells.length > 0 ? cells.map(c => c.col) : [0];
  const rows = cells.length > 0 ? cells.map(c => c.row) : [0];

  const minCol = Math.min(...cols, -2);
  const maxCol = Math.max(...cols, 2);
  const minRow = Math.min(...rows, -2);
  const maxRow = Math.max(...rows, 2);

  const widthSpan = (maxCol - minCol + 8) * (0.75 * hexWidth);
  const heightSpan = (maxRow - minRow + 8) * hexHeight;

  const centerCol = (minCol + maxCol) / 2;
  const centerRow = (minRow + maxRow) / 2;

  const [viewportWidth, setViewportWidth] = useState<number>(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  React.useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Generous canvas bounds so hexes are never clipped when panning in any direction
  const mapWidth = Math.max(3400, widthSpan + 1400);
  const mapHeight = Math.max(2800, heightSpan + 1400);
  const xOffset = mapWidth / 2 - centerCol * (0.75 * hexWidth) - hexWidth / 2;
  const yOffset = mapHeight / 2 - centerRow * hexHeight - hexHeight / 2;

  // Cartesian Plane Geometry Calculations
  const originX = xOffset + hexWidth / 2;
  const originY = yOffset + hexHeight / 2;

  const colTicks = useMemo(() => {
    const startCol = Math.min(minCol - 3, -5);
    const endCol = Math.max(maxCol + 3, 5);
    const ticks = [];
    for (let c = startCol; c <= endCol; c++) {
      const cx = xOffset + c * (0.75 * hexWidth) + hexWidth / 2;
      ticks.push({ col: c, x: cx });
    }
    return ticks;
  }, [minCol, maxCol, xOffset, hexWidth]);

  const rowTicks = useMemo(() => {
    const startRow = Math.min(minRow - 3, -5);
    const endRow = Math.max(maxRow + 3, 5);
    const ticks = [];
    for (let r = startRow; r <= endRow; r++) {
      const cy = yOffset + r * hexHeight + hexHeight / 2;
      ticks.push({ row: r, y: cy });
    }
    return ticks;
  }, [minRow, maxRow, yOffset, hexHeight]);

  // Adaptive initial scale:
  // - Mobile (<768px): 0.65
  // - Tablet Portrait (768px - 899px): 0.74
  // - Tablet Landscape (900px - 1024px): 0.82
  // - Desktop (>1024px): 0.92
  const initialScale = useMemo(() => {
    if (viewportWidth < 768) return 0.65;
    if (viewportWidth < 900) return 0.74;
    if (viewportWidth <= 1024) return 0.82;
    return 0.92;
  }, [viewportWidth]);

  return (
    <div className="map-viewport">

      {/* Didactic Floating HUD */}
      {internalShowAxes && (
        <div className="cartesian-hud-badge">
          <div className="cartesian-hud-title">
            <span>📐</span> Plano Cartesiano Didáctico
          </div>
          <div className="cartesian-hud-legend">
            <span className="cartesian-hud-x">━━ Eje X (Columnas)</span>
            <span className="cartesian-hud-y">━━ Eje Y (Filas)</span>
            <span className="cartesian-hud-origin">● Origen (0, 0)</span>
          </div>
        </div>
      )}

      <TransformWrapper
        initialScale={initialScale}
        minScale={0.35}
        maxScale={2.2}
        centerOnInit={true}
        limitToBounds={false}
        smooth={true}
        wheel={{ step: 0.0008 }}
        zoomAnimation={{ animationType: 'easeOutQuad', animationTime: 240 }}
        doubleClick={{ disabled: true }}
        pinch={{ step: 5 }}
        panning={{ 
          velocityDisabled: true,
          lockAxisX: false,
          lockAxisY: false
        }}
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <div 
            style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}
          >
            {onTransformReady && (
              <TransformBridge zoomIn={zoomIn} zoomOut={zoomOut} centerView={centerView} onReady={onTransformReady} />
            )}
            
            <div className="map-controls" style={{ zIndex: 1000 }}>
              <button 
                type="button"
                className="map-zoom-btn"
                onClick={() => zoomIn(0.25, 240, 'easeOutQuad')} 
                title="Acercar Mapa (+)"
                aria-label="Acercar mapa"
              >
                +
              </button>
              <button 
                type="button"
                className="map-zoom-btn"
                onClick={() => zoomOut(0.25, 240, 'easeOutQuad')} 
                title="Alejar Mapa (−)"
                aria-label="Alejar mapa"
              >
                −
              </button>
              <button 
                type="button"
                onClick={() => centerView()} 
                title="Centrar Mapa (Origen)"
                aria-label="Centrar mapa"
              >
                ⌂
              </button>
              <button 
                type="button"
                className={internalShowAxes ? 'active' : ''}
                onClick={() => setInternalShowAxes(prev => !prev)} 
                title={internalShowAxes ? "Ocultar Plano Cartesiano (Ejes X, Y)" : "Mostrar Plano Cartesiano Didáctico (Ejes X, Y)"}
                aria-label="Alternar plano cartesiano"
              >
                📐
              </button>

              {/* Botón de Visibilidad de Capas (Texto, Icono, Categoría) */}
              <div className="map-visibility-control-wrap" ref={visibilityMenuRef}>
                <button 
                  type="button"
                  className={`map-visibility-trigger-btn ${isVisibilityMenuOpen ? 'active' : ''} ${allHidden ? 'panoramic-active' : ''}`}
                  onClick={() => setIsVisibilityMenuOpen(prev => !prev)} 
                  title={allHidden ? "Modo Panorámico Activo (Todos los elementos ocultos)" : "Capas de Visibilidad: Texto, Iconos y Categorías"}
                  aria-label="Alternar visibilidad de elementos en hexágonos"
                >
                  {allHidden ? '🏞️' : '👁️'}
                </button>
              </div>
            </div>

            {/* Modal / Panel Centrado y Responsivo de Visibilidad de Capas */}
            {isVisibilityMenuOpen && (
              <div className="map-visibility-backdrop" onClick={() => setIsVisibilityMenuOpen(false)}>
                <div 
                  className="map-visibility-modal animate-zoom-in" 
                  onClick={e => e.stopPropagation()}
                >
                  <div className="visibility-modal-header">
                    <div className="visibility-modal-title-row">
                      <div className="visibility-modal-icon-badge">
                        <span>{allHidden ? '🏞️' : '👁️'}</span>
                      </div>
                      <div className="visibility-modal-title-group">
                        <h3 className="visibility-modal-title">Capas de Hexágonos</h3>
                        <span className="visibility-modal-subtitle">Personaliza la claridad visual del mapa</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="visibility-modal-close" 
                      onClick={() => setIsVisibilityMenuOpen(false)}
                      aria-label="Cerrar panel de capas"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="visibility-modal-body">
                    {/* Botón Destacado: MODO PANORÁMICO LIMPIO */}
                    <button 
                      type="button" 
                      className={`visibility-panoramic-card-btn ${allHidden ? 'active' : ''}`}
                      onClick={toggleAll}
                    >
                      <div className="panoramic-btn-icon-box">
                        <span>{allHidden ? '✨' : '🏞️'}</span>
                      </div>
                      <div className="panoramic-btn-texts">
                        <span className="panoramic-btn-title">
                          {allHidden ? 'Restaurar Todos los Elementos' : 'Vista Panorámica Limpia'}
                        </span>
                        <span className="panoramic-btn-sub">
                          {allHidden ? 'Vuelve a mostrar textos, iconos y categorías' : 'Oculta todo para contemplar el arte y mapa sin distracciones'}
                        </span>
                      </div>
                    </button>

                    <div className="visibility-divider">
                      <span>O AJUSTA CAPAS INDIVIDUALMENTE</span>
                    </div>

                    <div className="visibility-modal-options-list">
                      {/* 1. TEXTO / TÍTULOS */}
                      <button 
                        type="button"
                        className={`visibility-layer-card ${showTitles ? 'is-active' : 'is-inactive'}`}
                        onClick={toggleTitles}
                      >
                        <div className="layer-card-icon-disc">
                          <span>🔤</span>
                        </div>
                        <div className="layer-card-details">
                          <span className="layer-card-name">Texto y Títulos</span>
                          <span className="layer-card-desc">Nombres de hexágonos y puntos clave</span>
                        </div>
                        <div className={`layer-toggle-switch ${showTitles ? 'checked' : ''}`}>
                          <div className="switch-knob" />
                        </div>
                      </button>

                      {/* 2. ICONOS INTERACTIVOS */}
                      <button 
                        type="button"
                        className={`visibility-layer-card ${showIcons ? 'is-active' : 'is-inactive'}`}
                        onClick={toggleIcons}
                      >
                        <div className="layer-card-icon-disc">
                          <span>🎨</span>
                        </div>
                        <div className="layer-card-details">
                          <span className="layer-card-name">Iconos Interactivos</span>
                          <span className="layer-card-desc">Pictogramas y medallas centrales</span>
                        </div>
                        <div className={`layer-toggle-switch ${showIcons ? 'checked' : ''}`}>
                          <div className="switch-knob" />
                        </div>
                      </button>

                      {/* 3. CATEGORÍAS (REINOS) */}
                      <button 
                        type="button"
                        className={`visibility-layer-card ${showCategories ? 'is-active' : 'is-inactive'}`}
                        onClick={toggleCategories}
                      >
                        <div className="layer-card-icon-disc">
                          <span>👑</span>
                        </div>
                        <div className="layer-card-details">
                          <span className="layer-card-name">Categorías (Reinos)</span>
                          <span className="layer-card-desc">Insignias temáticas de cada pilar</span>
                        </div>
                        <div className={`layer-toggle-switch ${showCategories ? 'checked' : ''}`}>
                          <div className="switch-knob" />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="visibility-modal-footer">
                    <button 
                      type="button" 
                      className="visibility-modal-done-btn"
                      onClick={() => setIsVisibilityMenuOpen(false)}
                    >
                      Listo / Explorar Mapa
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <TransformComponent 
              wrapperStyle={{ 
                width: '100%', 
                height: '100%', 
                touchAction: 'none',
                overflow: 'hidden'
              }}
              contentStyle={{ 
                width: mapWidth, 
                height: mapHeight, 
                position: 'relative',
                transform: 'translate3d(0,0,0)',
                WebkitTransform: 'translate3d(0,0,0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <div 
                className="hex-grid-container" 
                style={{ 
                  width: mapWidth, 
                  height: mapHeight, 
                  position: 'relative',
                  transform: 'translate3d(0,0,0)',
                  WebkitTransform: 'translate3d(0,0,0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {/* CAPA DE EJES CARTESIANOS DIDÁCTICOS (X, Y) */}
                {internalShowAxes && (
                  <svg 
                    className="cartesian-axes-svg" 
                    width={mapWidth} 
                    height={mapHeight} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      pointerEvents: 'none', 
                      zIndex: 0 
                    }}
                  >
                    <defs>
                      <linearGradient id="xAxisGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
                        <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#7dd3fc" stopOpacity="1" />
                        <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
                      </linearGradient>
                      <linearGradient id="yAxisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                        <stop offset="25%" stopColor="#34d399" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#a7f3d0" stopOpacity="1" />
                        <stop offset="75%" stopColor="#34d399" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
                      </linearGradient>
                      <filter id="axisGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Cuadrantes Didácticos (Marcas de agua matemáticas) */}
                    <text x={originX + 320} y={originY - 160} fill="rgba(56, 189, 248, 0.09)" fontSize="44" fontWeight="900">
                      CUADRANTE I (+X, -Y)
                    </text>
                    <text x={originX - 320} y={originY - 160} fill="rgba(56, 189, 248, 0.09)" fontSize="44" fontWeight="900" textAnchor="end">
                      CUADRANTE II (-X, -Y)
                    </text>
                    <text x={originX - 320} y={originY + 220} fill="rgba(52, 211, 153, 0.09)" fontSize="44" fontWeight="900" textAnchor="end">
                      CUADRANTE III (-X, +Y)
                    </text>
                    <text x={originX + 320} y={originY + 220} fill="rgba(52, 211, 153, 0.09)" fontSize="44" fontWeight="900">
                      CUADRANTE IV (+X, +Y)
                    </text>

                    {/* Guías de cuadrícula tenues */}
                    {colTicks.map(t => (
                      <line 
                        key={`grid-x-${t.col}`} 
                        x1={t.x} 
                        y1={40} 
                        x2={t.x} 
                        y2={mapHeight - 40} 
                        stroke="rgba(56, 189, 248, 0.08)" 
                        strokeWidth="1" 
                        strokeDasharray="4,6" 
                      />
                    ))}
                    {rowTicks.map(t => (
                      <line 
                        key={`grid-y-${t.row}`} 
                        x1={40} 
                        y1={t.y} 
                        x2={mapWidth - 40} 
                        y2={t.y} 
                        stroke="rgba(52, 211, 153, 0.08)" 
                        strokeWidth="1" 
                        strokeDasharray="4,6" 
                      />
                    ))}

                    {/* EJE X (Horizontal Principal) */}
                    <line 
                      x1={80} 
                      y1={originY} 
                      x2={mapWidth - 80} 
                      y2={originY} 
                      stroke="url(#xAxisGrad)" 
                      strokeWidth="3.5" 
                      filter="url(#axisGlow)" 
                    />
                    {/* Flecha Izquierda Eje -X */}
                    <polygon points={`70,${originY} 95,${originY - 10} 95,${originY + 10}`} fill="#38bdf8" />
                    <text x={110} y={originY - 14} fill="#7dd3fc" fontSize="13" fontWeight="900">-X (Oeste)</text>
                    {/* Flecha Derecha Eje +X */}
                    <polygon points={`${mapWidth - 70},${originY} ${mapWidth - 95},${originY - 10} ${mapWidth - 95},${originY + 10}`} fill="#38bdf8" />
                    <text x={mapWidth - 110} y={originY - 14} fill="#7dd3fc" fontSize="13" fontWeight="900" textAnchor="end">+X (Este / Abscisas)</text>

                    {/* EJE Y (Vertical Principal) */}
                    <line 
                      x1={originX} 
                      y1={80} 
                      x2={originX} 
                      y2={mapHeight - 80} 
                      stroke="url(#yAxisGrad)" 
                      strokeWidth="3.5" 
                      filter="url(#axisGlow)" 
                    />
                    {/* Flecha Arriba Eje -Y */}
                    <polygon points={`${originX},70 ${originX - 10},95 ${originX + 10},95`} fill="#34d399" />
                    <text x={originX + 18} y={105} fill="#6ee7b7" fontSize="13" fontWeight="900">-Y (Norte)</text>
                    {/* Flecha Abajo Eje +Y */}
                    <polygon points={`${originX},${mapHeight - 70} ${originX - 10},${mapHeight - 95} ${originX + 10},${mapHeight - 95}`} fill="#34d399" />
                    <text x={originX + 18} y={mapHeight - 100} fill="#6ee7b7" fontSize="13" fontWeight="900">+Y (Sur / Ordenadas)</text>

                    {/* Muescas y Etiquetas de Columna Eje X */}
                    {colTicks.map(t => (
                      <g key={`tick-x-${t.col}`}>
                        <circle cx={t.x} cy={originY} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                        <rect 
                          x={t.x - 24} 
                          y={originY + 14} 
                          width="48" 
                          height="22" 
                          rx="7" 
                          fill="rgba(10, 15, 30, 0.9)" 
                          stroke="rgba(56, 189, 248, 0.5)" 
                          strokeWidth="1.2" 
                        />
                        <text 
                          x={t.x} 
                          y={originY + 29} 
                          fill="#7dd3fc" 
                          fontSize="11" 
                          fontWeight="900" 
                          textAnchor="middle"
                        >
                          {t.col === 0 ? 'X:0' : (t.col > 0 ? `+${t.col}` : `${t.col}`)}
                        </text>
                      </g>
                    ))}

                    {/* Muescas y Etiquetas de Fila Eje Y */}
                    {rowTicks.map(t => (
                      <g key={`tick-y-${t.row}`}>
                        <circle cx={originX} cy={t.y} r="5" fill="#34d399" stroke="#0f172a" strokeWidth="2" />
                        <rect 
                          x={originX - 58} 
                          y={t.y - 11} 
                          width="48" 
                          height="22" 
                          rx="7" 
                          fill="rgba(10, 15, 30, 0.9)" 
                          stroke="rgba(52, 211, 153, 0.5)" 
                          strokeWidth="1.2" 
                        />
                        <text 
                          x={originX - 34} 
                          y={t.y + 4} 
                          fill="#6ee7b7" 
                          fontSize="11" 
                          fontWeight="900" 
                          textAnchor="middle"
                        >
                          {t.row === 0 ? 'Y:0' : (t.row > 0 ? `+${t.row}` : `${t.row}`)}
                        </text>
                      </g>
                    ))}

                    {/* NODO CENTRAL: ORIGEN (0, 0) */}
                    <circle cx={originX} cy={originY} r="22" fill="rgba(245, 158, 11, 0.2)" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,4" />
                    <circle cx={originX} cy={originY} r="7.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
                    <rect 
                      x={originX + 18} 
                      y={originY - 30} 
                      width="114" 
                      height="26" 
                      rx="8" 
                      fill="rgba(10, 15, 30, 0.94)" 
                      stroke="#fbbf24" 
                      strokeWidth="1.5" 
                    />
                    <text 
                      x={originX + 75} 
                      y={originY - 13} 
                      fill="#fde68a" 
                      fontSize="12" 
                      fontWeight="900" 
                      textAnchor="middle"
                    >
                      📍 Origen (0, 0)
                    </text>
                  </svg>
                )}

                {/* CELDAS HEXAGONALES DEL MAPA */}
                {cells.map(cell => (
                  <HexagonCell 
                    key={cell.id} 
                    data={cell} 
                    hexWidth={hexWidth} 
                    hexHeight={hexHeight} 
                    xOffset={xOffset} 
                    yOffset={yOffset} 
                    onClick={onHexClick ? () => onHexClick(cell) : undefined}
                    onDoubleClick={onHexDoubleClick ? () => onHexDoubleClick(cell) : undefined}
                    onLongPress={onHexLongPress ? () => onHexLongPress(cell) : (onHexDoubleClick ? () => onHexDoubleClick(cell) : undefined)}
                    showLabel={showLabels}
                    isEditing={editingHexRow === cell.row && editingHexCol === cell.col}
                    isSelected={selectedHexId === cell.id}
                    showIcon={showIcons}
                    showTitle={showTitles}
                    showCategory={showCategories}
                  />
                ))}
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
};