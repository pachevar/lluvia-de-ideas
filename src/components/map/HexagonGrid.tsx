import React, { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { HexagonCell, type HexVariant } from './HexagonCell';
import type { CustomHexagon, IsoAsset } from '../../types';
import { buildIsoHexGeometry, isoProject } from '../../utils/isoHex';
import './Hexagon.css';

interface HexagonGridProps {
  cells: CustomHexagon[];
  hexWidth?: number;
  hexHeight?: number;
  onHexClick?: (hex: CustomHexagon) => void;
  showLabels?: boolean;
  editingHexRow?: number | null;
  editingHexCol?: number | null;
  variant?: HexVariant;
  isoDepth?: number;
  isoAssets?: IsoAsset[];
}

const twoDX = (cell: CustomHexagon, hexWidth: number, xOffset: number) => xOffset + cell.col * (0.75 * hexWidth);

const twoDY = (cell: CustomHexagon, hexHeight: number, yOffset: number) =>
  yOffset + cell.row * hexHeight + (Math.abs(cell.col) % 2 === 1 ? hexHeight / 2 : 0);

export const HexagonGrid: React.FC<HexagonGridProps> = ({
  cells,
  hexWidth = 208,
  hexHeight = 180, // 180 * 1.1547 (flat-topped)
  onHexClick,
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null,
  variant = 'flat',
  isoDepth,
  isoAssets
}) => {
  // Dynamic cell bounds calculation so hexes are ALWAYS perfectly centered
  const cols = cells.length > 0 ? cells.map(c => c.col) : [0];
  const rows = cells.length > 0 ? cells.map(c => c.row) : [0];

  const minCol = Math.min(...cols, -1);
  const maxCol = Math.max(...cols, 1);
  const minRow = Math.min(...rows, -1);
  const maxRow = Math.max(...rows, 1);

  const widthSpan = (maxCol - minCol + 3) * (0.75 * hexWidth);
  const heightSpan = (maxRow - minRow + 3) * hexHeight;

  const centerCol = (minCol + maxCol) / 2;
  const centerRow = (minRow + maxRow) / 2;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const isoLayout = useMemo(() => {
    if (variant !== 'iso') return null;
    const geo = buildIsoHexGeometry(hexWidth, hexHeight, isoDepth);
    const cellsList = cells.length > 0 ? cells : [];
    let minIsoX = Infinity, maxIsoX = -Infinity, minIsoY = Infinity, maxIsoY = -Infinity;
    cellsList.forEach(c => {
      const p = isoProject(twoDX(c, hexWidth, 0), twoDY(c, hexHeight, 0));
      minIsoX = Math.min(minIsoX, p.x + geo.minX);
      maxIsoX = Math.max(maxIsoX, p.x + geo.minX + geo.tileW);
      minIsoY = Math.min(minIsoY, p.y + geo.minY);
      maxIsoY = Math.max(maxIsoY, p.y + geo.minY + geo.tileH);
    });
    if (!isFinite(minIsoX)) {
      minIsoX = 0; maxIsoX = geo.tileW; minIsoY = 0; maxIsoY = geo.tileH;
    }
    const pad = Math.max(90, hexWidth);
    return { geo, minIsoX, minIsoY, pad, mapWidth: maxIsoX - minIsoX + pad * 2, mapHeight: maxIsoY - minIsoY + pad * 2 };
  }, [variant, cells, hexWidth, hexHeight, isoDepth]);

  let mapWidth: number;
  let mapHeight: number;
  let xOffset: number;
  let yOffset: number;
  let initialScale: number;

  if (variant === 'iso' && isoLayout) {
    mapWidth = isoLayout.mapWidth;
    mapHeight = isoLayout.mapHeight;
    xOffset = 0;
    yOffset = 0;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1400;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const fit = Math.min((vw - 96) / mapWidth, (vh - 180) / mapHeight);
    initialScale = Math.min(1.2, Math.max(0.25, fit));
  } else {
    mapWidth = Math.max(1600, widthSpan);
    mapHeight = Math.max(1200, heightSpan);
    xOffset = mapWidth / 2 - centerCol * (0.75 * hexWidth) - hexWidth / 2;
    yOffset = mapHeight / 2 - centerRow * hexHeight - hexHeight / 2;
    const base = isMobile ? 0.65 : 0.95;
    initialScale = variant === 'iso' ? base : base;
  }

  const isoPosFor = (cell: CustomHexagon): { left: number; top: number; zIndex: number } => {
    const iso = isoLayout!;
    const p = isoProject(twoDX(cell, hexWidth, xOffset), twoDY(cell, hexHeight, yOffset));
    return {
      left: p.x + iso.geo.minX - iso.minIsoX + iso.pad,
      top: p.y + iso.geo.minY - iso.minIsoY + iso.pad,
      zIndex: Math.round(p.y)
    };
  };

  return (
    <div className="map-viewport">

      <TransformWrapper
        key={variant}
        initialScale={initialScale}
        minScale={0.35}
        maxScale={2.8}
        centerOnInit={true}
        limitToBounds={true}
        smooth={true}
        wheel={{ disabled: true }}
        pinch={{ step: 5 }}
        panning={{ velocityDisabled: false }}
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <div 
            style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}
            onWheel={(e) => {
              if (e.deltaY < 0) {
                zoomIn(0.2, 250, "easeOut");
              } else if (e.deltaY > 0) {
                zoomOut(0.2, 250, "easeOut");
              }
            }}
          >
            <div className="map-controls" style={{ zIndex: 1000 }}>
              <button onClick={() => zoomIn()} title="Acercar">+</button>
              <button onClick={() => zoomOut()} title="Alejar">-</button>
              <button onClick={() => centerView()} title="Centrar">⌂</button>
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
                className={`hex-grid-container ${variant === 'iso' ? 'iso' : ''}`} 
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
                {cells.map(cell => (
                  <HexagonCell 
                    key={cell.id} 
                    data={cell} 
                    hexWidth={hexWidth} 
                    hexHeight={hexHeight} 
                    xOffset={xOffset} 
                    yOffset={yOffset} 
                    onClick={onHexClick ? () => onHexClick(cell) : undefined}
                    showLabel={showLabels}
                    isEditing={editingHexRow === cell.row && editingHexCol === cell.col}
                    variant={variant}
                    isoDepth={isoDepth}
                    isoPos={variant === 'iso' ? isoPosFor(cell) : undefined}
                  />
                ))}

                {variant === 'iso' && isoLayout && isoAssets && isoAssets.length > 0 && isoAssets.map(asset => {
                  const anchor = cells.find(c => c.row === asset.row && c.col === asset.col);
                  if (!anchor) return null;
                  const geo = isoLayout.geo;
                  const p = isoProject(twoDX(anchor, hexWidth, 0), twoDY(anchor, hexHeight, 0));
                  const left = p.x + geo.minX - isoLayout.minIsoX + isoLayout.pad;
                  const top = p.y + geo.minY - isoLayout.minIsoY + isoLayout.pad;
                  const w = asset.width ?? geo.tileW;
                  const h = asset.height ?? w;
                  const imgStyle: React.CSSProperties = {
                    position: 'absolute',
                    left: `${left + geo.tileW / 2 - w / 2 + (asset.offsetX ?? 0)}px`,
                    top: `${top + geo.tileH / 2 - h / 2 + (asset.offsetY ?? 0)}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    zIndex: (Math.round(p.y) + 500) * 100 + 50 + (asset.layer ?? 0),
                    opacity: asset.opacity ?? 1,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  };
                  return (
                    <img
                      key={asset.id}
                      src={asset.image}
                      alt={asset.name}
                      title={asset.name}
                      style={imgStyle}
                      draggable={false}
                    />
                  );
                })}
              </div>
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
};