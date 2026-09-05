import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { collection, query, where, onSnapshot, limit, updateDoc, doc, setDoc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { BingoGame, BingoCard, BingoPrize, Sponsor, BingoPromoter, BingoAccessToken, BingoScheduledGame } from '../../types';
import { generateBingoMatrix, hashBingoMatrix, validateBingoCard, checkCardCollision } from '../../utils/bingoGenerator';
import type { MarkedSlots } from '../../utils/bingoGenerator';
import { soundEffects } from '../../utils/soundEffects';
import { CONTACT } from '../../constants';
import './Bingo.css';

type StoredCardMatrix = {
  r0: (number | null)[];
  r1: (number | null)[];
  r2: (number | null)[];
  r3: (number | null)[];
  r4: (number | null)[];
};

interface WinnerHistoryEntry {
  id: string;
  timestamp?: number;
  playerName?: string;
  prize?: string;
  cardId?: string;
  gameId?: string;
  drawnCount?: number;
  gameTitle?: string;
  winningPattern?: string;
}

const DEFAULT_SAMPLE_PRIZES: BingoPrize[] = [
  {
    id: 'p1',
    title: '🥇 Premio Mayor: Smart TV 55" 4K HDR',
    description: 'Pantalla inteligente de alta resolución con conectividad WiFi y sonido envolvente para el ganador principal.',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=60',
    category: 'Tecnología',
    order: 3
  },
  {
    id: 'p2',
    title: '🥈 Segundo Premio: Tablet Educativa 10"',
    description: 'Tablet de alto rendimiento ideal para estudio, lectura digital e interacción con contenidos educativos.',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
    category: 'Estudio',
    order: 2
  },
  {
    id: 'p3',
    title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas',
    description: 'Paquete de libros infantiles y juveniles ilustrados con historias mágicas de nuestra editorial.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60',
    category: 'Editorial',
    order: 1
  }
];

const getBallMeta = (num: number) => {
  let letter = 'B';
  let range = '1 - 15';
  let color = '#0ea5e9'; // Electric cyan/blue
  let gradient = 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 50%, #0369a1 85%, #082f49 100%)';
  let glow = 'rgba(14, 165, 233, 0.6)';
  let darkText = '#0369a1';

  if (num > 15 && num <= 30) {
    letter = 'I';
    range = '16 - 30';
    color = '#ec4899'; // Hot pink / magenta
    gradient = 'radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 50%, #be185d 85%, #831843 100%)';
    glow = 'rgba(236, 72, 153, 0.6)';
    darkText = '#be185d';
  } else if (num > 30 && num <= 45) {
    letter = 'N';
    range = '31 - 45';
    color = '#a855f7'; // Purple / violet
    gradient = 'radial-gradient(circle at 35% 30%, #c084fc 0%, #9333ea 50%, #7e22ce 85%, #581c87 100%)';
    glow = 'rgba(168, 85, 247, 0.6)';
    darkText = '#7e22ce';
  } else if (num > 45 && num <= 60) {
    letter = 'G';
    range = '46 - 60';
    color = '#10b981'; // Emerald
    gradient = 'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 50%, #047857 85%, #064e3b 100%)';
    glow = 'rgba(16, 185, 129, 0.6)';
    darkText = '#047857';
  } else if (num > 60 && num <= 75) {
    letter = 'O';
    range = '61 - 75';
    color = '#f59e0b'; // Gold / amber
    gradient = 'radial-gradient(circle at 35% 30%, #fde047 0%, #f59e0b 50%, #d97706 85%, #78350f 100%)';
    glow = 'rgba(245, 158, 11, 0.6)';
    darkText = '#d97706';
  }

  return { letter, range, color, gradient, glow, darkText };
};

const SPANISH_NUMBERS: Record<number, string> = {
  1: 'UNO', 2: 'DOS', 3: 'TRES', 4: 'CUATRO', 5: 'CINCO',
  6: 'SEIS', 7: 'SIETE', 8: 'OCHO', 9: 'NUEVE', 10: 'DIEZ',
  11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
  16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE', 20: 'VEINTE',
  21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO', 25: 'VEINTICINCO',
  26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE', 30: 'TREINTA',
  31: 'TREINTA Y UNO', 32: 'TREINTA Y DOS', 33: 'TREINTA Y TRES', 34: 'TREINTA Y CUATRO', 35: 'TREINTA Y CINCO',
  36: 'TREINTA Y SEIS', 37: 'TREINTA Y SIETE', 38: 'TREINTA Y OCHO', 39: 'TREINTA Y NUEVE', 40: 'CUARENTA',
  41: 'CUARENTA Y UNO', 42: 'CUARENTA Y DOS', 43: 'CUARENTA Y TRES', 44: 'CUARENTA Y CUATRO', 45: 'CUARENTA Y CINCO',
  46: 'CUARENTA Y SEIS', 47: 'CUARENTA Y SIETE', 48: 'CUARENTA Y OCHO', 49: 'CUARENTA Y NUEVE', 50: 'CINCUENTA',
  51: 'CINCUENTA Y UNO', 52: 'CINCUENTA Y DOS', 53: 'CINCUENTA Y TRES', 54: 'CINCUENTA Y CUATRO', 55: 'CINCUENTA Y CINCO',
  56: 'CINCUENTA Y SEIS', 57: 'CINCUENTA Y SIETE', 58: 'CINCUENTA Y OCHO', 59: 'CINCUENTA Y NUEVE', 60: 'SESENTA',
  61: 'SESENTA Y UNO', 62: 'SESENTA Y DOS', 63: 'SESENTA Y TRES', 64: 'SESENTA Y CUATRO', 65: 'SESENTA Y CINCO',
  66: 'SESENTA Y SEIS', 67: 'SESENTA Y SIETE', 68: 'SESENTA Y OCHO', 69: 'SESENTA Y NUEVE', 70: 'SETENTA',
  71: 'SETENTA Y UNO', 72: 'SETENTA Y DOS', 73: 'SETENTA Y TRES', 74: 'SETENTA Y CUATRO', 75: 'SETENTA Y CINCO'
};

export default function BingoHub() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registeredCards, setRegisteredCards] = useState<BingoCard[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<WinnerHistoryEntry[]>([]);

  
  const [playerName, setPlayerName] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerPromoterCode, setPlayerPromoterCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Payment & Code UX States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<'idle' | 'checking' | 'valid' | 'used' | 'invalid'>('idle');
  const [codeValidationMsg, setCodeValidationMsg] = useState('');

  // Access Token States (Pase de Acceso Único de Sesión)
  const [accessTokenData, setAccessTokenData] = useState<BingoAccessToken | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccessMsg, setTokenSuccessMsg] = useState<string | null>(null);

  // Local Storage state to remember current card
  const [savedCardId, setSavedCardId] = useState<string | null>(null);

  // Auto-fill promoter code from URL parameter (?promoter=CODE or ?ref=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('promoter') || params.get('promoterCode') || params.get('ref');
    if (codeFromUrl) {
      setPlayerPromoterCode(codeFromUrl.toUpperCase());
    }
  }, []);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Host verification state
  const [validationResults, setValidationResults] = useState<Record<string, { isWinner: boolean, missing: number[] }>>({});

  // Session Player Directory States
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [showAllIds, setShowAllIds] = useState(false);
  const [showAllPhones, setShowAllPhones] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [selectedPromoterFilter, setSelectedPromoterFilter] = useState('ALL');
  const [promotersList, setPromotersList] = useState<BingoPromoter[]>([]);

  // Instructions Modal state
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [instructionsTab, setInstructionsTab] = useState<'form' | 'promoter' | 'become' | 'rules'>('form');

  // SUB-PESTAÑA EN MÓDULO REGISTRO (Sesión Activa vs Juegos Programados)
  const [waitingSubTab, setWaitingSubTab] = useState<'session_directory' | 'scheduled_games'>('session_directory');
  const [scheduledGamesList, setScheduledGamesList] = useState<BingoScheduledGame[]>([]);
  const [selectedScheduledGame, setSelectedScheduledGame] = useState<BingoScheduledGame | null>(null);
  const [allAccessTokens, setAllAccessTokens] = useState<BingoAccessToken[]>([]);
  const [allBingoOrders, setAllBingoOrders] = useState<any[]>([]);

  // Formulario para Crear Juego Programado
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDateTime, setNewScheduleDateTime] = useState('');
  const [newScheduleTier, setNewScheduleTier] = useState<'tier-10' | 'tier-25' | 'tier-50' | 'tier-100' | 'multi'>('tier-25');
  const [newSchedulePrize, setNewSchedulePrize] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Filtros de la lista de jugadores de la partida programada
  const [scheduledPlayersFilter, setScheduledPlayersFilter] = useState<'all' | 'paid' | 'pending' | 'link_pending' | 'link_sent'>('all');

  useEffect(() => {
    const qPromos = query(collection(db, 'bingo_promoters'));
    const unsubPromos = onSnapshot(qPromos, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BingoPromoter));
      setPromotersList(list);
    }, (err) => {
      console.warn("Could not load promoters list", err);
    });
    return () => unsubPromos();
  }, []);

  // Escuchar partidas programadas en Firestore
  useEffect(() => {
    const qSched = query(collection(db, 'bingo_scheduled_games'));
    const unsubSched = onSnapshot(qSched, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BingoScheduledGame));
      list.sort((a, b) => a.scheduledAt - b.scheduledAt);
      setScheduledGamesList(list);
    }, (err) => {
      console.warn("Could not load scheduled games", err);
    });
    return () => unsubSched();
  }, []);

  // Escuchar tokens de acceso y órdenes para el Host
  useEffect(() => {
    const qTokens = query(collection(db, 'bingo_access_tokens'));
    const unsubTokens = onSnapshot(qTokens, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BingoAccessToken));
      setAllAccessTokens(list);
    }, (err) => {
      console.warn("Could not load access tokens", err);
    });

    const qOrders = query(collection(db, 'bingo_orders'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllBingoOrders(list);
    }, (err) => {
      console.warn("Could not load bingo orders", err);
    });

    return () => {
      unsubTokens();
      unsubOrders();
    };
  }, []);

  const toggleRevealId = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealPhone = (id: string) => {
    setRevealedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sound and Voice announcement states
  const [isMuted, setIsMuted] = useState(true); // Mutado por defecto en el lobby para usuarios comunes
  const prevBallCountRef = useRef<number>(0);
  const announcedShoutsRef = useRef<Set<string>>(new Set());
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Animation states
  const [isRolling, setIsRolling] = useState(false);
  const [rollingBall, setRollingBall] = useState<string>('...');

  // Sponsor & Prizes Visual States
  const [activeSponsorModal, setActiveSponsorModal] = useState<Sponsor | null>(null);
  const [activeSponsorIntegrated, setActiveSponsorIntegrated] = useState<Sponsor | null>(null);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [prizesSort, setPrizesSort] = useState<'asc' | 'desc' | 'category'>('asc');
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const hostRecentBallsRailRef = useRef<HTMLDivElement>(null);

  // Scrolling terminal logs
  const [systemLogs, setSystemLogs] = useState<{ time: string; text: string; type: string }[]>([]);

  // Custom Alert / Confirm Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    icon: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showConfirm = (message: string, title: string = 'Confirmación', icon: string = '⚠️', confirmText: string = 'Aceptar', cancelText: string = 'Cancelar') => {
    return new Promise<boolean>((resolve) => {
      setDialogConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        icon,
        confirmText,
        cancelText,
        onConfirm: () => {
          setDialogConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve(false);
        }
      });
    });
  };

  const showAlert = (message: string, title: string = 'Mensaje', icon: string = '📢', confirmText: string = 'Entendido') => {
    return new Promise<void>((resolve) => {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title,
        message,
        icon,
        confirmText,
        onConfirm: () => {
          setDialogConfig(null);
          resolve();
        }
      });
    });
  };

  const addLog = (text: string, type: 'system' | 'success' | 'warning' = 'system') => {
    const time = new Date().toLocaleTimeString('es-GT', { hour12: false });
    setSystemLogs(prev => [{ time, text, type }, ...prev].slice(0, 30));
  };

  // Sync saved card ID from localStorage and validate against active game
  useEffect(() => {
    if (!activeGame?.id) return;

    const checkSavedCard = async () => {
      const cardId = localStorage.getItem('my_bingo_card_id');
      if (cardId) {
        try {
          const cardSnap = await getDoc(doc(db, 'bingo_cards', cardId));
          if (cardSnap.exists() && cardSnap.data().gameId === activeGame.id) {
            setSavedCardId(cardId);
          } else {
            // The card belongs to a different/old session. Remove it!
            localStorage.removeItem('my_bingo_card_id');
            setSavedCardId(null);
          }
        } catch (e) {
          console.error("Error checking saved card", e);
        }
      }
    };

    checkSavedCard();
  }, [activeGame?.id]);

  // 1. Auto-detect activation code from URL parameter (?code=XXXX)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('code') || urlParams.get('c');
    if (urlCode) {
      setActivationCode(urlCode.trim().toUpperCase());
      addLog(`ENLACE: Código de activación detectado en la URL: ${urlCode.trim().toUpperCase()}`);
    }
  }, []);

  // 1.5 Auto-detect and validate access token from URL (?access=TOKEN o ?a=TOKEN)
  useEffect(() => {
    if (!activeGame?.id) return;
    const urlParams = new URLSearchParams(window.location.search);
    const accessId = urlParams.get('access') || urlParams.get('a');
    if (!accessId) return;

    const validateAccessToken = async () => {
      try {
        setTokenError(null);
        const tokenRef = doc(db, 'bingo_access_tokens', accessId.trim());
        const snap = await getDoc(tokenRef);
        if (!snap.exists()) {
          setTokenError('❌ El pase de acceso no existe o no es válido.');
          return;
        }

        const tData = snap.data() as BingoAccessToken;

        // Validar si coincide con la ronda activa
        if (tData.gameId !== activeGame.id) {
          setTokenError('⚠️ Este pase de acceso pertenecía a una ronda anterior que ya finalizó. Ha perdido su vigencia.');
          return;
        }

        // Validar si la ronda fue reiniciada posteriormente por el Host
        if (activeGame.lastResetAt && tData.sessionResetAt && tData.sessionResetAt < activeGame.lastResetAt) {
          setTokenError('⚠️ Esta ronda fue reiniciada por el organizador. El enlace ha caducado automáticamente.');
          return;
        }

        // Validar un solo uso por dispositivo
        let currentDeviceId = localStorage.getItem('bingo_device_id');
        if (!currentDeviceId) {
          currentDeviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          localStorage.setItem('bingo_device_id', currentDeviceId);
        }

        if (tData.usedByDevice && tData.usedByDevice !== currentDeviceId) {
          setTokenError('⚠️ Este pase ya fue activado desde otro dispositivo. Por seguridad los enlaces son de un solo uso e intransferibles.');
          return;
        }

        // Registrar uso por este dispositivo si aún no está asignado
        if (!tData.usedByDevice) {
          await updateDoc(tokenRef, {
            usedByDevice: currentDeviceId,
            firstUsedAt: Date.now(),
            status: 'used'
          });
        }

        setAccessTokenData(tData);
        setPlayerName(tData.playerName || '');
        if (tData.playerWhatsapp) {
          setPlayerPhone(tData.playerWhatsapp);
        }
        setTokenSuccessMsg(`¡Pase Verificado! ${tData.playerName} — ${tData.quantity} ${tData.quantity === 1 ? 'Cartón' : 'Cartones'} (${tData.tierName || 'Bingo'})`);
        addLog(`ACCESO: Pase de juego verificado para "${tData.playerName}".`);

      } catch (err) {
        console.error("Error validando access token:", err);
        setTokenError('Error al comprobar la vigencia de tu pase de juego.');
      }
    };

    validateAccessToken();
  }, [activeGame?.id, activeGame?.lastResetAt]);

  // 2. Debounced Live Code Validation
  useEffect(() => {
    if (!activeGame || activeGame.customization?.accessConfig?.mode !== 'code') return;
    const trimmed = activationCode.trim().toUpperCase();
    if (!trimmed || trimmed.length < 5) {
      setCodeValidationStatus('idle');
      setCodeValidationMsg('');
      return;
    }

    setCodeValidationStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const codeRef = doc(db, 'bingo_codes', trimmed);
        const codeSnap = await getDoc(codeRef);
        if (!codeSnap.exists() || codeSnap.data()?.gameId !== activeGame.id) {
          setCodeValidationStatus('invalid');
          setCodeValidationMsg('Código no encontrado en la sesión activa');
        } else if (codeSnap.data()?.used) {
          setCodeValidationStatus('used');
          setCodeValidationMsg('Este código ya fue canjeado previamente');
        } else {
          setCodeValidationStatus('valid');
          setCodeValidationMsg('Código de activación disponible 🟢');
        }
      } catch {
        setCodeValidationStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by activationCode and activeGame id, not the whole game object
  }, [activationCode, activeGame?.id]);

  useEffect(() => {
    // Check if the current user is logged in (admin)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setIsAdmin(!!user);
      if (user) {
        setIsMuted(false); // Desmutear automáticamente al administrador
      }
    });

    let isFirstLoad = true;
    const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
    const unsubscribeGame = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const gameDoc = snapshot.docs[0];
        const gData = { id: gameDoc.id, ...gameDoc.data() } as BingoGame;
        setActiveGame(gData);

        // Check if a new ball was drawn
        if (!isFirstLoad && gData.drawnNumbers.length > prevBallCountRef.current) {
          const newBall = gData.drawnNumbers[gData.drawnNumbers.length - 1];
          triggerTombolaRoll(newBall, gData);
        }
        prevBallCountRef.current = gData.drawnNumbers.length;
        isFirstLoad = false;
      } else {
        // Autocrear juego principal activo si está vacío
        try {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'bingo_games', 'juego-principal'), {
            title: 'Bingo Editorial Lluvia de Ideas',
            status: 'waiting',
            drawnNumbers: [],
            winningPattern: 'full',
            active: true,
            createdAt: Date.now()
          }, { merge: true });
        } catch (e) {
          console.warn("Could not auto-create active game", e);
        }
        prevBallCountRef.current = 0;
        isFirstLoad = true;
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading bingo_games:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeGame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire-and-forget mount subscription; triggerTombolaRoll read via ref/closure
  }, []);

  // Auto-reset host recent balls rail scroll position to the newest past ball when a new number arrives
  useEffect(() => {
    if (hostRecentBallsRailRef.current) {
      hostRecentBallsRailRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeGame?.drawnNumbers?.length]);

  // Auto-dismiss sponsor spotlight modal after 6 seconds
  useEffect(() => {
    if (activeSponsorModal) {
      const timer = setTimeout(() => {
        setActiveSponsorModal(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeSponsorModal]);

  // Dedicated listener for shouting cards across the current game session
  const [shoutedCards, setShoutedCards] = useState<BingoCard[]>([]);

  // Standalone global listener for any shouting cards across the whole bingo_cards collection
  const [globalShoutedCards, setGlobalShoutedCards] = useState<BingoCard[]>([]);

  useEffect(() => {
    const qGlobalShouts = query(
      collection(db, 'bingo_cards'),
      where('shoutedBingo', '==', true)
    );
    const unsubGlobalShouts = onSnapshot(qGlobalShouts, (snap) => {
      const shouts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BingoCard));
      setGlobalShoutedCards(shouts);
    }, (err) => {
      console.warn("Global shouts listener error:", err);
    });
    return () => unsubGlobalShouts();
  }, []);

  // Listen to cards registered for the active game session in real-time
  useEffect(() => {
    if (!activeGame?.id) {
      setRegisteredCards([]);
      setShoutedCards([]);
      return;
    }

    const qCards = query(collection(db, 'bingo_cards'), where('gameId', '==', activeGame.id));
    const unsubscribeCards = onSnapshot(qCards, (snapshot) => {
      const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BingoCard));
      setRegisteredCards(cards);
      // Filter shouting cards directly
      const shouting = cards.filter((c) => c.shoutedBingo);
      setShoutedCards(shouting);
    }, (error) => {
      console.error("Error loading cards:", error);
    });

    return () => unsubscribeCards();
  }, [activeGame?.id]);

  // Gestión del Reloj Regresivo de Próxima Ronda para el Host (soporta Minutos o Fecha y Hora Específica)
  const [customCountdownMinutes, setCustomCountdownMinutes] = useState<string>('5');
  const [customSpecificDateTime, setCustomSpecificDateTime] = useState<string>('');
  const dateTimeInputRef = useRef<HTMLInputElement>(null);

  const getSuggestedDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
    d.setSeconds(0);
    d.setMilliseconds(0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openDateTimePicker = () => {
    if (!customSpecificDateTime) {
      setCustomSpecificDateTime(getSuggestedDateTime());
    }
    setTimeout(() => {
      if (dateTimeInputRef.current) {
        try {
          if (typeof (dateTimeInputRef.current as any).showPicker === 'function') {
            (dateTimeInputRef.current as any).showPicker();
          } else {
            dateTimeInputRef.current.focus();
          }
        } catch (_) {
          dateTimeInputRef.current.focus();
        }
      }
    }, 50);
  };
  const [hostTimeLeft, setHostTimeLeft] = useState<{ 
    totalSeconds: number; 
    days: string;
    hours: string;
    minutes: string; 
    seconds: string; 
    formattedDate: string; 
    isStarted: boolean;
    hasDays: boolean;
    hasHours: boolean;
  } | null>(null);

  useEffect(() => {
    if (!activeGame?.nextRoundTime) {
      setHostTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const target = activeGame.nextRoundTime!;
      const diffMs = target - Date.now();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      
      const targetDate = new Date(target);
      const isToday = new Date().toDateString() === targetDate.toDateString();
      const timeStr = targetDate.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
      const formattedDate = isToday 
        ? `Hoy a las ${timeStr}`
        : `${targetDate.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' })}, ${timeStr}`;

      setHostTimeLeft({
        totalSeconds: totalSec,
        days: String(days),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        formattedDate,
        isStarted: totalSec <= 0,
        hasDays: days > 0,
        hasHours: hours > 0 || days > 0
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeGame?.nextRoundTime]);

  const handleSetCountdown = async (minutes: number) => {
    if (!activeGame) return;
    try {
      const targetTime = Date.now() + minutes * 60 * 1000;
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        nextRoundTime: targetTime
      });
      soundEffects.playSpacePulse();
      addLog(`HOST: Reloj de próxima ronda fijado para dentro de ${minutes} minutos (${new Date(targetTime).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}).`, 'system');
    } catch (err) {
      console.error("Error al fijar reloj de próxima ronda:", err);
    }
  };

  const handleSetSpecificDateTime = async (dateTimeStr: string) => {
    if (!activeGame || !dateTimeStr) return;
    try {
      const targetTime = new Date(dateTimeStr).getTime();
      if (isNaN(targetTime)) {
        alert("Por favor selecciona una fecha y hora válida.");
        return;
      }
      if (targetTime <= Date.now()) {
        alert("La fecha y hora programada debe ser en el futuro.");
        return;
      }
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        nextRoundTime: targetTime
      });
      soundEffects.playSpacePulse();
      addLog(`HOST: Próxima ronda programada para el ${new Date(targetTime).toLocaleString('es-GT')}.`, 'system');
    } catch (err) {
      console.error("Error al programar fecha y hora de próxima ronda:", err);
    }
  };

  const handleAddCountdownMinutes = async (extraMinutes: number) => {
    if (!activeGame || !activeGame.nextRoundTime) return;
    try {
      const newTarget = Math.max(Date.now(), activeGame.nextRoundTime) + extraMinutes * 60 * 1000;
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        nextRoundTime: newTarget
      });
      soundEffects.playSpacePulse();
      addLog(`HOST: Se extendió el reloj de próxima ronda en +${extraMinutes} minutos.`, 'system');
    } catch (err) {
      console.error("Error al extender reloj de próxima ronda:", err);
    }
  };

  const handleCancelCountdown = async () => {
    if (!activeGame) return;
    try {
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        nextRoundTime: null
      });
      soundEffects.playSpacePulse();
      addLog(`HOST: Reloj de próxima ronda cancelado.`, 'warning');
    } catch (err) {
      console.error("Error al cancelar reloj de próxima ronda:", err);
    }
  };

  // Combined list of active bingo shouts from all Firestore sources (deduplicated)
  const activeBingoShouts = [
    ...shoutedCards,
    ...globalShoutedCards,
    ...registeredCards.filter(c => c.shoutedBingo)
  ].reduce((acc: BingoCard[], current) => {
    if (!acc.some(item => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Auto-validación forense instantánea cuando un cartón canta Bingo
  useEffect(() => {
    if (!activeGame || activeBingoShouts.length === 0) return;
    activeBingoShouts.forEach(card => {
      if (!validationResults[card.id]) {
        validateCard(card.id);
      }
    });
  }, [activeBingoShouts, activeGame?.drawnNumbers]);

  // Voice announcement for shouted Bingos
  useEffect(() => {
    if (isMuted) return;

    activeBingoShouts.forEach(card => {
      if (!announcedShoutsRef.current.has(card.id)) {
        announcedShoutsRef.current.add(card.id);
        soundEffects.playSpacePulse();
        
        // Announce via text-to-speech
        try {
          const utterance = new SpeechSynthesisUtterance(`¡Atención! El jugador ${card.playerName} ha cantado Bingo.`);
          utterance.lang = 'es-ES';
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis failed", err);
        }
      }
    });

    // Clean up IDs that are no longer shouting
    const currentShoutedIds = new Set(activeBingoShouts.map(c => c.id));
    announcedShoutsRef.current.forEach(id => {
      if (!currentShoutedIds.has(id)) {
        announcedShoutsRef.current.delete(id);
      }
    });
  }, [activeBingoShouts, isMuted]);

  // Listen to global winners history in real-time (sin requerimiento de índice compuesto)
  useEffect(() => {
    const qWinners = query(collection(db, 'bingo_winners_history'), limit(50));
    const unsubscribeWinners = onSnapshot(qWinners, (snapshot) => {
      const winners = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as WinnerHistoryEntry))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setWinnersHistory(winners);
    }, (error) => {
      console.error("Error loading winners history:", error);
    });

    return () => unsubscribeWinners();
  }, []);

  const confirmWinner = async (card: BingoCard) => {
    if (!activeGame) return;
    try {
      const prizesList = (cust?.prizes && cust.prizes.length > 0)
        ? cust.prizes
        : [
            { id: 'p1', title: '🥇 Premio Mayor: Smart TV 55" 4K HDR' },
            { id: 'p2', title: '🥈 Segundo Premio: Tablet Educativa 10"' },
            { id: 'p3', title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas' }
          ];

      const currentPrizeObj = prizesList.find((p) => p.id === activeGame.currentPrizeId) || prizesList[0];
      const activePrizeTitle = currentPrizeObj ? currentPrizeObj.title : 'Premio Mayor';

      await addDoc(collection(db, 'bingo_winners_history'), {
        gameId: activeGame.id,
        gameTitle: activeGame.title,
        playerName: card.playerName,
        cardId: card.id,
        prize: activePrizeTitle,
        winningPattern: activeGame.winningPattern,
        drawnCount: activeGame.drawnNumbers.length,
        timestamp: Date.now()
      });
      
      await setDoc(doc(db, 'bingo_cards', card.id), {
        shoutedBingo: false,
        winnerConfirmed: true
      }, { merge: true });

      // Publicar notificación global de ganador a todos los jugadores y liberar el candado activo
      await setDoc(doc(db, 'bingo_games', activeGame.id), {
        activeClaim: null,
        latestWinner: {
          playerName: card.playerName,
          prizeTitle: activePrizeTitle,
          timestamp: Date.now()
        }
      }, { merge: true });
      
      setValidationResults(prev => {
        const copy = { ...prev };
        delete copy[card.id];
        return copy;
      });
      
      soundEffects.playSuccessFanfare();
      await showAlert(`¡Ganador ${card.playerName} registrado con éxito por el premio ${activePrizeTitle}!`, "Ganador Confirmado", "🏆");
      addLog(`HOST: Ganador confirmado -> ${card.playerName} por ${activePrizeTitle}`, "success");
    } catch (err) {
      console.error(err);
      await showAlert("Error al guardar en el historial de ganadores.", "Error", "❌");
    }
  };

  const rejectClaim = async (card: BingoCard) => {
    try {
      await updateDoc(doc(db, 'bingo_cards', card.id), {
        shoutedBingo: false
      });
      
      if (activeGame?.id) {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
          activeClaim: null
        });
      }

      setValidationResults(prev => {
        const copy = { ...prev };
        delete copy[card.id];
        return copy;
      });
      addLog(`HOST: Grito de Bingo descartado para ${card.playerName} (Cartón ${card.id}). Cola liberada.`, "warning");
    } catch (err) {
      console.error(err);
    }
  };

  // Set up live terminal logs based on game status/draw changes
  useEffect(() => {
    if (!activeGame) {
      addLog("SISTEMA: Servidor desconectado. Esperando partida...", "warning");
      return;
    }
    addLog(`CONECTADO: Canal de datos para "${activeGame.title}" activo.`, "success");
    addLog(`SISTEMA: Estado inicial de partida -> [${activeGame.status.toUpperCase()}].`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- log once per game id
  }, [activeGame?.id]);

  useEffect(() => {
    if (!activeGame) return;
    addLog(`PARTIDA: Estado del juego cambiado a [${activeGame.status.toUpperCase()}].`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- log once per status change
  }, [activeGame?.status]);

  // Voice announcer
  const announceBall = (ball: number, gameData: BingoGame) => {
    const cust = gameData?.customization;
    if (cust?.soundTheme === 'none') return;
    if (isMutedRef.current || !('speechSynthesis' in window)) return;

    // Cancelar cualquier síntesis de voz en curso para evitar retrasos y solapamientos
    window.speechSynthesis.cancel();
    
    let letter = 'B';
    if (ball > 15 && ball <= 30) letter = 'I';
    if (ball > 30 && ball <= 45) letter = 'N';
    if (ball > 45 && ball <= 60) letter = 'G';
    if (ball > 60 && ball <= 75) letter = 'O';

    // Check sponsor voice announce
    let sponsorText = '';
    if (cust?.sponsorConfig?.active && cust.sponsorConfig.audioAnnounce && cust.sponsors && cust.sponsors.length > 0) {
      const intervalVal = cust.sponsorConfig.interval || 5;
      const ballCount = gameData?.drawnNumbers?.length || 0;
      if (ballCount > 0 && ballCount % intervalVal === 0) {
        const idx = (Math.floor(ballCount / intervalVal) - 1) % cust.sponsors.length;
        const sponsor = cust.sponsors[idx];
        sponsorText = `, patrocinado por ${sponsor.name}`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(`Letra ${letter}... número ${ball}${sponsorText}`);
    
    // Búsqueda inteligente de voz en español para evitar locuciones con acento inglés
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-GT';
    }
    
    if (cust?.soundTheme === 'cyberpunk') {
      utterance.pitch = 0.2;
      utterance.rate = 1.2;
    } else if (cust?.soundTheme === 'retro') {
      utterance.pitch = 1.8;
      utterance.rate = 1.3;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.9;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Spinning tombola effect
  const triggerTombolaRoll = (finalBall: number, gameData: BingoGame) => {
    setIsRolling(true);
    let counter = 0;
    
    let letter = 'B';
    if (finalBall > 15 && finalBall <= 30) letter = 'I';
    if (finalBall > 30 && finalBall <= 45) letter = 'N';
    if (finalBall > 45 && finalBall <= 60) letter = 'G';
    if (finalBall > 60 && finalBall <= 75) letter = 'O';

    addLog(`TÓMBOLA: Cantando nueva bola...`, "system");

    const interval = setInterval(() => {
      const letters = ['B', 'I', 'N', 'G', 'O'];
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      const randomNumber = Math.floor(Math.random() * 75) + 1;
      setRollingBall(`${randomLetter}-${randomNumber}`);
      counter++;
      
      if (counter > 15) {
        clearInterval(interval);
        setRollingBall(`${letter}-${finalBall}`);
        setIsRolling(false);
        soundEffects.playBingoBall();
        announceBall(finalBall, gameData);
        addLog(`TÓMBOLA: Bola cantada -> ${letter}-${finalBall}`, "success");

        // Lógica de patrocinadores y publicidad
        const cust = gameData?.customization;
        const isDesktopView = typeof window !== 'undefined' && window.innerWidth > 768;
        if (isDesktopView && cust?.sponsorConfig?.active && cust.sponsors && cust.sponsors.length > 0) {
          const intervalVal = cust.sponsorConfig.interval || 5;
          const ballCount = gameData?.drawnNumbers?.length || 0;
          
          if (ballCount > 0 && ballCount % intervalVal === 0) {
            const idx = (Math.floor(ballCount / intervalVal) - 1) % cust.sponsors.length;
            const sponsor = cust.sponsors[idx];
            
            if (cust.sponsorConfig.mode === 'modal') {
              setActiveSponsorModal(sponsor);
            } else {
              setActiveSponsorIntegrated(sponsor);
            }
            addLog(`PUBLICIDAD: Mostrando patrocinio de "${sponsor.name}".`, "system");
          } else {
            setActiveSponsorIntegrated(null);
          }
        } else {
          setActiveSponsorIntegrated(null);
        }
      }
    }, 80);
  };

  // Host Controls
  const drawRandomBall = async () => {
    if (!activeGame) return;

    // Pausa Automática: Si hay un grito de Bingo en verificación, bloquear extracción
    const hasPendingClaim = Boolean(
      (activeGame.activeClaim && activeGame.activeClaim.status === 'pending') || 
      activeBingoShouts.length > 0
    );
    if (hasPendingClaim) {
      await showAlert(
        "La tómbola se encuentra en PAUSA AUTOMÁTICA porque hay una reclamación de Bingo en verificación en vivo. Revisa y confirma o descarta el grito en pantalla antes de sacar más bolas.", 
        "Tómbola en Pausa", 
        "⏸️"
      );
      return;
    }

    const maxBalls = 75;
    if (activeGame.drawnNumbers.length >= maxBalls) {
      await showAlert("¡Ya se sacaron todas las bolas!", "Juego Completado", "🎱");
      return;
    }

    let newBall;
    do {
      newBall = Math.floor(Math.random() * maxBalls) + 1;
    } while (activeGame.drawnNumbers.includes(newBall));

    const updatedNumbers = [...activeGame.drawnNumbers, newBall];
    await updateDoc(doc(db, 'bingo_games', activeGame.id), {
      drawnNumbers: updatedNumbers
    });
  };

  const changeGameStatus = async (status: 'waiting' | 'playing' | 'finished') => {
    if (!activeGame) return;
    await updateDoc(doc(db, 'bingo_games', activeGame.id), { status });
  };

  const handleClearSession = async () => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      `¿Estás seguro de que deseas LIMPIAR ESTA SESIÓN?\n\nEsta acción eliminará TODOS los (${registeredCards.length}) cartones registrados en la sesión actual y vaciará las bolas cantadas. Los jugadores podrán registrarse de nuevo para obtener un cartón totalmente nuevo.`,
      "Limpiar Sesión de Juego",
      "🧹",
      "SÍ, LIMPIAR SESIÓN",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      // 1. Eliminar todos los cartones de esta sesión en Firestore
      const { query, collection, where, getDocs, writeBatch } = await import('firebase/firestore');
      const cardsRef = collection(db, 'bingo_cards');
      const qCards = query(cardsRef, where('gameId', '==', activeGame.id));
      const cardsSnapshot = await getDocs(qCards);

      if (!cardsSnapshot.empty) {
        const batch = writeBatch(db);
        cardsSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }

      // 2. Si hay códigos de activación usados en esta sesión, liberarlos
      const codesRef = collection(db, 'bingo_codes');
      const qCodes = query(codesRef, where('gameId', '==', activeGame.id));
      const codesSnapshot = await getDocs(qCodes);
      if (!codesSnapshot.empty) {
        const batchCodes = writeBatch(db);
        codesSnapshot.forEach((codeSnap) => {
          batchCodes.update(codeSnap.ref, {
            used: false,
            usedByCardId: null,
            usedByPlayer: null,
            usedAt: null
          });
        });
        await batchCodes.commit();
      }

      // 3. Reiniciar la partida a estado 'waiting' y vaciar bolas cantadas
      const gameRef = doc(db, 'bingo_games', activeGame.id);
      await updateDoc(gameRef, {
        drawnNumbers: [],
        status: 'waiting',
        lastResetAt: Date.now(),
        latestWinner: null,
        currentPrizeId: null,
        currentPrizeTitle: null
      });

      setValidationResults({});
      setActiveSponsorModal(null);
      setActiveSponsorIntegrated(null);

      addLog(`HOST: Sesión limpiada. Se eliminaron ${cardsSnapshot.size} cartones anteriores y se liberaron los códigos.`, "warning");
      await showAlert("¡Sesión limpiada con éxito! Todos los cartones anteriores fueron eliminados y la sesión está lista para nuevos registros.", "Sesión Limpia", "🧹");
    } catch (err) {
      console.error("Error al limpiar la sesión:", err);
      await showAlert("Error al limpiar la sesión de juego.", "Error", "❌");
    }
  };

  const handleRestartRound = async () => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      `¿Estás seguro de que deseas REINICIAR LA RONDA?\n\nSe vaciarán las (${activeGame.drawnNumbers.length}) bolas cantadas y se LIMPIARÁN LAS CASILLAS MARCADAS de los (${registeredCards.length}) cartones en juego para iniciar una nueva ronda manteniendo a los jugadores.`,
      "Reiniciar Ronda de Juego",
      "🔄",
      "SÍ, REINICIAR RONDA",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      // 1. Actualizar la partida en Firestore
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        drawnNumbers: [],
        status: 'playing',
        lastResetAt: Date.now(),
        latestWinner: null,
        activeClaim: null
      });

      // 2. Limpiar estados de ganadores/gritos en los cartones en juego
      const { query, collection, where, getDocs, writeBatch } = await import('firebase/firestore');
      const cardsRef = collection(db, 'bingo_cards');
      const qCards = query(cardsRef, where('gameId', '==', activeGame.id));
      const cardsSnapshot = await getDocs(qCards);

      if (!cardsSnapshot.empty) {
        const batch = writeBatch(db);
        cardsSnapshot.forEach((cardDoc) => {
          batch.update(cardDoc.ref, {
            shoutedBingo: false,
            winnerConfirmed: false
          });
        });
        await batch.commit();
      }

      setValidationResults({});
      setActiveSponsorModal(null);
      setActiveSponsorIntegrated(null);

      addLog("HOST: Ronda reiniciada. Se vaciaron las bolas y se limpiaron las marcas de los cartones en juego.", "warning");
      await showAlert("¡Ronda reiniciada con éxito! Las casillas de todos los jugadores han sido desmarcadas para la nueva ronda.", "Ronda Reiniciada", "🔄");
    } catch (err) {
      console.error("Error al reiniciar la ronda:", err);
      await showAlert("Error al reiniciar la ronda.", "Error", "❌");
    }
  };

  const validateCard = async (cardId?: string) => {
    const idToUse = cardId || '';
    if (!activeGame || !idToUse.trim()) return;

    try {
      const cardRef = doc(db, 'bingo_cards', idToUse.trim());
      const { getDoc } = await import('firebase/firestore');
      const cardSnap = await getDoc(cardRef);

      if (cardSnap.exists()) {
        const rawData = cardSnap.data() as Partial<BingoCard> & { matrix: StoredCardMatrix; markedSlots?: MarkedSlots };
        const matrix = [
          rawData.matrix.r0,
          rawData.matrix.r1,
          rawData.matrix.r2,
          rawData.matrix.r3,
          rawData.matrix.r4
        ];
        const cardData: BingoCard = {
          ...rawData,
          id: cardSnap.id,
          gameId: rawData.gameId || '',
          matrix
        } as BingoCard;
        if (cardData.gameId !== activeGame.id) {
          await showAlert("Este cartón no pertenece al juego activo.", "Validación", "❌");
          return;
        }

        const result = validateBingoCard(
          cardData.matrix, 
          activeGame.drawnNumbers, 
          activeGame.winningPattern,
          rawData.markedSlots
        );
        setValidationResults(prev => ({
          ...prev,
          [idToUse.trim()]: {
            isWinner: result.isWinner,
            missing: result.missingNumbers
          }
        }));
        addLog(`HOST: Validación de cartón completada para ${cardData.playerName}. Resultado: ${result.isWinner ? 'GANADOR' : 'INCOMPLETO'}`);
      } else {
        await showAlert("Cartón no encontrado. Verifica el ID.", "Validación", "🔍");
      }
    } catch (err) {
      console.error(err);
      await showAlert("Error al validar el cartón.", "Error", "❌");
    }
  };

  const handleDeletePlayer = async (cardId: string, playerName: string) => {
    const confirm = await showConfirm(
      `¿Seguro que deseas eliminar al jugador "${playerName}" de esta sesión de Bingo? Su cartón dejará de ser válido.`,
      "Eliminar Jugador",
      "👤",
      "ELIMINAR",
      "CANCELAR"
    );
    if (!confirm) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'bingo_cards', cardId));
      addLog(`HOST: Jugador "${playerName}" eliminado por el Host.`, "warning");
    } catch (err) {
      console.error(err);
      await showAlert("Error al eliminar el jugador.", "Error", "❌");
    }
  };

  const handleClearAllPlayers = async () => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      `¿Seguro que deseas eliminar a TODOS los (${registeredCards.length}) jugadores inscritos de esta sesión? Esta acción no se puede deshacer y todos los cartones activos quedarán invalidados.`,
      "ADVERTENCIA CRÍTICA",
      "⚠️",
      "SÍ, ELIMINAR TODOS",
      "CANCELAR"
    );
    if (!confirm) {
      return;
    }
    try {
      const deletePromises = registeredCards.map(card => deleteDoc(doc(db, 'bingo_cards', card.id)));
      await Promise.all(deletePromises);
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        lastResetAt: Date.now(),
        activeClaim: null,
        latestWinner: null
      });
      
      addLog(`HOST: Se han limpiado todos los jugadores inscritos de la sesión.`, "warning");
      await showAlert("¡Todos los jugadores inscritos han sido eliminados de la sesión! 🧹", "Sesión Limpia", "🧹");
    } catch (err) {
      console.error(err);
      await showAlert("Error al limpiar los jugadores.", "Error", "❌");
    }
  };

  // MANEJADORES DE JUEGOS PROGRAMADOS
  const handleCreateScheduledGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim() || !newScheduleDateTime) {
      await showAlert("Por favor completa el título y la fecha/hora de la partida.", "Atención", "⚠️");
      return;
    }

    const scheduledTimestamp = new Date(newScheduleDateTime).getTime();
    if (isNaN(scheduledTimestamp)) {
      await showAlert("Fecha u hora no válida.", "Error", "❌");
      return;
    }

    setIsSavingSchedule(true);
    try {
      const schedId = 'sched_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const tierMap: Record<string, string> = {
        'tier-10': 'Cartón Bronce (Q10)',
        'tier-25': 'Cartón Plata (Q25)',
        'tier-50': 'Cartón Oro (Q50)',
        'tier-100': 'Cartón Diamante VIP (Q100)',
        'multi': 'Ronda Multicategoría (Todas las opciones)'
      };

      const newGame: BingoScheduledGame = {
        id: schedId,
        title: newScheduleTitle.trim(),
        scheduledAt: scheduledTimestamp,
        gameType: newScheduleTier,
        tierName: tierMap[newScheduleTier] || 'Cartón Estándar',
        prizeHighlight: newSchedulePrize.trim() || undefined,
        status: 'scheduled',
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'bingo_scheduled_games', schedId), newGame);
      addLog(`HOST: Partida programada creada: "${newScheduleTitle.trim()}".`);
      await showAlert("¡Partida programada con éxito! Ya puedes verla en la lista y admitir jugadores.", "Juego Programado", "📅");
      
      setNewScheduleTitle('');
      setNewScheduleDateTime('');
      setNewSchedulePrize('');
      setShowCreateScheduleModal(false);
      setSelectedScheduledGame(newGame);
    } catch (err) {
      console.error(err);
      await showAlert("Error al programar la partida.", "Error", "❌");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleActivateScheduledGame = async (game: BingoScheduledGame) => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      `¿Deseas ACTIVAR la partida "${game.title}" en la Tómbola ahora?\n\nEsto sincronizará el temporizador de la sala de espera y actualizará el título y premios activos en vivo.`,
      "Activar Partida en Vivo",
      "🚀",
      "SÍ, ACTIVAR AHORA",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        title: game.title,
        nextRoundTime: game.scheduledAt,
        currentPrizeTitle: game.prizeHighlight || activeGame.currentPrizeTitle || '',
        scheduledGameId: game.id,
        status: 'waiting'
      });

      await updateDoc(doc(db, 'bingo_scheduled_games', game.id), {
        status: 'live'
      });

      addLog(`HOST: Partida programada "${game.title}" activada en vivo en la Tómbola.`);
      await showAlert(`¡La partida "${game.title}" está activa en la Tómbola y el reloj regresivo fue sincronizado! 🚀`, "Partida Activa", "🚀");
    } catch (err) {
      console.error(err);
      await showAlert("Error al activar la partida.", "Error", "❌");
    }
  };

  const handleDeleteScheduledGame = async (gameId: string, gameTitle: string) => {
    const confirm = await showConfirm(
      `¿Seguro que deseas eliminar la partida programada "${gameTitle}"?`,
      "Eliminar Partida",
      "🗑️",
      "ELIMINAR",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'bingo_scheduled_games', gameId));
      if (selectedScheduledGame?.id === gameId) {
        setSelectedScheduledGame(null);
      }
      addLog(`HOST: Partida programada "${gameTitle}" eliminada.`);
    } catch (err) {
      console.error(err);
      await showAlert("Error al eliminar la partida.", "Error", "❌");
    }
  };

  const handleToggleLinkSent = async (token: BingoAccessToken) => {
    try {
      const newVal = !token.linkSent;
      await updateDoc(doc(db, 'bingo_access_tokens', token.id), {
        linkSent: newVal,
        linkSentAt: newVal ? Date.now() : null
      });
      if (token.orderId) {
        try {
          await updateDoc(doc(db, 'bingo_orders', token.orderId), {
            linkSent: newVal,
            linkSentAt: newVal ? Date.now() : null
          });
        } catch {}
      }
    } catch (err) {
      console.error("Error toggling linkSent:", err);
    }
  };

  const handleSendWhatsAppPass = async (token: BingoAccessToken) => {
    const cleanPhone = (token.playerWhatsapp || '').replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      await showAlert("Este jugador no tiene un número de WhatsApp válido registrado.", "Sin WhatsApp", "⚠️");
      return;
    }

    const playUrl = `${window.location.origin}/juegos/bingo?access=${token.id}`;
    const text = encodeURIComponent(
      `¡Hola ${token.playerName}! 🎟️ Te compartimos tu Pase Único oficial para Bingotenango:\n\n` +
      `🏆 Categoría: ${token.tierName || 'Cartón Oficial'} (${token.prizeLevel || 'En vivo'})\n` +
      `🎟️ Total Cartones: ${token.quantity}\n\n` +
      `🔑 ENLACE EXCLUSIVO DE ACCESO:\n${playUrl}\n\n` +
      `⚠️ Este enlace es de un solo uso para tu dispositivo. Al iniciar la partida podrás jugar directamente. ¡Mucha suerte!`
    );

    window.open(`https://wa.me/502${cleanPhone}?text=${text}`, '_blank');

    try {
      await updateDoc(doc(db, 'bingo_access_tokens', token.id), {
        linkSent: true,
        linkSentAt: Date.now()
      });
      if (token.orderId) {
        await updateDoc(doc(db, 'bingo_orders', token.orderId), {
          linkSent: true,
          linkSentAt: Date.now()
        });
      }
    } catch {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGame || !playerName.trim()) return;
    
    setIsRegistering(true);
    setRegError('');

    try {
      const accessCfg = activeGame.customization?.accessConfig;

      // 1. Validar el código si el modo es privado y NO se cuenta con un Pase Único verificado
      if (accessCfg?.mode === 'code' && !accessTokenData) {
        const codeInput = activationCode.trim().toUpperCase();
        if (!codeInput) {
          setRegError('El código de activación es obligatorio.');
          setIsRegistering(false);
          return;
        }
        const codeRef = doc(db, 'bingo_codes', codeInput);
        const codeSnap = await getDoc(codeRef);
        if (!codeSnap.exists() || codeSnap.data()?.gameId !== activeGame.id) {
          setRegError('Código de activación inválido.');
          setIsRegistering(false);
          return;
        }
        if (codeSnap.data()?.used) {
          setRegError('Este código ya ha sido utilizado.');
          setIsRegistering(false);
          return;
        }
      }

      // 2. Validar campos requeridos (Teléfono es obligatorio para verificar al ganador)
      if (!playerPhone.trim()) {
        setRegError('El número de teléfono es obligatorio para comprobar y verificar al ganador.');
        setIsRegistering(false);
        return;
      }

      let matrix = generateBingoMatrix();
      let hash = hashBingoMatrix(matrix);
      let isCardAcceptable = false;
      let attempts = 0;

      const ac = activeGame?.customization?.accessConfig;
      const maxOverlapThreshold = ac?.maxOverlapThreshold || (ac?.massiveMode ? 10 : 8);

      while (!isCardAcceptable && attempts < 500) {
        attempts++;
        const hasCollision = registeredCards.some(otherCard => {
          // Método A: Registro de Huella Única (Hash idéntico)
          if (otherCard.hash && otherCard.hash === hash) return true;

          if (!otherCard.matrix) return false;
          let otherMatrix: (number | null)[][];
          if (Array.isArray(otherCard.matrix)) {
            otherMatrix = otherCard.matrix;
          } else if ((otherCard.matrix as unknown as StoredCardMatrix)?.r0) {
            const rawM = otherCard.matrix as unknown as StoredCardMatrix;
            otherMatrix = [
              rawM.r0,
              rawM.r1,
              rawM.r2,
              rawM.r3,
              rawM.r4
            ];
          } else {
            return false;
          }
          return checkCardCollision(matrix, otherMatrix, maxOverlapThreshold);
        });

        if (!hasCollision) {
          isCardAcceptable = true;
        } else {
          matrix = generateBingoMatrix();
          hash = hashBingoMatrix(matrix);
        }
      }

      // Generate unique 7-digit ID
      let shortId = '';
      let isIdUnique = false;
      while (!isIdUnique) {
        shortId = Math.floor(1000000 + Math.random() * 9000000).toString();
        const cardRef = doc(db, 'bingo_cards', shortId);
        const cardSnap = await getDoc(cardRef);
        if (!cardSnap.exists()) {
          isIdUnique = true;
        }
      }

      // Guardar el cartón incluyendo teléfono, promotor y datos del pase de acceso si existe
      await setDoc(doc(db, 'bingo_cards', shortId), {
        gameId: activeGame.id,
        playerName: playerName.trim(),
        phone: playerPhone.trim() || null,
        promoterCode: playerPromoterCode.trim().toUpperCase() || null,
        tierId: accessTokenData?.tierId || null,
        tierName: accessTokenData?.tierName || null,
        prizeLevel: accessTokenData?.prizeLevel || null,
        tokenId: accessTokenData?.id || null,
        matrix: {
          r0: matrix[0],
          r1: matrix[1],
          r2: matrix[2],
          r3: matrix[3],
          r4: matrix[4]
        },
        hash: hash,
        createdAt: Date.now()
      });

      // 3. Canjear el código marcándolo como usado en Firestore si aplica
      if (accessCfg?.mode === 'code' && !accessTokenData) {
        const codeInput = activationCode.trim().toUpperCase();
        await updateDoc(doc(db, 'bingo_codes', codeInput), {
          used: true,
          usedByCardId: shortId,
          usedByPlayer: playerName.trim(),
          usedAt: Date.now()
        });
      } else if (accessTokenData) {
        await updateDoc(doc(db, 'bingo_access_tokens', accessTokenData.id), {
          usedByCardId: shortId
        });
      }

      // Save generated card in localStorage so the player can recover it
      localStorage.setItem('my_bingo_card_id', shortId);
      setSavedCardId(shortId);

      navigate(`/juegos/bingo/carton/${shortId}`);

    } catch (err) {
      console.error(err);
      setRegError('Error al generar tu cartón. Por favor intenta de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDiscardCard = () => {
    setShowDiscardModal(true);
  };

  const confirmDiscardCard = () => {
    localStorage.removeItem('my_bingo_card_id');
    setSavedCardId(null);
    setPlayerName('');
    setActivationCode('');
    setPlayerPhone('');
    setPlayerPromoterCode('');
    addLog("JUGADOR: Cartón anterior descartado del dispositivo.");
    setShowDiscardModal(false);
  };


  // Customization variables
  const cust = activeGame?.customization;
  const primaryColor = cust?.primaryColor || '#a855f7';
  const accentColor = cust?.accentColor || '#ec4899';
  const backgroundColor = cust?.backgroundColor || '#fbf9ff';

  // Helper to determine if background color is light
  const isBgLight = (hexColor: string) => {
    if (!hexColor) return false;
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128;
  };

  const isLight = isBgLight(backgroundColor);

  const customStyles = {
    '--primary-color': primaryColor,
    '--accent-color': accentColor,
    '--bg-main': backgroundColor,
    '--cyber-primary': primaryColor,
    '--cyber-accent': accentColor,
    '--cyber-bg': backgroundColor,
    '--cyber-darker': isLight ? '#f3f4f6' : '#030107',
    
    // Mapear los colores del selector a los de neón específicos que usa el juego
    '--cyber-cyan': primaryColor,
    '--cyber-pink': accentColor,
    '--cyber-purple': primaryColor,
    
    // Brillos de neón dinámicos
    '--cyber-glow': `0 0 15px ${primaryColor}55`,
    '--cyber-accent-glow': `0 0 15px ${accentColor}55`,
    '--cyber-cyan-glow': `0 0 15px ${primaryColor}55`,
    
    // Adaptar textos y paneles según el contraste del fondo
    '--cyber-text': isLight ? '#1f2937' : '#e2dbf0',
    '--cyber-panel': isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(13, 6, 28, 0.75)',
  } as React.CSSProperties;

  const getThemeClass = () => {
    if (!cust || !cust.themeName) return 'theme-gamer';
    return `theme-${cust.themeName}`;
  };

  if (loading) return <div className={`tab-pane ${activeGame ? getThemeClass() : 'theme-gamer'}`} style={customStyles}><div className="spinner"></div></div>;

  return (
    <div className={`tab-pane animate-fade-in ${getThemeClass()}`} style={customStyles}>
      
      {/* Modal de Alerta de Bingo (Montado en Body para notificación en tiempo real con z-index superior) */}
      {activeBingoShouts.length > 0 && createPortal(
        <div className="host-shout-modal-overlay animate-fade-in" style={{ zIndex: 9999999 }}>
          <div className="host-shout-modal card-glass" style={{ border: '3px solid #ef4444', boxShadow: '0 0 60px rgba(239, 68, 68, 0.85)' }}>
            <div className="shout-modal-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span className="shout-modal-icon" style={{ fontSize: '3.2rem', animation: 'bounce 1s infinite' }}>🚨</span>
              <h3 style={{ fontSize: '1.5rem', color: '#ff4444', fontFamily: 'var(--font-gamer)', margin: 0, textShadow: '0 0 15px rgba(239,68,68,0.7)' }}>
                ¡RECLAMACIÓN DE BINGO EN VIVO!
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', opacity: 0.9, color: '#e2e8f0', margin: '8px 0 16px', textAlign: 'center' }}>
              Los siguientes jugadores han cantado Bingo y están esperando validación del Host:
            </p>
            <div className="shout-modal-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '5px' }}>
              {activeBingoShouts.map(card => {
                const validation = validationResults[card.id];

                // Normalizar matriz del cartón para renderizado 5x5
                let matrix5x5: (number | null)[][] = [];
                if (Array.isArray(card.matrix)) {
                  matrix5x5 = card.matrix;
                } else if (card.matrix && typeof card.matrix === 'object') {
                  const mRaw = card.matrix as any;
                  matrix5x5 = [mRaw.r0 || [], mRaw.r1 || [], mRaw.r2 || [], mRaw.r3 || [], mRaw.r4 || []];
                }

                // Normalizar casillas marcadas
                let marked5x5: boolean[][] = [];
                const markedRaw = (card as any).markedSlots;
                if (Array.isArray(markedRaw)) {
                  marked5x5 = markedRaw;
                } else if (markedRaw && typeof markedRaw === 'object') {
                  marked5x5 = [markedRaw.r0 || [], markedRaw.r1 || [], markedRaw.r2 || [], markedRaw.r3 || [], markedRaw.r4 || []];
                }

                return (
                  <div key={card.id} className="shout-modal-item" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1.15rem', color: '#fff' }}>👤 {card.playerName}</strong>
                      <code style={{ fontSize: '0.8rem', color: 'var(--cyber-cyan)', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px' }}>ID: {card.id}</code>
                    </div>

                    {/* Mostrar veredicto de validación forense */}
                    {validation ? (
                      <div style={{ margin: '8px 0', padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', background: 'rgba(0,0,0,0.7)', border: `1.5px solid ${validation.isWinner ? '#22c55e' : 'rgba(239,68,68,0.7)'}` }}>
                        <p style={{ margin: 0, fontWeight: 900, color: validation.isWinner ? '#4ade80' : '#f87171' }}>
                          {validation.isWinner ? '🏆 ¡GANADOR 100% VÁLIDO! Cumple con el patrón requerido.' : `❌ CANTO FALSO / INCOMPLETO: Le faltan las casillas [${validation.missing.join(', ')}]`}
                        </p>
                      </div>
                    ) : (
                      <div style={{ margin: '8px 0', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                        🔍 Cotejando números cantados con el cartón en tiempo real...
                      </div>
                    )}

                    {/* MINI CARTÓN FORENSE DE VALIDACIÓN IN SITU */}
                    {matrix5x5.length === 5 && (
                      <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold' }}>
                            🔬 Cotejo Forense ({activeGame?.drawnNumbers?.length || 0} bolas cantadas)
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 'bold' }}>
                            Patrón: {activeGame?.winningPattern || 'full'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', maxWidth: '230px', margin: '0 auto' }}>
                          {matrix5x5.map((row, rIdx) =>
                            row.map((val, cIdx) => {
                              const isFree = rIdx === 2 && cIdx === 2;
                              const isMarked = isFree || Boolean(marked5x5[rIdx]?.[cIdx]);
                              const isDrawn = isFree || (val !== null && Boolean(activeGame?.drawnNumbers?.includes(val)));

                              let cellBg = 'rgba(255, 255, 255, 0.05)';
                              let cellBorder = '1px solid rgba(255,255,255,0.1)';
                              let cellColor = '#94a3b8';

                              if (isFree) {
                                cellBg = 'rgba(245, 158, 11, 0.3)';
                                cellBorder = '1px solid #f59e0b';
                                cellColor = '#fbbf24';
                              } else if (isMarked && isDrawn) {
                                cellBg = 'rgba(34, 197, 94, 0.35)';
                                cellBorder = '1.5px solid #22c55e';
                                cellColor = '#4ade80';
                              } else if (isMarked && !isDrawn) {
                                cellBg = 'rgba(239, 68, 68, 0.4)';
                                cellBorder = '1.5px solid #ef4444';
                                cellColor = '#fca5a5';
                              } else if (!isMarked && isDrawn) {
                                cellBg = 'rgba(56, 189, 248, 0.15)';
                                cellBorder = '1px dashed #38bdf8';
                                cellColor = '#38bdf8';
                              }

                              return (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  style={{
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 'bold',
                                    borderRadius: '5px',
                                    background: cellBg,
                                    border: cellBorder,
                                    color: cellColor
                                  }}
                                  title={`Casilla: ${isFree ? 'Libre' : val} | Marcada: ${isMarked ? 'Sí' : 'No'} | Cantada: ${isDrawn ? 'Sí' : 'No'}`}
                                >
                                  {isFree ? '⭐' : val}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '6px', fontSize: '0.66rem', color: '#94a3b8' }}>
                          <span style={{ color: '#4ade80' }}>🟢 Acierto</span>
                          <span style={{ color: '#f87171' }}>🔴 No cantada</span>
                          <span style={{ color: '#38bdf8' }}>🔵 Sin marcar</span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      <button 
                        className={`cyber-badge ${validation?.isWinner ? 'cyber-badge-green animate-pulse' : 'cyber-badge-green'}`}
                        onClick={() => confirmWinner(card)}
                        style={{ 
                          cursor: 'pointer', 
                          border: validation?.isWinner ? '2px solid #22c55e' : '1px solid var(--cyber-green)', 
                          background: validation?.isWinner ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
                          color: '#fff',
                          padding: '9px 18px', 
                          fontSize: '0.84rem', 
                          fontWeight: 900,
                          boxShadow: validation?.isWinner ? '0 0 18px rgba(34, 197, 94, 0.6)' : undefined
                        }}
                      >
                        🏆 Confirmar Ganador y Asignar Premio
                      </button>
                      <button 
                        className="cyber-badge"
                        style={{ border: '1.5px solid #ef4444', background: 'rgba(239, 68, 68, 0.25)', color: '#ff6b6b', cursor: 'pointer', padding: '9px 16px', fontSize: '0.82rem', fontWeight: 'bold' }}
                        onClick={() => rejectClaim(card)}
                      >
                        ❌ Descartar Canto y Reanudar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ====== DISCARD CARD CONFIRMATION MODAL ====== */}
      {showDiscardModal && createPortal(
        <div className="player-modal-overlay" onClick={() => setShowDiscardModal(false)}>
          <div className="player-modal modal-danger" onClick={(e) => e.stopPropagation()}>
            <span className="player-modal-icon">🚨</span>
            <h3>¿Descartar Cartón?</h3>
            <p>
              Esta acción es irreversible. Perderás el acceso a tu cartón anterior, todas tus marcas y tu progreso actual.
            </p>
            <div className="player-modal-actions">
              <button
                className="btn-modal-confirm btn-red"
                onClick={confirmDiscardCard}
              >
                🗑️ SÍ, DESCARTAR
              </button>
              <button
                className="btn-modal-cancel"
                onClick={() => setShowDiscardModal(false)}
              >
                ↩️ CANCELAR
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      

      <section className="game-section">

        {/* If there is no active game session */}
        {!activeGame ? (
          <div className="arcade-empty-state">
            <div className="bingotenango-brand-badge" style={{ marginBottom: '14px' }}>
              <img 
                src="/bingotenango-logo.svg" 
                alt="Bingotenango" 
                style={{ maxHeight: '120px', width: 'auto', filter: 'drop-shadow(0 0 25px rgba(88, 205, 238, 0.55))' }} 
              />
            </div>
            <h3 style={{ fontFamily: 'var(--font-gamer)', color: '#fff', marginTop: '5px' }}>BINGOTENANGO OFFLINE</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--cyber-text)', opacity: 0.85, margin: '8px 0 20px', maxWidth: '520px' }}>
              El servidor de Bingotenango está inactivo en este momento. Espera a que el anfitrión de Editorial Lluvia de Ideas inicie una nueva sesión de juego en directo.
            </p>
            <div className="arcade-blink-text">Esperando señal de transmisión de Bingotenango...</div>
          </div>
        ) : (
          
          /* Main Responsive Dashboard */
          <div className="bingo-dashboard-grid">
            
            {/* ==========================================
               WEB ONLY: LEFT COLUMN (INFO & STREAM CONTROLS)
               ========================================== */}
            <div className="cyber-panel dynamics-panel desktop-only">
              {/* Header de Sesión y Banner (Sobre y del mismo ancho que la columna del Host) */}
              <div className="bingo-gamer-header" style={{ marginBottom: '8px', padding: '0', textAlign: 'center' }}>
                <div className="bingotenango-brand-badge" style={{ marginBottom: '6px' }}>
                  <img 
                    src="/bingotenango-logo.svg" 
                    alt="Bingotenango" 
                    style={{ maxHeight: '48px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }} 
                  />
                </div>
                <h1 style={{ fontSize: '1.45rem', marginBottom: '2px', letterSpacing: '1px' }}>{cust?.title || 'Bingotenango'}</h1>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.8px', margin: 0 }}>{cust?.subtitle || 'Bingo Digital - Editorial Lluvia de Ideas'}</p>
              </div>

              {cust?.headerImage && (
                <div 
                  className="gamer-banner-frame animate-zoom-in"
                  style={{ height: cust.headerHeight ? `${cust.headerHeight}px` : '90px', maxWidth: '100%', marginBottom: '12px' }}
                >
                  <img src={cust.headerImage} alt="Bingo Session Banner" className="gamer-banner-img" />
                  <div className="gamer-banner-overlay"></div>
                </div>
              )}

              {isAdmin ? (
                <>

                  {/* Selector de Premio en Juego */}
                  <div className="host-sidebar-section">
                    <span className="host-sidebar-section-title">🎁 Premio en Juego Actualmente</span>
                    <select
                      value={activeGame.currentPrizeId || ''}
                      onChange={async (e) => {
                        const selectedId = e.target.value;
                        const prizesList = (cust?.prizes && cust.prizes.length > 0) 
                          ? cust.prizes 
                          : [
                              { id: 'p1', title: '🥇 Premio Mayor: Smart TV 55" 4K HDR' },
                              { id: 'p2', title: '🥈 Segundo Premio: Tablet Educativa 10"' },
                              { id: 'p3', title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas' }
                            ];
                        const prizeObj = prizesList.find((p) => p.id === selectedId);
                        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
                          currentPrizeId: selectedId,
                          currentPrizeTitle: prizeObj ? prizeObj.title : ''
                        });
                        addLog(`HOST: Premio en juego asignado -> ${prizeObj ? prizeObj.title : 'General'}`, "system");
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: `1.5px solid ${primaryColor}`,
                        background: 'rgba(13, 6, 28, 0.95)',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: `0 0 12px ${primaryColor}44`
                      }}
                    >
                      <option value="" style={{ background: '#0d061c', color: '#fff' }}>-- Asignar Premio en Juego --</option>
                      {((cust?.prizes && cust.prizes.length > 0) ? cust.prizes : [
                        { id: 'p1', title: '🥇 Premio Mayor: Smart TV 55" 4K HDR' },
                        { id: 'p2', title: '🥈 Segundo Premio: Tablet Educativa 10"' },
                        { id: 'p3', title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas' }
                      ]).map((p) => (
                        <option key={p.id} value={p.id} style={{ background: '#0d061c', color: '#fff' }}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>



                  {/* Invitación QR / Mapa de Tómbola */}
                  {activeGame.status === 'waiting' ? (
                    <div className="host-sidebar-section">
                      <span className="host-sidebar-section-title">Invitación al Juego (Escanea para registrarte)</span>
                      <div className="host-qr-container">
                        <div className="host-qr-frame">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=a855f7&bgcolor=ffffff&data=${encodeURIComponent(window.location.origin + '/juegos/bingo')}`} 
                            alt="QR de Registro al Bingo" 
                            className="host-qr-img"
                          />
                        </div>
                        <div className="host-qr-scan-text">¡ESCANEA PARA JUGAR BINGO!</div>
                        <p style={{ fontSize: '0.72rem', opacity: 0.8, color: '#d1c4e9', marginTop: '6px', lineHeight: 1.3 }}>
                          O ingresa desde tu móvil a: <br /><strong>{window.location.host}/juegos/bingo</strong>
                        </p>
                      </div>

                      {/* Lista de jugadores conectados en tiempo real */}
                      <div style={{ marginTop: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="host-sidebar-section-title" style={{ margin: 0 }}>Jugadores Inscritos ({registeredCards.length})</span>
                          {registeredCards.length > 0 && (
                            <button 
                              onClick={handleClearAllPlayers}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#ef4444',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '0.65rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transition: 'all 0.2s'
                              }}
                              className="btn-clear-players"
                            >
                              🧹 Limpiar Todo
                            </button>
                          )}
                        </div>
                        <div className="registered-players-list">
                          {registeredCards.map((card) => (
                            <span key={card.id} className="player-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              👤 {card.playerName}
                              <button
                                onClick={() => handleDeletePlayer(card.id, card.playerName)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'rgba(239, 68, 68, 0.8)',
                                  cursor: 'pointer',
                                  padding: '0 2px',
                                  fontSize: '0.95rem',
                                  fontWeight: 'bold',
                                  lineHeight: 1,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginLeft: '4px'
                                }}
                                title={`Eliminar a ${card.playerName}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {registeredCards.length === 0 && (
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, textAlign: 'center', padding: '10px', color: '#8c7e9f' }}>
                              Esperando jugadores...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="host-sidebar-section">
                      <span className="host-sidebar-section-title">Mapa de Tómbola (1-75)</span>
                      <div className="host-grid-75">
                        {Array.from({ length: 75 }).map((_, idx) => {
                          const num = idx + 1;
                          const isDrawn = activeGame.drawnNumbers.includes(num);
                          return (
                            <div key={num} className={`host-grid-cell ${isDrawn ? 'drawn' : ''}`}>
                              {num}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Historial Permanente de Ganadores */}
                  <div className="winners-history-panel">
                    <div className="winners-history-title">
                      <span>🏆 Historial de Ganadores Históricos</span>
                    </div>
                    {winnersHistory.length > 0 ? (
                      <div className="winners-history-list">
                        {winnersHistory.map((w) => (
                          <div key={w.id} className="winner-history-item">
                            <div className="winner-item-header">
                              <span className="winner-badge">🏆 Ganador</span>
                              <strong className="winner-name">{w.playerName}</strong>
                              <span className="winner-balls">{w.drawnCount} bolas</span>
                            </div>
                            <div className="winner-item-body">
                              <span className="winner-session" title={w.gameTitle}>{w.gameTitle}</span>
                              <span className="winner-pattern">
                                {w.winningPattern === 'full' && 'Lleno'}
                                {w.winningPattern === 'line' && 'Línea'}
                                {w.winningPattern === 'diagonal' && 'Diagonal'}
                                {w.winningPattern === 'four_corners' && 'Esquinas'}
                              </span>
                              <span className="winner-date">{w.timestamp ? new Date(w.timestamp).toLocaleDateString('es-GT') : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', padding: '10px', color: '#8c7e9f' }}>
                        No hay ganadores registrados aún.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="cyber-panel-header">
                    <span className="cyber-panel-title">🛡️ Dinámica & Info</span>
                    <span className="cyber-badge cyber-badge-cyan">LOGS</span>
                  </div>
                  
                  <div className="dynamics-status-box">
                    <div className="status-stat">
                      <span className="label">Servidor</span>
                      <span className="value" style={{ color: 'var(--cyber-green)' }}>ONLINE</span>
                    </div>
                    <div className="status-stat">
                      <span className="label">Modo</span>
                      <span className="value" style={{ color: 'var(--cyber-accent)' }}>{activeGame.winningPattern.toUpperCase()}</span>
                    </div>
                    <div className="status-stat" style={{ gridColumn: 'span 2' }}>
                      <span className="label">Título de la Sesión</span>
                      <span className="value" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeGame.title}</span>
                    </div>
                  </div>

                  <div className="rules-container">
                    <h4 style={{ fontFamily: 'var(--font-gamer)', fontSize: '0.8rem', color: '#fff', marginBottom: '10px' }}>GUÍA DE INGRESO</h4>
                    <div className="rules-step">
                      <span className="step-number">1</span>
                      <span>Escanea o entra a la web desde tu dispositivo móvil.</span>
                    </div>
                    <div className="rules-step">
                      <span className="step-number">2</span>
                      <span>Ingresa tu nick de jugador para desplegar tu boleto encriptado.</span>
                    </div>
                    <div className="rules-step">
                      <span className="step-number">3</span>
                      <span>Marca los números a medida que caigan y grita ¡BINGO!</span>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontFamily: 'var(--font-gamer)', fontSize: '0.8rem', color: '#fff', marginBottom: '8px' }}>CONSOLA DE EVENTOS</h4>
                    <div className="terminal-log">
                      {systemLogs.map((log, index) => (
                        <div key={index} className="terminal-line">
                          <span className="timestamp">[{log.time}]</span>
                          <span className={log.type}>
                            {log.text}
                          </span>
                        </div>
                      ))}
                      {systemLogs.length === 0 && <div className="terminal-line">[SISTEMA]: Inicializando logs de la tómbola...</div>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ==========================================
               CENTER COLUMN (WEB: TOMBOLA / MOBILE: REGISTER)
               ========================================== */}
            <div className="cyber-panel tombola-panel">
              {/* LOGO OFICIAL BINGOTENANGO EN LA CABECERA DE LA TÓMBOLA */}
              <div className="bingotenango-tombola-banner animate-fade-in">
                <img 
                  src="/bingotenango-logo.svg" 
                  alt="Bingotenango Logo Oficial" 
                  className="bingotenango-tombola-logo"
                  title="Bingotenango - Bingo Digital Oficial"
                />
                <span className="bingotenango-tombola-tagline">
                  BINGO DIGITAL EN VIVO
                </span>
              </div>

              <div className="cyber-panel-header" style={{ width: '100%' }}>
                <span className="cyber-panel-title">
                  <span className="icon">🔮</span> 
                  {activeGame.status === 'playing' ? 'Transmisión Tómbola' : 'Obtención de Cartón'}
                </span>
                <span className="cyber-badge cyber-badge-magenta">{activeGame.status.toUpperCase()}</span>
              </div>

              {/* BANNER DE ALERTA DE BINGO EN VIVO DENTRO DE LA TÓMBOLA */}
              {activeBingoShouts.length > 0 && (
                <div 
                  className="live-bingo-shout-banner card-glass animate-pulse" 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(153, 27, 27, 0.5) 100%)',
                    border: '2.5px solid #ef4444',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 0 35px rgba(239, 68, 68, 0.6)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '2rem', animation: 'bounce 1s infinite' }}>🚨</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-gamer)', textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
                          ¡RECLAMACIÓN DE BINGO EN VIVO!
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                          Hay {activeBingoShouts.length} jugador(es) esperando validación de cartón:
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeBingoShouts.map(card => {
                      const validation = validationResults[card.id];
                      return (
                        <div key={card.id} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div>
                              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>👤 {card.playerName}</strong>
                              {card.phone && <span style={{ fontSize: '0.78rem', color: '#cbd5e1', marginLeft: '10px' }}>Tel: {card.phone}</span>}
                            </div>
                            <code style={{ fontSize: '0.82rem', color: 'var(--cyber-cyan)', background: 'rgba(0,0,0,0.6)', padding: '3px 9px', borderRadius: '6px' }}>
                              ID: {card.id}
                            </code>
                          </div>

                          {validation && (
                            <div style={{ margin: '8px 0', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.7)', border: `1px solid ${validation.isWinner ? '#22c55e' : '#ef4444'}` }}>
                              <p style={{ margin: 0, fontWeight: 'bold', color: validation.isWinner ? '#4ade80' : '#f87171' }}>
                                {validation.isWinner ? '🏆 ¡GANADOR CONFIRMADO (TODOS LOS NÚMEROS MARCADOS Y CANTADOS)! ' : `❌ CASILLAS FALTANTES/SIN MARCAR: ${validation.missing.join(', ')}`}
                              </p>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <button 
                              className="cyber-badge cyber-badge-cyan"
                              onClick={() => validateCard(card.id)}
                              style={{ cursor: 'pointer', border: '1px solid var(--cyber-cyan)', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 'bold' }}
                            >
                              🔍 Validar Cartón
                            </button>
                            <button 
                              className="cyber-badge cyber-badge-green"
                              onClick={() => confirmWinner(card)}
                              style={{ cursor: 'pointer', border: '1px solid var(--cyber-green)', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 'bold' }}
                            >
                              🏆 Confirmar Bingo
                            </button>
                            <button 
                              className="cyber-badge"
                              style={{ border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.25)', color: '#ff6b6b', cursor: 'pointer', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 'bold' }}
                              onClick={() => rejectClaim(card)}
                            >
                              ❌ Descartar Grito
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Panel de Controles del Host (Vistas verticales a la izq, Sacar Bola al centro, Reiniciar a la derecha) */}
              {isAdmin && (
                <div 
                  className="host-controls-panel card-glass animate-fade-in" 
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '16px', 
                    padding: '12px 18px', 
                    background: 'rgba(13, 6, 28, 0.85)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    marginBottom: '14px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* SECCIÓN 1: Vistas / Modos Alineados Verticalmente en Columna Estética */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-gamer)', color: 'var(--cyber-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                      🕹️ MODOS DE SESIÓN
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <button 
                        className={`host-status-btn ${activeGame.status === 'waiting' ? 'active-cyan' : ''}`}
                        onClick={() => changeGameStatus('waiting')}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.78rem', 
                          fontWeight: 'bold', 
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>📋</span> Registro
                      </button>
                      <button 
                        className={`host-status-btn ${activeGame.status === 'playing' ? 'active-green' : ''}`}
                        onClick={() => changeGameStatus('playing')}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.78rem', 
                          fontWeight: 'bold', 
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>🎮</span> Jugar
                      </button>
                      <button 
                        className="host-status-btn"
                        onClick={() => setShowPrizesModal(true)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          background: 'rgba(168, 85, 247, 0.2)',
                          border: '1px solid rgba(168, 85, 247, 0.5)',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>🎁</span> Premios
                      </button>
                    </div>
                  </div>

                  {/* DIVISOR VERTICAL ELEGANTE */}
                  <div style={{ width: '1px', height: '75px', background: 'rgba(255,255,255,0.12)', display: 'block' }}></div>

                  {/* SECCIÓN 2: Acción Principal Tómbola (SACAR BOLA - Prominente en el Centro) */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '180px' }}>
                    {activeGame.status === 'playing' ? (
                      <>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '6px' }}>
                          🎲 ACCIÓN PRINCIPAL DE JUEGO
                        </span>
                        {activeBingoShouts.length > 0 || (activeGame.activeClaim && activeGame.activeClaim.status === 'pending') ? (
                          <button 
                            className="cyber-btn-primary gamer-btn-host-draw paused animate-pulse" 
                            onClick={drawRandomBall}
                            style={{
                              height: '46px',
                              padding: '0 20px',
                              fontSize: '0.84rem',
                              fontWeight: 900,
                              letterSpacing: '0.5px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              border: '1.5px solid #fca5a5',
                              borderRadius: '14px',
                              boxShadow: '0 0 25px rgba(239, 68, 68, 0.75)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              color: '#fff'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>⏸️</span> TÓMBOLA EN PAUSA (VERIFICANDO)
                          </button>
                        ) : (
                          <button 
                            className="cyber-btn-primary gamer-btn-host-draw animate-pulse" 
                            onClick={drawRandomBall}
                            style={{
                              height: '46px',
                              padding: '0 28px',
                              fontSize: '0.92rem',
                              fontWeight: 900,
                              letterSpacing: '0.5px',
                              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                              border: 'none',
                              borderRadius: '14px',
                              boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '1.3rem' }}>🔮</span> SACAR BOLA
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--cyber-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                          🟢 MÓDULO DE REGISTRO ACTIVO
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Cambia a modo "Jugar" para comenzar a cantar bolas.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DIVISOR VERTICAL ELEGANTE DE SEGURIDAD */}
                  <div style={{ width: '1px', height: '75px', background: 'rgba(255,255,255,0.12)', display: 'block' }}></div>

                  {/* SECCIÓN 3: Acción Separada a la Derecha (REINICIAR / LIMPIAR SESIÓN) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '140px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '6px' }}>
                      ⚠️ ZONA DE SEGURIDAD
                    </span>
                    {activeGame.status === 'waiting' ? (
                      <button 
                        className="cyber-btn-primary" 
                        onClick={handleClearSession}
                        style={{
                          height: '38px',
                          padding: '0 16px',
                          fontSize: '0.78rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Elimina todos los cartones de la sesión actual para iniciar una nueva sesión de registro"
                      >
                        <span>🧹</span> Limpiar Sesión
                      </button>
                    ) : (
                      <button 
                        className="cyber-btn-primary" 
                        onClick={handleRestartRound}
                        style={{
                          height: '38px',
                          padding: '0 16px',
                          fontSize: '0.78rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Reinicia las bolas cantadas para comenzar una nueva ronda con los mismos jugadores"
                      >
                        <span>🔄</span> Reiniciar
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WEB/DESKTOP PORTION: Shows Player Directory in waiting mode & Holographic Tombola in playing mode */}
              {activeGame.status === 'waiting' ? (
                <div className="session-players-directory desktop-only animate-fade-in" style={{ width: '100%', marginTop: '10px' }}>
                  
                  {/* Resumen del Nombre de la Sesión y Métricas */}
                  <div style={{ background: 'rgba(13, 6, 28, 0.85)', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '18px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--cyber-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>
                          📌 PANEL DE CONTROL Y REGISTRO
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.45rem', fontFamily: 'var(--font-gamer)', color: '#ffffff', letterSpacing: '0.5px' }}>
                          {activeGame.title}
                        </h3>
                      </div>
                      
                      <span className="cyber-badge cyber-badge-cyan" style={{ padding: '6px 14px', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 'bold' }}>
                        🟢 ETAPA DE REGISTRO
                      </span>
                    </div>

                    {/* SELECTOR DE SUB-PESTAÑAS: Sesión Activa vs Juegos Programados */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setWaitingSubTab('session_directory')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          background: waitingSubTab === 'session_directory' ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)' : 'rgba(255,255,255,0.04)',
                          border: waitingSubTab === 'session_directory' ? '1.5px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
                          color: waitingSubTab === 'session_directory' ? '#00f0ff' : '#94a3b8',
                          fontWeight: 'bold',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: waitingSubTab === 'session_directory' ? '0 0 16px rgba(0,240,255,0.2)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        👥 Jugadores en Sesión Activa ({registeredCards.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setWaitingSubTab('scheduled_games')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          background: waitingSubTab === 'scheduled_games' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)' : 'rgba(255,255,255,0.04)',
                          border: waitingSubTab === 'scheduled_games' ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                          color: waitingSubTab === 'scheduled_games' ? '#f472b6' : '#94a3b8',
                          fontWeight: 'bold',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: waitingSubTab === 'scheduled_games' ? '0 0 16px rgba(168,85,247,0.25)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        📅 Juegos Programados ({scheduledGamesList.length})
                        {scheduledGamesList.filter(g => g.status === 'scheduled').length > 0 && (
                          <span style={{ background: '#a855f7', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                            {scheduledGamesList.filter(g => g.status === 'scheduled').length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* VISTA 1: DIRECTORIO DE SESIÓN ACTIVA */}
                    {waitingSubTab === 'session_directory' && (
                      <div className="animate-fade-in">
                    {/* CONTROLADOR DE RELOJ REGRESIVO DE PRÓXIMA RONDA - DISEÑO UNIFICADO */}
                    <div className="host-round-timer-controller animate-fade-in" style={{
                      background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 8, 22, 0.98) 100%)',
                      border: '1.5px solid rgba(0, 240, 255, 0.4)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.06)'
                    }}>
                      {/* Cabecera del Panel con Estado y Temporizador Activo */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        paddingBottom: '14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            border: '1px solid rgba(0, 240, 255, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            boxShadow: '0 0 12px rgba(0, 240, 255, 0.25)'
                          }}>
                            ⏱️
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.98rem', color: '#fff', letterSpacing: '0.5px' }}>
                                PROGRAMAR PRÓXIMA RONDA
                              </strong>
                              {hostTimeLeft ? (
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: hostTimeLeft.isStarted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.2)',
                                  color: hostTimeLeft.isStarted ? '#fca5a5' : '#4ade80',
                                  border: `1px solid ${hostTimeLeft.isStarted ? '#ef4444' : '#22c55e'}`,
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase'
                                }}>
                                  {hostTimeLeft.isStarted ? '● Hora Cumplida' : '● Reloj Sincronizado en Vivo'}
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(148, 163, 184, 0.15)',
                                  color: '#94a3b8',
                                  border: '1px solid rgba(148, 163, 184, 0.3)'
                                }}>
                                  ○ Sin programar
                                </span>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.73rem', color: '#94a3b8' }}>
                              Visible en tiempo real en la sala de espera de todos los jugadores
                            </p>
                          </div>
                        </div>

                        {/* Monitor Activo con Botones de Ajuste Rápido */}
                        {hostTimeLeft && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '6px',
                              background: hostTimeLeft.isStarted 
                                ? 'rgba(239, 68, 68, 0.2)' 
                                : 'linear-gradient(135deg, rgba(0, 240, 255, 0.18) 0%, rgba(59, 130, 246, 0.2) 100%)',
                              border: hostTimeLeft.isStarted ? '1px solid #ef4444' : '1px solid rgba(0, 240, 255, 0.55)',
                              padding: '5px 14px',
                              borderRadius: '12px',
                              boxShadow: hostTimeLeft.isStarted ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 0 15px rgba(0, 240, 255, 0.25)'
                            }}>
                              <span style={{ fontSize: '0.68rem', color: hostTimeLeft.isStarted ? '#fca5a5' : '#38bdf8', fontWeight: 'bold' }}>
                                {hostTimeLeft.isStarted ? '¡HORA CUMPLIDA!' : 'RESTANTE:'}
                              </span>
                              <span style={{
                                fontSize: '1.3rem',
                                fontFamily: 'var(--font-gamer)',
                                fontWeight: 900,
                                color: hostTimeLeft.isStarted ? '#ef4444' : '#00f0ff',
                                letterSpacing: '1.2px'
                              }}>
                                {hostTimeLeft.isStarted 
                                  ? '00:00' 
                                  : `${hostTimeLeft.hasDays ? `${hostTimeLeft.days}d ` : ''}${hostTimeLeft.hasHours ? `${hostTimeLeft.hours}:` : ''}${hostTimeLeft.minutes}:${hostTimeLeft.seconds}`}
                              </span>
                              {hostTimeLeft.formattedDate && !hostTimeLeft.isStarted && (
                                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', marginLeft: '4px', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '8px' }}>
                                  ({hostTimeLeft.formattedDate})
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleAddCountdownMinutes(1)}
                              style={{
                                padding: '6px 10px',
                                background: 'rgba(56, 189, 248, 0.2)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                borderRadius: '8px',
                                color: '#38bdf8',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              title="Extender 1 minuto más"
                            >
                              +1m
                            </button>

                            <button
                              onClick={() => handleAddCountdownMinutes(5)}
                              style={{
                                padding: '6px 10px',
                                background: 'rgba(56, 189, 248, 0.2)',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                borderRadius: '8px',
                                color: '#38bdf8',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              title="Extender 5 minutos más"
                            >
                              +5m
                            </button>

                            <button
                              onClick={handleCancelCountdown}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '8px',
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                              title="Cancelar cuenta regresiva"
                            >
                              ✕ Quitar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* FILA UNIFICADA DE ACCIONES: Minutos Rápidos + Fecha & Calendario */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        marginTop: '12px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        {/* SECCIÓN A: Minutos Rápidos */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' }}>
                            ⚡ Minutos:
                          </span>

                          {[
                            { label: '2m', mins: 2, bg: 'rgba(0, 240, 255, 0.15)', border: 'rgba(0, 240, 255, 0.4)', color: '#38bdf8' },
                            { label: '5m', mins: 5, bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', color: '#34d399' },
                            { label: '10m', mins: 10, bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' },
                            { label: '15m', mins: 15, bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' },
                            { label: '30m', mins: 30, bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.2)', color: '#cbd5e1' }
                          ].map((chip) => (
                            <button
                              key={chip.label}
                              onClick={() => handleSetCountdown(chip.mins)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: chip.bg,
                                border: `1px solid ${chip.border}`,
                                color: chip.color,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Fijar ronda en ${chip.mins} minutos`}
                            >
                              {chip.label}
                            </button>
                          ))}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                            <input
                              type="number"
                              min="1"
                              max="720"
                              value={customCountdownMinutes}
                              onChange={(e) => setCustomCountdownMinutes(e.target.value)}
                              placeholder="min"
                              style={{
                                width: '50px',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                fontSize: '0.75rem',
                                textAlign: 'center'
                              }}
                            />
                            <button
                              onClick={() => {
                                const m = parseInt(customCountdownMinutes, 10);
                                if (!isNaN(m) && m > 0) handleSetCountdown(m);
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#2563eb',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              OK
                            </button>
                          </div>
                        </div>

                        {/* SEPARADOR VERTICAL */}
                        <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.12)' }} />

                        {/* SECCIÓN B: Fecha y Hora Específica con Selector y Atajos */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📅 Fecha y Hora:
                          </span>

                          {/* Input de Fecha y Hora con Gatillo de Calendario */}
                          <div 
                            onClick={openDateTimePicker}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: 'rgba(0, 0, 0, 0.6)',
                              border: '1px solid rgba(56, 189, 248, 0.45)',
                              borderRadius: '8px',
                              padding: '2px 6px',
                              cursor: 'pointer'
                            }}
                            title="Haz clic para abrir el calendario y seleccionar fecha/hora"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDateTimePicker();
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                padding: '2px 4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Abrir calendario"
                            >
                              📅
                            </button>
                            <input 
                              ref={dateTimeInputRef}
                              type="datetime-local"
                              className="host-datetime-input"
                              value={customSpecificDateTime}
                              onChange={(e) => setCustomSpecificDateTime(e.target.value)}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDateTimePicker();
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                outline: 'none',
                                fontFamily: 'inherit',
                                padding: '3px 4px'
                              }}
                            />
                          </div>

                          <button
                            onClick={() => {
                              const targetVal = customSpecificDateTime || getSuggestedDateTime();
                              handleSetSpecificDateTime(targetVal);
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
                            }}
                          >
                            Programar
                          </button>

                          {/* Atajos Rápidos de Fecha */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleSetCountdown(60)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                              title="Programar para dentro de 1 hora"
                            >
                              +1h
                            </button>

                            <button
                              onClick={() => handleSetCountdown(120)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                              title="Programar para dentro de 2 horas"
                            >
                              +2h
                            </button>

                            <button
                              onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setSeconds(0);
                                tomorrow.setMilliseconds(0);
                                handleSetSpecificDateTime(tomorrow.toISOString());
                              }}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#94a3b8',
                                fontSize: '0.7rem',
                                cursor: 'pointer'
                              }}
                              title="Programar para mañana a esta misma hora"
                            >
                              Mañana
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tarjetas de Métricas Estadísticas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                      
                      {/* Metric 1: Total Jugadores en Región/Sesión */}
                      <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '2px' }}>👥</span>
                        <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>Jugadores en Sesión</span>
                        <strong style={{ fontSize: '1.5rem', color: '#ffffff', display: 'block', fontFamily: 'var(--font-gamer)' }}>
                          {registeredCards.length}
                        </strong>
                      </div>

                      {/* Metric 2: Jugadores Activos */}
                      <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '14px', padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '2px' }}>⚡</span>
                        <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>Jugadores Activos</span>
                        <strong style={{ fontSize: '1.5rem', color: '#4ade80', display: 'block', fontFamily: 'var(--font-gamer)' }}>
                          {registeredCards.filter(c => c.gameId === activeGame.id).length}
                        </strong>
                      </div>

                      {/* Metric 3: Ganadores de Rondas Previas */}
                      <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '2px' }}>🏆</span>
                        <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>Ganadores de Ronda</span>
                        <strong style={{ fontSize: '1.5rem', color: '#fbbf24', display: 'block', fontFamily: 'var(--font-gamer)' }}>
                          {registeredCards.filter(c => c.winnerConfirmed || winnersHistory.some(w => w.cardId === c.id || w.playerName === c.playerName)).length}
                        </strong>
                      </div>

                      {/* Metric 4: Modalidad */}
                      <div style={{ background: 'rgba(0, 240, 255, 0.12)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '14px', padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '2px' }}>
                          {cust?.accessConfig?.mode === 'code' ? '🎟️' : '🔓'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold' }}>Acceso</span>
                        <strong style={{ fontSize: '0.9rem', color: '#00f0ff', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>
                          {cust?.accessConfig?.mode === 'code' ? 'Por Código' : 'Libre'}
                        </strong>
                      </div>

                    </div>

                    {/* Buscador & Filtro por Promotor & Máster Toggles */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                        {/* Buscador de Texto */}
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                          <input 
                            type="text" 
                            placeholder="🔍 Buscar por nickname, ID o teléfono..." 
                            value={playerSearchQuery}
                            onChange={(e) => setPlayerSearchQuery(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 14px',
                              borderRadius: '12px',
                              border: '1px solid rgba(168, 85, 247, 0.4)',
                              background: 'rgba(0, 0, 0, 0.4)',
                              color: '#fff',
                              fontSize: '0.82rem',
                              outline: 'none'
                            }}
                          />
                          {playerSearchQuery && (
                            <button 
                              onClick={() => setPlayerSearchQuery('')}
                              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Filtro por Promotor */}
                        <select
                          value={selectedPromoterFilter}
                          onChange={(e) => setSelectedPromoterFilter(e.target.value)}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '12px',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            background: 'rgba(15, 23, 42, 0.85)',
                            color: '#60a5fa',
                            fontSize: '0.82rem',
                            fontWeight: 'bold',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="ALL">📢 Todos los Promotores</option>
                          <option value="WITH_PROMOTER">✓ Con Promotor</option>
                          <option value="NO_PROMOTER">✗ Sin Promotor</option>
                          {promotersList.map(p => (
                            <option key={p.id} value={p.id}>
                              📢 {p.id} - {p.promoterName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setShowAllIds(prev => !prev)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            background: showAllIds ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0,0,0,0.4)',
                            color: '#00f0ff',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {showAllIds ? '👁️ Ocultar IDs' : '👁️ Ver Todos los IDs'}
                        </button>

                        <button 
                          onClick={() => setShowAllPhones(prev => !prev)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(236, 72, 153, 0.4)',
                            background: showAllPhones ? 'rgba(236, 72, 153, 0.25)' : 'rgba(0,0,0,0.4)',
                            color: '#ec4899',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {showAllPhones ? '📱 Ocultar Teléfonos' : '📱 Ver Todos los Teléfonos'}
                        </button>
                      </div>
                    </div>

                    {/* Tabla de Jugadores */}
                    <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.35)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(168, 85, 247, 0.2)', borderBottom: '1px solid rgba(168, 85, 247, 0.4)', color: '#fff' }}>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px' }}>Jugador (Nickname)</th>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px' }}>ID Cartón</th>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px' }}>Teléfono</th>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px' }}>Promotor</th>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px' }}>Estado Rondas</th>
                            <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.8px', textAlign: 'right' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredCards
                            .filter(card => {
                              // 1. Filtro por Promotor Seleccionado
                              if (selectedPromoterFilter !== 'ALL') {
                                if (selectedPromoterFilter === 'WITH_PROMOTER') {
                                  if (!card.promoterCode) return false;
                                } else if (selectedPromoterFilter === 'NO_PROMOTER') {
                                  if (card.promoterCode) return false;
                                } else {
                                  if (card.promoterCode !== selectedPromoterFilter) return false;
                                }
                              }

                              // 2. Filtro por Búsqueda de Texto
                              if (!playerSearchQuery.trim()) return true;
                              const q = playerSearchQuery.toLowerCase();
                              return (
                                card.playerName.toLowerCase().includes(q) ||
                                (card.phone && card.phone.toLowerCase().includes(q)) ||
                                card.id.toLowerCase().includes(q) ||
                                (card.promoterCode && card.promoterCode.toLowerCase().includes(q))
                              );
                            })
                            .map((card) => {
                              const isIdRevealed = showAllIds || revealedIds[card.id];
                              const isPhoneRevealed = showAllPhones || revealedPhones[card.id];
                              const hasWonRound = card.winnerConfirmed || winnersHistory.some(w => w.cardId === card.id || w.playerName === card.playerName);
                              const winningRecord = winnersHistory.find(w => w.cardId === card.id || w.playerName === card.playerName);

                              return (
                                <tr key={card.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                  
                                  {/* Nickname */}
                                  <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '1.1rem' }}>👤</span>
                                      <span>{card.playerName}</span>
                                    </div>
                                  </td>

                                  {/* ID Cartón con Toggle Reveal */}
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                                      <code style={{ fontFamily: 'monospace', color: isIdRevealed ? '#00f0ff' : '#94a3b8', fontSize: '0.85rem' }}>
                                        {isIdRevealed ? card.id : `••••${card.id.slice(-3)}`}
                                      </code>
                                      <button 
                                        onClick={() => toggleRevealId(card.id)}
                                        style={{ background: 'none', border: 'none', color: isIdRevealed ? '#00f0ff' : '#64748b', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem' }}
                                        title={isIdRevealed ? 'Ocultar ID' : 'Ver ID'}
                                      >
                                        {isIdRevealed ? '👁️' : '🔒'}
                                      </button>
                                    </div>
                                  </td>

                                  {/* Teléfono con Toggle Reveal */}
                                  <td style={{ padding: '12px 14px' }}>
                                    {card.phone ? (
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                        <code style={{ fontFamily: 'monospace', color: isPhoneRevealed ? '#ec4899' : '#94a3b8', fontSize: '0.85rem' }}>
                                          {isPhoneRevealed ? card.phone : `••••-${card.phone.slice(-4)}`}
                                        </code>
                                        <button 
                                          onClick={() => toggleRevealPhone(card.id)}
                                          style={{ background: 'none', border: 'none', color: isPhoneRevealed ? '#ec4899' : '#64748b', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem' }}
                                          title={isPhoneRevealed ? 'Ocultar Teléfono' : 'Ver Teléfono'}
                                        >
                                          {isPhoneRevealed ? '👁️' : '🔒'}
                                        </button>
                                      </div>
                                    ) : (
                                      <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.75rem' }}>Sin teléfono</span>
                                    )}
                                  </td>

                                  {/* Promotor */}
                                  <td style={{ padding: '12px 14px' }}>
                                    {card.promoterCode ? (
                                      <span className="cyber-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: 'bold' }}>
                                        📢 {card.promoterCode}
                                      </span>
                                    ) : (
                                      <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: '0.75rem' }}>Sin Promotor</span>
                                    )}
                                  </td>

                                  {/* Estado / Indicador de Ganador */}
                                  <td style={{ padding: '12px 14px' }}>
                                    {hasWonRound ? (
                                      <span 
                                        className="cyber-badge cyber-badge-green" 
                                        style={{ 
                                          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                                          border: '1px solid #eab308',
                                          color: '#fef08a',
                                          fontWeight: 'bold',
                                          padding: '4px 10px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          boxShadow: '0 0 10px rgba(234, 179, 8, 0.3)'
                                        }}
                                        title={winningRecord ? `Ganó: ${winningRecord.prize}` : 'Confirmado como Ganador'}
                                      >
                                        🏆 YA HA GANADO
                                      </span>
                                    ) : (
                                      <span className="cyber-badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        🎮 Registrado
                                      </span>
                                    )}
                                  </td>

                                  {/* Acciones */}
                                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => handleDeletePlayer(card.id, card.playerName)}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.15)',
                                          border: '1px solid rgba(239, 68, 68, 0.4)',
                                          color: '#ef4444',
                                          borderRadius: '8px',
                                          padding: '4px 10px',
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold',
                                          cursor: 'pointer'
                                        }}
                                        title="Eliminar jugador de la sesión"
                                      >
                                        🗑️ Eliminar
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              );
                            })}

                          {registeredCards.length === 0 && (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🛋️</span>
                                No hay jugadores inscritos en esta sesión de registro aún. Escanea el código QR o comparte el enlace para registrarte.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* VISTA 2: JUEGOS PROGRAMADOS Y CONTROL DE JUGADORES */}
                {waitingSubTab === 'scheduled_games' && (
                  <div className="scheduled-games-dashboard animate-fade-in">
                    
                    {/* BARRA SUPERIOR DE ACCIONES */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 8, 22, 0.98) 100%)',
                      border: '1.5px solid rgba(168, 85, 247, 0.4)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      marginBottom: '24px',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(168, 85, 247, 0.08)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>📅</span>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontFamily: 'var(--font-gamer)', letterSpacing: '0.5px' }}>
                            PANEL DE JUEGOS Y RONDAS PROGRAMADAS
                          </h4>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                          Programa partidas con fecha y hora, asigna premios y gestiona a los jugadores con pagos confirmados y enlaces de acceso.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCreateScheduleModal(prev => !prev)}
                        style={{
                          background: showCreateScheduleModal ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                          border: showCreateScheduleModal ? '1px solid #ef4444' : 'none',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          padding: '10px 20px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: showCreateScheduleModal ? 'none' : '0 4px 18px rgba(168, 85, 247, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {showCreateScheduleModal ? '✕ Cancelar' : '➕ Programar Nuevo Juego'}
                      </button>
                    </div>

                    {/* MODAL / FORMULARIO DESPLEGABLE PARA PROGRAMAR JUEGO */}
                    {showCreateScheduleModal && (
                      <form
                        onSubmit={handleCreateScheduledGame}
                        className="animate-fade-in"
                        style={{
                          background: 'linear-gradient(135deg, rgba(26, 16, 48, 0.95) 0%, rgba(15, 10, 30, 0.98) 100%)',
                          border: '1.5px solid #a855f7',
                          borderRadius: '16px',
                          padding: '20px',
                          marginBottom: '24px',
                          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.25)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                          <span style={{ fontSize: '1.1rem' }}>✨</span>
                          <strong style={{ color: '#f472b6', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                            CONFIGURAR NUEVA PARTIDA PROGRAMADA
                          </strong>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                          {/* Título */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>
                              📌 Nombre o Título de la Partida *
                            </label>
                            <input
                              type="text"
                              required
                              value={newScheduleTitle}
                              onChange={(e) => setNewScheduleTitle(e.target.value)}
                              placeholder="Ej. Gran Bingo de Gala / Noche de Premios"
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                outline: 'none'
                              }}
                            />
                          </div>

                          {/* Fecha y Hora */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>
                              📅 Fecha y Hora Programada *
                            </label>
                            <input
                              type="datetime-local"
                              required
                              value={newScheduleDateTime}
                              onChange={(e) => setNewScheduleDateTime(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                outline: 'none'
                              }}
                            />
                          </div>

                          {/* Tipo de Juego / Categoría de Cartón */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>
                              🎟️ Tipo de Juego / Precio
                            </label>
                            <select
                              value={newScheduleTier}
                              onChange={(e) => setNewScheduleTier(e.target.value as any)}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(10, 5, 20, 0.9)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                outline: 'none'
                              }}
                            >
                              <option value="tier-10">🥉 Cartón Bronce — Q10 (Ronda Rápida)</option>
                              <option value="tier-25">🥈 Cartón Plata — Q25 (Ronda Estándar)</option>
                              <option value="tier-50">🥇 Cartón Oro — Q50 (Premios Especiales)</option>
                              <option value="tier-100">💎 Cartón Diamante VIP — Q100 (Premio Mayor)</option>
                              <option value="multi">🌈 Ronda Multicategoría (Abierto a todos)</option>
                            </select>
                          </div>

                          {/* Premio Destacado */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>
                              🏆 Premio Principal Destacado
                            </label>
                            <input
                              type="text"
                              value={newSchedulePrize}
                              onChange={(e) => setNewSchedulePrize(e.target.value)}
                              placeholder="Ej. Smart TV 55 Pulgadas 4K + Q1,000"
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '0.85rem',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setShowCreateScheduleModal(false)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '10px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#94a3b8',
                              fontWeight: 'bold',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingSchedule}
                            style={{
                              padding: '8px 22px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              border: 'none',
                              color: '#ffffff',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              cursor: isSavingSchedule ? 'wait' : 'pointer',
                              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
                            }}
                          >
                            {isSavingSchedule ? 'Guardando...' : '💾 Guardar y Programar Juego'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* CUADRÍCULA DE PARTIDAS PROGRAMADAS */}
                    <div style={{ marginBottom: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#94a3b8', fontWeight: 'bold' }}>
                          PARTIDAS EN CALENDARIO ({scheduledGamesList.length})
                        </span>
                      </div>

                      {scheduledGamesList.length === 0 ? (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px dashed rgba(168, 85, 247, 0.3)',
                          borderRadius: '16px',
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: '#94a3b8'
                        }}>
                          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🗓️</span>
                          <strong style={{ display: 'block', fontSize: '1.05rem', color: '#e2e8f0', marginBottom: '6px' }}>
                            No hay juegos programados actualmente
                          </strong>
                          <p style={{ margin: '0 auto 16px auto', maxWidth: '420px', fontSize: '0.82rem' }}>
                            Haz clic en "➕ Programar Nuevo Juego" para crear una partida con fecha, horario y boletos disponibles en la pasarela.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowCreateScheduleModal(true)}
                            style={{
                              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              border: 'none',
                              color: '#fff',
                              padding: '8px 18px',
                              borderRadius: '10px',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            Programar Primer Juego
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                          {scheduledGamesList.map((game) => {
                            const isSelected = selectedScheduledGame?.id === game.id;
                            const isLive = game.status === 'live';
                            const gameTokens = allAccessTokens.filter(t => t.scheduledGameId === game.id);
                            const gameOrders = allBingoOrders.filter(o => o.scheduledGameId === game.id);
                            const totalCartones = gameTokens.reduce((sum, t) => sum + (t.quantity || 1), 0);
                            const totalRecaudado = gameOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0);

                            const schedDate = new Date(game.scheduledAt);
                            const dateFormatted = schedDate.toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric', month: 'short' });
                            const timeFormatted = schedDate.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

                            return (
                              <div
                                key={game.id}
                                style={{
                                  background: isSelected 
                                    ? 'linear-gradient(135deg, rgba(30, 20, 55, 0.95) 0%, rgba(20, 10, 40, 0.98) 100%)'
                                    : 'rgba(18, 12, 35, 0.75)',
                                  border: isSelected 
                                    ? '2px solid #a855f7' 
                                    : isLive 
                                      ? '1.5px solid #22c55e'
                                      : '1px solid rgba(168, 85, 247, 0.25)',
                                  borderRadius: '16px',
                                  padding: '16px',
                                  boxShadow: isSelected 
                                    ? '0 0 25px rgba(168, 85, 247, 0.35)' 
                                    : '0 4px 20px rgba(0, 0, 0, 0.4)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {/* Badge de Estado Superior */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                                  <div>
                                    {isLive ? (
                                      <span style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid #22c55e',
                                        color: '#4ade80',
                                        fontSize: '0.68rem',
                                        fontWeight: 'bold',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                      }}>
                                        ● EN VIVO EN TÓMBOLA
                                      </span>
                                    ) : (
                                      <span style={{
                                        background: 'rgba(168, 85, 247, 0.15)',
                                        border: '1px solid rgba(168, 85, 247, 0.4)',
                                        color: '#c084fc',
                                        fontSize: '0.68rem',
                                        fontWeight: 'bold',
                                        padding: '3px 8px',
                                        borderRadius: '6px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                      }}>
                                        📅 PROGRAMADO
                                      </span>
                                    )}
                                  </div>

                                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'bold' }}>
                                    {game.tierName}
                                  </span>
                                </div>

                                {/* Título y Detalles */}
                                <div style={{ marginBottom: '14px' }}>
                                  <h5 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-gamer)', letterSpacing: '0.5px' }}>
                                    {game.title}
                                  </h5>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                    <span>⏰</span>
                                    <span>{dateFormatted}, {timeFormatted}</span>
                                  </div>

                                  {game.prizeHighlight && (
                                    <div style={{ fontSize: '0.76rem', color: '#fef08a', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '4px 8px', borderRadius: '6px', marginTop: '6px' }}>
                                      🏆 {game.prizeHighlight}
                                    </div>
                                  )}
                                </div>

                                {/* Métricas Rápidas del Juego */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '6px',
                                  background: 'rgba(0,0,0,0.35)',
                                  borderRadius: '10px',
                                  padding: '8px 10px',
                                  marginBottom: '14px',
                                  textAlign: 'center'
                                }}>
                                  <div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Jugadores</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{gameTokens.length}</strong>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Cartones</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>{totalCartones}</strong>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Recaudado</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#4ade80' }}>Q{totalRecaudado}</strong>
                                  </div>
                                </div>

                                {/* Botones de Control */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedScheduledGame(isSelected ? null : game)}
                                    style={{
                                      flex: 1,
                                      padding: '7px 12px',
                                      borderRadius: '8px',
                                      background: isSelected ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(168, 85, 247, 0.2)',
                                      border: '1px solid #a855f7',
                                      color: '#ffffff',
                                      fontSize: '0.78rem',
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    👥 {isSelected ? 'Cerrar Jugadores' : `Ver Jugadores (${gameTokens.length})`}
                                  </button>

                                  {!isLive && (
                                    <button
                                      type="button"
                                      onClick={() => handleActivateScheduledGame(game)}
                                      style={{
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        border: '1px solid rgba(34, 197, 94, 0.4)',
                                        color: '#4ade80',
                                        fontSize: '0.78rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                      }}
                                      title="Activar esta partida en vivo en la Tómbola ahora"
                                    >
                                      🚀 Activar
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteScheduledGame(game.id, game.title)}
                                    style={{
                                      padding: '7px 10px',
                                      borderRadius: '8px',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      border: '1px solid rgba(239, 68, 68, 0.35)',
                                      color: '#ef4444',
                                      fontSize: '0.78rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Eliminar partida programada"
                                  >
                                    🗑️
                                  </button>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SECCIÓN DETALLADA: JUGADORES DEL JUEGO SELECCIONADO */}
                    {selectedScheduledGame && (() => {
                      const currentTokens = allAccessTokens.filter(t => t.scheduledGameId === selectedScheduledGame.id);
                      const currentOrders = allBingoOrders.filter(o => o.scheduledGameId === selectedScheduledGame.id);

                      const filteredTokens = currentTokens.filter(t => {
                        const order = currentOrders.find(o => o.id === t.orderId);
                        const isPaid = order ? order.status === 'paid' : true;
                        if (scheduledPlayersFilter === 'paid') return isPaid;
                        if (scheduledPlayersFilter === 'pending') return !isPaid;
                        if (scheduledPlayersFilter === 'link_sent') return !!t.linkSent;
                        if (scheduledPlayersFilter === 'link_pending') return !t.linkSent;
                        return true;
                      });

                      const totalSent = currentTokens.filter(t => t.linkSent).length;
                      const totalOpened = currentTokens.filter(t => t.firstUsedAt).length;

                      return (
                        <div className="animate-fade-in" style={{
                          background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 8, 22, 0.98) 100%)',
                          border: '1.5px solid #a855f7',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.15)'
                        }}>
                          {/* Cabecera del Detalle de Jugadores */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.2rem' }}>👥</span>
                                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-gamer)', letterSpacing: '0.5px' }}>
                                  JUGADORES INSCRITOS: {selectedScheduledGame.title}
                                </h4>
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#c084fc', display: 'block', marginTop: '2px' }}>
                                {selectedScheduledGame.tierName} — {new Date(selectedScheduledGame.scheduledAt).toLocaleString('es-GT', { dateStyle: 'full', timeStyle: 'short' })}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedScheduledGame(null)}
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#cbd5e1',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Cerrar Detalle
                            </button>
                          </div>

                          {/* Resumen de Métricas de Entrega */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', display: 'block' }}>Inscritos</span>
                              <strong style={{ fontSize: '1.3rem', color: '#fff', fontFamily: 'var(--font-gamer)' }}>{currentTokens.length}</strong>
                            </div>
                            <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', display: 'block' }}>Pagados</span>
                              <strong style={{ fontSize: '1.3rem', color: '#4ade80', fontFamily: 'var(--font-gamer)' }}>
                                {currentOrders.filter(o => o.status === 'paid').length}
                              </strong>
                            </div>
                            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', display: 'block' }}>Links Enviados</span>
                              <strong style={{ fontSize: '1.3rem', color: '#38bdf8', fontFamily: 'var(--font-gamer)' }}>{totalSent} / {currentTokens.length}</strong>
                            </div>
                            <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', textTransform: 'uppercase', display: 'block' }}>Abiertos / Usados</span>
                              <strong style={{ fontSize: '1.3rem', color: '#fbbf24', fontFamily: 'var(--font-gamer)' }}>{totalOpened}</strong>
                            </div>
                          </div>

                          {/* Filtros de Jugadores */}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            {[
                              { key: 'all', label: `Todos (${currentTokens.length})` },
                              { key: 'paid', label: `🟢 Pagados (${currentOrders.filter(o => o.status === 'paid').length})` },
                              { key: 'pending', label: `🟡 Pendientes (${currentOrders.filter(o => o.status === 'pending').length})` },
                              { key: 'link_pending', label: `📲 Link Pendiente (${currentTokens.filter(t => !t.linkSent).length})` },
                              { key: 'link_sent', label: `✅ Link Enviado (${totalSent})` }
                            ].map(f => (
                              <button
                                key={f.key}
                                type="button"
                                onClick={() => setScheduledPlayersFilter(f.key as any)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  background: scheduledPlayersFilter === f.key ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)',
                                  border: scheduledPlayersFilter === f.key ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                                  color: scheduledPlayersFilter === f.key ? '#f472b6' : '#94a3b8',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          {/* Tabla de Jugadores Inscritos */}
                          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                                  <th style={{ padding: '10px 14px' }}>JUGADOR / WHATSAPP</th>
                                  <th style={{ padding: '10px 14px' }}>CARTONES</th>
                                  <th style={{ padding: '10px 14px' }}>ESTADO PAGO</th>
                                  <th style={{ padding: '10px 14px' }}>ENLACE DE JUEGO</th>
                                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>CHECK ENVÍO</th>
                                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>ACCIONES</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTokens.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                      No hay jugadores en esta vista con los filtros seleccionados.
                                    </td>
                                  </tr>
                                ) : (
                                  filteredTokens.map((token) => {
                                    const order = currentOrders.find(o => o.id === token.orderId);
                                    const isPaid = order ? order.status === 'paid' : true;
                                    const playUrl = `${window.location.origin}/juegos/bingo?access=${token.id}`;

                                    return (
                                      <tr key={token.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                        {/* Jugador */}
                                        <td style={{ padding: '10px 14px' }}>
                                          <strong style={{ color: '#fff', display: 'block', fontSize: '0.88rem' }}>{token.playerName}</strong>
                                          {token.playerWhatsapp ? (
                                            <a
                                              href={`https://wa.me/502${token.playerWhatsapp.replace(/\D/g, '')}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{ color: '#4ade80', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                              <span>📱</span> +502 {token.playerWhatsapp}
                                            </a>
                                          ) : (
                                            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Sin teléfono</span>
                                          )}
                                        </td>

                                        {/* Cartones */}
                                        <td style={{ padding: '10px 14px' }}>
                                          <span style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                            color: '#38bdf8',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                          }}>
                                            🎟️ {token.quantity} {token.quantity === 1 ? 'Cartón' : 'Cartones'}
                                          </span>
                                        </td>

                                        {/* Estado Pago */}
                                        <td style={{ padding: '10px 14px' }}>
                                          {isPaid ? (
                                            <span style={{
                                              background: 'rgba(34, 197, 94, 0.15)',
                                              border: '1px solid rgba(34, 197, 94, 0.4)',
                                              color: '#4ade80',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              fontWeight: 'bold',
                                              fontSize: '0.72rem'
                                            }}>
                                              🟢 PAGADO {order?.amount ? `(Q${order.amount})` : ''}
                                            </span>
                                          ) : (
                                            <span style={{
                                              background: 'rgba(245, 158, 11, 0.15)',
                                              border: '1px solid rgba(245, 158, 11, 0.4)',
                                              color: '#fbbf24',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              fontWeight: 'bold',
                                              fontSize: '0.72rem'
                                            }}>
                                              🟡 PENDIENTE
                                            </span>
                                          )}
                                        </td>

                                        {/* Enlace Único */}
                                        <td style={{ padding: '10px 14px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <code style={{
                                              background: 'rgba(0,0,0,0.5)',
                                              border: '1px solid rgba(255,255,255,0.1)',
                                              padding: '3px 6px',
                                              borderRadius: '6px',
                                              fontSize: '0.7rem',
                                              color: '#e2e8f0',
                                              maxWidth: '120px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              ?access={token.id}
                                            </code>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                navigator.clipboard.writeText(playUrl);
                                                alert("¡Enlace copiado al portapapeles!");
                                              }}
                                              style={{
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                color: '#cbd5e1',
                                                borderRadius: '6px',
                                                padding: '3px 7px',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer'
                                              }}
                                              title="Copiar enlace directo de juego"
                                            >
                                              📋
                                            </button>
                                          </div>

                                          {/* Estado de Recepción / Apertura */}
                                          <div style={{ marginTop: '4px' }}>
                                            {token.firstUsedAt ? (
                                              <span style={{ color: '#4ade80', fontSize: '0.68rem', fontWeight: 'bold' }}>
                                                ● Abierto por jugador ({new Date(token.firstUsedAt).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })})
                                              </span>
                                            ) : token.linkSent ? (
                                              <span style={{ color: '#fbbf24', fontSize: '0.68rem' }}>
                                                ● Enviado (esperando ingreso)
                                              </span>
                                            ) : (
                                              <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                                                ○ Sin enviar aún
                                              </span>
                                            )}
                                          </div>
                                        </td>

                                        {/* Checkbox Interactivo de Enlace Enviado */}
                                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                          <label style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            background: token.linkSent ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.05)',
                                            border: token.linkSent ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.15)',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            userSelect: 'none'
                                          }}>
                                            <input
                                              type="checkbox"
                                              checked={!!token.linkSent}
                                              onChange={() => handleToggleLinkSent(token)}
                                              style={{ cursor: 'pointer', accentColor: '#22c55e' }}
                                            />
                                            <span style={{
                                              fontSize: '0.72rem',
                                              fontWeight: 'bold',
                                              color: token.linkSent ? '#4ade80' : '#94a3b8'
                                            }}>
                                              {token.linkSent ? 'Enviado' : 'Pendiente'}
                                            </span>
                                          </label>
                                        </td>

                                        {/* Acciones */}
                                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                          <button
                                            type="button"
                                            onClick={() => handleSendWhatsAppPass(token)}
                                            style={{
                                              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                                              border: 'none',
                                              color: '#fff',
                                              borderRadius: '8px',
                                              padding: '5px 12px',
                                              fontSize: '0.75rem',
                                              fontWeight: 'bold',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
                                            }}
                                            title="Enviar enlace único y mensaje por WhatsApp"
                                          >
                                            📲 Enviar WhatsApp
                                          </button>
                                        </td>

                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      );
                    })()}

                  </div>
                )}

                  </div>
                </div>
              ) : (
                <>
                  {/* WEB/DESKTOP PORTION: Shows the physical-holographic drawn ball */}
                  <div className="tombola-cyber-stage desktop-only">
                    {/* Alerta de Grito de Bingo en la Transmisión Pública */}
                    {registeredCards.filter(c => c.shoutedBingo).length > 0 && (
                      <div className="public-bingo-shout-overlay">
                        <div className="shout-icon">🚨</div>
                        <div className="shout-title">¡ALGUIEN HA CANTADO BINGO!</div>
                        <div className="shout-players">
                          {registeredCards
                            .filter(c => c.shoutedBingo)
                            .map(c => c.playerName)
                            .join(', ')}
                        </div>
                        <div className="shout-sub">Esperando validación del Host...</div>
                      </div>
                    )}

                    {/* INSIGNIA OFICIAL DE TRANSMISIÓN BINGOTENANGO */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '8px' }}>
                      <div className="bingotenango-stage-badge animate-fade-in">
                        <img src="/bingotenango-logo.svg" alt="Bingotenango" />
                        <span>SALA OFICIAL BINGOTENANGO</span>
                      </div>
                    </div>

                    {/* ESPECTACULAR ESCENARIO DE TÓMBOLA 3D Y PODIO DE TRANSMISIÓN */}
                    <div className="tombola-horizontal-stage-flex">
                      
                      {/* 1. LA TÓMBOLA FÍSICA EN 3D: JAULA DORADA GIRATORIA CON BOLAS MULTICOLOR */}
                      <div className="tombola-rig-wrapper">
                        <div className="tombola-cage-assembly">
                          {/* Rodamientos axiales cromados laterales */}
                          <div className="cage-bearing-hub left" />
                          <div className="cage-bearing-hub right" />

                          {/* Jaula de Lotería Esférica */}
                          <div className={`cage-sphere ${isRolling ? 'spinning' : ''}`}>
                            <div className="mini-bouncing-balls">
                              <span className="mini-ball mini-ball-1" />
                              <span className="mini-ball mini-ball-2" />
                              <span className="mini-ball mini-ball-3" />
                              <span className="mini-ball mini-ball-4" />
                              <span className="mini-ball mini-ball-5" />
                              <span className="mini-ball mini-ball-6" />
                              <span className="mini-ball mini-ball-7" />
                            </div>
                          </div>

                          {/* Horquilla curva de soporte y pedestal de gala */}
                          <div className="cage-cradle-fork" />
                          <div className="cage-pedestal-column" />
                          <div className="cage-pedestal-base" />
                        </div>
                        <div className="cage-floor-shadow" />
                      </div>

                      {/* 2. LA BOLA ESTRELLA 3D & 3. PODIO DE TRANSMISIÓN */}
                      {(() => {
                        const lastBall = activeGame.drawnNumbers.length > 0
                          ? activeGame.drawnNumbers[activeGame.drawnNumbers.length - 1]
                          : null;
                        
                        let bLetter = 'B';
                        let bNum: string | number = '75';
                        let meta = getBallMeta(1);

                        if (isRolling) {
                          const [rL, rN] = rollingBall.split('-');
                          bLetter = rL || 'B';
                          bNum = rN || '??';
                          meta = getBallMeta(Number(rN) || 1);
                        } else if (lastBall !== null) {
                          meta = getBallMeta(lastBall);
                          bLetter = meta.letter;
                          bNum = lastBall;
                        } else {
                          bLetter = 'B';
                          bNum = 'READY';
                        }

                        const map = lastBall !== null ? cust?.numberToImageMap?.[lastBall] : null;

                        return (
                          <>
                            {/* 2. BOLA ESTRELLA 3D */}
                            <div className="hero-ball-stage">
                              <div 
                                className={`hero-bingo-ball-3d ${isRolling ? 'rolling' : ''}`}
                                style={{
                                  background: meta.gradient,
                                  boxShadow: `0 16px 32px rgba(0,0,0,0.7), 0 0 35px ${meta.glow}, inset 0 -12px 24px rgba(0,0,0,0.75), inset 0 10px 18px rgba(255,255,255,0.65)`
                                }}
                                title={lastBall !== null ? `Bola ${bLetter}-${bNum}` : 'Esperando primera bola'}
                              >
                                <div className="hero-ball-badge">
                                  <span className="hero-ball-letter" style={{ color: meta.color }}>
                                    {bLetter}
                                  </span>
                                  <span className="hero-ball-number" style={{ color: '#0f172a' }}>
                                    {map ? (map.type === 'emoji' ? map.value : '⭐') : (isRolling ? bNum : (lastBall !== null ? bNum : '★'))}
                                  </span>
                                </div>
                              </div>
                              <div className="hero-ball-shadow" />

                              {/* Patrocinador Integrado Flotante */}
                              {activeSponsorIntegrated && !isRolling && (
                                <div className="integrated-sponsor-pill animate-fade-in">
                                  <img src={activeSponsorIntegrated.logo} alt={activeSponsorIntegrated.name} />
                                  <div>
                                    <small>PATROCINADO POR</small>
                                    <strong>{activeSponsorIntegrated.name}</strong>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 3. PODIO DE TRANSMISIÓN DE ALTA LEGIBILIDAD */}
                            <div className="showcase-monolith-podium">
                              {/* Barra Superior con Contador de Ronda */}
                              <div className="podium-header-bar">
                                <span className="podium-header-title">
                                  <span>📺</span>
                                  {isRolling ? 'GIRANDO LA TÓMBOLA...' : (lastBall !== null ? 'ÚLTIMA BOLA EXTRAÍDA' : 'SALA DE JUEGO LISTA')}
                                </span>
                                <span className="podium-ball-counter" style={{ color: meta.color }}>
                                  Bolas Cantadas: {activeGame.drawnNumbers.length} / 75
                                </span>
                              </div>

                              {/* Pantallas Gemelas: LETRA y NÚMERO */}
                              <div className="podium-screens-row">
                                {/* Pantalla 1: LETRA GIGANTE */}
                                <div 
                                  className="podium-letter-screen" 
                                  style={{ 
                                    borderColor: meta.color,
                                    boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 30px ${meta.glow}` 
                                  }}
                                >
                                  <span className="podium-screen-tag">LETRA</span>
                                  <span className="podium-letter-value" style={{ color: meta.color }}>
                                    {bLetter}
                                  </span>
                                  <span className="podium-letter-sub">
                                    Columna {meta.range}
                                  </span>
                                </div>

                                {/* Pantalla 2: NÚMERO TITÁNICO */}
                                <div 
                                  className="podium-number-screen"
                                  style={{ 
                                    borderColor: meta.color,
                                    boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 35px ${meta.glow}` 
                                  }}
                                >
                                  <span className="podium-screen-tag">NÚMERO EXTRAÍDO</span>
                                  {isRolling ? (
                                    <span className="podium-number-value animate-pulse" style={{ color: '#38bdf8' }}>
                                      {bNum}
                                    </span>
                                  ) : lastBall !== null ? (
                                    map ? (
                                      <span className="podium-number-value" style={{ fontSize: '4.2rem' }}>
                                        {map.type === 'emoji' ? map.value : '🖼️'}
                                      </span>
                                    ) : (
                                      <span className="podium-number-value animate-zoom-in">
                                        {lastBall}
                                      </span>
                                    )
                                  ) : (
                                    <span className="podium-number-value" style={{ fontSize: '3rem', color: '#64748b' }}>
                                      LISTO
                                    </span>
                                  )}

                                  <span className="podium-spelled-name" style={{ color: meta.color }}>
                                    {isRolling 
                                      ? 'MEZCLANDO BOLAS...' 
                                      : (lastBall !== null 
                                          ? (map ? map.label : (SPANISH_NUMBERS[lastBall] || `NÚMERO ${lastBall}`)) 
                                          : 'ESPERANDO PRIMERA BOLA')}
                                  </span>
                                </div>
                              </div>

                              {/* 4. CARRIL DE LAS ÚLTIMAS 5 BOLAS */}
                              <div className="recent-balls-rail-wrapper">
                                <span className="recent-balls-label">Últimas:</span>
                                <div className="recent-balls-chute" ref={hostRecentBallsRailRef}>
                                  {activeGame.drawnNumbers.length > 1 ? (
                                    activeGame.drawnNumbers
                                      .slice(Math.max(0, activeGame.drawnNumbers.length - 6), activeGame.drawnNumbers.length - 1)
                                      .reverse()
                                      .map((num) => {
                                        const m = getBallMeta(num);
                                        return (
                                          <div 
                                            key={num} 
                                            className="mini-chute-ball"
                                            style={{ background: m.gradient }}
                                            title={`Bola ${m.letter}-${num}`}
                                          >
                                            <span className="m-letter">{m.letter}</span>
                                            <span className="m-num">{num}</span>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                                      Las bolas anteriores aparecerán aquí
                                    </span>
                                  )}
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                  <button 
                                    className="cyber-btn-circle" 
                                    onClick={() => setIsMuted(!isMuted)} 
                                    title={isMuted ? 'Activar Voz' : 'Silenciar Voz'}
                                    style={{ width: '34px', height: '34px', fontSize: '0.9rem' }}
                                  >
                                    {isMuted ? '🔇' : '🔊'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}

                    </div>
                  </div>

                  {/* WEB/DESKTOP HISTORIAL BOARD */}
                  <div className="gamer-history-board desktop-only">
                    <div className="gamer-history-title">Historial de Bolas Cantadas ({activeGame.drawnNumbers.length})</div>
                    <div className="drawn-numbers-grid-cyber">
                      {activeGame.drawnNumbers.slice().reverse().map((num, i) => {
                        let letter = 'B';
                        if (num > 15 && num <= 30) letter = 'I';
                        if (num > 30 && num <= 45) letter = 'N';
                        if (num > 45 && num <= 60) letter = 'G';
                        if (num > 60 && num <= 75) letter = 'O';
                        const map = cust?.numberToImageMap?.[num];
                        
                        return (
                          <div key={i} className="drawn-number-badge-cyber">
                            <span className="letter">{letter}</span>
                            <span className="number">
                              {map ? (map.type === 'emoji' ? map.value : '🖼️') : num}
                            </span>
                          </div>
                        );
                      })}
                      {activeGame.drawnNumbers.length === 0 && (
                        <div style={{ gridColumn: 'span 5', textAlign: 'center', fontSize: '0.8rem', color: 'var(--cyber-text)', opacity: 0.6, padding: '15px' }}>
                          Las bolas cantadas se registrarán aquí en tiempo real.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ==========================================
                 MOBILE PORTION: GET BINGO CARD ("OBTENER EL CARTÓN")
                 ========================================== */}
              <div className="mobile-gamer-section mobile-only" style={{ width: '100%' }}>
                
                {/* Check if user already has a saved card in localStorage */}
                {savedCardId ? (
                  <div className="gamer-register-card">
                    <span className="gamer-register-icon">🎮</span>
                    <h3>CARTÓN ACTIVO DETECTADO</h3>
                    <p style={{ margin: '10px 0 20px' }}>
                      Hemos detectado una sesión de juego anterior en este dispositivo. Puedes regresar de inmediato a tu cartón.
                    </p>

                    <button 
                      className="cyber-btn-primary animate-pulse" 
                      onClick={() => navigate(`/juegos/bingo/carton/${savedCardId}`)}
                      style={{ marginBottom: '15px' }}
                    >
                      🎮 ENTRAR A MI CARTÓN
                    </button>

                    <button 
                      className="cyber-badge cyber-badge-magenta"
                      onClick={handleDiscardCard}
                      style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
                    >
                      🗑️ DESCARTAR Y GENERAR NUEVO CARTÓN
                    </button>
                  </div>
                ) : (
                  <div className="gamer-register-card">
                    <span className="gamer-register-icon">🎟️</span>
                    <h3>GENERADOR DE BOLETOS</h3>
                    <p>
                      La partida está activa. Ingresa tu nick de juego para recibir un cartón encriptado y conectarte al canal en directo.
                    </p>
                    
                    <form onSubmit={handleRegister} style={{ padding: '0 4px' }}>
                      {/* Banner de Validación de Pase Único */}
                      {tokenError && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1.5px solid #ef4444',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          color: '#fca5a5',
                          fontSize: '0.84rem',
                          lineHeight: 1.4,
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          {tokenError}
                        </div>
                      )}

                      {tokenSuccessMsg && (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1.5px solid #10b981',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          color: '#34d399',
                          fontSize: '0.84rem',
                          lineHeight: 1.4,
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          🎉 {tokenSuccessMsg}
                        </div>
                      )}

                      {!accessTokenData && activeGame?.customization?.accessConfig?.mode === 'code' && (
                        <div style={{ marginBottom: '16px' }}>
                          <div className="cyber-input-wrapper">
                            <input 
                              type="text" 
                              placeholder="CÓDIGO DE ACTIVACIÓN *" 
                              value={activationCode}
                              onChange={(e) => setActivationCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                              required
                              className="cyber-input"
                              disabled={isRegistering}
                              style={{ textTransform: 'uppercase', fontSize: '0.88rem', padding: '12px 14px 12px 38px' }}
                            />
                            <span className="cyber-input-icon" style={{ fontSize: '1rem', left: '12px' }}>
                              {codeValidationStatus === 'checking' ? '⏳' : codeValidationStatus === 'valid' ? '🟢' : (codeValidationStatus === 'invalid' || codeValidationStatus === 'used') ? '🔴' : '🎟️'}
                            </span>
                          </div>

                          {codeValidationMsg && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              marginTop: '4px', 
                              textAlign: 'left',
                              color: codeValidationStatus === 'valid' ? '#4ade80' : '#f87171',
                              fontWeight: 'bold'
                            }}>
                              {codeValidationMsg}
                            </div>
                          )}

                          <button 
                            type="button" 
                            className="cyber-badge" 
                            onClick={() => setShowPaymentModal(true)}
                            style={{ marginTop: '8px', width: '100%', padding: '8px 12px', fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '10px' }}
                          >
                            💳 ¿No tienes código? Paga o Solicítalo aquí
                          </button>
                        </div>
                      )}

                      {/* Subcontenedor de Entradas con Margen y Spacing Estético */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                        borderRadius: '18px',
                        padding: '16px 14px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                          gap: '12px 14px',
                          alignItems: 'start'
                        }}>
                          {/* Nickname del Jugador */}
                          <div className="cyber-input-wrapper" style={{ margin: 0 }}>
                            <input 
                              type="text" 
                              placeholder="NICKNAME DEL JUGADOR *" 
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              required
                              className="cyber-input"
                              disabled={isRegistering}
                              style={{ fontSize: '0.86rem', padding: '12px 14px 12px 38px' }}
                            />
                            <span className="cyber-input-icon" style={{ fontSize: '1rem', left: '12px' }}>👤</span>
                          </div>

                          {/* Teléfono Obligatorio */}
                          <div className="cyber-input-wrapper" style={{ margin: 0 }}>
                            <input 
                              type="tel" 
                              placeholder="TELÉFONO DEL JUGADOR *" 
                              value={playerPhone}
                              onChange={(e) => setPlayerPhone(e.target.value)}
                              required
                              className="cyber-input"
                              disabled={isRegistering}
                              style={{ fontSize: '0.86rem', padding: '12px 14px 12px 38px' }}
                            />
                            <span className="cyber-input-icon" style={{ fontSize: '1rem', left: '12px' }}>📞</span>
                          </div>

                          {/* Código de Promotor */}
                          <div className="cyber-input-wrapper" style={{ margin: 0 }}>
                            <input 
                              type="text" 
                              placeholder="CÓDIGO PROMOTOR *" 
                              value={playerPromoterCode}
                              onChange={(e) => setPlayerPromoterCode(e.target.value.toUpperCase())}
                              required
                              className="cyber-input"
                              disabled={isRegistering}
                              style={{ fontSize: '0.86rem', padding: '12px 14px 12px 38px' }}
                            />
                            <span className="cyber-input-icon" style={{ fontSize: '1rem', left: '12px' }}>📢</span>
                          </div>
                        </div>
                      </div>
                      
                      {regError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 'bold' }}>{regError}</div>}
                      
                      <button 
                        type="submit" 
                        className="cyber-btn-primary" 
                        disabled={isRegistering}
                        style={{
                          width: '100%',
                          padding: '14px 20px',
                          fontSize: '0.95rem',
                          fontWeight: 'bold',
                          borderRadius: '14px',
                          cursor: 'pointer',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {isRegistering ? 'ENCRIPTANDO CARTÓN...' : 'GENERAR MI CARTÓN 🎲'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* Tirador Vertical Flotante Pegado al Borde Izquierdo Móvil (Igual al menú de Premios) */}
      {createPortal(
        <button 
          type="button"
          className="bingo-instructions-vertical-handle"
          onClick={() => setShowInstructionsModal(true)}
          aria-label="Abrir Instrucciones de Juego"
          title="Guía e Instrucciones de Bingo"
        >
          <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px #a855f7)' }}>ℹ️</span>
          
          <span 
            style={{ 
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '0.66rem', 
              fontWeight: 900,
              letterSpacing: '1.5px', 
              color: '#a855f7',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
            }}
          >
            INSTRUCCIONES
          </span>

          <span style={{ fontSize: '0.65rem', color: '#ffffff', opacity: 0.9 }}>
            📖
          </span>
        </button>,
        document.body
      )}

      {/* Modal interactivo de Instrucciones para Móvil y Escritorio */}
      {showInstructionsModal && createPortal(
        <div className="bingo-instructions-overlay" onClick={() => setShowInstructionsModal(false)}>
          <div className="bingo-instructions-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bingo-instructions-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📘</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 'bold' }}>Guía e Instrucciones de Bingo</h3>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Editorial Lluvia de Ideas</span>
                </div>
              </div>
              <button 
                onClick={() => setShowInstructionsModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Tabs de Navegación del Modal */}
            <div className="bingo-instructions-nav">
              <button 
                type="button"
                className={`bingo-instructions-tab-btn ${instructionsTab === 'form' ? 'active' : ''}`}
                onClick={() => setInstructionsTab('form')}
              >
                📝 Llenar Formulario
              </button>
              <button 
                type="button"
                className={`bingo-instructions-tab-btn ${instructionsTab === 'promoter' ? 'active' : ''}`}
                onClick={() => setInstructionsTab('promoter')}
              >
                📢 Cód. Promotor
              </button>
              <button 
                type="button"
                className={`bingo-instructions-tab-btn ${instructionsTab === 'become' ? 'active' : ''}`}
                onClick={() => setInstructionsTab('become')}
              >
                💼 ¡Ser Promotor!
              </button>
              <button 
                type="button"
                className={`bingo-instructions-tab-btn ${instructionsTab === 'rules' ? 'active' : ''}`}
                onClick={() => setInstructionsTab('rules')}
              >
                🏆 Reglas del Juego
              </button>
            </div>

            {/* Cuerpo del Modal según Pestaña Selección */}
            <div className="bingo-instructions-body">
              {instructionsTab === 'form' && (
                <div>
                  <h4 style={{ color: '#00f0ff', marginBottom: '10px', marginTop: 0 }}>📝 ¿Cómo llenar el formulario para generar tu cartón?</h4>
                  <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#cbd5e1', margin: 0 }}>
                    <li><strong>Nickname / Nombre (*):</strong> Ingresa tu apodo de juego. Se mostrará públicamente cuando la tómbola anuncie que has cantado Bingo.</li>
                    <li><strong>Teléfono (*):</strong> Tu número obligatorio para comprobar e identificarte en caso de ser el ganador de la partida.</li>
                    <li><strong>Código de Promotor (*):</strong> Código obligatorio asignado por tu vendedor autorizado al adquirir o cancelar tu cartón.</li>
                    <li>Presiona <strong>"GENERAR MI CARTÓN 🎲"</strong> para recibir tu matriz 5x5 encriptada en tiempo real.</li>
                  </ol>
                </div>
              )}

              {instructionsTab === 'promoter' && (
                <div>
                  <h4 style={{ color: '#ec4899', marginBottom: '10px', marginTop: 0 }}>📢 ¿Qué es el Código de Promotor?</h4>
                  <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
                    El <strong>Código de Promotor</strong> es un identificador asignado a los asesores y vendedores oficiales.
                  </p>
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '14px', borderRadius: '14px', color: '#fbcfe8', marginBottom: '12px' }}>
                    <strong>💡 ¿Cómo lo obtengo?</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem' }}>
                      Tu promotor de ventas te facilitará su código una vez hayas cancelado o apartado tu cartón de Bingo para la partida.
                    </p>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '10px' }}>
                    Si quieres más información ponte en contacto con nosotros.
                  </p>
                  <a 
                    href={`https://wa.me/${CONTACT.whatsappPhone}?text=Hola,%20quisiera%20más%20información%20sobre%20el%20código%20de%20promotor%20del%20Bingo`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                    }}
                  >
                    💬 Contactar por WhatsApp
                  </a>
                </div>
              )}

              {instructionsTab === 'become' && (
                <div>
                  <h4 style={{ color: '#a855f7', marginBottom: '10px', marginTop: 0 }}>💼 ¡Gana dinero siendo Promotor de Bingo!</h4>
                  <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
                    Súmate a nuestro equipo de promotores oficiales y recibe una <strong>recompensa económica</strong> por cada jugador inscrito y por cada partida realizada según el valor del cartón.
                  </p>
                  
                  <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.35)', padding: '14px', borderRadius: '16px', marginBottom: '16px' }}>
                    <h5 style={{ color: '#e9d5ff', margin: '0 0 8px 0', fontSize: '0.9rem' }}>💎 Ventajas de ser Promotor:</h5>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>Comisión directa por cada cartón reservado o vendido con tu código.</li>
                      <li>Incentivos adicionales por volumen de participantes registrados en cada ronda.</li>
                      <li>Panel de control en tiempo real para rastrear a todos tus afiliados.</li>
                    </ul>
                  </div>

                  <a
                    href={`https://wa.me/${CONTACT.whatsappPhone}?text=Hola,%20me%20interesa%20ser%20Promotor%20oficial%20del%20Bingo`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      color: '#fff',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    💬 Solicitar mi Código de Promotor
                  </a>
                </div>
              )}

              {instructionsTab === 'rules' && (
                <div>
                  <h4 style={{ color: '#eab308', marginBottom: '10px', marginTop: 0 }}>🏆 Reglas del Juego y Formas de Ganar</h4>
                  <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>
                    En la partida se cantarán números del 1 al 75. Puedes marcar tus casillas tocando sobre cada número:
                  </p>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', margin: 0 }}>
                    <li><strong>Cartón Lleno:</strong> Debes completar las 24 casillas numeradas de tu cartón.</li>
                    <li><strong>Cuatro Esquinas:</strong> Debes marcar los 4 números de las esquinas del cartón.</li>
                    <li><strong>Diagonales (X):</strong> Completa cualquiera de las líneas diagonales de extremo a extremo.</li>
                    <li><strong>Línea:</strong> Completa cualquier fila horizontal o columna vertical entera.</li>
                    <li><strong>🔴 Ayuda Visual:</strong> Si marcas una casilla que aún no ha salido en la tómbola, su borde parpadeará en <span style={{ color: '#ef4444', fontWeight: 'bold' }}>rojo</span> como advertencia.</li>
                    <li><strong>¡Cantar Bingo!:</strong> Al presionar <strong>¡BINGO!</strong>, se notificará al instante al Host de la Tómbola para validar tu cartón.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ====== HOST SPONSOR SPOTLIGHT SHOWCASE MODAL ====== */}
      {activeSponsorModal && createPortal(
        <div 
          className="sponsor-spotlight-overlay" 
          onClick={() => setActiveSponsorModal(null)}
        >
          <div 
            className="sponsor-spotlight-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón rápido cerrar X en la esquina */}
            <button 
              className="sponsor-btn-close-corner"
              onClick={() => setActiveSponsorModal(null)}
              title="Cerrar patrocinador"
            >
              ✕
            </button>

            {/* Badge Superior */}
            <div className="sponsor-badge-pill">
              <span>✨</span> PATROCINADOR OFICIAL <span>✨</span>
            </div>

            {/* Pod del Logo */}
            <div className="sponsor-logo-stage" style={{ maxWidth: '440px', height: '180px' }}>
              <img 
                src={activeSponsorModal.logo} 
                alt={activeSponsorModal.name} 
              />
            </div>

            {/* Nombre del Patrocinador */}
            <h3 className="sponsor-brand-title" style={{ fontSize: '2.4rem' }}>
              {activeSponsorModal.name}
            </h3>

            {/* Mensaje / Eslogan si existe */}
            {activeSponsorModal.message && (
              <div className="sponsor-quote-box" style={{ maxWidth: '500px' }}>
                <p className="sponsor-quote-text" style={{ fontSize: '1.2rem' }}>
                  "{activeSponsorModal.message}"
                </p>
              </div>
            )}

            {/* Chip con la última bola cantada para mantener al público en contexto */}
            {activeGame?.drawnNumbers && activeGame.drawnNumbers.length > 0 && (() => {
              const last = activeGame.drawnNumbers[activeGame.drawnNumbers.length - 1];
              const meta = getBallMeta(last);
              return (
                <div className="sponsor-game-chip">
                  <span>Última bola cantada:</span>
                  <strong style={{ color: meta.color, fontSize: '1.05rem' }}>{meta.letter}-{last}</strong>
                </div>
              );
            })()}

            {/* Botón de Continuar */}
            <button 
              type="button" 
              className="sponsor-btn-continue"
              onClick={() => setActiveSponsorModal(null)}
            >
              Continuar Partida ➔
            </button>

            {/* Barra de progreso de autocierre */}
            <div className="sponsor-countdown-track">
              <div className="sponsor-countdown-bar" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Galería Completa de Premios Modal */}
      {showPrizesModal && createPortal(
        <div className="player-modal-overlay animate-fade-in" onClick={() => { setShowPrizesModal(false); setSelectedPrizeIndex(null); }} style={{ background: 'rgba(5, 2, 12, 0.92)', zIndex: 99999, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            className="player-modal card-glass animate-zoom-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '840px', 
              width: '100%', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column',
              padding: '24px', 
              borderRadius: '28px',
              border: `2px solid ${primaryColor}`,
              boxShadow: `0 0 50px ${primaryColor}55`,
              background: 'rgba(13, 6, 28, 0.97)',
              overflow: 'hidden'
            }}
          >
            {/* Header Compacto con Select Desplegable de Ordenamiento */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎁</span>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontFamily: 'var(--font-gamer)', textShadow: `0 0 12px ${primaryColor}aa` }}>
                  Galería de Premios
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Desplegable de Ordenamiento */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '5px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <label htmlFor="prizes-sort-select" style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Organizar:
                  </label>
                  <select
                    id="prizes-sort-select"
                    value={prizesSort}
                    onChange={(e) => setPrizesSort(e.target.value as 'asc' | 'desc' | 'category')}
                    style={{
                      background: 'rgba(13, 6, 28, 0.95)',
                      color: '#ffffff',
                      border: `1px solid ${primaryColor}`,
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.76rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: `0 0 10px ${primaryColor}44`
                    }}
                  >
                    <option value="asc" style={{ background: '#0d061c', color: '#fff' }}>⬇️ Menor a Mayor</option>
                    <option value="desc" style={{ background: '#0d061c', color: '#fff' }}>⬆️ Mayor a Menor</option>
                    <option value="category" style={{ background: '#0d061c', color: '#fff' }}>🏷️ Por Categoría</option>
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={() => { setShowPrizesModal(false); setSelectedPrizeIndex(null); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  aria-label="Cerrar galería"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Banner Destacado del Premio en Juego Activo */}
            {activeGame?.currentPrizeTitle && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                border: '1.5px solid #ffd700',
                borderRadius: '16px',
                padding: '10px 16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.65rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>EN JUEGO AHORA:</span>
                  <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '900' }}>
                    {activeGame.currentPrizeTitle}
                  </div>
                </div>
                <span style={{ fontSize: '1.4rem' }}>🏆</span>
              </div>
            )}

            {/* Slider de Showcase Horizontal */}
            {(() => {
              const prizesToDisplay = (cust?.prizes && cust.prizes.length > 0) ? cust.prizes : DEFAULT_SAMPLE_PRIZES;
              const sortedPrizes = [...prizesToDisplay].sort((a, b) => {
                if (prizesSort === 'asc') return (a.order || 0) - (b.order || 0);
                if (prizesSort === 'desc') return (b.order || 0) - (a.order || 0);
                if (prizesSort === 'category') return (a.category || '').localeCompare(b.category || '');
                return 0;
              });

              const handleScrollSlider = (direction: 'left' | 'right') => {
                if (sliderRef.current) {
                  const amount = direction === 'left' ? -320 : 320;
                  sliderRef.current.scrollBy({ left: amount, behavior: 'smooth' });
                }
              };

              return (
                <div className="prizes-showcase-container">
                  {/* Flechas de Navegación del Slider */}
                  {sortedPrizes.length > 1 && (
                    <>
                      <button 
                        type="button" 
                        className="slider-nav-btn prev"
                        onClick={() => handleScrollSlider('left')}
                        aria-label="Premio anterior"
                      >
                        ◀
                      </button>
                      <button 
                        type="button" 
                        className="slider-nav-btn next"
                        onClick={() => handleScrollSlider('right')}
                        aria-label="Premio siguiente"
                      >
                        ▶
                      </button>
                    </>
                  )}

                  {/* Carrusel Deslizable de Premios */}
                  <div className="prizes-showcase-slider" ref={sliderRef}>
                    {sortedPrizes.map((prize, idx) => (
                      <div 
                        key={prize.id} 
                        className="prize-card-item"
                        onClick={() => {
                          setSelectedPrizeIndex(idx);
                          setIsImageZoomed(false);
                        }}
                      >
                        <div className="prize-image-wrapper">
                          <img src={prize.image} alt={prize.title} />
                          <span style={{ position: 'absolute', top: '10px', right: '10px', background: primaryColor, color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '9999px', boxShadow: '0 3px 10px rgba(0,0,0,0.6)', zIndex: 2 }}>
                            Nivel #{prize.order || (idx + 1)}
                          </span>
                          <div className="prize-image-overlay">
                            <span className="prize-zoom-btn-badge">
                              🔍 Tap para Ampliar
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            {prize.category && (
                              <span style={{ fontSize: '0.7rem', color: accentColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
                                {prize.category}
                              </span>
                            )}
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#fff', fontFamily: 'var(--font-gamer)', lineHeight: '1.3' }}>
                              {prize.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {prize.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPrizeIndex(idx);
                              setIsImageZoomed(false);
                            }}
                            style={{
                              marginTop: '14px',
                              padding: '8px 14px',
                              borderRadius: '12px',
                              border: `1.5px solid ${primaryColor}88`,
                              background: `linear-gradient(135deg, ${primaryColor}22 0%, rgba(255,255,255,0.05) 100%)`,
                              color: '#fff',
                              fontSize: '0.78rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.2s'
                            }}
                          >
                            🔍 Estudiar Premio
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Indicador de Deslizamiento */}
                  <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span>👈 Desliza horizontalmente para ver todos los premios ({sortedPrizes.length}) 👉</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Visor Ampliado de Premio (Lightbox Zoom 3D) */}
      {selectedPrizeIndex !== null && createPortal(
        (() => {
          const prizesToDisplay = (cust?.prizes && cust.prizes.length > 0) ? cust.prizes : DEFAULT_SAMPLE_PRIZES;
          const sortedPrizes = [...prizesToDisplay].sort((a, b) => {
            if (prizesSort === 'asc') return (a.order || 0) - (b.order || 0);
            if (prizesSort === 'desc') return (b.order || 0) - (a.order || 0);
            if (prizesSort === 'category') return (a.category || '').localeCompare(b.category || '');
            return 0;
          });
          const activePrize = sortedPrizes[selectedPrizeIndex] || sortedPrizes[0];

          return (
            <div 
              className="player-modal-overlay animate-fade-in"
              onClick={() => { setSelectedPrizeIndex(null); setIsImageZoomed(false); }}
              style={{ background: 'rgba(3, 1, 10, 0.95)', zIndex: 999999, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            >
              <div 
                className="prize-lightbox-card card-glass animate-zoom-in"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '750px',
                  width: '100%',
                  maxHeight: '94vh',
                  overflowY: 'auto',
                  borderRadius: '28px',
                  border: `3px solid ${primaryColor}`,
                  boxShadow: `0 0 60px ${primaryColor}77`,
                  background: 'rgba(11, 5, 24, 0.98)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative'
                }}
              >
                {/* Botón de Cierre */}
                <button
                  type="button"
                  onClick={() => { setSelectedPrizeIndex(null); setIsImageZoomed(false); }}
                  style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                >
                  ✕
                </button>

                {/* Título del Premio en Lightbox */}
                <div style={{ paddingRight: '45px' }}>
                  {activePrize.category && (
                    <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {activePrize.category}
                    </span>
                  )}
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-gamer)', textShadow: `0 0 16px ${primaryColor}aa` }}>
                    {activePrize.title}
                  </h3>
                </div>

                {/* Marco Interactivo de Imagen con Lupa y Zoom */}
                <div 
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: isImageZoomed ? '420px' : '280px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#000',
                    border: `2px solid ${accentColor}`,
                    boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${accentColor}44`,
                    cursor: 'zoom-in',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  title="Toca para alternar Zoom de Imagen"
                >
                  <img 
                    src={activePrize.image} 
                    alt={activePrize.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: isImageZoomed ? 'contain' : 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {isImageZoomed ? '🔍 Toca para Reducir' : '🔍 Toca para Ampliar Foto'}
                  </div>
                </div>

                {/* Descripción Detallada del Premio */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-gamer)' }}>DESCRIPCIÓN DEL PREMIO</h4>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {activePrize.description}
                  </p>
                </div>

                {/* Controles de Navegación entre Premios */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPrizeIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : sortedPrizes.length - 1))}
                    style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ◀ Anterior
                  </button>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>
                    Premio {selectedPrizeIndex + 1} de {sortedPrizes.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedPrizeIndex((prev) => (prev !== null && prev < sortedPrizes.length - 1 ? prev + 1 : 0))}
                    style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Siguiente ▶
                  </button>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* Custom Alert/Confirm Modal */}
      {dialogConfig?.isOpen && createPortal(
        <div className="player-modal-overlay" style={{ zIndex: 999999 }} onClick={() => {
          if (dialogConfig.type === 'alert' && dialogConfig.onConfirm) {
            dialogConfig.onConfirm();
          } else if (dialogConfig.type === 'confirm' && dialogConfig.onCancel) {
            dialogConfig.onCancel();
          }
        }}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()} style={{ 
            borderColor: activeGame?.customization?.primaryColor || 'var(--cyber-primary)',
            boxShadow: `0 0 25px ${(activeGame?.customization?.primaryColor || '#a855f7')}55`
          }}>
            <span className="player-modal-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>
              {dialogConfig.icon}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-gamer)', color: '#fff', marginBottom: '12px' }}>
              {dialogConfig.title}
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '20px', color: '#e2dbf0' }}>
              {dialogConfig.message}
            </p>
            <div className="player-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {dialogConfig.type === 'confirm' && (
                <button
                  className="btn-modal-cancel"
                  onClick={dialogConfig.onCancel}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  {dialogConfig.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={dialogConfig.onConfirm}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  fontSize: '0.85rem', 
                  background: activeGame?.customization?.primaryColor || 'var(--cyber-primary)', 
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {dialogConfig.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Payment & Request Code Modal */}
      {showPaymentModal && createPortal(
        <div className="player-modal-overlay" style={{ zIndex: 999999 }} onClick={() => setShowPaymentModal(false)}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()} style={{ 
            borderColor: '#3b82f6',
            boxShadow: '0 0 35px rgba(59, 130, 246, 0.45)',
            maxWidth: '480px'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>💳</span>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-gamer)', color: '#fff', marginBottom: '10px' }}>
              MEDIOS DE PAGO Y SOLICITUD
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.4' }}>
              Realiza el pago correspondiente y envía tu comprobante por WhatsApp para recibir tu código único de activación.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px' }}>
              {activeGame?.customization?.accessConfig?.paymentInfo?.sinpeNumber && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>📱 SINPE Móvil</span>
                  <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                    {activeGame.customization.accessConfig.paymentInfo.sinpeNumber}
                  </strong>
                </div>
              )}

              {activeGame?.customization?.accessConfig?.paymentInfo?.bankAccount && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>🏦 Cuenta / IBAN</span>
                  <strong style={{ fontSize: '0.9rem', color: '#fff', wordBreak: 'break-all' }}>
                    {activeGame.customization.accessConfig.paymentInfo.bankAccount}
                  </strong>
                </div>
              )}

              {activeGame?.customization?.accessConfig?.paymentInfo?.paymentInstructions && (
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>📝 Indicaciones de Pago</span>
                  <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {activeGame.customization.accessConfig.paymentInfo.paymentInstructions}
                  </p>
                </div>
              )}

              {activeGame?.customization?.accessConfig?.paymentInfo?.whatsappNumber ? (
                <a 
                  href={`https://wa.me/${activeGame.customization.accessConfig.paymentInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, me gustaría comprar un cartón para el Bingo "${activeGame.title}". Mi nombre es ${playerName || '[Ingresa tu Nombre]'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#22c55e',
                    color: '#fff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                    marginTop: '5px'
                  }}
                >
                  💬 Enviar Comprobante / Solicitar por WhatsApp
                </a>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#f87171', fontStyle: 'italic', textAlign: 'center' }}>
                  Comunícate con el organizador del evento para recibir las instrucciones de recaudo.
                </div>
              )}
            </div>

            <button 
              type="button"
              className="btn-modal-cancel" 
              onClick={() => setShowPaymentModal(false)}
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
            >
              Cerrar Ventana
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Sponsor Animation CSS */}
      <style>{`
        @keyframes floatGamer {
          0% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -6px); }
          100% { transform: translate(-50%, 0px); }
        }
      `}</style>
    </div>
  );
}
