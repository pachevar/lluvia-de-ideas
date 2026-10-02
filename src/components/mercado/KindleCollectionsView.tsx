import React, { useState } from 'react';
import { 
  DEFAULT_BOOK_COLLECTIONS, 
  getCollectionBooks, 
  type BookCollection, 
  type MercadoProduct 
} from '../../data/mercadoData';
import KindleBookCover from './KindleBookCover';
import { soundEffects } from '../../utils/soundEffects';

interface KindleCollectionsViewProps {
  allProducts: MercadoProduct[];
  collections?: BookCollection[];
  onAddToCart: (product: MercadoProduct, qty?: number) => void;
  onAddCollectionToCart: (collection: BookCollection, books: MercadoProduct[]) => void;
  onQuickView: (product: MercadoProduct) => void;
  onShareCollection?: (collection: BookCollection) => void;
  whatsappPhone?: string;
  onGoBackToCatalog?: () => void;
}

export const KindleCollectionsView: React.FC<KindleCollectionsViewProps> = ({
  allProducts,
  collections: collectionsProp,
  onAddToCart,
  onAddCollectionToCart,
  onQuickView,
  onShareCollection,
  whatsappPhone = '50246741239',
  onGoBackToCatalog
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedCollectionId, setExpandedCollectionId] = useState<string | null>(null);

  const collections = collectionsProp !== undefined ? collectionsProp : DEFAULT_BOOK_COLLECTIONS;

  const filteredCollections = selectedFilter === 'all'
    ? collections
    : collections.filter(c => c.id === selectedFilter);

  const toggleExpand = (colId: string) => {
    soundEffects.playClick();
    setExpandedCollectionId(prev => (prev === colId ? null : colId));
  };

  const getCollectionWhatsAppUrl = (col: BookCollection, books: MercadoProduct[]) => {
    const lines = [
      '¡Hola Editorial Lluvia de Ideas! 👋',
      `Me interesa adquirir la siguiente colección de libros:`,
      `📦 *${col.title}* (${col.subtitle})`,
      `• Precio Colección: ${col.currency} ${col.price.toFixed(2)} (Ahorro de ${col.currency} ${(col.originalPrice - col.price).toFixed(2)})`,
      `• Libros incluidos (${books.length}):`,
      ...books.map((b, i) => `   ${i + 1}. ${b.title}`),
      '',
      '¿Tienen disponibilidad y formas de envío? ¡Muchas gracias!'
    ];
    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <div className="kindle-collections-container animate-fade-in">
      {/* Banner de Cabecera de Colecciones Limpio y Minimalista */}
      <div className="clean-collections-header">
        <div className="clean-collections-header-text">
          <div className="clean-badge-tag">
            <span>📦 Sagas Literarias y Packs Didácticos</span>
          </div>
          <h2 className="clean-collections-title">
            Colecciones de Libros Curadas
          </h2>
          <p className="clean-collections-desc">
            Packs completos con ahorro exclusivo de editorial. Conoce qué títulos componen cada colección y adquiérelos juntos o de forma individual.
          </p>
        </div>

        {/* Filtros sutiles de Colecciones */}
        {collections.length > 0 && (
          <div className="clean-collections-filters">
            <button
              type="button"
              className={`clean-filter-chip ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.playClick();
                setSelectedFilter('all');
              }}
            >
              Todas ({collections.length})
            </button>
            {collections.map(col => (
              <button
                key={col.id}
                type="button"
                className={`clean-filter-chip ${selectedFilter === col.id ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedFilter(col.id);
                }}
              >
                {col.badge ? `${col.badge}` : col.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="mercado-prelaunch-box animate-fade-in" style={{ maxWidth: '780px', margin: '2rem auto' }}>
          <span className="prelaunch-tag">✨ Próximamente · Colecciones Exclusivas</span>
          <h3 className="prelaunch-title">Nuestras sagas literarias y packs completos están en preparación</h3>
          <p className="prelaunch-desc">
            Muy pronto podrás adquirir colecciones pedagógicas completas de Editorial Lluvia de Ideas en ediciones de lujo y cajas conmemorativas.
          </p>
          <div className="prelaunch-actions" style={{ justifyContent: 'center', marginTop: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {onGoBackToCatalog && (
              <button
                type="button"
                className="btn-prelaunch-whatsapp"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => {
                  soundEffects.playClick();
                  onGoBackToCatalog();
                }}
              >
                📚 Explorar Todo el Catálogo
              </button>
            )}
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('¡Hola Editorial Lluvia de Ideas! 👋 Quisiera información sobre sus próximas colecciones y sagas de libros.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-prelaunch-whatsapp"
              onClick={() => soundEffects.playSuccessFanfare()}
            >
              💬 Consultar Preventa por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        /* Lista de Colecciones con Estantería de Libros Componentes */
        <div className="collections-showcase-list">
          {filteredCollections.map(collection => {
            const componentBooks = getCollectionBooks(collection, allProducts, collections);
            const totalSavings = collection.originalPrice - collection.price;
            const isExpanded = expandedCollectionId === collection.id;

          return (
            <section 
              key={collection.id} 
              className={`collection-showcase-card theme-${collection.id} animate-slide-up`}
              id={`collection-${collection.id}`}
            >
              {/* Encabezado Editorial Limpio de la Colección */}
              <div className="collection-card-header">
                {/* Portada Principal de la Colección para Máximo Realce */}
                <div className="col-header-cover-stage">
                  <div className="col-cover-3d-box">
                    {collection.image ? (
                      <img 
                        src={collection.image} 
                        alt={`Portada de la colección ${collection.title}`}
                        className="col-cover-image" 
                      />
                    ) : componentBooks[0]?.image ? (
                      <img 
                        src={componentBooks[0]?.image} 
                        alt={`Portada de la colección ${collection.title}`}
                        className="col-cover-image" 
                      />
                    ) : (
                      <div className="col-cover-placeholder-box">
                        <span className="col-cover-placeholder-icon">📦</span>
                        <span className="col-cover-placeholder-text">PACK</span>
                      </div>
                    )}
                    <span className="col-cover-pack-tag">📦 Pack {componentBooks.length} Libros</span>
                  </div>
                </div>

                <div className="col-header-left">
                  <div className="col-badge-row">
                    <span className="col-main-badge">{collection.badge}</span>
                    <span className="col-books-count-badge">
                      📚 {componentBooks.length} Libros
                    </span>
                    <span className="col-grade-badge">
                      🎯 {collection.gradeOrAge}
                    </span>
                  </div>
                  
                  <h3 className="col-title">{collection.title}</h3>
                  <span className="col-subtitle">{collection.subtitle}</span>

                  <p className="col-description">{collection.description}</p>

                  <div className="col-features-bullets">
                    {collection.features.slice(0, 3).map((feat, idx) => (
                      <span key={idx} className="col-feature-chip">✓ {feat}</span>
                    ))}
                  </div>
                </div>

                {/* Tarjeta de Precio del Set y Compra Rápida */}
                <div className="col-header-buy-box">
                  <div className="col-price-badge-header">
                    <span>Pack Colección Completa</span>
                  </div>

                  <div className="col-price-values">
                    <div className="col-current-price-row">
                      <span className="col-currency">{collection.currency}</span>
                      <span className="col-price-number">{collection.price.toFixed(2)}</span>
                    </div>
                    {collection.originalPrice > collection.price && (
                      <div className="col-original-calc-row">
                        <span className="col-orig-strike">
                          Regular: Q {collection.originalPrice.toFixed(2)}
                        </span>
                        <span className="col-savings-pill">
                          Ahorro Q {totalSavings.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones de la Colección */}
                  <div className="col-cta-actions">
                    <button
                      type="button"
                      className="btn-col-buy-all"
                      onClick={() => onAddCollectionToCart(collection, componentBooks)}
                      title="Agregar los libros de la colección al carrito"
                    >
                      <span>🛒 Comprar Pack ({componentBooks.length} Libros)</span>
                    </button>

                    <a
                      href={getCollectionWhatsAppUrl(collection, componentBooks)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-col-whatsapp"
                      onClick={() => soundEffects.playSuccessFanfare()}
                      title="Pedir colección completa por WhatsApp"
                    >
                      <span>💬 Pedir por WhatsApp</span>
                    </a>

                    {onShareCollection && (
                      <button
                        type="button"
                        className="btn-col-share"
                        onClick={() => onShareCollection(collection)}
                        title="Compartir esta colección en redes sociales o copiar enlace"
                      >
                        <span>🔗 Compartir Pack</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ==============================================================
                  ESTANTERÍA KINDLE: LIBROS QUE COMPONEN LA COLECCIÓN
                  ============================================================== */}
              <div className="collection-shelf-section">
                <div className="shelf-section-header">
                  <div className="shelf-title-wrap">
                    <span className="shelf-icon">📖</span>
                    <div>
                      <h4 className="shelf-title">
                        Libros incluidos en la colección ({componentBooks.length} Títulos)
                      </h4>
                      <span className="shelf-subtitle">
                        Haz clic en cualquier portada para abrir su vista previa
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-toggle-books-accordion"
                    onClick={() => toggleExpand(collection.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? '▲ Ocultar Fichas' : '▼ Ver Fichas y Sinopsis'}</span>
                  </button>
                </div>

                {/* Estante limpio y minimalista con libros 3D Kindle */}
                <div className="kindle-bookshelf-rack">
                  <div className="bookshelf-books-row">
                    {componentBooks.map((book, index) => (
                      <div key={book.id} className="shelf-book-item">
                        {/* Tomo / Orden en la serie */}
                        <div className="shelf-volume-pill">
                          Tomo {index + 1}
                        </div>

                        {/* Portada 3D Kindle */}
                        <div className="shelf-cover-box">
                          <KindleBookCover 
                            product={book}
                            size="md"
                            showLookInsideBadge={true}
                            onClick={() => onQuickView(book)}
                          />
                        </div>

                        {/* Info del libro en la estantería */}
                        <div className="shelf-book-meta">
                          <h5 
                            className="shelf-book-title"
                            onClick={() => onQuickView(book)}
                            title={book.title}
                          >
                            {book.title}
                          </h5>

                          <div className="shelf-book-price-row">
                            {collection.onlySoldAsPack ? (
                              <span className="shelf-price-val" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>
                                🔒 En el Pack
                              </span>
                            ) : (
                              <span className="shelf-price-val">Q {book.price.toFixed(2)}</span>
                            )}
                            <span className="shelf-rating-val">★ {book.rating.toFixed(1)}</span>
                          </div>

                          <div className="shelf-book-buttons">
                            {collection.onlySoldAsPack ? (
                              <button
                                type="button"
                                className="btn-shelf-preview"
                                style={{ width: '100%', borderRadius: '6px', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                                onClick={() => onQuickView(book)}
                                title="Ver detalles y sinopsis del libro"
                              >
                                👁️ Ver Ficha
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-shelf-add-single"
                                  onClick={() => onAddToCart(book, 1)}
                                  title="Agregar al carrito"
                                >
                                  + Carrito
                                </button>
                                <button
                                  type="button"
                                  className="btn-shelf-preview"
                                  onClick={() => onQuickView(book)}
                                  title="Ver detalles del libro"
                                >
                                  👁️
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pedestal sutil y minimalista */}
                  <div className="bookshelf-pedestal-line" aria-hidden="true" />
                </div>

                {/* Acordeón desplegable con detalles y sinopsis de cada libro */}
                {isExpanded && (
                  <div className="collection-breakdown-panel animate-slide-down">
                    <h5 className="breakdown-headline">
                      📋 Desglose detallado de los libros incluidos en esta colección:
                    </h5>
                    <div className="breakdown-grid">
                      {componentBooks.map((book, idx) => (
                        <div key={book.id} className="breakdown-book-card">
                          <div className="breakdown-card-top">
                            <span className="breakdown-num">#{idx + 1}</span>
                            <span className="breakdown-grade">🎯 {book.gradeOrAge}</span>
                            {book.pages && <span className="breakdown-pages">📄 {book.pages} páginas</span>}
                          </div>
                          
                          <h6 className="breakdown-title">{book.title}</h6>
                          <p className="breakdown-synopsis">{book.description}</p>
                          
                          <div className="breakdown-footer">
                            <span className="breakdown-price">
                              {collection.onlySoldAsPack ? (
                                <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>🔒 Venta exclusiva en pack completo</strong>
                              ) : (
                                <>Precio individual: <strong>Q {book.price.toFixed(2)}</strong></>
                              )}
                            </span>
                            <button
                              type="button"
                              className="btn-breakdown-inspect"
                              onClick={() => onQuickView(book)}
                            >
                              Inspeccionar Libro ▸
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default KindleCollectionsView;
