import React, { useState, useEffect } from 'react';

export default function RetoMatematico() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'ended'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [question, setQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const generateQuestion = (diff: typeof difficulty) => {
    let max = 10;
    let ops = ['+', '-'];
    if (diff === 'medium') {
      max = 30;
      ops = ['+', '-', '*'];
    } else if (diff === 'hard') {
      max = 100;
      ops = ['+', '-', '*'];
    }

    const num1 = Math.floor(Math.random() * max) + 1;
    const num2 = Math.floor(Math.random() * (diff === 'hard' && ops.includes('*') ? 12 : max)) + 1;
    const operator = ops[Math.floor(Math.random() * ops.length)];
    
    let answer = 0;
    switch (operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
    }

    setQuestion({ num1, num2, operator, answer });
    setUserAnswer('');
    setTimeLeft(diff === 'easy' ? 15 : diff === 'medium' ? 12 : 8);
    setFeedback({ type: null, text: '' });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleTimeout declared below; timer keyed by timeLeft
  }, [timeLeft, gameState]);

  const handleTimeout = () => {
    setStreak(0);
    setFeedback({ type: 'error', text: `¡Se acabó el tiempo! La respuesta era ${question.answer}` });
    setTimeout(() => {
      generateQuestion(difficulty);
    }, 2000);
  };

  const startNewGame = (diffLevel: typeof difficulty) => {
    setDifficulty(diffLevel);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    generateQuestion(diffLevel);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer === '') return;

    const numericAnswer = parseInt(userAnswer);
    if (numericAnswer === question.answer) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 35;
      setScore(prev => prev + points + (streak * 2));
      setStreak(prev => prev + 1);
      setFeedback({ type: 'success', text: '¡Correcto! Sigue así 🌟' });
    } else {
      setStreak(0);
      setFeedback({ type: 'error', text: `Incorrecto. Era ${question.answer} 😢` });
    }

    setTimeout(() => {
      generateQuestion(difficulty);
    }, 1500);
  };

  return (
    <div className="tab-pane animate-fade-in">
      <section className="game-section">
        <div className="section-intro">
          <span className="badge badge-tertiary">Aplicación Interactiva</span>
          <h2 className="gradient-text">Reto Mental Matemático</h2>
          <p>¡Desafía tus habilidades aritméticas y sube en tu racha de aciertos!</p>
        </div>

        <div className="game-wrapper card-glass">
          {gameState === 'start' && (
            <div className="game-start-screen">
              <span className="game-icon-large animate-bounce">🧠</span>
              <h3>¿Listo para el desafío?</h3>
              <p>Elige tu dificultad para comenzar a sumar, restar y multiplicar.</p>
              
              <div className="difficulty-selectors">
                <button className="btn btn-success" onClick={() => startNewGame('easy')}>
                  Fácil (Suma / Resta 1-10)
                </button>
                <button className="btn btn-warning" onClick={() => startNewGame('medium')}>
                  Medio (Suma / Resta / Mult 1-30)
                </button>
                <button className="btn btn-danger" onClick={() => startNewGame('hard')}>
                  Difícil (Mult 1-12 / Operaciones 1-100)
                </button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="game-active-screen">
              <div className="game-stats-row">
                <div className="stat-box">
                  <span className="stat-label">Puntaje:</span>
                  <span className="stat-value">{score}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Racha:</span>
                  <span className="stat-value text-accent">🔥 {streak}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Dificultad:</span>
                  <span className="stat-value uppercase">{difficulty}</span>
                </div>
              </div>

              {/* Timer progress bar */}
              <div className="timer-container">
                <div 
                  className={`timer-bar ${timeLeft <= 3 ? 'low-time' : ''}`}
                  style={{ width: `${(timeLeft / (difficulty === 'easy' ? 15 : difficulty === 'medium' ? 12 : 8)) * 100}%` }}
                ></div>
              </div>
              <div className="timer-text">Tiempo restante: {timeLeft}s</div>

              <div className="question-display">
                <span className="number">{question.num1}</span>
                <span className="operator">{question.operator}</span>
                <span className="number">{question.num2}</span>
                <span className="equals">=</span>
                <span className="question-mark">?</span>
              </div>

              <form onSubmit={handleAnswerSubmit} className="answer-form">
                <input 
                  type="number" 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  autoFocus
                  disabled={feedback.type !== null}
                  className="answer-input"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={feedback.type !== null}
                >
                  Responder
                </button>
              </form>

              {feedback.type && (
                <div className={`feedback-banner ${feedback.type} animate-fade-in`}>
                  {feedback.text}
                </div>
              )}

              <div className="game-actions">
                <button className="btn btn-outline" onClick={() => setGameState('start')}>
                  Salir del Juego
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
