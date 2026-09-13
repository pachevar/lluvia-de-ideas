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

  if (!isOpen) return null;

  const handleReclaim = async () => {
    sutzAudio.playClick();
    if (!user) return;
    try {
      const studentName = userProfile?.displayName || user.displayName || 'Estudiante Explorador';
      await reclaimSutzSession(user.uid, studentName, user.email);
      sutzAudio.playSuccess();
      onSessionReclaimed();
    } catch (err) {
      console.error('Error al reclamar la sesión de Sutz:', err);
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
      background: 'rgba(3, 7, 18, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'linear-gradient(165deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(239, 68, 68, 0.25)',
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
          margin: '0 0 20px 0',
          fontSize: '0.86rem',
          lineHeight: 1.55,
          color: '#cbd5e1'
        }}>
          Tu cuenta de estudiante ha iniciado sesión en Sutz desde otro navegador o dispositivo. Por seguridad escolar y para evitar pérdida de Jade y pergaminos, <strong>solo se permite una sesión activa</strong> a la vez.
        </p>

        {remoteSession?.userAgent && (
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '22px',
            fontSize: '0.76rem',
            color: '#94a3b8',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '2px' }}>Dispositivo conectado:</div>
            <div style={{ wordBreak: 'break-all' }}>{remoteSession.userAgent}</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleReclaim}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0284c7 50%, #10b981 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)'
            }}
          >
            ⚡ Reclamar Control Aquí (Cerrar la otra sesión)
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
