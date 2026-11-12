export type GaleriaShareTab = 'escriba' | 'museo' | 'cine' | 'concursos';

/**
 * Construye la URL directa y pública para compartir cualquier publicación de la Gran Galería.
 */
export function buildGranGaleriaShareUrl(tab: GaleriaShareTab, postId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/gran-galeria?tab=${tab}&post=${encodeURIComponent(postId)}`;
}

/**
 * Comparte un enlace usando Web Share API (móvil) o copiando al portapapeles como respaldo.
 */
export async function shareGranGaleriaPost(
  url: string,
  title: string
): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `${title} · Gran Galería Sutz`,
        text: `Explora "${title}" en la Gran Galería de Editorial Lluvia de Ideas:`,
        url,
      });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Si navigator.share falla (ej. entorno desktop sin soporte real), caemos al portapapeles
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      // Continuar al fallback con textarea
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok ? 'copied' : 'failed';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}

