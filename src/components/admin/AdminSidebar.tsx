

interface AdminSidebarProps {
  userEmail: string | null;
  activeAdminTab: string;
  setActiveAdminTab: (tab: 'inicio' | 'mapa' | 'laboratorios' | 'colors' | 'inscripciones' | 'cotizador' | 'bingo') => void;
  handleSaveConfig: () => void;
  handleResetConfig: () => void;
  saving: boolean;
  saveStatus: { type: 'success' | 'error' | null; message: string };
  onBackToPortal: () => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  userEmail,
  activeAdminTab,
  setActiveAdminTab,
  handleSaveConfig,
  handleResetConfig,
  saving,
  saveStatus,
  onBackToPortal,
  handleLogout
}: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar card-glass">
      <div className="admin-brand-header">
        <span className="admin-brand-icon">⚙️</span>
        <div>
          <h3>Gerencia</h3>
          <span className="admin-user-email">{userEmail}</span>
        </div>
      </div>

      {/* Mobile Navigation Selector */}
      <div className="admin-mobile-nav">
        <label htmlFor="admin-nav-select" className="admin-mobile-nav-label">Seleccionar sección:</label>
        <div className="admin-nav-select-wrapper">
          <select 
            id="admin-nav-select"
            value={activeAdminTab} 
            onChange={(e) => setActiveAdminTab(e.target.value as any)}
            className="admin-nav-select"
          >
            <option value="inicio">🏠 Sección Inicio</option>
            <option value="laboratorios">🧪 Sección Laboratorios</option>
            <option value="colors">🌈 Colores y Tema</option>
            <option value="inscripciones">📝 Inscripciones (Labs)</option>
            <option value="cotizador">💼 Cotizador Web</option>
            <option value="bingo">🎲 Bingo Masivo</option>
          </select>
          <span className="admin-nav-select-arrow">▼</span>
        </div>
      </div>

      <nav className="admin-nav-menu">
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'inicio' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('inicio')}
        >
          🏠 Inicio y Textos
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'mapa' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('mapa')}
        >
          🌍 Mundo Virtual
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'laboratorios' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('laboratorios')}
        >
          🧪 Laboratorios
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('colors')}
        >
          🎨 Colores y Estilos
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'inscripciones' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('inscripciones')}
        >
          📝 Maestros Inscritos
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'cotizador' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('cotizador')}
        >
          💼 Cotizador Web
        </button>
        <button 
          className={`admin-nav-tab ${activeAdminTab === 'bingo' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('bingo')}
        >
          🎲 Bingo Masivo
        </button>
      </nav>

      <div className="admin-actions-group">
        {saveStatus.message && (
          <div className={`save-status-toast ${saveStatus.type}`}>
            {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
          </div>
        )}

        <button 
          className="btn btn-primary btn-large btn-admin-save" 
          onClick={handleSaveConfig}
          disabled={saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>

        <button 
          className="btn btn-secondary btn-admin-reset" 
          onClick={handleResetConfig}
          disabled={saving}
        >
          🔄 Restaurar por Defecto
        </button>

        <div className="divider-h"></div>

        <button className="btn btn-outline btn-sm" onClick={onBackToPortal}>
          🌐 Ir al Portal Público
        </button>

        <button className="btn btn-danger btn-sm btn-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
