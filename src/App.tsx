import { useState, useEffect } from 'react';
import logoEditorial from './assets/logo editorial.png';
import './App.css';

// Importar imágenes de cuentos del Popol Vuh
import camazotzTitulo from './cuentos/Camazotz titulo.png';
import ixkikTitulo from './cuentos/Ixkik titulo.png';
import ixmukanneTitulo from './cuentos/Ixmukanne titulo.png';
import juracanTitulo from './cuentos/Juracan titulo.png';
import ququmatzTitulo from './cuentos/Ququmatz titulo.png';

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

// Lotería cards definitions
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

// Cuentos del Popol Vuh
const POPOL_VUH_STORIES = [
  {
    id: "camazotz",
    title: "Camazotz (El Dios Murciélago)",
    image: camazotzTitulo,
    role: "Señor de la Noche y la Muerte en Xibalbá",
    summary: "En la cosmología maya y el libro sagrado del Popol Vuh, Camazotz es un temible dios murciélago asociado con la oscuridad, la noche y el sacrificio. Habita en Zotzilha (la Casa de los Murciélagos) en el inframundo de Xibalbá. Cuando los gemelos héroes, Hunahpú e Ixbalanqué, tuvieron que pernoctar en este lúgubre recinto, Hunahpú asomó su cabeza para comprobar si ya amanecía y fue decapitado por el veloz vuelo de Camazotz, quien llevó su cabeza al juego de pelota para regocijo de los señores de Xibalbá."
  },
  {
    id: "ixkik",
    title: "Ixkik (Luna de Sangre)",
    image: ixkikTitulo,
    role: "Madre de los Gemelos Héroes del Popol Vuh",
    summary: "Ixkik, hija del señor de Xibalbá Cuchumaquic, es una figura de audacia femenina y maternidad mística. Atraída por la prohibición, se acercó al árbol de morro donde colgaba la cabeza de Hun-Hunahpú. La calavera escupió en su palma y le concedió la descendencia de los héroes gemelos. Acusada de deshonra en el inframundo, esquivó a sus verdugos entregándoles un corazón falso hecho de savia roja y ascendió a la superficie de la tierra para ganarse la confianza de Ixmukané y proteger a sus hijos."
  },
  {
    id: "ixmukanne",
    title: "Ixmukané (La Abuela Creadora)",
    image: ixmukanneTitulo,
    role: "Diosa Primordial del Maíz y Adivina Sagrada",
    summary: "Ixmukané (también llamada Xmucané) es la abuela divina, sabia y tejedora del destino de la creación en el Popol Vuh. Junto a su consorte Ixpiyacoc, participó en los tres intentos de creación del universo. Es ella quien mole la mazorca de maíz amarillo y blanco nueve veces para moldear la carne y la sangre de los primeros cuatro hombres de maíz verdaderos. Su sabiduría espiritual guía a las generaciones y representa la conexión con las raíces de la tierra."
  },
  {
    id: "juracan",
    title: "Juracán (El Corazón del Cielo)",
    image: juracanTitulo,
    role: "Dios Primordial de las Tormentas, el Viento y el Fuego",
    summary: "Juracán (U K'ux Kaj, el Corazón del Cielo) es el dios creador del viento y las tormentas en el Popol Vuh. Su soplo cósmico y su relámpago dieron el impulso inicial para moldear la geografía terrestre y las aguas primordiales. Desató el gran diluvio que castigó a los hombres de madera en la segunda creación por su falta de memoria e ingratitud. Su nombre ha trascendido el tiempo dando origen al término lingüístico moderno 'huracán'."
  },
  {
    id: "ququmatz",
    title: "Ququmatz (La Serpiente Emplumada)",
    image: ququmatzTitulo,
    role: "Dios Soberano de la Sabiduría, el Agua y el Viento",
    summary: "Ququmatz es el dios creador representado como la Serpiente Emplumada de plumas verdes y azules resplandecientes. En el Popol Vuh, se une a Tepeu y Juracán para diseñar y dar vida al mundo habitado. Es una deidad con facultades chamánicas excepcionales: capaz de descender al inframundo, transformarse en jaguar, águila o serpiente de cascabel, y ascender a los cielos. Simboliza la perfecta armonía entre el conocimiento celestial y la fuerza de la tierra."
  }
];

function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'inicio' | 'apps-mate' | 'apps-loteria' | 'apps-casa' | 'juracan' | 'laboratorios' | 'productos'>('inicio');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileJuegosOpen, setIsMobileJuegosOpen] = useState(false);

  // Cuentos Popol Vuh Modal State
  interface LegendStory {
    id: string;
    title: string;
    image: string;
    summary: string;
    role: string;
  }
  const [activeStory, setActiveStory] = useState<LegendStory | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const copyIPToClipboard = () => {
    navigator.clipboard.writeText('mc.lluviadeideaseditorial.com');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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

  // Lotería Game State
  const [lotteryBoard, setLotteryBoard] = useState<typeof LOTERIA_DECK>([]);
  const [drawnCard, setDrawnCard] = useState<typeof LOTERIA_DECK[0] | null>(null);
  const [drawnHistory, setDrawnHistory] = useState<string[]>([]);
  const [markedSlots, setMarkedSlots] = useState<number[]>([]);
  const [lotteryWinner, setLotteryWinner] = useState<boolean | null>(null);
  const [lotteryMessage, setLotteryMessage] = useState<string>('');

  // La Casa de las Leyendas State
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [riddleFeedback, setRiddleFeedback] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [unlockedRooms, setUnlockedRooms] = useState<string[]>([]);

  // Universo de Juracán State
  const [windStrength, setWindStrength] = useState<number>(10);

  // Laboratorios State
  const [element1, setElement1] = useState<string | null>(null);
  const [element2, setElement2] = useState<string | null>(null);
  const [discoveredElements, setDiscoveredElements] = useState<string[]>([]);
  const [labFeedback, setLabFeedback] = useState<string>('Selecciona dos elementos básicos y haz clic en Mezclar.');



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
    if (activeTab !== 'apps-mate' || gameState !== 'playing') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, activeTab]);

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

  // Lotería Game Logic
  const startLotteryGame = () => {
    // Generate a shuffled 3x3 board
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
    
    // Find undrawn cards
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
    // Check if this card has been drawn in the history
    if (drawnHistory.includes(card.name)) {
      if (markedSlots.includes(index)) {
        // Unmark if already marked
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

    // Standard 3x3 win conditions
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

  // La Casa de las Leyendas Logic
  const handleRoomRiddleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || riddleAnswer.trim() === '') return;

    const answer = riddleAnswer.trim().toLowerCase();
    let isCorrect = false;

    if (selectedRoom === 'llorona' && (answer.includes('agua') || answer.includes('rio') || answer.includes('río'))) {
      isCorrect = true;
    } else if (selectedRoom === 'sombreron' && (answer.includes('guitarra') || answer.includes('musica') || answer.includes('música'))) {
      isCorrect = true;
    } else if (selectedRoom === 'cadejo' && answer.includes('blanco')) {
      isCorrect = true;
    }

    if (isCorrect) {
      setRiddleFeedback({ type: 'success', text: '¡Excelente! Has descifrado el acertijo y liberado la leyenda. 🗝️' });
      if (!unlockedRooms.includes(selectedRoom)) {
        setUnlockedRooms(prev => [...prev, selectedRoom]);
      }
    } else {
      setRiddleFeedback({ type: 'error', text: 'Respuesta incorrecta. ¡Inténtalo de nuevo o lee la leyenda con más atención!' });
    }
    setRiddleAnswer('');
  };

  // Universo de Juracán Logic
  const getWindStatus = (strength: number) => {
    if (strength <= 20) return { title: "Brisa de la Selva 🍃", desc: "El viento acaricia las hojas de ceiba. Juracán duerme plácidamente." };
    if (strength <= 50) return { title: "Viento Cruzado 💨", desc: "El dios sopla con fuerza. El silbido de Juracán resuena en los barrancos." };
    if (strength <= 80) return { title: "Tormenta Maya 🌧️⚡", desc: "Rayos y truenos azotan la tierra. La tormenta de Juracán ruge con poder." };
    return { title: "Huracán Ancestral 🌀🌪️", desc: "Fuerza destructiva total. El dios desata toda su energía cósmica sobre el portal." };
  };

  // Laboratorios Logic
  const mixElements = () => {
    if (!element1 || !element2) {
      setLabFeedback('Debes seleccionar dos elementos para mezclar.');
      return;
    }

    const pair = [element1, element2].sort().join('+');
    let result = '';

    switch (pair) {
      case '🔥+💧': result = 'Vapor (💨)'; break;
      case '🔥+🪨': result = 'Lava (🌋)'; break;
      case '💧+🪨': result = 'Barro (🧱)'; break;
      case '💨+💧': result = 'Lluvia (🌧️)'; break;
      case '💨+🔥': result = 'Relámpago (⚡)'; break;
      case '💨+🪨': result = 'Polvo Estelar (✨)'; break;
      default: result = 'Mezcla Inestable 💥 (No se descubrió nada nuevo)';
    }

    if (result.includes('💥')) {
      setLabFeedback(`¡PUM! La mezcla entre ${element1} y ${element2} fue inestable. ¡Prueba otra combinación!`);
    } else {
      setLabFeedback(`¡Éxito! Mezclaste ${element1} y ${element2} y creaste: ${result}`);
      if (!discoveredElements.includes(result)) {
        setDiscoveredElements(prev => [...prev, result]);
      }
    }

    // Reset selectors
    setElement1(null);
    setElement2(null);
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





  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="app-header">
        <div className="brand">
          <img src={logoEditorial} className="brand-logo" alt="Editorial Lluvia de Ideas" />
          <div className="brand-text">
            <h2>Lluvia de Ideas</h2>
            <p>Portal</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav-menu">
          <button 
            className={`nav-link ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveTab('inicio')}
          >
            Inicio
          </button>
          
          {/* Dropdown for Juegos Interactivos */}
          <div className="nav-dropdown-container">
            <button 
              className={`nav-link ${['apps-mate', 'apps-loteria', 'apps-casa'].includes(activeTab) ? 'active' : ''}`}
            >
              Juegos Interactivos ▾
            </button>
            <div className="nav-dropdown">
              <button 
                className={`dropdown-link ${activeTab === 'apps-mate' ? 'active' : ''}`}
                onClick={() => setActiveTab('apps-mate')}
              >
                🧠 Reto Matemático
              </button>
              <button 
                className={`dropdown-link ${activeTab === 'apps-loteria' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('apps-loteria');
                  startLotteryGame();
                }}
              >
                🃏 Lotería de Leyendas
              </button>
              <button 
                className={`dropdown-link ${activeTab === 'apps-casa' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('apps-casa');
                  setSelectedRoom(null);
                  setRiddleFeedback({ type: null, text: '' });
                }}
              >
                🏚️ Casa de Leyendas
              </button>
            </div>
          </div>

          <button 
            className={`nav-link ${activeTab === 'juracan' ? 'active' : ''}`}
            onClick={() => setActiveTab('juracan')}
          >
            Universo de Juracán
          </button>

          <button 
            className={`nav-link ${activeTab === 'laboratorios' ? 'active' : ''}`}
            onClick={() => setActiveTab('laboratorios')}
          >
            Laboratorios
          </button>

          <button 
            className={`nav-link ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            Catálogo
          </button>
        </nav>
        
        {/* Right Header Group (Cart & Hamburger) */}
        <div className="header-right-group">
          {/* Cart Quick Info */}
          <div className="cart-indicator" onClick={() => setActiveTab('productos')}>
            <span className="cart-icon">🛒</span>
            {cart.length > 0 && <span className="cart-badge animate-fade-in">{cart.length}</span>}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div 
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className="mobile-drawer-content card-glass"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="mobile-drawer-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
          
          <button 
            className={`mobile-nav-link ${activeTab === 'inicio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('inicio');
              setIsMobileMenuOpen(false);
            }}
          >
            🏠 Inicio
          </button>
          
          <div className="mobile-dropdown-section">
            <button 
              className="mobile-nav-link mobile-dropdown-trigger"
              onClick={() => setIsMobileJuegosOpen(!isMobileJuegosOpen)}
            >
              🎮 Juegos Interactivos {isMobileJuegosOpen ? '▴' : '▾'}
            </button>
            {isMobileJuegosOpen && (
              <div className="mobile-submenu">
                <button 
                  className={`mobile-sub-link ${activeTab === 'apps-mate' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('apps-mate');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🧠 Reto Matemático
                </button>
                <button 
                  className={`mobile-sub-link ${activeTab === 'apps-loteria' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('apps-loteria');
                    startLotteryGame();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🃏 Lotería de Leyendas
                </button>
                <button 
                  className={`mobile-sub-link ${activeTab === 'apps-casa' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('apps-casa');
                    setSelectedRoom(null);
                    setRiddleFeedback({ type: null, text: '' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  🏚️ Casa de Leyendas
                </button>
              </div>
            )}
          </div>

          <button 
            className={`mobile-nav-link ${activeTab === 'juracan' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('juracan');
              setIsMobileMenuOpen(false);
            }}
          >
            🌪️ Universo de Juracán
          </button>

          <button 
            className={`mobile-nav-link ${activeTab === 'laboratorios' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('laboratorios');
              setIsMobileMenuOpen(false);
            }}
          >
            🧪 Laboratorios
          </button>

          <button 
            className={`mobile-nav-link ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('productos');
              setIsMobileMenuOpen(false);
            }}
          >
            📚 Catálogo
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Tab 1: Inicio (Dashboard / Ecosystem Status) */}
        {activeTab === 'inicio' && (
          <div className="tab-pane animate-fade-in">
            <section className="welcome-hero">
              <h1 className="gradient-text">Jugamos para aprender, aprendemos para crear</h1>
              <p className="subtitle">
                Explora nuestras aplicaciones didácticas interactivas, adquiere material de calidad de la Editorial Lluvia de Ideas y realiza tus transacciones de forma segura.
              </p>
              
              <div className="cta-container">
                <button className="btn btn-primary" onClick={() => setActiveTab('apps-mate')}>
                  Empezar a Jugar 🚀
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('productos')}>
                  Ver Catálogo de Libros 📚
                </button>
              </div>
            </section>

            {/* Minecraft & Lotería Showcase Section */}
            <section className="home-showcase-section minecraft-loteria-grid">
              {/* Lotería Card */}
              <div className="showcase-card loteria-showcase card-glass animate-fade-in">
                <div>
                  <div className="showcase-badge">🧠 Juego Tradicional</div>
                  <h3>Lotería de las Leyendas</h3>
                  <p>
                    Pon a prueba tu conocimiento de la tradición oral guatemalteca. El Sombrerón, La Llorona y La Siguanaba te esperan en este cartón interactivo de 3x3. ¡Gana cantando Lotería!
                  </p>
                </div>
                <div className="card-actions">
                  <button className="btn btn-primary" onClick={() => {
                    setActiveTab('apps-loteria');
                    startLotteryGame();
                  }}>
                    Jugar Lotería Web 🃏
                  </button>
                </div>
              </div>

              {/* Minecraft Server Card */}
              <div className="showcase-card minecraft-showcase card-glass animate-fade-in">
                <div>
                  <div className="showcase-badge mc-badge">⚔️ Servidor Educativo</div>
                  <h3>Universo Minecraft Lluvia de Ideas</h3>
                  <p>
                    ¡Jugamos para aprender en un mundo tridimensional! Únete a nuestro servidor escolar de Minecraft. Construye templos míticos de Juracán, explora biomas fantásticos y aprende colaborativamente.
                  </p>
                </div>
                <div>
                  <div className="mc-connection-panel">
                    <span className="mc-ip-text">mc.lluviadeideaseditorial.com</span>
                    <button 
                      className={`btn-copy ${isCopied ? 'copied' : ''}`} 
                      onClick={copyIPToClipboard}
                      title="Copiar IP del servidor"
                    >
                      {isCopied ? '¡Copiado! ✓' : '📋 Copiar IP'}
                    </button>
                  </div>
                  <div className="card-actions">
                    <a 
                      href="https://mc.lluviadeideaseditorial.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-minecraft"
                    >
                      Entrar al Servidor 🌌
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Cuentos de Leyendas (Interactive Gallery) */}
            <section className="home-showcase-section cuentos-gallery-section">
              <h3 className="section-title text-center">📖 El Estante de los Cuentos (Popol Vuh)</h3>
              <p className="section-subtitle text-center">
                Haz clic en la portada de cada libro interactivo para conocer a las deidades y leyendas ancestrales de nuestra mitología.
              </p>
              
              <div className="cuentos-covers-grid">
                {POPOL_VUH_STORIES.map((story) => (
                  <div 
                    key={story.id} 
                    className="cuento-book-card card-glass" 
                    onClick={() => setActiveStory(story)}
                  >
                    <div className="book-3d-wrapper">
                      <img src={story.image} alt={story.title} className="cuento-book-image" />
                      <div className="book-spine"></div>
                    </div>
                    <h4 className="cuento-book-title">{story.title.split(' (')[0]}</h4>
                    <span className="cuento-book-badge">Ver Leyenda 👁️</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Gateways Grid: Laboratorios & Casa de las Leyendas */}
            <section className="home-showcase-section gateways-grid-section">
              <div className="gateways-grid">
                {/* Laboratorios Card */}
                <div className="gateway-card lab-gateway card-glass">
                  <div className="gateway-header">
                    <span className="gateway-icon">🧪</span>
                    <h3>Laboratorios de Alquimia</h3>
                  </div>
                  <p>
                    ¡Conviértete en un aprendiz de alquimista! Mezcla los elementos primordiales de la naturaleza (Fuego, Agua, Tierra, Aire) para forjar compuestos mágicos y ampliar tu estante personal de descubrimientos científicos.
                  </p>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('laboratorios')}>
                    Entrar al Laboratorio 🔮
                  </button>
                </div>

                {/* Casa de las Leyendas Card */}
                <div className="gateway-card casa-gateway card-glass">
                  <div className="gateway-header">
                    <span className="gateway-icon">🏚️</span>
                    <h3>La Casa de las Leyendas</h3>
                  </div>
                  <p>
                    Una antigua mansión embrujada esconde los relatos del Sombrerón, la Siguanaba y el Cadejo. Recorre cada habitación, resuelve los acertijos cifrados con astucia y libera los mitos de Guatemala.
                  </p>
                  <button className="btn btn-secondary" onClick={() => {
                    setActiveTab('apps-casa');
                    setSelectedRoom(null);
                    setRiddleFeedback({ type: null, text: '' });
                  }}>
                    Explorar la Casa 🗝️
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Tab 2: Juegos - Reto Matemático */}
        {activeTab === 'apps-mate' && (
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
        )}

        {/* Tab 2.2: Juegos - Lotería de Leyendas */}
        {activeTab === 'apps-loteria' && (
          <div className="tab-pane animate-fade-in">
            <section className="game-section">
              <div className="section-intro">
                <span className="badge badge-tertiary">Mesa Didáctica</span>
                <h2 className="gradient-text">Lotería de las Leyendas</h2>
                <p>Escucha las cartas cantadas y marca los personajes mágicos en tu cartón de 3x3.</p>
              </div>

              <div className="loteria-flow-grid">
                
                {/* Deck drawer and actions */}
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

                {/* Player 3x3 Board */}
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
        )}

        {/* Tab 2.3: Juegos - La Casa de las Leyendas */}
        {activeTab === 'apps-casa' && (
          <div className="tab-pane animate-fade-in">
            <section className="game-section">
              <div className="section-intro">
                <span className="badge badge-tertiary">Módulo de Cuentos</span>
                <h2 className="gradient-text">La Casa de las Leyendas</h2>
                <p>Entra a las habitaciones de la mansión colonial, lee las historias y resuelve sus misterios.</p>
              </div>

              <div className="casa-flow-grid">
                
                {/* Rooms selection grid */}
                <div className="rooms-grid">
                  
                  {/* Room 1: Llorona */}
                  <div 
                    className={`room-card card-glass ${selectedRoom === 'llorona' ? 'selected' : ''} ${unlockedRooms.includes('llorona') ? 'unlocked' : ''}`}
                    onClick={() => {
                      setSelectedRoom('llorona');
                      setRiddleFeedback({ type: null, text: '' });
                    }}
                  >
                    <span className="room-icon">👵🌊</span>
                    <h4>Cocina de la Llorona</h4>
                    <span className="room-status-badge">
                      {unlockedRooms.includes('llorona') ? '🔓 Descubierta' : '🔒 Con acertijo'}
                    </span>
                  </div>

                  {/* Room 2: Sombrerón */}
                  <div 
                    className={`room-card card-glass ${selectedRoom === 'sombreron' ? 'selected' : ''} ${unlockedRooms.includes('sombreron') ? 'unlocked' : ''}`}
                    onClick={() => {
                      setSelectedRoom('sombreron');
                      setRiddleFeedback({ type: null, text: '' });
                    }}
                  >
                    <span className="room-icon">🤠🎸</span>
                    <h4>Callejón del Sombrerón</h4>
                    <span className="room-status-badge">
                      {unlockedRooms.includes('sombreron') ? '🔓 Descubierta' : '🔒 Con acertijo'}
                    </span>
                  </div>

                  {/* Room 3: Cadejo */}
                  <div 
                    className={`room-card card-glass ${selectedRoom === 'cadejo' ? 'selected' : ''} ${unlockedRooms.includes('cadejo') ? 'unlocked' : ''}`}
                    onClick={() => {
                      setSelectedRoom('cadejo');
                      setRiddleFeedback({ type: null, text: '' });
                    }}
                  >
                    <span className="room-icon">🐕⚪</span>
                    <h4>Corral del Cadejo</h4>
                    <span className="room-status-badge">
                      {unlockedRooms.includes('cadejo') ? '🔓 Descubierta' : '🔒 Con acertijo'}
                    </span>
                  </div>

                </div>

                {/* Storybook and Riddle Panel */}
                <div className="story-display-panel card-glass">
                  {selectedRoom ? (
                    <div className="story-content animate-fade-in">
                      {selectedRoom === 'llorona' && (
                        <>
                          <div className="story-header">
                            <h3>El Lamento junto al Río</h3>
                            <span className="badge badge-primary">La Llorona</span>
                          </div>
                          <p className="story-text">
                            "Cuenta la leyenda que una mujer vestida de blanco flota sobre las corrientes de agua, suspendida en el aire, buscando desesperadamente los rastros de sus hijos. Sus sollozos erizan la piel de quienes caminan de noche cerca de ríos o fuentes..."
                          </p>
                          
                          <div className="riddle-section">
                            <h4>🔑 Acertijo para liberar la leyenda:</h4>
                            <p className="riddle-prompt">¿Qué elemento líquido de la naturaleza busca siempre la Llorona en sus lamentos?</p>
                          </div>
                        </>
                      )}

                      {selectedRoom === 'sombreron' && (
                        <>
                          <div className="story-header">
                            <h3>Serenata de Plata</h3>
                            <span className="badge badge-primary">El Sombrerón</span>
                          </div>
                          <p className="story-text">
                            "Un hombre pequeño de gran sombrero de fieltro negro recorre las calles oscuras empujando mulas cargadas de carbón. Cuando ve a una joven de cabello largo y ojos hermosos, saca su guitarra y le canta poemas de amor, dejándola en un trance del que no puede despertar..."
                          </p>
                          
                          <div className="riddle-section">
                            <h4>🔑 Acertijo para liberar la leyenda:</h4>
                            <p className="riddle-prompt">¿Qué instrumento de madera y cuerdas lleva siempre consigo el Sombrerón para cantar?</p>
                          </div>
                        </>
                      )}

                      {selectedRoom === 'cadejo' && (
                        <>
                          <div className="story-header">
                            <h3>El Guardián del Silencio</h3>
                            <span className="badge badge-primary">El Cadejo</span>
                          </div>
                          <p className="story-text">
                            "El Cadejo es un perro de pelaje espeso y ojos como brasas encendidas. El Cadejo blanco acompaña amigablemente al caminante honesto y lo defiende de los peligros; en cambio, el negro busca perturbar y asustar a los perdidos..."
                          </p>
                          
                          <div className="riddle-section">
                            <h4>🔑 Acertijo para liberar la leyenda:</h4>
                            <p className="riddle-prompt">¿De qué color es el pelaje del Cadejo bondadoso que protege a los caminantes de noche?</p>
                          </div>
                        </>
                      )}

                      {unlockedRooms.includes(selectedRoom) ? (
                        <div className="unlocked-badge-big animate-bounce">
                          🔓 ¡Leyenda Liberada con éxito! Has aprendido sobre este cuento popular.
                        </div>
                      ) : (
                        <form onSubmit={handleRoomRiddleSubmit} className="riddle-form">
                          <input 
                            type="text"
                            value={riddleAnswer}
                            onChange={(e) => setRiddleAnswer(e.target.value)}
                            placeholder="Escribe tu respuesta aquí..."
                            className="answer-input"
                          />
                          <button type="submit" className="btn btn-primary">
                            Descifrar Llave
                          </button>
                        </form>
                      )}

                      {riddleFeedback.type && (
                        <div className={`feedback-banner ${riddleFeedback.type} animate-fade-in`}>
                          {riddleFeedback.text}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="story-display-placeholder">
                      <span>📖</span>
                      <h3>El Libro Abierto de la Mansión</h3>
                      <p>Selecciona una habitación de la izquierda para abrir el libro de relatos.</p>
                    </div>
                  )}
                </div>

              </div>
            </section>
          </div>
        )}

        {/* Tab 3: Universo de Juracán */}
        {activeTab === 'juracan' && (
          <div className="tab-pane animate-fade-in">
            <section className="game-section">
              <div className="section-intro">
                <span className="badge badge-tertiary">Cosmología Maya</span>
                <h2 className="gradient-text">El Universo de Juracán</h2>
                <p>Explora el mito de la deidad del viento, el corazón del cielo, y experimenta su poder climático.</p>
              </div>

              <div className="juracan-card card-glass">
                <div className="juracan-header">
                  <div className="juracan-brand">
                    <span className="juracan-icon">🌪️</span>
                    <h3>Simulador de Viento Sagrado</h3>
                  </div>
                  <span className="badge badge-primary">Regulador de Fuerza</span>
                </div>

                <div className="wind-simulator-box">
                  <div className="wind-graphics">
                    <div className={`wind-lines speed-${Math.ceil(windStrength / 25)}`}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className={`deity-avatar status-${Math.ceil(windStrength / 25)}`}>
                      {windStrength <= 20 ? '🫁' : windStrength <= 50 ? '🌬️' : windStrength <= 80 ? '⛈️' : '🌀'}
                    </span>
                  </div>
                  
                  <div className="simulator-results">
                    <h4>{getWindStatus(windStrength).title}</h4>
                    <p>{getWindStatus(windStrength).desc}</p>
                  </div>
                </div>

                <div className="slider-control-group">
                  <label>Fuerza del soplido de Juracán: {windStrength}%</label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={windStrength}
                    onChange={(e) => setWindStrength(parseInt(e.target.value))}
                    className="wind-slider"
                  />
                  <div className="slider-labels">
                    <span>Calma</span>
                    <span>Brisa</span>
                    <span>Tormenta</span>
                    <span>Huracán</span>
                  </div>
                </div>

                <div className="juracan-myth-box">
                  <h4>📜 El Mito del Huracán</h4>
                  <p>
                    En el Popol Vuh, **Juracán** (U K'ux Kaj, el Corazón del Cielo) es el dios del viento, la tormenta y el fuego, uno de los creadores del universo. Su aliento dio forma a la tierra emergida de las aguas y desató la gran inundación primordial para moldear a los hombres de maíz. La palabra moderna "huracán" proviene directamente de su nombre sagrado.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 4: Laboratorios */}
        {activeTab === 'laboratorios' && (
          <div className="tab-pane animate-fade-in">
            <section className="game-section">
              <div className="section-intro">
                <span className="badge badge-tertiary">Ciencia Divertida</span>
                <h2 className="gradient-text">Laboratorio de Alquimia</h2>
                <p>Combina dos elementos naturales básicos para catalizar reacciones y descubrir nuevos fenómenos.</p>
              </div>

              <div className="lab-wrapper card-glass">
                <div className="lab-mixing-area">
                  <h3>Mesa de Combinaciones</h3>
                  
                  <div className="mixing-slots">
                    {/* Slot 1 */}
                    <div className="mixing-slot-card">
                      <span className="slot-title">Elemento 1</span>
                      <div className="slot-display">
                        {element1 ? (
                          <div className="selected-element-big animate-bounce">
                            {element1 === '🔥' && '🔥 Fuego'}
                            {element1 === '💧' && '💧 Agua'}
                            {element1 === '🪨' && '🪨 Tierra'}
                            {element1 === '💨' && '💨 Aire'}
                          </div>
                        ) : (
                          <span className="slot-empty-icon">❓</span>
                        )}
                      </div>
                    </div>

                    <span className="mixing-plus">+</span>

                    {/* Slot 2 */}
                    <div className="mixing-slot-card">
                      <span className="slot-title">Elemento 2</span>
                      <div className="slot-display">
                        {element2 ? (
                          <div className="selected-element-big animate-bounce">
                            {element2 === '🔥' && '🔥 Fuego'}
                            {element2 === '💧' && '💧 Agua'}
                            {element2 === '🪨' && '🪨 Tierra'}
                            {element2 === '💨' && '💨 Aire'}
                          </div>
                        ) : (
                          <span className="slot-empty-icon">❓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-large btn-pay" onClick={mixElements} disabled={!element1 || !element2}>
                    ¡Mezclar Elementos! 🧪
                  </button>

                  <div className="lab-feedback-bubble">
                    <p>{labFeedback}</p>
                  </div>
                </div>

                {/* Elements selection dashboard */}
                <div className="lab-selectors-panel">
                  <h4>Elementos Básicos Disponibles</h4>
                  <div className="basic-elements-buttons">
                    <button className="btn btn-secondary" onClick={() => !element1 ? setElement1('🔥') : setElement2('🔥')}>
                      🔥 Fuego
                    </button>
                    <button className="btn btn-secondary" onClick={() => !element1 ? setElement1('💧') : setElement2('💧')}>
                      💧 Agua
                    </button>
                    <button className="btn btn-secondary" onClick={() => !element1 ? setElement1('🪨') : setElement2('🪨')}>
                      🪨 Tierra
                    </button>
                    <button className="btn btn-secondary" onClick={() => !element1 ? setElement1('💨') : setElement2('💨')}>
                      💨 Aire
                    </button>
                  </div>

                  {/* Discovered Shelf */}
                  <div className="discovered-shelf-box">
                    <h4>✨ Tus Descubrimientos ({discoveredElements.length})</h4>
                    {discoveredElements.length > 0 ? (
                      <div className="discovered-badges-grid">
                        {discoveredElements.map((el, idx) => (
                          <span key={idx} className="badge badge-success animate-fade-in">{el}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-shelf-text">Tu estante de descubrimientos está vacío. ¡Haz mezclas para llenarlo!</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 5: Catálogo de Productos */}
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
                    <p className="cart-advisory-text">
                      📧 Escríbenos a <strong>lluviadeideaseditorial@gmail.com</strong> para coordinar la entrega de tus libros.
                    </p>
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

      {/* Popol Vuh Story Modal */}
      {activeStory && (
        <div className="modal-overlay" onClick={() => setActiveStory(null)}>
          <div className="modal-content card-glass animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setActiveStory(null)}
              aria-label="Cerrar detalles del cuento"
            >
              ✕
            </button>
            <div className="modal-grid">
              <div className="modal-left-book">
                <div className="book-3d-showcase">
                  <img src={activeStory.image} alt={activeStory.title} className="modal-book-image" />
                  <div className="book-spine-showcase"></div>
                </div>
              </div>
              <div className="modal-right-info">
                <span className="modal-role-badge">✨ {activeStory.role}</span>
                <h2 className="gradient-text modal-story-title">{activeStory.title}</h2>
                <div className="modal-divider"></div>
                <p className="modal-story-summary">{activeStory.summary}</p>
                <div className="modal-actions-footer">
                  <button className="btn btn-primary" onClick={() => setActiveStory(null)}>
                    Entendido, Seguir Explorando 👍
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
