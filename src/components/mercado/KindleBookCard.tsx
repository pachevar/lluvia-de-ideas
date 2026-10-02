import React from 'react';
import type { MercadoProduct } from '../../data/mercadoData';
import KindleBookCover from './KindleBookCover';

interface KindleBookCardProps {
  product: MercadoProduct;
  onAddToCart: (product: MercadoProduct, qty?: number) => void;
  onQuickView: (product: MercadoProduct) => void;
  onSelectCollection?: (collectionId: string) => void;
  onShare?: (product: MercadoProduct) => void;
  getSingleProductWhatsAppUrl?: (product: MercadoProduct, qty?: number) => string;
  isOnlySoldAsPack?: boolean;
}

export const KindleBookCard: React.FC<KindleBookCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onSelectCollection,
  onShare,
  getSingleProductWhatsAppUrl,
  isOnlySoldAsPack = false
}) => {
  const isPackOnly = isOnlySoldAsPack || Boolean(product.onlySoldAsPack);
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <article className="kindle-book-card animate-fade-in" id={`kindle-book-${product.id}`}>
      {/* Top Badges de la Tarjeta */}
      <div className="kindle-card-badges-row">
        {product.badge && (
          <span className={`kindle-badge-pill ${product.badge.includes('POPOL VUH') ? 'badge-myth' : product.badge.includes('MÁS VENDIDO') ? 'badge-bestseller' : 'badge-general'}`}>
            {product.badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="kindle-discount-pill">-{discountPercent}%</span>
        )}
      </div>

      {/* Contenedor del Libro 3D (Kindle Format) */}
      <div className="kindle-card-book-stage">
        <KindleBookCover 
          product={product} 
          size="md"
          onClick={() => onQuickView(product)}
        />
      </div>

      {/* Cuerpo de Metadatos Estilo Amazon Kindle Store */}
      <div className="kindle-card-info-pane">
        {/* Formato y Colección */}
        <div className="kindle-format-strip">
          <span className="kindle-format-text">
            {product.formatType || '📖 Edición Física & Digital'}
          </span>
          {product.pages && (
            <span className="kindle-pages-count">· {product.pages} págs.</span>
          )}
        </div>

        {/* Título del libro (Tipografía Bookerly / Literaria) */}
        <h3 
          className="kindle-book-title"
          onClick={() => onQuickView(product)}
          title={`Ver sinopsis de ${product.title}`}
        >
          {product.title}
        </h3>

        {/* Autor */}
        <div className="kindle-author-byline">
          <span>de <strong>{product.author || 'Editorial Lluvia de Ideas'}</strong> (Editorial)</span>
        </div>

        {/* Pertenencia a Colección (Subcategoría interactiva) */}
        {product.collectionName && product.collectionId && (
          <button 
            type="button" 
            className="kindle-collection-link-btn"
            onClick={() => onSelectCollection?.(product.collectionId!)}
            title={`Explorar todos los libros de ${product.collectionName}`}
          >
            <span className="col-icon">📦</span>
            <span className="col-text">Parte de: <em>{product.collectionName}</em></span>
            <span className="col-arrow">›</span>
          </button>
        )}

        {/* Estrellas y Reseñas Kindle (Color Naranja Dorado) */}
        <div className="kindle-rating-row">
          <div className="kindle-stars-display" aria-label={`Calificación: ${product.rating} de 5 estrellas`}>
            {'★'.repeat(Math.floor(product.rating))}
            {product.rating % 1 !== 0 && '½'}
          </div>
          <span className="kindle-rating-val">{product.rating.toFixed(1)}</span>
          <span className="kindle-reviews-num">({product.reviewsCount})</span>
          {product.soldCount && (
            <span className="kindle-sales-tag">+{product.soldCount} lecturas</span>
          )}
        </div>

        {/* Grado / CNB */}
        <div className="kindle-grade-tag">
          <span className="grade-icon">🎯</span>
          <span>{product.gradeOrAge}</span>
        </div>

        {/* Sinopsis breve */}
        <p className="kindle-short-synopsis">
          {product.description}
        </p>

        {/* Bloque de Precios Amazon */}
        <div className="kindle-pricing-section">
          {isPackOnly ? (
            <div className="kindle-price-main-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800, border: '1px solid #fde68a' }}>
                🔒 Exclusivo de Colección
              </span>
              <span style={{ color: '#64748b', fontSize: '0.74rem' }}>
                Se adquiere únicamente en el pack completo
              </span>
            </div>
          ) : (
            <>
              <div className="kindle-price-main-row">
                <span className="kindle-price-label">Precio:</span>
                <span className="kindle-currency">{product.currency}</span>
                <span className="kindle-price-number">{product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="kindle-price-strikethrough">
                    Q {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.deliveryTime && (
                <span className="kindle-delivery-promise">
                  🚚 {product.deliveryTime}
                </span>
              )}
            </>
          )}
        </div>

        {/* Fila de Botones de Acción */}
        <div className="kindle-actions-row">
          {isPackOnly ? (
            <button
              type="button"
              className="btn-kindle-add-cart"
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => {
                if (product.collectionId && onSelectCollection) {
                  onSelectCollection(product.collectionId);
                } else {
                  onQuickView(product);
                }
              }}
              title="Ver la colección completa a la que pertenece este libro"
            >
              <span>📦 Ver Colección</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-kindle-add-cart"
              onClick={() => onAddToCart(product, 1)}
              title="Añadir este libro al carrito"
            >
              <span>🛒 Agregar al Carrito</span>
            </button>
          )}

          <button
            type="button"
            className="btn-kindle-quick-look"
            onClick={() => onQuickView(product)}
            title="Echar un vistazo al libro"
          >
            <span>👁️ Ver Ficha</span>
          </button>

          {!isPackOnly && getSingleProductWhatsAppUrl && (
            <a
              href={getSingleProductWhatsAppUrl(product, 1)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kindle-whatsapp-direct"
              title="Pedir por WhatsApp"
            >
              <span>💬</span>
            </a>
          )}

          {onShare && (
            <button
              type="button"
              className="btn-kindle-share-direct"
              onClick={() => onShare(product)}
              title="Compartir este libro en redes o copiar enlace"
            >
              <span>🔗</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default KindleBookCard;
