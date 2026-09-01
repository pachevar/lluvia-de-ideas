import React, { useState, useEffect } from 'react';
import { soundEffects } from '../utils/soundEffects';

interface SoundToggleProps {
  className?: string;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = useState(() => soundEffects.isMuted());

  useEffect(() => {
    const unsubscribe = soundEffects.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.playClick();
    }
  };

  return (
    <button
      className={`sound-toggle-btn ${isMuted ? 'muted' : 'active'} ${className}`}
      onClick={handleToggle}
      title={isMuted ? 'Activar sonido del portal' : 'Silenciar sonido del portal'}
      aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: isMuted ? 'rgba(30, 41, 59, 0.85)' : 'linear-gradient(135deg, #0284c7, #38bdf8)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        cursor: 'pointer',
        boxShadow: isMuted ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 16px rgba(56, 189, 248, 0.4)',
        transition: 'all 0.25s ease',
        position: 'relative'
      }}
    >
      <span>{isMuted ? '🔇' : '🔊'}</span>
    </button>
  );
};

export default SoundToggle;
