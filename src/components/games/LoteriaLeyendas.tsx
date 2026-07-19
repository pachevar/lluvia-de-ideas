import { useState, useEffect } from 'react';

const LOTERIA_DECK = [
  { id: 1, name: "El Sombrerón", icon: "🤠", description: "Enamora con canciones y trenza el cabello de las mulas." },
  { id: 2, name: "El Cadejo Blanco", icon: "🐕", description: "El fiel protector de los caminantes nocturnos." },
  { id: 3, name: "La Llorona", icon: "👵", description: "Llora cerca de los ríos buscando a sus hijos perdidos." },
  { id: 4, name: "La Siguanaba", icon: "👩", description: "Se muestra hermosa de espaldas, pero asusta de frente." },
  { id: 5, name: "La Tatuana", icon: "⛵", description: "Escapó de prisión navegando en un barco dibujado con tiza." },
  { id: 6, name: "El Jinetillo", icon: "🐎", description: "Cabalga sin cabeza por los cerros bajo la lluvia." },
  { id: 7, name: "El Cadejo Negro", icon: "🐺", description: "Espíritu travieso que acecha en las sombras." },
  { id: 8, name: "El Sisimite", icon: "🦍", description: "Gigante de la selva que tiene los pies al revés." },
  { id: 9, name: "El Carretón", icon: "🛒", description: "Suena de noche anunciando leyendas ancestrales." }
];

export default function LoteriaLeyendas() {
  const [lotteryBoard, setLotteryBoard] = useState<typeof LOTERIA_DECK>([]);
  const [drawnCard, setDrawnCard] = useState<typeof LOTERIA_DECK[0] | null>(null);
  const [drawnHistory, setDrawnHistory] = useState<string[]>([]);
  const [markedSlots, setMarkedSlots] = useState<number[]>([]);
  const [lotteryWinner, setLotteryWinner] = useState<boolean | null>(null);
  const [lotteryMessage, setLotteryMessage] = useState<string>('');

  useEffect(() => {
    if (lotteryBoard.length === 0) {
      startLotteryGame();
    }
  }, []);

  const startLotteryGame = () => {
    const shuffled = [...LOTERIA_DECK].sort(() => 0.5 - Math.random());
    setLotteryBoard(shuffled);
    setDrawnCard(null);
    setDrawnHistory([]);
    setMarkedSlots([]);
    setLotteryWinner(null);
    setLotteryMessage('¡Cartón generado! Presiona "Cantar Siguiente" para comenzar.');
  };

  const drawNextCard = () => {
    if (lotteryWinner) return;
    
    const undrawn = LOTERIA_DECK.filter(card => !drawnHistory.includes(card.name));
    if (undrawn.length === 0) {
      setLotteryMessage('Se han cantado todas las cartas del mazo. Reinicia el juego.');
      return;
    }

    const next = undrawn[Math.floor(Math.random() * undrawn.length)];
    setDrawnCard(next);
    setDrawnHistory(prev => [next.name, ...prev]);
    setLotteryMessage(`¡Se canta: ${next.icon} ${next.name}! Revisa tu cartón.`);
  };

  const handleSlotClick = (index: number) => {
    if (!drawnCard || lotteryWinner) return;
    
    const card = lotteryBoard[index];
    if (drawnHistory.includes(card.name)) {
      if (markedSlots.includes(index)) {
        setMarkedSlots(prev => prev.filter(i => i !== index));
      } else {
        setMarkedSlots(prev => [...prev, index]);
      }
    } else {
      setLotteryMessage(`No puedes marcar a "${card.name}" porque aún no ha sido cantado.`);
    }
  };

  const checkLotteryWin = () => {
    if (lotteryBoard.length === 0) return;

    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const hasWon = winConditions.some(condition => 
      condition.every(index => markedSlots.includes(index))
    );

    if (hasWon) {
      setLotteryWinner(true);
      setLotteryMessage('🎉 ¡LOTERÍA! ¡Has completado una línea ganadora! 🌟');
    } else {
      setLotteryMessage('❌ Aún no tienes una línea completa. ¡Sigue revisando tu cartón!');
    }
  };

  return (
    <div className="tab-pane animate-fade-in">
      <section className="game-section">
        <div className="section-intro">
          <span className="badge badge-tertiary">Mesa Didáctica</span>
          <h2 className="gradient-text">Lotería de las Leyendas</h2>
          <p>Escucha las cartas cantadas y marca los personajes mágicos en tu cartón de 3x3.</p>
        </div>

        <div className="loteria-flow-grid">
          <div className="loteria-sidebar card-glass">
            <h4>Mazo de Cartas</h4>
            
            {drawnCard ? (
              <div className="drawn-card-showcase animate-fade-in">
                <span className="drawn-card-emoji animate-bounce">{drawnCard.icon}</span>
                <h3>{drawnCard.name}</h3>
                <p className="drawn-card-desc">{drawnCard.description}</p>
              </div>
            ) : (
              <div className="drawn-card-placeholder">
                <span>🃏</span>
                <p>Presiona el botón para cantar la primera carta.</p>
              </div>
            )}

            <div className="loteria-actions">
              <button className="btn btn-primary" onClick={drawNextCard} disabled={!!lotteryWinner}>
                Cantar Siguiente 📣
              </button>
              <button className="btn btn-secondary" onClick={startLotteryGame}>
                Reiniciar Cartón 🔄
              </button>
            </div>

            <p className="loteria-system-message">{lotteryMessage}</p>
          </div>

          <div className="loteria-board-card card-glass">
            <div className="board-header">
              <h4>Tu Cartón de Leyendas</h4>
              <button className="btn btn-success btn-sm" onClick={checkLotteryWin}>
                ¡Cantar Lotería! 👑
              </button>
            </div>
            
            <div className="loteria-grid">
              {lotteryBoard.map((card, idx) => {
                const isMarked = markedSlots.includes(idx);
                return (
                  <div 
                    key={idx} 
                    className={`loteria-slot ${isMarked ? 'marked' : ''}`}
                    onClick={() => handleSlotClick(idx)}
                  >
                    <span className="slot-emoji">{card.icon}</span>
                    <span className="slot-name">{card.name}</span>
                    {isMarked && <span className="slot-marker">⭐</span>}
                  </div>
                );
              })}
            </div>
            
            {drawnHistory.length > 0 && (
              <div className="drawn-history-row">
                <span className="history-label">Cantadas:</span>
                <div className="history-badges">
                  {drawnHistory.map((name, idx) => (
                    <span key={idx} className="badge badge-primary">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
