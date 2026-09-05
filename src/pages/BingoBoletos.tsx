import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, limit, onSnapshot, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoGame } from '../types';
import './BingoBoletos.css';

interface TicketPackage {
  id: string;
  name: string;
  priceQ: number;
  cartonesCount: number;
  badge?: string;
  badgeClass?: string;
  benefit: string;
  icon: string;
  defaultRecurrenteUrl?: string;
}

const PACKAGES: TicketPackage[] = [
  {
    id: 'pkg-10',
    name: 'Boleto Individual',
    priceQ: 10,
    cartonesCount: 1,
    benefit: '1 Cartón para participar en la ronda activa de Bingotenango.',
    icon: '🎟️'
  },
  {
    id: 'pkg-25',
    name: 'Combo Trío',
    priceQ: 25,
    cartonesCount: 3,
    badge: 'MÁS POPULAR',
    badgeClass: 'popular',
    benefit: '3 Cartones con triple oportunidad de cantar Bingo (Ahorras Q5).',
    icon: '🔥'
  },
  {
    id: 'pkg-50',
    name: 'Combo Familiar',
    priceQ: 50,
    cartonesCount: 7,
    benefit: '7 Cartones ideales para jugar en familia o con amigos (Ahorras Q20).',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'pkg-100',
    name: 'Pase VIP Gamer',
    priceQ: 100,
    cartonesCount: 15,
    badge: 'MEJOR VALOR',
    badgeClass: 'vip',
    benefit: '15 Cartones para maximizar probabilidades de ganar los premios mayores (Ahorras Q50).',
    icon: '👑'
  }
];

const BingoBoletos: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<TicketPackage>(PACKAGES[1]); // Por defecto Q25
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

    setIsProcessing(true);

    let orderId = 'ord_' + Date.now();
    try {
      // 1. Guardar la orden pendiente en Firestore
      const orderRef = await addDoc(collection(db, 'bingo_orders'), {
        playerName: playerName.trim(),
        playerWhatsapp: cleanPhone,
        playerEmail: playerEmail.trim() || null,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        priceQ: selectedPackage.priceQ,
        cartonesCount: selectedPackage.cartonesCount,
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
                  name: `Bingotenango: ${selectedPackage.name} (${selectedPackage.cartonesCount} Cartones)`,
                  amount_in_cents: selectedPackage.priceQ * 100,
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
                packageId: selectedPackage.id,
                cartones: selectedPackage.cartonesCount,
                priceQ: selectedPackage.priceQ
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
      const configuredLink = recurrenteLinks[selectedPackage.id];
      if (configuredLink && configuredLink.startsWith('http')) {
        const separator = configuredLink.includes('?') ? '&' : '?';
        const returnUrl = encodeURIComponent(`${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`);
        const finalUrl = `${configuredLink}${separator}customer_name=${encodeURIComponent(playerName)}&customer_phone=${encodeURIComponent(cleanPhone)}&redirect_url=${returnUrl}`;
        window.location.href = finalUrl;
      } else {
        // Modo guiado / simulado si no hubiera conexión externa
        navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&pkg=${selectedPackage.id}&name=${encodeURIComponent(playerName)}&phone=${cleanPhone}&testMode=true`);
      }
    } catch (err) {
      console.error("Error al iniciar orden:", err);
      setErrorMessage('Ocurrió un error al conectar con la pasarela. Intenta de nuevo o contáctanos por WhatsApp.');
      setIsProcessing(false);
    }
  };

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
              <h4>Elige tu Paquete</h4>
              <p>Selecciona la cantidad de cartones con los que deseas jugar (Q10, Q25, Q50 o Q100).</p>
            </div>
          </div>

          <div className="trust-step-card">
            <div className="trust-step-number">2</div>
            <div className="trust-step-text">
              <h4>Paga Seguro en Recurrente</h4>
              <p>Procesamiento bancario 100% cifrado con tarjeta de débito, crédito o transferencia.</p>
            </div>
          </div>

          <div className="trust-step-card">
            <div className="trust-step-number">3</div>
            <div className="trust-step-text">
              <h4>Recibe tu Link de Juego</h4>
              <p>Al confirmar el pago, la pantalla te genera tu link único y tus cartones para cantar Bingo en vivo.</p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE PAQUETES */}
        <h2 className="boletos-grid-title">
          1. SELECCIONA TU PAQUETE DE CARTONES
        </h2>

        <div className="boletos-packages-grid">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;
            return (
              <div 
                key={pkg.id}
                className={`package-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.badge && (
                  <span className={`package-badge ${pkg.badgeClass}`}>
                    {pkg.badge}
                  </span>
                )}

                <div className="package-icon">{pkg.icon}</div>
                <h3 className="package-name">{pkg.name}</h3>
                
                <div className="package-cartones">
                  🎟️ {pkg.cartonesCount} {pkg.cartonesCount === 1 ? 'Cartón Oficial' : 'Cartones Oficiales'}
                </div>

                <div className="package-price-wrap">
                  <span className="package-currency">Q</span>
                  <span className="package-amount">{pkg.priceQ}</span>
                </div>

                <p className="package-benefit">{pkg.benefit}</p>

                <button type="button" className="package-select-btn">
                  {isSelected ? '✓ Seleccionado' : 'Elegir Paquete'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FORMULARIO Y CHECKOUT */}
        <div className="checkout-section">
          <div className="checkout-grid">
            
            {/* LADO IZQUIERDO: FORMULARIO */}
            <div>
              <h3 className="checkout-form-title">
                2. DATOS DE ENTREGA DEL JUGADOR
              </h3>
              <p className="checkout-form-subtitle">
                A estos datos te vincularemos tus cartones y te enviaremos el enlace oficial de la sala de juego.
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
                    📲 Aquí recibirás la confirmación y el botón directo para entrar a la partida.
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
                  <span>Paquete Seleccionado:</span>
                  <strong style={{ color: '#fff' }}>{selectedPackage.name}</strong>
                </div>

                <div className="summary-row">
                  <span>Cartones Incluidos:</span>
                  <strong style={{ color: '#38bdf8' }}>{selectedPackage.cartonesCount} Cartones</strong>
                </div>

                <div className="summary-row">
                  <span>Pasarela de Pago:</span>
                  <strong style={{ color: '#10b981' }}>Recurrente (Guatemala)</strong>
                </div>

                <div className="summary-row total">
                  <span>Total a Pagar:</span>
                  <span className="summary-total-price">Q {selectedPackage.priceQ}.00</span>
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  className="btn-pay-recurrente"
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Conectando con Recurrente...' : `🔒 Pagar Q${selectedPackage.priceQ}.00 de Forma Segura`}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>
                  🛡️ Serás dirigido al checkout bancario seguro de Recurrente. Al confirmar, volverás automáticamente con tu link de juego activo.
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
            <div className="faq-question">¿Cómo recibo mi cartón después de pagar?</div>
            <div className="faq-answer">
              Al completar tu pago en Recurrente, la pasarela te redirige automáticamente a nuestra pantalla de entrega con tu enlace directo. Además, te enviamos el link por WhatsApp para que nunca lo pierdas.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">¿Qué métodos de pago acepta Recurrente en Guatemala?</div>
            <div className="faq-answer">
              Acepta tarjetas de crédito y débito Visa y Mastercard de todos los bancos de Guatemala (BANRURAL, Banco Industrial, BAC, G&T Continental, etc.) y transferencias en línea.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">¿Puedo comprar cartones para mi familia o amigos?</div>
            <div className="faq-answer">
              ¡Sí! Puedes elegir el Combo Familiar (7 cartones) o Pase VIP (15 cartones). Cada cartón tiene su propio link independiente para que puedas compartirlo con quien desees.
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
