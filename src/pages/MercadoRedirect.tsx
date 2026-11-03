import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { CONTACT, EXTERNAL_STORE_URL } from '../constants';
import { soundEffects } from '../utils/soundEffects';

export default function MercadoRedirect() {
  const navigate = useNavigate();

  // Si ya se configuró la URL externa, redirigir automáticamente
  useEffect(() => {
    if (EXTERNAL_STORE_URL && EXTERNAL_STORE_URL.trim() !== '') {
      window.location.href = EXTERNAL_STORE_URL;
    }
  }, []);

  return (
    <div className="mercado-redirect-page animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 50% 20%, #0f172a 0%, #030712 100%)',
      color: '#f8fafc',
      fontFamily: 'Outfit, system-ui, sans-serif'
    }}>
      <LandingTopBar slogan="Mercado Educativo & Tienda Oficial" showHomeButton />

      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '620px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(2, 132, 199, 0.15)'
        }}>
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 4px 12px rgba(2, 132, 199, 0.4))'
          }}>
            🛒
          </div>

          <span style={{
            display: 'inline-block',
            padding: '0.35rem 0.85rem',
            background: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '9999px',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            Plataforma Independiente
          </span>

          <h1 style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            marginBottom: '0.85rem',
            color: '#f8fafc',
            lineHeight: 1.2
          }}>
            Tienda en Línea & Mercado Pedagógico
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '1.02rem',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            Nuestra tienda oficial ahora opera en una aplicación dedicada de alta velocidad para pedidos de cuentos, juegos de mesa, kits STEAM y material didáctico.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            alignItems: 'center'
          }}>
            {EXTERNAL_STORE_URL ? (
              <a
                href={EXTERNAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playClick()}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.9rem 1.5rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Ir a la Tienda Volckan</span>
                <span>↗</span>
              </a>
            ) : (
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEffects.playClick()}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.9rem 1.5rem',
                  borderRadius: '12px',
                  background: '#25D366',
                  color: '#072e14',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Hacer Pedido por WhatsApp</span>
                <span>💬</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                navigate('/libros');
              }}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>📖 Ver Libros y Cuentos del Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                navigate('/');
              }}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              ← Volver al Portal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
