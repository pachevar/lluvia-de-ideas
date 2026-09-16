import type { CustomHexagon } from '../types';

export type HexPillarId = 
  | 'creatika' 
  | '100tek' 
  | 'tienda' 
  | 'lab' 
  | 'mercado' 
  | 'gran_galeria' 
  | 'sutz';

export interface HexPillarInfo {
  id: HexPillarId;
  label: string;
  icon: string;
  color: string;
  glow: string;
  bgTint: string;
  borderTint: string;
}

export const HEX_PILLARS: Record<HexPillarId, HexPillarInfo> = {
  creatika: {
    id: 'creatika',
    label: 'Creatika',
    icon: '✨',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.45)',
    bgTint: 'rgba(236, 72, 153, 0.20)',
    borderTint: 'rgba(236, 72, 153, 0.50)'
  },
  '100tek': {
    id: '100tek',
    label: '100tek',
    icon: '⚡',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgTint: 'rgba(245, 158, 11, 0.20)',
    borderTint: 'rgba(245, 158, 11, 0.50)'
  },
  tienda: {
    id: 'tienda',
    label: 'Tienda',
    icon: '📚',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
    bgTint: 'rgba(56, 189, 248, 0.20)',
    borderTint: 'rgba(56, 189, 248, 0.50)'
  },
  lab: {
    id: 'lab',
    label: 'LAB',
    icon: '🧪',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgTint: 'rgba(16, 185, 129, 0.20)',
    borderTint: 'rgba(16, 185, 129, 0.50)'
  },
  mercado: {
    id: 'mercado',
    label: 'Mercado',
    icon: '🛍️',
    color: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.45)',
    bgTint: 'rgba(20, 184, 166, 0.20)',
    borderTint: 'rgba(20, 184, 166, 0.50)'
  },
  gran_galeria: {
    id: 'gran_galeria',
    label: 'Gran Galería',
    icon: '💡',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
    bgTint: 'rgba(168, 85, 247, 0.20)',
    borderTint: 'rgba(168, 85, 247, 0.50)'
  },
  sutz: {
    id: 'sutz',
    label: 'Sutz',
    icon: '☁️',
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.45)',
    bgTint: 'rgba(129, 140, 248, 0.20)',
    borderTint: 'rgba(129, 140, 248, 0.50)'
  }
};

/**
 * Normaliza cualquier identificador hacia un HexPillarId válido
 */
export function normalizePillarId(raw?: string | null): HexPillarId | null {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  if (lower === 'pozo_ideas' || lower === 'pozo' || lower === 'gran_galeria' || lower === 'grangaleria') {
    return 'gran_galeria';
  }
  if (lower === 'laboratorio' || lower === 'laboratorios' || lower === 'lab') {
    return 'lab';
  }
  if (lower === 'creatika') return 'creatika';
  if (lower === '100tek') return '100tek';
  if (lower === 'tienda') return 'tienda';
  if (lower === 'mercado') return 'mercado';
  if (lower === 'sutz') return 'sutz';
  return null;
}

/**
 * Deduce de forma inteligente el pilar al que pertenece un hexágono.
 * 1. Prioridad: asignación explícita `hex.pillar`.
 * 2. Deducción por ruta / target (`hex.action.target`).
 * 3. Deducción por palabras clave en el título (`hex.title`).
 */
export function getHexPillarInfo(hex: CustomHexagon): HexPillarInfo | null {
  if (!hex) return null;

  // 1. Asignación explícita
  if (hex.pillar) {
    const normalized = normalizePillarId(hex.pillar);
    if (normalized && HEX_PILLARS[normalized]) {
      return HEX_PILLARS[normalized];
    }
  }

  // 2. Deducción por acción y target
  const target = (hex.action?.target || '').trim();
  if (target) {
    const targetLower = target.toLowerCase();

    // Creatika
    if (targetLower.includes('/creatika')) {
      return HEX_PILLARS.creatika;
    }

    // 100tek
    if (targetLower.includes('/100tek')) {
      return HEX_PILLARS['100tek'];
    }

    // Tienda
    if (targetLower === '/tienda' || targetLower === '/libros' || targetLower.startsWith('/tienda/') || targetLower.startsWith('/libros/')) {
      return HEX_PILLARS.tienda;
    }

    // LAB
    if (
      targetLower.includes('/laboratorios') || 
      targetLower.includes('/animacion-educativa') || 
      targetLower.includes('/robotica-educativa') || 
      targetLower.includes('/pensamiento-cientifico')
    ) {
      return HEX_PILLARS.lab;
    }

    // Mercado (Bingo, Boletos, Cotizador)
    if (
      targetLower.includes('/juegos/bingo') || 
      targetLower.includes('/bingo') || 
      targetLower.includes('/mercado')
    ) {
      return HEX_PILLARS.mercado;
    }

    // Gran Galería
    if (
      targetLower.includes('pozo') || 
      targetLower.includes('galeria') || 
      targetLower.includes('banco-proyectos')
    ) {
      return HEX_PILLARS.gran_galeria;
    }

    // Sutz / Popol Vuh / Leyendas
    if (
      targetLower === '/sutz' ||
      targetLower === '/universo-de-juracan' ||
      targetLower === '/neurociencia' ||
      targetLower.startsWith('story-') ||
      ['camazotz', 'ixkik', 'ixmukanne', 'juracan', 'ququmatz'].includes(targetLower)
    ) {
      return HEX_PILLARS.sutz;
    }
  }

  // 3. Deducción contextual por título del hexágono
  const title = (hex.title || '').toLowerCase();
  if (title) {
    if (title.includes('tienda') || title.includes('libros')) {
      return HEX_PILLARS.tienda;
    }
    if (title.includes('creatika') || title.includes('cuento') || title.includes('color') || title.includes('personaje')) {
      return HEX_PILLARS.creatika;
    }
    if (title.includes('100tek') || title.includes('secuencia') || title.includes('solar')) {
      return HEX_PILLARS['100tek'];
    }
    if (title.includes('lab') || title.includes('laboratorio') || title.includes('robótica') || title.includes('robotica') || title.includes('animación') || title.includes('animacion') || title.includes('científico') || title.includes('cientifico')) {
      return HEX_PILLARS.lab;
    }
    if (title.includes('bingo') || title.includes('mercado') || title.includes('boleto')) {
      return HEX_PILLARS.mercado;
    }
    if (title.includes('pozo') || title.includes('galería') || title.includes('galeria')) {
      return HEX_PILLARS.gran_galeria;
    }
    if (title.includes('juracán') || title.includes('juracan') || title.includes('sutz') || title.includes('camazotz') || title.includes('ixkik') || title.includes('ixmukané') || title.includes('ququmatz')) {
      return HEX_PILLARS.sutz;
    }
  }

  return null;
}
