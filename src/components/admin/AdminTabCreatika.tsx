import type { PortalConfig } from '../../types';
import { PILLAR_REGISTRY } from './adminNavConfig';

interface AdminTabCreatikaProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: unknown) => void;
}

export default function AdminTabCreatika({ localConfig, updateField }: AdminTabCreatikaProps) {
  const creatikaInfo = PILLAR_REGISTRY.creatika;
  const creatika = localConfig.creatika || {
    storyMachineIntro: "Combina personaje, escenario y conflicto para generar ideas de historias al instante.",
    colorTheoryIntro: "Explora la ciencia del color, modos HSL, contrastes y armonías interactivas."
  };

  const handleChange = (field: string, value: string) => {
    updateField('creatika', field, value);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      {/* Banner de Identidad del Pilar */}
      <div 
        className="admin-nested-header" 
        style={{
          borderLeft: `4px solid ${creatikaInfo.color}`,
          background: `linear-gradient(90deg, ${creatikaInfo.color}18 0%, transparent 100%)`,
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        <span className="admin-nested-icon" style={{ fontSize: '2.4rem' }}>{creatikaInfo.icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Proyecto {creatikaInfo.title}</h3>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              background: `${creatikaInfo.color}25`, 
              color: creatikaInfo.color,
              padding: '2px 8px',
              borderRadius: '6px',
              border: `1px solid ${creatikaInfo.color}50`
            }}>
              {creatikaInfo.focusArea}
            </span>
          </div>
          <p className="tab-section-desc" style={{ margin: '4px 0 0', color: '#cbd5e1' }}>
            {creatikaInfo.tagline} — {creatikaInfo.description}
          </p>
        </div>
      </div>

      {/* Herramientas Principales del Pilar */}
      <div className="admin-form-section">
        <h4>🎨 Configuración de Herramientas Creativas</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>🎰 Máquina de Cuentos - Descripción / Enfoque Didáctico</label>
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
            <label>🎨 Teoría del Color - Descripción / Enfoque Didáctico</label>
            <textarea 
              rows={3} 
              value={creatika.colorTheoryIntro || ''} 
              onChange={(e) => handleChange('colorTheoryIntro', e.target.value)}
              placeholder="Descripción de la herramienta interactiva de teoría de color..."
            />
          </div>
        </div>
      </div>

      {/* Catálogo de Módulos y Ejercicios Creatika */}
      <div className="admin-form-section">
        <h4>🚀 Rutas Didácticas y Ejercicios Públicos de Creatika</h4>
        <p className="admin-section-help" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Todo lo artístico, narrativo y visual converge en Creatika. Haz clic para probar cualquier herramienta en tiempo real:
        </p>

        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '14px' }}>
          <a 
            href="/creatika/maquina-de-cuentos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🎰 Máquina de Cuentos</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/creatika/teoria-del-color" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🎨 Teoría del Color</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/creatika/construyendo-personaje" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🦸 El Viaje del Héroe</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/creatika/codigo-docente" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>📜 El Código Docente</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/creatika/codigo-estudiante" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>🎓 El Código del Estudiante</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/nuestros-libros" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px' }}
          >
            <span>📖 Nuestros Libros & Cuentos</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </a>

          <a 
            href="/creatika" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: `linear-gradient(135deg, ${creatikaInfo.color}, #9333ea)` }}
          >
            <span>✨ Hub Central Creatika</span>
            <span style={{ opacity: 0.8 }}>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
