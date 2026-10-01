import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { DEFAULT_MERCADO_PRODUCTS, MERCADO_CATEGORIES, type MercadoProduct } from '../data/mercadoData';
import { soundEffects } from '../utils/soundEffects';
import { CONTACT } from '../constants';
import './Mercado.css';

interface CartItem {
  product: MercadoProduct;
  quantity: number;
}

const CART_STORAGE_KEY = 'mercado_cart_v1';

export default function Mercado() {
  const { config } = usePortalConfig();

  const allProducts: MercadoProduct[] = useMemo(() => {
    if (config?.mercadoProducts && Array.isArray(config.mercadoProducts) && config.mercadoProducts.length > 0) {
      return config.mercadoProducts as MercadoProduct[];
    }
    return DEFAULT_MERCADO_PRODUCTS;
  }, [config?.mercadoProducts]);

  const mercadoConfig = config?.mercadoConfig || {
    announcement: "Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes",
    whatsappPhone: CONTACT.whatsappPhone,
    bannerTitle: "Mercado Educativo & Creativo",
    bannerSubtitle: "Materiales didácticos, cuentos y proyectos pedagógicos directos de la editorial",
    showPromoStrip: true
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'sold'>('featured');
  
  // Detalle de Producto Modal
  const [selectedProduct, setSelectedProduct] = useState<MercadoProduct | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Carrito de compras
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Guardar carrito
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignorar errores en modo incógnito
    }
  }, [cartItems]);

  // Manejador tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Total de items en carrito
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Total precio en Quetzales
  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  // Ahorro total estimado
  const totalSavings = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const orig = item.product.originalPrice || item.product.price;
      return acc + (orig - item.product.price) * item.quantity;
    }, 0);
  }, [cartItems]);

  // Agregar al carrito
  const handleAddToCart = (product: MercadoProduct, qty = 1) => {
    soundEffects.playClick();
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    setAddedNotice(`¡${product.title} añadido al carrito!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 2400);
  };

  // Modificar cantidad en carrito
  const handleUpdateQuantity = (productId: string, delta: number) => {
    soundEffects.playClick();
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  // Eliminar del carrito
  const handleRemoveFromCart = (productId: string) => {
    soundEffects.playClick();
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Limpiar carrito
  const handleClearCart = () => {
    if (window.confirm('¿Deseas vaciar todos los productos del carrito?')) {
      soundEffects.playClick();
      setCartItems([]);
    }
  };

  // Generar enlace WhatsApp para pedido
  const getWhatsAppOrderUrl = () => {
    const lines = [
      '¡Hola Editorial Lluvia de Ideas! 👋',
      'Quiero realizar un pedido en el Mercado Pedagógico:',
      '',
      ...cartItems.map(item => `• ${item.quantity}x ${item.product.title} (Q ${(item.product.price * item.quantity).toFixed(2)})`),
      '',
      `📦 Total a Pagar: Q ${totalCartPrice.toFixed(2)}`,
      totalSavings > 0 ? `🎉 Ahorro aplicado: Q ${totalSavings.toFixed(2)}` : '',
      '',
      '¿Tienen disponibilidad para coordinar la entrega y formas de pago? ¡Muchas gracias!'
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join('\n'));
    const phone = mercadoConfig.whatsappPhone || CONTACT.whatsappPhone || '50246741239';
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Enlace WhatsApp para un producto individual
  const getSingleProductWhatsAppUrl = (product: MercadoProduct, qty = 1) => {
    const lines = [
      '¡Hola Editorial Lluvia de Ideas! 👋',
      `Me interesa adquirir el siguiente producto del Mercado:`,
      `• ${qty}x ${product.title} (Q ${(product.price * qty).toFixed(2)})`,
      `Categoría: ${product.categoryLabel}`,
      '',
      '¿Podrían darme más información de disponibilidad y formas de envío? ¡Gracias!'
    ];
    const message = encodeURIComponent(lines.join('\n'));
    const phone = mercadoConfig.whatsappPhone || CONTACT.whatsappPhone || '50246741239';
    return `https://wa.me/${phone}?text=${message}`;
  };

  const [filterBadge, setFilterBadge] = useState<'all' | 'offers' | 'bestsellers'>('all');

  // Conteo de productos por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: allProducts.length };
    MERCADO_CATEGORIES.forEach(cat => {
      if (cat.id !== 'todos') {
        counts[cat.id] = allProducts.filter(p => p.category === cat.id).length;
      }
    });
    return counts;
  }, [allProducts]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // Filtro por categoría
    if (selectedCategory !== 'todos') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Filtro por insignias / ofertas rápidas
    if (filterBadge === 'offers') {
      list = list.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (filterBadge === 'bestsellers') {
      list = list.filter(p => p.badge?.includes('MÁS VENDIDO') || (p.soldCount && p.soldCount > 100));
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        p.features.some(f => f.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'sold') return (b.soldCount || 0) - (a.soldCount || 0);
      // 'featured'
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [allProducts, selectedCategory, filterBadge, searchQuery, sortBy]);

  return (
    <div className="mercado-amazon-container animate-fade-in">
      {/* TopBar del Portal */}
      <LandingTopBar 
        slogan="Mercado Oficial · Materiales, Cuentos y Juegos" 
        showHomeButton 
      />

      {/* Cinta Promocional Superior Estilo Amazon/Temu */}
      {mercadoConfig.showPromoStrip !== false && (
        <div className="mercado-top-promo-strip">
          <div className="promo-strip-content">
            <span className="promo-tag">🔥 OFERTAS DE TEMPORADA</span>
            <span className="promo-text">{mercadoConfig.announcement || 'Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes'}</span>
            <span className="promo-contact">📞 WhatsApp Directo: <strong>{mercadoConfig.whatsappPhone || '4674-1239'}</strong></span>
          </div>
        </div>
      )}

      {/* Barra de Búsqueda y Header Principal */}
      <header className="mercado-amazon-header">
        <div className="mercado-header-container">
          <div className="mercado-brand-section">
            <h1 className="mercado-store-logo">
              <span className="logo-cart-icon">🛒</span>
              <span className="logo-text">mercado<small>.lluvia</small></span>
            </h1>
            <span className="mercado-tagline">Tienda Educativa & Creativa</span>
          </div>

          {/* Barra de Búsqueda Amazon / Temu Style */}
          <div className="mercado-amazon-search-box">
            <div className="search-category-select">
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  soundEffects.playClick();
                  setSelectedCategory(e.target.value);
                }}
              >
                <option value="todos">Todos</option>
                <option value="cuentos">Cuentos</option>
                <option value="juegos">Juegos</option>
                <option value="personajes">Personajes</option>
                <option value="tarjetas">Tarjetas</option>
                <option value="proyectos">Proyectos</option>
                <option value="utiles">Útiles</option>
              </select>
              <span className="select-arrow">▾</span>
            </div>

            <input 
              type="text" 
              placeholder="Buscar en Mercado Lluvia de Ideas: cuentos, bingos, plastilinas, títeres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="amazon-search-input"
            />

            {searchQuery && (
              <button 
                type="button" 
                className="amazon-search-clear"
                onClick={() => setSearchQuery('')}
                title="Borrar búsqueda"
              >
                ✕
              </button>
            )}

            <button 
              type="button" 
              className="amazon-search-submit-btn"
              title="Buscar"
            >
              🔍
            </button>
          </div>

          {/* Acciones de Cabecera: Pedidos y Carrito */}
          <div className="mercado-header-actions">
            <button
              type="button"
              className="amazon-cart-btn"
              onClick={() => {
                soundEffects.playClick();
                setIsCartDrawerOpen(true);
              }}
              title="Abrir Carrito de Compras"
            >
              <div className="cart-icon-wrapper">
                <span className="cart-svg-icon">🛒</span>
                <span className="cart-count-badge">{totalCartCount}</span>
              </div>
              <div className="cart-btn-text">
                <span className="cart-text-sub">Carrito</span>
                <span className="cart-text-price">Q {totalCartPrice.toFixed(2)}</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Barra de Categorías Horizontal Exclusiva para Móvil */}
      <nav className="mercado-mobile-categories-bar">
        <div className="mobile-categories-scroll">
          {MERCADO_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                className={`mobile-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id);
                }}
              >
                <span className="mobile-cat-icon">{cat.icon}</span>
                <span className="mobile-cat-label">{cat.label}</span>
                <span className="mobile-cat-count">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Banner de Garantías y Beneficios Temu / Amazon */}
      <div className="mercado-guarantees-bar">
        <div className="guarantees-container">
          <div className="guarantee-chip">
            <span className="guarantee-icon">🛡️</span>
            <span>Garantía de Satisfacción Docente</span>
          </div>
          <div className="guarantee-chip">
            <span className="guarantee-icon">🚚</span>
            <span>Envío Rápido a toda Guatemala</span>
          </div>
          <div className="guarantee-chip">
            <span className="guarantee-icon">⚡</span>
            <span>Precios Directos de Editorial</span>
          </div>
          <div className="guarantee-chip">
            <span className="guarantee-icon">💬</span>
            <span>Cotizaciones y Facturas al Instante</span>
          </div>
        </div>
      </div>

      {/* Toast flotante de producto agregado */}
      {addedNotice && (
        <div className="amazon-toast animate-slide-down">
          <span>✅ {addedNotice}</span>
        </div>
      )}

      {/* Contenido Principal con Layout de Barra Lateral Vertical + 4 Columnas */}
      <main className="mercado-amazon-main">
        <div className="mercado-columns-layout">
          {/* ==============================================================
              BARRA LATERAL VERTICAL (Filtros, Búsqueda y Opciones en Web)
              ============================================================== */}
          <aside className="mercado-vertical-sidebar">
            {/* 1. Bloque de Búsqueda Vertical */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>🔍</span> Búsqueda en Tienda
              </h4>
              <div className="sidebar-vertical-search">
                <input
                  type="text"
                  placeholder="Ej: Cuentos, bingos, plastilinas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="sidebar-clear-btn"
                    title="Borrar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 2. Bloque de Categorías / Departamentos Verticales */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>📚</span> Departamentos
              </h4>
              <div className="sidebar-categories-vertical-list">
                {MERCADO_CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`sidebar-vertical-cat-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedCategory(cat.id);
                      }}
                    >
                      <div className="sidebar-cat-left">
                        <span className="sidebar-cat-emoji">{cat.icon}</span>
                        <span className="sidebar-cat-text">{cat.label}</span>
                      </div>
                      <span className="sidebar-cat-number">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Bloque de Ordenamiento Vertical */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>⚡</span> Ordenar Catálogo
              </h4>
              <div className="sidebar-sort-vertical-list">
                {[
                  { id: 'featured', label: '⭐ Destacados Editorial' },
                  { id: 'sold', label: '🔥 Más Vendidos (+ Popular)' },
                  { id: 'price-asc', label: '📈 Menor a Mayor Precio' },
                  { id: 'price-desc', label: '📉 Mayor a Menor Precio' },
                  { id: 'rating', label: '🌟 Mejor Calificados' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`sidebar-sort-option ${sortBy === opt.id ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setSortBy(opt.id as any);
                    }}
                  >
                    <span className="sort-radio-indicator">{sortBy === opt.id ? '●' : '○'}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Bloque de Filtros Rápidos (Ofertas y Destacados) */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>🏷️</span> Filtros Especiales
              </h4>
              <div className="sidebar-badge-filter-group">
                <button
                  type="button"
                  className={`sidebar-badge-pill ${filterBadge === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterBadge('all');
                  }}
                >
                  Todos los Productos
                </button>
                <button
                  type="button"
                  className={`sidebar-badge-pill ${filterBadge === 'offers' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterBadge('offers');
                  }}
                >
                  🔥 Solo con Descuento
                </button>
                <button
                  type="button"
                  className={`sidebar-badge-pill ${filterBadge === 'bestsellers' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterBadge('bestsellers');
                  }}
                >
                  ⭐ Solo Más Vendidos
                </button>
              </div>
            </div>

            {/* 5. Tarjeta de Contacto Directo WhatsApp */}
            <div className="sidebar-whatsapp-card">
              <div className="whatsapp-card-head">
                <span className="whatsapp-card-icon">💬</span>
                <strong>¿Pedidos para Colegios?</strong>
              </div>
              <p>
                Atención personalizada, cotizaciones formales y descuentos por volumen institucional.
              </p>
              <a
                href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('¡Hola Editorial Lluvia de Ideas! Me gustaría cotizar materiales y cuentos para una institución educativa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-whatsapp-btn"
              >
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>
          </aside>

          {/* ==============================================================
              ÁREA PRINCIPAL DE PRODUCTOS (4 Columnas en Web)
              ============================================================== */}
          <section className="mercado-catalog-content">
            {/* Header de Resultados Superior */}
            <div className="catalog-results-header">
              <div className="results-count-text">
                Mostrando <strong>{filteredProducts.length}</strong> de <strong>{allProducts.length}</strong> productos
                {selectedCategory !== 'todos' && (
                  <span className="active-filter-badge">
                    {MERCADO_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                    <button 
                      type="button" 
                      onClick={() => setSelectedCategory('todos')}
                      title="Quitar filtro"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filterBadge !== 'all' && (
                  <span className="active-filter-badge">
                    {filterBadge === 'offers' ? '🔥 Con Descuento' : '⭐ Más Vendidos'}
                    <button 
                      type="button" 
                      onClick={() => setFilterBadge('all')}
                      title="Quitar filtro"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="active-filter-badge">
                    "{searchQuery}"
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      title="Quitar búsqueda"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* Selector de Orden para Móvil / Tablet */}
              <div className="mobile-sort-row">
                <label htmlFor="mobile-sort">Ordenar:</label>
                <select
                  id="mobile-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="mobile-sort-select"
                >
                  <option value="featured">⭐ Destacados</option>
                  <option value="sold">🔥 Más Vendidos</option>
                  <option value="price-asc">📈 Menor Precio</option>
                  <option value="price-desc">📉 Mayor Precio</option>
                  <option value="rating">🌟 Calificación</option>
                </select>
              </div>
            </div>

            {/* Grilla de 4 Columnas de Productos */}
            {filteredProducts.length > 0 ? (
              <div className="amazon-products-grid">
                {filteredProducts.map(product => {
                  const discountPercent = product.originalPrice 
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <article key={product.id} className="amazon-product-card">
                      {/* Badge de Oferta / Destacado */}
                      <div className="card-top-badges">
                        {product.badge && (
                          <span className={`temu-badge ${product.badge.includes('MÁS VENDIDO') || product.badge.includes('SUPERVENTAS') ? 'badge-orange' : 'badge-red'}`}>
                            {product.badge}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="temu-discount-tag">-{discountPercent}%</span>
                        )}
                      </div>

                      {/* Ilustración / Imagen del producto */}
                      <div 
                        className="card-image-box"
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedProduct(product);
                          setDetailQuantity(1);
                        }}
                        title="Ver detalle del producto"
                      >
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="card-product-img" />
                        ) : (
                          <span className="card-product-icon">{product.icon}</span>
                        )}
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="card-details-box">
                        <span className="card-category-label">{product.categoryLabel}</span>
                        
                        <h3 
                          className="card-product-title"
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedProduct(product);
                            setDetailQuantity(1);
                          }}
                        >
                          {product.title}
                        </h3>

                        {/* Estrellas y Ventas */}
                        <div className="card-rating-row">
                          <div className="stars-row">
                            {'★'.repeat(Math.floor(product.rating))}
                          </div>
                          <span className="rating-score">{product.rating.toFixed(1)}</span>
                          <span className="reviews-count">({product.reviewsCount})</span>
                          {product.soldCount && (
                            <span className="sold-count">· +{product.soldCount} vendidos</span>
                          )}
                        </div>

                        {/* Etiqueta de Grado / Nivel */}
                        <div className="card-grade-pill">
                          🎯 {product.gradeOrAge}
                        </div>

                        {/* Fila de Precios Temu / Amazon Style */}
                        <div className="card-pricing-block">
                          <div className="main-price-row">
                            <span className="price-symbol">{product.currency}</span>
                            <span className="price-amount">{product.price.toFixed(2)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="price-original">
                                Q {product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.deliveryTime && (
                            <div className="card-delivery-badge">
                              ⚡ {product.deliveryTime}
                            </div>
                          )}
                        </div>

                        {/* Botones de Acción */}
                        <div className="card-actions-row">
                          <button
                            type="button"
                            className="amazon-add-btn"
                            onClick={() => handleAddToCart(product, 1)}
                            title="Agregar al Carrito"
                          >
                            🛒 Agregar
                          </button>
                          
                          <button
                            type="button"
                            className="amazon-quick-view-btn"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedProduct(product);
                              setDetailQuantity(1);
                            }}
                            title="Vista Rápida"
                          >
                            👁️
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="amazon-empty-results">
                <span className="empty-icon-box">🔍</span>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o cambia la categoría seleccionada.</p>
                <button 
                  type="button" 
                  className="btn-reset-filters"
                  onClick={() => {
                    setSelectedCategory('todos');
                    setSearchQuery('');
                    setFilterBadge('all');
                  }}
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Botón Flotante del Carrito (Temu Style) */}
      {totalCartCount > 0 && (
        <button
          type="button"
          className="temu-floating-cart-pill animate-bounce-in"
          onClick={() => {
            soundEffects.playClick();
            setIsCartDrawerOpen(true);
          }}
          title="Ver tu carrito de compras"
        >
          <div className="floating-cart-badge-wrap">
            <span className="floating-cart-icon">🛒</span>
            <span className="floating-cart-count">{totalCartCount}</span>
          </div>
          <div className="floating-cart-texts">
            <span className="floating-cart-title">Ver Carrito</span>
            <span className="floating-cart-sum">Q {totalCartPrice.toFixed(2)}</span>
          </div>
        </button>
      )}

      {/* ==============================================================
          DRAWER LATERAL DEL CARRITO (Estilo Blanco Limpio / Amazon)
          ============================================================== */}
      {isCartDrawerOpen && createPortal(
        <div 
          className="amazon-drawer-overlay animate-fade-in"
          onClick={() => setIsCartDrawerOpen(false)}
        >
          <aside 
            className="amazon-cart-sidebar animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-header">
              <div className="sidebar-title-group">
                <span className="sidebar-icon">🛒</span>
                <div>
                  <h3 className="sidebar-title">Carrito de Compras</h3>
                  <span className="sidebar-subtitle">{totalCartCount} productos agregados</span>
                </div>
              </div>
              <button 
                type="button" 
                className="sidebar-close-btn"
                onClick={() => setIsCartDrawerOpen(false)}
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            {/* Lista de productos */}
            <div className="sidebar-items-scroll">
              {cartItems.length > 0 ? (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="sidebar-product-item">
                    <div className="sidebar-item-icon-box">
                      {product.image ? (
                        <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <span>{product.icon}</span>
                      )}
                    </div>

                    <div className="sidebar-item-details">
                      <h4 className="sidebar-item-title">{product.title}</h4>
                      <span className="sidebar-item-category">{product.categoryLabel}</span>
                      
                      <div className="sidebar-item-price-row">
                        <span className="sidebar-unit-price">Q {product.price.toFixed(2)} c/u</span>
                        <span className="sidebar-subtotal-price">Q {(product.price * quantity).toFixed(2)}</span>
                      </div>

                      <div className="sidebar-item-bottom-controls">
                        <div className="amazon-qty-picker">
                          <button 
                            type="button" 
                            onClick={() => handleUpdateQuantity(product.id, -1)}
                            title="Disminuir"
                          >
                            -
                          </button>
                          <span className="qty-number">{quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleUpdateQuantity(product.id, 1)}
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          type="button" 
                          className="sidebar-delete-btn"
                          onClick={() => handleRemoveFromCart(product.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sidebar-empty-cart">
                  <span className="empty-cart-emoji">🛒</span>
                  <h4>Tu carrito está vacío</h4>
                  <p>Añade cuentos, juegos de mesa, barajas o kits para cotizar y comprar.</p>
                </div>
              )}
            </div>

            {/* Footer con Resumen y Botón de WhatsApp Checkout */}
            {cartItems.length > 0 && (
              <div className="sidebar-footer">
                <div className="sidebar-price-breakdown">
                  <div className="breakdown-row subtotal">
                    <span>Subtotal ({totalCartCount} artículos):</span>
                    <strong>Q {totalCartPrice.toFixed(2)}</strong>
                  </div>
                  {totalSavings > 0 && (
                    <div className="breakdown-row savings">
                      <span>Ahorro total estimado:</span>
                      <strong className="savings-val">- Q {totalSavings.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className="breakdown-row total">
                    <span>Total a Pagar:</span>
                    <strong className="final-total">Q {totalCartPrice.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="sidebar-checkout-actions">
                  <a
                    href={getWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amazon-proceed-btn"
                    onClick={() => soundEffects.playSuccessFanfare()}
                  >
                    <span>📱 Proceder al Pedido (WhatsApp)</span>
                  </a>

                  <button
                    type="button"
                    className="amazon-clear-btn"
                    onClick={handleClearCart}
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>,
        document.body
      )}

      {/* ==============================================================
          MODAL DE DETALLE DE PRODUCTO (Estilo Amazon / Temu Claro)
          ============================================================== */}
      {selectedProduct && createPortal(
        <div 
          className="amazon-modal-overlay animate-fade-in"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="amazon-product-modal animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-strip">
              <span className="modal-category-path">
                Mercado &gt; {selectedProduct.categoryLabel} &gt; {selectedProduct.title}
              </span>
              <button 
                type="button" 
                className="modal-close-cross"
                onClick={() => setSelectedProduct(null)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-two-columns">
              {/* Columna Izquierda: Imagen y Garantías */}
              <div className="modal-left-column">
                <div className="modal-image-display">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.title} className="modal-hero-img" />
                  ) : (
                    <span className="modal-hero-icon">{selectedProduct.icon}</span>
                  )}
                </div>

                <div className="modal-quick-badges">
                  <div className="modal-badge-item">
                    <span>🚚</span>
                    <div>
                      <strong>Envío Rápido</strong>
                      <p>Disponible en 24-48 hrs</p>
                    </div>
                  </div>
                  <div className="modal-badge-item">
                    <span>🛡️</span>
                    <div>
                      <strong>Garantía Editorial</strong>
                      <p>Material pedagógico certificado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Información, Precio y Compra */}
              <div className="modal-right-column">
                <h2 className="modal-full-title">{selectedProduct.title}</h2>

                <div className="modal-ratings-strip">
                  <div className="stars-gold">
                    {'★'.repeat(Math.floor(selectedProduct.rating))}
                  </div>
                  <span className="modal-score">{selectedProduct.rating.toFixed(1)}</span>
                  <span className="modal-reviews-link">{selectedProduct.reviewsCount} calificaciones</span>
                  {selectedProduct.soldCount && (
                    <span className="modal-sold-pill">+{selectedProduct.soldCount} comprados</span>
                  )}
                </div>

                <hr className="modal-divider" />

                {/* Precios y Oferta */}
                <div className="modal-pricing-box">
                  <div className="modal-main-price">
                    <span className="modal-currency">{selectedProduct.currency}</span>
                    <span className="modal-amount">{selectedProduct.price.toFixed(2)}</span>
                    {selectedProduct.originalPrice && (
                      <span className="modal-original-price">
                        Q {selectedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="modal-tax-note">Impuestos incluidos · Factura disponible</span>
                </div>

                <div className="modal-grade-target">
                  <strong>🎯 Nivel / Edad recomendada:</strong> {selectedProduct.gradeOrAge}
                </div>

                <p className="modal-description-paragraph">
                  {selectedProduct.longDescription}
                </p>

                {/* Aspectos destacados */}
                <div className="modal-bullet-points">
                  <h4>Características Principales</h4>
                  <ul>
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx}>✓ {feat}</li>
                    ))}
                  </ul>
                </div>

                {/* Contenidos */}
                {selectedProduct.contents && (
                  <div className="modal-contents-box">
                    <h4>📦 ¿Qué incluye el paquete?</h4>
                    <ul>
                      {selectedProduct.contents.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <hr className="modal-divider" />

                {/* Bloque de Compra */}
                <div className="modal-buy-box">
                  <div className="modal-quantity-row">
                    <label>Cantidad:</label>
                    <div className="modal-qty-control">
                      <button 
                        type="button" 
                        onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                      >
                        -
                      </button>
                      <span>{detailQuantity}</span>
                      <button 
                        type="button" 
                        onClick={() => setDetailQuantity(detailQuantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="modal-subtotal-calc">
                      Total: <strong>Q {(selectedProduct.price * detailQuantity).toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="modal-action-buttons-group">
                    <button
                      type="button"
                      className="btn-amazon-add-cart"
                      onClick={() => {
                        handleAddToCart(selectedProduct, detailQuantity);
                        setSelectedProduct(null);
                      }}
                    >
                      <span>🛒 Agregar al Carrito</span>
                    </button>

                    <a
                      href={getSingleProductWhatsAppUrl(selectedProduct, detailQuantity)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-amazon-buy-now"
                      onClick={() => soundEffects.playSuccessFanfare()}
                      title="Pedir directamente en WhatsApp"
                    >
                      <span>⚡ Comprar Ya en WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
