import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodigoDocente.css';

interface PrincipleItem {
  id: string;
  icon: string;
  title: string;
  tag: string;
  description: string;
  classroomExample: string;
  suggestedPrompt: string;
}

interface PillarSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  items: PrincipleItem[];
}

export default function CodigoDocente() {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<string>('perfil');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Self-assessment state
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [showAssessmentResult, setShowAssessmentResult] = useState<boolean>(false);

  const pillars: PillarSection[] = [
    {
      id: 'perfil',
      title: '1. Perfil del Maestro Contemporáneo',
      subtitle: 'La nueva identidad del docente como curador, co-aprendiz y modelo ético.',
      icon: '👨‍🏫',
      color: '#fb7185',
      badge: 'IDENTIDAD DOCENTE',
      items: [
        {
          id: 'perfil-1',
          icon: '🧭',
          title: 'Facilitador y Curador',
          tag: 'Diseño de Rutas',
          description: 'Diseña rutas pedagógicas personalizadas, filtrando el ruido digital para guiar a los alumnos hacia fuentes rigurosas y valiosas.',
          classroomExample: 'Curar una colección de 3 artículos científicos e investigaciones validadas para que los alumnos comparen las alucinaciones de la IA contra datos reales.',
          suggestedPrompt: 'Actúa como curador educativo. Sugiere 3 fuentes primarias rigurosas y un dilema ético para enseñar el tema [Insertar Tema] a estudiantes de nivel secundario.'
        },
        {
          id: 'perfil-2',
          icon: '🤝',
          title: 'Co-aprendiz Tecnológico',
          tag: 'Curiosidad Compartida',
          description: 'Acepta que no lo sabe todo, adopta una postura de curiosidad compartida e integra las herramientas de IA en el aula sin temor a experimentar.',
          classroomExample: 'Realizar sesiones de "Laboratorio de Prompts" donde docentes y estudiantes prueban preguntas a la IA en vivo y analizan sus aciertos y errores juntos.',
          suggestedPrompt: 'Genera 3 experimentos prácticos de aula donde el docente y los alumnos investiguen juntos las limitaciones de la IA en [Materia].'
        },
        {
          id: 'perfil-3',
          icon: '🛡️',
          title: 'Modelo de Ética y Pensamiento Crítico',
          tag: 'Rigor & Responsabilidad',
          description: 'Muestra cómo cuestionar las alucinaciones o sesgos de los algoritmos y enseña a interactuar con la tecnología con responsabilidad social y rigor conceptual.',
          classroomExample: 'Analizar cómo un modelo de IA responde sobre la historia local e identificar sesgos culturales u omisiones históricas.',
          suggestedPrompt: 'Identifica 5 posibles sesgos o sesgos informativos que un modelo de IA podría generar al responder sobre [Tema Histórico/Social].'
        }
      ]
    },
    {
      id: 'provocar',
      title: '2. Qué Debe Provocar',
      subtitle: 'Las actitudes cognitivas y emocionales que transforman el aprendizaje en el aula.',
      icon: '🔥',
      color: '#f97316',
      badge: 'IMPACTO COGNITIVO',
      items: [
        {
          id: 'provocar-1',
          icon: '💡',
          title: 'Asombro y Curiosidad Cognitiva',
          tag: 'Preguntas Complejas',
          description: 'Formulando preguntas complejas y dilemas del mundo real que la IA no puede resolver de forma mecánica.',
          classroomExample: 'Plantear preguntas socráticas: "¿Puede un algoritmo sentir compasión? ¿Qué hace que una decisión sea justa en un sistema automatizado?"',
          suggestedPrompt: 'Dame 3 dilemas éticos y filosóficos profundos sobre [Tema] que requieran empatía humana y no puedan resolverse solo con lógica matemática.'
        },
        {
          id: 'provocar-2',
          icon: '🔍',
          title: 'Juicio Crítico y Escepticismo Informado',
          tag: 'Auditoría de Datos',
          description: 'Incentivando a los estudiantes a contrastar, auditar y verificar la información generada por modelos automatizados.',
          classroomExample: 'Entregar un texto generado por IA que contiene 2 errores de hecho sutiles y pedir a los alumnos que actúen como "Auditores de Verdad".',
          suggestedPrompt: 'Crea un texto explicativo de 200 palabras sobre [Tema] e incluye 2 inconsistencias sutiles para un ejercicio de verificación con estudiantes.'
        },
        {
          id: 'provocar-3',
          icon: '🎨',
          title: 'Creatividad Estratégica e Interdisciplinar',
          tag: 'Conexión de Campos',
          description: 'Motivando a conectar ideas de distintos campos (arte, ciencia, humanidades) para generar soluciones originales.',
          classroomExample: 'Diseñar un proyecto que combine música maya ancestral con principios matemáticos de acústica y narración digital.',
          suggestedPrompt: '¿Cómo puedo conectar [Materia A] con [Materia B] en un proyecto creativo donde los alumnos usen IA para diseñar una solución comunitaria?'
        },
        {
          id: 'provocar-4',
          icon: '🚀',
          title: 'Agencia y Autonomía',
          tag: 'Meta-aprendizaje',
          description: 'Impulsando al alumno a ser dueño de su proceso de aprendizaje (meta-aprendizaje), utilizando la IA como un tutor personal y no como un atajo para evitar el esfuerzo mental.',
          classroomExample: 'Pedir a los estudiantes que usen la IA para explicarles un concepto complejo con 3 analogías diferentes hasta que elijan la que mejor comprenden.',
          suggestedPrompt: 'Actúa como un tutor socrático. No me des las respuestas directamente; hazme preguntas clave para ayudarme a descubrir la solución de [Problema].'
        }
      ]
    },
    {
      id: 'proveer',
      title: '3. Qué Debe Proveer',
      subtitle: 'Los entornos y andamiajes humanos que la tecnología no puede reemplazar.',
      icon: '🤝',
      color: '#c084fc',
      badge: 'ENTORNO & RECURSOS',
      items: [
        {
          id: 'proveer-1',
          icon: '❤️',
          title: 'Espacios de Humanidad y Empatía',
          tag: 'Conexión Humana',
          description: 'Vulnerabilidad, escucha activa, contención emocional y desarrollo de habilidades socioemocionales que los algoritmos no pueden reemplazar.',
          classroomExample: 'Círculos de diálogo matutinos antes de la jornada tecnológica para compartir estados de ánimo, metas personales y reflexiones.',
          suggestedPrompt: 'Diseña una dinámica de inicio de clase de 10 minutos enfocada en la escucha activa y contención emocional entre pares.'
        },
        {
          id: 'proveer-2',
          icon: '📝',
          title: 'Retroalimentación Cualitativa y Significativa',
          tag: 'Proceso & Intención',
          description: 'Comentarios centrados en la intención, el proceso creativo, la ética y la profundización de ideas.',
          classroomExample: 'Evaluación formativa mediante rúbricas donde el 70% del valor recae en la justificación del proceso y la iteración del pensamiento.',
          suggestedPrompt: 'Proporciona una rúbrica de evaluación formativa de 4 niveles centrada en el proceso de investigación, la honestidad académica y la creatividad.'
        },
        {
          id: 'proveer-3',
          icon: '👥',
          title: 'Entornos de Colaboración Real',
          tag: 'Interacción Cara a Cara',
          description: 'Trabajos en equipo, debates presenciales, proyectos comunitarios y dinámicas donde la interacción cara a cara sea el núcleo.',
          classroomExample: 'Debates en formato de foro público donde cada equipo debe defender su postura utilizando evidencia científica y empatía comunitaria.',
          suggestedPrompt: 'Estructura un debate presencial paso a paso sobre [Tema Polémico] con roles asignados y tiempos de réplica.'
        },
        {
          id: 'proveer-4',
          icon: '🏗️',
          title: 'Andamiaje para la Coexistencia Digital',
          tag: 'Prompting & Citación',
          description: 'Guías claras sobre cómo redactar instrucciones efectivas (prompting), evaluar sesgos éticos y citar el uso de herramientas inteligentes.',
          classroomExample: 'Crear una "Declaración de Transparencia de IA" en cada entrega académica, detallando qué herramientas se usaron y qué prompts se formularon.',
          suggestedPrompt: 'Crea una plantilla de "Bitácora de Uso de IA" para que los estudiantes documenten qué prompts usaron, qué respuestas obtuvieron y cómo las verificaron.'
        }
      ]
    },
    {
      id: 'prepararse',
      title: '4. Cómo Debe Prepararse',
      subtitle: 'La capacitación continua y evolución metodológica requerida por el docente del presente.',
      icon: '⚡',
      color: '#38bdf8',
      badge: 'FORMACIÓN DOCENTE',
      items: [
        {
          id: 'prepararse-1',
          icon: '🤖',
          title: 'Alfabetización en Inteligencia Artificial',
          tag: 'LLMs & Prompting',
          description: 'Entender la lógica básica de los modelos de lenguaje (LLM) y la IA generativa para comprender sus alcances y limitaciones. Dominar la ingeniería de prompts para optimizar la planificación de clases, la creación de materiales educativos y la evaluación.',
          classroomExample: 'Diseñar planes de clase en minutos utilizando prompts de rol, contexto, formato e instrucciones de límite.',
          suggestedPrompt: 'Actúa como diseñador instruccional experto. Diseña una secuencia didáctica de 3 sesiones para [Tema] usando el modelo de Aprendizaje Basado en Proyectos.'
        },
        {
          id: 'prepararse-2',
          icon: '🎯',
          title: 'Evolución de la Evaluación y Pedagogía',
          tag: 'ABP & Flipped Classroom',
          description: 'Transitar de exámenes memorísticos o ensayos tradicionales hacia evaluaciones basadas en procesos, proyectos reales, defensas orales y resolución de problemas. Adoptar marcos pedagógicos como el Aprendizaje Basado en Problemas (ABP) o la Clase Invertida (Flipped Classroom).',
          classroomExample: 'Reemplazar exámenes escritos individuales por defensas orales de proyectos con paneles de evaluación de la comunidad.',
          suggestedPrompt: 'Transforma esta evaluación memorística tradicional sobre [Tema] en una actividad evaluativa basada en resolución de problemas reales.'
        },
        {
          id: 'prepararse-3',
          icon: '🧠',
          title: 'Flexibilidad Neurocognitiva y Actualización Continua',
          tag: 'Neuroeducación & Mindset',
          description: 'Comprender los principios básicos de la neuroeducación para saber cómo aprende el cerebro cuando interactúa con estímulos digitales. Mantener una mentalidad de crecimiento (growth mindset) frente al ritmo acelerado de las innovaciones tecnológicas.',
          classroomExample: 'Diseñar pausas activas neurocognitivas de 3 minutos cada 25 minutos de trabajo digital para favorecer la memoria de trabajo y atención focalizada.',
          suggestedPrompt: 'Dame 5 estrategias basadas en neuroeducación para mantener la atención sostenida de mis alumnos durante clases con herramientas digitales.'
        }
      ]
    }
  ];

  const currentPillar = pillars.find(p => p.id === activePillar) || pillars[0];

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleChecklistToggle = (id: string) => {
    setCheckedChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalChecklistItems = 14;
  const checkedCount = Object.values(checkedChecklist).filter(Boolean).length;
  const scorePercent = Math.round((checkedCount / totalChecklistItems) * 100);

  return (
    <div className="codigo-docente-wrapper animate-fade-in">
      
      {/* Top Banner Header */}
      <header className="codigo-docente-header">
        <div className="codigo-docente-header-content">
          <div className="header-badge-row">
            <span className="badge-pill-glowing">📜 MARCO PEDAGÓGICO DE VANGUARDIA</span>
            <button className="btn-back-landing" onClick={() => navigate('/')}>
              🏠 Inicio
            </button>
          </div>
          <h1 className="codigo-main-title">
            El <span className="highlight-text-crimson">Código Docente</span>
          </h1>
          <p className="codigo-main-desc">
            Manifiesto y guía interactiva de principios, actitudes y competencias esenciales para el docente contemporáneo en la era del aprendizaje potenciado por la Inteligencia Artificial.
          </p>

          {/* Quick Metrics Bar */}
          <div className="codigo-stats-bar">
            <div className="stat-metric-card">
              <span className="metric-number">4</span>
              <span className="metric-label">Pilares Clave</span>
            </div>
            <div className="stat-metric-card">
              <span className="metric-number">14</span>
              <span className="metric-label">Competencias</span>
            </div>
            <div className="stat-metric-card">
              <span className="metric-number">100%</span>
              <span className="metric-label">Enfoque Humano</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="codigo-main-container">
        
        {/* Navigation Tabs for the 4 Pillars */}
        <nav className="pillars-tab-nav" aria-label="Navegación de pilares del Código Docente">
          {pillars.map((pillar) => (
            <button
              key={pillar.id}
              className={`pillar-tab-btn ${activePillar === pillar.id ? 'active' : ''}`}
              onClick={() => setActivePillar(pillar.id)}
              style={{
                borderColor: activePillar === pillar.id ? pillar.color : 'transparent'
              }}
            >
              <span className="pillar-tab-icon">{pillar.icon}</span>
              <div className="pillar-tab-text">
                <span className="pillar-tab-badge" style={{ color: pillar.color }}>{pillar.badge}</span>
                <strong className="pillar-tab-title">{pillar.title.split('. ')[1]}</strong>
              </div>
            </button>
          ))}
        </nav>

        {/* Selected Pillar Header */}
        <section className="pillar-active-header card-glass">
          <div className="pillar-header-badge" style={{ background: `${currentPillar.color}25`, borderColor: currentPillar.color }}>
            <span style={{ color: currentPillar.color }}>{currentPillar.badge}</span>
          </div>
          <h2 className="pillar-header-title">
            <span className="pillar-icon-large">{currentPillar.icon}</span>
            {currentPillar.title}
          </h2>
          <p className="pillar-header-subtitle">{currentPillar.subtitle}</p>
        </section>

        {/* Cards Grid for the Active Pillar */}
        <section className="principles-cards-grid">
          {currentPillar.items.map((item) => {
            const isExpanded = expandedCards[item.id] || false;
            const isCopied = copiedPromptId === item.id;

            return (
              <div key={item.id} className="principle-card card-glass">
                <div className="principle-card-header">
                  <span className="principle-icon">{item.icon}</span>
                  <div className="principle-title-group">
                    <span className="principle-tag-badge" style={{ color: currentPillar.color, borderColor: `${currentPillar.color}40` }}>
                      {item.tag}
                    </span>
                    <h3 className="principle-title">{item.title}</h3>
                  </div>
                </div>

                <p className="principle-description">{item.description}</p>

                {/* Interactive Toggle for Classroom Example & Prompt */}
                <div className="principle-card-actions">
                  <button 
                    className={`btn-toggle-details ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleCardExpand(item.id)}
                  >
                    {isExpanded ? '🔽 Ocultar Aplicación y Prompt' : '💡 Ver Aplicación y Prompt IA'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="principle-details-box animate-fade-in">
                    {/* Ejemplo Práctico */}
                    <div className="detail-section-block example-block">
                      <div className="detail-block-header">
                        <span>🏫 Aplicación Práctica en el Aula</span>
                      </div>
                      <p>{item.classroomExample}</p>
                    </div>

                    {/* Prompt Recomendado para IA */}
                    <div className="detail-section-block prompt-block">
                      <div className="detail-block-header">
                        <span>🤖 Prompt Recomendado para Docentes</span>
                        <button 
                          className="btn-copy-prompt"
                          onClick={() => handleCopyPrompt(item.id, item.suggestedPrompt)}
                        >
                          {isCopied ? '✅ ¡Copiado!' : '📋 Copiar Prompt'}
                        </button>
                      </div>
                      <pre className="prompt-text">{item.suggestedPrompt}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* INTERACTIVE SELF-ASSESSMENT DIAGNOSTIC TOOL */}
        <section className="diagnostic-tool-section card-glass">
          <div className="diagnostic-header">
            <span className="badge-pill-glowing">🎯 AUTOEVALUACIÓN INTERACTIVA</span>
            <h2>Checklist del Código Docente Contemporáneo</h2>
            <p>
              Marca las competencias y prácticas pedagógicas que aplicas activamente en tu aula para calcular tu <strong>Índice de Madurez Pedagógica Digital</strong>.
            </p>
          </div>

          <div className="diagnostic-checklist-grid">
            {pillars.flatMap(p => p.items).map((item) => {
              const isChecked = checkedChecklist[item.id] || false;
              return (
                <label key={item.id} className={`checklist-item-card ${isChecked ? 'checked' : ''}`}>
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleChecklistToggle(item.id)}
                  />
                  <span className="custom-checkbox">{isChecked ? '✓' : ''}</span>
                  <div className="checklist-text">
                    <strong>{item.title}</strong>
                    <p>{item.tag}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Diagnostic Result Footer */}
          <div className="diagnostic-result-box">
            <div className="result-score-display">
              <span className="score-percent">{scorePercent}%</span>
              <div className="score-meta">
                <strong>{checkedCount} de {totalChecklistItems} Prácticas Aplicadas</strong>
                <p>
                  {scorePercent === 100 && '🏆 ¡Nivel Maestro Innovador Excepcional! Dominas completamente la coexistencia pedagógica e IA.'}
                  {scorePercent >= 70 && scorePercent < 100 && '🌟 ¡Excelente nivel de transformación! Aplica los prompts sugeridos para perfeccionar las áreas restantes.'}
                  {scorePercent >= 40 && scorePercent < 70 && '⚡ Vas por buen camino en la ruta de actualización pedagógica digital.'}
                  {scorePercent < 40 && '🚀 ¡Gran oportunidad de aprendizaje! Explora las fichas para potenciar tu práctica docente.'}
                </p>
              </div>
            </div>
            <button 
              className="btn-calculate-result"
              onClick={() => setShowAssessmentResult(!showAssessmentResult)}
            >
              {showAssessmentResult ? 'Ocultar Resumen Diagnóstico' : 'Ver Diagnóstico Completo'}
            </button>
          </div>

          {showAssessmentResult && (
            <div className="assessment-summary-card animate-zoom-in">
              <h3>📊 Diagnóstico Personalizado de Práctica Docente</h3>
              <div className="summary-columns">
                <div className="summary-col">
                  <h4>✅ Fortalezas Identificadas</h4>
                  <ul>
                    {Object.keys(checkedChecklist).filter(k => checkedChecklist[k]).length > 0 ? (
                      Object.keys(checkedChecklist).filter(k => checkedChecklist[k]).map(k => {
                        const item = pillars.flatMap(p => p.items).find(i => i.id === k);
                        return <li key={k}>✨ {item?.title}</li>;
                      })
                    ) : (
                      <li>Aún no has marcado ninguna competencia. ¡Comienza haciendo clic en las tarjetas superiores!</li>
                    )}
                  </ul>
                </div>
                <div className="summary-col">
                  <h4>🎯 Áreas de Oportunidad</h4>
                  <ul>
                    {pillars.flatMap(p => p.items).filter(i => !checkedChecklist[i.id]).slice(0, 5).map(i => (
                      <li key={i.id}>💡 {i.title} ({i.tag})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Page Footer */}
      <footer className="codigo-docente-footer">
        <p>© 2026 Editorial Lluvia de Ideas — Proyecto Educativo & Código Docente Contemporáneo.</p>
      </footer>
    </div>
  );
}
