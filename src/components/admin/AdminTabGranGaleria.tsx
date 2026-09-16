import React, { useState } from 'react';
import type { 
  PortalConfig, 
  StudentTextItem, 
  StudentArtItem, 
  StudentVideoItem, 
  ContestItem,
  LiteraryGenre,
  ArtTechnique,
  VideoCategory,
  ContestStatus
} from '../../types';
import { DEFAULT_GRAN_GALERIA } from '../../data/defaultGranGaleriaData';
import { extractYouTubeId } from './AdminTabVideos';
import { uploadImageWithFallback } from '../../utils/imageUpload';
import AdminTabPozoDeIdeas from './AdminTabPozoDeIdeas';

interface AdminTabGranGaleriaProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

type AdminSubTab = 'wattpad' | 'museo' | 'cine' | 'concursos' | 'incubadora';

export default function AdminTabGranGaleria({ localConfig, setLocalConfig }: AdminTabGranGaleriaProps) {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('wattpad');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Gran Galería Config from localConfig
  const galeriaConfig = localConfig.granGaleria || DEFAULT_GRAN_GALERIA;
  const texts = galeriaConfig.texts || [];
  const artworks = galeriaConfig.artworks || [];
  const videos = galeriaConfig.videos || [];
  const contests = galeriaConfig.contests || [];

  // Helper to update granGaleria in localConfig
  const updateGranGaleria = (updater: (prev: typeof galeriaConfig) => typeof galeriaConfig) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      const current = prev.granGaleria || DEFAULT_GRAN_GALERIA;
      const updated = updater(current);
      return {
        ...prev,
        granGaleria: updated
      };
    });
  };

  // --- STATE FOR EDITING TEXTS (WATTPAD) ---
  const [editingText, setEditingText] = useState<Partial<StudentTextItem> | null>(null);
  const [isNewText, setIsNewText] = useState<boolean>(false);

  const handleSaveText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingText || !editingText.title?.trim() || !editingText.author?.trim()) {
      alert('Por favor completa el título y autor del texto.');
      return;
    }

    updateGranGaleria(prev => {
      const now = new Date().toISOString().split('T')[0];
      if (isNewText) {
        const newItem: StudentTextItem = {
          id: `texto-${Date.now()}`,
          title: editingText.title!.trim(),
          author: editingText.author!.trim(),
          authorGrade: editingText.authorGrade || '',
          authorSchool: editingText.authorSchool || '',
          genre: (editingText.genre as LiteraryGenre) || 'fantasia',
          synopsis: editingText.synopsis || '',
          content: editingText.content || '',
          awardBadge: editingText.awardBadge || '',
          concursoId: editingText.concursoId || '',
          likes: editingText.likes || 0,
          reads: editingText.reads || 0,
          featured: Boolean(editingText.featured),
          publishedAt: now
        };
        return { ...prev, texts: [newItem, ...(prev.texts || [])] };
      } else {
        return {
          ...prev,
          texts: (prev.texts || []).map(t => t.id === editingText.id ? { ...t, ...editingText } as StudentTextItem : t)
        };
      }
    });

    setEditingText(null);
    setIsNewText(false);
  };

  const handleDeleteText = (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este relato de la Gran Galería?')) return;
    updateGranGaleria(prev => ({
      ...prev,
      texts: (prev.texts || []).filter(t => t.id !== id)
    }));
  };

  // --- STATE FOR EDITING ARTWORKS (MUSEO) ---
  const [editingArt, setEditingArt] = useState<Partial<StudentArtItem> | null>(null);
  const [isNewArt, setIsNewArt] = useState<boolean>(false);

  const handleSaveArt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArt || !editingArt.title?.trim() || !editingArt.artist?.trim() || !editingArt.imageUrl?.trim()) {
      alert('Por favor completa el título, artista y la imagen de la obra.');
      return;
    }

    updateGranGaleria(prev => {
      const now = new Date().toISOString().split('T')[0];
      if (isNewArt) {
        const newItem: StudentArtItem = {
          id: `arte-${Date.now()}`,
          title: editingArt.title!.trim(),
          artist: editingArt.artist!.trim(),
          artistGrade: editingArt.artistGrade || '',
          artistSchool: editingArt.artistSchool || '',
          technique: (editingArt.technique as ArtTechnique) || 'digital',
          dimensions: editingArt.dimensions || '',
          description: editingArt.description || '',
          imageUrl: editingArt.imageUrl!.trim(),
          awardBadge: editingArt.awardBadge || '',
          concursoId: editingArt.concursoId || '',
          likes: editingArt.likes || 0,
          views: editingArt.views || 0,
          featured: Boolean(editingArt.featured),
          publishedAt: now
        };
        return { ...prev, artworks: [newItem, ...(prev.artworks || [])] };
      } else {
        return {
          ...prev,
          artworks: (prev.artworks || []).map(a => a.id === editingArt.id ? { ...a, ...editingArt } as StudentArtItem : a)
        };
      }
    });

    setEditingArt(null);
    setIsNewArt(false);
  };

  const handleDeleteArt = (id: string) => {
    if (!window.confirm('¿Deseas retirar esta obra del Museo Virtual?')) return;
    updateGranGaleria(prev => ({
      ...prev,
      artworks: (prev.artworks || []).filter(a => a.id !== id)
    }));
  };

  const handleUploadArtImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadImageWithFallback(file, 'gran_galeria_arte');
      setEditingArt(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Error subiendo imagen de arte:', err);
      alert('No se pudo subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- STATE FOR EDITING VIDEOS (MEDIATECA) ---
  const [editingVideo, setEditingVideo] = useState<Partial<StudentVideoItem> | null>(null);
  const [isNewVideo, setIsNewVideo] = useState<boolean>(false);

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.title?.trim() || !editingVideo.videoUrl?.trim()) {
      alert('Por favor completa el título y enlace del video.');
      return;
    }

    const ytId = extractYouTubeId(editingVideo.videoUrl || '');

    updateGranGaleria(prev => {
      const now = new Date().toISOString().split('T')[0];
      if (isNewVideo) {
        const newItem: StudentVideoItem = {
          id: `video-${Date.now()}`,
          title: editingVideo.title!.trim(),
          team: editingVideo.team || 'Equipo Estudiantil',
          school: editingVideo.school || '',
          grade: editingVideo.grade || '',
          category: (editingVideo.category as VideoCategory) || 'cortometraje',
          synopsis: editingVideo.synopsis || '',
          videoUrl: editingVideo.videoUrl!.trim(),
          youtubeId: ytId,
          duration: editingVideo.duration || '05:00',
          awardBadge: editingVideo.awardBadge || '',
          concursoId: editingVideo.concursoId || '',
          views: editingVideo.views || 0,
          featured: Boolean(editingVideo.featured),
          publishedAt: now
        };
        return { ...prev, videos: [newItem, ...(prev.videos || [])] };
      } else {
        return {
          ...prev,
          videos: (prev.videos || []).map(v => v.id === editingVideo.id ? { ...v, ...editingVideo, youtubeId: ytId } as StudentVideoItem : v)
        };
      }
    });

    setEditingVideo(null);
    setIsNewVideo(false);
  };

  const handleDeleteVideo = (id: string) => {
    if (!window.confirm('¿Deseas eliminar este video de la Mediateca?')) return;
    updateGranGaleria(prev => ({
      ...prev,
      videos: (prev.videos || []).filter(v => v.id !== id)
    }));
  };

  // --- STATE FOR EDITING CONTESTS ---
  const [editingContest, setEditingContest] = useState<Partial<ContestItem> | null>(null);
  const [isNewContest, setIsNewContest] = useState<boolean>(false);

  const handleSaveContest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContest || !editingContest.title?.trim()) {
      alert('Por favor ingresa el título del certamen.');
      return;
    }

    updateGranGaleria(prev => {
      if (isNewContest) {
        const newItem: ContestItem = {
          id: `concurso-${Date.now()}`,
          title: editingContest.title!.trim(),
          discipline: editingContest.discipline || 'literatura',
          genreOrCategory: editingContest.genreOrCategory || '',
          description: editingContest.description || '',
          guidelines: editingContest.guidelines || ['Revisar con el asesor escolar.'],
          deadline: editingContest.deadline || '30 de Noviembre de 2026',
          rewardDetails: editingContest.rewardDetails || 'Diploma de Honor y lote de libros.',
          status: (editingContest.status as ContestStatus) || 'convocatoria',
          featured: Boolean(editingContest.featured)
        };
        return { ...prev, contests: [newItem, ...(prev.contests || [])] };
      } else {
        return {
          ...prev,
          contests: (prev.contests || []).map(c => c.id === editingContest.id ? { ...c, ...editingContest } as ContestItem : c)
        };
      }
    });

    setEditingContest(null);
    setIsNewContest(false);
  };

  const handleDeleteContest = (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta convocatoria de concurso?')) return;
    updateGranGaleria(prev => ({
      ...prev,
      contests: (prev.contests || []).filter(c => c.id !== id)
    }));
  };

  return (
    <div className="admin-card card-glass animate-fade-in gran-galeria-admin">
      {/* Banner Principal de la Sección */}
      <div className="admin-section-header-banner" style={{ borderLeft: '4px solid #a855f7', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, color: '#f8fafc' }}>
          <span>💡</span> La Gran Galería: Talento Estudiantil & Banco de Proyectos
        </h3>
        <p className="tab-section-desc" style={{ marginTop: '0.4rem', color: '#94a3b8' }}>
          Administra los relatos de nuestro <strong>Wattpad escolar</strong>, las pinturas del <strong>Museo Virtual</strong>, los <strong>cortometrajes</strong> y las convocatorias de <strong>concursos</strong>.
        </p>
      </div>

      {/* Subnavegación de Pestañas Administrativas */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
        <button 
          type="button" 
          className={`btn ${activeSubTab === 'wattpad' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('wattpad')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>📜</span> Wattpad Estudiantil ({texts.length})
        </button>
        <button 
          type="button" 
          className={`btn ${activeSubTab === 'museo' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('museo')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🎨</span> Museo Virtual ({artworks.length})
        </button>
        <button 
          type="button" 
          className={`btn ${activeSubTab === 'cine' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('cine')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🎬</span> Cine & Mediateca ({videos.length})
        </button>
        <button 
          type="button" 
          className={`btn ${activeSubTab === 'concursos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('concursos')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🏆</span> Concursos ({contests.length})
        </button>
        <button 
          type="button" 
          className={`btn ${activeSubTab === 'incubadora' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('incubadora')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🌱</span> Banco de Proyectos / Incubadora
        </button>
      </div>

      {/* ===================================================================
          SUBTAB 1: WATTPAD ESTUDIANTIL
          =================================================================== */}
      {activeSubTab === 'wattpad' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#f8fafc' }}>Textos y Novelas Estudiantiles (Wattpad)</h4>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setEditingText({
                  title: '',
                  author: '',
                  authorGrade: '',
                  authorSchool: '',
                  genre: 'fantasia',
                  synopsis: '',
                  content: '',
                  awardBadge: '',
                  likes: 0,
                  reads: 0,
                  featured: true
                });
                setIsNewText(true);
              }}
            >
              + Añadir Nuevo Relato
            </button>
          </div>

          {/* Formulario de Edición/Creación de Texto */}
          {editingText && (
            <form onSubmit={handleSaveText} style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #a855f7', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#c084fc' }}>
                {isNewText ? '✨ Publicar Nueva Obra Estudiantil' : `✏️ Editar Obra: ${editingText.title}`}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Título de la Obra:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingText.title || ''}
                    onChange={e => setEditingText(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: El Misterio del Lago Sagrado"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Autor (Estudiante):</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingText.author || ''}
                    onChange={e => setEditingText(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Nombre del estudiante"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Género Literario:</label>
                  <select 
                    className="inspector-select"
                    value={editingText.genre || 'fantasia'}
                    onChange={e => setEditingText(prev => ({ ...prev, genre: e.target.value as LiteraryGenre }))}
                  >
                    <option value="fantasia">✨ Fantasía</option>
                    <option value="sci-fi">🚀 Ciencia Ficción</option>
                    <option value="popol_vuh">📜 Mitos Popol Vuh</option>
                    <option value="poesia">🪶 Poesía</option>
                    <option value="cronica">📰 Crónica Escolar</option>
                    <option value="misterio">🕵️ Misterio</option>
                    <option value="fabula">🦊 Fábula</option>
                    <option value="ensayo">💡 Ensayo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Grado Escolar:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingText.authorGrade || ''}
                    onChange={e => setEditingText(prev => ({ ...prev, authorGrade: e.target.value }))}
                    placeholder="Ej: 3ro Básico"
                  />
                </div>
                <div>
                  <label className="inspector-label">Colegio / Institución:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingText.authorSchool || ''}
                    onChange={e => setEditingText(prev => ({ ...prev, authorSchool: e.target.value }))}
                    placeholder="Nombre del colegio"
                  />
                </div>
                <div>
                  <label className="inspector-label">Insignia / Premio de Concurso (Opcional):</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingText.awardBadge || ''}
                    onChange={e => setEditingText(prev => ({ ...prev, awardBadge: e.target.value }))}
                    placeholder="Ej: 🏆 1er Lugar - Concurso Popol Vuh"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Sinopsis breve:</label>
                <textarea 
                  rows={2}
                  className="inspector-input"
                  value={editingText.synopsis || ''}
                  onChange={e => setEditingText(prev => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="Resumen atractivo para la portada del relato..."
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Contenido completo de la obra (Capítulos o texto continuo):</label>
                <textarea 
                  rows={8}
                  className="inspector-input"
                  value={editingText.content || ''}
                  onChange={e => setEditingText(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe o pega aquí el cuento o poema completo..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingText(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Guardar Relato
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Textos */}
          <div style={{ display: 'grid', gap: '10px' }}>
            {texts.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>{t.title}</strong>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '1px 6px', borderRadius: '4px' }}>
                      {t.genre}
                    </span>
                    {t.awardBadge && (
                      <span style={{ fontSize: '0.72rem', background: '#f59e0b', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                        {t.awardBadge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.80rem', color: '#94a3b8', marginTop: '2px' }}>
                    Por {t.author} · {t.authorSchool || 'Estudiante'} · {t.reads} lecturas · {t.likes} me gusta
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => {
                      setEditingText(t);
                      setIsNewText(false);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                    onClick={() => handleDeleteText(t.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUBTAB 2: MUSEO VIRTUAL (ARTE)
          =================================================================== */}
      {activeSubTab === 'museo' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#f8fafc' }}>Obras de Arte e Ilustración (Museo Virtual)</h4>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setEditingArt({
                  title: '',
                  artist: '',
                  artistGrade: '',
                  artistSchool: '',
                  technique: 'digital',
                  dimensions: '',
                  description: '',
                  imageUrl: '',
                  awardBadge: '',
                  likes: 0,
                  views: 0,
                  featured: true
                });
                setIsNewArt(true);
              }}
            >
              + Añadir Nueva Obra
            </button>
          </div>

          {/* Formulario de Obra de Arte */}
          {editingArt && (
            <form onSubmit={handleSaveArt} style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #38bdf8', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#38bdf8' }}>
                {isNewArt ? '🎨 Subir Nueva Obra al Museo' : `✏️ Editar Obra: ${editingArt.title}`}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Título de la Obra:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.title || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: El Guardián de la Niebla"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Artista (Estudiante):</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.artist || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Nombre del artista escolar"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Técnica:</label>
                  <select 
                    className="inspector-select"
                    value={editingArt.technique || 'digital'}
                    onChange={e => setEditingArt(prev => ({ ...prev, technique: e.target.value as ArtTechnique }))}
                  >
                    <option value="digital">💻 Ilustración Digital</option>
                    <option value="acuarela">🖌️ Acuarela</option>
                    <option value="oleo">🎨 Óleo sobre lienzo</option>
                    <option value="lapiz">✏️ Lápiz / Carboncillo</option>
                    <option value="mixta">🧩 Técnica Mixta</option>
                    <option value="escultura">🗿 Escultura / Modelado</option>
                    <option value="pastel">🖍️ Pastel seco / al óleo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Grado Escolar:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.artistGrade || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, artistGrade: e.target.value }))}
                    placeholder="Ej: 4to Primaria"
                  />
                </div>
                <div>
                  <label className="inspector-label">Colegio / Institución:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.artistSchool || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, artistSchool: e.target.value }))}
                    placeholder="Nombre del colegio"
                  />
                </div>
                <div>
                  <label className="inspector-label">Premio / Mención (Opcional):</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.awardBadge || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, awardBadge: e.target.value }))}
                    placeholder="Ej: 🥇 1er Lugar - Bienal de Arte"
                  />
                </div>
              </div>

              {/* Imagen de la Obra */}
              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Imagen de la Obra (URL o Subir archivo):</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingArt.imageUrl || ''}
                    onChange={e => setEditingArt(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="URL de la imagen o WebP..."
                    required
                  />
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {isUploading ? 'Subiendo...' : '📁 Subir Imagen'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleUploadArtImage}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {editingArt.imageUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={editingArt.imageUrl} alt="Vista previa" style={{ maxHeight: '100px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Declaración o descripción de la obra:</label>
                <textarea 
                  rows={2}
                  className="inspector-input"
                  value={editingArt.description || ''}
                  onChange={e => setEditingArt(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Inspiración, significado o proceso creativo de la pieza..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingArt(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Guardar Obra en Museo
                </button>
              </div>
            </form>
          )}

          {/* Lista de Obras */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {artworks.map(a => (
              <div 
                key={a.id}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  overflow: 'hidden' 
                }}
              >
                <img src={a.imageUrl} alt={a.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <strong style={{ color: '#f8fafc', display: 'block' }}>{a.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Por {a.artist} ({a.technique})</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>❤️ {a.likes}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setEditingArt(a);
                          setIsNewArt(false);
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                        onClick={() => handleDeleteArt(a.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUBTAB 3: CINE & MEDIATECA
          =================================================================== */}
      {activeSubTab === 'cine' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#f8fafc' }}>Cortometrajes, Documentales & Reportajes Escolares</h4>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setEditingVideo({
                  title: '',
                  team: '',
                  school: '',
                  grade: '',
                  category: 'cortometraje',
                  synopsis: '',
                  videoUrl: '',
                  duration: '05:00',
                  awardBadge: '',
                  views: 0,
                  featured: true
                });
                setIsNewVideo(true);
              }}
            >
              + Añadir Video Escolar
            </button>
          </div>

          {/* Formulario de Video */}
          {editingVideo && (
            <form onSubmit={handleSaveVideo} style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #ef4444', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#ef4444' }}>
                {isNewVideo ? '🎬 Enlazar Nuevo Cortometraje / Reportaje' : `✏️ Editar Video: ${editingVideo.title}`}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Título del Cortometraje / Reportaje:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingVideo.title || ''}
                    onChange={e => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Guardianes del Volcán"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Equipo / Realizadores:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingVideo.team || ''}
                    onChange={e => setEditingVideo(prev => ({ ...prev, team: e.target.value }))}
                    placeholder="Ej: Club de Cine 3ro Básico"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Categoría:</label>
                  <select 
                    className="inspector-select"
                    value={editingVideo.category || 'cortometraje'}
                    onChange={e => setEditingVideo(prev => ({ ...prev, category: e.target.value as VideoCategory }))}
                  >
                    <option value="cortometraje">🎬 Cortometraje Ficción</option>
                    <option value="documental">🌲 Documental Escolar</option>
                    <option value="reportaje">🎤 Reportaje Periodístico</option>
                    <option value="animacion">🎞️ Animación Stop-Motion</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Enlace de YouTube o Vimeo:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingVideo.videoUrl || ''}
                    onChange={e => setEditingVideo(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Duración:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingVideo.duration || ''}
                    onChange={e => setEditingVideo(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Ej: 04:30"
                  />
                </div>
                <div>
                  <label className="inspector-label">Premio o Mención:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingVideo.awardBadge || ''}
                    onChange={e => setEditingVideo(prev => ({ ...prev, awardBadge: e.target.value }))}
                    placeholder="Ej: 🎬 Mejor Corto 2026"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Sinopsis de la producción:</label>
                <textarea 
                  rows={2}
                  className="inspector-input"
                  value={editingVideo.synopsis || ''}
                  onChange={e => setEditingVideo(prev => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="Argumento de la historia o tema del reportaje..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingVideo(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Guardar Video
                </button>
              </div>
            </form>
          )}

          {/* Lista de Videos */}
          <div style={{ display: 'grid', gap: '10px' }}>
            {videos.map(v => (
              <div 
                key={v.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>{v.title}</strong>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1px 6px', borderRadius: '4px' }}>
                      {v.category}
                    </span>
                    {v.duration && (
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px' }}>
                        {v.duration}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.80rem', color: '#94a3b8', marginTop: '2px' }}>
                    Por {v.team} · {v.school || 'Equipo Escolar'} · {v.views} vistas
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => {
                      setEditingVideo(v);
                      setIsNewVideo(false);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                    onClick={() => handleDeleteVideo(v.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUBTAB 4: CONCURSOS & CONVOCATORIAS
          =================================================================== */}
      {activeSubTab === 'concursos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#f8fafc' }}>Convocatorias de Concursos Escolares</h4>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                setEditingContest({
                  title: '',
                  discipline: 'literatura',
                  genreOrCategory: '',
                  description: '',
                  deadline: '30 de Noviembre de 2026',
                  rewardDetails: 'Lote de libros y medalla digital.',
                  status: 'convocatoria',
                  guidelines: ['Tener matrícula escolar activa.', 'Originalidad comprobada.']
                });
                setIsNewContest(true);
              }}
            >
              + Nuevo Concurso
            </button>
          </div>

          {/* Formulario de Concurso */}
          {editingContest && (
            <form onSubmit={handleSaveContest} style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #10b981', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem', color: '#10b981' }}>
                {isNewContest ? '🏆 Abrir Nueva Convocatoria' : `✏️ Editar Concurso: ${editingContest.title}`}
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Título del Concurso:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingContest.title || ''}
                    onChange={e => setEditingContest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Certamen Escolar de Cuentos Popol Vuh"
                    required
                  />
                </div>
                <div>
                  <label className="inspector-label">Disciplina:</label>
                  <select 
                    className="inspector-select"
                    value={editingContest.discipline || 'literatura'}
                    onChange={e => setEditingContest(prev => ({ ...prev, discipline: e.target.value as any }))}
                  >
                    <option value="literatura">📜 Literatura / Cuento</option>
                    <option value="arte">🎨 Pintura & Ilustración</option>
                    <option value="video">🎬 Cine & Cortometraje</option>
                    <option value="multidisciplinar">🌐 Multidisciplinar</option>
                  </select>
                </div>
                <div>
                  <label className="inspector-label">Estado:</label>
                  <select 
                    className="inspector-select"
                    value={editingContest.status || 'convocatoria'}
                    onChange={e => setEditingContest(prev => ({ ...prev, status: e.target.value as ContestStatus }))}
                  >
                    <option value="convocatoria">🟢 Convocatoria Abierta</option>
                    <option value="evaluacion">🟡 En Evaluación</option>
                    <option value="galardonados">🏆 Galardonados Publicados</option>
                    <option value="archivado">📦 Concluido</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="inspector-label">Fecha Límite de Recepción:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingContest.deadline || ''}
                    onChange={e => setEditingContest(prev => ({ ...prev, deadline: e.target.value }))}
                    placeholder="Ej: 30 de Octubre de 2026"
                  />
                </div>
                <div>
                  <label className="inspector-label">Detalles de Premios y Reconocimientos:</label>
                  <input 
                    type="text" 
                    className="inspector-input"
                    value={editingContest.rewardDetails || ''}
                    onChange={e => setEditingContest(prev => ({ ...prev, rewardDetails: e.target.value }))}
                    placeholder="Ej: Publicación oficial, medallas y diplomas"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="inspector-label">Descripción del certamen:</label>
                <textarea 
                  rows={2}
                  className="inspector-input"
                  value={editingContest.description || ''}
                  onChange={e => setEditingContest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Objetivo, destinatarios y temática central del concurso..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingContest(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Guardar Concurso
                </button>
              </div>
            </form>
          )}

          {/* Lista de Concursos */}
          <div style={{ display: 'grid', gap: '10px' }}>
            {contests.map(c => (
              <div 
                key={c.id} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '10px', 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>{c.title}</strong>
                    <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.80rem', color: '#94a3b8', marginTop: '2px' }}>
                    Cierre: {c.deadline} · {c.rewardDetails}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => {
                      setEditingContest(c);
                      setIsNewContest(false);
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5' }}
                    onClick={() => handleDeleteContest(c.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUBTAB 5: BANCO DE PROYECTOS / INCUBADORA
          =================================================================== */}
      {activeSubTab === 'incubadora' && (
        <div>
          <AdminTabPozoDeIdeas localConfig={localConfig} setLocalConfig={setLocalConfig} />
        </div>
      )}
    </div>
  );
}
