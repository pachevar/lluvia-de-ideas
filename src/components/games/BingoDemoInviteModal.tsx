import React, { useState } from 'react';

interface BingoDemoInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  playersCount: number;
  onStartNow: () => void;
  isStarting?: boolean;
}

export const BingoDemoInviteModal: React.FC<BingoDemoInviteModalProps> = ({
  isOpen,
  onClose,
  playersCount,
  onStartNow,
  isStarting = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Enlace directo al proceso de boletos con la partida de prueba preseleccionada
  const inviteUrl = `${window.location.origin}/juegos/bingo/boletos?scheduledGame=demo-practice-game`;
  const inviteMessage = `¡Hola! 🎟️ Te invito a probar el Bingo Digital de Bingotenango gratis conmigo. Entra a este enlace para sacar tu cartón de prueba y jugar en directo: ${inviteUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("No se pudo copiar al portapapeles:", e);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent('¡Hola! 🎟️ Te invito a probar el Bingo Digital de Bingotenango gratis conmigo. Entra para jugar en directo:')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const targetCount = 5;
  const currentCount = Math.max(1, playersCount);
  const progressPercent = Math.min(100, (currentCount / targetCount) * 100);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(5, 3, 14, 0.88)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.98) 0%, rgba(10, 8, 22, 0.99) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        borderRadius: '24px',
        padding: '28px 24px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.25)',
        position: 'relative'
      }}>
        {/* Botón Cerrar (X) */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.2rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Cerrar modal"
        >
          ✕
        </button>

        {/* Icono Cabecera */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '2px solid rgba(56, 189, 248, 0.5)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '14px',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
        }}>
          👥
        </div>

        {/* Insignia Superior */}
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-gamer)',
          fontSize: '0.78rem',
          color: '#38bdf8',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          SALA DE PRUEBA EN VIVO
        </span>

        {/* Título Principal */}
        <h2 style={{
          fontFamily: 'var(--font-gamer)',
          fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)',
          color: '#ffffff',
          margin: '0 0 8px 0',
          letterSpacing: '0.5px'
        }}>
          ¡Invita a 4 Amigos para Probar!
        </h2>

        {/* Explicación Amigable */}
        <p style={{
          color: '#cbd5e1',
          fontSize: '0.84rem',
          lineHeight: '1.45',
          margin: '0 auto 18px',
          maxWidth: '380px'
        }}>
          Para experimentar la emoción del bingo interactivo en tiempo real, <strong>invita a 4 jugadores más</strong> a la sala con tu enlace. La tómbola empezará a girar y cantar bolas automáticamente para todos.
        </p>

        {/* BARRA DE PROGRESO DE JUGADORES (X / 5) */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>
              Jugadores en sala:
            </span>
            <span style={{
              fontFamily: 'var(--font-gamer)',
              fontSize: '0.95rem',
              color: currentCount >= targetCount ? '#34d399' : '#38bdf8',
              letterSpacing: '1px'
            }}>
              {currentCount} de {targetCount} {currentCount >= targetCount ? '🎉 ¡LISTOS!' : 'conectados'}
            </span>
          </div>

          {/* Barra de llenado */}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '99px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: currentCount >= targetCount 
                ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' 
                : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              borderRadius: '99px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)'
            }} />
          </div>
        </div>

        {/* BOTONES DE COMPARTIR DIRECTO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-gamer)',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 18px rgba(34, 197, 94, 0.45)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            Invitar por WhatsApp
          </button>

          {/* Fila secundaria: Telegram y Copiar */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleShareTelegram}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(34, 158, 217, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                color: '#38bdf8',
                fontFamily: 'var(--font-gamer)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>✈️</span>
              Telegram
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '12px',
                background: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${copied ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                color: copied ? '#34d399' : '#e2e8f0',
                fontFamily: 'var(--font-gamer)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{copied ? '✓' : '📋'}</span>
              {copied ? '¡Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* DIVISOR CON OPCIÓN DE INICIO RÁPIDO */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={onStartNow}
            disabled={isStarting}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#ffffff',
              fontFamily: 'var(--font-gamer)',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>⚡</span>
            {isStarting ? 'Iniciando tómbola...' : 'Iniciar Prueba Ahora Mismo'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '6px',
              textDecoration: 'underline'
            }}
          >
            Ver mi cartón mientras llegan
          </button>
        </div>
      </div>
    </div>
  );
};
