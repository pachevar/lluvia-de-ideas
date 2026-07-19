import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';
import type { BingoGame, BingoCustomization } from '../../types';
import '../games/Bingo.css';

const PRESETS_MAP = [
  { label: "Ceiba Sagrada", value: "🌳", type: "emoji" },
  { label: "Quetzal Libre", value: "🦜", type: "emoji" },
  { label: "Jaguar de Xibalbá", value: "🐆", type: "emoji" },
  { label: "Maíz Criollo", value: "🌽", type: "emoji" },
  { label: "Volcán de Fuego", value: "🌋", type: "emoji" },
  { label: "Sol Maya", value: "☀️", type: "emoji" },
  { label: "Luna de Xela", value: "🌙", type: "emoji" },
  { label: "Tucán Hermoso", value: "🪶", type: "emoji" }
] as const;
const HEIGHT_PRESETS = [
  { label: 'Fino (80px)', value: 80 },
  { label: 'Compacto (120px)', value: 120 },
  { label: 'Mediano (160px)', value: 160 },
  { label: 'Alto (200px)', value: 200 },
  { label: 'Grande (240px)', value: 240 }
];

const MARKER_OPTIONS = ["⭐", "🔴", "🌽", "🍀", "🍩", "🎯", "💎", "🔥", "❤️", "⚡", "💀", "🔔"];

const getTextColorForBg = (hexColor: string) => {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#1f2937' : '#ffffff';
};

const isBgLight = (hexColor: string) => {
  if (!hexColor || hexColor.startsWith('var')) return true;
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128;
};

export default function AdminBingoTab() {
  const [activeGame, setActiveGame] = useState<BingoGame | null>(null);

  // Custom Alert / Confirm Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    icon: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showConfirm = (message: string, title: string = 'Confirmación', icon: string = '⚠️', confirmText: string = 'Aceptar', cancelText: string = 'Cancelar') => {
    return new Promise<boolean>((resolve) => {
      setDialogConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        icon,
        confirmText,
        cancelText,
        onConfirm: () => {
          setDialogConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve(false);
        }
      });
    });
  };

  const showAlert = (message: string, title: string = 'Mensaje', icon: string = '📢', confirmText: string = 'Entendido') => {
    return new Promise<void>((resolve) => {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title,
        message,
        icon,
        confirmText,
        onConfirm: () => {
          setDialogConfig(null);
          resolve();
        }
      });
    });
  };
  const [loading, setLoading] = useState(true);
  
  // Customization States
  const [gameTitle, setGameTitle] = useState('Gran Bingo Familiar');
  const [headerImage, setHeaderImage] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#a855f7');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [backgroundColor, setBackgroundColor] = useState('#fbf9ff');
  const [themeName, setThemeName] = useState<BingoCustomization['themeName']>('classic');
  const [markerEmoji, setMarkerEmoji] = useState('⭐');
  const [customTitle, setCustomTitle] = useState('Bingo Virtual');
  const [customSubtitle, setCustomSubtitle] = useState('Editorial Lluvia de Ideas');
  const [headerHeight, setHeaderHeight] = useState(160);
  const [selectedHeightType, setSelectedHeightType] = useState<'preset' | 'custom'>('preset');
  const [soundTheme, setSoundTheme] = useState<BingoCustomization['soundTheme']>('classic');
  const [cardTheme, setCardTheme] = useState<BingoCustomization['cardTheme']>('classic');
  const [winningPattern, setWinningPattern] = useState('full');
  
  // Mappings
  const [numberToImageMap, setNumberToImageMap] = useState<BingoCustomization['numberToImageMap']>({});
  const [mappingNum, setMappingNum] = useState<number>(1);
  const [mappingType, setMappingType] = useState<'emoji' | 'image'>('emoji');
  const [mappingVal, setMappingVal] = useState<string>('🌳');
  const [mappingLabel, setMappingLabel] = useState<string>('Ceiba');

  // Sponsor States
  const [sponsorActive, setSponsorActive] = useState(false);
  const [sponsorInterval, setSponsorInterval] = useState(5);
  const [sponsorMode, setSponsorMode] = useState<'integrated' | 'modal'>('modal');
  const [sponsorAudioAnnounce, setSponsorAudioAnnounce] = useState(false);
  const [sponsorsList, setSponsorsList] = useState<any[]>([]);

  // New Sponsor Form States
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorMessage, setNewSponsorMessage] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');

  // Sub-tabs State
  const [subTab, setSubTab] = useState<'aspecto' | 'colores' | 'figuras' | 'presets' | 'marcas'>('aspecto');

  // Presets Data
  const PRESETS = [
    {
      id: 'classic',
      name: 'Clásico Místico 🔮',
      primaryColor: '#a855f7',
      accentColor: '#ec4899',
      backgroundColor: '#fbf9ff',
      themeName: 'classic' as const,
      cardTheme: 'classic' as const,
      markerEmoji: '⭐',
      soundTheme: 'classic' as const,
      headerHeight: 160,
      title: 'Bingo Virtual',
      subtitle: 'Editorial Lluvia de Ideas'
    },
    {
      id: 'neon',
      name: 'Fantasía Neón 👾',
      primaryColor: '#00f0ff',
      accentColor: '#ff007f',
      backgroundColor: '#0a0b10',
      themeName: 'neon' as const,
      cardTheme: 'cyberpunk' as const,
      markerEmoji: '🔥',
      soundTheme: 'cyberpunk' as const,
      headerHeight: 160,
      title: 'Cyber Bingo',
      subtitle: 'Digital Interactive'
    },
    {
      id: 'forest',
      name: 'Bosque Sagrado 🌳',
      primaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#f4fbf7',
      themeName: 'forest' as const,
      cardTheme: 'light' as const,
      markerEmoji: '🌽',
      soundTheme: 'classic' as const,
      headerHeight: 160,
      title: 'Bingo del Bosque',
      subtitle: 'Conexión con la Naturaleza'
    },
    {
      id: 'pastel',
      name: 'Pastel Suave 🌸',
      primaryColor: '#f472b6',
      accentColor: '#38bdf8',
      backgroundColor: '#fffafc',
      themeName: 'pastel' as const,
      cardTheme: 'light' as const,
      markerEmoji: '🌸',
      soundTheme: 'classic' as const,
      headerHeight: 160,
      title: 'Bingo Suave',
      subtitle: 'Divertido y Relajado'
    }
  ];

  const lastActiveGameIdRef = useRef<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameDoc = snapshot.docs[0];
        const gData = { id: gameDoc.id, ...gameDoc.data() } as BingoGame;
        setActiveGame(gData);
        
        // Sync states SÓLO si es la carga inicial o si cambió el ID del juego activo
        if (lastActiveGameIdRef.current !== gData.id) {
          lastActiveGameIdRef.current = gData.id;
          setGameTitle(gData.title);
          if (gData.customization) {
            setHeaderImage(gData.customization.headerImage || '');
            setPrimaryColor(gData.customization.primaryColor || '#a855f7');
            setAccentColor(gData.customization.accentColor || '#ec4899');
            setBackgroundColor(gData.customization.backgroundColor || '#fbf9ff');
            setThemeName(gData.customization.themeName || 'classic');
            setMarkerEmoji(gData.customization.markerEmoji || '⭐');
            setNumberToImageMap(gData.customization.numberToImageMap || {});
            
            setCustomTitle(gData.customization.title || 'Bingo Virtual');
            setCustomSubtitle(gData.customization.subtitle || 'Editorial Lluvia de Ideas');
            const hh = gData.customization.headerHeight || 160;
            setHeaderHeight(hh);
            setSelectedHeightType([80, 120, 160, 200, 240].includes(hh) ? 'preset' : 'custom');
            setSoundTheme(gData.customization.soundTheme || 'classic');
            setCardTheme(gData.customization.cardTheme || 'classic');

            // Sync sponsors
            setSponsorActive(gData.customization.sponsorConfig?.active || false);
            setSponsorInterval(gData.customization.sponsorConfig?.interval || 5);
            setSponsorMode(gData.customization.sponsorConfig?.mode || 'modal');
            setSponsorAudioAnnounce(gData.customization.sponsorConfig?.audioAnnounce || false);
            setSponsorsList(gData.customization.sponsors || []);
          } else {
            setHeaderImage('');
            setPrimaryColor('#a855f7');
            setAccentColor('#ec4899');
            setBackgroundColor('#fbf9ff');
            setThemeName('classic');
            setMarkerEmoji('⭐');
            setNumberToImageMap({});
            setCustomTitle('Bingo Virtual');
            setCustomSubtitle('Editorial Lluvia de Ideas');
            setHeaderHeight(160);
            setSelectedHeightType('preset');
            setSoundTheme('classic');
            setCardTheme('classic');

            // Reset sponsors
            setSponsorActive(false);
            setSponsorInterval(5);
            setSponsorMode('modal');
            setSponsorAudioAnnounce(false);
            setSponsorsList([]);
          }
          setWinningPattern(gData.winningPattern || 'full');
        } else {
          // Si el ID es el mismo, el juego activo en Firestore cambió (bolas cantadas, etc.)
          // Sincronizamos la lista de mapeos para que se mantenga al día, pero sin reescribir otros inputs de color
          if (gData.customization?.numberToImageMap) {
            setNumberToImageMap(gData.customization.numberToImageMap);
          }
        }
      } else {
        setActiveGame(null);
        lastActiveGameIdRef.current = null;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMappingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMappingVal(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSponsorLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSponsorLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSponsor = async () => {
    if (!newSponsorName.trim()) {
      await showAlert("Por favor escribe el nombre de la marca.", "Campos Requeridos", "🏷️");
      return;
    }
    if (!newSponsorLogo) {
      await showAlert("Por favor sube un logotipo para la marca.", "Campos Requeridos", "🖼️");
      return;
    }
    if (sponsorsList.length >= 10) {
      await showAlert("Has alcanzado el límite de 10 marcas patrocinadoras.", "Límite Excedido", "⚠️");
      return;
    }

    const newSponsor = {
      id: Date.now().toString(),
      name: newSponsorName.trim(),
      message: newSponsorMessage.trim(),
      logo: newSponsorLogo
    };

    setSponsorsList([...sponsorsList, newSponsor]);
    setNewSponsorName('');
    setNewSponsorMessage('');
    setNewSponsorLogo('');

    const fileInput = document.getElementById('sponsor-logo-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeSponsor = (id: string) => {
    setSponsorsList(sponsorsList.filter(s => s.id !== id));
  };

  const addMapping = async () => {
    if (!mappingLabel.trim()) {
      await showAlert("Por favor agrega una etiqueta para la figura.", "Campos Requeridos", "🏷️");
      return;
    }
    const updatedMap = {
      ...numberToImageMap,
      [mappingNum]: {
        type: mappingType,
        value: mappingVal,
        label: mappingLabel.trim()
      }
    };
    setNumberToImageMap(updatedMap);

    if (activeGame) {
      try {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
          'customization.numberToImageMap': updatedMap
        });
      } catch (err) {
        console.error("Error al guardar mapeo en Firestore:", err);
      }
    }
  };

  const removeMapping = async (num: number) => {
    const updatedMap = { ...numberToImageMap };
    delete updatedMap[num];
    setNumberToImageMap(updatedMap);

    if (activeGame) {
      try {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
          'customization.numberToImageMap': updatedMap
        });
      } catch (err) {
        console.error("Error al eliminar mapeo en Firestore:", err);
      }
    }
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setPrimaryColor(preset.primaryColor);
    setAccentColor(preset.accentColor);
    setBackgroundColor(preset.backgroundColor);
    setThemeName(preset.themeName);
    setCardTheme(preset.cardTheme);
    setMarkerEmoji(preset.markerEmoji);
    setSoundTheme(preset.soundTheme);
    setHeaderHeight(preset.headerHeight);
    setSelectedHeightType('preset');
    setCustomTitle(preset.title);
    setCustomSubtitle(preset.subtitle);
  };

  const restoreToDefaults = async () => {
    const confirm = await showConfirm(
      '¿Estás seguro de que deseas restaurar la configuración visual y de temas por defecto del Bingo? Esto también borrará los mapeos de figuras personalizados.',
      'Restaurar Valores',
      '⚠️',
      'SÍ, RESTAURAR',
      'CANCELAR'
    );
    if (confirm) {
      setGameTitle('Gran Bingo Familiar');
      setHeaderImage('');
      setPrimaryColor('#a855f7');
      setAccentColor('#ec4899');
      setBackgroundColor('#fbf9ff');
      setThemeName('classic');
      setMarkerEmoji('⭐');
      setCustomTitle('Bingo Virtual');
      setCustomSubtitle('Editorial Lluvia de Ideas');
      setHeaderHeight(160);
      setSelectedHeightType('preset');
      setSoundTheme('classic');
      setCardTheme('classic');
      setWinningPattern('full');
      setNumberToImageMap({});
      
      // Reset sponsors
      setSponsorActive(false);
      setSponsorInterval(5);
      setSponsorMode('modal');
      setSponsorAudioAnnounce(false);
      setSponsorsList([]);
      
      await showAlert('Configuración restaurada a valores clásicos predeterminados. Recuerda guardar para aplicar en base de datos.', 'Restauración Exitosa', '🔄');
    }
  };

  const isCellHighlightedInPattern = (r: number, c: number, pattern: string) => {
    if (pattern === 'full') return true;
    if (pattern === 'four_corners') {
      return (r === 0 || r === 4) && (c === 0 || c === 4);
    }
    if (pattern === 'diagonal') {
      return r === c || r + c === 4;
    }
    if (pattern === 'line') {
      return r === 2 || c === 2;
    }
    return false;
  };

  const playVoiceDemo = async () => {
    if (!('speechSynthesis' in window)) {
      await showAlert("Tu navegador no soporta síntesis de voz.", "Función No Soportada", "🔊");
      return;
    }
    window.speechSynthesis.cancel();
    
    let letter = 'B';
    const ball = 15;
    const utterance = new SpeechSynthesisUtterance(`Letra ${letter}... número ${ball}`);
    
    // Fallback search for Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    } else {
      utterance.lang = 'es-ES';
    }

    if (soundTheme === 'cyberpunk') {
      utterance.pitch = 0.2;
      utterance.rate = 1.2;
    } else if (soundTheme === 'retro') {
      utterance.pitch = 1.8;
      utterance.rate = 1.3;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.9;
    }

    window.speechSynthesis.speak(utterance);
  };

  const getCustomizationObject = (): BingoCustomization => ({
    headerImage,
    headerHeight,
    title: customTitle,
    subtitle: customSubtitle,
    primaryColor,
    accentColor,
    backgroundColor,
    themeName,
    markerEmoji,
    numberToImageMap,
    soundTheme,
    cardTheme,
    sponsorConfig: {
      active: sponsorActive,
      interval: sponsorInterval,
      mode: sponsorMode,
      audioAnnounce: sponsorAudioAnnounce
    },
    sponsors: sponsorsList
  });

  const saveCustomization = async () => {
    if (!activeGame) return;
    try {
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        title: gameTitle,
        winningPattern: winningPattern,
        customization: getCustomizationObject()
      });
      await showAlert("¡Configuración visual y de juego guardada! 🎉", "Guardado Exitoso", "💾");
    } catch (err) {
      console.error(err);
      await showAlert("Error al actualizar la personalización.", "Error", "❌");
    }
  };

  const createNewGame = async () => {
    try {
      if (activeGame) {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), { active: false, status: 'finished' });
      }
      
      await addDoc(collection(db, 'bingo_games'), {
        title: gameTitle,
        status: 'waiting',
        drawnNumbers: [],
        winningPattern: winningPattern,
        createdAt: Date.now(),
        active: true,
        customization: getCustomizationObject()
      });
      await showAlert("¡Bingo creado! La tómbola y la configuración ya están disponibles en Juegos Interactivos.", "Juego Creado", "🚀");
    } catch (err) {
      console.error(err);
      await showAlert("Error al crear el juego.", "Error", "❌");
    }
  };

  if (loading) return <div className="admin-tab-content"><div className="spinner"></div></div>;

  return (
    <div className="admin-tab-content animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="admin-header-row">
        <h2>Personalización de Tómbola & Cartones</h2>
        <span className="badge badge-success">Bingo Masivo Creator</span>
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
        Personaliza los temas visuales del Bingo virtual, define mapeos de números a figuras e imágenes del dispositivo, y configura efectos de voz de la tómbola.
      </p>

      {/* Sub-tabs Navigation */}
      <div className="admin-subtabs-navigation" style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.45)',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        <button 
          type="button"
          onClick={() => setSubTab('aspecto')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'aspecto' ? primaryColor : 'transparent',
            color: subTab === 'aspecto' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'aspecto' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'aspecto' ? 1 : 0.8
          }}
        >
          🎨 Aspecto y Temas
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('colores')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'colores' ? primaryColor : 'transparent',
            color: subTab === 'colores' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'colores' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'colores' ? 1 : 0.8
          }}
        >
          🌈 Colores en Vivo
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('figuras')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'figuras' ? primaryColor : 'transparent',
            color: subTab === 'figuras' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'figuras' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'figuras' ? 1 : 0.8
          }}
        >
          🏷️ Figuras de Cartón ({Object.keys(numberToImageMap).length})
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('presets')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'presets' ? primaryColor : 'transparent',
            color: subTab === 'presets' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'presets' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'presets' ? 1 : 0.8
          }}
        >
          🔄 Presets & Reset
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('marcas')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'marcas' ? primaryColor : 'transparent',
            color: subTab === 'marcas' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'marcas' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'marcas' ? 1 : 0.8
          }}
        >
          📢 Marcas Patrocinadoras ({sponsorsList.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="admin-tab-panels" style={{ width: '100%' }}>
        
        {/* SUBTAB 1: ASPECTO Y TEMAS */}
        {subTab === 'aspecto' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            
            {/* Left: Input Form Controls */}
            <div className="admin-card card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎨</span> Estructura y Textos de Sesión
              </h3>
              
              <div className="admin-form-group">
                <label>Título de Sesión (Uso Administrativo)</label>
                <input 
                  type="text" 
                  value={gameTitle} 
                  onChange={e => setGameTitle(e.target.value)} 
                  placeholder="Ej: Gran Bingo Familiar"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Título de Tómbola</label>
                  <input 
                    type="text" 
                    value={customTitle} 
                    onChange={e => setCustomTitle(e.target.value)} 
                    placeholder="Ej: Bingo Virtual"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Subtítulo de Tómbola</label>
                  <input 
                    type="text" 
                    value={customSubtitle} 
                    onChange={e => setCustomSubtitle(e.target.value)} 
                    placeholder="Ej: Editorial Lluvia de Ideas"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Imagen de Cabecera (Banner)</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '1.8rem' }}>🖼️</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carga una imagen horizontal para el banner</span>
                  <input 
                    type="file" 
                    id="header-banner-upload-input"
                    accept="image/*" 
                    onChange={handleHeaderUpload} 
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => document.getElementById('header-banner-upload-input')?.click()}
                  >
                    Examinar Archivos
                  </button>
                </div>
              </div>

              {/* Banner Height Section */}
              <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '8px' }}>Altura del Banner</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {HEIGHT_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setHeaderHeight(preset.value);
                        setSelectedHeightType('preset');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: selectedHeightType === 'preset' && headerHeight === preset.value ? primaryColor : 'white',
                        color: selectedHeightType === 'preset' && headerHeight === preset.value ? getTextColorForBg(primaryColor) : 'var(--text-title)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {preset.label.split(' ')[0]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedHeightType('custom')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: selectedHeightType === 'custom' ? primaryColor : 'white',
                      color: selectedHeightType === 'custom' ? getTextColorForBg(primaryColor) : 'var(--text-title)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    ⚙️ Rango Libre
                  </button>
                </div>

                {selectedHeightType === 'custom' && (
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="80"
                      max="400"
                      value={headerHeight}
                      onChange={e => setHeaderHeight(Math.max(80, Math.min(400, parseInt(e.target.value) || 160)))}
                      style={{ flex: 1, accentColor: primaryColor }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min="80"
                        max="400"
                        value={headerHeight}
                        onChange={e => setHeaderHeight(Math.max(80, Math.min(400, parseInt(e.target.value) || 160)))}
                        style={{ width: '70px', textAlign: 'center', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>px</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right: Mockup & Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Mockup del Banner */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 8px 24px rgba(74, 21, 128, 0.05)',
                height: 'fit-content'
              }}>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👀</span> Previsualización en Vivo de Cabecera
                  </span>
                  <span style={{ fontSize: '0.7rem', color: primaryColor, background: `${primaryColor}15`, padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {headerHeight}px
                  </span>
                </div>
                
                <div style={{
                  position: 'relative',
                  height: `${headerHeight}px`,
                  maxHeight: '220px',
                  overflow: 'hidden',
                  background: headerImage ? `url(${headerImage}) center/cover no-repeat` : 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  minHeight: '80px'
                }}>
                  {/* Banner Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.45)',
                    zIndex: 1
                  }} />
                  {headerImage && (
                    <button 
                      type="button"
                      onClick={() => setHeaderImage('')} 
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 3 }}
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  )}
                  <h1 style={{
                    color: 'white',
                    fontSize: headerHeight < 120 ? '1.15rem' : '1.6rem',
                    margin: 0,
                    zIndex: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontFamily: 'var(--font-headline)'
                  }}>
                    {customTitle || 'Bingo Virtual'}
                  </h1>
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: headerHeight < 120 ? '0.7rem' : '0.85rem',
                    margin: '4px 0 0 0',
                    zIndex: 2,
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                  }}>
                    {customSubtitle || 'Editorial Lluvia de Ideas'}
                  </p>
                </div>
              </div>

              {/* Fichas de Marcado & Estilos de Juego */}
              <div className="admin-card card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⭐</span> Sello & Locución
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', alignItems: 'center' }}>
                  
                  {/* Selector de Ficha */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)' }}>Emojis Rápidos</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                      {MARKER_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setMarkerEmoji(opt)}
                          style={{
                            padding: '6px',
                            fontSize: '1.1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: markerEmoji === opt ? primaryColor : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: markerEmoji === opt ? `0 2px 6px ${primaryColor}44` : 'none'
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    
                    <input
                      type="text"
                      value={MARKER_OPTIONS.includes(markerEmoji) ? '' : markerEmoji}
                      onChange={e => {
                        const val = e.target.value.trim();
                        setMarkerEmoji(val || '⭐');
                      }}
                      placeholder="Emoji personalizado..."
                      style={{ fontSize: '0.8rem', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%' }}
                      maxLength={2}
                    />
                  </div>

                  {/* Previsualización de Celda */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', minHeight: '120px', justifyContent: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: primaryColor,
                      color: getTextColorForBg(primaryColor),
                      border: `2px solid ${accentColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      position: 'relative',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      37
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        opacity: 0.45,
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.35))'
                      }}>
                        {markerEmoji}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                      Sello de Cartón
                    </span>
                  </div>

                </div>

                {/* Patrón de Victoria */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="admin-form-group">
                    <label>Patrón para ganar la partida</label>
                    <select value={winningPattern} onChange={e => setWinningPattern(e.target.value)} style={{ padding: '10px 12px' }}>
                      <option value="full">🏆 Cartón Lleno (24 números)</option>
                      <option value="line">📏 Cualquier Línea (Horizontal o Vertical)</option>
                      <option value="diagonal">❌ Diagonales (Forma de X)</option>
                      <option value="four_corners">📐 Cuatro Esquinas (Extremos)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '2px',
                      width: '65px',
                      height: '65px',
                      background: 'white',
                      padding: '4px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}>
                      {Array(5).fill(null).map((_, r) =>
                        Array(5).fill(null).map((_, c) => {
                          const isHighlighted = isCellHighlightedInPattern(r, c, winningPattern);
                          const isCenter = r === 2 && c === 2;
                          return (
                            <div
                              key={`${r}-${c}`}
                              style={{
                                borderRadius: '1.5px',
                                background: isCenter ? accentColor : isHighlighted ? primaryColor : '#cbd5e1',
                                opacity: isCenter ? 1 : isHighlighted ? 0.9 : 0.2,
                                aspectRatio: '1/1'
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', color: 'var(--text-title)' }}>Guía del Patrón de Victoria</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Celdas que los jugadores deben completar para reclamar la victoria.</span>
                    </div>
                  </div>
                </div>

                {/* Selector de Voces */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="admin-form-group">
                    <label>Tema del Anunciador de Voz</label>
                    <select value={soundTheme} onChange={e => setSoundTheme(e.target.value as any)} style={{ padding: '10px 12px' }}>
                      <option value="classic">🗣️ Español Clásico</option>
                      <option value="cyberpunk">👾 Gamer Synthwave</option>
                      <option value="retro">🕹️ Arcade Retro</option>
                      <option value="none">🔇 Anunciador Apagado</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={playVoiceDemo}
                    disabled={soundTheme === 'none'}
                    className="btn btn-secondary btn-sm"
                    style={{
                      padding: '10px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      opacity: soundTheme === 'none' ? 0.5 : 1
                    }}
                  >
                    🔊 Probar Voz en Vivo
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 2: PALETA DE COLORES */}
        {subTab === 'colores' && (
          <div className="admin-card card-glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌈</span> Paleta de Colores Dinámicos
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Personaliza los colores que se aplicarán automáticamente a los fondos, botones y acentos del Bingo y la Tómbola.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              
              {/* Primary Color Widget */}
              <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor }} />
                  Color Principal
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)} 
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', border: 'none', cursor: 'pointer' }}
                    />
                  </div>
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={e => setPrimaryColor(e.target.value)} 
                    style={{ flex: 1, textTransform: 'uppercase', padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                </div>
              </div>

              {/* Accent Color Widget */}
              <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accentColor }} />
                  Color de Acento
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={e => setAccentColor(e.target.value)} 
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', border: 'none', cursor: 'pointer' }}
                    />
                  </div>
                  <input 
                    type="text" 
                    value={accentColor} 
                    onChange={e => setAccentColor(e.target.value)} 
                    style={{ flex: 1, textTransform: 'uppercase', padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                </div>
              </div>

              {/* Background Color Widget */}
              <div className="admin-form-group" style={{ background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: backgroundColor }} />
                  Color de Fondo
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    <input 
                      type="color" 
                      value={backgroundColor} 
                      onChange={e => setBackgroundColor(e.target.value)} 
                      style={{ position: 'absolute', top: '-10px', left: '-10px', width: '60px', height: '60px', border: 'none', cursor: 'pointer' }}
                    />
                  </div>
                  <input 
                    type="text" 
                    value={backgroundColor} 
                    onChange={e => setBackgroundColor(e.target.value)} 
                    style={{ flex: 1, textTransform: 'uppercase', padding: '10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                </div>
              </div>

            </div>

            {/* Live Palette Preview Box */}
            <div style={{
              padding: '24px',
              borderRadius: '20px',
              background: backgroundColor,
              border: '1px solid var(--border-color)',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isBgLight(backgroundColor) ? 'var(--text-title)' : '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Previsualización de Paleta Activa:
              </span>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: primaryColor, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} title="Color Principal" />
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: accentColor, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} title="Color de Acento" />
                </div>
                <div style={{ flex: 1, minWidth: '120px', padding: '10px 15px', borderRadius: '10px', background: primaryColor, color: getTextColorForBg(primaryColor), textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: `0 4px 12px ${primaryColor}33` }}>
                  Botón Primario
                </div>
                <div style={{ flex: 1, minWidth: '120px', padding: '10px 15px', borderRadius: '10px', background: accentColor, color: getTextColorForBg(accentColor), textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: `0 4px 12px ${accentColor}33` }}>
                  Botón Acento
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: FIGURAS DE CARTÓN (MAPEO) */}
        {subTab === 'figuras' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            
            {/* Left: Create Mapping */}
            <div className="admin-card card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏷️</span> Crear Mapeo de Números
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="admin-form-group">
                  <label>Número (1-75)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="75" 
                    value={mappingNum} 
                    onChange={e => setMappingNum(Math.max(1, Math.min(75, parseInt(e.target.value) || 1)))} 
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tipo de Figura</label>
                  <select 
                    value={mappingType} 
                    onChange={e => {
                      setMappingType(e.target.value as any);
                      if (e.target.value === 'emoji') {
                        setMappingVal('🌳');
                      } else {
                        setMappingVal('');
                      }
                    }} 
                  >
                    <option value="emoji">Emoji Predefinido</option>
                    <option value="image">Imagen de Dispositivo</option>
                  </select>
                </div>
              </div>

              {mappingType === 'emoji' ? (
                <div className="admin-form-group">
                  <label>Selecciona un Emoji Rápido</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {PRESETS_MAP.map(p => (
                      <button 
                        key={p.label} 
                        type="button" 
                        onClick={() => {
                          setMappingVal(p.value);
                          setMappingLabel(p.label);
                        }} 
                        style={{
                          padding: '5px 12px',
                          background: mappingVal === p.value ? primaryColor : 'white',
                          color: mappingVal === p.value ? getTextColorForBg(primaryColor) : 'var(--text-title)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                          boxShadow: mappingVal === p.value ? `0 2px 8px ${primaryColor}44` : 'none'
                        }}
                      >
                        {p.value} {p.label}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={mappingVal} 
                    onChange={e => setMappingVal(e.target.value)} 
                    placeholder="O escribe tu propio emoji aquí..."
                  />
                </div>
              ) : (
                <div className="admin-form-group">
                  <label>Subir Imagen Pequeña (Aprox. 48x48px)</label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '16px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.3)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {mappingVal && mappingType === 'image' ? (
                      <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img src={mappingVal} alt="Mini Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    )}
                    <input 
                      type="file" 
                      id="mapping-image-upload-input"
                      accept="image/*" 
                      onChange={handleMappingImageUpload} 
                      style={{ display: 'none' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => document.getElementById('mapping-image-upload-input')?.click()}
                    >
                      Seleccionar Imagen
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-form-group">
                <label>Nombre de la figura (Para cantar la bola)</label>
                <input 
                  type="text" 
                  value={mappingLabel} 
                  onChange={e => setMappingLabel(e.target.value)} 
                  placeholder="Ej: Ceiba, Quetzal, Volcán..." 
                />
              </div>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={addMapping} 
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '10px' }}
              >
                Añadir Reemplazo de Número ➕
              </button>
            </div>

            {/* Right: Active Mappings List */}
            <div className="admin-card card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> Mapeos Activos ({Object.keys(numberToImageMap).length} de 75)
              </h3>
              
              <div className="mappings-list" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '5px'
              }}>
                {Object.keys(numberToImageMap).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                    No hay figuras mapeadas aún. Los cartones mostrarán solo números tradicionales.
                  </p>
                ) : (
                  Object.entries(numberToImageMap).map(([num, map]) => (
                    <div 
                      key={num} 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white',
                        padding: '12px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(74, 21, 128, 0.03)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = primaryColor}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <button 
                        type="button"
                        onClick={() => removeMapping(parseInt(num))} 
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        title="Eliminar mapeo"
                      >
                        ✕
                      </button>
                      <strong style={{ color: primaryColor, fontSize: '0.85rem', marginBottom: '4px' }}>Bola #{num}</strong>
                      <div style={{ margin: '4px 0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {map.type === 'emoji' ? (
                          <span style={{ fontSize: '1.8rem' }}>{map.value}</span>
                        ) : (
                          <img src={map.value} alt={map.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{map.label}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 4: PRESETS Y RESET */}
        {subTab === 'presets' && (
          <div className="admin-card card-glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔄</span> Presets de Temas y Restauración
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Carga configuraciones de diseño preestablecidas con un solo clic o restaura los valores por defecto del sistema.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginTop: '10px' }}>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={async () => {
                    applyPreset(preset);
                    await showAlert(`¡Preset "${preset.name}" cargado! Recuerda hacer clic en "Guardar Cambios Visuales" al final.`, "Preset Cargado", "🎨");
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    boxShadow: '0 4px 10px rgba(74, 21, 128, 0.03)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${preset.primaryColor}22`;
                    e.currentTarget.style.borderColor = preset.primaryColor;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(74, 21, 128, 0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <strong style={{ fontSize: '1rem', color: 'var(--text-title)', marginBottom: '4px' }}>{preset.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>"{preset.title}"</span>
                  
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.primaryColor, border: '1px solid #e2e8f0' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.accentColor, border: '1px solid #e2e8f0' }} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.backgroundColor, border: '1px solid #e2e8f0' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>{preset.themeName}</span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, color: 'var(--danger)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span> Zona de Emergencia / Reseteo
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                ¿Los colores elegidos no son legibles? Utiliza esta opción para restablecer la configuración clásica de fábrica inmediatamente.
              </p>
              
              <button 
                type="button"
                onClick={restoreToDefaults}
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1.5px dashed var(--danger)',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  marginTop: '5px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--danger)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                  e.currentTarget.style.color = 'var(--danger)';
                }}
              >
                Restaurar Estilos Clásicos de Fábrica 🔄
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 5: MARCAS / PATROCINADORES */}
        {subTab === 'marcas' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            
            {/* Left: General Config */}
            <div className="admin-card card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📢</span> Publicidad y Patrocinios
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-title)' }}>Activar Publicidad</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Muestra marcas durante el juego</span>
                </div>
                <label className="cyber-switch">
                  <input 
                    type="checkbox" 
                    checked={sponsorActive} 
                    onChange={e => setSponsorActive(e.target.checked)} 
                  />
                  <span className="cyber-slider"></span>
                </label>
              </div>

              <div className="admin-form-group">
                <label>Frecuencia de Aparición (Bolas)</label>
                <select 
                  value={sponsorInterval} 
                  onChange={e => setSponsorInterval(parseInt(e.target.value))} 
                  disabled={!sponsorActive}
                >
                  <option value={3}>Cada 3 bolas cantadas</option>
                  <option value={5}>Cada 5 bolas cantadas (Recomendado)</option>
                  <option value={8}>Cada 8 bolas cantadas</option>
                  <option value={10}>Cada 10 bolas cantadas</option>
                  <option value={15}>Cada 15 bolas cantadas</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Modo de Exposición</label>
                <select 
                  value={sponsorMode} 
                  onChange={e => setSponsorMode(e.target.value as any)} 
                  disabled={!sponsorActive}
                >
                  <option value="modal">💥 Modal Emergente de 4s (Gran Visibilidad)</option>
                  <option value="integrated">🔮 Integrado en el Holograma (Sutil)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-title)' }}>Locución por Voz</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Menciona el patrocinador al cantar</span>
                </div>
                <label className="cyber-switch">
                  <input 
                    type="checkbox" 
                    checked={sponsorAudioAnnounce} 
                    onChange={e => setSponsorAudioAnnounce(e.target.checked)} 
                    disabled={!sponsorActive}
                  />
                  <span className="cyber-slider"></span>
                </label>
              </div>
            </div>

            {/* Middle/Right: Add and View Brands */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Add Sponsor Form */}
              <div className="admin-card card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>➕</span> Registrar Patrocinador ({sponsorsList.length}/10)
                </h3>

                <div className="admin-form-group">
                  <label>Nombre de la Marca</label>
                  <input 
                    type="text" 
                    value={newSponsorName} 
                    onChange={e => setNewSponsorName(e.target.value)} 
                    placeholder="Ej: Pepsi, Editorial Lluvia"
                    maxLength={30}
                    disabled={sponsorsList.length >= 10}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Eslogan o Mensaje Corto (Opcional)</label>
                  <input 
                    type="text" 
                    value={newSponsorMessage} 
                    onChange={e => setNewSponsorMessage(e.target.value)} 
                    placeholder="Ej: ¡El sabor del juego!"
                    maxLength={50}
                    disabled={sponsorsList.length >= 10}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Logotipo de la Marca</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {newSponsorLogo ? (
                      <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img src={newSponsorLogo} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>📢</div>
                    )}
                    <input 
                      type="file" 
                      id="new-sponsor-logo-upload"
                      accept="image/*" 
                      onChange={handleSponsorLogoUpload} 
                      style={{ display: 'none' }}
                      disabled={sponsorsList.length >= 10}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => document.getElementById('new-sponsor-logo-upload')?.click()}
                      style={{ flex: 1 }}
                      disabled={sponsorsList.length >= 10}
                    >
                      Subir Logotipo
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={addSponsor} 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '0.85rem' }}
                  disabled={sponsorsList.length >= 10}
                >
                  Agregar Patrocinador al Listado ➕
                </button>
              </div>

              {/* Registered Sponsors List */}
              <div className="admin-card card-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span> Marcas Registradas ({sponsorsList.length})
                </h3>

                {sponsorsList.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', margin: '15px 0' }}>
                    No hay patrocinadores registrados. Carga marcas para habilitar la publicidad en el juego.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {sponsorsList.map((sponsor, index) => (
                      <div 
                        key={sponsor.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          background: 'white', 
                          padding: '10px', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border-color)', 
                          position: 'relative' 
                        }}
                      >
                        <button 
                          type="button"
                          onClick={() => removeSponsor(sponsor.id)} 
                          style={{ position: 'absolute', top: '4px', right: '6px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                        
                        <div style={{ width: '36px', height: '36px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={sponsor.logo} alt={sponsor.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.65rem', color: primaryColor, fontWeight: 'bold', display: 'block' }}># {index + 1}</span>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--text-title)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sponsor.name}
                          </strong>
                          {sponsor.message && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{sponsor.message}"
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Global save / create bar */}
      <div style={{ marginTop: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '15px' }}>
        {activeGame ? (
          <button type="button" className="btn btn-primary" onClick={saveCustomization} style={{ flex: 1, padding: '14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Guardar Cambios Visuales 💾
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-large" onClick={createNewGame} style={{ flex: 1, padding: '14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Crear Bingo y Aplicar Estilos 🚀
          </button>
        )}
      </div>

      {/* Custom Alert/Confirm Modal */}
      {dialogConfig?.isOpen && createPortal(
        <div className="player-modal-overlay" style={{ zIndex: 999999 }} onClick={() => {
          if (dialogConfig.type === 'alert' && dialogConfig.onConfirm) {
            dialogConfig.onConfirm();
          } else if (dialogConfig.type === 'confirm' && dialogConfig.onCancel) {
            dialogConfig.onCancel();
          }
        }}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()} style={{ 
            borderColor: primaryColor || 'var(--cyber-primary)',
            boxShadow: `0 0 25px ${(primaryColor || '#a855f7')}55`
          }}>
            <span className="player-modal-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>
              {dialogConfig.icon}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-gamer)', color: '#fff', marginBottom: '12px' }}>
              {dialogConfig.title}
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '20px', color: '#e2dbf0' }}>
              {dialogConfig.message}
            </p>
            <div className="player-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {dialogConfig.type === 'confirm' && (
                <button
                  className="btn-modal-cancel"
                  onClick={dialogConfig.onCancel}
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  {dialogConfig.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={dialogConfig.onConfirm}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  fontSize: '0.85rem', 
                  background: primaryColor || 'var(--cyber-primary)', 
                  borderRadius: '10px',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {dialogConfig.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

