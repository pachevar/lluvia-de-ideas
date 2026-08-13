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

const renderLayer = (layer: HexLayer, className: string) => {
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
      return <div className={className} style={{ fontSize: '2.5rem', ...transformStyle }}>{layer.value}</div>;
    case 'icon':
      if (isUrl) {
        return <img src={layer.value} alt="" className={className} style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain', ...transformStyle }} />;
      }
      return (
        <div className={className} style={transformStyle}>
          <IconRenderer iconName={layer.value} color={layer.color || '#ffffff'} size="3em" />
        </div>
      );
    case 'text':
      return <div className={className} style={transformStyle}>{layer.value}</div>;
    default:
      return null;
  }
};

export const HexagonCell: React.FC<HexagonCellProps> = ({ data, hexWidth, hexHeight, xOffset, yOffset, onClick, showLabel, isEditing }) => {
  const left = xOffset + data.col * (0.75 * hexWidth);
  const top = yOffset + data.row * hexHeight + (Math.abs(data.col) % 2 === 1 ? hexHeight / 2 : 0);

  return (
    <div 
      className={`hex-cell-wrapper ${isEditing ? 'is-editing' : ''}`}
      title={data.title}
      style={{
        width: `${hexWidth}px`,
        height: `${hexHeight}px`,
        left: `${left}px`,
        top: `${top}px`,
        '--hex-glow-color': data.glowColor || 'rgba(255,255,255,0.4)'
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div className="hex-inner-border"></div>
      <div className="hex-cell">
        {/* Capa 1: Fondo */}
        {renderLayer(data.layerBg, 'hex-layer hex-layer-bg')}
        
        {/* Capa 2: Decorativa */}
        {renderLayer(data.layerDeco, 'hex-layer hex-layer-deco')}
        
        {/* Capa 3: Interactiva */}
        <div className="hex-layer hex-layer-interactive">
          <div className="hex-content">
            {renderLayer(data.layerInteractive, 'hex-interactive-content')}
            {data.title && !showLabel && <h4 className="hex-title">{data.title}</h4>}
          </div>
        </div>

        {/* Coordinadas / Etiqueta para Admin */}
        {showLabel && (
          <div className="hex-admin-label" style={{
            position: 'absolute',
            bottom: '10px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            color: 'white',
            background: 'rgba(0,0,0,0.6)',
            padding: '2px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 100
          }}>
            {getHexLabel(data.row, data.col)}
          </div>
        )}
      </div>
    </div>
  );
};
