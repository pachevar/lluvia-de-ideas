import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { HexagonCell } from './HexagonCell';
import type { CustomHexagon } from '../../types';
import './Hexagon.css';

interface HexagonGridProps {
  cells: CustomHexagon[];
  hexWidth?: number;
  hexHeight?: number;
  onHexClick?: (hex: CustomHexagon) => void;
  showLabels?: boolean;
  editingHexRow?: number | null;
  editingHexCol?: number | null;
  onTransformReady?: (controls: { zoomIn: () => void; zoomOut: () => void; centerView: () => void }) => void;
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
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null,
  onTransformReady
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

  const mapWidth = Math.max(1600, widthSpan);
  const mapHeight = Math.max(1200, heightSpan);
  const xOffset = mapWidth / 2 - centerCol * (0.75 * hexWidth) - hexWidth / 2;
  const yOffset = mapHeight / 2 - centerRow * hexHeight - hexHeight / 2;
  const base = isMobile ? 0.65 : 0.95;
  const initialScale = base;

  return (
    <div className="map-viewport">

      <TransformWrapper
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
            {onTransformReady && (
              <TransformBridge zoomIn={zoomIn} zoomOut={zoomOut} centerView={centerView} onReady={onTransformReady} />
            )}
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