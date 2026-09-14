import React, { useState, useEffect, useRef } from 'react';
import { 
  subscribeCustomIcons, 
  uploadCustomIcon, 
  deleteCustomIcon, 
  SUTZ_ICON_CATEGORIES, 
  type SutzCustomIcon, 
  type SutzIconCategory 
} from '../../services/sutzIconService';
import { ICON_CATEGORIES, EMOJI_CATEGORIES, IconRenderer } from './IconRegistry';
import './SutzIconPickerModal.css';

interface SutzIconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (value: string, isCustomUrl: boolean) => void;
  currentValue?: string;
}

export const SutzIconPickerModal: React.FC<SutzIconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  currentValue = ''
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'svg' | 'emojis'>('library');
  const [customIcons, setCustomIcons] = useState<SutzCustomIcon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de subida
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<SutzIconCategory>('personalizado');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [applyImmediately, setApplyImmediately] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escucha en tiempo real de la colección sutz_hex_icons
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeCustomIcons((icons) => {
      setCustomIcons(icons);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadError(null);
    if (!uploadName) {
      setUploadName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Por favor selecciona una imagen (PNG, SVG o WebP).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const newIcon = await uploadCustomIcon(uploadFile, uploadName, uploadCategory);

      // Si el usuario marcó aplicar inmediatamente al hexágono actual
      if (applyImmediately) {
        onSelectIcon(newIcon.url, true);
        onClose();
        return;
      }

      // Limpiar formulario y cambiar a la pestaña de biblioteca
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName('');
      setActiveTab('library');
    } catch (err: any) {
      console.error('Error al subir icono:', err);
      setUploadError(err?.message || 'Error al procesar la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteIcon = async (e: React.MouseEvent, icon: SutzCustomIcon) => {
    e.stopPropagation();
    if (!window.confirm(`¿Seguro que deseas eliminar el icono "${icon.name}" de la colección?`)) {
      return;
    }
    try {
      await deleteCustomIcon(icon.id, icon.url);
    } catch (err) {
      console.error('Error al eliminar icono:', err);
      alert('No se pudo eliminar el icono.');
    }
  };

  const filteredIcons = customIcons.filter((icon) => {
    const matchesCategory = selectedCategory === 'todos' || icon.category === selectedCategory;
    const matchesSearch = !searchTerm || icon.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="sutz-icon-modal-backdrop" onClick={onClose}>
      <div className="sutz-icon-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="sutz-icon-modal-header">
          <h3>
            <span>💠</span> Catálogo y Gestor de Íconos de Sutz
          </h3>
          <button className="sutz-icon-modal-close-btn" onClick={onClose} title="Cerrar ventana">
            ✕
          </button>
        </div>

        {/* Pestañas */}
        <div className="sutz-icon-modal-tabs">
          <button
            type="button"
            className={`sutz-icon-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <span>📁</span> Biblioteca Personalizada ({customIcons.length})
          </button>
          <button
            type="button"
            className={`sutz-icon-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span>📤</span> Subir Ícono Propio
          </button>
          <button
            type="button"
            className={`sutz-icon-tab-btn ${activeTab === 'svg' ? 'active' : ''}`}
            onClick={() => setActiveTab('svg')}
          >
            <span>⚡</span> Íconos SVG Clásicos
          </button>
          <button
            type="button"
            className={`sutz-icon-tab-btn ${activeTab === 'emojis' ? 'active' : ''}`}
            onClick={() => setActiveTab('emojis')}
          >
            <span>✨</span> Emojis Nativos
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="sutz-icon-modal-body">
          {/* TAB 1: BIBLIOTECA DE ICONOS SUBIDOS */}
          {activeTab === 'library' && (
            <div>
              {/* Barra de Filtros y Búsqueda */}
              <div className="sutz-icon-filters-bar">
                <div className="sutz-icon-categories-chips">
                  <button
                    type="button"
                    className={`sutz-icon-chip ${selectedCategory === 'todos' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('todos')}
                  >
                    Todos ({customIcons.length})
                  </button>
                  {SUTZ_ICON_CATEGORIES.map((cat) => {
                    const count = customIcons.filter((i) => i.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`sutz-icon-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.icon} {cat.label} ({count})
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  className="sutz-icon-search-input"
                  placeholder="🔍 Buscar icono por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Cuadrícula de Iconos */}
              {filteredIcons.length > 0 ? (
                <div className="sutz-custom-icons-grid">
                  {filteredIcons.map((icon) => {
                    const isSelected = currentValue === icon.url;
                    return (
                      <div
                        key={icon.id}
                        className={`sutz-custom-icon-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onSelectIcon(icon.url, true);
                          onClose();
                        }}
                        title={`Seleccionar ${icon.name}`}
                      >
                        <button
                          type="button"
                          className="sutz-custom-icon-delete-btn"
                          title="Eliminar de la biblioteca"
                          onClick={(e) => handleDeleteIcon(e, icon)}
                        >
                          🗑️
                        </button>
                        <div className="sutz-custom-icon-img-box">
                          <img src={icon.url} alt={icon.name} loading="lazy" />
                        </div>
                        <span className="sutz-custom-icon-name">{icon.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sutz-empty-state">
                  <span className="sutz-empty-state-icon">📭</span>
                  <h4>No se encontraron iconos personalizados</h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    {customIcons.length === 0
                      ? 'Aún no has subido iconos propios a la base de datos.'
                      : 'No hay iconos que coincidan con la categoría o búsqueda.'}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                    onClick={() => setActiveTab('upload')}
                  >
                    📤 Subir el primer ícono
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBIR ICONO PROPIO */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="sutz-upload-icon-panel">
              {/* Columna Izquierda: Vista Previa dentro de un hexágono */}
              <div className="sutz-upload-preview-col">
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px' }}>
                  Vista previa en hexágono:
                </span>
                <div className="sutz-hex-preview-disc">
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="Previsualización" />
                  ) : (
                    <span style={{ fontSize: '2rem', opacity: 0.4 }}>💠</span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : 'Fondo transparente recomendado'}
                </span>
              </div>

              {/* Columna Derecha: Campos del Formulario */}
              <div className="sutz-upload-fields-col">
                <div className="sutz-form-group">
                  <label className="sutz-form-label">Archivo de Imagen (SVG, PNG, WebP o JPG):</label>
                  <div
                    className="sutz-file-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      accept=".svg,image/svg+xml,image/png,image/webp,image/jpeg"
                      onChange={handleFileChange}
                    />
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>
                      📁
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>
                      {uploadFile ? uploadFile.name : 'Haz clic para seleccionar o arrastra un archivo'}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Se convertirá y optimizará automáticamente en la nube.
                    </div>
                  </div>
                </div>

                <div className="sutz-form-group">
                  <label className="sutz-form-label">Nombre del Ícono:</label>
                  <input
                    type="text"
                    className="sutz-form-input"
                    placeholder="Ej: Sol Maya, Glifo del Tiempo, Libro Dorado..."
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    required
                  />
                </div>

                <div className="sutz-form-group">
                  <label className="sutz-form-label">Colección / Categoría:</label>
                  <select
                    className="sutz-form-select"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as SutzIconCategory)}
                  >
                    {SUTZ_ICON_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="applyImmediatelyCheckbox"
                    checked={applyImmediately}
                    onChange={(e) => setApplyImmediately(e.target.checked)}
                    style={{ accentColor: '#f59e0b', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label
                    htmlFor="applyImmediatelyCheckbox"
                    style={{ fontSize: '0.84rem', color: '#cbd5e1', cursor: 'pointer' }}
                  >
                    Asignar directamente a este hexágono al terminar la subida
                  </label>
                </div>

                {uploadError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                <button
                  type="submit"
                  className="sutz-upload-btn-submit"
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? '⏳ Subiendo y registrando...' : '🚀 Guardar en la Base de Datos'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ICONOS SVG CLÁSICOS */}
          {activeTab === 'svg' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {ICON_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    {cat.name}
                  </h4>
                  <div className="sutz-preset-icons-grid">
                    {cat.icons.map((iconName) => {
                      const isSelected = currentValue === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          className={`sutz-preset-icon-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            onSelectIcon(iconName, false);
                            onClose();
                          }}
                          title={iconName}
                        >
                          <IconRenderer iconName={iconName} size="1.45rem" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EMOJIS NATIVOS */}
          {activeTab === 'emojis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    {cat.name}
                  </h4>
                  <div className="sutz-preset-icons-grid">
                    {cat.icons.map((emoji) => {
                      const isSelected = currentValue === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          className={`sutz-preset-icon-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            onSelectIcon(emoji, false);
                            onClose();
                          }}
                          title={emoji}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
