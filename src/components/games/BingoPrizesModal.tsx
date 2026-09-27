import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { BingoPrize } from '../../types';

interface BingoPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: BingoPrize[];
  currentPrizeTitle?: string | null;
  primaryColor?: string;
  accentColor?: string;
}

export const BingoPrizesModal: React.FC<BingoPrizesModalProps> = ({
  isOpen,
  onClose,
  prizes,
  currentPrizeTitle,
  primaryColor = '#a855f7',
  accentColor = '#ec4899',
}) => {
  const [prizesSort, setPrizesSort] = useState<'asc' | 'desc' | 'category'>('asc');
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const sortedPrizes = [...prizes].sort((a, b) => {
    if (prizesSort === 'asc') return (a.order || 0) - (b.order || 0);
    if (prizesSort === 'desc') return (b.order || 0) - (a.order || 0);
    if (prizesSort === 'category') return (a.category || '').localeCompare(b.category || '');
    return 0;
  });

  const handleScrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const activePrize = selectedPrizeIndex !== null ? (sortedPrizes[selectedPrizeIndex] || sortedPrizes[0]) : null;

  return createPortal(
    <>
      <div
        className="player-modal-overlay animate-fade-in"
        onClick={() => {
          onClose();
          setSelectedPrizeIndex(null);
        }}
        style={{
          background: 'rgba(5, 2, 12, 0.92)',
          zIndex: 99999,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="player-modal card-glass animate-zoom-in"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '840px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            borderRadius: '28px',
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 0 50px ${primaryColor}55`,
            background: 'rgba(13, 6, 28, 0.97)',
            overflow: 'hidden',
          }}
        >
          {/* Header Compacto con Select Desplegable de Ordenamiento */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '10px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>🎁</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.3rem',
                  color: '#fff',
                  fontFamily: 'var(--font-gamer)',
                  textShadow: `0 0 12px ${primaryColor}aa`,
                }}
              >
                Galería de Premios
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '5px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <label
                  htmlFor="prizes-sort-select"
                  style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  Organizar:
                </label>
                <select
                  id="prizes-sort-select"
                  value={prizesSort}
                  onChange={(e) => setPrizesSort(e.target.value as 'asc' | 'desc' | 'category')}
                  style={{
                    background: 'rgba(13, 6, 28, 0.95)',
                    color: '#ffffff',
                    border: `1px solid ${primaryColor}`,
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.76rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: `0 0 10px ${primaryColor}44`,
                  }}
                >
                  <option value="asc" style={{ background: '#0d061c', color: '#fff' }}>⬇️ Menor a Mayor</option>
                  <option value="desc" style={{ background: '#0d061c', color: '#fff' }}>⬆️ Mayor a Menor</option>
                  <option value="category" style={{ background: '#0d061c', color: '#fff' }}>🏷️ Por Categoría</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setSelectedPrizeIndex(null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                aria-label="Cerrar galería"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Banner Destacado del Premio en Juego Activo */}
          {currentPrizeTitle && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                border: '1.5px solid #ffd700',
                borderRadius: '16px',
                padding: '10px 16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.65rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  EN JUEGO AHORA:
                </span>
                <div style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '900' }}>
                  {currentPrizeTitle}
                </div>
              </div>
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
            </div>
          )}

          {/* Slider de Showcase Horizontal */}
          <div className="prizes-showcase-container">
            {sortedPrizes.length > 1 && (
              <>
                <button
                  type="button"
                  className="slider-nav-btn prev"
                  onClick={() => handleScrollSlider('left')}
                  aria-label="Premio anterior"
                >
                  ◀
                </button>
                <button
                  type="button"
                  className="slider-nav-btn next"
                  onClick={() => handleScrollSlider('right')}
                  aria-label="Premio siguiente"
                >
                  ▶
                </button>
              </>
            )}

            <div className="prizes-showcase-slider" ref={sliderRef}>
              {sortedPrizes.map((prize, idx) => (
                <div
                  key={prize.id}
                  className="prize-card-item"
                  onClick={() => {
                    setSelectedPrizeIndex(idx);
                    setIsImageZoomed(false);
                  }}
                >
                  <div className="prize-image-wrapper">
                    <img src={prize.image} alt={prize.title} />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: primaryColor,
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.6)',
                        zIndex: 2,
                      }}
                    >
                      Nivel #{prize.order || idx + 1}
                    </span>
                    <div className="prize-image-overlay">
                      <span className="prize-zoom-btn-badge">🔍 Tap para Ampliar</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {prize.category && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: accentColor,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px',
                            display: 'block',
                          }}
                        >
                          {prize.category}
                        </span>
                      )}
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#fff', fontFamily: 'var(--font-gamer)', lineHeight: '1.3' }}>
                        {prize.title}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: '#cbd5e1',
                          lineHeight: '1.45',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {prize.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrizeIndex(idx);
                        setIsImageZoomed(false);
                      }}
                      style={{
                        marginTop: '14px',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        border: `1.5px solid ${primaryColor}88`,
                        background: `linear-gradient(135deg, ${primaryColor}22 0%, rgba(255,255,255,0.05) 100%)`,
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      🔍 Estudiar Premio
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                textAlign: 'center',
                marginTop: '6px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>👈 Desliza horizontalmente para ver todos los premios ({sortedPrizes.length}) 👉</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visor Ampliado de Premio (Lightbox Zoom) */}
      {activePrize && (
        <div
          className="player-modal-overlay animate-fade-in"
          onClick={() => {
            setSelectedPrizeIndex(null);
            setIsImageZoomed(false);
          }}
          style={{
            background: 'rgba(3, 1, 10, 0.95)',
            zIndex: 999999,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div
            className="prize-lightbox-card card-glass animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              borderRadius: '28px',
              border: `3px solid ${primaryColor}`,
              boxShadow: `0 0 60px ${primaryColor}77`,
              background: 'rgba(11, 5, 24, 0.98)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedPrizeIndex(null);
                setIsImageZoomed(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <div style={{ paddingRight: '45px' }}>
              {activePrize.category && (
                <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {activePrize.category}
                </span>
              )}
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-gamer)', textShadow: `0 0 16px ${primaryColor}aa` }}>
                {activePrize.title}
              </h3>
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: isImageZoomed ? '420px' : '280px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#000',
                border: `2px solid ${accentColor}`,
                boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 20px ${accentColor}44`,
                cursor: 'zoom-in',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={() => setIsImageZoomed(!isImageZoomed)}
              title="Toca para alternar Zoom de Imagen"
            >
              <img
                src={activePrize.image}
                alt={activePrize.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: isImageZoomed ? 'contain' : 'cover',
                  transition: 'transform 0.3s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {isImageZoomed ? '🔍 Toca para Reducir' : '🔍 Toca para Ampliar Foto'}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--cyber-cyan)', fontFamily: 'var(--font-gamer)' }}>
                DESCRIPCIÓN DEL PREMIO
              </h4>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                {activePrize.description}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setSelectedPrizeIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : sortedPrizes.length - 1))}
                style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ◀ Anterior
              </button>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>
                Premio {(selectedPrizeIndex ?? 0) + 1} de {sortedPrizes.length}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPrizeIndex((prev) => (prev !== null && prev < sortedPrizes.length - 1 ? prev + 1 : 0))}
                style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
