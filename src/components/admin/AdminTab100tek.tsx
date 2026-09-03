import type { PortalConfig } from '../../types';
import { PILLAR_REGISTRY } from './adminNavConfig';

interface AdminTab100tekProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: unknown) => void;
}

export default function AdminTab100tek({ localConfig, updateField }: AdminTab100tekProps) {
  const tekInfo = PILLAR_REGISTRY['100tek'];
  const tek100 = localConfig.tek100 || {
    numberSequencesIntro: "Descubre patrones lógicos, sucesiones algebraicas y retos de agilidad mental.",
    solarSystemIntro: "Navega en 3D por la órbita de los planetas y sus magnitudes astronómicas."
  };

  const handleChange = (field: string, value: string) => {
    updateField('tek100', field, value);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      {/* Banner de Identidad del Pilar */}
      <div 
        className="admin-nested-header" 
        style={{
          borderLeft: `4px solid ${tekInfo.color}`,
          background: `linear-gradient(90deg, ${tekInfo.color}18 0%, transparent 100%)`,
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        <span className="admin-nested-icon" style={{ fontSize: '2.4rem' }}>{tekInfo.icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Proyecto {tekInfo.title}</h3>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              background: `${tekInfo.color}25`, 
              color: tekInfo.color,
              padding: '2px 8px',
              borderRadius: '6px',
              border: `1px solid ${tekInfo.color}50`
            }}>
              {tekInfo.focusArea}
            </span>
          </div>
          <p className="tab-section-desc" style={{ margin: '4px 0 0', color: '#cbd5e1' }}>
            {tekInfo.tagline} — {tekInfo.description}
          </p>
        </div>
      </div>

      {/* Herramientas Principales del Pilar */}
      <div className="admin-form-section">
        <h4>⚡ Herramientas de Ciencia, Lógica y STEM</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🔢 Secuencias Numéricas - Descripción / Enfoque Didáctico</label>
            <textarea 
              rows={3} 
              value={tek100.numberSequencesIntro || ''} 
              onChange={(e) => handleChange('numberSequencesIntro', e.target.value)}
              placeholder="Descripción del generador y solución de secuencias numéricas..."
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🪐 Sistema Solar 3D - Descripción / Enfoque Didáctico</label>
            <textarea 
              rows={3} 
              value={tek100.solarSystemIntro || ''} 
              onChange={(e) => handleChange('solarSystemIntro', e.target.value)}
              placeholder="Descripción de la simulación interactiva del sistema solar..."
            />
          </div>
        </div>
      </div>

      {/* Catálogo de Módulos y Ejercicios 100tek */}
      <div className="admin-form-section">
        <h4>🚀 Rutas Didácticas y Ejercicios Públicos de 100tek</h4>
        <p className="admin-section-help" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Todo el pensamiento lógico, matemático y astronómico se organiza en 100tek. Haz clic para probar cualquier herramienta en tiempo real:
        </p>

        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '14px' }}>
          <a 
            href="/100tek/secuencias-numericas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🔢 Secuencias Numéricas</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/100tek/sistema-solar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🪐 Sistema Solar 3D</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
