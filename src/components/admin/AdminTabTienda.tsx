import { useState, useRef, useMemo } from 'react';
import type { PortalConfig } from '../../types';
import { 
  DEFAULT_MERCADO_PRODUCTS, 
  MERCADO_CATEGORIES, 
  type MercadoProduct 
} from '../../data/mercadoData';
import { uploadImageToStorage } from '../../utils/imageUpload';
import { soundEffects } from '../../utils/soundEffects';
import './AdminTabTienda.css';

interface AdminTabTiendaProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateField?: (section: string, field: string, value: unknown) => void;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
}

const POPULAR_EMOJIS = [
  '📚', '📖', '🎲', '♟️', '🎭', '🎴', '🃏', '🚀', 
  '🔬', '🎨', '🖍️', '🌽', '🧭', '🧪', '🧬', '⚡', 
  '🪐', '👑', '🦖', '🎒', '🧩', '📝', '✂️', '🏺'
];

const BADGE_PRESETS = [
  'MÁS VENDIDO',
  'OFERTA RELÁMPAGO',
  'EXCLUSIVO EDITORIAL',
  'RECOMENDADO DOCENTE',
  'TENDENCIA',
  'NUEVO LANZAMIENTO',
  'EDICIÓN LIMITADA'
];

const createEmptyProduct = (): MercadoProduct => ({
  id: `prod-${Date.now()}`,
  title: '',
  category: 'cuentos',
  categoryLabel: 'Cuentos y Libros',
  price: 50.00,
  originalPrice: 65.00,
  currency: 'Q',
  rating: 5.0,
  reviewsCount: 1,
  soldCount: 10,
  deliveryTime: 'Entrega 24-48 hrs en toda Guatemala',
  badge: 'NUEVO LANZAMIENTO',
  icon: '📚',
  gradeOrAge: 'Primaria & Básicos',
  author: 'Editorial Lluvia de Ideas',
  pages: 64,
  formatType: 'Kindle eBook & Tapa Dura',
  coverTheme: 'amber',
  description: '',
  longDescription: '',
  features: [
    'Material pedagógico certificado',
    'Integración curricular para el aula'
  ],
  contents: [
    '1 Set completo con guía de uso'
  ],
  featured: true,
  inStock: true
});

export default function AdminTabTienda({ localConfig, setLocalConfig, onSave, saving }: AdminTabTiendaProps) {
  // Productos activos
  const products: MercadoProduct[] = useMemo(() => {
    if (localConfig.mercadoProducts && Array.isArray(localConfig.mercadoProducts) && localConfig.mercadoProducts.length > 0) {
      return localConfig.mercadoProducts as MercadoProduct[];
    }
    return DEFAULT_MERCADO_PRODUCTS;
  }, [localConfig.mercadoProducts]);

  // Configuración del Mercado
  const mercadoConfig = localConfig.mercadoConfig || {
    announcement: "Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes",
    whatsappPhone: "50246741239",
    bannerTitle: "Mercado Educativo & Creativo",
    bannerSubtitle: "Materiales didácticos, cuentos y proyectos pedagógicos directos de la editorial",
    showPromoStrip: true
  };

  // Estados de interfaz
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<MercadoProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Actualizar lista en localConfig
  const commitProducts = (nextProducts: MercadoProduct[]) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoProducts: nextProducts
      };
    });
  };

  // Actualizar mercadoConfig
  const updateMercadoConfig = (field: string, value: unknown) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoConfig: {
          ...(prev.mercadoConfig || {}),
          [field]: value
        }
      };
    });
  };

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'todos') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.gradeOrAge.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, selectedCategory, searchTerm]);

  // Abrir modal de nuevo producto
  const handleOpenNew = () => {
    soundEffects.playClick();
    setEditingProduct(createEmptyProduct());
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (product: MercadoProduct) => {
    soundEffects.playClick();
    setEditingProduct({ 
      ...product,
      features: [...(product.features || [])],
      contents: [...(product.contents || [])]
    });
    setIsModalOpen(true);
  };

  // Guardar producto desde modal
  const handleSaveProduct = () => {
    if (!editingProduct) return;
    if (!editingProduct.title.trim()) {
      alert('Por favor, ingresa al menos un título para el producto.');
      return;
    }

    soundEffects.playClick();
    const exists = products.some(p => p.id === editingProduct.id);
    const next = exists 
      ? products.map(p => p.id === editingProduct.id ? editingProduct : p)
      : [editingProduct, ...products];

    commitProducts(next);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Duplicar producto
  const handleDuplicateProduct = (product: MercadoProduct) => {
    soundEffects.playClick();
    const copy: MercadoProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Copia)`,
      features: [...(product.features || [])],
      contents: [...(product.contents || [])]
    };
    commitProducts([copy, ...products]);
  };

  // Eliminar producto
  const handleDeleteProduct = (productId: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${title}" del catálogo?`)) {
      soundEffects.playClick();
      commitProducts(products.filter(p => p.id !== productId));
    }
  };

  // Reordenar producto de forma segura buscando el id en el catálogo maestro
  const handleMoveProduct = (productId: string, direction: -1 | 1) => {
    soundEffects.playClick();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= products.length) return;
    const next = [...products];
    [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
    commitProducts(next);
  };

  // Restaurar catálogo base
  const handleRestoreDefault = () => {
    if (window.confirm('¿Deseas restaurar la colección oficial inicial de 18 productos del Mercado? Se reemplazarán los cambios actuales no guardados.')) {
      soundEffects.playClick();
      commitProducts(DEFAULT_MERCADO_PRODUCTS);
    }
  };

  // Subida de imagen para producto en tarjeta
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingForId(productId);
    setUploadStatus('Comprimiendo y subiendo imagen...');
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      commitProducts(products.map(p => p.id === productId ? { ...p, image: url } : p));
      setUploadStatus('¡Imagen actualizada!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploadingForId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Subida de imagen dentro del modal
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadStatus('Comprimiendo y subiendo imagen de portada...');
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      setEditingProduct(prev => prev ? { ...prev, image: url } : prev);
      setUploadStatus('¡Portada cargada con éxito!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo imagen modal:', err);
      alert('Error al subir la imagen.');
    } finally {
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // Categorías con conteos
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    MERCADO_CATEGORIES.forEach(cat => {
      if (cat.id !== 'todos') {
        counts[cat.id] = products.filter(p => p.category === cat.id).length;
      }
    });
    return counts;
  }, [products]);

  return (
    <div className="admin-mercado-wrapper animate-fade-in">
      {/* 1. Header y Acciones Principales */}
      <div className="admin-mercado-header">
        <div className="admin-mercado-title-group">
          <div className="admin-mercado-icon-wrap">
            <span>🛍️</span>
          </div>
          <div className="admin-mercado-heading">
            <h3>Administrador de Mercado (Tienda Oficial)</h3>
            <p>
              Gestiona el catálogo completo de productos educativos: cuentos, juegos de mesa, personajes, tarjetas, proyectos STEAM y útiles.
            </p>
          </div>
        </div>

        <div className="admin-mercado-top-actions">
          {onSave && (
            <button 
              type="button" 
              className="btn-mercado-save"
              onClick={() => onSave()}
              disabled={saving}
              title="Guardar todos los cambios en Firestore"
            >
              {saving ? '⏳ Guardando en Nube...' : '💾 Guardar en Firestore'}
            </button>
          )}
          <button 
            type="button" 
            className="btn-mercado-secondary"
            onClick={handleRestoreDefault}
            title="Restaurar catálogo inicial"
          >
            ♻️ Restaurar Catálogo Base
          </button>
          <button 
            type="button" 
            className="btn-mercado-primary"
            onClick={handleOpenNew}
            title="Crear un nuevo producto"
          >
            ＋ Nuevo Producto
          </button>
        </div>
      </div>

      {/* 2. Configuración Superior de la Tienda (Banner y WhatsApp) */}
      <div className="admin-mercado-config-card">
        <div className="config-card-header">
          <h4 className="config-card-title">
            <span>📢</span> Configuración General de la Tienda
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Afecta la barra promocional y el canal de ventas directo
          </span>
        </div>

        <div className="admin-mercado-grid-fields">
          <div className="mercado-input-group">
            <label>Cintillo de Anuncio Superior (Promociones / Avisos)</label>
            <textarea
              rows={2}
              value={mercadoConfig.announcement || ''}
              onChange={(e) => updateMercadoConfig('announcement', e.target.value)}
              placeholder="Ej: Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes"
            />
          </div>

          <div className="mercado-input-group">
            <label>WhatsApp Oficial de Pedidos (Código de país sin +)</label>
            <input
              type="text"
              value={mercadoConfig.whatsappPhone || ''}
              onChange={(e) => updateMercadoConfig('whatsappPhone', e.target.value)}
              placeholder="Ej: 50246741239"
            />
          </div>
        </div>
      </div>

      {/* 3. Filtros por Categoría y Buscador */}
      <div className="admin-mercado-filter-strip">
        <div className="admin-mercado-search-bar">
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por título, categoría, grado o palabra clave en el inventario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-mercado-categories-scroll">
          {MERCADO_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`admin-cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat.id);
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="admin-cat-pill-count">{categoryCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga de subida */}
      {uploadStatus && (
        <div style={{ background: 'rgba(255, 80, 0, 0.15)', border: '1px solid #ff5000', color: '#ff9a60', padding: '8px 16px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 800 }}>
          ⚡ {uploadStatus}
        </div>
      )}

      {/* 4. Grilla de Productos */}
      <div className="admin-mercado-products-grid">
        {filteredProducts.map((product) => {
          const discountPercent = product.originalPrice 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

          return (
            <div key={product.id} className="admin-product-card">
              {/* Parte Superior: Portada y Datos Clave */}
              <div className="admin-product-card-top">
                <div className="admin-product-thumb-box">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="admin-product-thumb-img" />
                  ) : (
                    <span>{product.icon}</span>
                  )}
                  {uploadingForId === product.id && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#ff9a60' }}>
                      ⏳
                    </div>
                  )}
                </div>

                <div className="admin-product-info">
                  <div className="admin-product-badge-row">
                    {product.badge && (
                      <span className="admin-badge-tag">{product.badge}</span>
                    )}
                    <span className="admin-category-tag">{product.categoryLabel}</span>
                  </div>

                  <h4 className="admin-product-title" title={product.title}>
                    {product.title}
                  </h4>

                  <span className="admin-product-grade">
                    🎯 {product.gradeOrAge}
                  </span>
                </div>
              </div>

              {/* Fila de Precios y Social Proof */}
              <div className="admin-product-stats-row">
                <div className="admin-product-price-box">
                  <span className="admin-price-current">Q {product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="admin-price-old">Q {product.originalPrice.toFixed(2)}</span>
                      <span className="admin-discount-pill">-{discountPercent}%</span>
                    </>
                  )}
                </div>

                <div className="admin-product-social">
                  ⭐ {product.rating.toFixed(1)} ({product.reviewsCount})
                  {product.soldCount ? ` · +${product.soldCount}` : ''}
                </div>
              </div>

              {/* Botonera de Acciones de la Tarjeta */}
              <div className="admin-product-card-actions">
                {(() => {
                  const actualIdx = products.findIndex(p => p.id === product.id);
                  const canMoveUp = actualIdx > 0;
                  const canMoveDown = actualIdx !== -1 && actualIdx < products.length - 1;
                  return (
                    <div className="admin-card-reorder-group">
                      <button 
                        type="button" 
                        className="btn-card-icon" 
                        onClick={() => handleMoveProduct(product.id, -1)} 
                        disabled={!canMoveUp}
                        title="Mover hacia arriba en el catálogo"
                      >
                        ⬆️
                      </button>
                      <button 
                        type="button" 
                        className="btn-card-icon" 
                        onClick={() => handleMoveProduct(product.id, 1)} 
                        disabled={!canMoveDown}
                        title="Mover hacia abajo en el catálogo"
                      >
                        ⬇️
                      </button>
                    </div>
                  );
                })()}

                <div className="admin-card-buttons-main">
                  <label className="btn-card-icon" title="Subir foto de portada" style={{ cursor: 'pointer' }}>
                    📷
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => handleCardImageUpload(e, product.id)}
                    />
                  </label>

                  <button 
                    type="button" 
                    className="btn-card-duplicate"
                    onClick={() => handleDuplicateProduct(product)}
                    title="Duplicar este producto"
                  >
                    📋 Duplicar
                  </button>

                  <button 
                    type="button" 
                    className="btn-card-edit"
                    onClick={() => handleOpenEdit(product)}
                    title="Editar producto"
                  >
                    ✏️ Editar
                  </button>

                  <button 
                    type="button" 
                    className="btn-card-delete"
                    onClick={() => handleDeleteProduct(product.id, product.title)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', color: '#94a3b8' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔍</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>No se encontraron productos con el filtro aplicado.</p>
          <button 
            className="btn-mercado-primary" 
            style={{ marginTop: '12px' }}
            onClick={() => { setSelectedCategory('todos'); setSearchTerm(''); }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* ==============================================================
          MODAL DE EDICIÓN COMPLETA DEL PRODUCTO
          ============================================================== */}
      {isModalOpen && editingProduct && (
        <div className="admin-modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="admin-mercado-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="admin-modal-header">
              <h3>
                <span>🛍️</span>
                {editingProduct.id.startsWith('prod-') && !products.some(p => p.id === editingProduct.id) 
                  ? 'Añadir Nuevo Producto al Mercado' 
                  : `Editar: ${editingProduct.title || 'Producto'}`}
              </h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setIsModalOpen(false)}
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal con Secciones Organizadas */}
            <div className="admin-modal-body-scroll">
              {/* SECCIÓN 1: Identificación y Categoría */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>📌</span> 1. Información General del Producto
                </h4>

                <div className="mercado-input-group">
                  <label>Título Comercial del Producto *</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Ej: El Código del Maíz: Origen y Sustento"
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Categoría</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => {
                        const catId = e.target.value as MercadoProduct['category'];
                        const catObj = MERCADO_CATEGORIES.find(c => c.id === catId);
                        setEditingProduct({
                          ...editingProduct,
                          category: catId,
                          categoryLabel: catObj ? catObj.label : 'General'
                        });
                      }}
                    >
                      <option value="cuentos">📚 Cuentos y Libros</option>
                      <option value="juegos">🎲 Juegos de Mesa</option>
                      <option value="personajes">🎭 Personajes y Títeres</option>
                      <option value="tarjetas">🎴 Tarjetas y Barajas</option>
                      <option value="proyectos">🚀 Proyectos STEAM</option>
                      <option value="utiles">🎨 Útiles y Arte</option>
                    </select>
                  </div>

                  <div className="mercado-input-group">
                    <label>Grado Escolar / Edad Dirigida</label>
                    <input
                      type="text"
                      value={editingProduct.gradeOrAge}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gradeOrAge: e.target.value })}
                      placeholder="Ej: 4to a 6to Primaria"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Insignia / Badge Comercial</label>
                    <input
                      type="text"
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      placeholder="Ej: MÁS VENDIDO, OFERTA..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', width: '100%' }}>Insignias rápidas:</span>
                  {BADGE_PRESETS.map(badge => (
                    <button
                      key={badge}
                      type="button"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
                      onClick={() => setEditingProduct({ ...editingProduct, badge })}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 2: Precios, Descuentos y Entrega */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>💰</span> 2. Precios, Descuentos y Tiempos de Entrega
                </h4>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Precio de Venta (Q) *</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Precio Regular Tachado (Q)</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Opcional para mostrar rebaja"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Tiempo de Entrega</label>
                    <input
                      type="text"
                      value={editingProduct.deliveryTime || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, deliveryTime: e.target.value })}
                      placeholder="Ej: Entrega 24-48 hrs"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock ?? true}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    />
                    <span>🟢 Producto Disponible en Inventario (En Stock)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.featured ?? false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    />
                    <span>⭐ Destacar en primera fila del catálogo</span>
                  </label>
                </div>
              </div>

              {/* SECCIÓN 3: Aspecto Visual e Imagen de Portada */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>🎨</span> 3. Icono Emoji y Foto de Portada
                </h4>

                <div className="form-grid-2">
                  <div className="mercado-input-group">
                    <label>Icono Emoji Representativo</label>
                    <input
                      type="text"
                      value={editingProduct.icon}
                      onChange={(e) => setEditingProduct({ ...editingProduct, icon: e.target.value })}
                      style={{ fontSize: '1.4rem' }}
                    />
                    <div className="emoji-quick-picker">
                      {POPULAR_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className="emoji-quick-btn"
                          onClick={() => setEditingProduct({ ...editingProduct, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mercado-input-group">
                    <label>URL de Foto de Portada (o subir archivo)</label>
                    <input
                      type="text"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... o sube una imagen abajo"
                    />

                    <label className="image-upload-dropzone">
                      {editingProduct.image ? (
                        <img src={editingProduct.image} alt="Portada" className="dropzone-preview" />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>📷</span>
                      )}
                      <div>
                        <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.84rem' }}>
                          Subir foto desde la computadora
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          Se comprime automáticamente a formato WebP liviano
                        </span>
                      </div>
                      <input 
                        ref={modalFileInputRef}
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={handleModalImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: Social Proof y Reseñas */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>⭐</span> 4. Calificaciones y Métricas Sociales
                </h4>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Puntuación de Estrellas (1.0 a 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 5.0 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Número de Reseñas / Calificaciones</label>
                    <input
                      type="number"
                      min="1"
                      value={editingProduct.reviewsCount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, reviewsCount: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Unidades Vendidas Estimadas</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.soldCount || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, soldCount: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 5: Descripciones y Ficha Pedagógica */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>📝</span> 5. Descripciones y Contenidos del Paquete
                </h4>

                <div className="mercado-input-group">
                  <label>Descripción Breve (Resumen para la Tarjeta de Catálogo)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Resumen de 1-2 líneas que destaca el valor pedagógico principal..."
                  />
                </div>

                <div className="mercado-input-group">
                  <label>Descripción Detallada (Ficha Pedagógica en Modal)</label>
                  <textarea
                    rows={4}
                    value={editingProduct.longDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                    placeholder="Explicación completa de las metodologías, competencias y enfoque pedagógico..."
                  />
                </div>

                {/* Lista Dinámica de Características */}
                <div className="mercado-input-group">
                  <label>Características y Competencias Clave</label>
                  <div className="dynamic-items-list">
                    {(editingProduct.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="dynamic-item-row">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const nextFeats = [...editingProduct.features];
                            nextFeats[fIdx] = e.target.value;
                            setEditingProduct({ ...editingProduct, features: nextFeats });
                          }}
                          placeholder="Ej: Actividades de comprensión lectora..."
                        />
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => {
                            const nextFeats = editingProduct.features.filter((_, i) => i !== fIdx);
                            setEditingProduct({ ...editingProduct, features: nextFeats });
                          }}
                          title="Quitar característica"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-item"
                      onClick={() => {
                        setEditingProduct({
                          ...editingProduct,
                          features: [...(editingProduct.features || []), '']
                        });
                      }}
                    >
                      ＋ Agregar Otra Característica
                    </button>
                  </div>
                </div>

                {/* Lista Dinámica de Contenidos del Paquete */}
                <div className="mercado-input-group">
                  <label>Contenido del Paquete / Set Incluido</label>
                  <div className="dynamic-items-list">
                    {(editingProduct.contents || []).map((item, cIdx) => (
                      <div key={cIdx} className="dynamic-item-row">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const nextContents = [...(editingProduct.contents || [])];
                            nextContents[cIdx] = e.target.value;
                            setEditingProduct({ ...editingProduct, contents: nextContents });
                          }}
                          placeholder="Ej: 1 Libro impreso de 64 páginas a color..."
                        />
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => {
                            const nextContents = (editingProduct.contents || []).filter((_, i) => i !== cIdx);
                            setEditingProduct({ ...editingProduct, contents: nextContents });
                          }}
                          title="Quitar item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-item"
                      onClick={() => {
                        setEditingProduct({
                          ...editingProduct,
                          contents: [...(editingProduct.contents || []), '']
                        });
                      }}
                    >
                      ＋ Agregar Item a la Caja
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 6: Formato Literario & Colección Kindle (Editorial) */}
              {editingProduct.category === 'cuentos' && (
                <div className="modal-section-box">
                  <h4 className="modal-section-title">
                    <span>📖</span> 6. Datos Editoriales & Colección Kindle
                  </h4>

                  <div className="form-grid-3">
                    <div className="mercado-input-group">
                      <label>Autor / Ilustrador</label>
                      <input
                        type="text"
                        value={editingProduct.author || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, author: e.target.value })}
                        placeholder="Ej: Editorial Lluvia de Ideas"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Número de Páginas</label>
                      <input
                        type="number"
                        min="1"
                        value={editingProduct.pages || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pages: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        placeholder="Ej: 64"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Formato de Impresión / Digital</label>
                      <input
                        type="text"
                        value={editingProduct.formatType || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, formatType: e.target.value })}
                        placeholder="Ej: Kindle eBook & Tapa Dura"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3" style={{ marginTop: '14px' }}>
                    <div className="mercado-input-group">
                      <label>Colección Literaria Asociada</label>
                      <select
                        value={editingProduct.collectionId || ''}
                        onChange={(e) => {
                          const colId = e.target.value;
                          let colName = '';
                          if (colId === 'col-popol-vuh') colName = 'Saga Mítica Popol Vuh: Dioses & Creación';
                          else if (colId === 'col-steam') colName = 'Colección STEAM: Sabiduría Ancestral';
                          else if (colId === 'col-magna') colName = 'Gran Biblioteca Escolar: Antología Completa';
                          setEditingProduct({
                            ...editingProduct,
                            collectionId: colId || undefined,
                            collectionName: colName || undefined
                          });
                        }}
                      >
                        <option value="">Sin Colección (Título Individual)</option>
                        <option value="col-popol-vuh">🏛️ Saga Mítica Popol Vuh (5 Libros)</option>
                        <option value="col-steam">🚀 Colección STEAM (4 Libros)</option>
                        <option value="col-magna">📦 Gran Biblioteca Escolar (9 Libros)</option>
                      </select>
                    </div>

                    <div className="mercado-input-group">
                      <label>Código ISBN (Opcional)</label>
                      <input
                        type="text"
                        value={editingProduct.isbn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isbn: e.target.value })}
                        placeholder="Ej: 978-99939-0-123-4"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Paleta de Portada Kindle 3D</label>
                      <select
                        value={editingProduct.coverTheme || 'amber'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, coverTheme: e.target.value as any })}
                      >
                        <option value="amber">🟠 Ámbar Dorado Maya (Cálido)</option>
                        <option value="cyan">🔵 Cian Cósmico (Profundo)</option>
                        <option value="emerald">🟢 Esmeralda Selva (Naturaleza)</option>
                        <option value="purple">🟣 Púrpura Místico (Épico)</option>
                        <option value="ruby">🔴 Rubí Ancestral (Intenso)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="btn-mercado-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleSaveProduct}
              >
                💾 Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
