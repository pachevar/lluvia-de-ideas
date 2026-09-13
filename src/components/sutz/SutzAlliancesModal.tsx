import React, { useState, useEffect } from 'react';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import { useSutzResources } from '../../context/SutzResourcesContext';
import './SutzAlliancesModal.css';

interface SutzAlliancesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Alliance {
  id: string;
  name: string;
  subname: string;
  emblem: string;
  color: string;
  motto: string;
  perk: string;
  perkBadge: string;
  membersCount: number;
  totalScore: string;
  description: string;
}

const ALLIANCES: Alliance[] = [
  {
    id: 'quetzal',
    name: 'Gremio del Quetzal',
    subname: 'Ciencias y Exploración',
    emblem: '🦜',
    color: '#10b981',
    motto: 'Navegantes del Viento y el Saber',
    perk: '+15% de Sabiduría en Árbol Tecnológico',
    perkBadge: '⚡ Sabiduría x1.15',
    membersCount: 428,
    totalScore: '142.5K',
    description: 'Enfocados en el método científico, la botánica ancestral y la cartografía del cosmos.'
  },
  {
    id: 'juracan',
    name: 'Orden de Juracán',
    subname: 'Artes y Creación Literaria',
    emblem: '🌪️',
    color: '#38bdf8',
    motto: 'Fuerza Creadora y Tempestad de Ideas',
    perk: '+15% de Jade al descubrir Códices',
    perkBadge: '🟢 Jade x1.15',
    membersCount: 395,
    totalScore: '138.2K',
    description: 'Cultivan la narración épica, la ilustración fantástica y la memoria de las leyendas mayas.'
  },
  {
    id: 'camazotz',
    name: 'Cofradía de Camazotz',
    subname: 'Lógica, Retos y Estrategia',
    emblem: '🦇',
    color: '#818cf8',
    motto: 'Guardianes de la Noche y los Enigmas',
    perk: '+10% de Gemas en Misiones Diarias',
    perkBadge: '💎 Gemas x1.10',
    membersCount: 372,
    totalScore: '131.9K',
    description: 'Especialistas en acertijos oscuros, pensamiento lateral y deducción matemática.'
  },
  {
    id: 'ixmukanne',
    name: 'Hermandad de Ixmukanne',
    subname: 'Astronomía y Sabiduría Ancestral',
    emblem: '🌽',
    color: '#f59e0b',
    motto: 'Arquitectos del Maíz y las Estrellas',
    perk: '+20% de Puntos en Retos STEAM',
    perkBadge: '🌟 STEAM x1.20',
    membersCount: 450,
    totalScore: '154.0K',
    description: 'Estudian el calendario de cuenta larga, la agricultura sagrada y las órbitas celestes.'
  }
];

export const SutzAlliancesModal: React.FC<SutzAlliancesModalProps> = ({ isOpen, onClose }) => {
  const { addResources } = useSutzResources();
  const [selectedAllianceId, setSelectedAllianceId] = useState<string>('quetzal');
  const [hasClaimedTribute, setHasClaimedTribute] = useState<boolean>(false);
  const [tributeMessage, setTributeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAlliance = localStorage.getItem('sutz_user_alliance') || 'quetzal';
      setSelectedAllianceId(savedAlliance);

      const today = new Date().toISOString().slice(0, 10);
      const lastClaim = localStorage.getItem('sutz_alliance_tribute_date');
      setHasClaimedTribute(lastClaim === today);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAlliance = ALLIANCES.find(a => a.id === selectedAllianceId) || ALLIANCES[0];

  const handleSelectAlliance = (id: string) => {
    sutzAudio.playClick();
    setSelectedAllianceId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutz_user_alliance', id);
    }
  };

  const handleClaimTribute = () => {
    if (hasClaimedTribute) return;

    sutzAudio.playReward();
    addResources({ monedas: 50 }); // 50 de Jade

    const today = new Date().toISOString().slice(0, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutz_alliance_tribute_date', today);
    }
    setHasClaimedTribute(true);
    setTributeMessage('🎉 ¡Tributo diario de tu Alianza reclamado! (+50 Jade Sagrado)');
    setTimeout(() => setTributeMessage(null), 4000);
  };

  return (
    <div className="sutz-modal-overlay" onClick={onClose}>
      <div className="sutz-modal-panel sutz-alliances-modal" onClick={e => e.stopPropagation()}>
        
        {/* Cabecera del Modal */}
        <div className="sutz-modal-header">
          <div className="sutz-modal-title-group">
            <div className="sutz-modal-icon-badge alliance-badge">🛡️</div>
            <div>
              <h3 className="sutz-modal-heading">Alianzas y Gremios Escolares</h3>
              <p className="sutz-modal-subheading">Únete a un gremio estudiantil y comparte la gloria del saber</p>
            </div>
          </div>
          <button className="sutz-modal-close-btn" onClick={onClose} aria-label="Cerrar alianzas">✕</button>
        </div>

        {/* Notificación Flotante de Tributo */}
        {tributeMessage && (
          <div className="sutz-alliance-tribute-toast">
            {tributeMessage}
          </div>
        )}

        <div className="sutz-modal-body sutz-alliances-body">
          
          {/* Banner de la Alianza Activa */}
          <div 
            className="sutz-active-alliance-card"
            style={{ 
              borderColor: currentAlliance.color,
              background: `linear-gradient(135deg, hsla(222, 45%, 9%, 0.95) 0%, ${currentAlliance.color}18 100%)`
            }}
          >
            <div className="sutz-alliance-hero-emblem" style={{ borderColor: currentAlliance.color }}>
              <span style={{ fontSize: '2.5rem' }}>{currentAlliance.emblem}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="sutz-alliance-status-pill">Tu Gremio Actual</span>
                <span className="sutz-alliance-perk-badge">{currentAlliance.perkBadge}</span>
              </div>
              <h4 className="sutz-alliance-hero-title">{currentAlliance.name}</h4>
              <p className="sutz-alliance-hero-motto">"{currentAlliance.motto}"</p>
              <p className="sutz-alliance-hero-desc">{currentAlliance.description}</p>
            </div>

            {/* Reclamo Diario de Jade */}
            <div className="sutz-alliance-tribute-box">
              <button 
                className={`sutz-alliance-tribute-btn ${hasClaimedTribute ? 'claimed' : ''}`}
                onClick={handleClaimTribute}
                disabled={hasClaimedTribute}
              >
                {hasClaimedTribute ? (
                  <><span>✅</span><span>Tributo Reclamado</span></>
                ) : (
                  <><span>🟢</span><span>Reclamar +50 Jade</span></>
                )}
              </button>
              <small className="sutz-tribute-hint">
                {hasClaimedTribute ? 'Vuelve mañana por más Jade' : 'Tributo escolar diario disponible'}
              </small>
            </div>
          </div>

          {/* Selector de Gremios Disponibles */}
          <h5 className="sutz-alliances-section-title">
            <span>🏛️</span>
            <span>Gremios Ancestrales Disponibles</span>
          </h5>

          <div className="sutz-alliances-grid">
            {ALLIANCES.map(alliance => {
              const isCurrent = alliance.id === selectedAllianceId;
              return (
                <div 
                  key={alliance.id}
                  className={`sutz-alliance-item-card ${isCurrent ? 'selected' : ''}`}
                  onClick={() => handleSelectAlliance(alliance.id)}
                  style={{
                    borderColor: isCurrent ? alliance.color : undefined
                  }}
                >
                  <div className="sutz-alliance-item-header">
                    <div 
                      className="sutz-alliance-item-icon"
                      style={{ background: `${alliance.color}22`, borderColor: alliance.color }}
                    >
                      <span>{alliance.emblem}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h6 className="sutz-alliance-item-name">{alliance.name}</h6>
                      <span className="sutz-alliance-item-sub">{alliance.subname}</span>
                    </div>
                    {isCurrent && <span className="sutz-alliance-check-pill">Activa</span>}
                  </div>

                  <div className="sutz-alliance-item-perk">
                    <strong>Ventaja:</strong> {alliance.perk}
                  </div>

                  <div className="sutz-alliance-item-footer">
                    <span>👥 {alliance.membersCount} Exploradores</span>
                    <span>⚡ {alliance.totalScore} XP</span>
                  </div>

                  {!isCurrent && (
                    <button 
                      className="sutz-alliance-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAlliance(alliance.id);
                      }}
                    >
                      Unirse a este Gremio
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tabla de Posiciones de Alianzas */}
          <div className="sutz-alliance-leaderboard-card">
            <h5 className="sutz-leaderboard-heading">
              <span>🏆</span>
              <span>Tabla de Rendimiento Estudiantil por Alianza</span>
            </h5>
            <div className="sutz-leaderboard-list">
              {ALLIANCES.map((a, idx) => (
                <div key={a.id} className="sutz-leaderboard-row">
                  <span className="sutz-leaderboard-rank">#{idx + 1}</span>
                  <span className="sutz-leaderboard-emblem">{a.emblem}</span>
                  <span className="sutz-leaderboard-name">{a.name}</span>
                  <span className="sutz-leaderboard-score">{a.totalScore} Sabiduría</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="sutz-modal-footer">
          <button className="sutz-modal-confirm-btn" onClick={onClose}>
            Regresar al Reino de Sutz 👍
          </button>
        </div>

      </div>
    </div>
  );
};
