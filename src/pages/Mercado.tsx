import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { 
  DEFAULT_MERCADO_PRODUCTS, 
  MERCADO_CATEGORIES, 
  DEFAULT_BOOK_COLLECTIONS,
  getCollectionBooks,
  type MercadoProduct,
  type BookCollection
} from '../data/mercadoData';
import KindleBookCover from '../components/mercado/KindleBookCover';
import KindleBookCard from '../components/mercado/KindleBookCard';
import KindleCollectionsView from '../components/mercado/KindleCollectionsView';
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
      // Garantizar que los nuevos títulos enriquecidos (Popol Vuh c-5 a c-9) se incorporen si no existen en la copia previa
      const configIds = new Set(config.mercadoProducts.map((p: any) => p.id));
      const missingDefaults = DEFAULT_MERCADO_PRODUCTS.filter(p => !configIds.has(p.id));
      return [...(config.mercadoProducts as MercadoProduct[]), ...missingDefaults];
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
  const [cuentosSubCategory, setCuentosSubCategory] = useState<'todos' | 'colecciones' | 'steam' | 'popol-vuh'>('todos');
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

  // Agregar colección completa al carrito con fanfarria de éxito
  const handleAddCollectionToCart = (collection: BookCollection, books: MercadoProduct[]) => {
    soundEffects.playSuccessFanfare();
    setCartItems(prev => {
      let updated = [...prev];
      books.forEach(b => {
        const existing = updated.find(item => item.product.id === b.id);
        if (existing) {
          updated = updated.map(item =>
            item.product.id === b.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updated.push({ product: b, quantity: 1 });
        }
      });
      return updated;
    });

    setAddedNotice(`¡Colección "${collection.title}" (${books.length} libros) añadida al carrito!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 3200);
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

    // Filtro por subcategoría específica de Cuentos y Libros
    if (selectedCategory === 'cuentos') {
      if (cuentosSubCategory === 'steam') {
        list = list.filter(p => p.collectionId === 'col-steam');
      } else if (cuentosSubCategory === 'popol-vuh') {
        list = list.filter(p => p.collectionId === 'col-popol-vuh');
      }
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

      {/* Cinta Informativa Superior Limpia y Minimalista */}
      {mercadoConfig.showPromoStrip !== false && (
        <div className="mercado-clean-announcement-bar">
          <div className="announcement-content">
            <span className="announcement-badge">🌿 Editorial</span>
            <span className="announcement-text">{mercadoConfig.announcement || 'Materiales didácticos y cuentos infantiles directos de imprenta · Envíos a toda Guatemala'}</span>
            <a 
              href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('Hola Editorial Lluvia de Ideas, deseo información de materiales y cuentos')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-link"
            >
              <span>Asesoría pedagógica: <strong>{mercadoConfig.whatsappPhone || '4674-1239'}</strong></span>
            </a>
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

          {/* Barra de Búsqueda Minimalista y Despejada */}
          <div className="mercado-amazon-search-box">
            <div className="search-category-select">
              <select 
                value={selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? 'colecciones' : selectedCategory}
                onChange={(e) => {
                  soundEffects.playClick();
                  const val = e.target.value;
                  if (val === 'colecciones') {
                    setSelectedCategory('cuentos');
                    setCuentosSubCategory('colecciones');
                  } else {
                    setSelectedCategory(val);
                    if (val === 'cuentos') {
                      setCuentosSubCategory('todos');
                    }
                  }
                }}
              >
                <option value="todos">Todos los Departamentos</option>
                <option value="cuentos">📚 Cuentos y Libros (Kindle)</option>
                <option value="colecciones">📦 Colecciones de Libros</option>
                <option value="juegos">🎲 Juegos de Mesa</option>
                <option value="personajes">🎭 Personajes y Títeres</option>
                <option value="tarjetas">🎴 Tarjetas y Barajas</option>
                <option value="proyectos">🚀 Proyectos STEAM</option>
                <option value="utiles">🎨 Útiles y Arte</option>
              </select>
              <span className="select-arrow">▾</span>
            </div>

            <input 
              type="text" 
              placeholder="Buscar por título, material, grado o palabra clave..."
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
            const isActive = selectedCategory === cat.id && (cat.id !== 'cuentos' || cuentosSubCategory !== 'colecciones');
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                className={`mobile-cat-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id);
                  if (cat.id === 'cuentos') {
                    setCuentosSubCategory('todos');
                  }
                }}
              >
                <span className="mobile-cat-icon">{cat.icon}</span>
                <span className="mobile-cat-label">{cat.label}</span>
                <span className="mobile-cat-count">{count}</span>
              </button>
            );
          })}
          {/* Píldora de Subcategoría Colecciones */}
          <button
            type="button"
            className={`mobile-cat-pill mobile-col-pill ${selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setSelectedCategory('cuentos');
              setCuentosSubCategory('colecciones');
            }}
          >
            <span className="mobile-cat-icon">📦</span>
            <span className="mobile-cat-label">Colecciones</span>
            <span className="mobile-cat-count">{DEFAULT_BOOK_COLLECTIONS.length}</span>
          </button>
        </div>
      </nav>

      {/* Micro-cinta de Confianza y Garantías (Discreta y de Baja Carga Visual) */}
      <div className="mercado-trust-microbar">
        <div className="trust-microbar-inner">
          <span className="trust-pill"><span>🛡️</span> Garantía pedagógica docente</span>
          <span className="trust-divider">·</span>
          <span className="trust-pill"><span>🚚</span> Envíos a todo el país (24-48 hrs)</span>
          <span className="trust-divider">·</span>
          <span className="trust-pill"><span>⚡</span> Precios directos de imprenta</span>
          <span className="trust-divider">·</span>
          <span className="trust-pill"><span>📄</span> Factura y cotizaciones formales</span>
        </div>
      </div>

      {/* Toast flotante de producto agregado */}
      {addedNotice && (
        <div className="amazon-toast animate-slide-down">
          <span>✅ {addedNotice}</span>
        </div>
      )}

      {/* Contenido Principal con Layout de Barra Lateral Vertical + Catálogo */}
      <main className="mercado-amazon-main">
        <div className="mercado-columns-layout">
          {/* ==============================================================
              BARRA LATERAL VERTICAL (Filtros Limpios y Despejados)
              ============================================================== */}
          <aside className="mercado-vertical-sidebar">
            {/* 1. Bloque de Categorías / Departamentos Verticales */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>📚</span> Departamentos
              </h4>
              <div className="sidebar-categories-vertical-list">
                {MERCADO_CATEGORIES.map(cat => {
                  const isCatSelected = selectedCategory === cat.id;
                  const isActive = isCatSelected && (cat.id !== 'cuentos' || cuentosSubCategory !== 'colecciones');
                  const count = categoryCounts[cat.id] || 0;

                  return (
                    <div key={cat.id} className="sidebar-cat-group">
                      <button
                        type="button"
                        className={`sidebar-vertical-cat-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedCategory(cat.id);
                          if (cat.id === 'cuentos') {
                            setCuentosSubCategory('todos');
                          }
                        }}
                      >
                        <div className="sidebar-cat-left">
                          <span className="sidebar-cat-emoji">{cat.icon}</span>
                          <span className="sidebar-cat-text">{cat.label}</span>
                        </div>
                        <span className="sidebar-cat-number">{count}</span>
                      </button>

                      {/* Submenú de Cuentos y Libros con Subcategoría Colecciones */}
                      {cat.id === 'cuentos' && (
                        <div className="sidebar-cuentos-sub-menu">
                          <button
                            type="button"
                            className={`sidebar-sub-item ${selectedCategory === 'cuentos' && cuentosSubCategory === 'todos' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('todos');
                            }}
                          >
                            <span className="sub-bullet">▸</span>
                            <span>📚 Todos los Libros</span>
                          </button>

                          <button
                            type="button"
                            className={`sidebar-sub-item sub-colecciones ${selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('colecciones');
                            }}
                          >
                            <span className="sub-bullet">▸</span>
                            <span>📦 Colecciones</span>
                            <span className="sub-badge-mini">Packs</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Bloque de Ordenamiento Compacto */}
            <div className="sidebar-filter-block">
              <label htmlFor="sidebar-sort-select" className="sidebar-filter-title">
                <span>⚡</span> Ordenar Por
              </label>
              <div className="sidebar-sort-select-wrapper">
                <select
                  id="sidebar-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setSortBy(e.target.value as any);
                  }}
                  className="sidebar-sort-dropdown"
                >
                  <option value="featured">⭐ Destacados Editorial</option>
                  <option value="sold">🔥 Más Populares</option>
                  <option value="price-asc">📈 Menor a Mayor Precio</option>
                  <option value="price-desc">📉 Mayor a Menor Precio</option>
                  <option value="rating">🌟 Mejor Calificados</option>
                </select>
                <span className="dropdown-arrow">▾</span>
              </div>
            </div>

            {/* 3. Bloque de Filtros Rápidos */}
            <div className="sidebar-filter-block">
              <h4 className="sidebar-filter-title">
                <span>🏷️</span> Vista Rápida
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
                  🏷️ En Oferta
                </button>
                <button
                  type="button"
                  className={`sidebar-badge-pill ${filterBadge === 'bestsellers' ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setFilterBadge('bestsellers');
                  }}
                >
                  ⭐ Populares
                </button>
              </div>
            </div>

            {/* 4. Tarjeta de Contacto Directo WhatsApp */}
            <div className="sidebar-whatsapp-card">
              <div className="whatsapp-card-head">
                <span className="whatsapp-card-icon">💬</span>
                <strong>¿Pedidos para Colegios?</strong>
              </div>
              <p>
                Atención personalizada, cotizaciones formales y descuentos por volumen.
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

            {/* Si está en la categoría Cuentos y Libros: Barra de Subcategorías Kindle */}
            {selectedCategory === 'cuentos' && (
              <div className="kindle-cuentos-subnav">
                <div className="kindle-subnav-left">
                  <span className="kindle-subnav-title">
                    <span className="kindle-icon">📖</span> Kindle Bookshelf
                  </span>
                  <button
                    type="button"
                    className={`kindle-subnav-pill ${cuentosSubCategory === 'todos' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setCuentosSubCategory('todos');
                    }}
                  >
                    📚 Todos los Libros ({allProducts.filter(p => p.category === 'cuentos').length})
                  </button>
                  <button
                    type="button"
                    className={`kindle-subnav-pill subnav-collections-pill ${cuentosSubCategory === 'colecciones' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setCuentosSubCategory('colecciones');
                    }}
                  >
                    <span className="sparkle">✨</span> 📦 Colecciones ({DEFAULT_BOOK_COLLECTIONS.length})
                  </button>
                  <button
                    type="button"
                    className={`kindle-subnav-pill ${cuentosSubCategory === 'popol-vuh' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setCuentosSubCategory('popol-vuh');
                    }}
                  >
                    ⛈️ Saga Popol Vuh (5)
                  </button>
                  <button
                    type="button"
                    className={`kindle-subnav-pill ${cuentosSubCategory === 'steam' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setCuentosSubCategory('steam');
                    }}
                  >
                    🧬 Serie STEAM (4)
                  </button>
                </div>

                <div className="kindle-subnav-right">
                  <span className="kindle-badge-format-info">
                    ✨ Formato Amazon Kindle · Portadas 3D & Lecturas Pedagógicas
                  </span>
                </div>
              </div>
            )}

            {/* Si se seleccionó la subcategoría Colecciones dentro de Cuentos */}
            {selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? (
              <KindleCollectionsView
                allProducts={allProducts}
                onAddToCart={handleAddToCart}
                onAddCollectionToCart={handleAddCollectionToCart}
                onQuickView={(p) => {
                  soundEffects.playClick();
                  setSelectedProduct(p);
                  setDetailQuantity(1);
                }}
                whatsappPhone={mercadoConfig.whatsappPhone || CONTACT.whatsappPhone}
              />
            ) : selectedCategory === 'cuentos' ? (
              /* Libros en Formato Amazon Kindle (Portadas 3D) */
              filteredProducts.length > 0 ? (
                <div className="kindle-books-grid">
                  {filteredProducts.map(product => (
                    <KindleBookCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={(p) => {
                        soundEffects.playClick();
                        setSelectedProduct(p);
                        setDetailQuantity(1);
                      }}
                      onSelectCollection={(colId) => {
                        soundEffects.playClick();
                        setCuentosSubCategory('colecciones');
                        setTimeout(() => {
                          const el = document.getElementById(`collection-${colId}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 120);
                      }}
                      getSingleProductWhatsAppUrl={getSingleProductWhatsAppUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="amazon-empty-results">
                  <span className="empty-icon-box">🔍</span>
                  <h3>No se encontraron libros</h3>
                  <p>Intenta con otros términos de búsqueda o cambia la subcategoría seleccionada.</p>
                  <button 
                    type="button" 
                    className="btn-reset-filters"
                    onClick={() => {
                      setCuentosSubCategory('todos');
                      setSearchQuery('');
                      setFilterBadge('all');
                    }}
                  >
                    Ver Todos los Libros
                  </button>
                </div>
              )
            ) : (
              /* Demás categorías de la tienda: Juegos, Personajes, etc. (Mantienen diseño retail estándar) */
              filteredProducts.length > 0 ? (
                <div className="amazon-products-grid">
                  {filteredProducts.map(product => {
                    const discountPercent = product.originalPrice 
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;

                    return (
                      <article key={product.id} className="amazon-product-card clean-product-card">
                        {/* Insignia discreta (máximo una para no saturar) */}
                        {(product.badge || discountPercent > 0) && (
                          <div className="card-top-badges">
                            {product.badge ? (
                              <span className="clean-badge">
                                {product.badge}
                              </span>
                            ) : (
                              <span className="clean-badge badge-discount">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* Ilustración / Imagen del producto */}
                        <div 
                          className="card-image-box"
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedProduct(product);
                            setDetailQuantity(1);
                          }}
                          title={`Ver detalle de ${product.title}`}
                        >
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="card-product-img" loading="lazy" />
                          ) : (
                            <span className="card-product-icon">{product.icon}</span>
                          )}
                        </div>

                        {/* Cuerpo de la Tarjeta */}
                        <div className="card-details-box">
                          <div className="card-meta-line">
                            <span className="card-category-label">{product.categoryLabel}</span>
                            {product.gradeOrAge && (
                              <span className="card-grade-hint">· {product.gradeOrAge}</span>
                            )}
                          </div>
                          
                          <h3 
                            className="card-product-title"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedProduct(product);
                              setDetailQuantity(1);
                            }}
                            title={product.title}
                          >
                            {product.title}
                          </h3>

                          {product.description && (
                            <p 
                              className="card-short-desc"
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedProduct(product);
                                setDetailQuantity(1);
                              }}
                              title={product.description}
                            >
                              {product.description}
                            </p>
                          )}

                          {/* Calificación concisa y despejada */}
                          <div className="card-rating-row">
                            <span className="clean-star-icon">★</span>
                            <span className="rating-score">{product.rating.toFixed(1)}</span>
                            <span className="reviews-count">({product.reviewsCount})</span>
                          </div>

                          {/* Fila de Precios Limpia */}
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
                          </div>

                          {/* Botones de Acción */}
                          <div className="card-actions-row">
                            <button
                              type="button"
                              className="amazon-add-btn"
                              onClick={() => handleAddToCart(product, 1)}
                              title="Agregar al Carrito"
                            >
                              <span>🛒 Agregar</span>
                            </button>
                            
                            <button
                              type="button"
                              className="amazon-quick-view-btn"
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedProduct(product);
                                setDetailQuantity(1);
                              }}
                              title="Vista rápida"
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
              )
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
                {selectedProduct.category === 'cuentos' ? (
                  <div className="modal-kindle-cover-stage">
                    <KindleBookCover 
                      product={selectedProduct} 
                      size="lg" 
                      showLookInsideBadge={false} 
                    />
                    <div className="kindle-modal-format-badge">
                      <span>📖 {selectedProduct.formatType || 'Formato Físico de Lujo + Versión Digital'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="modal-image-display">
                    {selectedProduct.image ? (
                      <img src={selectedProduct.image} alt={selectedProduct.title} className="modal-hero-img" />
                    ) : (
                      <span className="modal-hero-icon">{selectedProduct.icon}</span>
                    )}
                  </div>
                )}

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

                {selectedProduct.category === 'cuentos' && (
                  <div className="modal-kindle-byline">
                    <span>de <strong>{selectedProduct.author || 'Editorial Lluvia de Ideas'}</strong> (Editorial & Autores)</span>
                    {selectedProduct.pages && (
                      <span className="modal-kindle-pages-tag">· {selectedProduct.pages} páginas</span>
                    )}
                  </div>
                )}

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

                {/* Si pertenece a una colección (Subcategoría interactiva) */}
                {selectedProduct.collectionName && selectedProduct.collectionId && (
                  <div className="modal-kindle-collection-card">
                    <div className="col-card-text">
                      <span className="col-tag-small">📦 COLECCIÓN EDITORIAL</span>
                      <h4 className="col-name-h4">
                        Este libro forma parte de: <strong>{selectedProduct.collectionName}</strong>
                      </h4>
                      <p className="col-expl-p">
                        Puedes adquirir la colección completa con descuento de pack especial o explorar los otros títulos que la componen.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-modal-open-collection"
                      onClick={() => {
                        soundEffects.playClick();
                        const targetCol = selectedProduct.collectionId;
                        setSelectedProduct(null);
                        setSelectedCategory('cuentos');
                        setCuentosSubCategory('colecciones');
                        setTimeout(() => {
                          const el = document.getElementById(`collection-${targetCol}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 150);
                      }}
                    >
                      <span>Ver Colección Completa ▸</span>
                    </button>
                  </div>
                )}

                {/* Estante de Libros Compañeros de la misma Colección */}
                {selectedProduct.collectionId && (
                  <div className="modal-companion-books-rack">
                    <h4 className="companion-rack-title">Otros libros en esta misma colección:</h4>
                    <div className="companion-mini-shelf">
                      {getCollectionBooks(selectedProduct.collectionId, allProducts)
                        .filter(b => b.id !== selectedProduct.id)
                        .map(cb => (
                          <div 
                            key={cb.id} 
                            className="companion-shelf-item"
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedProduct(cb);
                              setDetailQuantity(1);
                            }}
                            title={cb.title}
                          >
                            <div className="companion-shelf-cover">
                              <KindleBookCover product={cb} size="sm" showLookInsideBadge={false} />
                            </div>
                            <span className="companion-shelf-title">{cb.title}</span>
                            <span className="companion-shelf-price">Q {cb.price.toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

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
