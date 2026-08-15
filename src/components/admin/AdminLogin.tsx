import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

interface AdminLoginProps {
  onBackToPortal: () => void;
}

export default function AdminLogin({ onBackToPortal }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      console.error("Login error:", err);
      setLoginError('Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoginError('');
    setResetMessage('');
    if (!email) {
      setLoginError('Por favor, ingresa tu correo electrónico en el campo superior para enviarte el enlace de recuperación.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('¡Enlace de recuperación enviado! Revisa tu correo (incluso en spam).');
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code;
      console.error("Reset password error:", err);
      if (errorCode === 'auth/user-not-found') {
        setLoginError('No existe ningún usuario registrado con este correo.');
      } else {
        setLoginError('Ocurrió un error al enviar el correo de recuperación.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card card-glass animate-fade-in">
        <div className="login-header">
          <span className="login-logo-emoji">🔑</span>
          <h2>Panel de Gerencia</h2>
          <p>Ingresa tus credenciales de administrador para configurar el portal.</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Correo Electrónico</label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="ejemplo@lluviadeideaseditorial.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {loginError && <div className="login-error-alert">{loginError}</div>}
          {resetMessage && (
            <div className="login-success-alert" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
              {resetMessage}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-large" disabled={loginLoading || resetLoading}>
            {loginLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
          
          <button 
            type="button" 
            className="btn-link" 
            onClick={handleResetPassword}
            disabled={loginLoading || resetLoading}
            style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline', alignSelf: 'center', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontWeight: 650, display: 'block', width: '100%', textAlign: 'center' }}
          >
            {resetLoading ? 'Enviando enlace...' : '¿Olvidaste tu contraseña? Recuperar 🔑'}
          </button>
        </form>
        
        <button className="btn btn-secondary btn-sm back-to-site-btn" onClick={onBackToPortal}>
          ⬅ Volver al Sitio Público
        </button>
      </div>
    </div>
  );
}
