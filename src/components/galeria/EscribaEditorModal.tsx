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

  // Guide Character Modal State (Pedagógica anti-copiado/pegado)
  const [showPasteGuideModal, setShowPasteGuideModal] = useState<boolean>(false);
  const [pasteGuideReason, setPasteGuideReason] = useState<'paste' | 'copy'>('paste');

  // Mobile Tools Drawer State & Long-Press Handler
  const [showMobileTools, setShowMobileTools] = useState<boolean>(false);
  const [isPressingTools, setIsPressingTools] = useState<boolean>(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const handleToolsTouchStart = () => {
    setIsPressingTools(true);
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsPressingTools(false);
      soundEffects.playSpacePulse();
      setShowMobileTools(prev => !prev);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch {}
      }
    }, 320);
  };

  const handleToolsTouchEnd = () => {
    setIsPressingTools(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleToolsClick = () => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    soundEffects.playClick();
    setShowMobileTools(prev => !prev);
  };

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [genre, setGenre] = useState<LiteraryGenre>(initialData?.genre || 'fantasia');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
  const [content, setContent] = useState(initialData?.content || '');

  // Pseudonym state (reemplaza solicitud manual de nombre, grado y colegio)
  const [usePseudonym, setUsePseudonym] = useState<boolean>(
    initialData?.isPseudonym ?? (Boolean(initialData?.author) && initialData?.author !== 'Autor Estudiantil')
  );
  const [pseudonym, setPseudonym] = useState<string>(
    initialData?.author && initialData.author !== 'Autor Estudiantil' ? initialData.author : ''
  );

  const handleRandomPseudonym = () => {
    soundEffects.playClick();
    const creativePseudonyms = [
      'Pluma del Viento',
      'Escriba de las Estrellas',
      'Sombra de Jade',
      'El Fénix Literario',
      'Búho de Medianoche',
      'Alquimista de Tinta',
      'Voz del Horizonte',
      'Guardián de Relatos',
      'Navegante del Tiempo',
      'Códice Errante',
      'Centinela de Palabras',
      'Eco de la Selva',
      'Lira Cósmica',
      'Viajero de la Niebla',
      'Forjador de Mitos',
      'Luz de Obsidiana',
      'Arquero de Versos'
    ];
    const randomIndex = Math.floor(Math.random() * creativePseudonyms.length);
    setPseudonym(creativePseudonyms[randomIndex]);
    if (!usePseudonym) setUsePseudonym(true);
  };

  // History stack for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  const historyRef = useRef<string[]>([initialData?.content || '']);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const lastChangeTimeRef = useRef<number>(Date.now());

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      const hasPseudo = initialData.isPseudonym ?? (Boolean(initialData.author) && initialData.author !== 'Autor Estudiantil');
      setUsePseudonym(hasPseudo);
      setPseudonym(initialData.author && initialData.author !== 'Autor Estudiantil' ? initialData.author : '');
      setGenre(initialData.genre || 'fantasia');
      setSynopsis(initialData.synopsis || '');
      setContent(initialData.content || '');
      historyRef.current = [initialData.content || ''];
      historyIndexRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [initialData]);

  // Update history indicators
  const updateHistoryState = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const pushToHistory = (newVal: string, immediate: boolean = false) => {
    const now = Date.now();
    const currentVal = historyRef.current[historyIndexRef.current];
    if (newVal === currentVal) return;

    // Discard any redo states ahead of current index
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);

    // Group rapid typing unless it's a word break, punctuation, tool insertion, or paused for >650ms
    const isWordBreak = newVal.endsWith(' ') || newVal.endsWith('\n') || newVal.endsWith('.') || newVal.endsWith('—');
    const shouldGroup = !immediate && (now - lastChangeTimeRef.current < 650) && !isWordBreak && newHistory.length > 1;

    if (shouldGroup) {
      newHistory[newHistory.length - 1] = newVal;
    } else {
      newHistory.push(newVal);
      if (newHistory.length > 100) newHistory.shift();
    }

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    lastChangeTimeRef.current = now;
    updateHistoryState();
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      soundEffects.playClick();
      historyIndexRef.current -= 1;
      const prevVal = historyRef.current[historyIndexRef.current];
      setContent(prevVal);
      updateHistoryState();
      setTimeout(() => textareaRef.current?.focus(), 20);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      soundEffects.playClick();
      historyIndexRef.current += 1;
      const nextVal = historyRef.current[historyIndexRef.current];
      setContent(nextVal);
      updateHistoryState();
      setTimeout(() => textareaRef.current?.focus(), 20);
    }
  };

  const triggerPasteGuide = (reason: 'paste' | 'copy' = 'paste') => {
    soundEffects.playSpacePulse();
    setPasteGuideReason(reason);
    setShowPasteGuideModal(true);
  };

  // Keyboard Shortcuts for Textarea: Undo/Redo & Blocking Copy/Paste
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // 1. Bloqueo de Pegado (Ctrl+V / Cmd+V)
    if (isCtrlOrCmd && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      e.stopPropagation();
      triggerPasteGuide('paste');
      return;
    }

    // 2. Bloqueo de Copiado (Ctrl+C / Cmd+C)
    if (isCtrlOrCmd && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      triggerPasteGuide('copy');
      return;
    }

    // 3. Deshacer: Ctrl+Z / Cmd+Z (sin Shift)
    if (isCtrlOrCmd && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      e.stopPropagation();
      handleUndo();
      return;
    }

    // 4. Rehacer: Ctrl+Y / Cmd+Y  O  Ctrl+Shift+Z / Cmd+Shift+Z
    if (
      (isCtrlOrCmd && (e.key === 'y' || e.key === 'Y')) ||
      (isCtrlOrCmd && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      handleRedo();
      return;
    }
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPasteGuideModal) {
          setShowPasteGuideModal(false);
        } else if (showMobileTools) {
          setShowMobileTools(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showPasteGuideModal, showMobileTools]);

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
    pushToHistory(newContent, true);

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
    if (!title.trim() || !content.trim()) {
      alert('Por favor completa el Título y el Contenido de tu obra antes de publicar.');
      return;
    }

    const resolvedAuthor = usePseudonym
      ? (pseudonym.trim() || 'Escriba Anónimo')
      : (initialData?.author || 'Autor Estudiantil');

    setIsSaving(true);
    try {
      const newText: StudentTextItem = {
        id: initialData?.id || `text-${Date.now()}`,
        title: title.trim(),
        author: resolvedAuthor,
        isPseudonym: usePseudonym,
        authorGrade: initialData?.authorGrade || '',
        authorSchool: usePseudonym ? 'Seudónimo Literario' : (initialData?.authorSchool || 'Códice Estudiantil'),
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
                <div className="escriba-field escriba-field-title">
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

                <div className="escriba-field escriba-field-genre">
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

                {/* OPCIÓN: PUBLICAR BAJO UN SEUDÓNIMO */}
                <div className="escriba-field escriba-field-full escriba-pseudonym-card">
                  <div className="escriba-pseudonym-header">
                    <label className="escriba-pseudonym-toggle-label">
                      <input
                        type="checkbox"
                        checked={usePseudonym}
                        onChange={(e) => {
                          soundEffects.playClick();
                          setUsePseudonym(e.target.checked);
                        }}
                        className="escriba-pseudonym-checkbox"
                      />
                      <span className="pseudonym-checkbox-custom"></span>
                      <div className="pseudonym-toggle-text">
                        <span className="pseudonym-toggle-title">
                          🎭 Publicar bajo un seudónimo literario
                        </span>
                      </div>
                    </label>
                  </div>

                  {usePseudonym && (
                    <div className="escriba-pseudonym-input-row animate-fade-in">
                      <div className="pseudonym-input-wrapper">
                        <span className="pseudonym-icon">🪶</span>
                        <input
                          id="escriba-pseudonym"
                          type="text"
                          value={pseudonym}
                          onChange={(e) => setPseudonym(e.target.value)}
                          placeholder="Escribe tu seudónimo (ej: Pluma del Viento...)"
                          maxLength={40}
                        />
                      </div>
                      <button
                        type="button"
                        className="escriba-pseudonym-random-btn"
                        onClick={handleRandomPseudonym}
                        title="Generar un seudónimo literario aleatorio"
                      >
                        <span>🎲</span> Aleatorio
                      </button>
                    </div>
                  )}
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

              {/* BARRA DE HERRAMIENTAS MÓVIL: UN SOLO BOTÓN DE ENTRADA CON DESPLIEGUE POR PULSACIÓN SOSTENIDA */}
              <div className="escriba-toolbar-mobile">
                <div className="escriba-mobile-bar-inner">
                  {/* Deshacer y Rehacer al alcance inmediato */}
                  <div className="escriba-mobile-history">
                    <button
                      type="button"
                      className="escriba-history-btn"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      title="Deshacer último cambio (Ctrl+Z)"
                      aria-label="Deshacer cambio"
                    >
                      <span>↩</span>
                    </button>
                    <button
                      type="button"
                      className="escriba-history-btn"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      title="Rehacer cambio (Ctrl+Y)"
                      aria-label="Rehacer cambio"
                    >
                      <span>↪</span>
                    </button>
                  </div>

                  {/* Botón único de entrada con pulsación sostenida o toque */}
                  <button
                    type="button"
                    className={`escriba-mobile-tools-trigger ${isPressingTools ? 'is-pressing' : ''} ${showMobileTools ? 'active' : ''}`}
                    onTouchStart={handleToolsTouchStart}
                    onTouchEnd={handleToolsTouchEnd}
                    onTouchCancel={handleToolsTouchEnd}
                    onMouseDown={handleToolsTouchStart}
                    onMouseUp={handleToolsTouchEnd}
                    onClick={handleToolsClick}
                    title="Mantén presionado o toca para abrir herramientas ortotipográficas y estilo"
                  >
                    <span className="trigger-icon">🔤</span>
                    <span className="trigger-label">Herramientas Ortotipográficas y Estilo</span>
                    <span className={`trigger-chevron ${showMobileTools ? 'open' : ''}`}>▼</span>
                    {isPressingTools && <span className="press-pulse-ring"></span>}
                  </button>
                </div>

                {/* MENÚ / PANEL DESPLEGABLE DE OPCIONES EN MÓVIL */}
                {showMobileTools && (
                  <div className="escriba-mobile-tools-drawer animate-fade-in">
                    <div className="drawer-header">
                      <div className="drawer-title">
                        <span>🔤</span> Herramientas Ortotipográficas y Estilo
                      </div>
                      <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={() => {
                          soundEffects.playClick();
                          setShowMobileTools(false);
                        }}
                        aria-label="Cerrar opciones"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="drawer-section">
                      <div className="drawer-section-label">⚡ DIÁLOGO Y NARRATIVA</div>
                      <div className="drawer-tools-grid">
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertRayaDialogo();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">—</span>
                          <span className="tool-name">Diálogo (Raya)</span>
                        </button>
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertAcotacion();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">—acotación—</span>
                          <span className="tool-name">Narrador</span>
                        </button>
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertComillasLatinas();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">« »</span>
                          <span className="tool-name">Comillas Latinas</span>
                        </button>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <div className="drawer-section-label">📜 ESTRUCTURA LITERARIA</div>
                      <div className="drawer-tools-grid">
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertSaltoEstrofa();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">🎶</span>
                          <span className="tool-name">Salto de Estrofa</span>
                        </button>
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertSeparadorEscena();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">✦ ✦ ✦</span>
                          <span className="tool-name">Códice Escénico</span>
                        </button>
                        <button
                          type="button"
                          className="drawer-tool-btn"
                          onClick={() => {
                            handleInsertAcotacionTeatral();
                            setShowMobileTools(false);
                          }}
                        >
                          <span className="tool-chip">🎭</span>
                          <span className="tool-name">Acotación Teatral</span>
                        </button>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <div className="drawer-section-label">🎨 LIENZO DE ESCRITURA</div>
                      <div className="drawer-themes-row">
                        <button
                          type="button"
                          className={`drawer-theme-btn ${editorTheme === 'papiro' ? 'active' : ''}`}
                          onClick={() => {
                            soundEffects.playClick();
                            setEditorTheme('papiro');
                          }}
                        >
                          📜 Papiro
                        </button>
                        <button
                          type="button"
                          className={`drawer-theme-btn ${editorTheme === 'noche' ? 'active' : ''}`}
                          onClick={() => {
                            soundEffects.playClick();
                            setEditorTheme('noche');
                          }}
                        >
                          🌌 Tinta Cósmica
                        </button>
                        <button
                          type="button"
                          className={`drawer-theme-btn ${editorTheme === 'manuscrito' ? 'active' : ''}`}
                          onClick={() => {
                            soundEffects.playClick();
                            setEditorTheme('manuscrito');
                          }}
                        >
                          🕯️ Manuscrito
                        </button>
                      </div>
                    </div>

                    <div className="drawer-section drawer-help-section">
                      <button
                        type="button"
                        className="drawer-help-btn"
                        onClick={() => {
                          soundEffects.playClick();
                          setShowManual(!showManual);
                        }}
                      >
                        <span>💡</span> {showManual ? 'Ocultar Manual del Escriba' : 'Ver Manual del Escriba (Reglas RAE)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ORTOTIPOGRAPHIC TOOLBAR (DESKTOP) */}
              <div className="escriba-toolbar-wrapper escriba-toolbar-desktop">
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

                {/* BOTONES DE HERRAMIENTAS DE ESTILO & HISTORIAL */}
                <div className="escriba-tools-row">
                  {/* Deshacer y Rehacer (Ctrl+Z y Ctrl+Y) */}
                  <div className="escriba-history-group">
                    <button
                      type="button"
                      className="escriba-history-btn"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      title="Deshacer último cambio (Ctrl+Z)"
                    >
                      <span>↩</span> Deshacer <span className="kbd-hint">Ctrl+Z</span>
                    </button>
                    <button
                      type="button"
                      className="escriba-history-btn"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      title="Rehacer cambio (Ctrl+Y / Ctrl+Shift+Z)"
                    >
                      <span>↪</span> Rehacer <span className="kbd-hint">Ctrl+Y</span>
                    </button>
                  </div>

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
                  onChange={(e) => {
                    const val = e.target.value;
                    setContent(val);
                    pushToHistory(val, false);
                  }}
                  onKeyDown={handleTextareaKeyDown}
                  onPaste={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerPasteGuide('paste');
                  }}
                  onCopy={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerPasteGuide('copy');
                  }}
                  onCut={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerPasteGuide('paste');
                  }}
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
                  Por {usePseudonym ? (pseudonym.trim() || 'Escriba Anónimo') : 'Autor Estudiantil'}
                  {usePseudonym ? ' · (Seudónimo Literario)' : ' · Códice Escolar Sutz'}
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

      {/* MODAL GUÍA: EL SABIO ESCRIBA DE SUTZ & IXMUKANÉ (AVISO PEDAGÓGICO DE COPIADO/PEGADO COMPACTO) */}
      {showPasteGuideModal && (
        <div 
          className="escriba-guide-backdrop"
          onClick={() => setShowPasteGuideModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="escriba-guide-modal escriba-guide-modal-compact"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera compacta con Avatar + Título + Cerrar */}
            <div className="escriba-guide-header-compact">
              <div className="escriba-guide-avatar-compact">
                <span>🦉</span>
                <div className="escriba-guide-aura-mini"></div>
              </div>
              <div className="escriba-guide-header-info">
                <span className="escriba-guide-badge-mini">🪶 EL SABIO ESCRIBA</span>
                <h3 className="escriba-guide-title-compact">
                  ¡Escribe con <span className="highlight">tu propia voz</span>!
                </h3>
              </div>
              <button
                type="button"
                className="escriba-guide-close-btn"
                onClick={() => {
                  soundEffects.playClick();
                  setShowPasteGuideModal(false);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Mensaje pedagógico conciso y eficiente */}
            <div className="escriba-guide-message-compact">
              <p className="escriba-guide-intro-compact">
                {pasteGuideReason === 'paste' 
                  ? 'El copiado y pegado está bloqueado en este códice para que vivas el auténtico proceso creativo:' 
                  : 'Fomentamos el valor de escribir cada frase directamente sobre el lienzo:'}
              </p>

              <div className="escriba-guide-reasons-compact">
                <div className="escriba-guide-reason-compact">
                  <span className="reason-icon">🧠</span>
                  <div>
                    <strong>Tu propia voz:</strong> Escribir letra a letra activa tu imaginación y pensamiento crítico.
                  </div>
                </div>

                <div className="escriba-guide-reason-compact">
                  <span className="reason-icon">✍️</span>
                  <div>
                    <strong>Maestría literaria:</strong> Usa las herramientas de diálogos (<code>—</code>), versos y estilo.
                  </div>
                </div>

                <div className="escriba-guide-reason-compact">
                  <span className="reason-icon">🏆</span>
                  <div>
                    <strong>Autoría auténtica:</strong> Tu relato en el Códice Escolar llevará tu firma y mérito real.
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción ergonómicos en fila */}
            <div className="escriba-guide-actions-compact">
              <button
                type="button"
                className="escriba-guide-btn-primary"
                onClick={() => {
                  soundEffects.playClick();
                  setShowPasteGuideModal(false);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
              >
                <span>✍️</span> ¡Escribiré con mis palabras!
              </button>

              <button
                type="button"
                className="escriba-guide-btn-secondary"
                onClick={() => {
                  soundEffects.playClick();
                  setShowPasteGuideModal(false);
                  setShowManual(true);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
              >
                📘 Ver Manual de Estilo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
