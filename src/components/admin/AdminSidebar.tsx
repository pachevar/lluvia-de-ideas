import { useState } from 'react';
import { type AdminTabType, ADMIN_NAV_CATEGORIES, PROJECT_PILLARS } from './adminNavConfig';
import './AdminSidebar.css';

interface AdminSidebarProps {
  userEmail: string | null;
  activeAdminTab: AdminTabType;
  setActiveAdminTab: (tab: AdminTabType) => void;
  handleResetConfig: () => void;
  saving: boolean;
  onBackToPortal: () => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  userEmail,
  activeAdminTab,
  setActiveAdminTab,
  handleResetConfig,
  saving,
  onBackToPortal,
  handleLogout
}: AdminSidebarProps) {
  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Accordion state: initialize all categories expanded by default
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    ADMIN_NAV_CATEGORIES.forEach(cat => {
      init[cat.id] = true;
    });
    return init;
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleQuickJumpPillar = (targetTab: AdminTabType, categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }));
    setActiveAdminTab(targetTab);
  };

  // Filter items based on search term
  const query = searchTerm.toLowerCase().trim();

  return (
    <aside className="admin-sidebar card-glass">
      {/* Header Marca Gerencia */}
      <div className="admin-brand-header">
        <span className="admin-brand-icon">⚙️</span>
        <div className="admin-brand-text-box">
          <h3>Panel de Gerencia</h3>
          <span className="admin-user-email">{userEmail || 'Editorial Lluvia de Ideas'}</span>
        </div>
      </div>

      {/* Buscador Rápido en Vivo */}
      <div className="admin-search-box">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar herramienta, libro, mapa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        {searchTerm && (
          <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
            ✕
          </button>
        )}
      </div>

      {/* 🌟 DOCK DE ACCESO RÁPIDO: LOS 4 PROYECTOS PILARES */}
      <div className="admin-pillars-quick-dock">
        <div className="admin-pillars-header">
          <span className="admin-pillars-label">Proyectos Pilares</span>
          <span className="admin-pillars-count">4 Fundamentales</span>
        </div>
        <div className="admin-pillars-grid">
          {PROJECT_PILLARS.map(pillar => {
            const correspondingCat = ADMIN_NAV_CATEGORIES.find(c => c.projectPillar === pillar.id);
            const isAnyItemActive = correspondingCat?.items.some(it => it.id === activeAdminTab);

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => handleQuickJumpPillar(pillar.targetTab, correspondingCat?.id || '')}
                className={`admin-pillar-pill ${isAnyItemActive ? 'active' : ''}`}
                style={{
                  '--pillar-color': pillar.color
                } as React.CSSProperties}
                title={`${pillar.title} (${pillar.badge}): ${pillar.description}`}
              >
                <span className="pillar-icon">{pillar.icon}</span>
                <span className="pillar-name">{pillar.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector Móvil de Navegación */}
      <div className="admin-mobile-nav">
        <label htmlFor="admin-nav-select" className="admin-mobile-nav-label">Ir a sección:</label>
        <div className="admin-nav-select-wrapper">
          <select 
            id="admin-nav-select"
            value={activeAdminTab} 
            onChange={(e) => setActiveAdminTab(e.target.value as AdminTabType)}
            className="admin-nav-select"
          >
            {ADMIN_NAV_CATEGORIES.map(cat => (
              <optgroup key={cat.id} label={cat.title}>
                {cat.items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="admin-nav-select-arrow">▼</span>
        </div>
      </div>

      {/* Menú por Categorías y Acordeón */}
      <nav className="admin-nav-menu">
        {ADMIN_NAV_CATEGORIES.map(cat => {
          // Filter category items if searching
          const filteredItems = query 
            ? cat.items.filter(item => 
                item.label.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query) ||
                item.keywords.some(k => k.toLowerCase().includes(query))
              )
            : cat.items;

          // If searching and category has no matching items, hide category
          if (query && filteredItems.length === 0) return null;

          const isExpanded = query ? true : !!expandedCategories[cat.id];
          const hasActiveChild = cat.items.some(it => it.id === activeAdminTab);

          return (
            <div 
              key={cat.id} 
              className={`admin-sidebar-category ${cat.projectPillar ? 'is-project-pillar' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
            >
              <button 
                type="button"
                className="admin-sidebar-category-trigger"
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="cat-header-left">
                  <span className="cat-title">{cat.title}</span>
                  {cat.badge && (
                    <span 
                      className="admin-project-tag-badge"
                      style={{ 
                        backgroundColor: `${cat.badgeColor || '#a855f7'}20`, 
                        color: cat.badgeColor || '#a855f7',
                        borderColor: `${cat.badgeColor || '#a855f7'}40`
                      }}
                    >
                      {cat.badge}
                    </span>
                  )}
                </div>
                <span className="cat-arrow">{isExpanded ? '▴' : '▾'}</span>
              </button>

              {isExpanded && (
                <div className="admin-sidebar-category-items">
                  {filteredItems.map(item => {
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`admin-nav-tab ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveAdminTab(item.id)}
                        title={item.description}
                      >
                        <span className="tab-label">{item.label}</span>
                        {isActive && <span className="active-dot">●</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Acciones del Sidebar */}
      <div className="admin-actions-group">
        <button 
          type="button"
          className="btn btn-secondary btn-admin-reset" 
          onClick={handleResetConfig}
          disabled={saving}
          title="Restaurar toda la configuración a los valores de fábrica"
        >
          🔄 Restaurar Valores por Defecto
        </button>

        <div className="divider-h"></div>

        <button type="button" className="btn btn-outline btn-sm" onClick={onBackToPortal}>
          🌐 Ir al Portal Público
        </button>

        <button type="button" className="btn btn-danger btn-sm btn-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
