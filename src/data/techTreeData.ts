import type { TechNode } from '../types';

/**
 * Categorías temáticas de las columnas del Árbol Tecnológico de Sutz
 */
export const TECH_TREE_COLUMNS_META: Record<number, { title: string; tier: string; badgeColor: string }> = {
  1: { title: 'Fundamentos Cero', tier: 'Tier 1 • Raíz', badgeColor: '#fb7185' },
  2: { title: 'Pliegue de Iniciación', tier: 'Tier 1 • Bifurcación', badgeColor: '#fb7185' },
  // Columnas 3 a 15
  ...Array.from({ length: 13 }, (_, i) => i + 3).reduce((acc, col) => ({
    ...acc,
    [col]: { title: `Expansión Modular Col ${col}`, tier: 'Tier 2 • Matriz 6x6', badgeColor: '#38bdf8' }
  }), {}),
  // Columnas 16 a 30
  ...Array.from({ length: 15 }, (_, i) => i + 16).reduce((acc, col) => ({
    ...acc,
    [col]: { title: `Convergencia Masiva Col ${col}`, tier: 'Tier 3 • Matriz 12x12', badgeColor: '#c084fc' }
  }), {})
};

const ICONS_LIST = ['⚙️', '⚡', '🔬', '🌐', '🤖', '🧬', '🚀', '🔮', '🛰️', '🧠', '📡', '💡'];

/**
 * Genera el estado inicial por defecto de los 267 nodos de tecnología.
 */
export function generateInitialTechTreeData(): Record<string, TechNode> {
  const nodes: Record<string, TechNode> = {};

  for (let col = 1; col <= 30; col++) {
    let nodeCount = 6;
    if (col === 1) nodeCount = 3;
    else if (col >= 16) nodeCount = 12;

    for (let i = 1; i <= nodeCount; i++) {
      const id = `c${col}-n${i}`;
      const icon = ICONS_LIST[(col + i) % ICONS_LIST.length];

      // Determinar dependencias de la columna anterior
      let parents: string[] = [];

      if (col === 2) {
        // Columna 2: 6 nodos derivados 2:1 desde los 3 nodos de Columna 1
        const parentIndex = Math.ceil(i / 2);
        parents = [`c1-n${parentIndex}`];
      } else if (col > 2 && col <= 15) {
        // Columnas 3 a 15: 6 nodos derivados de los 6 nodos anteriores
        const prev1 = i;
        const prev2 = i === 1 ? 6 : i - 1;
        parents = [`c${col - 1}-n${prev1}`, `c${col - 1}-n${prev2}`];
      } else if (col === 16) {
        // Columna 16: Se duplican a 12 nodos (3 dependencias de la Columna 15)
        const p1 = Math.ceil(i / 2);
        const p2 = p1 === 6 ? 1 : p1 + 1;
        const p3 = p1 === 1 ? 6 : p1 - 1;
        parents = [`c15-n${p1}`, `c15-n${p2}`, `c15-n${p3}`];
      } else if (col >= 17) {
        // Columnas 17 a 30: 12 nodos que dependen de 3 de la columna anterior
        const p1 = i;
        const p2 = i === 1 ? 12 : i - 1;
        const p3 = i === 12 ? 1 : i + 1;
        parents = [`c${col - 1}-n${p1}`, `c${col - 1}-n${p2}`, `c${col - 1}-n${p3}`];
      }

      nodes[id] = {
        id,
        col,
        indexInCol: i,
        title: `Tecnología ${col}.${i}`,
        shortDescription: `Descripción corta y genérica para el nodo ${col}.${i}. Configurable desde el panel de Gerencia.`,
        icon,
        parents,
        unlocked: col === 1
      };
    }
  }

  return nodes;
}

export const INITIAL_TECH_TREE_DATA = generateInitialTechTreeData();
