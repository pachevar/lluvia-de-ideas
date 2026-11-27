import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContestItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';

interface ContestShowcaseCardProps {
  contest: ContestItem;
  isHighlighted: boolean;
  copiedPostId: string | null;
  onPostulate: () => void;
  onShare: (e: React.MouseEvent) => void;
}

export const ContestShowcaseCard: React.FC<ContestShowcaseCardProps> = ({
  contest,
  isHighlighted,
  copiedPostId,
  onPostulate,
  onShare,
}) => {
  const navigate = useNavigate();
  const categories = contest.categories || [];
  const prizes = contest.prizes || [];

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [showAllCats, setShowAllCats] = useState<boolean>(false);

  const activeCategory =
    categories.find((cat) => cat.id === selectedCatId) || categories[0] || null;

  return (
    <article
      id={`contest-${contest.id}`}
      className={`gg-contest-pro-card ${isHighlighted ? 'highlighted' : ''}`}
    >
      {/* Borde superior luminoso animado */}
      <div className="gg-contest-pro-beam" aria-hidden="true" />

      {/* 1. Cabecera Hero de la Convocatoria */}
      <header className="gg-contest-pro-header">
        <div className="gg-contest-pro-badges">
          <span className={`gg-pro-status-pill ${contest.status}`}>
            <span className="gg-status-pulse-dot" aria-hidden="true" />
            {contest.status === 'convocatoria'
              ? 'Convocatoria Abierta'
              : contest.status === 'evaluacion'
                ? 'En Evaluación del Jurado'
                : contest.status === 'galardonados'
                  ? 'Ganadores Publicados'
                  : 'Concluido'}
          </span>
          {contest.editionBadge && (
            <span className="gg-pro-edition-pill">{contest.editionBadge}</span>
          )}
          <span className="gg-pro-discipline-pill">
            {contest.discipline === 'literatura'
              ? '📜 Certamen Literario'
              : contest.discipline === 'arte'
                ? '🎨 Bienal de Arte'
                : contest.discipline === 'video'
                  ? '🎬 Festival de Cine'
                  : '🌐 Multidisciplinar'}
          </span>
        </div>

        <div className="gg-contest-pro-title-row">
          <div>
            <h3 className="gg-contest-pro-title">{contest.title}</h3>
            {contest.subtitle && (
              <p className="gg-contest-pro-subtitle">{contest.subtitle}</p>
            )}
          </div>
          <div className="gg-contest-deadline-box">
            <span className="gg-deadline-label">📅 RECEPCIÓN DE OBRAS</span>
            <strong className="gg-deadline-val">{contest.deadline}</strong>
          </div>
        </div>

        <p className="gg-contest-pro-desc">{contest.description}</p>
      </header>

      {/* 2. Requisito Indispensable: Herramienta de Publicación Sutz */}
      {contest.mandatoryTool && (
        <div className="gg-sutz-requirement-banner">
          <div className="gg-sutz-req-content">
            <span className="gg-sutz-req-icon" aria-hidden="true">
              ✍️
            </span>
            <div>
              <span className="gg-sutz-req-tag">REQUISITO OBLIGATORIO DE PARTICIPACIÓN</span>
              <p className="gg-sutz-req-text">{contest.mandatoryTool}</p>
            </div>
          </div>
          <div className="gg-sutz-req-actions">
            <button
              type="button"
              className="gg-pro-cta-btn"
              onClick={() => {
                soundEffects.playClick();
                onPostulate();
              }}
            >
              <span>✍️</span> Publicar Obra en Sutz
            </button>
            <button
              type="button"
              className="gg-pro-ghost-btn"
              onClick={() => {
                soundEffects.playClick();
                navigate('/sutz');
              }}
            >
              🌐 Ir a Sutz
            </button>
          </div>
        </div>
      )}

      {/* 3. Podio de Premios + Patrocinadores */}
      {prizes.length > 0 ? (
        <section className="gg-prizes-showcase" aria-label="Premios del certamen">
          <div className="gg-block-heading">
            <h4>🏆 Premios Oficiales del Certamen</h4>
            <span>¡Grandes incentivos para impulsar tu talento literario!</span>
          </div>

          <div className="gg-prizes-grid">
            {prizes.map((tier, idx) => (
              <div
                key={tier.id || idx}
                className={`gg-prize-card ${tier.highlight ? 'is-gold' : idx === 1 ? 'is-silver' : 'is-bronze'}`}
              >
                <div className="gg-prize-medal" aria-hidden="true">
                  {tier.medal}
                </div>
                <span className="gg-prize-place">{tier.place}</span>
                <strong className="gg-prize-headline">{tier.headline}</strong>
                <p className="gg-prize-details">{tier.details}</p>
              </div>
            ))}
          </div>

          {contest.sponsorsNote && (
            <div className="gg-sponsors-strip">
              <span className="gg-sponsors-icon" aria-hidden="true">
                🎁
              </span>
              <div>
                <strong>Premios de Marcas Patrocinadoras: </strong>
                <span>{contest.sponsorsNote}</span>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="contest-details-grid">
          <div className="detail-item">
            <span className="detail-label">PREMIACIÓN & RECONOCIMIENTOS</span>
            <strong className="detail-val">{contest.rewardDetails}</strong>
          </div>
        </div>
      )}

      {/* 4. Explorador Interactivo de Categorías y Estándares */}
      {categories.length > 0 && (
        <section className="gg-categories-showcase" aria-label="Categorías y estándares">
          <div className="gg-block-heading">
            <div>
              <h4>📚 Categorías y Estándares Oficiales ({categories.length})</h4>
              <span>Selecciona una categoría para revisar su extensión y criterios editoriales</span>
            </div>
            <button
              type="button"
              className="gg-toggle-cats-btn"
              onClick={() => {
                soundEffects.playClick();
                setShowAllCats((prev) => !prev);
              }}
            >
              {showAllCats ? 'Vista enfocada' : 'Comparar las 5 categorías'}
            </button>
          </div>

          {!showAllCats ? (
            <>
              <div className="gg-cat-tabs-bar" role="tablist" aria-label="Categorías del premio">
                {categories.map((cat) => {
                  const isActive = activeCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`gg-cat-tab-chip ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedCatId(cat.id);
                      }}
                    >
                      <span aria-hidden="true">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {activeCategory && (
                <div key={activeCategory.id} className="gg-cat-detail-panel">
                  <div className="gg-cat-detail-top">
                    <div className="gg-cat-detail-title-wrap">
                      <span className="gg-cat-big-icon" aria-hidden="true">
                        {activeCategory.icon}
                      </span>
                      <div>
                        <h5>{activeCategory.name}</h5>
                        <div className="gg-cat-meta-pills">
                          <span className="gg-cat-meta-pill ext">
                            📏 Extensión: {activeCategory.extension}
                          </span>
                          <span className="gg-cat-meta-pill aud">
                            🎓 {activeCategory.targetAudience}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="gg-pro-cta-btn sm"
                      onClick={() => {
                        soundEffects.playClick();
                        onPostulate();
                      }}
                    >
                      Postular en {activeCategory.name} →
                    </button>
                  </div>

                  <p className="gg-cat-standard-text">{activeCategory.standardDetails}</p>
                  {activeCategory.tips && (
                    <div className="gg-cat-tip-box">
                      <strong>💡 Consejo editorial:</strong> {activeCategory.tips}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="gg-cat-compare-grid">
              {categories.map((cat) => (
                <div key={cat.id} className="gg-cat-compare-card">
                  <div className="gg-cat-compare-head">
                    <span>{cat.icon}</span>
                    <strong>{cat.name}</strong>
                  </div>
                  <div className="gg-cat-compare-ext">📏 {cat.extension}</div>
                  <div className="gg-cat-compare-aud">🎓 {cat.targetAudience}</div>
                  <p>{cat.standardDetails}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Bases Generales + Acciones */}
      {contest.guidelines && contest.guidelines.length > 0 && (
        <div className="gg-pro-guidelines">
          <h4>📋 Bases Generales de Participación</h4>
          <ul>
            {contest.guidelines.map((g, idx) => (
              <li key={idx}>
                <span className="gg-guide-check" aria-hidden="true">
                  ✓
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="gg-contest-pro-footer">
        <button
          type="button"
          className="gg-pro-cta-btn lg"
          onClick={() => {
            soundEffects.playClick();
            onPostulate();
          }}
        >
          <span>🚀</span>
          <span>Postular mi Obra al {contest.title}</span>
        </button>

        <button
          type="button"
          className={`gg-share-card-btn contest ${copiedPostId === contest.id ? 'copied' : ''}`}
          onClick={onShare}
          title="Copiar enlace directo de esta convocatoria"
          aria-label={`Compartir ${contest.title}`}
        >
          <span>{copiedPostId === contest.id ? '✅' : '🔗'}</span>
          <span>{copiedPostId === contest.id ? 'Enlace copiado' : 'Compartir convocatoria'}</span>
        </button>
      </footer>
    </article>
  );
};
