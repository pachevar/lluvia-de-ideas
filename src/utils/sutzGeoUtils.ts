// src/utils/sutzGeoUtils.ts
// Utilidades geodésicas y de cartografía para SUTZ Mundo Virtual y Reto de Escala.
// Implementa cálculo Haversine de alta precisión, brújula/radar y capas Leaflet (OpenStreetMap/CARTO/Satélite).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/sutz-leaflet.css';

/**
 * Radio medio de la Tierra en metros (WGS-84 esférico estándar).
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Convierte grados a radianes.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convierte radianes a grados.
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calcula la distancia ortodrómica en metros entre dos coordenadas geográficas
 * utilizando la fórmula de Haversine.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calcula el rumbo inicial (azimut o bearing) en grados (0° a 360°)
 * desde el origen (lat1, lon1) hacia el destino (lat2, lon2).
 * 0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const dLon = toRadians(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const initialBearing = toDegrees(Math.atan2(y, x));
  return (initialBearing + 360) % 360;
}

/**
 * Determina si la posición actual se encuentra dentro del radio de tolerancia de la meta.
 */
export function isWithinRadius(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateHaversineDistance(currentLat, currentLng, targetLat, targetLng);
  return distance <= radiusMeters;
}

/**
 * Formatea una distancia en metros a una cadena amigable e intuitiva.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Obtiene la etiqueta del punto cardinal a partir del azimut (bearing).
 */
export function getCardinalDirection(bearing: number): { code: string; label: string; arrow: string } {
  const normalized = (bearing + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return { code: 'N', label: 'Norte', arrow: '↑' };
  if (normalized >= 22.5 && normalized < 67.5) return { code: 'NE', label: 'Noreste', arrow: '↗' };
  if (normalized >= 67.5 && normalized < 112.5) return { code: 'E', label: 'Este', arrow: '→' };
  if (normalized >= 112.5 && normalized < 157.5) return { code: 'SE', label: 'Sureste', arrow: '↘' };
  if (normalized >= 157.5 && normalized < 202.5) return { code: 'S', label: 'Sur', arrow: '↓' };
  if (normalized >= 202.5 && normalized < 247.5) return { code: 'SO', label: 'Suroeste', arrow: '↙' };
  if (normalized >= 247.5 && normalized < 292.5) return { code: 'O', label: 'Oeste', arrow: '←' };
  return { code: 'NO', label: 'Noroeste', arrow: '↖' };
}

export type SutzMapLayerMode = 'dark' | 'satellite';

/**
 * Crea la capa base de teselas para Leaflet (100% libre de API Keys):
 * - 'dark': Esri World Street Map estilizado en modo oscuro vía `.sutz-tiles-dark`.
 * - 'satellite': Esri World Imagery (vista satelital para patios escolares y campo).
 */
export function createSutzTileLayer(mode: SutzMapLayerMode): L.TileLayer {
  if (mode === 'satellite') {
    return L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxNativeZoom: 18,
        maxZoom: 20,
        attribution: 'Tiles &copy; Esri'
      }
    );
  }
  return L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    {
      maxNativeZoom: 18,
      maxZoom: 20,
      attribution: 'Tiles &copy; Esri'
    }
  );
}
