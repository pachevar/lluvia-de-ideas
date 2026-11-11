import jsQR from 'jsqr';

/** Resultado normalizado al interpretar un código QR del portal. */
export interface ParsedPortalQr {
  raw: string;
  isUrl: boolean;
  pathname: string;
  params: URLSearchParams;
}

type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

let nativeDetectorCache: BarcodeDetectorLike | null | undefined;

function getNativeQrDetector(): BarcodeDetectorLike | null {
  if (nativeDetectorCache !== undefined) return nativeDetectorCache;
  try {
    const Detector = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    nativeDetectorCache = Detector ? new Detector({ formats: ['qr_code'] }) : null;
  } catch {
    nativeDetectorCache = null;
  }
  return nativeDetectorCache;
}

/**
 * Decodifica un código QR desde un lienzo `<canvas>`.
 * Usa BarcodeDetector nativo cuando está disponible y `jsQR` como motor universal
 * compatible con iOS Safari, Android y navegadores de escritorio.
 */
export async function decodeQrFromCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<string | null> {
  const detector = getNativeQrDetector();
  if (detector) {
    try {
      const results = await detector.detect(canvas);
      const hit = results.find(r => Boolean(r.rawValue?.trim()));
      if (hit?.rawValue) return hit.rawValue.trim();
    } catch {
      // Silencio: caemos al decodificador jsQR multi-plataforma
    }
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth'
  });
  return code?.data?.trim() || null;
}

/**
 * Decodifica un código QR a partir de un archivo de imagen o foto tomada con el teléfono.
 */
export async function decodeQrFromImageFile(file: File): Promise<string | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo abrir la imagen seleccionada.'));
      img.src = objectUrl;
    });

    const maxSide = 1024;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const width = Math.max(1, Math.round((img.naturalWidth || 512) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 512) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, width, height);
    return await decodeQrFromCanvas(canvas, ctx);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Extrae ruta y parámetros URLSearchParams de cualquier QR del portal
 * (soporta URL completa, ruta relativa o cadena de parámetros).
 */
export function parsePortalQrUrl(rawText: string): ParsedPortalQr {
  const raw = rawText.trim();
  try {
    const parsed = new URL(raw, window.location.origin);
    const hasQueryOrScheme = raw.includes('://') || raw.startsWith('/') || raw.includes('?');
    return {
      raw,
      isUrl: hasQueryOrScheme,
      pathname: parsed.pathname,
      params: parsed.searchParams
    };
  } catch {
    return {
      raw,
      isUrl: false,
      pathname: '',
      params: new URLSearchParams()
    };
  }
}

