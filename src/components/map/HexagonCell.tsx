import React from 'react';
import type { CustomHexagon, HexLayer } from '../../types';
import { getHexLabel } from '../../utils/hexUtils';
import { IconRenderer } from '../admin/IconRegistry';
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

const renderLayer = (layer: HexLayer, className: string, isInteractive = false) => {
  if (!layer || layer.type === 'none' || !layer.value) return null;
  
  const transformStyle = (layer.size !== undefined || layer.rotation !== undefined || layer.offsetX !== undefined || layer.offsetY !== undefined)
    ? { 
        transform: `scale(${layer.size ?? 1.0}) rotate(${layer.rotation ?? 0}deg) translate(${layer.offsetX ?? 0}px, ${layer.offsetY ?? 0}px)`,
        transition: 'none'
      }
    : {};

  const isUrl = typeof layer.value === 'string' && (
    layer.value.startsWith('http://') || 
    layer.value.startsWith('https://') || 
    layer.value.startsWith('data:image/') || 
    layer.value.startsWith('/')
  );

  switch (layer.type) {
    case 'color':
      return <div className={className} style={{ background: layer.value }}></div>;
    case 'image':
      if (isUrl) {
        return <img src={layer.value} alt="" className={className} loading="lazy" decoding="async" />;
      }
      return (
        <div className={`${className} ${isInteractive ? 'hex-icon-disc' : ''}`} style={transformStyle}>
          <span className="hex-icon-glyph">{layer.value}</span>
        </div>
      );
    case 'icon':
      if (isUrl) {
        return (
          <div className={`${className} ${isInteractive ? 'hex-icon-disc' : ''}`} style={transformStyle}>
            <img src={layer.value} alt="" className="hex-icon-img" />
          </div>
        );
      }
      return (
        <div className={`${className} ${isInteractive ? 'hex-icon-disc' : ''}`} style={transformStyle}>
          <IconRenderer iconName={layer.value} color={layer.color || '#ffffff'} size="1.45rem" />
        </div>
      );
    case 'text':
      return (
        <div className={`${className} ${isInteractive ? 'hex-icon-disc' : ''}`} style={transformStyle}>
          <span className="hex-icon-glyph">{layer.value}</span>
        </div>
      );
    default:
      return null;
  }
};

export const HexagonCell: React.FC<HexagonCellProps> = ({ data, hexWidth, hexHeight, xOffset, yOffset, onClick, showLabel, isEditing }) => {
  const left = xOffset + data.col * (0.75 * hexWidth);
  const top = yOffset + data.row * hexHeight + (Math.abs(data.col) % 2 === 1 ? hexHeight / 2 : 0);
  const isUnexplored = data.id?.startsWith('unexplored-');
  const hasAction = Boolean(data.action && data.action.type !== 'none');
  const hasBgImage = Boolean(data.layerBg && data.layerBg.type !== 'none' && data.layerBg.value);

  return (
    <div 
      className={`hex-cell-wrapper ${isEditing ? 'is-editing' : ''} ${isUnexplored ? 'is-unexplored' : ''} ${hasAction ? 'has-action' : ''}`}
      title={data.title}
      style={{
        width: `${hexWidth}px`,
        height: `${hexHeight}px`,
        left: `${left}px`,
        top: `${top}px`,
        '--hex-glow-color': data.glowColor || 'rgba(56, 189, 248, 0.45)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="hex-inner-border"></div>
      <div className="hex-cell">
        {/* Capa 1: Fondo (Preserva imágenes de fondo) */}
        {renderLayer(data.layerBg, 'hex-layer hex-layer-bg')}

        {/* Gradiente de sombra elegante para asegurar contraste y legibilidad */}
        {hasBgImage && <div className="hex-layer-shade" />}
        
        {/* Capa 2: Decorativa */}
        {renderLayer(data.layerDeco, 'hex-layer hex-layer-deco')}
        
        {/* Capa 3: Contenido e Iconografía Proporcionada */}
        <div className="hex-layer hex-layer-interactive">
          <div className="hex-content">
            {renderLayer(data.layerInteractive, 'hex-interactive-content', true)}
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
