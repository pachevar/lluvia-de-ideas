import { useState, useEffect } from 'react';
import { 
  type AdminTabType, 
  PILLAR_NAV_CATEGORIES, 
  OPERATIONAL_NAV_CATEGORIES,
  ADMIN_NAV_CATEGORIES, 
  PROJECT_PILLARS,
  type AdminCategory 
} from './adminNavConfig';
import './AdminSidebar.css';

interface AdminSidebarProps {
  userEmail: string | null;
  activeAdminTab: AdminTabType;
  setActiveAdminTab: (tab: AdminTabType) => void;
  handleResetConfig: () => void;
  saving: boolean;
  onBackToPortal: () => void;
  handleLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const STORAGE_KEY = 'admin_sidebar_expanded_cats';

export default function AdminSidebar({
  userEmail,
  activeAdminTab,
  setActiveAdminTab,
  handleResetConfig,
  saving,
  onBackToPortal,
  handleLogout,
  isCollapsed = false,
  onToggleCollapse
}: AdminSidebarProps) {
  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Accordion state with localStorage persistence
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading sidebar expanded state:', e);
    }
    // Default: Keep all pillars expanded initially for easy discovery
    const init: Record<string, boolean> = {};
    ADMIN_NAV_CATEGORIES.forEach(cat => {
      init[cat.id] = true;
    });
    return init;
  });

  // Keep category containing active tab open when active tab changes
  useEffect(() => {
    const parentCat = ADMIN_NAV_CATEGORIES.find(c => c.items.some(it => it.id === activeAdminTab));
    if (parentCat && !expandedCategories[parentCat.id]) {
      setExpandedCategories(prev => {
        const next = { ...prev, [parentCat.id]: true };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }
  }, [activeAdminTab]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = { ...prev, [catId]: !prev[catId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    ADMIN_NAV_CATEGORIES.forEach(c => { all[c.id] = true; });
    setExpandedCategories(all);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCollapseAll = () => {
    const none: Record<string, boolean> = {};
    // Keep active tab's parent open so user doesn't lose current work
    const activeParent = ADMIN_NAV_CATEGORIES.find(c => c.items.some(it => it.id === activeAdminTab));
    if (activeParent) {
      none[activeParent.id] = true;
    }
    setExpandedCategories(none);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(none));
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickJumpPillar = (targetTab: AdminTabType, categoryId: string) => {
    setExpandedCategories(prev => {
      const next = { ...prev, [categoryId]: true };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    setActiveAdminTab(targetTab);
  };

  // Filter query
  const query = searchTerm.toLowerCase().trim();

  // Helper renderer for a category accordion
  const renderCategoryAccordion = (cat: AdminCategory, isPillarCategory: boolean) => {
    const filteredItems = query 
      ? cat.items.filter(item => 
          item.label.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.keywords.some(k => k.toLowerCase().includes(query))
        )
      : cat.items;

    if (query && filteredItems.length === 0) return null;

    const isExpanded = query ? true : !!expandedCategories[cat.id];
    const hasActiveChild = cat.items.some(it => it.id === activeAdminTab);

    return (
      <div 
        key={cat.id} 
        className={`admin-sidebar-category ${isPillarCategory ? 'is-project-pillar' : 'is-operational'} ${hasActiveChild ? 'has-active-child' : ''}`}
        style={cat.badgeColor ? { '--category-accent': cat.badgeColor } as React.CSSProperties : undefined}
      >
        <button 
          type="button"
          className="admin-sidebar-category-trigger"
          onClick={() => toggleCategory(cat.id)}
          aria-expanded={isExpanded}
        >
          <div className="cat-header-left">
            <span className="cat-icon-badge">{cat.icon}</span>
            <div className="cat-title-stack">
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
          </div>
          <div className="cat-header-right">
            <span className="cat-items-count" title={`${filteredItems.length} herramientas disponibles`}>
              {filteredItems.length}
            </span>
            <span className={`cat-arrow ${isExpanded ? 'rotated' : ''}`}>▾</span>
          </div>
        </button>

        {isExpanded && (
          <div className="admin-sidebar-category-items animate-slide-down">
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
  };

  return (
    <aside className={`admin-sidebar card-glass ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header Marca Gerencia con Toggle */}
      <div className="admin-brand-header">
        <div className="admin-brand-top-row">
          <span className="admin-brand-icon">⚙️</span>
          <div className="admin-brand-text-box">
            <h3>Panel de Gerencia</h3>
            <span className="admin-user-email">{userEmail || 'Editorial Lluvia de Ideas'}</span>
          </div>
          {onToggleCollapse && (
            <button 
              type="button" 
              className="admin-collapse-toggle-btn"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
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

          {/* Acciones de acordeón: Expandir/Colapsar Todo */}
          <div className="admin-accordion-actions">
            <span className="admin-menu-section-caption">Herramientas</span>
            <div className="admin-accordion-btn-group">
              <button 
                type="button" 
                className="admin-accordion-ctrl-btn"
                onClick={handleExpandAll}
                title="Expandir todas las categorías"
              >
                Expandir Todo
              </button>
              <span className="admin-accordion-divider">|</span>
              <button 
                type="button" 
                className="admin-accordion-ctrl-btn"
                onClick={handleCollapseAll}
                title="Colapsar todas las categorías"
              >
                Colapsar Todo
              </button>
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
                <optgroup label="🏛️ Proyectos Pilares">
                  {PILLAR_NAV_CATEGORIES.flatMap(c => c.items).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🛠️ Operaciones & Gestión">
                  {OPERATIONAL_NAV_CATEGORIES.flatMap(c => c.items).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <span className="admin-nav-select-arrow">▼</span>
            </div>
          </div>

          {/* Menú por Categorías y Acordeón */}
          <nav className="admin-nav-menu">
            {/* SECCIÓN 1: 🏛️ PROYECTOS PILARES (DESPLEGABLES) */}
            <div className="admin-nav-section-group admin-pillars-section">
              <div className="admin-nav-group-header">
                <span className="group-header-badge">🏛️ PILARES EDUCATIVOS</span>
                <span className="group-header-sub">4 Núcleos</span>
              </div>
              <div className="admin-categories-stack">
                {PILLAR_NAV_CATEGORIES.map(cat => renderCategoryAccordion(cat, true))}
              </div>
            </div>

            {/* SECCIÓN 2: 🛠️ OPERACIONES & GESTIÓN */}
            <div className="admin-nav-section-group admin-operations-section">
              <div className="admin-nav-group-header">
                <span className="group-header-badge">🛠️ OPERACIONES & PORTAL</span>
                <span className="group-header-sub">Soporte</span>
              </div>
              <div className="admin-categories-stack">
                {OPERATIONAL_NAV_CATEGORIES.map(cat => renderCategoryAccordion(cat, false))}
              </div>
            </div>
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
              🔄 Restaurar Valores
            </button>

            <div className="divider-h"></div>

            <button type="button" className="btn btn-outline btn-sm" onClick={onBackToPortal}>
              🌐 Ir al Portal Público
            </button>

            <button type="button" className="btn btn-danger btn-sm btn-logout" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </>
      )}

      {/* Vista condensada cuando está colapsado */}
      {isCollapsed && (
        <div className="admin-sidebar-condensed-view">
          <div className="condensed-pillars">
            {PROJECT_PILLARS.map(pillar => {
              const correspondingCat = ADMIN_NAV_CATEGORIES.find(c => c.projectPillar === pillar.id);
              const isAnyItemActive = correspondingCat?.items.some(it => it.id === activeAdminTab);
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => {
                    handleQuickJumpPillar(pillar.targetTab, correspondingCat?.id || '');
                    if (onToggleCollapse) onToggleCollapse();
                  }}
                  className={`condensed-icon-btn ${isAnyItemActive ? 'active' : ''}`}
                  title={`${pillar.title}: Haz clic para abrir`}
                  style={{ '--pillar-color': pillar.color } as React.CSSProperties}
                >
                  {pillar.icon}
                </button>
              );
            })}
          </div>

          <div className="condensed-footer">
            <button 
              type="button" 
              className="condensed-icon-btn" 
              onClick={onBackToPortal}
              title="Ir al Portal Público"
            >
              🌐
            </button>
            <button 
              type="button" 
              className="condensed-icon-btn danger" 
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              🚪
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
