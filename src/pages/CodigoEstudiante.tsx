import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodigoEstudiante.css';

interface PrincipleItem {
  id: string;
  icon: string;
  title: string;
  tag: string;
  description: string;
  studyStrategy: string;
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

export default function CodigoEstudiante() {
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
      title: '1. Perfil del Estudiante Contemporáneo',
      subtitle: 'La nueva identidad del estudiante como director autónomo, auditor digital y pensador interdisciplinario.',
      icon: '🎓',
      color: '#38bdf8',
      badge: 'PERFIL AUTÓNOMO',
      items: [
        {
          id: 'estudiante-perfil-1',
          icon: '🚀',
          title: 'Director de su Aprendizaje (Autónomo)',
          tag: 'Tutor Personal 24/7',
          description: 'Utiliza la IA como un tutor personalizado 24/7 para nivelarse, profundizar o explorar intereses a su propio ritmo.',
          studyStrategy: 'Usar modelos de IA como un tutor adaptativo que te ponga ejercicios progresivos del tema que se te dificulte.',
          suggestedPrompt: 'Actúa como mi tutor personal. Explícame el concepto de [Tema] en 3 niveles de complejidad: como si tuviera 10 años, nivel secundario y nivel universitario.'
        },
        {
          id: 'estudiante-perfil-2',
          icon: '🔎',
          title: 'Pensador Crítico y Auditor Digital',
          tag: 'Verificación de Hechos',
          description: 'Asume que la IA puede equivocarse o sesgar respuestas, por lo que actúa como un verificador constante de hechos y argumentos.',
          studyStrategy: 'Aplicar la regla del contraste: nunca usar una respuesta de la IA en un trabajo sin haberla verificado con al menos 2 fuentes confiables.',
          suggestedPrompt: 'Dame 3 argumentos a favor y 3 en contra sobre [Tema]. Señala qué fuentes primarias debo consultar para verificar cada postura.'
        },
        {
          id: 'estudiante-perfil-3',
          icon: '🎨',
          title: 'Pensador Interdisciplinario',
          tag: 'Humanismo & Ciencia',
          description: 'Combina habilidades técnicas con humanismo, arte y ética para abordar problemas complejos del entorno real.',
          studyStrategy: 'Crear mapas mentales o ensayos que integren un descubrimiento científico con su impacto en la literatura o la ética social.',
          suggestedPrompt: '¿Cómo influyó el desarrollo de [Descubrimiento Científico] en la filosofía y el arte del siglo XX? Dame un resumen comparativo.'
        }
      ]
    },
    {
      id: 'provocar',
      title: '2. Qué Debe Provocar',
      subtitle: 'Acciones e iniciativas que transforman la dinámica en el aula y en la comunidad.',
      icon: '⚡',
      color: '#a855f7',
      badge: 'IMPACTO EN EL ENTORNO',
      items: [
        {
          id: 'estudiante-provocar-1',
          icon: '🧠',
          title: 'Preguntas de Alto Nivel',
          tag: 'Prompts Profundos',
          description: 'Supera la búsqueda de respuestas simples y aprende a formular prompts profundos y problemas complejos que desafíen tanto a la tecnología como a sus pares.',
          studyStrategy: 'En lugar de pedir "resúmeme esto", formular prompts condicionales o hipotéticos ("¿Qué pasaría si...?") para incentivar el pensamiento analítico.',
          suggestedPrompt: 'Si modificáramos la variable X en el problema Y, ¿cuáles serían las 3 consecuencias inesperadas en el resultado final? Explica el razonamiento.'
        },
        {
          id: 'estudiante-provocar-2',
          icon: '💬',
          title: 'Debate y Contraste de Ideas',
          tag: 'Perspectiva Humana',
          description: 'Provoca discusiones en el aula aportando perspectivas humanas, dilemas éticos y juicios de valor que ningún algoritmo puede generar.',
          studyStrategy: 'Preparar argumentos para debates de aula destacando la sensibilidad humana, las emociones y la experiencia cultural propia.',
          suggestedPrompt: 'Genera 3 posturas éticas contradictorias sobre el uso de la IA en [Área], destacando los valores morales involucrados.'
        },
        {
          id: 'estudiante-provocar-3',
          icon: '🌍',
          title: 'Proyectos con Impacto Real',
          tag: 'Soluciones Comunitarias',
          description: 'Lleva el conocimiento fuera de la pantalla para resolver dilemas concretos en su comunidad, escuela o entorno social.',
          studyStrategy: 'Usar herramientas tecnológicas para diseñar propuestas de reciclaje, huertos escolares o campañas de concientización local.',
          suggestedPrompt: 'Ayúdame a estructurar un proyecto escolar de 4 semanas para reducir el desperdicio de agua en mi comunidad utilizando materiales reciclados.'
        },
        {
          id: 'estudiante-provocar-4',
          icon: '🤝',
          title: 'Cultura de Colaboración',
          tag: 'Trabajo Presencial',
          description: 'Fomenta el trabajo en equipo presencial, valorando la empatía, la negociación y el intercambio de ideas cara a cara.',
          studyStrategy: 'Organizar mesas de estudio donde se asignen roles: moderador, investigador digital, cuestionador crítico y redactor.',
          suggestedPrompt: 'Diseña una dinámica de trabajo en equipo de 20 minutos para que 4 estudiantes resuelvan juntos un caso de estudio sin usar pantallas durante el debate.'
        }
      ]
    },
    {
      id: 'proveer',
      title: '3. Qué Debe Proveer',
      subtitle: 'Los compromisos éticos y contribuciones personales en cada trabajo académico.',
      icon: '🛡️',
      color: '#34d399',
      badge: 'COMPROMISO ÉTICO',
      items: [
        {
          id: 'estudiante-proveer-1',
          icon: '✍️',
          title: 'Criterio Ético e Integridad',
          tag: 'Transparencia & Autoría',
          description: 'Honestidad en el uso de la tecnología, transparencia sobre cómo y cuándo utiliza herramientas de IA y respeto por la autoría y la propiedad intelectual.',
          studyStrategy: 'Incluir una Nota de Transparencia en tus tareas indicando si usaste IA para corregir gramática, buscar ideas o generar un boceto.',
          suggestedPrompt: '¿Cómo puedo redactar la cita y referencia adecuada en formato APA para indicar que utilicé un asistente de IA en la fase de lluvia de ideas?'
        },
        {
          id: 'estudiante-proveer-2',
          icon: '🎨',
          title: 'Originalidad y Postura Propia',
          tag: 'Voz Única',
          description: 'Aporta su voz única, experiencia de vida, sensibilidad y creatividad personal a cada entrega o proyecto.',
          studyStrategy: 'Asegurarte de que el párrafo de conclusión de cualquier ensayo exprese tu opinión personal fundamentada y no una respuesta genérica.',
          suggestedPrompt: 'Revisa este párrafo que escribí e indícame si mi postura personal se comprende claramente o si suena demasiado neutral/genérica.'
        },
        {
          id: 'estudiante-proveer-3',
          icon: '🔬',
          title: 'Esfuerzo Cognitivo Profundo',
          tag: 'Análisis & Metacognición',
          description: 'Aporta la reflexión, la metacognición y el análisis detallado, evitando delegar el pensamiento crítico a la automatización.',
          studyStrategy: 'Usar la regla del "Pensamiento Primero, IA Después": escribe primero tus ideas en papel antes de consultar cualquier herramienta digital.',
          suggestedPrompt: 'Evalúa mi análisis sobre [Tema]. ¿Qué aspectos pasé por alto y qué preguntas adicionales debería hacerme para profundizar mi razonamiento?'
        },
        {
          id: 'estudiante-proveer-4',
          icon: '🔄',
          title: 'Retroalimentación a la Tecnología y a sus Pares',
          tag: 'Co-construcción',
          description: 'Corrige los errores de las herramientas, ayuda a otros a utilizarlas con responsabilidad y colabora en la construcción del conocimiento del aula.',
          studyStrategy: 'Explicar a un compañero cómo detectar un error o "alucinación" en las respuestas de una IA cuando estudian en grupo.',
          suggestedPrompt: 'Encontré este error en la respuesta de la IA sobre [Tema]. ¿Cómo puedo redactar un prompt de corrección técnica justificando el dato exacto?'
        }
      ]
    },
    {
      id: 'prepararse',
      title: '4. Cómo Debe Prepararse',
      subtitle: 'Formación continua en alfabetización digital, pensamiento crítico y habilidades humanas.',
      icon: '🚀',
      color: '#fb7185',
      badge: 'PREPARACIÓN PARA EL FUTURO',
      items: [
        {
          id: 'estudiante-prepararse-1',
          icon: '💡',
          title: 'Desarrollo de la Alfabetización Digital y en IA',
          tag: 'Prompting & Curación',
          description: 'Aprender a dialogar con los modelos de IA (ingeniería de prompts), evaluando la calidad de las respuestas y reconociendo sus limitaciones o sesgos. Dominar herramientas de curación de información para distinguir datos verificados de noticias falsas o alucinaciones algorítmicas.',
          studyStrategy: 'Mantener una bitácora de prompts donde anotes las preguntas que te dieron las mejores respuestas de estudio.',
          suggestedPrompt: 'Dame una plantilla para estructurar un prompt efectivo que incluya: Rol, Objetivo, Contexto, Instrucciones y Formato de salida.'
        },
        {
          id: 'estudiante-prepararse-2',
          icon: '🎯',
          title: 'Fortalecimiento del Pensamiento Crítico y Metacognición',
          tag: 'Reflexión de Aprendizaje',
          description: 'Entrenar la capacidad de reflexionar sobre su propio proceso de aprendizaje (¿cómo aprendo mejor y cómo me ayuda la IA a lograrlo?). Practicar el análisis lógico, la argumentación oral y la resolución de problemas donde no existe una única respuesta correcta.',
          studyStrategy: 'Grabar explicaciones de 2 minutos con tu voz expresando lo que entendiste de un tema antes de hacer un examen oral.',
          suggestedPrompt: 'Pregúntame 5 cuestionamientos sobre [Tema] de uno en uno para poner a prueba mi comprensión y capacidad de argumentación oral.'
        },
        {
          id: 'estudiante-prepararse-3',
          icon: '🌱',
          title: 'Cultivo de Habilidades Profundamente Humanas (Soft Skills)',
          tag: 'Empatía & Resiliencia',
          description: 'Priorizar el desarrollo de la empatía, la inteligencia emocional, la adaptabilidad al cambio y la resiliencia. Fortalecer la comunicación interpersonal y el trabajo en equipo, competencias inmunes a la automatización.',
          studyStrategy: 'Participar activamente en proyectos de voluntariado, deportes de equipo o talleres artísticos que fortalezcan tu empatía e inteligencia emocional.',
          suggestedPrompt: 'Dame 3 ejercicios de reflexión personal para mejorar mi empatía y habilidades de comunicación en trabajos de equipo complejos.'
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
    <div className="codigo-estudiante-wrapper animate-fade-in">
      
      {/* Top Banner Header */}
      <header className="codigo-estudiante-header">
        <div className="codigo-estudiante-header-content">
          <div className="header-badge-row">
            <span className="badge-pill-glowing-cyan">🎓 MANIFIESTO DEL ESTUDIANTE DIGITAL</span>
            <button className="btn-back-landing" onClick={() => navigate('/')}>
              🏠 Inicio
            </button>
          </div>
          <h1 className="codigo-main-title">
            El <span className="highlight-text-cyan">Código del Estudiante</span>
          </h1>
          <p className="codigo-main-desc">
            Manifiesto y guía interactiva de principios, hábitos y habilidades clave para el estudiante contemporáneo en la era del aprendizaje potenciado por la Inteligencia Artificial.
          </p>

          {/* Quick Metrics Bar */}
          <div className="codigo-stats-bar">
            <div className="stat-metric-card">
              <span className="metric-number">4</span>
              <span className="metric-label">Pilares de Autonomía</span>
            </div>
            <div className="stat-metric-card">
              <span className="metric-number">14</span>
              <span className="metric-label">Hábitos Clave</span>
            </div>
            <div className="stat-metric-card">
              <span className="metric-number">100%</span>
              <span className="metric-label">Pensamiento Crítico</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="codigo-main-container">
        
        {/* Navigation Tabs for the 4 Pillars */}
        <nav className="pillars-tab-nav" aria-label="Navegación de pilares del Código del Estudiante">
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

                {/* Interactive Toggle for Study Strategy & Prompt */}
                <div className="principle-card-actions">
                  <button 
                    className={`btn-toggle-details ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleCardExpand(item.id)}
                  >
                    {isExpanded ? '🔽 Ocultar Estrategia y Prompt' : '💡 Ver Estrategia de Estudio y Prompt IA'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="principle-details-box animate-fade-in">
                    {/* Estrategia de Estudio */}
                    <div className="detail-section-block strategy-block">
                      <div className="detail-block-header">
                        <span>📖 Estrategia Práctica de Estudio</span>
                      </div>
                      <p>{item.studyStrategy}</p>
                    </div>

                    {/* Prompt Recomendado para el Estudiante */}
                    <div className="detail-section-block prompt-block">
                      <div className="detail-block-header">
                        <span>🤖 Prompt Recomendado para Estudiantes</span>
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
            <span className="badge-pill-glowing-cyan">🎯 AUTOEVALUACIÓN INTERACTIVA</span>
            <h2>Checklist del Estudiante Autónomo & Digital</h2>
            <p>
              Marca los hábitos y competencias que aplicas activamente en tu estudio diario para calcular tu <strong>Índice de Madurez de Aprendizaje Digital</strong>.
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
                <strong>{checkedCount} de {totalChecklistItems} Hábitos Practicados</strong>
                <p>
                  {scorePercent === 100 && '🚀 ¡Nivel Estudiante Líder y Autónomo Excepcional! Dominas el aprendizaje autónomo e IA ética.'}
                  {scorePercent >= 70 && scorePercent < 100 && '🌟 ¡Excelente nivel de madurez digital! Utiliza los prompts para potenciar tus áreas de estudio.'}
                  {scorePercent >= 40 && scorePercent < 70 && '⚡ Vas por buen camino construyendo tus habilidades de pensamiento crítico e IA.'}
                  {scorePercent < 40 && '🌱 ¡Gran oportunidad para crecer! Explora las estrategias y prompts para convertirte en un estudiante autónomo.'}
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
              <h3>📊 Diagnóstico Personalizado de Hábitos de Estudio</h3>
              <div className="summary-columns">
                <div className="summary-col">
                  <h4>✅ Tus Hábitos Destacados</h4>
                  <ul>
                    {Object.keys(checkedChecklist).filter(k => checkedChecklist[k]).length > 0 ? (
                      Object.keys(checkedChecklist).filter(k => checkedChecklist[k]).map(k => {
                        const item = pillars.flatMap(p => p.items).find(i => i.id === k);
                        return <li key={k}>✨ {item?.title}</li>;
                      })
                    ) : (
                      <li>Aún no has marcado ningún hábito. ¡Haz clic en las casillas superiores para autoevaluarte!</li>
                    )}
                  </ul>
                </div>
                <div className="summary-col">
                  <h4>💡 Hábitos para Fortalecer</h4>
                  <ul>
                    {pillars.flatMap(p => p.items).filter(i => !checkedChecklist[i.id]).slice(0, 5).map(i => (
                      <li key={i.id}>🎯 {i.title} ({i.tag})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* Page Footer */}
      <footer className="codigo-estudiante-footer">
        <p>© 2026 Editorial Lluvia de Ideas — Proyecto Educativo & Código del Estudiante Contemporáneo.</p>
      </footer>
    </div>
  );
}
