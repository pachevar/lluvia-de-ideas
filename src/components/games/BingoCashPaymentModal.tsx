import React from 'react';
import { createPortal } from 'react-dom';
import type { BingoCard, BingoScheduledGame } from '../../types';

interface BingoCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCard: BingoCard | null;
  playerName: string;
  setPlayerName: (name: string) => void;
  playerPhone: string;
  setPlayerPhone: (phone: string) => void;
  tierId: 'tier-10' | 'tier-25' | 'tier-50' | 'tier-100';
  setTierId: (tier: 'tier-10' | 'tier-25' | 'tier-50' | 'tier-100') => void;
  amountQ: number;
  setAmountQ: (amount: number) => void;
  scheduledGameId: string;
  setScheduledGameId: (id: string) => void;
  scheduledGamesList: BingoScheduledGame[];
  isSaving: boolean;
  onConfirm: (e: React.FormEvent) => void;
}

export const BingoCashPaymentModal: React.FC<BingoCashPaymentModalProps> = ({
  isOpen,
  onClose,
  targetCard,
  playerName,
  setPlayerName,
  playerPhone,
  setPlayerPhone,
  tierId,
  setTierId,
  amountQ,
  setAmountQ,
  scheduledGameId,
  setScheduledGameId,
  scheduledGamesList,
  isSaving,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="player-modal-overlay animate-fade-in"
      style={{ zIndex: 999999, background: 'rgba(5, 3, 15, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        className="player-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: '#22c55e',
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.35), 0 20px 60px rgba(0,0,0,0.8)',
          maxWidth: '520px',
          width: '92%',
          background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.98) 0%, rgba(10, 8, 22, 0.99) 100%)',
          borderRadius: '20px',
          padding: '28px 24px',
          textAlign: 'left',
        }}
      >
        {/* Header del Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '1.8rem',
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid #22c55e',
                borderRadius: '12px',
                padding: '6px',
              }}
            >
              💵
            </span>
            <div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-gamer)',
                  color: '#fff',
                  margin: 0,
                  letterSpacing: '0.5px',
                }}
              >
                {targetCard ? 'COBRO EN EFECTIVO Y ENVÍO DE LINK' : 'NUEVO COBRO EN EFECTIVO (TAQUILLA)'}
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: 'bold' }}>
                {targetCard ? `Cartón ID #${targetCard.id}` : 'Emisión de Pase Único Oficial'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isSaving) onClose();
            }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Aviso Informativo de Seguridad */}
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🛡️</span>
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
            <strong style={{ color: '#4ade80' }}>Regla de Taquilla:</strong> Solo se emitirá un enlace oficial por cobro confirmado. Al registrar este pago, el enlace único se abrirá automáticamente en WhatsApp para entregarse al jugador.
          </p>
        </div>

        {/* Formulario de Cobro */}
        <form onSubmit={onConfirm}>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                color: '#cbd5e1',
                fontWeight: 'bold',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              👤 Nombre o Nickname del Jugador *
            </label>
            <input
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej. Neto / Carlos Méndez"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                color: '#cbd5e1',
                fontWeight: 'bold',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              📱 WhatsApp del Jugador (8 dígitos) *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#4ade80',
                  fontWeight: 'bold',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                }}
              >
                🇬🇹 +502
              </span>
              <input
                type="tel"
                required
                value={playerPhone}
                onChange={(e) => setPlayerPhone(e.target.value)}
                placeholder="36135616"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                🎟️ Categoría del Cartón
              </label>
              <select
                value={tierId}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setTierId(val);
                  const tierDefaultPrices: Record<string, number> = {
                    'tier-10': 10,
                    'tier-25': 25,
                    'tier-50': 50,
                    'tier-100': 100,
                  };
                  setAmountQ(tierDefaultPrices[val] || 10);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  background: 'rgba(10, 5, 20, 0.95)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="tier-10">🥉 Bronce — 1 Cartón (Q10)</option>
                <option value="tier-25">🥈 Plata — 3 Cartones (Q25)</option>
                <option value="tier-50">🥇 Oro — 7 Cartones (Q50)</option>
                <option value="tier-100">💎 Diamante VIP — 15 Cartones (Q100)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                💵 Monto Cobrado (Q) *
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#4ade80',
                    fontWeight: 'bold',
                  }}
                >
                  Q
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  value={amountQ}
                  onChange={(e) => setAmountQ(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 30px',
                    borderRadius: '10px',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#4ade80',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {!targetCard && scheduledGamesList.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: '#cbd5e1',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                📅 Partida Asignada
              </label>
              <select
                value={scheduledGameId}
                onChange={(e) => setScheduledGameId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  background: 'rgba(10, 5, 20, 0.95)',
                  color: '#cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">⚡ Partida Activa / En Vivo en Tómbola</option>
                {scheduledGamesList.map((sg) => (
                  <option key={sg.id} value={sg.id}>
                    📅 {sg.title} ({new Date(sg.scheduledAt).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' })})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#94a3b8',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                cursor: isSaving ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
              }}
            >
              {isSaving ? 'Registrando...' : '✅ Confirmar Cobro y Abrir WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
