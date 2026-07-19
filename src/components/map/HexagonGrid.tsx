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
  hexWidth = 180, 
  hexHeight = 208, // 180 * 1.1547 (pointy-topped)
  onHexClick,
  showLabels = false,
  editingHexRow = null,
  editingHexCol = null
}) => {
  // Aumentamos el tamaño del lienzo virtual para que haya mucho espacio de exploración.
  const mapWidth = 5000;
  const mapHeight = 4000;

  // Calculamos el offset para que la coordenada (0,0) esté justo en el centro del canvas virtual
  const xOffset = mapWidth / 2 - hexWidth / 2;
  const yOffset = mapHeight / 2 - hexHeight / 2;

  // Detectar móvil para iniciar con un zoom más lejano
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const initialScale = isMobile ? 0.45 : 0.8;

  return (
    <div className="map-viewport">
      <div className="map-ui-overlay">
        <h1 className="map-ui-title">Mundo Virtual</h1>
        <p className="map-ui-subtitle">Arrastra para explorar • Rueda para zoom</p>
      </div>

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
