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
    if (config?.mercadoProducts !== undefined && Array.isArray(config.mercadoProducts)) {
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
  
  // Estado del Menú Vertical Desplegable (Desktop y Móvil)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mercado_sidebar_open') !== 'false';
    } catch {
      return true;
    }
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isCuentosAccordionOpen, setIsCuentosAccordionOpen] = useState<boolean>(true);

  const toggleSidebar = () => {
    soundEffects.playClick();
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mercado_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

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
        setIsMobileDrawerOpen(false);
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

  // Leer parámetros URL para enlace directo desde el Home
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      const sub = params.get('sub');
      if (cat) setSelectedCategory(cat);
      if (sub && (sub === 'colecciones' || sub === 'steam' || sub === 'popol-vuh' || sub === 'todos')) {
        setCuentosSubCategory(sub);
      }
    } catch {
      // Ignorar errores de URL
    }
  }, []);

  // Agregar colección completa al carrito con fanfarria de éxito y precio de paquete con descuento
  const handleAddCollectionToCart = (collection: BookCollection, books: MercadoProduct[]) => {
    soundEffects.playSuccessFanfare();
    const bundleProduct: MercadoProduct = {
      id: `bundle-${collection.id}`,
      title: `Colección: ${collection.title} (${books.length} Libros)`,
      category: 'cuentos',
      categoryLabel: 'Colección de Libros',
      price: collection.price,
      originalPrice: collection.originalPrice,
      currency: collection.currency || 'Q',
      rating: collection.rating,
      reviewsCount: collection.reviewsCount,
      soldCount: collection.soldCount,
      deliveryTime: 'Entrega 24-48 hrs en caja de colección',
      description: collection.description,
      longDescription: `${collection.subtitle}. Incluye los ${books.length} títulos de la saga: ${books.map(b => b.title).join(', ')}.`,
      badge: collection.badge || 'PACK COLECCIÓN',
      icon: '📦',
      image: books[0]?.image,
      gradeOrAge: collection.gradeOrAge,
      features: collection.features,
      contents: books.map(b => `1x ${b.title}`),
      featured: true,
      inStock: true
    };

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === bundleProduct.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === bundleProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: bundleProduct, quantity: 1 }];
    });

    setAddedNotice(`¡Colección "${collection.title}" añadida con precio especial de Q ${collection.price.toFixed(2)} (Ahorras Q ${(collection.originalPrice - collection.price).toFixed(2)})!`);
    setTimeout(() => {
      setAddedNotice(null);
    }, 3500);
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

  const currentCatObj = useMemo(() => {
    return MERCADO_CATEGORIES.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  const isCollectionsActive = selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones';

  const activeCategoryDisplayLabel = isCollectionsActive
    ? 'Colecciones de Libros'
    : (currentCatObj?.label || 'Todo el Catálogo');

  const activeCategoryDisplayIcon = isCollectionsActive
    ? '📦'
    : (currentCatObj?.icon || '✨');

  const activeCategoryItemCount = isCollectionsActive
    ? DEFAULT_BOOK_COLLECTIONS.length
    : (categoryCounts[selectedCategory] || allProducts.length);

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

      {/* Barra de Control de Navegación del Catálogo (Desktop & Móvil) */}
      <nav className="mercado-catalog-control-bar">
        <div className="catalog-control-inner">
          {/* Botón Desplegable para Desktop */}
          <button
            type="button"
            className={`btn-toggle-sidebar-desktop ${isSidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Ocultar menú vertical de departamentos" : "Desplegar menú vertical de departamentos"}
          >
            <span className="toggle-icon">☰</span>
            <span className="toggle-label">{isSidebarOpen ? 'Ocultar Menú' : 'Ver Departamentos'}</span>
            <span className={`toggle-chevron ${isSidebarOpen ? 'open' : ''}`}>▾</span>
          </button>

          {/* Botón Desplegable Exclusivo para Móvil */}
          <button
            type="button"
            className="btn-mobile-dept-trigger"
            onClick={() => {
              soundEffects.playClick();
              setIsMobileDrawerOpen(true);
            }}
            title="Abrir departamentos y categorías"
          >
            <span className="btn-mobile-hamburger">☰</span>
            <span className="btn-mobile-icon">{activeCategoryDisplayIcon}</span>
            <div className="btn-mobile-texts">
              <span className="btn-mobile-pre">Categoría</span>
              <span className="btn-mobile-title">{activeCategoryDisplayLabel}</span>
            </div>
            <span className="btn-mobile-badge">{activeCategoryItemCount}</span>
            <span className="btn-mobile-chevron">▾</span>
          </button>

          {/* Breadcrumbs de Ubicación Actual */}
          <div className="catalog-breadcrumbs">
            <button 
              type="button" 
              className="breadcrumb-link"
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory('todos');
                setCuentosSubCategory('todos');
                setFilterBadge('all');
              }}
            >
              Mercado
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{activeCategoryDisplayLabel}</span>
          </div>

          {/* Selector de Ordenación Rápida */}
          <div className="dept-sort-box">
            <label htmlFor="dept-sort-select" className="dept-sort-label">Ordenar:</label>
            <select
              id="dept-sort-select"
              value={sortBy}
              onChange={(e) => {
                soundEffects.playClick();
                setSortBy(e.target.value as any);
              }}
              className="dept-sort-select"
            >
              <option value="featured">★ Destacados</option>
              <option value="price-asc">↑ Menor Precio</option>
              <option value="price-desc">↓ Mayor Precio</option>
              <option value="rating">★ Calificación</option>
              <option value="sold">🔥 Más Vendidos</option>
            </select>
          </div>
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
              BARRA LATERAL VERTICAL DESPLEGABLE (Desktop Web)
              ============================================================== */}
          {isSidebarOpen && (
            <aside className="mercado-vertical-sidebar animate-fade-in" aria-label="Menú vertical de departamentos">
              <div className="sidebar-header-row">
                <div className="sidebar-header-title">
                  <span className="sidebar-header-icon">📂</span>
                  <span>Departamentos</span>
                </div>
                <button
                  type="button"
                  className="sidebar-close-toggle"
                  onClick={toggleSidebar}
                  title="Ocultar menú vertical"
                >
                  ◀
                </button>
              </div>

              {/* Lista Vertical de Departamentos con Acordeón Desplegable */}
              <div className="sidebar-filter-block">
                <div className="sidebar-categories-vertical-list">
                  {MERCADO_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id && (cat.id !== 'cuentos' || cuentosSubCategory !== 'colecciones');
                    const count = categoryCounts[cat.id] || 0;
                    const isCuentos = cat.id === 'cuentos';

                    return (
                      <div key={cat.id} className="sidebar-cat-group">
                        <div className="sidebar-cat-row">
                          <button
                            type="button"
                            className={`sidebar-vertical-cat-item ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedCategory(cat.id);
                              if (isCuentos) {
                                setCuentosSubCategory('todos');
                                setIsCuentosAccordionOpen(true);
                              }
                            }}
                          >
                            <div className="sidebar-cat-left">
                              <span className="sidebar-cat-emoji">{cat.icon}</span>
                              <span className="sidebar-cat-name">{cat.label}</span>
                            </div>
                            <span className="sidebar-cat-number">{count}</span>
                          </button>
                          {isCuentos && (
                            <button
                              type="button"
                              className={`sidebar-accordion-toggle-btn ${isCuentosAccordionOpen ? 'expanded' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEffects.playClick();
                                setIsCuentosAccordionOpen(prev => !prev);
                              }}
                              title={isCuentosAccordionOpen ? "Colapsar opciones de libros" : "Desplegar opciones de libros"}
                              aria-label="Desplegar u ocultar subcategorías de libros"
                            >
                              ▾
                            </button>
                          )}
                        </div>

                        {/* Acordeón Vertical Desplegable de Cuentos */}
                        {isCuentos && isCuentosAccordionOpen && (
                          <div className="sidebar-subitems-vertical animate-slide-down">
                            <button
                              type="button"
                              className={`sidebar-subitem-btn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? 'active' : ''}`}
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedCategory('cuentos');
                                setCuentosSubCategory('colecciones');
                              }}
                            >
                              <span className="subitem-icon">📦</span>
                              <div className="subitem-text-group">
                                <span className="subitem-title">Colecciones & Sagas</span>
                                <span className="subitem-badge-pill">Ahorro</span>
                              </div>
                              <span className="subitem-count">{DEFAULT_BOOK_COLLECTIONS.length}</span>
                            </button>

                            <button
                              type="button"
                              className={`sidebar-subitem-btn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'popol-vuh' ? 'active' : ''}`}
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedCategory('cuentos');
                                setCuentosSubCategory('popol-vuh');
                              }}
                            >
                              <span className="subitem-icon">🌌</span>
                              <span className="subitem-title">Saga Popol Vuh (c-5 a c-9)</span>
                            </button>

                            <button
                              type="button"
                              className={`sidebar-subitem-btn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'steam' ? 'active' : ''}`}
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedCategory('cuentos');
                                setCuentosSubCategory('steam');
                              }}
                            >
                              <span className="subitem-icon">🚀</span>
                              <span className="subitem-title">Colección STEAM</span>
                            </button>

                            <button
                              type="button"
                              className={`sidebar-subitem-btn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'todos' ? 'active' : ''}`}
                              onClick={() => {
                                soundEffects.playClick();
                                setSelectedCategory('cuentos');
                                setCuentosSubCategory('todos');
                              }}
                            >
                              <span className="subitem-icon">📖</span>
                              <span className="subitem-title">Todos los Libros ({categoryCounts['cuentos'] || 9})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filtros Rápidos Verticales */}
              <div className="sidebar-filter-block">
                <h4 className="sidebar-filter-title"><span>⚡</span> Filtros Directos</h4>
                <div className="sidebar-badge-filter-group">
                  <button
                    type="button"
                    className={`sidebar-badge-pill ${filterBadge === 'offers' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setFilterBadge(prev => prev === 'offers' ? 'all' : 'offers');
                    }}
                  >
                    🔥 En Oferta / Descuento
                  </button>
                  <button
                    type="button"
                    className={`sidebar-badge-pill ${filterBadge === 'bestsellers' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setFilterBadge(prev => prev === 'bestsellers' ? 'all' : 'bestsellers');
                    }}
                  >
                    ⭐ Más Vendidos
                  </button>
                </div>
              </div>

              {/* Tarjeta Institucional WhatsApp */}
              <div className="sidebar-whatsapp-card">
                <span className="whatsapp-card-title">💬 ¿Pedidos Escolares?</span>
                <p className="whatsapp-card-desc">Atención y cotizaciones inmediatas para directores y docentes con factura institucional.</p>
                <a
                  href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('Hola Editorial Lluvia de Ideas, deseo información de materiales para mi colegio')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-card-btn"
                >
                  Escribir al WhatsApp ➔
                </a>
              </div>
            </aside>
          )}


          {/* ==============================================================
              ÁREA PRINCIPAL DE PRODUCTOS (4 Columnas en Web)
              ============================================================== */}
          <section className="mercado-catalog-content">
            {allProducts.length === 0 ? (
              <div className="mercado-prelaunch-box animate-fade-in">
                <div className="prelaunch-badge-tag">
                  <span>🚀 Prelanzamiento Oficial</span>
                </div>
                <div className="prelaunch-icon-circle">
                  <span>✨</span>
                </div>
                <h2 className="prelaunch-headline">Catálogo Oficial en Proceso de Carga</h2>
                <p className="prelaunch-subtext">
                  Estamos integrando el inventario oficial de cuentos ilustrados, proyectos pedagógicos STEAM,
                  juegos de mesa y materiales didácticos directos de <strong>Editorial Lluvia de Ideas</strong>.
                </p>
                <div className="prelaunch-categories-preview">
                  <div className="prelaunch-cat-chip">📚 Cuentos & Sagas Literarias</div>
                  <div className="prelaunch-cat-chip">🚀 Proyectos STEAM & Robótica</div>
                  <div className="prelaunch-cat-chip">🎲 Juegos de Mesa & Estrategia</div>
                  <div className="prelaunch-cat-chip">🎴 Barajas & Tarjetas Didácticas</div>
                </div>
                <div className="prelaunch-contact-box">
                  <p>¿Deseas cotizar o consultar disponibilidad para tu colegio o familia de forma anticipada?</p>
                  <a 
                    href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('¡Hola Editorial Lluvia de Ideas! Me gustaría consultar sobre el catálogo y prelanzamiento de materiales didácticos.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-prelaunch-whatsapp"
                  >
                    <span>💬 Consultar Preventa por WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
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

            {/* Banner Institucional de Cotizaciones para Colegios (Discreto y Elegante) */}
            <div className="mercado-institutional-banner">
              <div className="inst-banner-content">
                <span className="inst-banner-icon">💬</span>
                <div className="inst-banner-text">
                  <h4 className="inst-banner-title">¿Pedidos o Cotizaciones para Instituciones Educativas?</h4>
                  <p className="inst-banner-desc">
                    Atención personalizada, cotizaciones formales, facturación contable y descuentos especiales por volumen para docentes y colegios.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('¡Hola Editorial Lluvia de Ideas! Me gustaría cotizar materiales y cuentos para una institución educativa.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inst-banner-btn"
                title="Contactar con un asesor pedagógico"
              >
                <span>Cotizar por WhatsApp</span>
              </a>
            </div>
            </>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h4 className="sidebar-item-title">{product.title}</h4>
                        {product.badge && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <span className="sidebar-item-category">{product.categoryLabel}</span>
                      
                      <div className="sidebar-item-price-row">
                        <span className="sidebar-unit-price">
                          Q {product.price.toFixed(2)} c/u
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '6px', fontSize: '0.78rem' }}>
                              Q {product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </span>
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

      {/* ==============================================================
          MENÚ VERTICAL DESPLEGABLE MÓVIL (Off-Canvas Drawer)
          ============================================================== */}
      {isMobileDrawerOpen && createPortal(
        <div 
          className="mercado-mobile-drawer-overlay animate-fade-in" 
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="mercado-mobile-drawer-sheet animate-slide-in-left" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menú vertical de departamentos de la tienda"
          >
            {/* Header del Menú Móvil */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title-group">
                <span className="mobile-drawer-icon">🛒</span>
                <div>
                  <h3 className="mobile-drawer-title">Departamentos</h3>
                  <p className="mobile-drawer-subtitle">Editorial Lluvia de Ideas</p>
                </div>
              </div>
              <button 
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => {
                  soundEffects.playClick();
                  setIsMobileDrawerOpen(false);
                }}
                aria-label="Cerrar menú de departamentos"
              >
                ✕
              </button>
            </div>

            {/* Contenido Scrollable Vertical de Categorías */}
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-cat-list">
                {MERCADO_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id && (cat.id !== 'cuentos' || cuentosSubCategory !== 'colecciones');
                  const count = categoryCounts[cat.id] || 0;
                  const isCuentos = cat.id === 'cuentos';

                  return (
                    <div key={cat.id} className="mobile-drawer-group">
                      <div className="mobile-drawer-cat-row">
                        <button
                          type="button"
                          className={`mobile-drawer-cat-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedCategory(cat.id);
                            if (isCuentos) {
                              setCuentosSubCategory('todos');
                              setIsCuentosAccordionOpen(true);
                            } else {
                              setIsMobileDrawerOpen(false);
                            }
                          }}
                        >
                          <span className="mobile-cat-emoji">{cat.icon}</span>
                          <div className="mobile-cat-info">
                            <span className="mobile-cat-name">{cat.label}</span>
                          </div>
                          <span className="mobile-cat-count">{count}</span>
                        </button>
                        {isCuentos && (
                          <button
                            type="button"
                            className={`mobile-cat-expand-btn ${isCuentosAccordionOpen ? 'expanded' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEffects.playClick();
                              setIsCuentosAccordionOpen(prev => !prev);
                            }}
                            aria-label="Alternar subcategorías de libros"
                          >
                            ▾
                          </button>
                        )}
                      </div>

                      {/* Subacordeón Móvil para Cuentos y Colecciones */}
                      {isCuentos && isCuentosAccordionOpen && (
                        <div className="mobile-drawer-sublist animate-slide-down">
                          <button
                            type="button"
                            className={`mobile-drawer-subbtn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'colecciones' ? 'active' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('colecciones');
                              setIsMobileDrawerOpen(false);
                            }}
                          >
                            <span className="sub-emoji">📦</span>
                            <div className="sub-text-wrapper">
                              <span className="sub-name">Colecciones & Sagas</span>
                              <span className="sub-badge-tag">Packs Ahorro</span>
                            </div>
                            <span className="sub-count">{DEFAULT_BOOK_COLLECTIONS.length}</span>
                          </button>
                          <button
                            type="button"
                            className={`mobile-drawer-subbtn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'popol-vuh' ? 'active' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('popol-vuh');
                              setIsMobileDrawerOpen(false);
                            }}
                          >
                            <span className="sub-emoji">🌌</span>
                            <span className="sub-name">Saga Popol Vuh (c-5 a c-9)</span>
                          </button>
                          <button
                            type="button"
                            className={`mobile-drawer-subbtn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'steam' ? 'active' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('steam');
                              setIsMobileDrawerOpen(false);
                            }}
                          >
                            <span className="sub-emoji">🚀</span>
                            <span className="sub-name">Colección STEAM</span>
                          </button>
                          <button
                            type="button"
                            className={`mobile-drawer-subbtn ${selectedCategory === 'cuentos' && cuentosSubCategory === 'todos' ? 'active' : ''}`}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedCategory('cuentos');
                              setCuentosSubCategory('todos');
                              setIsMobileDrawerOpen(false);
                            }}
                          >
                            <span className="sub-emoji">📖</span>
                            <span className="sub-name">Todos los Libros ({categoryCounts['cuentos'] || 9})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Filtros Rápidos en Móvil */}
              <div className="mobile-drawer-filters-section">
                <h4 className="mobile-drawer-section-title">⚡ Filtros Rápidos</h4>
                <div className="mobile-drawer-filter-chips">
                  <button
                    type="button"
                    className={`mobile-filter-chip ${filterBadge === 'offers' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setFilterBadge(prev => prev === 'offers' ? 'all' : 'offers');
                      setIsMobileDrawerOpen(false);
                    }}
                  >
                    🔥 Con Descuento
                  </button>
                  <button
                    type="button"
                    className={`mobile-filter-chip ${filterBadge === 'bestsellers' ? 'active' : ''}`}
                    onClick={() => {
                      soundEffects.playClick();
                      setFilterBadge(prev => prev === 'bestsellers' ? 'all' : 'bestsellers');
                      setIsMobileDrawerOpen(false);
                    }}
                  >
                    ⭐ Más Vendidos
                  </button>
                </div>
              </div>

              {/* Pedidos Especiales Móvil */}
              <div className="mobile-drawer-support-card">
                <span className="support-card-emoji">💬</span>
                <div>
                  <h5 className="support-card-title">¿Cotizaciones y Colegios?</h5>
                  <p className="support-card-desc">Atención por WhatsApp para docentes e instituciones.</p>
                </div>
                <a
                  href={`https://wa.me/${mercadoConfig.whatsappPhone || '50246741239'}?text=${encodeURIComponent('Hola Editorial Lluvia de Ideas, deseo información de libros y materiales')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-support-link"
                >
                  Abrir Chat ➔
                </a>
              </div>
            </div>

            {/* Footer Móvil con Botón de Ver Resultados */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="btn-mobile-view-results"
                onClick={() => {
                  soundEffects.playClick();
                  setIsMobileDrawerOpen(false);
                }}
              >
                Ver {filteredProducts.length} productos filtrados ➔
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
