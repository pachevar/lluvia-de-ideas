import React, { useEffect, useState } from 'react';
import type { StudentTextItem } from '../../types';
import {
  deleteTextCommentAdmin,
  subscribeTextSocialDetail,
  type TextCommentItem,
  type TextGiftItem,
} from '../../services/granGaleriaSocialService';

interface AdminCommentsModerationPanelProps {
  texts: StudentTextItem[];
}

export const AdminCommentsModerationPanel: React.FC<AdminCommentsModerationPanelProps> = ({
  texts,
}) => {
  const [selectedTextId, setSelectedTextId] = useState<string>(texts[0]?.id || '');
  const [comments, setComments] = useState<TextCommentItem[]>([]);
  const [gifts, setGifts] = useState<TextGiftItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeTextId = selectedTextId || texts[0]?.id || '';

  useEffect(() => {
    if (!isOpen || !activeTextId) return;
    const unsub = subscribeTextSocialDetail(activeTextId, setComments, setGifts);
    return () => unsub();
  }, [isOpen, activeTextId]);

  const handleDelete = async (commentId: string) => {
    if (!activeTextId) return;
    if (!window.confirm('¿Deseas eliminar este comentario permanentemente?')) return;
    try {
      await deleteTextCommentAdmin(activeTextId, commentId);
    } catch (err) {
      console.error('[AdminCommentsModerationPanel] Error deleting comment:', err);
      alert('No se pudo eliminar el comentario. Verifica permisos de administrador.');
    }
  };

  if (texts.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <strong style={{ color: '#7dd3fc', fontSize: '0.94rem' }}>
            💬 Moderación de Comentarios y Emojis de Apoyo
          </strong>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Supervisa los comentarios y regalos recibidos en tiempo real en la Gran Biblioteca.
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? 'Ocultar panel' : 'Abrir moderación'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select
            className="inspector-select"
            value={activeTextId}
            onChange={(e) => setSelectedTextId(e.target.value)}
          >
            {texts.map((t) => (
              <option key={t.id} value={t.id}>
                📜 {t.title} — {t.author}
              </option>
            ))}
          </select>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            <strong>Comentarios ({comments.length})</strong> ·{' '}
            <strong>Apoyos con emojis ({gifts.length})</strong>
          </div>

          {comments.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '8px 0' }}>
              Esta obra aún no tiene comentarios publicados.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#f8fafc' }}>
                      <strong>{c.authorName}</strong>{' '}
                      <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-GT') : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '2px' }}>
                      {c.text}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                    }}
                    onClick={() => handleDelete(c.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
