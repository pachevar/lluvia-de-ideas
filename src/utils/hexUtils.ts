export function getHexLabel(row: number, col: number): string {
  if (row === 0 && col === 0) return '0';

  // Calculate distance (ring number)
  // Distance in axial coordinates
  // Since we use (col + row/2) for x, it means our axes are slightly different.
  // Standard axial: x = q, y = r, z = -q-r. Distance = (abs(q) + abs(r) + abs(-q-r)) / 2
  // In our system, let's verify distance:
  const q = col;
  const r = row;
  const s = -q - r;
  const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));

  const ringChar = String.fromCharCode(96 + d); // 1->a, 2->b...

  // Generate sequence for this ring to find index
  let currentR = -d;
  let currentQ = 0;
  
  // Starting position: Top Left (-d, 0)
  // We want to go clockwise and number them 1 to 6*d.
  // The 6 directions in our pointy-top grid:
  // 1. Top Right: (r: 0, q: +1)
  // 2. Right: (r: +1, q: 0)
  // 3. Bottom Right: (r: +1, q: -1)
  // 4. Bottom Left: (r: 0, q: -1)
  // 5. Left: (r: -1, q: 0)
  // 6. Top Left: (r: -1, q: +1)
  // Wait, let's look at the trace for d=1 again:
  // (-1, 0) -> (-1, 1) -> (0, 1) -> (1, 0) -> (1, -1) -> (0, -1)
  // Steps:
  // 1. q +1
  // 2. r +1
  // 3. r +1, q -1
  // 4. q -1
  // 5. r -1
  // 6. r -1, q +1
  
  const directions = [
    { dr: 0, dq: 1 },    // Top Right
    { dr: 1, dq: 0 },    // Right
    { dr: 1, dq: -1 },   // Bottom Right
    { dr: 0, dq: -1 },   // Bottom Left
    { dr: -1, dq: 0 },   // Left
    { dr: -1, dq: 1 }    // Top Left
  ];

  let index = 1;
  for (let dir of directions) {
    for (let step = 0; step < d; step++) {
      if (currentR === row && currentQ === col) {
        return `${index}${ringChar}`;
      }
      currentR += dir.dr;
      currentQ += dir.dq;
      index++;
    }
  }

  return `?${ringChar}`;
}

export function getCandidateHexes(mapData: { row: number, col: number }[]): { row: number, col: number }[] {
  const candidateCoords = new Set<string>();
  const occupiedCoords = new Set<string>();
  
  if (!mapData || mapData.length === 0) {
    return [{ row: 0, col: 0 }];
  }

  mapData.forEach(hex => {
    occupiedCoords.add(`${hex.row},${hex.col}`);
  });

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: -1 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: -1, dc: 1 }
  ];

  mapData.forEach(hex => {
    directions.forEach(dir => {
      const nr = hex.row + dir.dr;
      const nc = hex.col + dir.dc;
      const nKey = `${nr},${nc}`;
      if (!occupiedCoords.has(nKey)) {
        candidateCoords.add(nKey);
      }
    });
  });

  return Array.from(candidateCoords).map(key => {
    const [rStr, cStr] = key.split(',');
    return { row: parseInt(rStr), col: parseInt(cStr) };
  });
}
