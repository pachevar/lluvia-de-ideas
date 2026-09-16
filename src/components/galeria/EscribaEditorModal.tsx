import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { StudentTextItem, LiteraryGenre } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import './EscribaEditorModal.css';

interface EscribaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newText: StudentTextItem) => Promise<void> | void;
  initialData?: Partial<StudentTextItem>;
}

type EditorTheme = 'papiro' | 'noche' | 'manuscrito';

export const EscribaEditorModal: React.FC<EscribaEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('papiro');
  const [showManual, setShowManual] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [authorGrade, setAuthorGrade] = useState(initialData?.authorGrade || '3ro Primaria');
  const [authorSchool, setAuthorSchool] = useState(initialData?.authorSchool || 'Colegio Sutz');
  const [genre, setGenre] = useState<LiteraryGenre>(initialData?.genre || 'fantasia');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
  const [content, setContent] = useState(initialData?.content || '');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setAuthorGrade(initialData.authorGrade || '3ro Primaria');
      setAuthorSchool(initialData.authorSchool || 'Colegio Sutz');
      setGenre(initialData.genre || 'fantasia');
      setSynopsis(initialData.synopsis || '');
      setContent(initialData.content || '');
    }
  }, [initialData]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Ortotipographic Insertion Helper
  const insertTextAtCursor = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    soundEffects.playClick();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    setContent(newContent);

    // Reposition cursor right after inserted text or inside placeholder
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Specific Ortotipographic Tools
  const handleInsertRayaDialogo = () => {
    // Inserta raya de diálogo al inicio de línea
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const isAtLineStart = start === 0 || textarea.value[start - 1] === '\n';
    const prefix = isAtLineStart ? '—' : '\n—';
    insertTextAtCursor(prefix, ' ', '¿Qué misterio aguarda en el horizonte?');
  };

  const handleInsertAcotacion = () => {
    insertTextAtCursor(' —', '— ', 'dijo con voz misteriosa');
  };

  const handleInsertComillasLatinas = () => {
    insertTextAtCursor('«', '»', 'palabras memorables');
  };

  const handleInsertSeparadorEscena = () => {
    insertTextAtCursor('\n\n✦ ✦ ✦\n\n', '', '');
  };

  const handleInsertSaltoEstrofa = () => {
    insertTextAtCursor('\n\n', '', '');
  };

  const handleInsertAcotacionTeatral = () => {
    insertTextAtCursor(' (', ') ', 'Observa con asombro la estrella fugaz');
  };

  // Live Writing Metrics
  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = content.length;
    const readingTime = Math.max(1, Math.ceil(words / 160));
    const stanzas = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const dialogueLines = (content.match(/^—/gm) || []).length;

    return { words, chars, readingTime, stanzas, dialogueLines };
  }, [content]);

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) {
      alert('Por favor completa el Título, Autor y el Contenido de tu texto.');
      return;
    }

    setIsSaving(true);
    try {
      const newText: StudentTextItem = {
        id: initialData?.id || `text-${Date.now()}`,
        title: title.trim(),
        author: author.trim(),
        authorGrade: authorGrade.trim() || 'Primaria',
        authorSchool: authorSchool.trim() || 'Colegio Sutz',
        genre,
        synopsis: synopsis.trim() || title.trim(),
        content: content.trim(),
        likes: initialData?.likes || 0,
        reads: initialData?.reads || 1,
        featured: initialData?.featured || false,
        publishedAt: initialData?.publishedAt || new Date().toISOString()
      };

      await onSave(newText);
      soundEffects.playSuccessFanfare();
      onClose();
    } catch (err) {
      console.error('Error guardando en el Pergamino del Escriba:', err);
      alert('Hubo un error al guardar tu obra. Por favor inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="escriba-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="escriba-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <header className="escriba-modal-header">
          <div className="escriba-header-title">
            <span className="escriba-header-icon" aria-hidden="true">📜</span>
            <div>
              <h2>El Pergamino del Escriba · Taller Literario</h2>
              <p>Redacta, aprende reglas ortotipográficas y publica relatos estudiantiles</p>
            </div>
          </div>

          <div className="escriba-header-actions">
            <button 
              type="button" 
              className={`escriba-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => { soundEffects.playClick(); setActiveTab('editor'); }}
            >
              ✍️ Taller de Escritura
            </button>
            <button 
              type="button" 
              className={`escriba-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => { soundEffects.playClick(); setActiveTab('preview'); }}
            >
              👁️ Vista Pergamino
            </button>
            <button 
              type="button" 
              className="escriba-close-btn" 
              onClick={() => { soundEffects.playClick(); onClose(); }}
              aria-label="Cerrar taller"
            >
              ✕
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="escriba-modal-body">
          {activeTab === 'editor' ? (
            <form id="escriba-form" onSubmit={handleSubmit} className="escriba-form-layout">
              {/* METADATA GRID */}
              <div className="escriba-meta-grid">
                <div className="escriba-field escriba-field-full">
                  <label htmlFor="escriba-title">📌 Título de la Obra *</label>
                  <input
                    id="escriba-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ejemplo: Las Sombras del Valle de la Niebla"
                    required
                  />
                </div>

                <div className="escriba-field">
                  <label htmlFor="escriba-author">👤 Nombre del Estudiante / Autor *</label>
                  <input
                    id="escriba-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Tu nombre o seudónimo literario"
                    required
                  />
                </div>

                <div className="escriba-field">
                  <label htmlFor="escriba-grade">🎓 Grado Escolar</label>
                  <input
                    id="escriba-grade"
                    type="text"
                    value={authorGrade}
                    onChange={(e) => setAuthorGrade(e.target.value)}
                    placeholder="Ej: 5to Primaria / 2do Básico"
                  />
                </div>

                <div className="escriba-field">
                  <label htmlFor="escriba-school">🏫 Escuela o Colegio</label>
                  <input
                    id="escriba-school"
                    type="text"
                    value={authorSchool}
                    onChange={(e) => setAuthorSchool(e.target.value)}
                    placeholder="Ej: Instituto Nacional de Guatemala"
                  />
                </div>

                <div className="escriba-field">
                  <label htmlFor="escriba-genre">🎭 Género Literario</label>
                  <select
                    id="escriba-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as LiteraryGenre)}
                  >
                    <option value="fantasia">Fantasía & Aventura</option>
                    <option value="ciencia_ficcion">Ciencia Ficción & Futuro</option>
                    <option value="mitos">Mitos & Popol Vuh</option>
                    <option value="poesia">Poesía & Versos Líricos</option>
                    <option value="misterio">Misterio & Suspenso</option>
                    <option value="cronica">Crónica Escolar & Realismo</option>
                    <option value="cuento">Cuento Infantil & Fábulas</option>
                    <option value="ensayo">Ensayo & Reflexión</option>
                  </select>
                </div>

                <div className="escriba-field escriba-field-full">
                  <label htmlFor="escriba-synopsis">✨ Sinopsis o Breve Resumen (1 a 3 líneas)</label>
                  <textarea
                    id="escriba-synopsis"
                    rows={2}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="Resume el enigma o conflicto central para atrapar a tus lectores..."
                  />
                </div>
              </div>

              {/* ORTOTIPOGRAPHIC TOOLBAR & PEDAGOGICAL ASSISTANT */}
              <div className="escriba-toolbar-wrapper">
                <div className="escriba-toolbar-header">
                  <span className="escriba-toolbar-title">
                    <span>🔤</span> Herramientas Ortotipográficas & Estilo
                  </span>

                  <div className="escriba-theme-selectors">
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lienzo:</span>
                    <button
                      type="button"
                      className={`escriba-theme-btn ${editorTheme === 'papiro' ? 'active' : ''}`}
                      onClick={() => setEditorTheme('papiro')}
                    >
                      📜 Papiro
                    </button>
                    <button
                      type="button"
                      className={`escriba-theme-btn ${editorTheme === 'noche' ? 'active' : ''}`}
                      onClick={() => setEditorTheme('noche')}
                    >
                      🌌 Tinta Cósmica
                    </button>
                    <button
                      type="button"
                      className={`escriba-theme-btn ${editorTheme === 'manuscrito' ? 'active' : ''}`}
                      onClick={() => setEditorTheme('manuscrito')}
                    >
                      🕯️ Manuscrito
                    </button>
                  </div>

                  <button
                    type="button"
                    className="escriba-help-toggle-btn"
                    onClick={() => {
                      soundEffects.playClick();
                      setShowManual(!showManual);
                    }}
                  >
                    <span>💡</span> {showManual ? 'Ocultar Guía' : 'Manual del Escriba (Reglas)'}
                  </button>
                </div>

                {/* BOTONES DE HERRAMIENTAS DE ESTILO */}
                <div className="escriba-tools-row">
                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertRayaDialogo}
                    title="Insertar raya de diálogo reglamentaria de la RAE"
                  >
                    <span className="shortcut">—</span> Diálogo (Raya)
                  </button>

                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertAcotacion}
                    title="Insertar intervención o acotación del narrador"
                  >
                    <span className="shortcut">—acotación—</span> Narrador
                  </button>

                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertComillasLatinas}
                    title="Insertar comillas tipográficas españolas « »"
                  >
                    <span className="shortcut">« »</span> Comillas Latinas
                  </button>

                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertSaltoEstrofa}
                    title="Separación rítmica entre estrofas de poesía"
                  >
                    <span>🎶</span> Salto de Estrofa
                  </button>

                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertSeparadorEscena}
                    title="Separador ornamental de escena o cambio de perspectiva"
                  >
                    <span>✦ ✦ ✦</span> Códice Escénico
                  </button>

                  <button
                    type="button"
                    className="escriba-tool-btn"
                    onClick={handleInsertAcotacionTeatral}
                    title="Acotación dramática o dirección de personaje teatral"
                  >
                    <span>🎭</span> Acotación Teatral
                  </button>
                </div>

                {/* GUÍA PEDAGÓGICA DESPLEGABLE */}
                {showManual && (
                  <div className="escriba-manual-drawer">
                    <div className="escriba-manual-header">
                      <span className="escriba-manual-title">
                        📘 Reglas del Escriba: Claves de Narrativa y Ortotipografía
                      </span>
                    </div>

                    <div className="escriba-manual-grid">
                      <div className="escriba-manual-card">
                        <strong>1. La Raya de Diálogo (<code>—</code>) no es un Guión (<code>-</code>)</strong>
                        En la literatura española, las conversaciones se inician con la raya larga (<code>—</code>), nunca con guión de teclado común. Va unida a la primera letra: <code>—Hola, guardián.</code>
                      </div>

                      <div className="escriba-manual-card">
                        <strong>2. Acotaciones del Narrador</strong>
                        Si el narrador interviene para decir quién habla, se usan dos rayas unidas al verbo: <code>—No podemos rendirnos —dijo la joven exploradora.</code>
                      </div>

                      <div className="escriba-manual-card">
                        <strong>3. Espaciado y Estrofas</strong>
                        En poesía o lírica, cada verso expresa una melodía. Deja una línea en blanco entre estrofas para permitir pausas respiratorias al lector.
                      </div>

                      <div className="escriba-manual-card">
                        <strong>4. Comillas Españolas (<code>« »</code>)</strong>
                        Úsalas para citar frases célebres de tus personajes, pensamientos internos o libros antiguos leídos dentro de tu relato.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WRITING CANVAS */}
              <div className="escriba-canvas-wrapper" data-theme={editorTheme}>
                <textarea
                  ref={textareaRef}
                  id="escriba-content"
                  className="escriba-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Comienza a escribir tu pergamino aquí... Usa los botones superiores para insertar diálogos (—), versos o separadores de escena."
                  required
                />
              </div>

              {/* LIVE STATS BAR */}
              <div className="escriba-stats-bar">
                <div className="escriba-stats-group">
                  <div className="escriba-stat-item">
                    <span>Palabras:</span>
                    <strong>{stats.words}</strong>
                  </div>
                  <div className="escriba-stat-item">
                    <span>Caracteres:</span>
                    <strong>{stats.chars}</strong>
                  </div>
                  <div className="escriba-stat-item">
                    <span>Estrofas/Párrafos:</span>
                    <strong>{stats.stanzas}</strong>
                  </div>
                  <div className="escriba-stat-item">
                    <span>Diálogos:</span>
                    <strong>{stats.dialogueLines}</strong>
                  </div>
                </div>

                <div className="escriba-stat-item">
                  <span>⏱️ Tiempo estimado de lectura:</span>
                  <strong>~{stats.readingTime} min</strong>
                </div>
              </div>
            </form>
          ) : (
            /* PREVIEW TAB */
            <div className="escriba-preview-parchment">
              <header className="escriba-preview-header">
                <span className="escriba-preview-genre">
                  {genre.toUpperCase().replace('_', ' ')}
                </span>
                <h1 className="escriba-preview-title">{title || 'Título de tu Historia'}</h1>
                <p className="escriba-preview-author">
                  Por {author || 'Autor Estudiantil'} · {authorGrade} ({authorSchool})
                </p>
              </header>

              {synopsis && (
                <div className="escriba-preview-synopsis">
                  «{synopsis}»
                </div>
              )}

              <article className="escriba-preview-body">
                {content || 'El texto que escribas en el taller se desplegará aquí con estilo de manuscrito y pergamino auténtico.'}
              </article>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="escriba-modal-footer">
          <div className="escriba-footer-note">
            <span>🛡️</span> Tu obra será revisada y añadida al Códice Escolar de la Gran Galería
          </div>

          <div className="escriba-footer-buttons">
            <button
              type="button"
              className="escriba-btn-cancel"
              onClick={() => { soundEffects.playClick(); onClose(); }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="escriba-form"
              className="escriba-btn-submit"
              disabled={isSaving}
              onClick={() => {
                if (activeTab === 'preview') setActiveTab('editor');
              }}
            >
              <span>📜</span> {isSaving ? 'Guardando...' : 'Publicar en el Pergamino'}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
