import React, { useEffect, useMemo, useState } from 'react';
import { KICHE_NAWALES } from '../../data/cholqijData';
import { soundEffects } from '../../utils/soundEffects';

interface CholqijMechanicsLabProps {
  simDay: number;
  onChangeSimDay: React.Dispatch<React.SetStateAction<number>>;
  renderNumeral: (value: number) => React.ReactNode;
}

/**
 * Teorema chino del resto para 13 × 20 = 260:
 * Dada una energía (1..13) y un índice de nawal (0..19) desde 1 B'atz' (día 1),
 * devuelve el único día (1..260) en el que coinciden.
 */
function getCycleDayForPair(energy: number, nawalIndex: number): number {
  const e0 = energy - 1;
  const zeroBased = (((40 * e0 - 39 * nawalIndex) % 260) + 260) % 260;
  return zeroBased + 1;
}

// Orden tradicional K'iche' iniciando en B'atz' (índice 10) hasta Tz'i' (índice 9)
const ORDERED_NAWALES = [...KICHE_NAWALES.slice(10), ...KICHE_NAWALES.slice(0, 10)];

const MILESTONES = [
  { day: 1, label: "Día 1 · 1 B'atz'", hint: 'Inicio alineado' },
  { day: 13, label: "Día 13 · 13 Aq'ab'al", hint: 'Fin 1.ª trecena' },
  { day: 14, label: "Día 14 · 1 K'at", hint: '1.º desfase' },
  { day: 21, label: "Día 21 · 8 B'atz'", hint: "Regreso B'atz'" },
  { day: 260, label: "Día 260 · 13 Tz'i'", hint: 'Cierre total' },
];

export const CholqijMechanicsLab: React.FC<CholqijMechanicsLabProps> = ({
  simDay,
  onChangeSimDay,
  renderNumeral,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(650);

  const simEnergy = ((simDay - 1) % 13) + 1;
  const simNawalIndex = (simDay - 1) % 20;
  const simNawal = ORDERED_NAWALES[simNawalIndex];
  const trecenaLap = Math.floor((simDay - 1) / 13) + 1;
  const veintenaLap = Math.floor((simDay - 1) / 20) + 1;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      onChangeSimDay((d) => (d >= 260 ? 1 : d + 1));
    }, speedMs);
    return () => clearInterval(timer);
  }, [isPlaying, speedMs, onChangeSimDay]);

  const dynamicInsight = useMemo(() => {
    if (simDay === 1) {
      return {
        badge: '✨ Punto de partida',
        text: "Ambas ruedas inician alineadas en el número 1 y el nawal B'atz'. A partir de aquí avanzan 1 posición juntas cada día.",
      };
    }
    if (simDay === 13) {
      return {
        badge: '⚡ Fin de la 1.ª trecena',
        text: 'La rueda de 13 energías llega a su tope (13), mientras que la rueda de 20 nahuales apenas va por su posición 13 (le faltan 7).',
      };
    }
    if (simDay === 14) {
      return {
        badge: '🔄 ¡Aquí ocurre el primer desfase!',
        text: "La rueda de 13 se reinicia en 1, pero la rueda de 20 sigue avanzando al 14.º nawal (K'at). Por ese desfase las parejas no se repiten.",
      };
    }
    if (simDay === 21) {
      return {
        badge: "🔁 Regreso de B'atz' con nueva energía",
        text: "Tras 20 días vuelve a aparecer B'atz', pero ahora acompañado de la energía 8 (no 1). B'atz' tendrá que pasar por las 13 energías antes de volver a 1 B'atz'.",
      };
    }
    if (simDay === 260) {
      return {
        badge: '🏁 ¡Ciclo sagrado completo!',
        text: "Se completaron exactamente 20 vueltas de 13 energías y 13 vueltas de 20 nahuales sin repetir ni una sola pareja. El siguiente día reinicia en 1 B'atz'.",
      };
    }
    if (simEnergy === 1) {
      return {
        badge: `🌱 Inicio de Trecena #${trecenaLap}`,
        text: `La rueda de 13 acaba de reiniciarse en 1, ahora emparejada con ${simNawal.name} (posición ${simNawalIndex + 1} de 20).`,
      };
    }
    if (simNawalIndex === 0) {
      return {
        badge: `🌀 Vuelta #${veintenaLap} de los 20 Nahuales`,
        text: `B'atz' vuelve a abrir la veintena, esta vez con la energía ${simEnergy}. Observa en la matriz cómo cada vuelta desplaza el punto en diagonal.`,
      };
    }
    return {
      badge: `🔭 Día ${simDay} de 260 en progreso`,
      text: `Rueda de 13 en vuelta ${trecenaLap}/20 (energía ${simEnergy}) y rueda de 20 en vuelta ${veintenaLap}/13 (${simNawal.name}). Cada combinación ocupa una casilla única en la matriz.`,
    };
  }, [simDay, simEnergy, simNawal.name, simNawalIndex, trecenaLap, veintenaLap]);

  const jumpToDay = (target: number) => {
    soundEffects.playClick();
    setIsPlaying(false);
    const wrapped = ((target - 1) % 260 + 260) % 260 + 1;
    onChangeSimDay(wrapped);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Panel principal de control y lectura en vivo */}
      <section className="cm-card">
        <div className="cm-mech-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="cm-mech-numeral-box">{renderNumeral(simEnergy)}</div>
            <div>
              <span className="cm-badge warm">Día {simDay} de 260</span>
              <h2 style={{ margin: '6px 0 2px', fontSize: '1.65rem', fontFamily: 'Georgia, serif' }}>
                {simEnergy} {simNawal.name} {simNawal.emoji}
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--cm-text-secondary)' }}>
                Trecena <strong>{trecenaLap}/20</strong> · Veintena <strong>{veintenaLap}/13</strong>
              </div>
            </div>
          </div>

          <div className="cm-mech-controls">
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              onClick={() => jumpToDay(simDay - 1)}
            >
              ◀ -1
            </button>
            <button
              type="button"
              className={`cm-btn ${isPlaying ? 'cm-btn-warm' : 'cm-btn-primary'}`}
              onClick={() => {
                soundEffects.playClick();
                setIsPlaying((p) => !p);
              }}
            >
              {isPlaying ? '⏸ Pausar' : '▶ Animar'}
            </button>
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              onClick={() => jumpToDay(simDay + 1)}
            >
              +1 ▶
            </button>
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              onClick={() => jumpToDay(simDay + 13)}
              title="Avanzar 1 trecena (13 días)"
            >
              +13
            </button>
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              onClick={() => jumpToDay(simDay + 20)}
              title="Avanzar 1 veintena (20 días)"
            >
              +20
            </button>
            <div className="cm-speed-group" role="group" aria-label="Velocidad de animación">
              {[
                { label: '1x', ms: 650 },
                { label: '3x', ms: 220 },
                { label: '8x', ms: 85 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={`cm-speed-btn ${speedMs === opt.ms ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setSpeedMs(opt.ms);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slider de línea de tiempo */}
        <div style={{ margin: '14px 0 12px' }}>
          <input
            type="range"
            min={1}
            max={260}
            value={simDay}
            onChange={(e) => {
              setIsPlaying(false);
              onChangeSimDay(Number(e.target.value));
            }}
            style={{ width: '100%', accentColor: 'var(--cm-accent-gold)', cursor: 'pointer' }}
            aria-label="Día del ciclo 13 por 20"
          />
        </div>

        {/* Banner dinámico explicativo */}
        <div className="cm-mech-insight">
          <span className="cm-badge">{dynamicInsight.badge}</span>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem' }}>{dynamicInsight.text}</p>
        </div>

        {/* Hitos guiados */}
        <div className="cm-mech-milestones">
          {MILESTONES.map((m) => (
            <button
              key={m.day}
              type="button"
              className={`cm-milestone-btn ${simDay === m.day ? 'active' : ''}`}
              onClick={() => jumpToDay(m.day)}
            >
              <strong>{m.label}</strong>
              <span>{m.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dos pistas sincronizadas en vivo */}
      <section className="cm-grid-2">
        <div className="cm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>1. Rueda de 13 Energías</h3>
            <span className="cm-badge">Vuelta {trecenaLap} de 20</span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.84rem' }}>
            Avanza del 1 al 13 y se reinicia. Toca cualquier número para saltar a esa energía en esta trecena.
          </p>
          <div className="cm-track-13">
            {Array.from({ length: 13 }, (_, idx) => {
              const num = idx + 1;
              const isActive = num === simEnergy;
              const isPassed = num < simEnergy;
              return (
                <button
                  key={num}
                  type="button"
                  className={`cm-track-chip ${isActive ? 'active-jade' : ''} ${isPassed ? 'passed' : ''}`}
                  onClick={() => jumpToDay((trecenaLap - 1) * 13 + num)}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cm-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>2. Rueda de 20 Nahuales</h3>
            <span className="cm-badge warm">Vuelta {veintenaLap} de 13</span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.84rem' }}>
            Tarda 7 días más que la rueda de 13 en dar una vuelta. Toca cualquier nawal para inspeccionar su posición.
          </p>
          <div className="cm-track-20">
            {ORDERED_NAWALES.map((n, idx) => {
              const isActive = idx === simNawalIndex;
              const isPassed = idx < simNawalIndex;
              return (
                <button
                  key={n.slug}
                  type="button"
                  className={`cm-track-nawal ${isActive ? 'active-terra' : ''} ${isPassed ? 'passed' : ''}`}
                  onClick={() => jumpToDay((veintenaLap - 1) * 20 + idx + 1)}
                  title={`${n.name} (${idx + 1}/20)`}
                >
                  <span>{n.emoji}</span>
                  <span>{n.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Matriz Interactiva 13 × 20 = 260 */}
      <section className="cm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem' }}>
              3. Matriz de 260 Combinaciones Únicas (13 × 20)
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              Cada casilla es una pareja única de Energía + Nawal. Al animar, verás cómo el recorrido traza diagonales que llenan las 260 casillas sin repetir ninguna. <strong>Haz clic en cualquier casilla</strong> para saltar a ese día.
            </p>
          </div>
          <div className="cm-matrix-legend">
            <span><i className="cm-dot current" /> Día actual ({simDay})</span>
            <span><i className="cm-dot visited" /> Recorridos ({simDay - 1})</span>
            <span><i className="cm-dot pending" /> Pendientes ({260 - simDay})</span>
          </div>
        </div>

        <div className="cm-matrix-scroll">
          <div className="cm-matrix-table" role="grid" aria-label="Matriz de 13 energías por 20 nahuales">
            {/* Encabezado de columnas (1..13) */}
            <div className="cm-matrix-corner">Nawal \ Energía</div>
            {Array.from({ length: 13 }, (_, idx) => (
              <div
                key={`head-${idx + 1}`}
                className={`cm-matrix-col-head ${idx + 1 === simEnergy ? 'highlight' : ''}`}
              >
                {idx + 1}
              </div>
            ))}

            {/* 20 filas (Nahuales) × 13 columnas (Energías) */}
            {ORDERED_NAWALES.map((n, nIdx) => (
              <React.Fragment key={n.slug}>
                <div className={`cm-matrix-row-head ${nIdx === simNawalIndex ? 'highlight' : ''}`}>
                  <span>{n.emoji}</span>
                  <span>{n.name}</span>
                </div>
                {Array.from({ length: 13 }, (_, eIdx) => {
                  const energy = eIdx + 1;
                  const cellDay = getCycleDayForPair(energy, nIdx);
                  const isCurrent = cellDay === simDay;
                  const isVisited = cellDay < simDay;
                  return (
                    <button
                      key={`${n.slug}-${energy}`}
                      type="button"
                      className={`cm-matrix-cell ${isCurrent ? 'current' : isVisited ? 'visited' : ''}`}
                      onClick={() => jumpToDay(cellDay)}
                      title={`Día ${cellDay}: ${energy} ${n.name}`}
                      aria-label={`Día ${cellDay}: ${energy} ${n.name}`}
                    >
                      {cellDay}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
