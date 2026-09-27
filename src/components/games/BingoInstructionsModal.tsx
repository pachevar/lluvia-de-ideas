import React from 'react';
import { createPortal } from 'react-dom';
import { CONTACT } from '../../constants';

interface BingoInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'boletos' | 'canales' | 'jugar' | 'ganar';
  setActiveTab: (tab: 'boletos' | 'canales' | 'jugar' | 'ganar') => void;
  onGoToStore: () => void;
}

export const BingoInstructionsModal: React.FC<BingoInstructionsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onGoToStore,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="bingo-instructions-overlay" onClick={onClose}>
      <div className="bingo-instructions-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bingo-instructions-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📘</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 'bold' }}>
                Guía e Instrucciones de Bingo
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                Bingotenango Oficial
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Tabs de Navegación del Modal */}
        <div className="bingo-instructions-nav">
          <button
            type="button"
            className={`bingo-instructions-tab-btn ${activeTab === 'boletos' ? 'active' : ''}`}
            onClick={() => setActiveTab('boletos')}
          >
            🎟️ 1. Comprar Boletos
          </button>
          <button
            type="button"
            className={`bingo-instructions-tab-btn ${activeTab === 'canales' ? 'active' : ''}`}
            onClick={() => setActiveTab('canales')}
          >
            📲 2. Recibir Cartones
          </button>
          <button
            type="button"
            className={`bingo-instructions-tab-btn ${activeTab === 'jugar' ? 'active' : ''}`}
            onClick={() => setActiveTab('jugar')}
          >
            🎮 3. Jugar en Vivo
          </button>
          <button
            type="button"
            className={`bingo-instructions-tab-btn ${activeTab === 'ganar' ? 'active' : ''}`}
            onClick={() => setActiveTab('ganar')}
          >
            🏆 4. Cantar Bingo
          </button>
        </div>

        {/* Cuerpo del Modal según Pestaña Selección */}
        <div className="bingo-instructions-body">
          {activeTab === 'boletos' && (
            <div>
              <h4 style={{ color: '#38bdf8', marginBottom: '10px', marginTop: 0, fontSize: '1.05rem' }}>
                🎟️ ¿Cómo adquirir tus Boletos de Bingotenango?
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '14px', lineHeight: '1.5' }}>
                Puedes adquirir tus boletos oficiales para las partidas en vivo de forma 100% segura y en Quetzales (GTQ):
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    💳 1. Tienda en Línea (Pago Cifrado con Recurrente)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    Paga al instante con cualquier tarjeta de crédito o débito válida en Guatemala. La entrega de tus cartones es inmediata al validar la compra.
                  </span>
                </div>

                <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#4ade80', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    💵 2. Taquilla Oficial (Efectivo o Transferencia)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    ¿Prefieres pagar en efectivo o transferencia bancaria en Guatemala? Puedes coordinar directamente con el anfitrión de taquilla por WhatsApp para registrar tu pase.
                  </span>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#c084fc', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    👥 3. Modalidad Personal o Para Contactos
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    • <strong>Para mí:</strong> Tus cartones (1 a 3) se cargarán juntos en tu pantalla.<br />
                    • <strong>Para contactos:</strong> Recibes enlaces independientes para repartir individualmente a tus familiares o amigos.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onGoToStore}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  🛒 Ir a la Tienda de Boletos
                </button>
                <a
                  href={`https://wa.me/${CONTACT.whatsappPhone}?text=¡Hola!%20Deseo%20información%20para%20comprar%20boletos%20de%20Bingotenango`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(37, 211, 102, 0.2)',
                    border: '1px solid rgba(37, 211, 102, 0.4)',
                    color: '#25d366',
                    fontWeight: 'bold',
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  💬 Taquilla WhatsApp
                </a>
              </div>
            </div>
          )}

          {activeTab === 'canales' && (
            <div>
              <h4 style={{ color: '#a855f7', marginBottom: '10px', marginTop: 0, fontSize: '1.05rem' }}>
                📲 Entrega Multicanal Instantánea de Cartones
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '14px', lineHeight: '1.5' }}>
                No dependes de un solo canal. Recibe tus cartones donde te sea más fácil y cómodo:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(34, 158, 217, 0.12)', border: '1px solid rgba(34, 158, 217, 0.35)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    ✈️ 1. Bot Oficial de Telegram (@Bingotenangobot)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    Al confirmar tu compra, pulsa <strong>"ABRIR EN TELEGRAM"</strong> y toca <strong>"INICIAR"</strong>. Recibirás tu cartón digital de inmediato.<br />
                    <em>✨ Clientes Frecuentes:</em> Si ya interactuaste con el bot, tus compras futuras se te enviarán <strong>100% en automático a tu chat de Telegram</strong>.
                  </span>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    🔔 2. Notificaciones en Pantalla (Web Push)
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    ¿No usas Telegram? Activa las notificaciones en el botón <strong>"Activar Alertas"</strong> en esta sala. Tu navegador te avisará con sonido cuando la tómbola comience a rodar.
                  </span>
                </div>

                <div style={{ background: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.35)', borderRadius: '12px', padding: '12px 14px' }}>
                  <strong style={{ color: '#25d366', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>
                    💬 3. WhatsApp y Enlace Web Directo
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                    Puedes guardar tu comprobante en WhatsApp con 1 toque o abrir tu enlace en cualquier celular (Chrome, Safari, Edge) sin descargar nada obligatorio.
                  </span>
                </div>
              </div>

              <a
                href="https://t.me/Bingotenangobot"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0088cc 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(0, 136, 204, 0.4)',
                }}
              >
                <span>✈️</span> Probar @Bingotenangobot en Telegram
              </a>
            </div>
          )}

          {activeTab === 'jugar' && (
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '10px', marginTop: 0, fontSize: '1.05rem' }}>
                🎮 ¿Cómo Jugar en Vivo en Bingotenango?
              </h4>
              <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#cbd5e1', margin: '0 0 16px 0', fontSize: '0.84rem', lineHeight: '1.45' }}>
                <li><strong>Ingresa a la Sala:</strong> Abre tu enlace o pase de sesión. Si compraste varios cartones personales, podrás alternar entre ellos en la barra superior.</li>
                <li><strong>Tómbola 3D en Directo:</strong> El Host girará la tómbola y extraerá bolas numeradas del 1 al 75. Cada bola se mostrará en el podio gigante con su letra (<strong>B-I-N-G-O</strong>) y voz oficial en español.</li>
                <li><strong>Marcación Táctil:</strong> Toca la casilla correspondiente en tu cartón digital para marcar tu ficha. La casilla central <strong>⭐</strong> es libre para todos.</li>
                <li><strong>Semáforo Inteligente de Ayuda:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '0.78rem' }}>
                    <span style={{ color: '#4ade80' }}>🟢 Verde: Casilla marcada y bola extraída oficialmente.</span>
                    <span style={{ color: '#f87171' }}>🔴 Rojo Parpadeante: Advertencia de número aún no salido.</span>
                    <span style={{ color: '#38bdf8' }}>🔵 Azul: Número cantado que tienes en tu cartón y aún no marcas.</span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ganar' && (
            <div>
              <h4 style={{ color: '#fbbf24', marginBottom: '10px', marginTop: 0, fontSize: '1.05rem' }}>
                🏆 Formas de Ganar y Cómo Cantar ¡BINGO!
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.84rem', marginBottom: '12px' }}>
                El anfitrión anunciará al inicio de la ronda qué patrón se está jugando:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.82rem', display: 'block' }}>Cartón Lleno</strong>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Las 24 casillas</span>
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.82rem', display: 'block' }}>Línea</strong>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Horizontal o vertical</span>
                </div>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                  <strong style={{ color: '#c084fc', fontSize: '0.82rem', display: 'block' }}>4 Esquinas</strong>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Las 4 puntas</span>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                  <strong style={{ color: '#4ade80', fontSize: '0.82rem', display: 'block' }}>Diagonales (X)</strong>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Extremo a extremo</span>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(30, 27, 75, 0.5) 100%)', border: '1.5px solid rgba(234, 179, 8, 0.45)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
                <strong style={{ color: '#fbbf24', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                  ⚡ El Botón ¡BINGO!
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4', display: 'block' }}>
                  En cuanto completes el patrón requerido, presiona el botón dorado <strong>¡BINGO!</strong>. El sistema validará tu cartón digital en tiempo real con el Host.
                </span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '10px 14px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.78rem', color: '#94a3b8' }}>
                ℹ️ <em>Al confirmarse tu victoria, el anfitrión anunciará tu nickname en la transmisión y te contactará directamente a tu teléfono registrado para la entrega del premio.</em>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
