import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuMaximize2, LuMinimize2, LuSparkles, LuVolume2 } from 'react-icons/lu';
import { soundEffects } from '../../utils/soundEffects';

export type StageTheme = 'sutz-night' | 'classroom-light' | 'high-contrast';
type BackdropId = 'clasico' | 'noche' | 'bosque' | 'ciudad';
type ConsoleTab = 'luces' | 'escenografia' | 'blocking' | 'sonido';
type PropId = 'chair' | 'cube' | 'tree' | 'lantern';

interface StageActor {
  id: string;
  name: string;
  emoji: string;
  x: number; // porcentaje 14..86
  y: number; // porcentaje 58..90 (profundidad en el escenario)
  active: boolean;
}

interface LiveStageConsoleProps {
  theme: StageTheme;
  onActionReward?: (reason: string) => void;
}

const BACKDROPS: { id: BackdropId; label: string; icon: string }[] = [
  { id: 'clasico', label: 'Teatro Clásico', icon: '🏛️' },
  { id: 'noche', label: 'Noche Estrellada', icon: '🌌' },
  { id: 'bosque', label: 'Bosque Místico', icon: '🌲' },
  { id: 'ciudad', label: 'Plaza Urbana', icon: '🏙️' },
];

const STAGE_PROPS: { id: PropId; label: string; emoji: string; x: number; y: number }[] = [
  { id: 'chair', label: 'Silla', emoji: '🪑', x: 24, y: 78 },
  { id: 'cube', label: 'Cubo', emoji: '📦', x: 76, y: 80 },
  { id: 'tree', label: 'Árbol', emoji: '🌳', x: 18, y: 63 },
  { id: 'lantern', label: 'Farol', emoji: '🕯️', x: 82, y: 64 },
];

const INITIAL_ACTORS: StageActor[] = [
  { id: 'prota', name: 'Protagonista', emoji: '🎭', x: 50, y: 78, active: true },
  { id: 'mentor', name: 'Mentor', emoji: '🧙', x: 30, y: 70, active: false },
  { id: 'antag', name: 'Antagonista', emoji: '🕵️', x: 70, y: 70, active: false },
];

function getBlockingZoneLabel(x: number, y: number): string {
  const depth = y < 68 ? 'Foro' : y < 80 ? 'Centro' : 'Proscenio';
  const side = x < 38 ? 'Izquierdo' : x > 62 ? 'Derecho' : 'Central';
  return `${depth} ${side}`;
}

export const LiveStageConsole: React.FC<LiveStageConsoleProps> = ({ theme, onActionReward }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('luces');

  const [curtainOpen, setCurtainOpen] = useState(true);
  const [lights, setLights] = useState({
    amber: true,
    cyan: true,
    emerald: false,
    indigo: false,
  });
  const [dimmer, setDimmer] = useState(90);
  const [backdrop, setBackdrop] = useState<BackdropId>('clasico');
  const [actors, setActors] = useState<StageActor[]>(INITIAL_ACTORS);
  const [selectedActorId, setSelectedActorId] = useState<string>('prota');
  const [activeProps, setActiveProps] = useState<PropId[]>(['lantern']);
  const [fxFlash, setFxFlash] = useState<'none' | 'thunder' | 'applause' | 'bell'>('none');
  const [rewardedOnce, setRewardedOnce] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  const selectedActor = useMemo(
    () => actors.find((a) => a.id === selectedActorId) || actors[0],
    [actors, selectedActorId]
  );

  const sceneAtmosphereLabel = useMemo(() => {
    if (!curtainOpen) return 'Telón Cerrado · Preparación';
    if (dimmer === 0 || (!lights.amber && !lights.cyan && !lights.emerald && !lights.indigo)) {
      return 'Oscuro en Escena (Blackout)';
    }
    if (lights.amber && lights.indigo) return 'Clímax Dramático';
    if (lights.amber && lights.cyan) return 'Escena Equilibrada';
    if (lights.cyan) return 'Atmósfera Nocturna / Íntima';
    if (lights.emerald) return 'Bosque / Naturaleza Viva';
    if (lights.indigo) return 'Misterio / Contraluz';
    return 'Foco Protagónico';
  }, [curtainOpen, dimmer, lights]);

  const toggleLight = (key: keyof typeof lights) => {
    soundEffects.playClick();
    setLights((prev) => ({ ...prev, [key]: !prev[key] }));
    if (dimmer === 0) setDimmer(85);
  };

  const triggerFx = (fx: 'bell' | 'applause' | 'thunder' | 'drum') => {
    soundEffects.playTheaterFx(fx);
    if (fx === 'thunder' || fx === 'applause' || fx === 'bell') {
      setFxFlash(fx);
      window.setTimeout(() => setFxFlash('none'), 900);
    }
  };

  const applyPreset = (preset: 'climax' | 'monologo' | 'blackout' | 'saludo') => {
    soundEffects.playClick();
    if (preset === 'climax') {
      setCurtainOpen(true);
      setLights({ amber: true, cyan: false, emerald: false, indigo: true });
      setDimmer(95);
      setBackdrop('noche');
    } else if (preset === 'monologo') {
      setCurtainOpen(true);
      setLights({ amber: false, cyan: true, emerald: false, indigo: false });
      setDimmer(65);
      setActors((prev) =>
        prev.map((a) => (a.id === 'prota' ? { ...a, active: true, x: 50, y: 86 } : { ...a, active: false }))
      );
      setSelectedActorId('prota');
    } else if (preset === 'blackout') {
      setDimmer(0);
    } else {
      setCurtainOpen(true);
      setLights({ amber: true, cyan: true, emerald: true, indigo: true });
      setDimmer(100);
      setActors((prev) =>
        prev.map((a, idx) => ({
          ...a,
          active: true,
          x: idx === 0 ? 50 : idx === 1 ? 30 : 70,
          y: 84,
        }))
      );
      triggerFx('applause');
    }
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!curtainOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(14, Math.min(86, Math.round(rawX)));
    const clampedY = Math.max(58, Math.min(90, Math.round(rawY)));

    soundEffects.playClick();
    setActors((prev) =>
      prev.map((a) =>
        a.id === selectedActorId ? { ...a, active: true, x: clampedX, y: clampedY } : a
      )
    );
  };

  const toggleActorPresence = (id: string) => {
    soundEffects.playClick();
    setActors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    setSelectedActorId(id);
  };

  const toggleProp = (id: PropId) => {
    soundEffects.playClick();
    setActiveProps((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const openExpanded = () => {
    soundEffects.playClick();
    setIsExpanded(true);
    if (!rewardedOnce) {
      setRewardedOnce(true);
      onActionReward?.('Estudio de Escenario Ampliado explorado');
    }
  };

  const beamOpacity = dimmer / 100;

  const renderStageViewport = (large: boolean) => (
    <div
      className={`el-spotlight-stage el-backdrop-${backdrop} ${curtainOpen ? 'open' : ''} ${
        large ? 'is-large' : ''
      } ${fxFlash === 'thunder' ? 'fx-thunder' : ''}`}
      onClick={handleStageClick}
      role="region"
      aria-label="Escenario interactivo: toca el piso para mover al personaje seleccionado"
      title={curtainOpen ? `Toca el escenario para mover a ${selectedActor.name}` : 'Abre el telón para mover personajes'}
    >
      {/* Elementos decorativos según escenografía */}
      {backdrop === 'noche' && (
        <div className="el-scenery-stars" aria-hidden="true">
          <span style={{ left: '18%', top: '18%' }}>✦</span>
          <span style={{ left: '34%', top: '12%' }}>·</span>
          <span style={{ left: '72%', top: '16%' }}>🌙</span>
          <span style={{ left: '84%', top: '26%' }}>✦</span>
          <span style={{ left: '54%', top: '20%' }}>·</span>
        </div>
      )}
      {backdrop === 'bosque' && (
        <div className="el-scenery-silhouette" aria-hidden="true">
          🌲 🌳 🌲 🌲 🌳 🌲
        </div>
      )}
      {backdrop === 'ciudad' && (
        <div className="el-scenery-silhouette" aria-hidden="true">
          🏢 🏛️ 🏙️ 🏬 🏢
        </div>
      )}

      {/* Haces de luz DMX regulados por dimmer */}
      <div
        className={`el-beam el-beam-cyan ${lights.cyan ? 'on' : ''}`}
        style={{ opacity: lights.cyan ? beamOpacity : 0 }}
      />
      <div
        className={`el-beam el-beam-amber ${lights.amber ? 'on' : ''}`}
        style={{ opacity: lights.amber ? beamOpacity : 0 }}
      />
      <div
        className={`el-beam el-beam-emerald ${lights.emerald ? 'on' : ''}`}
        style={{ opacity: lights.emerald ? beamOpacity : 0 }}
      />
      <div
        className={`el-beam el-beam-indigo ${lights.indigo ? 'on' : ''}`}
        style={{ opacity: lights.indigo ? beamOpacity : 0 }}
      />

      {/* Oscurecimiento por dimmer */}
      <div
        className="el-dimmer-veil"
        style={{ opacity: Math.max(0, 1 - beamOpacity) * 0.88 }}
        aria-hidden="true"
      />

      {/* Utilería en escena */}
      {STAGE_PROPS.filter((p) => activeProps.includes(p.id)).map((prop) => (
        <div
          key={prop.id}
          className="el-stage-prop"
          style={{ left: `${prop.x}%`, top: `${prop.y}%` }}
          aria-hidden="true"
        >
          {prop.emoji}
        </div>
      ))}

      {/* Personajes posicionables (Blocking) */}
      {actors
        .filter((a) => a.active)
        .map((actor) => {
          const isSel = actor.id === selectedActorId;
          const depthScale = 0.82 + ((actor.y - 58) / 32) * 0.32;
          return (
            <button
              key={actor.id}
              type="button"
              className={`el-actor-token ${isSel ? 'selected' : ''}`}
              style={{
                left: `${actor.x}%`,
                top: `${actor.y}%`,
                transform: `translate(-50%, -85%) scale(${depthScale.toFixed(2)})`,
              }}
              onClick={(ev) => {
                ev.stopPropagation();
                soundEffects.playClick();
                setSelectedActorId(actor.id);
              }}
              title={`${actor.name} (${getBlockingZoneLabel(actor.x, actor.y)})`}
            >
              <span className="el-actor-emoji">{actor.emoji}</span>
              {large && <span className="el-actor-tag">{actor.name}</span>}
            </button>
          );
        })}

      {/* Telón teatral animado */}
      <div className="el-curtain-left" />
      <div className="el-curtain-right" />

      {/* Aviso visual de FX */}
      {fxFlash === 'applause' && <div className="el-fx-banner">👏👏👏 ¡Aplausos del Público!</div>}
      {fxFlash === 'bell' && <div className="el-fx-banner">🔔 ¡Tercera Llamada! Comenzamos...</div>}

      {/* Etiqueta de estado inferior */}
      <div className="el-stage-status-chip">
        <span>{sceneAtmosphereLabel}</span>
        <span>·</span>
        <span>{dimmer}%</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Vista Compacta en el Hero */}
      <div className="el-spotlight-box" aria-label="Consola interactiva de escenario">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--el-guide-light)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            🎛️ Consola de Escenario en Vivo
          </span>
          <button
            type="button"
            className="el-expand-btn"
            onClick={openExpanded}
          >
            <LuMaximize2 size={14} /> Ampliar Estudio
          </button>
        </div>

        {renderStageViewport(false)}

        <div className="el-console-btns">
          <button
            type="button"
            className={`el-console-btn ${curtainOpen ? 'on-wisdom' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setCurtainOpen((v) => !v);
            }}
          >
            {curtainOpen ? '🎬 Cerrar Telón' : '🎬 Abrir Telón'}
          </button>
          <button
            type="button"
            className={`el-console-btn ${lights.amber ? 'on-amber' : ''}`}
            onClick={() => toggleLight('amber')}
          >
            ☀️ Foco Ámbar
          </button>
          <button
            type="button"
            className={`el-console-btn ${lights.cyan ? 'on-cyan' : ''}`}
            onClick={() => toggleLight('cyan')}
          >
            💠 Atmósfera Cian
          </button>
          <button
            type="button"
            className={`el-console-btn ${lights.emerald ? 'on-emerald' : ''}`}
            onClick={() => toggleLight('emerald')}
          >
            🌿 Luz Esmeralda
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--el-text-muted)' }}>
          <span>💡 Toca el piso del escenario para mover al actor</span>
          <button
            type="button"
            className="el-mini-fx-btn"
            onClick={() => triggerFx('bell')}
            title="Tercera llamada"
          >
            <LuVolume2 size={13} /> 3.ª Llamada
          </button>
        </div>
      </div>

      {/* Vista Ampliada (Estudio Completo en Modal Sutz) */}
      {isExpanded &&
        createPortal(
          <div
            className="el-app el-studio-backdrop"
            data-theme={theme}
            onClick={() => setIsExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Estudio Técnico de Escenario Ampliado"
          >
            <div className="el-studio-modal" onClick={(e) => e.stopPropagation()}>
              {/* Barra superior del estudio */}
              <div className="el-studio-header">
                <div>
                  <span className="el-badge el-badge-challenge">
                    <LuSparkles size={13} /> Estudio Técnico Interactivo
                  </span>
                  <h2 style={{ margin: '4px 0 0', fontFamily: 'var(--el-font-serif)', fontSize: '1.45rem' }}>
                    Consola de Dirección, Luces y Blocking
                  </h2>
                </div>
                <button
                  type="button"
                  className="el-btn el-btn-secondary el-btn-sm"
                  onClick={() => {
                    soundEffects.playClick();
                    setIsExpanded(false);
                  }}
                >
                  <LuMinimize2 size={15} /> Cerrar Estudio
                </button>
              </div>

              {/* Cuerpo principal: Escenario grande + Mesa de Control */}
              <div className="el-studio-body">
                <div className="el-studio-stage-col">
                  {renderStageViewport(true)}

                  {/* Barra de info de Blocking en tiempo real */}
                  <div className="el-studio-blocking-bar">
                    <span>
                      <strong>Personaje activo:</strong> {selectedActor.emoji} {selectedActor.name}
                    </span>
                    <span className="el-badge el-badge-guide">
                      Zona: {getBlockingZoneLabel(selectedActor.x, selectedActor.y)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--el-text-muted)' }}>
                      Haz clic en cualquier punto del escenario para moverlo
                    </span>
                  </div>

                  {/* Presets (Cues rápidos de 1 clic) */}
                  <div className="el-presets-row">
                    <button type="button" className="el-preset-cue" onClick={() => applyPreset('climax')}>
                      ✨ Cue 1: Clímax
                    </button>
                    <button type="button" className="el-preset-cue" onClick={() => applyPreset('monologo')}>
                      🌙 Cue 2: Monólogo
                    </button>
                    <button type="button" className="el-preset-cue" onClick={() => applyPreset('blackout')}>
                      ⚡ Cue 3: Blackout
                    </button>
                    <button type="button" className="el-preset-cue" onClick={() => applyPreset('saludo')}>
                      👏 Cue 4: Saludo Final
                    </button>
                  </div>
                </div>

                {/* Mesa de control con pestañas */}
                <div className="el-studio-deck">
                  <div className="el-deck-tabs" role="tablist">
                    {(
                      [
                        { id: 'luces', label: '💡 Luces' },
                        { id: 'escenografia', label: '🎨 Escena' },
                        { id: 'blocking', label: '🎭 Elenco' },
                        { id: 'sonido', label: '🔊 Sonido' },
                      ] as { id: ConsoleTab; label: string }[]
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={consoleTab === t.id}
                        className={`el-deck-tab ${consoleTab === t.id ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setConsoleTab(t.id);
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {consoleTab === 'luces' && (
                    <div className="el-deck-panel el-view-animate">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label htmlFor="el-dimmer-range" style={{ fontSize: '0.86rem', fontWeight: 700 }}>
                          Intensidad Maestra (Dimmer)
                        </label>
                        <strong style={{ color: 'var(--el-challenge)' }}>{dimmer}%</strong>
                      </div>
                      <input
                        id="el-dimmer-range"
                        type="range"
                        min={0}
                        max={100}
                        value={dimmer}
                        onChange={(e) => setDimmer(Number(e.target.value))}
                        className="el-range-input"
                        style={{ marginBottom: '14px' }}
                      />

                      <div className="el-console-btns" style={{ marginBottom: '12px' }}>
                        <button
                          type="button"
                          className={`el-console-btn ${lights.amber ? 'on-amber' : ''}`}
                          onClick={() => toggleLight('amber')}
                        >
                          ☀️ Foco Ámbar
                        </button>
                        <button
                          type="button"
                          className={`el-console-btn ${lights.cyan ? 'on-cyan' : ''}`}
                          onClick={() => toggleLight('cyan')}
                        >
                          💠 Atmósfera Cian
                        </button>
                        <button
                          type="button"
                          className={`el-console-btn ${lights.emerald ? 'on-emerald' : ''}`}
                          onClick={() => toggleLight('emerald')}
                        >
                          🌿 Luz Esmeralda
                        </button>
                        <button
                          type="button"
                          className={`el-console-btn ${lights.indigo ? 'on-wisdom' : ''}`}
                          onClick={() => toggleLight('indigo')}
                        >
                          🔮 Contraluz Índigo
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="el-btn el-btn-secondary el-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            soundEffects.playClick();
                            setCurtainOpen((v) => !v);
                          }}
                        >
                          {curtainOpen ? '🎬 Cerrar Telón' : '🎬 Abrir Telón'}
                        </button>
                        <button
                          type="button"
                          className="el-btn el-btn-secondary el-btn-sm"
                          onClick={() => {
                            soundEffects.playClick();
                            setDimmer((d) => (d === 0 ? 90 : 0));
                          }}
                        >
                          ⚡ {dimmer === 0 ? 'Encender' : 'Blackout'}
                        </button>
                      </div>
                    </div>
                  )}

                  {consoleTab === 'escenografia' && (
                    <div className="el-deck-panel el-view-animate">
                      <strong style={{ display: 'block', fontSize: '0.84rem', marginBottom: '8px' }}>
                        Ciclorama / Fondo Escénico
                      </strong>
                      <div className="el-console-btns" style={{ marginBottom: '14px' }}>
                        {BACKDROPS.map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            className={`el-console-btn ${backdrop === bg.id ? 'on-cyan' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setBackdrop(bg.id);
                            }}
                          >
                            {bg.icon} {bg.label}
                          </button>
                        ))}
                      </div>

                      <strong style={{ display: 'block', fontSize: '0.84rem', marginBottom: '8px' }}>
                        Utilería en Escena
                      </strong>
                      <div className="el-console-btns">
                        {STAGE_PROPS.map((p) => {
                          const on = activeProps.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`el-console-btn ${on ? 'on-emerald' : ''}`}
                              onClick={() => toggleProp(p.id)}
                            >
                              {p.emoji} {p.label} {on ? '✓' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {consoleTab === 'blocking' && (
                    <div className="el-deck-panel el-view-animate">
                      <p style={{ margin: '0 0 10px', fontSize: '0.83rem' }}>
                        Activa personajes, elige uno y haz clic en cualquier parte del escenario para dirigir su trazo escénico.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {actors.map((a) => {
                          const isSel = a.id === selectedActorId;
                          return (
                            <div key={a.id} className={`el-actor-row ${isSel ? 'selected' : ''}`}>
                              <button
                                type="button"
                                className="el-actor-select-btn"
                                onClick={() => {
                                  soundEffects.playClick();
                                  setSelectedActorId(a.id);
                                }}
                              >
                                <span>{a.emoji}</span>
                                <div>
                                  <strong>{a.name}</strong>
                                  <small>{a.active ? getBlockingZoneLabel(a.x, a.y) : 'En bambalinas'}</small>
                                </div>
                              </button>
                              <button
                                type="button"
                                className={`el-console-btn ${a.active ? 'on-emerald' : ''}`}
                                onClick={() => toggleActorPresence(a.id)}
                              >
                                {a.active ? 'En escena' : 'Entrar'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {consoleTab === 'sonido' && (
                    <div className="el-deck-panel el-view-animate">
                      <p style={{ margin: '0 0 10px', fontSize: '0.83rem' }}>
                        Dispara efectos teatrales sintetizados en vivo durante un ensayo o demostración en clase:
                      </p>
                      <div className="el-console-btns">
                        <button
                          type="button"
                          className="el-console-btn on-amber"
                          onClick={() => triggerFx('bell')}
                        >
                          🔔 3.ª Llamada
                        </button>
                        <button
                          type="button"
                          className="el-console-btn on-emerald"
                          onClick={() => triggerFx('applause')}
                        >
                          👏 Aplausos
                        </button>
                        <button
                          type="button"
                          className="el-console-btn on-cyan"
                          onClick={() => triggerFx('thunder')}
                        >
                          ⛈️ Trueno
                        </button>
                        <button
                          type="button"
                          className="el-console-btn on-wisdom"
                          onClick={() => triggerFx('drum')}
                        >
                          🥁 Tensión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
