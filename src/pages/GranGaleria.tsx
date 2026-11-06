import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { usePortalConfig } from '../context/PortalConfigContext';
import { DEFAULT_GRAN_GALERIA } from '../data/defaultGranGaleriaData';
import type { 
  StudentTextItem, 
  StudentArtItem, 
  StudentVideoItem 
} from '../types';
import { ReadingModal } from '../components/galeria/ReadingModal';
import { ArtPieceModal } from '../components/galeria/ArtPieceModal';
import { VideoTheaterModal } from '../components/galeria/VideoTheaterModal';
import { EscribaEditorModal } from '../components/galeria/EscribaEditorModal';
import { ObraEditorModal } from '../components/galeria/ObraEditorModal';
import { AuthModal } from '../components/auth/AuthModal';
import { soundEffects } from '../utils/soundEffects';
import './GranGaleria.css';

type GaleriaSection = 'escriba' | 'museo' | 'cine' | 'concursos';

export const GranGaleria: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { config, saveConfigToFirestore } = usePortalConfig();

  // Config data fallback
  const galeriaData = config.granGaleria || DEFAULT_GRAN_GALERIA;
  const texts = galeriaData.texts || [];
  const artworks = galeriaData.artworks || [];
  const videos = galeriaData.videos || [];
  const contests = galeriaData.contests || [];

  // Active section tab
  const [activeTab, setActiveTab] = useState<GaleriaSection>('escriba');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters
  const [selectedGenre, setSelectedGenre] = useState<string>('todos');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('todos');
  const [selectedVideoCat, setSelectedVideoCat] = useState<string>('todos');

  // Modals state
  const [activeReadingText, setActiveReadingText] = useState<StudentTextItem | null>(null);
  const [activeArtPiece, setActiveArtPiece] = useState<StudentArtItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<StudentVideoItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isArtEditorOpen, setIsArtEditorOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [editorInitialData, setEditorInitialData] = useState<Partial<StudentTextItem> | undefined>(undefined);

  // Apertura segura del taller literario (requiere sesión activa de estudiante/docente)
  const handleOpenEditor = () => {
    soundEffects.playClick();
    if (!user) {
      soundEffects.playSpacePulse();
      setIsAuthModalOpen(true);
      return;
    }
    setIsEditorOpen(true);
  };

  // Apertura segura del taller de artes visuales (requiere sesión activa de estudiante/docente)
  const handleOpenArtEditor = () => {
    soundEffects.playClick();
    if (!user) {
      soundEffects.playSpacePulse();
      setIsAuthModalOpen(true);
      return;
    }
    setIsArtEditorOpen(true);
  };

  // Detección de prompt detonador desde la Máquina de Cuentos (Suite Creatika)
  useEffect(() => {
    if (location.state && (location.state as any).initialPrompt) {
      const state = location.state as { initialPrompt?: string; titleSuggestion?: string; category?: string };
      setActiveTab('escriba');
      setEditorInitialData({
        title: state.titleSuggestion || '',
        genre: 'fantasia',
        synopsis: state.initialPrompt || '',
        content: `Prompt detonador de la Máquina de Cuentos:\n"${state.initialPrompt}"\n\n---\n\n(Comienza a redactar tu historia aquí...)`
      });
      if (user) {
        setIsEditorOpen(true);
      } else {
        setIsAuthModalOpen(true);
      }
    }
  }, [location.state, user]);

  const handleSaveNewText = async (newText: StudentTextItem) => {
    const currentGaleria = config.granGaleria || DEFAULT_GRAN_GALERIA;
    const existingIndex = (currentGaleria.texts || []).findIndex(t => t.id === newText.id);
    let updatedTexts: StudentTextItem[];
    if (existingIndex >= 0) {
      updatedTexts = [...(currentGaleria.texts || [])];
      updatedTexts[existingIndex] = newText;
    } else {
      updatedTexts = [newText, ...(currentGaleria.texts || [])];
    }
    const updatedGaleria = {
      ...currentGaleria,
      texts: updatedTexts
    };

    // Actualización atómica en config/portal autorizada para usuarios autenticados
    const portalDocRef = doc(db, 'config', 'portal');
    try {
      await updateDoc(portalDocRef, { granGaleria: updatedGaleria });
    } catch (err) {
      console.warn('[GranGaleria] updateDoc falló, intentando setDoc merge:', err);
      try {
        await setDoc(portalDocRef, { granGaleria: updatedGaleria }, { merge: true });
      } catch (mergeErr) {
        console.error('[GranGaleria] Error persistiendo relato en Firestore:', mergeErr);
        // Fallback context
        await saveConfigToFirestore({
          ...config,
          granGaleria: updatedGaleria
        });
      }
    }
  };

  const handleSaveNewArtwork = async (newArt: StudentArtItem) => {
    const currentGaleria = config.granGaleria || DEFAULT_GRAN_GALERIA;
    const existingIndex = (currentGaleria.artworks || []).findIndex(a => a.id === newArt.id);
    let updatedArtworks: StudentArtItem[];
    if (existingIndex >= 0) {
      updatedArtworks = [...(currentGaleria.artworks || [])];
      updatedArtworks[existingIndex] = newArt;
    } else {
      updatedArtworks = [newArt, ...(currentGaleria.artworks || [])];
    }
    const updatedGaleria = {
      ...currentGaleria,
      artworks: updatedArtworks
    };

    // Actualización atómica en config/portal autorizada para usuarios autenticados
    const portalDocRef = doc(db, 'config', 'portal');
    try {
      await updateDoc(portalDocRef, { granGaleria: updatedGaleria });
    } catch (err) {
      console.warn('[GranGaleria] updateDoc falló para obra, intentando setDoc merge:', err);
      try {
        await setDoc(portalDocRef, { granGaleria: updatedGaleria }, { merge: true });
      } catch (mergeErr) {
        console.error('[GranGaleria] Error persistiendo obra en Firestore:', mergeErr);
        await saveConfigToFirestore({
          ...config,
          granGaleria: updatedGaleria
        });
      }
    }
  };

  // Tab change handler with audio & smooth auto-centering on mobile
  const handleTabChange = (tab: GaleriaSection, e?: React.MouseEvent<HTMLButtonElement>) => {
    soundEffects.playClick();
    setActiveTab(tab);
    setSearchQuery('');
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  // Filtered Texts (Wattpad)
  const filteredTexts = useMemo(() => {
    return texts.filter(t => {
      const matchGenre = selectedGenre === 'todos' || t.genre === selectedGenre;
      const matchQuery = searchQuery === '' || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.authorSchool && t.authorSchool.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchGenre && matchQuery;
    });
  }, [texts, selectedGenre, searchQuery]);

  // Filtered Artworks (Museo)
  const filteredArtworks = useMemo(() => {
    return artworks.filter(a => {
      const matchTech = selectedTechnique === 'todos' || a.technique === selectedTechnique;
      const matchQuery = searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.artistSchool && a.artistSchool.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTech && matchQuery;
    });
  }, [artworks, selectedTechnique, searchQuery]);

  // Filtered Videos (Cine)
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchCat = selectedVideoCat === 'todos' || v.category === selectedVideoCat;
      const matchQuery = searchQuery === '' ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.school && v.school.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [videos, selectedVideoCat, searchQuery]);

  return (
    <div className="gran-galeria-page">
      {/* 1. HERO CÓSMICO DE LA GRAN GALERÍA */}
      <section className="gg-hero-banner">
        <div className="gg-hero-ambient-glow"></div>
        <div className="gg-hero-content">
          <h1 className="gg-hero-title animate-zoom-in">
            <span className="highlight-gradient">Gran Galería</span>
          </h1>

          <p className="gg-hero-desc">
            Un espacio para desarrollar tu talento y creatividad
          </p>

          <div className="gg-hero-cta-row">
            <button 
              type="button" 
              className="btn btn-secondary gg-explore-sutz-btn"
              onClick={() => {
                soundEffects.playClick();
                navigate('/sutz');
              }}
            >
              <span>🗺️</span>
              <span>Volver al mapa</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE PABELLONES / PESTAÑAS PRINCIPALES */}
      <nav className="gg-tabs-nav-wrapper">
        <div className="gg-tabs-container">
          <button 
            type="button" 
            className={`gg-tab-btn ${activeTab === 'escriba' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('escriba', e)}
          >
            <span className="tab-icon">📜</span>
            <div className="tab-text-group">
              <span className="tab-main-title">Gran Biblioteca</span>
              <span className="tab-sub-title">Códice Literario & Taller</span>
            </div>
          </button>

          <button 
            type="button" 
            className={`gg-tab-btn ${activeTab === 'museo' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('museo', e)}
          >
            <span className="tab-icon">🎨</span>
            <div className="tab-text-group">
              <span className="tab-main-title">Gran Galería</span>
              <span className="tab-sub-title">Pintura, Dibujo & Digital</span>
            </div>
          </button>

          <button 
            type="button" 
            className={`gg-tab-btn ${activeTab === 'cine' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('cine', e)}
          >
            <span className="tab-icon">🎬</span>
            <div className="tab-text-group">
              <span className="tab-main-title">Gran Sala</span>
              <span className="tab-sub-title">Cortos, Documental & Reportajes</span>
            </div>
          </button>

          <button 
            type="button" 
            className={`gg-tab-btn ${activeTab === 'concursos' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('concursos', e)}
          >
            <span className="tab-icon">🏆</span>
            <div className="tab-text-group">
              <span className="tab-main-title">Convocatorias</span>
              <span className="tab-sub-title">Bases, Certámenes & Ganadores</span>
            </div>
          </button>
        </div>
      </nav>

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS SEGÚN EL PABELLÓN ACTIVO */}
      <div className="gg-search-filter-bar">
        <div className="gg-search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={
              activeTab === 'escriba' ? "Buscar en Gran Biblioteca por título, autor o colegio..." :
              activeTab === 'museo' ? "Buscar en Gran Galería por título, artista o técnica..." :
              activeTab === 'cine' ? "Buscar en Gran Sala por cortometraje o reportaje..." :
              "Buscar en Convocatorias..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="gg-search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="gg-search-clear" 
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros por Género Literario (Gran Biblioteca) */}
        {activeTab === 'escriba' && (
          <div className="gg-chips-filter-list">
            {[
              { id: 'todos', label: 'Todos los Géneros' },
              { id: 'fantasia', label: '✨ Fantasía' },
              { id: 'sci-fi', label: '🚀 Ciencia Ficción' },
              { id: 'popol_vuh', label: '📜 Mitos Popol Vuh' },
              { id: 'poesia', label: '🪶 Poesía' },
              { id: 'cronica', label: '📰 Crónica Escolar' },
              { id: 'misterio', label: '🕵️ Misterio' }
            ].map(f => (
              <button 
                key={f.id}
                type="button" 
                className={`gg-chip-btn ${selectedGenre === f.id ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedGenre(f.id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Filtros por Técnica (Gran Galería) */}
        {activeTab === 'museo' && (
          <div className="gg-chips-filter-list">
            {[
              { id: 'todos', label: 'Todas las Técnicas' },
              { id: 'digital', label: '💻 Ilustración Digital' },
              { id: 'acuarela', label: '🖌️ Acuarela' },
              { id: 'oleo', label: '🎨 Óleo / Lienzo' },
              { id: 'mixta', label: '🧩 Técnica Mixta' },
              { id: 'lapiz', label: '✏️ Grafito / Lápiz' }
            ].map(f => (
              <button 
                key={f.id}
                type="button" 
                className={`gg-chip-btn ${selectedTechnique === f.id ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedTechnique(f.id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Filtros por Categoría Audiovisual (Gran Sala) */}
        {activeTab === 'cine' && (
          <div className="gg-chips-filter-list">
            {[
              { id: 'todos', label: 'Todas las Categorías' },
              { id: 'cortometraje', label: '🎬 Cortometrajes' },
              { id: 'documental', label: '🌲 Documentales' },
              { id: 'reportaje', label: '🎤 Reportajes Escolares' },
              { id: 'animacion', label: '🎞️ Animación Stop-Motion' }
            ].map(f => (
              <button 
                key={f.id}
                type="button" 
                className={`gg-chip-btn ${selectedVideoCat === f.id ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedVideoCat(f.id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. CONTENIDOS DE CADA SECCIÓN */}
      <main className="gg-main-content-grid">
        {/* ===================================================================
            PABELLÓN 1: GRAN BIBLIOTECA (CÓDICE & TALLER LITERARIO)
            =================================================================== */}
        {activeTab === 'escriba' && (
          <section className="gg-section-view animate-fade-in">
            <div className="gg-section-header">
              <div>
                <h2 className="gg-section-title">
                  <span>📜</span> Gran Biblioteca
                </h2>
                <p className="gg-section-subtitle">
                  Historias originales, novelas cortas y poemas escritos por jóvenes creadores escolares. Haz clic en cualquier relato para abrir el visor inmersivo o abre el taller para redactar el tuyo con reglas ortotipográficas.
                </p>
              </div>
              <div className="gg-section-header-actions">
                <button
                  type="button"
                  className="btn btn-primary gg-escriba-create-btn"
                  onClick={handleOpenEditor}
                  title={user ? "Escribir y publicar un nuevo relato en la Gran Biblioteca" : "Inicia sesión con tu cuenta para publicar un relato"}
                >
                  <span>✍️</span>
                  <span>Escribir en la Gran Biblioteca</span>
                  {!user && (
                    <span className="gg-btn-login-badge" style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                      🔒 Iniciar Sesión
                    </span>
                  )}
                </button>
                <span className="gg-results-counter">
                  Mostrando {filteredTexts.length} {filteredTexts.length === 1 ? 'relato' : 'relatos'}
                </span>
              </div>
            </div>

            <div className="gg-texts-grid">
              {filteredTexts.map(t => (
                <article 
                  key={t.id} 
                  className={`gg-story-card ${t.coverImage ? 'has-cover' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveReadingText(t);
                  }}
                >
                  {t.coverImage && (
                    <div className="story-cover-wrapper">
                      <img src={t.coverImage} alt={t.title} className="story-cover-img" loading="lazy" />
                      <div className="story-cover-gradient" />
                    </div>
                  )}

                  <div className="story-card-top">
                    {t.awardBadge && (
                      <span className="story-award-chip">{t.awardBadge}</span>
                    )}
                    <span className="story-genre-badge">{t.genre}</span>
                  </div>

                  <h3 className="story-title">{t.title}</h3>

                  <div className="story-author-row">
                    <span className="author-icon">{t.isPseudonym ? '🎭' : '✍️'}</span>
                    <div>
                      <strong className="author-name">{t.author}</strong>
                      <span className="author-school">
                        {t.isPseudonym ? '🎭 Seudónimo Literario' : (t.authorSchool || 'Estudiante')}
                      </span>
                    </div>
                  </div>

                  <p className="story-synopsis-snippet">{t.synopsis}</p>

                  <div className="story-card-footer">
                    <div className="story-stats">
                      <span>❤️ {t.likes}</span>
                      <span>👁️ {t.reads} lecturas</span>
                    </div>
                    <button type="button" className="story-read-action-btn">
                      Leer ahora ➔
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {filteredTexts.length === 0 && (
              <div className="gg-empty-state">
                <span className="empty-icon">📖</span>
                <h3>No se encontraron relatos con ese filtro</h3>
                <p>Prueba buscando con otros términos o seleccionando "Todos los Géneros".</p>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
            PABELLÓN 2: GRAN GALERÍA (OBRAS & ARTES PLÁSTICAS)
            =================================================================== */}
        {activeTab === 'museo' && (
          <section className="gg-section-view animate-fade-in">
            <div className="gg-section-header">
              <div>
                <h2 className="gg-section-title">
                  <span>🎨</span> Gran Galería · Obras & Artes Plásticas
                </h2>
                <p className="gg-section-subtitle">
                  Exhibición de artes visuales. Admira las pinceladas, texturas y creatividad de los estudiantes. Haz clic en una pieza para apreciarla en alta resolución con iluminación museográfica.
                </p>
              </div>
              <div className="gg-section-header-actions">
                <button
                  type="button"
                  className="btn btn-primary gg-obra-create-btn"
                  onClick={handleOpenArtEditor}
                  title={user ? "Publicar una nueva obra en la Gran Galería" : "Inicia sesión con tu cuenta para publicar una obra"}
                >
                  <span>🎨</span>
                  <span>Crear Gran Obra</span>
                  {!user && (
                    <span className="gg-btn-login-badge" style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                      🔒 Iniciar Sesión
                    </span>
                  )}
                </button>
                <span className="gg-results-counter">
                  Mostrando {filteredArtworks.length} {filteredArtworks.length === 1 ? 'obra' : 'obras'}
                </span>
              </div>
            </div>

            <div className="gg-artworks-grid">
              {filteredArtworks.map(a => (
                <div 
                  key={a.id} 
                  className="gg-art-card"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveArtPiece(a);
                  }}
                >
                  <div className="art-card-img-container">
                    <img src={a.imageUrl} alt={a.title} className="art-thumb-img" loading="lazy" />
                    <div className="art-overlay-glass">
                      <span>🔍 Explorar en Gran Galería</span>
                    </div>
                    {a.awardBadge && (
                      <span className="art-award-badge">{a.awardBadge}</span>
                    )}
                  </div>

                  <div className="art-card-details">
                    <h3 className="art-title">{a.title}</h3>
                    <div className="art-meta-row">
                      <span className="art-artist">🎨 {a.artist}</span>
                      <span className="art-tech-badge">{a.technique}</span>
                    </div>
                    <p className="art-school">{a.artistSchool || 'Colegio Participante'}</p>
                    <div className="art-footer-likes">
                      <span>❤️ {a.likes} apreciaciones</span>
                      <span>👁️ {a.views} vistas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="gg-empty-state">
                <span className="empty-icon">🎨</span>
                <h3>No se encontraron obras con ese criterio</h3>
                <p>Explora seleccionando "Todas las Técnicas" o limpiando la barra de búsqueda.</p>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
            PABELLÓN 3: GRAN SALA (CINE, CORTOMETRAJES & REPORTAJES)
            =================================================================== */}
        {activeTab === 'cine' && (
          <section className="gg-section-view animate-fade-in">
            <div className="gg-section-header">
              <div>
                <h2 className="gg-section-title">
                  <span>🎬</span> Gran Sala · Cortos & Videos Escolares
                </h2>
                <p className="gg-section-subtitle">
                  El cine y el periodismo en manos de los estudiantes: cortometrajes de ficción, documentales comunitarios, animaciones y reportajes científicos escolares.
                </p>
              </div>
              <span className="gg-results-counter">
                Mostrando {filteredVideos.length} {filteredVideos.length === 1 ? 'producción' : 'producciones'}
              </span>
            </div>

            <div className="gg-videos-grid">
              {filteredVideos.map(v => (
                <div 
                  key={v.id} 
                  className="gg-video-card"
                  onClick={() => {
                    soundEffects.playClick();
                    setActiveVideo(v);
                  }}
                >
                  <div className="video-thumb-container">
                    <img 
                      src={v.thumbnailUrl || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : '/assets/logo editorial-C6uKe19-.png')} 
                      alt={v.title} 
                      className="video-thumb-img"
                    />
                    <div className="video-play-disc">
                      <span>▶</span>
                    </div>
                    {v.duration && (
                      <span className="video-dur-pill">{v.duration}</span>
                    )}
                    {v.awardBadge && (
                      <span className="video-award-pill">{v.awardBadge}</span>
                    )}
                  </div>

                  <div className="video-card-info">
                    <span className="video-cat-tag">🎬 {v.category.toUpperCase()}</span>
                    <h3 className="video-title">{v.title}</h3>
                    <p className="video-team">👥 {v.team}</p>
                    <p className="video-school">{v.school || 'Equipo Escolar'}</p>
                    <p className="video-synopsis-line">{v.synopsis}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="gg-empty-state">
                <span className="empty-icon">🎥</span>
                <h3>No hay videos en esta categoría por ahora</h3>
                <p>Usa la barra de búsqueda o revisa las demás categorías.</p>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
            PABELLÓN 4: CONVOCATORIAS & SALÓN DE GALARDONADOS
            =================================================================== */}
        {activeTab === 'concursos' && (
          <section className="gg-section-view animate-fade-in">
            <div className="gg-section-header">
              <div>
                <h2 className="gg-section-title">
                  <span>🏆</span> Convocatorias Estudiantiles & Certámenes
                </h2>
                <p className="gg-section-subtitle">
                  Certámenes abiertos y ediciones anteriores organizados por la Editorial Lluvia de Ideas y el Ecosistema Sutz para promover la literatura, el arte y el cine estudiantil.
                </p>
              </div>
            </div>

            <div className="gg-contests-list">
              {contests.map(c => (
                <div key={c.id} className="gg-contest-card">
                  <div className="contest-status-bar">
                    <span className={`contest-status-pill ${c.status}`}>
                      {c.status === 'convocatoria' ? '🟢 Convocatoria Abierta' :
                       c.status === 'evaluacion' ? '🟡 En Evaluación del Jurado' :
                       c.status === 'galardonados' ? '🏆 Ganadores Publicados' : '📦 Concluido'}
                    </span>
                    <span className="contest-discipline">
                      {c.discipline === 'literatura' ? '📜 Concurso de Escritura' :
                       c.discipline === 'arte' ? '🎨 Bienal de Arte' : '🎬 Festival de Cine'}
                    </span>
                  </div>

                  <h3 className="contest-title">{c.title}</h3>
                  <p className="contest-desc">{c.description}</p>

                  <div className="contest-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">CIERRE DE RECEPCIÓN</span>
                      <strong className="detail-val">{c.deadline}</strong>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">PREMIACIÓN & RECONOCIMIENTOS</span>
                      <strong className="detail-val">{c.rewardDetails}</strong>
                    </div>
                  </div>

                  {c.guidelines && c.guidelines.length > 0 && (
                    <div className="contest-guidelines-box">
                      <h4>Bases del Concurso:</h4>
                      <ul>
                        {c.guidelines.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="contest-card-actions">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => {
                        soundEffects.playClick();
                        setIsSubmitModalOpen(true);
                      }}
                    >
                      <span>📝</span>
                      <span>Postular mi Proyecto a este Concurso</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 5. MODALES INTERACTIVOS */}
      {/* Modal de Lectura Wattpad */}
      {activeReadingText && (
        <ReadingModal 
          textItem={activeReadingText} 
          onClose={() => setActiveReadingText(null)}
          onLike={(id) => {
            console.log('Liked text:', id);
          }}
        />
      )}

      {/* Modal de Museo de Arte */}
      {activeArtPiece && (
        <ArtPieceModal 
          artItem={activeArtPiece} 
          onClose={() => setActiveArtPiece(null)}
          onLike={(id) => {
            console.log('Liked art piece:', id);
          }}
        />
      )}

      {/* Modal de Sala de Cine */}
      {activeVideo && (
        <VideoTheaterModal 
          videoItem={activeVideo} 
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Modal Guía para Enviar Obra */}
      {isSubmitModalOpen && (
        <div className="gg-modal-overlay" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="gg-submit-guide-modal" onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="gg-reader-close-btn" 
              onClick={() => setIsSubmitModalOpen(false)}
            >
              ✕
            </button>
            <div className="guide-header">
              <span className="guide-icon">📨</span>
              <h3>¿Cómo participar en La Gran Galería?</h3>
              <p>Envío de textos, ilustraciones y cortometrajes escolares</p>
            </div>
            <div className="guide-steps">
              <div className="guide-step">
                <span className="step-number">1</span>
                <div>
                  <strong>Prepara tu trabajo:</strong>
                  <p>Revisa las bases activas en la sección de Convocatorias. Puedes postular cuentos, pinturas en alta resolución o videos en YouTube.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-number">2</span>
                <div>
                  <strong>Validación escolar:</strong>
                  <p>Solicita a tu profesor o asesor escolar que acompañe tu inscripción con los datos de tu grado y colegio.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-number">3</span>
                <div>
                  <strong>Recepción y Publicación:</strong>
                  <p>Los trabajos se reciben a través de la coordinación docente y se publican en el Códice de la Gran Galería con tu nombre y créditos oficiales.</p>
                </div>
              </div>
            </div>
            <div className="guide-footer">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  soundEffects.playClick();
                  setIsSubmitModalOpen(false);
                }}
              >
                ¡Entendido, gracias!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Taller del Pergamino del Escriba */}
      <EscribaEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditorInitialData(undefined);
        }}
        onSave={handleSaveNewText}
        initialData={editorInitialData}
        currentUser={user}
        userProfile={userProfile}
      />

      {/* Modal Taller de Artes Visuales / Crear Gran Obra */}
      <ObraEditorModal
        isOpen={isArtEditorOpen}
        onClose={() => setIsArtEditorOpen(false)}
        onSave={handleSaveNewArtwork}
        currentUser={user}
        userProfile={userProfile}
      />

      {/* Modal de Autenticación Requerida */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
};

export default GranGaleria;
