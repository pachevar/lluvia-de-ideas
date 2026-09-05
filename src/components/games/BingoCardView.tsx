import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import type { BingoCard, BingoGame, BingoPrize, Sponsor } from '../../types';
import { validateBingoCard } from '../../utils/bingoGenerator';
import { soundEffects } from '../../utils/soundEffects';
import html2canvas from 'html2canvas';
import './Bingo.css';

type StoredCardMatrix = {
  r0: (number | null)[];
  r1: (number | null)[];
  r2: (number | null)[];
  r3: (number | null)[];
  r4: (number | null)[];
};

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
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

  if (num > 15 && num <= 30) {
    letter = 'I';
    range = '16 - 30';
    color = '#ec4899'; // Hot pink / magenta
    gradient = 'radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 50%, #be185d 85%, #831843 100%)';
    glow = 'rgba(236, 72, 153, 0.6)';
  } else if (num > 30 && num <= 45) {
    letter = 'N';
    range = '31 - 45';
    color = '#a855f7'; // Purple / violet
    gradient = 'radial-gradient(circle at 35% 30%, #c084fc 0%, #9333ea 50%, #7e22ce 85%, #581c87 100%)';
    glow = 'rgba(168, 85, 247, 0.6)';
  } else if (num > 45 && num <= 60) {
    letter = 'G';
    range = '46 - 60';
    color = '#10b981'; // Emerald
    gradient = 'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 50%, #047857 85%, #064e3b 100%)';
    glow = 'rgba(16, 185, 129, 0.6)';
  } else if (num > 60 && num <= 75) {
    letter = 'O';
    range = '61 - 75';
    color = '#f59e0b'; // Gold / amber
    gradient = 'radial-gradient(circle at 35% 30%, #fde047 0%, #f59e0b 50%, #d97706 85%, #78350f 100%)';
    glow = 'rgba(245, 158, 11, 0.6)';
  }

  return { letter, range, color, gradient, glow };
};

export default function BingoCardView() {
  const { cartonId } = useParams<{ cartonId: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<BingoCard | null>(null);
  const [gameData, setGameData] = useState<BingoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Mobile UX Enhancements: Drawer, Pocket Ball Alert & Waiting Test
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [cardHasLastBall, setCardHasLastBall] = useState(false);
  const [testFeedbackActive, setTestFeedbackActive] = useState(false);
  const previousBallsRailRef = useRef<HTMLDivElement>(null);

  // Secondary Card Gamer Menu & Prizes Modal States
  const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [prizesSort, setPrizesSort] = useState<'asc' | 'desc' | 'category'>('asc');
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [dismissedWinnerTs, setDismissedWinnerTs] = useState<number | null>(null);

  const downloadWinnerTicket = async () => {
    if (!ticketRef.current || !cardData || !gameData) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Ticket_Ganador_Bingo_${cardData.playerName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error al generar la imagen del ticket:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Local state for marked slots
  const [markedSlots, setMarkedSlots] = useState<boolean[][]>(Array(5).fill(null).map(() => Array(5).fill(false)));

  // Confetti particles
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // Assist Mode and Audio ref
  const [assistMode, setAssistMode] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Player Modal states
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [activeSponsorModal, setActiveSponsorModal] = useState<Sponsor | null>(null);

  // Voice announcement and confirmation states
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('bingo_voice_mode') === 'true');
  const [winnerDismissed, setWinnerDismissed] = useState(false);
  const prevDrawnCountRef = useRef(0);

  // Reloj Regresivo en Tiempo Real para la Próxima Ronda (soporta Días, Horas, Minutos, Segundos)
  const [timeLeft, setTimeLeft] = useState<{ 
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
    if (!gameData?.nextRoundTime || gameData.status !== 'waiting') {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const target = gameData.nextRoundTime!;
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

      setTimeLeft({
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
  }, [gameData?.nextRoundTime, gameData?.status]);



  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    }
  };

  const playFeedbackSound = (isSuccess: boolean, isToggleOff: boolean = false) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (isToggleOff) {
        // Simple click sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (isSuccess) {
        // High pleasant pitch chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Low buzzing error tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, now); // C3
        osc.frequency.setValueAtTime(110.00, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  const getProximityStatus = () => {
    if (!cardData || !gameData) return null;
    const validation = validateBingoCard(cardData.matrix, gameData.drawnNumbers, gameData.winningPattern);
    return validation.missingNumbers.length;
  };

  const speakBall = (ball: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    let letter = 'B';
    if (ball > 15 && ball <= 30) letter = 'I';
    if (ball > 30 && ball <= 45) letter = 'N';
    if (ball > 45 && ball <= 60) letter = 'G';
    if (ball > 60 && ball <= 75) letter = 'O';

    const utterance = new SpeechSynthesisUtterance(`Letra ${letter}... número ${ball}`);
    
    // Búsqueda inteligente de voz en español
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-GT';
    }
    utterance.pitch = 1.0;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const speakConfirmation = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Cantar bolas activado");
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-GT';
    }
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!cartonId) return;

    let unsubscribeGame: (() => void) | undefined;
    let unsubscribeCard: (() => void) | undefined;

    const setupListeners = () => {
      unsubscribeCard = onSnapshot(doc(db, 'bingo_cards', cartonId), (cardSnap) => {
        if (cardSnap.exists()) {
          const rawData = cardSnap.data() as Partial<BingoCard> & { matrix: StoredCardMatrix };
          const matrix = [
            rawData.matrix.r0,
            rawData.matrix.r1,
            rawData.matrix.r2,
            rawData.matrix.r3,
            rawData.matrix.r4
          ];
          const cData: BingoCard = {
            ...rawData,
            id: cardSnap.id,
            gameId: rawData.gameId || '',
            matrix
          } as BingoCard;

          setCardData(prevCard => {
            // Si el cartón acaba de ser confirmado como ganador en Firebase, disparamos confeti
            if (rawData.winnerConfirmed && (!prevCard || !prevCard.winnerConfirmed)) {
              triggerConfetti();
            }
            return cData;
          });

          // Inicializar las marcas desde localStorage si están vacías
          setMarkedSlots(prev => {
            const isDefault = prev.every(row => row.every(val => !val));
            if (isDefault) {
              const storedMarksStr = localStorage.getItem(`bingo_marks_${cartonId}`);
              if (storedMarksStr) {
                try {
                  const parsed = JSON.parse(storedMarksStr);
                  return parsed;
                } catch (e) {
                  console.error("Error parsing stored marks", e);
                }
              }
              // Inicializar por defecto (centro en true)
              const initialMarks = Array(5).fill(null).map(() => Array(5).fill(false));
              initialMarks[2][2] = true;
              return initialMarks;
            }
            return prev;
          });

          // Suscribirse a la partida si no está configurada
          if (!unsubscribeGame) {
            unsubscribeGame = onSnapshot(doc(db, 'bingo_games', cData.gameId), (gameSnap) => {
              if (gameSnap.exists()) {
                setGameData({ id: gameSnap.id, ...gameSnap.data() } as BingoGame);
              }
              setLoading(false);
            }, (err) => {
              console.error(err);
              setError("Error al conectar con la partida en vivo.");
              setLoading(false);
            });
          }
        } else {
          localStorage.removeItem('my_bingo_card_id');
          if (cartonId) localStorage.removeItem(`bingo_marks_${cartonId}`);
          setError("La sesión de juego fue limpiada por el organizador. Ya puedes volver al inicio para generar tu nuevo cartón.");
          setLoading(false);
        }
      }, (err) => {
        console.error(err);
        setError("Error al cargar el cartón.");
        setLoading(false);
      });
    };

    setupListeners();

    return () => {
      if (unsubscribeCard) unsubscribeCard();
      if (unsubscribeGame) unsubscribeGame();
    };
  }, [cartonId]);

  // Test interactivo de sonido y respuesta háptica en sala de espera
  const testSoundAndHaptics = () => {
    setTestFeedbackActive(true);
    soundEffects.playMathChime(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([40, 60, 40]); } catch {}
    }
    setTimeout(() => setTestFeedbackActive(false), 2200);
  };

  // Escuchar nuevas bolas para reproducir sonido de alerta y cantar la bola si voiceMode está activo
  useEffect(() => {
    if (!gameData || gameData.status !== 'playing') return;
    const currentCount = gameData.drawnNumbers.length;
    if (currentCount > prevDrawnCountRef.current) {
      const newBall = gameData.drawnNumbers[currentCount - 1];
      
      // Verificar si la bola extraída está presente en el cartón del jugador
      let isInCard = false;
      if (cardData?.matrix) {
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (r === 2 && c === 2) continue; // omitir comodín
            if (cardData.matrix[r][c] === newBall) {
              isInCard = true;
              break;
            }
          }
          if (isInCard) break;
        }
      }

      if (isInCard) {
        // Alerta especial de acierto con fanfarria sutil y vibración de confirmación
        soundEffects.playMathChime(true);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([30, 40, 30]); } catch {}
        }
        setCardHasLastBall(true);
        setTimeout(() => setCardHasLastBall(false), 4500);
      } else {
        // Sonido suave de notificación regular
        playFeedbackSound(true);
      }

      if (voiceMode) {
        speakBall(newBall);
      }
    }
    prevDrawnCountRef.current = currentCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- playFeedbackSound is a stable-by-convention closure; gameData tracked via drawnNumbers
  }, [gameData?.drawnNumbers, voiceMode, cardData]);

  // Limpiar marcas y almacenamiento si la partida se reinicia o se inicia una nueva ronda
  const lastResetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameData || !cartonId) return;

    const currentReset = gameData.lastResetAt || 0;
    const isDrawnEmpty = !gameData.drawnNumbers || gameData.drawnNumbers.length === 0;

    if (
      gameData.status === 'waiting' ||
      isDrawnEmpty ||
      (lastResetRef.current !== null && lastResetRef.current !== currentReset)
    ) {
      // Limpiar marcas locales (dejar solo el comodín central en true)
      const clearedMarks = Array(5).fill(null).map(() => Array(5).fill(false));
      clearedMarks[2][2] = true;

      setMarkedSlots(clearedMarks);
      localStorage.removeItem(`bingo_marks_${cartonId}`);

      // Resetear estados adicionales del jugador
      setWinnerDismissed(false);
      setShowBingoModal(false);
      prevDrawnCountRef.current = 0;
    }
    lastResetRef.current = currentReset;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- narrow deps track the reset source; whole gameData would retrigger on every sync
  }, [gameData?.status, gameData?.drawnNumbers?.length, gameData?.lastResetAt, cartonId]);

  // Auto-reset previous balls rail scroll position to the newest past ball when a new number arrives
  useEffect(() => {
    if (previousBallsRailRef.current) {
      previousBallsRailRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [gameData?.drawnNumbers?.length]);

  // Auto-dismiss sponsor spotlight modal after 6 seconds
  useEffect(() => {
    if (activeSponsorModal) {
      const timer = setTimeout(() => {
        setActiveSponsorModal(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeSponsorModal]);

  const toggleMark = (row: number, col: number) => {
    if (row === 2 && col === 2) return;
    if (!cardData || !gameData) return;
    
    const value = cardData.matrix[row][col];
    if (value === null) return;

    const isCurrentlyMarked = markedSlots[row][col];
    const isDrawn = gameData.drawnNumbers.includes(value);

    // Play synthesized sound y respuesta háptica reforzada
    if (!isCurrentlyMarked) {
      playFeedbackSound(isDrawn);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { 
          if (isDrawn) {
            navigator.vibrate([25, 40, 25]); // doble pulso si acertó bola
          } else {
            navigator.vibrate(15); // clic táctil sutil
          }
        } catch {}
      }

      // Trigger sponsor modal on player side for every 5 marked slots
      const newMarks = markedSlots.map(r => [...r]);
      newMarks[row][col] = true;
      
      const markedCount = newMarks.reduce((acc, r, rIdx) => 
        acc + r.reduce((sum, val, cIdx) => {
          if (rIdx === 2 && cIdx === 2) return sum; // Skip center slot
          return sum + (val ? 1 : 0);
        }, 0)
      , 0);

      const sponsorConfig = gameData.customization?.sponsorConfig;
      const sponsorsList = gameData.customization?.sponsors;
      if (sponsorConfig?.active && sponsorsList && sponsorsList.length > 0) {
        const interval = sponsorConfig.interval || 5;
        if (markedCount > 0 && markedCount % interval === 0) {
          const idx = (Math.floor(markedCount / interval) - 1) % sponsorsList.length;
          setActiveSponsorModal(sponsorsList[idx]);
        }
      }
    } else {
      playFeedbackSound(false, true); // toggle off click
    }

    setMarkedSlots(prev => {
      const newMarks = prev.map(r => [...r]);
      newMarks[row][col] = !newMarks[row][col];
      localStorage.setItem(`bingo_marks_${cartonId}`, JSON.stringify(newMarks));
      return newMarks;
    });
  };

  const triggerConfetti = () => {
    const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#fbbf24', '#ec4899'];
    const particles: ConfettiParticle[] = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      y: -10 - Math.random() * 20, // start above screen
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 3
    }));
    setConfetti(particles);

    // Clear confetti after animation ends
    setTimeout(() => {
      setConfetti([]);
    }, 5000);
  };

  const checkHasWinningPattern = (slots: boolean[][], pattern: string): boolean => {
    if (!slots || slots.length < 5) return false;

    const isMarked = (r: number, c: number) => {
      if (r === 2 && c === 2) return true; // Casilla central FREE
      return Boolean(slots[r]?.[c]);
    };

    if (pattern === 'full') {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (!isMarked(r, c)) return false;
        }
      }
      return true;
    }

    if (pattern === 'four_corners') {
      return isMarked(0, 0) && isMarked(0, 4) && isMarked(4, 0) && isMarked(4, 4);
    }

    if (pattern === 'diagonal') {
      let diag1 = true;
      for (let i = 0; i < 5; i++) {
        if (!isMarked(i, i)) diag1 = false;
      }
      let diag2 = true;
      for (let i = 0; i < 5; i++) {
        if (!isMarked(i, 4 - i)) diag2 = false;
      }
      return diag1 || diag2;
    }

    if (pattern === 'line') {
      for (let r = 0; r < 5; r++) {
        let rowMarked = true;
        for (let c = 0; c < 5; c++) {
          if (!isMarked(r, c)) rowMarked = false;
        }
        if (rowMarked) return true;
      }
      for (let c = 0; c < 5; c++) {
        let colMarked = true;
        for (let r = 0; r < 5; r++) {
          if (!isMarked(r, c)) colMarked = false;
        }
        if (colMarked) return true;
      }
      return false;
    }

    // Default fallback: require full house
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!isMarked(r, c)) return false;
      }
    }
    return true;
  };

  const shoutBingo = async () => {
    if (!cardData || !gameData || !cartonId) return;

    const pattern = gameData.winningPattern || 'full';
    if (!checkHasWinningPattern(markedSlots, pattern)) {
      alert("⚠️ Para cantar Bingo debes haber marcado en tu cartón todas las casillas requeridas según el patrón activo de la partida.");
      return;
    }

    try {
      const { runTransaction, serverTimestamp } = await import('firebase/firestore');

      // Convertir markedSlots (2D) a objeto seguro
      const markedObject = {
        r0: (markedSlots[0] || []).map(v => Boolean(v)),
        r1: (markedSlots[1] || []).map(v => Boolean(v)),
        r2: (markedSlots[2] || []).map(v => Boolean(v)),
        r3: (markedSlots[3] || []).map(v => Boolean(v)),
        r4: (markedSlots[4] || []).map(v => Boolean(v))
      };

      const gameRef = doc(db, 'bingo_games', gameData.id);
      const cardRef = doc(db, 'bingo_cards', cartonId);

      // Transacción Atómica Serializada en Google Firestore:
      // Si 20 personas cantan en el mismo milisegundo, solo la primera tiene éxito
      // y bloquea inmediatamente el turno mientras las demás reciben aviso en tiempo real.
      const result = await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
          throw new Error("PARTIDA_NO_ENCONTRADA");
        }

        const gData = gameSnap.data();
        const activeClaim = gData.activeClaim;

        // Si ya hay un reclamo pendiente de OTRO cartón:
        if (activeClaim && activeClaim.status === 'pending' && activeClaim.cardId !== cartonId) {
          return {
            success: false,
            claimedBy: activeClaim.playerName || 'Otro participante'
          };
        }

        // Este jugador es el primero y único:
        transaction.update(gameRef, {
          lastBingoShoutAt: Date.now(),
          activeClaim: {
            cardId: cartonId,
            playerName: cardData.playerName || 'Jugador',
            phone: cardData.phone || '',
            claimedAt: Date.now(),
            serverClaimedAt: serverTimestamp(),
            status: 'pending'
          }
        });

        transaction.update(cardRef, {
          shoutedBingo: true,
          shoutedAt: Date.now(),
          serverShoutedAt: serverTimestamp(),
          markedSlots: markedObject
        });

        return { success: true };
      });

      if (!result.success) {
        soundEffects.playMathChime(false);
        alert(`⚠️ ¡Atención! El jugador "${result.claimedBy}" cantó Bingo fracciones de segundo antes que tú.\n\nSu cartón se encuentra en proceso de verificación con el Host en vivo. Si su cartón no resulta ganador, la partida continuará y podrás cantar.`);
        return;
      }

      soundEffects.playSuccessFanfare();
      triggerConfetti();
      setShowBingoModal(true);
    } catch (e) {
      console.error("Error al registrar grito atómico de Bingo en Firestore:", e);
      alert("Error de conexión al cantar Bingo. Verifica tu conexión a internet e inténtalo de nuevo.");
    }
  };

  const handleAbandonCard = () => {
    setShowAbandonModal(true);
  };

  const confirmAbandon = () => {
    localStorage.removeItem('my_bingo_card_id');
    localStorage.removeItem(`bingo_marks_${cartonId}`);
    setShowAbandonModal(false);
    navigate('/juegos/bingo');
  };

  if (loading) return <div className="bingo-card-view-pane"><div className="spinner"></div></div>;
  if (error) {
    return (
      <div 
        className="bingo-card-view-pane theme-classic" 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '80px 20px 20px'
        }}
      >
        <div 
          className="cyber-panel" 
          style={{ 
            maxWidth: '450px', 
            width: '100%', 
            padding: '40px 30px', 
            borderRadius: '24px',
            border: '2px solid #a855f7',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
            background: 'rgba(13, 6, 28, 0.96)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            color: '#e2dbf0',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '4.5rem', display: 'block', filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.6))', animation: 'pulseIcon 2s infinite ease-in-out' }}>
            🔌
          </span>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.8rem', 
            fontFamily: 'var(--font-gamer, Orbitron, sans-serif)', 
            fontWeight: 900,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
          }}>
            Cartón No Activo
          </h2>
          
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            lineHeight: '1.5', 
            color: '#e2dbf0', 
            opacity: 0.95 
          }}>
            {error}. Es probable que la sesión de juego haya finalizado o el organizador haya limpiado el registro de jugadores.
          </p>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(168, 85, 247, 0.2)', margin: '10px 0' }}></div>
          
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#00f0ff', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ¿Quieres unirte a una nueva partida?
          </p>

          <button 
            type="button" 
            onClick={() => navigate('/juegos/bingo')}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
              transition: 'all 0.2s',
              width: '100%',
              fontFamily: 'var(--font-gamer, Orbitron, sans-serif)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            Ir al Lobby del Bingo ➔
          </button>
        </div>
      </div>
    );
  }
  if (!cardData || !gameData) return null;

  const cust = gameData.customization;
  const primaryColor = cust?.primaryColor || '#a855f7';
  const accentColor = cust?.accentColor || '#ec4899';
  const backgroundColor = cust?.backgroundColor || '#fbf9ff';
  const markerEmoji = cust?.markerEmoji || '⭐';
  const ticketTheme = cust?.themeName || 'classic';



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
    if (!cust || !cust.themeName) return 'theme-classic';
    return `theme-${cust.themeName}`;
  };

  const cols = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className={`bingo-card-view-pane animate-fade-in ${getThemeClass()}`} style={{ ...customStyles, paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* Tirador Flotante Pegado al Borde de la Pantalla (Viewport Flush Fixed Handle) */}
      {createPortal(
        <button 
          className={`card-gamer-sidebar-handle ${showPrizesModal ? 'active' : ''}`}
          onClick={() => setShowPrizesModal(true)}
          aria-label="Abrir Galería de Premios"
          style={{
            position: 'fixed',
            top: '55px',
            left: 0,
            zIndex: 99997,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 6px',
            width: '36px',
            borderRadius: '0 16px 16px 0',
            background: 'rgba(13, 6, 28, 0.95)',
            border: `2px solid ${primaryColor}`,
            borderLeft: 'none',
            boxShadow: `4px 0 25px ${primaryColor}77`,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-gamer, Orbitron, sans-serif)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title="Ver Galería de Premios"
        >
          <span style={{ fontSize: '1.25rem', filter: `drop-shadow(0 0 8px ${primaryColor})` }}>🎁</span>
          
          <span 
            style={{ 
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '0.68rem', 
              fontWeight: 900,
              letterSpacing: '1.5px', 
              color: primaryColor,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: `0 0 10px ${primaryColor}aa`
            }}
          >
            PREMIOS
          </span>

          <span style={{ fontSize: '0.65rem', color: '#ffffff', opacity: 0.9 }}>
            🔍
          </span>
        </button>,
        document.body
      )}

      {/* Drawer Lateral Desplegable del Cartón */}
      {isCardMenuOpen && createPortal(
        <div 
          className="card-gamer-drawer-overlay animate-fade-in" 
          onClick={() => setIsCardMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 2, 12, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99998
          }}
        >
          <div 
            className="card-gamer-sidebar-drawer animate-slide-right"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '290px',
              maxWidth: '85vw',
              height: '100vh',
              background: 'rgba(13, 6, 28, 0.98)',
              borderRight: `2px solid ${primaryColor}`,
              boxShadow: `10px 0 40px rgba(0,0,0,0.8), 0 0 25px ${primaryColor}55`,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 99999,
              overflowY: 'auto'
            }}
          >
            {/* Header del Menú Lateral */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontFamily: 'var(--font-gamer)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎮</span> Menú Cartón
                </h3>
                <span style={{ fontSize: '0.72rem', color: primaryColor, opacity: 0.9, marginTop: '2px', display: 'block' }}>
                  {gameData?.title || 'Bingotenango'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCardMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', opacity: 0.7, padding: '4px' }}
              >
                ✕
              </button>
            </div>

            {/* Opciones del Menú */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              
              {/* Opción 1: Lista de Premios */}
              <button 
                type="button"
                onClick={() => {
                  setIsCardMenuOpen(false);
                  setShowPrizesModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${primaryColor}25 0%, ${accentColor}25 100%)`,
                  border: `1px solid ${primaryColor}66`,
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: `0 4px 15px ${primaryColor}22`,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>🎁</span>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '0.9rem' }}>Galería de Premios</span>
                  <small style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Ver premios acumulados</small>
                </div>
                <span style={{ fontSize: '0.85rem', color: primaryColor }}>➔</span>
              </button>

              {/* Info de Estado del Cartón */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  🎯 Patrón Activo de Victoria
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#fff', display: 'block' }}>
                  {gameData?.winningPattern === 'full' && '🏆 Cartón Lleno'}
                  {gameData?.winningPattern === 'line' && '📏 Cualquier Línea'}
                  {gameData?.winningPattern === 'diagonal' && '📐 Diagonal'}
                  {gameData?.winningPattern === 'four_corners' && '🔲 4 Esquinas'}
                </strong>
              </div>

              {/* Botón de Abandonar Cartón */}
              <button
                type="button"
                onClick={() => {
                  setIsCardMenuOpen(false);
                  handleAbandonCard();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  marginTop: 'auto'
                }}
              >
                <span>🚪</span> Cambiar / Salir del Cartón
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confetti Render */}
      {confetti.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall 4s linear ${p.delay}s infinite`,
            zIndex: 999,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Customizable Session Title - Compacto y sin duplicación */}
      <div className="bingo-card-session-title compact-session-header" style={{ textAlign: 'center', margin: '8px 0 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <img 
            src="/bingotenango-logo.svg" 
            alt="Bingotenango" 
            style={{ maxHeight: '46px', width: 'auto', filter: 'drop-shadow(0 0 12px rgba(88, 205, 238, 0.45))' }} 
          />
        </div>
        {/* Solo mostrar título secundario si es distinto a 'Bingotenango' para evitar duplicados */}
        {cust?.title && cust.title.trim().toLowerCase() !== 'bingotenango' && (
          <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-gamer)', color: '#fff', margin: '2px 0 0' }}>
            {cust.title}
          </h2>
        )}
        {cust?.subtitle && (
          <p style={{ fontSize: '0.78rem', color: 'var(--cyber-cyan)', margin: '2px 0 0', opacity: 0.85 }}>
            {cust.subtitle}
          </p>
        )}
      </div>

      {/* Banner Compacto */}
      {cust?.headerImage && (
        <div 
          className="bingo-card-banner" 
          style={{ 
            maxWidth: '100%', 
            margin: '6px auto', 
            height: cust.headerHeight ? `${Math.min(cust.headerHeight, 90)}px` : '75px', 
            overflow: 'hidden', 
            borderRadius: '10px' 
          }}
        >
          <img src={cust.headerImage} alt="Bingo Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* 1. ENCABEZADO COMPACTO DE ALTA EFICIENCIA (SOLO 52px DE ALTO) */}
      <div className="compact-player-bar">
        <div className="player-meta-left">
          <span className="player-avatar">👤</span>
          <div className="player-texts">
            <strong className="player-title">{cardData.playerName}</strong>
            <div className="player-status-pill">
              <span className={`status-dot ${gameData?.status || 'waiting'}`} />
              <span>{gameData?.status === 'playing' ? 'En Juego' : gameData?.status === 'waiting' ? 'Sala de Espera' : 'Finalizado'}</span>
            </div>
          </div>
        </div>

        <div className="player-meta-right">
          <code className="compact-card-id">#{cartonId && cartonId.length > 8 ? `${cartonId.slice(0, 4)}...${cartonId.slice(-3)}` : cartonId}</code>
          <button 
            className="btn-settings-toggle"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Ajustes de Sonido y Asistencia"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* DRAWER DESPLEGABLE DE AJUSTES (NO CONSUME ESPACIO FIJO) */}
      {showSettingsDrawer && (
        <div className="compact-settings-drawer animate-fade-in">
          <div className="drawer-row">
            <span>🤖 Modo Asistido (Ayuda visual)</span>
            <label className="cyber-switch" style={{ transform: 'scale(0.85)', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={assistMode}
                onChange={(e) => {
                  initAudio();
                  setAssistMode(e.target.checked);
                  playFeedbackSound(false, true);
                }}
              />
              <span className="cyber-slider" />
            </label>
          </div>
          <div className="drawer-row">
            <span>🔊 Cantar bolas por voz</span>
            <label className="cyber-switch" style={{ transform: 'scale(0.85)', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={voiceMode}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setVoiceMode(checked);
                  localStorage.setItem('bingo_voice_mode', checked ? 'true' : 'false');
                  if (checked) {
                    speakConfirmation();
                  }
                }}
              />
              <span className="cyber-slider" />
            </label>
          </div>

          {/* 🎯 OBJETIVO PARA GANAR (DENTRO DEL MENÚ DE AJUSTES) */}
          {gameData?.winningPattern && (
            <div className="drawer-pattern-card">
              <div className="drawer-pattern-header">
                <div className="drawer-pattern-info">
                  <span className="drawer-sublabel">OBJETIVO DE ESTA PARTIDA</span>
                  <h4 className="drawer-pattern-name">
                    {gameData.winningPattern === 'full' && '🏆 Cartón Lleno'}
                    {gameData.winningPattern === 'line' && '📏 Cualquier Línea'}
                    {gameData.winningPattern === 'diagonal' && '❌ Diagonales en X'}
                    {gameData.winningPattern === 'four_corners' && '📐 Cuatro Esquinas'}
                  </h4>
                  <p className="drawer-pattern-desc">
                    {gameData.winningPattern === 'full' && 'Completa las 24 casillas numeradas de tu cartón.'}
                    {gameData.winningPattern === 'line' && 'Completa cualquier fila o columna de 5 números.'}
                    {gameData.winningPattern === 'diagonal' && 'Completa cualquiera de las dos diagonales.'}
                    {gameData.winningPattern === 'four_corners' && 'Completa las 4 esquinas externas.'}
                  </p>
                </div>
                {/* 5x5 micro-grid mini diagram */}
                <div className="drawer-micro-grid">
                  {Array(5).fill(null).map((_, r) =>
                    Array(5).fill(null).map((_, c) => {
                      const isCenter = r === 2 && c === 2;
                      let isHighlighted = false;
                      if (gameData.winningPattern === 'full') isHighlighted = true;
                      else if (gameData.winningPattern === 'four_corners') isHighlighted = (r === 0 || r === 4) && (c === 0 || c === 4);
                      else if (gameData.winningPattern === 'diagonal') isHighlighted = r === c || r + c === 4;
                      else if (gameData.winningPattern === 'line') isHighlighted = r === 2 || c === 2;

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`micro-cell ${isCenter ? 'center' : isHighlighted ? 'highlight' : ''}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🚪 RENUNCIAR AL CARTÓN / SALIR (DENTRO DEL MENÚ DE AJUSTES) */}
          <button
            className="drawer-btn-abandon"
            onClick={() => {
              setShowSettingsDrawer(false);
              handleAbandonCard();
            }}
          >
            <span>🚪</span> Renunciar al Cartón / Salir
          </button>
        </div>
      )}

      {/* 2. SALA DE ESPERA COMPACTA INTERACTIVA CON RELOJ REGRESIVO */}
      {gameData?.status === 'waiting' && (
        <div className="waiting-lobby-card-compact card-glass animate-fade-in">
          {/* Fila Superior: Badge + Objetivo Compacto */}
          <div className="lobby-compact-header">
            <div className="lobby-compact-status">
              <span className="lobby-pulse-dot" />
              <span className="lobby-badge-text">SALA DE ESPERA</span>
            </div>
            <div className="lobby-compact-pattern" title="Objetivo para ganar esta partida">
              <span className="pattern-icon">🎯</span>
              <strong className="pattern-text">
                {gameData.winningPattern === 'full' && '🏆 Cartón Lleno'}
                {gameData.winningPattern === 'line' && '📏 Cualquier Línea'}
                {gameData.winningPattern === 'diagonal' && '❌ Diagonales en X'}
                {gameData.winningPattern === 'four_corners' && '📐 4 Esquinas'}
              </strong>
            </div>
          </div>

          {/* Bloque Central: Reloj Regresivo / Estado de Próxima Ronda */}
          <div className="lobby-countdown-module">
            {timeLeft ? (
              <div className={`countdown-box ${timeLeft.isStarted ? 'imminent animate-pulse' : timeLeft.totalSeconds <= 60 ? 'urgent animate-pulse' : ''}`}>
                <div className="countdown-label-row">
                  <span className="countdown-tag">
                    {timeLeft.isStarted ? '⚡ ¡RONDA A PUNTO DE INICIAR!' : '⏱️ PRÓXIMA RONDA EN:'}
                  </span>
                  {timeLeft.formattedDate && !timeLeft.isStarted && (
                    <span className="countdown-scheduled-time">
                      Fecha programada: <strong>{timeLeft.formattedDate}</strong>
                    </span>
                  )}
                </div>

                {timeLeft.isStarted ? (
                  <div className="countdown-imminent-alert">
                    <span className="alert-spinner">🔮</span>
                    <span>El anfitrión está preparando la tómbola para cantar bolas...</span>
                  </div>
                ) : (
                  <div className="countdown-digits-strip">
                    {timeLeft.hasDays && (
                      <>
                        <div className="time-digit-card">
                          <span className="digit-val">{timeLeft.days}</span>
                          <span className="digit-unit">DÍAS</span>
                        </div>
                        <span className="time-digit-colon">:</span>
                      </>
                    )}
                    {timeLeft.hasHours && (
                      <>
                        <div className="time-digit-card">
                          <span className="digit-val">{timeLeft.hours}</span>
                          <span className="digit-unit">HRS</span>
                        </div>
                        <span className="time-digit-colon">:</span>
                      </>
                    )}
                    <div className="time-digit-card">
                      <span className="digit-val">{timeLeft.minutes}</span>
                      <span className="digit-unit">MIN</span>
                    </div>
                    <span className="time-digit-colon">:</span>
                    <div className="time-digit-card">
                      <span className="digit-val">{timeLeft.seconds}</span>
                      <span className="digit-unit">SEG</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="countdown-waiting-host">
                <span className="waiting-clock-icon">⏳</span>
                <div className="waiting-host-text">
                  <strong>Esperando inicio de la partida...</strong>
                  <span>El anfitrión activará la tómbola en breve</span>
                </div>
              </div>
            )}
          </div>

          {/* Fila Inferior: Botón Compacto de Sonido/Vibración y Comprar Boletos */}
          <div className="lobby-compact-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              className={`btn-test-feedback-compact ${testFeedbackActive ? 'active' : ''}`}
              onClick={testSoundAndHaptics}
            >
              {testFeedbackActive ? '🔔 ¡Altavoces Listos!' : '🔔 Probar Sonido'}
            </button>

            <a 
              href="/juegos/bingo/boletos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.35) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.6)',
                color: '#fbbf24',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
              }}
              title="Adquirir más cartones para esta ronda o invitar a un amigo"
            >
              🎟️ Comprar Boletos
            </a>
          </div>
        </div>
      )}

      {/* 3. MINI TÓMBOLA MÓVIL 3D (POCKET HERO BALL & HISTORIAL) */}
      {gameData?.status === 'playing' && (
        <div className="mobile-pocket-tombola animate-fade-in">
          {/* Fila 1: Bola Cantada Estrella Actual y Contador */}
          <div className="pocket-hero-row">
            {gameData.drawnNumbers && gameData.drawnNumbers.length > 0 ? (
              (() => {
                const latestBall = gameData.drawnNumbers[gameData.drawnNumbers.length - 1];
                const meta = getBallMeta(latestBall);
                return (
                  <div className="pocket-hero-ball-unit">
                    <div 
                      key={latestBall}
                      className="pocket-hero-ball-3d animate-pop-in"
                      style={{ 
                        background: meta.gradient,
                        boxShadow: `0 8px 18px rgba(0,0,0,0.6), 0 0 16px ${meta.glow}`
                      }}
                    >
                      <div className="pocket-ball-badge">
                        <span className="p-letter" style={{ color: meta.color }}>{meta.letter}</span>
                        <span className="p-number">{latestBall}</span>
                      </div>
                    </div>
                    <div className="pocket-ball-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="pocket-ball-tag">BOLA CANTADA:</span>
                        <strong style={{ color: meta.color, fontSize: '1.05rem', fontWeight: 900 }}>
                          {meta.letter}-{latestBall}
                        </strong>
                      </div>
                      {cardHasLastBall ? (
                        <span className="pocket-in-card-alert animate-bounce">
                          ✨ ¡ESTÁ EN TU CARTÓN!
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                          Total: {gameData.drawnNumbers.length} de 75
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="pocket-hero-ball-unit">
                <div className="pocket-hero-ball-3d" style={{ background: '#334155', border: '2px dashed #64748b' }}>
                  <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>🎲</span>
                </div>
                <div className="pocket-ball-info">
                  <span className="pocket-ball-tag">TÓMBOLA EN VIVO</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Esperando primera bola...</span>
                </div>
              </div>
            )}
          </div>

          {/* Fila 2: Carril Ancho Deslizable de Bolas Anteriores (Cero desborde) */}
          <div className="pocket-history-rail">
            <span className="rail-label">Anteriores:</span>
            <div className="rail-balls-row" ref={previousBallsRailRef}>
              {gameData.drawnNumbers && gameData.drawnNumbers.length > 1 ? (
                gameData.drawnNumbers
                  .slice(Math.max(0, gameData.drawnNumbers.length - 11), gameData.drawnNumbers.length - 1)
                  .reverse()
                  .map((num) => {
                    const m = getBallMeta(num);
                    return (
                      <div 
                        key={num} 
                        className="pocket-capsule-ball"
                        style={{ background: m.gradient, borderColor: m.color }}
                        title={`Bola anterior: ${m.letter}-${num}`}
                      >
                        <span className="m-pill-letter">{m.letter}</span>
                        <span className="m-pill-num">{num}</span>
                      </div>
                    );
                  })
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '0 6px' }}>Sin bolas previas</span>
              )}
            </div>
          </div>
        </div>
      )}



      <div className={`bingo-card-container ${cust?.cardTheme ? `card-theme-${cust.cardTheme}` : 'card-theme-classic'}`}>
        <div className="bingo-card-board card-glass" style={{ borderColor: primaryColor }}>
          <div className="bingo-card-letters" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginBottom: '10px' }}>
            {cols.map(c => (
              <div key={c} className="bingo-col-header" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, color: primaryColor }}>{c}</div>
            ))}
          </div>

          <div className="bingo-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {Array(5).fill(null).map((_, row) => (
              Array(5).fill(null).map((_, col) => {
                const isFree = row === 2 && col === 2;
                const value = cardData.matrix[row][col];
                const isMarked = markedSlots[row][col];
                const isDrawn = !isFree && value !== null && gameData.drawnNumbers.includes(value);

                // Flags para el Modo Ayuda Visual
                const isMarkedUndrawnAssist = assistMode && isMarked && !isDrawn && !isFree;
                const isMarkedDrawnAssist = assistMode && isMarked && isDrawn && !isFree;

                // Check mapping for the number
                const map = value !== null ? cust?.numberToImageMap?.[value] : null;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => toggleMark(row, col)}
                    disabled={isFree}
                    className={`bingo-cell ${isMarked ? 'marked' : ''} ${isDrawn ? 'drawn' : ''} ${assistMode && isDrawn && !isMarked ? 'unmarked-drawn' : ''} ${isMarkedUndrawnAssist ? 'marked-undrawn-assist' : ''} ${isMarkedDrawnAssist ? 'marked-drawn-assist' : ''}`}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '10px',
                      cursor: isFree ? 'default' : 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      padding: '4px',
                      ...(isMarkedUndrawnAssist ? {
                        border: '2.5px solid #ef4444',
                        boxShadow: '0 0 18px rgba(239, 68, 68, 0.85), inset 0 0 10px rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171'
                      } : isMarkedDrawnAssist ? {
                        border: '2.5px solid #22c55e',
                        boxShadow: '0 0 18px rgba(34, 197, 94, 0.85), inset 0 0 10px rgba(34, 197, 94, 0.3)',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80'
                      } : (cust?.cardTheme === 'classic' || !cust?.cardTheme) ? {
                        border: isDrawn ? `2px solid #22c55e` : '1px solid var(--border-color)',
                        background: isMarked ? `rgba(168, 85, 247, 0.08)` : 'white',
                        color: 'var(--text-title)',
                      } : {})
                    }}
                  >
                    {isFree ? (
                      <span style={{ fontSize: '1.5rem' }}>⭐</span>
                    ) : map ? (
                      // Render Map
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        {map.type === 'emoji' ? (
                          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{map.value}</span>
                        ) : (
                          <img src={map.value} alt={map.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        )}
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                          {value}
                        </span>
                      </div>
                    ) : (
                      // Render Traditional Number
                      <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{value}</span>
                    )}

                    {/* Sello de marcado en la esquina superior para preservar 100% la legibilidad del número */}
                    {isMarked && !isFree && (
                      <div 
                        className="bingo-marker-stamp-corner"
                        title="Casilla Marcada"
                      >
                        {markerEmoji}
                      </div>
                    )}

                    {/* Notification dot removed in favor of Assist Mode */}
                  </button>
                );
              })
            ))}
          </div>
        </div>

        <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
          {/* BANNER DE PARTIDA EN PAUSA SI HAY UN RECLAMO PENDIENTE */}
          {gameData?.activeClaim && gameData.activeClaim.status === 'pending' && (
            <div 
              className="animate-pulse"
              style={{
                background: gameData.activeClaim.cardId === cartonId 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                border: `1.5px solid ${gameData.activeClaim.cardId === cartonId ? '#22c55e' : '#ef4444'}`,
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '6px',
                textAlign: 'center'
              }}
            >
              <strong style={{ display: 'block', color: gameData.activeClaim.cardId === cartonId ? '#4ade80' : '#fca5a5', fontSize: '1rem' }}>
                {gameData.activeClaim.cardId === cartonId 
                  ? '🎉 ¡Tu Bingo está siendo verificado por el Host en vivo!' 
                  : `⏸️ Partida en Pausa: "${gameData.activeClaim.playerName || 'Un participante'}" cantó Bingo primero.`}
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>
                {gameData.activeClaim.cardId === cartonId
                  ? 'El organizador tiene tu cartón en pantalla para validarlo. Por favor no cierres esta ventana.'
                  : 'El Host está verificando si el cartón es válido. Si se descarta, la partida continuará al instante.'}
              </span>
            </div>
          )}

          {/* Chip con el conteo de bolas para ganar (Proximity Chip) */}
          {gameData?.status === 'playing' && (() => {
            const missing = getProximityStatus();
            if (missing === null) return null;
            return (
              <div 
                className={`dock-proximity-chip ${missing === 0 ? 'winner animate-bounce' : missing === 1 ? 'critical animate-pulse' : ''}`}
              >
                {missing === 0 
                  ? '🎉 ¡TIENES BINGO COMPLETADO! ¡CANTA BINGO YA!' 
                  : missing === 1 
                    ? '🔥 ¡ESTÁS A 1 SOLA BOLA DE GANAR!' 
                    : `⚡ FALTAN ${missing} BOLAS PARA GANAR`}
              </div>
            );
          })()}

          {/* Botón único y principal de Cantar Bingo */}
          <button
            className={`btn-dock-shout ${getProximityStatus() === 0 ? 'shout-ready animate-pulse' : ''}`}
            disabled={Boolean(gameData?.activeClaim && gameData.activeClaim.status === 'pending' && gameData.activeClaim.cardId !== cartonId)}
            onClick={shoutBingo}
            style={{
              background: (gameData?.activeClaim && gameData.activeClaim.status === 'pending' && gameData.activeClaim.cardId !== cartonId)
                ? '#475569'
                : (getProximityStatus() === 0 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : primaryColor)
            }}
          >
            {gameData?.activeClaim && gameData.activeClaim.status === 'pending'
              ? (gameData.activeClaim.cardId === cartonId 
                  ? '⏳ TU BINGO ESTÁ EN REVISIÓN...' 
                  : `⏳ EN REVISIÓN: ${gameData.activeClaim.playerName || 'OTRO JUGADOR'}...`)
              : (getProximityStatus() === 0 ? '🏆 ¡CANTAR BINGO AHORA!' : '📢 ¡CANTAR BINGO!')}
          </button>
        </div>
      </div>

      {/* Confetti Animation Styles */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popInStamp {
          0% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0.45; }
        }
      `}</style>

      {/* ====== BINGO SHOUT SUCCESS MODAL ====== */}
      {showBingoModal && createPortal(
        <div className="player-modal-overlay" onClick={() => setShowBingoModal(false)}>
          <div className="player-modal modal-success" onClick={(e) => e.stopPropagation()}>
            <span className="player-modal-icon">📢</span>
            <h3>¡Has Cantado Bingo!</h3>
            <p>
              El organizador ha sido notificado automáticamente en tiempo real.
              Quédate atento mientras se verifica tu cartón.
            </p>
            <div className="player-modal-code">
              🔑 Tu código: {cartonId}
            </div>
            <div className="player-modal-actions">
              <button
                className="btn-modal-confirm btn-green"
                onClick={() => setShowBingoModal(false)}
              >
                ✅ ENTENDIDO
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ====== ABANDON CARD CONFIRMATION MODAL ====== */}
      {showAbandonModal && createPortal(
        <div className="player-modal-overlay" onClick={() => setShowAbandonModal(false)}>
          <div className="player-modal modal-danger" onClick={(e) => e.stopPropagation()}>
            <span className="player-modal-icon">🚨</span>
            <h3>¿Renunciar al Cartón?</h3>
            <p>
              Esta acción es irreversible. Perderás el acceso a tu cartón, todas tus marcas y tu progreso de forma permanente.
            </p>
            <div className="player-modal-actions">
              <button
                className="btn-modal-confirm btn-red"
                onClick={confirmAbandon}
              >
                🚪 SÍ, RENUNCIAR
              </button>
              <button
                className="btn-modal-cancel"
                onClick={() => setShowAbandonModal(false)}
              >
                ↩️ CANCELAR
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ====== PLAYER SPONSOR SPOTLIGHT SHOWCASE MODAL ====== */}
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
            <div className="sponsor-logo-stage">
              <img 
                src={activeSponsorModal.logo} 
                alt={activeSponsorModal.name} 
              />
            </div>

            {/* Nombre del Patrocinador */}
            <h3 className="sponsor-brand-title">
              {activeSponsorModal.name}
            </h3>

            {/* Mensaje / Eslogan si existe */}
            {activeSponsorModal.message && (
              <div className="sponsor-quote-box">
                <p className="sponsor-quote-text">
                  "{activeSponsorModal.message}"
                </p>
              </div>
            )}

            {/* Chip con la última bola cantada */}
            {gameData?.drawnNumbers && gameData.drawnNumbers.length > 0 && (() => {
              const last = gameData.drawnNumbers[gameData.drawnNumbers.length - 1];
              const meta = getBallMeta(last);
              return (
                <div className="sponsor-game-chip">
                  <span>Última bola cantada:</span>
                  <strong style={{ color: meta.color, fontSize: '0.95rem' }}>{meta.letter}-{last}</strong>
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

      {/* ====== BINGO WINNER CELEBRATION MODAL ====== */}
      {cardData.winnerConfirmed && !winnerDismissed && createPortal(
        <div className="player-modal-overlay" style={{ background: 'rgba(5, 2, 12, 0.95)', zIndex: 999999 }}>
          <div className="player-modal modal-success text-center animate-bounce" style={{ border: `4px solid #22c55e`, boxShadow: '0 0 45px rgba(34, 197, 94, 0.5)', background: backgroundColor || '#0f172a', padding: '40px 30px' }}>
            <span className="player-modal-icon" style={{ fontSize: '4.5rem', display: 'block', marginBottom: '15px' }}>🏆</span>
            <h3 style={{ color: '#22c55e', margin: '10px 0', fontSize: '2.2rem', fontWeight: 800 }}>¡GANADOR CONFIRMADO!</h3>
            <p style={{ fontSize: '1.2rem', color: isLight ? '#1f2937' : '#ffffff', lineHeight: '1.5' }}>
              ¡Felicidades, <strong>{cardData.playerName}</strong>! El organizador ha verificado tu cartón y ha confirmado oficialmente tu victoria.
            </p>
            <div className="player-modal-code" style={{ fontSize: '1.3rem', borderColor: '#22c55e', color: '#22c55e', padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid #22c55e', fontFamily: 'monospace', fontWeight: 'bold', margin: '20px auto', display: 'inline-block' }}>
              🔑 Código: #{cartonId}
            </div>
            
            {/* Elemento oculto para captura del Ticket de Ganador */}
            <div ref={ticketRef} className={`winner-ticket-canvas-source ticket-theme-${ticketTheme}`}>
              <div className="ticket-header">
                <span style={{ fontSize: '3rem' }}>🏆</span>
                <h3 className="ticket-title">{gameData.title.toUpperCase()}</h3>
                <p className="ticket-subtitle">{gameData.customization?.subtitle || 'Bingotenango - Lluvia de Ideas'}</p>
              </div>
              
              <div className="ticket-divider"></div>
              
              <div className="ticket-badge-winner" style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '50px',
                fontWeight: '900',
                fontSize: '1.1rem',
                letterSpacing: '1px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                margin: '10px auto',
                display: 'inline-block'
              }}>
                🎉 ¡Felicidades Ganador!
              </div>
              
              <div className="ticket-info-grid">
                <div className="ticket-info-row" style={{ gridColumn: 'span 2', background: 'rgba(255, 215, 0, 0.12)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.4)', textAlign: 'center' }}>
                  <span className="value highlight" style={{ color: '#ffd700', fontWeight: '900', fontSize: '1.2rem', display: 'block', width: '100%' }}>
                    🎁 {gameData.currentPrizeTitle || 'Premio Mayor de la Sesión'}
                  </span>
                </div>

                <div className="ticket-info-row">
                  <span className="label">Jugador:</span>
                  <span className="value highlight">{cardData.playerName}</span>
                </div>
                <div className="ticket-info-row">
                  <span className="label">Código de Reclamo:</span>
                  <span className="value code">#{cartonId}</span>
                </div>
                <div className="ticket-info-row">
                  <span className="label">Código Sesión:</span>
                  <span className="value code">{gameData.id.slice(0, 5).toUpperCase()}</span>
                </div>
                <div className="ticket-info-row">
                  <span className="label">Patrón Ganador:</span>
                  <span className="value">
                    {gameData.winningPattern === 'full' && 'Cartón Lleno'}
                    {gameData.winningPattern === 'line' && 'Línea'}
                    {gameData.winningPattern === 'diagonal' && 'Diagonal'}
                    {gameData.winningPattern === 'four_corners' && '4 Esquinas'}
                  </span>
                </div>
                <div className="ticket-info-row" style={{ gridColumn: 'span 2' }}>
                  <span className="label">Fecha y Hora:</span>
                  <span className="value" style={{ fontSize: '0.8rem' }}>
                    {new Date().toLocaleString('es-GT', { timeZone: 'America/Guatemala' })}
                  </span>
                </div>
              </div>
              
              <div className="ticket-divider"></div>
              
              <div className="ticket-footer">
                Presenta esta imagen al organizador<br />
                para validar y reclamar tu premio.
              </div>
            </div>

            <div className="player-modal-actions" style={{ width: '100%' }}>
              <button
                className="btn btn-primary"
                onClick={downloadWinnerTicket}
                disabled={isDownloading}
                style={{
                  width: '100%',
                  padding: '12px 32px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isDownloading ? (
                  <>⌛ Generando Ticket...</>
                ) : (
                  <>📸 Guardar Ticket de Premio</>
                )}
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setWinnerDismissed(true)}
                style={{
                  width: '100%',
                  padding: '12px 32px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                }}
              >
                🎉 ¡GRACIAS!
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ====== GALERÍA DE PREMIOS MODAL ====== */}
      {showPrizesModal && createPortal(
        <div className="player-modal-overlay animate-fade-in" onClick={() => { setShowPrizesModal(false); setSelectedPrizeIndex(null); }} style={{ background: 'rgba(5, 2, 12, 0.88)', zIndex: 99999, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div 
            className="player-modal card-glass animate-zoom-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '820px', 
              width: '100%', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column',
              padding: '24px', 
              borderRadius: '28px',
              border: `2px solid ${primaryColor}`,
              boxShadow: `0 0 45px ${primaryColor}55`,
              background: 'rgba(13, 6, 28, 0.96)',
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

            {/* Slider de Showcase Horizontal (Sin Scroll Vertical Incómodo) */}
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
                  const amount = direction === 'left' ? -300 : 300;
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
                  <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span>👈 Desliza horizontalmente para ver todos los premios ({sortedPrizes.length}) 👉</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* ====== VISOR AMPLIADO DE IMAGEN DE PREMIO (LIGHTBOX FULLSCREEN) ====== */}
      {selectedPrizeIndex !== null && (() => {
        const prizesToDisplay = (cust?.prizes && cust.prizes.length > 0) ? cust.prizes : DEFAULT_SAMPLE_PRIZES;
        const sortedPrizes = [...prizesToDisplay].sort((a, b) => {
          if (prizesSort === 'asc') return (a.order || 0) - (b.order || 0);
          if (prizesSort === 'desc') return (b.order || 0) - (a.order || 0);
          if (prizesSort === 'category') return (a.category || '').localeCompare(b.category || '');
          return 0;
        });

        const activePrize = sortedPrizes[selectedPrizeIndex] || sortedPrizes[0];
        if (!activePrize) return null;

        const handleNextPrize = (e?: React.MouseEvent) => {
          e?.stopPropagation();
          setSelectedPrizeIndex((prev) => (prev !== null && prev < sortedPrizes.length - 1 ? prev + 1 : 0));
          setIsImageZoomed(false);
        };

        const handlePrevPrize = (e?: React.MouseEvent) => {
          e?.stopPropagation();
          setSelectedPrizeIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : sortedPrizes.length - 1));
          setIsImageZoomed(false);
        };

        return createPortal(
          <div 
            className="prize-lightbox-overlay"
            onClick={() => { setSelectedPrizeIndex(null); setIsImageZoomed(false); }}
          >
            <div 
              className="prize-lightbox-card card-glass"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar inside Lightbox */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10, 3, 20, 0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: primaryColor, color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', boxShadow: `0 0 12px ${primaryColor}88` }}>
                    Nivel #{activePrize.order || (selectedPrizeIndex + 1)}
                  </span>
                  {activePrize.category && (
                    <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {activePrize.category}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Botón Toggle Zoom */}
                  <button
                    type="button"
                    onClick={() => setIsImageZoomed(!isImageZoomed)}
                    style={{
                      background: isImageZoomed ? primaryColor : 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isImageZoomed ? '🔍 Zoom (1.8x) Activo' : '🔍 Zoom Acercar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedPrizeIndex(null); setIsImageZoomed(false); }}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: 'none',
                      color: '#fff',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    aria-label="Cerrar visor de imagen"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Viewport Principal de la Imagen */}
              <div 
                className={`prize-lightbox-viewport ${isImageZoomed ? 'zoomed' : ''}`}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
                title="Toca la imagen para alternar zoom"
              >
                <img 
                  src={activePrize.image} 
                  alt={activePrize.title}
                  className={`prize-lightbox-img ${isImageZoomed ? 'zoomed' : ''}`} 
                />

                {/* Controles Laterales (Prev / Next) dentro de la imagen */}
                {sortedPrizes.length > 1 && (
                  <>
                    <button 
                      type="button" 
                      onClick={handlePrevPrize}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'rgba(10, 3, 20, 0.75)',
                        backdropFilter: 'blur(10px)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        fontSize: '1.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
                      }}
                      aria-label="Premio anterior"
                    >
                      ◀
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNextPrize}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'rgba(10, 3, 20, 0.75)',
                        backdropFilter: 'blur(10px)',
                        border: '1.5px solid rgba(255,255,255,0.3)',
                        color: '#fff',
                        fontSize: '1.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
                      }}
                      aria-label="Premio siguiente"
                    >
                      ▶
                    </button>
                  </>
                )}

                {/* Badge de Instrucción de Zoom en la imagen */}
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: '#e2e8f0', fontSize: '0.72rem', padding: '4px 14px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none' }}>
                  {isImageZoomed ? '🔍 Toca la imagen para alejar' : '🔍 Toca la imagen para acercar (1.8x)'}
                </div>
              </div>

              {/* Panel de Detalles del Premio */}
              <div style={{ padding: '20px 24px', background: 'rgba(13, 6, 28, 0.98)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', color: '#fff', fontFamily: 'var(--font-gamer)', textShadow: `0 0 10px ${primaryColor}88` }}>
                  {activePrize.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {activePrize.description}
                </p>

                {sortedPrizes.length > 1 && (
                  <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Premio {selectedPrizeIndex + 1} de {sortedPrizes.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: primaryColor, fontWeight: 'bold' }}>
                      💡 Usa ◄ ► en tu teclado o botones para explorar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* ====== NOTIFICACIÓN GLOBAL EN TIEMPO REAL DE GANADOR CONFIRMADO ====== */}
      {gameData?.latestWinner && gameData.latestWinner.timestamp !== dismissedWinnerTs && createPortal(
        <div 
          className="player-modal-overlay animate-fade-in" 
          onClick={() => setDismissedWinnerTs(gameData.latestWinner?.timestamp || Date.now())}
          style={{ background: 'rgba(5, 2, 12, 0.92)', zIndex: 100002, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            className="player-modal card-glass animate-zoom-in modal-success" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              textAlign: 'center',
              padding: '28px 24px', 
              borderRadius: '28px',
              border: '2px solid #22c55e',
              boxShadow: '0 0 60px rgba(34, 197, 94, 0.6), 0 25px 60px rgba(0,0,0,0.9)',
              background: 'rgba(13, 6, 28, 0.98)',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: '3.6rem', display: 'block', margin: '0 auto 10px', animation: 'pulse 1s infinite alternate' }}>
              🏆🎉
            </span>
            <h3 style={{ fontFamily: 'var(--font-gamer)', color: '#22c55e', fontSize: '1.5rem', margin: '0 0 10px 0', textShadow: '0 0 15px rgba(34, 197, 94, 0.6)' }}>
              ¡TENEMOS GANADOR EN VIVO!
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#ffffff', margin: '0 0 14px 0', lineHeight: '1.5' }}>
              El jugador <strong style={{ color: '#f59e0b', fontSize: '1.25rem', textShadow: '0 0 10px rgba(245, 158, 11, 0.6)' }}>{gameData.latestWinner.playerName}</strong> ha ganado el premio:
            </p>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '18px', padding: '14px 18px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#a855f7', display: 'block', fontFamily: 'var(--font-gamer)', textShadow: '0 0 12px rgba(168,85,247,0.6)' }}>
                🎁 {gameData.latestWinner.prizeTitle}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDismissedWinnerTs(gameData.latestWinner?.timestamp || Date.now())}
              style={{
                padding: '12px 28px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.5)',
                transition: 'transform 0.2s'
              }}
            >
              👏 ¡Felicitar al Ganador!
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
