/**
 * Utilidades para la teoría y mezcla de colores (RYB y RGB).
 */

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  ryb: [number, number, number]; // Proporciones de Rojo, Amarillo, Azul
  isWhite?: boolean;
  isBlack?: boolean;
  description: string;
}

export interface WeightedPaintColor {
  color: PaintColor;
  weight: number; // Dosis de 1 a 5
}

export const PAINT_COLORS: Record<string, PaintColor> = {
  rojo: {
    id: 'rojo',
    name: 'Rojo Carmesí',
    hex: '#FE2712',
    ryb: [1, 0, 0],
    description: 'El color del fuego y de las flores de achiote. Es un color primario lleno de energía.'
  },
  amarillo: {
    id: 'amarillo',
    name: 'Amarillo Maíz',
    hex: '#FBE903',
    ryb: [0, 1, 0],
    description: 'El color del sol sagrado y de las mazorcas tiernas. Un color primario brillante.'
  },
  azul: {
    id: 'azul',
    name: 'Azul Cenote',
    hex: '#0A54B4',
    ryb: [0, 0, 1],
    description: 'El color de los lagos místicos y el cielo despejado. Un color primario profundo.'
  },
  blanco: {
    id: 'blanco',
    name: 'Blanco Nube',
    hex: '#FFFFFF',
    ryb: [0, 0, 0],
    isWhite: true,
    description: 'El color de la Monja Blanca y la niebla del amanecer. Aclara y suaviza las mezclas.'
  },
  negro: {
    id: 'negro',
    name: 'Negro Xibalbá',
    hex: '#1A082E', // Negro profundo con toque morado de la editorial
    ryb: [0, 0, 0],
    isBlack: true,
    description: 'El color de la noche misteriosa y las cuevas antiguas. Oscurece y da sombra.'
  }
};

/**
 * Convierte coordenadas RYB (Red, Yellow, Blue) a RGB mediante interpolación trilineal en el cubo RYB.
 */
export function rybToRgb(r: number, y: number, b: number): [number, number, number] {
  // Definición de las 8 esquinas del cubo de color RYB a RGB
  const corners: Record<string, [number, number, number]> = {
    '000': [255, 255, 255], // Blanco
    '100': [254, 39, 18],   // Rojo
    '010': [251, 233, 3],   // Amarillo
    '001': [10, 84, 180],   // Azul
    '110': [253, 142, 17],  // Naranja
    '011': [31, 150, 60],   // Verde
    '101': [132, 9, 153],   // Violeta
    '111': [80, 55, 40]     // Marrón oscuro / tierra
  };

  const i000 = corners['000'];
  const i100 = corners['100'];
  const i010 = corners['010'];
  const i001 = corners['001'];
  const i110 = corners['110'];
  const i011 = corners['011'];
  const i101 = corners['101'];
  const i111 = corners['111'];

  const rgb: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    // Interpolación a lo largo del eje Rojo (r)
    const c00 = i000[i] * (1 - r) + i100[i] * r;
    const c10 = i010[i] * (1 - r) + i110[i] * r;
    const c01 = i001[i] * (1 - r) + i101[i] * r;
    const c11 = i011[i] * (1 - r) + i111[i] * r;

    // Interpolación a lo largo del eje Amarillo (y)
    const c0 = c00 * (1 - y) + c10 * y;
    const c1 = c01 * (1 - y) + c11 * y;

    // Interpolación a lo largo del eje Azul (b)
    rgb[i] = Math.round(c0 * (1 - b) + c1 * b);
  }

  return rgb;
}

/**
 * Mezcla una lista de colores sustractivos (RYB) con pesos de dosis proporcionales.
 */
export function mixWeightedPaintColors(weightedColors: WeightedPaintColor[]): {
  hex: string;
  rgb: [number, number, number];
  name: string;
  description: string;
} {
  if (weightedColors.length === 0) {
    return {
      hex: '#FFFFFF',
      rgb: [255, 255, 255],
      name: 'Blanco Nube',
      description: 'No has agregado ningún color todavía. ¡El lienzo está limpio!'
    };
  }

  // Expandir la lista de colores según las dosis para reutilizar la lógica de ponderación
  const expandedColors: PaintColor[] = [];
  weightedColors.forEach(wc => {
    const doses = Math.max(1, Math.min(5, wc.weight || 1));
    for (let i = 0; i < doses; i++) {
      expandedColors.push(wc.color);
    }
  });

  return mixPaintColors(expandedColors);
}

/**
 * Mezcla una lista de colores sustractivos (RYB) simulando pintura física.
 */
export function mixPaintColors(colors: PaintColor[]): {
  hex: string;
  rgb: [number, number, number];
  name: string;
  description: string;
} {
  if (colors.length === 0) {
    return {
      hex: '#FFFFFF',
      rgb: [255, 255, 255],
      name: 'Blanco Nube',
      description: 'No has agregado ningún color todavía. ¡El lienzo está limpio!'
    };
  }

  // Filtrar colores
  const whites = colors.filter(c => c.isWhite);
  const blacks = colors.filter(c => c.isBlack);
  const baseColors = colors.filter(c => !c.isWhite && !c.isBlack);

  let mixedRyb: [number, number, number] = [0, 0, 0];
  let finalRgb: [number, number, number] = [255, 255, 255];

  // 1. Si hay colores base (Rojo, Amarillo, Azul), calcular su promedio RYB
  if (baseColors.length > 0) {
    let sumR = 0, sumY = 0, sumB = 0;
    baseColors.forEach(c => {
      sumR += c.ryb[0];
      sumY += c.ryb[1];
      sumB += c.ryb[2];
    });
    
    mixedRyb = [
      sumR / baseColors.length,
      sumY / baseColors.length,
      sumB / baseColors.length
    ];

    // Convertir el promedio RYB a RGB
    finalRgb = rybToRgb(mixedRyb[0], mixedRyb[1], mixedRyb[2]);
  } else {
    // Si no hay colores base pero hay negro/blanco
    if (blacks.length > 0 && whites.length > 0) {
      // Negro y Blanco hacen Gris
      const ratio = whites.length / (whites.length + blacks.length);
      const grayVal = Math.round(26 + ratio * (255 - 26)); // No ir tan negro como 0
      finalRgb = [grayVal, grayVal, grayVal];
    } else if (blacks.length > 0) {
      finalRgb = [26, 8, 46]; // El negro de la editorial
    } else if (whites.length > 0) {
      finalRgb = [255, 255, 255];
    }
  }

  // 2. Modificar el resultado según la presencia de Blanco (aclara) o Negro (oscurece)
  if (baseColors.length > 0) {
    const totalCount = colors.length;
    const whiteRatio = whites.length / totalCount;
    const blackRatio = blacks.length / totalCount;

    // Aplicar Blanco: mezcla hacia el blanco puro (255, 255, 255)
    if (whiteRatio > 0) {
      finalRgb = [
        Math.round(finalRgb[0] + (255 - finalRgb[0]) * whiteRatio * 1.2),
        Math.round(finalRgb[1] + (255 - finalRgb[1]) * whiteRatio * 1.2),
        Math.round(finalRgb[2] + (255 - finalRgb[2]) * whiteRatio * 1.2)
      ];
    }

    // Aplicar Negro: reduce brillo (tiende a negro/marrón)
    if (blackRatio > 0) {
      const darkFactor = 1 - (blackRatio * 0.75); // Reduce hasta un 75% del brillo
      finalRgb = [
        Math.round(finalRgb[0] * darkFactor),
        Math.round(finalRgb[1] * darkFactor),
        Math.round(finalRgb[2] * darkFactor)
      ];
    }
  }

  // Asegurar límites RGB
  finalRgb = [
    Math.max(0, Math.min(255, finalRgb[0])),
    Math.max(0, Math.min(255, finalRgb[1])),
    Math.max(0, Math.min(255, finalRgb[2]))
  ];

  // Obtener representación HEX
  const hex = rgbToHex(finalRgb[0], finalRgb[1], finalRgb[2]);

  // Obtener nombre educativo y descripción poética
  const meta = getMixedColorMetadata(colors, finalRgb);

  return {
    hex,
    rgb: finalRgb,
    name: meta.name,
    description: meta.description
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const h = c.toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b).toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Genera una escala cromática de 5 variantes (Tintes pastel, Tonos desaturados y Sombras)
 * para el Laboratorio de Tonalidades.
 */
export function generateColorShadesAndTints(baseHex: string) {
  const [r, g, b] = hexToRgb(baseHex);

  const mix = (c: number, target: number, amount: number) => Math.round(c + (target - c) * amount);

  // 1. Tinte Alto (Pastel Suave)
  const highTint: [number, number, number] = [mix(r, 255, 0.65), mix(g, 255, 0.65), mix(b, 255, 0.65)];
  // 2. Tinte Medio (Aclarado)
  const medTint: [number, number, number] = [mix(r, 255, 0.35), mix(g, 255, 0.35), mix(b, 255, 0.35)];
  // 3. Color Base
  const base: [number, number, number] = [r, g, b];
  // 4. Tono Desaturado (Con Gris)
  const avg = Math.round((r + g + b) / 3);
  const tone: [number, number, number] = [mix(r, avg, 0.4), mix(g, avg, 0.4), mix(b, avg, 0.4)];
  // 5. Sombra Oscura (Con Negro)
  const shade: [number, number, number] = [mix(r, 15, 0.5), mix(g, 15, 0.5), mix(b, 15, 0.5)];

  return [
    { label: 'Tinte Pastel', hex: rgbToHex(...highTint), rgb: highTint, desc: 'Mezclado con 65% de Blanco Nube' },
    { label: 'Tinte Suave', hex: rgbToHex(...medTint), rgb: medTint, desc: 'Mezclado con 35% de Blanco Nube' },
    { label: 'Color Puro', hex: rgbToHex(...base), rgb: base, desc: 'Tono original del guardián' },
    { label: 'Tono Desaturado', hex: rgbToHex(...tone), rgb: tone, desc: 'Mezclado con Gris Neblina' },
    { label: 'Sombra Profunda', hex: rgbToHex(...shade), rgb: shade, desc: 'Mezclado con 50% de Negro Xibalbá' }
  ];
}

/**
 * Determina el nombre y descripción en base a los colores que se mezclaron.
 */
function getMixedColorMetadata(colors: PaintColor[], rgb: [number, number, number]): { name: string, description: string } {
  const ids = colors.map(c => c.id);
  const hasR = ids.includes('rojo');
  const hasY = ids.includes('amarillo');
  const hasB = ids.includes('azul');
  const hasW = ids.includes('blanco');
  const hasK = ids.includes('negro');
  
  const baseCount = baseColorsLength(colors);

  // Caso: colores individuales
  if (colors.length === 1) {
    return { name: colors[0].name, description: colors[0].description };
  }

  // Mezclas Primarias Dobles
  if (hasR && hasY && !hasB) {
    if (hasW) return { name: 'Naranja Melocotón', description: '¡Qué tono más dulce! Mezclaste Rojo y Amarillo con Blanco, suavizando el fuego en un tono melocotón.' };
    if (hasK) return { name: 'Naranja Ladrillo / Terracota', description: 'Una mezcla de Rojo, Amarillo y Negro. Recuerda a las tejas y a la arcilla cocida de los artesanos.' };
    return { name: 'Naranja Atardecer', description: '¡Magia! El Rojo Carmesí y el Amarillo Maíz se fundieron para pintar el cielo de la tarde. Un color secundario.' };
  }

  if (hasY && hasB && !hasR) {
    if (hasW) return { name: 'Verde Menta Pastel', description: 'Una mezcla fresca de Amarillo, Azul y Blanco. Suave como las hojas tiernas bajo la llovizna.' };
    if (hasK) return { name: 'Verde Oliva Profundo', description: 'Mezcla de Amarillo, Azul y Negro. Un verde maduro como el de los árboles de aguacate antiguos.' };
    return { name: 'Verde Selva de Quetzal', description: '¡Espectacular! El Amarillo Maíz y el Azul Cenote crearon el follaje de nuestra selva. Un color secundario.' };
  }

  if (hasR && hasB && !hasY) {
    if (hasW) return { name: 'Lavanda Dulce', description: 'Mezcla de Rojo, Azul y Blanco. Un color morado claro y delicado como las flores silvestres de la colina.' };
    if (hasK) return { name: 'Violeta Camazotz (Oscuro)', description: 'Una mezcla misteriosa de Rojo, Azul y Negro. El color del inframundo y la noche profunda.' };
    return { name: 'Morado Místico', description: '¡Asombroso! La fuerza del Rojo Carmesí y la profundidad del Azul Cenote se unen en este color secundario sagrado.' };
  }

  // Tres colores primarios
  if (hasR && hasY && hasB) {
    if (hasW) return { name: 'Café Arcilla Claro', description: 'Mezclaste los tres colores primarios con Blanco, resultando en el tono de la tierra fértil aclarada por el sol.' };
    return { name: 'Tierra Sagrada (Marrón)', description: '¡La Madre Tierra! Al mezclar los tres colores primarios (Rojo, Amarillo y Azul) creas el color marrón de la tierra y los troncos.' };
  }

  // Mezclas especiales con blanco/negro únicamente
  if (hasW && hasK && baseCount === 0) {
    return { name: 'Gris Neblina', description: 'El equilibrio entre el día y la noche. Un gris que cubre las montañas de Guatemala por las mañanas.' };
  }

  // Mezclas genéricas por aproximación cromática
  const [r, g, b] = rgb;
  if (r > 200 && g > 180 && b > 180) {
    return { name: 'Tono Crema Pastel', description: 'Un color muy suave y luminoso obtenido al añadir mucho Blanco a tu mezcla.' };
  }
  if (r < 60 && g < 60 && b < 60) {
    return { name: 'Sombra Ancestral', description: 'Un tono muy oscuro cercano al negro. Ideal para dibujar siluetas misteriosas.' };
  }
  if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
    return { name: 'Piedra de Volcán (Gris)', description: 'Un color neutro y sólido como la ceniza y las piedras de nuestros volcanes activos.' };
  }

  // Fallback genérico
  return {
    name: 'Color Personalizado',
    description: '¡Has creado una mezcla única! Experimenta añadiendo más gotas de un color o aclarando con blanco.'
  };
}

function baseColorsLength(colors: PaintColor[]): number {
  return colors.filter(c => !c.isWhite && !c.isBlack).length;
}

/**
 * Estructura de colores objetivo para el juego RGB.
 */
export interface GameColorTarget {
  name: string;
  rgb: [number, number, number];
  hint: string;
}

export const GAME_TARGET_COLORS: GameColorTarget[] = [
  { name: 'Fuego de Juracán (Rojo Vivo)', rgb: [230, 30, 40], hint: '¡Mucha energía roja! Pon la luz roja al máximo, y apaga casi por completo la verde y azul.' },
  { name: 'Jade Sagrado (Verde Brillante)', rgb: [46, 204, 113], hint: 'El verde debe dominar el pedestal. Añade un poquito de azul y rojo para equilibrar.' },
  { name: 'Atardecer Morado', rgb: [155, 89, 182], hint: 'Un color místico. Combina luz roja y azul en partes iguales, y mantén la verde muy baja.' },
  { name: 'Sol de Mediodía (Amarillo Oro)', rgb: [241, 196, 15], hint: 'El amarillo se crea sumando luz roja y luz verde casi al máximo. ¡No uses luz azul!' },
  { name: 'Cielo de Verano (Celeste)', rgb: [52, 152, 219], hint: 'Mucha luz azul mezclada con una buena dosis de luz verde, y apenas una chispa de rojo.' },
  { name: 'Rosa Monja Blanca', rgb: [255, 180, 200], hint: 'Un tono pastel muy suave. Enciende todas las luces casi al máximo, pero deja que la roja sea la más brillante.' },
  { name: 'Naranja Jocote', rgb: [230, 126, 34], hint: 'Calidez pura. Luz roja muy alta y luz verde a la mitad. Desactiva la azul.' },
  { name: 'Cenote Oculto (Turquesa)', rgb: [22, 160, 133], hint: 'Profundidad acuática. Mucho verde y azul combinados, con muy poco rojo.' }
];

/**
 * Compara la similitud entre dos colores RGB y devuelve un porcentaje de coincidencia de 0 a 100.
 */
export function calculateColorMatch(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;

  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;

  const distance = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
  const maxDistance = 765;

  const match = 100 * (1 - distance / maxDistance);

  return Math.max(0, Math.min(100, Math.round(match)));
}

/**
 * Genera un color objetivo aleatorio para el juego de forma dinámica.
 */
export function generateRandomTargetColor(): GameColorTarget {
  const r = Math.floor(Math.random() * 180) + 75;
  const g = Math.floor(Math.random() * 180) + 75;
  const b = Math.floor(Math.random() * 180) + 75;

  return {
    name: 'Gema Misteriosa',
    rgb: [r, g, b],
    hint: `Combina los cristales. Prueba con Rojo: ${r > 128 ? 'Alto' : 'Bajo'}, Verde: ${g > 128 ? 'Alto' : 'Bajo'} y Azul: ${b > 128 ? 'Alto' : 'Bajo'}.`
  };
}
