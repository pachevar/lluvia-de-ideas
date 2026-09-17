import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reclaimSutzSession } from '../../services/sutzSessionService';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import type { SutzSessionData } from '../../services/sutzSessionService';

interface SutzSessionConflictModalProps {
  isOpen: boolean;
  remoteSession: SutzSessionData | null;
  onSessionReclaimed: () => void;
}

export const SutzSessionConflictModal: React.FC<SutzSessionConflictModalProps> = ({
  isOpen,
  remoteSession,
  onSessionReclaimed
}) => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isReclaiming, setIsReclaiming] = React.useState(false);

  if (!isOpen) return null;

  const handleReclaim = async () => {
    if (isReclaiming || !user) return;
    setIsReclaiming(true);
    sutzAudio.playClick();
    try {
      const studentName = userProfile?.displayName || user.displayName || 'Estudiante Explorador';
      await reclaimSutzSession(user.uid, studentName, user.email);
      sutzAudio.playSuccess();
      onSessionReclaimed();
    } catch (err) {
      console.error('Error al reclamar la sesión de Sutz:', err);
    } finally {
      setIsReclaiming(false);
    }
  };

  const handleExit = async () => {
    sutzAudio.playClick();
    await logout();
    navigate('/');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      background: '#080c16fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--sutz-elevation-2, #1e2536)',
        border: '1.5px solid rgba(239, 68, 68, 0.45)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.2)',
        borderRadius: '24px',
        padding: '30px',
        color: '#f8fafc',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de Advertencia */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)'
        }} />

        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px auto',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          ⚠️
        </div>

        <span style={{
          fontSize: '0.7rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#f87171',
          background: 'rgba(239, 68, 68, 0.12)',
          padding: '4px 12px',
          borderRadius: '999px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          Control de Sesión Única Escolar
        </span>

        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '1.35rem',
          fontWeight: 900,
          color: '#ffffff'
        }}>
          Sesión Activa en Otro Dispositivo
        </h3>

        <p style={{
          margin: '0 0 16px 0',
          fontSize: '0.86rem',
          lineHeight: 1.55,
          color: '#cbd5e1'
        }}>
          La cuenta <strong style={{ color: '#ffffff' }}>{user?.email || remoteSession?.email || 'de estudiante'}</strong> ya tiene una sesión abierta en otra pestaña o dispositivo. Por integridad del progreso y seguridad escolar, <strong>solo se permite una sesión activa</strong> por cuenta.
        </p>

        {remoteSession?.userAgent && (
          <div style={{
            background: 'var(--sutz-elevation-1, #151b27)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.76rem',
            color: '#94a3b8',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '2px' }}>Dispositivo conectado:</div>
            <div style={{ wordBreak: 'break-all' }}>{remoteSession.userAgent}</div>
          </div>
        )}

        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '20px',
          fontSize: '0.76rem',
          color: '#bae6fd',
          textAlign: 'left',
          lineHeight: 1.45
        }}>
          💡 <strong>Nota para pruebas:</strong> Si abres dos pestañas en el mismo navegador normal, ambas compartirán la misma cuenta. Para probar con dos correos diferentes a la vez, abre una de las cuentas en una <strong>Ventana de Incógnito</strong> o en otro navegador (Chrome / Firefox / Edge).
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleReclaim}
            disabled={isReclaiming}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: isReclaiming 
                ? 'rgba(2, 132, 199, 0.45)'
                : 'linear-gradient(135deg, #0284c7 0%, #0284c7 50%, #10b981 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 900,
              cursor: isReclaiming ? 'wait' : 'pointer',
              boxShadow: isReclaiming ? 'none' : '0 6px 20px rgba(2, 132, 199, 0.4)',
              opacity: isReclaiming ? 0.75 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isReclaiming ? '⏳ Reclamando control...' : '⚡ Reclamar Control Aquí (Cerrar la otra sesión)'}
          </button>

          <button
            onClick={handleExit}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '14px',
              background: 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🚪 Salir de Sutz
          </button>
        </div>
      </div>
    </div>
  );
};
