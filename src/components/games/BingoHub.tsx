import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { collection, query, where, onSnapshot, limit, updateDoc, doc, setDoc, getDoc, addDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import type { BingoGame, BingoCard } from '../../types';
import { generateBingoMatrix, hashBingoMatrix, validateBingoCard, checkCardCollision } from '../../utils/bingoGenerator';
import './Bingo.css';

// Import book covers for gaming-themed advertising banners

export default function BingoHub() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registeredCards, setRegisteredCards] = useState<any[]>([]);
  const [winnersHistory, setWinnersHistory] = useState<any[]>([]);

  
  // Registration Form state
  const [playerName, setPlayerName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Local Storage state to remember current card
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Host verification state
  const [validationResults, setValidationResults] = useState<Record<string, { isWinner: boolean, missing: number[] }>>({});

  // Sound and Voice announcement states
  const [isMuted, setIsMuted] = useState(false);
  const prevBallCountRef = useRef<number>(0);
  const announcedShoutsRef = useRef<Set<string>>(new Set());
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Animation states
  const [isRolling, setIsRolling] = useState(false);
  const [rollingBall, setRollingBall] = useState<string>('...');

  // Sponsor Visual States
  const [activeSponsorModal, setActiveSponsorModal] = useState<any | null>(null);
  const [activeSponsorIntegrated, setActiveSponsorIntegrated] = useState<any | null>(null);

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

  useEffect(() => {
    // Check if the current user is logged in (admin)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setIsAdmin(!!user);
    });

    let isFirstLoad = true;
    const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
    const unsubscribeGame = onSnapshot(q, (snapshot) => {
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
        setActiveGame(null);
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
  }, []);

  // Listen to cards registered for the active game session in real-time
  useEffect(() => {
    if (!activeGame?.id) {
      setRegisteredCards([]);
      return;
    }

    const qCards = query(collection(db, 'bingo_cards'), where('gameId', '==', activeGame.id));
    const unsubscribeCards = onSnapshot(qCards, (snapshot) => {
      const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegisteredCards(cards);
    }, (error) => {
      console.error("Error loading cards:", error);
    });

    return () => unsubscribeCards();
  }, [activeGame?.id]);

  // Voice announcement for shouted Bingos
  useEffect(() => {
    if (!activeGame || isMuted) return;

    const currentShouts = registeredCards.filter(c => c.shoutedBingo);
    currentShouts.forEach(card => {
      if (!announcedShoutsRef.current.has(card.id)) {
        announcedShoutsRef.current.add(card.id);
        
        // Announce via text-to-speech
        try {
          const utterance = new SpeechSynthesisUtterance(`¡Atención! ${card.playerName} ha cantado Bingo.`);
          utterance.lang = 'es-ES';
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("Speech synthesis failed", err);
        }
      }
    });

    // Clean up IDs that are no longer shouting
    const currentShoutedIds = new Set(currentShouts.map(c => c.id));
    announcedShoutsRef.current.forEach(id => {
      if (!currentShoutedIds.has(id)) {
        announcedShoutsRef.current.delete(id);
      }
    });
  }, [registeredCards, isMuted, activeGame]);

  // Listen to global winners history in real-time
  useEffect(() => {
    const qWinners = query(collection(db, 'bingo_winners_history'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribeWinners = onSnapshot(qWinners, (snapshot) => {
      const winners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWinnersHistory(winners);
    }, (error) => {
      console.error("Error loading winners history:", error);
    });

    return () => unsubscribeWinners();
  }, []);

  const confirmWinner = async (card: any) => {
    if (!activeGame) return;
    try {
      await addDoc(collection(db, 'bingo_winners_history'), {
        gameId: activeGame.id,
        gameTitle: activeGame.title,
        playerName: card.playerName,
        cardId: card.id,
        winningPattern: activeGame.winningPattern,
        drawnCount: activeGame.drawnNumbers.length,
        timestamp: Date.now()
      });
      
      await updateDoc(doc(db, 'bingo_cards', card.id), {
        shoutedBingo: false,
        winnerConfirmed: true
      });
      
      setValidationResults(prev => {
        const copy = { ...prev };
        delete copy[card.id];
        return copy;
      });
      
      await showAlert(`¡Ganador ${card.playerName} registrado con éxito en el historial!`, "Ganador Confirmado", "🏆");
      addLog(`HOST: Ganador confirmado -> ${card.playerName} (Cartón ${card.id})`, "success");
    } catch (err) {
      console.error(err);
      await showAlert("Error al guardar en el historial de ganadores.", "Error", "❌");
    }
  };

  const rejectClaim = async (card: any) => {
    try {
      await updateDoc(doc(db, 'bingo_cards', card.id), {
        shoutedBingo: false
      });
      
      setValidationResults(prev => {
        const copy = { ...prev };
        delete copy[card.id];
        return copy;
      });
      addLog(`HOST: Grito de Bingo descartado para ${card.playerName} (Cartón ${card.id})`, "warning");
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
  }, [activeGame?.id]);

  useEffect(() => {
    if (!activeGame) return;
    addLog(`PARTIDA: Estado del juego cambiado a [${activeGame.status.toUpperCase()}].`);
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
        announceBall(finalBall, gameData);
        addLog(`TÓMBOLA: Bola cantada -> ${letter}-${finalBall}`, "success");

        // Lógica de patrocinadores y publicidad
        const cust = gameData?.customization;
        if (cust?.sponsorConfig?.active && cust.sponsors && cust.sponsors.length > 0) {
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

  const handleRestartGame = async () => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      "¿Estás seguro de que deseas REINICIAR la tómbola? Se vaciarán todas las bolas cantadas y se regresará a la etapa de registro de jugadores. Esta acción no se puede deshacer.",
      "Reiniciar Partida",
      "⚠️",
      "SÍ, REINICIAR",
      "CANCELAR"
    );
    if (confirm) {
      try {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
          drawnNumbers: [],
          status: 'waiting'
        });
        setValidationResults({});
        setActiveSponsorModal(null);
        setActiveSponsorIntegrated(null);
        addLog("HOST: Partida reiniciada correctamente.", "warning");
      } catch (err) {
        console.error(err);
        await showAlert("Error al reiniciar la partida.", "Error", "❌");
      }
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
        const rawData = cardSnap.data() as any;
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
          matrix
        };
        if (cardData.gameId !== activeGame.id) {
          await showAlert("Este cartón no pertenece al juego activo.", "Validación", "❌");
          return;
        }

        const result = validateBingoCard(cardData.matrix, activeGame.drawnNumbers, activeGame.winningPattern);
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
      
      addLog(`HOST: Se han limpiado todos los jugadores inscritos de la sesión.`, "warning");
      await showAlert("¡Todos los jugadores inscritos han sido eliminados de la sesión! 🧹", "Sesión Limpia", "🧹");
    } catch (err) {
      console.error(err);
      await showAlert("Error al limpiar los jugadores.", "Error", "❌");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGame || !playerName.trim()) return;
    
    setIsRegistering(true);
    setRegError('');

    try {
      let matrix = generateBingoMatrix();
      let hash = hashBingoMatrix(matrix);
      let isCardAcceptable = false;
      let attempts = 0;

      while (!isCardAcceptable && attempts < 500) {
        attempts++;
        const hasCollision = registeredCards.some(otherCard => {
          if (!otherCard.matrix) return false;
          const otherMatrix = [
            otherCard.matrix.r0,
            otherCard.matrix.r1,
            otherCard.matrix.r2,
            otherCard.matrix.r3,
            otherCard.matrix.r4
          ];
          return checkCardCollision(matrix, otherMatrix);
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

      await setDoc(doc(db, 'bingo_cards', shortId), {
        gameId: activeGame.id,
        playerName: playerName.trim(),
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
      
      {/* Modal de Alerta de Bingo para el Host (Montado en Body para centrado perfecto) */}
      {isAdmin && registeredCards.filter(c => c.shoutedBingo).length > 0 && createPortal(
        <div className="host-shout-modal-overlay">
          <div className="host-shout-modal card-glass">
            <div className="shout-modal-header">
              <span className="shout-modal-icon">🚨</span>
              <h3>¡RECLAMACIÓN DE BINGO!</h3>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, color: '#e2e8f0', margin: '5px 0 15px', textAlign: 'center' }}>
              Los siguientes jugadores han cantado Bingo y están esperando validación:
            </p>
            <div className="shout-modal-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
              {registeredCards.filter(c => c.shoutedBingo).map(card => {
                const validation = validationResults[card.id];
                return (
                  <div key={card.id} className="shout-modal-item" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>👤 {card.playerName}</strong>
                      <code style={{ fontSize: '0.75rem', color: 'var(--cyber-cyan)' }}>ID: {card.id}</code>
                    </div>

                    {/* Mostrar resultado de validación si ya fue ejecutado */}
                    {validation && (
                      <div style={{ margin: '8px 0', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.5)', border: `1px solid ${validation.isWinner ? 'var(--cyber-green)' : 'rgba(239,68,68,0.5)'}` }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: validation.isWinner ? 'var(--cyber-green)' : '#f87171' }}>
                          {validation.isWinner ? '🏆 ¡GANADOR BINGO!' : `❌ FALTAN: ${validation.missing.join(', ')}`}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="cyber-badge cyber-badge-cyan"
                        onClick={() => validateCard(card.id)}
                        style={{ cursor: 'pointer', border: '1px solid var(--cyber-cyan)', padding: '6px 12px' }}
                      >
                        🔍 Validar Cartón
                      </button>
                      <button 
                        className="cyber-badge cyber-badge-green"
                        onClick={() => confirmWinner(card)}
                        style={{ cursor: 'pointer', border: '1px solid var(--cyber-green)', padding: '6px 12px' }}
                      >
                        🏆 Confirmar Bingo
                      </button>
                      <button 
                        className="cyber-badge"
                        style={{ border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', cursor: 'pointer', padding: '6px 12px' }}
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
        
        {/* Futuristic Gamer Header */}
        <div className="bingo-gamer-header">
          <h1>{cust?.title || 'Bingo Virtual'}</h1>
          <p>{cust?.subtitle || 'Editorial Lluvia de Ideas'}</p>
        </div>

        {/* Customizable Banner in Gamer Style */}
        {cust?.headerImage && (
          <div 
            className="gamer-banner-frame animate-zoom-in"
            style={{ height: cust.headerHeight ? `${cust.headerHeight}px` : '160px' }}
          >
            <img src={cust.headerImage} alt="Bingo Session Banner" className="gamer-banner-img" />
            <div className="gamer-banner-overlay"></div>
          </div>
        )}

        {/* If there is no active game session */}
        {!activeGame ? (
          <div className="arcade-empty-state">
            <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))' }}>🎮</span>
            <h3 style={{ fontFamily: 'var(--font-gamer)', color: '#fff', marginTop: '15px' }}>BINGO OFFLINE</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--cyber-text)', opacity: 0.7, margin: '8px 0 20px' }}>
              El servidor de Bingo está inactivo en este momento. Espera a que el administrador de Editorial Lluvia de Ideas inicie una nueva sesión de juego.
            </p>
            <div className="arcade-blink-text">Esperando señal de host...</div>
          </div>
        ) : (
          
          /* Main Responsive Dashboard */
          <div className="bingo-dashboard-grid">
            
            {/* ==========================================
               WEB ONLY: LEFT COLUMN (DYNAMICS & INFO)
               ========================================== */}
            <div className="cyber-panel dynamics-panel desktop-only">
              {isAdmin ? (
                <>
                  <div className="cyber-panel-header">
                    <span className="cyber-panel-title">⚙️ Consola del Host</span>
                    <span className="cyber-badge cyber-badge-cyan">ADMIN</span>
                  </div>

                  {/* Estado de Partida */}
                  <div className="host-sidebar-section">
                    <span className="host-sidebar-section-title">Estado de la Partida</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className={`host-status-btn ${activeGame.status === 'waiting' ? 'active-cyan' : ''}`}
                        onClick={() => changeGameStatus('waiting')}
                      >
                        Registro
                      </button>
                      <button 
                        className={`host-status-btn ${activeGame.status === 'playing' ? 'active-green' : ''}`}
                        onClick={() => changeGameStatus('playing')}
                      >
                        Jugar
                      </button>
                      <button 
                        className={`host-status-btn ${activeGame.status === 'finished' ? 'active-magenta' : ''}`}
                        onClick={() => changeGameStatus('finished')}
                      >
                        Fin
                      </button>
                    </div>
                  </div>

                  {/* Controles de Tómbola */}
                  <div className="host-sidebar-section">
                    <span className="host-sidebar-section-title">Controles de Tómbola</span>
                    {activeGame.status === 'playing' && (
                      <button 
                        className="cyber-btn-primary gamer-btn-host-draw animate-pulse" 
                        onClick={drawRandomBall}
                        style={{ padding: '10px', fontSize: '0.85rem' }}
                      >
                        🔮 SACAR NUEVA BOLA
                      </button>
                    )}
                    <button 
                      className="cyber-btn-primary" 
                      onClick={handleRestartGame}
                      style={{ padding: '10px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)', border: 'none', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)' }}
                    >
                      🔄 REINICIAR PARTIDA
                    </button>
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
                              <span className="winner-date">{new Date(w.timestamp).toLocaleDateString('es-GT')}</span>
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
              <div className="cyber-panel-header" style={{ width: '100%' }}>
                <span className="cyber-panel-title">
                  <span className="icon">🔮</span> 
                  {activeGame.status === 'playing' ? 'Transmisión Tómbola' : 'Obtención de Cartón'}
                </span>
                <span className="cyber-badge cyber-badge-magenta">{activeGame.status.toUpperCase()}</span>
              </div>

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

                <div className="cyber-halo"></div>
                <div className="hologram-tombola-frame">
                  <div className={`gamer-ball ${isRolling ? 'rolling' : ''}`}>
                    {isRolling ? (
                      <>
                        <span className="gamer-ball-letter">{rollingBall.split('-')[0]}</span>
                        <span className="gamer-ball-number" style={{ fontSize: '3.5rem' }}>{rollingBall.split('-')[1] || '??'}</span>
                      </>
                    ) : activeGame.drawnNumbers.length > 0 ? (
                      (() => {
                        const last = activeGame.drawnNumbers[activeGame.drawnNumbers.length - 1];
                        let letter = 'B';
                        if (last > 15 && last <= 30) letter = 'I';
                        if (last > 30 && last <= 45) letter = 'N';
                        if (last > 45 && last <= 60) letter = 'G';
                        if (last > 60 && last <= 75) letter = 'O';
                        
                        const map = (cust?.numberToImageMap as any)?.[last];
                        return (
                          <>
                            <span className="gamer-ball-letter">{letter}</span>
                            {map ? (
                              <span className="gamer-ball-number" style={{ fontSize: '3rem', margin: '2px 0' }}>
                                {map.type === 'emoji' ? map.value : '🖼️'}
                              </span>
                            ) : (
                              <span className="gamer-ball-number">{last}</span>
                            )}
                            <span className="gamer-ball-label">{map ? map.label : 'CANTADA'}</span>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <span className="gamer-ball-letter" style={{ color: 'var(--cyber-cyan)' }}>BINGO</span>
                        <span className="gamer-ball-number" style={{ fontSize: '2.5rem', margin: '5px 0' }}>READY</span>
                        <span className="gamer-ball-label">ESPERANDO</span>
                      </>
                    )}
                  </div>

                  {/* Floating Sponsor Integrated Plate */}
                  {activeSponsorIntegrated && !isRolling && (
                    <div 
                      className="animate-fade-in"
                      style={{
                        position: 'absolute',
                        bottom: '-70px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '210px',
                        background: 'rgba(15, 8, 32, 0.9)',
                        border: `1px solid ${primaryColor}`,
                        borderRadius: '12px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: `0 6px 15px ${primaryColor}44, inset 0 0 8px rgba(0,0,0,0.8)`,
                        zIndex: 10,
                        animation: 'floatGamer 3s ease-in-out infinite'
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '6px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={activeSponsorIntegrated.logo} alt={activeSponsorIntegrated.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--cyber-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PATROCINADOR</span>
                        <strong style={{ fontSize: '0.75rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeSponsorIntegrated.name}</strong>
                        {activeSponsorIntegrated.message && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{activeSponsorIntegrated.message}"</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="tombola-controls">
                  <button 
                    className="cyber-btn-circle" 
                    onClick={() => setIsMuted(!isMuted)} 
                    title={isMuted ? 'Activar Voz' : 'Silenciar Voz'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
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
                    const map = (cust?.numberToImageMap as any)?.[num];
                    
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
                    
                    <form onSubmit={handleRegister}>
                      <div className="cyber-input-wrapper">
                        <input 
                          type="text" 
                          placeholder="NICKNAME DEL JUGADOR" 
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          required
                          className="cyber-input"
                          disabled={isRegistering}
                        />
                        <span className="cyber-input-icon">👤</span>
                      </div>
                      
                      {regError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '10px', fontWeight: 'bold' }}>{regError}</div>}
                      
                      <button 
                        type="submit" 
                        className="cyber-btn-primary" 
                        disabled={isRegistering}
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

      {/* Sponsor Modal Overlay */}
      {activeSponsorModal && createPortal(
        <div 
          className="player-modal-overlay animate-fade-in" 
          onClick={() => setActiveSponsorModal(null)}
          style={{
            zIndex: 99999,
            background: 'rgba(5, 2, 12, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <div 
            className="text-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '45px',
              maxWidth: '600px',
              width: '90%',
              borderRadius: '32px',
              background: activeGame?.customization?.backgroundColor || '#0f172a',
              border: `4px solid ${activeGame?.customization?.primaryColor || '#a855f7'}`,
              boxShadow: `0 0 60px ${(activeGame?.customization?.primaryColor || '#a855f7')}66, inset 0 0 30px rgba(0,0,0,0.5)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              color: '#ffffff'
            }}
          >
            {/* Sponsor Logo (Even larger and more prominent) */}
            <div style={{
              width: '100%',
              maxWidth: '420px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              border: `2px solid ${activeGame?.customization?.accentColor || '#ec4899'}`
            }}>
              <img 
                src={activeSponsorModal.logo} 
                alt={activeSponsorModal.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            </div>
            
            <h3 style={{ 
              margin: 0, 
              fontSize: '2.4rem', 
              color: '#ffffff', 
              fontWeight: 800,
              textShadow: `0 2px 10px ${(activeGame?.customization?.primaryColor || '#a855f7')}aa`
            }}>
              {activeSponsorModal.name}
            </h3>
            
            {activeSponsorModal.message && (
              <p style={{ 
                margin: 0, 
                fontSize: '1.3rem', 
                color: '#f1f5f9', 
                fontStyle: 'italic', 
                lineHeight: '1.5',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.6)'
              }}>
                "{activeSponsorModal.message}"
              </p>
            )}
            
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.15)',
              width: '100%',
              paddingTop: '20px',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', letterSpacing: '1px' }}>ÚLTIMA BOLA CANTADA:</span>
              
              {/* Ball display in modal */}
              {(() => {
                const last = activeGame?.drawnNumbers[activeGame.drawnNumbers.length - 1];
                if (!last) return null;
                let letter = 'B';
                if (last > 15 && last <= 30) letter = 'I';
                if (last > 30 && last <= 45) letter = 'N';
                if (last > 45 && last <= 60) letter = 'G';
                if (last > 60 && last <= 75) letter = 'O';
                
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '14px 30px',
                    borderRadius: '50px',
                    border: `1.5px solid ${(activeGame?.customization?.accentColor || '#ec4899')}88`,
                    boxShadow: `0 0 15px ${(activeGame?.customization?.accentColor || '#ec4899')}33`
                  }}>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: activeGame?.customization?.accentColor || '#ec4899' }}>{letter}</span>
                    <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff' }}>{last}</span>
                  </div>
                );
              })()}
            </div>
            
            {/* Action button to dismiss */}
            <button 
              type="button" 
              onClick={() => setActiveSponsorModal(null)}
              style={{
                padding: '14px 36px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${activeGame?.customization?.primaryColor || '#a855f7'} 0%, ${activeGame?.customization?.accentColor || '#ec4899'} 100%)`,
                color: '#ffffff',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1.15rem',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${(activeGame?.customization?.primaryColor || '#a855f7')}55`,
                transition: 'all 0.2s',
                marginTop: '10px'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              Continuar Juego ➔
            </button>
          </div>
        </div>,
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
