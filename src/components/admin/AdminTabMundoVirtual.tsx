import { useState, useRef } from 'react';
import type { PortalConfig, CustomHexagon, HexLayer } from '../../types';
import { DEFAULT_CONFIG, usePortalConfig } from '../../context/PortalConfigContext';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import { getCandidateHexes } from '../../utils/hexUtils';
import { HexagonGrid } from '../map/HexagonGrid';
import GradientBuilder from './GradientBuilder';
import { SutzIconPickerModal } from './SutzIconPickerModal';
import { IconRenderer } from './IconRegistry';
import './AdminTabMundoVirtual.css';

const BIOMES = [
  { id: 'bosque', name: '🌲 Bosque Verde', value: 'linear-gradient(135deg, #2b580c, #4a7c16)' },
  { id: 'agua', name: '💧 Océano Profundo', value: 'linear-gradient(135deg, #001f3f, #004b87)' },
  { id: 'desierto', name: '🏜️ Desierto Arena', value: 'linear-gradient(135deg, #c2b280, #e6d690)' },
  { id: 'nieve', name: '❄️ Montaña Helada', value: 'linear-gradient(135deg, #e0eaf5, #a5b9ce)' },
  { id: 'volcan', name: '🌋 Tierra Volcánica', value: 'linear-gradient(135deg, #8b5a2b, #4a2511)' },
  { id: 'galaxia', name: '🌌 Vacío Estelar', value: 'radial-gradient(circle at 50% 50%, #6441A5 0%, #2a0845 100%)' },
];

const PREDESIGNED_BACKGROUNDS = [
  { id: 'selva', name: '🌿 Selva K\'iche\'', url: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=600&q=80' },
  { id: 'montana', name: '⛰️ Montaña Ancestral', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
  { id: 'galaxia_fondo', name: '🌌 Nube Cósmica', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
  { id: 'oceano_azul', name: '💧 Lago Sagrado', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 'templo_maya', name: '🏛️ Pirámide del Saber', url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=600&q=80' },
  { id: 'fuego_magma', name: '🌋 Valle de Fuego', url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=80' }
];

const AURAS = [
  { id: 'blanco', name: '⚪ Luz Divina', value: 'rgba(255, 255, 255, 0.85)' },
  { id: 'oro', name: '🟡 Aura Dorada', value: 'rgba(255, 215, 0, 0.85)' },
  { id: 'purpura', name: '🟣 Mística Púrpura', value: 'rgba(168, 85, 247, 0.85)' },
  { id: 'cyan', name: '🔵 Furia Celeste', value: 'rgba(56, 189, 248, 0.85)' },
  { id: 'esmeralda', name: '🟢 Fuerza Esmeralda', value: 'rgba(34, 197, 94, 0.85)' },
  { id: 'carmesi', name: '🔴 Poder Carmesí', value: 'rgba(239, 68, 68, 0.85)' },
];

const QUICK_ACTIONS = [
  { label: '📖 Máquina Cuentos', target: '/creatika/maquina-de-cuentos', type: 'navigate' as const },
  { label: '🎭 Construyendo Personaje', target: '/creatika/construyendo-personaje', type: 'navigate' as const },
  { label: '🪐 Sistema Solar', target: '/juegos/sistema-solar', type: 'navigate' as const },
  { label: '🔢 Secuencias Numéricas', target: '/juegos/secuencias-numericas', type: 'navigate' as const },
  { label: '🎨 Teoría del Color', target: '/juegos/teoria-del-color', type: 'navigate' as const },
  { label: '🎟️ Bingotenango', target: '/juegos/bingo', type: 'navigate' as const },
  { label: '🦇 Popol Vuh: Camazotz', target: 'camazotz', type: 'modal' as const },
  { label: '🌸 Popol Vuh: Ixkik', target: 'ixkik', type: 'modal' as const },
  { label: '🌾 Popol Vuh: Ixmukanne', target: 'ixmukanne', type: 'modal' as const },
  { label: '⛈️ Popol Vuh: Juracán', target: 'juracan', type: 'modal' as const },
  { label: '🐍 Popol Vuh: Q\'uq\'umatz', target: 'ququmatz', type: 'modal' as const }
];

const DECORATIVE_EMOJIS = ['🏰', '🌲', '🐉', '🏛️', '🏔️', '🌿', '⭐', '🚀', '💎', '🛡️', '⚡', '🌌'];

export const getCartesianQuadrant = (col: number, row: number): string => {
  if (col === 0 && row === 0) return 'Origen (0, 0)';
  if (col === 0) return `Sobre Eje Y (${row > 0 ? 'Sur / +Y' : 'Norte / -Y'})`;
  if (row === 0) return `Sobre Eje X (${col > 0 ? 'Este / +X' : 'Oeste / -X'})`;
  if (col > 0 && row < 0) return 'Cuadrante I (+X, -Y)';
  if (col < 0 && row < 0) return 'Cuadrante II (-X, -Y)';
  if (col < 0 && row > 0) return 'Cuadrante III (-X, +Y)';
  return 'Cuadrante IV (+X, +Y)';
};

interface AdminTabMundoVirtualProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

export default function AdminTabMundoVirtual({ localConfig, setLocalConfig }: AdminTabMundoVirtualProps) {
  const { saveSutzMapToFirestore } = usePortalConfig();
  const mapData = localConfig.map || [];

  const [editingHex, setEditingHex] = useState<CustomHexagon | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'id' | 'l1' | 'l2' | 'l3'>('id');
  const [uploadingLayer, setUploadingLayer] = useState<string | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerTargetLayer, setIconPickerTargetLayer] = useState<'layerInteractive' | 'layerDeco'>('layerInteractive');
  const [showCartesianAxes, setShowCartesianAxes] = useState(true);

  const inspectorSectionRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateHexInGlobalConfig = (targetHex: CustomHexagon, autoSave = true, immediate = false) => {
    const currentMap = localConfig?.map || [];
    const existingIdx = currentMap.findIndex(h => h.row === targetHex.row && h.col === targetHex.col);

    const newMap = [...currentMap];
    if (existingIdx >= 0) {
      newMap[existingIdx] = targetHex;
    } else {
      newMap.push(targetHex);
    }

    const updatedConfig: PortalConfig = {
      ...localConfig,
      map: newMap
    };

    setLocalConfig(updatedConfig);

    if (autoSave) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (immediate) {
        saveSutzMapToFirestore(newMap).catch(err => {
          console.warn('Could not save hexagon to Firestore:', err);
        });
      } else {
        debounceTimerRef.current = setTimeout(() => {
          saveSutzMapToFirestore(newMap).catch(err => {
            console.warn('Could not auto-save hexagon to Firestore:', err);
          });
        }, 500);
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, layerKey: 'layerBg' | 'layerDeco' | 'layerInteractive') => {
    const file = e.target.files?.[0];
    if (!file || !editingHex) return;
    
    setUploadingLayer(layerKey);
    setUploadStatusMsg('⚡ Comprimiendo y procesando imagen a WebP...');
    try {
      const { url, isBase64 } = await uploadImageWithFallback(file, 'map-assets', 800, 800, 0.78);

      const updatedHex: CustomHexagon = {
        ...editingHex,
        [layerKey]: { type: 'image', value: url }
      };

      setEditingHex(updatedHex);
      updateHexInGlobalConfig(updatedHex, true, true);

      setUploadStatusMsg(
        isBase64
          ? `⚡ ¡Imagen optimizada (WebP integrado) y guardada permanentemente en Firestore!`
          : `✨ ¡Imagen optimizada y guardada permanentemente en Firestore!`
      );
      setTimeout(() => setUploadStatusMsg(null), 5000);
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("Error al comprimir o procesar la imagen.");
      setUploadStatusMsg(null);
    } finally {
      setUploadingLayer(null);
    }
  };

  const emptyLayer = (): HexLayer => ({ type: 'none', value: '' });

  const previewCells = [...mapData];
  const candidateCoords = getCandidateHexes(mapData);
  candidateCoords.forEach(({ row: r, col: c }) => {
    previewCells.push({
      id: `preview-${r}-${c}`,
      row: r,
      col: c,
      title: 'Añadir nuevo',
      glowColor: 'rgba(200,200,200,0.5)',
      layerBg: { type: 'none', value: '' },
      layerDeco: { type: 'none', value: '' },
      layerInteractive: { type: 'icon', value: '➕' },
      action: { type: 'none', target: '' }
    });
  });

  if (editingHex) {
    const liveIndex = previewCells.findIndex(c => c.row === editingHex.row && c.col === editingHex.col);
    if (liveIndex >= 0) {
      previewCells[liveIndex] = editingHex;
    } else {
      previewCells.push(editingHex);
    }
  }

  const handlePreviewClick = (hex: CustomHexagon) => {
    const exists = mapData.some(h => h.row === hex.row && h.col === hex.col);
    if (!exists) {
      const newHex: CustomHexagon = {
        id: `${hex.row},${hex.col}`,
        row: hex.row,
        col: hex.col,
        title: 'Nuevo Hexágono',
        glowColor: 'rgba(255,255,255,0.8)',
        layerBg: emptyLayer(),
        layerDeco: emptyLayer(),
        layerInteractive: { type: 'icon', value: '⭐' },
        action: { type: 'none', target: '' }
      };
      setEditingHex(newHex);
    } else {
      setEditingHex({ ...hex });
    }

    // Desplazar suavemente hacia las opciones de edición abajo
    setTimeout(() => {
      inspectorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const handleSaveHexagon = async () => {
    if (!editingHex) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateHexInGlobalConfig(editingHex, true, true);
    setUploadStatusMsg(`✨ Hexágono (${editingHex.row}, ${editingHex.col}) guardado permanentemente en Firestore.`);
    setTimeout(() => setUploadStatusMsg(null), 5000);
  };

  const handleDeleteHexagon = async () => {
    if (!editingHex) return;
    if (!window.confirm(`¿Estás seguro de eliminar el hexágono (${editingHex.row}, ${editingHex.col})?`)) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const newMap = (localConfig.map || []).filter(h => !(h.row === editingHex.row && h.col === editingHex.col));
    const updatedConfig: PortalConfig = {
      ...localConfig,
      map: newMap
    };
    setLocalConfig(updatedConfig);
    setEditingHex(null);
    try {
      await saveSutzMapToFirestore(newMap);
      setUploadStatusMsg('🗑️ Hexágono eliminado y sincronizado en Firestore.');
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } catch (err) {
      console.error('Error al eliminar hexágono:', err);
    }
  };

  const handleResetMapToDefault = async () => {
    if (!window.confirm("¿Deseas restaurar la disposición por defecto del mapa?")) return;
    const defaultMap = DEFAULT_CONFIG.map || [];
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        map: defaultMap
      };
    });
    setEditingHex(null);
    try {
      await saveSutzMapToFirestore(defaultMap);
      setUploadStatusMsg('🔄 Mapa restaurado por defecto.');
      setTimeout(() => setUploadStatusMsg(null), 3000);
    } catch (err) {
      console.error('Error restaurando mapa:', err);
    }
  };

  return (
    <div className="sutz-editor-container animate-fade-in">
      
      {/* Encabezado del Editor Sutz */}
      <div className="sutz-editor-header">
        <div className="sutz-header-left">
          <h3><span>☁️</span> Sutz Editor: Mundo Virtual Hexagonal</h3>
          <p>Visualiza el mapa en vista panorámica completa y ajusta las opciones y capas cómodamente abajo.</p>
        </div>

        <div className="sutz-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleResetMapToDefault} title="Restaurar mapa base">
            🔄 Restablecer Mapa Base
          </button>
        </div>
      </div>

      {/* Disposición Apilada Vertical: Mapa arriba (ancho completo), Opciones abajo */}
      <div className="sutz-stacked-layout">

        {/* 1. SECCIÓN SUPERIOR: CANVAS INTERACTIVO DEL MAPA EN ANCHO COMPLETO */}
        <div className="map-canvas-card">
          <div className="map-canvas-toolbar">
            <div className="map-canvas-toolbar-left">
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8' }}>
                🗺️ Mapa del Mundo Virtual ({previewCells.length} celdas activas)
              </span>
              {editingHex ? (
                <span className="inspector-coords-badge">
                  <span>📍</span>
                  <strong style={{ color: '#38bdf8' }}>X: {editingHex.col}</strong>
                  <span style={{ color: '#94a3b8' }}>·</span>
                  <strong style={{ color: '#34d399' }}>Y: {editingHex.row}</strong>
                  <span style={{ opacity: 0.85, fontSize: '0.74rem', marginLeft: '4px' }}>
                    [{getCartesianQuadrant(editingHex.col, editingHex.row)}]
                  </span>
                  <span style={{ marginLeft: '4px', color: '#f1f5f9' }}>— {editingHex.title || 'Sin Título'}</span>
                </span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Haz clic en cualquier celda para editar sus opciones abajo
                </span>
              )}
            </div>

            <div className="map-canvas-toolbar-right">
              {/* Toggle de Plano Cartesiano Didáctico */}
              <button
                type="button"
                className={`btn btn-secondary btn-sm ${showCartesianAxes ? 'active' : ''}`}
                onClick={() => setShowCartesianAxes(prev => !prev)}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 10px',
                  color: showCartesianAxes ? '#38bdf8' : '#94a3b8',
                  borderColor: showCartesianAxes ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                  background: showCartesianAxes ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Mostrar u ocultar los ejes del Plano Cartesiano (X, Y) y sus cuadrantes"
              >
                <span>📐</span> Plano Cartesiano: {showCartesianAxes ? 'Activo' : 'Oculto'}
              </button>

              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                🖱️ Rueda para Zoom · Arrastra libre
              </span>
              {editingHex && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => inspectorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  style={{ fontSize: '0.74rem', padding: '4px 10px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                >
                  👇 Ir a Opciones
                </button>
              )}
            </div>
          </div>

          <div className="map-canvas-viewport">
            <HexagonGrid 
              cells={previewCells} 
              onHexClick={handlePreviewClick} 
              hexWidth={142} 
              hexHeight={124} 
              showLabels={true} 
              showCartesianAxes={showCartesianAxes}
              editingHexRow={editingHex?.row}
              editingHexCol={editingHex?.col}
            />
          </div>

          <div className="map-canvas-hint">
            <span>💡 Haz clic en una celda para abrir sus opciones abajo</span>
            <span>·</span>
            <span>Haz clic en ➕ para expandir el mapa con nuevos hexágonos</span>
          </div>
        </div>

        {/* 2. SECCIÓN INFERIOR: PANEL DE OPCIONES Y CAPAS (ANCHO COMPLETO) */}
        <div ref={inspectorSectionRef} className="hex-inspector-card" id="sutz-inspector-section">
          {editingHex ? (
            <>
              {/* Barra Superior del Inspector con Título, Selector Rápido y Acciones */}
              <div className="inspector-header">
                <div className="inspector-header-left">
                  <div className="inspector-header-title">
                    <h4><span>✏️</span> {editingHex.title || 'Hexágono'}</h4>
                    <span className="inspector-coords-badge">
                      Fila: {editingHex.row}, Columna: {editingHex.col}
                    </span>
                  </div>

                  {/* Selector Rápido para saltar a cualquier celda */}
                  <select 
                    value={`${editingHex.row},${editingHex.col}`}
                    onChange={(e) => {
                      const [r, c] = e.target.value.split(',').map(Number);
                      const target = previewCells.find(cell => cell.row === r && cell.col === c);
                      if (target) handlePreviewClick(target);
                    }}
                    className="inspector-select"
                    style={{ fontSize: '0.82rem', padding: '6px 12px', minWidth: '220px', borderRadius: '10px' }}
                    title="Cambiar rápidamente de celda"
                  >
                    {mapData.map(h => (
                      <option key={`${h.row},${h.col}`} value={`${h.row},${h.col}`}>
                        📍 Hex ({h.row}, {h.col}) — {h.title || 'Sin Título'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inspector-header-actions">
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={handleDeleteHexagon}
                    style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 700 }}
                    title="Eliminar este hexágono del mapa"
                  >
                    🗑️ Eliminar Celda
                  </button>

                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleSaveHexagon}
                    style={{ fontWeight: 800, padding: '7px 18px', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>

              {/* Mensajes de Notificación de Subida / Guardado */}
              {uploadStatusMsg && (
                <div className="upload-status-chip">
                  <span>{uploadStatusMsg}</span>
                </div>
              )}

              {/* BARRA PROMINENTE DE TÍTULO INDEPENDIENTE */}
              <div className="inspector-title-bar-prominent">
                <div className="inspector-title-content">
                  <div className="inspector-title-label-row">
                    <span className="inspector-title-badge-tag">
                      🏷️ TÍTULO DEL HEXÁGONO
                    </span>
                    <span className="inspector-title-badge-hint">
                      ✏️ Totalmente independiente de los enlaces y acciones
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={editingHex.title} 
                    onChange={e => {
                      const updated = { ...editingHex, title: e.target.value };
                      setEditingHex(updated);
                      updateHexInGlobalConfig(updated, true, false);
                    }}
                    onBlur={() => {
                      if (editingHex) updateHexInGlobalConfig(editingHex, true, true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    placeholder="Ej: Popol Vuh, Creatika, Portal Sagrado..."
                    className="inspector-title-input-prominent"
                  />
                </div>
              </div>

              {/* Pestañas de Capas del Inspector (Ribbon de ancho completo) */}
              <div className="inspector-tabs">
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'id' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('id')}
                >
                  <span>📍</span> 1. Información & Aura Hover
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l1' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l1')}
                >
                  <span>🎨</span> 2. Capa 1: Fondo (Prediseñados & Degradados)
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l2' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l2')}
                >
                  <span>🏰</span> 3. Capa 2: Decoración
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l3' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l3')}
                >
                  <span>🌀</span> 4. Ícono & Acción Interactiva
                </button>
              </div>

              {/* CONTENIDO PESTAÑA 1: INFORMACIÓN & AURA */}
              {activeInspectorTab === 'id' && (
                <div className="inspector-grid-3col">
                  {/* Tarjeta 1: Título e Identificación */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">🏷️ Nombre del Hexágono</span>
                    <div className="inspector-form-group">
                      <label className="inspector-label">Título visible en pantalla:</label>
                      <input 
                        type="text" 
                        value={editingHex.title} 
                        onChange={e => {
                          const updated = { ...editingHex, title: e.target.value };
                          setEditingHex(updated);
                          updateHexInGlobalConfig(updated, true, false);
                        }}
                        onBlur={() => {
                          if (editingHex) updateHexInGlobalConfig(editingHex, true, true);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        placeholder="Ej: Popol Vuh, Creatika, etc."
                        className="inspector-input"
                      />
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        📐 Plano Cartesiano: <strong style={{ color: '#38bdf8' }}>X = {editingHex.col}</strong> (Columna) · <strong style={{ color: '#34d399' }}>Y = {editingHex.row}</strong> (Fila)
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.76rem' }}>
                        🧭 Posición: <strong style={{ color: '#fde68a' }}>{getCartesianQuadrant(editingHex.col, editingHex.row)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Aura Neón Hover */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">✨ Aura Neón Hover (Brillo)</span>
                    <div className="inspector-form-group">
                      <label className="inspector-label">Efecto luminoso al pasar el cursor:</label>
                      <select 
                        value={AURAS.find(a => a.value === editingHex.glowColor)?.value || 'custom'} 
                        onChange={e => {
                          const val = e.target.value !== 'custom' ? e.target.value : '';
                          const updated = { ...editingHex, glowColor: val };
                          setEditingHex(updated);
                          updateHexInGlobalConfig(updated);
                        }}
                        className="inspector-select"
                      >
                        <option value="custom">-- Aura Personalizada --</option>
                        {AURAS.map(a => (
                          <option key={a.id} value={a.value}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tarjeta 3: Color Personalizado y Muestra */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">🎨 Color / RGBA Personalizado</span>
                    <div className="inspector-form-group">
                      <label className="inspector-label">Código de color RGBA o Hex:</label>
                      <input 
                        type="text" 
                        value={editingHex.glowColor} 
                        onChange={e => {
                          const updated = { ...editingHex, glowColor: e.target.value };
                          setEditingHex(updated);
                          updateHexInGlobalConfig(updated);
                        }} 
                        placeholder="rgba(56, 189, 248, 0.85)" 
                        className="inspector-input"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '8px', 
                        background: editingHex.glowColor || 'rgba(56, 189, 248, 0.5)',
                        boxShadow: `0 0 12px ${editingHex.glowColor || 'rgba(56, 189, 248, 0.5)'}`,
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }} />
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Muestra de brillo activa</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA 2: CAPA 1 FONDO */}
              {activeInspectorTab === 'l1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Bloque Superior: Galería de Fondos Prediseñados Popol Vuh y Naturaleza */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">🖼️ Fondos Prediseñados (Popol Vuh & Naturaleza)</span>
                    <div className="predesigned-gallery-grid">
                      {PREDESIGNED_BACKGROUNDS.map(bg => {
                        const isActive = editingHex.layerBg.value === bg.url;
                        return (
                          <button
                            key={bg.id}
                            type="button"
                            className={`predesigned-card-btn ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              const updated = { ...editingHex, layerBg: { type: 'image' as const, value: bg.url } };
                              setEditingHex(updated);
                              updateHexInGlobalConfig(updated);
                            }}
                          >
                            {isActive && <span className="predesigned-active-badge">✓ ACTIVO</span>}
                            <span>{bg.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bloque Inferior: Degradados de Bioma y Subida de Imagen WebP */}
                  <div className="inspector-grid-2col">
                    {/* Columna A: Biomas y Degradados */}
                    <div className="inspector-card-panel">
                      <span className="inspector-panel-title">🌌 Degradados Neón de Bioma</span>
                      <div className="inspector-form-group">
                        <label className="inspector-label">Seleccionar Bioma:</label>
                        <select 
                          value={BIOMES.find(b => b.value === editingHex.layerBg.value)?.id || 'custom'} 
                          onChange={e => {
                            if (e.target.value !== 'custom') {
                              const biome = BIOMES.find(b => b.id === e.target.value);
                              if (biome) {
                                const updated = { ...editingHex, layerBg: { type: 'color' as const, value: biome.value } };
                                setEditingHex(updated);
                                updateHexInGlobalConfig(updated);
                              }
                            }
                          }}
                          className="inspector-select"
                        >
                          <option value="custom">-- Seleccionar Bioma o Personalizado --</option>
                          {BIOMES.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => setShowGradientBuilder(true)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          🎨 Abrir Creador Visual de Degradados
                        </button>
                      </div>
                    </div>

                    {/* Columna B: URL o Subida de Imagen */}
                    <div className="inspector-card-panel">
                      <span className="inspector-panel-title">📤 Imagen Propia o URL</span>
                      <div className="inspector-form-group">
                        <label className="inspector-label">URL o CSS del Fondo:</label>
                        <input 
                          type="text" 
                          value={editingHex.layerBg.value} 
                          onChange={e => {
                            const updated = { ...editingHex, layerBg: { ...editingHex.layerBg, value: e.target.value } };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                          placeholder="URL de imagen o CSS..."
                          className="inspector-input"
                        />
                      </div>

                      <label className="upload-btn-label" style={{ marginTop: '4px' }}>
                        {uploadingLayer === 'layerBg' ? '⏳ Comprimiendo & Subiendo...' : '📤 Subir Imagen Fondo (WebP Auto a Firestore)'}
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          accept="image/*" 
                          onChange={(e) => handleUpload(e, 'layerBg')} 
                          disabled={uploadingLayer === 'layerBg'} 
                        />
                      </label>
                    </div>
                  </div>

                </div>
              )}

              {/* CONTENIDO PESTAÑA 3: CAPA 2 DECORATIVA */}
              {activeInspectorTab === 'l2' && (
                <div className="inspector-grid-2col">
                  {/* Columna 1: Modo y Configuración */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">🏰 Capa Decorativa</span>
                    <div className="inspector-form-group">
                      <label className="inspector-label">Tipo de Decoración:</label>
                      <select 
                        value={editingHex.layerDeco.type} 
                        onChange={e => {
                          const updated = { ...editingHex, layerDeco: { ...editingHex.layerDeco, type: e.target.value as 'color' | 'image' | 'icon' | 'text' | 'none' } };
                          setEditingHex(updated);
                          updateHexInGlobalConfig(updated);
                        }}
                        className="inspector-select"
                      >
                        <option value="none">Ninguno (Desactivado)</option>
                        <option value="icon">Ícono / Emoji Decorativo</option>
                        <option value="image">Imagen Decorativa (URL / Subir)</option>
                      </select>
                    </div>

                    {editingHex.layerDeco.type !== 'none' && (
                      <div className="inspector-form-group" style={{ marginTop: '10px' }}>
                        <label className="inspector-label">Valor (Emoji o URL):</label>
                        <input 
                          type="text" 
                          value={editingHex.layerDeco.value} 
                          onChange={e => {
                            const updated = { ...editingHex, layerDeco: { ...editingHex.layerDeco, value: e.target.value } };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                          placeholder="Ej: 🏰, 🌲, 🐉 o URL..."
                          className="inspector-input"
                        />
                      </div>
                    )}
                  </div>

                    {/* Columna 2: Emojis Rápidos o Subida de Imagen */}
                  <div className="inspector-card-panel">
                    {editingHex.layerDeco.type === 'icon' ? (
                      <>
                        <span className="inspector-panel-title">✨ Emojis Decorativos Rápidos</span>
                        <div className="quick-suggestions-pills">
                          {DECORATIVE_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              className={`quick-pill-btn ${editingHex.layerDeco.value === emoji ? 'active' : ''}`}
                              onClick={() => {
                                const updated = { ...editingHex, layerDeco: { type: 'icon' as const, value: emoji } };
                                setEditingHex(updated);
                                updateHexInGlobalConfig(updated);
                              }}
                              style={{ fontSize: '1.2rem', padding: '6px 12px' }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setIconPickerTargetLayer('layerDeco');
                            setShowIconPicker(true);
                          }}
                          style={{ marginTop: '10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          💠 Explorar Catálogo y Biblioteca de Íconos
                        </button>
                      </>
                    ) : editingHex.layerDeco.type === 'image' ? (
                      <>
                        <span className="inspector-panel-title">📤 Subir Imagen Decorativa</span>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                          Sube un elemento decorativo con transparencia (PNG o WebP) para superponer en el hexágono.
                        </p>
                        <label className="upload-btn-label">
                          {uploadingLayer === 'layerDeco' ? '⏳ Comprimiendo & Subiendo...' : '📤 Subir Imagen Decorativa (WebP Auto)'}
                          <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={(e) => handleUpload(e, 'layerDeco')} 
                            disabled={uploadingLayer === 'layerDeco'} 
                          />
                        </label>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        Selecciona un modo decorativo a la izquierda para activar sus opciones.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA 4: ÍCONO & ACCIÓN INTERACTIVA */}
              {activeInspectorTab === 'l3' && (
                <div className="inspector-grid-2col">
                  {/* Tarjeta A: Ícono del Hexágono (Configuración, Catálogo & Subida Propia) */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">💠 Ícono del Hexágono</span>
                    
                    {/* Visualización del Ícono Actual */}
                    <div className="inspector-icon-preview-row">
                      <div className="inspector-icon-preview-circle">
                        {editingHex.layerInteractive.value ? (
                          (editingHex.layerInteractive.value.startsWith('http') || 
                           editingHex.layerInteractive.value.startsWith('data:image/') || 
                           editingHex.layerInteractive.value.startsWith('/')) ? (
                            <img src={editingHex.layerInteractive.value} alt="Ícono" />
                          ) : (
                            <IconRenderer 
                              iconName={editingHex.layerInteractive.value} 
                              size="1.8rem" 
                              color={editingHex.layerInteractive.color || '#38bdf8'} 
                            />
                          )
                        ) : (
                          <span style={{ fontSize: '1.5rem', opacity: 0.35 }}>🔘</span>
                        )}
                      </div>

                      <div className="inspector-icon-meta">
                        <span className="inspector-icon-meta-title">
                          {editingHex.layerInteractive.value ? (
                            (editingHex.layerInteractive.value.startsWith('http') || editingHex.layerInteractive.value.startsWith('data:image/'))
                              ? 'Ícono Personalizado Subido'
                              : editingHex.layerInteractive.value
                          ) : 'Sin ícono asignado'}
                        </span>
                        <span className="inspector-icon-meta-type">
                          {editingHex.layerInteractive.value ? 'Visible en el centro de la celda' : 'El hexágono solo mostrará su fondo'}
                        </span>
                      </div>
                    </div>

                    {/* Botón Principal para Abrir Gestor y Subida */}
                    <button 
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setIconPickerTargetLayer('layerInteractive');
                        setShowIconPicker(true);
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                        border: 'none',
                        fontWeight: 700,
                        padding: '10px 16px',
                        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
                      }}
                    >
                      <span>💠</span> Seleccionar Ícono o Subir Propio
                    </button>

                    {/* Controles de Escala y Quitar */}
                    {editingHex.layerInteractive.value && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                        <div className="inspector-scale-control">
                          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                            Escala: {(editingHex.layerInteractive.size ?? 1.0).toFixed(1)}x
                          </span>
                          <input 
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.1"
                            value={editingHex.layerInteractive.size ?? 1.0}
                            onChange={e => {
                              const sz = parseFloat(e.target.value);
                              const updated = {
                                ...editingHex,
                                layerInteractive: { ...editingHex.layerInteractive, size: sz }
                              };
                              setEditingHex(updated);
                              updateHexInGlobalConfig(updated);
                            }}
                            className="inspector-scale-slider"
                          />
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            const updated = {
                              ...editingHex,
                              layerInteractive: { type: 'none' as const, value: '' }
                            };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                          style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', width: '100%' }}
                        >
                          ❌ Quitar Ícono
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tarjeta B: Acción al Clic & Rutas Rápidas (Independiente) */}
                  <div className="inspector-card-panel">
                    <span className="inspector-panel-title">🎯 Acción al Clic (Independiente)</span>
                    <div className="inspector-form-group">
                      <label className="inspector-label">Tipo de Acción al Clic:</label>
                      <select 
                        value={editingHex.action.type} 
                        onChange={e => {
                          const updated = { ...editingHex, action: { ...editingHex.action, type: e.target.value as 'navigate' | 'external' | 'modal' | 'none' } };
                          setEditingHex(updated);
                          updateHexInGlobalConfig(updated);
                        }}
                        className="inspector-select"
                      >
                        <option value="none">Ninguna Acción (Solo informativo / decorativo)</option>
                        <option value="navigate">Navegar a Ruta Interna</option>
                        <option value="external">Abrir Enlace Externo</option>
                        <option value="modal">Abrir Modal de Cuento Popol Vuh</option>
                      </select>
                    </div>

                    {editingHex.action.type !== 'none' && (
                      <div className="inspector-form-group" style={{ marginTop: '10px' }}>
                        <label className="inspector-label">Ruta de Destino / URL / Modal:</label>
                        <input 
                          type="text" 
                          value={editingHex.action.target} 
                          onChange={e => {
                            const updated = { ...editingHex, action: { ...editingHex.action, target: e.target.value } };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                          placeholder="Ej: /creatika/maquina-de-cuentos o camazotz"
                          className="inspector-input"
                        />
                      </div>
                    )}

                    {/* Accesos Rápidos de Destinos Populares */}
                    <div style={{ marginTop: '10px' }}>
                      <label className="inspector-label" style={{ display: 'block', marginBottom: '6px' }}>
                        ⚡ Sugerencias Rápidas de Destino:
                      </label>
                      <div className="quick-suggestions-pills">
                        {QUICK_ACTIONS.map(qa => {
                          const isMatch = editingHex.action.target === qa.target;
                          return (
                            <button
                              key={qa.label}
                              type="button"
                              className={`quick-pill-btn ${isMatch ? 'active' : ''}`}
                              onClick={() => {
                                const updated = {
                                  ...editingHex,
                                  action: { type: qa.type, target: qa.target }
                                };
                                setEditingHex(updated);
                                updateHexInGlobalConfig(updated);
                              }}
                            >
                              {qa.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Barra Inferior de Guardar Cambios */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeleteHexagon}
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 700 }}
                >
                  🗑️ Eliminar Hexágono
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveHexagon}
                  style={{ fontWeight: 800, padding: '9px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)' }}
                >
                  💾 Confirmar y Guardar Cambios
                </button>
              </div>

            </>
          ) : (
            /* Estado Vacío cuando no hay ningún hexágono seleccionado */
            <div className="empty-inspector-placeholder">
              <span className="empty-inspector-icon">🗺️</span>
              <h4>Panel de Edición del Mundo Virtual</h4>
              <p>
                Haz clic en cualquier hexágono del mapa interactivo arriba para configurar sus capas, fondos, auras y destinos aquí abajo, o selecciona uno directamente en la lista:
              </p>
              <div style={{ marginTop: '12px', width: '100%', maxWidth: '380px' }}>
                <select 
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const [r, c] = e.target.value.split(',').map(Number);
                    const target = previewCells.find(cell => cell.row === r && cell.col === c);
                    if (target) handlePreviewClick(target);
                  }}
                  className="inspector-select"
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <option value="">-- Seleccionar Hexágono para Editar --</option>
                  {mapData.map(h => (
                    <option key={`${h.row},${h.col}`} value={`${h.row},${h.col}`}>
                      📍 Hex ({h.row}, {h.col}) — {h.title || 'Sin Título'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Creador de Degradados */}
      {showGradientBuilder && editingHex && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GradientBuilder 
            onApply={(css) => {
              const updated = { ...editingHex, layerBg: { type: 'color' as const, value: css } };
              setEditingHex(updated);
              updateHexInGlobalConfig(updated);
              setShowGradientBuilder(false);
            }}
            onClose={() => setShowGradientBuilder(false)}
          />
        </div>
      )}

      {/* Modal Catálogo y Gestor de Íconos de Sutz */}
      {showIconPicker && editingHex && (
        <SutzIconPickerModal 
          isOpen={showIconPicker}
          currentValue={
            iconPickerTargetLayer === 'layerDeco' 
              ? editingHex.layerDeco.value 
              : editingHex.layerInteractive.value
          }
          onSelectIcon={(iconValue) => {
            if (iconPickerTargetLayer === 'layerDeco') {
              const updated = {
                ...editingHex,
                layerDeco: {
                  ...editingHex.layerDeco,
                  type: 'icon' as const,
                  value: iconValue
                }
              };
              setEditingHex(updated);
              updateHexInGlobalConfig(updated, true, true);
            } else {
              const updated = {
                ...editingHex,
                layerInteractive: {
                  ...editingHex.layerInteractive,
                  type: 'icon' as const,
                  value: iconValue,
                  size: editingHex.layerInteractive.size ?? 1.0
                }
              };
              setEditingHex(updated);
              updateHexInGlobalConfig(updated, true, true);
            }
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}

    </div>
  );
}
