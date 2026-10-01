import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name'>('featured');
  
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
      'Quiero consultar y realizar un pedido en el Mercado Pedagógico:',
      '',
      ...cartItems.map(item => `• ${item.quantity}x ${item.product.title} (Q ${(item.product.price * item.quantity).toFixed(2)})`),
      '',
      `📦 Total Estimado: Q ${totalCartPrice.toFixed(2)}`,
      '',
      '¿Tienen disponibilidad para coordinar la entrega y formas de pago? ¡Muchas gracias!'
    ];

    const message = encodeURIComponent(lines.join('\n'));
    const phone = CONTACT.whatsappPhone || '50246741239';
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
    const phone = CONTACT.whatsappPhone || '50246741239';
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    let list = DEFAULT_MERCADO_PRODUCTS;

    // Filtro por categoría
    if (selectedCategory !== 'todos') {
      list = list.filter(p => p.category === selectedCategory);
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
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      // 'featured'
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="mercado-page-container animate-fade-in">
      {/* Barra de Navegación de la Landing */}
      <LandingTopBar 
        slogan="Mercado Pedagógico · Materiales, Cuentos y Juegos" 
        showHomeButton 
      />

      {/* Hero Header del Mercado */}
      <header className="mercado-hero">
        <div className="mercado-hero-inner">
          <div className="mercado-hero-badge">
            <span>🛍️</span> Tienda Oficial Lluvia de Ideas
          </div>
          <h1 className="mercado-hero-title">
            Mercado Pedagógico & Creativo
          </h1>
          <p className="mercado-hero-subtitle">
            Cuentos interactivos, juegos de mesa tradicionales, personajes articulados, barajas didácticas, kits STEAM y útiles para transformar el aula.
          </p>

          {/* Barra de Búsqueda y Filtros Rápidos */}
          <div className="mercado-search-wrapper">
            <div className="mercado-search-bar">
              <span className="mercado-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar cuentos, juegos, tarjetas, kits de robótica, útiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mercado-search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="mercado-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="mercado-sort-dropdown">
              <label htmlFor="sort-select">Ordenar:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="mercado-select-input"
              >
                <option value="featured">🌟 Destacados</option>
                <option value="price-asc">💵 Precio: Menor a Mayor</option>
                <option value="price-desc">💎 Precio: Mayor a Menor</option>
                <option value="rating">⭐ Mejor Calificados</option>
                <option value="name">🔤 Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Banner de Beneficios */}
          <div className="mercado-perks-row">
            <div className="mercado-perk-item">
              <span className="perk-icon">🚚</span>
              <span>Envíos a toda Guatemala</span>
            </div>
            <div className="mercado-perk-item">
              <span className="perk-icon">🍎</span>
              <span>Materiales aprobados para docentes</span>
            </div>
            <div className="mercado-perk-item">
              <span className="perk-icon">💬</span>
              <span>Cotización directa por WhatsApp</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="mercado-main-content">
        
        {/* Barra de Categorías (Pills con Contador) */}
        <section className="mercado-categories-nav">
          <div className="mercado-categories-track">
            {MERCADO_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'todos' 
                ? DEFAULT_MERCADO_PRODUCTS.length 
                : DEFAULT_MERCADO_PRODUCTS.filter(p => p.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`mercado-cat-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                >
                  <span className="cat-pill-icon">{cat.icon}</span>
                  <span className="cat-pill-label">{cat.label}</span>
                  <span className="cat-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Notificación flotante de agregado al carrito */}
        {addedNotice && (
          <div className="mercado-toast animate-slide-down">
            <span>✨ {addedNotice}</span>
          </div>
        )}

        {/* Resumen de resultados */}
        <div className="mercado-results-header">
          <span className="results-count">
            Mostrando <strong>{filteredProducts.length}</strong> productos
            {selectedCategory !== 'todos' && ` en ${MERCADO_CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
            {searchQuery && ` para "${searchQuery}"`}
          </span>
          {totalCartCount > 0 && (
            <button
              type="button"
              className="btn-view-cart-link"
              onClick={() => {
                soundEffects.playClick();
                setIsCartDrawerOpen(true);
              }}
            >
              <span>🛒 Ver Carrito ({totalCartCount}) · Q {totalCartPrice.toFixed(2)}</span>
            </button>
          )}
        </div>

        {/* Grilla de Productos */}
        {filteredProducts.length > 0 ? (
          <div className="mercado-products-grid">
            {filteredProducts.map(product => (
              <article key={product.id} className="mercado-product-card card-glass">
                {/* Cabecera de la tarjeta */}
                <div className="product-card-top">
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <span className="product-grade-tag">{product.gradeOrAge}</span>
                </div>

                {/* Ilustración / Emoji / Icono central */}
                <div 
                  className="product-card-visual"
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedProduct(product);
                    setDetailQuantity(1);
                  }}
                  title="Ver detalle completo"
                >
                  <div className="product-icon-glow">
                    <span className="product-main-icon">{product.icon}</span>
                  </div>
                </div>

                {/* Información del Producto */}
                <div className="product-card-info">
                  <span className="product-cat-tag">{product.categoryLabel}</span>
                  <h3 
                    className="product-title"
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedProduct(product);
                      setDetailQuantity(1);
                    }}
                  >
                    {product.title}
                  </h3>

                  <div className="product-rating-row">
                    <span className="rating-stars">{'★'.repeat(Math.floor(product.rating))}</span>
                    <span className="rating-num">{product.rating.toFixed(1)}</span>
                    <span className="rating-reviews">({product.reviewsCount})</span>
                  </div>

                  <p className="product-desc">
                    {product.description}
                  </p>

                  <div className="product-price-row">
                    <div className="product-price-wrap">
                      <span className="product-currency">{product.currency}</span>
                      <span className="product-price-val">{product.price.toFixed(2)}</span>
                    </div>

                    <div className="product-card-actions">
                      <button
                        type="button"
                        className="btn-product-detail"
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedProduct(product);
                          setDetailQuantity(1);
                        }}
                        title="Ver detalles pedagógicos"
                      >
                        Detalle
                      </button>
                      <button
                        type="button"
                        className="btn-product-add"
                        onClick={() => handleAddToCart(product, 1)}
                        title="Agregar al carrito"
                      >
                        <span>🛒 Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mercado-empty-state card-glass">
            <span className="empty-icon">🔍</span>
            <h3>No encontramos productos que coincidan</h3>
            <p>Intenta cambiar la categoría o buscar con otros términos como &quot;cuento&quot;, &quot;juego&quot; o &quot;kit&quot;.</p>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
            >
              Mostrar Todos los Productos
            </button>
          </div>
        )}

      </main>

      {/* Botón Flotante del Carrito */}
      {totalCartCount > 0 && (
        <button
          type="button"
          className="mercado-floating-cart-btn animate-bounce-in"
          onClick={() => {
            soundEffects.playClick();
            setIsCartDrawerOpen(true);
          }}
          title="Abrir Carrito de Compras"
        >
          <span className="floating-cart-icon">🛒</span>
          <div className="floating-cart-info">
            <span className="floating-cart-qty">{totalCartCount}</span>
            <span className="floating-cart-price">Q {totalCartPrice.toFixed(2)}</span>
          </div>
        </button>
      )}

      {/* ==============================================================
          DRAWER / PANEL LATERAL DEL CARRITO DE COMPRAS
          ============================================================== */}
      {isCartDrawerOpen && createPortal(
        <div 
          className="mercado-drawer-overlay animate-fade-in"
          onClick={() => setIsCartDrawerOpen(false)}
        >
          <aside 
            className="mercado-cart-drawer animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <div className="drawer-title-wrap">
                <span className="drawer-icon">🛒</span>
                <div>
                  <h3 className="drawer-title">Carrito del Mercado</h3>
                  <span className="drawer-subtitle">{totalCartCount} artículos seleccionados</span>
                </div>
              </div>
              <button 
                type="button" 
                className="drawer-close-btn"
                onClick={() => setIsCartDrawerOpen(false)}
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            {/* Lista de productos en carrito */}
            <div className="cart-drawer-items-list">
              {cartItems.length > 0 ? (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="cart-drawer-item">
                    <span className="cart-item-icon">{product.icon}</span>
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{product.title}</h4>
                      <span className="cart-item-cat">{product.categoryLabel}</span>
                      <span className="cart-item-price">Q {product.price.toFixed(2)} c/u</span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-picker">
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(product.id, -1)}
                          title="Restar uno"
                        >
                          -
                        </button>
                        <span className="qty-val">{quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => handleUpdateQuantity(product.id, 1)}
                          title="Sumar uno"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        Q {(product.price * quantity).toFixed(2)}
                      </div>

                      <button 
                        type="button" 
                        className="btn-remove-item"
                        onClick={() => handleRemoveFromCart(product.id)}
                        title="Quitar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cart-drawer-empty">
                  <span className="empty-cart-icon">🛒</span>
                  <h4>Tu carrito está vacío</h4>
                  <p>Explora nuestras categorías y agrega cuentos, juegos, tarjetas o proyectos para cotizar.</p>
                </div>
              )}
            </div>

            {/* Footer del Carrito */}
            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total-row">
                  <span>Total Estimado:</span>
                  <strong className="cart-total-value">Q {totalCartPrice.toFixed(2)}</strong>
                </div>

                <div className="cart-footer-actions">
                  <a
                    href={getWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-checkout"
                    onClick={() => soundEffects.playSuccessFanfare()}
                  >
                    <span>📱 Realizar Pedido en WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    className="btn-clear-cart"
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
          MODAL DE DETALLE DE PRODUCTO
          ============================================================== */}
      {selectedProduct && createPortal(
        <div 
          className="mercado-modal-overlay animate-fade-in"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="mercado-product-modal card-glass animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top-bar">
              <span className="modal-cat-badge">{selectedProduct.categoryLabel}</span>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setSelectedProduct(null)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-grid">
              {/* Columna Izquierda: Visual & Precio */}
              <div className="modal-visual-col">
                <div className="modal-big-icon-wrap">
                  <span className="modal-big-icon">{selectedProduct.icon}</span>
                </div>

                <div className="modal-price-box">
                  <span className="modal-price-tag">{selectedProduct.currency} {selectedProduct.price.toFixed(2)}</span>
                  <span className="modal-stock-status">🟢 Disponible para Envío</span>
                </div>

                <div className="modal-grade-box">
                  <span>🎯 Recomendado para:</span>
                  <strong>{selectedProduct.gradeOrAge}</strong>
                </div>
              </div>

              {/* Columna Derecha: Información & Pedido */}
              <div className="modal-info-col">
                <div className="modal-title-header">
                  {selectedProduct.badge && (
                    <span className="modal-badge-chip">{selectedProduct.badge}</span>
                  )}
                  <h2 className="modal-product-title">{selectedProduct.title}</h2>
                  <div className="modal-rating">
                    <span className="rating-stars">{'★'.repeat(Math.floor(selectedProduct.rating))}</span>
                    <span>{selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewsCount} opiniones)</span>
                  </div>
                </div>

                <p className="modal-long-desc">
                  {selectedProduct.longDescription}
                </p>

                {/* Características Clave */}
                <div className="modal-section-block">
                  <h4>✨ Aspectos Pedagógicos y Destacados</h4>
                  <ul className="modal-features-list">
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx}>✦ {feat}</li>
                    ))}
                  </ul>
                </div>

                {/* Contenidos del Paquete */}
                {selectedProduct.contents && (
                  <div className="modal-section-block">
                    <h4>📦 Contenido Incluido</h4>
                    <ul className="modal-contents-list">
                      {selectedProduct.contents.map((item, idx) => (
                        <li key={idx}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Selector de Cantidad y Botones de Compra */}
                <div className="modal-purchase-row">
                  <div className="modal-qty-selector">
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

                  <button
                    type="button"
                    className="btn-modal-add-cart"
                    onClick={() => {
                      handleAddToCart(selectedProduct, detailQuantity);
                      setSelectedProduct(null);
                    }}
                  >
                    <span>🛒 Agregar al Carrito (Q {(selectedProduct.price * detailQuantity).toFixed(2)})</span>
                  </button>

                  <a
                    href={getSingleProductWhatsAppUrl(selectedProduct, detailQuantity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modal-whatsapp"
                    onClick={() => soundEffects.playSuccessFanfare()}
                    title="Pedir directamente por WhatsApp"
                  >
                    <span>📱 Pedir vía WhatsApp</span>
                  </a>
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
