import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import type { PortalConfig, CustomHexagon, HexLayer } from '../../types';
import { DEFAULT_CONFIG } from '../../context/PortalConfigContext';
import { getCandidateHexes } from '../../utils/hexUtils';
import { HexagonGrid } from '../map/HexagonGrid';
import GradientBuilder from './GradientBuilder';
import IconPickerModal from './IconPickerModal';

const BIOMES = [
  { id: 'bosque', name: '🌲 Bosque Verde', value: 'linear-gradient(135deg, #2b580c, #4a7c16)' },
  { id: 'agua', name: '💧 Océano Profundo', value: 'linear-gradient(135deg, #001f3f, #004b87)' },
  { id: 'desierto', name: '🏜️ Desierto Arena', value: 'linear-gradient(135deg, #c2b280, #e6d690)' },
  { id: 'nieve', name: '❄️ Montaña Helada', value: 'linear-gradient(135deg, #e0eaf5, #a5b9ce)' },
  { id: 'volcan', name: '🌋 Tierra Volcánica', value: 'linear-gradient(135deg, #8b5a2b, #4a2511)' },
  { id: 'galaxia', name: '🌌 Vacío Estelar', value: 'radial-gradient(circle at 50% 50%, #6441A5 0%, #2a0845 100%)' },
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

export default function AdminTabMundoVirtual({ localConfig, setLocalConfig }: AdminTabMundoVirtualProps) {
  const [editingHex, setEditingHex] = useState<CustomHexagon | null>(null);
  const [uploadingLayer, setUploadingLayer] = useState<'layerBg' | 'layerDeco' | 'layerInteractive' | null>(null);
  const [showGradientBuilder, setShowGradientBuilder] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, layerKey: 'layerBg' | 'layerDeco' | 'layerInteractive') => {
    const file = e.target.files?.[0];
    if (!file || !editingHex) return;
    
    setUploadingLayer(layerKey);
    try {
      const fileRef = ref(storage, `map-assets/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditingHex({
        ...editingHex,
        [layerKey]: { ...editingHex[layerKey], value: url }
      });
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("Error al subir el archivo.");
    } finally {
      setUploadingLayer(null);
    }
  };

  const mapData = localConfig?.map || [];
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
    // Si es un hex existente, editar. Si es "Añadir nuevo", crear default.
    if (hex.id.startsWith('preview-')) {
      setEditingHex({
        id: `${hex.row},${hex.col}`,
        row: hex.row,
        col: hex.col,
        title: 'Nuevo Hexágono',
        glowColor: 'rgba(255,255,255,0.8)',
        layerBg: emptyLayer(),
        layerDeco: emptyLayer(),
        layerInteractive: { type: 'icon', value: '❓' },
        action: { type: 'none', target: '' }
      });
    } else {
      setEditingHex({ ...hex });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveHex = () => {
    if (!editingHex) return;
    
    setLocalConfig(prev => {
      if (!prev) return prev;
      const currentMap = prev.map || [];
      const existingIndex = currentMap.findIndex(h => h.id === editingHex.id);
      
      let newMap = [...currentMap];
      if (existingIndex >= 0) {
        newMap[existingIndex] = editingHex;
      } else {
        newMap.push(editingHex);
      }
      return { ...prev, map: newMap };
    });
    setEditingHex(null);
  };

  const deleteHex = () => {
    if (!editingHex) return;
    if (!window.confirm('¿Seguro que deseas eliminar este hexágono del mapa?')) return;
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        map: (prev.map || []).filter(h => h.id !== editingHex.id)
      };
    });
    setEditingHex(null);
  };

  const handleResetMapToDefault = () => {
    if (window.confirm('¿Deseas restablecer el mapa del Mundo Virtual al diseño predeterminado sincronizado con todas las secciones actuales del portal (Creatika, 100tek, Juegos, etc.)?')) {
      setLocalConfig(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          map: DEFAULT_CONFIG.map
        };
      });
      setEditingHex(null);
    }
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>🌍 Editor de Mundo Virtual</h3>
        <button className="btn btn-secondary btn-sm" onClick={handleResetMapToDefault} title="Sincroniza el mapa con todas las páginas activas del portal">
          🔄 Sincronizar Mapa con Páginas Actuales
        </button>
      </div>
      <p className="tab-section-desc">Configura los hexágonos interactivos del mapa principal. El mapa se expande basado en un sistema de coordenadas (Fila, Columna).</p>

      <div style={{ height: '500px', border: '2px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
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

      {!editingHex && (
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-title)' }}>
          Haz clic en cualquier hexágono del mapa interactivo de arriba para editarlo o añadir uno nuevo.
        </p>
      )}

      {editingHex && (
        <div className="admin-form-section" style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px' }}>
          <h4>Editar Hexágono ({editingHex.row}, {editingHex.col})</h4>
          
          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Título (Accesibilidad)</label>
              <input type="text" value={editingHex.title} onChange={e => setEditingHex({...editingHex, title: e.target.value})} />
            </div>
            <div className="admin-form-group">
              <label>Tipo de Aura (Brillo Hover)</label>
              <select 
                value={AURAS.find(a => a.value === editingHex.glowColor)?.value || 'custom'} 
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    setEditingHex({...editingHex, glowColor: e.target.value});
                  } else {
                    setEditingHex({...editingHex, glowColor: ''});
                  }
                }}
              >
                <option value="custom">-- Aura Personalizada --</option>
                {AURAS.map(aura => (
                  <option key={aura.id} value={aura.value}>{aura.name}</option>
                ))}
              </select>
              {!AURAS.find(a => a.value === editingHex.glowColor) && (
                <input 
                  type="text" 
                  value={editingHex.glowColor} 
                  onChange={e => setEditingHex({...editingHex, glowColor: e.target.value})} 
                  placeholder="Ej. rgba(255, 100, 100, 0.8)" 
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
            {/* CAPA 1 */}
            <div className="admin-form-group" style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Capa 1: Fondo</label>
              
              <select 
                value={BIOMES.find(b => b.value === editingHex.layerBg.value)?.id || 'custom'} 
                onChange={e => {
                  if (e.target.value !== 'custom') {
                    const biome = BIOMES.find(b => b.id === e.target.value);
                    if (biome) {
                      setEditingHex({...editingHex, layerBg: { type: 'color', value: biome.value }});
                    }
                  } else {
                    setEditingHex({...editingHex, layerBg: { ...editingHex.layerBg, type: 'none' }});
                  }
                }}
                style={{ marginBottom: '8px' }}
              >
                <option value="custom">-- Personalizado / Sin Bioma --</option>
                {BIOMES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select value={editingHex.layerBg.type} onChange={e => setEditingHex({...editingHex, layerBg: {...editingHex.layerBg, type: e.target.value as any}})}>
                <option value="none">Ninguno</option>
                <option value="color">Color / Degradado</option>
                <option value="image">Imagen (URL)</option>
              </select>
              {editingHex.layerBg.type !== 'none' && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Valor (CSS o URL)" value={editingHex.layerBg.value} onChange={e => setEditingHex({...editingHex, layerBg: {...editingHex.layerBg, value: e.target.value}})} />
                  {editingHex.layerBg.type === 'image' && (
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}>
                      {uploadingLayer === 'layerBg' ? '⏳ Subiendo...' : '📁 Subir Imagen a Firebase'}
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUpload(e, 'layerBg')} disabled={uploadingLayer === 'layerBg'} />
                    </label>
                  )}
                  {editingHex.layerBg.type === 'color' && (
                    <div style={{ marginTop: '5px' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setShowGradientBuilder(!showGradientBuilder)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        🎨 Creador Visual de Degradados
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal de Degradado */}
            {showGradientBuilder && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GradientBuilder 
                  onApply={(css) => {
                    setEditingHex({...editingHex, layerBg: { type: 'color', value: css }});
                    setShowGradientBuilder(false);
                  }}
                  onClose={() => setShowGradientBuilder(false)}
                />
              </div>
            )}

            {/* CAPA 2 */}
            <div className="admin-form-group" style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Capa 2: Decorativa</label>
              <select value={editingHex.layerDeco.type} onChange={e => setEditingHex({...editingHex, layerDeco: {...editingHex.layerDeco, type: e.target.value as any}})}>
                <option value="none">Ninguno</option>
                <option value="image">Imagen (URL)</option>
                <option value="icon">Ícono/Emoji</option>
              </select>
              {editingHex.layerDeco.type !== 'none' && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Valor" value={editingHex.layerDeco.value} onChange={e => setEditingHex({...editingHex, layerDeco: {...editingHex.layerDeco, value: e.target.value}})} />
                  {editingHex.layerDeco.type === 'image' && (
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}>
                      {uploadingLayer === 'layerDeco' ? '⏳ Subiendo...' : '📁 Subir Imagen a Firebase'}
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUpload(e, 'layerDeco')} disabled={uploadingLayer === 'layerDeco'} />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* CAPA 3 */}
            <div className="admin-form-group" style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Capa 3: Interactiva (Link)</label>
              <select value={editingHex.layerInteractive.type} onChange={e => setEditingHex({...editingHex, layerInteractive: {...editingHex.layerInteractive, type: e.target.value as any}})}>
                <option value="none">Ninguno</option>
                <option value="icon">Ícono/Emoji</option>
                <option value="image">Imagen (URL)</option>
                <option value="text">Texto</option>
              </select>
              {editingHex.layerInteractive.type !== 'none' && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Valor" value={editingHex.layerInteractive.value} onChange={e => setEditingHex({...editingHex, layerInteractive: {...editingHex.layerInteractive, value: e.target.value}})} />
                  {editingHex.layerInteractive.type === 'image' && (
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}>
                      {uploadingLayer === 'layerInteractive' ? '⏳ Subiendo...' : '📁 Subir Imagen a Firebase'}
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleUpload(e, 'layerInteractive')} disabled={uploadingLayer === 'layerInteractive'} />
                    </label>
                  )}
                  {editingHex.layerInteractive.type === 'icon' && (
                    <div style={{ marginTop: '5px' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setShowIconPicker(true)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        🔍 Explorar Catálogo de Íconos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal de Íconos */}
            {showIconPicker && (
              <IconPickerModal 
                initialIcon={editingHex.layerInteractive.value}
                initialColor={editingHex.layerInteractive.color}
                initialSize={editingHex.layerInteractive.size}
                initialRotation={editingHex.layerInteractive.rotation}
                initialOffsetX={editingHex.layerInteractive.offsetX}
                initialOffsetY={editingHex.layerInteractive.offsetY}
                onApply={(icon, color, size, rotation, offsetX, offsetY) => {
                  setEditingHex({...editingHex, layerInteractive: { 
                    ...editingHex.layerInteractive, 
                    value: icon, 
                    color: color,
                    size: size,
                    rotation: rotation,
                    offsetX: offsetX,
                    offsetY: offsetY
                  }});
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
              />
            )}
          </div>

          <div className="admin-form-section" style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Acción al hacer clic</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={editingHex.action.type} onChange={e => setEditingHex({...editingHex, action: {...editingHex.action, type: e.target.value as any}})} style={{ flex: 1 }}>
                <option value="none">Ninguna Acción</option>
                <option value="navigate">Navegar a Ruta Interna</option>
                <option value="external">Abrir Enlace Externo</option>
                <option value="modal">Abrir Modal de Cuento</option>
              </select>
              {editingHex.action.type !== 'none' && (
                <input type="text" placeholder="Destino (Ej. /catalogo o story-camazotz)" value={editingHex.action.target} onChange={e => setEditingHex({...editingHex, action: {...editingHex.action, target: e.target.value}})} style={{ flex: 2 }} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={saveHex}>💾 Guardar Hexágono</button>
            <button className="btn btn-secondary" onClick={() => setEditingHex(null)}>Cancelar</button>
            <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={deleteHex}>🗑️ Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}
