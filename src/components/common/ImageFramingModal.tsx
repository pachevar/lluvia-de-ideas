import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import './ImageFramingModal.css';

export interface AspectRatioOption {
  label: string;
  ratio: number | null; // null = libre / original
  icon?: string;
}

export interface ImageFramingModalProps {
  isOpen: boolean;
  imageSrc: string | File | null;
  title?: string;
  subtitle?: string;
  aspectRatio?: number | null; // e.g. 1 for 1:1 square
  allowedAspectRatios?: AspectRatioOption[];
  targetWidth?: number;
  targetHeight?: number;
  onSave: (framedFile: File, dataUrl: string) => void | Promise<void>;
  onClose: () => void;
}

const DEFAULT_ASPECT_RATIOS: AspectRatioOption[] = [
  { label: '1:1 Cuadrado', ratio: 1, icon: '⏹️' },
  { label: '4:5 Retrato / Ficha', ratio: 4 / 5, icon: '📱' },
  { label: '4:3 Clásico', ratio: 4 / 3, icon: '🖼️' },
  { label: '16:9 Panorámico', ratio: 16 / 9, icon: '🖥️' },
  { label: 'Libre / Original', ratio: null, icon: '🔄' }
];

export default function ImageFramingModal({
  isOpen,
  imageSrc,
  title = 'Encuadre y Centrado Profesional de Imagen',
  subtitle = 'Arrastra para encuadrar, haz zoom o rota para posicionar el área focal perfecta.',
  aspectRatio: initialRatio = 1,
  allowedAspectRatios = DEFAULT_ASPECT_RATIOS,
  targetWidth = 800,
  targetHeight = 800,
  onSave,
  onClose
}: ImageFramingModalProps) {
  // Estado de la imagen cargada
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Parámetros de transformación interactiva
  const [scale, setScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true); // Regla de tercios

  // Relación de aspecto seleccionada
  const [selectedRatio, setSelectedRatio] = useState<number | null>(initialRatio);

  // Estado de interacción de arrastre
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0
  });

  const [isProcessingSave, setIsProcessingSave] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cargar la imagen cuando cambie `imageSrc`
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setImageObj(null);
      return;
    }

    setLoadingImage(true);
    setImageError(null);

    let objectUrlToRevoke: string | null = null;
    let srcUrl = '';

    if (imageSrc instanceof File) {
      objectUrlToRevoke = URL.createObjectURL(imageSrc);
      srcUrl = objectUrlToRevoke;
    } else if (typeof imageSrc === 'string') {
      srcUrl = imageSrc;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImageObj(img);
      setLoadingImage(false);

      // Calcular relación libre si aplica
      if (initialRatio === null) {
        setSelectedRatio(img.width / img.height);
      } else {
        setSelectedRatio(initialRatio);
      }

      // Reiniciar transformaciones centradas
      setScale(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setFlipH(false);
    };

    img.onerror = () => {
      setLoadingImage(false);
      setImageError('No se pudo cargar la imagen para encuadre. Verifica el formato o el enlace.');
    };

    img.src = srcUrl;

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [isOpen, imageSrc, initialRatio]);

  // Dibujar canvas interactivo
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones lógicas del canvas de visualización
    const cw = canvas.width;
    const ch = canvas.height;

    // Limpiar canvas con fondo oscuro neutro
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, cw, ch);

    // Calcular el marco de recorte visible (Crop Viewport)
    const activeRatio = selectedRatio || (imageObj.width / imageObj.height);
    let cropBoxW = cw * 0.88;
    let cropBoxH = cropBoxW / activeRatio;

    if (cropBoxH > ch * 0.88) {
      cropBoxH = ch * 0.88;
      cropBoxW = cropBoxH * activeRatio;
    }

    const cropBoxX = (cw - cropBoxW) / 2;
    const cropBoxY = (ch - cropBoxH) / 2;

    // Guardar contexto para dibujar la imagen dentro del marco
    ctx.save();

    // Crear máscara de recorte (solo se ve nítido lo que está dentro del viewport)
    ctx.beginPath();
    ctx.rect(cropBoxX, cropBoxY, cropBoxW, cropBoxH);
    ctx.clip();

    // Transformaciones de la imagen: centro en el marco + pan + rotación + escala
    const centerX = cropBoxX + cropBoxW / 2 + panX;
    const centerY = cropBoxY + cropBoxH / 2 + panY;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -scale : scale, scale);

    // Calcular tamaño base para cubrir el cropBox al 100% de escala
    const imgRatio = imageObj.width / imageObj.height;
    let baseDrawW = cropBoxW;
    let baseDrawH = cropBoxH;

    if (imgRatio > activeRatio) {
      baseDrawH = cropBoxH;
      baseDrawW = cropBoxH * imgRatio;
    } else {
      baseDrawW = cropBoxW;
      baseDrawH = cropBoxW / imgRatio;
    }

    ctx.drawImage(
      imageObj,
      -baseDrawW / 2,
      -baseDrawH / 2,
      baseDrawW,
      baseDrawH
    );

    ctx.restore();

    // Dibujar oscurecimiento exterior (Mascara tipo Viewfinder)
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.fillRect(0, 0, cw, cropBoxY); // Arriba
    ctx.fillRect(0, cropBoxY + cropBoxH, cw, ch - (cropBoxY + cropBoxH)); // Abajo
    ctx.fillRect(0, cropBoxY, cropBoxX, cropBoxH); // Izquierda
    ctx.fillRect(cropBoxX + cropBoxW, cropBoxY, cw - (cropBoxX + cropBoxW), cropBoxH); // Derecha

    // Borde brillante del Viewport de recorte
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cropBoxX, cropBoxY, cropBoxW, cropBoxH);

    // Regla de tercios (3x3 grid) si está activa
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Líneas verticales
      ctx.beginPath();
      ctx.moveTo(cropBoxX + cropBoxW / 3, cropBoxY);
      ctx.lineTo(cropBoxX + cropBoxW / 3, cropBoxY + cropBoxH);
      ctx.moveTo(cropBoxX + (cropBoxW * 2) / 3, cropBoxY);
      ctx.lineTo(cropBoxX + (cropBoxW * 2) / 3, cropBoxY + cropBoxH);

      // Líneas horizontales
      ctx.moveTo(cropBoxX, cropBoxY + cropBoxH / 3);
      ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH / 3);
      ctx.moveTo(cropBoxX, cropBoxY + (cropBoxH * 2) / 3);
      ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + (cropBoxH * 2) / 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Esquinas doradas de visor profesional
    const cornerSize = 18;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;

    // Superior Izquierda
    ctx.beginPath();
    ctx.moveTo(cropBoxX, cropBoxY + cornerSize);
    ctx.lineTo(cropBoxX, cropBoxY);
    ctx.lineTo(cropBoxX + cornerSize, cropBoxY);
    ctx.stroke();

    // Superior Derecha
    ctx.beginPath();
    ctx.moveTo(cropBoxX + cropBoxW - cornerSize, cropBoxY);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cornerSize);
    ctx.stroke();

    // Inferior Izquierda
    ctx.beginPath();
    ctx.moveTo(cropBoxX, cropBoxY + cropBoxH - cornerSize);
    ctx.lineTo(cropBoxX, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cornerSize, cropBoxY + cropBoxH);
    ctx.stroke();

    // Inferior Derecha
    ctx.beginPath();
    ctx.moveTo(cropBoxX + cropBoxW - cornerSize, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH - cornerSize);
    ctx.stroke();

    ctx.restore();
  }, [imageObj, scale, panX, panY, rotation, flipH, selectedRatio, showGrid]);

  // Redibujar ante cualquier cambio
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Manejo de arrastre con Ratón / Touch
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.initialPanX + dx);
    setPanY(dragStartRef.current.initialPanY + dy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panX,
        initialPanY: panY
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.initialPanX + dx);
    setPanY(dragStartRef.current.initialPanY + dy);
  };

  // Zoom con rueda del ratón
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.min(3.5, Math.max(0.5, prev * zoomFactor)));
  };

  // Centrar al medio
  const handleResetCenter = () => {
    soundEffects.playClick();
    setPanX(0);
    setPanY(0);
  };

  // Ajustar todo dentro (fit)
  const handleFit = () => {
    soundEffects.playClick();
    setScale(0.85);
    setPanX(0);
    setPanY(0);
  };

  // Llenar por completo (fill)
  const handleFill = () => {
    soundEffects.playClick();
    setScale(1.2);
    setPanX(0);
    setPanY(0);
  };

  // Rotar 90 grados
  const handleRotate = () => {
    soundEffects.playClick();
    setRotation((prev) => (prev + 90) % 360);
  };

  // Voltear horizontal
  const handleFlip = () => {
    soundEffects.playClick();
    setFlipH((prev) => !prev);
  };

  // Exportar y Guardar con recorte nítido a resolución objetivo
  const handleApplySave = async () => {
    if (!imageObj) return;

    setIsProcessingSave(true);
    soundEffects.playClick();

    try {
      const activeRatio = selectedRatio || (imageObj.width / imageObj.height);
      const outW = targetWidth;
      const outH = selectedRatio ? Math.round(targetWidth / activeRatio) : targetHeight;

      // Canvas de exportación fuera de pantalla
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = outW;
      exportCanvas.height = outH;

      const eCtx = exportCanvas.getContext('2d');
      if (!eCtx) throw new Error('No se pudo inicializar contexto 2D de exportación');

      // Fondo transparente o neutro
      eCtx.fillStyle = '#060913';
      eCtx.fillRect(0, 0, outW, outH);

      // Calcular factor de escala entre el canvas de preview y el canvas de salida
      const previewCanvas = canvasRef.current;
      const pcw = previewCanvas ? previewCanvas.width : 540;
      const pch = previewCanvas ? previewCanvas.height : 460;

      let cropBoxW = pcw * 0.88;
      let cropBoxH = cropBoxW / activeRatio;
      if (cropBoxH > pch * 0.88) {
        cropBoxH = pch * 0.88;
        cropBoxW = cropBoxH * activeRatio;
      }

      const ratioToOut = outW / cropBoxW;

      // Transformar canvas de exportación exactamente igual que el visor
      eCtx.save();
      eCtx.translate(outW / 2 + panX * ratioToOut, outH / 2 + panY * ratioToOut);
      eCtx.rotate((rotation * Math.PI) / 180);
      eCtx.scale(flipH ? -scale * ratioToOut : scale * ratioToOut, scale * ratioToOut);

      const imgRatio = imageObj.width / imageObj.height;
      let baseDrawW = cropBoxW;
      let baseDrawH = cropBoxH;

      if (imgRatio > activeRatio) {
        baseDrawH = cropBoxH;
        baseDrawW = cropBoxH * imgRatio;
      } else {
        baseDrawW = cropBoxW;
        baseDrawH = cropBoxW / imgRatio;
      }

      eCtx.drawImage(
        imageObj,
        -baseDrawW / 2,
        -baseDrawH / 2,
        baseDrawW,
        baseDrawH
      );

      eCtx.restore();

      // Generar Blob WebP comprimido de alta fidelidad
      const blob: Blob = await new Promise((resolve, reject) => {
        exportCanvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Fallo al exportar blob de imagen'));
          },
          'image/webp',
          0.85
        );
      });

      const dataUrl = exportCanvas.toDataURL('image/webp', 0.85);
      const filename = `framed_${Date.now()}.webp`;
      const framedFile = new File([blob], filename, { type: 'image/webp' });

      await onSave(framedFile, dataUrl);
      soundEffects.playSuccess();
      onClose();
    } catch (err) {
      console.error('Error aplicando encuadre:', err);
      soundEffects.playError();
      alert('Ocurrió un error al procesar el encuadre.');
    } finally {
      setIsProcessingSave(false);
    }
  };

  // Soporte para tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ifm-backdrop" onClick={onClose}>
      <div
        className="ifm-dialog animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
      >
        {/* Encabezado */}
        <header className="ifm-header">
          <div className="ifm-header-info">
            <span className="ifm-header-badge">🎯 ENCUADRE DE ALTA PRECISIÓN</span>
            <h3 className="ifm-title">{title}</h3>
            <p className="ifm-subtitle">{subtitle}</p>
          </div>
          <button className="ifm-close-btn" onClick={onClose} title="Cerrar (Esc)">
            ✕
          </button>
        </header>

        {/* Cuerpo Principal: Visor Interactivo + Controles */}
        <div className="ifm-body">
          {/* Columna Izquierda: Visor Canvas */}
          <div className="ifm-viewport-area">
            {loadingImage && (
              <div className="ifm-loading-overlay">
                <span className="ifm-spinner" />
                <p>Cargando imagen para encuadre...</p>
              </div>
            )}

            {imageError && (
              <div className="ifm-error-overlay">
                <span>⚠️</span>
                <p>{imageError}</p>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={540}
              height={460}
              className={`ifm-canvas ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
            />

            <div className="ifm-canvas-hint">
              <span>👆 Haz clic y arrastra para mover</span>
              <span>·</span>
              <span>🔍 Rueda del ratón para Zoom</span>
            </div>
          </div>

          {/* Columna Derecha: Panel de Controles Profesionales */}
          <div className="ifm-controls-area">
            {/* Relaciones de Aspecto */}
            <div className="ifm-control-group">
              <label className="ifm-control-label">📐 Proporción / Relación de Aspecto</label>
              <div className="ifm-ratios-grid">
                {allowedAspectRatios.map((item, idx) => {
                  const isSelected = selectedRatio === item.ratio;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`ifm-ratio-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedRatio(item.ratio);
                      }}
                    >
                      <span>{item.icon || '📐'}</span>
                      <small>{item.label}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control Deslizante de Zoom */}
            <div className="ifm-control-group">
              <div className="ifm-label-row">
                <label className="ifm-control-label">🔍 Nivel de Zoom</label>
                <span className="ifm-val-badge">{Math.round(scale * 100)}%</span>
              </div>
              <div className="ifm-slider-row">
                <button
                  type="button"
                  className="ifm-mini-btn"
                  onClick={() => setScale((prev) => Math.max(0.5, prev - 0.15))}
                  title="Alejar Zoom"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="ifm-slider"
                />
                <button
                  type="button"
                  className="ifm-mini-btn"
                  onClick={() => setScale((prev) => Math.min(3.0, prev + 0.15))}
                  title="Acercar Zoom"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones de Acción Rápida (Centrar, Fit, Fill, Rotar, Flip) */}
            <div className="ifm-control-group">
              <label className="ifm-control-label">⚡ Ajustes Rápidos de Composición</label>
              <div className="ifm-actions-grid">
                <button type="button" className="ifm-tool-btn" onClick={handleResetCenter}>
                  <span>🎯</span> Centrar
                </button>
                <button type="button" className="ifm-tool-btn" onClick={handleFit}>
                  <span>🔲</span> Ajustar (Fit)
                </button>
                <button type="button" className="ifm-tool-btn" onClick={handleFill}>
                  <span>🔳</span> Llenar (Fill)
                </button>
                <button type="button" className="ifm-tool-btn" onClick={handleRotate}>
                  <span>🔄</span> Rotar 90°
                </button>
                <button type="button" className="ifm-tool-btn" onClick={handleFlip}>
                  <span>🪞</span> Voltear H
                </button>
                <button
                  type="button"
                  className={`ifm-tool-btn ${showGrid ? 'active-grid' : ''}`}
                  onClick={() => setShowGrid((prev) => !prev)}
                >
                  <span>📏</span> Tercios {showGrid ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Desplazamiento Manual Fino */}
            <div className="ifm-control-group">
              <div className="ifm-label-row">
                <label className="ifm-control-label">↔️ Desplazamiento Fino (Pan)</label>
                <button
                  type="button"
                  className="ifm-link-btn"
                  onClick={handleResetCenter}
                >
                  Reiniciar posición
                </button>
              </div>
              <div className="ifm-pan-sliders">
                <div className="ifm-pan-subrow">
                  <span>Eje X:</span>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={panX}
                    onChange={(e) => setPanX(Number(e.target.value))}
                    className="ifm-slider"
                  />
                  <small>{panX}px</small>
                </div>
                <div className="ifm-pan-subrow">
                  <span>Eje Y:</span>
                  <input
                    type="range"
                    min="-250"
                    max="250"
                    value={panY}
                    onChange={(e) => setPanY(Number(e.target.value))}
                    className="ifm-slider"
                  />
                  <small>{panY}px</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <footer className="ifm-footer">
          <div className="ifm-footer-info">
            <span>Salida optimizada: WebP {targetWidth}x{Math.round(targetWidth / (selectedRatio || 1))}px</span>
          </div>

          <div className="ifm-footer-buttons">
            <button
              type="button"
              className="ifm-cancel-btn"
              onClick={onClose}
              disabled={isProcessingSave}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="ifm-save-btn"
              onClick={handleApplySave}
              disabled={isProcessingSave || loadingImage || Boolean(imageError)}
            >
              <span>{isProcessingSave ? '⏳' : '✓'}</span>
              {isProcessingSave ? 'Encuadrando y Guardando...' : 'Aplicar Encuadre y Guardar'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

