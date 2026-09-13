import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import './SutzAuthGateModal.css';

interface SutzAuthGateModalProps {
  isOpen: boolean;
}

export const SutzAuthGateModal: React.FC<SutzAuthGateModalProps> = ({ isOpen }) => {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    sutzAudio.playClick();

    try {
      if (mode === 'login') {
        if (!email || !password) throw new Error('Por favor completa todos los campos.');
        await login(email, password);
        sutzAudio.playSuccess();
      } else if (mode === 'register') {
        if (!email || !password || !name) throw new Error('Completa tu nombre y datos de acceso.');
        if (password !== confirmPassword) throw new Error('Las contraseñas no coinciden.');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        await register(email, password, name, 'student');
        sutzAudio.playSuccess();
      } else if (mode === 'forgot') {
        if (!email) throw new Error('Ingresa tu correo para recuperar tu contraseña.');
        await resetPassword(email);
        setMessage('Te hemos enviado un enlace a tu correo para restablecer tu contraseña.');
        sutzAudio.playReward();
      }
    } catch (err: unknown) {
      sutzAudio.playError();
      const code = (err as { code?: string }).code;
      const msg = (err as { message?: string }).message;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Selecciona "Ya tengo cuenta".');
      } else if (code === 'auth/weak-password') {
        setError('La contraseña debe ser de al menos 6 caracteres.');
      } else {
        setError(msg || 'Ocurrió un error al procesar tu acceso.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    sutzAudio.playClick();
    try {
      await loginWithGoogle();
      sutzAudio.playSuccess();
    } catch (err: unknown) {
      sutzAudio.playError();
      const code = (err as { code?: string }).code;
      if (code !== 'auth/popup-closed-by-user') {
        setError('Error al ingresar con Google. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExitToHome = () => {
    sutzAudio.playClick();
    navigate('/');
  };

  return (
    <div className="sutz-auth-gate-overlay">
      <div className="sutz-auth-gate-card">
        {/* Banner de Cabecera Gamer */}
        <div className="sutz-auth-gate-header">
          <div className="sutz-auth-gate-badge">PORTAL DEL ESTUDIANTE MAYA</div>
          <h2 className="sutz-auth-gate-title">🌌 Sutz: Mundo Virtual</h2>
          <p className="sutz-auth-gate-desc">
            Para explorar los códices ancestrales, sincronizar tu Jade y coordinar misiones con tus compañeros, debes identificarte con tu sesión única de estudiante.
          </p>
        </div>

        {/* Selector de Modos */}
        <div className="sutz-auth-gate-tabs">
          <button 
            type="button" 
            className={`sutz-gate-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            className={`sutz-gate-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            Registrar Estudiante
          </button>
        </div>

        {error && (
          <div className="sutz-gate-alert sutz-gate-alert-error">
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div className="sutz-gate-alert sutz-gate-alert-success">
            ✅ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sutz-gate-form">
          {mode === 'register' && (
            <div className="sutz-gate-field">
              <label>Nombre Completo o Alias de Estudiante</label>
              <input 
                type="text" 
                placeholder="Ej. Balam Quitzé" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="sutz-gate-field">
            <label>Correo Electrónico Escolar o Personal</label>
            <input 
              type="email" 
              placeholder="estudiante@escuela.edu" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {mode !== 'forgot' && (
            <div className="sutz-gate-field">
              <div className="sutz-gate-label-row">
                <label>Contraseña</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    className="sutz-gate-link-btn" 
                    onClick={() => { setMode('forgot'); setError(null); }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="sutz-gate-password-wrap">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Mínimo 6 caracteres" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className="sutz-gate-show-pwd" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="sutz-gate-field">
              <label>Confirmar Contraseña</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Repite tu contraseña" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          <button 
            type="submit" 
            className="sutz-gate-submit-btn" 
            disabled={loading}
          >
            {loading ? 'Entrando a Sutz...' : mode === 'login' ? '🚀 Entrar a la Expedición Sutz' : mode === 'register' ? '⭐ Crear Cuenta y Comenzar' : 'Enviar Enlace de Recuperación'}
          </button>

          {mode === 'forgot' && (
            <button 
              type="button" 
              className="sutz-gate-secondary-btn" 
              onClick={() => { setMode('login'); setMessage(null); }}
            >
              Volver a Iniciar Sesión
            </button>
          )}
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="sutz-gate-divider">
              <span>o entra con</span>
            </div>

            <button 
              type="button" 
              className="sutz-gate-google-btn" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Continuar con Google
            </button>
          </>
        )}

        <div className="sutz-gate-footer">
          <button 
            type="button" 
            className="sutz-gate-exit-btn" 
            onClick={handleExitToHome}
          >
            ← Salir al Portal de Editorial Lluvia de Ideas
          </button>
        </div>
      </div>
    </div>
  );
};
