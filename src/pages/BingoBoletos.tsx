import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, addDoc, getDoc, setDoc, doc, onSnapshot, query, limit, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoGame, BingoScheduledGame, BingoAccessToken } from '../types';
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
  { num: 3 as const, title: 'Tus Datos', icon: '📝', label: '3. Tus Datos' },
  { num: 4 as const, title: 'Pago', icon: '💳', label: '4. Pago' },
];

const BingoBoletos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlScheduledGameId = searchParams.get('scheduledGame');

  // Estado del flujo guiado (Paso 1, 2, 3)
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Modo de compra guiado: 'personal' (1 cartón en este dispositivo) o 'gift' (1 a 20 links para contactos)
  const [purchaseMode, setPurchaseMode] = useState<'personal' | 'gift'>('personal');
  const [giftQuantity, setGiftQuantity] = useState<number>(1);
  const quantity = purchaseMode === 'personal' ? 1 : Math.max(1, Math.min(20, giftQuantity));

  const handleGiftQuantityChange = (val: number) => {
    const safe = Math.max(1, Math.min(20, val));
    setGiftQuantity(safe);
  };
  const [playerName, setPlayerName] = useState('');
  
  // WhatsApp: Solo los 8 dígitos locales de Guatemala (el +502 es fijo y no editable)
  const [playerWhatsappDigits, setPlayerWhatsappDigits] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'recurrente' | 'efectivo'>('recurrente');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sincronización del juego activo y partidas programadas en Firestore
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);
  const [scheduledGames, setScheduledGames] = useState<BingoScheduledGame[]>([]);
  const [selectedScheduledGame, setSelectedScheduledGame] = useState<BingoScheduledGame | null>(null);
  const [recurrenteLinks, setRecurrenteLinks] = useState<{ [pkgId: string]: string }>({});
  const [recurrenteSecretKey, setRecurrenteSecretKey] = useState<string>('');


  // Cargar juego activo
  useEffect(() => {
    const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
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


  // Lista unificada de todas las partidas disponibles (programadas + juego activo si no está duplicado)
  const allAvailableGames: BingoScheduledGame[] = [...scheduledGames];
  if (activeGame && !scheduledGames.some(g => g.id === activeGame.id || (activeGame.scheduledGameId && g.id === activeGame.scheduledGameId))) {
    allAvailableGames.unshift({
      id: activeGame.id,
      title: activeGame.title || 'Gran Ronda Oficial de Bingotenango',
      scheduledAt: activeGame.nextRoundTime || Date.now(),
      cardPriceQ: activeGame.cardPriceQ ?? (activeGame.gameType === 'tier-free' ? 0 : 10),
      gameType: activeGame.gameType || (activeGame.cardPriceQ === 0 ? 'tier-free' : 'tier-10'),
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
    : (activeGame?.cardPriceQ !== undefined ? activeGame.cardPriceQ : 10);
  const currentTierId = selectedScheduledGame?.gameType || activeGame?.gameType || (currentPriceQ === 0 ? 'tier-free' : currentPriceQ === 10 ? 'tier-10' : currentPriceQ === 50 ? 'tier-50' : currentPriceQ === 100 ? 'tier-100' : currentPriceQ === 25 ? 'tier-25' : 'tier-10');
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

  // Alternar entre modos de compra
  const handleModeChange = (mode: 'personal' | 'gift') => {
    setPurchaseMode(mode);
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
    if (step >= 2 && !selectedScheduledGame && !activeGame) {
      setErrorMessage('Por favor selecciona una partida para continuar.');
      return;
    }
    if (step === 4) {
      if (!playerName.trim()) {
        setErrorMessage('⚠️ Ingresa tu Nombre y Apellido para continuar.');
        const el = document.getElementById('playerName');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      if (playerWhatsappDigits.trim().length !== 8) {
        setErrorMessage('⚠️ Ingresa los 8 dígitos de tu número de teléfono (ej. 5555 1234).');
        const el = document.getElementById('playerPhone');
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleContinueToStep4 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    goToStep(4);
  };

  // Procesar pago en efectivo presencial con verificación manual de un promotor
  const handleProceedToCashPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!playerName.trim()) {
      setErrorMessage('⚠️ Ingresa tu Nombre y Apellido para registrar tu boleto.');
      const el = document.getElementById('playerName');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (playerWhatsappDigits.trim().length !== 8) {
      setErrorMessage('⚠️ Ingresa los 8 dígitos de tu número de teléfono (ej. 5555 1234).');
      const el = document.getElementById('playerPhone');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const cleanPhone = '502' + playerWhatsappDigits.trim();
    setIsProcessing(true);

    try {
      // 0. VERIFICAR DUPLICADOS POR TELÉFONO
      if (purchaseMode === 'personal') {
        const targetGameId = activeGame?.id || 'juego-principal';
        const qExistingCard = query(
          collection(db, 'bingo_cards'),
          where('phone', '==', cleanPhone),
          where('gameId', '==', targetGameId),
          limit(1)
        );
        const existingSnap = await getDocs(qExistingCard);

        if (!existingSnap.empty) {
          const existingCardDoc = existingSnap.docs[0];
          const existingCardId = existingCardDoc.id;
          
          localStorage.setItem('my_bingo_card_id', existingCardId);
          localStorage.setItem('my_bingo_card_ids', JSON.stringify([existingCardId]));
          localStorage.setItem('my_bingo_player_name', playerName.trim());

          navigate(`/juegos/bingo/carton/${existingCardId}`);
          return;
        }
      }
    } catch (checkErr) {
      console.warn("Aviso al verificar cartón previo por teléfono:", checkErr);
    }

    try {
      const targetGameId = activeGame?.id || 'juego-principal';

      // 1. Guardar la orden en Firestore con método efectivo y estado pending
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
        purchaseMode: purchaseMode,
        packageName: purchaseMode === 'personal' 
          ? `${activeTier.name} (${quantity} ${quantity === 1 ? 'Cartón Personal' : 'Cartones Personales'})`
          : `${activeTier.name} (${quantity} ${quantity === 1 ? 'Link para Contacto' : 'Links para Contactos'})`,
        gameId: targetGameId,
        scheduledGameId: selectedScheduledGame?.id || null,
        scheduledGameTitle: selectedScheduledGame?.title || null,
        linkSent: false,
        linkSentAt: null,
        gateway: 'efectivo',
        paymentMethod: 'efectivo',
        paymentStatus: 'pending',
        status: 'pending',
        paidAmount: 0,
        createdAt: Date.now()
      });
      const orderId = orderRef.id;

      // 2. Crear de una vez el pase en bingo_access_tokens con estado pending
      const newTokenId = 'tkn_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      const tokenObj: BingoAccessToken = {
        id: newTokenId,
        orderId: orderId,
        playerName: playerName.trim(),
        playerWhatsapp: cleanPhone,
        tierId: activeTier.id,
        tierName: activeTier.name,
        prizeLevel: activeTier.prizeLevel,
        quantity: quantity,
        purchaseMode: purchaseMode,
        gameId: targetGameId,
        scheduledGameId: selectedScheduledGame?.id || null,
        sessionResetAt: activeGame?.lastResetAt || Date.now(),
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'efectivo',
        paidAmount: 0,
        unitPriceQ: currentPriceQ,
        usedByDevice: null,
        linkSent: false,
        linkSentAt: null,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'bingo_access_tokens', newTokenId), tokenObj);

      // Si es paquete de links para regalo/contactos, pre-crear los tokens individuales en Firestore
      if (purchaseMode === 'gift') {
        for (let i = 1; i <= quantity; i++) {
          const giftTokenId = `tkn_gift_${orderId}_c${i}`;
          const giftTokenObj: BingoAccessToken = {
            id: giftTokenId,
            orderId: orderId,
            playerName: `${playerName.trim()} (Contacto #${i})`,
            playerWhatsapp: cleanPhone,
            tierId: activeTier.id,
            tierName: activeTier.name,
            prizeLevel: activeTier.prizeLevel,
            quantity: 1,
            purchaseMode: 'gift',
            gameId: targetGameId,
            scheduledGameId: selectedScheduledGame?.id || null,
            sessionResetAt: activeGame?.lastResetAt || Date.now(),
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'efectivo',
            paidAmount: 0,
            unitPriceQ: currentPriceQ,
            usedByDevice: null,
            linkSent: false,
            linkSentAt: null,
            createdAt: Date.now()
          };
          await setDoc(doc(db, 'bingo_access_tokens', giftTokenId), giftTokenObj);
        }
      }

      // Guardar nombre en localStorage
      localStorage.setItem('my_bingo_player_name', playerName.trim());

      // Redirigir a confirmación en modo de espera presencial
      navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&tokenId=${newTokenId}&paymentMethod=efectivo&status=pending_cash&playerName=${encodeURIComponent(playerName.trim())}&phone=${cleanPhone}&tier=${activeTier.id}&tierName=${encodeURIComponent(activeTier.name)}&qty=${quantity}&mode=${purchaseMode}&price=${totalPriceQ}&totalPrice=${totalPriceQ}&unitPrice=${currentPriceQ}`);
    } catch (cashErr) {
      console.error("Error al registrar orden en efectivo:", cashErr);
      setErrorMessage("No se pudo registrar la solicitud en efectivo. Intenta de nuevo o contáctanos por WhatsApp.");
      setIsProcessing(false);
    }
  };

  // Procesar pago / confirmación
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentPriceQ > 0 && paymentMethodChoice === 'efectivo') {
      return handleProceedToCashPayment(e);
    }

    if (!playerName.trim()) {
      setErrorMessage('⚠️ Ingresa tu Nombre y Apellido para continuar.');
      const el = document.getElementById('playerName');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (playerWhatsappDigits.trim().length !== 8) {
      setErrorMessage('⚠️ Ingresa los 8 dígitos de tu número de teléfono (ej. 5555 1234).');
      const el = document.getElementById('playerPhone');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const cleanPhone = '502' + playerWhatsappDigits.trim();

    setIsProcessing(true);

    try {
      // 0. VERIFICAR DUPLICADOS POR TELÉFONO: Si el jugador ya tiene un cartón en juego para esta partida
      if (purchaseMode === 'personal') {
        const targetGameId = activeGame?.id || 'juego-principal';
        const qExistingCard = query(
          collection(db, 'bingo_cards'),
          where('phone', '==', cleanPhone),
          where('gameId', '==', targetGameId),
          limit(1)
        );
        const existingSnap = await getDocs(qExistingCard);

        if (!existingSnap.empty) {
          const existingCardDoc = existingSnap.docs[0];
          const existingCardId = existingCardDoc.id;
          
          // Guardar sesión en navegador
          localStorage.setItem('my_bingo_card_id', existingCardId);
          localStorage.setItem('my_bingo_card_ids', JSON.stringify([existingCardId]));
          localStorage.setItem('my_bingo_player_name', playerName.trim());

          // Redirigir de inmediato al cartón activo
          navigate(`/juegos/bingo/carton/${existingCardId}`);
          return;
        }
      }
    } catch (checkErr) {
      console.warn("Aviso al verificar cartón previo por teléfono:", checkErr);
    }

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
        if (purchaseMode === 'gift') {
          for (let i = 1; i <= quantity; i++) {
            const giftTokenId = `tkn_gift_${orderId}_c${i}`;
            await setDoc(doc(db, 'bingo_access_tokens', giftTokenId), {
              id: giftTokenId,
              orderId: orderId,
              playerName: `${playerName.trim()} (Contacto #${i})`,
              playerWhatsapp: cleanPhone,
              tierId: 'tier-free',
              tierName: 'Cartón Gratuito',
              prizeLevel: 'Partida Gratuita',
              quantity: 1,
              purchaseMode: 'gift',
              gameId: activeGame?.id || 'default_game',
              scheduledGameId: selectedScheduledGame?.id || null,
              sessionResetAt: activeGame?.lastResetAt || Date.now(),
              status: 'active',
              paymentStatus: 'paid',
              paymentMethod: 'gratis',
              paidAmount: 0,
              unitPriceQ: 0,
              usedByDevice: null,
              linkSent: false,
              linkSentAt: null,
              createdAt: Date.now()
            });
          }
        }
        navigate(`/juegos/bingo/boletos/confirmacion?orderId=${orderId}&status=success&playerName=${encodeURIComponent(playerName.trim())}&phone=${cleanPhone}&tier=tier-free&tierName=${encodeURIComponent('Cartón Gratuito')}&qty=${quantity}&mode=${purchaseMode}&price=0&totalPrice=0&unitPrice=0`);
        return;
      }
    } catch (fsErr) {
      console.warn("Aviso al guardar orden:", fsErr);
    }

    try {
      // Guardar copia local de la orden en sessionStorage para resiliencia absoluta
      try {
        sessionStorage.setItem('last_bingo_order', JSON.stringify({
          orderId,
          playerName: playerName.trim(),
          playerWhatsapp: cleanPhone,
          playerEmail: playerEmail.trim() || null,
          tierId: activeTier.id,
          tierName: activeTier.name,
          prizeLevel: activeTier.prizeLevel,
          unitPriceQ: currentPriceQ,
          quantity,
          priceQ: totalPriceQ,
          totalPriceQ: totalPriceQ,
          cartonesCount: quantity,
          purchaseMode,
          packageName: purchaseMode === 'personal' 
            ? `${activeTier.name} (${quantity} ${quantity === 1 ? 'Cartón Personal' : 'Cartones Personales'})`
            : `${activeTier.name} (${quantity} ${quantity === 1 ? 'Link para Contacto' : 'Links para Contactos'})`,
          gameId: activeGame?.id || 'default_game',
          scheduledGameId: selectedScheduledGame?.id || null,
          scheduledGameTitle: selectedScheduledGame?.title || null,
          createdAt: Date.now()
        }));
      } catch (cacheErr) {
        console.warn("Aviso guardando orden en sessionStorage:", cacheErr);
      }

      const successParams = new URLSearchParams({
        orderId: orderId,
        status: 'success',
        tier: activeTier.id,
        tierName: activeTier.name,
        price: String(totalPriceQ),
        totalPrice: String(totalPriceQ),
        unitPrice: String(currentPriceQ),
        qty: String(quantity),
        mode: purchaseMode,
        name: playerName.trim(),
        playerName: playerName.trim(),
        phone: cleanPhone,
        gameId: activeGame?.id || '',
        scheduledGameId: selectedScheduledGame?.id || ''
      }).toString();

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
              success_url: `${window.location.origin}/juegos/bingo/boletos/confirmacion?${successParams}`,
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
          linkObj.searchParams.set('redirect_url', `${window.location.origin}/juegos/bingo/boletos/confirmacion?${successParams}`);
          window.location.href = linkObj.toString();
        } catch {
          const separator = configuredLink.includes('?') ? '&' : '?';
          const returnUrl = encodeURIComponent(`${window.location.origin}/juegos/bingo/boletos/confirmacion?${successParams}`);
          let finalUrl = `${configuredLink}${separator}locale=es&lang=es&customer_name=${encodeURIComponent(playerName)}&customer_phone=${encodeURIComponent(cleanPhone)}&redirect_url=${returnUrl}`;
          if (playerEmail.trim()) {
            finalUrl += `&customer_email=${encodeURIComponent(playerEmail.trim())}`;
          }
          window.location.href = finalUrl;
        }
        return;
      } else {
        navigate(`/juegos/bingo/boletos/confirmacion?${successParams}&testMode=true`);
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
        </header>

        {/* BARRA DE NAVEGACIÓN Y PROGRESO DE LOS 4 PASOS */}
        <nav className="boletos-stepper-bar" aria-label="Progreso de compra">
          {WIZARD_STEPS.map((stepItem) => {
            const isCurrent = currentStep === stepItem.num;
            const isCompleted = currentStep > stepItem.num;
            return (
              <button
                key={stepItem.num}
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
            PASO 1: ESCOGER LA PARTIDA (CARRUSEL HORIZONTAL BIDIRECCIONAL)
            ========================================================================== */}
        {currentStep === 1 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <h2 className="step-main-title">
                1. ESCOGE TU PARTIDA
              </h2>
            </div>

            {/* CARRUSEL HORIZONTAL CON SÍMBOLO DE DESPLAZAMIENTO */}
            <div className="partidas-carousel-wrapper">
              <div className="partidas-carousel-top-bar">
                <span className="partidas-scroll-legend">
                  <span className="scroll-symbol-pulse">↔️</span>
                  <span>Desliza horizontalmente</span>
                </span>
              </div>

              <div className="partidas-horizontal-track">
                {allAvailableGames.length > 0 ? (
                  allAvailableGames.map((game) => {
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
                              {isFree ? 'Q0.00' : `Q${game.cardPriceQ ?? (activeGame?.cardPriceQ ?? 10)}.00`}
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
                  })
                ) : (
                  /* Tarjeta activa por defecto si no hay lista programada aún */
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
                )}
              </div>
            </div>

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
              <h2 className="step-main-title">
                2. ¿CÓMO DESEAS PARTICIPAR?
              </h2>
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
                  <p>Jugarás tú mismo desde este celular.</p>
                  <span className="mode-limit-badge">1 cartón por dispositivo móvil</span>
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
                  <h4>Para regalar a contactos</h4>
                  <p>Compra links independientes para enviar a amigos y familia.</p>
                  <span className="mode-limit-badge gift-badge">
                    {purchaseMode === 'gift' 
                      ? `${quantity} ${quantity === 1 ? 'link seleccionado' : 'links seleccionados'}` 
                      : 'Mín 1 • Máx 20 links'}
                  </span>
                </div>
              </div>
            </div>

            {/* SELECTOR DE CANTIDAD PARA REGALO / CONTACTOS */}
            {purchaseMode === 'gift' && (
              <div className="gift-quantity-picker-card">
                <div className="gift-quantity-header">
                  <span className="gift-quantity-badge">🎁 Selección de Links</span>
                  <h3 className="gift-quantity-title">¿Cuántos links deseas comprar?</h3>
                  <p className="gift-quantity-sub">
                    Elige entre <strong>1 y 20 enlaces</strong>. Cada link es único y habilita exactamente un cartón en pantalla para tu contacto.
                  </p>
                </div>

                {/* CONTROLES STEPPER (-) / (+) */}
                <div className="stepper-controls-row">
                  <button 
                    type="button" 
                    className="stepper-action-btn minus"
                    onClick={() => handleGiftQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Disminuir un link"
                    title="Disminuir un link"
                  >
                    −
                  </button>
                  <div className="stepper-display">
                    <span className="stepper-number">{quantity}</span>
                    <span className="stepper-label">{quantity === 1 ? 'LINK INDEPENDIENTE' : 'LINKS INDEPENDIENTES'}</span>
                  </div>
                  <button 
                    type="button" 
                    className="stepper-action-btn plus"
                    onClick={() => handleGiftQuantityChange(quantity + 1)}
                    disabled={quantity >= 20}
                    aria-label="Aumentar un link"
                    title="Aumentar un link"
                  >
                    +
                  </button>
                </div>

                {/* CHIPS DE SELECCIÓN RÁPIDA */}
                <div className="gift-quick-chips-wrapper">
                  <span className="gift-chips-title">Selección rápida:</span>
                  <div className="gift-quick-chips">
                    {[1, 2, 3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`gift-chip ${quantity === num ? 'active' : ''}`}
                        onClick={() => handleGiftQuantityChange(num)}
                      >
                        {num} {num === 1 ? 'link' : 'links'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DESGLOSE DE PRECIO EN TIEMPO REAL */}
                <div className="gift-price-summary-box">
                  <span className="gift-calc-detail">
                    {quantity} {quantity === 1 ? 'link' : 'links'} × {currentPriceQ === 0 ? 'Gratis' : `Q${currentPriceQ}.00`}
                  </span>
                  <span className="gift-calc-total">
                    Total: <strong>{currentPriceQ === 0 ? 'Q0.00' : `Q${totalPriceQ}.00`}</strong>
                  </span>
                </div>

                {/* AVISO DE SEGURIDAD Y VINCULACIÓN DE CARTÓN */}
                <div className="gift-security-notice">
                  <span className="gift-security-icon">⚠️</span>
                  <div className="gift-security-text">
                    <strong>Importante sobre los enlaces:</strong>
                    <p>
                      Cada link es único y habilita solo <strong>un cartón en pantalla</strong>. Compártelos con cuidado: envía cada link únicamente a su dueño, ya que al abrirse en un dispositivo quedará vinculado a esa persona.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                Continuar al Paso 3: Tus Datos ➔
              </button>
            </div>
          </section>
        )}

        {/* ==========================================================================
            PASO 3: FORMULARIO EXCLUSIVO DE DATOS DEL USUARIO
            ========================================================================== */}
        {currentStep === 3 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <h2 className="step-main-title">
                3. INGRESA TUS DATOS
              </h2>
            </div>

            {/* FORMULARIO DE DATOS DEL JUGADOR */}
            <form onSubmit={handleContinueToStep4} className="checkout-guided-form" noValidate>
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

              {/* CAMPO NÚMERO DE TELÉFONO CON PREFIJO +502 FIJO NO EDITABLE */}
              <div className="form-group-guided">
                <label htmlFor="playerPhone">
                  Número de Teléfono *
                </label>
                
                <div className="phone-prefix-input-group">
                  <div className="phone-fixed-prefix" title="Código de país fijo: Guatemala (+502)">
                    <span className="flag-icon">🇬🇹</span>
                    <span className="code-text">+502</span>
                    <span className="lock-icon" aria-label="Fijo">🔒</span>
                  </div>
                  <input 
                    id="playerPhone"
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
              </div>

              <div className="form-group-guided">
                <label htmlFor="playerEmail">Correo Electrónico (Opcional, para comprobante)</label>
                <input 
                  id="playerEmail"
                  type="email" 
                  className="guided-input" 
                  placeholder="correo@ejemplo.com" 
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                />
              </div>

              {/* MENSAJE DE ERROR LOCALIZADO EN EL PASO 3 */}
              {errorMessage && (
                <div className="checkout-error-banner" style={{ marginTop: '14px', marginBottom: '14px' }}>
                  ⚠️ {errorMessage}
                </div>
              )}

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
                  type="submit" 
                  className="btn-step-next"
                >
                  Continuar al Paso 4: Forma de Pago ➔
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==========================================================================
            PASO 4: MÉTODO DE PAGO Y CONFIRMACIÓN
            ========================================================================== */}
        {currentStep === 4 && (
          <section className="boletos-step-container">
            <div className="step-header-wrap">
              <h2 className="step-main-title">
                4. MÉTODO DE PAGO Y CONFIRMACIÓN
              </h2>
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
                  <span className="val">
                    {purchaseMode === 'personal' 
                      ? '👤 Para mí (Jugar en este celular)' 
                      : `🎁 Para regalar (${quantity} ${quantity === 1 ? 'contacto' : 'contactos'})`}
                  </span>
                </div>
                <div className="order-summary-item">
                  <span className="lbl">Nombre:</span>
                  <span className="val">{playerName}</span>
                </div>
                <div className="order-summary-item">
                  <span className="lbl">Teléfono:</span>
                  <span className="val font-highlight">+502 {playerWhatsappDigits}</span>
                </div>
                <div className="order-summary-item">
                  <span className="lbl">{purchaseMode === 'gift' ? 'Total de enlaces:' : 'Número de cartones:'}</span>
                  <span className="val font-highlight">
                    {quantity} {purchaseMode === 'gift' 
                      ? (quantity === 1 ? 'link independiente' : 'links independientes') 
                      : (quantity === 1 ? 'cartón oficial' : 'cartones oficiales')}
                  </span>
                </div>
                <div className="order-summary-divider" />
                <div className="order-summary-item total-row">
                  <span className="lbl">Total Final:</span>
                  <span className={`val total-big ${currentPriceQ === 0 ? 'free-badge' : ''}`}>
                    {currentPriceQ === 0 ? 'Q0.00' : `Q${totalPriceQ}.00`}
                  </span>
                </div>
              </div>
            </div>

            {/* AVISO RECORDATORIO EN CHECKOUT PARA MODALIDAD REGALO */}
            {purchaseMode === 'gift' && (
              <div className="gift-checkout-reminder">
                <span className="reminder-icon">⚠️</span>
                <p>
                  Recibirás <strong>{quantity} {quantity === 1 ? 'enlace único' : 'enlaces únicos'}</strong> por WhatsApp o Telegram al confirmar tu compra. Cada link es exclusivo y habilita <strong>solo un cartón en pantalla</strong> para la persona que lo abra.
                </p>
              </div>
            )}

            {/* FORMULARIO Y SELECTOR DE PAGO */}
            <form onSubmit={handleProceedToPayment} className="checkout-guided-form" noValidate>
              {/* OPCIONES DE PAGO SI TIENE COSTO (TARJETA/TRANSFERENCIA O EFECTIVO) */}
              {currentPriceQ > 0 && (
                <div className="payment-method-selector-section">
                  <span className="payment-method-selector-title">
                    💳 Elige tu Forma de Pago:
                  </span>

                  <div className="payment-method-options-grid">
                    {/* OPCIÓN 1: TARJETA O TRANSFERENCIA */}
                    <div 
                      className={`payment-option-card ${paymentMethodChoice === 'recurrente' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethodChoice('recurrente')}
                    >
                      <div className="option-radio-circle">
                        <span className={`radio-inner ${paymentMethodChoice === 'recurrente' ? 'active' : ''}`} />
                      </div>
                      <div className="option-icon">💳</div>
                      <div className="option-info">
                        <div className="option-title-tag">
                          <strong>Pagar con tarjeta o transferencia</strong>
                          <span className="option-tag-instant">AUTOMÁTICO</span>
                        </div>
                        <p>Paga en línea con tarjeta de débito, crédito o transferencia. Tu pase y cartón se activan al instante.</p>
                      </div>
                    </div>

                    {/* OPCIÓN 2: EFECTIVO */}
                    <div 
                      className={`payment-option-card ${paymentMethodChoice === 'efectivo' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethodChoice('efectivo')}
                    >
                      <div className="option-radio-circle">
                        <span className={`radio-inner ${paymentMethodChoice === 'efectivo' ? 'active' : ''}`} />
                      </div>
                      <div className="option-icon">💵</div>
                      <div className="option-info">
                        <div className="option-title-tag">
                          <strong>Pagar en efectivo</strong>
                          <span className="option-tag-manual">PROMOTOR CERCA</span>
                        </div>
                        <p>Pago presencial en efectivo. Un promotor habilitará tu cartón manualmente.</p>
                      </div>
                    </div>
                  </div>

                  {/* ADVERTENCIA OBLIGATORIA AL SELECCIONAR PAGO EN EFECTIVO */}
                  {paymentMethodChoice === 'efectivo' && (
                    <div className="cash-promoter-warning">
                      <span className="warning-symbol">⚠️</span>
                      <div className="warning-content">
                        <p>
                          <strong>Pago presencial:</strong> Un promotor o encargado debe estar cerca para cobrar tu dinero y habilitar tu cartón en el registro.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MENSAJE DE ERROR LOCALIZADO EN EL PASO 4 */}
              {errorMessage && (
                <div className="checkout-error-banner" style={{ marginTop: '14px', marginBottom: '14px' }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* BARRA DE ACCIONES FINALES - UN SOLO BOTÓN SEGÚN SELECCIÓN */}
              <div className="step-actions-footer final-checkout-actions">
                <button 
                  type="button" 
                  className="btn-step-prev"
                  onClick={() => goToStep(3)}
                  disabled={isProcessing}
                >
                  ⬅️ Volver a Tus Datos
                </button>

                {currentPriceQ === 0 ? (
                  <button 
                    type="submit" 
                    className="btn-guided-pay"
                    disabled={isProcessing}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 25px rgba(16, 185, 129, 0.45)'
                    }}
                  >
                    {isProcessing ? 'Generando...' : '🎁 Confirmar y Obtener Boleto Gratis'}
                  </button>
                ) : paymentMethodChoice === 'recurrente' ? (
                  <button 
                    type="submit" 
                    className="btn-guided-pay"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Conectando...' : '💳 Pagar con tarjeta o transferencia'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn-guided-pay btn-guided-cash"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleProceedToCashPayment(e);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Registrando...' : '💵 Pagar en efectivo'}
                  </button>
                )}
              </div>

              <div className="guided-trust-bar">
                <span>🔒 Pago Cifrado</span>
                <span>•</span>
                <span>⚡ Entrega Inmediata</span>
                <span>•</span>
                <span>🇬🇹 Válido en toda Guatemala</span>
              </div>
            </form>

            {/* RECORDATORIO BOT OFICIAL DE TELEGRAM AL FINAL DE LA PÁGINA */}
            <div className="step-delivery-notice" style={{ marginTop: '24px' }}>
              <span className="notice-icon">✈️</span>
              <div className="notice-body" style={{ width: '100%' }}>
                <span style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '8px', display: 'block' }}>
                  Si quieres jugar seguido y estar pendiente de nuestros bingos, sigue el link y presiona <strong>Start</strong>:
                </span>
                <a
                  href="https://t.me/Bingotenangobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(34, 158, 217, 0.25) 0%, rgba(14, 165, 233, 0.35) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: '#38bdf8',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-gamer)',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 12px rgba(14, 165, 233, 0.2)'
                  }}
                >
                  <span>✈️</span>
                  <span>Abrir @Bingotenangobot en Telegram</span>
                </a>
              </div>
            </div>
          </section>
        )}


      </div>
    </div>
  );
};

export default BingoBoletos;
