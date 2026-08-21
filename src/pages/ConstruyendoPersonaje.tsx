import React, { useState, useEffect, useRef } from 'react';
import LandingTopBar from '../components/landing/LandingTopBar';
import { usePortalConfig } from '../context/PortalConfigContext';
import { useAuth } from '../context/AuthContext';
import { compressImageWebP } from '../utils/imageUpload';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import './ConstruyendoPersonaje.css';

interface ArchetypeData {
  id: string;
  name: string;
  roleSubtitle: string;
  icon: string;
  quote: string;
  functionDesc: string;
  shadowWeakness: string;
  classicExample: string;
  modernExample: string;
  writingTip: string;
  color: string;
}

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'protagonista',
    name: 'El Héroe / Protagonista',
    roleSubtitle: 'El motor del cambio y portador del arco dramático',
    icon: '🦸',
    quote: '«No soy lo que me pasó, soy lo que elijo ser.»',
    functionDesc: 'Es el centro de gravedad moral y emocional del relato. Debe tomar decisiones difíciles que revelen quién es realmente bajo presión extrema.',
    shadowWeakness: 'Arrogancia, ceguera ante su propia herida o insistencia en perseguir su deseo superficial en vez de su necesidad espiritual.',
    classicExample: 'Odiseo (La Odisea), Hunahpú e Ixbalanqué (Popol Vuh)',
    modernExample: 'Katniss Everdeen (Los Juegos del Hambre), Miles Morales (Spider-Verse)',
    writingTip: 'Dale una creencia falsa sobre sí mismo o el mundo en el acto 1; su victoria dependerá de desmantelar esa mentira.',
    color: '#38bdf8'
  },
  {
    id: 'mentor',
    name: 'El Mentor',
    roleSubtitle: 'El guía, guardián de la sabiduría y catalizador moral',
    icon: '🧙‍♂️',
    quote: '«El conocimiento sin coraje es un mapa sin caminante.»',
    functionDesc: 'Proporciona entrenamiento, artefactos mágicos o perspectivas que el héroe aún no puede ver por sí mismo. Suele desaparecer antes del clímax para obligar al héroe a volar solo.',
    shadowWeakness: 'Dogmatismo, secretos oscuros del pasado o sobreprotección que asfixia el crecimiento.',
    classicExample: 'Quirón (Mitología Griega), Ixmukané (Popol Vuh)',
    modernExample: 'Gandalf (El Señor de los Anillos), Haymitch Abernathy (Los Juegos del Hambre)',
    writingTip: 'Haz que el mentor haya fracasado en el pasado en lo mismo que el héroe intenta lograr; eso le da vulnerabilidad y verdad.',
    color: '#a855f7'
  },
  {
    id: 'sombra',
    name: 'La Sombra / El Antagonista',
    roleSubtitle: 'El espejo oscuro y la fuerza opuesta ineludible',
    icon: '🌑',
    quote: '«Tú y yo no somos tan distintos; solo que yo acepté la verdad primero.»',
    functionDesc: 'Encarna el mayor miedo del héroe o una versión distorsionada de su mismo deseo. No se considera el malo: en su mente, su causa es justa y necesaria.',
    shadowWeakness: 'Incapacidad de perdonar, obsesión de control absoluto o vacío existencial que busca llenar con poder.',
    classicExample: 'Señores de Xibalbá (Popol Vuh), Sauron (Tolkien)',
    modernExample: 'Killmonger (Black Panther), Darth Vader (Star Wars)',
    writingTip: 'El mejor antagonista tiene metas tan comprensibles que el lector casi duda de si tiene razón.',
    color: '#f43f5e'
  },
  {
    id: 'aliado',
    name: 'El Aliado y el Escudero',
    roleSubtitle: 'El ancla emocional, la lealtad y el contrapunto humano',
    icon: '🛡️',
    quote: '«Tal vez no pueda llevar la carga por ti, pero puedo caminar a tu lado.»',
    functionDesc: 'Cuestiona las decisiones del protagonista cuando este pierde el rumbo, aporta habilidades complementarias y ofrece alivio cómico o profundidad emocional.',
    shadowWeakness: 'Dependencia del líder, celos silenciosos o vulnerabilidad física frente a los enemigos.',
    classicExample: 'Sancho Panza (Don Quijote), Enkidu (Epopeya de Gilgamesh)',
    modernExample: 'Samwise Gamgee (El Señor de los Anillos), Hermione Granger (Harry Potter)',
    writingTip: 'No lo conviertas en un simple adulador; haz que tenga sus propios sueños y desacuerdos éticos con el protagonista.',
    color: '#22c55e'
  },
  {
    id: 'heraldo',
    name: 'El Heraldo',
    roleSubtitle: 'La llamada al cambio que destruye el statu quo',
    icon: '⚡',
    quote: '«El mundo que conocías ha terminado. La tormenta ha comenzado.»',
    functionDesc: 'Trae la noticia, el desafío o la catástrofe que rompe la rutina del mundo ordinario y obliga al héroe a tomar una postura.',
    shadowWeakness: 'Mensajero imparcial que puede ser portador de dolor o causar pánico involuntario.',
    classicExample: 'El oráculo de Delfos, Hermes (Mensajero de los Dioses)',
    modernExample: 'Hagrid con la carta de Hogwarts, Morfeo ofreciendo la pastilla en Matrix',
    writingTip: 'El heraldo no siempre es una persona; puede ser un evento, un eclipse, una carta sellada o un rayo inesperado.',
    color: '#eab308'
  },
  {
    id: 'embaucador',
    name: 'El Camaleón / Embaucador (Trickster)',
    roleSubtitle: 'Máscaras cambiantes, ambigüedad moral y sabiduría caótica',
    icon: '🎭',
    quote: '«Las reglas son solo sugerencias escritas por quienes temen reír.»',
    functionDesc: 'Desafía la solemnidad, expone las hipocresías del sistema y desestabiliza tanto al héroe como al villano mediante el ingenio y el engaño.',
    shadowWeakness: 'Egoísmo puro, nihilismo o traición por puro capricho personal.',
    classicExample: 'Loki (Mitología Nórdica), Jun Batz y Jun Chowén (Popol Vuh)',
    modernExample: 'Jack Sparrow (Piratas del Caribe), Tyrion Lannister (Juego de Tronos)',
    writingTip: 'Usa al Trickster para obligar al héroe a pensar fuera de la caja y abandonar su rigidez mental.',
    color: '#ec4899'
  }
];

export default function ConstruyendoPersonaje() {
  const { config, saveConfigToFirestore } = usePortalConfig();
  const { user } = useAuth();

  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData>(ARCHETYPES[0]);
  const [activeTab, setActiveTab] = useState<'psicologia' | 'arquetipos' | 'viaje' | 'herramientas' | 'taller'>('psicologia');

  // Local state for images fallback/cache
  const [localArchetypeImages, setLocalArchetypeImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('local_archetype_images');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // In-place uploader tray and Lightbox states
  const [isInlineUploaderOpen, setIsInlineUploaderOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadStatusText, setUploadStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Character Forge State
  const [charName, setCharName] = useState('Ixchel de la Selva');
  const [charArchetype, setCharArchetype] = useState('El Héroe / Protagonista');
  const [charOccupation, setCharOccupation] = useState('Guardiana de las Semillas Sagradas');
  const [charWant, setCharWant] = useState('Recuperar el libro robado de su aldea');
  const [charNeed, setCharNeed] = useState('Aprender a confiar en los demás y soltar el control');
  const [charWound, setCharWound] = useState('Fue traicionada por su antiguo mentor durante la gran sequía');
  const [charFear, setCharFear] = useState('Quedar indefensa y ver destruido a su pueblo por su culpa');
  const [charVirtue, setCharVirtue] = useState('Valentía indomable y memoria enciclopédica');
  const [charFlaw, setCharFlaw] = useState('Terquedad extrema y sospecha compulsiva');
  const [charContradiction, setCharContradiction] = useState('Protege la vida a toda costa, pero no permite que nadie se acerque a su corazón');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const sectionRefs = {
    psicologia: useRef<HTMLDivElement>(null),
    arquetipos: useRef<HTMLDivElement>(null),
    viaje: useRef<HTMLDivElement>(null),
    herramientas: useRef<HTMLDivElement>(null),
    taller: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  // Determine current image for active archetype
  const getArchetypeImage = (archetypeId: string): string => {
    return (
      config.archetypeImages?.[archetypeId] ||
      localArchetypeImages[archetypeId] ||
      ''
    );
  };

  const currentArchetypeImg = getArchetypeImage(selectedArchetype.id);

  const scrollToSection = (tab: 'psicologia' | 'arquetipos' | 'viaje' | 'herramientas' | 'taller') => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Process and upload an image file with instant client compression
  const processImageFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadStatusText('Optimizando imagen...');

      // 1. Client-Side compression to high-efficiency WebP (1280x720 max)
      const compressedBlob = await compressImageWebP(file, 1280, 720, 0.85);

      let finalUrl = '';

      if (user) {
        setUploadStatusText('Guardando imagen...');
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') + '.webp';
        const fileRef = ref(storage, `archetypes-assets/${Date.now()}_${cleanName}`);
        await uploadBytes(fileRef, compressedBlob, { contentType: 'image/webp' });
        finalUrl = await getDownloadURL(fileRef);

        // Save into global Firestore Portal Config
        const updatedImages = {
          ...(config.archetypeImages || {}),
          [selectedArchetype.id]: finalUrl
        };
        await saveConfigToFirestore({
          ...config,
          archetypeImages: updatedImages
        });
      } else {
        // Fallback DataURL for instant local preview if offline or guest
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
      }

      // Save local cache
      const updatedLocal = { ...localArchetypeImages, [selectedArchetype.id]: finalUrl };
      setLocalArchetypeImages(updatedLocal);
      localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));

      setIsInlineUploaderOpen(false);
      setUploadStatusText('');
    } catch (err) {
      console.error('Error al procesar imagen de arquetipo:', err);
      alert('Hubo un inconveniente al optimizar o subir la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // Clipboard Paste Support (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedArchetype, config, user]);

  const handleSaveCustomUrl = async () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();

    const updatedLocal = { ...localArchetypeImages, [selectedArchetype.id]: url };
    setLocalArchetypeImages(updatedLocal);
    localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));

    if (user) {
      const updatedImages = {
        ...(config.archetypeImages || {}),
        [selectedArchetype.id]: url
      };
      await saveConfigToFirestore({
        ...config,
        archetypeImages: updatedImages
      });
    }

    setCustomUrlInput('');
    setIsInlineUploaderOpen(false);
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`¿Deseas restablecer la imagen para "${selectedArchetype.name}"?`)) return;

    const updatedLocal = { ...localArchetypeImages };
    delete updatedLocal[selectedArchetype.id];
    setLocalArchetypeImages(updatedLocal);
    localStorage.setItem('local_archetype_images', JSON.stringify(updatedLocal));

    if (user) {
      const updatedImages = { ...(config.archetypeImages || {}) };
      delete updatedImages[selectedArchetype.id];
      await saveConfigToFirestore({
        ...config,
        archetypeImages: updatedImages
      });
    }
  };

  const handleCopyPassport = () => {
    const textToCopy = `=========================================
FICHA DE PERSONAJE: ${charName.toUpperCase()}
Arquetipo: ${charArchetype}
Ocupación / Rol: ${charOccupation}
=========================================
[ANATOMÍA PSICOLÓGICA]
• Deseo Central (Want): ${charWant}
• Necesidad Profunda (Need): ${charNeed}
• Herida del Pasado (Ghost/Wound): ${charWound}
• Mayor Miedo (The Fear): ${charFear}

[MATRIZ DE PERSONALIDAD]
• Virtud Luminosa: ${charVirtue}
• Defecto Trágico: ${charFlaw}
• Paradoja / Contradicción: ${charContradiction}

Creado con el Taller Narrativo de Editorial Lluvia de Ideas
=========================================`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  const loadPresetExample = (type: 'guerrero' | 'sabio' | 'rebelde') => {
    if (type === 'guerrero') {
      setCharName('Kaan el Silencioso');
      setCharArchetype('El Héroe / Protagonista');
      setCharOccupation('Explorador de Tierras Altas');
      setCharWant('Derrotar a la bestia que amenaza la frontera norte');
      setCharNeed('Comprender el lenguaje de la naturaleza antes de destruirla');
      setCharWound('Perdió a su hermano por actuar impulsivamente');
      setCharFear('El fracaso en solitario');
      setCharVirtue('Fuerza inquebrantable y lealtad');
      setCharFlaw('Renuente a pedir ayuda');
      setCharContradiction('Es un guerrero implacable que llora con la música antigua');
    } else if (type === 'sabio') {
      setCharName('Maestra Yolanda');
      setCharArchetype('El Mentor');
      setCharOccupation('Cronista del Observatorio');
      setCharWant('Preservar los pergaminos sagrados intactos');
      setCharNeed('Permitir que las nuevas generaciones reescriban el futuro');
      setCharWound('Su sabiduría no pudo salvar a su pueblo de una catástfe');
      setCharFear('La obsolescencia y el olvido');
      setCharVirtue('Paciencia infinita e intuición');
      setCharFlaw('Guarda secretos vitales por miedo a su uso indebido');
      setCharContradiction('Enseña el valor del riesgo mientras vive recluida en su torre');
    } else {
      setCharName('Balam el Pícaro');
      setCharArchetype('El Camaleón / Embaucador (Trickster)');
      setCharOccupation('Comerciante de Reliquias Prohibidas');
      setCharWant('Conseguir el oro suficiente para comprar su libertad');
      setCharNeed('Descubrir que su valor no depende de sus riquezas sino de sus lealtades');
      setCharWound('Creció en la servidumbre y fue humillado');
      setCharFear('La sumisión y el encierro');
      setCharVirtue('Ingenio deslumbrante y carisma magnético');
      setCharFlaw('Codicia y cinismo');
      setCharContradiction('Se burla de los ideales nobles pero arriesga la vida por huérfanos');
    }
  };

  return (
    <div className="personaje-page-container animate-fade-in">
      {/* Top Header Navigation */}
      <LandingTopBar slogan="Guía de Creación Literaria & Dramaturgia" showHomeButton />

      {/* Hero Header */}
      <header className="personaje-hero">
        <div className="personaje-badge-pill">
          <span>✨ Taller de Arquitectura Narrativa</span>
        </div>
        <h1 className="personaje-hero-title">
          Construyendo el Personaje: El Arte de Dar Vida a Seres Inolvidables
        </h1>
        <p className="personaje-hero-subtitle">
          Un gran relato no surge de eventos extraordinarios, sino de almas complejas puestas a prueba. 
          Aprende a transformar ideas abstractas en figuras tridimensionales, con heridas, contradicciones, arquetipos y arcos de transformación indelebles.
        </p>

        {/* Section Navigation Ribbon */}
        <nav className="personaje-nav-ribbon" aria-label="Navegación del Taller">
          <button 
            className={`personaje-nav-btn ${activeTab === 'psicologia' ? 'active' : ''}`}
            onClick={() => scrollToSection('psicologia')}
          >
            <span>🧠</span> 1. Psicología
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'arquetipos' ? 'active' : ''}`}
            onClick={() => scrollToSection('arquetipos')}
          >
            <span>🎭</span> 2. Arquetipos
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'viaje' ? 'active' : ''}`}
            onClick={() => scrollToSection('viaje')}
          >
            <span>🗺️</span> 3. El Viaje del Héroe
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'herramientas' ? 'active' : ''}`}
            onClick={() => scrollToSection('herramientas')}
          >
            <span>✍️</span> 4. Voz & Guion
          </button>
          <button 
            className={`personaje-nav-btn ${activeTab === 'taller' ? 'active' : ''}`}
            onClick={() => scrollToSection('taller')}
          >
            <span>🛠️</span> 5. Forja Interactiva
          </button>
        </nav>
      </header>

      {/* =========================================================================
          MÓDULO 1: LA PSICOLOGÍA DEL PERSONAJE
          ========================================================================= */}
      <section ref={sectionRefs.psicologia} className="personaje-section" id="psicologia">
        <div className="section-header-block">
          <span className="section-tag">Módulo 1</span>
          <h2 className="section-main-title">La Psicología Profunda: La Anatomía Interna</h2>
          <p className="section-description">
            Antes de pensar en cómo luce tu personaje o qué poderes tiene, debes definir las fuerzas invisibles que gobiernan su corazón y condicionan sus decisiones bajo fuego.
          </p>
        </div>

        <div className="psychology-grid">
          {/* 1. Deseo Central */}
          <div className="narrative-card psychology-card">
            <div className="psy-icon-box" style={{ color: '#38bdf8' }}>🎯</div>
            <h3 className="psy-title">1. Deseo Central (The Want)</h3>
            <p className="psy-definition">
              Es la meta tangible, consciente y externa que el personaje persigue al inicio del relato. Cree que al alcanzarla solucionará todos sus problemas.
            </p>
            <div className="psy-key-question">
              <strong>Pregunta clave:</strong> «¿Qué cree que necesita para ser feliz o estar a salvo?»
            </div>
          </div>

          {/* 2. Necesidad Profunda */}
          <div className="narrative-card psychology-card">
            <div className="psy-icon-box" style={{ color: '#a855f7' }}>💎</div>
            <h3 className="psy-title">2. Necesidad Profunda (The Need)</h3>
            <p className="psy-definition">
              La verdad espiritual o moral que el personaje debe comprender para evolucionar. Casi siempre entra en colisión directa con su deseo superficial.
            </p>
            <div className="psy-key-question">
              <strong>Pregunta clave:</strong> «¿Qué verdad sobre sí mismo está negando u ocultando?»
            </div>
          </div>

          {/* 3. La Herida del Pasado */}
          <div className="narrative-card psychology-card">
            <div className="psy-icon-box" style={{ color: '#f43f5e' }}>🥀</div>
            <h3 className="psy-title">3. La Herida (The Ghost / Wound)</h3>
            <p className="psy-definition">
              El trauma, traición o fracaso fundacional en el pasado del personaje que sembró una "Mentira" (*The Lie*): una visión distorsionada de la realidad.
            </p>
            <div className="psy-key-question">
              <strong>Pregunta clave:</strong> «¿Qué dolor del pasado le hace levantar muros protectores?»
            </div>
          </div>

          {/* 4. Mayor Miedo */}
          <div className="narrative-card psychology-card">
            <div className="psy-icon-box" style={{ color: '#eab308' }}>⚡</div>
            <h3 className="psy-title">4. El Mayor Miedo (The Flaw / Fear)</h3>
            <p className="psy-definition">
              El abismo que el personaje evitará a toda costa. La trama de tu historia debe obligarlo a mirar directamente a ese miedo para vencer.
            </p>
            <div className="psy-key-question">
              <strong>Pregunta clave:</strong> «¿Qué situación lo dejaría completamente vulnerable?»
            </div>
          </div>
        </div>

        {/* Banner de Contradicciones y Paradojas */}
        <div className="contradictions-banner">
          <div className="contradictions-text">
            <h3>⚡ Cómo Romper los Clichés: Paradojas y Contradicciones</h3>
            <p>
              Los personajes planos son predecibles porque sus virtudes siempre los hacen actuar bien y sus defectos son meramente decorativos. 
              Los personajes memorables albergan <strong>contradicciones vivas</strong>: una virtud que se convierte en veneno cuando es excesiva, o un defecto que esconde una gran ternura.
            </p>
          </div>
          <div className="contradictions-examples">
            <div className="contrast-pill">
              <strong>El Pacificador Violento:</strong> <span>Ama la paz tan ferozmente que recurre a la fuerza para imponerla.</span>
            </div>
            <div className="contrast-pill">
              <strong>El Cínico Protector:</strong> <span>Dice no creer en nadie, pero es el primero en saltar al fuego para salvar a un extraño.</span>
            </div>
            <div className="contrast-pill">
              <strong>El Sabio Cobarde:</strong> <span>Conoce la solución a todos los enigmas, pero tiembla ante la menor confrontación personal.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 2: ARQUETIPOS DE PERSONAJES (CON IMAGEN GRANDE Y COMPRESIÓN)
          ========================================================================= */}
      <section ref={sectionRefs.arquetipos} className="personaje-section" id="arquetipos">
        <div className="section-header-block">
          <span className="section-tag">Módulo 2</span>
          <h2 className="section-main-title">Arquetipos Dinámicos: Más Allá del Héroe</h2>
          <p className="section-description">
            Explora las figuras esenciales de la narrativa universal. Puedes visualizar y personalizar la imagen cinematográfica de cada arquetipo en el mismo panel de forma instantánea.
          </p>
        </div>

        <div className="archetypes-explorer">
          {/* Selector de Arquetipos con Miniatura / Icono */}
          <div className="archetypes-list" role="tablist">
            {ARCHETYPES.map((arch) => {
              const archImg = getArchetypeImage(arch.id);
              return (
                <button
                  key={arch.id}
                  className={`archetype-item-btn ${selectedArchetype.id === arch.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedArchetype(arch);
                    setIsInlineUploaderOpen(false);
                  }}
                  role="tab"
                  aria-selected={selectedArchetype.id === arch.id}
                >
                  <div className="arch-btn-thumb-wrap">
                    {archImg ? (
                      <img 
                        src={archImg} 
                        alt={arch.name} 
                        className="arch-btn-thumb-img" 
                        loading="lazy" 
                        decoding="async" 
                      />
                    ) : (
                      <span className="arch-btn-icon">{arch.icon}</span>
                    )}
                  </div>
                  <div className="arch-btn-info">
                    <strong>{arch.name}</strong>
                    <small>{arch.roleSubtitle}</small>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel Detallado del Arquetipo Seleccionado con Gran Banner de Presentación */}
          <div className="archetype-detail-panel animate-fade-in" key={selectedArchetype.id}>
            
            {/* Visual Showcase Banner de Alta Calidad con Soporte Drag & Drop */}
            <div 
              className={`arch-visual-showcase ${isDragActive ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {currentArchetypeImg ? (
                <>
                  <img
                    src={currentArchetypeImg}
                    alt={`Presentación visual de ${selectedArchetype.name}`}
                    className="arch-banner-img"
                    loading="lazy"
                    decoding="async"
                    onClick={() => setIsLightboxOpen(true)}
                    style={{ cursor: 'zoom-in' }}
                  />
                  <div className="arch-banner-gradient-overlay" />
                </>
              ) : (
                <div className="arch-banner-default-art">
                  <div className="arch-default-emblem">{selectedArchetype.icon}</div>
                  <div className="arch-banner-gradient-overlay" />
                </div>
              )}

              {/* Uploading Indicator */}
              {isUploading && (
                <div className="arch-uploading-pill">
                  <div className="arch-spinner" />
                  <span>{uploadStatusText || 'Optimizando imagen...'}</span>
                </div>
              )}

              {/* Controles del Banner */}
              <div className="arch-banner-controls">
                {currentArchetypeImg && (
                  <button 
                    className="arch-ctrl-btn" 
                    onClick={() => setIsLightboxOpen(true)}
                    title="Ver imagen en pantalla completa"
                  >
                    <span>🔍</span> Ampliar
                  </button>
                )}
                <button 
                  className="arch-ctrl-btn" 
                  onClick={() => setIsInlineUploaderOpen(!isInlineUploaderOpen)}
                  title="Subir o cambiar imagen para este arquetipo"
                >
                  <span>📷</span> {currentArchetypeImg ? 'Cambiar Imagen' : 'Subir Imagen'}
                </button>
                {currentArchetypeImg && (
                  <button 
                    className="arch-ctrl-btn danger" 
                    onClick={handleRemoveImage}
                    title="Restablecer arte por defecto"
                  >
                    <span>🗑️</span>
                  </button>
                )}
              </div>

              {/* Cita en Banner Inferior */}
              <div className="arch-banner-caption">
                <blockquote className="arch-caption-quote">
                  {selectedArchetype.quote}
                </blockquote>
              </div>
            </div>

            {/* In-Place Contextual Uploader Tray (Se abre en la misma posición de la sección) */}
            {isInlineUploaderOpen && (
              <div className="arch-inline-uploader animate-fade-in">
                <div className="arch-inline-uploader-header">
                  <h4>📷 Imagen para {selectedArchetype.name}</h4>
                  <button 
                    className="arch-inline-close-btn" 
                    onClick={() => setIsInlineUploaderOpen(false)}
                    title="Cerrar panel"
                  >
                    ✕
                  </button>
                </div>

                {/* Zona de Selección y Arrastre Inmediata */}
                <div 
                  className={`arch-drop-zone ${isDragActive ? 'drag-active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="arch-drop-icon">🖼️</div>
                  <p><strong>Haz clic aquí o arrastra tu imagen</strong> (o presiona Ctrl+V para pegar)</p>
                  <small>Optimización instantánea en formato WebP de alta velocidad</small>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" 
                    style={{ display: 'none' }} 
                    onChange={handleImageFileChange} 
                  />
                </div>

                {/* Enlace URL directo */}
                <div className="arch-url-input-row">
                  <input 
                    type="url" 
                    className="forge-input" 
                    placeholder="O pega aquí una URL directa de imagen (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomUrl()}
                  />
                  <button 
                    className="forge-btn forge-btn-primary" 
                    onClick={handleSaveCustomUrl}
                    style={{ width: 'auto', padding: '0 20px', whiteSpace: 'nowrap' }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            {/* Cabecera Informativa */}
            <div className="arch-header">
              <div className="arch-large-icon">{selectedArchetype.icon}</div>
              <div className="arch-header-titles">
                <h3>{selectedArchetype.name}</h3>
                <p className="arch-tagline">{selectedArchetype.roleSubtitle}</p>
              </div>
            </div>

            {/* Grilla de Información */}
            <div className="arch-info-grid">
              <div className="arch-info-box">
                <h4>🎯 Función Dramática</h4>
                <p>{selectedArchetype.functionDesc}</p>
              </div>

              <div className="arch-info-box">
                <h4>⚠️ Sombra y Debilidad</h4>
                <p>{selectedArchetype.shadowWeakness}</p>
              </div>

              <div className="arch-info-box">
                <h4>📜 Ejemplos Clásicos</h4>
                <p>{selectedArchetype.classicExample}</p>
              </div>

              <div className="arch-info-box">
                <h4>🎬 Ejemplos Contemporáneos</h4>
                <p>{selectedArchetype.modernExample}</p>
              </div>
            </div>

            {/* Consejo de Escritura */}
            <div className="arch-prompt-box">
              <strong>💡 Consejo de Escritura Aplicada:</strong>
              <p>{selectedArchetype.writingTip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal de Pantalla Completa (Alineado al Borde Superior) */}
      {isLightboxOpen && currentArchetypeImg && (
        <div className="arch-lightbox-overlay animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <div className="arch-lightbox-top-bar" onClick={(e) => e.stopPropagation()}>
            <span className="arch-lightbox-tag">
              <span>{selectedArchetype.icon}</span> {selectedArchetype.name}
            </span>
            <button className="arch-lightbox-close-btn" onClick={() => setIsLightboxOpen(false)}>
              ✕ Cerrar Vista
            </button>
          </div>

          <div className="arch-lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <img 
              src={currentArchetypeImg} 
              alt={selectedArchetype.name} 
              className="arch-lightbox-img" 
            />
          </div>

          <div className="arch-lightbox-caption" onClick={(e) => e.stopPropagation()}>
            <span>{selectedArchetype.name}</span> — <small>{selectedArchetype.roleSubtitle}</small>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO 3: EL VIAJE DEL HÉROE Y LA EVOLUCIÓN DEL PERSONAJE
          ========================================================================= */}
      <section ref={sectionRefs.viaje} className="personaje-section" id="viaje">
        <div className="section-header-block">
          <span className="section-tag">Módulo 3</span>
          <h2 className="section-main-title">El Viaje del Héroe y el Arco de Transformación</h2>
          <p className="section-description">
            Un arco dramático no es el mapa geográfico del viaje, sino la <strong>metamorfosis interna</strong>: la muerte simbólica de la antigua identidad y el nacimiento de una nueva conciencia.
          </p>
        </div>

        <div className="journey-timeline">
          {/* Fase 1 */}
          <div className="narrative-card journey-step-card">
            {config.journeyStageImages?.mundo_ordinario && (
              <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                <img 
                  src={config.journeyStageImages.mundo_ordinario} 
                  alt="El Mundo Ordinario" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy" 
                />
              </div>
            )}
            <span className="journey-step-number">01</span>
            <span className="journey-step-badge">🏡</span>
            <h3 className="journey-step-title">El Mundo Ordinario</h3>
            <p className="journey-step-desc">
              La zona de confort donde el personaje sobrevive aferrado a su mentira o herida del pasado. El entorno refleja su estancamiento interno.
            </p>
            <div className="journey-step-transformation">
              <strong>Estado:</strong> Inconsciente de su verdadero potencial.
            </div>
          </div>

          {/* Fase 2 */}
          <div className="narrative-card journey-step-card">
            {config.journeyStageImages?.llamada_umbral && (
              <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                <img 
                  src={config.journeyStageImages.llamada_umbral} 
                  alt="La Llamada y el Umbral" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy" 
                />
              </div>
            )}
            <span className="journey-step-number">02</span>
            <span className="journey-step-badge">⚡</span>
            <h3 className="journey-step-title">La Llamada y el Umbral</h3>
            <p className="journey-step-desc">
              El Heraldo o una crisis rompe el equilibrio. Tras resistirse por miedo, el héroe cruza el umbral hacia lo desconocido (el Mundo Especial).
            </p>
            <div className="journey-step-transformation">
              <strong>Estado:</strong> Despojado de sus viejas certezas.
            </div>
          </div>

          {/* Fase 3 */}
          <div className="narrative-card journey-step-card">
            {config.journeyStageImages?.abismo_crisis && (
              <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                <img 
                  src={config.journeyStageImages.abismo_crisis} 
                  alt="El Abismo / La Crisis" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy" 
                />
              </div>
            )}
            <span className="journey-step-number">03</span>
            <span className="journey-step-badge">🔥</span>
            <h3 className="journey-step-title">El Abismo / La Crisis</h3>
            <p className="journey-step-desc">
              La prueba suprema. El héroe enfrenta a la Sombra y sus viejos métodos fallan. Debe renunciar a su "Deseo" superficial para abrazar su "Necesidad".
            </p>
            <div className="journey-step-transformation">
              <strong>Estado:</strong> Muerte del ego y de la mentira.
            </div>
          </div>

          {/* Fase 4 */}
          <div className="narrative-card journey-step-card">
            {config.journeyStageImages?.transformacion && (
              <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                <img 
                  src={config.journeyStageImages.transformacion} 
                  alt="La Transformación y el Elixir" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy" 
                />
              </div>
            )}
            <span className="journey-step-number">04</span>
            <span className="journey-step-badge">🌟</span>
            <h3 className="journey-step-title">La Transformación y el Elixir</h3>
            <p className="journey-step-desc">
              El personaje renace con sabiduría integrada. Regresa al mundo ordinario no como el que se marchó, sino como un agente capaz de sanar a su comunidad.
            </p>
            <div className="journey-step-transformation">
              <strong>Estado:</strong> Integración y libertad interior.
            </div>
          </div>
        </div>

        <div className="narrative-card" style={{ borderLeft: '4px solid #38bdf8', padding: '24px 30px' }}>
          <h4 style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: '8px' }}>
            🌲 Relación Dinámica: Entorno vs. Evolución del Personaje
          </h4>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Los escenarios no son meros fondos ilustrados: son <strong>catalizadores de presión</strong>. Un desierto expone la sed de significado; una tormenta de Juracán mide el temple moral; una corte corrupta pone a prueba la lealtad. Cuando tu personaje interactúe con un obstáculo físico, pregúntate siempre qué emoción o dilema interno está forzando a salir a la superficie.
          </p>
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 4: HERRAMIENTAS NARRATIVAS Y GUION
          ========================================================================= */}
      <section ref={sectionRefs.herramientas} className="personaje-section" id="herramientas">
        <div className="section-header-block">
          <span className="section-tag">Módulo 4</span>
          <h2 className="section-main-title">Herramientas de Guion: Voz, Diálogo y Dramaturgia</h2>
          <p className="section-description">
            Cómo plasmar la personalidad en la página sin recurrir a párrafos descriptivos aburridos. Haz que el lector conozca a tus personajes por lo que dicen, cómo lo callan y qué hacen.
          </p>
        </div>

        <div className="tools-grid">
          {/* Bloque 1: Voz y Diálogo */}
          <div className="narrative-card">
            <h3 style={{ fontSize: '1.4rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💬</span> El Arte del Diálogo y la Voz Única
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              Si borras los nombres de los personajes en tu guion, el lector debería ser capaz de identificar quién habla por su cadencia y vocabulario.
            </p>
            <div className="tool-list">
              <div className="tool-item">
                <h4>🎯 1. El Subtexto (Lo que no se dice)</h4>
                <p>La gente rara vez dice lo que realmente siente. Cuando dos personajes discuten por una taza de café rota, a menudo están discutiendo por diez años de promesas incumplidas.</p>
              </div>
              <div className="tool-item">
                <h4>📚 2. Léxico y Metáforas Identitarias</h4>
                <p>Un astrónomo describirá el amor en términos de órbitas y gravedad; un campesino lo hará en términos de cosechas, lluvias y raíces.</p>
              </div>
              <div className="tool-item">
                <h4>⏱️ 3. Ritmo y Silencios</h4>
                <p>Las oraciones cortas revelan urgencia o miedo; las pausas y evasivas demuestran culpa o cálculo estratégico.</p>
              </div>
            </div>
          </div>

          {/* Bloque 2: Show Don't Tell y Conflicto */}
          <div className="narrative-card">
            <h3 style={{ fontSize: '1.4rem', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚔️</span> Dramaturgia y Conflicto («Show, Don't Tell»)
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              No nos digas que un personaje es generoso o cruel: colócalo frente a un dilema donde actuar le cueste algo valioso.
            </p>
            <div className="tool-list">
              <div className="tool-item">
                <h4>🔥 1. Decisiones Bajo Presión Extrema</h4>
                <p>La verdadera naturaleza humana solo se revela cuando el tiempo se agota y las dos opciones disponibles conllevan una pérdida dolorosa.</p>
              </div>
              <div className="tool-item">
                <h4>👁️ 2. Micro-acciones Reveladoras</h4>
                <p>Un personaje que se limpia las manos compulsivamente antes de mentir, o que acaricia una moneda gastada cuando siente miedo, transmite más que páginas de monólogo interior.</p>
              </div>
              <div className="tool-item">
                <h4>🎭 3. El Triángulo de Conflicto</h4>
                <p>Empareja personajes con filosofías opuestas para cada escena: un optimista ingenuo junto a un cínico veterano generará chispas narrativas automáticas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MÓDULO 5: TALLER INTERACTIVO / FORJA DEL PERSONAJE
          ========================================================================= */}
      <section ref={sectionRefs.taller} className="personaje-section" id="taller">
        <div className="section-header-block">
          <span className="section-tag">Taller Práctico</span>
          <h2 className="section-main-title">La Forja del Personaje (Character Forge)</h2>
          <p className="section-description">
            Utiliza este generador interactivo para esculpir la ficha tridimensional de tu protagonista o antagonista. Puedes editar los campos o cargar plantillas prediseñadas.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('guerrero')}>
              ⚡ Cargar Ejemplo: Guerrero
            </button>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('sabio')}>
              🧙 Cargar Ejemplo: Sabia
            </button>
            <button className="personaje-nav-btn" onClick={() => loadPresetExample('rebelde')}>
              🎭 Cargar Ejemplo: Pícaro
            </button>
          </div>
        </div>

        <div className="forge-container">
          <div className="forge-layout">
            {/* Formulario de Construcción */}
            <div className="forge-form">
              <div className="forge-field-group">
                <label>🏷️ Nombre del Personaje</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charName} 
                  onChange={(e) => setCharName(e.target.value)} 
                  placeholder="Ej: Kaan el Errante"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="forge-field-group">
                  <label>🎭 Arquetipo</label>
                  <select 
                    className="forge-select" 
                    value={charArchetype} 
                    onChange={(e) => setCharArchetype(e.target.value)}
                  >
                    {ARCHETYPES.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="forge-field-group">
                  <label>💼 Ocupación / Rol</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charOccupation} 
                    onChange={(e) => setCharOccupation(e.target.value)} 
                    placeholder="Ej: Guardiana, Sanador, Alquimista"
                  />
                </div>
              </div>

              <div className="forge-field-group">
                <label>🎯 Deseo Central (The Want - Lo que cree necesitar)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charWant} 
                  onChange={(e) => setCharWant(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>💎 Necesidad Profunda (The Need - La verdad que debe aprender)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charNeed} 
                  onChange={(e) => setCharNeed(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>🥀 Herida del Pasado (Ghost / Wound)</label>
                <textarea 
                  className="forge-textarea" 
                  value={charWound} 
                  onChange={(e) => setCharWound(e.target.value)} 
                />
              </div>

              <div className="forge-field-group">
                <label>⚡ Mayor Miedo (The Fear)</label>
                <input 
                  type="text" 
                  className="forge-input" 
                  value={charFear} 
                  onChange={(e) => setCharFear(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="forge-field-group">
                  <label>✨ Virtud Luminosa</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charVirtue} 
                    onChange={(e) => setCharVirtue(e.target.value)} 
                  />
                </div>
                <div className="forge-field-group">
                  <label>⚠️ Defecto Trágico</label>
                  <input 
                    type="text" 
                    className="forge-input" 
                    value={charFlaw} 
                    onChange={(e) => setCharFlaw(e.target.value)} 
                  />
                </div>
              </div>

              <div className="forge-field-group">
                <label>🔄 Paradoja / Contradicción Interna</label>
                <textarea 
                  className="forge-textarea" 
                  value={charContradiction} 
                  onChange={(e) => setCharContradiction(e.target.value)} 
                />
              </div>
            </div>

            {/* Vista Previa de la Ficha / Pasaporte */}
            <div className="passport-card">
              <div className="passport-header">
                <div className="passport-avatar">
                  {charArchetype.includes('Mentor') ? '🧙‍♂️' : charArchetype.includes('Sombra') ? '🌑' : charArchetype.includes('Aliado') ? '🛡️' : charArchetype.includes('Camaleón') ? '🎭' : '🦸'}
                </div>
                <div>
                  <h3 className="passport-name">{charName || 'Nombre del Personaje'}</h3>
                  <span className="passport-archetype-tag">{charArchetype}</span>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{charOccupation || 'Rol Narrativo'}</p>
                </div>
              </div>

              <div className="passport-grid">
                <div className="passport-entry">
                  <small>Deseo Externo (Want)</small>
                  <span>{charWant || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Necesidad Interna (Need)</small>
                  <span>{charNeed || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Herida / Fantasma (Ghost)</small>
                  <span>{charWound || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Mayor Miedo</small>
                  <span>{charFear || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Virtud</small>
                  <span>{charVirtue || 'Sin definir'}</span>
                </div>
                <div className="passport-entry">
                  <small>Defecto</small>
                  <span>{charFlaw || 'Sin definir'}</span>
                </div>
              </div>

              <div className="passport-entry" style={{ background: 'rgba(147, 51, 234, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                <small style={{ color: '#c084fc' }}>Paradoja Central</small>
                <span style={{ color: '#f8fafc', fontStyle: 'italic' }}>«{charContradiction || 'Sin definir'}»</span>
              </div>

              <div className="passport-actions">
                <button className="forge-btn forge-btn-primary" onClick={handleCopyPassport}>
                  <span>📋</span> {copiedNotification ? '¡Ficha Copiada!' : 'Copiar Ficha de Personaje'}
                </button>
              </div>

              {copiedNotification && (
                <div style={{ textAlign: 'center', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  ✓ Formato de texto copiado al portapapeles con éxito
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
