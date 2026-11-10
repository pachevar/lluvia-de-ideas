import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SutzGeoMission } from '../../types';
import { 
  calculateHaversineDistance, 
  calculateBearing, 
  formatDistance, 
  getCardinalDirection,
  loadGoogleMapsScript,
  SUTZ_GOOGLE_MAPS_STYLE
} from '../../utils/sutzGeoUtils';
import { sutzAudio } from '../../utils/sutzSoundEffects';
import { useSutzResources } from '../../context/SutzResourcesContext';
import { 
  isAcademiaQrSessionActive, 
  reportChallengeCompletion 
} from '../../services/academiaqrSyncService';
import './SutzGeoMissionModal.css';

interface SutzGeoMissionModalProps {
  isOpen: boolean;
  mission: SutzGeoMission;
  onClose: () => void;
  onComplete?: (mission: SutzGeoMission) => void;
}

export const SutzGeoMissionModal: React.FC<SutzGeoMissionModalProps> = ({
  isOpen,
  mission,
  onClose,
  onComplete
}) => {
  const { addResources } = useSutzResources();

  // Estados de geolocalización
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(Boolean(mission.isCompleted));
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Estados de Google Maps vs Radar
  const [hasGoogleMaps, setHasGoogleMaps] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'map' | 'radar'>('radar');
  const [mapLoading, setMapLoading] = useState<boolean>(false);

  // Referencias para Google Maps
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const targetMarkerRef = useRef<any>(null);
  const targetCircleRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Cálculos geodésicos en tiempo real
  const currentDistance = useMemo(() => {
    if (!userCoords) return null;
    return calculateHaversineDistance(
      userCoords.lat,
      userCoords.lng,
      mission.targetLat,
      mission.targetLng
    );
  }, [userCoords, mission.targetLat, mission.targetLng]);

  const currentBearing = useMemo(() => {
    if (!userCoords) return null;
    return calculateBearing(
      userCoords.lat,
      userCoords.lng,
      mission.targetLat,
      mission.targetLng
    );
  }, [userCoords, mission.targetLat, mission.targetLng]);

  const isInsideRadius = useMemo(() => {
    if (currentDistance === null) return false;
    return currentDistance <= mission.radiusMeters;
  }, [currentDistance, mission.radiusMeters]);

  const directionInfo = useMemo(() => {
    if (currentBearing === null) return null;
    return getCardinalDirection(currentBearing);
  }, [currentBearing]);

  // Cargar Google Maps API si hay key disponible
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsScript().then((loaded) => {
      if (isMounted) {
        setHasGoogleMaps(loaded);
        if (loaded) {
          setActiveView('map');
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Iniciar geolocalización
  const startGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    sutzAudio.playClick();

    // Detener watcher anterior si existe
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Usar watchPosition para seguimiento continuo y reactivo
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude, accuracy });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Permiso de GPS denegado. Habilita los permisos de ubicación en tu navegador para continuar.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('No se pudo determinar tu posición. Verifica que tu GPS esté encendido.');
            break;
          case err.TIMEOUT:
            setGeoError('Tiempo de espera agotado buscando señal GPS. Intenta en un lugar despejado.');
            break;
          default:
            setGeoError('Error desconocido de ubicación: ' + err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );
  }, []);

  // Autoiniciar GPS al abrir el modal
  useEffect(() => {
    if (isOpen) {
      startGeolocation();
    }
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOpen, startGeolocation]);

  // Inicializar o actualizar mapa de Google Maps
  useEffect(() => {
    if (!isOpen || activeView !== 'map' || !hasGoogleMaps || !mapContainerRef.current) return;
    if (!(window as any).google?.maps) return;

    setMapLoading(true);

    try {
      const g = (window as any).google.maps;

      // Si no existe mapa, instanciarlo
      if (!googleMapRef.current) {
        const map = new g.Map(mapContainerRef.current, {
          center: { lat: mission.targetLat, lng: mission.targetLng },
          zoom: 17,
          styles: SUTZ_GOOGLE_MAPS_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy'
        });
        googleMapRef.current = map;

        // Marcador de la meta (escuela / sitio)
        targetMarkerRef.current = new g.Marker({
          position: { lat: mission.targetLat, lng: mission.targetLng },
          map,
          title: mission.placeName,
          icon: {
            path: g.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#f59e0b', // Ámbar interactivo Sutz
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Círculo del radio de tolerancia
        targetCircleRef.current = new g.Circle({
          strokeColor: '#f59e0b',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#f59e0b',
          fillOpacity: 0.15,
          map,
          center: { lat: mission.targetLat, lng: mission.targetLng },
          radius: mission.radiusMeters
        });
      }

      // Actualizar marcador del usuario si hay coordenadas
      if (googleMapRef.current && userCoords) {
        const userPos = { lat: userCoords.lat, lng: userCoords.lng };

        if (!userMarkerRef.current) {
          userMarkerRef.current = new g.Marker({
            position: userPos,
            map: googleMapRef.current,
            title: 'Tu Ubicación',
            icon: {
              path: g.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: isInsideRadius ? '#10b981' : '#38bdf8', // Verde éxito o cian guía
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });
        } else {
          userMarkerRef.current.setPosition(userPos);
          userMarkerRef.current.setIcon({
            path: g.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: isInsideRadius ? '#10b981' : '#38bdf8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          });
        }

        // Ajustar círculo a verde si está adentro
        if (targetCircleRef.current) {
          targetCircleRef.current.setOptions({
            strokeColor: isInsideRadius ? '#10b981' : '#f59e0b',
            fillColor: isInsideRadius ? '#10b981' : '#f59e0b'
          });
        }

        // Ajustar vista para encuadrar usuario y meta
        const bounds = new g.LatLngBounds();
        bounds.extend(new g.LatLng(mission.targetLat, mission.targetLng));
        bounds.extend(new g.LatLng(userCoords.lat, userCoords.lng));
        googleMapRef.current.fitBounds(bounds, 50);
      }
    } catch (err) {
      console.warn('[SutzGeoMission] Error inicializando Google Map:', err);
    } finally {
      setMapLoading(false);
    }
  }, [isOpen, activeView, hasGoogleMaps, mission, userCoords, isInsideRadius]);

  // Completar reto y otorgar recompensas
  const handleClaimReward = async () => {
    if (!isInsideRadius && !isCompleted) return;

    sutzAudio.playSuccess();
    sutzAudio.playReward();

    const xpToAdd = mission.rewardXp || 250;
    const gemsToAdd = mission.rewardGems || 5;
    const scrollsToAdd = mission.rewardScrolls || 1;

    addResources({
      puntos: xpToAdd,
      gemas: gemsToAdd,
      pergaminos: scrollsToAdd
    });

    setIsCompleted(true);
    setRewardClaimed(true);

    // Si viene desde AcademiaQR / SOSQR, reportar la finalización al puente
    if (isAcademiaQrSessionActive()) {
      try {
        await reportChallengeCompletion({
          challengeId: mission.code || mission.id,
          score: 20,
          percentage: 100,
          feedback: `Geo-Misión completada con éxito en ${mission.placeName}`
        });
      } catch (e) {
        console.warn('Error reportando a AcademiaQR/SOSQR:', e);
      }
    }

    if (onComplete) {
      onComplete({ ...mission, isCompleted: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sutz-geo-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="sutz-geo-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <header className="sutz-geo-modal-header">
          <div className="sutz-geo-header-title-box">
            <span className="sutz-geo-badge">📍 GEO-MISIÓN TERRITORIAL</span>
            <h2 className="sutz-geo-title">{mission.title}</h2>
          </div>
          <button 
            type="button" 
            className="sutz-geo-close-btn" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </header>

        {/* Selector de Vista (Mapa vs Radar) */}
        <div className="sutz-geo-view-switcher">
          {hasGoogleMaps && (
            <button
              type="button"
              className={`sutz-geo-switch-tab ${activeView === 'map' ? 'active' : ''}`}
              onClick={() => {
                sutzAudio.playClick();
                setActiveView('map');
              }}
            >
              🗺️ Mapa de Satélite
            </button>
          )}
          <button
            type="button"
            className={`sutz-geo-switch-tab ${activeView === 'radar' ? 'active' : ''}`}
            onClick={() => {
              sutzAudio.playClick();
              setActiveView('radar');
            }}
          >
            🧭 Radar Táctico SUTZ
          </button>
        </div>

        {/* Contenido Visual Central */}
        <div className="sutz-geo-display-area">
          {activeView === 'map' && hasGoogleMaps ? (
            <div className="sutz-geo-map-wrapper">
              <div ref={mapContainerRef} className="sutz-geo-google-map" />
              {mapLoading && (
                <div className="sutz-geo-loading-overlay">
                  <div className="sutz-geo-spinner" />
                  <span>Cargando cartografía...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="sutz-geo-radar-wrapper">
              {/* Radar Circular Táctico */}
              <div className="sutz-geo-radar-dial">
                {/* Anillos de distancia */}
                <div className="sutz-radar-ring ring-1" />
                <div className="sutz-radar-ring ring-2" />
                <div className="sutz-radar-ring ring-3" />
                <div className="sutz-radar-axis-x" />
                <div className="sutz-radar-axis-y" />

                {/* Haz de escaneo giratorio */}
                <div className="sutz-radar-sweep" />

                {/* Aguja de orientación hacia el objetivo */}
                {currentBearing !== null && (
                  <div 
                    className="sutz-radar-needle" 
                    style={{ transform: `rotate(${currentBearing}deg)` }}
                  >
                    <div className="sutz-radar-needle-head" />
                  </div>
                )}

                {/* Punto central del usuario */}
                <div className={`sutz-radar-user-blip ${isInsideRadius ? 'success' : ''}`} />

                {/* Punto objetivo */}
                <div className="sutz-radar-target-blip" title={mission.placeName}>
                  <span className="sutz-radar-target-icon">🏛️</span>
                </div>
              </div>

              {/* Brújula / Dirección textual */}
              {directionInfo && (
                <div className="sutz-radar-compass-readout">
                  <span className="sutz-compass-arrow">{directionInfo.arrow}</span>
                  <span className="sutz-compass-text">Rumbo hacia el {directionInfo.label} ({Math.round(currentBearing || 0)}°)</span>
                </div>
              )}
            </div>
          )}

          {/* Tarjeta de Métricas Geodésicas */}
          <div className="sutz-geo-metrics-card">
            <div className="sutz-geo-metric-item">
              <span className="sutz-geo-metric-label">Destino</span>
              <span className="sutz-geo-metric-value dest">{mission.placeName}</span>
            </div>

            <div className="sutz-geo-metric-item">
              <span className="sutz-geo-metric-label">Distancia</span>
              <span className={`sutz-geo-metric-value ${isInsideRadius ? 'success' : 'pending'}`}>
                {currentDistance !== null ? formatDistance(currentDistance) : (isLocating ? 'Calculando...' : '---')}
              </span>
            </div>

            <div className="sutz-geo-metric-item">
              <span className="sutz-geo-metric-label">Radio Permitido</span>
              <span className="sutz-geo-metric-value">±{mission.radiusMeters} m</span>
            </div>

            {userCoords && (
              <div className="sutz-geo-metric-item">
                <span className="sutz-geo-metric-label">Precisión GPS</span>
                <span className="sutz-geo-metric-value">±{Math.round(userCoords.accuracy)} m</span>
              </div>
            )}
          </div>
        </div>

        {/* Pista Didáctica / Mensaje de Estado */}
        <div className="sutz-geo-info-panel">
          {geoError ? (
            <div className="sutz-geo-alert error">
              <span>⚠️ {geoError}</span>
              <button type="button" className="sutz-geo-retry-btn" onClick={startGeolocation}>
                Reintentar GPS
              </button>
            </div>
          ) : isInsideRadius ? (
            <div className="sutz-geo-alert success">
              <span>🎯 <strong>¡Objetivo Alcanzado!</strong> Estás dentro del área de verificación presencial.</span>
            </div>
          ) : (
            <div className="sutz-geo-alert info">
              <span className="sutz-geo-clue-icon">💡</span>
              <div className="sutz-geo-clue-text">
                <strong>Pista de Exploración:</strong> {mission.clue || mission.addressHint || 'Dirígete al punto indicado para desbloquear este nodo territorial en SUTZ.'}
              </div>
            </div>
          )}
        </div>

        {/* Recompensas a desbloquear */}
        <div className="sutz-geo-rewards-preview">
          <span className="sutz-geo-reward-pill">⚡ +{mission.rewardXp || 250} Sabiduría</span>
          <span className="sutz-geo-reward-pill">💎 +{mission.rewardGems || 5} Gemas</span>
          <span className="sutz-geo-reward-pill">📜 +{mission.rewardScrolls || 1} Pergamino</span>
        </div>

        {/* Barra de Acciones Ergonómica Táctil */}
        <footer className="sutz-geo-modal-footer">
          {rewardClaimed || isCompleted ? (
            <div className="sutz-geo-claimed-banner">
              <span>🏆 ¡Geo-Misión Validada y Recompensas Acreditadas!</span>
              <button type="button" className="sutz-geo-finish-btn" onClick={onClose}>
                Continuar Explorando
              </button>
            </div>
          ) : (
            <div className="sutz-geo-action-group">
              <button 
                type="button" 
                className="sutz-geo-refresh-btn"
                onClick={startGeolocation}
                disabled={isLocating}
                title="Actualizar posición satelital"
              >
                {isLocating ? '🛰️ Buscando...' : '🔄 Actualizar GPS'}
              </button>

              <button
                type="button"
                className={`sutz-geo-validate-btn ${isInsideRadius ? 'ready' : 'disabled'}`}
                disabled={!isInsideRadius}
                onClick={handleClaimReward}
              >
                {isInsideRadius 
                  ? '✨ Validar Presencia y Reclamar Recompensas' 
                  : (currentDistance !== null ? `Acércate a la meta (Faltan ${formatDistance(Math.max(0, currentDistance - mission.radiusMeters))})` : 'Esperando señal GPS...')}
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};
