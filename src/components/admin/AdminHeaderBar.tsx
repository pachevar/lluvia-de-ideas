import { type AdminTabType, ADMIN_NAV_CATEGORIES } from './adminNavConfig';
import './AdminHeaderBar.css';

interface AdminHeaderBarProps {
  activeTab: AdminTabType;
  saving: boolean;
  saveStatus: { type: 'success' | 'error' | null; message: string };
  handleSaveConfig: () => void;
  onBackToPortal: () => void;
  handleExportBackup?: () => void;
  handleImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AdminHeaderBar({
  activeTab,
  saving,
  saveStatus,
  handleSaveConfig,
  onBackToPortal,
  handleExportBackup,
  handleImportBackup
}: AdminHeaderBarProps) {
  // Find current tab details & category
  let currentCategoryTitle = 'Gerencia';
  let currentItemLabel = 'Configuración';
  let currentItemDesc = 'Administración general del portal';

  for (const cat of ADMIN_NAV_CATEGORIES) {
    const found = cat.items.find(item => item.id === activeTab);
    if (found) {
      currentCategoryTitle = cat.title;
      currentItemLabel = found.label;
      currentItemDesc = found.description;
      break;
    }
  }

  return (
    <header className="admin-header-bar card-glass animate-fade-in">
      <div className="admin-header-left">
        <div className="admin-breadcrumb">
          <span className="breadcrumb-root">⚙️ Gerencia</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-category">{currentCategoryTitle}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{currentItemLabel}</span>
        </div>
        <h2 className="admin-header-title">{currentItemLabel}</h2>
        <p className="admin-header-subtitle">{currentItemDesc}</p>
      </div>

      <div className="admin-header-right">
        {saveStatus.message && (
          <div className={`header-status-badge ${saveStatus.type}`}>
            {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
          </div>
        )}

        <div className="admin-header-actions">
          {handleExportBackup && (
            <button 
              className="btn btn-secondary btn-header-backup"
              onClick={handleExportBackup}
              title="Descargar copia de seguridad de textos, enlaces e imágenes en archivo JSON"
            >
              <span>📥</span>
              <span className="btn-text-backup">Respaldar</span>
            </button>
          )}

          {handleImportBackup && (
            <label 
              className="btn btn-secondary btn-header-backup"
              style={{ cursor: 'pointer', margin: 0 }}
              title="Restaurar respaldo previo desde archivo JSON"
            >
              <span>📤</span>
              <span className="btn-text-backup">Restaurar</span>
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleImportBackup}
                disabled={saving}
              />
            </label>
          )}

          <button 
            className="btn btn-primary btn-save-quick"
            onClick={handleSaveConfig}
            disabled={saving}
            title="Guardar todas las configuraciones del portal en Firestore (Ctrl + S)"
          >
            <span>💾</span>
            <span>{saving ? 'Guardando...' : 'Guardar Todo'}</span>
            <kbd className="save-shortcut">Ctrl+S</kbd>
          </button>

          <button 
            className="btn btn-secondary btn-portal-preview"
            onClick={onBackToPortal}
            title="Ver portal en vivo"
          >
            <span>🌐</span> Ver Portal
          </button>
        </div>
      </div>
    </header>
  );
}
