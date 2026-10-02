import React, { useState } from 'react';
import type { MercadoProduct, BookCollection } from '../../data/mercadoData';
import { soundEffects } from '../../utils/soundEffects';
import './ProductShareModal.css';

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: MercadoProduct | null;
  collection?: BookCollection | null;
}

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  isOpen,
  onClose,
  product,
  collection
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || (!product && !collection)) return null;

  const isCollection = !!collection;
  const title = isCollection ? collection.title : product!.title;
  const subtitle = isCollection 
    ? collection.subtitle 
    : (product!.categoryLabel || (product!.author ? `de ${product!.author}` : ''));
  const price = isCollection ? collection.price : product!.price;
  const currency = isCollection ? (collection.currency || 'Q') : (product!.currency || 'Q');
  const priceText = `${currency} ${price.toFixed(2)}`;
  const badge = isCollection ? collection.badge : product!.badge;
  const image = isCollection ? collection.image : product!.image;
  const icon = isCollection ? '📦' : (product!.icon || '📖');

  // URL directo y limpio para compartir
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lluviadeideas-educativo.web.app';
  const shareParam = isCollection 
    ? `?c=${encodeURIComponent(collection.id)}`
    : `?p=${encodeURIComponent(product!.id)}`;
  const shareUrl = `${origin}/mercado${shareParam}`;

  const handleCopyLink = async () => {
    soundEffects.playClick();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback para navegadores antiguos
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
    }
  };

  // Mensaje para redes sociales
  const socialMessage = isCollection
    ? `¡Hola! Te recomiendo esta colección de libros de Editorial Lluvia de Ideas: 📚✨\n\n*${title}*\n${subtitle ? `(${subtitle})\n` : ''}💰 Precio especial: ${priceText}\n\n👉 Mírala y pídela aquí:\n${shareUrl}`
    : `¡Hola! Te recomiendo este libro de Editorial Lluvia de Ideas: 📚✨\n\n*${title}*\n💰 Precio: ${priceText}\n\n👉 Míralo y pídela aquí:\n${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(socialMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Descubre "${title}" en la tienda de Editorial Lluvia de Ideas! 📚✨`)}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Recomendación: ${title}`)}&body=${encodeURIComponent(`Hola,\n\nTe recomiendo este material de Editorial Lluvia de Ideas:\n\n${title}\n${priceText}\n\nPuedes verlo directamente en la tienda aquí:\n${shareUrl}\n\n¡Saludos!`)}`;

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    soundEffects.playClick();
    if (canNativeShare) {
      try {
        await navigator.share({
          title,
          text: `¡Mira ${isCollection ? 'esta colección' : 'este libro'} de Editorial Lluvia de Ideas!: ${title}`,
          url: shareUrl
        });
      } catch (e) {
        // Usuario canceló el share dialog o no soportado
      }
    }
  };

  return (
    <div className="product-share-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div className="product-share-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className="share-modal-header">
          <div className="share-header-left">
            <span className="share-header-icon">🔗</span>
            <div>
              <h3 className="share-modal-title">
                {isCollection ? 'Compartir Colección' : 'Compartir Producto'}
              </h3>
              <span className="share-modal-subtitle">
                Comparte este enlace directo en cualquier red social o chat
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="share-modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal de compartir"
          >
            ✕
          </button>
        </div>

        {/* Tarjeta previa del producto/colección */}
        <div className="share-item-preview">
          <div className="share-preview-thumb">
            {image ? (
              <img src={image} alt={title} />
            ) : (
              <span>{icon}</span>
            )}
          </div>
          <div className="share-preview-info">
            {badge && <span className="share-preview-badge">{badge}</span>}
            <h4 className="share-preview-title">{title}</h4>
            {subtitle && <span className="share-preview-author">{subtitle}</span>}
            <div className="share-preview-price">
              <span>{priceText}</span>
              <span className="share-preview-free-shipping">· Entrega 24-48 hrs</span>
            </div>
          </div>
        </div>

        {/* Caja de Copiar Enlace Directo */}
        <div className="share-link-box">
          <label className="share-link-label">Enlace único directo:</label>
          <div className="share-input-row">
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              className="share-url-input"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className={`btn-copy-link ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title="Copiar enlace al portapapeles"
            >
              {copied ? '¡Copiado! ✓' : '📋 Copiar'}
            </button>
          </div>
          {copied && (
            <span className="share-copied-hint animate-fade-in">
              ✨ ¡Enlace copiado al portapapeles! Ya puedes pegarlo donde desees.
            </span>
          )}
        </div>

        {/* Redes Sociales y Mensajería */}
        <div className="share-social-section">
          <span className="share-social-title">Compartir directamente en:</span>
          <div className="share-social-grid">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-btn whatsapp"
              onClick={() => soundEffects.playSuccessFanfare()}
            >
              <span className="social-icon">💬</span>
              <span>WhatsApp</span>
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-btn facebook"
              onClick={() => soundEffects.playClick()}
            >
              <span className="social-icon">📘</span>
              <span>Facebook</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-btn twitter"
              onClick={() => soundEffects.playClick()}
            >
              <span className="social-icon">✖️</span>
              <span>X (Twitter)</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-social-btn telegram"
              onClick={() => soundEffects.playClick()}
            >
              <span className="social-icon">✈️</span>
              <span>Telegram</span>
            </a>

            <a
              href={emailUrl}
              className="share-social-btn email"
              onClick={() => soundEffects.playClick()}
            >
              <span className="social-icon">✉️</span>
              <span>Correo</span>
            </a>

            {canNativeShare && (
              <button
                type="button"
                className="share-social-btn native-share"
                onClick={handleNativeShare}
              >
                <span className="social-icon">📱</span>
                <span>Más apps...</span>
              </button>
            )}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="share-modal-footer">
          <span className="share-footer-note">
            💡 Al abrir este enlace, la persona entrará directo a la ficha del producto con opciones de compra.
          </span>
          <button type="button" className="btn-share-done" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductShareModal;
