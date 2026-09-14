import React, { useState, useEffect } from 'react';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import { useSutzResources } from '../../context/SutzResourcesContext';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerBrowserNotification 
} from '../../utils/webNotificationUtils';
import './SutzSettingsModal.css';

interface SutzSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'audio' | 'notifications' | 'rewards' | 'guide' | 'privacy';

interface SocialReward {
  id: string;
  name: string;
  platform: string;
  handle: string;
  url: string;
  icon: string;
  color: string;
  rewards: {
    puntos: number;
    monedas: number;
    gemas?: number;
  };
}

const SOCIAL_REWARDS: SocialReward[] = [
  {
    id: 'facebook',
    name: 'Facebook Oficial',
    platform: 'Facebook',
    handle: '@lluviadeideaseditorial',
    url: 'https://www.facebook.com/lluviadeideaseditorial',
    icon: '📘',
    color: '#1877f2',
    rewards: { puntos: 100, monedas: 50 }
  },
  {
    id: 'instagram',
    name: 'Instagram Oficial',
    platform: 'Instagram',
    handle: '@editorial_lluviadeideas',
    url: 'https://www.instagram.com/editorial_lluviadeideas',
    icon: '📸',
    color: '#e1306c',
    rewards: { puntos: 100, monedas: 50 }
  },
  {
    id: 'youtube',
    name: 'Canal de YouTube',
    platform: 'YouTube',
    handle: 'Editorial Lluvia de Ideas',
    url: 'https://www.youtube.com',
    icon: '▶️',
    color: '#ff0000',
    rewards: { puntos: 150, monedas: 75, gemas: 3 }
  },
  {
    id: 'tiktok',
    name: 'TikTok Educativo',
    platform: 'TikTok',
    handle: '@lluviadeideaseditorial',
    url: 'https://www.tiktok.com',
    icon: '🎵',
    color: '#00f2fe',
    rewards: { puntos: 100, monedas: 50, gemas: 2 }
  }
];

export const SutzSettingsModal: React.FC<SutzSettingsModalProps> = ({ isOpen, onClose }) => {
  const { addResources } = useSutzResources();
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');

  // Estados de configuración de Audio y Sensaciones
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [isHapticAvailable, setIsHapticAvailable] = useState<boolean>(false);

  // Estados de Notificaciones
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Estado de Recompensas Reclamadas
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({});
  const [rewardCelebration, setRewardCelebration] = useState<string | null>(null);

  // Cargar estados guardados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSfxEnabled(sutzAudio.isSoundEnabled());
      setMusicEnabled(sutzAudio.isMusicPlaying());
      setHapticEnabled(sutzAudio.isHapticEnabled());
      setIsHapticAvailable(sutzAudio.isHapticsSupported());
      setNotificationPermission(getNotificationPermission());

      // Cargar recompensas reclamadas desde localStorage
      const claims: Record<string, boolean> = {};
      SOCIAL_REWARDS.forEach(item => {
        claims[item.id] = localStorage.getItem(`sutz_reward_${item.id}`) === 'claimed';
      });
      setClaimedRewards(claims);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle SFX
  const handleToggleSfx = () => {
    const newState = !sfxEnabled;
    setSfxEnabled(newState);
    sutzAudio.setSoundEnabled(newState);
  };

  // Toggle Música BGM
  const handleToggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    sutzAudio.setMusicEnabled(newState);
  };

  // Toggle Háptica
  const handleToggleHaptic = () => {
    const newState = !hapticEnabled;
    setHapticEnabled(newState);
    sutzAudio.setHapticEnabled(newState);
  };

  // Prueba de vibración
  const handleTestHaptic = () => {
    sutzAudio.triggerHaptic([40, 80, 40]);
    sutzAudio.playClick();
  };

  // Solicitar permiso de notificaciones
  const handleRequestNotification = async () => {
    sutzAudio.playClick();
    const result = await requestNotificationPermission();
    setNotificationPermission(result);

    if (result === 'granted') {
      triggerBrowserNotification('🌌 ¡Notificaciones de Sutz Activadas!', {
        body: 'Te notificaremos cuando haya nuevos códices, eventos solares o misiones listas.',
        tag: 'sutz-welcome'
      });
      setNotificationMsg('✅ ¡Notificaciones activadas con éxito!');
    } else if (result === 'denied') {
      setNotificationMsg('⚠️ El navegador denegó los permisos. Habilítalos en el candado de la URL.');
    }
  };

  // Reclamar recompensa de red social
  const handleClaimSocialReward = (item: SocialReward) => {
    sutzAudio.playClick();
    // Abrir enlace oficial
    window.open(item.url, '_blank', 'noopener,noreferrer');

    // Si no ha sido reclamada, otorgarla
    if (!claimedRewards[item.id]) {
      setTimeout(() => {
        const delta: { puntos: number; monedas: number; gemas?: number } = {
          puntos: item.rewards.puntos,
          monedas: item.rewards.monedas
        };
        if (item.rewards.gemas) {
          delta.gemas = item.rewards.gemas;
        }

        addResources(delta);
        localStorage.setItem(`sutz_reward_${item.id}`, 'claimed');
        setClaimedRewards(prev => ({ ...prev, [item.id]: true }));
        sutzAudio.playReward();

        const gemsTxt = item.rewards.gemas ? `, +${item.rewards.gemas} Gemas` : '';
        setRewardCelebration(`🎉 ¡Recompensa de ${item.platform} reclamada! (+${item.rewards.puntos} Sabiduría, +${item.rewards.monedas} Monedas${gemsTxt})`);
        
        setTimeout(() => setRewardCelebration(null), 4500);
      }, 700);
    }
  };

  return (
    <div className="sutz-modal-overlay" onClick={onClose}>
      <div className="sutz-modal-panel sutz-settings-modal" onClick={e => e.stopPropagation()}>
        
        {/* Cabecera del Modal */}
        <div className="sutz-modal-header">
          <div className="sutz-modal-title-group">
            <div className="sutz-modal-icon-badge settings-badge">⚙️</div>
            <div>
              <h3 className="sutz-modal-heading">Ajustes y Configuración</h3>
              <p className="sutz-modal-subheading">Personaliza tu experiencia en Sutz Mundo Virtual</p>
            </div>
          </div>
          <button className="sutz-modal-close-btn" onClick={onClose} aria-label="Cerrar ajustes">✕</button>
        </div>

        {/* Barra de Pestañas de Ajustes */}
        <div className="sutz-settings-tabs-bar">
          <button 
            className={`sutz-settings-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => { sutzAudio.playClick(); setActiveTab('audio'); }}
          >
            <span>🔊</span>
            <span>Audio & Sensación</span>
          </button>

          <button 
            className={`sutz-settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { sutzAudio.playClick(); setActiveTab('notifications'); }}
          >
            <span>🔔</span>
            <span>Notificaciones</span>
          </button>

          <button 
            className={`sutz-settings-tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => { sutzAudio.playClick(); setActiveTab('rewards'); }}
          >
            <span>🎁</span>
            <span>Redes & Premios</span>
          </button>

          <button 
            className={`sutz-settings-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => { sutzAudio.playClick(); setActiveTab('guide'); }}
          >
            <span>❓</span>
            <span>Guía de Juego</span>
          </button>

          <button 
            className={`sutz-settings-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => { sutzAudio.playClick(); setActiveTab('privacy'); }}
          >
            <span>📜</span>
            <span>Privacidad</span>
          </button>
        </div>

        {/* Mensaje de Celebración Flotante */}
        {rewardCelebration && (
          <div className="sutz-settings-celebration-toast">
            {rewardCelebration}
          </div>
        )}

        {/* Cuerpo del Modal con Contenido Dinámico */}
        <div className="sutz-modal-body sutz-settings-body">

          {/* ============================================================
              PESTAÑA 1: AUDIO & SENSACIONES
              ============================================================ */}
          {activeTab === 'audio' && (
            <div className="sutz-settings-section">
              <div className="sutz-settings-card">
                <div className="sutz-setting-row">
                  <div className="sutz-setting-info">
                    <span className="sutz-setting-icon">🔊</span>
                    <div>
                      <h4 className="sutz-setting-title">Efectos de Sonido (SFX)</h4>
                      <p className="sutz-setting-desc">Respuesta sonora inmediata al tocar botones, descubrir códices y recolectar tesoros.</p>
                    </div>
                  </div>
                  <div className="sutz-setting-action">
                    <button 
                      className="sutz-sound-preview-btn" 
                      onClick={() => sutzAudio.playCoin()}
                      title="Probar sonido"
                    >
                      Probar 🎵
                    </button>
                    <label className="sutz-switch">
                      <input 
                        type="checkbox" 
                        checked={sfxEnabled} 
                        onChange={handleToggleSfx} 
                      />
                      <span className="sutz-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="sutz-setting-divider" />

                <div className="sutz-setting-row">
                  <div className="sutz-setting-info">
                    <span className="sutz-setting-icon">🎶</span>
                    <div>
                      <h4 className="sutz-setting-title">Música de Fondo (BGM)</h4>
                      <p className="sutz-setting-desc">Música ambiental mística procedural generada con sintetizador Web Audio en tiempo real.</p>
                    </div>
                  </div>
                  <div className="sutz-setting-action">
                    <label className="sutz-switch">
                      <input 
                        type="checkbox" 
                        checked={musicEnabled} 
                        onChange={handleToggleMusic} 
                      />
                      <span className="sutz-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="sutz-setting-divider" />

                <div className="sutz-setting-row">
                  <div className="sutz-setting-info">
                    <span className="sutz-setting-icon">📳</span>
                    <div>
                      <h4 className="sutz-setting-title">Vibración Háptica (Móviles)</h4>
                      <p className="sutz-setting-desc">
                        {isHapticAvailable 
                          ? 'Vibración sutil al interactuar con el mapa y reclamar recompensas.' 
                          : 'Tu dispositivo o navegador actual no soporta vibración física.'}
                      </p>
                    </div>
                  </div>
                  <div className="sutz-setting-action">
                    {isHapticAvailable && (
                      <button 
                        className="sutz-sound-preview-btn" 
                        onClick={handleTestHaptic}
                        title="Probar vibración"
                      >
                        Vibrar 📳
                      </button>
                    )}
                    <label className="sutz-switch">
                      <input 
                        type="checkbox" 
                        checked={hapticEnabled} 
                        disabled={!isHapticAvailable}
                        onChange={handleToggleHaptic} 
                      />
                      <span className="sutz-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sutz-settings-tip-box">
                💡 <strong>Rendimiento Óptimo:</strong> Todos los sonidos y la música de Sutz se generan de forma matemática ligera, sin consumir datos de tu conexión a internet.
              </div>
            </div>
          )}

          {/* ============================================================
              PESTAÑA 2: NOTIFICACIONES
              ============================================================ */}
          {activeTab === 'notifications' && (
            <div className="sutz-settings-section">
              <div className="sutz-settings-card">
                <div className="sutz-setting-row">
                  <div className="sutz-setting-info">
                    <span className="sutz-setting-icon">🔔</span>
                    <div>
                      <h4 className="sutz-setting-title">Notificaciones de Expedición</h4>
                      <p className="sutz-setting-desc">
                        Recibe alertas cuando se desbloqueen nuevos códices, misterios mayas o misiones de sabiduría.
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                        Estado actual: {' '}
                        {notificationPermission === 'granted' && <strong style={{ color: '#34d399' }}>✅ Permitidas</strong>}
                        {notificationPermission === 'denied' && <strong style={{ color: '#f87171' }}>❌ Bloqueadas en el navegador</strong>}
                        {notificationPermission === 'default' && <strong style={{ color: '#fbbf24' }}>⏳ Pendiente de autorización</strong>}
                        {notificationPermission === 'unsupported' && <strong style={{ color: '#94a3b8' }}>🚫 No compatible en este navegador</strong>}
                      </div>
                    </div>
                  </div>
                  <div className="sutz-setting-action">
                    {isNotificationSupported() && notificationPermission !== 'unsupported' && (
                      <button 
                        className="sutz-primary-action-btn"
                        onClick={handleRequestNotification}
                        disabled={notificationPermission === 'granted'}
                      >
                        {notificationPermission === 'granted' ? 'Activadas ✓' : 'Activar Notificaciones'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {notificationMsg && (
                <div className="sutz-notification-feedback">
                  {notificationMsg}
                </div>
              )}

              <div className="sutz-settings-tip-box">
                🛡️ <strong>Sin Spam:</strong> Sutz solo envía avisos educativos directos sobre tus logros y recompensas escolares.
              </div>
            </div>
          )}

          {/* ============================================================
              PESTAÑA 3: REDES SOCIALES Y RECOMPENSAS
              ============================================================ */}
          {activeTab === 'rewards' && (
            <div className="sutz-settings-section">
              <div className="sutz-social-banner">
                <div>
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 900 }}>
                    🎁 ¡Sigue a Editorial Lluvia de Ideas y gana Gemas!
                  </h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                    Conéctate a nuestras comunidades oficiales para no perderte novedades, dinámicas y libros educativos.
                  </p>
                </div>
              </div>

              <div className="sutz-social-grid">
                {SOCIAL_REWARDS.map(item => {
                  const isClaimed = claimedRewards[item.id];
                  return (
                    <div key={item.id} className="sutz-social-card">
                      <div className="sutz-social-header">
                        <div className="sutz-social-icon-box" style={{ background: `${item.color}22`, borderColor: item.color }}>
                          <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                        </div>
                        <div>
                          <h5 className="sutz-social-name">{item.name}</h5>
                          <span className="sutz-social-handle">{item.handle}</span>
                        </div>
                      </div>

                      <div className="sutz-social-rewards-badge">
                        <span>⚡ +{item.rewards.puntos} Sabiduría</span>
                        <span>🟢 +{item.rewards.monedas} Jade</span>
                        {item.rewards.gemas && <span>💎 +{item.rewards.gemas} Gemas</span>}
                      </div>

                      <button 
                        className={`sutz-social-claim-btn ${isClaimed ? 'claimed' : ''}`}
                        onClick={() => handleClaimSocialReward(item)}
                      >
                        {isClaimed ? (
                          <><span>✅</span><span>¡Recompensado! (Visitar)</span></>
                        ) : (
                          <><span>🎁</span><span>Seguir y Reclamar</span></>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================
              PESTAÑA 4: GUÍA DE JUEGO Y AYUDA
              ============================================================ */}
          {activeTab === 'guide' && (
            <div className="sutz-settings-section">
              <div className="sutz-guide-grid">
                <div className="sutz-guide-item">
                  <span className="sutz-guide-icon">⬡</span>
                  <div>
                    <h5 className="sutz-guide-title">Exploración Hexagonal</h5>
                    <p className="sutz-guide-text">
                      Cada casilla del mapa representa un territorio con flora, fauna, templos o desafíos matemáticos. Toca casillas para descubrirlas.
                    </p>
                  </div>
                </div>

                <div className="sutz-guide-item">
                  <span className="sutz-guide-icon">📜</span>
                  <div>
                    <h5 className="sutz-guide-title">Códices y Relatos</h5>
                    <p className="sutz-guide-text">
                      Al desbloquear códices, leerás fragmentos literarios de las obras de Editorial Lluvia de Ideas y recibirás oro, gemas y sabiduría.
                    </p>
                  </div>
                </div>

                <div className="sutz-guide-item">
                  <span className="sutz-guide-icon">⚡</span>
                  <div>
                    <h5 className="sutz-guide-title">Árbol de Tecnologías</h5>
                    <p className="sutz-guide-text">
                      Invierte tus puntos de sabiduría en ramas científicas, artísticas, astronómicas y matemáticas para desbloquear mejoras globales.
                    </p>
                  </div>
                </div>

                <div className="sutz-guide-item">
                  <span className="sutz-guide-icon">📐</span>
                  <div>
                    <h5 className="sutz-guide-title">Plano Cartesiano (X, Y)</h5>
                    <p className="sutz-guide-text">
                      Las coordenadas (X, Y) en la esquina superior indican tu posición exacta en la cuadrícula para aprender orientación espacial.
                    </p>
                  </div>
                </div>

                <div className="sutz-guide-item">
                  <span className="sutz-guide-icon">🖱️</span>
                  <div>
                    <h5 className="sutz-guide-title">Navegación Táctil y Ratón</h5>
                    <p className="sutz-guide-text">
                      Arrastra en cualquier dirección para desplazarte sin restricciones por el cosmos de Sutz. Usa la rueda o pellizco para zoom.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              PESTAÑA 5: PRIVACIDAD Y TÉRMINOS
              ============================================================ */}
          {activeTab === 'privacy' && (
            <div className="sutz-settings-section">
              <div className="sutz-privacy-card">
                <h4 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '1rem', fontWeight: 900 }}>
                  🛡️ Compromiso de Seguridad y Privacidad Educativa
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#cbd5e1' }}>
                  <strong>Sutz Mundo Virtual</strong> está diseñado por <em>Editorial Lluvia de Ideas</em> como un entorno interactivo lúdico y 100% seguro para estudiantes, docentes y familias:
                </p>
                <ul style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#94a3b8', paddingLeft: '18px', margin: '10px 0' }}>
                  <li><strong>Sin Publicidad Comercial:</strong> No mostramos anuncios de terceros ni compartimos tus datos con anunciantes.</li>
                  <li><strong>Privacidad de Menores:</strong> Todo el progreso escolar y logros se resguardan de forma encriptada y segura.</li>
                  <li><strong>Soberanía del Usuario:</strong> Los ajustes de audio, volumen y recompensas se almacenan localmente en tu dispositivo.</li>
                  <li><strong>Enfoque Pedagógico:</strong> Todo el contenido estimula el pensamiento crítico, la lectura comprensiva y la neuroeducación.</li>
                </ul>
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#64748b' }}>
                  Versión del Mundo Virtual: Sutz v2.4.0 — Desarrollado por Editorial Lluvia de Ideas © {new Date().getFullYear()}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal con Retorno al Portal */}
        <div className="sutz-modal-footer" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button"
            style={{
              background: 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              sutzAudio.playClick();
              window.location.href = '/';
            }}
            title="Volver a la página principal y tienda de Editorial Lluvia de Ideas"
          >
            🏛️ Salir al Portal
          </button>
          <button className="sutz-modal-confirm-btn" onClick={onClose} style={{ flex: 1 }}>
            Guardar y Regresar a la Expedición 👍
          </button>
        </div>

      </div>
    </div>
  );
};
