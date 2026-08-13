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
}

export const HexagonGrid: React.FC<HexagonGridProps> = ({ 
  cells, 
  hexWidth = 208, 
  hexHeight = 180, // 180 * 1.1547 (flat-topped)
  onHexClick,
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null
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

  const mapWidth = Math.max(1600, widthSpan);
  const mapHeight = Math.max(1200, heightSpan);

  const centerCol = (minCol + maxCol) / 2;
  const centerRow = (minRow + maxRow) / 2;

  const xOffset = mapWidth / 2 - centerCol * (0.75 * hexWidth) - hexWidth / 2;
  const yOffset = mapHeight / 2 - centerRow * hexHeight - hexHeight / 2;

  // Detectar móvil para iniciar con un zoom adaptativo
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const initialScale = isMobile ? 0.65 : 0.95;

  return (
    <div className="map-viewport">

      <TransformWrapper
        initialScale={initialScale}
        minScale={0.3}
        maxScale={2.5}
        centerOnInit={true}
        limitToBounds={true}
        smooth={true}
        wheel={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, centerView }) => (
          <div 
            style={{ width: '100%', height: '100%', position: 'relative' }}
            onWheel={(e) => {
              // Prevenir el scroll por defecto si es necesario
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
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: mapWidth, height: mapHeight, position: 'relative' }}
            >
              <div className="hex-grid-container" style={{ width: mapWidth, height: mapHeight, position: 'relative' }}>
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
