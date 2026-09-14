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
  showLabels?: boolean;
  editingHexRow?: number | null;
  editingHexCol?: number | null;
  selectedHexId?: string | null;
  onTransformReady?: (controls: { zoomIn: () => void; zoomOut: () => void; centerView: () => void }) => void;
  showCartesianAxes?: boolean;
}

interface TransformBridgeProps {
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  onReady: (controls: { zoomIn: () => void; zoomOut: () => void; centerView: () => void }) => void;
}

const TransformBridge: React.FC<TransformBridgeProps> = ({ zoomIn, zoomOut, centerView, onReady }) => {
  React.useEffect(() => {
    onReady({ zoomIn, zoomOut, centerView });
  }, [zoomIn, zoomOut, centerView, onReady]);
  return null;
};

export const HexagonGrid: React.FC<HexagonGridProps> = ({
  cells,
  hexWidth = 208,
  hexHeight = 180, // 180 * 1.1547 (flat-topped)
  onHexClick,
  onHexDoubleClick,
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null,
  selectedHexId = null,
  onTransformReady,
  showCartesianAxes = true
}) => {
  const [internalShowAxes, setInternalShowAxes] = useState<boolean>(showCartesianAxes);

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

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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

  const base = isMobile ? 0.65 : 0.92;
  const initialScale = base;

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
        wheel={{ step: 0.04 }}
        zoomAnimation={{ animationType: 'easeOutQuad', animationTime: 280 }}
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
              <button onClick={() => centerView()} title="Centrar Mapa (Origen)">⌂</button>
              <button 
                type="button"
                className={internalShowAxes ? 'active' : ''}
                onClick={() => setInternalShowAxes(prev => !prev)} 
                title={internalShowAxes ? "Ocultar Plano Cartesiano (Ejes X, Y)" : "Mostrar Plano Cartesiano Didáctico (Ejes X, Y)"}
              >
                📐
              </button>
            </div>
            
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
                    showLabel={showLabels}
                    isEditing={editingHexRow === cell.row && editingHexCol === cell.col}
                    isSelected={selectedHexId === cell.id}
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