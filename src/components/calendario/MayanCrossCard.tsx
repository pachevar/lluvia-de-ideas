import React, { useMemo, useState } from 'react';
import {
  getMayanCross,
  type KicheNawal,
  type MayanCrossKey,
  type MayanCrossNode,
} from '../../data/cholqijData';
import { soundEffects } from '../../utils/soundEffects';

interface MayanCrossCardProps {
  nawal: KicheNawal;
  energy?: number;
  onInspectNawal?: (target: KicheNawal) => void;
}

export const MayanCrossCard: React.FC<MayanCrossCardProps> = ({
  nawal,
  energy,
  onInspectNawal,
}) => {
  const cross = useMemo(() => getMayanCross(nawal.index, energy), [nawal.index, energy]);
  const [selectedKey, setSelectedKey] = useState<MayanCrossKey>('center');

  const activeNode: MayanCrossNode = cross[selectedKey];

  const renderNodeButton = (node: MayanCrossNode, slotClass: string) => {
    const isSelected = selectedKey === node.key;
    const isCenter = node.key === 'center';
    return (
      <button
        key={node.key}
        type="button"
        className={`cm-cross-node ${slotClass} ${isCenter ? 'is-center' : ''} ${
          isSelected ? 'selected' : ''
        }`}
        onClick={() => {
          soundEffects.playClick();
          setSelectedKey(node.key);
        }}
        aria-pressed={isSelected}
      >
        <span className="cm-cross-role">{node.positionLabel}</span>
        <span className="cm-cross-emoji" aria-hidden="true">
          {node.nawal.emoji}
        </span>
        <span className="cm-cross-name">
          {node.energy !== undefined ? `${node.energy} ` : ''}
          {node.nawal.name}
        </span>
        <span className="cm-cross-sub">{node.subLabel}</span>
      </button>
    );
  };

  return (
    <section className="cm-cross-section" aria-label={`Cruz Maya de ${nawal.name}`}>
      <div className="cm-cross-header">
        <div>
          <span className="cm-badge">✚ Cruz Maya (Kajb'al)</span>
          <h3 style={{ margin: '6px 0 2px', fontFamily: 'Georgia, serif', fontSize: '1.18rem' }}>
            Mapa de 5 Nawales de {energy ? `${energy} ` : ''}
            {nawal.name}
          </h3>
          <p style={{ margin: 0, fontSize: '0.84rem' }}>
            Toca cada posición de la cruz para descubrir cómo las fuerzas de origen, apoyo y destino equilibran a{' '}
            <strong>{nawal.name}</strong>.
          </p>
        </div>
      </div>

      {/* Diagrama geométrico en cruz (3x3) con ejes SVG de fondo */}
      <div className="cm-cross-board">
        <svg
          className="cm-cross-lines"
          viewBox="0 0 300 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line x1="150" y1="36" x2="150" y2="264" stroke="var(--cm-accent-gold)" strokeWidth="2" strokeDasharray="5 5" opacity="0.55" />
          <line x1="36" y1="150" x2="264" y2="150" stroke="var(--cm-accent-jade)" strokeWidth="2" strokeDasharray="5 5" opacity="0.55" />
          <circle cx="150" cy="150" r="68" fill="none" stroke="var(--cm-border)" strokeWidth="1.5" opacity="0.5" />
        </svg>

        {renderNodeButton(cross.conception, 'slot-top')}
        {renderNodeButton(cross.rightArm, 'slot-left')}
        {renderNodeButton(cross.center, 'slot-center')}
        {renderNodeButton(cross.leftArm, 'slot-right')}
        {renderNodeButton(cross.destiny, 'slot-bottom')}
      </div>

      {/* Detalle dinámico del nodo seleccionado */}
      <div key={`${nawal.slug}-${activeNode.key}`} className="cm-cross-detail cm-cal-stage-anim">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>{activeNode.nawal.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--cm-text-primary)' }}>
                {activeNode.positionLabel}:{' '}
                {activeNode.energy !== undefined ? `${activeNode.energy} ` : ''}
                {activeNode.nawal.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--cm-text-muted)' }}>
                {activeNode.subLabel} · {activeNode.offsetLabel} · Elemento {activeNode.nawal.element}
              </div>
            </div>
          </div>

          {activeNode.key !== 'center' && onInspectNawal && (
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              style={{ minHeight: '38px', padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => {
                soundEffects.playClick();
                setSelectedKey('center');
                onInspectNawal(activeNode.nawal);
              }}
            >
              Ver ficha de {activeNode.nawal.name} →
            </button>
          )}
        </div>

        <p style={{ margin: '10px 0 6px', fontSize: '0.88rem' }}>{activeNode.roleDescription}</p>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--cm-text-primary)' }}>
          <strong>En esta cruz:</strong> {activeNode.interactionInsight}
        </p>
      </div>
    </section>
  );
};
