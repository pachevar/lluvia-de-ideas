import { useState, useEffect } from 'react';
import './NumberSequences.css';

// --------------------------------------------------------------------------
// HELPER FUNCTIONS FOR MATHEMATICAL SEQUENCES
// --------------------------------------------------------------------------

// 1. Fibonacci & Ratio
function getFibonacciSequence(count: number): { index: number; val: number; ratio: number }[] {
  const seq: { index: number; val: number; ratio: number }[] = [];
  let a = 0;
  let b = 1;

  for (let i = 0; i < count; i++) {
    if (i === 0) {
      seq.push({ index: 0, val: 0, ratio: 0 });
    } else if (i === 1) {
      seq.push({ index: 1, val: 1, ratio: 0 });
    } else {
      const next = a + b;
      const r = b !== 0 ? next / b : 0;
      seq.push({ index: i, val: next, ratio: r });
      a = b;
      b = next;
    }
  }
  return seq;
}

// 2. Primes & Sieve
function isPrime(num: number): boolean {
  if (num < 2) return false;
  if (num === 2 || num === 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function getPrimeFactors(num: number): number[] {
  const factors: number[] = [];
  let n = num;
  while (n % 2 === 0) {
    factors.push(2);
    n = n / 2;
  }
  for (let i = 3; i * i <= n; i += 2) {
    while (n % i === 0) {
      factors.push(i);
      n = n / i;
    }
  }
  if (n > 2) factors.push(n);
  return factors;
}

// 3. Look-and-Say Sequence
function getNextLookandSay(str: string): { result: string; breakdown: string } {
  let result = '';
  const breakdownArr: string[] = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i];
    let count = 1;
    while (i + 1 < str.length && str[i + 1] === char) {
      count++;
      i++;
    }
    result += `${count}${char}`;
    breakdownArr.push(`${count} vez "${char}"`);
    i++;
  }

  return { result, breakdown: breakdownArr.join(', ') };
}

function getLookandSaySequence(steps: number): { step: number; val: string; breakdown: string }[] {
  const list: { step: number; val: string; breakdown: string }[] = [
    { step: 1, val: '1', breakdown: 'Semilla inicial' }
  ];
  let current = '1';

  for (let s = 2; s <= steps; s++) {
    const { result, breakdown } = getNextLookandSay(current);
    list.push({ step: s, val: result, breakdown });
    current = result;
  }
  return list;
}

// 4. Collatz Sequence (3n + 1)
function getCollatzSequence(start: number): { step: number; val: number }[] {
  let n = Math.max(1, Math.floor(start));
  const path: { step: number; val: number }[] = [{ step: 0, val: n }];
  let step = 1;

  while (n > 1 && step < 500) {
    if (n % 2 === 0) {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    path.push({ step, val: n });
    step++;
  }
  return path;
}

// 5. Triangular Numbers
function getTriangularSequence(count: number): { n: number; val: number; formula: string }[] {
  const seq: { n: number; val: number; formula: string }[] = [];
  for (let i = 1; i <= count; i++) {
    const val = (i * (i + 1)) / 2;
    seq.push({ n: i, val, formula: `${i} × (${i} + 1) / 2 = ${val}` });
  }
  return seq;
}

// 6. Pascal Triangle
function getPascalTriangle(rows: number): number[][] {
  const triangle: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [1];
    for (let j = 1; j < i; j++) {
      row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
    }
    if (i > 0) row.push(1);
    triangle.push(row);
  }
  return triangle;
}

export default function NumberSequences() {
  const [activeTab, setActiveTab] = useState<'fibonacci' | 'primes' | 'lookandsay' | 'collatz' | 'triangular' | 'pascal'>('fibonacci');

  // --- TAB 1: FIBONACCI STATE ---
  const [fibCount, setFibCount] = useState<number>(14);
  const [fibQuizInput, setFibQuizInput] = useState<string>('');
  const [fibQuizStatus, setFibQuizStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // --- TAB 2: PRIMES STATE ---
  const [primeInput, setPrimeInput] = useState<number>(97);
  const [sieveStepPrime, setSieveStepPrime] = useState<number>(0); // 0 = all, 2, 3, 5, 7

  // --- TAB 3: LOOK AND SAY STATE ---
  const [lookCount, setLookCount] = useState<number>(7);
  const [customLookInput, setCustomLookInput] = useState<string>('1211');

  // --- TAB 4: COLLATZ STATE ---
  const [collatzStart, setCollatzStart] = useState<number>(27);

  // --- TAB 5: TRIANGULAR STATE ---
  const [triangularN, setTriangularN] = useState<number>(6);

  // --- TAB 6: PASCAL STATE ---
  const [pascalRows] = useState<number>(9);
  const [pascalHighlight, setPascalHighlight] = useState<'none' | 'triangular' | 'evenodd'>('none');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const fibSeq = getFibonacciSequence(fibCount);
  const collatzSeq = getCollatzSequence(collatzStart);
  const maxCollatzVal = Math.max(...collatzSeq.map(p => p.val));
  const collatzStepsCount = collatzSeq.length - 1;

  // Check Fibonacci Quiz
  const handleCheckFibQuiz = () => {
    if (fibQuizInput.trim() === '21') {
      setFibQuizStatus('correct');
    } else {
      setFibQuizStatus('wrong');
    }
  };

  return (
    <div className="seq-page-container animate-fade-in">
      <div className="seq-content-wrapper">
        
        {/* ENCABEZADO PRINCIPAL DE LA SECCIÓN */}
        <header className="seq-header">
          <span className="seq-badge">🔢 MATEMÁTICAS INTERACTIVAS & PATRONES MATEMÁTICOS</span>
          <h1 className="seq-title">Laboratorio Interactivo de Secuencias Numéricas</h1>
          <p className="seq-subtitle">
            Descubre la belleza oculta de las matemáticas. Explora patrones naturales, secuencias infinitas y experimentos gráficos interactivos.
          </p>

          {/* BARRA DE NAVEGACIÓN POR PESTAÑAS */}
          <nav className="seq-nav-tabs">
            <button className={`seq-tab-btn ${activeTab === 'fibonacci' ? 'active' : ''}`} onClick={() => setActiveTab('fibonacci')}>
              🌀 Fibonacci & Espiral
            </button>
            <button className={`seq-tab-btn ${activeTab === 'primes' ? 'active' : ''}`} onClick={() => setActiveTab('primes')}>
              🧱 Primos & Criba
            </button>
            <button className={`seq-tab-btn ${activeTab === 'lookandsay' ? 'active' : ''}`} onClick={() => setActiveTab('lookandsay')}>
              🗣️ Mira y Di
            </button>
            <button className={`seq-tab-btn ${activeTab === 'collatz' ? 'active' : ''}`} onClick={() => setActiveTab('collatz')}>
              📉 Conjetura de Collatz
            </button>
            <button className={`seq-tab-btn ${activeTab === 'triangular' ? 'active' : ''}`} onClick={() => setActiveTab('triangular')}>
              📐 Números Triangulares
            </button>
            <button className={`seq-tab-btn ${activeTab === 'pascal' ? 'active' : ''}`} onClick={() => setActiveTab('pascal')}>
              🔺 Triángulo de Pascal
            </button>
          </nav>
        </header>

        {/* =========================================================
            PESTAÑA 1: FIBONACCI & LA ESPIRAL DORADA
           ========================================================= */}
        {activeTab === 'fibonacci' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-gold">🌀 Secuencia de Fibonacci & La Proporción Áurea</span>
              <h2>El Código Secreto de la Naturaleza</h2>
              <p>
                Cada término es la suma de los dos anteriores: <code>F(n) = F(n-1) + F(n-2)</code>. A medida que avanza la serie, la división entre dos términos consecutivos se aproxima de manera exacta al <strong>Número Áureo (Φ ≈ 1.618033)</strong>, presente en girasoles, galaxias y piñas de pino.
              </p>
            </div>

            {/* Controles de Generación */}
            <div className="seq-controls-row">
              <label>Cantidad de Términos a Generar: <strong>{fibCount}</strong></label>
              <input 
                type="range" min="5" max="22" value={fibCount} 
                onChange={(e) => setFibCount(parseInt(e.target.value))} 
                className="seq-range-slider"
              />
            </div>

            {/* Muestra de la Serie con Indicador de Proporción Áurea */}
            <div className="fib-sequence-chips-wrapper">
              {fibSeq.map((item) => (
                <div key={item.index} className="fib-chip">
                  <span className="fib-idx">F({item.index})</span>
                  <span className="fib-val">{item.val.toLocaleString('es-GT')}</span>
                  {item.ratio > 0 && (
                    <span className="fib-ratio">Ratio: {item.ratio.toFixed(4)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* VISUALIZADOR SVG DE LA ESPIRAL DORADA ÁUREA */}
            <div className="fib-spiral-box">
              <h3>🎨 Visualizador Gráfico de la Espiral Dorada en SVG</h3>
              <p className="box-sub">Trazado de los rectángulos áureos proporcionales a la serie de Fibonacci:</p>
              
              <div className="spiral-svg-container">
                <svg viewBox="0 0 600 380" className="spiral-svg">
                  <defs>
                    <linearGradient id="golden-spiral-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>

                  {/* Rectángulos Áureos Geométricos */}
                  <g stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none">
                    <rect x="180" y="90" width="200" height="200" fill="rgba(245, 158, 11, 0.08)" />
                    <rect x="380" y="90" width="120" height="120" fill="rgba(56, 189, 248, 0.08)" />
                    <rect x="420" y="210" width="80" height="80" fill="rgba(168, 85, 247, 0.08)" />
                    <rect x="380" y="240" width="50" height="50" fill="rgba(236, 72, 153, 0.08)" />
                  </g>

                  {/* Arco Continuo de la Espiral Logarítmica de Fibonacci */}
                  <path
                    d="M 180 290 A 200 200 0 0 1 380 90 A 120 120 0 0 1 500 210 A 80 80 0 0 1 420 290 A 50 50 0 0 1 380 240"
                    fill="none"
                    stroke="url(#golden-spiral-grad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animated-golden-spiral-path"
                  />

                  <circle cx="380" cy="240" r="6" fill="#fbbf24" />
                  <text x="380" y="270" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">Centro Áureo (Φ)</text>
                </svg>
              </div>
            </div>

            {/* JUEGO / PRÁCTICA INTERACTIVA */}
            <div className="seq-quiz-box">
              <h4>🎯 Desafío Práctico de Fibonacci</h4>
              <p>Dada la secuencia: <code>0, 1, 1, 2, 3, 5, 8, 13, ...</code> ¿Cuál es el número exacto que sigue?</p>
              <div className="quiz-input-row">
                <input 
                  type="text" 
                  placeholder="Escribe tu respuesta..." 
                  value={fibQuizInput} 
                  onChange={(e) => setFibQuizInput(e.target.value)} 
                  className="seq-text-input"
                />
                <button className="seq-action-btn" onClick={handleCheckFibQuiz}>Verificar Respuesta</button>
              </div>
              {fibQuizStatus === 'correct' && (
                <div className="quiz-alert alert-success">¡Excelente! 🎉 8 + 13 = 21. ¡Has dominado la regla de Fibonacci!</div>
              )}
              {fibQuizStatus === 'wrong' && (
                <div className="quiz-alert alert-danger">Inténtalo de nuevo. Pista: Suma los dos últimos números (8 + 13).</div>
              )}
            </div>
          </section>
        )}

        {/* =========================================================
            PESTAÑA 2: NÚMEROS PRIMOS & LA CRIBA DE ERATÓSTENES
           ========================================================= */}
        {activeTab === 'primes' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-cyan">🧱 Números Primos & La Criba de Eratóstenes</span>
              <h2>Los Átomos Fundamentales de las Matemáticas</h2>
              <p>
                Un número primo es un entero mayor que 1 que solo es divisible por 1 y por sí mismo. La <strong>Criba de Eratóstenes</strong> es un algoritmo milenario inventado en la Grecia Antigua para filtrar los números compuestos eliminando sus múltiplos.
              </p>
            </div>

            {/* Controles de Filtro de la Criba */}
            <div className="sieve-controls-bar">
              <span className="sieve-label">Filtro de Múltiplos Pasos:</span>
              {[
                { step: 0, label: 'Mostrar Todos (1-100)' },
                { step: 2, label: 'Tachar Múltiplos de 2' },
                { step: 3, label: 'Tachar Múltiplos de 3' },
                { step: 5, label: 'Tachar Múltiplos de 5' },
                { step: 7, label: 'Tachar Múltiplos de 7' }
              ].map((btn) => (
                <button
                  key={btn.step}
                  className={`seq-chip-btn ${sieveStepPrime === btn.step ? 'active' : ''}`}
                  onClick={() => setSieveStepPrime(btn.step)}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* GRILLA INTERACTIVA DE 1 A 100 */}
            <div className="sieve-grid-container">
              {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
                const primeFlag = isPrime(n);
                let isFilteredOut = false;
                let colorClass = '';

                if (n === 1) isFilteredOut = true;
                if (sieveStepPrime >= 2 && n > 2 && n % 2 === 0) isFilteredOut = true;
                if (sieveStepPrime >= 3 && n > 3 && n % 3 === 0) isFilteredOut = true;
                if (sieveStepPrime >= 5 && n > 5 && n % 5 === 0) isFilteredOut = true;
                if (sieveStepPrime >= 7 && n > 7 && n % 7 === 0) isFilteredOut = true;

                if (primeFlag) colorClass = 'cell-prime';
                else if (isFilteredOut) colorClass = 'cell-filtered';

                return (
                  <div key={n} className={`sieve-cell ${colorClass}`}>
                    <span className="cell-num">{n}</span>
                    {primeFlag && <span className="cell-badge">PRIMO</span>}
                  </div>
                );
              })}
            </div>

            {/* VERIFICADOR E INVESTIGADOR DE PRIMALIDAD */}
            <div className="seq-checker-box">
              <h3>🔍 Analizador Instantáneo de Primalidad & Factorización</h3>
              <p>Ingresa cualquier número entero para comprobar si es Primo o ver su descomposición en factores primos:</p>
              
              <div className="checker-input-row">
                <input 
                  type="number" min="2" max="999999" 
                  value={primeInput} 
                  onChange={(e) => setPrimeInput(parseInt(e.target.value) || 2)}
                  className="seq-number-input"
                />
              </div>

              {(() => {
                const primeResult = isPrime(primeInput);
                const factors = getPrimeFactors(primeInput);

                return (
                  <div className="checker-result-card">
                    {primeResult ? (
                      <div className="prime-status-badge is-prime">
                        ✨ <strong>{primeInput} es un NÚMERO PRIMO</strong>. No tiene otros divisores además de 1 y {primeInput}.
                      </div>
                    ) : (
                      <div className="prime-status-badge is-composite">
                        🧩 <strong>{primeInput} es un NÚMERO COMPUESTO</strong>. 
                        <br />Descomposición en factores primos: <strong>{factors.join(' × ')}</strong>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* =========================================================
            PESTAÑA 3: SECUENCIA MIRA Y DI (LOOK-AND-SAY)
           ========================================================= */}
        {activeTab === 'lookandsay' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-purple">🗣️ Secuencia "Mira y Di" (Look-and-Say)</span>
              <h2>El Juego Lingüístico Matemático de John Conway</h2>
              <p>
                Inventada por el legendario matemático John Conway. Cada número se genera leyendo en voz alta los bloques de dígitos repetidos de la cifra anterior. Por ejemplo: <code>1211</code> se lee como "un uno, un dos, dos unos" → <code>111221</code>.
              </p>
            </div>

            {/* Selector de Niveles */}
            <div className="seq-controls-row">
              <label>Pasos de Iteración a Mostrar: <strong>{lookCount}</strong></label>
              <input 
                type="range" min="3" max="10" value={lookCount} 
                onChange={(e) => setLookCount(parseInt(e.target.value))} 
                className="seq-range-slider"
              />
            </div>

            {/* MUESTRA PASO A PASO DE LA SECUENCIA DE CONWAY */}
            <div className="lookandsay-table-box">
              {getLookandSaySequence(lookCount).map((item) => (
                <div key={item.step} className="look-row-item">
                  <span className="look-step">Paso {item.step}</span>
                  <code className="look-val">{item.val}</code>
                  <span className="look-breakdown">🔍 Se lee: <strong>{item.breakdown}</strong></span>
                </div>
              ))}
            </div>

            {/* TRADUCTOR HUMANO MIRA Y DI */}
            <div className="seq-checker-box" style={{ marginTop: '24px' }}>
              <h3>🗣️ Traductor de Cifras a "Mira y Di"</h3>
              <p>Escribe cualquier secuencia de dígitos para ver cómo se traduciría en la siguiente iteración:</p>
              
              <div className="checker-input-row">
                <input 
                  type="text" 
                  value={customLookInput} 
                  onChange={(e) => setCustomLookInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="seq-text-input"
                  placeholder="Ej. 111221"
                />
              </div>

              {customLookInput && (() => {
                const { result, breakdown } = getNextLookandSay(customLookInput);
                return (
                  <div className="look-result-display">
                    <div className="look-res-line">Lectura Fonética: <strong>{breakdown}</strong></div>
                    <div className="look-res-line main">Resultado Generado: <code>{result}</code></div>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* =========================================================
            PESTAÑA 4: CONJETURA DE COLLATZ (3n + 1)
           ========================================================= */}
        {activeTab === 'collatz' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-pink">📉 Conjetura de Collatz (El Problema 3n + 1)</span>
              <h2>El Enigma del Granizo Inacabado</h2>
              <p>
                Toma cualquier número entero positivo $n$. Si es <strong>par</strong>, divídelo entre 2 (n/2). Si es <strong>impar</strong>, multiplícalo por 3 y súmale 1 (3n+1). La conjetura afirma que, sin importar con qué número comiences, <strong>siempre caerás en el bucle infinito 4 → 2 → 1</strong>.
              </p>
            </div>

            {/* Control de Semilla Inicial */}
            <div className="seq-controls-row">
              <label>Número Semilla Inicial (n): <strong>{collatzStart}</strong></label>
              <input 
                type="number" min="1" max="10000" value={collatzStart} 
                onChange={(e) => setCollatzStart(parseInt(e.target.value) || 1)} 
                className="seq-number-input"
              />
              <div className="preset-seeds">
                <span className="preset-label">Probar Semillas Famosas:</span>
                {[7, 27, 97, 871].map(seed => (
                  <button key={seed} className="seq-chip-btn" onClick={() => setCollatzStart(seed)}>
                    {seed}
                  </button>
                ))}
              </div>
            </div>

            {/* DASHBOARD DE MÉTRICAS DE COLLATZ */}
            <div className="collatz-stats-grid">
              <div className="collatz-stat-card">
                <span className="c-label">Número Inicial</span>
                <span className="c-val">{collatzStart}</span>
              </div>
              <div className="collatz-stat-card highlight-pink">
                <span className="c-label">Pico Máximo Alcanzado</span>
                <span className="c-val">{maxCollatzVal.toLocaleString('es-GT')}</span>
              </div>
              <div className="collatz-stat-card highlight-blue">
                <span className="c-label">Total de Pasos hasta 1</span>
                <span className="c-val">{collatzStepsCount} pasos</span>
              </div>
            </div>

            {/* GRÁFICO SVG DE TRAYECTORIA DEL GRANIZO (HAILSTONE PATH) */}
            <div className="collatz-graph-box">
              <h3>📊 Gráfico de la Trayectoria del Granizo (Hailstone Graph)</h3>
              <p className="box-sub">Visualización del ascenso y caída en picada de los valores hacia el pozo de atracción 1:</p>
              
              <div className="collatz-svg-wrapper">
                <svg viewBox="0 0 850 240" className="collatz-svg">
                  <defs>
                    <linearGradient id="collatz-line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>

                  {/* Ejes y Cuadrícula */}
                  <line x1="40" y1="20" x2="40" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="40" y1="210" x2="830" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* Puntos y Líneas de Trayectoria */}
                  {(() => {
                    const width = 780;
                    const height = 180;
                    const count = collatzSeq.length;
                    const points = collatzSeq.map((p, i) => {
                      const x = 50 + (i / Math.max(1, count - 1)) * width;
                      const y = 200 - (p.val / maxCollatzVal) * height;
                      return { x, y, val: p.val, step: p.step };
                    });

                    const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

                    return (
                      <g>
                        <polyline points={polylineStr} fill="none" stroke="url(#collatz-line-grad)" strokeWidth="3" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r={count > 50 ? 2 : 4} fill="#ec4899" />
                            {i === points.length - 1 && (
                              <text x={p.x} y={p.y - 10} fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">¡Aterrizó en 1!</text>
                            )}
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            PESTAÑA 5: NÚMEROS TRIANGULARES & GEOMETRÍA
           ========================================================= */}
        {activeTab === 'triangular' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-blue">📐 Números Triangulares & Geometría de Gauss</span>
              <h2>Canicas, Pirámides y la Fórmula de Gauss</h2>
              <p>
                Un número triangular T(n) representa la cantidad de puntos necesarios para formar un triángulo equilátero perfecto de lado n. Se calcula sumando todos los enteros desde 1 hasta n: <code>T(n) = n × (n + 1) / 2</code>.
              </p>
            </div>

            {/* Selector de Nivel Triangular */}
            <div className="seq-controls-row">
              <label>Nivel del Triángulo (n): <strong>{triangularN}</strong></label>
              <input 
                type="range" min="1" max="12" value={triangularN} 
                onChange={(e) => setTriangularN(parseInt(e.target.value))} 
                className="seq-range-slider"
              />
            </div>

            {/* MUESTRA GRÁFICA GEOMÉTRICA DE PUNTOS EN TRIÁNGULO */}
            <div className="triangular-dots-display-card">
              <h3>🟡 Disposición Geométrica de Canicas (T_{triangularN})</h3>
              <p className="box-sub">Total de canicas acumuladas: <strong>{(triangularN * (triangularN + 1)) / 2}</strong></p>

              <div className="fib-sequence-chips-wrapper" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                {getTriangularSequence(triangularN).map((t) => (
                  <div key={t.n} className="fib-chip">
                    <span className="fib-idx">T({t.n})</span>
                    <span className="fib-val">{t.val}</span>
                  </div>
                ))}
              </div>

              <div className="dots-triangle-canvas">
                {Array.from({ length: triangularN }, (_, rowIdx) => {
                  const dotsInRow = rowIdx + 1;
                  return (
                    <div key={rowIdx} className="dots-row">
                      {Array.from({ length: dotsInRow }, (_, dotIdx) => (
                        <div key={dotIdx} className="marble-dot" title={`Fila ${dotsInRow}, Canica ${dotIdx + 1}`}></div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPLICACIÓN DE LA FÓRMULA DE GAUSS */}
            <div className="gauss-formula-box">
              <h3>⚡ El Genio de Carl Friedrich Gauss</h3>
              <p>
                A la edad de 9 años, Gauss sorprendió a su maestro al sumar los números del 1 al 100 en segundos emparejando los extremos: (1+100) + (2+99) + (3+98)... = 50 × 101 = 5050.
              </p>
              <div className="gauss-math-card">
                <span>Fórmula rápida:</span>
                <code>T_{triangularN} = {triangularN} × ({triangularN} + 1) / 2 = <strong>{(triangularN * (triangularN + 1)) / 2}</strong></code>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            PESTAÑA 6: TRIÁNGULO DE PASCAL & PATRONES OCULTOS
           ========================================================= */}
        {activeTab === 'pascal' && (
          <section className="seq-card animate-fade-in">
            <div className="seq-card-header">
              <span className="card-tag tag-purple">🔺 Triángulo de Pascal & Patrones Ocultos</span>
              <h2>El Tesoro Oculto de la Combinatoria</h2>
              <p>
                Cada número del triángulo se obtiene sumando los dos números superiores sobre él. Dentro de esta pirámide se ocultan <strong>números triangulares, fractales de Sierpinski y la secuencia de Fibonacci</strong>.
              </p>
            </div>

            {/* Selector de Resaltado de Patrones */}
            <div className="sieve-controls-bar">
              <span className="sieve-label">Resaltar Patrón Oculto:</span>
              {[
                { id: 'none', label: 'Ver Todo Limpio' },
                { id: 'triangular', label: '📐 Diagonales Triangulares' },
                { id: 'evenodd', label: '🎨 Pares vs Impares (Fractal Sierpinski)' }
              ].map(btn => (
                <button
                  key={btn.id}
                  className={`seq-chip-btn ${pascalHighlight === btn.id ? 'active' : ''}`}
                  onClick={() => setPascalHighlight(btn.id as 'none' | 'triangular' | 'evenodd')}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* RENDERING DEL TRIÁNGULO DE PASCAL PIRAMIDAL */}
            <div className="pascal-pyramid-container">
              {getPascalTriangle(pascalRows).map((row, rIdx) => (
                <div key={rIdx} className="pascal-row">
                  {row.map((val, cIdx) => {
                    let highlightClass = '';
                    if (pascalHighlight === 'triangular' && cIdx === 2) {
                      highlightClass = 'highlight-gold';
                    } else if (pascalHighlight === 'evenodd') {
                      highlightClass = val % 2 === 0 ? 'highlight-even' : 'highlight-odd';
                    }

                    return (
                      <div key={cIdx} className={`pascal-cell ${highlightClass}`}>
                        {val}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
