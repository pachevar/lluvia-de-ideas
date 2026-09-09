import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  'tier-free': {
    id: 'tier-free',
    name: 'Cartón Gratuito (Prueba)',
    unitPriceQ: 0,
    prizeLevel: 'Partida de Demostración / Prueba',
    badge: 'GRATIS / PRUEBA',
    badgeClass: 'bronce',
    description: 'Cartón oficial sin costo para participar en la partida de demostración y pruebas.',
    prizeHighlight: 'Acceso libre para toda la comunidad.',
    icon: '🎁'
  },
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

type WizardStep = 1 | 2 | 3 | 4;

const WIZARD_STEPS = [
  { num: 1 as const, title: 'Partida', icon: '🎮', label: '1. Partida' },
  { num: 2 as const, title: 'Modalidad', icon: '👥', label: '2. Modalidad' },
  { num: 3 as const, title: 'Cartones', icon: '🎟️', label: '3. Cartones' },
  { num: 4 as const, title: 'Entrega y Pago', icon: '💳', label: '4. Entrega y Pago' },
];

const BingoBoletos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlScheduledGameId = searchParams.get('scheduledGame');

  // Estado del flujo guiado (Paso 1, 2, 3, 4)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Modo de compra guiado: 'personal' (1 a 3 cartones) o 'gift' (1 a 10 links)
  const [purchaseMode, setPurchaseMode] = useState<'personal' | 'gift'>('personal');
  const [quantity, setQuantity] = useState<number>(1);
  const [playerName, setPlayerName] = useState('');
  
  // WhatsApp: Solo los 8 dígitos locales de Guatemala (el +502 es fijo y no editable)
  const [playerWhatsappDigits, setPlayerWhatsappDigits] = useState('');
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
        if (urlScheduledGameId) {
          const matched = list.find(g => g.id === urlScheduledGameId);
          if (matched) {
            setSelectedScheduledGame(matched);
            return;
          }
        }
        setSelectedScheduledGame(prev => prev || list[0]);
      }
    });

    return () => unsubscribeSched();
  }, [urlScheduledGameId]);

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

  // Lista unificada de todas las partidas disponibles (programadas + juego activo si no está duplicado)
  const allAvailableGames: BingoScheduledGame[] = [...scheduledGames];
  if (activeGame && !scheduledGames.some(g => g.id === activeGame.id || (activeGame.scheduledGameId && g.id === activeGame.scheduledGameId))) {
    allAvailableGames.unshift({
      id: activeGame.id,
      title: activeGame.title || 'Gran Ronda Oficial de Bingotenango',
      scheduledAt: activeGame.nextRoundTime || Date.now(),
      cardPriceQ: activeGame.cardPriceQ ?? (activeGame.gameType === 'tier-free' ? 0 : 25),
      gameType: activeGame.gameType || (activeGame.cardPriceQ === 0 ? 'tier-free' : 'tier-25'),
      status: 'live',
      prizeHighlight: activeGame.currentPrizeTitle || 'Premios en vivo',
      tierName: activeGame.cardPriceQ === 0 ? 'Partida Gratuita' : 'Cartón Oficial',
      totalCardsLimit: 100,
      soldCardsCount: 0,
      createdAt: Date.now()
    } as BingoScheduledGame);
  }

  // Sincronizar selección de partida por URL o primera opción disponible
  useEffect(() => {
    if (allAvailableGames.length > 0) {
      if (urlScheduledGameId) {
        const matched = allAvailableGames.find(g => g.id === urlScheduledGameId);
        if (matched) {
          setSelectedScheduledGame(matched);
          return;
        }
      }
      setSelectedScheduledGame(prev => {
        if (prev && allAvailableGames.some(g => g.id === prev.id)) return prev;
        return allAvailableGames[0];
      });
    }
  }, [allAvailableGames.length, urlScheduledGameId]);

  // Determinar el tier y precio oficial fijado para esta partida
  const currentPriceQ = selectedScheduledGame?.cardPriceQ !== undefined 
    ? selectedScheduledGame.cardPriceQ 
    : (activeGame?.cardPriceQ !== undefined ? activeGame.cardPriceQ : 25);
  const currentTierId = selectedScheduledGame?.gameType || activeGame?.gameType || (currentPriceQ === 0 ? 'tier-free' : currentPriceQ === 10 ? 'tier-10' : currentPriceQ === 50 ? 'tier-50' : currentPriceQ === 100 ? 'tier-100' : 'tier-25');
  const activeTier: CardTier = CARD_TIERS_MAP[currentTierId] || {
    id: currentTierId,
    name: currentPriceQ === 0 ? 'Cartón Gratuito (Prueba)' : `Cartón Oficial Bingotenango`,
    unitPriceQ: currentPriceQ,
    prizeLevel: selectedScheduledGame?.prizeHighlight || (currentPriceQ === 0 ? 'Partida de Demostración' : 'Premios Oficiales de la Ronda'),
    badge: currentPriceQ === 0 ? 'GRATIS / PRUEBA' : 'PARTIDA ACTIVA',
    badgeClass: currentPriceQ === 0 ? 'bronce' : 'popular',
    description: currentPriceQ === 0 ? 'Cartón de demostración y pruebas con acceso libre sin costo.' : 'Cartón oficial para participar en la partida programada.',
    prizeHighlight: selectedScheduledGame?.prizeHighlight || (currentPriceQ === 0 ? 'Partida de demostración y prueba libre.' : 'Premios en vivo.'),
    icon: currentPriceQ === 0 ? '🎁' : '🎟️'
  };

  // Ajustar cantidad al alternar entre modos
  const handleModeChange = (mode: 'personal' | 'gift') => {
    setPurchaseMode(mode);
    if (mode === 'personal' && quantity > 3) {
      setQuantity(3);
    }
  };

  // Manejador del campo de WhatsApp con +502 preestablecido y 8 dígitos
  const handleWhatsappDigitsChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    // Si el usuario copió y pegó con 502 al inicio
    if (clean.startsWith('502') && clean.length > 8) {
      clean = clean.substring(3);
    }
    // Límite a 8 dígitos locales de Guatemala
    if (clean.length > 8) {
      clean = clean.substring(0, 8);
    }
    setPlayerWhatsappDigits(clean);
  };

  const totalPriceQ = currentPriceQ * quantity;

  // Navegación guiada entre pasos
  const goToStep = (step: WizardStep) => {
    setErrorMessage('');
    if (step === 2 && !selectedScheduledGame && !activeGame) {
      setErrorMessage('Por favor selecciona una partida para continuar.');
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Procesar pago / confirmación
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!playerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    if (playerWhatsappDigits.trim().length !== 8) {
      setErrorMessage('Por favor ingresa los 8 dígitos de tu número de WhatsApp de Guatemala (ej. 5555 1234).');
      return;
    }

    const cleanPhone = '502' + playerWhatsappDigits.trim();

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
        gateway: currentPriceQ === 0 ? 'gratis_cortesia' : 'recurrente_guatemala',
        status: currentPriceQ === 0 ? 'completed' : 'pending',
        paidAmount: currentPriceQ === 0 ? 0 : undefined,
        paidAt: currentPriceQ === 0 ? Date.now() : undefined,
        createdAt: Date.now()
      });
      orderId = orderRef.id;

      // Si el costo es 0 (Gratis/Prueba), confirmamos de inmediato sin pasarela bancaria
      if (currentPriceQ === 0) {
        navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success&playerName=${encodeURIComponent(playerName.trim())}&phone=${cleanPhone}&tier=tier-free&qty=${quantity}&mode=${purchaseMode}`);
        return;
      }
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
              "Accept-Language": "es-GT,es;q=0.9",
              "X-SECRET-KEY": apiKey
            },
            body: JSON.stringify({
              locale: "es",
              language: "es",
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
              try {
                const checkoutUrlObj = new URL(checkoutData.checkout_url);
                checkoutUrlObj.searchParams.set('locale', 'es');
                checkoutUrlObj.searchParams.set('lang', 'es');
                window.location.href = checkoutUrlObj.toString();
              } catch {
                const sep = checkoutData.checkout_url.includes('?') ? '&' : '?';
                window.location.href = `${checkoutData.checkout_url}${sep}locale=es&lang=es`;
              }
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
        try {
          const linkObj = new URL(configuredLink);
          linkObj.searchParams.set('locale', 'es');
          linkObj.searchParams.set('lang', 'es');
          linkObj.searchParams.set('customer_name', playerName.trim());
          linkObj.searchParams.set('customer_phone', cleanPhone);
          if (playerEmail.trim()) {
            linkObj.searchParams.set('customer_email', playerEmail.trim());
          }
          linkObj.searchParams.set('redirect_url', `${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`);
          window.location.href = linkObj.toString();
        } catch {
          const separator = configuredLink.includes('?') ? '&' : '?';
          const returnUrl = encodeURIComponent(`${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success`);
          let finalUrl = `${configuredLink}${separator}locale=es&lang=es&customer_name=${encodeURIComponent(playerName)}&customer_phone=${encodeURIComponent(cleanPhone)}&redirect_url=${returnUrl}`;
          if (playerEmail.trim()) {
            finalUrl += `&customer_email=${encodeURIComponent(playerEmail.trim())}`;
          }
          window.location.href = finalUrl;
        }
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
            Sigue los 4 sencillos pasos para asegurar tu lugar en la próxima transmisión en vivo.
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

        {/* BARRA DE NAVEGACIÓN Y PROGRESO DE LOS 4 PASOS */}
        <nav className="boletos-stepper-bar" aria-label="Progreso de compra">
          {WIZARD_STEPS.map((stepItem, idx) => {
            const isCurrent = currentStep === stepItem.num;
            const isCompleted = currentStep > stepItem.num;
            return (
              <React.Fragment key={stepItem.num}>
                <button
                  type="button"
                  className={`stepper-step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => goToStep(stepItem.num)}
                  disabled={!isCompleted && !isCurrent}
                >
                  <div className="stepper-badge-circle">
                    {isCompleted ? '✓' : stepItem.num}
                  </div>
                  <div className="stepper-text-col">
                    <span className="stepper-title-sub">
                      {stepItem.icon} Paso {stepItem.num}
                    </span>
                    <span className="stepper-title-main">
                      {stepItem.title}
                    </span>
                  </div>
                </button>
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`stepper-divider ${currentStep > stepItem.num ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* MENSAJE DE ERROR GLOBAL SI APLICA */}
        {errorMessage && (
          <div className="checkout-error-banner">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* ==========================================================================
            PASO 1: ESCOGER LA PARTIDA
            ========================================================================== */}
        {currentStep === 1 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <span className="step-badge-indicator">PASO 1 DE 4</span>
              <h2 className="step-main-title">
                1. ESCOGE TU PARTIDA
              </h2>
              <p className="step-main-desc">
                Selecciona la ronda en la que deseas participar. Conoce el horario, costo de entrada y los premios en juego.
              </p>
            </div>

            {allAvailableGames.length > 0 ? (
              <div className="partidas-selection-grid">
                {allAvailableGames.map((game) => {
                  const isSelected = selectedScheduledGame?.id === game.id;
                  const isFree = (game.cardPriceQ === 0);
                  const isLive = (game.status === 'live');

                  return (
                    <div
                      key={game.id}
                      className={`partida-selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedScheduledGame(game)}
                    >
                      <div className="partida-card-top">
                        <div className="partida-radio-wrap">
                          <span className={`partida-radio ${isSelected ? 'checked' : ''}`} />
                          <span className={`partida-status-chip ${isLive ? 'live' : isFree ? 'free' : 'scheduled'}`}>
                            {isLive ? '🔴 EN VIVO AHORA' : isFree ? '🎁 GRATIS / PRUEBA' : '📅 PROGRAMADA'}
                          </span>
                        </div>

                        <div className={`partida-price-badge ${isFree ? 'free' : ''}`}>
                          <span className="price-val">
                            {isFree ? 'Q0.00' : `Q${game.cardPriceQ || 25}.00`}
                          </span>
                          <span className="price-unit">
                            {isFree ? '¡GRATIS!' : '/ cartón'}
                          </span>
                        </div>
                      </div>

                      <h3 className="partida-card-title">
                        {game.title}
                      </h3>

                      <div className="partida-card-meta">
                        <div className="meta-row">
                          <span className="meta-icon">⏰</span>
                          <span className="meta-text">
                            {new Date(game.scheduledAt).toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div className="meta-row">
                          <span className="meta-icon">🏆</span>
                          <span className="meta-text highlight">
                            {game.prizeHighlight || 'Premios en efectivo, combos y sorpresas.'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="partida-selected-chip">
                          ✓ Partida Seleccionada
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tarjeta activa por defecto si no hay lista programada aún */
              <div className="partidas-selection-grid">
                <div className="partida-selection-card selected">
                  <div className="partida-card-top">
                    <div className="partida-radio-wrap">
                      <span className="partida-radio checked" />
                      <span className="partida-status-chip live">
                        🔴 EN VIVO / ACTIVA
                      </span>
                    </div>
                    <div className={`partida-price-badge ${currentPriceQ === 0 ? 'free' : ''}`}>
                      <span className="price-val">
                        {currentPriceQ === 0 ? 'Q0.00' : `Q${currentPriceQ}.00`}
                      </span>
                      <span className="price-unit">
                        {currentPriceQ === 0 ? '¡GRATIS!' : '/ cartón'}
                      </span>
                    </div>
                  </div>

                  <h3 className="partida-card-title">
                    {activeGame?.title || 'Gran Ronda Oficial de Bingotenango'}
                  </h3>

                  <div className="partida-card-meta">
                    <div className="meta-row">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">Transmisión interactiva en vivo por el canal</span>
                    </div>
                    <div className="meta-row">
                      <span className="meta-icon">🏆</span>
                      <span className="meta-text highlight">
                        {activeGame?.currentPrizeTitle || 'Premios en efectivo, combos y sorpresas en vivo.'}
                      </span>
                    </div>
                  </div>

                  <div className="partida-selected-chip">
                    ✓ Partida Seleccionada
                  </div>
                </div>
              </div>
            )}

            {/* BOTÓN CONTINUAR PASO 1 */}
            <div className="step-actions-footer single-action">
              <button
                type="button"
                className="btn-step-next"
                onClick={() => goToStep(2)}
              >
                Continuar al Paso 2: Modo de Juego ➔
              </button>
            </div>
          </section>
        )}

        {/* ==========================================================================
            PASO 2: ¿CÓMO DESEAS PARTICIPAR?
            ========================================================================== */}
        {currentStep === 2 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <span className="step-badge-indicator">PASO 2 DE 4</span>
              <h2 className="step-main-title">
                2. ¿CÓMO DESEAS PARTICIPAR?
              </h2>
              <p className="step-main-desc">
                Elige si jugarás tú mismo en la sala desde este dispositivo o si deseas repartir enlaces independientes a tus contactos.
              </p>
            </div>

            {/* Resumen de la partida seleccionada */}
            <div className="step-current-game-pill">
              <span className="pill-item-game">
                🎮 Partida: <strong>{selectedScheduledGame?.title || activeGame?.title || 'Partida Oficial'}</strong>
              </span>
              <span className="pill-sep">•</span>
              <span className="pill-item-price">
                Costo: <strong>{currentPriceQ === 0 ? 'Gratis (Q0.00)' : `Q${currentPriceQ}.00 / cartón`}</strong>
              </span>
            </div>

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
                  <p>Jugarás tú mismo desde este celular o computadora. Recibirás tu pase con tus cartones listos para marcar en pantalla.</p>
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
                  <p>Comprarás links independientes para enviar a tus amigos o familiares por WhatsApp para que cada uno juegue en su propio teléfono.</p>
                  <span className="mode-limit-badge gift-badge">De 1 a 10 links</span>
                </div>
              </div>
            </div>

            {/* ACCIONES DEL PASO 2 */}
            <div className="step-actions-footer">
              <button 
                type="button" 
                className="btn-step-prev"
                onClick={() => goToStep(1)}
              >
                ⬅️ Volver a Partidas
              </button>
              <button 
                type="button" 
                className="btn-step-next"
                onClick={() => goToStep(3)}
              >
                Continuar al Paso 3: Cantidad ➔
              </button>
            </div>
          </section>
        )}

        {/* ==========================================================================
            PASO 3: ¿CON CUÁNTOS CARTONES JUGARÁS?
            ========================================================================== */}
        {currentStep === 3 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <span className="step-badge-indicator">PASO 3 DE 4</span>
              <h2 className="step-main-title">
                {purchaseMode === 'personal' ? '3. ¿CON CUÁNTOS CARTONES JUGARÁS?' : '3. ¿CUÁNTOS LINKS PARA CONTACTOS NECESITAS?'}
              </h2>
              <p className="step-main-desc">
                {purchaseMode === 'personal' 
                  ? '💡 Recomendación: de 1 a 3 cartones es ideal para marcar cómodo sin perder números en vivo.'
                  : '💡 Cada link es 100% independiente para que un contacto diferente ingrese a su propio juego.'}
              </p>
            </div>

            {/* Resumen de partida y modalidad */}
            <div className="step-current-game-pill">
              <span className="pill-item-game">
                🎮 <strong>{selectedScheduledGame?.title || activeGame?.title || 'Partida Oficial'}</strong>
              </span>
              <span className="pill-sep">•</span>
              <span className="pill-item-mode">
                Modo: <strong>{purchaseMode === 'personal' ? 'Para mí' : 'Para repartir'}</strong>
              </span>
            </div>

            <div className="quantity-guided-card">
              <div className="quantity-header">
                <div>
                  <h3 className="quantity-title">
                    Selecciona tu cantidad
                  </h3>
                  <p className="quantity-help-text">
                    {purchaseMode === 'personal' ? 'Elige cuántos cartones deseas tener en pantalla simultáneamente.' : 'Elige cuántos enlaces independientes deseas adquirir.'}
                  </p>
                </div>
                
                <div className="quantity-summary-badge">
                  Total: <strong>{currentPriceQ === 0 ? 'Q0.00 (Gratis)' : `Q${totalPriceQ}.00`}</strong>
                </div>
              </div>

              {/* MODO PERSONAL: SELECTOR DE 1 A 3 CARTONES */}
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
                      <span className="qty-price">
                        {currentPriceQ === 0 ? 'Q0.00 (Gratis)' : `Q${qty * currentPriceQ}.00`}
                      </span>
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

              {/* TARJETA DE RESUMEN DE PRECIO */}
              <div className="step-pricing-detail-box">
                <div className="pricing-row">
                  <span>Precio unitario por cartón:</span>
                  <strong>{currentPriceQ === 0 ? 'Q0.00 (Entrada Gratuita)' : `Q${currentPriceQ}.00`}</strong>
                </div>
                <div className="pricing-row">
                  <span>Cantidad seleccionada:</span>
                  <strong>{quantity} {quantity === 1 ? (purchaseMode === 'personal' ? 'cartón' : 'link') : (purchaseMode === 'personal' ? 'cartones' : 'links')}</strong>
                </div>
                <div className="pricing-divider" />
                <div className="pricing-row total-highlight">
                  <span>Total estimado a pagar:</span>
                  <strong className={currentPriceQ === 0 ? 'free-total' : ''}>
                    {currentPriceQ === 0 ? 'Q0.00 (Totalmente Gratis)' : `Q${totalPriceQ}.00 GTQ`}
                  </strong>
                </div>
              </div>
            </div>

            {/* ACCIONES DEL PASO 3 */}
            <div className="step-actions-footer">
              <button 
                type="button" 
                className="btn-step-prev"
                onClick={() => goToStep(2)}
              >
                ⬅️ Volver a Modalidad
              </button>
              <button 
                type="button" 
                className="btn-step-next"
                onClick={() => goToStep(4)}
              >
                Continuar al Paso 4: Datos de Entrega ➔
              </button>
            </div>
          </section>
        )}

        {/* ==========================================================================
            PASO 4: DATOS DE ENTREGA Y PAGO SEGURO
            ========================================================================== */}
        {currentStep === 4 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <span className="step-badge-indicator">PASO 4 DE 4</span>
              <h2 className="step-main-title">
                4. DATOS DE ENTREGA Y PAGO SEGURO
              </h2>
              <p className="step-main-desc">
                {purchaseMode === 'personal' 
                  ? 'Ingresa tu nombre y tu número de WhatsApp para generar tu pase de juego en vivo de forma inmediata.' 
                  : 'A este WhatsApp te enviaremos la lista completa de links para compartir con tus contactos.'}
              </p>
            </div>

            {/* RESUMEN DETALLADO DE LA ORDEN ANTES DE PAGAR */}
            <div className="step-order-summary-card">
              <div className="order-summary-header">
                <span className="summary-card-icon">📋</span>
                <h4>Resumen de tu Pedido</h4>
              </div>
              <div className="order-summary-body">
                <div className="order-summary-item">
                  <span className="lbl">Partida:</span>
                  <span className="val">{selectedScheduledGame?.title || activeGame?.title || 'Partida Oficial'}</span>
                </div>
                <div className="order-summary-item">
                  <span className="lbl">Modalidad:</span>
                  <span className="val">{purchaseMode === 'personal' ? '👤 Para mí (Uso Personal)' : '🎁 Para repartir a contactos'}</span>
                </div>
                <div className="order-summary-item">
                  <span className="lbl">Cartones / Links:</span>
                  <span className="val font-highlight">{quantity} {quantity === 1 ? 'cartón' : 'cartones'}</span>
                </div>
                <div className="order-summary-divider" />
                <div className="order-summary-item total-row">
                  <span className="lbl">Total Final:</span>
                  <span className={`val total-big ${currentPriceQ === 0 ? 'free-badge' : ''}`}>
                    {currentPriceQ === 0 ? 'Q0.00 (Acceso Libre)' : `Q${totalPriceQ}.00 GTQ`}
                  </span>
                </div>
              </div>
            </div>

            {/* FORMULARIO FINAL */}
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

              {/* CAMPO WHATSAPP CON PREFIJO +502 FIJO NO EDITABLE */}
              <div className="form-group-guided">
                <label htmlFor="playerWhatsapp">
                  WhatsApp para Entrega en Guatemala *
                </label>
                
                <div className="phone-prefix-input-group">
                  <div className="phone-fixed-prefix" title="Código de país fijo: Guatemala (+502)">
                    <span className="flag-icon">🇬🇹</span>
                    <span className="code-text">+502</span>
                    <span className="lock-icon" aria-label="Fijo">🔒</span>
                  </div>
                  <input 
                    id="playerWhatsapp"
                    type="tel" 
                    inputMode="numeric"
                    className="guided-input phone-input-digits" 
                    placeholder="5555 1234" 
                    value={playerWhatsappDigits}
                    onChange={(e) => handleWhatsappDigitsChange(e.target.value)}
                    maxLength={8}
                    required
                  />
                </div>
                <span className="field-hint-text">
                  Ingresa únicamente los 8 dígitos de tu número celular en Guatemala. El código <strong>+502</strong> ya está fijado automáticamente.
                </span>
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

              {/* AVISO DE ENTREGA INSTANTÁNEA POR TELEGRAM O WHATSAPP */}
              <div className="step-delivery-notice">
                <span className="notice-icon">🤖</span>
                <div className="notice-body">
                  <strong>Entrega Instantánea en Telegram o WhatsApp</strong>
                  <span>
                    Al confirmar tu orden, recibirás tus cartones automáticamente en <strong>Telegram (@Bingotenangobot)</strong> con 1 solo toque o podrás abrirlos directo en este navegador.
                  </span>
                </div>
              </div>

              {/* BARRA DE ACCIONES FINALES */}
              <div className="step-actions-footer final-checkout-actions">
                <button 
                  type="button" 
                  className="btn-step-prev"
                  onClick={() => goToStep(3)}
                  disabled={isProcessing}
                >
                  ⬅️ Volver a Cantidad
                </button>

                <button 
                  type="submit" 
                  className="btn-guided-pay"
                  disabled={isProcessing}
                  style={currentPriceQ === 0 ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 25px rgba(16, 185, 129, 0.45)'
                  } : undefined}
                >
                  {isProcessing 
                    ? (currentPriceQ === 0 ? 'Generando Boletos Gratis...' : 'Conectando Pasarela...') 
                    : (currentPriceQ === 0 ? '🎁 Confirmar y Obtener Boletos Gratis' : `💳 Pagar Q${totalPriceQ}.00 con Recurrente`)}
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
          </section>
        )}

        {/* AYUDA POR WHATSAPP O PAGO EN EFECTIVO */}
        <div className="cash-help-banner">
          <p>
            ¿Prefieres pagar en <strong>Efectivo</strong> o necesitas ayuda personalizada?
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
