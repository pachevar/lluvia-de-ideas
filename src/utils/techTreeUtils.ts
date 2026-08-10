import type { TechNode } from '../types';
import { generateInitialTechTreeData } from '../data/techTreeData';

/**
 * Retorna la estructura predeterminada del Árbol Tecnológico de Sutz.
 */
export function generateDefaultTechTree(): Record<string, TechNode> {
  return generateInitialTechTreeData();
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

/**
 * Verifica si un nodo específico cumple los requisitos para estar desbloqueado según sus padres.
 */
export function isNodeUnlocked(node: TechNode, nodesMap: Record<string, TechNode>): boolean {
  if (node.col === 1 || node.unlocked) return true;
  if (!node.parents || node.parents.length === 0) return true;
  
  // Requiere que al menos uno de los padres esté completado/desbloqueado
  return node.parents.some(pId => nodesMap[pId]?.unlocked);
}
