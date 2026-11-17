import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import './EmprendimientoAula.css';

type SectionMode = 'habilidades' | 'producto';
type SkillKey = 'critico' | 'liderazgo' | 'logro' | 'resiliencia' | 'vocacional';

interface SkillMeta {
  key: SkillKey;
  icon: string;
  title: string;
  toolName: string;
  meaning: string;
}

const SKILLS_META: SkillMeta[] = [
  {
    key: 'critico',
    icon: '🔍',
    title: 'Pensamiento crítico',
    toolName: 'Detector de Causa Raíz (3 Porqués)',
    meaning:
      'Ir más allá de la primera impresión: cuestionar supuestos, analizar evidencias del entorno escolar y diferenciar entre un síntoma superficial y el problema real.',
  },
  {
    key: 'liderazgo',
    icon: '🧭',
    title: 'Visión de liderazgo',
    toolName: 'Brújula de Roles Compartidos',
    meaning:
      'Inspirar y coordinar talentos distintos hacia una meta común. En el aula, liderar no es mandar: es distribuir responsabilidades claras y cuidar que cada voz aporte.',
  },
  {
    key: 'logro',
    icon: '🎯',
    title: 'Orientación al logro',
    toolName: 'Escalera de Metas SMART',
    meaning:
      'Transformar buenas intenciones en resultados verificables mediante objetivos concretos, indicadores medibles y entregas por etapas.',
  },
  {
    key: 'resiliencia',
    icon: '🌱',
    title: 'Resiliencia ante el fracaso',
    toolName: 'Laboratorio del Pivote Constructivo',
    meaning:
      'Entender cada error o prototipo fallido como información valiosa para ajustar la estrategia sin abandonar el propósito.',
  },
  {
    key: 'vocacional',
    icon: '✨',
    title: 'Descubrimiento vocacional',
    toolName: 'Radar Ikigai Escolar',
    meaning:
      'Conectar lo que el estudiante disfruta hacer, sus talentos naturales y una necesidad real de su comunidad para despertar sentido y vocación.',
  },
];

const LEADERSHIP_ROLES = [
  {
    id: 'estratega',
    name: '🧭 Estratega del Propósito',
    desc: 'Mantiene claro qué problema resolvemos, organiza los tiempos y ayuda al equipo a no perder el foco.',
    checks: [
      'Recordar la meta del día al iniciar la sesión.',
      'Dividir el trabajo en tareas de 15–20 minutos.',
      'Verificar que todos entiendan el objetivo.',
    ],
  },
  {
    id: 'creador',
    name: '🛠️ Creador de Prototipos',
    desc: 'Convierte las ideas en algo tangible: bocetos, maquetas, juegos, textos o prototipos funcionales.',
    checks: [
      'Usar materiales accesibles del aula o reciclados.',
      'Construir una versión rápida antes de perfeccionar.',
      'Documentar cambios entre la versión 1 y la versión 2.',
    ],
  },
  {
    id: 'comunicador',
    name: '🎤 Comunicador & Empatía',
    desc: 'Escucha a los usuarios/compañeros, recoge retroalimentación y prepara la historia o pitch del proyecto.',
    checks: [
      'Hacer 3 preguntas reales a quien usará el producto.',
      'Anotar sugerencias sin ponerse a la defensiva.',
      'Preparar el mensaje claro de 30 segundos.',
    ],
  },
  {
    id: 'guardian',
    name: '🛡️ Guardián de Calidad',
    desc: 'Revisa ortografía, seguridad, presentación y que el producto cumpla lo prometido.',
    checks: [
      'Probar el producto completo antes de presentarlo.',
      'Cuidar limpieza visual, legibilidad y reglas.',
      'Confirmar que el equipo celebre sus avances.',
    ],
  },
];

const RESILIENCE_SCENARIOS = [
  {
    id: 'tiempo',
    title: '⏳ Se acabó el tiempo y el prototipo quedó a medias',
    fixedTrap: '“No servimos para esto, mejor entregamos cualquier cosa o nos rendimos.”',
    pivotGuide:
      'Recorta el alcance a lo esencial (Producto Mínimo Viable): muestra 1 función que sí opere bien y explica qué sigue en la siguiente iteración.',
  },
  {
    id: 'rechazo',
    title: '💬 Al grupo de prueba no le gustó la primera idea',
    fixedTrap: '“No entendieron nuestra genialidad, no vamos a cambiar nada.”',
    pivotGuide:
      'Agradece la retroalimentación: pregunta exactamente qué parte fue confusa o aburrida y ajusta ese punto en 10 minutos.',
  },
  {
    id: 'fallo',
    title: '🧩 El material se rompió o la dinámica no funcionó en clase',
    fixedTrap: '“Todo salió mal, perdimos el trabajo de toda la semana.”',
    pivotGuide:
      'Registra qué falló (material, instrucción o regla), refuerza ese punto con una alternativa simple y vuelve a probar.',
  },
];

export default function EmprendimientoAula() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<SectionMode>('habilidades');
  const [activeSkill, setActiveSkill] = useState<SkillKey>('critico');

  // Habilidad 1: Pensamiento Crítico (3 Porqués)
  const [symptom, setSymptom] = useState('Los estudiantes tiran basura en el patio después del recreo');
  const [why1, setWhy1] = useState('Porque los botes están lejos de las canchas');
  const [why2, setWhy2] = useState('Porque no hay señalización ni separación visible en las zonas de juego');
  const [why3, setWhy3] = useState('Porque nunca hemos diseñado puntos ecológicos hechos por los propios alumnos');

  // Habilidad 2: Liderazgo
  const [selectedRoleId, setSelectedRoleId] = useState('estratega');
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean>>({});

  // Habilidad 3: Orientación al Logro (SMART)
  const [smartGoal, setSmartGoal] = useState('Crear un juego de mesa matemático con material reciclado');
  const [smartMetric, setSmartMetric] = useState('30 cartas de reto probadas con 2 grupos de 5.º grado');
  const [smartDeadline, setSmartDeadline] = useState('Viernes de la semana 3');

  // Habilidad 4: Resiliencia
  const [selectedScenarioId, setSelectedScenarioId] = useState('tiempo');
  const [resilienceNote, setResilienceNote] = useState('');

  // Habilidad 5: Vocacional (Ikigai)
  const [ikigaiPassion, setIkigaiPassion] = useState('Dibujar cómics y explicar historias');
  const [ikigaiTalent, setIkigaiTalent] = useState('Resumir temas difíciles con ejemplos claros');
  const [ikigaiNeed, setIkigaiNeed] = useState('Que mis compañeros entiendan historia sin aburrirse');

  // Sección B: Ejercicio de Producto de Aula
  const [projectName, setProjectName] = useState('');
  const [teamInfo, setTeamInfo] = useState('');
  const [localProblem, setLocalProblem] = useState('');
  const [productType, setProductType] = useState('Juego o Recurso Didáctico');
  const [valueProp, setValueProp] = useState('');
  const [teamTalent, setTeamTalent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [mvpPlan, setMvpPlan] = useState('');
  const [successMetric, setSuccessMetric] = useState('');
  const [pitchCopied, setPitchCopied] = useState(false);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const currentSkill = SKILLS_META.find((s) => s.key === activeSkill) || SKILLS_META[0];
  const currentRole = LEADERSHIP_ROLES.find((r) => r.id === selectedRoleId) || LEADERSHIP_ROLES[0];
  const currentScenario =
    RESILIENCE_SCENARIOS.find((s) => s.id === selectedScenarioId) || RESILIENCE_SCENARIOS[0];

  const generatedPitch = useMemo(() => {
    const pName = projectName.trim() || '[Nombre de tu Producto]';
    const pProblem = localProblem.trim() || '[problema detectado en el aula o comunidad]';
    const pAudience = targetAudience.trim() || '[quienes lo usarán]';
    const pValue = valueProp.trim() || '[solución práctica que ofrece]';
    const pTalent = teamTalent.trim() || '[talento principal del equipo]';

    return `Hola, somos ${teamInfo.trim() || 'el equipo creador'} y presentamos "${pName}" (${productType}). Detectamos que ${pProblem} afecta a ${pAudience}. Aprovechando nuestro talento en ${pTalent}, diseñamos esta propuesta que logra ${pValue}. En nuestra primera semana validaremos un prototipo funcional midiendo ${successMetric.trim() || 'la respuesta real de los usuarios'}.`;
  }, [
    projectName,
    teamInfo,
    productType,
    localProblem,
    targetAudience,
    teamTalent,
    valueProp,
    successMetric,
  ]);

  const loadSampleProduct = () => {
    soundEffects.playClick();
    setProjectName('EcoReto Lluvia');
    setTeamInfo('Equipo Semilla · 6.º Primaria');
    setLocalProblem('cuesta recordar cómo separar residuos en el recreo');
    setProductType('Juego o Recurso Didáctico');
    setValueProp('aprender a clasificar desechos jugando en menos de 5 minutos por turno');
    setTeamTalent('ilustración creativa, diseño de reglas y exposición oral');
    setTargetAudience('estudiantes de 3.º a 6.º grado');
    setMvpPlan('Construir un mazo piloto de 24 tarjetas ilustradas con cartón reutilizado y probarlo con un aula vecina.');
    setSuccessMetric('que el 80% de los participantes clasifique correctamente 5 residuos seguidos');
  };

  const handleCopyPitch = async () => {
    soundEffects.playClick();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(generatedPitch);
      setPitchCopied(true);
      setTimeout(() => setPitchCopied(false), 2200);
    }
  };

  const handleDownloadPdf = () => {
    soundEffects.playSuccess();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Ficha de Producto de Aula · Módulo 8', 16, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Ecosistema Creatika · Editorial Lluvia de Ideas (Emprendiendo en el Aula)', 16, 27);

    const rows: Array<[string, string]> = [
      ['Nombre del Proyecto', projectName || 'Sin definir'],
      ['Equipo / Grado', teamInfo || 'Sin definir'],
      ['Tipo de Producto', productType],
      ['Problema Local', localProblem || 'Sin definir'],
      ['Propuesta de Valor', valueProp || 'Sin definir'],
      ['Talento del Equipo', teamTalent || 'Sin definir'],
      ['Público Usuario', targetAudience || 'Sin definir'],
      ['Prototipo Mínimo (7 días)', mvpPlan || 'Sin definir'],
      ['Indicador de Éxito', successMetric || 'Sin definir'],
      ['Mini-Pitch (30 seg)', generatedPitch],
    ];

    let y = 38;
    rows.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${label}:`, 16, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(val, 178);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 4;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`producto_aula_${(projectName || 'modulo8').toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="emp-page-wrapper animate-fade-in">
      <LandingTopBar slogan="Creatika · Módulo 8: Emprendiendo en el Aula" showHomeButton />

      <main className="emp-main">
        {/* HERO DEL MÓDULO 8 */}
        <section className="emp-hero">
          <div className="emp-hero-top">
            <span className="emp-module-pill">
              <span>🚀</span>
              <span>MÓDULO 8 · LABORATORIO DE ANIMACIÓN CREATIVA</span>
            </span>

            <button
              type="button"
              className="emp-back-link"
              onClick={() => {
                soundEffects.playClick();
                navigate('/creatika');
              }}
            >
              ← Volver a Suite Creatika
            </button>
          </div>

          <h1 className="emp-title">
            Emprendiendo en el <span>Aula</span>
          </h1>

          <div className="emp-competency-box">
            <strong>Competencia del Módulo:</strong> Implementa metodologías activas que ayuden a los
            estudiantes a identificar sus talentos individuales, pasiones y potencial emprendedor.
          </div>
        </section>

        {/* SELECTOR PRINCIPAL: HABILIDADES CLAVE vs. PRODUCTO DE AULA */}
        <div className="emp-mode-switch" role="tablist" aria-label="Secciones de Emprendimiento en el Aula">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'habilidades'}
            className={`emp-mode-btn ${mode === 'habilidades' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setMode('habilidades');
            }}
          >
            <span>🧠</span>
            <span>1. Herramientas de Habilidades Clave (5)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'producto'}
            className={`emp-mode-btn ${mode === 'producto' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setMode('producto');
            }}
          >
            <span>🛠️</span>
            <span>2. Ejercicio de Producto de Aula</span>
          </button>
        </div>

        {/* ====================================================================
            SECCIÓN 1: HERRAMIENTAS PARA ENTENDER LAS 5 HABILIDADES CLAVES
            ==================================================================== */}
        {mode === 'habilidades' && (
          <section aria-label="Herramientas de habilidades clave">
            <div className="emp-skills-tabs">
              {SKILLS_META.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`emp-skill-tab ${activeSkill === s.key ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveSkill(s.key);
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>

            <div className="emp-panel">
              <div className="emp-panel-header">
                <div>
                  <h2 className="emp-panel-title">
                    {currentSkill.icon} {currentSkill.title}
                  </h2>
                  <p className="emp-panel-desc">{currentSkill.meaning}</p>
                </div>
                <span className="emp-tool-tag">Herramienta: {currentSkill.toolName}</span>
              </div>

              {/* 1. PENSAMIENTO CRÍTICO */}
              {activeSkill === 'critico' && (
                <div>
                  <div className="emp-grid-2">
                    <div className="emp-field">
                      <label htmlFor="emp-symptom">Situación visible en el aula o escuela</label>
                      <input
                        id="emp-symptom"
                        type="text"
                        value={symptom}
                        onChange={(e) => setSymptom(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-why1">1.º Por qué (causa inmediata)</label>
                      <input
                        id="emp-why1"
                        type="text"
                        value={why1}
                        onChange={(e) => setWhy1(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-why2">2.º Por qué (proceso o hábito detrás)</label>
                      <input
                        id="emp-why2"
                        type="text"
                        value={why2}
                        onChange={(e) => setWhy2(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-why3">3.º Por qué (causa raíz accionable)</label>
                      <input
                        id="emp-why3"
                        type="text"
                        value={why3}
                        onChange={(e) => setWhy3(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="emp-insight-box">
                    <strong>Diagnóstico Crítico:</strong> En lugar de atacar solo el síntoma (
                    <em>“{symptom || '...'}”</em>), el proyecto de aula debe resolver la causa raíz:{' '}
                    <strong>{why3 || 'pendiente de definir'}</strong>.
                  </div>
                </div>
              )}

              {/* 2. VISIÓN DE LIDERAZGO */}
              {activeSkill === 'liderazgo' && (
                <div>
                  <div className="emp-grid-2">
                    {LEADERSHIP_ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className={`emp-card-choice ${selectedRoleId === role.id ? 'selected' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedRoleId(role.id);
                        }}
                      >
                        <h4>{role.name}</h4>
                        <p>{role.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="emp-checklist">
                    {currentRole.checks.map((check, idx) => {
                      const checkKey = `${currentRole.id}-${idx}`;
                      return (
                        <label key={checkKey} className="emp-check-item">
                          <input
                            type="checkbox"
                            checked={Boolean(roleChecks[checkKey])}
                            onChange={(e) =>
                              setRoleChecks((prev) => ({
                                ...prev,
                                [checkKey]: e.target.checked,
                              }))
                            }
                          />
                          <span>{check}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. ORIENTACIÓN AL LOGRO */}
              {activeSkill === 'logro' && (
                <div>
                  <div className="emp-grid-3">
                    <div className="emp-field">
                      <label htmlFor="emp-smart-goal">¿Qué queremos lograr? (Específico)</label>
                      <input
                        id="emp-smart-goal"
                        type="text"
                        value={smartGoal}
                        onChange={(e) => setSmartGoal(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-smart-metric">¿Cómo lo medimos? (Medible)</label>
                      <input
                        id="emp-smart-metric"
                        type="text"
                        value={smartMetric}
                        onChange={(e) => setSmartMetric(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-smart-deadline">¿Cuándo se entrega? (Tiempo)</label>
                      <input
                        id="emp-smart-deadline"
                        type="text"
                        value={smartDeadline}
                        onChange={(e) => setSmartDeadline(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="emp-insight-box amber">
                    <strong>Compromiso de Logro:</strong> Para el <strong>{smartDeadline || '...'}</strong>,
                    habremos completado <em>{smartGoal || '...'}</em> comprobado con{' '}
                    <strong>{smartMetric || '...'}</strong>.
                  </div>
                </div>
              )}

              {/* 4. RESILIENCIA ANTE EL FRACASO */}
              {activeSkill === 'resiliencia' && (
                <div>
                  <div className="emp-grid-3">
                    {RESILIENCE_SCENARIOS.map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        className={`emp-card-choice ${selectedScenarioId === sc.id ? 'selected' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedScenarioId(sc.id);
                        }}
                      >
                        <h4>{sc.title}</h4>
                        <p>Haz clic para analizar el pivote.</p>
                      </button>
                    ))}
                  </div>

                  <div className="emp-insight-box amber">
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Trampa de mentalidad fija:</strong> {currentScenario.fixedTrap}
                    </div>
                    <div>
                      <strong>Respuesta resiliente (Pivote):</strong> {currentScenario.pivotGuide}
                    </div>
                  </div>

                  <div className="emp-field" style={{ marginTop: '16px' }}>
                    <label htmlFor="emp-resilience-note">
                      Bitácora del equipo: ¿qué ajuste concreto harían hoy si les ocurriera esto?
                    </label>
                    <textarea
                      id="emp-resilience-note"
                      placeholder="Ej. Reduciríamos a 10 tarjetas bien probadas y pediríamos 5 minutos de prueba rápida..."
                      value={resilienceNote}
                      onChange={(e) => setResilienceNote(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* 5. DESCUBRIMIENTO VOCACIONAL */}
              {activeSkill === 'vocacional' && (
                <div>
                  <div className="emp-grid-3">
                    <div className="emp-field">
                      <label htmlFor="emp-ikigai-passion">❤️ Lo que disfruto hacer</label>
                      <input
                        id="emp-ikigai-passion"
                        type="text"
                        value={ikigaiPassion}
                        onChange={(e) => setIkigaiPassion(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-ikigai-talent">⚡ En lo que soy bueno</label>
                      <input
                        id="emp-ikigai-talent"
                        type="text"
                        value={ikigaiTalent}
                        onChange={(e) => setIkigaiTalent(e.target.value)}
                      />
                    </div>
                    <div className="emp-field">
                      <label htmlFor="emp-ikigai-need">🌍 Lo que mi aula necesita</label>
                      <input
                        id="emp-ikigai-need"
                        type="text"
                        value={ikigaiNeed}
                        onChange={(e) => setIkigaiNeed(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="emp-insight-box">
                    <strong>Brújula Vocacional:</strong> Tu punto de encuentro emprendedor une{' '}
                    <em>{ikigaiPassion || '...'}</em> con tu capacidad para{' '}
                    <em>{ikigaiTalent || '...'}</em>, aportando valor directo a{' '}
                    <strong>{ikigaiNeed || '...'}</strong>.
                  </div>
                </div>
              )}

              <div className="emp-actions-row">
                <button
                  type="button"
                  className="emp-btn-primary"
                  onClick={() => {
                    soundEffects.playClick();
                    setMode('producto');
                  }}
                >
                  <span>🛠️ Aplicar esto en el Producto de Aula</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            SECCIÓN 2: EJERCICIO DE PRODUCTO DE AULA
            ==================================================================== */}
        {mode === 'producto' && (
          <section className="emp-panel" aria-label="Ejercicio de Producto de Aula">
            <div className="emp-panel-header">
              <div>
                <h2 className="emp-panel-title">🛠️ Ejercicio Práctico: Diseño de Producto de Aula</h2>
                <p className="emp-panel-desc">
                  Completa este lienzo en equipos para transformar una necesidad real de la escuela en un
                  producto tangible con propuesta de valor, prototipo de 7 días y mini-pitch.
                </p>
              </div>
              <button type="button" className="emp-btn-secondary" onClick={loadSampleProduct}>
                ✨ Cargar ejemplo guiado
              </button>
            </div>

            <div className="emp-grid-2">
              <div className="emp-field">
                <label htmlFor="emp-proj-name">Nombre del Producto de Aula</label>
                <input
                  id="emp-proj-name"
                  type="text"
                  placeholder="Ej. EcoReto Lluvia, Revista Voces, Kit Matemático..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-team-info">Equipo y Grado</label>
                <input
                  id="emp-team-info"
                  type="text"
                  placeholder="Ej. Equipo Nube · 5.º Primaria"
                  value={teamInfo}
                  onChange={(e) => setTeamInfo(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-prod-type">Formato del Producto</label>
                <select
                  id="emp-prod-type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                >
                  <option value="Juego o Recurso Didáctico">Juego o Recurso Didáctico</option>
                  <option value="Libro, Cómic o Revista Escolar">Libro, Cómic o Revista Escolar</option>
                  <option value="Prototipo STEAM / Maqueta">Prototipo STEAM / Maqueta</option>
                  <option value="Campaña o Servicio Comunitario">Campaña o Servicio Comunitario</option>
                  <option value="Cápsula Audiovisual / Podcast">Cápsula Audiovisual / Podcast</option>
                </select>
              </div>

              <div className="emp-field">
                <label htmlFor="emp-audience">¿Para quién está diseñado?</label>
                <input
                  id="emp-audience"
                  type="text"
                  placeholder="Ej. Estudiantes de primaria, familias, docentes..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-problem">Problema real que detectamos</label>
                <textarea
                  id="emp-problem"
                  placeholder="Describe brevemente qué dificultad o necesidad observan..."
                  value={localProblem}
                  onChange={(e) => setLocalProblem(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-value">Propuesta de valor (qué logra nuestro producto)</label>
                <textarea
                  id="emp-value"
                  placeholder="¿Cómo mejora la vida o el aprendizaje de quienes lo usan?"
                  value={valueProp}
                  onChange={(e) => setValueProp(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-talent">Talentos y pasiones del equipo que lo impulsan</label>
                <input
                  id="emp-talent"
                  type="text"
                  placeholder="Ej. Dibujo, lógica, redacción, oratoria..."
                  value={teamTalent}
                  onChange={(e) => setTeamTalent(e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label htmlFor="emp-metric">¿Cómo sabremos que funcionó? (Indicador)</label>
                <input
                  id="emp-metric"
                  type="text"
                  placeholder="Ej. 15 compañeros lo usan y resuelven el reto"
                  value={successMetric}
                  onChange={(e) => setSuccessMetric(e.target.value)}
                />
              </div>
            </div>

            <div className="emp-field" style={{ marginTop: '18px' }}>
              <label htmlFor="emp-mvp">Prototipo Mínimo Viable (¿qué podemos construir en 7 días?)</label>
              <textarea
                id="emp-mvp"
                placeholder="Describe la primera versión sencilla con materiales del aula para probar cuanto antes..."
                value={mvpPlan}
                onChange={(e) => setMvpPlan(e.target.value)}
              />
            </div>

            <div className="emp-pitch-preview">
              <h4>🎤 Mini-Pitch de 30 Segundos (Generado en vivo)</h4>
              <p>{generatedPitch}</p>
            </div>

            <div className="emp-actions-row">
              <button type="button" className="emp-btn-primary" onClick={handleDownloadPdf}>
                <span>📄</span>
                <span>Descargar Ficha de Producto (PDF)</span>
              </button>

              <button type="button" className="emp-btn-secondary" onClick={handleCopyPitch}>
                <span>{pitchCopied ? '✅' : '📋'}</span>
                <span>{pitchCopied ? 'Pitch copiado' : 'Copiar Mini-Pitch'}</span>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
