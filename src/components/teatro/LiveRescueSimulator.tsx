import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';

interface RescueScenario {
  id: string;
  situation: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

const RESCUE_SCENARIOS: RescueScenario[] = [
  {
    id: 'blank',
    situation:
      'En plena escena dramática, tu compañero te mira en silencio y se queda completamente en blanco sin recordar su siguiente diálogo.',
    options: [
      {
        text: 'Le susurras el texto exacto mirando hacia bambalinas para pedir ayuda.',
        isCorrect: false,
        feedback:
          'Romper la ilusión o mirar a bambalinas alerta al público del error. El rescate siempre debe ocurrir dentro del personaje.',
      },
      {
        text: 'Desde tu personaje, le lanzas una frase que incluya la pista: "Todavía no me has explicado qué decía esa carta..."',
        isCorrect: true,
        feedback:
          '¡Excelente reflejo teatral! Darle una pista orgánica dentro de la situación rescata la escena sin que el público note nada.',
      },
      {
        text: 'Te ríes nervioso y esperas en silencio a que se acuerde.',
        isCorrect: false,
        feedback:
          'Reírse o congelarse aumenta la tensión del compañero y corta el ritmo de la historia.',
      },
    ],
  },
  {
    id: 'prop',
    situation:
      'Al entrar a escena notas que olvidaron poner en la mesa la llave que tu personaje debe encontrar para abrir el cofre.',
    options: [
      {
        text: 'Improvisas buscando en tu bolsillo o bajo una silla y justificas la acción sin detener el diálogo.',
        isCorrect: true,
        feedback:
          '¡Profesionalismo puro! Aceptas la realidad ("Sí, y además...") y resuelves la acción manteniendo la verdad de la escena.',
      },
      {
        text: 'Sales corriendo de escena gritando al equipo de utilería que traigan la llave.',
        isCorrect: false,
        feedback:
          'Salir de personaje y culpar a técnicos rompe la magia y la ética de compañía.',
      },
      {
        text: 'Dices al público "perdón, falta un objeto" y detienes la obra.',
        isCorrect: false,
        feedback:
          'El público no conoce el guion técnico; solo nota un problema si el actor lo anuncia.',
      },
    ],
  },
  {
    id: 'audio',
    situation:
      'Debía sonar un trueno dramático tras tu frase final, pero el audio tarda 3 segundos en dispararse.',
    options: [
      {
        text: 'Miras hacia la cabina de sonido haciendo señas con la mano.',
        isCorrect: false,
        feedback:
          'Mirar a cabina delata el desfase técnico y saca al público de la historia.',
      },
      {
        text: 'Sostienes la mirada intensa hacia el cielo o tu compañero, llenando esos 3 segundos con tensión silenciosa.',
        isCorrect: true,
        feedback:
          '¡Magistral! Una pausa cargada de intención convierte un retraso técnico en suspenso cinematográfico.',
      },
      {
        text: 'Imitas el sonido del trueno con la boca y te vas rápido.',
        isCorrect: false,
        feedback:
          'Salir del tono de la obra puede provocar risa involuntaria en una escena seria.',
      },
    ],
  },
];

interface LiveRescueSimulatorProps {
  onSuccess?: () => void;
}

export const LiveRescueSimulator: React.FC<LiveRescueSimulatorProps> = ({ onSuccess }) => {
  const [idx, setIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const scenario = RESCUE_SCENARIOS[idx];

  const handleChoose = (optIdx: number) => {
    setSelectedOpt(optIdx);
    const chosen = scenario.options[optIdx];
    if (chosen.isCorrect) {
      soundEffects.playSuccess();
      if (!solvedIds.includes(scenario.id)) {
        setSolvedIds((prev) => [...prev, scenario.id]);
        onSuccess?.();
      }
    } else {
      soundEffects.playError();
    }
  };

  const nextScenario = () => {
    soundEffects.playClick();
    setSelectedOpt(null);
    setIdx((prev) => (prev + 1) % RESCUE_SCENARIOS.length);
  };

  return (
    <section className="el-card el-rescue-card" aria-label="Simulador de salvavidas en vivo">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span className="el-badge el-badge-challenge">⚡ Simulador de Salvavidas en Vivo</span>
        <span className="el-badge el-badge-success">
          {solvedIds.length} / {RESCUE_SCENARIOS.length} resueltos
        </span>
      </div>

      <h3 style={{ margin: '0 0 0.45rem', fontSize: '1.2rem' }}>
        ¿Qué harías si esto ocurre en pleno estreno?
      </h3>
      <p className="el-rescue-prompt">{scenario.situation}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.9rem' }}>
        {scenario.options.map((opt, oIdx) => {
          const isPicked = selectedOpt === oIdx;
          const stateClass = isPicked
            ? opt.isCorrect
              ? 'is-correct'
              : 'is-wrong'
            : '';
          return (
            <button
              key={oIdx}
              type="button"
              className={`el-rescue-option ${stateClass}`}
              onClick={() => handleChoose(oIdx)}
            >
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {selectedOpt !== null && (
        <div
          className={`el-rescue-feedback ${
            scenario.options[selectedOpt].isCorrect ? 'is-correct' : 'is-wrong'
          }`}
        >
          <p style={{ margin: 0 }}>{scenario.options[selectedOpt].feedback}</p>
          <button
            type="button"
            className="el-btn el-btn-secondary el-btn-sm"
            style={{ marginTop: '0.7rem' }}
            onClick={nextScenario}
          >
            Siguiente situación →
          </button>
        </div>
      )}
    </section>
  );
};
