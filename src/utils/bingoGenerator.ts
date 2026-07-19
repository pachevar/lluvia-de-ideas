// Utilidad para generación de lógicas de Bingo

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

/**
 * Función validadora genérica por patrones.
 * Comprueba si un cartón es ganador según el patrón especificado.
 */
export const validateBingoCard = (
  matrix: (number | null)[][], 
  drawnNumbers: number[], 
  pattern: string = 'full'
): { isWinner: boolean, missingNumbers: number[] } => {
  const getVal = (row: number, col: number): number | null => matrix[row][col];

  // Caso 1: Cartón Lleno
  if (pattern === 'full') {
    const missing: number[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const val = getVal(r, c);
        if (val !== null && !drawnNumbers.includes(val)) {
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
      .map(p => getVal(p.r, p.c))
      .filter((val): val is number => val !== null && !drawnNumbers.includes(val));
    return { isWinner: missing.length === 0, missingNumbers: missing };
  }

  // Caso 3: Diagonales (cualquiera de las dos X)
  if (pattern === 'diagonal') {
    const diag1 = [{r:0,c:0}, {r:1,c:1}, {r:2,c:2}, {r:3,c:3}, {r:4,c:4}];
    const diag2 = [{r:0,c:4}, {r:1,c:3}, {r:2,c:2}, {r:3,c:1}, {r:4,c:0}];
    
    const missingDiag1 = diag1
      .map(p => getVal(p.r, p.c))
      .filter((val): val is number => val !== null && !drawnNumbers.includes(val));
      
    const missingDiag2 = diag2
      .map(p => getVal(p.r, p.c))
      .filter((val): val is number => val !== null && !drawnNumbers.includes(val));

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
        if (val !== null && !drawnNumbers.includes(val)) missingRow.push(val);
      }
      if (missingRow.length === 0) return { isWinner: true, missingNumbers: [] };
      if (missingRow.length < bestMissing.length) bestMissing = missingRow;
    }

    // Verificar columnas
    for (let c = 0; c < 5; c++) {
      const missingCol: number[] = [];
      for (let r = 0; r < 5; r++) {
        const val = getVal(r, c);
        if (val !== null && !drawnNumbers.includes(val)) missingCol.push(val);
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
 * Compara dos matrices de cartones de Bingo para detectar si hay una colisión crítica.
 * Devuelve true si los cartones son demasiado similares o tienen el mismo conjunto ganador
 * en patrones clave (esquinas, diagonales, líneas o > 12 números en común).
 */
export const checkCardCollision = (
  matrixA: (number | null)[][], 
  matrixB: (number | null)[][]
): boolean => {
  const getNumbers = (matrix: (number | null)[][]): Set<number> => {
    const s = new Set<number>();
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const val = matrix[r][c];
        if (val !== null) s.add(val);
      }
    }
    return s;
  };

  const setA = getNumbers(matrixA);
  const setB = getNumbers(matrixB);

  // 1. Similitud Excesiva (más de 12 números en común de 24 posibles)
  let intersectionCount = 0;
  for (const num of setA) {
    if (setB.has(num)) {
      intersectionCount++;
    }
  }
  if (intersectionCount > 12) return true;

  // 2. Colisión en las Cuatro Esquinas
  const cornersA = new Set([matrixA[0][0], matrixA[0][4], matrixA[4][0], matrixA[4][4]]);
  const cornersB = new Set([matrixB[0][0], matrixB[0][4], matrixB[4][0], matrixB[4][4]]);
  let cornerMatches = 0;
  for (const val of cornersA) {
    if (cornersB.has(val)) cornerMatches++;
  }
  if (cornerMatches === 4) return true;

  // 3. Colisión en Diagonales (excluyendo el centro null)
  const getDiag1 = (m: (number | null)[][]) => [m[0][0], m[1][1], m[3][3], m[4][4]].filter((v): v is number => v !== null);
  const getDiag2 = (m: (number | null)[][]) => [m[0][4], m[1][3], m[3][1], m[4][0]].filter((v): v is number => v !== null);

  const diag1A = new Set(getDiag1(matrixA));
  const diag1B = new Set(getDiag1(matrixB));
  const diag2A = new Set(getDiag2(matrixA));
  const diag2B = new Set(getDiag2(matrixB));

  const compareSets = (sA: Set<any>, sB: Set<any>) => {
    if (sA.size !== sB.size) return false;
    for (const val of sA) {
      if (!sB.has(val)) return false;
    }
    return true;
  };

  // Comparar diag1 con diag1 y diag2 con diag2
  if (compareSets(diag1A, diag1B) || compareSets(diag2A, diag2B)) return true;
  // Comparar de forma cruzada diag1 con diag2
  if (compareSets(diag1A, diag2B) || compareSets(diag2A, diag1B)) return true;

  // 4. Colisión en Líneas (Filas o Columnas completas)
  const getLines = (m: (number | null)[][]): Set<number>[] => {
    const lines: Set<number>[] = [];
    // Filas
    for (let r = 0; r < 5; r++) {
      const line = m[r].filter((v): v is number => v !== null);
      lines.push(new Set(line));
    }
    // Columnas
    for (let c = 0; c < 5; c++) {
      const line = [];
      for (let r = 0; r < 5; r++) {
        if (m[r][c] !== null) line.push(m[r][c] as number);
      }
      lines.push(new Set(line));
    }
    return lines;
  };

  const linesA = getLines(matrixA);
  const linesB = getLines(matrixB);

  for (const lineA of linesA) {
    for (const lineB of linesB) {
      if (compareSets(lineA, lineB)) return true;
    }
  }

  return false;
};
