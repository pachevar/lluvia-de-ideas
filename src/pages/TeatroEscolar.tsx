import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuCompass,
  LuLayers,
  LuClock,
  LuUsers,
  LuSparkles,
  LuPlay,
  LuPause,
  LuRotateCcw,
  LuCircleCheck,
  LuCircle,
  LuTriangleAlert,
  LuChevronRight,
  LuMenu,
  LuX,
  LuCalendar,
  LuVolume2,
  LuEye,
  LuHeartHandshake,
  LuShieldAlert,
  LuWind,
  LuArrowRight,
  LuArrowLeft,
  LuTarget,
  LuLightbulb,
  LuBookOpen,
  LuAward,
  LuSlidersHorizontal,
  LuCheck,
  LuChevronDown,
  LuChevronUp,
} from 'react-icons/lu';
import LandingTopBar from '../components/landing/LandingTopBar';
import { LiveStageConsole } from '../components/teatro/LiveStageConsole';
import { StageMapInteractive } from '../components/teatro/StageMapInteractive';
import { LiveRescueSimulator } from '../components/teatro/LiveRescueSimulator';
import { soundEffects } from '../utils/soundEffects';
import {
  DEPARTMENTS,
  EXERCISE_CATEGORIES,
  GOLDEN_RULES,
  INITIAL_THERMOMETER_PILLARS,
  NAV_ITEMS,
  PROCESS_PHASES,
  THEATER_EXERCISES,
  VALID_THEATER_ROUTES,
  type ExerciseCategory,
  type GoldenRule,
  type PlayFormat,
  type RouteId,
  type TheaterExercise,
  type ThermometerItem,
} from '../data/teatroData';
import './TeatroEscolar.css';

type TheaterTheme = 'sutz-night' | 'classroom-light' | 'high-contrast';

const CHECKLIST_STORAGE_KEY = 'creatika_escenalab_checklist';
const XP_STORAGE_KEY = 'creatika_escenalab_xp';

const TheaterBrandIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5c0 6 2.5 11 6.5 12.5C14.5 16 17 11 17 5c-4 1.5-9 1.5-13 0Z" />
    <path d="M8 9.5h.01" />
    <path d="M13 9.5h.01" />
    <path d="M8.5 13c1 .9 3 .9 4 0" />
    <path d="M17 7.5c1.5.2 2.5.1 3.5-.3 0 5.5-2.2 10-5.8 11.4-.9-.3-1.7-.9-2.4-1.6" />
  </svg>
);

// ============================================================================
// VISTA 1: INICIO (Escenario Interactivo de Reflectores + Termómetro Radial)
// ============================================================================

interface HomeViewProps {
  theme: TheaterTheme;
  onNavigate: (route: RouteId) => void;
  onStudioReward: (reason: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ theme, onNavigate, onStudioReward }) => {
  const [pillars, setPillars] = useState<ThermometerItem[]>(INITIAL_THERMOMETER_PILLARS);

  const updateScore = (id: string, value: number) => {
    soundEffects.playClick();
    setPillars((prev) => prev.map((item) => (item.id === id ? { ...item, score: value } : item)));
  };

  const totalScore = useMemo(() => pillars.reduce((acc, item) => acc + item.score, 0), [pillars]);
  const percentage = Math.round((totalScore / (pillars.length * 5)) * 100);

  const gaugeRadius = 62;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCirc * (1 - percentage / 100);

  const diagnosis = useMemo(() => {
    if (percentage < 45) {
      return {
        stage: 'Fase Semilla: Construyendo los cimientos',
        color: 'var(--el-challenge)',
        message:
          'Momento ideal para organizar el proceso con método. Antes de memorizar diálogos, dediquen dos sesiones a cohesión grupal y a repartir roles técnicos.',
        recommendedRoute: 'proceso' as RouteId,
        actionLabel: 'Explorar la Ruta de Montaje',
      };
    }
    if (percentage < 75) {
      return {
        stage: 'Fase Ensayo Activo: En crecimiento firme',
        color: 'var(--el-guide-light)',
        message:
          'El grupo ya tiene impulso y base creativa. Ahora conviene reforzar el entrenamiento de voz/cuerpo y asegurar que ningún área técnica quede para la última semana.',
        recommendedRoute: 'ejercicios' as RouteId,
        actionLabel: 'Ir al Laboratorio de Ejercicios',
      };
    }
    return {
      stage: 'Fase Compañía Lista: Estándar profesional',
      color: 'var(--el-success-light)',
      message:
        '¡Excelente nivel de organización! Tu grupo demuestra cultura teatral sólida. Afinen los detalles de escucha escénica, transiciones y control de nervios para el estreno.',
      recommendedRoute: 'consejos' as RouteId,
      actionLabel: 'Revisar Consejos de Escena',
    };
  }, [percentage]);

  return (
    <div className="el-view-animate">
      <section className="el-hero-panel">
        <div className="el-hero-accent-bar" />
        <div className="el-hero-grid">
          <div>
            <span className="el-section-eyebrow">
              <LuSparkles size={14} /> Suite Creatika · Estudio Teatral Sutz
            </span>
            <h1 className="el-page-title">
              Del aula al escenario con oficio, método y emoción
            </h1>
            <p className="el-page-lead">
              <strong>Escena Lab</strong> integra el neurodiseño visual de Sutz con herramientas prácticas para montar una obra escolar: escenario interactivo, ruta de 6 fases, cronómetro de ensayos, distribuidor de elenco y simulador en vivo.
            </p>
            <div className="el-hero-actions">
              <button
                type="button"
                className="el-btn el-btn-primary"
                onClick={() => onNavigate('proceso')}
              >
                Iniciar Ruta de Montaje <LuArrowRight size={16} />
              </button>
              <button
                type="button"
                className="el-btn el-btn-secondary"
                onClick={() => onNavigate('organizacion')}
              >
                Organizar mi Grupo
              </button>
            </div>
          </div>

          {/* Consola Interactiva de Escenario en Vivo (con vista ampliada) */}
          <LiveStageConsole theme={theme} onActionReward={onStudioReward} />
        </div>
      </section>

      {/* Accesos directos codificados por semántica Sutz */}
      <section aria-label="Módulos principales">
        <div className="el-modules-grid">
          <button
            type="button"
            className="el-card el-card-interactive el-module-card"
            onClick={() => onNavigate('proceso')}
          >
            <div>
              <div
                className="el-module-icon-wrap"
                style={{ backgroundColor: 'var(--el-challenge-soft)', color: 'var(--el-challenge)' }}
              >
                <LuLayers size={22} />
              </div>
              <h3>El Proceso Teatral</h3>
              <p>
                Recorre las 6 fases del montaje desde la elección del guion hasta el estreno, con checklist y XP.
              </p>
            </div>
            <span className="el-module-link">
              Ver 6 fases <LuChevronRight size={15} />
            </span>
          </button>

          <button
            type="button"
            className="el-card el-card-interactive el-module-card"
            onClick={() => onNavigate('ejercicios')}
          >
            <div>
              <div
                className="el-module-icon-wrap"
                style={{ backgroundColor: 'var(--el-guide-soft)', color: 'var(--el-guide-light)' }}
              >
                <LuClock size={22} />
              </div>
              <h3>Laboratorio de Ejercicios</h3>
              <p>
                8 dinámicas prácticas de cuerpo, voz, improvisación y cohesión con cronómetro circular interactivo.
              </p>
            </div>
            <span className="el-module-link">
              Entrenar ahora <LuChevronRight size={15} />
            </span>
          </button>

          <button
            type="button"
            className="el-card el-card-interactive el-module-card"
            onClick={() => onNavigate('organizacion')}
          >
            <div>
              <div
                className="el-module-icon-wrap"
                style={{ backgroundColor: 'var(--el-success-soft)', color: 'var(--el-success-light)' }}
              >
                <LuUsers size={22} />
              </div>
              <h3>Organización de Grupos</h3>
              <p>
                Plano interactivo del escenario, 6 departamentos, distribuidor automático de elenco y plan de 8 semanas.
              </p>
            </div>
            <span className="el-module-link">
              Planificar equipo <LuChevronRight size={15} />
            </span>
          </button>

          <button
            type="button"
            className="el-card el-card-interactive el-module-card"
            onClick={() => onNavigate('consejos')}
          >
            <div>
              <div
                className="el-module-icon-wrap"
                style={{ backgroundColor: 'var(--el-wisdom-soft)', color: 'var(--el-wisdom)' }}
              >
                <LuCompass size={22} />
              </div>
              <h3>Consejos de Escena</h3>
              <p>
                Simulador de salvavidas en vivo, reglas de oro de proyección y respiración 4-4-4 multicolor.
              </p>
            </div>
            <span className="el-module-link">
              Explorar consejos <LuChevronRight size={15} />
            </span>
          </button>
        </div>
      </section>

      {/* Termómetro con medidor radial SVG */}
      <section className="el-card" aria-label="Termómetro de Preparación Escénica">
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="el-section-eyebrow">
            <LuTarget size={14} /> Diagnóstico Interactivo
          </span>
          <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.6rem', margin: '0 0 0.35rem' }}>
            Termómetro de Preparación Escénica
          </h2>
          <p style={{ margin: 0, fontSize: '0.94rem' }}>
            Evalúa del 1 (en inicio) al 5 (consolidado) cómo se encuentra tu grupo hoy para recibir una ruta recomendada.
          </p>
        </div>

        <div className="el-thermometer-grid">
          <div>
            {pillars.map((item) => (
              <div key={item.id} className="el-thermo-row">
                <div className="el-thermo-header">
                  <strong style={{ fontSize: '0.94rem' }}>{item.label}</strong>
                  <span className="el-badge el-badge-challenge">{item.score} / 5</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--el-text-muted)' }}>
                  {item.hint}
                </div>
                <div
                  className="el-thermo-score-pills"
                  role="group"
                  aria-label={`Puntuación para ${item.label}`}
                >
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`el-score-pill ${item.score === val ? 'selected' : ''}`}
                      onClick={() => updateScore(item.id, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="el-thermo-result-box">
            <div className="el-gauge-wrap">
              <svg width="152" height="152" viewBox="0 0 152 152" aria-hidden="true">
                <circle
                  cx="76"
                  cy="76"
                  r={gaugeRadius}
                  fill="none"
                  stroke="var(--el-border)"
                  strokeWidth="12"
                />
                <circle
                  cx="76"
                  cy="76"
                  r={gaugeRadius}
                  fill="none"
                  stroke={diagnosis.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={gaugeCirc}
                  strokeDashoffset={gaugeOffset}
                  transform="rotate(-90 76 76)"
                  style={{ transition: 'stroke-dashoffset 420ms ease, stroke 300ms ease' }}
                />
              </svg>
              <div className="el-gauge-label">
                <span style={{ fontFamily: 'var(--el-font-serif)', fontSize: '2rem', fontWeight: 800, color: diagnosis.color }}>
                  {percentage}%
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase' }}>
                  Preparación
                </span>
              </div>
            </div>

            <h3 style={{ margin: '0.25rem 0 0.45rem', fontSize: '1.08rem', color: diagnosis.color }}>
              {diagnosis.stage}
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem' }}>
              {diagnosis.message}
            </p>

            <button
              type="button"
              className="el-btn el-btn-primary"
              style={{ width: '100%' }}
              onClick={() => onNavigate(diagnosis.recommendedRoute)}
            >
              {diagnosis.actionLabel} <LuArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// VISTA 2: EL PROCESO TEATRAL (6 Fases + Checklist Persistente + XP)
// ============================================================================

interface ProcessViewProps {
  checkedItems: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
}

const ProcessView: React.FC<ProcessViewProps> = ({ checkedItems, onToggleCheck }) => {
  const [activePhaseId, setActivePhaseId] = useState<number>(1);

  const activePhase = useMemo(
    () => PROCESS_PHASES.find((p) => p.id === activePhaseId) || PROCESS_PHASES[0],
    [activePhaseId]
  );

  const totalChecks = useMemo(
    () => PROCESS_PHASES.reduce((sum, phase) => sum + phase.checklist.length, 0),
    []
  );

  const completedChecks = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems]
  );

  const globalPercent = Math.round((completedChecks / totalChecks) * 100);

  return (
    <div className="el-view-animate">
      <div className="el-section-header">
        <span className="el-section-eyebrow">
          <LuLayers size={14} /> Ruta de Montaje Profesional
        </span>
        <h1 className="el-page-title">El Proceso Teatral en 6 Fases</h1>
        <p className="el-page-lead">
          Un montaje exitoso se construye con método. Recorre cada estación y marca los hitos completados por tu compañía escolar.
        </p>
      </div>

      <div className="el-progress-banner">
        <div>
          <strong style={{ fontSize: '0.98rem', display: 'block' }}>
            Progreso de tu Montaje Escolar
          </strong>
          <span style={{ fontSize: '0.86rem', color: 'var(--el-text-muted)' }}>
            {completedChecks} de {totalChecks} hitos clave completados ({globalPercent}%)
          </span>
        </div>
        <div style={{ flex: '1 1 260px', maxWidth: '380px' }}>
          <div className="el-meter-track">
            <div className="el-meter-fill" style={{ width: `${globalPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="el-timeline-stepper" role="tablist" aria-label="Fases del proceso teatral">
        {PROCESS_PHASES.map((phase) => {
          const phaseDoneCount = phase.checklist.filter((c) => checkedItems[c.id]).length;
          const isFullyDone = phaseDoneCount === phase.checklist.length;
          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={activePhaseId === phase.id}
              className={`el-phase-tab ${activePhaseId === phase.id ? 'active' : ''} ${isFullyDone ? 'done' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setActivePhaseId(phase.id);
              }}
            >
              <span className="el-phase-num">
                <span>Fase 0{phase.id}</span>
                {isFullyDone && <LuCircleCheck size={15} color="var(--el-success-light)" />}
              </span>
              <span className="el-phase-tab-title">{phase.title}</span>
            </button>
          );
        })}
      </div>

      <div key={activePhase.id} className="el-phase-detail-grid el-view-animate">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="el-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.65rem',
              }}
            >
              <span className="el-badge el-badge-challenge">Fase 0{activePhase.id}</span>
              <span className="el-badge el-badge-guide">
                <LuCalendar size={13} /> {activePhase.durationHint}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.6rem', margin: '0 0 0.25rem' }}>
              {activePhase.title}
            </h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--el-text-muted)', fontSize: '0.9rem' }}>
              {activePhase.subtitle}
            </p>
            <div
              style={{
                background: 'var(--el-surface-elevated)',
                padding: '1rem 1.15rem',
                borderRadius: 'var(--el-radius-sm)',
                borderLeft: '4px solid var(--el-guide-light)',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--el-guide-light)',
                  marginBottom: '0.25rem',
                }}
              >
                Objetivo Pedagógico y Artístico
              </strong>
              <p style={{ margin: 0, fontSize: '0.94rem' }}>{activePhase.objective}</p>
            </div>
          </div>

          <div className="el-card">
            <h3
              style={{
                margin: '0 0 0.35rem',
                fontSize: '1.04rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <LuBookOpen size={18} color="var(--el-success-light)" /> Entregables Prácticos
            </h3>
            <ul className="el-list-styled">
              {activePhase.deliverables.map((item, idx) => (
                <li key={idx}>
                  <LuCheck size={16} color="var(--el-success-light)" style={{ flexShrink: 0, marginTop: '4px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="el-card"
            style={{
              borderColor: 'var(--el-error-border)',
              backgroundColor: 'var(--el-error-soft)',
            }}
          >
            <h3
              style={{
                margin: '0 0 0.35rem',
                fontSize: '1.04rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--el-error)',
              }}
            >
              <LuTriangleAlert size={18} /> Errores Comunes a Evitar
            </h3>
            <ul className="el-list-styled">
              {activePhase.commonMistakes.map((mistake, idx) => (
                <li key={idx}>
                  <span style={{ color: 'var(--el-error)', fontWeight: 800 }}>•</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="el-card" style={{ height: 'fit-content' }}>
          <span className="el-badge el-badge-success" style={{ marginBottom: '0.65rem' }}>
            ✓ Lista de Verificación (+15 XP c/u)
          </span>
          <h3 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.28rem', margin: '0 0 0.4rem' }}>
            Control de Calidad — Fase {activePhase.id}
          </h3>
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.88rem' }}>
            Marca cada logro conforme tu grupo lo complete en clase o ensayo (se guarda automáticamente).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activePhase.checklist.map((item) => {
              const isChecked = Boolean(checkedItems[item.id]);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`el-checklist-item ${isChecked ? 'checked' : ''}`}
                  onClick={() => onToggleCheck(item.id)}
                  aria-pressed={isChecked}
                >
                  {isChecked ? (
                    <LuCircleCheck
                      size={20}
                      color="var(--el-success-light)"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    />
                  ) : (
                    <LuCircle
                      size={20}
                      color="var(--el-text-muted)"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    />
                  )}
                  <span>{item.text}</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: '1.45rem',
              paddingTop: '1.1rem',
              borderTop: '1px solid var(--el-border)',
            }}
          >
            <button
              type="button"
              className="el-btn el-btn-secondary el-btn-sm"
              disabled={activePhaseId === 1}
              onClick={() => {
                soundEffects.playClick();
                setActivePhaseId((prev) => Math.max(1, prev - 1));
              }}
            >
              Fase anterior
            </button>
            <button
              type="button"
              className="el-btn el-btn-primary el-btn-sm"
              disabled={activePhaseId === 6}
              onClick={() => {
                soundEffects.playClick();
                setActivePhaseId((prev) => Math.min(6, prev + 1));
              }}
            >
              Siguiente fase <LuChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VISTA 3: LABORATORIO DE EJERCICIOS (Anillo SVG + Pasos Interactivos)
// ============================================================================

interface ExercisesViewProps {
  onExerciseDone: (title: string) => void;
}

const ExercisesView: React.FC<ExercisesViewProps> = ({ onExerciseDone }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('Todos');
  const [activeExercise, setActiveExercise] = useState<TheaterExercise>(THEATER_EXERCISES[0]);
  const [totalSeconds, setTotalSeconds] = useState<number>(THEATER_EXERCISES[0].durationMinutes * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(THEATER_EXERCISES[0].durationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const filteredExercises = useMemo(() => {
    if (selectedCategory === 'Todos') return THEATER_EXERCISES;
    return THEATER_EXERCISES.filter((ex) => ex.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setTimerFinished(true);
          soundEffects.playSuccess();
          onExerciseDone(activeExercise.title);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, activeExercise.title, onExerciseDone]);

  const loadExerciseInTimer = (exercise: TheaterExercise) => {
    soundEffects.playClick();
    setActiveExercise(exercise);
    const secs = exercise.durationMinutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(false);
    setTimerFinished(false);
    setCheckedSteps({});
  };

  const resetTimer = () => {
    soundEffects.playClick();
    setIsRunning(false);
    setTimerFinished(false);
    setSecondsLeft(totalSeconds);
  };

  const adjustMinutes = (deltaMinutes: number) => {
    soundEffects.playClick();
    const nextTotal = Math.max(60, Math.min(30 * 60, totalSeconds + deltaMinutes * 60));
    setTotalSeconds(nextTotal);
    setSecondsLeft(nextTotal);
    setIsRunning(false);
    setTimerFinished(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const ringRadius = 78;
  const ringCirc = 2 * Math.PI * ringRadius;
  const progressRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const ringOffset = ringCirc * (1 - progressRatio);

  return (
    <div className="el-view-animate">
      <div className="el-section-header">
        <span className="el-section-eyebrow">
          <LuClock size={14} /> Entrenamiento Actoral en Clase
        </span>
        <h1 className="el-page-title">Laboratorio de Ejercicios Teatrales</h1>
        <p className="el-page-lead">
          Filtra por categoría, carga una dinámica en el cronómetro circular y marca cada paso conforme guías al grupo.
        </p>
      </div>

      <div className="el-filter-bar" role="group" aria-label="Filtrar ejercicios por categoría">
        {EXERCISE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`el-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setSelectedCategory(cat);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="el-lab-layout">
        <div className="el-exercises-list">
          {filteredExercises.map((ex) => {
            const isSelected = activeExercise.id === ex.id;
            return (
              <article
                key={ex.id}
                className="el-card"
                style={{
                  borderColor: isSelected ? 'var(--el-challenge)' : undefined,
                  boxShadow: isSelected ? '0 0 18px rgba(245, 158, 11, 0.18)' : undefined,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span className="el-badge el-badge-guide">{ex.category}</span>
                    <span className="el-badge el-badge-wisdom">Nivel {ex.level}</span>
                    <span className="el-badge el-badge-success">
                      <LuClock size={12} /> {ex.durationMinutes} min
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`el-btn el-btn-sm ${isSelected ? 'el-btn-primary' : 'el-btn-secondary'}`}
                    onClick={() => loadExerciseInTimer(ex)}
                  >
                    {isSelected ? '✓ En cronómetro' : 'Cargar en cronómetro'}
                  </button>
                </div>

                <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.25rem', margin: '0 0 0.4rem' }}>
                  {ex.title}
                </h2>
                <p style={{ margin: '0 0 0.85rem', fontSize: '0.92rem' }}>
                  <strong>Objetivo:</strong> {ex.objective}
                </p>

                <ol
                  style={{
                    margin: '0 0 0.9rem',
                    paddingLeft: '1.25rem',
                    color: 'var(--el-text-secondary)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {ex.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                <div className="el-tip-callout" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <LuLightbulb
                    size={16}
                    color="var(--el-guide-light)"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />
                  <span>
                    <strong>Nota docente:</strong> {ex.teacherTip}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="el-card el-timer-sticky" aria-label="Temporizador de ensayo">
          <span className="el-badge el-badge-challenge">⏱ Temporizador de Ensayo</span>
          <h3 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.22rem', margin: '0.6rem 0 0.2rem' }}>
            {activeExercise.title}
          </h3>
          <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--el-text-muted)' }}>
            {activeExercise.category} · Sugerido: {activeExercise.durationMinutes} min
          </p>

          {/* Reloj circular SVG */}
          <div className="el-timer-ring-wrap">
            <svg width="184" height="184" viewBox="0 0 184 184" aria-hidden="true">
              <circle
                cx="92"
                cy="92"
                r={ringRadius}
                fill="none"
                stroke="var(--el-surface-elevated)"
                strokeWidth="12"
              />
              <circle
                cx="92"
                cy="92"
                r={ringRadius}
                fill="none"
                stroke={timerFinished ? 'var(--el-success-light)' : isRunning ? 'var(--el-challenge)' : 'var(--el-guide-light)'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 92 92)"
                style={{ transition: 'stroke-dashoffset 400ms linear, stroke 250ms ease' }}
              />
            </svg>
            <div className="el-timer-ring-center" aria-live="polite">
              <span className="el-timer-digits">{formatTime(secondsLeft)}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--el-text-muted)', marginTop: '4px' }}>
                {timerFinished ? '¡COMPLETADO!' : isRunning ? 'EN CURSO' : 'LISTO'}
              </span>
            </div>
          </div>

          {timerFinished && (
            <div
              style={{
                background: 'var(--el-success-soft)',
                border: '1px solid var(--el-success-border)',
                color: 'var(--el-success-light)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--el-radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '0.9rem',
              }}
            >
              ¡Tiempo completado! Tomen 30 s para compartir qué observaron.
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem' }}>
            <button
              type="button"
              className="el-btn el-btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                soundEffects.playClick();
                if (secondsLeft === 0) setSecondsLeft(totalSeconds);
                setTimerFinished(false);
                setIsRunning((prev) => !prev);
              }}
            >
              {isRunning ? <LuPause size={16} /> : <LuPlay size={16} />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              type="button"
              className="el-btn el-btn-secondary"
              onClick={resetTimer}
              aria-label="Reiniciar temporizador"
            >
              <LuRotateCcw size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '0.9rem',
              marginBottom: '0.9rem',
              borderBottom: '1px solid var(--el-border)',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--el-text-muted)' }}>Ajustar:</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="el-btn el-btn-secondary el-btn-sm"
                onClick={() => adjustMinutes(-1)}
              >
                -1 min
              </button>
              <button
                type="button"
                className="el-btn el-btn-secondary el-btn-sm"
                onClick={() => adjustMinutes(1)}
              >
                +1 min
              </button>
            </div>
          </div>

          {/* Pasos clicables en vivo para el docente */}
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--el-guide-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Guía Rápida de Pasos
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {activeExercise.steps.map((step, i) => {
                const done = Boolean(checkedSteps[i]);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`el-step-check-btn ${done ? 'done' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setCheckedSteps((prev) => ({ ...prev, [i]: !prev[i] }));
                    }}
                  >
                    {done ? (
                      <LuCircleCheck size={16} color="var(--el-success-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <LuCircle size={16} color="var(--el-text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span>
                      <strong>{i + 1}.</strong> {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ============================================================================
// VISTA 4: ORGANIZACIÓN (Plano Escénico Interactivo + Departamentos + Plan)
// ============================================================================

const OrganizationView: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(DEPARTMENTS[0].id);
  const [studentCount, setStudentCount] = useState<number>(20);
  const [playFormat, setPlayFormat] = useState<PlayFormat>('clasica');

  const activeDept = useMemo(
    () => DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0],
    [selectedDeptId]
  );

  const distribution = useMemo(() => {
    const n = Math.max(6, Math.min(40, studentCount));

    const actorRatio = playFormat === 'coral' ? 0.62 : playFormat === 'clasica' ? 0.52 : 0.45;
    let actors = Math.max(3, Math.round(n * actorRatio));
    let remaining = n - actors;

    if (remaining < 3 && n >= 6) {
      actors = n - 3;
      remaining = 3;
    }

    const direction = remaining >= 7 ? 2 : 1;
    const left = Math.max(0, remaining - direction);

    const scenography = Math.max(1, Math.round(left * 0.32));
    const lightingSound = Math.max(1, Math.round(left * 0.24));
    const wardrobe = Math.max(0, Math.round(left * 0.24));
    const production = Math.max(0, left - scenography - lightingSound - wardrobe);

    const sum = actors + direction + scenography + lightingSound + wardrobe + production;
    const diff = n - sum;
    if (diff !== 0) {
      actors = Math.max(2, actors + diff);
    }

    const rows = [
      { label: 'Elenco Actoral', count: actors, color: '#f59e0b', note: 'Protagonistas, secundarios y ensamble' },
      { label: 'Dirección y Asistencia', count: direction, color: '#818cf8', note: 'Coordinación artística y libro de dirección' },
      { label: 'Escenografía y Utilería', count: scenography, color: '#10b981', note: 'Espacio, objetos y cambios de escena' },
      { label: 'Iluminación y Sonido', count: lightingSound, color: '#38bdf8', note: 'Guion técnico, pistas y atmósfera' },
      { label: 'Vestuario y Maquillaje', count: wardrobe, color: '#a78bfa', note: 'Identidad visual y camerinos' },
      { label: 'Producción y Comunicación', count: production, color: '#fb923c', note: 'Difusión, programas y recepción' },
    ].filter((r) => r.count > 0);

    const advice =
      n <= 10
        ? 'Grupo compacto: los roles técnicos pueden combinarse (ej. Vestuario + Utilería) y algunos actores apoyan la difusión previa.'
        : n <= 24
          ? 'Tamaño ideal de compañía escolar: cada departamento tiene responsables dedicados sin sobrecargar a ningún estudiante.'
          : 'Grupo numeroso: considera escenas corales, doble elenco alterno o subdividir Escenografía y Producción en subcomisiones claras.';

    return { rows, advice, total: n };
  }, [studentCount, playFormat]);

  const weeklyPlan = useMemo(() => {
    const focusLabel =
      playFormat === 'coral'
        ? 'trabajo de movimiento coral y voces en conjunto'
        : playFormat === 'corta'
          ? 'ritmo ágil de escenas breves y transiciones limpias'
          : 'profundidad de personajes y arquitectura de actos';

    return [
      { week: 'Semana 1', title: 'Selección y Roles', detail: `Lectura exploratoria, asignación de los ${studentCount} integrantes y concepto visual.` },
      { week: 'Semana 2', title: 'Lectura de Mesa', detail: 'Análisis de escenas, ficha de personaje y lista inicial de utilería y vestuario.' },
      { week: 'Semana 3', title: 'Trazo Escénico I', detail: `Levantamiento de primera mitad de la obra con énfasis en ${focusLabel}.` },
      { week: 'Semana 4', title: 'Trazo Escénico II', detail: 'Cierre de desplazamientos completos y bocetos finales de escenografía y audio.' },
      { week: 'Semana 5', title: 'Sin Libreto', detail: 'Memorización consolidada, integración de objetos de ensayo y pruebas de sonido.' },
      { week: 'Semana 6', title: 'Ritmo y Transiciones', detail: 'Corridas por bloques, afinación emocional y diseño de programas y carteles.' },
      { week: 'Semana 7', title: 'Técnico y General', detail: 'Sincronización de luces, pistas, vestuario completo y dos corridas sin cortes.' },
      { week: 'Semana 8', title: 'Estreno y Cierre', detail: 'Función ante la comunidad educativa, desmontaje ordenado y círculo de reflexión.' },
    ];
  }, [studentCount, playFormat]);

  return (
    <div className="el-view-animate">
      <div className="el-section-header">
        <span className="el-section-eyebrow">
          <LuUsers size={14} /> Producción Escolar Profesional
        </span>
        <h1 className="el-page-title">Organización de Grupos y Escenario</h1>
        <p className="el-page-lead">
          Explora cómo se reparte el espacio en el plano interactivo, conoce los 6 departamentos y calcula la distribución ideal para tu clase.
        </p>
      </div>

      {/* Plano Interactivo del Escenario */}
      <StageMapInteractive />

      {/* Explorador de Departamentos */}
      <section style={{ marginBottom: '2.25rem' }}>
        <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.42rem', margin: '0 0 1rem' }}>
          1. Explorador de Departamentos Teatrales
        </h2>

        <div className="el-dept-tabs" role="tablist" aria-label="Departamentos teatrales">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              type="button"
              role="tab"
              aria-selected={selectedDeptId === dept.id}
              className={`el-dept-tab ${selectedDeptId === dept.id ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setSelectedDeptId(dept.id);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: dept.colorToken,
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: '0.92rem' }}>{dept.name}</strong>
              </div>
              <span style={{ fontSize: '0.79rem', color: 'var(--el-text-muted)', display: 'block' }}>
                {dept.tagline}
              </span>
            </button>
          ))}
        </div>

        <div
          key={activeDept.id}
          className="el-card el-view-animate"
          style={{ borderTop: `4px solid ${activeDept.colorToken}` }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.38rem', margin: '0 0 0.4rem' }}>
                {activeDept.name}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.93rem' }}>{activeDept.mission}</p>
              <div
                style={{
                  background: 'var(--el-surface-elevated)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--el-radius-sm)',
                  fontSize: '0.87rem',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                  Perfil ideal en clase:
                </strong>
                <span style={{ color: 'var(--el-text-secondary)' }}>{activeDept.idealProfile}</span>
              </div>
            </div>

            <div>
              <strong
                style={{
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--el-guide-light)',
                }}
              >
                Funciones Clave en un Montaje Escolar
              </strong>
              <ul className="el-list-styled" style={{ marginBottom: '1rem' }}>
                {activeDept.responsibilities.map((resp, idx) => (
                  <li key={idx}>
                    <LuCheck
                      size={16}
                      color="var(--el-success-light)"
                      style={{ flexShrink: 0, marginTop: '4px' }}
                    />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
              <div className="el-tip-callout">
                <strong>Consejo profesional:</strong> {activeDept.proTip}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Distribuidor + Cronograma */}
      <section className="el-card">
        <span className="el-section-eyebrow">
          <LuSlidersHorizontal size={14} /> Herramienta de Planificación
        </span>
        <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.5rem', margin: '0 0 0.4rem' }}>
          2. Distribuidor de Elenco, Equipo Técnico y Cronograma
        </h2>
        <p style={{ margin: '0 0 1.4rem', fontSize: '0.93rem' }}>
          Ajusta el tamaño de tu grupo y el formato de la obra para calcular el reparto equilibrado y el plan de 8 semanas.
        </p>

        <div className="el-distributor-grid">
          <div
            style={{
              background: 'var(--el-surface-elevated)',
              padding: '1.3rem',
              borderRadius: 'var(--el-radius-md)',
              border: '1px solid var(--el-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label htmlFor="el-student-range" style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                Cantidad total de estudiantes
              </label>
              <span
                style={{
                  fontFamily: 'var(--el-font-serif)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--el-challenge)',
                }}
              >
                {studentCount}
              </span>
            </div>

            <input
              id="el-student-range"
              type="range"
              min={6}
              max={40}
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              className="el-range-input"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--el-text-muted)',
                marginBottom: '1.2rem',
              }}
            >
              <span>6 alumnos</span>
              <span>20 alumnos</span>
              <span>40 alumnos</span>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Formato del montaje
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {(
                  [
                    { id: 'corta', label: 'Obra corta / Escenas enlazadas (15-25 min)' },
                    { id: 'clasica', label: 'Comedia o drama estructurado (30-45 min)' },
                    { id: 'coral', label: 'Montaje coral / Teatro físico grupal' },
                  ] as { id: PlayFormat; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setPlayFormat(opt.id);
                    }}
                    style={{
                      minHeight: '42px',
                      textAlign: 'left',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--el-radius-sm)',
                      border: `1px solid ${playFormat === opt.id ? 'var(--el-challenge)' : 'var(--el-border)'}`,
                      background: playFormat === opt.id ? 'var(--el-challenge-soft)' : 'var(--el-surface-1)',
                      color: playFormat === opt.id ? 'var(--el-challenge)' : 'var(--el-text-primary)',
                      fontWeight: playFormat === opt.id ? 700 : 500,
                      fontFamily: 'inherit',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="el-tip-callout">
              <strong>Sugerencia pedagógica:</strong> {distribution.advice}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.04rem' }}>
              Distribución Sugerida para {distribution.total} Estudiantes
            </h3>
            {distribution.rows.map((row) => {
              const pct = Math.round((row.count / distribution.total) * 100);
              return (
                <div key={row.label} className="el-dist-bar-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.92rem' }}>
                    <strong>{row.label}</strong>
                    <span>
                      <strong style={{ color: row.color }}>{row.count}</strong>{' '}
                      <span style={{ color: 'var(--el-text-muted)', fontSize: '0.82rem' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--el-text-muted)' }}>{row.note}</div>
                  <div className="el-dist-bar-track">
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: row.color,
                        borderRadius: '999px',
                        transition: 'width 320ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.65rem', borderTop: '1px solid var(--el-border)' }}>
          <h3
            style={{
              fontFamily: 'var(--el-font-serif)',
              fontSize: '1.28rem',
              margin: '0 0 0.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <LuCalendar size={20} color="var(--el-challenge)" /> Cronograma Sugerido de 8 Semanas
          </h3>
          <p style={{ margin: 0, fontSize: '0.87rem' }}>
            Pensado para 2 sesiones de ensayo por semana de 60 a 90 minutos.
          </p>

          <div className="el-schedule-grid">
            {weeklyPlan.map((item) => (
              <div key={item.week} className="el-week-card">
                <span className="el-badge el-badge-guide" style={{ marginBottom: '0.45rem' }}>
                  {item.week}
                </span>
                <strong style={{ display: 'block', fontSize: '0.91rem', marginBottom: '0.25rem' }}>
                  {item.title}
                </strong>
                <p style={{ margin: 0, fontSize: '0.81rem', lineHeight: 1.45 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// VISTA 5: CONSEJOS DE ESCENA (Simulador Salvavidas + Reglas + Respiración)
// ============================================================================

type BreathPhase = 'idle' | 'inhalar' | 'sostener' | 'exhalar';

interface AdviceViewProps {
  onRescueSolved: () => void;
}

const AdviceView: React.FC<AdviceViewProps> = ({ onRescueSolved }) => {
  const [expandedRuleId, setExpandedRuleId] = useState<string>(GOLDEN_RULES[0].id);

  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathSecond, setBreathSecond] = useState<number>(4);
  const [cyclesDone, setCyclesDone] = useState<number>(0);

  const phaseRef = useRef<BreathPhase>('inhalar');
  const secRef = useRef<number>(4);

  useEffect(() => {
    if (!breathActive) return;

    phaseRef.current = 'inhalar';
    secRef.current = 4;
    soundEffects.playBreathPhase('inhale');

    const interval = window.setInterval(() => {
      if (secRef.current > 1) {
        secRef.current -= 1;
        setBreathSecond(secRef.current);
      } else {
        if (phaseRef.current === 'inhalar') {
          phaseRef.current = 'sostener';
          soundEffects.playBreathPhase('hold');
        } else if (phaseRef.current === 'sostener') {
          phaseRef.current = 'exhalar';
          soundEffects.playBreathPhase('exhale');
        } else {
          phaseRef.current = 'inhalar';
          soundEffects.playBreathPhase('inhale');
          setCyclesDone((c) => c + 1);
        }
        secRef.current = 4;
        setBreathPhase(phaseRef.current);
        setBreathSecond(4);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [breathActive]);

  const toggleBreath = () => {
    soundEffects.playClick();
    setBreathActive((prev) => {
      const next = !prev;
      if (next) {
        setBreathPhase('inhalar');
        setBreathSecond(4);
      } else {
        setBreathPhase('idle');
        setBreathSecond(4);
      }
      return next;
    });
  };

  const renderRuleIcon = (iconName: GoldenRule['iconName']) => {
    switch (iconName) {
      case 'volume':
        return <LuVolume2 size={20} color="var(--el-guide-light)" />;
      case 'eye':
        return <LuEye size={20} color="var(--el-challenge)" />;
      case 'heart':
        return <LuHeartHandshake size={20} color="var(--el-success-light)" />;
      case 'shield':
        return <LuShieldAlert size={20} color="var(--el-error)" />;
      case 'award':
        return <LuAward size={20} color="var(--el-wisdom)" />;
    }
  };

  const breathVisual = useMemo(() => {
    switch (breathPhase) {
      case 'inhalar':
        return {
          label: 'Inhala',
          sub: 'Llena el abdomen lentamente por la nariz',
          orbClass: 'expand',
          ringColor: '#38bdf8',
          orbBg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
        };
      case 'sostener':
        return {
          label: 'Sostén',
          sub: 'Mantén los hombros relajados y la mente serena',
          orbClass: 'hold',
          ringColor: '#f59e0b',
          orbBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        };
      case 'exhalar':
        return {
          label: 'Exhala',
          sub: 'Suelta el aire suave por la boca liberando tensión',
          orbClass: 'contract',
          ringColor: '#34d399',
          orbBg: 'linear-gradient(135deg, #34d399, #10b981)',
        };
      default:
        return {
          label: 'Listo',
          sub: 'Presiona iniciar para realizar 3 ciclos antes de salir a escena',
          orbClass: '',
          ringColor: '#818cf8',
          orbBg: 'linear-gradient(135deg, #818cf8, #6366f1)',
        };
    }
  }, [breathPhase]);

  const bRadius = 82;
  const bCirc = 2 * Math.PI * bRadius;
  const bProgress = breathActive ? (5 - breathSecond) / 4 : 0;
  const bOffset = bCirc * (1 - bProgress);

  return (
    <div className="el-view-animate">
      <div className="el-section-header">
        <span className="el-section-eyebrow">
          <LuCompass size={14} /> Reglas de Oro del Escenario
        </span>
        <h1 className="el-page-title">Consejos Prácticos de Escena</h1>
        <p className="el-page-lead">
          Entrena tus reflejos con el simulador de emergencias en vivo, domina las reglas de oro y calma tus nervios con la respiración 4-4-4.
        </p>
      </div>

      <div className="el-consejos-layout">
        <div>
          <LiveRescueSimulator onSuccess={onRescueSolved} />

          {GOLDEN_RULES.map((rule) => {
            const isOpen = expandedRuleId === rule.id;
            return (
              <article key={rule.id} className="el-card el-rule-card">
                <button
                  type="button"
                  className="el-rule-toggle-btn"
                  aria-expanded={isOpen}
                  onClick={() => {
                    soundEffects.playClick();
                    setExpandedRuleId(isOpen ? '' : rule.id);
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--el-surface-elevated)',
                        border: '1px solid var(--el-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {renderRuleIcon(rule.iconName)}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: 'var(--el-guide-light)',
                        }}
                      >
                        {rule.category}
                      </span>
                      <h2 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.14rem', margin: '0.15rem 0 0.25rem' }}>
                        {rule.title}
                      </h2>
                      <p style={{ margin: 0, fontSize: '0.89rem' }}>{rule.summary}</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--el-text-muted)', flexShrink: 0, marginTop: '0.35rem' }}>
                    {isOpen ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      marginTop: '1.05rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--el-border)',
                    }}
                  >
                    <ul className="el-list-styled" style={{ marginTop: 0 }}>
                      {rule.practicalSteps.map((step, idx) => (
                        <li key={idx}>
                          <LuCircleCheck
                            size={16}
                            color="var(--el-success-light)"
                            style={{ flexShrink: 0, marginTop: '4px' }}
                          />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    {rule.emergencyPhrase && (
                      <div
                        style={{
                          marginTop: '1rem',
                          background: 'var(--el-challenge-soft)',
                          borderLeft: '4px solid var(--el-challenge)',
                          padding: '0.8rem 1rem',
                          borderRadius: 'var(--el-radius-sm)',
                          fontSize: '0.87rem',
                          color: 'var(--el-text-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {rule.emergencyPhrase}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Respiración 4-4-4 con anillo de color por etapa + sonido */}
        <aside className="el-card el-timer-sticky" aria-label="Guía de respiración 4-4-4">
          <span className="el-badge el-badge-success">
            <LuWind size={13} /> Control del Miedo Escénico
          </span>
          <h3 style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.3rem', margin: '0.6rem 0 0.35rem' }}>
            Respiración Guiada 4-4-4
          </h3>
          <p style={{ margin: 0, fontSize: '0.87rem' }}>
            El anillo cambia de color en cada etapa (Cian · Ámbar · Verde) acompañado de sonido suave de respiración.
          </p>

          <div className="el-breathing-stage">
            <div className="el-breath-ring-wrap">
              <svg
                width="186"
                height="186"
                viewBox="0 0 186 186"
                style={{ position: 'absolute', inset: 0 }}
                aria-hidden="true"
              >
                <circle cx="93" cy="93" r={bRadius} fill="none" stroke="var(--el-border)" strokeWidth="8" />
                <circle
                  cx="93"
                  cy="93"
                  r={bRadius}
                  fill="none"
                  stroke={breathVisual.ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={bCirc}
                  strokeDashoffset={bOffset}
                  transform="rotate(-90 93 93)"
                  style={{ transition: 'stroke-dashoffset 850ms linear, stroke 320ms ease' }}
                />
              </svg>

              <div
                className={`el-breath-orb-inner ${breathVisual.orbClass}`}
                style={{ background: breathVisual.orbBg }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {breathVisual.label}
                </span>
                {breathActive && (
                  <span style={{ fontFamily: 'var(--el-font-serif)', fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1 }}>
                    {breathSecond}
                  </span>
                )}
              </div>
            </div>

            <p style={{ margin: '0 0 0.45rem', textAlign: 'center', fontSize: '0.89rem', fontWeight: 600 }}>
              {breathVisual.sub}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--el-text-muted)' }}>
              Ciclos completados: <strong>{cyclesDone}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="el-btn el-btn-primary"
              style={{ flex: 1 }}
              onClick={toggleBreath}
            >
              {breathActive ? <LuPause size={16} /> : <LuPlay size={16} />}
              {breathActive ? 'Detener guía' : 'Iniciar respiración'}
            </button>
            {cyclesDone > 0 && (
              <button
                type="button"
                className="el-btn el-btn-secondary"
                onClick={() => {
                  soundEffects.playClick();
                  setBreathActive(false);
                  setBreathPhase('idle');
                  setBreathSecond(4);
                  setCyclesDone(0);
                }}
                aria-label="Reiniciar contador de ciclos"
              >
                <LuRotateCcw size={16} />
              </button>
            )}
          </div>

          <div className="el-tip-callout" style={{ marginTop: '1.1rem' }}>
            <strong>Tip antes del telón:</strong> Reemplaza{' '}
            <em>&ldquo;¿y si me equivoco?&rdquo;</em> por{' '}
            <em>&ldquo;vengo a regalar esta historia al público&rdquo;</em>.
          </div>
        </aside>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL INTEGRADO A SUTZ / CREATIKA
// ============================================================================

export default function TeatroEscolar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<TheaterTheme>('sutz-night');
  const [toastMsg, setToastMsg] = useState('');

  const initialSec = searchParams.get('sec') as RouteId | null;
  const [route, setRoute] = useState<RouteId>(
    initialSec && VALID_THEATER_ROUTES.includes(initialSec) ? initialSec : 'inicio'
  );

  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(XP_STORAGE_KEY);
      const parsed = saved ? parseInt(saved, 10) : 20;
      return Number.isNaN(parsed) ? 20 : parsed;
    } catch {
      return 20;
    }
  });

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { 'p1-1': true };
    } catch {
      return { 'p1-1': true };
    }
  });

  useEffect(() => {
    document.title = 'Escena Lab · Teatro Escolar | Suite Creatika';
    return () => {
      document.title = 'Lluvia de Ideas Editorial';
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2600);
  }, []);

  const awardXp = useCallback(
    (amount: number, reason: string) => {
      setXp((prev) => {
        const next = prev + amount;
        try {
          localStorage.setItem(XP_STORAGE_KEY, String(next));
        } catch {
          // Ignorar si almacenamiento está restringido
        }
        return next;
      });
      showToast(`+${amount} XP · ${reason}`);
    },
    [showToast]
  );

  const handleToggleCheck = useCallback(
    (id: string) => {
      soundEffects.playClick();
      setCheckedItems((prev) => {
        const wasChecked = Boolean(prev[id]);
        const next = { ...prev, [id]: !wasChecked };
        try {
          localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignorar si almacenamiento está restringido
        }
        if (!wasChecked) {
          awardXp(15, 'Hito de montaje completado');
        }
        return next;
      });
    },
    [awardXp]
  );

  const handleNavClick = useCallback(
    (target: RouteId) => {
      soundEffects.playClick();
      setRoute(target);
      setSearchParams({ sec: target }, { replace: true });
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const cycleTheme = () => {
    soundEffects.playClick();
    setTheme((prev) =>
      prev === 'sutz-night'
        ? 'classroom-light'
        : prev === 'classroom-light'
          ? 'high-contrast'
          : 'sutz-night'
    );
  };

  return (
    <div className="el-app" data-theme={theme}>
      <LandingTopBar slogan="Suite Creatika · Escena Lab (Teatro Escolar)" showHomeButton />

      <header className="el-subnav-header">
        <div className="el-header-inner">
          <div className="el-brand-group">
            <button
              type="button"
              className="el-back-btn"
              onClick={() => {
                soundEffects.playClick();
                navigate('/creatika');
              }}
              aria-label="Volver a Creatika"
            >
              <LuArrowLeft size={15} /> Creatika
            </button>

            <button
              type="button"
              className="el-brand-btn"
              onClick={() => handleNavClick('inicio')}
              aria-label="Ir al inicio de Escena Lab"
            >
              <div className="el-brand-mark">
                <TheaterBrandIcon />
              </div>
              <div>
                <span className="el-brand-title">Escena Lab</span>
                <span className="el-brand-sub">Teatro · Neurodiseño Sutz</span>
              </div>
            </button>
          </div>

          <nav className="el-desktop-nav" aria-label="Navegación de Escena Lab">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`el-nav-pill ${route === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={route === item.id ? 'page' : undefined}
              >
                {item.shortLabel}
              </button>
            ))}
          </nav>

          <div className="el-hud-right">
            <span className="el-xp-pill" title="Experiencia teatral acumulada">
              ★ {xp} XP
            </span>
            <button
              type="button"
              className="el-theme-btn"
              onClick={cycleTheme}
              title="Cambiar tema visual"
            >
              {theme === 'sutz-night' ? '🌌 Sutz' : theme === 'classroom-light' ? '☀️ Aula' : '◑ Alto'}
            </button>
            <button
              type="button"
              className="el-mobile-menu-btn"
              onClick={() => {
                soundEffects.playClick();
                setMobileMenuOpen((prev) => !prev);
              }}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>

        <nav className={`el-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-label="Navegación móvil">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`el-mobile-nav-item ${route === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span>{item.label}</span>
              <LuChevronRight size={16} />
            </button>
          ))}
        </nav>
      </header>

      <main className="el-main-container">
        {route === 'inicio' && (
          <HomeView
            theme={theme}
            onNavigate={handleNavClick}
            onStudioReward={(reason) => awardXp(20, reason)}
          />
        )}
        {route === 'proceso' && (
          <ProcessView checkedItems={checkedItems} onToggleCheck={handleToggleCheck} />
        )}
        {route === 'ejercicios' && (
          <ExercisesView onExerciseDone={(title) => awardXp(25, `Ejercicio completado: ${title}`)} />
        )}
        {route === 'organizacion' && <OrganizationView />}
        {route === 'consejos' && (
          <AdviceView onRescueSolved={() => awardXp(20, 'Salvavidas en escena dominado')} />
        )}
      </main>

      <footer className="el-site-footer">
        <div className="el-footer-inner">
          <div>
            <strong style={{ fontFamily: 'var(--el-font-serif)' }}>Escena Lab</strong> — Suite Creatika · Lluvia de Ideas Editorial.
          </div>
          <div>Integrado con sistema de Neurodiseño Sutz</div>
        </div>
      </footer>

      {toastMsg && (
        <div className="el-toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
