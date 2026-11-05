import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import {
  CLASSIC_ARCHETYPES,
  CHARACTER_DIMENSIONS,
  type CharacterArchetype
} from '../data/archetypesData';
import { compressImageWebP, blobToDataURL } from '../utils/imageUpload';
import './CreacionPersonajes.css';

// Preset avatars para estudiantes que no tengan una foto a mano
const PRESET_AVATARS = [
  {
    id: 'hunahpu',
    label: 'Hunahpú (Gemelo Sagrado)',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    archetypeId: 'heroe',
    title: 'Héroe Solar del Popol Vuh',
    name: 'Hunahpú',
    quote: '«El inframundo de Xibalbá no podrá devorar la luz de los hermanos.»',
    wound: 'La decapitación de su padre por los Señores del Miedo.',
    desire: 'Vencer en el juego de pelota y humillar a la muerte.',
    need: 'Aprender que la astucia y el sacrificio colectivo valen más que la fuerza bruta.',
    lie: '«Debo cargar solo el peso de vengar a mi linaje.»',
    contradiction: 'Es un semidiós todopoderoso, pero teme a los mosquitos espía.'
  },
  {
    id: 'guardiana',
    label: 'Ikal (Guardiana de la Selva)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    archetypeId: 'guardian',
    title: 'Vigía del Umbral Verde',
    name: 'Ikal Chan',
    quote: '«Nadie cruza las ceibas antiguas sin dejar atrás sus mentiras.»',
    wound: 'Dejó pasar a unos cazadores que talaron el árbol sagrado de su niñez.',
    desire: 'Aislar el bosque de cualquier intruso humano.',
    need: 'Descubrir que proteger requiere abrir puentes, no solo levantar murallas.',
    lie: '«Todo forastero trae consigo la ruina.»',
    contradiction: 'Tiene una coraza de jade impenetrable, pero colecciona orquídeas frágiles.'
  },
  {
    id: 'sabio',
    label: 'Najab (El Mentor Alquimista)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    archetypeId: 'mentor',
    title: 'Astrónomo de las Alturas',
    name: 'Najab del Ceibal',
    quote: '«Las estrellas no deciden tu camino, solo iluminan las piedras del suelo.»',
    wound: 'No pudo predecir el eclipse que causó la gran sequía de su juventud.',
    desire: 'Codificar todo el conocimiento del cosmos en un solo libro.',
    need: 'Confiar en la intuición de la nueva generación y dejar partir su rol rector.',
    lie: '«Si comprendo todas las leyes celestes, podré evitar el sufrimiento humano.»',
    contradiction: 'Es ciego de un ojo pero ve constelaciones invisibles para los demás.'
  },
  {
    id: 'picara',
    label: 'Ixchel (Pícara Cibernética)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    archetypeId: 'picaro',
    title: 'Hacker de Datos Ancestrales',
    name: 'Ixchel Maya-Net',
    quote: '«La gravedad es solo una sugerencia si conoces el código fuente.»',
    wound: 'Fue expulsada de la academia por alterar las calificaciones de sus compañeros humildes.',
    desire: 'Demostrar que ninguna bóveda digital es impenetrable.',
    need: 'Usar su ingenio para defender una causa colectiva en vez de solo alimentar su ego.',
    lie: '«El compromiso con los demás es una trampa que te vuelve predecible.»',
    contradiction: 'Broma constantemente cuando está aterrorizada.'
  }
];

export default function CreacionPersonajes() {
  const navigate = useNavigate();

  // Sub-tabs principales
  const [activeTab, setActiveTab] = useState<'arquetipos' | 'neurociencia' | 'dimensionador' | 'taller'>(() => {
    const saved = localStorage.getItem('cp_active_tab');
    return (saved === 'arquetipos' || saved === 'neurociencia' || saved === 'dimensionador' || saved === 'taller')
      ? saved
      : 'arquetipos';
  });

  // Modo Proyector Aula (Pizarra interactiva)
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  // Tab 1: Filtro de Arquetipos
  const [archetypeFilter, setArchetypeFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArchetype, setExpandedArchetype] = useState<string | null>('heroe');

  // Tab 3: Sliders del Dimensionador
  const [dimPhysiological, setDimPhysiological] = useState<number>(75);
  const [dimSociological, setDimSociological] = useState<number>(70);
  const [dimPsychological, setDimPsychological] = useState<number>(85);

  // Tab 4: Taller y Forja de Personaje
  const [charName, setCharName] = useState<string>('Hunahpú');
  const [charTitle, setCharTitle] = useState<string>('Héroe Solar del Popol Vuh');
  const [charArchetypeId, setCharArchetypeId] = useState<string>('heroe');
  const [charQuote, setCharQuote] = useState<string>('«El inframundo de Xibalbá no podrá devorar la luz de los hermanos.»');
  const [charWound, setCharWound] = useState<string>('La pérdida de sus ancestros en el juego de pelota oscuro.');
  const [charLie, setCharLie] = useState<string>('«Debo cargar solo el destino del mundo sin pedir auxilio.»');
  const [charDesire, setCharDesire] = useState<string>('Destruir a los Señores de Xibalbá con gloria personal.');
  const [charNeed, setCharNeed] = useState<string>('Aprender a cooperar con su hermano Ixbalanqué y sacrificarse por la humanidad.');
  const [charContradiction, setCharContradiction] = useState<string>('Es un semidiós valiente pero duda profundamente de su valor cuando no tiene armas.');
  const [charPhysical, setCharPhysical] = useState<string>('Cicatriz de obsidiana en el antebrazo derecho, mirada ámbar, complexión ágil.');
  const [charSocial, setCharSocial] = useState<string>('Linaje de cazadores con cerbatana, venerado por su aldea pero considerado una amenaza por los ancianos.');

  // Subida de Imagen y Filtros
  const [charImage, setCharImage] = useState<string>(PRESET_AVATARS[0].url);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'codice' | 'cyber' | 'pergamino' | 'acuarela'>('codice');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cardExportRef = useRef<HTMLDivElement | null>(null);

  // Guardar pestaña en localStorage
  useEffect(() => {
    localStorage.setItem('cp_active_tab', activeTab);
  }, [activeTab]);

  // Cargar borrador persistente si existe
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('cp_draft_character');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setCharName(parsed.name);
        if (parsed.title) setCharTitle(parsed.title);
        if (parsed.archetypeId) setCharArchetypeId(parsed.archetypeId);
        if (parsed.quote) setCharQuote(parsed.quote);
        if (parsed.wound) setCharWound(parsed.wound);
        if (parsed.lie) setCharLie(parsed.lie);
        if (parsed.desire) setCharDesire(parsed.desire);
        if (parsed.need) setCharNeed(parsed.need);
        if (parsed.contradiction) setCharContradiction(parsed.contradiction);
        if (parsed.image) setCharImage(parsed.image);
        if (parsed.filter) setActiveFilter(parsed.filter);
        if (parsed.physiological) setDimPhysiological(parsed.physiological);
        if (parsed.sociological) setDimSociological(parsed.sociological);
        if (parsed.psychological) setDimPsychological(parsed.psychological);
      }
    } catch (e) {
      console.warn('Could not restore character draft', e);
    }
  }, []);

  // Guardar borrador en localStorage cuando cambie
  useEffect(() => {
    const draft = {
      name: charName,
      title: charTitle,
      archetypeId: charArchetypeId,
      quote: charQuote,
      wound: charWound,
      lie: charLie,
      desire: charDesire,
      need: charNeed,
      contradiction: charContradiction,
      image: charImage,
      filter: activeFilter,
      physiological: dimPhysiological,
      sociological: dimSociological,
      psychological: dimPsychological
    };
    try {
      localStorage.setItem('cp_draft_character', JSON.stringify(draft));
    } catch (e) {
      // Ignorar quota exceeded si es un base64 muy grande
    }
  }, [
    charName, charTitle, charArchetypeId, charQuote, charWound, charLie,
    charDesire, charNeed, charContradiction, charImage, activeFilter,
    dimPhysiological, dimSociological, dimPsychological
  ]);

  // Arquetipo seleccionado en Taller
  const currentArchetype = useMemo(() => {
    return CLASSIC_ARCHETYPES.find(a => a.id === charArchetypeId) || CLASSIC_ARCHETYPES[0];
  }, [charArchetypeId]);

  // Filtrado de Arquetipos en la Galería
  const filteredArchetypes = useMemo(() => {
    return CLASSIC_ARCHETYPES.filter(arc => {
      const matchesSearch =
        arc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arc.roleSubtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arc.shadowWeakness.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arc.classicExample.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arc.mayanExample.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (archetypeFilter === 'todos') return true;
      if (archetypeFilter === 'luz') return ['heroe', 'mentor', 'aliado', 'inocente', 'soberano'].includes(arc.id);
      if (archetypeFilter === 'sombra') return ['sombra', 'guardian', 'camaleon', 'rebelde'].includes(arc.id);
      if (archetypeFilter === 'catalizador') return ['picaro', 'heraldo', 'amante'].includes(arc.id);
      return true;
    });
  }, [searchQuery, archetypeFilter]);

  // Cálculo de Tridimensionalidad y Telemetría Neurocognitiva
  const threeDimensionalScore = useMemo(() => {
    // Media ponderada: la dimensión psicológica tiene un peso crucial en el cerebro (40%), fisiológica (30%), sociológica (30%)
    const score = Math.round((dimPhysiological * 0.3) + (dimSociological * 0.3) + (dimPsychological * 0.4));
    return Math.min(100, Math.max(0, score));
  }, [dimPhysiological, dimSociological, dimPsychological]);

  // Diagnóstico Neurocognitivo
  const neuroDiagnostic = useMemo(() => {
    if (dimPsychological < 35) {
      return {
        level: 'Alerta: Personaje Plano (Cliché)',
        badgeColor: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.4)',
        summary: 'Cerebro desconectado por falta de conflicto interno y contradicción.',
        explanation: 'Sin una herida oculta ni una mentira nuclear, el sistema límbico del lector no genera empatía ToM (Teoría de la Mente). Se percibe como un estereotipo predecible.'
      };
    }
    if (dimPhysiological < 35) {
      return {
        level: 'Incorpóreo / Desanclado',
        badgeColor: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.4)',
        summary: 'Falta de anclaje físico y sensorial en las neuronas espejo motoras.',
        explanation: 'El lector no puede "sentir" el peso del personaje en el espacio físico. Añade cicatrices, postura, fatiga corporal o gestos específicos bajo estrés.'
      };
    }
    if (dimSociological < 35) {
      return {
        level: 'Desarraigado / Vacío Social',
        badgeColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        summary: 'El personaje existe en el vacío; carece de presión cultural o de grupo.',
        explanation: 'La cognición social humana evalúa el valor ético de los actos según las normas del clan. Define a quién le debe lealtad y qué grupo lo considera un traidor.'
      };
    }
    if (threeDimensionalScore >= 80) {
      return {
        level: '🌟 Tridimensionalidad Óptima (Alta Inmersión)',
        badgeColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        summary: 'Resonancia empática completa: ToM activa, oxitocina por vulnerabilidad y dopamina motora.',
        explanation: 'El personaje cuenta con un vehículo físico memorable, tensiones sociales complejas y un abismo interno conmovedor. El cerebro del lector lo adoptará como un ser vivo.'
      };
    }
    return {
      level: 'En Desarrollo Tridimensional',
      badgeColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      summary: 'Estructura sólida con buen potencial de resonancia narrativa.',
      explanation: 'Las tres dimensiones dialogan entre sí. Puedes aumentar la contradicción psicológica para potenciar el error de predicción.'
    };
  }, [threeDimensionalScore, dimPhysiological, dimSociological, dimPsychological]);

  // Manejo de Carga de Imagen Local
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    soundEffects.playClick();

    try {
      // Comprimir la imagen a WebP para que sea liviana y fluida
      const compressedBlob = await compressImageWebP(file, 800, 800, 0.85);
      const dataUrl = await blobToDataURL(compressedBlob);
      setCharImage(dataUrl);
      soundEffects.playSuccess();
    } catch (err: any) {
      console.error('Error al procesar la imagen:', err);
      setUploadError('No se pudo procesar la imagen. Intenta con un archivo JPG o PNG de menor peso.');
      soundEffects.playError();
    } finally {
      setIsUploading(false);
    }
  };

  // Manejador Drag and Drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    soundEffects.playClick();

    try {
      const compressedBlob = await compressImageWebP(file, 800, 800, 0.85);
      const dataUrl = await blobToDataURL(compressedBlob);
      setCharImage(dataUrl);
      soundEffects.playSuccess();
    } catch (err: any) {
      console.error('Error al procesar la imagen arrastrada:', err);
      setUploadError('Formato no soportado o archivo dañado.');
      soundEffects.playError();
    } finally {
      setIsUploading(false);
    }
  };

  // Aplicar Preset de Ejemplo
  const handleApplyPreset = (preset: typeof PRESET_AVATARS[0]) => {
    soundEffects.playClick();
    setCharName(preset.name);
    setCharTitle(preset.title);
    setCharArchetypeId(preset.archetypeId);
    setCharQuote(preset.quote);
    setCharWound(preset.wound);
    setCharLie(preset.lie);
    setCharDesire(preset.desire);
    setCharNeed(preset.need);
    setCharContradiction(preset.contradiction);
    setCharImage(preset.url);
    setActiveFilter('codice');
    setDimPhysiological(85);
    setDimSociological(80);
    setDimPsychological(90);
  };

  // Enviar arquetipo desde la galería directamente a la forja
  const handleForgeWithArchetype = (arc: CharacterArchetype) => {
    soundEffects.playClick();
    setCharArchetypeId(arc.id);
    setCharTitle(arc.roleSubtitle);
    setCharQuote(arc.quote);
    setCharLie(arc.writingTip);
    setCharDesire(arc.coreDesire);
    setCharNeed(`Superar su sombra: ${arc.shadowWeakness}`);
    setActiveTab('taller');
  };

  // Exportar Ficha a Imagen PNG con html2canvas dinámico
  const handleExportPNG = async () => {
    if (!cardExportRef.current) return;
    setIsExporting(true);
    soundEffects.playClick();

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardExportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#020617'
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Cromo-Personaje-${charName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Error al exportar cromo:', err);
      soundEffects.playError();
    } finally {
      setIsExporting(false);
    }
  };

  // Copiar Ficha Pedagógica en formato Markdown/Texto
  const handleCopySheet = () => {
    soundEffects.playClick();
    const sheetText = `
══════════════════════════════════════════════════════════
🎭 FICHA TÉCNICA DEL PERSONAJE · SUITE CREATIKA
══════════════════════════════════════════════════════════
NOMBRE: ${charName}
TÍTULO / EPÍTETO: ${charTitle}
ARQUETIPO CANÓNICO: ${currentArchetype.name} (${currentArchetype.roleSubtitle})
LEMA / CITA: "${charQuote}"

🧬 1. DIMENSIÓN FISIOLÓGICA (${dimPhysiological}%):
- Rasgos Visibles / Anclaje Somático: ${charPhysical || 'No especificado'}

🌍 2. DIMENSIÓN SOCIOLÓGICA (${dimSociological}%):
- Ecosistema, Cultura y Lealtades: ${charSocial || 'No especificado'}

🧠 3. DIMENSIÓN PSICOLÓGICA (${dimPsychological}%):
- Herida del Pasado (The Ghost): ${charWound}
- La Mentira Nuclear: ${charLie}
- Deseo Consciente (Superficial): ${charDesire}
- Necesidad Inconsciente (Espiritual): ${charNeed}
- Contradicción Neurocreativa (Error de Predicción): ${charContradiction}

⚡ ÍNDICE DE TRIDIMENSIONALIDAD: ${threeDimensionalScore}%
- Diagnóstico Neurocognitivo: ${neuroDiagnostic.level}
- Mecanismo Cerebral: ${currentArchetype.neuroTrigger}

Generado en el Laboratorio de Creación de Personajes · Editorial Lluvia de Ideas
══════════════════════════════════════════════════════════
    `.trim();

    navigator.clipboard.writeText(sheetText).then(() => {
      setCopySuccess(true);
      soundEffects.playSuccess();
      setTimeout(() => setCopySuccess(false), 2600);
    }).catch(() => {
      soundEffects.playError();
    });
  };

  // Alternar modo proyector de aula
  const toggleProjectorMode = () => {
    soundEffects.playClick();
    setIsProjectorMode(prev => !prev);
  };

  return (
    <div className={`cp-container ${isProjectorMode ? 'projector-mode' : ''} animate-fade-in`}>
      <LandingTopBar
        slogan="Suite Creatika · Laboratorio Neurocreativo y Diseño de Arquetipos"
        showHomeButton
      />

      <main className="cp-main-content">
        {/* Cabecera Heroica */}
        <header className="cp-hero-header">
          <div className="cp-badge-top">
            <span>✨ SUITE CREATIKA</span> · NARRATIVA, PSICOLOGÍA & NEURODISEÑO
          </div>
          <h1 className="cp-hero-title">
            Forja de <span>Personajes Tridimensionales</span>
          </h1>
          <p className="cp-hero-subtitle">
            Combina los 12 arquetipos clásicos universales con las 3 dimensiones del drama (Lajos Egri)
            y la neurociencia de la empatía. Crea personajes que no solo se lean, sino que cobren vida en la mente del lector.
          </p>
        </header>

        {/* Barra de Navegación Modular */}
        <nav className="cp-nav-bar" aria-label="Navegación de módulos de personajes">
          <button
            className={`cp-nav-btn ${activeTab === 'arquetipos' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('arquetipos');
            }}
          >
            <span>🎭</span> 1. Arquetipos Clásicos
          </button>
          <button
            className={`cp-nav-btn ${activeTab === 'neurociencia' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('neurociencia');
            }}
          >
            <span>🧠</span> 2. Neurociencia del Carácter
          </button>
          <button
            className={`cp-nav-btn ${activeTab === 'dimensionador' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('dimensionador');
            }}
          >
            <span>🧬</span> 3. Simulador 3D de Dimensiones
          </button>
          <button
            className={`cp-nav-btn ${activeTab === 'taller' ? 'active' : ''}`}
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('taller');
            }}
          >
            <span>🎨</span> 4. Taller & Forja con Imagen
          </button>
          <button
            className={`cp-nav-btn cp-projector-toggle ${isProjectorMode ? 'active' : ''}`}
            onClick={toggleProjectorMode}
            title="Activa el modo de alto contraste para pizarras electrónicas o proyectores escolares"
          >
            <span>{isProjectorMode ? '🖥️' : '📺'}</span>
            {isProjectorMode ? 'Salir de Proyector' : 'Modo Pizarra Aula'}
          </button>
        </nav>

        {/* =========================================================================
            SECCIÓN 1: GALERÍA DE ARQUETIPOS CLÁSICOS
           ========================================================================= */}
        {activeTab === 'arquetipos' && (
          <div className="animate-fade-in">
            {/* Barra de Controles y Búsqueda */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por arquetipo, deseo, sombra o ejemplo mítico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    padding: '8px 14px',
                    width: '100%',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'todos', label: 'Todos (12)' },
                  { id: 'luz', label: '☀️ Motores de Orden' },
                  { id: 'sombra', label: '🌑 Antagónicos & Sombras' },
                  { id: 'catalizador', label: '⚡ Catalizadores & Caos' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setArchetypeFilter(cat.id);
                    }}
                    style={{
                      background: archetypeFilter === cat.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                      color: archetypeFilter === cat.id ? '#020617' : '#cbd5e1',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuadrícula de Arquetipos */}
            <div className="cp-archetypes-grid">
              {filteredArchetypes.map((arc) => {
                const isExpanded = expandedArchetype === arc.id;
                return (
                  <div
                    key={arc.id}
                    className="cp-archetype-card"
                    style={{ borderColor: isExpanded ? arc.color : undefined }}
                  >
                    <div className="cp-archetype-header">
                      <div className="cp-archetype-icon-box" style={{ borderColor: `${arc.color}66` }}>
                        {arc.icon}
                      </div>
                      <div className="cp-archetype-titles">
                        <h3>{arc.name}</h3>
                        <p>{arc.roleSubtitle}</p>
                      </div>
                    </div>

                    <div className="cp-quote-box" style={{ borderLeftColor: arc.color }}>
                      {arc.quote}
                    </div>

                    <div className="cp-neuro-badge-row">
                      <span className="cp-badge-pill" style={{ background: `${arc.color}22`, color: arc.color, border: `1px solid ${arc.color}66` }}>
                        🧠 {arc.neuroBadge}
                      </span>
                    </div>

                    <div className="cp-detail-block">
                      <strong style={{ color: '#38bdf8' }}>🎯 Deseo Central:</strong>
                      {arc.coreDesire}
                    </div>

                    <div className="cp-detail-block" style={{ borderLeft: '3px solid #f43f5e' }}>
                      <strong style={{ color: '#f43f5e' }}>🌑 La Sombra / Debilidad Trágica:</strong>
                      {arc.shadowWeakness}
                    </div>

                    <div className="cp-examples-row">
                      <div className="cp-example-box">
                        <span>Clásico / Pop</span>
                        <p>{arc.classicExample}</p>
                      </div>
                      <div className="cp-example-box" style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}>
                        <span style={{ color: '#fbbf24' }}>🌿 Raíz Maya (Popol Vuh)</span>
                        <p>{arc.mayanExample}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                        <div className="cp-detail-block" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                          <strong style={{ color: '#c084fc' }}>⚡ Disparador Neuroquímico:</strong>
                          {arc.neuroTrigger} — {arc.neuroExplanation}
                        </div>

                        <div className="cp-detail-block" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                          <strong style={{ color: '#fbbf24' }}>🔥 La Prueba de Fuego (Crisol):</strong>
                          {arc.crucibleTrial}
                        </div>

                        <div className="cp-detail-block">
                          <strong style={{ color: '#38bdf8' }}>💡 Consejo para el Escriba / Alumno:</strong>
                          {arc.writingTip}
                        </div>

                        <div style={{ marginTop: '4px' }}>
                          <strong style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            ✨ Chispas Dramáticas con otros Arquetipos:
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {arc.relations.map((rel, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  lineHeight: 1.4
                                }}
                              >
                                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{rel.targetArchetype}</span> ({rel.relationRole}): {rel.sparkDescription}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setExpandedArchetype(isExpanded ? null : arc.id);
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#f8fafc',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? '▲ Menos Detalle' : '▼ Ver Neurociencia & Chispas'}
                      </button>

                      <button
                        onClick={() => handleForgeWithArchetype(arc)}
                        style={{
                          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                          color: '#020617',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Usar este arquetipo como base en el Taller de Forja"
                      >
                        <span>🎨</span> Forjar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 2: NEUROCIENCIA DE LA CARACTERIZACIÓN
           ========================================================================= */}
        {activeTab === 'neurociencia' && (
          <div className="cp-neuro-section animate-fade-in">
            {/* Introducción Teórica */}
            <div className="cp-neuro-intro-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.4rem' }}>🧠</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc' }}>
                    ¿Por qué el Cerebro Rechaza a los Personajes Invencibles?
                  </h2>
                  <p style={{ margin: '4px 0 0 0', color: '#c084fc', fontSize: '0.92rem', fontWeight: 700 }}>
                    La ciencia cognitiva detrás de la empatía, la vulnerabilidad y la arquitectura del apego
                  </p>
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                El cerebro humano evolucionó durante millones de años como un simulador de supervivencia biológica.
                Cuando leemos una historia, no buscamos meramente entretenimiento pasivo: nuestro sistema cognitivo
                activa la <strong>Red Neuronal por Defecto (DMN)</strong> y las redes de <strong>Teoría de la Mente (ToM)</strong>
                para ensayar cómo actuaríamos nosotros ante crisis morales extremas. Si un personaje es moralmente perfecto o físicamente invencible,
                el cerebro desconecta la atención: no hay nada que aprender ni ninguna amenaza real que calcular.
              </p>
            </div>

            {/* 4 Pilares Neurocientíficos */}
            <div className="cp-neuro-grid-cards">
              <div className="cp-neuro-concept-card" style={{ borderTop: '4px solid #38bdf8' }}>
                <div className="cp-concept-icon">🔮</div>
                <h3 className="cp-concept-title">1. Teoría de la Mente (ToM)</h3>
                <p className="cp-concept-desc">
                  Ubicada en la unión temporoparietal y el córtex prefrontal medial. Nos permite inferir qué piensa el personaje, qué cree saber
                  y, sobre todo, <strong>en qué mentira está atrapado</strong>. El conflicto surge cuando el lector sabe la verdad pero el personaje sigue ciego a su defecto.
                </p>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#7dd3fc' }}>
                  <strong>⚡ Aplicación en Aula:</strong> Pide a los alumnos que formulen la "Mentira Nuclear" que su héroe cree firmemente en la página 1.
                </div>
              </div>

              <div className="cp-neuro-concept-card" style={{ borderTop: '4px solid #f43f5e' }}>
                <div className="cp-concept-icon">💓</div>
                <h3 className="cp-concept-title">2. Oxitocina por Vulnerabilidad</h3>
                <p className="cp-concept-desc">
                  Paul Zak y su equipo demostraron que la empatía y la compasión hacia un personaje ficticio dependen de la liberación de oxitocina.
                  La oxitocina <strong>no se secreta ante los superpoderes o la perfección</strong>, sino ante el dolor compartido, el duelo, la soledad y la herida no sanada.
                </p>
                <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fda4af' }}>
                  <strong>⚡ Regla de Oro:</strong> Haz que tu personaje sufra una pérdida injusta al inicio; el cerebro del lector lo protegerá de inmediato.
                </div>
              </div>

              <div className="cp-neuro-concept-card" style={{ borderTop: '4px solid #fbbf24' }}>
                <div className="cp-concept-icon">⚡</div>
                <h3 className="cp-concept-title">3. Error de Predicción (Dopamina)</h3>
                <p className="cp-concept-desc">
                  El cerebro es una máquina de predicción bayesiana. Cuando un personaje hace exactamente lo que dicta su cliché, el nivel de dopamina cae a cero.
                  Pero cuando un rudo mercenario cuida con ternura a un colibrí herido, se genera un <strong>Error de Predicción</strong>: la atención se dispara al 100%.
                </p>
                <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fde68a' }}>
                  <strong>⚡ Técnica Práctica:</strong> Añade siempre una "Contradicción Neurocreativa": un hábito que desentone por completo con su arquetipo.
                </div>
              </div>

              <div className="cp-neuro-concept-card" style={{ borderTop: '4px solid #10b981' }}>
                <div className="cp-concept-icon">🧬</div>
                <h3 className="cp-concept-title">4. Neuronas Espejo & Anclaje</h3>
                <p className="cp-concept-desc">
                  La corteza premotora e insular se disparan cuando el personaje experimenta sensaciones físicas concretas: el ardor de una herida, el nudo en la garganta
                  o el chasquido de una rama en la oscuridad. Las descripciones abstractas no activan el cuerpo sensorial del lector.
                </p>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#6ee7b7' }}>
                  <strong>⚡ Ejercicio Escolar:</strong> Define una cicatriz o talismán físico que el personaje toque involuntariamente al mentir o dudar.
                </div>
              </div>
            </div>

            {/* Las 3 Dimensiones del Drama */}
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                📐 Las 3 Dimensiones Canónicas de Lajos Egri (El Arte de la Escritura Dramática)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {CHARACTER_DIMENSIONS.map((dim) => (
                  <div
                    key={dim.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: `1.5px solid ${dim.color}44`,
                      borderRadius: '16px',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{dim.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', color: dim.color, fontWeight: 800 }}>{dim.name}</h4>
                    </div>
                    <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 700 }}>
                      {dim.headline}
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.55 }}>
                      {dim.description}
                    </p>
                    <div style={{ marginTop: 'auto', background: 'rgba(2, 6, 23, 0.6)', padding: '12px', borderRadius: '10px' }}>
                      <strong style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Preguntas Guía para el Aula:
                      </strong>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {dim.questions.map((q, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: dim.color, fontStyle: 'italic', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
                      🔬 {dim.scientificMechanism}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 3: EL DIMENSIONADOR TRIDIMENSIONAL (SIMULADOR)
           ========================================================================= */}
        {activeTab === 'dimensionador' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="cp-dimensioner-panel">
              {/* Columna de Sliders */}
              <div className="cp-sliders-column">
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
                    🎛️ Modulador Tridimensional de Resonancia
                  </h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Ajusta el peso de cada dimensión para observar en tiempo real cómo cambia la inmersión del cerebro lector.
                  </p>
                </div>

                {/* Slider Fisiológica */}
                <div className="cp-slider-group">
                  <div className="cp-slider-header">
                    <span className="cp-slider-title">
                      <span>🧬</span> 1. Dimensión Fisiológica (Cuerpo y Sentidos)
                    </span>
                    <span className="cp-slider-val" style={{ color: '#38bdf8' }}>{dimPhysiological}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimPhysiological}
                    onChange={(e) => setDimPhysiological(Number(e.target.value))}
                    className="cp-slider-input"
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Cicatrices, postura corporal, fatiga física, vestimenta y anclaje sensorial inmediato.
                  </span>
                </div>

                {/* Slider Sociológica */}
                <div className="cp-slider-group">
                  <div className="cp-slider-header">
                    <span className="cp-slider-title">
                      <span>🌍</span> 2. Dimensión Sociológica (Clan y Entorno)
                    </span>
                    <span className="cp-slider-val" style={{ color: '#fbbf24' }}>{dimSociological}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimSociological}
                    onChange={(e) => setDimSociological(Number(e.target.value))}
                    className="cp-slider-input"
                    style={{ accentColor: '#fbbf24' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Presión del grupo social, lealtades divididas, prejuicios de época y lenguaje cultural.
                  </span>
                </div>

                {/* Slider Psicológica */}
                <div className="cp-slider-group">
                  <div className="cp-slider-header">
                    <span className="cp-slider-title">
                      <span>🧠</span> 3. Dimensión Psicológica (Herida y Mentira)
                    </span>
                    <span className="cp-slider-val" style={{ color: '#f43f5e' }}>{dimPsychological}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dimPsychological}
                    onChange={(e) => setDimPsychological(Number(e.target.value))}
                    className="cp-slider-input"
                    style={{ accentColor: '#f43f5e' }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Mentira nuclear, trauma del pasado (*Ghost*), deseo consciente vs necesidad espiritual oculta.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setDimPhysiological(85);
                      setDimSociological(80);
                      setDimPsychological(90);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Cargar Configuración Óptima
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setDimPhysiological(20);
                      setDimSociological(30);
                      setDimPsychological(25);
                    }}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fda4af',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚠️ Probar Personaje Plano
                  </button>
                </div>
              </div>

              {/* Columna de Telemetría Cerebral */}
              <div className="cp-radar-telemetry-box">
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    TELEMETRÍA NEUROCOGNITIVA
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: neuroDiagnostic.badgeColor }}>
                    {threeDimensionalScore}%
                  </span>
                </div>

                {/* Visualizador Holográfico de Resonancia */}
                <div className="cp-brain-visualizer">
                  <div
                    className="cp-brain-glow"
                    style={{
                      background: neuroDiagnostic.glowColor,
                      transform: `scale(${0.7 + (threeDimensionalScore / 250)})`
                    }}
                  />
                  <svg viewBox="0 0 200 160" width="160" height="130" style={{ position: 'relative', zIndex: 2 }}>
                    <path
                      d="M60 40 C40 40, 20 60, 20 90 C20 120, 50 140, 90 140 C110 140, 140 140, 160 120 C180 100, 180 60, 150 40 C130 25, 90 25, 60 40 Z"
                      fill="none"
                      stroke={neuroDiagnostic.badgeColor}
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                    />
                    <circle cx="70" cy="70" r="14" fill="#38bdf8" opacity={dimPhysiological / 120} />
                    <text x="70" y="74" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">F</text>

                    <circle cx="130" cy="70" r="14" fill="#fbbf24" opacity={dimSociological / 120} />
                    <text x="130" y="74" fill="#020617" fontSize="10" fontWeight="bold" textAnchor="middle">S</text>

                    <circle cx="100" cy="105" r="16" fill="#f43f5e" opacity={dimPsychological / 120} />
                    <text x="100" y="109" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">P</text>

                    {/* Vínculos de sinapsis */}
                    <line x1="70" y1="70" x2="130" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <line x1="70" y1="70" x2="100" y2="105" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                    <line x1="130" y1="70" x2="100" y2="105" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  </svg>
                </div>

                <div
                  className="cp-resonance-badge"
                  style={{
                    background: `${neuroDiagnostic.badgeColor}22`,
                    color: neuroDiagnostic.badgeColor,
                    border: `1.5px solid ${neuroDiagnostic.badgeColor}`
                  }}
                >
                  {neuroDiagnostic.level}
                </div>

                <p style={{ margin: 0, fontSize: '0.86rem', color: '#f8fafc', fontWeight: 700, lineHeight: 1.4 }}>
                  {neuroDiagnostic.summary}
                </p>

                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {neuroDiagnostic.explanation}
                </p>
              </div>
            </div>

            {/* Llamado a la acción: Llevar los valores al Taller */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 800 }}>
                  ¿Listo para forjar tu personaje con estas dimensiones calibradas?
                </h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.86rem' }}>
                  Pasa al taller para subir una ilustración, aplicar filtros artísticos y generar la ficha coleccionable imprimible.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTab('taller');
                }}
                className="cp-btn-export cp-btn-primary"
                style={{ maxWidth: '220px' }}
              >
                <span>🎨</span> Abrir Forja de Personaje
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 4: TALLER & FORJA DEL PERSONAJE (CON SUBIDA DE IMAGEN)
           ========================================================================= */}
        {activeTab === 'taller' && (
          <div className="animate-fade-in cp-forge-layout">
            {/* Panel de Formulario / Configuración */}
            <div className="cp-form-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc' }}>
                  🛠️ Forja Creativa del Personaje
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>
                  AUTOGUARDADO ACTIVO
                </span>
              </div>

              {/* Presets Rápidos para Estudiantes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ⚡ Cargar Inspiración de Ejemplo (Aula / Taller):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        background: charName === preset.name ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: charName === preset.name ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: '#f8fafc',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subida y Personalización de Imagen */}
              <div className="cp-form-group">
                <label>🖼️ Ilustración / Imagen del Personaje (Sube la tuya)</label>
                
                <div
                  className="cp-upload-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {isUploading ? (
                    <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                      <span>⏳</span> Optimizando imagen y comprimiendo a WebP...
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📤</div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                        Haz clic para subir una foto o arrastra tu archivo aquí
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        PNG, JPG o WebP · Se redimensiona y optimiza automáticamente en el navegador
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p style={{ margin: '6px 0 0 0', color: '#f43f5e', fontSize: '0.8rem', fontWeight: 700 }}>
                    ⚠️ {uploadError}
                  </p>
                )}

                {/* Filtros Artísticos */}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                    🎨 Filtros de Estilo Visual (Cromático & Histórico):
                  </span>
                  <div className="cp-filter-chips-row">
                    {[
                      { id: 'normal', label: 'Sin Filtro (Natural)' },
                      { id: 'codice', label: '🏺 Códice Maya' },
                      { id: 'cyber', label: '⚡ Cyber Neón' },
                      { id: 'pergamino', label: '📜 Pergamino Ancestral' },
                      { id: 'acuarela', label: '🎨 Acuarela Onírica' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        className={`cp-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                        onClick={() => {
                          soundEffects.playClick();
                          setActiveFilter(f.id as any);
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Datos Identitarios */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="cp-form-group">
                  <label>Nombre del Personaje</label>
                  <input
                    type="text"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder="Ej. Hunahpú, Nayeli, Dr. Zeno"
                  />
                </div>

                <div className="cp-form-group">
                  <label>Epíteto / Título</label>
                  <input
                    type="text"
                    value={charTitle}
                    onChange={(e) => setCharTitle(e.target.value)}
                    placeholder="Ej. El Cazador de Sombras"
                  />
                </div>
              </div>

              {/* Selector de Arquetipo Canónico */}
              <div className="cp-form-group">
                <label>Arquetipo Canónico Junguiano</label>
                <select
                  value={charArchetypeId}
                  onChange={(e) => {
                    soundEffects.playClick();
                    setCharArchetypeId(e.target.value);
                  }}
                >
                  {CLASSIC_ARCHETYPES.map((arc) => (
                    <option key={arc.id} value={arc.id}>
                      {arc.icon} {arc.name} — {arc.roleSubtitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cita o Lema */}
              <div className="cp-form-group">
                <label>Lema o Frase Característica</label>
                <input
                  type="text"
                  value={charQuote}
                  onChange={(e) => setCharQuote(e.target.value)}
                  placeholder="Una frase que condense su visión o dilema vital..."
                />
              </div>

              {/* DIMENSIÓN PSICOLÓGICA PROFUNDA */}
              <div style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(244, 63, 94, 0.25)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🧠</span>
                  <strong style={{ color: '#fda4af', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    Eje Psicológico (La Máquina de la Empatía)
                  </strong>
                </div>

                <div className="cp-form-group">
                  <label>Mentira Nuclear (Lo que cree erróneamente sobre sí mismo)</label>
                  <input
                    type="text"
                    value={charLie}
                    onChange={(e) => setCharLie(e.target.value)}
                    placeholder="Ej. «No merezco ser amado si demuestro debilidad»"
                  />
                </div>

                <div className="cp-form-group">
                  <label>Herida del Pasado (*The Ghost* / Trauma Fundacional)</label>
                  <input
                    type="text"
                    value={charWound}
                    onChange={(e) => setCharWound(e.target.value)}
                    placeholder="El evento no resuelto que originó su miedo más profundo..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="cp-form-group">
                    <label>Deseo Consciente (Superficial)</label>
                    <textarea
                      rows={2}
                      value={charDesire}
                      onChange={(e) => setCharDesire(e.target.value)}
                      placeholder="Lo que cree querer (riqueza, venganza, trofeo)..."
                    />
                  </div>
                  <div className="cp-form-group">
                    <label>Necesidad Inconsciente (Espiritual)</label>
                    <textarea
                      rows={2}
                      value={charNeed}
                      onChange={(e) => setCharNeed(e.target.value)}
                      placeholder="Lo que realmente necesita para transformarse..."
                    />
                  </div>
                </div>

                <div className="cp-form-group">
                  <label>Contradicción Neurocreativa (Error de Predicción)</label>
                  <input
                    type="text"
                    value={charContradiction}
                    onChange={(e) => setCharContradiction(e.target.value)}
                    placeholder="El rasgo inesperado que rompe el estereotipo y sorprende al cerebro..."
                  />
                </div>
              </div>

              {/* DIMENSIÓN FISIOLÓGICA Y SOCIOLÓGICA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="cp-form-group">
                  <label>🧬 Anclaje Fisiológico (Cuerpo/Gestos)</label>
                  <textarea
                    rows={2}
                    value={charPhysical}
                    onChange={(e) => setCharPhysical(e.target.value)}
                    placeholder="Cicatrices, mirada, talismán físico, postura al dudar..."
                  />
                </div>

                <div className="cp-form-group">
                  <label>🌍 Entorno Sociológico (Clan/Reglas)</label>
                  <textarea
                    rows={2}
                    value={charSocial}
                    onChange={(e) => setCharSocial(e.target.value)}
                    placeholder="Comunidad de origen, reglas tácitas de su grupo, lealtades..."
                  />
                </div>
              </div>
            </div>

            {/* Vista Previa: Tarjeta Coleccionable Exportable */}
            <div className="cp-card-preview-container">
              <div style={{ width: '100%', maxWidth: '380px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🎴 Cromo de Personaje (Vista Previa)
                </span>
                <span style={{ fontSize: '0.78rem', color: currentArchetype.color, fontWeight: 800 }}>
                  {currentArchetype.icon} {currentArchetype.name.split('/')[0]}
                </span>
              </div>

              {/* El Cromo / Card */}
              <div
                ref={cardExportRef}
                className="cp-collectible-card"
                style={{ borderColor: currentArchetype.color }}
              >
                {/* Marco de Imagen con Filtro */}
                <div className="cp-card-art-holder">
                  <img
                    src={charImage}
                    alt={charName}
                    className={`cp-card-art-img filter-${activeFilter}`}
                    crossOrigin="anonymous"
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(2, 6, 23, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: currentArchetype.color,
                    border: `1px solid ${currentArchetype.color}66`
                  }}>
                    {currentArchetype.neuroBadge}
                  </div>
                </div>

                {/* Títulos y Cita */}
                <div>
                  <h4 className="cp-card-name-title">{charName || 'Sin Nombre'}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
                    {charTitle || 'Arquetipo Creatika'}
                  </span>
                </div>

                <div className="cp-quote-box" style={{ borderLeftColor: currentArchetype.color, margin: 0, padding: '8px 10px', fontSize: '0.8rem' }}>
                  {charQuote || '«...»'}
                </div>

                {/* Cuadrícula de Estadísticas */}
                <div className="cp-card-stats-grid">
                  <div className="cp-card-stat">
                    <span>Fisiológica</span>
                    <strong style={{ color: '#38bdf8' }}>{dimPhysiological}%</strong>
                  </div>
                  <div className="cp-card-stat">
                    <span>Sociológica</span>
                    <strong style={{ color: '#fbbf24' }}>{dimSociological}%</strong>
                  </div>
                  <div className="cp-card-stat">
                    <span>Psicológica</span>
                    <strong style={{ color: '#f43f5e' }}>{dimPsychological}%</strong>
                  </div>
                  <div className="cp-card-stat">
                    <span>Inmersión ToM</span>
                    <strong style={{ color: '#10b981' }}>{threeDimensionalScore}%</strong>
                  </div>
                </div>

                {/* Síntesis Dramática */}
                <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '10px', borderRadius: '8px', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ color: '#f43f5e', fontWeight: 800 }}>MENTIRA: </span>
                    <span style={{ color: '#cbd5e1' }}>{charLie || 'No definida'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#38bdf8', fontWeight: 800 }}>CONTRADICCIÓN: </span>
                    <span style={{ color: '#cbd5e1' }}>{charContradiction || 'No definida'}</span>
                  </div>
                </div>

                {/* Pie de Marca de Agua Editorial */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                  <span>EDITORIAL LLUVIA DE IDEAS</span>
                  <span>SUITE CREATIKA 2026</span>
                </div>
              </div>

              {/* Botones de Exportación */}
              <div className="cp-export-actions">
                <button
                  onClick={handleExportPNG}
                  disabled={isExporting}
                  className="cp-btn-export cp-btn-primary"
                >
                  <span>{isExporting ? '⏳' : '📸'}</span>
                  {isExporting ? 'Generando Cromo...' : 'Descargar Cromo PNG'}
                </button>

                <button
                  onClick={handleCopySheet}
                  className="cp-btn-export cp-btn-glass"
                >
                  <span>{copySuccess ? '✅' : '📋'}</span>
                  {copySuccess ? '¡Ficha Copiada!' : 'Copiar Ficha'}
                </button>
              </div>

              {/* Botón de Limpieza */}
              <button
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas reiniciar el taller con los valores por defecto?')) {
                    soundEffects.playClick();
                    handleApplyPreset(PRESET_AVATARS[0]);
                  }
                }}
                style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Restablecer formulario a valores iniciales
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
