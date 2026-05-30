import { useState, useEffect } from 'react';
import './App.css';

// Type definitions
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Aventuras Matemáticas",
    category: "Matemáticas (Primaria)",
    price: 12.99,
    rating: 4.8,
    description: "Libro interactivo y retos lógicos para despertar el amor por los números.",
    image: "📊"
  },
  {
    id: 2,
    title: "Lectura Mágica",
    category: "Gramática y Lectura",
    price: 15.49,
    rating: 4.9,
    description: "Método dinámico con realidad aumentada para lectoescritura rápida.",
    image: "📖"
  },
  {
    id: 3,
    title: "Algoritmos para Niños",
    category: "Programación Básica",
    price: 24.99,
    rating: 4.7,
    description: "Juego de mesa y licencia digital de introducción al pensamiento computacional.",
    image: "💻"
  }
];

function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'inicio' | 'apps' | 'productos' | 'pagos'>('inicio');

  // Cart State
  const [cart, setCart] = useState<Product[]>([]);
  
  // Interactive App (Math Game) State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'ended'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [question, setQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentError, setPaymentError] = useState('');

  // Math game generator
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

  // Timer Effect for Math Game
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

  // Shopping Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalCartPrice = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  // Payment gateway simulation
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    
    // Simple validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setPaymentError('El número de tarjeta debe tener 16 dígitos.');
      return;
    }
    if (cardName.trim() === '') {
      setPaymentError('Por favor, ingresa el nombre del titular.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setPaymentError('La fecha debe estar en formato MM/AA.');
      return;
    }
    if (cardCvv.length < 3) {
      setPaymentError('El CVV debe tener 3 dígitos.');
      return;
    }

    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setCart([]); // Clear cart
      // Reset payment fields
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
    }, 2500);
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardExpiry(formatted.substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.substring(0, 3));
  };

  // Detect card brand
  const getCardType = () => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Credit Card';
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="app-header card-glass">
        <div className="brand">
          <span className="brand-logo">🌌</span>
          <div className="brand-text">
            <h2>Lluvia de Ideas</h2>
            <p>Portal Educativo</p>
          </div>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-link ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            Inicio
          </button>
          <button 
            className={`nav-link ${activeTab === 'apps' ? 'active' : ''}`}
            onClick={() => setActiveTab('apps')}
          >
            Juegos Interactivos
          </button>
          <button 
            className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            Catálogo
          </button>
          <button 
            className={`nav-link ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pagos');
              setPaymentStatus('idle');
            }}
          >
            Pagos
          </button>
        </nav>
        
        {/* Cart Quick Info */}
        <div className="cart-indicator" onClick={() => setActiveTab('productos')}>
          <span className="cart-icon">🛒</span>
          {cart.length > 0 && <span className="cart-badge animate-fade-in">{cart.length}</span>}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Tab 1: Inicio (Dashboard / Ecosystem Status) */}
        {activeTab === 'inicio' && (
          <div className="tab-pane animate-fade-in">
            <section className="welcome-hero">
              <h1 className="gradient-text">Aprender es una Aventura</h1>
              <p className="subtitle">
                Explora nuestras aplicaciones didácticas interactivas, adquiere material de calidad de la Editorial Lluvia de Ideas y realiza tus transacciones de forma segura.
              </p>
              
              <div className="cta-container">
                <button className="btn btn-primary" onClick={() => setActiveTab('apps')}>
                  Empezar a Jugar 🚀
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('productos')}>
                  Ver Catálogo de Libros 📚
                </button>
              </div>
            </section>

            {/* Ecosystem Stats & Integration Widgets */}
            <section className="ecosystem-section">
              <h3 className="section-title">Ecosistema & Vinculaciones</h3>
              
              <div className="widgets-grid">
                
                {/* Google / Firebase Widget */}
                <div className="widget-card card-glass">
                  <div className="widget-header">
                    <span className="widget-icon">⚡</span>
                    <h4>Google Cloud & Firebase</h4>
                    <span className="status-dot pulsing"></span>
                  </div>
                  <div className="widget-body">
                    <div className="info-row">
                      <span className="label">Cuenta Google:</span>
                      <span className="value text-highlight">lluviadeideaseditorial@gmail.com</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Proyecto ID:</span>
                      <span className="value">lluviadeideas-educativo</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Estado de Firestore:</span>
                      <span className="value badge badge-success">Inicializado</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Auth Provider:</span>
                      <span className="value">Email / Password</span>
                    </div>
                  </div>
                </div>

                {/* GitHub Widget */}
                <div className="widget-card card-glass">
                  <div className="widget-header">
                    <span className="widget-icon">🐙</span>
                    <h4>GitHub Repository</h4>
                    <span className="status-dot pulsing"></span>
                  </div>
                  <div className="widget-body">
                    <div className="info-row">
                      <span className="label">Usuario local:</span>
                      <span className="value">pachevar</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Correo Git:</span>
                      <span className="value">lluviadeideaseditorial@gmail.com</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Rama Activa:</span>
                      <span className="value badge badge-primary">main</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Git Credential Store:</span>
                      <span className="value badge badge-success">Vinculado</span>
                    </div>
                  </div>
                </div>

                {/* App Analytics Quickview */}
                <div className="widget-card card-glass">
                  <div className="widget-header">
                    <span className="widget-icon">📈</span>
                    <h4>Rendimiento Web</h4>
                    <span className="status-dot"></span>
                  </div>
                  <div className="widget-body">
                    <div className="info-row">
                      <span className="label">Framework:</span>
                      <span className="value">React 19 + Vite 8</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Lenguaje:</span>
                      <span className="value">TypeScript</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Estilos:</span>
                      <span className="value">Vanilla CSS (Premium)</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Seguridad SSL:</span>
                      <span className="value badge badge-success">Habilitado</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Juegos Interactivos */}
        {activeTab === 'apps' && (
          <div className="tab-pane animate-fade-in">
            <section className="game-section">
              <div className="section-intro">
                <span className="badge badge-primary">Aplicación Interactiva</span>
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
        )}

        {/* Tab 3: Catálogo de Productos */}
        {activeTab === 'productos' && (
          <div className="tab-pane animate-fade-in">
            <section className="catalog-section">
              <div className="catalog-header-row">
                <div>
                  <span className="badge badge-success">Editorial</span>
                  <h2 className="gradient-text">Material Educativo</h2>
                  <p>Libros interactivos y kits pedagógicos diseñados para fomentar la creatividad.</p>
                </div>
                
                {/* Small shopping cart overlay */}
                {cart.length > 0 && (
                  <div className="cart-summary-box card-glass">
                    <div className="cart-summary-header">
                      <h5>Tu Carrito ({cart.length})</h5>
                      <span className="cart-total-price">${getTotalCartPrice()}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('pagos')}>
                      Proceder al Pago 💸
                    </button>
                  </div>
                )}
              </div>

              <div className="products-grid">
                {PRODUCTS.map(product => (
                  <div key={product.id} className="product-card card-glass">
                    <div className="product-image-container">
                      <span className="product-emoji-large">{product.image}</span>
                      <span className="product-category">{product.category}</span>
                    </div>
                    <div className="product-info">
                      <div className="title-price-row">
                        <h3>{product.title}</h3>
                        <span className="price">${product.price}</span>
                      </div>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-footer">
                        <span className="rating">⭐⭐⭐⭐⭐ {product.rating}</span>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => addToCart(product)}
                        >
                          Añadir al Carrito
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Cart List */}
              {cart.length > 0 && (
                <div className="cart-detailed-list card-glass">
                  <h3>Lista de Compra Detallada</h3>
                  <div className="cart-items">
                    {cart.map((item, idx) => (
                      <div key={idx} className="cart-item-row">
                        <span className="item-emoji">{item.image}</span>
                        <div className="item-details">
                          <h5>{item.title}</h5>
                          <p>{item.category}</p>
                        </div>
                        <span className="item-price">${item.price}</span>
                        <button className="btn-remove" onClick={() => removeFromCart(idx)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer-detailed">
                    <div className="total-label">Total a Pagar:</div>
                    <div className="total-amount">${getTotalCartPrice()}</div>
                    <button className="btn btn-primary" onClick={() => setActiveTab('pagos')}>
                      Pagar Ahora
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 4: Pasarela de Pagos */}
        {activeTab === 'pagos' && (
          <div className="tab-pane animate-fade-in">
            <section className="payment-section">
              <div className="section-intro">
                <span className="badge badge-success">Transacción Segura</span>
                <h2 className="gradient-text">Pasarela de Pagos</h2>
                <p>Completa tu compra con seguridad cifrada SSL respaldada por Firebase.</p>
              </div>

              {paymentStatus === 'success' ? (
                <div className="payment-success-card card-glass animate-fade-in">
                  <div className="success-icon-wrapper">
                    <span className="success-checkmark">✔</span>
                  </div>
                  <h3>¡Pago Realizado con Éxito!</h3>
                  <p>Tu orden ha sido procesada. El material digital ya está disponible y tus productos físicos están listos para envío.</p>
                  
                  <div className="receipt-box">
                    <div className="receipt-row">
                      <span>Estado:</span>
                      <span className="text-success font-bold">Aprobado</span>
                    </div>
                    <div className="receipt-row">
                      <span>ID Transacción:</span>
                      <span className="font-mono">TXN-{Math.floor(Math.random() * 900000) + 100000}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Canal de pago:</span>
                      <span>Firebase Gateway</span>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary" onClick={() => setActiveTab('inicio')}>
                    Volver al Inicio
                  </button>
                </div>
              ) : (
                <div className="payment-flow-grid">
                  
                  {/* Left Column: Interactive Credit Card Visualizer */}
                  <div className="card-visual-column">
                    <div className={`credit-card ${isCardFlipped ? 'flipped' : ''}`}>
                      {/* Front Side */}
                      <div className="card-front">
                        <div className="card-glow"></div>
                        <div className="card-header-row">
                          <span className="chip"></span>
                          <span className="card-brand-label">{getCardType()}</span>
                        </div>
                        <div className="card-number-display">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="card-footer-row">
                          <div className="card-holder-group">
                            <span className="card-label">Titular</span>
                            <span className="card-value">{cardName.toUpperCase() || 'NOMBRE APELLIDO'}</span>
                          </div>
                          <div className="card-expiry-group">
                            <span className="card-label">Vence</span>
                            <span className="card-value">{cardExpiry || 'MM/AA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="card-back">
                        <div className="magnetic-strip"></div>
                        <div className="signature-area">
                          <span className="cvv-display">{cardCvv || '•••'}</span>
                        </div>
                        <div className="back-footer">
                          <p>Esta tarjeta es simulada de forma segura.</p>
                        </div>
                      </div>
                    </div>

                    {/* Order summary box */}
                    <div className="order-summary-box card-glass">
                      <h4>Resumen de Compra</h4>
                      <div className="summary-list">
                        {cart.length === 0 ? (
                          <div className="empty-summary">No hay artículos en tu carrito. Agrega productos en la pestaña de Catálogo.</div>
                        ) : (
                          cart.map((item, idx) => (
                            <div key={idx} className="summary-item">
                              <span>{item.title}</span>
                              <span className="font-bold">${item.price}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="summary-total">
                        <span>Total:</span>
                        <span className="total-price-val">${getTotalCartPrice()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Checkout Form */}
                  <div className="payment-form-card card-glass">
                    <h3>Detalles de Pago</h3>
                    
                    {paymentError && <div className="payment-error-banner">{paymentError}</div>}
                    
                    <form onSubmit={handlePayment} className="payment-form">
                      <div className="input-group">
                        <label>Número de Tarjeta</label>
                        <input 
                          type="text" 
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          onFocus={() => setIsCardFlipped(false)}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="input-group">
                        <label>Nombre del Titular</label>
                        <input 
                          type="text" 
                          placeholder="Juan Pérez"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          onFocus={() => setIsCardFlipped(false)}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="input-row">
                        <div className="input-group">
                          <label>Fecha de Expiración</label>
                          <input 
                            type="text" 
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setIsCardFlipped(false)}
                            required
                            className="form-input"
                          />
                        </div>

                        <div className="input-group">
                          <label>CVC / CVV</label>
                          <input 
                            type="text" 
                            placeholder="123"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            required
                            className="form-input"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary btn-large btn-pay"
                        disabled={paymentStatus === 'processing' || cart.length === 0}
                      >
                        {paymentStatus === 'processing' ? (
                          <span className="spinner-wrapper">
                            <span className="spinner"></span> Procesando...
                          </span>
                        ) : (
                          `Pagar $${getTotalCartPrice()}`
                        )}
                      </button>
                      
                      {cart.length === 0 && (
                        <p className="warning-text">⚠️ Debes añadir artículos al carrito antes de realizar el pago.</p>
                      )}
                    </form>
                  </div>

                </div>
              )}
            </section>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer card-glass">
        <p>© 2026 Editorial Lluvia de Ideas. Todos los derechos reservados.</p>
        <div className="footer-links">
          <span>Google Ecosystem</span>
          <span className="divider">•</span>
          <span>GitHub Verified</span>
          <span className="divider">•</span>
          <span>Soporte Técnico</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
