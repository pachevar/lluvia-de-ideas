import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import type { PortalConfig, CustomHexagon, HexLayer } from '../../types';
import { DEFAULT_CONFIG } from '../../context/PortalConfigContext';
import { getCandidateHexes } from '../../utils/hexUtils';
import { HexagonGrid } from '../map/HexagonGrid';
import GradientBuilder from './GradientBuilder';
import IconPickerModal from './IconPickerModal';
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
  { id: 'neutra', name: '⚪ Neutra (Paso)', value: 'rgba(255,255,255,0.4)' },
  { id: 'historia', name: '📚 Sabiduría (Azul/Cian)', value: 'rgba(0,200,255,0.8)' },
  { id: 'desafio', name: '⚔️ Desafío (Rojo Fuego)', value: 'rgba(255,50,50,0.8)' },
  { id: 'naturaleza', name: '🌿 Naturaleza (Verde)', value: 'rgba(50,255,100,0.8)' },
  { id: 'epica', name: '✨ Épica (Dorado)', value: 'rgba(255,215,0,0.8)' },
  { id: 'portal', name: '🌀 Portal (Púrpura)', value: 'rgba(200,50,255,0.8)' }
];

interface AdminTabMundoVirtualProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

const emptyLayer = (): HexLayer => ({ type: 'none', value: '' });

// Compresor de imágenes WebP en el cliente
async function compressImageWebP(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas failure'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Blob failure'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function AdminTabMundoVirtual({ localConfig, setLocalConfig }: AdminTabMundoVirtualProps) {
  const mapData = localConfig?.map || [];

  const [editingHex, setEditingHex] = useState<CustomHexagon | null>(() => {
    return mapData.length > 0 ? { ...mapData[0] } : {
      id: "0,0",
      row: 0,
      col: 0,
      title: "Portal Principal",
      glowColor: "rgba(255, 255, 255, 0.85)",
      layerBg: emptyLayer(),
      layerDeco: emptyLayer(),
      layerInteractive: { type: "icon", value: "🌌" },
      action: { type: "none", target: "" }
    };
  });

  const [activeInspectorTab, setActiveInspectorTab] = useState<'id' | 'l1' | 'l2' | 'l3'>('id');
  const [uploadingLayer, setUploadingLayer] = useState<'layerBg' | 'layerDeco' | 'layerInteractive' | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, layerKey: 'layerBg' | 'layerDeco' | 'layerInteractive') => {
    const file = e.target.files?.[0];
    if (!file || !editingHex) return;
    
    setUploadingLayer(layerKey);
    setUploadStatusMsg('⚡ Comprimiendo imagen a WebP liviano...');
    try {
      const originalMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedBlob = await compressImageWebP(file);
      const compressedKB = (compressedBlob.size / 1024).toFixed(1);

      setUploadStatusMsg(`🚀 Subiendo a Firebase (${originalMB}MB ➔ ${compressedKB}KB WebP)...`);

      const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
      const fileRef = ref(storage, `map-assets/${Date.now()}_${cleanName}`);
      await uploadBytes(fileRef, compressedBlob, { contentType: 'image/webp' });
      const url = await getDownloadURL(fileRef);

      const updatedHex = {
        ...editingHex,
        [layerKey]: { type: 'image', value: url }
      };

      setEditingHex(updatedHex);
      updateHexInGlobalConfig(updatedHex);

      setUploadStatusMsg(`✨ ¡Imagen optimizada guardada! (${compressedKB} KB)`);
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("Error al comprimir o subir la imagen.");
      setUploadStatusMsg(null);
    } finally {
      setUploadingLayer(null);
    }
  };

  const previewCells = [...mapData];

  const candidateCoords = getCandidateHexes(mapData);

  candidateCoords.forEach(({ row: r, col: c }) => {
    previewCells.push({
      id: `preview-${r}-${c}`,
      row: r,
      col: c,
      title: 'Añadir nuevo',
      glowColor: 'rgba(200,200,200,0.5)',
      layerBg: emptyLayer(),
      layerDeco: emptyLayer(),
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
    if (hex.id.startsWith('preview-')) {
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
  };

  const updateHexInGlobalConfig = (targetHex: CustomHexagon) => {
    setLocalConfig(prev => {
      if (!prev) return null;
      const currentMap = prev.map || [];
      const existingIdx = currentMap.findIndex(h => h.row === targetHex.row && h.col === targetHex.col);

      let newMap = [...currentMap];
      if (existingIdx >= 0) {
        newMap[existingIdx] = targetHex;
      } else {
        newMap.push(targetHex);
      }

      return {
        ...prev,
        map: newMap
      };
    });
  };

  const handleSaveHexagon = () => {
    if (!editingHex) return;
    updateHexInGlobalConfig(editingHex);
    alert(`✨ Hexágono (${editingHex.row}, ${editingHex.col}) guardado localmente. Presiona Ctrl + S o Guardar en Gerencia para aplicar a Firebase.`);
  };

  const handleDeleteHexagon = () => {
    if (!editingHex) return;
    if (!window.confirm(`¿Estás seguro de eliminar el hexágono (${editingHex.row}, ${editingHex.col})?`)) return;

    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        map: (prev.map || []).filter(h => !(h.row === editingHex.row && h.col === editingHex.col))
      };
    });

    setEditingHex(null);
  };

  const handleResetMapToDefault = () => {
    if (!window.confirm("¿Deseas restaurar la disposición por defecto del mapa?")) return;
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        map: DEFAULT_CONFIG.map
      };
    });
    setEditingHex(null);
  };

  return (
    <div className="sutz-editor-container animate-fade-in">
      
      {/* Encabezado del Editor Sutz */}
      <div className="sutz-editor-header">
        <div className="sutz-header-left">
          <h3><span>☁️</span> Sutz Editor: Mundo Virtual Hexagonal</h3>
          <p>Inspecciona, edita e integra imágenes y capas interactivas a cada celda en tiempo real.</p>
        </div>

        <div className="sutz-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleResetMapToDefault} title="Restaurar mapa base">
            🔄 Restablecer Mapa Base
          </button>
        </div>
      </div>

      {/* Disposición Dividida Dual (Mapa Canvas + Inspector) */}
      <div className="sutz-dual-panel">
        
        {/* COLUMNA IZQUIERDA: CANVAS INTERACTIVO DEL MAPA */}
        <div className="map-canvas-card">
          <div className="map-canvas-toolbar">
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
              🗺️ Vista Previa en Vivo ({previewCells.length} celdas)
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {editingHex ? `Seleccionado: (${editingHex.row}, ${editingHex.col})` : 'Haz clic en una celda para editar'}
            </span>
          </div>

          <div className="map-canvas-viewport">
            <HexagonGrid 
              cells={previewCells} 
              onHexClick={handlePreviewClick} 
              hexWidth={120} 
              hexHeight={138} 
              showLabels={true} 
              editingHexRow={editingHex?.row}
              editingHexCol={editingHex?.col}
            />
          </div>

          <p className="map-canvas-hint">
            💡 Consejo: Haz clic en las celdas con el icono ➕ para expandir el mapa con nuevos hexágonos.
          </p>
        </div>

        {/* COLUMNA DERECHA: INSPECTOR DE HEXÁGONO */}
        <div className="hex-inspector-card">
          {editingHex ? (
            <>
              <div className="inspector-header">
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}><span>✏️</span> {editingHex.title || 'Hexágono'}</h4>
                  <select 
                    value={`${editingHex.row},${editingHex.col}`}
                    onChange={(e) => {
                      const [r, c] = e.target.value.split(',').map(Number);
                      const target = previewCells.find(cell => cell.row === r && cell.col === c);
                      if (target) handlePreviewClick(target);
                    }}
                    className="inspector-select"
                    style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: '8px' }}
                  >
                    {mapData.map(h => (
                      <option key={`${h.row},${h.col}`} value={`${h.row},${h.col}`}>
                        📍 Hex ({h.row}, {h.col}) — {h.title || 'Sin Título'}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="inspector-coords-badge">Row: {editingHex.row}, Col: {editingHex.col}</span>
              </div>

              {/* Pestañas de Capas del Inspector */}
              <div className="inspector-tabs">
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'id' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('id')}
                >
                  📍 Info & Aura
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l1' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l1')}
                >
                  🎨 Capa 1: Fondo
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l2' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l2')}
                >
                  🏰 Capa 2: Deco
                </button>
                <button 
                  className={`inspector-tab-btn ${activeInspectorTab === 'l3' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorTab('l3')}
                >
                  🌀 Capa 3: Link
                </button>
              </div>

              {/* PESTAÑA 1: INFO & AURA */}
              {activeInspectorTab === 'id' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="inspector-form-group">
                    <label className="inspector-label">Título del Hexágono:</label>
                    <input 
                      type="text" 
                      value={editingHex.title} 
                      onChange={e => {
                        const updated = { ...editingHex, title: e.target.value };
                        setEditingHex(updated);
                        updateHexInGlobalConfig(updated);
                      }}
                      className="inspector-input"
                    />
                  </div>

                  <div className="inspector-form-group">
                    <label className="inspector-label">Aura Neón Hover (Brillo):</label>
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

                    {!AURAS.find(a => a.value === editingHex.glowColor) && (
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
                        style={{ marginTop: '6px' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: CAPA 1 FONDO */}
              {activeInspectorTab === 'l1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div className="inspector-form-group">
                    <label className="inspector-label">Imágenes Prediseñadas de Fondo:</label>
                    <div className="predesigned-grid">
                      {PREDESIGNED_BACKGROUNDS.map(bg => (
                        <button
                          key={bg.id}
                          type="button"
                          className={`predesigned-btn ${editingHex.layerBg.value === bg.url ? 'active' : ''}`}
                          onClick={() => {
                            const updated = { ...editingHex, layerBg: { type: 'image' as const, value: bg.url } };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="inspector-form-group">
                    <label className="inspector-label">Biomas Neón (Degradados):</label>
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
                      <option value="custom">-- Seleccionar Bioma --</option>
                      {BIOMES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="inspector-form-group">
                    <label className="inspector-label">Modo / URL de Fondo:</label>
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

                  <label className="upload-btn-label">
                    {uploadingLayer === 'layerBg' ? '⏳ Comprimiendo & Subiendo...' : '📤 Subir Imagen Fondo (Compresor WebP Auto)'}
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleUpload(e, 'layerBg')} 
                      disabled={uploadingLayer === 'layerBg'} 
                    />
                  </label>

                  {uploadingLayer === 'layerBg' && uploadStatusMsg && (
                    <div className="upload-status-chip">{uploadStatusMsg}</div>
                  )}

                  {editingHex.layerBg.type === 'color' && (
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => setShowGradientBuilder(true)}
                    >
                      🎨 Creador Visual de Degradados
                    </button>
                  )}

                </div>
              )}

              {/* PESTAÑA 3: CAPA 2 DECORATIVA */}
              {activeInspectorTab === 'l2' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="inspector-form-group">
                    <label className="inspector-label">Modo de Capa Decorativa:</label>
                    <select 
                      value={editingHex.layerDeco.type} 
                      onChange={e => {
                        const updated = { ...editingHex, layerDeco: { ...editingHex.layerDeco, type: e.target.value as any } };
                        setEditingHex(updated);
                        updateHexInGlobalConfig(updated);
                      }}
                      className="inspector-select"
                    >
                      <option value="none">Ninguno</option>
                      <option value="image">Imagen Decorativa (URL / Subir)</option>
                      <option value="icon">Ícono / Emoji</option>
                    </select>
                  </div>

                  {editingHex.layerDeco.type !== 'none' && (
                    <>
                      <div className="inspector-form-group">
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

                      {editingHex.layerDeco.type === 'image' && (
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
                      )}

                      {uploadingLayer === 'layerDeco' && uploadStatusMsg && (
                        <div className="upload-status-chip">{uploadStatusMsg}</div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* PESTAÑA 4: CAPA 3 INTERACTIVA & ACCIÓN */}
              {activeInspectorTab === 'l3' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="inspector-form-group">
                    <label className="inspector-label">Modo Interactivo:</label>
                    <select 
                      value={editingHex.layerInteractive.type} 
                      onChange={e => {
                        const updated = { ...editingHex, layerInteractive: { ...editingHex.layerInteractive, type: e.target.value as any } };
                        setEditingHex(updated);
                        updateHexInGlobalConfig(updated);
                      }}
                      className="inspector-select"
                    >
                      <option value="none">Ninguno</option>
                      <option value="icon">Ícono / Emoji</option>
                      <option value="image">Imagen Interactiva (URL / Subir)</option>
                      <option value="text">Texto / Leyenda</option>
                    </select>
                  </div>

                  {editingHex.layerInteractive.type !== 'none' && (
                    <>
                      <div className="inspector-form-group">
                        <label className="inspector-label">Valor / Icono:</label>
                        <input 
                          type="text" 
                          value={editingHex.layerInteractive.value} 
                          onChange={e => {
                            const updated = { ...editingHex, layerInteractive: { ...editingHex.layerInteractive, value: e.target.value } };
                            setEditingHex(updated);
                            updateHexInGlobalConfig(updated);
                          }}
                          placeholder="Ej: 🌌, 🎭, 🎮 o URL..."
                          className="inspector-input"
                        />
                      </div>

                      {editingHex.layerInteractive.type === 'image' && (
                        <label className="upload-btn-label">
                          {uploadingLayer === 'layerInteractive' ? '⏳ Comprimiendo & Subiendo...' : '📤 Subir Imagen Interactiva (WebP Auto)'}
                          <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            onChange={(e) => handleUpload(e, 'layerInteractive')} 
                            disabled={uploadingLayer === 'layerInteractive'} 
                          />
                        </label>
                      )}

                      {editingHex.layerInteractive.type === 'icon' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowIconPicker(true)}
                        >
                          🔍 Explorar Catálogo de Íconos SVG
                        </button>
                      )}

                      {uploadingLayer === 'layerInteractive' && uploadStatusMsg && (
                        <div className="upload-status-chip">{uploadStatusMsg}</div>
                      )}
                    </>
                  )}

                  {/* Configuración de la Acción al Hacer Clic */}
                  <div className="inspector-form-group" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <label className="inspector-label">Acción al Hacer Clic:</label>
                    <select 
                      value={editingHex.action.type} 
                      onChange={e => {
                        const updated = { ...editingHex, action: { ...editingHex.action, type: e.target.value as any } };
                        setEditingHex(updated);
                        updateHexInGlobalConfig(updated);
                      }}
                      className="inspector-select"
                    >
                      <option value="none">Ninguna Acción</option>
                      <option value="navigate">Navegar a Ruta Interna</option>
                      <option value="external">Abrir Enlace Externo</option>
                      <option value="modal">Abrir Modal de Cuento Popol Vuh</option>
                    </select>

                    {editingHex.action.type !== 'none' && (
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
                        style={{ marginTop: '6px' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Botones de Guardar / Eliminar */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveHexagon}
                  style={{ flex: 1, fontWeight: 800 }}
                >
                  💾 Confirmar Cambios
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDeleteHexagon}
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  title="Eliminar celda del mapa"
                >
                  🗑️
                </button>
              </div>

            </>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🗺️</span>
              <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>Inspector Sutz Editor</h4>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Haz clic en cualquier hexágono de la cuadrícula interactiva para editar sus 3 capas de contenido e imágenes en tiempo real.
              </p>
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

      {/* Modal Catálogo de Íconos SVG */}
      {showIconPicker && editingHex && (
        <IconPickerModal 
          initialIcon={editingHex.layerInteractive.value}
          initialColor={editingHex.layerInteractive.color}
          initialSize={editingHex.layerInteractive.size}
          initialRotation={editingHex.layerInteractive.rotation}
          initialOffsetX={editingHex.layerInteractive.offsetX}
          initialOffsetY={editingHex.layerInteractive.offsetY}
          onApply={(icon, color, size, rotation, offsetX, offsetY) => {
            const updated = {
              ...editingHex,
              layerInteractive: { 
                ...editingHex.layerInteractive, 
                value: icon, 
                color: color,
                size: size,
                rotation: rotation,
                offsetX: offsetX,
                offsetY: offsetY
              }
            };
            setEditingHex(updated);
            updateHexInGlobalConfig(updated);
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}

    </div>
  );
}
