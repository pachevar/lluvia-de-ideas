import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import JuracanConstellation from '../components/books/JuracanConstellation';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useCart } from '../context/CartContext';
import type { BookAccent, BookCategory, BookProduct } from '../types';
import { DEFAULT_BOOKS } from '../data/books';
import '../styles/juracan-theme.css';

const CATEGORY_LABELS: Record<BookCategory, string> = {
  primaria: 'Primaria',
  basico: 'Básico',
  diversificado: 'Diversificado',
  todos: 'Todos los grados'
};

const ACCENT_FILTERS: { id: BookAccent | 'all'; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'Todos', icon: '🌟', color: 'rgba(255,255,255,0.4)' },
  { id: 'yellow', label: 'Origen & Ciencia', icon: '⚡', color: 'var(--neon-yellow)' },
  { id: 'cyan', label: 'Memoria & Lógica', icon: '💧', color: 'var(--neon-cyan)' },
  { id: 'lilac', label: 'Filosofía & Valores', icon: '🔮', color: 'var(--neon-lilac)' }
];

const toProductId = (id: string) => Array.from(id).reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 100000, 0) + 100;

export default function NuestrosLibros() {
  const navigate = useNavigate();
  const { config } = usePortalConfig();
  const { cart, addToCart, removeFromCart, clearCart, getTotalCartPrice } = useCart();

  const tienda = config.tiendaConfig || {};
  const books = config.libros && config.libros.length > 0 ? config.libros : DEFAULT_BOOKS;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BookCategory | 'todos'>('todos');
  const [accent, setAccent] = useState<BookAccent | 'all'>('all');
  const [mode, setMode] = useState<'store' | 'constellation'>('store');
  const [showCart, setShowCart] = useState(false);
  const [selectedStory, setSelectedStory] = useState<BookProduct | null>(null);

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter(book => {
      const matchCategory = category === 'todos' || book.category === category;
      const matchQuery = !q || [book.title, book.tagline, book.description, book.gradeLevel].some(f => (f || '').toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [books, category, query]);

  const constellationBooks = useMemo(() => {
    if (accent === 'all') return books;
    return books.filter(b => b.accent === accent);
  }, [books, accent]);

  const handleAddToCart = (book: BookProduct) => {
    addToCart({
      id: toProductId(book.id),
      title: book.title,
      category: `Cuento · ${book.gradeLevel || CATEGORY_LABELS[book.category]}`,
      price: book.price || 0,
      rating: 5.0,
      description: book.description || book.tagline,
      image: book.image || book.coverEmoji || '📖'
    });
  };

  const whatsapp = tienda.whatsappPhone || '50246741239';

  return (
    <div className="juracan-theme-container animate-fade-in">

      <LandingTopBar slogan="Ecosistema Educativo" showHomeButton />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem 1.5rem' }}>

        {/* Header de la Tienda */}
        <header className="store-header">
          <div className="store-badge-hud">✨ TIENDA DE CUENTOS · EDITORIAL LLUVIA DE IDEAS</div>
          <h1 className="store-title">Nuestros Libros & Cuentos</h1>
          {tienda.announcement && (
            <p className="store-announcement">📣 {tienda.announcement}</p>
          )}

          {/* Barra de buscador + filtros */}
          <div className="store-toolbar">
            <div className="store-search">
              <span>🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cuento por título, tema o nivel..."
                aria-label="Buscar cuento"
              />
            </div>

            <div className="store-filter-chips">
              <button
                className={`store-chip ${category === 'todos' ? 'active' : ''}`}
                onClick={() => setCategory('todos')}
              >
                🛒 Todos ({books.length})
              </button>
              {(Object.keys(CATEGORY_LABELS) as BookCategory[]).map(cat => {
                const count = books.filter(b => b.category === cat).length;
                return (
                  <button
                    key={cat}
                    className={`store-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alternador Tienda / Constelación */}
          <div className="store-mode-switch">
            <button
              className={`mode-btn ${mode === 'store' ? 'active' : ''}`}
              onClick={() => setMode('store')}
            >
              🛍️ Tienda
            </button>
            <button
              className={`mode-btn ${mode === 'constellation' ? 'active' : ''}`}
              onClick={() => setMode('constellation')}
            >
              ✨ Explorar Constelación
            </button>
          </div>
        </header>

        {/* MODO TIENDA: Ventanas de productos */}
        {mode === 'store' && (
          <>
            <div className="books-store-grid">
              {visibleBooks.map(book => (
                <article key={book.id} className={`book-window accent-${book.accent}`}>
                  <div className="book-window-cover">
                    {book.image ? (
                      <img src={book.image} alt={book.title} loading="lazy" />
                    ) : (
                      <span className="book-cover-emoji">{book.coverEmoji || '📖'}</span>
                    )}
                    {book.badge && <span className="book-window-badge">{book.badge}</span>}
                    {!book.available && <span className="book-window-soldout">AGOTADO</span>}
                  </div>

                  <div className="book-window-body">
                    <h3 className="book-window-title">{book.title}</h3>
                    <span className="book-window-tagline">{book.tagline}</span>
                    <span className="book-window-level">🎯 {book.gradeLevel || CATEGORY_LABELS[book.category]}</span>
                    <p className="book-window-desc">{book.description}</p>

                    <div className="book-window-footer">
                      <span className="book-window-price">${(book.price || 0).toFixed(2)}</span>
                      <button
                        className="book-add-btn"
                        disabled={!book.available}
                        onClick={() => handleAddToCart(book)}
                        title={book.available ? 'Añadir al carrito' : 'Agotado'}
                      >
                        {book.available ? '🛒 Añadir' : '⛔ Agotado'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleBooks.length === 0 && (
              <div className="book-empty-state glass-panel">
                <span style={{ fontSize: '2.5rem' }}>📭</span>
                <p>No encontramos cuentos que coincidan con tu búsqueda.</p>
                <button className="mode-btn active" onClick={() => { setQuery(''); setCategory('todos'); }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Botón flotante del carrito */}
            {cart.length > 0 && (
              <>
                <button className="store-cart-fab" onClick={() => setShowCart(!showCart)}>
                  🛒 <strong>{cart.length}</strong> · ${getTotalCartPrice()}
                </button>

                {showCart && (
                  <div className="store-cart-panel glass-panel">
                    <div className="store-cart-head">
                      <h3>Tu Carrito ({cart.length})</h3>
                      <button className="cart-close" onClick={() => setShowCart(false)}>✕</button>
                    </div>
                    <div className="store-cart-items">
                      {cart.map((item, idx) => (
                        <div key={idx} className="store-cart-item">
                          <span className="store-cart-emoji">{item.image}</span>
                          <div className="store-cart-details">
                            <strong>{item.title}</strong>
                            <span>{item.category}</span>
                          </div>
                          <span className="store-cart-price">${item.price}</span>
                          <button className="btn-remove" onClick={() => removeFromCart(idx)}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="store-cart-foot">
                      <span>Total a Pagar:</span>
                      <strong>${getTotalCartPrice()}</strong>
                    </div>
                    <p className="store-cart-advisory">
                      📧 Coordina tu pedido: <strong>lluviadeideaseditorial@gmail.com</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, background: 'linear-gradient(90deg, #00e5ff, #00b0ff)', color: '#000', fontWeight: 800 }}
                        onClick={() => window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, quiero pedir estos libros de Editorial Lluvia de Ideas: ${cart.map(i => i.title).join(', ')}`)}`, '_blank')}
                      >
                        💬 Pedir por WhatsApp
                      </button>
                      <button className="btn btn-glass" onClick={clearCart}>Vaciar</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* MODO CONSTELACIÓN: Mapa interactivo maya */}
        {mode === 'constellation' && (
          <>
            <div className="store-filter-chips" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
              {ACCENT_FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`store-chip ${accent === f.id ? 'active' : ''}`}
                  onClick={() => setAccent(f.id)}
                  style={{ color: f.color, borderColor: accent === f.id ? f.color : 'rgba(255,255,255,0.15)' }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            <JuracanConstellation
              stories={constellationBooks}
              onSelectStory={(story) => setSelectedStory(story)}
            />

            {selectedStory && (
              <div className="glass-panel animate-slide-up" style={{ padding: '2rem', marginTop: '1rem', borderTop: `2px solid var(--neon-${selectedStory.accent})` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {selectedStory.image ? (
                          <img src={selectedStory.image} alt={selectedStory.title} style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '10px' }} />
                        ) : (
                          selectedStory.coverEmoji || '📖'
                        )}
                      </span>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: `var(--neon-${selectedStory.accent})`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {selectedStory.tagline}
                        </span>
                        <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0 0 0' }}>
                          {selectedStory.title}
                        </h2>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {selectedStory.description}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                      <span>🎯 <strong>Nivel:</strong> {selectedStory.gradeLevel}</span>
                      <span>💲 <strong>Precio:</strong> ${selectedStory.price?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(selectedStory)}
                      style={{ background: 'linear-gradient(90deg, #00e5ff, #00b0ff)', color: '#000', fontWeight: 800, padding: '14px 24px', fontSize: '1rem' }}
                    >
                      🛒 Añadir al Carrito (${selectedStory.price?.toFixed(2)})
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-glass" onClick={() => navigate('/creatika/maquina-de-cuentos')} style={{ flex: 1, fontSize: '0.88rem' }}>
                        🎰 Probar en Cuentos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
