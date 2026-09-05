import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoGame, BingoScheduledGame } from '../types';
import './BingoBoletos.css';

interface CardTier {
  id: string;
  name: string;
  unitPriceQ: number;
  prizeLevel: string;
  badge: string;
  badgeClass: string;
  description: string;
  prizeHighlight: string;
  icon: string;
}

const CARD_TIERS_MAP: Record<string, CardTier> = {
  'tier-10': {
    id: 'tier-10',
    name: 'Cartón Bronce',
    unitPriceQ: 10,
    prizeLevel: 'Premios Estándar',
    badge: 'ACCESIBLE',
    badgeClass: 'bronce',
    description: 'Cartón oficial para participar por premios estándar de la ronda.',
    prizeHighlight: 'Efectivo, canastas de libros y combos escolares.',
    icon: '🥉'
  },
  'tier-25': {
    id: 'tier-25',
    name: 'Cartón Plata',
    unitPriceQ: 25,
    prizeLevel: 'Premios Intermedios',
    badge: 'MÁS JUGADO',
    badgeClass: 'popular',
    description: 'Cartón oficial para disputar los premios medianos y línea de la sala.',
    prizeHighlight: 'Premios medianos en efectivo, tablets y electrodomésticos.',
    icon: '🥈'
  },
  'tier-50': {
    id: 'tier-50',
    name: 'Cartón Oro',
    unitPriceQ: 50,
    prizeLevel: 'Grandes Premios',
    badge: 'DESTACADO',
    badgeClass: 'oro',
    description: 'Cartón oficial para participar por los grandes premios estelares.',
    prizeHighlight: 'Premios mayores en efectivo, smartphones y tecnología.',
    icon: '🥇'
  },
  'tier-100': {
    id: 'tier-100',
    name: 'Cartón Diamante VIP',
    unitPriceQ: 100,
    prizeLevel: 'Premio Mayor / Pozo VIP',
    badge: 'POZO MAYOR',
    badgeClass: 'vip',
    description: 'Cartón oficial para disputar el gran pozo acumulado de la noche.',
    prizeHighlight: 'Gran Pozo Acumulado en efectivo y premios de alta gama.',
    icon: '💎'
  }
};

const BingoBoletos: React.FC = () => {
  const navigate = useNavigate();

  // Modo de compra guiado: 'personal' (para mí, 1 a 3 cartones) o 'gift' (repartir a contactos, 1 a 10 links)
  const [purchaseMode, setPurchaseMode] = useState<'personal' | 'gift'>('personal');
  const [quantity, setQuantity] = useState<number>(1);
  const [playerName, setPlayerName] = useState('');
  const [playerWhatsapp, setPlayerWhatsapp] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronización del juego activo y partidas programadas en Firestore
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);
  const [scheduledGames, setScheduledGames] = useState<BingoScheduledGame[]>([]);
  const [selectedScheduledGame, setSelectedScheduledGame] = useState<BingoScheduledGame | null>(null);
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

  // Cargar partidas programadas
  useEffect(() => {
    const qSched = query(collection(db, 'bingo_scheduled_games'));
    const unsubscribeSched = onSnapshot(qSched, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as BingoScheduledGame))
        .filter(g => g.status === 'scheduled' || g.status === 'live');
      list.sort((a, b) => a.scheduledAt - b.scheduledAt);
      setScheduledGames(list);
      if (list.length > 0) {
        setSelectedScheduledGame(prev => prev || list[0]);
      }
    });

    return () => unsubscribeSched();
  }, []);

  // Cargar credenciales de Recurrente
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
        console.warn("No se pudieron cargar configuraciones de pasarela:", err);
      }
    };
    loadSettings();
  }, []);

  // Temporizador en vivo
  useEffect(() => {
    const targetTimestamp = selectedScheduledGame?.scheduledAt || activeGame?.nextRoundTime;
    if (!targetTimestamp) {
      setCountdownText(null);
      return;
    }

    const updateTimer = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setCountdownText('¡EN VIVO AHORA!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedScheduledGame, activeGame]);

  // Determinar el tier y precio oficial fijado para esta partida (ocultando los otros)
  const currentPriceQ = selectedScheduledGame?.cardPriceQ || activeGame?.cardPriceQ || 25;
  const currentTierId = selectedScheduledGame?.gameType || activeGame?.gameType || (currentPriceQ === 10 ? 'tier-10' : currentPriceQ === 50 ? 'tier-50' : currentPriceQ === 100 ? 'tier-100' : 'tier-25');
  const activeTier: CardTier = CARD_TIERS_MAP[currentTierId] || {
    id: currentTierId,
    name: `Cartón Oficial Bingotenango`,
    unitPriceQ: currentPriceQ,
    prizeLevel: selectedScheduledGame?.prizeHighlight || 'Premios Oficiales de la Ronda',
    badge: 'PARTIDA ACTIVA',
    badgeClass: 'popular',
    description: 'Cartón oficial para participar en la partida programada.',
    prizeHighlight: selectedScheduledGame?.prizeHighlight || 'Premios en vivo.',
    icon: '🎟️'
  };

  // Ajustar cantidad al alternar entre modos
  const handleModeChange = (mode: 'personal' | 'gift') => {
    setPurchaseMode(mode);
    if (mode === 'personal' && quantity > 3) {
      setQuantity(3);
    }
  };

  const totalPriceQ = currentPriceQ * quantity;

  // Procesar pago
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!playerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    const cleanPhone = playerWhatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('Por favor ingresa un número de WhatsApp válido (mínimo 8 dígitos) para recibir tus enlaces.');
      return;
    }

    setIsProcessing(true);
    let orderId = 'ord_' + Date.now();

    try {
      // 1. Guardar la orden en Firestore
      const orderRef = await addDoc(collection(db, 'bingo_orders'), {
        playerName: playerName.trim(),
        playerWhatsapp: cleanPhone,
        playerEmail: playerEmail.trim() || null,
        tierId: activeTier.id,
        tierName: activeTier.name,
        prizeLevel: activeTier.prizeLevel,
        unitPriceQ: currentPriceQ,
        quantity: quantity,
        priceQ: totalPriceQ,
        totalPriceQ: totalPriceQ,
        cartonesCount: quantity,
        purchaseMode: purchaseMode, // 'personal' o 'gift'
        packageName: purchaseMode === 'personal' 
          ? `${activeTier.name} (${quantity} ${quantity === 1 ? 'Cartón Personal' : 'Cartones Personales'})`
          : `${activeTier.name} (${quantity} ${quantity === 1 ? 'Link para Contacto' : 'Links para Contactos'})`,
        gameId: activeGame?.id || 'default_game',
        scheduledGameId: selectedScheduledGame?.id || null,
        scheduledGameTitle: selectedScheduledGame?.title || null,
        linkSent: false,
        linkSentAt: null,
        gateway: 'recurrente_guatemala',
        status: 'pending',
        createdAt: Date.now()
      });
      orderId = orderRef.id;
    } catch (fsErr) {
      console.warn("Aviso al guardar orden:", fsErr);
    }

    try {
      // 2. Checkout dinámico con Recurrente
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
                  name: `Bingotenango: ${quantity}x ${activeTier.name} [${purchaseMode === 'personal' ? 'Uso Personal' : 'Links para Amigos'}]`,
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
                tierId: activeTier.id,
                tierName: activeTier.name,
                unitPriceQ: currentPriceQ,
                quantity: quantity,
                purchaseMode: purchaseMode,
                priceQ: totalPriceQ
              }
            })
          });

          if (recurrenteRes.ok) {
            const checkoutData = await recurrenteRes.json();
            if (checkoutData?.checkout_url) {
              window.location.href = checkoutData.checkout_url;
              return;
            }
          }
        } catch (apiErr) {
          console.warn("Fallo en API Checkout Recurrente, usando fallback:", apiErr);
        }
      }

      // 3. Fallback a Link fijo de Recurrente o pantalla guiada
      const configuredLink = recurrenteLinks[activeTier.id] || recurrenteLinks[activeTier.id.replace('tier-', 'pkg-')];
      if (configuredLink && configuredLink.startsWith('http')) {
        const separator = configuredLink.includes('?') ? '&' : '?';
        const returnUrl = encodeURIComponent(`${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`);
        let finalUrl = `${configuredLink}${separator}customer_name=${encodeURIComponent(playerName)}&customer_phone=${encodeURIComponent(cleanPhone)}&redirect_url=${returnUrl}`;
        if (playerEmail.trim()) {
          finalUrl += `&customer_email=${encodeURIComponent(playerEmail.trim())}`;
        }
        window.location.href = finalUrl;
        return;
      } else {
        navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&tier=${activeTier.id}&qty=${quantity}&name=${encodeURIComponent(playerName)}&phone=${cleanPhone}&mode=${purchaseMode}&testMode=true`);
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
        
        {/* CABECERA MINIMALISTA */}
        <header className="boletos-header">
          <div className="boletos-logo-badge">
            <img src="/bingotenango-logo.svg" alt="Bingotenango" className="boletos-logo-img" />
            <span className="boletos-badge-text">
              BINGOTENANGO EN VIVO
            </span>
          </div>

          <h1 className="boletos-hero-title">
            Compra Fácil de Boletos
          </h1>

          <p className="boletos-hero-subtitle">
            Entrada directa para la próxima transmisión en vivo. Pagos 100% seguros con tarjetas o transferencia bancaria local.
          </p>

          {countdownText && (
            <div className="boletos-countdown-banner">
              <span>⏱️</span>
              <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                PRÓXIMA RONDA EN:
              </span>
              <span className="boletos-countdown-digits">
                {countdownText}
              </span>
            </div>
          )}
        </header>

        {/* 1. TARJETA HERO DEL JUEGO CON SU PRECIO OFICIAL FIJADO (OCULTA OTRAS OPCIONES) */}
        <div className="active-game-highlight-card">
          <div className="active-game-header-row">
            <div>
              <span className="game-badge-chip">
                PARTIDA SELECCIONADA
              </span>
              <h2 className="game-title-text">
                {selectedScheduledGame?.title || activeGame?.title || 'Gran Ronda Oficial de Bingotenango'}
              </h2>
              <p className="game-date-text">
                📅 {selectedScheduledGame ? new Date(selectedScheduledGame.scheduledAt).toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'short' }) : 'Transmisión interactiva en vivo'}
              </p>
            </div>

            <div className="game-price-pill">
              <span className="pill-currency">Q</span>
              <span className="pill-amount">{currentPriceQ}</span>
              <span className="pill-unit">/ cartón</span>
            </div>
          </div>

          {/* Selector de partida alternativa solo si hay varias programadas */}
          {scheduledGames.length > 1 && (
            <div className="game-switch-selector">
              <label>Cambiar partida programada:</label>
              <select
                value={selectedScheduledGame?.id || ''}
                onChange={(e) => {
                  const found = scheduledGames.find(g => g.id === e.target.value);
                  if (found) setSelectedScheduledGame(found);
                }}
              >
                {scheduledGames.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.title} • {new Date(g.scheduledAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })} (Q{g.cardPriceQ || 25})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Premio destacado */}
          <div className="game-prize-strip">
            <span className="prize-icon">🏆</span>
            <div className="prize-info">
              <strong>Premios de esta ronda:</strong>
              <span>{selectedScheduledGame?.prizeHighlight || activeGame?.currentPrizeTitle || 'Premios en efectivo, combos y sorpresas en vivo.'}</span>
            </div>
          </div>
        </div>

        {/* 2. SELECTOR GUIADO DE MODO DE COMPRA */}
        <div className="purchase-mode-section">
          <h3 className="section-title-guided">
            1. ¿CÓMO DESEAS PARTICIPAR?
          </h3>
          <p className="section-subtitle-guided">
            Elige si jugarás tú mismo en la sala o si regalarás enlaces a tus contactos.
          </p>

          <div className="purchase-mode-grid">
            {/* OPCIÓN A: PARA MÍ */}
            <div 
              className={`mode-card ${purchaseMode === 'personal' ? 'active' : ''}`}
              onClick={() => handleModeChange('personal')}
            >
              <div className="mode-card-radio">
                <span className={`radio-dot ${purchaseMode === 'personal' ? 'selected' : ''}`} />
              </div>
              <div className="mode-card-icon">👤</div>
              <div className="mode-card-body">
                <h4>Para mí (Jugar en vivo)</h4>
                <p>Jugarás tú mismo desde este celular o computadora. Recibirás tu pase con tus cartones listos.</p>
                <span className="mode-limit-badge">De 1 a 3 cartones</span>
              </div>
            </div>

            {/* OPCIÓN B: PARA REPARTIR */}
            <div 
              className={`mode-card ${purchaseMode === 'gift' ? 'active' : ''}`}
              onClick={() => handleModeChange('gift')}
            >
              <div className="mode-card-radio">
                <span className={`radio-dot ${purchaseMode === 'gift' ? 'selected' : ''}`} />
              </div>
              <div className="mode-card-icon">🎁</div>
              <div className="mode-card-body">
                <h4>Para repartir a contactos</h4>
                <p>Comprarás links independientes para enviar a tus amigos o familiares por WhatsApp.</p>
                <span className="mode-limit-badge gift-badge">De 1 a 10 links</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SELECCIÓN DE CANTIDAD GUIADA SEGÚN EL MODO */}
        <div className="quantity-guided-card">
          <div className="quantity-header">
            <div>
              <h3 className="quantity-title">
                {purchaseMode === 'personal' ? '2. ¿CUÁNTOS CARTONES JUGARÁS?' : '2. ¿CUÁNTOS LINKS PARA CONTACTOS NECESITAS?'}
              </h3>
              <p className="quantity-help-text">
                {purchaseMode === 'personal' 
                  ? '💡 Recomendación: de 1 a 3 cartones es ideal para marcar cómodo sin perder números en vivo.'
                  : '💡 Cada link es 100% independiente para que un contacto diferente ingrese a su propio juego.'
                }
              </p>
            </div>
            
            <div className="quantity-summary-badge">
              Total: <strong>Q{totalPriceQ}.00</strong>
            </div>
          </div>

          {/* MODO PERSONAL: SELECTOR DE 1 A 3 CARTONES CON BOTONES GRANDES */}
          {purchaseMode === 'personal' ? (
            <div className="personal-stepper-grid">
              {[1, 2, 3].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  className={`personal-qty-btn ${quantity === qty ? 'active' : ''}`}
                  onClick={() => setQuantity(qty)}
                >
                  <span className="qty-number">{qty}</span>
                  <span className="qty-label">{qty === 1 ? 'Cartón' : 'Cartones'}</span>
                  <span className="qty-price">Q{qty * currentPriceQ}.00</span>
                </button>
              ))}
            </div>
          ) : (
            /* MODO REPARTIR: SELECTOR DE 1 A 10 LINKS */
            <div className="gift-stepper-wrap">
              <div className="stepper-controls-row">
                <button 
                  type="button" 
                  className="stepper-action-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <div className="stepper-display">
                  <span className="stepper-val">{quantity}</span>
                  <span className="stepper-lbl">{quantity === 1 ? 'Link de Regalo' : 'Links para Contactos'}</span>
                </div>
                <button 
                  type="button" 
                  className="stepper-action-btn"
                  onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>

              <div className="gift-quick-chips">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`gift-chip ${quantity === num ? 'active' : ''}`}
                    onClick={() => setQuantity(num)}
                  >
                    {num} {num === 1 ? 'link' : 'links'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. FORMULARIO MINIMALISTA Y CHECKOUT */}
        <div className="checkout-guided-section">
          <h3 className="section-title-guided">
            3. DATOS DE ENTREGA Y PAGO SEGURO
          </h3>
          <p className="section-subtitle-guided">
            {purchaseMode === 'personal' 
              ? 'Ingresa tu nombre y WhatsApp para generar tu pase de juego en vivo.' 
              : 'A este WhatsApp te enviaremos la lista completa de links para compartir con tus contactos.'}
          </p>

          {errorMessage && (
            <div className="checkout-error-banner">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="checkout-guided-form">
            <div className="form-group-guided">
              <label htmlFor="playerName">Tu Nombre y Apellido *</label>
              <input 
                id="playerName"
                type="text" 
                className="guided-input" 
                placeholder="Ej. Carlos Mendoza" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-guided">
              <label htmlFor="playerWhatsapp">WhatsApp para Entrega (Guatemala o Internacional) *</label>
              <input 
                id="playerWhatsapp"
                type="tel" 
                className="guided-input" 
                placeholder="Ej. 502 5555 1234" 
                value={playerWhatsapp}
                onChange={(e) => setPlayerWhatsapp(e.target.value)}
                required
              />
            </div>

            <div className="form-group-guided">
              <label htmlFor="playerEmail">Correo Electrónico (Opcional, para comprobante bancario)</label>
              <input 
                id="playerEmail"
                type="email" 
                className="guided-input" 
                placeholder="correo@ejemplo.com" 
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
              />
            </div>

            {/* RESUMEN FINAL Y BOTÓN DE ACCIÓN */}
            <div className="checkout-summary-bar">
              <div className="summary-left">
                <span className="summary-qty-desc">
                  {purchaseMode === 'personal' ? `${quantity}x Cartón Personal` : `${quantity}x Links para Contactos`}
                </span>
                <span className="summary-total-amount">
                  Total: Q{totalPriceQ}.00
                </span>
              </div>

              <button 
                type="submit" 
                className="btn-guided-pay"
                disabled={isProcessing}
              >
                {isProcessing ? 'Conectando Pasarela...' : `💳 Pagar Q${totalPriceQ}.00 con Recurrente`}
              </button>
            </div>

            <div className="guided-trust-bar">
              <span>🔒 Pago Cifrado por Recurrente</span>
              <span>•</span>
              <span>⚡ Entrega Inmediata de Enlaces</span>
              <span>•</span>
              <span>🇬🇹 Válido en toda Guatemala</span>
            </div>
          </form>
        </div>

        {/* AYUDA POR WHATSAPP O PAGO EN EFECTIVO */}
        <div className="cash-help-banner">
          <p>
            ¿Prefieres pagar en <strong>Efectivo</strong> o necesitas ayuda directa?
          </p>
          <a 
            href={`https://wa.me/50242250165?text=${encodeURIComponent(`¡Hola! Deseo comprar ${quantity} boletos para Bingotenango (Total: Q${totalPriceQ}.00). ¿Me apoyan con las opciones de pago?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cash-help"
          >
            💬 Coordinar por WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};

export default BingoBoletos;
