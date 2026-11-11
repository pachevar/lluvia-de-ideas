import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { decodeQrFromCanvas, decodeQrFromImageFile } from '../../utils/qrScanner';
import { soundEffects } from '../../utils/soundEffects';
import './QrScannerModal.css';

export interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (rawValue: string) => void;
  title?: string;
  subtitle?: string;
  hint?: string;
  /**
   * Validador opcional para comprobar que el QR pertenece a la actividad actual.
   * Si retorna texto, se muestra como aviso sin apagar la cámara.
   */
  validateValue?: (rawValue: string) => string | null;
}

type FacingMode = 'environment' | 'user';

/**
 * Escáner QR universal para cualquier dinámica del portal.
 * Abre la cámara en tiempo real (compatible con iOS Safari, Android y escritorio)
 * e incluye respaldo para leer códigos QR desde una fotografía.
 */
export default function QrScannerModal({
  isOpen,
  onClose,
  onScan,
  title = 'Escanear código QR',
  subtitle = 'Apunta la cámara hacia el código QR de la tarjeta para cargarla al instante.',
  hint = 'Si estás en un lugar con poca luz puedes activar la linterna o subir una foto del QR.',
  validateValue
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const busyDecodeRef = useRef(false);
  const lastRejectedRef = useRef<{ value: string; time: number }>({ value: '', time: 0 });

  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraState, setCameraState] = useState<'starting' | 'ready' | 'unavailable'>('starting');
  const [feedback, setFeedback] = useState<{ kind: 'err' | 'info'; text: string } | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchSupported(false);
    setTorchOn(false);
  }, []);

  const handleDecodedValue = useCallback((raw: string): boolean => {
    if (validateValue) {
      const errorMsg = validateValue(raw);
      if (errorMsg) {
        const now = Date.now();
        if (lastRejectedRef.current.value !== raw || now - lastRejectedRef.current.time > 2500) {
          lastRejectedRef.current = { value: raw, time: now };
          setFeedback({ kind: 'err', text: errorMsg });
        }
        return false;
      }
    }
    soundEffects.playSuccess();
    stopCamera();
    onScan(raw);
    return true;
  }, [validateValue, stopCamera, onScan]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let alive = true;
    setFeedback(null);
    setCameraState('starting');

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!alive) return;
        setCameraState('unavailable');
        setFeedback({
          kind: 'info',
          text: 'Este navegador no permite abrir la cámara en directo. Usa el botón de abajo para subir una foto del QR.'
        });
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (alive) {
          setHasMultipleCameras(devices.filter(d => d.kind === 'videoinput').length > 1);
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!alive) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }

        const videoTrack = stream.getVideoTracks()[0];
        const caps = videoTrack?.getCapabilities?.() as { torch?: boolean } | undefined;
        setTorchSupported(Boolean(caps?.torch));
        setCameraState('ready');

        let lastFrameAt = 0;
        const scanTick = (timestamp: number) => {
          if (!alive) return;
          const v = videoRef.current;
          const c = canvasRef.current;
          if (v && c && v.readyState >= 2 && !busyDecodeRef.current && timestamp - lastFrameAt >= 180) {
            lastFrameAt = timestamp;
            const w = v.videoWidth;
            const h = v.videoHeight;
            if (w > 0 && h > 0) {
              const scale = Math.min(1, 720 / Math.max(w, h));
              c.width = Math.round(w * scale);
              c.height = Math.round(h * scale);
              const ctx = c.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(v, 0, 0, c.width, c.height);
                busyDecodeRef.current = true;
                decodeQrFromCanvas(c, ctx)
                  .then(decoded => {
                    if (alive && decoded) handleDecodedValue(decoded);
                  })
                  .finally(() => {
                    busyDecodeRef.current = false;
                  });
              }
            }
          }
          rafRef.current = requestAnimationFrame(scanTick);
        };
        rafRef.current = requestAnimationFrame(scanTick);
      } catch (err) {
        if (!alive) return;
        setCameraState('unavailable');
        const name = err instanceof DOMException ? err.name : '';
        const text =
          name === 'NotAllowedError'
            ? 'No tenemos permiso para usar la cámara. Puedes habilitarlo en tu navegador o tomar una foto del QR con el botón de abajo.'
            : 'No pudimos iniciar la cámara en este dispositivo. Usa el botón de abajo para escanear desde una foto.';
        setFeedback({ kind: 'info', text });
      }
    };

    startCamera();

    return () => {
      alive = false;
      stopCamera();
    };
  }, [isOpen, facingMode, stopCamera, handleDecodedValue]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  };

  const handlePhotoPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFeedback({ kind: 'info', text: 'Analizando la imagen del código QR…' });
    try {
      const decoded = await decodeQrFromImageFile(file);
      if (!decoded) {
        setFeedback({ kind: 'err', text: 'No detectamos ningún código QR nítido en esa foto. Inténtalo más de cerca.' });
        return;
      }
      handleDecodedValue(decoded);
    } catch (err) {
      setFeedback({ kind: 'err', text: err instanceof Error ? err.message : 'No se pudo leer la imagen.' });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="qrm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrm-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="qrm-dialog">
        <button
          type="button"
          className="qrm-close-btn"
          onClick={onClose}
          aria-label="Cerrar escáner QR"
          title="Cerrar"
        >
          ✕
        </button>

        <header className="qrm-header">
          <span className="qrm-kicker">📷 Lector QR del Portal</span>
          <h2 id="qrm-modal-title" className="qrm-title">{title}</h2>
          {subtitle && <p className="qrm-subtitle">{subtitle}</p>}
        </header>

        <div className="qrm-viewport">
          <video ref={videoRef} className="qrm-video" playsInline muted autoPlay />
          <canvas ref={canvasRef} className="qrm-hidden-canvas" />
          {cameraState === 'ready' && (
            <div className="qrm-reticle" aria-hidden="true">
              <div className="qrm-reticle-beam" />
            </div>
          )}
          {cameraState === 'starting' && (
            <div className="qrm-camera-status">Iniciando cámara…</div>
          )}
          {cameraState === 'unavailable' && (
            <div className="qrm-camera-status">📷 Cámara no disponible en vivo</div>
          )}
        </div>

        {feedback && <p className={`qrm-msg ${feedback.kind}`}>{feedback.text}</p>}

        <div className="qrm-controls">
          {cameraState === 'ready' && hasMultipleCameras && (
            <button
              type="button"
              className="qrm-btn"
              onClick={() => setFacingMode(m => (m === 'environment' ? 'user' : 'environment'))}
            >
              🔄 Cambiar cámara
            </button>
          )}
          {cameraState === 'ready' && torchSupported && (
            <button
              type="button"
              className={`qrm-btn ${torchOn ? 'active' : ''}`}
              onClick={toggleTorch}
            >
              {torchOn ? '🔦 Apagar luz' : '🔦 Linterna'}
            </button>
          )}
          <label className="qrm-btn primary qrm-file-label">
            <span>🖼️ {cameraState === 'ready' ? 'Escanear desde foto' : 'Tomar o subir foto del QR'}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="qrm-file-input"
              onChange={handlePhotoPick}
            />
          </label>
        </div>

        {hint && <p className="qrm-hint">{hint}</p>}
      </div>
    </div>,
    document.body
  );
}

