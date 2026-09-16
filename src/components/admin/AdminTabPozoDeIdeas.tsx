import React, { useState } from 'react';
import type { 
  PortalConfig, 
  PozoIdeaItem, 
  PozoIdeaCategory, 
  PozoIdeaStatus, 
  PozoIdeaPriority 
} from '../../types';

interface AdminTabPozoDeIdeasProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
}

const CATEGORY_LABELS: Record<PozoIdeaCategory, { label: string; icon: string; color: string }> = {
  sutz: { label: 'Sutz (Ecosistema)', icon: '☁️', color: '#10b981' },
  creatika: { label: 'Creatika (Artes & Humanidades)', icon: '✨', color: '#ec4899' },
  '100tek': { label: '100tek (Ciencia & STEM)', icon: '⚡', color: '#f59e0b' },
  lab: { label: 'LAB (Talleres & Guías)', icon: '🧪', color: '#0ea5e9' },
  mercado: { label: 'Mercado (Tienda en Línea)', icon: '🛍️', color: '#14b8a6' }
};

const STATUS_LABELS: Record<PozoIdeaStatus, { label: string; icon: string; color: string }> = {
  semilla: { label: 'Semilla', icon: '🌱', color: '#a855f7' },
  desarrollo: { label: 'En Desarrollo', icon: '🚀', color: '#3b82f6' },
  publicado: { label: 'Publicado', icon: '✅', color: '#10b981' },
  archivo: { label: 'Archivo', icon: '📦', color: '#64748b' }
};

export default function AdminTabPozoDeIdeas({ localConfig, setLocalConfig }: AdminTabPozoDeIdeasProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<PozoIdeaCategory>('creatika');
  const [formStatus, setFormStatus] = useState<PozoIdeaStatus>('semilla');
  const [formPriority, setFormPriority] = useState<PozoIdeaPriority>('media');
  const [formTags, setFormTags] = useState('');
  const [formAuthor, setFormAuthor] = useState('Equipo Editorial');
  const [formNotes, setFormNotes] = useState('');

  const pozoConfig = localConfig.pozoIdeas || {
    intro: 'Incubadora de innovación para registrar y organizar todas las propuestas, talleres, guías y funcionalidades futuras, asignadas a los pilares de Sutz.',
    ideas: []
  };

  const ideas = pozoConfig.ideas || [];

  // Filter ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategoryFilter === 'todos' || idea.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === 'todos' || idea.status === selectedStatusFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.tags && idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Metrics
  const totalIdeas = ideas.length;
  const enDesarrolloCount = ideas.filter(i => i.status === 'desarrollo').length;
  const publicadasCount = ideas.filter(i => i.status === 'publicado').length;
  const semillaCount = ideas.filter(i => i.status === 'semilla').length;

  const handleOpenAddForm = () => {
    setEditingIdeaId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('creatika');
    setFormStatus('semilla');
    setFormPriority('media');
    setFormTags('');
    setFormAuthor('Equipo Editorial');
    setFormNotes('');
    setIsAddingIdea(true);
  };

  const handleOpenEditForm = (idea: PozoIdeaItem) => {
    setEditingIdeaId(idea.id);
    setFormTitle(idea.title);
    setFormDescription(idea.description);
    setFormCategory(idea.category);
    setFormStatus(idea.status);
    setFormPriority(idea.priority || 'media');
    setFormTags(idea.tags ? idea.tags.join(', ') : '');
    setFormAuthor(idea.author || 'Equipo Editorial');
    setFormNotes(idea.notes || '');
    setIsAddingIdea(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const nowIso = new Date().toISOString();

    setLocalConfig(prev => {
      if (!prev) return null;
      const currentPozo = prev.pozoIdeas || {
        intro: 'Incubadora de innovación para registrar y organizar todas las propuestas pedagógicas y funcionales del ecosistema Sutz.',
        ideas: []
      };

      let updatedIdeas: PozoIdeaItem[];

      if (editingIdeaId) {
        updatedIdeas = currentPozo.ideas.map(i => {
          if (i.id === editingIdeaId) {
            return {
              ...i,
              title: formTitle.trim(),
              description: formDescription.trim(),
              category: formCategory,
              status: formStatus,
              priority: formPriority,
              tags: tagsArray,
              author: formAuthor.trim(),
              notes: formNotes.trim(),
              updatedAt: nowIso
            };
          }
          return i;
        });
      } else {
        const newIdea: PozoIdeaItem = {
          id: `idea-${Date.now()}`,
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          status: formStatus,
          priority: formPriority,
          tags: tagsArray,
          author: formAuthor.trim() || 'Equipo Editorial',
          createdAt: nowIso,
          updatedAt: nowIso,
          notes: formNotes.trim()
        };
        updatedIdeas = [newIdea, ...currentPozo.ideas];
      }

      return {
        ...prev,
        pozoIdeas: {
          ...currentPozo,
          ideas: updatedIdeas
        }
      };
    });

    setIsAddingIdea(false);
    setEditingIdeaId(null);
  };

  const handleDeleteIdea = (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta propuesta del Pozo de Ideas?')) return;
    setLocalConfig(prev => {
      if (!prev || !prev.pozoIdeas) return prev;
      return {
        ...prev,
        pozoIdeas: {
          ...prev.pozoIdeas,
          ideas: prev.pozoIdeas.ideas.filter(i => i.id !== id)
        }
      };
    });
  };

  const handleUpdateStatusDirectly = (id: string, newStatus: PozoIdeaStatus) => {
    setLocalConfig(prev => {
      if (!prev || !prev.pozoIdeas) return prev;
      return {
        ...prev,
        pozoIdeas: {
          ...prev.pozoIdeas,
          ideas: prev.pozoIdeas.ideas.map(i => {
            if (i.id === id) {
              return { ...i, status: newStatus, updatedAt: new Date().toISOString() };
            }
            return i;
          })
        }
      };
    });
  };

  return (
    <div className="admin-card card-glass animate-fade-in pozo-ideas-container">
      <div className="admin-section-header-banner" style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, color: '#f8fafc' }}>
          <span>💡</span> Pozo de Ideas & Banco de Proyectos (Ecosistema Sutz)
        </h3>
        <p className="tab-section-desc" style={{ marginTop: '0.4rem', color: '#94a3b8' }}>
          Incubadora de innovación para registrar y organizar todas las propuestas, talleres, guías y funcionalidades futuras, asignadas a los pilares de Sutz: <strong>Creatika</strong>, <strong>100tek</strong>, <strong>LAB</strong>, <strong>Mercado</strong> o al <strong>Núcleo Sutz</strong>.
        </p>
      </div>

      {/* Métricas Resumidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Propuestas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>{totalIdeas}</div>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🚀 En Desarrollo</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#93c5fd', marginTop: '0.2rem' }}>{enDesarrolloCount}</div>
        </div>
        <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🌱 Semillas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d8b4fe', marginTop: '0.2rem' }}>{semillaCount}</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✅ Publicadas</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6ee7b7', marginTop: '0.2rem' }}>{publicadasCount}</div>
        </div>
      </div>

      {/* Controles de Acción y Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.8rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          {/* Filtro por Categoría / Pilar */}
          <select 
            value={selectedCategoryFilter} 
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.9rem'
            }}
          >
            <option value="todos">🏛️ Todos los Pilares</option>
            <option value="sutz">☁️ Sutz (Ecosistema)</option>
            <option value="creatika">✨ Creatika (Artes & Humanidades)</option>
            <option value="100tek">⚡ 100tek (Ciencia & STEM)</option>
            <option value="lab">🧪 LAB (Talleres & Guías)</option>
            <option value="mercado">🛍️ Mercado (Tienda en Línea)</option>
          </select>

          {/* Filtro por Estado */}
          <select 
            value={selectedStatusFilter} 
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.9rem'
            }}
          >
            <option value="todos">📊 Todos los Estados</option>
            <option value="semilla">🌱 Semilla</option>
            <option value="desarrollo">🚀 En Desarrollo</option>
            <option value="publicado">✅ Publicado</option>
            <option value="archivo">📦 Archivo</option>
          </select>

          {/* Búsqueda */}
          <input 
            type="text"
            placeholder="Buscar por título, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '0.9rem',
              minWidth: '180px'
            }}
          />
        </div>

        {/* Botón Nueva Idea */}
        <button 
          type="button"
          onClick={handleOpenAddForm}
          className="admin-btn-primary"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}
        >
          <span>✨</span> Proponer Nueva Idea
        </button>
      </div>

      {/* Formulario de Creación / Edición */}
      {isAddingIdea && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
            <h4 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{editingIdeaId ? '✏️' : '💡'}</span> {editingIdeaId ? 'Editar Idea del Pozo' : 'Registrar Nueva Propuesta para Sutz'}
            </h4>
            <button 
              type="button" 
              onClick={() => setIsAddingIdea(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveIdea}>
            <div className="admin-form-row two-cols">
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Título del Proyecto / Idea *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Taller de Microscopía Virtual Maya" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                />
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Pilar Destino en Sutz *</label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value as PozoIdeaCategory)}
                >
                  <option value="creatika">✨ Creatika (Artes y Humanidades)</option>
                  <option value="100tek">⚡ 100tek (Ciencia, Lógica y Tecnología)</option>
                  <option value="lab">🧪 LAB (Prácticas, Talleres y Guías)</option>
                  <option value="mercado">🛍️ Mercado (Tienda en Línea)</option>
                  <option value="sutz">☁️ Sutz (Ecosistema Central)</option>
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Descripción Pedagógica / Propuesta *</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Explica de qué trata la propuesta, qué necesidad educativa cubre y cómo se integra con los estudiantes o docentes..."
                  value={formDescription} 
                  onChange={(e) => setFormDescription(e.target.value)} 
                />
              </div>
            </div>

            <div className="admin-form-row three-cols">
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Etapa de Desarrollo</label>
                <select 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value as PozoIdeaStatus)}
                >
                  <option value="semilla">🌱 Semilla (Idea Inicial)</option>
                  <option value="desarrollo">🚀 En Desarrollo Activo</option>
                  <option value="publicado">✅ Publicado en Producción</option>
                  <option value="archivo">📦 Archivo / En Pausa</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Prioridad</label>
                <select 
                  value={formPriority} 
                  onChange={(e) => setFormPriority(e.target.value as PozoIdeaPriority)}
                >
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Etiquetas / Tags (separadas por coma)</label>
                <input 
                  type="text" 
                  placeholder="animación, primaria, interactivo" 
                  value={formTags} 
                  onChange={(e) => setFormTags(e.target.value)} 
                />
              </div>
            </div>

            <div className="admin-form-row two-cols">
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Autor / Proponente</label>
                <input 
                  type="text" 
                  value={formAuthor} 
                  onChange={(e) => setFormAuthor(e.target.value)} 
                />
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#cbd5e1' }}>Notas Técnicas / Enlaces</label>
                <input 
                  type="text" 
                  placeholder="Librería Three.js, ruta sugerida /creatika/color..." 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.2rem' }}>
              <button 
                type="button" 
                onClick={() => setIsAddingIdea(false)}
                className="admin-btn-secondary"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="admin-btn-primary"
                style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '0.5rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {editingIdeaId ? 'Actualizar Propuesta' : 'Guardar en el Pozo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Ideas */}
      {filteredIdeas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🌱</div>
          <h4 style={{ color: '#f8fafc', marginBottom: '0.4rem' }}>No hay ideas que coincidan con estos filtros</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ajusta los filtros de pilar y etapa o propón la primera idea para comenzar la incubación.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {filteredIdeas.map((idea) => {
            const categoryInfo = CATEGORY_LABELS[idea.category] || CATEGORY_LABELS.sutz;
            const statusInfo = STATUS_LABELS[idea.status] || STATUS_LABELS.semilla;

            return (
              <div 
                key={idea.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderTop: `3px solid ${categoryInfo.color}`,
                  borderRadius: '10px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div>
                  {/* Badges superiores */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      background: `${categoryInfo.color}22`,
                      color: categoryInfo.color,
                      border: `1px solid ${categoryInfo.color}44`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span>{categoryInfo.icon}</span> {categoryInfo.label.split(' ')[0]}
                    </span>

                    {/* Selector rápido de estado */}
                    <select
                      value={idea.status}
                      onChange={(e) => handleUpdateStatusDirectly(idea.id, e.target.value as PozoIdeaStatus)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '6px',
                        background: '#0f172a',
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}55`,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="semilla">🌱 Semilla</option>
                      <option value="desarrollo">🚀 En Desarrollo</option>
                      <option value="publicado">✅ Publicado</option>
                      <option value="archivo">📦 Archivo</option>
                    </select>
                  </div>

                  {/* Título */}
                  <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0', fontSize: '1.05rem', lineHeight: '1.4' }}>
                    {idea.title}
                  </h4>

                  {/* Descripción */}
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 0.8rem 0' }}>
                    {idea.description}
                  </p>

                  {/* Tags */}
                  {idea.tags && idea.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.8rem' }}>
                      {idea.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#94a3b8'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notas Técnicas si existen */}
                  {idea.notes && (
                    <div style={{
                      fontSize: '0.78rem',
                      background: 'rgba(0,0,0,0.25)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      color: '#a5b4fc',
                      marginBottom: '0.8rem',
                      borderLeft: '2px solid #8b5cf6'
                    }}>
                      📌 {idea.notes}
                    </div>
                  )}
                </div>

                {/* Footer de la tarjeta con acciones */}
                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#64748b'
                }}>
                  <div>
                    {idea.author && <span>👤 {idea.author}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(idea)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                      title="Editar Propuesta"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIdea(idea.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                      title="Eliminar Propuesta"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
