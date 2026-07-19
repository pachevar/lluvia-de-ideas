import { useCart } from '../context/CartContext';
import type { Product } from '../types';

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Aventuras Matemáticas",
    category: "Matemáticas (Primaria)",
    price: 12.99,
    rating: 4.8,
    description: "Libro interactivo y retos lógicos para despertar el amor por los números.",
    image: "📊"
  },
  {
    id: 2,
    title: "Lectura Mágica",
    category: "Gramática y Lectura",
    price: 15.49,
    rating: 4.9,
    description: "Método dinámico con realidad aumentada para lectoescritura rápida.",
    image: "📖"
  },
  {
    id: 3,
    title: "Algoritmos para Niños",
    category: "Programación Básica",
    price: 24.99,
    rating: 4.7,
    description: "Juego de mesa y licencia digital de introducción al pensamiento computacional.",
    image: "💻"
  }
];

export default function Catalogo() {
  const { cart, addToCart, removeFromCart, getTotalCartPrice } = useCart();

  return (
    <div className="tab-pane animate-fade-in">
      <section className="catalog-section">
        <div className="catalog-header-row">
          <div>
            <span className="badge badge-success">Editorial</span>
            <h2 className="gradient-text">Material Educativo</h2>
            <p>Libros interactivos y kits pedagógicos diseñados para fomentar la creatividad.</p>
          </div>
          
          {cart.length > 0 && (
            <div className="cart-summary-box card-glass">
              <div className="cart-summary-header">
                <h5>Tu Carrito ({cart.length})</h5>
                <span className="cart-total-price">${getTotalCartPrice()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="products-grid">
          {PRODUCTS.map(product => (
            <div key={product.id} className="product-card card-glass">
              <div className="product-image-container">
                <span className="product-emoji-large">{product.image}</span>
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-info">
                <div className="title-price-row">
                  <h3>{product.title}</h3>
                  <span className="price">${product.price}</span>
                </div>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="rating">⭐⭐⭐⭐⭐ {product.rating}</span>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(product)}
                  >
                    Añadir al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-detailed-list card-glass">
            <h3>Lista de Compra Detallada</h3>
            <div className="cart-items">
              {cart.map((item, idx) => (
                <div key={idx} className="cart-item-row">
                  <span className="item-emoji">{item.image}</span>
                  <div className="item-details">
                    <h5>{item.title}</h5>
                    <p>{item.category}</p>
                  </div>
                  <span className="item-price">${item.price}</span>
                  <button className="btn-remove" onClick={() => removeFromCart(idx)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-footer-detailed">
              <div className="total-label">Total a Pagar:</div>
              <div className="total-amount">${getTotalCartPrice()}</div>
              <p className="cart-advisory-text">
                📧 Escríbenos a <strong>lluviadeideaseditorial@gmail.com</strong> para coordinar la entrega de tus libros.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
