import React, { useState, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import logoEditorial from './assets/logo editorial.png';
import './App.css';
import { useCart } from './context/CartContext';
import { CONTACT } from './constants';
import PageLoader from './components/PageLoader';
import SoundToggle from './components/SoundToggle';
import { soundEffects } from './utils/soundEffects';

// Lazy load routes to code-split heavy bundles (Gerencia/PDF, cotizaciones, juegos, etc.)
const Home = React.lazy(() => import('./pages/Home'));
const CreatikaHub = React.lazy(() => import('./pages/CreatikaHub'));
const Gerencia = React.lazy(() => import('./Gerencia'));
const CotizacionView = React.lazy(() => import('./CotizacionView'));
const Sutz = React.lazy(() => import('./pages/Sutz'));
const Juracan = React.lazy(() => import('./pages/Juracan'));
const Laboratorios = React.lazy(() => import('./pages/Laboratorios'));
const BingoHub = React.lazy(() => import('./components/games/BingoHub'));
const BingoCardView = React.lazy(() => import('./components/games/BingoCardView'));
const StoryMachine = React.lazy(() => import('./components/games/StoryMachine'));
const ColorTheory = React.lazy(() => import('./pages/ColorTheory'));
const SolarSystem = React.lazy(() => import('./pages/SolarSystem'));
const NumberSequences = React.lazy(() => import('./pages/NumberSequences'));
const CodigoDocente = React.lazy(() => import('./pages/CodigoDocente'));
const CodigoEstudiante = React.lazy(() => import('./pages/CodigoEstudiante'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const NuestrosLibros = React.lazy(() => import('./pages/NuestrosLibros'));
const Neurociencia = React.lazy(() => import('./pages/Neurociencia'));
const ConstruyendoPersonaje = React.lazy(() => import('./pages/ConstruyendoPersonaje'));
const BingoBoletos = React.lazy(() => import('./pages/BingoBoletos'));
const BingoBoletosConfirmacion = React.lazy(() => import('./pages/BingoBoletosConfirmacion'));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const currentPath = location.pathname;

  // Sidebar Gamer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCreatikaOpen, setIsSidebarCreatikaOpen] = useState(true);
  const [isSidebarJuegosOpen, setIsSidebarJuegosOpen] = useState(false);
  const [isSidebar100tekOpen, setIsSidebar100tekOpen] = useState(false);
  const [isSidebarLaboratoriosOpen, setIsSidebarLaboratoriosOpen] = useState(false);

  const navigateTo = (path: string) => {
    soundEffects.playClick();
    navigate(path);
    setIsSidebarOpen(false);
  };

  const isCreatikaActive = currentPath.startsWith('/creatika') || currentPath.includes('codigo-docente') || currentPath.includes('codigo-estudiante');
  const isJuegosActive = currentPath.startsWith('/juegos') && !currentPath.includes('maquina-de-cuentos');
  const is100tekActive = currentPath.startsWith('/100tek') || currentPath.startsWith('/herramientas');
  const isLaboratoriosActive = currentPath.startsWith('/laboratorios');
  const isTabActive = (path: string) => currentPath === path;

  // Specific check for Gerencia and Cotizacion View
  if (currentPath === '/gerencia' || currentPath.startsWith('/gerencia/') || currentPath.startsWith('/gerencia?') || currentPath.startsWith('/gerencia#')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Gerencia />
      </Suspense>
    );
  }

  if (currentPath.startsWith('/cotizacion/')) {
    const id = currentPath.split('/')[2];
    return (
      <Suspense fallback={<PageLoader />}>
        <CotizacionView id={id} />
      </Suspense>
    );
  }

  const isBoletosView = currentPath.includes('/boletos');
  const isBingoCardView = currentPath.includes('/juegos/bingo') || currentPath.includes('/bingo');

  return (
    <div className={`app-container ${isBoletosView ? 'boletos-view-full' : ''}`}>
      {/* Tirador del Menú Lateral (Gamer HUD Trigger) */}
      <button 
        className={`gamer-sidebar-trigger ${isSidebarOpen ? 'open' : ''} ${isBingoCardView || isBoletosView ? 'hide-on-mobile-card' : ''}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        <div className="trigger-glow"></div>
        <span className="trigger-arrow">{isSidebarOpen ? '◀' : '▶'}</span>
        <span className="trigger-text">{isSidebarOpen ? 'CERRAR' : 'MENU'}</span>
      </button>

      {/* Menú Lateral Vertical (Gamer Sidebar) */}
      <aside className={`gamer-sidebar ${isSidebarOpen ? 'open' : ''} ${isBingoCardView || isBoletosView ? 'hide-on-mobile-card' : ''}`}>
        <div className="sidebar-header" onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
          <img src={logoEditorial} className="sidebar-logo" alt="Lluvia de Ideas" />
          <div className="sidebar-brand-text">
            <h3>Lluvia de Ideas</h3>
            <p>Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${isTabActive('/') ? 'active' : ''}`}
            onClick={() => navigateTo('/')}
          >
            <span className="sidebar-icon" aria-hidden="true">🏠</span> Inicio
          </button>

          <button 
            className={`sidebar-link ${isTabActive('/sutz') || isTabActive('/mundo-virtual') ? 'active' : ''}`}
            onClick={() => navigateTo('/sutz')}
          >
            <span className="sidebar-icon" aria-hidden="true">☁️</span> Sutz (Mundo Virtual)
          </button>

          {/* Menú Creatika */}
          <div className={`sidebar-group ${isSidebarCreatikaOpen ? 'open' : ''}`}>
            <button 
              className={`sidebar-group-trigger ${isCreatikaActive ? 'active-parent' : ''}`}
              onClick={() => setIsSidebarCreatikaOpen(!isSidebarCreatikaOpen)}
            >
              <span className="sidebar-icon" aria-hidden="true">✨</span> Creatika {isSidebarCreatikaOpen ? '▴' : '▾'}
            </button>
            <div className="sidebar-submenu">
              <button 
                className={`sidebar-sublink ${isTabActive('/creatika/maquina-de-cuentos') || isTabActive('/juegos/maquina-de-cuentos') ? 'active' : ''}`}
                onClick={() => navigateTo('/creatika/maquina-de-cuentos')}
              >
                🎰 Máquina de Cuentos
              </button>
              <button 
                className={`sidebar-sublink ${isTabActive('/creatika/teoria-del-color') || isTabActive('/100tek/teoria-del-color') || isTabActive('/herramientas/teoria-del-color') ? 'active' : ''}`}
                onClick={() => navigateTo('/creatika/teoria-del-color')}
              >
                🎨 Teoría del Color
              </button>
              <button 
                className={`sidebar-sublink ${isTabActive('/creatika/construyendo-el-personaje') || isTabActive('/construyendo-el-personaje') || isTabActive('/personajes') ? 'active' : ''}`}
                onClick={() => navigateTo('/creatika/construyendo-el-personaje')}
              >
                🎭 Construyendo el Personaje
              </button>
              <button 
                className={`sidebar-sublink ${isTabActive('/creatika/codigo-docente') || isTabActive('/codigo-docente') ? 'active' : ''}`}
                onClick={() => navigateTo('/creatika/codigo-docente')}
              >
                📜 Código Docente
              </button>
              <button 
                className={`sidebar-sublink ${isTabActive('/creatika/codigo-estudiante') || isTabActive('/codigo-estudiante') ? 'active' : ''}`}
                onClick={() => navigateTo('/creatika/codigo-estudiante')}
              >
                🎓 Código del Estudiante
              </button>
            </div>
          </div>
          
          {/* Menú Juegos */}
          <div className={`sidebar-group ${isSidebarJuegosOpen ? 'open' : ''}`}>
            <button 
              className={`sidebar-group-trigger ${isJuegosActive ? 'active-parent' : ''}`}
              onClick={() => setIsSidebarJuegosOpen(!isSidebarJuegosOpen)}
            >
              <span className="sidebar-icon" aria-hidden="true">🎮</span> Juegos {isSidebarJuegosOpen ? '▴' : '▾'}
            </button>
            <div className="sidebar-submenu">
              <button 
                className={`sidebar-sublink ${isTabActive('/juegos/bingo') ? 'active' : ''}`}
                onClick={() => navigateTo('/juegos/bingo')}
              >
                🎲 Bingotenango
              </button>
            </div>
          </div>

          {/* Menú 100tek */}
          <div className={`sidebar-group ${isSidebar100tekOpen ? 'open' : ''}`}>
            <button 
              className={`sidebar-group-trigger ${is100tekActive ? 'active-parent' : ''}`}
              onClick={() => setIsSidebar100tekOpen(!isSidebar100tekOpen)}
            >
              <span className="sidebar-icon" aria-hidden="true">⚡</span> 100tek {isSidebar100tekOpen ? '▴' : '▾'}
            </button>
            <div className="sidebar-submenu">
              <button 
                className={`sidebar-sublink ${isTabActive('/100tek/secuencias-numericas') ? 'active' : ''}`}
                onClick={() => navigateTo('/100tek/secuencias-numericas')}
              >
                🔢 Secuencias Numéricas
              </button>
              <button 
                className={`sidebar-sublink ${isTabActive('/100tek/sistema-solar') || isTabActive('/herramientas/sistema-solar') ? 'active' : ''}`}
                onClick={() => navigateTo('/100tek/sistema-solar')}
              >
                🪐 Sistema Solar
              </button>
            </div>
          </div>

          <button 
            className={`sidebar-link ${isTabActive('/universo-de-juracan') ? 'active' : ''}`}
            onClick={() => navigateTo('/universo-de-juracan')}
          >
            <span className="sidebar-icon" aria-hidden="true">🌪️</span> Universo de Juracán
          </button>

          <div className={`sidebar-group ${isSidebarLaboratoriosOpen ? 'open' : ''}`}>
            <button 
              className={`sidebar-group-trigger ${isLaboratoriosActive ? 'active-parent' : ''}`}
              onClick={() => setIsSidebarLaboratoriosOpen(!isSidebarLaboratoriosOpen)}
            >
              <span className="sidebar-icon" aria-hidden="true">🧪</span> Laboratorios {isSidebarLaboratoriosOpen ? '▴' : '▾'}
            </button>
            <div className="sidebar-submenu">
              <button 
                className={`sidebar-sublink ${isTabActive('/laboratorios/animacion-educativa') || isTabActive('/laboratorios') ? 'active' : ''}`}
                onClick={() => navigateTo('/laboratorios/animacion-educativa')}
              >
                🎬 Animación Educativa
              </button>
            </div>
          </div>

          <button 
            className={`sidebar-link ${isTabActive('/libros') || isTabActive('/nuestros-libros') ? 'active' : ''}`}
            onClick={() => navigateTo('/libros')}
          >
            <span className="sidebar-icon" aria-hidden="true">📖</span> Nuestros Libros
          </button>

          <button 
            className={`sidebar-link ${isTabActive('/neurociencia') ? 'active' : ''}`}
            onClick={() => navigateTo('/neurociencia')}
          >
            <span className="sidebar-icon" aria-hidden="true">🧠</span> Neurociencia Aula
          </button>
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 Lluvia de Ideas</p>
        </div>
      </aside>

      {/* Overlay para cerrar el menú en móviles o haciendo clic fuera */}
      <div 
        className={`gamer-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />


      {/* Main Content Area */}
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sutz" element={<Sutz />} />
            <Route path="/mundo-virtual" element={<Sutz />} />
            <Route path="/neurociencia" element={<Neurociencia />} />
            <Route path="/libros" element={<NuestrosLibros />} />
            <Route path="/nuestros-libros" element={<NuestrosLibros />} />
            <Route path="/cuento/:storyId" element={<NuestrosLibros />} />
            <Route path="/creatika/maquina-de-cuentos" element={<StoryMachine />} />
            <Route path="/creatika/teoria-del-color" element={<ColorTheory />} />
            <Route path="/creatika/construyendo-el-personaje" element={<ConstruyendoPersonaje />} />
            <Route path="/construyendo-el-personaje" element={<ConstruyendoPersonaje />} />
            <Route path="/construyendo-personaje" element={<ConstruyendoPersonaje />} />
            <Route path="/personajes" element={<ConstruyendoPersonaje />} />
            <Route path="/creatika/codigo-docente" element={<CodigoDocente />} />
            <Route path="/codigo-docente" element={<CodigoDocente />} />
            <Route path="/creatika/codigo-estudiante" element={<CodigoEstudiante />} />
            <Route path="/codigo-estudiante" element={<CodigoEstudiante />} />
            <Route path="/juegos/maquina-de-cuentos" element={<StoryMachine />} />
            <Route path="/juegos/bingo" element={<BingoHub />} />
            <Route path="/juegos/bingo/boletos" element={<BingoBoletos />} />
            <Route path="/bingo/boletos" element={<BingoBoletos />} />
            <Route path="/juegos/bingo/boletos/confirmacion" element={<BingoBoletosConfirmacion />} />
            <Route path="/bingo/boletos/confirmacion" element={<BingoBoletosConfirmacion />} />
            <Route path="/juegos/bingo/carton/:cartonId" element={<BingoCardView />} />
            <Route path="/universo-de-juracan" element={<Juracan />} />
            <Route path="/laboratorios" element={<Laboratorios />} />
            <Route path="/laboratorios/:labId" element={<Laboratorios />} />
            <Route path="/animacion-educativa" element={<Laboratorios />} />
            <Route path="/robotica-educativa" element={<Laboratorios />} />
            <Route path="/pensamiento-cientifico" element={<Laboratorios />} />
            <Route path="/creatika" element={<CreatikaHub />} />
            <Route path="/maquina-de-cuentos" element={<StoryMachine />} />
            <Route path="/teoria-del-color" element={<ColorTheory />} />
            <Route path="/bingo" element={<BingoHub />} />
            <Route path="/juegos" element={<BingoHub />} />
            <Route path="/100tek" element={<NumberSequences />} />
            <Route path="/secuencias-numericas" element={<NumberSequences />} />
            <Route path="/sistema-solar" element={<SolarSystem />} />
            <Route path="/gerencia" element={<Gerencia />} />
            <Route path="/gerencia/*" element={<Gerencia />} />
            <Route path="/100tek/secuencias-numericas" element={<NumberSequences />} />
            <Route path="/100tek/teoria-del-color" element={<ColorTheory />} />
            <Route path="/100tek/sistema-solar" element={<SolarSystem />} />
            <Route path="/herramientas/teoria-del-color" element={<ColorTheory />} />
            <Route path="/herramientas/sistema-solar" element={<SolarSystem />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="app-footer card-glass">
        <p>© 2026 Editorial Lluvia de Ideas. Todos los derechos reservados.</p>
      </footer>

      {/* Floating Action Buttons */}
      <div className="floating-action-buttons">
        {/* Floating Sound Toggle */}
        <SoundToggle />

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button 
            className="floating-btn floating-cart-btn animate-zoom-in"
            onClick={() => navigateTo('/libros')}
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
            href={CONTACT.whatsappUrl}
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
