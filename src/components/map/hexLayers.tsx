import type { HexLayer } from '../../types';
import { IconRenderer } from '../admin/IconRegistry';

export const renderHexLayer = (layer: HexLayer, className: string, isInteractive = false) => {
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
        return <img src={layer.value} alt="" className={className} loading="lazy" decoding="async" draggable={false} />;
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
            <img src={layer.value} alt="" className="hex-icon-img" draggable={false} />
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