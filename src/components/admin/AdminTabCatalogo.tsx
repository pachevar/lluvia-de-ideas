import type { PortalConfig } from '../../types';

interface AdminTabCatalogoProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: any) => void;
}

export default function AdminTabCatalogo({ localConfig, updateField }: AdminTabCatalogoProps) {
  const catalogo = localConfig.catalogoConfig || {
    announcement: "¡Nuevas publicaciones y guías pedagógicas disponibles para el ciclo escolar!",
    whatsappPhone: "50246741239"
  };

  const handleChange = (field: string, value: string) => {
    updateField('catalogoConfig', field, value);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div className="admin-nested-header">
        <span className="admin-nested-icon">📚</span>
        <div>
          <h3>Sección Catálogo Editorial</h3>
          <p className="tab-section-desc">Configura avisos destacados de libros, promociones y línea de atención directa para pedidos.</p>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Banner de Anuncio del Catálogo</h4>
        
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Mensaje de Anuncio / Novedades</label>
            <textarea 
              rows={3} 
              value={catalogo.announcement || ''} 
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="Escribe el mensaje destacado para los clientes en el catálogo..."
            />
          </div>
        </div>

        <div className="admin-form-row two-cols">
          <div className="admin-form-group">
            <label>Teléfono de WhatsApp para Pedidos (Código de país sin +)</label>
            <input 
              type="text" 
              value={catalogo.whatsappPhone || ''} 
              onChange={(e) => handleChange('whatsappPhone', e.target.value)}
              placeholder="Ejemplo: 50246741239"
            />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Vínculos Rápidos de Comercialización</h4>
        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <a 
            href="/catalogo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            📚 Ver Catálogo Público ↗
          </a>
        </div>
      </div>
    </div>
  );
}
