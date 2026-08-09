import type { PortalConfig } from '../../types';

interface AdminTab100tekProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: any) => void;
}

export default function AdminTab100tek({ localConfig, updateField }: AdminTab100tekProps) {
  const tek100 = localConfig.tek100 || {
    numberSequencesIntro: "Descubre patrones lógicos, sucesiones algebraicas y retos de agilidad mental.",
    solarSystemIntro: "Navega en 3D por la órbita de los planetas y sus magnitudes astronómicas."
  };

  const handleChange = (field: string, value: string) => {
    updateField('tek100', field, value);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div className="admin-nested-header">
        <span className="admin-nested-icon">⚡</span>
        <div>
          <h3>Sección 100tek (Herramientas Educativas)</h3>
          <p className="tab-section-desc">Configuración para módulos de matemáticas, pensamiento lógico y exploración astronómica 3D.</p>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Herramientas de 100tek</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🔢 Secuencias Numéricas - Descripción / Subtítulo</label>
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
            <label>🪐 Sistema Solar 3D - Descripción / Subtítulo</label>
            <textarea 
              rows={3} 
              value={tek100.solarSystemIntro || ''} 
              onChange={(e) => handleChange('solarSystemIntro', e.target.value)}
              placeholder="Descripción de la simulación interactiva del sistema solar..."
            />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Accesos Rápidos a Herramientas Públicas</h4>
        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <a 
            href="/100tek/secuencias-numericas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🔢 Probar Secuencias Numéricas ↗
          </a>
          <a 
            href="/100tek/sistema-solar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🪐 Probar Sistema Solar 3D ↗
          </a>
        </div>
      </div>
    </div>
  );
}
