// src/data/solarScaleChallenge.ts
// Datos y lógica pura del "Reto Urbano: Sistema Solar a Escala".
// Escala fija: el Sol mide 26 cm de diámetro en la tarjeta física.

export const SUN_CARD_CM = 26;
export const SUN_DIAMETER_KM = 1_392_700;

/** Metros a escala por cada kilómetro real (Sol = 26 cm). */
export const METERS_PER_KM = (SUN_CARD_CM / 100) / SUN_DIAMETER_KM;

export type ChallengeAstroId =
  | 'mercurio' | 'venus' | 'tierra' | 'marte'
  | 'jupiter' | 'saturno' | 'urano' | 'neptuno';

export interface ChallengeAstro {
  id: ChallengeAstroId;
  name: string;
  icon: string;
  color: string;
  /** Distancias reales al Sol en millones de km. */
  meanMkm: number;
  perihelionMkm: number;
  aphelionMkm: number;
  diameterKm: number;
  /** Equivalencia cotidiana de la distancia a escala. */
  everyday: string;
}

export const CHALLENGE_ASTROS: ChallengeAstro[] = [
  { id: 'mercurio', name: 'Mercurio', icon: '☿', color: '#9ca3af', meanMkm: 57.9, perihelionMkm: 46.0, aphelionMkm: 69.8, diameterKm: 4879, everyday: 'Casi el largo de un autobús escolar' },
  { id: 'venus', name: 'Venus', icon: '♀', color: '#f5c574', meanMkm: 108.2, perihelionMkm: 107.5, aphelionMkm: 108.9, diameterKm: 12104, everyday: 'Un poco menos que una cancha de tenis y media' },
  { id: 'tierra', name: 'Tierra', icon: '🌍', color: '#3b82f6', meanMkm: 149.6, perihelionMkm: 147.1, aphelionMkm: 152.1, diameterKm: 12742, everyday: 'Una cancha de baloncesto (28 m)' },
  { id: 'marte', name: 'Marte', icon: '♂', color: '#ef4444', meanMkm: 228.0, perihelionMkm: 206.6, aphelionMkm: 249.2, diameterKm: 6779, everyday: 'Casi una piscina olímpica (50 m)' },
  { id: 'jupiter', name: 'Júpiter', icon: '♃', color: '#d97706', meanMkm: 778.5, perihelionMkm: 740.5, aphelionMkm: 816.6, diameterKm: 139820, everyday: 'Una cancha y media de fútbol' },
  { id: 'saturno', name: 'Saturno', icon: '♄', color: '#e0b974', meanMkm: 1432.0, perihelionMkm: 1352.6, aphelionMkm: 1514.5, diameterKm: 116460, everyday: 'Casi tres cuadras urbanas' },
  { id: 'urano', name: 'Urano', icon: '♅', color: '#22d3ee', meanMkm: 2867.0, perihelionMkm: 2741.3, aphelionMkm: 3003.6, diameterKm: 50724, everyday: 'Más de cinco cuadras' },
  { id: 'neptuno', name: 'Neptuno', icon: '♆', color: '#6366f1', meanMkm: 4515.0, perihelionMkm: 4444.5, aphelionMkm: 4545.7, diameterKm: 49244, everyday: 'Cerca de nueve cuadras (casi 1 km)' }
];

export const getChallengeAstro = (id: string): ChallengeAstro | undefined =>
  CHALLENGE_ASTROS.find(a => a.id === id);

/** Convierte millones de km reales a metros a escala. */
export const mkmToScaleMeters = (mkm: number): number => mkm * 1_000_000 * METERS_PER_KM;

export interface ScaleDistances {
  mean: number;
  perihelion: number;
  aphelion: number;
}

export const getScaleDistances = (astro: ChallengeAstro): ScaleDistances => ({
  mean: mkmToScaleMeters(astro.meanMkm),
  perihelion: mkmToScaleMeters(astro.perihelionMkm),
  aphelion: mkmToScaleMeters(astro.aphelionMkm)
});

/** Diámetro del planeta en milímetros dentro de la tarjeta (Sol = 26 cm). */
export const getScaleDiameterMm = (astro: ChallengeAstro): number =>
  astro.diameterKm * METERS_PER_KM * 1000;

// ───────────────────────── Puntuación ─────────────────────────

export type PrecisionTier = 'oro' | 'plata' | 'bronce' | 'explorador';

export interface PinScore {
  tier: PrecisionTier;
  distanceM: number;
  errorM: number;
  errorPct: number;
  slackM: number;
  bonusXp: number;
  bonusGems: number;
  label: string;
  icon: string;
}

/** Puntos por clavar un planeta (participación inmediata). */
export const PARTICIPATION_REWARD = { puntos: 40, monedas: 15 };

export const TIER_REWARDS: Record<PrecisionTier, { bonusXp: number; bonusGems: number; label: string; icon: string }> = {
  oro: { bonusXp: 150, bonusGems: 5, label: 'Oro Cósmico', icon: '🥇' },
  plata: { bonusXp: 100, bonusGems: 3, label: 'Plata Orbital', icon: '🥈' },
  bronce: { bonusXp: 60, bonusGems: 1, label: 'Bronce Explorador', icon: '🥉' },
  explorador: { bonusXp: 0, bonusGems: 0, label: 'Explorador', icon: '🧭' }
};

/**
 * Holgura por imprecisión del GPS: promedio de la precisión del Sol y del pin,
 * acotada entre 3 y 15 m (en Mercurio y Venus el GPS es del orden de la distancia).
 */
export const computeSlackMeters = (sunAccuracyM: number, pinAccuracyM: number): number => {
  const avg = ((sunAccuracyM || 0) + (pinAccuracyM || 0)) / 2;
  return Math.min(15, Math.max(3, avg));
};

export const scorePin = (
  astro: ChallengeAstro,
  distanceM: number,
  sunAccuracyM: number,
  pinAccuracyM: number
): PinScore => {
  const d = getScaleDistances(astro);
  const slackM = computeSlackMeters(sunAccuracyM, pinAccuracyM);
  const errorM = Math.abs(distanceM - d.mean);
  const errorPct = (errorM / d.mean) * 100;

  let tier: PrecisionTier = 'explorador';
  if (distanceM >= d.perihelion - slackM && distanceM <= d.aphelion + slackM) tier = 'oro';
  else if (errorM <= d.mean * 0.05 + slackM) tier = 'plata';
  else if (errorM <= d.mean * 0.15 + slackM) tier = 'bronce';

  const reward = TIER_REWARDS[tier];
  return { tier, distanceM, errorM, errorPct, slackM, bonusXp: reward.bonusXp, bonusGems: reward.bonusGems, label: reward.label, icon: reward.icon };
};

export const formatMeters = (m: number): string =>
  m >= 100 ? `${Math.round(m)} m` : `${m.toFixed(1)} m`;

/** Genera un código de sala legible, p. ej. SOL-4K7Q */
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `SOL-${out}`;
};

export const normalizeRoomCode = (raw: string): string =>
  raw.trim().toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '').slice(0, 24);

/** Colores determinísticos por grupo para el mapa. */
export const teamColor = (name: string): string => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 70%, 60%)`;
};

