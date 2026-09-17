import React, { useState, useRef } from 'react';
import type { CustomHexagon } from '../../types';
import { renderHexLayer } from './hexLayers';
import { getHexPillarInfo } from '../../utils/hexPillarUtils';
import './Hexagon.css';

interface HexagonCellProps {
  data: CustomHexagon;
  hexWidth: number;
  hexHeight: number;
  xOffset: number;
  yOffset: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  showLabel?: boolean;
  isEditing?: boolean;
  isSelected?: boolean;
  showIcon?: boolean;
  showTitle?: boolean;
  showCategory?: boolean;
}

const HexagonCellComponent: React.FC<HexagonCellProps> = ({
  data,
  hexWidth,
  hexHeight,
  xOffset,
  yOffset,
  onClick,
  onDoubleClick,
  onLongPress,
  showLabel,
  isEditing,
  isSelected,
  showIcon = true,
  showTitle = true,
  showCategory = true
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTriggeredRef = useRef(false);
  const suppressClickUntilRef = useRef<number>(0);

  const isUnexplored = data.id?.startsWith('unexplored-');
  const hasAction = Boolean(data.action && data.action.type !== 'none');
  const hasBgImage = Boolean(data.layerBg && data.layerBg.type !== 'none' && data.layerBg.value);
  const pillarInfo = getHexPillarInfo(data);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      clearLongPressTimer();
      return;
    }

    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTriggeredRef.current = false;
    setIsPressing(true);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Sostener por medio segundo (500ms) en la versión móvil abre el modal
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setIsPressing(false);
      suppressClickUntilRef.current = Date.now() + 600; // Bloquea clics fantasma en overlay

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {
          // Ignorar si no está permitido
        }
      }

      const triggerAction = onLongPress || onDoubleClick;
      if (triggerAction) {
        triggerAction();
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressTimerRef.current && !isPressing) return;

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPosRef.current.x;
      const dy = touch.clientY - touchStartPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      // Si el dedo se desplaza más de 10px, se cancela (el usuario está desplazando o paneando el mapa)
      if (dist > 10) {
        clearLongPressTimer();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    clearLongPressTimer();

    if (longPressTriggeredRef.current) {
      // El modal ya se abrió tras sostener 1 segundo; evitar clics adicionales
      e.preventDefault();
      e.stopPropagation();
      longPressTriggeredRef.current = false;
      return;
    }

    // Si está en ventana de bloqueo de eventos fantasma
    if (Date.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      return;
    }

    // Tap rápido simple en móvil: resalta el hexágono
    if (onClick) {
      e.preventDefault(); // Evita que se duplique un click sintético 300ms después
      onClick();
    }
  };

  const handleTouchCancel = () => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (Date.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (Date.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onDoubleClick?.();
  };

  const baseStyle: React.CSSProperties = {
    '--hex-glow-color': data.glowColor || 'var(--sutz-color-guide-glow, rgba(56, 189, 248, 0.45))'
  } as React.CSSProperties;

  baseStyle.width = `${hexWidth}px`;
  baseStyle.height = `${hexHeight}px`;
  baseStyle.left = `${xOffset + data.col * (0.75 * hexWidth)}px`;
  baseStyle.top = `${yOffset + data.row * hexHeight + (Math.abs(data.col) % 2 === 1 ? hexHeight / 2 : 0)}px`;

  return (
    <div
      className={`hex-cell-wrapper ${isSelected ? 'is-selected' : ''} ${isEditing ? 'is-editing' : ''} ${isUnexplored ? 'is-unexplored' : ''} ${hasAction ? 'has-action' : ''} ${hasBgImage ? 'has-bg-image' : ''} ${isPressing ? 'is-pressing' : ''}`}
      title={data.title}
      style={baseStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="hex-inner-border"></div>
      
      {/* Indicador visual de carga al sostener presionado en móvil */}
      {isPressing && (
        <div className="hex-holding-indicator">
          <div className="hex-holding-spinner"></div>
          <span className="hex-holding-text">0.5s</span>
        </div>
      )}

      <div className="hex-cell">
        {/* Capa 1: Fondo (Preserva imágenes de fondo y continuidad) */}
        {renderHexLayer(data.layerBg, 'hex-layer hex-layer-bg')}
        
        {/* Capa 2: Decorativa */}
        {renderHexLayer(data.layerDeco, 'hex-layer hex-layer-deco')}
        
        {/* Capa 3: Contenido e Iconografía Proporcionada */}
        <div className="hex-layer hex-layer-interactive">
          <div className="hex-content">
            {showIcon && renderHexLayer(data.layerInteractive, 'hex-interactive-content', true)}
            {data.title && !showLabel && (showTitle || (showCategory && pillarInfo)) && (
              <div className={`hex-title-badge ${pillarInfo ? `has-pillar pillar-${pillarInfo.id}` : ''}`}>
                {showCategory && pillarInfo && (
                  <div 
                    className="hex-pillar-tag"
                    title={`Reino: ${pillarInfo.label}`}
                    style={{
                      '--pillar-color': pillarInfo.color,
                      '--pillar-glow': pillarInfo.glow,
                      '--pillar-bg': pillarInfo.bgTint,
                      '--pillar-border': pillarInfo.borderTint
                    } as React.CSSProperties}
                  >
                    <span className="hex-pillar-icon">{pillarInfo.icon}</span>
                    <span className="hex-pillar-label">{pillarInfo.label}</span>
                  </div>
                )}
                {showTitle && <span className="hex-title-text">{data.title}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Indicador de acción interactiva */}
        {hasAction && !showLabel && showIcon && <div className="hex-action-pill" />}

        {/* Coordenadas Cartesianas (Eje X: Columna, Eje Y: Fila) */}
        {showLabel && (
          <div className="hex-admin-label" title={`Coordenadas Cartesianas: X = ${data.col}, Y = ${data.row}`}>
            <span style={{ color: 'var(--sutz-axis-x-color, #38bdf8)', fontWeight: 800 }}>X:</span>{data.col}
            <span style={{ color: 'var(--sutz-text-muted, #94a3b8)', margin: '0 2px' }}>·</span>
            <span style={{ color: 'var(--sutz-axis-y-color, #34d399)', fontWeight: 800 }}>Y:</span>{data.row}
          </div>
        )}
      </div>
    </div>
  );
};

export const HexagonCell = React.memo(HexagonCellComponent);