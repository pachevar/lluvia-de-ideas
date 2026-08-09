import { useState } from 'react';

interface StrategyItem {
  title: string;
  desc: string;
}

interface AgeStageData {
  id: string;
  ageRange: string;
  title: string;
  badge: string;
  neuroFrame: string;
  skills: string[];
  strategies: StrategyItem[];
  teacherAlert: string;
}

const STAGES: AgeStageData[] = [
  {
    id: '5-6',
    ageRange: '5 a 6 años',
    title: 'Neurodesarrollo Sensoriomotor y Control Inhibitorio',
    badge: 'Primera Infancia / Transición Escolar',
    neuroFrame: 'A los 6 años, el volumen cerebral alcanza aproximadamente el 90% del tamaño adulto, pero la conectividad funcional en la corteza prefrontal es incipiente. Domina la maduración de las áreas motoras y somatosensoriales primarias, y el sistema límbico ejerce un fuerte control, causando volatilidad y emociones inmaduras. El control cognitivo inicial depende de fortalecer la corteza orbitofrontal y la prefrontal inferior.',
    skills: [
      'Control inhibitorio básico para detener respuestas automáticas',
      'Memoria de trabajo de un solo paso',
      'Flexibilidad cognitiva inicial',
      'Autorregulación emocional guiada',
      'Integración visomotora fina'
    ],
    strategies: [
      {
        title: 'Juegos de reglas invertidas',
        desc: 'Dinámicas lúdicas donde el niño debe realizar la acción opuesta a la señal que recibe (ej. tocarse la cabeza cuando escucha "pies") para entrenar la corteza prefrontal inferior.'
      },
      {
        title: 'Descansos activos sensoriomotores',
        desc: 'Pausas de 5 minutos de baile, percusión corporal o equilibrio que estimulan el cerebelo y recargan la atención.'
      },
      {
        title: 'Materiales táctiles y multisensoriales',
        desc: 'Uso de masas de modelar y bloques de construcción que integran las cortezas visual, somatosensorial y motora.'
      },
      {
        title: 'Dramatización y cuentos motores',
        desc: 'Representar físicamente personajes para unir lenguaje, emoción y control motor.'
      }
    ],
    teacherAlert: 'La atención sostenida en esta etapa dura solo de 10 a 15 minutos. Clases magistrales o inmovilidad prolongada elevan el cortisol, bloqueando la prefrontal emergente. Es vital un aula predecible y segura para no activar la amígdala.'
  },
  {
    id: '7-9',
    ageRange: '7 a 9 años',
    title: 'Consolidación Atencional y Redes Hipocámpicas',
    badge: 'Primaria Inicial / Operaciones Concretas',
    neuroFrame: 'Maduración acelerada de los sistemas de atención (alerta, orientación y control ejecutivo). Se incrementa drásticamente la conectividad funcional entre la corteza prefrontal dorsolateral (dlPFC) y el hipocampo, lo que ayuda a transicionar del razonamiento perceptual a la memoria de trabajo y la recuperación de recuerdos. Mayor velocidad de procesamiento gracias a la mielinización cortical.',
    skills: [
      'Atención sostenida e inhibición de interferencias en el aula',
      'Manipulación de 2 a 3 elementos en la memoria de trabajo',
      'Operaciones lógicas concretas (seriación, conservación, causalidad)',
      'Perseverancia ante tareas sin recompensa inmediata'
    ],
    strategies: [
      {
        title: 'Organizadores gráficos y listas visuales',
        desc: 'Estructuras que secuencian la resolución de problemas sirviendo de andamiaje a la corteza prefrontal.'
      },
      {
        title: 'Práctica del recuerdo activo (Active Retrieval)',
        desc: 'Preguntas rápidas de autoevaluación o cuestionarios intercalados para recuperar información del hipocampo y fijarla.'
      },
      {
        title: 'Gamificación con incertidumbre positiva',
        desc: 'Dinámicas lúdicas con recompensas inesperadas que activan el sistema dopaminérgico.'
      },
      {
        title: 'Pausas activas de coordinación cruzada',
        desc: 'Ejercicios cruzando la línea media corporal (ej. tocar rodilla izquierda con mano derecha) para activar el cuerpo calloso.'
      }
    ],
    teacherAlert: 'Alta fatiga cognitiva ante la monotonía verbal. Se aconsejan explicaciones teóricas cortas combinadas con manipulación práctica de conceptos. La curiosidad o la novedad actúan liberando noradrenalina y dopamina para enfocar la atención.'
  },
  {
    id: '10-12',
    ageRange: '10 a 12 años',
    title: 'Emergencia Metacognitiva y Reorganización Pre-Puberal',
    badge: 'Primaria Superior / Pre-Adolescencia',
    neuroFrame: 'Intensa reorganización neuroanatómica. Fluctuaciones del control conductual e impulsividad temporal a los 11 años vinculados con hormonas gonadales. El desarrollo de la corteza cingulada anterior y la densificación de la red parieto-frontal dan paso a la emergencia de la metacognición.',
    skills: [
      'Metacognición y monitorización del propio rendimiento',
      'Planificación multietapa (descomposición en submetas cronológicas)',
      'Razonamiento inductivo / deductivo inicial',
      'Empatía cognitiva y adopción de perspectiva ajena'
    ],
    strategies: [
      {
        title: 'Rutinas de pensamiento metacognitivo',
        desc: 'Preguntas de autoindagación antes, durante y después del trabajo (ej. "¿Por qué me he equivocado en este punto?").'
      },
      {
        title: 'Aprendizaje Basado en Problemas (ABP)',
        desc: 'Retos que plantean situaciones ambiguas del mundo real para resolver cooperativamente.'
      },
      {
        title: 'Debates sobre dilemas éticos y morales',
        desc: 'Espacios guiados que estimulan la corteza prefrontal medial y las áreas de teoría de la mente.'
      },
      {
        title: 'Proyectos de diseño e investigación cooperativa',
        desc: 'Equipos con división clara de roles para entrenar la función ejecutiva compartida.'
      }
    ],
    teacherAlert: 'La amenaza de exclusión o ridículo frente a pares activa los mismos circuitos que el dolor físico (corteza cingulada anterior dorsal), provocando secuestro emocional. Evitar comparaciones públicas y enfocar el feedback en el esfuerzo y la estrategia.'
  },
  {
    id: '13-15',
    ageRange: '13 a 15 años',
    title: 'Asincronía Límbico-Prefrontal y Razonamiento Hipotético',
    badge: 'Secundaria Inicial / Adolescencia Temprana',
    neuroFrame: 'Brecha o desbalance madurativo máximo. El sistema límbico (amígdala y núcleo accumbens) está hiperreactivo por influjo de hormonas sexuales, empujando a la búsqueda de novedades y recompensas sociales. Al mismo tiempo, el control de la corteza prefrontal dorsolateral y ventromedial madura de forma más lenta debido a que la poda sináptica y la mielinización continúan.',
    skills: [
      'Razonamiento hipotético-deductivo formal',
      'Comprensión de lenguajes simbólicos y abstractos',
      'Autorregulación emocional consciente (reevaluación cognitiva)',
      'Pensamiento crítico frente a información de medios e identidad'
    ],
    strategies: [
      {
        title: 'Seminarios Socráticos y debates formales',
        desc: 'Defensa de posturas basadas en datos concretos para entrenar la inhibición de la respuesta emotiva.'
      },
      {
        title: 'Proyectos conectados con el mundo real',
        desc: 'Metodologías aliadas con causas comunitarias o medioambientales que satisfagan el deseo de impacto y autonomía.'
      },
      {
        title: 'Simulaciones interactivas',
        desc: 'Juegos de rol académicos donde se tomen decisiones estratégicas en entornos científicos o históricos complejos.'
      },
      {
        title: 'Enseñanza explícita de la neurobiología',
        desc: 'Explicar a los alumnos cómo funciona su cerebro (su asincronía límbico-prefrontal) para incentivar la autorregulación emocional y disminuir la culpa.'
      }
    ],
    teacherAlert: 'Corregir de forma pública activa la amígdala y desencadena reacciones de confrontación o aislamiento. Gestionar la disciplina de forma privada y reflexiva. Adicionalmente, el retraso de dos horas de melatonina biológica desplaza el ciclo de sueño, causando fatiga si la jornada empieza muy temprano.'
  },
  {
    id: '16-18',
    ageRange: '16 a 18 años',
    title: 'Maduración Ventromedial, Autorregulación y Proyecto de Vida',
    badge: 'Bachillerato / Consolidación Ejecutiva',
    neuroFrame: 'Los tracts de sustancia blanca que enlazan la corteza prefrontal con el sistema límbico y áreas parietales/temporales logran una densidad de mielina avanzada. La corteza prefrontal ventromedial (vmPFC) consolida su integración funcional con la dorsolateral (dlPFC), habilitando una óptima regulación del comportamiento, toma de decisiones valorando consecuencias de largo plazo y planes autónomos.',
    skills: [
      'Aprendizaje Autorregulado (SRL)',
      'Toma de decisiones complejas bajo incertidumbre',
      'Análisis de sistemas globales y resiliencia ejecutiva',
      'Autogestión de la ansiedad y metas de largo plazo'
    ],
    strategies: [
      {
        title: 'Semilleros de investigación y proyectos longitudinales',
        desc: 'Trabajos de indagación científica extendidos que exigen gestión del tiempo y búsquedas bibliográficas avanzadas.'
      },
      {
        title: 'Aprendizaje-Servicio (ApS)',
        desc: 'Proyectos que aplican conocimientos avanzados para dar respuesta a necesidades reales detectadas en ONGs o comunidad.'
      },
      {
        title: 'Portafolios reflexivos de aprendizaje autorregulado',
        desc: 'Bitácoras donde el estudiante analiza su progreso, evalúa fallos metodológicos y proyecta mejoras continuas.'
      },
      {
        title: 'Técnicas de estudio basadas en neurociencia',
        desc: 'Práctica espaciada, estudio intercalado y elaboración explicativa para optimizar la consolidación a largo plazo.'
      }
    ],
    teacherAlert: 'El estrés crónico por la presión de los exámenes de acceso a la universidad genera elevación de glucocorticoides en sangre, afectando el hipocampo y desconectando la dlPFC, induciendo bloqueos de memoria. Integrar rutinas de manejo de estrés, higiene del sueño y mindfulness.'
  }
];

export default function NeuroGuiaSection() {
  const [activeTabId, setActiveTabId] = useState<string>('5-6');

  const currentStage = STAGES.find(s => s.id === activeTabId) || STAGES[0];

  return (
    <section className="neuro-guia-wrapper">
      <div className="neuro-guia-container">
        
        {/* 1. HERO MINI */}
        <div className="neuro-hero-mini">
          <span className="neuro-badge-pill">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Evidencia Científica & Neurodesarrollo
          </span>
          <h2 className="neuro-hero-title">
            Neurociencia Educativa aplicada al Aula: <br />
            <span className="neuro-gradient-text">Guía Práctica por Etapas de Desarrollo</span>
          </h2>
          <p className="neuro-hero-subtitle">
            Ajustando las exigencias curriculares al ritmo de maduración biológica del cerebro para potenciar el aprendizaje y evitar la frustración.
          </p>
        </div>

        {/* 2. TAB NAVIGATION BAR */}
        <div className="neuro-tabs-bar">
          {STAGES.map((stage) => {
            const isActive = stage.id === activeTabId;
            return (
              <button
                key={stage.id}
                className={`neuro-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTabId(stage.id)}
              >
                <span className="neuro-tab-age">{stage.ageRange}</span>
                <span className="neuro-tab-dot"></span>
              </button>
            );
          })}
        </div>

        {/* 3. STAGE CONTENT CARD */}
        <div className="neuro-stage-content key-fade-in" key={currentStage.id}>
          
          {/* Header of Stage */}
          <div className="neuro-stage-header">
            <div className="neuro-stage-title-wrap">
              <span className="neuro-stage-badge">{currentStage.badge}</span>
              <h3 className="neuro-stage-title">{currentStage.title}</h3>
            </div>
            <div className="neuro-stage-age-pill">
              <span>Etapa</span>
              <strong>{currentStage.ageRange}</strong>
            </div>
          </div>

          {/* Grid: Left Column (Biological Frame & Skills) | Right Column (Strategies & Tools) */}
          <div className="neuro-stage-grid">
            
            {/* Left Column */}
            <div className="neuro-stage-col-left">
              
              {/* Biological Frame Box */}
              <div className="neuro-card-box bio-box">
                <div className="neuro-card-box-header">
                  <span className="neuro-box-icon">🧠</span>
                  <h4>Marco Neurobiológico</h4>
                </div>
                <p className="neuro-box-text">{currentStage.neuroFrame}</p>
              </div>

              {/* Target Skills Box */}
              <div className="neuro-card-box skills-box">
                <div className="neuro-card-box-header">
                  <span className="neuro-box-icon">🎯</span>
                  <h4>Habilidades a Desarrollar</h4>
                </div>
                <ul className="neuro-skills-list">
                  {currentStage.skills.map((skill, idx) => (
                    <li key={idx}>
                      <span className="skill-check">✓</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Teacher Alert Box */}
              <div className="neuro-card-box alert-box">
                <div className="neuro-card-box-header">
                  <span className="neuro-box-icon">⚠️</span>
                  <h4>Alerta Docente</h4>
                </div>
                <p className="neuro-alert-text">{currentStage.teacherAlert}</p>
              </div>

            </div>

            {/* Right Column: Strategies */}
            <div className="neuro-stage-col-right">
              <div className="neuro-card-box strategies-wrapper-box">
                <div className="neuro-card-box-header">
                  <span className="neuro-box-icon">🛠️</span>
                  <h4>Herramientas y Estrategias Neurodidácticas</h4>
                </div>

                <div className="neuro-strategies-grid">
                  {currentStage.strategies.map((strat, idx) => (
                    <div key={idx} className="neuro-strategy-card">
                      <div className="strat-num">0{idx + 1}</div>
                      <div className="strat-body">
                        <h5>{strat.title}</h5>
                        <p>{strat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4. BENTO GRID - UNIVERSAL PRINCIPLES */}
        <div className="neuro-bento-section">
          <div className="neuro-bento-header">
            <span className="neuro-badge-pill-mint">Principios Fundamentales</span>
            <h3>Pilares Neurodidácticos Transversales</h3>
            <p>Factores biológicos clave que potencian el aprendizaje en cualquier etapa de edad.</p>
          </div>

          <div className="neuro-bento-grid">
            
            {/* Bento 1: La Emoción */}
            <div className="bento-card bento-emotion">
              <div className="bento-icon-wrap">
                <span className="bento-emoji">💖</span>
              </div>
              <h4 className="bento-title">La Emoción</h4>
              <p className="bento-text">
                Activa el sistema dopaminérgico a través del filtro amigdalino, abriendo el paso al procesamiento de información en el hipocampo para fijar la memoria.
              </p>
              <div className="bento-accent-line line-pink"></div>
            </div>

            {/* Bento 2: El Movimiento */}
            <div className="bento-card bento-movement">
              <div className="bento-icon-wrap">
                <span className="bento-emoji">🏃</span>
              </div>
              <h4 className="bento-title">El Movimiento</h4>
              <p className="bento-text">
                El ejercicio físico estimula la producción de la proteína BDNF, fomentando la neurogénesis en el hipocampo, optimizando la oxigenación y restaurando la energía atencional.
              </p>
              <div className="bento-accent-line line-mint"></div>
            </div>

            {/* Bento 3: Práctica de Recuperación */}
            <div className="bento-card bento-retrieval">
              <div className="bento-icon-wrap">
                <span className="bento-emoji">🔄</span>
              </div>
              <h4 className="bento-title">Práctica de Recuperación (Retrieval)</h4>
              <p className="bento-text">
                Reactivar de forma repetida las redes neuronales mediante el recuerdo activo resulta más eficiente para la consolidación que el reestudio pasivo.
              </p>
              <div className="bento-accent-line line-blue"></div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
