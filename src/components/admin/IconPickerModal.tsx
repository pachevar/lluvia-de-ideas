import { useState } from 'react';
import { ICON_CATEGORIES, EMOJI_CATEGORIES, IconRenderer } from './IconRegistry';

interface IconPickerModalProps {
  initialIcon?: string;
  initialColor?: string;
  initialSize?: number;
  initialRotation?: number;
  initialOffsetX?: number;
  initialOffsetY?: number;
  onApply: (iconValue: string, iconColor: string, size: number, rotation: number, offsetX: number, offsetY: number) => void;
  onClose: () => void;
}

export default function IconPickerModal({ 
  initialIcon = '', initialColor = '#ffffff', 
  initialSize = 1.0, initialRotation = 0, initialOffsetX = 0, initialOffsetY = 0,
  onApply, onClose 
}: IconPickerModalProps) {
  const [selectedIcon, setSelectedIcon] = useState<string>(initialIcon);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [size, setSize] = useState<number>(initialSize);
  const [rotation, setRotation] = useState<number>(initialRotation);
  const [offsetX, setOffsetX] = useState<number>(initialOffsetX);
  const [offsetY, setOffsetY] = useState<number>(initialOffsetY);
  const [activeTab, setActiveTab] = useState<number>(0);

  const allCategories = [...ICON_CATEGORIES, ...EMOJI_CATEGORIES];

  const handleApply = () => {
    onApply(selectedIcon, selectedColor, size, rotation, offsetX, offsetY);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-glass" style={{ width: '600px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-title)' }}>🔍 Catálogo de Íconos y Emojis</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
          {allCategories.map((cat, idx) => (
            <button 
              key={idx}
              className={`btn ${activeTab === idx ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(idx)}
              style={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '0.9rem' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Controles de Transformación */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Color (Solo Vectores):</label>
            </div>
            <input 
              type="color" 
              value={selectedColor} 
              onChange={e => setSelectedColor(e.target.value)}
              style={{ width: '100%', height: '30px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '5px' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Tamaño: {size}x</label>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0 5px', fontSize: '0.7rem' }} onClick={() => setSize(1.0)}>Reset</button>
            </div>
            <input type="range" min="0.5" max="3" step="0.1" value={size} onChange={e => setSize(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Rotación: {rotation}°</label>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0 5px', fontSize: '0.7rem' }} onClick={() => setRotation(0)}>Reset</button>
            </div>
            <input type="range" min="-180" max="180" step="5" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Posición X: {offsetX}px</label>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0 5px', fontSize: '0.7rem' }} onClick={() => setOffsetX(0)}>Reset</button>
            </div>
            <input type="range" min="-50" max="50" step="1" value={offsetX} onChange={e => setOffsetX(parseInt(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Posición Y: {offsetY}px</label>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0 5px', fontSize: '0.7rem' }} onClick={() => setOffsetY(0)}>Reset</button>
            </div>
            <input type="range" min="-50" max="50" step="1" value={offsetY} onChange={e => setOffsetY(parseInt(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
               {selectedIcon ? (
                 <div style={{ transform: `scale(${size}) rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`, transition: 'transform 0.1s' }}>
                   <IconRenderer iconName={selectedIcon} color={activeTab === allCategories.length - 1 ? 'inherit' : selectedColor} size="3em" />
                 </div>
               ) : '?'}
            </div>
          </div>
        </div>

        {/* Icon Grid */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '10px', alignContent: 'start' }}>
          {allCategories[activeTab].icons.map(iconName => (
            <button
              key={iconName}
              onClick={() => setSelectedIcon(iconName)}
              style={{
                background: selectedIcon === iconName ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                border: selectedIcon === iconName ? '2px solid white' : '1px solid transparent',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={iconName}
            >
              <IconRenderer iconName={iconName} color={activeTab === allCategories.length - 1 ? 'inherit' : selectedColor} size="2em" />
            </button>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleApply}
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
            disabled={!selectedIcon}
          >
            ✨ Aplicar Ícono
          </button>
        </div>

      </div>
    </div>
  );
}
