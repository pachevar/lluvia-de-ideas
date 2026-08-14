import React, { useMemo } from 'react';
import type { CustomHexagon } from '../../types';
import { getHexLabel } from '../../utils/hexUtils';
import { buildIsoHexGeometry } from '../../utils/isoHex';
import { renderHexLayer } from './hexLayers';
import './Hexagon.css';

export type HexVariant = 'flat' | 'iso';

interface IsoCellPosition {
  left: number;
  top: number;
  zIndex: number;
}

interface HexagonCellProps {
  data: CustomHexagon;
  hexWidth: number;
  hexHeight: number;
  xOffset: number;
  yOffset: number;
  onClick?: () => void;
  showLabel?: boolean;
  isEditing?: boolean;
  variant?: HexVariant;
  isoPos?: IsoCellPosition;
  isoDepth?: number;
}

export const HexagonCell: React.FC<HexagonCellProps> = ({
  data,
  hexWidth,
  hexHeight,
  xOffset,
  yOffset,
  onClick,
  showLabel,
  isEditing,
  variant = 'flat',
  isoPos,
  isoDepth
}) => {
  const isoGeo = useMemo(
    () => (variant === 'iso' ? buildIsoHexGeometry(hexWidth, hexHeight, isoDepth) : null),
    [variant, hexWidth, hexHeight, isoDepth]
  );

  const isUnexplored = data.id?.startsWith('unexplored-');
  const hasAction = Boolean(data.action && data.action.type !== 'none');
  const hasBgImage = Boolean(data.layerBg && data.layerBg.type !== 'none' && data.layerBg.value);

  const baseStyle: React.CSSProperties = {
    '--hex-glow-color': data.glowColor || 'rgba(56, 189, 248, 0.45)'
  } as React.CSSProperties;

  if (variant === 'iso' && isoPos && isoGeo) {
    baseStyle.left = `${isoPos.left}px`;
    baseStyle.top = `${isoPos.top}px`;
    baseStyle.zIndex = isoPos.zIndex;
    baseStyle.width = `${isoGeo.tileW}px`;
    baseStyle.height = `${isoGeo.tileH}px`;
  } else {
    baseStyle.width = `${hexWidth}px`;
    baseStyle.height = `${hexHeight}px`;
    baseStyle.left = `${xOffset + data.col * (0.75 * hexWidth)}px`;
    baseStyle.top = `${yOffset + data.row * hexHeight + (Math.abs(data.col) % 2 === 1 ? hexHeight / 2 : 0)}px`;
  }

  const faceBoxStyle = (isoGeo && variant === 'iso')
    ? {
        position: 'absolute',
        inset: 'auto',
        left: `${(isoGeo.faceLeft / isoGeo.tileW) * 100}%`,
        top: `${(isoGeo.faceTop / isoGeo.tileH) * 100}%`,
        width: `${(isoGeo.faceW / isoGeo.tileW) * 100}%`,
        height: `${(isoGeo.faceH / isoGeo.tileH) * 100}%`,
        clipPath: isoGeo.faceClip
      } as React.CSSProperties
    : undefined;

  return (
    <div
      className={`hex-cell-wrapper ${isEditing ? 'is-editing' : ''} ${isUnexplored ? 'is-unexplored' : ''} ${hasAction ? 'has-action' : ''} ${variant === 'iso' ? 'is-iso' : ''}`}
      title={data.title}
      style={baseStyle}
      onClick={onClick}
    >
      {variant === 'iso' && isoGeo && (
        <div className="hex-iso-wall" style={{ clipPath: isoGeo.wallClip }} />
      )}
      <div className="hex-inner-border" style={faceBoxStyle}></div>
      <div className="hex-cell" style={faceBoxStyle}>
        {/* Capa 1: Fondo (Preserva imágenes de fondo) */}
        {renderHexLayer(data.layerBg, 'hex-layer hex-layer-bg')}

        {/* Gradiente de sombra elegante para asegurar contraste y legibilidad */}
        {hasBgImage && <div className="hex-layer-shade" />}
        
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