import React, { useState, useEffect, useRef } from 'react';
import type { StudentTextItem } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import {
  COMMENT_STARTERS,
  CUSTOM_GIFT_EMOJIS,
  LITERARY_REACTIONS,
  addLiteraryReactionFirestore,
  addRaindrops,
  containsBlockedLanguage,
  markReadCompletedLocal,
  postTextCommentFirestore,
  sendEmojiGiftFirestore,
  spendRaindrops,
  subscribeTextSocialDetail,
  type CustomGiftEmoji,
  type TextCommentItem,
  type TextGiftItem,
  type TextSocialStats,
} from '../../services/granGaleriaSocialService';

interface ReadingModalProps {
  textItem: StudentTextItem;
  socialStats?: TextSocialStats;
  isLiked: boolean;
  isSaved: boolean;
  raindrops: number;
  currentUserName?: string;
  initialFocusSection?: 'read' | 'comments' | 'gifts';
  onClose: () => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onRaindropsChange: (nextBalance: number) => void;
  onShare?: () => void;
  shareCopied?: boolean;
}

function formatRelativeDate(iso: string): string {
  if (!iso) return 'Hace un momento';
  try {
    const dt = new Date(iso);
    return dt.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export const ReadingModal: React.FC<ReadingModalProps> = ({
  textItem,
  socialStats,
  isLiked,
  isSaved,
  raindrops,
  currentUserName,
  initialFocusSection = 'read',
  onClose,
  onToggleLike,
  onToggleSave,
  onRaindropsChange,
  onShare,
  shareCopied,
}) => {
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(18);
  const [readProgress, setReadProgress] = useState<number>(0);
  const [justEarnedReadDrops, setJustEarnedReadDrops] = useState<boolean>(false);

  // Social en vivo desde Firestore
  const [comments, setComments] = useState<TextCommentItem[]>([]);
  const [gifts, setGifts] = useState<TextGiftItem[]>([]);

  // Estado de comentarios
  const [commentAuthor, setCommentAuthor] = useState<string>(currentUserName || '');
  const [commentText, setCommentText] = useState<string>('');
  const [commentError, setCommentError] = useState<string>('');
  const [sendingComment, setSendingComment] = useState<boolean>(false);

  // Estado de donación con emojis
  const [selectedGift, setSelectedGift] = useState<CustomGiftEmoji>(CUSTOM_GIFT_EMOJIS[1]);
  const [giftSender, setGiftSender] = useState<string>(currentUserName || '');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [giftFeedback, setGiftFeedback] = useState<string>('');
  const [sendingGift, setSendingGift] = useState<boolean>(false);
  const [burstEmoji, setBurstEmoji] = useState<string | null>(null);
  const [reactedIds, setReactedIds] = useState<string[]>([]);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const commentsRef = useRef<HTMLElement | null>(null);
  const giftsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const unsub = subscribeTextSocialDetail(textItem.id, setComments, setGifts);
    return () => unsub();
  }, [textItem.id]);

  useEffect(() => {
    if (initialFocusSection === 'comments' && commentsRef.current) {
      window.setTimeout(() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
    } else if (initialFocusSection === 'gifts' && giftsRef.current) {
      window.setTimeout(() => giftsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
    }
  }, [initialFocusSection]);

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 20) return;
    const pct = Math.min(100, Math.round((el.scrollTop / maxScroll) * 100));
    setReadProgress(pct);

    if (pct >= 85 && markReadCompletedLocal(textItem.id)) {
      const next = addRaindrops(10);
      onRaindropsChange(next);
      setJustEarnedReadDrops(true);
      soundEffects.playSuccess();
    }
  };

  const handleReactionClick = async (reactionId: string) => {
    if (reactedIds.includes(reactionId)) return;
    soundEffects.playClick();
    setReactedIds((prev) => [...prev, reactionId]);
    try {
      await addLiteraryReactionFirestore(textItem.id, reactionId);
    } catch {
      // Silencioso si no hay conexión
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiftFeedback('');
    const result = spendRaindrops(selectedGift.cost);
    if (!result.ok) {
      soundEffects.playError();
      setGiftFeedback(
        `Necesitas ${selectedGift.cost} 🌧️ Gotas (tienes ${result.balance}). ¡Termina de leer relatos (+10) o deja comentarios (+5) para ganar más!`
      );
      return;
    }

    setSendingGift(true);
    try {
      await sendEmojiGiftFirestore(
        textItem.id,
        selectedGift,
        giftSender.trim() || currentUserName || 'Lector de la Gran Biblioteca',
        giftMessage
      );
      onRaindropsChange(result.balance);
      soundEffects.playSuccess();
      setBurstEmoji(selectedGift.emoji);
      window.setTimeout(() => setBurstEmoji(null), 1500);
      setGiftMessage('');
      setGiftFeedback(`¡Enviaste ${selectedGift.emoji} ${selectedGift.name} al autor!`);
    } catch {
      const refunded = addRaindrops(selectedGift.cost);
      onRaindropsChange(refunded);
      setGiftFeedback('No se pudo enviar el apoyo en este momento. Intenta de nuevo.');
    } finally {
      setSendingGift(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    const finalAuthor = (commentAuthor || currentUserName || '').trim();
    const finalText = commentText.trim();

    if (finalAuthor.length < 2) {
      setCommentError('Escribe tu nombre o seudónimo para publicar tu comentario.');
      return;
    }
    if (finalText.length < 3) {
      setCommentError('Escribe un comentario un poco más completo para el autor.');
      return;
    }
    if (containsBlockedLanguage(finalText) || containsBlockedLanguage(finalAuthor)) {
      soundEffects.playError();
      setCommentError('Mantengamos un espacio escolar amable y respetuoso.');
      return;
    }

    setSendingComment(true);
    try {
      await postTextCommentFirestore(textItem.id, {
        authorName: finalAuthor,
        authorBadge: currentUserName ? '✨ Lector Sutz' : '📖 Visitante',
        text: finalText,
      });
      const next = addRaindrops(5);
      onRaindropsChange(next);
      soundEffects.playSuccess();
      setCommentText('');
    } catch {
      setCommentError('No se pudo publicar tu comentario. Verifica tu conexión.');
    } finally {
      setSendingComment(false);
    }
  };

  const wordCount = textItem.content.trim().split(/\s+/).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));
  const totalLikes = (textItem.likes || 0) + (socialStats?.likes || 0);
  const totalGiftPoints = socialStats?.giftPoints || 0;

  return (
    <div className="gg-modal-overlay" onClick={onClose}>
      <div
        className={`gg-reader-modal theme-${theme}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Leyendo ${textItem.title}`}
      >
        {/* Barra de progreso de lectura superior */}
        <div className="gg-read-progress-track" aria-hidden="true">
          <div className="gg-read-progress-fill" style={{ width: `${readProgress}%` }} />
        </div>

        {/* Lluvia animada al donar un emoji personalizado */}
        {burstEmoji && (
          <div className="gg-emoji-burst-layer" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="gg-emoji-burst-particle"
                style={{
                  left: `${8 + i * 7.5}%`,
                  animationDelay: `${(i % 4) * 90}ms`,
                }}
              >
                {burstEmoji}
              </span>
            ))}
          </div>
        )}

        {/* Barra de Herramientas del Lector */}
        <header className="gg-reader-toolbar">
          <div className="gg-reader-meta-chips">
            <span className="gg-reader-genre-chip">📖 {textItem.genre.toUpperCase()}</span>
            <span className="gg-reader-stats-chip">
              ⏱️ {readTimeMin} min ({wordCount} palabras)
            </span>
            <span className="gg-reader-drops-chip" title="Tus Gotas de Lluvia para apoyar autores">
              🌧️ {raindrops} Gotas
            </span>
          </div>

          <div className="gg-reader-controls">
            <button
              type="button"
              className={`gg-reader-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={() => onToggleSave(textItem.id)}
              title={isSaved ? 'Quitar de Mi Estantería' : 'Guardar en Mi Estantería'}
            >
              {isSaved ? '🔖 Guardado' : '🔖 Guardar'}
            </button>

            <div className="gg-reader-theme-toggle" title="Cambiar fondo de lectura">
              <button
                type="button"
                className={`theme-btn dark ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                🌙
              </button>
              <button
                type="button"
                className={`theme-btn sepia ${theme === 'sepia' ? 'active' : ''}`}
                onClick={() => setTheme('sepia')}
              >
                📜
              </button>
              <button
                type="button"
                className={`theme-btn light ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                ☀️
              </button>
            </div>

            <div className="gg-reader-font-controls">
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                title="Reducir tamaño de letra"
              >
                A-
              </button>
              <span className="font-size-indicator">{fontSize}px</span>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(26, f + 2))}
                title="Aumentar tamaño de letra"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              className="gg-reader-close-btn"
              onClick={onClose}
              aria-label="Cerrar lectura"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Contenido Principal de Lectura */}
        <div className="gg-reader-body" ref={bodyRef} onScroll={handleBodyScroll}>
          <div className="gg-reader-header-article">
            {textItem.awardBadge && (
              <div className="gg-reader-award-banner animate-bounce-subtle">
                <span>{textItem.awardBadge}</span>
              </div>
            )}

            {textItem.coverImage && (
              <div className="gg-reader-cover-container">
                <img
                  src={textItem.coverImage}
                  alt={`Portada de ${textItem.title}`}
                  className="gg-reader-cover-img"
                />
              </div>
            )}

            <h1 className="gg-reader-story-title">{textItem.title}</h1>

            <div className="gg-reader-author-strip">
              <div className="gg-reader-author-avatar">
                {textItem.authorAvatar ? (
                  <img src={textItem.authorAvatar} alt={textItem.author} />
                ) : (
                  <span>✍️</span>
                )}
              </div>
              <div className="gg-reader-author-info">
                <span className="author-name">{textItem.author}</span>
                <span className="author-details">
                  {textItem.isPseudonym
                    ? '🎭 Seudónimo Literario · Códice Escolar'
                    : textItem.authorGrade
                      ? `${textItem.authorGrade} · ${textItem.authorSchool || 'Estudiante'}`
                      : textItem.authorSchool || 'Estudiante'}
                </span>
              </div>
            </div>

            {textItem.synopsis && (
              <div className="gg-reader-synopsis-box">
                <p>
                  <strong>Sinopsis:</strong> {textItem.synopsis}
                </p>
              </div>
            )}
          </div>

          <hr className="gg-reader-divider" />

          <article
            className="gg-reader-article-content"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
          >
            {textItem.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (trimmed === '✦ ✦ ✦' || trimmed === '~ ❖ ~') {
                return (
                  <div
                    key={idx}
                    style={{
                      textAlign: 'center',
                      margin: '2rem 0',
                      color: '#f59e0b',
                      fontSize: '1.25rem',
                      letterSpacing: '0.4em',
                    }}
                  >
                    {trimmed}
                  </div>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </article>

          {/* Recompensa por completar lectura */}
          {justEarnedReadDrops && (
            <div className="gg-read-reward-banner">
              <span>🎉</span>
              <span>
                ¡Lectura completada! Ganaste <strong>+10 🌧️ Gotas de Lluvia</strong> para apoyar a los autores de la Gran Biblioteca.
              </span>
            </div>
          )}

          {/* Barra Social: Like + Reacciones Literarias + Compartir */}
          <footer className="gg-reader-footer">
            <div className="gg-reader-congrats">
              <h4>¿Qué te pareció esta historia?</h4>
              <p>Apoya al autor con tu reacción, un emoji personalizado o un comentario constructivo.</p>
            </div>

            <div className="gg-reader-actions-bar">
              <button
                type="button"
                className={`gg-reaction-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => onToggleLike(textItem.id)}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span>{totalLikes} Me gusta</span>
              </button>

              <button
                type="button"
                className="gg-reaction-btn secondary"
                onClick={() => giftsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>🎁</span>
                <span>Apoyar ({totalGiftPoints} 🌧️)</span>
              </button>

              <button
                type="button"
                className="gg-reaction-btn secondary"
                onClick={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>💬</span>
                <span>Comentar ({comments.length})</span>
              </button>

              <button
                type="button"
                className={`gg-reaction-btn secondary ${shareCopied ? 'copied' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  if (onShare) {
                    onShare();
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <span>{shareCopied ? '✅' : '🔗'}</span>
                <span>{shareCopied ? 'Enlace copiado' : 'Compartir'}</span>
              </button>
            </div>

            {/* Reacciones literarias rápidas */}
            <div className="gg-literary-reactions-row">
              {LITERARY_REACTIONS.map((r) => {
                const count = socialStats?.reactions?.[r.id] || 0;
                const active = reactedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`gg-lit-react-chip ${active ? 'active' : ''}`}
                    onClick={() => handleReactionClick(r.id)}
                  >
                    <span>{r.emoji}</span>
                    <span>{r.label}</span>
                    {count > 0 && <strong>{count}</strong>}
                  </button>
                );
              })}
            </div>
          </footer>

          {/* ================================================================
              MÓDULO DE DONACIÓN CON EMOJIS PERSONALIZADOS (MECENAZGO SUTZ)
              ================================================================ */}
          <section ref={giftsRef} className="gg-social-panel gg-gifts-panel">
            <div className="gg-social-panel-head">
              <div>
                <h4>🎁 Donar Emojis Personalizados al Autor</h4>
                <p>
                  Usa tus <strong>🌧️ Gotas de Lluvia</strong> (las ganas leyendo +10 y comentando +5) para premiar esta obra.
                </p>
              </div>
              <span className="gg-drops-balance-badge">Tu saldo: 🌧️ {raindrops} Gotas</span>
            </div>

            <div className="gg-gift-emoji-grid">
              {CUSTOM_GIFT_EMOJIS.map((item) => {
                const isSel = selectedGift.id === item.id;
                const received = socialStats?.gifts?.[item.id] || 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`gg-gift-emoji-card ${isSel ? 'selected' : ''}`}
                    style={{ '--gift-accent': item.accent } as React.CSSProperties}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedGift(item);
                      setGiftFeedback('');
                    }}
                  >
                    {received > 0 && <span className="gg-gift-received-count">×{received}</span>}
                    <span className="gg-gift-big-emoji">{item.emoji}</span>
                    <strong>{item.name}</strong>
                    <span className="gg-gift-cost">🌧️ {item.cost} Gotas</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSendGift} className="gg-gift-form">
              <input
                type="text"
                className="gg-social-input"
                value={giftSender}
                onChange={(e) => setGiftSender(e.target.value)}
                placeholder="Tu nombre o seudónimo"
                maxLength={60}
              />
              <input
                type="text"
                className="gg-social-input"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder={`Dedicatoria opcional con tu ${selectedGift.name}...`}
                maxLength={180}
              />
              <button type="submit" className="gg-social-submit-btn" disabled={sendingGift}>
                {sendingGift ? 'Enviando...' : `Enviar ${selectedGift.emoji} (-${selectedGift.cost} 🌧️)`}
              </button>
            </form>

            {giftFeedback && <div className="gg-social-feedback">{giftFeedback}</div>}

            {gifts.length > 0 && (
              <div className="gg-patrons-wall">
                <span className="gg-patrons-title">✨ Muro de Apoyos Recientes ({gifts.length})</span>
                <div className="gg-patrons-list">
                  {gifts.slice(0, 8).map((g) => (
                    <div key={g.id} className="gg-patron-pill">
                      <span className="gg-patron-emoji">{g.emoji}</span>
                      <div>
                        <strong>{g.senderName}</strong> envió <em>{g.emojiName}</em>
                        {g.message && <p>“{g.message}”</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ================================================================
              MÓDULO DE COMENTARIOS EN TIEMPO REAL (COMUNIDAD LECTORA)
              ================================================================ */}
          <section ref={commentsRef} className="gg-social-panel gg-comments-panel">
            <div className="gg-social-panel-head">
              <div>
                <h4>💬 Comentarios de la Comunidad ({comments.length})</h4>
                <p>Deja una opinión constructiva para el autor y gana <strong>+5 🌧️ Gotas de Lluvia</strong>.</p>
              </div>
            </div>

            <div className="gg-comment-starters">
              {COMMENT_STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  className="gg-starter-chip"
                  onClick={() => {
                    soundEffects.playClick();
                    setCommentText((prev) => (prev ? prev : starter));
                  }}
                >
                  + {starter.trim()}...
                </button>
              ))}
            </div>

            <form onSubmit={handlePostComment} className="gg-comment-form">
              <input
                type="text"
                className="gg-social-input"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Tu nombre o seudónimo"
                maxLength={60}
                required
              />
              <textarea
                rows={3}
                className="gg-social-textarea"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Cuéntale al autor qué te inspiró o qué escena te gustó más..."
                maxLength={500}
                required
              />
              {commentError && <div className="gg-social-error">{commentError}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="gg-social-submit-btn" disabled={sendingComment}>
                  {sendingComment ? 'Publicando...' : '💬 Publicar Comentario (+5 🌧️)'}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <div className="gg-comments-empty">
                Sé la primera persona en dejar un comentario amable para <strong>{textItem.author}</strong>.
              </div>
            ) : (
              <div className="gg-comments-list">
                {comments.map((c) => (
                  <article key={c.id} className="gg-comment-item">
                    <div className="gg-comment-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong>{c.authorName}</strong>
                        {c.authorBadge && <span className="gg-comment-badge">{c.authorBadge}</span>}
                      </div>
                      <span className="gg-comment-date">{formatRelativeDate(c.createdAt)}</span>
                    </div>
                    <p className="gg-comment-body">{c.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
