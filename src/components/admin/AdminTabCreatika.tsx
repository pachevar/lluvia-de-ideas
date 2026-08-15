import type { PortalConfig } from '../../types';

interface AdminTabCreatikaProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: unknown) => void;
}

export default function AdminTabCreatika({ localConfig, updateField }: AdminTabCreatikaProps) {
  const creatika = localConfig.creatika || {
    storyMachineIntro: "Combina personaje, escenario y conflicto para generar ideas de historias al instante.",
    colorTheoryIntro: "Explora la ciencia del color, modos HSL, contrastes y armonías interactivas."
  };

  const handleChange = (field: string, value: string) => {
    updateField('creatika', field, value);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div className="admin-nested-header">
        <span className="admin-nested-icon">✨</span>
        <div>
          <h3>Sección Creatika</h3>
          <p className="tab-section-desc">Gestiona las herramientas de creatividad, narrativa interactiva y laboratorio del color.</p>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Herramientas de Creatika</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🎰 Máquina de Cuentos - Descripción / Subtítulo</label>
            <textarea 
              rows={3} 
              value={creatika.storyMachineIntro || ''} 
              onChange={(e) => handleChange('storyMachineIntro', e.target.value)}
              placeholder="Descripción del generador de historias aleatorias..."
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🎨 Teoría del Color - Descripción / Subtítulo</label>
            <textarea 
              rows={3} 
              value={creatika.colorTheoryIntro || ''} 
              onChange={(e) => handleChange('colorTheoryIntro', e.target.value)}
              placeholder="Descripción de la herramienta interactiva de teoría de color..."
            />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Accesos Rápidos a Herramientas Públicas</h4>
        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <a 
            href="/creatika/maquina-de-cuentos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🎰 Probar Máquina de Cuentos ↗
          </a>
          <a 
            href="/creatika/teoria-del-color" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🎨 Probar Teoría del Color ↗
          </a>
          <a 
            href="/creatika/codigo-docente" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            📜 Abrir El Código Docente ↗
          </a>
          <a 
            href="/creatika/codigo-estudiante" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🎓 Abrir El Código del Estudiante ↗
          </a>
        </div>
      </div>
    </div>
  );
}
