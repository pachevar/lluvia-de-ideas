import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  listenToOnlineStudents, 
  listenToCoordinationSignals, 
  sendCoordinationSignal,
  type StudentPresence, 
  type CoordinationSignal,
  type SignalType 
} from '../../services/sutzCoordinationService';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import './SutzCoordinationModal.css';

interface SutzCoordinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHexCoord?: { q: number; r: number; label?: string } | null;
}

const SIGNAL_TYPES: { id: SignalType; label: string; icon: string; color: string }[] = [
  { id: 'discovery', label: 'Descubrimiento', icon: '📍', color: '#10b981' },
  { id: 'help', label: 'Pedir Ayuda', icon: '⚡', color: '#f59e0b' },
  { id: 'alliance', label: 'Grito de Alianza', icon: '🛡️', color: '#8b5cf6' },
  { id: 'clue', label: 'Pista Maya', icon: '💡', color: '#38bdf8' },
  { id: 'greeting', label: 'Saludo Escolar', icon: '👋', color: '#06b6d4' }
];

export const SutzCoordinationModal: React.FC<SutzCoordinationModalProps> = ({
  isOpen,
  onClose,
  currentHexCoord
}) => {
  const { user, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'signals' | 'peers' | 'broadcast'>('signals');
  const [onlineStudents, setOnlineStudents] = useState<StudentPresence[]>([]);
  const [signals, setSignals] = useState<CoordinationSignal[]>([]);

  // Form state para enviar señal
  const [signalType, setSignalType] = useState<SignalType>('discovery');
  const [signalTitle, setSignalTitle] = useState('');
  const [signalMessage, setSignalMessage] = useState('');
  const [includeCoord, setIncludeCoord] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Escuchar compañeros online
    const unsubPeers = listenToOnlineStudents((students) => {
      setOnlineStudents(students);
    });

    // Escuchar señales de coordinación
    const unsubSignals = listenToCoordinationSignals((newSignals) => {
      setSignals(newSignals);
    });

    return () => {
      unsubPeers();
      unsubSignals();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !signalMessage.trim()) return;

    setSending(true);
    setFeedback(null);
    sutzAudio.playClick();

    try {
      const studentName = userProfile?.displayName || user.displayName || (user.email ? user.email.split('@')[0] : 'Explorador');
      const storedAlliance = localStorage.getItem('sutz_student_alliance') || 'Sin Alianza';

      await sendCoordinationSignal({
        authorUid: user.uid,
        authorName: studentName,
        authorAvatar: userProfile?.photoURL || user.photoURL || null,
        authorAlliance: storedAlliance,
        type: signalType,
        title: signalTitle.trim() || SIGNAL_TYPES.find(t => t.id === signalType)?.label || 'Señal de Expedición',
        message: signalMessage.trim(),
        coord: includeCoord && currentHexCoord ? currentHexCoord : undefined,
      });

      sutzAudio.playReward();
      setSignalTitle('');
      setSignalMessage('');
      setFeedback('✅ ¡Señal de coordinación transmitida a todos los estudiantes!');
      setTimeout(() => {
        setFeedback(null);
        setActiveTab('signals');
      }, 1200);
    } catch (err) {
      console.error('Error enviando señal de coordinación:', err);
      setFeedback('⚠️ No se pudo enviar la señal. Revisa tu conexión.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sutz-modal-overlay" onClick={onClose}>
      <div 
        className="sutz-game-card-modal sutz-coord-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Gamer */}
        <div className="sutz-modal-header">
          <div className="sutz-modal-title-wrap">
            <div className="sutz-modal-title-icon" style={{ background: 'rgba(56,189,248,0.2)', borderColor: '#38bdf8' }}>
              📡
            </div>
            <div>
              <h3 className="sutz-modal-title">Centro de Coordinación y Expedición</h3>
              <p className="sutz-modal-subtitle">
                {onlineStudents.length} exploradores activos en el Mundo Virtual
              </p>
            </div>
          </div>
          <button className="sutz-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="sutz-coord-tabs">
          <button 
            className={`sutz-coord-tab ${activeTab === 'signals' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signals'); sutzAudio.playClick(); }}
          >
            📢 Señales de Aula ({signals.length})
          </button>
          <button 
            className={`sutz-coord-tab ${activeTab === 'peers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('peers'); sutzAudio.playClick(); }}
          >
            👥 Compañeros en Línea ({onlineStudents.length})
          </button>
          <button 
            className={`sutz-coord-tab broadcast ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => { setActiveTab('broadcast'); sutzAudio.playClick(); }}
          >
            ✍️ Emitir Señal
          </button>
        </div>

        <div className="sutz-coord-content">
          {/* ============================================================
              TAB 1: SEÑALES DE AULA Y DESCUBRIMIENTOS
              ============================================================ */}
          {activeTab === 'signals' && (
            <div className="sutz-signals-list">
              {signals.length === 0 ? (
                <div className="sutz-coord-empty">
                  <span>🌌</span>
                  <h4>El canal de expedición está sereno</h4>
                  <p>Sé el primero en compartir un hallazgo o pedir apoyo a tus compañeros de clase.</p>
                  <button 
                    className="sutz-coord-action-btn"
                    onClick={() => setActiveTab('broadcast')}
                  >
                    + Emitir Primera Señal
                  </button>
                </div>
              ) : (
                signals.map((sig) => {
                  const typeMeta = SIGNAL_TYPES.find(t => t.id === sig.type) || SIGNAL_TYPES[0];
                  return (
                    <div key={sig.id} className="sutz-signal-card" style={{ borderLeftColor: typeMeta.color }}>
                      <div className="sutz-signal-header">
                        <div className="sutz-signal-author">
                          <span className="sutz-signal-badge" style={{ background: `${typeMeta.color}25`, color: typeMeta.color, borderColor: typeMeta.color }}>
                            {typeMeta.icon} {typeMeta.label}
                          </span>
                          <span className="sutz-signal-name">{sig.authorName}</span>
                          {sig.authorAlliance && (
                            <span className="sutz-signal-alliance">({sig.authorAlliance})</span>
                          )}
                        </div>
                        {sig.coord && (
                          <div className="sutz-signal-coord">
                            📍 Cuadrante ({sig.coord.q}, {sig.coord.r})
                          </div>
                        )}
                      </div>

                      <h4 className="sutz-signal-title">{sig.title}</h4>
                      <p className="sutz-signal-text">{sig.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============================================================
              TAB 2: COMPAÑEROS EN LÍNEA
              ============================================================ */}
          {activeTab === 'peers' && (
            <div className="sutz-peers-grid">
              {onlineStudents.length === 0 ? (
                <div className="sutz-coord-empty">
                  <span>🧭</span>
                  <h4>No se detectan otros exploradores en este instante</h4>
                  <p>Tus compañeros aparecerán aquí cuando ingresen con sus sesiones escolares.</p>
                </div>
              ) : (
                onlineStudents.map((st) => (
                  <div key={st.uid} className={`sutz-peer-card ${st.uid === user?.uid ? 'is-me' : ''}`}>
                    <div className="sutz-peer-avatar-box">
                      {st.photoURL ? (
                        <img src={st.photoURL} alt={st.displayName} className="sutz-peer-avatar-img" />
                      ) : (
                        <div className="sutz-peer-avatar-fallback">
                          {st.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="sutz-peer-online-dot" />
                    </div>

                    <div className="sutz-peer-info">
                      <div className="sutz-peer-name-row">
                        <span className="sutz-peer-name">{st.displayName}</span>
                        {st.uid === user?.uid && <span className="sutz-peer-me-tag">Tú</span>}
                      </div>
                      <span className="sutz-peer-rank">{st.rankTitle || 'Sabio Iniciado'} · Nivel {st.level || 1}</span>
                      <span className="sutz-peer-alliance">🛡️ {st.allianceName || 'Gremio Libre'}</span>
                      {st.currentCoord && (
                        <span className="sutz-peer-pos">📍 Hex ({st.currentCoord.q}, {st.currentCoord.r})</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============================================================
              TAB 3: EMITIR SEÑAL DE EXPEDICIÓN
              ============================================================ */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleSendSignal} className="sutz-broadcast-form">
              <div className="sutz-broadcast-row">
                <label>Tipo de Señal</label>
                <div className="sutz-signal-type-chips">
                  {SIGNAL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`sutz-type-chip ${signalType === t.id ? 'selected' : ''}`}
                      onClick={() => setSignalType(t.id)}
                      style={{
                        borderColor: signalType === t.id ? t.color : 'transparent',
                        background: signalType === t.id ? `${t.color}25` : 'rgba(15, 23, 42, 0.6)'
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sutz-broadcast-row">
                <label>Asunto o Título Corto</label>
                <input 
                  type="text"
                  placeholder="Ej. ¡Descubrí el Códice de Juracán!"
                  value={signalTitle}
                  onChange={(e) => setSignalTitle(e.target.value)}
                  maxLength={60}
                />
              </div>

              <div className="sutz-broadcast-row">
                <label>Mensaje para la Comunidad Escolar</label>
                <textarea 
                  placeholder="Escribe lo que has descubierto, la ayuda que necesitas o un mensaje para tu alianza..."
                  value={signalMessage}
                  onChange={(e) => setSignalMessage(e.target.value)}
                  rows={3}
                  required
                  maxLength={280}
                />
              </div>

              {currentHexCoord && (
                <label className="sutz-broadcast-checkbox">
                  <input 
                    type="checkbox" 
                    checked={includeCoord} 
                    onChange={(e) => setIncludeCoord(e.target.checked)} 
                  />
                  <span>📍 Compartir mi cuadrante actual ({currentHexCoord.q}, {currentHexCoord.r})</span>
                </label>
              )}

              {feedback && (
                <div className="sutz-broadcast-feedback">
                  {feedback}
                </div>
              )}

              <button 
                type="submit" 
                className="sutz-broadcast-submit-btn"
                disabled={sending || !signalMessage.trim()}
              >
                {sending ? 'Transmitiendo señal...' : '🚀 Emitir Señal al Mundo Virtual'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
