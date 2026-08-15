import { useRef, useState } from 'react';
import type { BookAccent, BookCategory, BookProduct, PortalConfig } from '../../types';
import { DEFAULT_BOOKS } from '../../data/books';
import { uploadImageToStorage } from '../../utils/imageUpload';

interface AdminTabTiendaProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateField: (section: string, field: string, value: unknown) => void;
}

const CATEGORY_LABELS: Record<BookCategory, string> = {
  primaria: 'Primaria',
  basico: 'Básico',
  diversificado: 'Diversificado',
  todos: 'Todos los grados'
};

const ACCENT_OPTIONS: { id: BookAccent; label: string; color: string }[] = [
  { id: 'yellow', label: 'Amarillo', color: '#ffe600' },
  { id: 'cyan', label: 'Cian', color: '#00e5ff' },
  { id: 'lilac', label: 'Lila', color: '#ff2ec4' }
];

const emptyDraft = (): BookProduct => ({
  id: `b-${Date.now()}`,
  title: '',
  tagline: '',
  accent: 'cyan',
  category: 'primaria',
  price: 15,
  description: '',
  gradeLevel: '',
  coverEmoji: '📖',
  available: true,
  featured: false,
  pos: { x: 50, y: 50 }
});

export default function AdminTabTienda({ localConfig, setLocalConfig, updateField }: AdminTabTiendaProps) {
  const tienda = localConfig.tiendaConfig || {
    announcement: "¡Nuevas publicaciones y guías pedagógicas disponibles para el ciclo escolar!",
    whatsappPhone: "50246741239"
  };

  const books = localConfig.libros && localConfig.libros.length > 0 ? localConfig.libros : DEFAULT_BOOKS;

  const [editing, setEditing] = useState<BookProduct | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ id: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commitBooks = (next: BookProduct[]) => {
    setLocalConfig(prev => (prev ? { ...prev, libros: next } : prev));
  };

  const handleChange = (field: string, value: string) => {
    updateField('tiendaConfig', field, value);
  };

  const openNew = () => {
    setEditing(emptyDraft());
    setShowEditor(true);
  };

  const openEdit = (book: BookProduct) => {
    setEditing({ ...book });
    setShowEditor(true);
  };

  const updateDraft = <K extends keyof BookProduct>(key: K, value: BookProduct[K]) => {
    setEditing(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateDraftPos = (axis: 'x' | 'y', value: number) => {
    setEditing(prev => (prev ? { ...prev, pos: { ...(prev.pos || { x: 50, y: 50 }), [axis]: value } } : prev));
  };

  const saveBook = () => {
    if (!editing) return;
    const exists = books.some(b => b.id === editing.id);
    const next = exists ? books.map(b => (b.id === editing.id ? editing : b)) : [...books, editing];
    commitBooks(next);
    setShowEditor(false);
    setEditing(null);
  };

  const deleteBook = (id: string) => {
    if (!window.confirm('¿Eliminar este cuento de la tienda?')) return;
    commitBooks(books.filter(b => b.id !== id));
  };

  const moveBook = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= books.length) return;
    const next = [...books];
    [next[index], next[target]] = [next[target], next[index]];
    commitBooks(next);
  };

  const toggleBook = (id: string, key: 'available' | 'featured') => {
    commitBooks(books.map(b => (b.id === id ? { ...b, [key]: !b[key] } : b)));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor(bookId);
    setUploadStatus({ id: bookId, message: '⚡ Comprimiendo imagen a WebP liviano...' });
    try {
      const originalMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadStatus({ id: bookId, message: `🚀 Subiendo portada (${originalMB}MB)...` });
      const url = await uploadImageToStorage(file, 'libros-assets');
      commitBooks(books.map(b => (b.id === bookId ? { ...b, image: url } : b)));
      setUploadStatus({ id: bookId, message: '✨ ¡Portada guardada!' });
    } catch (err) {
      console.error('Error subiendo portada:', err);
      alert('Error al comprimir o subir la imagen.');
    } finally {
      setUploadingFor(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div className="admin-nested-header">
        <span className="admin-nested-icon">📚</span>
        <div>
          <h3>Tienda de Cuentos</h3>
          <p className="tab-section-desc">Gestiona los cuentos de la tienda: portadas con imagen, descripciones, precios y filtros por etapa educativa.</p>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Banner de Anuncio del Catálogo</h4>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Mensaje de Anuncio / Novedades</label>
            <textarea
              rows={2}
              value={tienda.announcement || ''}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="Escribe el mensaje destacado para los clientes en el catálogo..."
            />
          </div>
        </div>

        <div className="admin-form-row two-cols">
          <div className="admin-form-group">
            <label>Teléfono de WhatsApp para Pedidos (Código de país sin +)</label>
            <input
              type="text"
              value={tienda.whatsappPhone || ''}
              onChange={(e) => handleChange('whatsappPhone', e.target.value)}
              placeholder="Ejemplo: 50246741239"
            />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0 }}>Cuentos de la Tienda ({books.length})</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { if (window.confirm('¿Restaurar la colección inicial de 6 cuentos? Se descartan los cambios no guardados de esta lista.')) commitBooks(DEFAULT_BOOKS); }}>
              ♻️ Restaurar colección inicial
            </button>
            <button className="btn btn-primary btn-sm" onClick={openNew}>
              ＋ Añadir Cuento
            </button>
          </div>
        </div>

        <div className="admin-books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {books.map((book, idx) => (
            <div key={book.id} className="admin-book-card card-glass" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  className="admin-book-cover"
                  style={{
                    width: '64px',
                    height: '84px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${book.accent === 'yellow' ? '#ffe600' : book.accent === 'cyan' ? '#00e5ff' : '#ff2ec4'} 35%, #0b1020) 0%, #0b1020 100%)`,
                    border: `1px solid color-mix(in srgb, ${book.accent === 'yellow' ? '#ffe600' : book.accent === 'cyan' ? '#00e5ff' : '#ff2ec4'} 50%, transparent)`,
                    overflow: 'hidden'
                  }}
                >
                  {book.image ? (
                    <img src={book.image} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{book.coverEmoji || '📖'}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{book.title || 'Sin título'}</strong>
                    {book.featured && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>★</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{book.tagline} · ${book.price?.toFixed(2)}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{CATEGORY_LABELS[book.category]}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn btn-glass btn-sm" onClick={() => openEdit(book)}>✏️ Editar</button>
                <button className="btn btn-glass btn-sm" onClick={() => toggleBook(book.id, 'featured')} title="Destacado">
                  {book.featured ? '⭐ Destacado' : '☆ Destacar'}
                </button>
                <button className="btn btn-glass btn-sm" onClick={() => toggleBook(book.id, 'available')} title="Disponible">
                  {book.available ? '✅ Disponible' : '⛔ Agotado'}
                </button>
                <button className="btn btn-glass btn-sm" onClick={() => moveBook(idx, -1)} disabled={idx === 0}>▲</button>
                <button className="btn btn-glass btn-sm" onClick={() => moveBook(idx, 1)} disabled={idx === books.length - 1}>▼</button>
                <button className="btn btn-glass btn-sm" style={{ color: '#f87171' }} onClick={() => deleteBook(book.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor de Cuento */}
      {showEditor && editing && (
        <div className="admin-form-section card-glass" style={{ marginTop: '18px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0 }}>{books.some(b => b.id === editing.id) ? '✏️ Editar Cuento' : '＋ Nuevo Cuento'}</h4>
            <button className="btn btn-glass btn-sm" onClick={() => { setShowEditor(false); setEditing(null); }}>✕ Cerrar</button>
          </div>

          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Título del Cuento</label>
              <input type="text" value={editing.title} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Ej: El Código del Maíz" />
            </div>
            <div className="admin-form-group">
              <label>Tagline / Subtítulo</label>
              <input type="text" value={editing.tagline} onChange={(e) => updateDraft('tagline', e.target.value)} placeholder="Ej: Origen y Sustento" />
            </div>
          </div>

          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Acento de Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {ACCENT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className="btn btn-sm"
                    onClick={() => updateDraft('accent', opt.id)}
                    style={{
                      border: `1px solid ${opt.color}`,
                      color: opt.color,
                      background: editing.accent === opt.id ? `${opt.color}22` : 'transparent',
                      boxShadow: editing.accent === opt.id ? `0 0 12px ${opt.color}55` : 'none'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-form-group">
              <label>Categoría / Etapa Educativa</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(Object.keys(CATEGORY_LABELS) as BookCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className="btn btn-sm"
                    onClick={() => updateDraft('category', cat)}
                    style={{
                      border: `1px solid ${editing.category === cat ? '#38bdf8' : 'rgba(255,255,255,0.2)'}`,
                      color: editing.category === cat ? '#38bdf8' : '#cbd5e1',
                      background: editing.category === cat ? 'rgba(56,189,248,0.12)' : 'transparent'
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Grado / Nivel (texto)</label>
              <input type="text" value={editing.gradeLevel} onChange={(e) => updateDraft('gradeLevel', e.target.value)} placeholder="Ej: 4to a 6to Primaria" />
            </div>
            <div className="admin-form-group">
              <label>Precio (USD)</label>
              <input type="number" min="0" step="0.01" value={editing.price} onChange={(e) => updateDraft('price', Number(e.target.value))} />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Descripción</label>
              <textarea rows={3} value={editing.description} onChange={(e) => updateDraft('description', e.target.value)} placeholder="Descripción del cuento para la tienda..." />
            </div>
          </div>

          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Badge / Etiqueta (opcional)</label>
              <input type="text" value={editing.badge || ''} onChange={(e) => updateDraft('badge', e.target.value)} placeholder="Ej: Nuevo, Best Seller, Clásico" />
            </div>
            <div className="admin-form-group">
              <label>Emoji de Portada (respaldo)</label>
              <input type="text" value={editing.coverEmoji || ''} onChange={(e) => updateDraft('coverEmoji', e.target.value)} placeholder="📖" />
            </div>
          </div>

          <div className="admin-form-row two-cols">
            <div className="admin-form-group">
              <label>Portada (Imagen del Producto)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '72px',
                    height: '96px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    overflow: 'hidden'
                  }}
                >
                  {editing.image ? (
                    <img src={editing.image} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{editing.coverEmoji || '📖'}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    {uploadingFor === editing.id ? 'Subiendo...' : '📤 Subir Imagen'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={uploadingFor === editing.id}
                      onChange={(e) => handleUpload(e, editing.id)}
                    />
                  </label>
                  {editing.image && (
                    <button className="btn btn-glass btn-sm" onClick={() => updateDraft('image', undefined)}>🗑 Quitar imagen</button>
                  )}
                  {uploadStatus?.id === editing.id && (
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{uploadStatus.message}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="admin-form-group">
              <label>Estado</label>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="checkbox" checked={!!editing.available} onChange={(e) => updateDraft('available', e.target.checked)} />
                  Disponible
                </label>
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => updateDraft('featured', e.target.checked)} />
                  Destacado
                </label>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  Posición X
                  <input type="number" min="0" max="100" value={editing.pos?.x ?? 50} onChange={(e) => updateDraftPos('x', Number(e.target.value))} style={{ width: '60px' }} />
                </label>
                <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  Y
                  <input type="number" min="0" max="100" value={editing.pos?.y ?? 50} onChange={(e) => updateDraftPos('y', Number(e.target.value))} style={{ width: '60px' }} />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn btn-glass" onClick={() => { setShowEditor(false); setEditing(null); }}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveBook} disabled={!editing.title.trim()}>💾 Guardar Cuento</button>
          </div>
        </div>
      )}

      <div className="admin-form-section">
        <h4>Vínculos Rápidos de Comercialización</h4>
        <div className="admin-quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
          <a
            href="/nuestros-libros"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            🛍️ Ver Tienda de Cuentos Pública ↗
          </a>
        </div>
      </div>
    </div>
  );
}
