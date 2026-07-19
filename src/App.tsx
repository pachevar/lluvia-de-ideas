import React, { useState, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import logoEditorial from './assets/logo editorial.png';
import './App.css';
import { useCart } from './context/CartContext';

import Home from './pages/Home';
import Gerencia from './Gerencia';
import CotizacionView from './CotizacionView';

// Lazy load other routes
const Laboratorios = React.lazy(() => import('./pages/Laboratorios'));
const Juracan = React.lazy(() => import('./pages/Juracan'));
const Catalogo = React.lazy(() => import('./pages/Catalogo'));
const BingoHub = React.lazy(() => import('./components/games/BingoHub'));
const BingoCardView = React.lazy(() => import('./components/games/BingoCardView'));
const StoryMachine = React.lazy(() => import('./components/games/StoryMachine'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const currentPath = location.pathname;

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileJuegosOpen, setIsMobileJuegosOpen] = useState(false);

  const navigateTo = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isTabActive = (path: string) => currentPath === path;
  const isJuegosActive = currentPath.startsWith('/juegos');

  // Specific check for Gerencia and Cotizacion View
  if (currentPath === '/gerencia') {
    return <Gerencia />;
  }

  if (currentPath.startsWith('/cotizacion/')) {
    const id = currentPath.split('/')[2];
    return <CotizacionView id={id} />;
  }

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
          <img src={logoEditorial} className="brand-logo" alt="Editorial Lluvia de Ideas" />
          <div className="brand-text">
            <h2>Lluvia de Ideas</h2>
            <p>Portal</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav-menu">
          <button 
            className={`nav-link ${isTabActive('/') ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            Inicio
          </button>
          
          <div className="nav-dropdown-container">
            <button 
              className={`nav-link ${isJuegosActive ? 'active' : ''}`}
            >
              Juegos Interactivos ▾
            </button>
            <div className="nav-dropdown">
              <button 
                className={`dropdown-link ${isTabActive('/juegos/bingo') ? 'active' : ''}`}
                onClick={() => navigateTo('/juegos/bingo')}
              >
                🎲 Bingo Virtual
              </button>
              <button 
                className={`dropdown-link ${isTabActive('/juegos/maquina-de-cuentos') ? 'active' : ''}`}
                onClick={() => navigateTo('/juegos/maquina-de-cuentos')}
              >
                🎰 Máquina de Cuentos
              </button>
            </div>
          </div>

          <button 
            className={`nav-link ${isTabActive('/universo-de-juracan') ? 'active' : ''}`}
            onClick={() => navigateTo('/universo-de-juracan')}
          >
            Universo de Juracán
          </button>

          <button 
            className={`nav-link ${isTabActive('/laboratorios') ? 'active' : ''}`}
            onClick={() => navigateTo('/laboratorios')}
          >
            Laboratorios
          </button>

          <button 
            className={`nav-link ${isTabActive('/catalogo') ? 'active' : ''}`}
            onClick={() => navigateTo('/catalogo')}
          >
            Catálogo
          </button>
        </nav>
        
        {/* Right Header Group (Hamburger) */}
        <div className="header-right-group">
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className="mobile-drawer-content card-glass"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
          
          <button 
            className={`mobile-nav-link ${isTabActive('/') ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            🏠 Inicio
          </button>
          
          <div className="mobile-dropdown-section">
            <button 
              className="mobile-nav-link mobile-dropdown-trigger"
              onClick={() => setIsMobileJuegosOpen(!isMobileJuegosOpen)}
            >
              🎮 Juegos Interactivos {isMobileJuegosOpen ? '▴' : '▾'}
            </button>
            {isMobileJuegosOpen && (
              <div className="mobile-submenu">
                <button 
                  className={`mobile-sub-link ${isTabActive('/juegos/bingo') ? 'active' : ''}`}
                  onClick={() => navigateTo('/juegos/bingo')}
                >
                  🎲 Bingo Virtual
                </button>
                <button 
                  className={`mobile-sub-link ${isTabActive('/juegos/maquina-de-cuentos') ? 'active' : ''}`}
                  onClick={() => navigateTo('/juegos/maquina-de-cuentos')}
                >
                  🎰 Máquina de Cuentos
                </button>
              </div>
            )}
          </div>

          <button 
            className={`mobile-nav-link ${isTabActive('/universo-de-juracan') ? 'active' : ''}`}
            onClick={() => navigateTo('/universo-de-juracan')}
          >
            🌪️ Universo de Juracán
          </button>

          <button 
            className={`mobile-nav-link ${isTabActive('/laboratorios') ? 'active' : ''}`}
            onClick={() => navigateTo('/laboratorios')}
          >
            🧪 Laboratorios
          </button>

          <button 
            className={`mobile-nav-link ${isTabActive('/catalogo') ? 'active' : ''}`}
            onClick={() => navigateTo('/catalogo')}
          >
            📚 Catálogo
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        <Suspense fallback={<div className="admin-loading-screen"><div className="spinner"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/juegos/bingo" element={<BingoHub />} />
            <Route path="/juegos/bingo/carton/:cartonId" element={<BingoCardView />} />
            <Route path="/juegos/maquina-de-cuentos" element={<StoryMachine />} />
            <Route path="/universo-de-juracan" element={<Juracan />} />
            <Route path="/laboratorios" element={<Laboratorios />} />
            <Route path="/catalogo" element={<Catalogo />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="app-footer card-glass">
        <p>© 2026 Editorial Lluvia de Ideas. Todos los derechos reservados.</p>
      </footer>

      {/* Floating Action Buttons */}
      <div className="floating-action-buttons">
        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button 
            className="floating-btn floating-cart-btn animate-zoom-in"
            onClick={() => navigateTo('/catalogo')}
            aria-label="Ver carrito"
          >
            <span className="floating-icon">🛒</span>
            <span className="floating-badge">{cart.length}</span>
          </button>
        )}
        
        {/* Floating WhatsApp Button */}
        <div className="whatsapp-floating-wrapper">
          <div className="whatsapp-tooltip">¿Necesitas ayuda? Escríbenos</div>
          <a 
            href="https://wa.me/50246741239" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="floating-btn floating-whatsapp-btn"
            aria-label="Contactar por WhatsApp"
          >
            <span className="floating-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.549 4.142 1.594 5.945L.057 24l6.326-1.666a11.844 11.844 0 005.666 1.442h.005c6.556 0 11.892-5.335 11.895-11.893a11.82 11.82 0 00-3.48-8.413Z" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
