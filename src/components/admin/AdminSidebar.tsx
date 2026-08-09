export type AdminTabType = 
  | 'inicio' 
  | 'creatika' 
  | 'bingo' 
  | '100tek' 
  | 'mapa' 
  | 'laboratorios' 
  | 'catalogo' 
  | 'inscripciones' 
  | 'cotizador' 
  | 'colors'
  | 'techtree';

interface AdminSidebarProps {
  userEmail: string | null;
  activeAdminTab: AdminTabType;
  setActiveAdminTab: (tab: AdminTabType) => void;
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
            onChange={(e) => setActiveAdminTab(e.target.value as AdminTabType)}
            className="admin-nav-select"
          >
            <optgroup label="🌐 Secciones del Portal">
              <option value="inicio">🏠 Inicio y Leyendas</option>
              <option value="creatika">✨ Creatika</option>
              <option value="bingo">🎮 Juegos (Bingo Masivo)</option>
              <option value="100tek">⚡ 100tek</option>
              <option value="mapa">🌪️ Universo de Juracán</option>
              <option value="techtree">🌳 Árbol Tecnológico (Sutz)</option>
              <option value="laboratorios">🧪 Laboratorios</option>
              <option value="catalogo">📚 Catálogo Editorial</option>
            </optgroup>
            <optgroup label="💼 Herramientas de Gestión">
              <option value="inscripciones">📝 Maestros Inscritos</option>
              <option value="cotizador">💼 Cotizador Web</option>
            </optgroup>
            <optgroup label="🎨 Apariencia y Sistema">
              <option value="colors">🎨 Colores y Tema</option>
            </optgroup>
          </select>
          <span className="admin-nav-select-arrow">▼</span>
        </div>
      </div>

      <nav className="admin-nav-menu">
        {/* GRUPO 1: SECCIONES DEL PORTAL */}
        <div className="admin-sidebar-category">
          <span className="admin-sidebar-category-title">🌐 SECCIONES DEL PORTAL</span>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('inicio')}
          >
            🏠 Inicio y Leyendas
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'creatika' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('creatika')}
          >
            ✨ Creatika
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'bingo' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('bingo')}
          >
            🎮 Juegos (Bingo)
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === '100tek' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('100tek')}
          >
            ⚡ 100tek
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'mapa' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('mapa')}
          >
            🌪️ Universo de Juracán
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'techtree' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('techtree')}
          >
            🌳 Árbol Tecnológico (Sutz)
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'laboratorios' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('laboratorios')}
          >
            🧪 Laboratorios
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'catalogo' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('catalogo')}
          >
            📚 Catálogo Editorial
          </button>
        </div>

        {/* GRUPO 2: HERRAMIENTAS DE GESTIÓN */}
        <div className="admin-sidebar-category">
          <span className="admin-sidebar-category-title">💼 GESTIÓN Y REGISTROS</span>
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
        </div>

        {/* GRUPO 3: APARIENCIA Y SISTEMA */}
        <div className="admin-sidebar-category">
          <span className="admin-sidebar-category-title">🎨 APARIENCIA</span>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('colors')}
          >
            🎨 Colores y Tema
          </button>
        </div>
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
