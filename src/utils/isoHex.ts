// Utilidades de proyección isométrica para el mundo virtual de Sutz.
// La misma malla hexagonal top-down se re-proyecta sobre un plano isométrico
// (paralelo, sin punto de fuga), manteniendo todas las configuraciones.

export interface IsoPoint {
  x: number;
  y: number;
}

export const ISO_COS30 = Math.cos(Math.PI / 6);
export const ISO_SIN30 = Math.sin(Math.PI / 6);

/**
 * Proyección isométrica de un punto top-down (x, y) a pantalla.
 * Las filas caen hacia abajo-izquierda y las columnas hacia abajo-derecha.
 */
export function isoProject(x: number, y: number): IsoPoint {
  return { x: (x - y) * ISO_COS30, y: (x + y) * ISO_SIN30 };
}

// Cierre convexo de monotonía (monotone chain). El muro de extrusión es
// exactamente el hull del hexágono superior unido a su copia desplazada
// verticalmente (la pared frontal visible de un prisma hexagonal).
function convexHull(points: IsoPoint[]): IsoPoint[] {
  const pts = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length <= 1) return pts;
  const cross = (o: IsoPoint, a: IsoPoint, b: IsoPoint) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: IsoPoint[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: IsoPoint[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export interface IsoHexGeometry {
  tileW: number; // ancho total de la caja (cara + muro)
  tileH: number; // alto total de la caja
  minX: number; // esquina superior-izquierda de la caja en el espacio proyectado
  minY: number;
  faceLeft: number; // caja de la cara superior dentro del tile (px)
  faceTop: number;
  faceW: number;
  faceH: number;
  faceClip: string; // clip-path (%) de la cara superior (relativo a su propia caja)
  wallClip: string; // clip-path (%) del muro frontal de extrusión (relativo al tile)
}

/**
 * Geometría isométrica de una celda (independiente de fila/columna).
 * Todo se expresa en porcentajes reutilizables a cualquier escala.
 */
export function buildIsoHexGeometry(
  hexWidth: number,
  hexHeight: number,
  depth: number = Math.round(hexWidth * 0.24)
): IsoHexGeometry {
  const W = hexWidth;
  const H = hexHeight;

  // Esquinas top-down del hexágono flat-top (mismo polyshape que el CSS).
  const corners: IsoPoint[] = [
    { x: -0.25 * W, y: -0.5 * H },
    { x: 0.25 * W, y: -0.5 * H },
    { x: 0.5 * W, y: 0 },
    { x: 0.25 * W, y: 0.5 * H },
    { x: -0.25 * W, y: 0.5 * H },
    { x: -0.5 * W, y: 0 }
  ];

  const face = corners.map(c => isoProject(c.x, c.y));
  const base = face.map(p => ({ x: p.x, y: p.y + depth }));
  const hull = convexHull([...face, ...base]);

  const xs = hull.map(p => p.x);
  const ys = hull.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const tileW = maxX - minX;
  const tileH = maxY - minY;

  const faceXs = face.map(p => p.x);
  const faceYs = face.map(p => p.y);
  const fMinX = Math.min(...faceXs);
  const fMaxX = Math.max(...faceXs);
  const fMinY = Math.min(...faceYs);
  const fMaxY = Math.max(...faceYs);

  const faceLeft = fMinX - minX;
  const faceTop = fMinY - minY;
  const faceW = fMaxX - fMinX;
  const faceH = fMaxY - fMinY;

  const toPolygon = (pts: IsoPoint[], box: IsoPoint, boxW: number, boxH: number) =>
    `polygon(${pts.map(p => `${((p.x - box.x) / boxW) * 100}% ${((p.y - box.y) / boxH) * 100}%`).join(', ')})`;

  return {
    tileW,
    tileH,
    minX,
    minY,
    faceLeft,
    faceTop,
    faceW,
    faceH,
    faceClip: toPolygon(face, { x: fMinX, y: fMinY }, faceW, faceH),
    wallClip: toPolygon(hull, { x: minX, y: minY }, tileW, tileH)
  };
}