import type { TechNode } from '../types';

/**
 * Genera la estructura predeterminada del Árbol de Tecnologías de Sutz (30 Columnas / 267 Nodos).
 * 
 * Reglas de dimensiones:
 * - Columna 1: 3 tecnologías iniciales.
 * - Columnas 2 a 15: 6 tecnologías por columna (Col 2 se pliega 2:1 desde las 3 iniciales).
 * - Columnas 16 a 30: 12 tecnologías por columna (se duplican desde la Col 15, cada una dependiendo de 3 anteriores).
 */
export function generateDefaultTechTree(): Record<string, TechNode> {
  const nodes: Record<string, TechNode> = {};

  const iconsList = ['⚙️', '⚡', '🔬', '🌐', '🤖', '🧬', '🚀', '🔮', '🛰️', '🧠', '📡', '💡'];

  for (let col = 1; col <= 30; col++) {
    let nodeCount = 6;
    if (col === 1) nodeCount = 3;
    else if (col >= 16) nodeCount = 12;

    for (let i = 1; i <= nodeCount; i++) {
      const id = `c${col}-n${i}`;
      const icon = iconsList[(col + i) % iconsList.length];

      // Determinar padres (nodos de la columna previa de los que depende)
      let parents: string[] = [];

      if (col === 2) {
        // Columna 2: 6 nodos derivados de los 3 nodos de Columna 1 (2 por cada nodo raíz)
        const parentIndex = Math.ceil(i / 2); // 1,1 -> 1 | 2,2 -> 2 | 3,3 -> 3
        parents = [`c1-n${parentIndex}`];
      } else if (col > 2 && col <= 15) {
        // Columnas 3 a 15: 6 nodos que se relacionan con los 6 nodos de la columna previa
        const prev1 = i;
        const prev2 = i === 1 ? 6 : i - 1;
        parents = [`c${col - 1}-n${prev1}`, `c${col - 1}-n${prev2}`];
      } else if (col === 16) {
        // Columna 16: Se duplican a 12 nodos. Cada nodo se relaciona con 3 de la columna 15
        const p1 = Math.ceil(i / 2);
        const p2 = p1 === 6 ? 1 : p1 + 1;
        const p3 = p1 === 1 ? 6 : p1 - 1;
        parents = [`c15-n${p1}`, `c15-n${p2}`, `c15-n${p3}`];
      } else if (col >= 17) {
        // Columnas 17 a 30: 12 nodos que dependen de 3 de la columna previa (12 nodos)
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
        unlocked: col === 1 // Desbloqueadas las iniciales por defecto
      };
    }
  }

  return nodes;
}

/**
 * Retorna los nodos agrupados por columna (1 a 30)
 */
export function getNodesByColumn(nodesMap: Record<string, TechNode>): Record<number, TechNode[]> {
  const result: Record<number, TechNode[]> = {};
  for (let c = 1; c <= 30; c++) {
    result[c] = [];
  }

  Object.values(nodesMap).forEach(node => {
    if (!result[node.col]) {
      result[node.col] = [];
    }
    result[node.col].push(node);
  });

  // Ordenar por indexInCol
  for (let c = 1; c <= 30; c++) {
    result[c].sort((a, b) => a.indexInCol - b.indexInCol);
  }

  return result;
}
