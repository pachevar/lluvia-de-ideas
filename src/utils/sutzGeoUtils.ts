// src/utils/sutzGeoUtils.ts
// Utilidades geodésicas y de cartografía para SUTZ Mundo Virtual.
// Implementa cálculo Haversine de alta precisión, brújula/radar y cargador seguro de Google Maps API.

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

/**
 * Estilo visual oscuro neuroeducativo para Google Maps.
 * Respeta la paleta de Sutz: fondos desaturados y oscuros para inducir calma mental (#060913),
 * agua en cian profundo, y sin elementos estridentes innecesarios.
 */
export const SUTZ_GOOGLE_MAPS_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#060913' }, { weight: 2 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0d221e' }]
  },
  {
    featureType: 'poi.school',
    elementType: 'geometry',
    stylers: [{ color: '#162b3d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#293548' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#172033' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#051329' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

let googleMapsScriptPromise: Promise<boolean> | null = null;

/**
 * Carga dinámica y segura del script de Google Maps JavaScript API.
 * Retorna true si se cargó exitosamente, o false si no hay API key o falló la carga.
 */
export function loadGoogleMapsScript(customApiKey?: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // Si ya está disponible en window, resolver de inmediato
  if ((window as any).google?.maps) {
    return Promise.resolve(true);
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  const apiKey = customApiKey || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    // Si no hay API key configurada, no intentamos inyectar el script
    return Promise.resolve(false);
  }

  googleMapsScriptPromise = new Promise<boolean>((resolve) => {
    // Revisar si ya existe la etiqueta de script en el documento
    const existingScript = document.getElementById('sutz-google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'sutz-google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = (err) => {
      console.warn('[SutzGeo] No se pudo cargar Google Maps API:', err);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}
