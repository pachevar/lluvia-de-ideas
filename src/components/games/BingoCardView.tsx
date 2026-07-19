import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { BingoCard, BingoGame } from '../../types';
import { validateBingoCard } from '../../utils/bingoGenerator';
import './Bingo.css';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

export default function BingoCardView() {
  const { cartonId } = useParams<{ cartonId: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<BingoCard | null>(null);
  const [gameData, setGameData] = useState<BingoGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const [activeSponsorModal, setActiveSponsorModal] = useState<any | null>(null);

  // Voice announcement and confirmation states
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('bingo_voice_mode') === 'true');
  const [winnerDismissed, setWinnerDismissed] = useState(false);
  const prevDrawnCountRef = useRef(0);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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
          const rawData = cardSnap.data() as any;
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
            matrix
          };

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
          setError("No se encontró este cartón. Revisa el enlace.");
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

  // Escuchar nuevas bolas para reproducir sonido de alerta y cantar la bola si voiceMode está activo
  useEffect(() => {
    if (!gameData || gameData.status !== 'playing') return;
    const currentCount = gameData.drawnNumbers.length;
    if (currentCount > prevDrawnCountRef.current) {
      const newBall = gameData.drawnNumbers[currentCount - 1];
      
      // Reproducir sonido suave de notificación
      playFeedbackSound(true);

      if (voiceMode) {
        speakBall(newBall);
      }
    }
    prevDrawnCountRef.current = currentCount;
  }, [gameData?.drawnNumbers, voiceMode]);

  const toggleMark = (row: number, col: number) => {
    if (row === 2 && col === 2) return;
    if (!cardData || !gameData) return;
    
    const value = cardData.matrix[row][col];
    if (value === null) return;

    const isCurrentlyMarked = markedSlots[row][col];
    const isDrawn = gameData.drawnNumbers.includes(value);

    // Play synthesized sound
    if (!isCurrentlyMarked) {
      playFeedbackSound(isDrawn);

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

  const shoutBingo = async () => {
    triggerConfetti();
    try {
      if (cartonId) {
        const cardRef = doc(db, 'bingo_cards', cartonId);
        await updateDoc(cardRef, {
          shoutedBingo: true,
          shoutedAt: Date.now()
        });
        setShowBingoModal(true);
      }
    } catch (e) {
      console.error(e);
      setShowBingoModal(true);
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
  if (error) return <div className="bingo-card-view-pane card-glass" style={{ margin: '20px', padding: '20px', textAlign: 'center' }}><h2>❌ {error}</h2></div>;
  if (!cardData || !gameData) return null;

  const cust = gameData.customization;
  const primaryColor = cust?.primaryColor || '#a855f7';
  const accentColor = cust?.accentColor || '#ec4899';
  const backgroundColor = cust?.backgroundColor || '#fbf9ff';
  const markerEmoji = cust?.markerEmoji || '⭐';



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

      {/* Customizable Session Title */}
      <div className="bingo-card-session-title" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-gamer)', color: '#fff', margin: 0 }}>
          {cust?.title || 'Bingo Virtual'}
        </h2>
        {cust?.subtitle && (
          <p style={{ fontSize: '0.85rem', color: 'var(--cyber-cyan)', margin: '4px 0 0', opacity: 0.8 }}>
            {cust.subtitle}
          </p>
        )}
      </div>

      {/* Banner */}
      {cust?.headerImage && (
        <div 
          className="bingo-card-banner" 
          style={{ 
            maxWidth: '100%', 
            margin: '10px auto', 
            height: cust.headerHeight ? `${cust.headerHeight}px` : '160px', 
            overflow: 'hidden', 
            borderRadius: '12px' 
          }}
        >
          <img src={cust.headerImage} alt="Bingo Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}





      <div 
        className={`bingo-personal-header card-glass ${cust?.cardTheme ? `card-theme-${cust.cardTheme}` : 'card-theme-classic'}`} 
        style={{ 
          margin: '15px auto', 
          maxWidth: '100%', 
          padding: '16px 20px', 
          position: 'sticky', 
          top: '10px', 
          zIndex: 10, 
          borderColor: primaryColor,
          borderRadius: '16px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px ${primaryColor}40`,
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block', marginBottom: '2px' }}>Jugador</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cardData.playerName}
            </h3>
            <div style={{ marginTop: '8px' }}>
              <span 
                className="badge" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  background: gameData.status === 'playing' ? '#22c55e' : gameData.status === 'waiting' ? '#f59e0b' : '#ec4899',
                  color: '#ffffff'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block' }}></span>
                {gameData.status === 'playing' ? 'En Juego' : gameData.status === 'waiting' ? 'Esperando...' : 'Finalizado'}
              </span>
            </div>
          </div>
          
          <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.6, marginBottom: '4px', display: 'block' }}>ID CARTÓN</span>
            <code 
              style={{ 
                fontSize: '1.1rem', 
                background: 'rgba(0,0,0,0.4)', 
                color: '#00ffff',
                textShadow: '0 0 8px rgba(0,255,255,0.6)',
                border: '1px solid rgba(0,255,255,0.3)',
                padding: '6px 12px', 
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                display: 'inline-block'
              }}
            >
              #{cartonId && cartonId.length > 8 ? `${cartonId.slice(0, 4)}...${cartonId.slice(-3)}` : cartonId}
            </code>
          </div>
        </div>

        {gameData.status === 'playing' && (
          <div className="live-balls-ticker" style={{ 
            marginTop: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '4px' 
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.9, flexShrink: 0 }}>Últimas bolas:</strong>
            {gameData.drawnNumbers.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aún ninguna</span>
            ) : (
              gameData.drawnNumbers.slice(-4).map((num, i, arr) => {
                const isLatest = i === arr.length - 1;
                let letter = 'B';
                if (num > 15 && num <= 30) letter = 'I';
                if (num > 30 && num <= 45) letter = 'N';
                if (num > 45 && num <= 60) letter = 'G';
                if (num > 60 && num <= 75) letter = 'O';
                
                return (
                  <span key={i} style={{
                    background: isLatest 
                      ? `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` 
                      : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    padding: isLatest ? '4px 8px' : '3px 6px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: isLatest ? '0.9rem' : '0.78rem',
                    border: isLatest 
                      ? `1px solid ${accentColor}` 
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: isLatest ? `0 0 10px ${primaryColor}44` : 'none',
                    fontFamily: 'monospace',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.3s',
                    flexShrink: 0
                  }}>
                    <span style={{ color: isLatest ? '#fff' : primaryColor, fontWeight: 900 }}>{letter}</span>
                    <span style={{ opacity: isLatest ? 1 : 0.85 }}>{num}</span>
                  </span>
                );
              })
            )}
          </div>
        )}

        {/* Assist Mode integrated inside the header card */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          marginTop: '15px',
          paddingTop: '10px'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#fff', opacity: 0.9, fontWeight: 'bold' }}>
            🤖 Modo Asistido (Ayuda visual)
          </span>
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
            <span className="cyber-slider"></span>
          </label>
        </div>

        {/* Voice Mode Switch */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          marginTop: '10px',
          paddingTop: '10px'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#fff', opacity: 0.9, fontWeight: 'bold' }}>
            🔊 Cantar bolas por voz
          </span>
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
            <span className="cyber-slider"></span>
          </label>
        </div>
      </div>

      {/* Proximity Banner */}
      {gameData.status === 'playing' && (() => {
        const missingCount = getProximityStatus();
        if (missingCount !== null && missingCount > 0 && missingCount <= 3) {
          return (
            <div className="bingo-proximity-banner animate-pulse" style={{ margin: '10px auto', maxWidth: '100%' }}>
              {missingCount === 1 
                ? '🔮 ¡ESTÁS A UN SOLO NÚMERO DE GANAR BINGO!' 
                : `⚡ ¡ESTÁS A ${missingCount} NÚMEROS DE GANAR BINGO!`}
            </div>
          );
        }
        if (missingCount === 0) {
          return (
            <div className="bingo-proximity-banner winner-alert animate-bounce" style={{ margin: '10px auto', maxWidth: '100%' }}>
              🎉 ¡TIENES BINGO COMPLETADO! ¡GRITA BINGO AHORA! 🎉
            </div>
          );
        }
        return null;
      })()}



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

                // Check mapping for the number
                const map = value !== null ? (cust?.numberToImageMap as any)?.[value] : null;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => toggleMark(row, col)}
                    disabled={isFree}
                    className={`bingo-cell ${isMarked ? 'marked' : ''} ${isDrawn ? 'drawn' : ''} ${assistMode && isDrawn && !isMarked ? 'unmarked-drawn' : ''}`}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '10px',
                      cursor: isFree ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      padding: '4px',
                      ...((cust?.cardTheme === 'classic' || !cust?.cardTheme) ? {
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

                    {/* Floating marker style (Stamp Overlay) */}
                    {isMarked && !isFree && (
                      <div 
                        className="bingo-marker-stamp"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.2rem',
                          opacity: 0.45,
                          pointerEvents: 'none',
                          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.35))',
                          zIndex: 2,
                          animation: 'popInStamp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                        }}
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

        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <button
            className="btn btn-primary animate-pulse"
            style={{ width: '100%', fontSize: '1.5rem', padding: '15px', borderRadius: '15px', background: primaryColor, boxShadow: `0 8px 25px rgba(${primaryColor.startsWith('#') ? '168, 85, 247' : '168,85,247'}, 0.3)` }}
            onClick={shoutBingo}
          >
            📢 ¡CANTAR BINGO!
          </button>

          {/* Pattern Badge & Mini Guide (Moved here) */}
          {gameData?.winningPattern && (
            <div 
              className="card-glass animate-fade-in"
              style={{
                margin: '10px auto 0',
                width: '100%',
                padding: '12px 18px',
                borderRadius: '16px',
                border: `1px solid ${primaryColor}66`,
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block', marginBottom: '2px', color: '#fff' }}>Objetivo para ganar</span>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {gameData.winningPattern === 'full' && '🏆 Cartón Lleno (Completar todo)'}
                  {gameData.winningPattern === 'line' && '📏 Cualquier Línea (Horizontal/Vertical)'}
                  {gameData.winningPattern === 'diagonal' && '❌ Diagonales (Líneas en X)'}
                  {gameData.winningPattern === 'four_corners' && '📐 Cuatro Esquinas'}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#e2dbf0', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                  {gameData.winningPattern === 'full' && 'Debes marcar todas las casillas del cartón.'}
                  {gameData.winningPattern === 'line' && 'Debes completar cualquier fila de 5 o columna de 5 números.'}
                  {gameData.winningPattern === 'diagonal' && 'Debes completar cualquiera de las dos diagonales principales.'}
                  {gameData.winningPattern === 'four_corners' && 'Debes completar las cuatro esquinas externas de tu cartón.'}
                </span>
              </div>

              {/* 5x5 micro-grid mini diagram */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '2px',
                width: '50px',
                height: '50px',
                background: 'rgba(0,0,0,0.3)',
                padding: '4px',
                borderRadius: '6px',
                border: `1px solid ${primaryColor}66`,
                flexShrink: 0
              }}>
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
                        style={{
                          borderRadius: '1px',
                          background: isCenter
                            ? accentColor
                            : isHighlighted
                            ? primaryColor
                            : 'rgba(255, 255, 255, 0.1)',
                          opacity: isCenter ? 1 : isHighlighted ? 0.95 : 0.2,
                          aspectRatio: '1/1'
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          <button
            className="btn-abandon-card"
            onClick={handleAbandonCard}
            style={{ marginTop: '10px' }}
          >
            🚪 Renunciar al Cartón / Salir
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

      {/* ====== PLAYER SPONSOR BANNER MODAL ====== */}
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
              padding: '40px 30px',
              maxWidth: '500px',
              width: '90%',
              borderRadius: '32px',
              background: backgroundColor || '#0f172a',
              border: `4px solid ${primaryColor}`,
              boxShadow: `0 0 65px ${primaryColor}55, inset 0 0 30px rgba(0,0,0,0.5)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              color: isLight ? '#1f2937' : '#ffffff'
            }}
          >
            {/* Sponsor Logo (Bigger and more prominent) */}
            <div style={{
              width: '280px',
              height: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              border: `2px solid ${accentColor}`
            }}>
              <img 
                src={activeSponsorModal.logo} 
                alt={activeSponsorModal.name} 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            </div>
            
            <h3 style={{ 
              margin: 0, 
              fontSize: '2.1rem', 
              color: isLight ? 'var(--text-title)' : '#ffffff', 
              fontWeight: 800,
              textShadow: isLight ? 'none' : `0 2px 10px ${primaryColor}aa`
            }}>
              {activeSponsorModal.name}
            </h3>
            
            {activeSponsorModal.message && (
              <p style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                color: isLight ? 'var(--text-main)' : '#f1f5f9', 
                fontStyle: 'italic', 
                lineHeight: '1.4',
                textAlign: 'center',
                textShadow: isLight ? 'none' : '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                "{activeSponsorModal.message}"
              </p>
            )}
            
            {/* Action button to dismiss */}
            <button 
              type="button" 
              onClick={() => setActiveSponsorModal(null)}
              style={{
                padding: '12px 32px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                color: '#ffffff',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${primaryColor}55`,
                transition: 'all 0.2s',
                marginTop: '15px',
                width: '100%'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              Continuar Juego ➔
            </button>
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
            <div className="player-modal-actions" style={{ width: '100%' }}>
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
    </div>
  );
}
