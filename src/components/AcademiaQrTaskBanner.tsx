// src/components/AcademiaQrTaskBanner.tsx
// Banner inteligente visible cuando el estudiante ingresa a SUTZ con un enlace de AcademiaQR.

import React, { useState, useEffect } from 'react';
import { 
  detectAndStoreAcademiaQrHandshake, 
  reportChallengeCompletion, 
  returnToAcademiaQr,
  clearAcademiaQrHandshake,
  type AcademiaQrHandshake,
  type AcademiaQrCompletionPayload 
} from '../services/academiaqrSyncService';

export const AcademiaQrTaskBanner: React.FC = () => {
  const [handshake, setHandshake] = useState<AcademiaQrHandshake | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [completion, setCompletion] = useState<AcademiaQrCompletionPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const hs = detectAndStoreAcademiaQrHandshake();
    if (hs) {
      setHandshake(hs);
    }

    const handleCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<AcademiaQrCompletionPayload>;
      if (customEvent.detail) {
        setCompletion(customEvent.detail);
      }
    };

    window.addEventListener('academiaqr:challenge_completed', handleCompleted);
    return () => {
      window.removeEventListener('academiaqr:challenge_completed', handleCompleted);
    };
  }, []);

  if (!handshake) return null;

  const handleSimulateFinish = async () => {
    setIsSubmitting(true);
    try {
      const result = await reportChallengeCompletion({
        percentage: 100,
        feedback: 'Reto interactivo resuelto con éxito en SUTZ'
      });
      if (result) {
        setCompletion(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    clearAcademiaQrHandshake();
    setHandshake(null);
  };

  return (
    <aside 
      className={`academiaqr-task-banner card-glass animate-fade-in ${isMinimized ? 'minimized' : ''} ${completion ? 'completed-glow' : ''}`}
      aria-label="Notificación de tarea escolar AcademiaQR"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        maxWidth: isMinimized ? '280px' : '440px',
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(12px)',
        border: completion ? '2px solid #10b981' : '2px solid #8b5cf6',
        borderRadius: '16px',
        padding: '14px 18px',
        color: '#f8fafc',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMinimized ? 0 : '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{completion ? '✅' : '🎓'}</span>
          <strong style={{ fontSize: '13px', letterSpacing: '0.5px', color: completion ? '#34d495' : '#c084fc', textTransform: 'uppercase' }}>
            {completion ? 'Reto Registrado' : 'Tarea AcademiaQR'}
          </strong>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            type="button" 
            onClick={() => setIsMinimized(!isMinimized)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', padding: '2px 6px' }}
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? '🔼' : '🔽'}
          </button>
          <button 
            type="button" 
            onClick={handleDismiss}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', padding: '2px 6px' }}
            title="Cerrar vinculación"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div style={{ fontSize: '12.5px', lineHeight: '1.4', color: '#e2e8f0', marginBottom: '12px' }}>
            {completion ? (
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#6ee7b7', fontWeight: 600 }}>
                  ¡Felicidades, {handshake.studentName || 'Estudiante'}!
                </p>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1' }}>
                  Tu calificación de <strong>{completion.score} / {completion.maxScore} pts</strong> ({completion.percentage}%) fue transmitida a tu maestro en AcademiaQR.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                  {handshake.studentName || 'Estudiante'} · {handshake.schoolId}
                </p>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                  Asignación: <span style={{ color: '#a78bfa' }}>{handshake.assignmentId}</span> (Valor: {handshake.maxScore} pts). Resuelve las actividades en SUTZ para sincronizar tu nota.
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!completion ? (
              <button
                type="button"
                onClick={handleSimulateFinish}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {isSubmitting ? 'Registrando...' : '✨ Registrar Conclusión'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={returnToAcademiaQr}
              style={{
                flex: 1,
                background: completion ? '#059669' : 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ↩ Volver a AcademiaQR
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default AcademiaQrTaskBanner;
