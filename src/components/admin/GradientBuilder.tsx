import { useState, useEffect } from 'react';

interface GradientBuilderProps {
  onApply: (cssGradient: string) => void;
  onClose: () => void;
}

interface ColorStop {
  color: string;
  position: number;
}

export default function GradientBuilder({ onApply, onClose }: GradientBuilderProps) {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState<number>(45);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#4a90e2', position: 0 },
    { color: '#50e3c2', position: 100 }
  ]);

  const [previewCSS, setPreviewCSS] = useState<string>('');

  useEffect(() => {
    // Ordenar los stops por posición antes de generar el CSS
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    
    if (type === 'linear') {
      setPreviewCSS(`linear-gradient(${angle}deg, ${stopsString})`);
    } else {
      setPreviewCSS(`radial-gradient(circle, ${stopsString})`);
    }
  }, [type, angle, stops]);

  const handleAddStop = () => {
    if (stops.length >= 4) return;
    
    // Encontrar una posición libre
    const maxPos = Math.max(...stops.map(s => s.position));
    const newPos = maxPos + 20 > 100 ? 50 : maxPos + 20;
    
    setStops([...stops, { color: '#ffffff', position: newPos }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) return; // Mínimo 2 colores
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleStopChange = (index: number, field: 'color' | 'position', value: unknown) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  return (
    <div className="gradient-builder card-glass" style={{ padding: '20px', marginTop: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: 'var(--text-title)' }}>🎨 Creador de Degradados</h4>
        <button className="btn btn-secondary" onClick={onClose} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cerrar</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Controles */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="admin-form-group">
            <label>Tipo de Degradado</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'linear' | 'radial')}>
              <option value="linear">Lineal</option>
              <option value="radial">Radial / Circular</option>
            </select>
          </div>

          {type === 'linear' && (
            <div className="admin-form-group">
              <label>Ángulo ({angle}°)</label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={angle} 
                onChange={(e) => setAngle(Number(e.target.value))} 
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Colores ({stops.length}/4)</label>
            {stops.map((stop, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px' }}>
                <input 
                  type="color" 
                  value={stop.color} 
                  onChange={(e) => handleStopChange(index, 'color', e.target.value)}
                  style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Posición: {stop.position}%</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={stop.position} 
                    onChange={(e) => handleStopChange(index, 'position', Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                {stops.length > 2 && (
                  <button 
                    onClick={() => handleRemoveStop(index)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Eliminar Color"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            
            {stops.length < 4 && (
              <button 
                className="btn btn-secondary" 
                onClick={handleAddStop} 
                style={{ width: '100%', marginTop: '5px' }}
              >
                + Añadir Color
              </button>
            )}
          </div>
        </div>

        {/* Previsualización */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ marginBottom: '10px', fontWeight: 'bold' }}>Vista Previa en Hexágono</label>
          <div 
            style={{ 
              width: '180px', 
              height: '208px', 
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: previewCSS,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}
          ></div>
        </div>
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => onApply(previewCSS)}
          style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}
        >
          ✨ Aplicar Degradado
        </button>
      </div>
    </div>
  );
}
