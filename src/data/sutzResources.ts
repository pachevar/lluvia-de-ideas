import type { SutzResourceKey, SutzResources } from '../types';

/**
 * Registro único de recursos del mundo virtual de Sutz.
 * Mapa (HUD) y Árbol de Tecnología comparten estas definiciones para que
 * los recursos "coincidan" entre ambas vistas del mundo.
 */
export const SUTZ_RESOURCE_KEYS: SutzResourceKey[] = ['pergaminos', 'puntos', 'monedas', 'gemas'];

export const SUTZ_RESOURCE_META: Record<SutzResourceKey, { label: string; short: string; icon: string; color: string }> = {
  pergaminos: { label: 'Pergaminos Míticos', short: 'Pergaminos', icon: '📜', color: '#818cf8' },
  puntos: { label: 'Puntos de Sabiduría', short: 'Sabiduría', icon: '⚡', color: '#38bdf8' },
  monedas: { label: 'Jade Sagrado', short: 'Jade', icon: '🟢', color: '#10b981' },
  gemas: { label: 'Gemas de Aprendizaje', short: 'Gemas', icon: '💎', color: '#f43f5e' }
};

/** Valores iniciales del monedero (reflejan los recursos mostrados originalmente en el HUD). */
export const DEFAULT_SUTZ_RESOURCES: SutzResources = {
  pergaminos: 0,
  puntos: 850,
  monedas: 2800,
  gemas: 260
};

/** Costo por defecto de un nodo según su columna (1-30) y posición dentro de la columna. */
export function generateDefaultResourceCost(col: number): Record<SutzResourceKey, number> {
  return {
    pergaminos: Math.ceil(col / 8), // 1..4 pergaminos a lo largo de la ruta
    puntos: 50 + (col - 1) * 20,   // costo principal de puntos de conocimiento
    monedas: 40 + (col - 1) * 15,  // monedas de oro progresivas
    gemas: Math.ceil(col / 6)      // 1..5 gemas
  };
}

/** Normaliza un costo parcial (editable en admin) rellenando los valores por defecto. */
export function resolveResourceCost(col: number, partial?: Partial<Record<SutzResourceKey, number>>): Record<SutzResourceKey, number> {
  const base = generateDefaultResourceCost(col);
  if (!partial) return base;
  return {
    pergaminos: partial.pergaminos ?? base.pergaminos,
    puntos: partial.puntos ?? base.puntos,
    monedas: partial.monedas ?? base.monedas,
    gemas: partial.gemas ?? base.gemas
  };
}

/** Formatea cantidades grandes de forma compacta (ej. 2800 -> 2.8K). */
export function formatSutzResource(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return value.toLocaleString('es-GT');
}