import React, { useState } from 'react';
import { soundEffects } from '../../utils/soundEffects';

interface StageZone {
  id: string;
  name: string;
  short: string;
  dept: string;
  color: string;
  description: string;
  directorTip: string;
}

const STAGE_ZONES: StageZone[] = [
  {
    id: 'foro',
    name: 'Foro (Fondo del Escenario)',
    short: 'Foro',
    dept: 'Escenografía y Tramoya',
    color: 'var(--sutz-color-wisdom)',
    description:
      'La zona más alejada del público. Se usa para telones, atmósferas profundas, siluetas y entradas solemnes.',
    directorTip:
      'Un personaje que entra desde el foro gana presencia dramática si avanza en diagonal hacia el centro.',
  },
  {
    id: 'bambalinas-izq',
    name: 'Bambalinas / Lateral Izquierdo',
    short: 'Bambalinas Izq.',
    dept: 'Utilería y Asistencia',
    color: 'var(--sutz-color-success)',
    description:
      'Zona oculta fuera de la vista del público donde se colocan mesas de utilería y actores esperan su pie de entrada.',
    directorTip:
      'Regla de oro: si tú puedes ver al público desde bambalinas, el público también puede verte a ti.',
  },
  {
    id: 'centro',
    name: 'Centro Escénico',
    short: 'Centro (Foco)',
    dept: 'Elenco y Dirección',
    color: 'var(--sutz-color-challenge)',
    description:
      'El punto de mayor poder visual del escenario. Aquí ocurren los clímax, decisiones clave y revelaciones.',
    directorTip:
      'No abuses del centro durante toda la obra; resérvalo para que los momentos clave realmente impacten.',
  },
  {
    id: 'bambalinas-der',
    name: 'Bambalinas / Lateral Derecho',
    short: 'Bambalinas Der.',
    dept: 'Vestuario y Cambios Rápidos',
    color: 'var(--sutz-color-success)',
    description:
      'Espacio lateral destinado a cambios ágiles de vestuario, agua para el elenco y entradas alternas.',
    directorTip:
      'Marca las rutas de salida con cinta fosforescente discreta para moverse con seguridad en oscuros.',
  },
  {
    id: 'proscenio',
    name: 'Proscenio (Frente al Público)',
    short: 'Proscenio',
    dept: 'Elenco Actoral',
    color: 'var(--sutz-color-guide)',
    description:
      'La franja más cercana a la primera fila. Ideal para monólogos íntimos, apartes al público y finales emotivos.',
    directorTip:
      'En el proscenio puedes bajar el volumen y usar matices faciales sutiles sin perder conexión.',
  },
  {
    id: 'cabina',
    name: 'Cabina de Iluminación y Sonido',
    short: 'Cabina Técnica',
    dept: 'Iluminación y Sonido',
    color: 'var(--sutz-color-guide)',
    description:
      'Ubicada al fondo del auditorio con vista completa del escenario para disparar luces, música y efectos al segundo exacto.',
    directorTip:
      'El operador sigue el guion técnico (Cue Sheet) numerado y nunca improvisa cortes sin aviso.',
  },
];

export const StageMapInteractive: React.FC = () => {
  const [activeZoneId, setActiveZoneId] = useState<string>('centro');
  const activeZone = STAGE_ZONES.find((z) => z.id === activeZoneId) || STAGE_ZONES[2];

  const selectZone = (id: string) => {
    soundEffects.playClick();
    setActiveZoneId(id);
  };

  return (
    <div className="el-stage-map-card">
      <div className="el-stage-map-header">
        <div>
          <span className="el-badge el-badge-guide">🗺️ Plano Escénico Interactivo</span>
          <h3 style={{ margin: '0.45rem 0 0.2rem', fontSize: '1.22rem' }}>
            Explora las Zonas del Escenario y sus Equipos
          </h3>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--el-text-secondary)' }}>
            Toca cualquier zona del teatro para descubrir cómo se coordinan actores y técnicos en el espacio.
          </p>
        </div>
      </div>

      <div className="el-stage-map-grid">
        {/* Diagrama visual del escenario */}
        <div className="el-stage-blueprint" role="group" aria-label="Zonas del escenario teatral">
          <button
            type="button"
            className={`el-zone-btn zone-foro ${activeZoneId === 'foro' ? 'active' : ''}`}
            onClick={() => selectZone('foro')}
          >
            <span>Foro (Fondo)</span>
            <small>Escenografía</small>
          </button>

          <button
            type="button"
            className={`el-zone-btn zone-left ${activeZoneId === 'bambalinas-izq' ? 'active' : ''}`}
            onClick={() => selectZone('bambalinas-izq')}
          >
            <span>Bambalinas Izq.</span>
            <small>Utilería</small>
          </button>

          <button
            type="button"
            className={`el-zone-btn zone-center ${activeZoneId === 'centro' ? 'active' : ''}`}
            onClick={() => selectZone('centro')}
          >
            <span>★ Centro</span>
            <small>Foco Dramático</small>
          </button>

          <button
            type="button"
            className={`el-zone-btn zone-right ${activeZoneId === 'bambalinas-der' ? 'active' : ''}`}
            onClick={() => selectZone('bambalinas-der')}
          >
            <span>Bambalinas Der.</span>
            <small>Vestuario</small>
          </button>

          <button
            type="button"
            className={`el-zone-btn zone-proscenio ${activeZoneId === 'proscenio' ? 'active' : ''}`}
            onClick={() => selectZone('proscenio')}
          >
            <span>Proscenio (Borde del Escenario)</span>
            <small>Cercanía con el Público</small>
          </button>

          <div className="el-audience-strip" aria-hidden="true">
            <span>🎭 Público / Butacas</span>
          </div>

          <button
            type="button"
            className={`el-zone-btn zone-cabina ${activeZoneId === 'cabina' ? 'active' : ''}`}
            onClick={() => selectZone('cabina')}
          >
            <span>🎛️ Cabina de Luz y Sonido</span>
            <small>Control Técnico (Cue Sheet)</small>
          </button>
        </div>

        {/* Panel de información de la zona */}
        <div key={activeZone.id} className="el-stage-zone-info el-view-animate">
          <span
            className="el-badge"
            style={{
              backgroundColor: 'var(--el-surface-elevated)',
              color: activeZone.color,
              border: `1px solid ${activeZone.color}`,
            }}
          >
            {activeZone.dept}
          </span>
          <h4 style={{ margin: '0.65rem 0 0.4rem', fontSize: '1.15rem' }}>{activeZone.name}</h4>
          <p style={{ margin: '0 0 0.9rem', fontSize: '0.9rem', color: 'var(--el-text-secondary)' }}>
            {activeZone.description}
          </p>
          <div className="el-tip-callout">
            <strong>Tip de dirección:</strong> {activeZone.directorTip}
          </div>
        </div>
      </div>
    </div>
  );
};
