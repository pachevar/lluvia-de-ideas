import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError(null);
    setMessage(null);
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Por favor completa todos los campos.');
        }
        await login(email, password);
        onClose();
        resetForm();
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          throw new Error('Por favor completa todos los campos requeridos.');
        }
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        await register(email, password, name, role);
        onClose();
        resetForm();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Por favor ingresa tu correo electrónico.');
        }
        await resetPassword(email);
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      }
    } catch (err: unknown) {
      console.error('Error de autenticación:', err);
      const errorCode = (err as { code?: string }).code;
      const errorMessage = (err as { message?: string }).message;
      let errMsg = 'Ocurrió un error inesperado. Intenta de nuevo.';
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errMsg = 'Correo o contraseña incorrectos.';
      } else if (errorCode === 'auth/email-already-in-use') {
        errMsg = 'Este correo ya está registrado. Intenta iniciar sesión.';
      } else if (errorCode === 'auth/invalid-email') {
        errMsg = 'El correo electrónico ingresado no es válido.';
      } else if (errorCode === 'auth/weak-password') {
        errMsg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (errorMessage) {
        errMsg = errorMessage;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      resetForm();
    } catch (err: unknown) {
      console.error('Error inicio con Google:', err);
      setError('No se pudo completar el inicio de sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Cerrar modal">
          ✕
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-icon-badge">
            {mode === 'login' ? '🔑' : mode === 'register' ? '🎓' : '✉️'}
          </div>
          <h2>
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Crear Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
          </h2>
          <p>
            {mode === 'login' && 'Accede a tu plataforma educativa y herramientas didácticas.'}
            {mode === 'register' && 'Únete a la comunidad de docentes y estudiantes de Lluvia de Ideas.'}
            {mode === 'forgot' && 'Ingresa tu correo para recibir las instrucciones de recuperación.'}
          </p>
        </div>

        {/* Tabs for Login / Register */}
        {mode !== 'forgot' && (
          <div className="auth-modal-tabs">
            <button 
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="auth-alert error animate-shake">
            <span>⚠️ {error}</span>
          </div>
        )}
        {message && (
          <div className="auth-alert success">
            <span>✅ {message}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-input-group">
                <label htmlFor="auth-name">Nombre completo</label>
                <input 
                  id="auth-name"
                  type="text" 
                  placeholder="Ej. María Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label htmlFor="auth-role">Perfil de usuario</label>
                <select 
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                  disabled={loading}
                >
                  <option value="student">Estudiante / Usuario</option>
                  <option value="teacher">Docente / Educator</option>
                </select>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-email">Correo electrónico</label>
            <input 
              id="auth-email"
              type="email" 
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="auth-input-group">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Contraseña</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    className="auth-link-btn"
                    onClick={() => switchMode('forgot')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="auth-password-wrapper">
                <input 
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="auth-input-group">
              <label htmlFor="auth-confirm-pass">Confirmar Contraseña</label>
              <input 
                id="auth-confirm-pass"
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner"></span>
            ) : (
              <>
                {mode === 'login' && 'Entrar al Portal 🚀'}
                {mode === 'register' && 'Crear Mi Cuenta ✨'}
                {mode === 'forgot' && 'Enviar Correo de Recuperación ✉️'}
              </>
            )}
          </button>
        </form>

        {/* Social Sign-In (Google) */}
        {mode !== 'forgot' && (
          <div className="auth-social-section">
            <div className="auth-divider">
              <span>O continúa con</span>
            </div>

            <button 
              type="button" 
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>
          </div>
        )}

        {/* Back to Login link when in Forgot mode */}
        {mode === 'forgot' && (
          <div className="auth-footer-back">
            <button 
              type="button" 
              className="auth-link-btn"
              onClick={() => switchMode('login')}
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
