import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEditorial from '../assets/logo editorial.png';
import NeuroGuiaSection from '../components/landing/NeuroGuiaSection';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';

export default function Neurociencia() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  return (
    <div className="landing-page-wrapper animate-fade-in">
      
      {/* Top Navigation Bar Header */}
      <header className="landing-top-bar">
        <div className="landing-top-bar-content">
          <div className="landing-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoEditorial} alt="Editorial Lluvia de Ideas" className="landing-logo" />
            <span className="landing-brand-name">Editorial Lluvia de Ideas</span>
          </div>
          <div className="landing-top-links">
            <span className="landing-top-slogan">Ecosistema Educativo</span>
            <div className="landing-top-actions">
              
              <button 
                className="top-btn top-btn-login" 
                onClick={() => navigate('/')}
                title="Volver a la página principal"
              >
                <span className="top-btn-icon">🏠</span>
                <span className="btn-text-full">Inicio</span>
                <span className="btn-text-short">Inicio</span>
              </button>

              <button 
                className="top-btn top-btn-sutz" 
                onClick={() => navigate('/sutz')}
                title="Explorar el mundo virtual Sutz"
              >
                <span className="top-btn-icon">☁️</span>
                <span className="btn-text-full">Probar Sutz</span>
                <span className="btn-text-short">Sutz</span>
              </button>

              {user ? (
                <div className="top-user-menu">
                  <button 
                    className="top-btn top-btn-user"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="top-user-avatar">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Avatar" />
                      ) : (
                        (userProfile?.displayName || user.email || 'U').charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="top-user-name">
                      {userProfile?.displayName || user.email?.split('@')[0] || 'Mi Cuenta'}
                    </span>
                    <span className="top-user-caret">▾</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="top-user-dropdown card-glass animate-fade-in">
                      <div className="dropdown-user-info">
                        <strong>{userProfile?.displayName || 'Usuario'}</strong>
                        <p>{user.email}</p>
                        <span className="user-role-badge">
                          {userProfile?.role === 'teacher' ? '🍎 Docente' : '🎓 Estudiante'}
                        </span>
                      </div>
                      <hr className="dropdown-divider" />
                      <button 
                        className="dropdown-item danger" 
                        onClick={() => { 
                          logout(); 
                          setIsUserMenuOpen(false); 
                        }}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="top-btn top-btn-login" 
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <span className="top-btn-icon">👤</span>
                  <span className="btn-text-full">Iniciar Sesión</span>
                  <span className="btn-text-short">Entrar</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Contenido Principal de Neurociencia */}
      <NeuroGuiaSection />

    </div>
  );
}
