import React from 'react';
import type { CustomHexagon } from '../../types';
import { getHexLabel } from '../../utils/hexUtils';
import { renderHexLayer } from './hexLayers';
import './Hexagon.css';

interface HexagonCellProps {
  data: CustomHexagon;
  hexWidth: number;
  hexHeight: number;
  xOffset: number;
  yOffset: number;
  onClick?: () => void;
  showLabel?: boolean;
  isEditing?: boolean;
}

const HexagonCellComponent: React.FC<HexagonCellProps> = ({
  data,
  hexWidth,
  hexHeight,
  xOffset,
  yOffset,
  onClick,
  showLabel,
  isEditing
}) => {
  const isUnexplored = data.id?.startsWith('unexplored-');
  const hasAction = Boolean(data.action && data.action.type !== 'none');
  const hasBgImage = Boolean(data.layerBg && data.layerBg.type !== 'none' && data.layerBg.value);

  const baseStyle: React.CSSProperties = {
    '--hex-glow-color': data.glowColor || 'rgba(56, 189, 248, 0.45)'
  } as React.CSSProperties;

  baseStyle.width = `${hexWidth}px`;
  baseStyle.height = `${hexHeight}px`;
  baseStyle.left = `${xOffset + data.col * (0.75 * hexWidth)}px`;
  baseStyle.top = `${yOffset + data.row * hexHeight + (Math.abs(data.col) % 2 === 1 ? hexHeight / 2 : 0)}px`;

  return (
    <div
      className={`hex-cell-wrapper ${isEditing ? 'is-editing' : ''} ${isUnexplored ? 'is-unexplored' : ''} ${hasAction ? 'has-action' : ''} ${hasBgImage ? 'has-bg-image' : ''}`}
      title={data.title}
      style={baseStyle}
      onClick={onClick}
    >
      <div className="hex-inner-border"></div>
      <div className="hex-cell">
        {/* Capa 1: Fondo (Preserva imágenes de fondo y continuidad) */}
        {renderHexLayer(data.layerBg, 'hex-layer hex-layer-bg')}
        
        {/* Capa 2: Decorativa */}
        {renderHexLayer(data.layerDeco, 'hex-layer hex-layer-deco')}
        
        {/* Capa 3: Contenido e Iconografía Proporcionada */}
        <div className="hex-layer hex-layer-interactive">
          <div className="hex-content">
            {renderHexLayer(data.layerInteractive, 'hex-interactive-content', true)}
            {data.title && !showLabel && (
              <div className="hex-title-badge">
                <span className="hex-title-text">{data.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de acción interactiva */}
        {hasAction && !showLabel && <div className="hex-action-pill" />}

        {/* Coordinadas / Etiqueta para Admin */}
        {showLabel && (
          <div className="hex-admin-label">
            {getHexLabel(data.row, data.col)}
          </div>
        )}
      </div>
    </div>
  );
};

export const HexagonCell = React.memo(HexagonCellComponent);