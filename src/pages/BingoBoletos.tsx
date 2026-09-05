import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, limit, onSnapshot, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoGame } from '../types';
import './BingoBoletos.css';

interface CardTier {
  id: string;
  name: string;
  unitPriceQ: number;
  prizeLevel: string;
  badge?: string;
  badgeClass?: string;
  description: string;
  prizeHighlight: string;
  icon: string;
}

const CARD_TIERS: CardTier[] = [
  {
    id: 'tier-10',
    name: 'Cartón Bronce',
    unitPriceQ: 10,
    prizeLevel: 'Premios Estándar',
    description: '1 Cartón oficial para jugar en la ronda de premios básicos y canastas sorpresa.',
    prizeHighlight: 'Canastas de productos, vales escolares y sorpresas.',
    icon: '🥉'
  },
  {
    id: 'tier-25',
    name: 'Cartón Plata',
    unitPriceQ: 25,
    prizeLevel: 'Premios Intermedios',
    badge: 'MÁS JUGADO',
    badgeClass: 'popular',
    description: '1 Cartón oficial para competir por premios medianos en efectivo y electrodomésticos.',
    prizeHighlight: 'Premios en efectivo, electrodomésticos y kits tecnológicos.',
    icon: '🥈'
  },
  {
    id: 'tier-50',
    name: 'Cartón Oro',
    unitPriceQ: 50,
    prizeLevel: 'Grandes Premios',
    description: '1 Cartón oficial para disputar grandes premios de alto valor y tecnología.',
    prizeHighlight: 'Smart TVs, tablets, smartphones y premios en efectivo.',
    icon: '🥇'
  },
  {
    id: 'tier-100',
    name: 'Cartón Diamante VIP',
    unitPriceQ: 100,
    prizeLevel: 'Premio Mayor / Pozo VIP',
    badge: 'POZO MAYOR',
    badgeClass: 'vip',
    description: '1 Cartón oficial para participar por el gran pozo acumulado de la noche.',
    prizeHighlight: 'Gran Pozo Acumulado en efectivo y premios de alta gama.',
    icon: '💎'
  }
];

const BingoBoletos: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<CardTier>(CARD_TIERS[1]); // Por defecto Q25
  const [quantity, setQuantity] = useState<number>(1);
  const [playerName, setPlayerName] = useState('');
  const [playerWhatsapp, setPlayerWhatsapp] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronización de la próxima ronda y links de pago de Recurrente
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);
  const [recurrenteLinks, setRecurrenteLinks] = useState<{ [pkgId: string]: string }>({});
  const [recurrenteSecretKey, setRecurrenteSecretKey] = useState<string>('');
  const [countdownText, setCountdownText] = useState<string | null>(null);

  // Cargar juego activo
  useEffect(() => {
    const q = query(collection(db, 'bingo_games'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BingoGame;
        setActiveGame(gameData);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cargar links de Recurrente y credencial de configuración en Firestore
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'bingo_settings', 'payment_gateways');
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.recurrente_links) {
            setRecurrenteLinks(data.recurrente_links);
          }
          if (data.recurrente_secret_key) {
            setRecurrenteSecretKey(data.recurrente_secret_key);
          }
        }
      } catch (err) {
        console.warn("No se pudieron cargar links personalizados de Recurrente:", err);
      }
    };
    loadSettings();
  }, []);

  // Temporizador en vivo si hay ronda programada
  useEffect(() => {
    if (!activeGame?.nextRoundTime) {
      setCountdownText(null);
      return;
    }

    const updateTimer = () => {
      const diff = activeGame.nextRoundTime! - Date.now();
      if (diff <= 0) {
        setCountdownText("¡Ronda a punto de iniciar!");
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const pad = (n: number) => String(n).padStart(2, '0');
      if (days > 0) {
        setCountdownText(`${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else if (hours > 0) {
        setCountdownText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setCountdownText(`${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeGame?.nextRoundTime]);

  // Manejador del Checkout de Recurrente
  // Manejador del Checkout de Recurrente
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!playerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo para emitir tus cartones.');
      return;
    }

    const cleanPhone = playerWhatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('Por favor ingresa un número de WhatsApp válido (mínimo 8 dígitos) para enviarte tu enlace de juego.');
      return;
    }

    const totalPriceQ = selectedTier.unitPriceQ * quantity;
    setIsProcessing(true);

    let orderId = 'ord_' + Date.now();
    try {
      // 1. Guardar la orden pendiente en Firestore
      const orderRef = await addDoc(collection(db, 'bingo_orders'), {
        playerName: playerName.trim(),
        playerWhatsapp: cleanPhone,
        playerEmail: playerEmail.trim() || null,
        tierId: selectedTier.id,
        tierName: selectedTier.name,
        prizeLevel: selectedTier.prizeLevel,
        unitPriceQ: selectedTier.unitPriceQ,
        quantity: quantity,
        priceQ: totalPriceQ, // Compatibilidad
        totalPriceQ: totalPriceQ,
        cartonesCount: quantity, // Compatibilidad
        packageName: `${selectedTier.name} (${quantity} ${quantity === 1 ? 'Cartón' : 'Cartones'})`,
        gameId: activeGame?.id || 'default_game',
        gateway: 'recurrente_guatemala',
        status: 'pending',
        createdAt: Date.now()
      });
      orderId = orderRef.id;
    } catch (fsErr) {
      console.warn("Aviso al guardar orden en Firestore (continuando con checkout):", fsErr);
    }

    try {
      // 2. Crear sesión de Checkout dinámico en vivo en Recurrente
      const apiKey = recurrenteSecretKey || (import.meta as any).env?.VITE_RECURRENTE_SECRET_KEY || '';

      if (apiKey) {
        try {
          const recurrenteRes = await fetch("https://app.recurrente.com/api/checkouts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-SECRET-KEY": apiKey
            },
            body: JSON.stringify({
              items: [
                {
                  name: `Bingotenango: ${quantity}x ${selectedTier.name} (${selectedTier.prizeLevel})`,
                  amount_in_cents: totalPriceQ * 100,
                  currency: "GTQ",
                  quantity: 1
                }
              ],
              success_url: `${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`,
              cancel_url: `${window.location.origin}/juegos/bingo/boletos`,
              metadata: {
                orderId: orderId,
                playerName: playerName.trim(),
                playerWhatsapp: cleanPhone,
                tierId: selectedTier.id,
                tierName: selectedTier.name,
                unitPriceQ: selectedTier.unitPriceQ,
                quantity: quantity,
                priceQ: totalPriceQ
              }
            })
          });

          if (recurrenteRes.ok) {
            const checkoutData = await recurrenteRes.json();
            if (checkoutData?.checkout_url) {
              // Redirigir a la pantalla de pago segura de Recurrente
              window.location.href = checkoutData.checkout_url;
              return;
            }
          }
        } catch (apiErr) {
          console.warn("Fallo directo de API Checkout Recurrente, usando fallback:", apiErr);
        }
      }

      // 3. Fallback: Si hay link de producto configurado en Gerencia
      const configuredLink = recurrenteLinks[selectedTier.id];
      if (configuredLink && configuredLink.startsWith('http')) {
        const separator = configuredLink.includes('?') ? '&' : '?';
        const returnUrl = encodeURIComponent(`${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`);
        const finalUrl = `${configuredLink}${separator}customer_name=${encodeURIComponent(playerName)}&customer_phone=${encodeURIComponent(cleanPhone)}&redirect_url=${returnUrl}`;
        window.location.href = finalUrl;
      } else {
        // Modo guiado / simulado si no hubiera conexión externa
        navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&tier=${selectedTier.id}&qty=${quantity}&name=${encodeURIComponent(playerName)}&phone=${cleanPhone}&testMode=true`);
      }
    } catch (err) {
      console.error("Error al iniciar orden:", err);
      setErrorMessage('Ocurrió un error al conectar con la pasarela. Intenta de nuevo o contáctanos por WhatsApp.');
      setIsProcessing(false);
    }
  };

  const totalPriceQ = selectedTier.unitPriceQ * quantity;

  return (
    <div className="bingo-boletos-page">
      <div className="bingo-boletos-container">
        
        {/* CABECERA */}
        <header className="boletos-header">
          <div className="boletos-logo-badge">
            <img src="/bingotenango-logo.svg" alt="Bingotenango" className="boletos-logo-img" />
            <span style={{ fontFamily: 'var(--font-gamer)', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 900, letterSpacing: '1px' }}>
              TIENDA OFICIAL DE BOLETOS
            </span>
          </div>

          <h1 className="boletos-hero-title">
            Adquiere tus Cartones y Juega en Vivo
          </h1>

          <p className="boletos-hero-subtitle">
            Compra segura con <strong>Recurrente Guatemala</strong>. Aceptamos tarjetas de débito/crédito Visa, Mastercard y transferencias bancarias locales.
          </p>

          {/* Temporizador si hay próxima ronda programada */}
          {countdownText && (
            <div className="boletos-countdown-banner">
              <span style={{ fontSize: '1.2rem' }}>⏱️</span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                PRÓXIMA RONDA EN:
              </span>
              <span className="boletos-countdown-digits">
                {countdownText}
              </span>
            </div>
          )}
        </header>

        {/* PASOS DE CONFIANZA Y CLARIDAD */}
        <div className="boletos-trust-steps">
          <div className="trust-step-card">
            <div className="trust-step-number">1</div>
            <div className="trust-step-text">
              <h4>Elige el Tipo de Premio</h4>
              <p>Selecciona por qué categoría de premios quieres jugar (Q10, Q25, Q50 o Q100 por cartón).</p>
            </div>
          </div>

          <div className="trust-step-card">
            <div className="trust-step-number">2</div>
            <div className="trust-step-text">
              <h4>Define la Cantidad</h4>
              <p>Elige cuántos cartones quieres de ese tipo (1, 2, 3, 5, etc.) para tener más oportunidades.</p>
            </div>
          </div>

          <div className="trust-step-card">
            <div className="trust-step-number">3</div>
            <div className="trust-step-text">
              <h4>Paga Seguro en Recurrente</h4>
              <p>Checkout bancario 100% cifrado con entrega inmediata de tus cartones para la sala en vivo.</p>
            </div>
          </div>
        </div>

        {/* 1. SELECTOR DE TIPO DE CARTÓN / PREMIO */}
        <h2 className="boletos-grid-title">
          1. ELIGE EL TIPO DE PREMIO / CARTÓN A JUGAR
        </h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', margin: '-14px auto 26px', maxWidth: '620px' }}>
          Cada opción representa <strong>1 cartón oficial</strong> según el nivel de premios que se disputa en la ronda.
        </p>

        <div className="boletos-packages-grid">
          {CARD_TIERS.map((tier) => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <div 
                key={tier.id}
                className={`package-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedTier(tier)}
              >
                {tier.badge && (
                  <span className={`package-badge ${tier.badgeClass}`}>
                    {tier.badge}
                  </span>
                )}

                <div className="package-icon">{tier.icon}</div>
                <h3 className="package-name">{tier.name}</h3>
                
                <div className="package-cartones">
                  🏆 {tier.prizeLevel}
                </div>

                <div className="package-price-wrap">
                  <span className="package-currency">Q</span>
                  <span className="package-amount">{tier.unitPriceQ}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px', fontWeight: 'bold' }}>/ cartón</span>
                </div>

                <p className="package-benefit">{tier.description}</p>

                <div style={{
                  margin: '12px 0 16px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  fontSize: '0.76rem',
                  color: '#e2e8f0',
                  textAlign: 'left'
                }}>
                  <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '3px' }}>🎁 Premios en juego:</strong>
                  {tier.prizeHighlight}
                </div>

                <button type="button" className="package-select-btn">
                  {isSelected ? '✓ Seleccionado' : 'Elegir Tipo'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 2. SELECTOR DE CANTIDAD DE CARTONES */}
        <div className="quantity-control-card">
          <div className="quantity-info-side">
            <h3>2. ¿CUÁNTOS CARTONES DESEAS JUGAR?</h3>
            <p>
              Tipo seleccionado: <strong style={{ color: '#fff' }}>{selectedTier.name} ({selectedTier.prizeLevel})</strong> a <strong style={{ color: '#00f0ff' }}>Q{selectedTier.unitPriceQ}.00 c/u</strong>.
            </p>
          </div>

          <div className="quantity-action-side">
            <div className="quantity-stepper">
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                aria-label="Restar cartón"
              >
                −
              </button>
              <div className="stepper-value-wrap">
                <span className="stepper-value">{quantity}</span>
                <span className="stepper-unit">{quantity === 1 ? 'Cartón' : 'Cartones'}</span>
              </div>
              <button 
                type="button" 
                className="stepper-btn" 
                onClick={() => setQuantity(prev => Math.min(50, prev + 1))}
                disabled={quantity >= 50}
                aria-label="Sumar cartón"
              >
                +
              </button>
            </div>

            <div className="quick-quantity-chips">
              {[1, 2, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`quick-chip-btn ${quantity === num ? 'active' : ''}`}
                  onClick={() => setQuantity(num)}
                >
                  {num} {num === 1 ? 'cartón' : 'cartones'}
                </button>
              ))}
            </div>

            <div className="quantity-live-total">
              Subtotal: Q{totalPriceQ}.00
            </div>
          </div>
        </div>

        {/* 3. FORMULARIO Y CHECKOUT */}
        <div className="checkout-section">
          <div className="checkout-grid">
            
            {/* LADO IZQUIERDO: FORMULARIO */}
            <div>
              <h3 className="checkout-form-title">
                3. DATOS DE ENTREGA DEL JUGADOR
              </h3>
              <p className="checkout-form-subtitle">
                A estos datos vincularemos tus {quantity} {quantity === 1 ? 'cartón' : 'cartones'} y te enviaremos el enlace oficial de la sala de juego.
              </p>

              <form onSubmit={handleProceedToPayment}>
                <div className="form-group">
                  <label htmlFor="playerName">Nombre y Apellido *</label>
                  <input 
                    id="playerName"
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Carlos Mendoza" 
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="playerWhatsapp">WhatsApp (Guatemala o Internacional) *</label>
                  <input 
                    id="playerWhatsapp"
                    type="tel" 
                    className="form-input" 
                    placeholder="Ej. 55554444" 
                    value={playerWhatsapp}
                    onChange={(e) => setPlayerWhatsapp(e.target.value)}
                    required
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>
                    📲 Aquí recibirás la confirmación y el botón directo para entrar a la partida con tus cartones.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="playerEmail">Correo Electrónico (Opcional)</label>
                  <input 
                    id="playerEmail"
                    type="email" 
                    className="form-input" 
                    placeholder="correo@ejemplo.com" 
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                  />
                </div>

                {errorMessage && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    marginBottom: '16px'
                  }}>
                    ⚠️ {errorMessage}
                  </div>
                )}
              </form>
            </div>

            {/* LADO DERECHO: RESUMEN Y BOTÓN DE RECURRENTE */}
            <div className="order-summary-box">
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#38bdf8', letterSpacing: '0.5px' }}>
                  RESUMEN DE TU COMPRA
                </h4>

                <div className="summary-row">
                  <span>Tipo de Cartón / Ronda:</span>
                  <strong style={{ color: '#fff' }}>{selectedTier.name}</strong>
                </div>

                <div className="summary-row">
                  <span>Categoría de Premio:</span>
                  <strong style={{ color: '#cbd5e1' }}>{selectedTier.prizeLevel}</strong>
                </div>

                <div className="summary-row">
                  <span>Precio Unitario:</span>
                  <span style={{ color: '#94a3b8' }}>Q {selectedTier.unitPriceQ}.00 c/u</span>
                </div>

                <div className="summary-row">
                  <span>Cantidad Seleccionada:</span>
                  <strong style={{ color: '#00f0ff' }}>{quantity} {quantity === 1 ? 'Cartón' : 'Cartones'}</strong>
                </div>

                <div className="summary-row">
                  <span>Pasarela de Pago:</span>
                  <strong style={{ color: '#10b981' }}>Recurrente (Guatemala)</strong>
                </div>

                <div className="summary-row total">
                  <span>Total a Pagar:</span>
                  <span className="summary-total-price">Q {totalPriceQ}.00</span>
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  className="btn-pay-recurrente"
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Conectando con Recurrente...' : `🔒 Pagar Q${totalPriceQ}.00 (${quantity} ${quantity === 1 ? 'Cartón' : 'Cartones'})`}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>
                  🛡️ Serás dirigido al checkout bancario seguro de Recurrente. Al confirmar, volverás automáticamente con tus cartones activos.
                </p>

                {/* SELLOS DE CONFIANZA */}
                <div className="security-badges-bar">
                  <div className="security-badge-item">
                    <span>🔒</span> SSL 256-bit
                  </div>
                  <div className="security-badge-item">
                    <span>💳</span> Visa / Mastercard
                  </div>
                  <div className="security-badge-item">
                    <span>🇬🇹</span> Recurrente GT
                  </div>
                  <div className="security-badge-item">
                    <span>⚡</span> Entrega Inmediata
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* PREGUNTAS FRECUENTES (FAQ) */}
        <section className="faq-section">
          <h3 className="faq-title">PREGUNTAS FRECUENTES</h3>
          
          <div className="faq-item">
            <div className="faq-question">¿Cómo recibo mis cartones después de pagar?</div>
            <div className="faq-answer">
              Al completar tu pago en Recurrente, la pasarela te redirige automáticamente a nuestra pantalla de entrega con tu enlace directo a la sala y tus cartones cargados. Además, te enviamos el link por WhatsApp para que lo tengas siempre disponible.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">¿Qué métodos de pago acepta Recurrente en Guatemala?</div>
            <div className="faq-answer">
              Acepta tarjetas de crédito y débito Visa y Mastercard de todos los bancos de Guatemala (BANRURAL, Banco Industrial, BAC, G&T Continental, etc.) y transferencias en línea.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">¿Puedo comprar varios cartones para la misma ronda?</div>
            <div className="faq-answer">
              ¡Totalmente! Seleccionas la categoría de premio que deseas jugar (Bronce Q10, Plata Q25, Oro Q50 o Diamante Q100) y con los botones [+] y [-] o los accesos directos (1, 2, 3, 5, 10) defines cuántos cartones quieres. Cada cartón contará con su propia combinación numérica única.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">¿Qué pasa si se cierra mi navegador durante el juego?</div>
            <div className="faq-answer">
              No te preocupes. Tu cartón está guardado en la nube en tiempo real. Simplemente vuelves a abrir tu link de WhatsApp y tus casillas marcadas seguirán exactamente igual.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BingoBoletos;
