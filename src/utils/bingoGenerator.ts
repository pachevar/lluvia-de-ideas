// Utilidad para generación de lógicas de Bingo y Matemáticas Anticolisión

// Columnas de un cartón tradicional de 75 bolas
const BINGO_RANGES = [
  { min: 1, max: 15 },  // B
  { min: 16, max: 30 }, // I
  { min: 31, max: 45 }, // N
  { min: 46, max: 60 }, // G
  { min: 61, max: 75 }  // O
];

/**
 * Obtiene 'count' números aleatorios únicos dentro de un rango [min, max]
 */
const getRandomNumbers = (min: number, max: number, count: number): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Genera la matriz 5x5 de un cartón de bingo.
 * El centro (fila 2, columna 2) es null (casilla libre).
 */
export const generateBingoMatrix = (): (number | null)[][] => {
  const matrix: (number | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));

  for (let col = 0; col < 5; col++) {
    const range = BINGO_RANGES[col];
    // La columna N (index 2) solo necesita 4 números porque el centro es libre
    const count = col === 2 ? 4 : 5;
    const nums = getRandomNumbers(range.min, range.max, count);

    let numIndex = 0;
    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        matrix[row][col] = null; // Free space
      } else {
        matrix[row][col] = nums[numIndex++];
      }
    }
  }

  return matrix;
};

/**
 * Convierte una matriz 5x5 en un string único para asegurar que no se repitan cartones
 * Formato: "B:1,2,3,4,5|I:16,17,18,19,20|N:31,32,FREE,34,35|G:46,47,48,49,50|O:61,62,63,64,65"
 */
export const hashBingoMatrix = (matrix: (number | null)[][]): string => {
  const cols = ['B', 'I', 'N', 'G', 'O'];
  const columnsData: string[] = [];

  for (let col = 0; col < 5; col++) {
    const colNums = [];
    for (let row = 0; row < 5; row++) {
      colNums.push(matrix[row][col] === null ? 'FREE' : matrix[row][col]);
    }
    columnsData.push(`${cols[col]}:${colNums.join(',')}`);
  }

  return columnsData.join('|');
};

export type MarkedSlots = (boolean | null)[][] | Record<string, (boolean | null)[]>;

/**
 * Función validadora genérica por patrones.
 * Comprueba si un cartón es ganador según el patrón especificado.
 */
export const validateBingoCard = (
  matrix: (number | null)[][], 
  drawnNumbers: number[], 
  pattern: string = 'full',
  markedSlots?: MarkedSlots
): { isWinner: boolean, missingNumbers: number[] } => {
  if (!matrix || !Array.isArray(matrix)) {
    return { isWinner: false, missingNumbers: [] };
  }

  const isCovered = (r: number, c: number): boolean => {
    if (!matrix[r]) return false;
    const val = matrix[r][c];
    if (val === null) return true; // Centro (espacio libre) siempre cubierto

    // 1. Debe haber salido en la tómbola
    if (!drawnNumbers.includes(val)) return false;

    // 2. Si se provee la matriz/objeto de casillas marcadas, DEBE estar marcada por el usuario
    if (markedSlots) {
      let isMarked = true;
      const mObj = markedSlots as Record<string, (boolean | null)[]>;
      if (Array.isArray(markedSlots) && markedSlots[r]) {
        isMarked = Boolean(markedSlots[r][c]);
      } else if (typeof markedSlots === 'object' && mObj[`r${r}`]) {
        isMarked = Boolean(mObj[`r${r}`][c]);
      }
      if (!isMarked) return false;
    }

    return true;
  };

  const getVal = (row: number, col: number): number | null => matrix[row] ? matrix[row][col] : null;

  // Caso 1: Cartón Lleno
  if (pattern === 'full') {
    const missing: number[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const val = getVal(r, c);
        if (val !== null && !isCovered(r, c)) {
          missing.push(val);
        }
      }
    }
    return { isWinner: missing.length === 0, missingNumbers: missing };
  }

  // Caso 2: Cuatro Esquinas
  if (pattern === 'four_corners') {
    const corners = [
      { r: 0, c: 0 }, { r: 0, c: 4 },
      { r: 4, c: 0 }, { r: 4, c: 4 }
    ];
    const missing = corners
      .map(p => ({ val: getVal(p.r, p.c), covered: isCovered(p.r, p.c) }))
      .filter(p => p.val !== null && !p.covered)
      .map(p => p.val as number);
    return { isWinner: missing.length === 0, missingNumbers: missing };
  }

  // Caso 3: Diagonales (cualquiera de las dos X)
  if (pattern === 'diagonal') {
    const diag1 = [{r:0,c:0}, {r:1,c:1}, {r:2,c:2}, {r:3,c:3}, {r:4,c:4}];
    const diag2 = [{r:0,c:4}, {r:1,c:3}, {r:2,c:2}, {r:3,c:1}, {r:4,c:0}];
    
    const missingDiag1 = diag1
      .map(p => ({ val: getVal(p.r, p.c), covered: isCovered(p.r, p.c) }))
      .filter(p => p.val !== null && !p.covered)
      .map(p => p.val as number);
      
    const missingDiag2 = diag2
      .map(p => ({ val: getVal(p.r, p.c), covered: isCovered(p.r, p.c) }))
      .filter(p => p.val !== null && !p.covered)
      .map(p => p.val as number);

    if (missingDiag1.length === 0) return { isWinner: true, missingNumbers: [] };
    if (missingDiag2.length === 0) return { isWinner: true, missingNumbers: [] };

    return { 
      isWinner: false, 
      missingNumbers: missingDiag1.length < missingDiag2.length ? missingDiag1 : missingDiag2 
    };
  }

  // Caso 4: Líneas (cualquier fila o columna completa)
  if (pattern === 'line') {
    let bestMissing: number[] = Array(6).fill(0);
    
    // Verificar filas
    for (let r = 0; r < 5; r++) {
      const missingRow: number[] = [];
      for (let c = 0; c < 5; c++) {
        const val = getVal(r, c);
        if (val !== null && !isCovered(r, c)) missingRow.push(val);
      }
      if (missingRow.length === 0) return { isWinner: true, missingNumbers: [] };
      if (missingRow.length < bestMissing.length) bestMissing = missingRow;
    }

    // Verificar columnas
    for (let c = 0; c < 5; c++) {
      const missingCol: number[] = [];
      for (let r = 0; r < 5; r++) {
        const val = getVal(r, c);
        if (val !== null && !isCovered(r, c)) missingCol.push(val);
      }
      if (missingCol.length === 0) return { isWinner: true, missingNumbers: [] };
      if (missingCol.length < bestMissing.length) bestMissing = missingCol;
    }

    return { isWinner: false, missingNumbers: bestMissing };
  }

  return { isWinner: false, missingNumbers: [] };
};

/**
 * Función validadora del lado del servidor/admin (mantiene compatibilidad).
 */
export const validateFullCard = (matrix: (number | null)[][], drawnNumbers: number[]): { isWinner: boolean, missingNumbers: number[] } => {
  return validateBingoCard(matrix, drawnNumbers, 'full');
};

/**
 * Compara dos matrices de cartones de Bingo para detectar si hay una colisión o similitud excesiva.
 * Garantiza la separación matemática reduciendo la intersección máxima a 8 números (33%).
 */
export const checkCardCollision = (
  matrixA: (number | null)[][], 
  matrixB: (number | null)[][],
  maxOverlap: number = 8
): boolean => {
  if (!matrixA || !matrixB || !Array.isArray(matrixA) || !Array.isArray(matrixB)) return false;

  const getNumbers = (matrix: (number | null)[][]): Set<number> => {
    const s = new Set<number>();
    for (let r = 0; r < 5; r++) {
      if (!matrix[r]) continue;
      for (let c = 0; c < 5; c++) {
        const val = matrix[r][c];
        if (val !== null && val !== undefined) s.add(val);
      }
    }
    return s;
  };

  const setA = getNumbers(matrixA);
  const setB = getNumbers(matrixB);

  // 1. Similitud Excesiva (máximo 'maxOverlap' números en común de 24 posibles)
  let intersectionCount = 0;
  for (const num of setA) {
    if (setB.has(num)) {
      intersectionCount++;
    }
  }
  if (intersectionCount > maxOverlap) return true;

  // 2. Colisión en las Cuatro Esquinas (máximo 2 en común)
  const getCornerVal = (m: (number | null)[][], r: number, c: number) => m && m[r] ? m[r][c] : null;
  const cornersA = new Set([getCornerVal(matrixA, 0, 0), getCornerVal(matrixA, 0, 4), getCornerVal(matrixA, 4, 0), getCornerVal(matrixA, 4, 4)].filter(v => v !== null));
  const cornersB = new Set([getCornerVal(matrixB, 0, 0), getCornerVal(matrixB, 0, 4), getCornerVal(matrixB, 4, 0), getCornerVal(matrixB, 4, 4)].filter(v => v !== null));
  
  let cornerMatches = 0;
  for (const val of cornersA) {
    if (cornersB.has(val)) cornerMatches++;
  }
  if (cornerMatches >= 3) return true;

  // 3. Colisión en Líneas (Filas o Columnas completas)
  const getLines = (m: (number | null)[][]): Set<number>[] => {
    const lines: Set<number>[] = [];
    if (!m || !Array.isArray(m)) return lines;
    for (let r = 0; r < 5; r++) {
      if (!m[r]) continue;
      const line = m[r].filter((v): v is number => v !== null && v !== undefined);
      lines.push(new Set(line));
    }
    for (let c = 0; c < 5; c++) {
      const line = [];
      for (let r = 0; r < 5; r++) {
        if (m[r] && m[r][c] !== null && m[r][c] !== undefined) line.push(m[r][c] as number);
      }
      lines.push(new Set(line));
    }
    return lines;
  };

  const linesA = getLines(matrixA);
  const linesB = getLines(matrixB);

  for (const lineA of linesA) {
    for (const lineB of linesB) {
      let lineMatches = 0;
      for (const val of lineA) {
        if (lineB.has(val)) lineMatches++;
      }
      if (lineMatches >= 4) return true;
    }
  }

  return false;
};
