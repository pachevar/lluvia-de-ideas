import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JuracanConstellation, { DEFAULT_STORIES, type StoryNode } from '../components/books/JuracanConstellation';
import { useCart } from '../context/CartContext';
import '../styles/juracan-theme.css';

export default function NuestrosLibros() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedStory, setSelectedStory] = useState<StoryNode | null>(DEFAULT_STORIES[0]);
  const [filterAccent, setFilterAccent] = useState<'all' | 'yellow' | 'cyan' | 'lilac'>('all');

  const filteredStories = filterAccent === 'all' 
    ? DEFAULT_STORIES 
    : DEFAULT_STORIES.filter(s => s.accent === filterAccent);

  const handleAddToCart = (story: StoryNode) => {
    addToCart({
      id: Number(story.id) + 100,
      title: story.title,
      category: `Libro Pedagógico (${story.gradeLevel || 'Editorial'})`,
      price: story.price || 15.00,
      rating: 5.0,
      description: story.description || story.tagline,
      image: story.coverEmoji || '📖'
    });
  };

  return (
    <div className="juracan-theme-container animate-fade-in">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
        
        {/* Header de la Sección HUD */}
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '30px', background: 'rgba(255, 230, 0, 0.1)', border: '1px solid rgba(255, 230, 0, 0.3)', color: '#ffe600', fontWeight: 700, fontSize: '0.82rem', marginBottom: '12px' }}>
            ✨ CONSTELACIÓN PEDAGÓGICA MAYA
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, background: 'linear-gradient(90deg, #ffe600, #00e5ff, #ff2ec4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
            Nuestros Libros & Cuentos
          </h1>
          <p style={{ maxWidth: '750px', margin: '0 auto', fontSize: '1.1rem', color: '#9ca3af', lineHeight: 1.6 }}>
            Navega por la red estelar interactiva para explorar la colección completa de cuentos, leyendas y guías didácticas de Editorial Lluvia de Ideas.
          </p>

          {/* Filtros de la Constelación */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${filterAccent === 'all' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setFilterAccent('all')}
              style={{ fontSize: '0.85rem' }}
            >
              🌟 Todos los Libros ({DEFAULT_STORIES.length})
            </button>
            <button 
              className={`btn ${filterAccent === 'yellow' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setFilterAccent('yellow')}
              style={{ borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)', fontSize: '0.85rem' }}
            >
              ⚡ Origen & Ciencia
            </button>
            <button 
              className={`btn ${filterAccent === 'cyan' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setFilterAccent('cyan')}
              style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', fontSize: '0.85rem' }}
            >
              💧 Memoria & Lógica
            </button>
            <button 
              className={`btn ${filterAccent === 'lilac' ? 'btn-primary' : 'btn-glass'}`}
              onClick={() => setFilterAccent('lilac')}
              style={{ borderColor: 'var(--neon-lilac)', color: 'var(--neon-lilac)', fontSize: '0.85rem' }}
            >
              🔮 Filosofía & Valores
            </button>
          </div>
        </header>

        {/* Mapa Interactivo de Constelación */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <JuracanConstellation 
            stories={filteredStories} 
            onSelectStory={(story) => setSelectedStory(story)} 
          />
        </div>

        {/* Visor de Inspección de Libro Seleccionado */}
        {selectedStory && (
          <div className="glass-panel animate-slide-up" style={{ padding: '2rem', marginTop: '1rem', borderTop: `2px solid var(--neon-${selectedStory.accent})` }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {selectedStory.coverEmoji || '📖'}
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

              {/* Botones de Acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(selectedStory)}
                  style={{ background: 'linear-gradient(90deg, #00e5ff, #00b0ff)', color: '#000', fontWeight: 800, padding: '14px 24px', fontSize: '1rem' }}
                >
                  🛒 Añadir al Carrito (${selectedStory.price?.toFixed(2)})
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-glass"
                    onClick={() => navigate('/creatika/maquina-de-cuentos')}
                    style={{ flex: 1, fontSize: '0.88rem' }}
                  >
                    🎰 Probar en Cuentos
                  </button>
                  <button 
                    className="btn btn-glass"
                    onClick={() => navigate('/catalogo')}
                    style={{ flex: 1, fontSize: '0.88rem' }}
                  >
                    📚 Ver Catálogo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
