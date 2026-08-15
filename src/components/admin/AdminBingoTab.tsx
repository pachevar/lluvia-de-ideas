import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { collection, doc, addDoc, updateDoc, setDoc, deleteDoc, writeBatch, onSnapshot, query, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';
import type { BingoGame, BingoCustomization, BingoPrize, BingoPromoter, Sponsor, BingoCard } from '../../types';
import '../games/Bingo.css';

interface GeneratedCode {
  id: string;
  code?: string;
  used?: boolean;
  usedByPlayer?: string;
  usedByCardId?: string;
  gameId?: string;
  createdAt?: number;
}

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
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>([]);

  // New Sponsor Form States
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorMessage, setNewSponsorMessage] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');

  // Access Config States
  const [accessMode, setAccessMode] = useState<'free' | 'code'>('free');
  const [massiveMode, setMassiveMode] = useState(false);
  const [fieldPhoneEnabled, setFieldPhoneEnabled] = useState(false);
  const [fieldPhoneRequired, setFieldPhoneRequired] = useState(false);
  const [fieldLocationEnabled, setFieldLocationEnabled] = useState(false);
  const [fieldLocationRequired, setFieldLocationRequired] = useState(false);

  // Payment Info States
  const [sinpeNumber, setSinpeNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  // Activation Codes Manager States
  const [generateCount, setGenerateCount] = useState(20);
  const [generatedCodesList, setGeneratedCodesList] = useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Prizes Gallery Manager States
  const [prizesList, setPrizesList] = useState<BingoPrize[]>([]);
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newPrizeDesc, setNewPrizeDesc] = useState('');
  const [newPrizeImage, setNewPrizeImage] = useState('');
  const [newPrizeCategory, setNewPrizeCategory] = useState('');
  const [newPrizeOrder, setNewPrizeOrder] = useState<number>(1);
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);

  // Sub-tabs State
  const [subTab, setSubTab] = useState<'aspecto' | 'colores' | 'figuras' | 'presets' | 'marcas' | 'codigos' | 'premios' | 'promotores'>('aspecto');

  // Promotores State
  const [promotersList, setPromotersList] = useState<BingoPromoter[]>([]);
  const [registeredCardsList, setRegisteredCardsList] = useState<BingoCard[]>([]);
  const [newPromoterCode, setNewPromoterCode] = useState('');
  const [newPromoterName, setNewPromoterName] = useState('');
  const [newPromoterContact, setNewPromoterContact] = useState('');
  const [newPromoterCommission, setNewPromoterCommission] = useState<number | ''>('');

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

            // Sync sponsors & prizes
            setSponsorActive(gData.customization.sponsorConfig?.active || false);
            setSponsorInterval(gData.customization.sponsorConfig?.interval || 5);
            setSponsorMode(gData.customization.sponsorConfig?.mode || 'modal');
            setSponsorAudioAnnounce(gData.customization.sponsorConfig?.audioAnnounce || false);
            setSponsorsList(gData.customization.sponsors || []);
            setPrizesList(gData.customization.prizes || []);

            // Sync access config & payment info
            const ac = gData.customization.accessConfig;
            setAccessMode(ac?.mode || 'free');
            setMassiveMode(ac?.massiveMode || false);
            setFieldPhoneEnabled(ac?.formFields?.phone?.enabled || false);
            setFieldPhoneRequired(ac?.formFields?.phone?.required || false);
            setFieldLocationEnabled(ac?.formFields?.location?.enabled || false);
            setFieldLocationRequired(ac?.formFields?.location?.required || false);

            setSinpeNumber(ac?.paymentInfo?.sinpeNumber || '');
            setBankAccount(ac?.paymentInfo?.bankAccount || '');
            setWhatsappNumber(ac?.paymentInfo?.whatsappNumber || '');
            setPaymentInstructions(ac?.paymentInfo?.paymentInstructions || '');
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

            // Reset access config & payment info
            setAccessMode('free');
            setFieldPhoneEnabled(false);
            setFieldPhoneRequired(false);
            setFieldLocationEnabled(false);
            setFieldLocationRequired(false);
            setSinpeNumber('');
            setBankAccount('');
            setWhatsappNumber('');
            setPaymentInstructions('');
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

  // Escuchar en tiempo real los códigos de activación vinculados a esta partida
  useEffect(() => {
    if (!activeGame) {
      setGeneratedCodesList([]);
      return;
    }
    const q = query(
      collection(db, 'bingo_codes'),
      where('gameId', '==', activeGame.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratedCode));
      // Ordenar por fecha de creación desc
      codes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setGeneratedCodesList(codes);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot subscription keyed by activeGame id only
  }, [activeGame?.id]);

  // Escuchar en tiempo real la lista de promotores de venta
  useEffect(() => {
    const q = query(collection(db, 'bingo_promoters'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BingoPromoter));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPromotersList(list);
    }, (err) => {
      console.warn("Promoters snapshot error:", err);
    });
    return () => unsub();
  }, []);

  // Escuchar cartones registrados para estadísticas de promotores
  useEffect(() => {
    const q = query(collection(db, 'bingo_cards'));
    const unsub = onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRegisteredCardsList(cards);
    }, (err) => {
      console.warn("Cards snapshot error:", err);
    });
    return () => unsub();
  }, []);

  const handleAddPromoter = async () => {
    const code = newPromoterCode.trim().toUpperCase();
    const name = newPromoterName.trim();
    if (!code || !name) {
      await showAlert("Por favor ingresa un código de promotor y el nombre del vendedor.", "Atención", "⚠️");
      return;
    }

    try {
      await setDoc(doc(db, 'bingo_promoters', code), {
        promoterName: name,
        contact: newPromoterContact.trim() || null,
        commission: typeof newPromoterCommission === 'number' ? newPromoterCommission : 0,
        createdAt: Date.now(),
        active: true
      });

      setNewPromoterCode('');
      setNewPromoterName('');
      setNewPromoterContact('');
      setNewPromoterCommission('');
      await showAlert(`Promotor ${name} (${code}) registrado con éxito.`, "Promotor Creado", "📢");
    } catch (err) {
      console.error(err);
      await showAlert("Error al registrar el promotor.", "Error", "❌");
    }
  };

  const handleTogglePromoterStatus = async (promoter: BingoPromoter) => {
    try {
      await updateDoc(doc(db, 'bingo_promoters', promoter.id), {
        active: !promoter.active
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePromoter = async (codeId: string, name: string) => {
    const confirm = await showConfirm(
      `¿Estás seguro de eliminar el código de promotor ${codeId} (${name})?`,
      "Eliminar Promotor",
      "🗑️"
    );
    if (confirm) {
      try {
        await deleteDoc(doc(db, 'bingo_promoters', codeId));
        await showAlert(`Promotor ${codeId} eliminado correctamente.`, "Eliminado", "🗑️");
      } catch (err) {
        console.error(err);
      }
    }
  };

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
    
    const letter = 'B';
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
    sponsors: sponsorsList,
    prizes: prizesList,
    accessConfig: {
      mode: accessMode,
      massiveMode: massiveMode,
      maxOverlapThreshold: massiveMode ? 10 : 8,
      formFields: {
        phone: { enabled: fieldPhoneEnabled, required: fieldPhoneRequired },
        location: { enabled: fieldLocationEnabled, required: fieldLocationRequired }
      },
      paymentInfo: {
        sinpeNumber,
        bankAccount,
        whatsappNumber,
        paymentInstructions
      }
    }
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

  const generateCodes = async () => {
    if (!activeGame) {
      await showAlert("No hay una partida activa para asociar códigos.", "Error", "❌");
      return;
    }
    if (generateCount < 1 || generateCount > 200) {
      await showAlert("La cantidad de códigos por lote debe ser entre 1 y 200.", "Error", "❌");
      return;
    }
    setIsGenerating(true);
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const batch = writeBatch(db);

      for (let i = 0; i < generateCount; i++) {
        // Generar código aleatorio único de 6 caracteres
        let code = '';
        for (let j = 0; j < 6; j++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Crear documento con el propio código como ID
        const codeRef = doc(db, 'bingo_codes', code);
        batch.set(codeRef, {
          code,
          gameId: activeGame.id,
          used: false,
          usedByCardId: null,
          usedByPlayer: null,
          usedAt: null,
          createdAt: Date.now()
        });
      }

      await batch.commit();
      await showAlert(`¡Se han generado ${generateCount} códigos únicos exitosamente! 🎉`, "Códigos Creados", "🎟️");
    } catch (err) {
      console.error(err);
      await showAlert("Error al generar códigos de activación.", "Error", "❌");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    const confirm = await showConfirm("¿Estás seguro de que deseas eliminar este código? Se invalidará de inmediato.", "Eliminar Código", "🗑️");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'bingo_codes', codeId));
      await showAlert("Código eliminado exitosamente.", "Código Eliminado", "🗑️");
    } catch (err) {
      console.error(err);
      await showAlert("Error al eliminar el código.", "Error", "❌");
    }
  };

  const clearAllCodes = async () => {
    if (generatedCodesList.length === 0) return;
    const confirm = await showConfirm("¿Estás seguro de que deseas eliminar TODOS los códigos de activación creados para esta partida? Esta acción no se puede deshacer.", "Limpiar Todos los Códigos", "⚠️");
    if (!confirm) return;
    
    setIsGenerating(true);
    try {
      const batch = writeBatch(db);
      generatedCodesList.forEach(c => {
        batch.delete(doc(db, 'bingo_codes', c.id));
      });
      await batch.commit();
      await showAlert("Todos los códigos han sido eliminados de la sesión.", "Códigos Limpios", "🧹");
    } catch (err) {
      console.error(err);
      await showAlert("Error al eliminar los códigos de la sesión.", "Error", "❌");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAvailableCodes = () => {
    const available = generatedCodesList.filter(c => !c.used).map(c => c.code);
    if (available.length === 0) {
      showAlert("No hay códigos disponibles para copiar.", "Copiar Códigos", "📢");
      return;
    }
    navigator.clipboard.writeText(available.join('\n'));
    showAlert("¡Códigos disponibles copiados al portapapeles! 📋", "Copiado", "📋");
  };

  const copyDirectLinkCode = (code: string) => {
    const directUrl = `${window.location.origin}/juegos/bingo?code=${code}`;
    navigator.clipboard.writeText(directUrl);
    showAlert(`¡Enlace directo con código ${code} copiado! 🔗\n\nPuedes enviarlo por WhatsApp para que el participante entre directo.`, "Enlace Copiado", "🔗");
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
        <button 
          type="button"
          onClick={() => setSubTab('codigos')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'codigos' ? primaryColor : 'transparent',
            color: subTab === 'codigos' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'codigos' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'codigos' ? 1 : 0.8
          }}
        >
          🎟️ Acceso y Códigos ({generatedCodesList.filter(c => !c.used).length} Libres)
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('premios')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'premios' ? primaryColor : 'transparent',
            color: subTab === 'premios' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'premios' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'premios' ? 1 : 0.8
          }}
        >
          🎁 Galería de Premios ({prizesList.length})
        </button>
        <button 
          type="button"
          onClick={() => setSubTab('promotores')}
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'promotores' ? primaryColor : 'transparent',
            color: subTab === 'promotores' ? getTextColorForBg(primaryColor) : 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            boxShadow: subTab === 'promotores' ? `0 4px 12px ${primaryColor}44` : 'none',
            opacity: subTab === 'promotores' ? 1 : 0.8
          }}
        >
          📢 Promotores de Venta ({promotersList.length})
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
                    <label>Patrón para ganar la partida (Modo de Juego)</label>
                    <select value={winningPattern} onChange={e => setWinningPattern(e.target.value)} style={{ padding: '10px 12px', fontWeight: 'bold' }}>
                      <option value="line">🥇 Línea Horizontal o Vertical (¡Juego Rápido ~ 10 a 18 bolas!)</option>
                      <option value="four_corners">📐 Cuatro Esquinas (Juego Medio ~ 12 a 20 bolas)</option>
                      <option value="diagonal">❌ Diagonales en X (Juego Medio ~ 12 a 25 bolas)</option>
                      <option value="full">🏆 Cartón Lleno - 24 números (Partida Completa ~ 50 a 70 bolas)</option>
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
                    <select value={soundTheme} onChange={e => setSoundTheme(e.target.value as BingoCustomization['soundTheme'])} style={{ padding: '10px 12px' }}>
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
                      setMappingType(e.target.value as 'emoji' | 'image');
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
                  onChange={e => setSponsorMode(e.target.value as 'integrated' | 'modal')} 
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

        {subTab === 'codigos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', animation: 'fadeIn 0.3s ease' }}>
            {/* Columna Izquierda: Configuración de Acceso y Formulario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔒</span> Modo de Acceso al Bingo
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  Define si la generación de cartones será completamente gratuita o requerirá un código de activación único generado por ti.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: `2px solid ${accessMode === 'free' ? primaryColor : 'var(--border-color)'}`,
                    background: accessMode === 'free' ? `${primaryColor}08` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="accessMode" 
                      value="free" 
                      checked={accessMode === 'free'}
                      onChange={() => setAccessMode('free')}
                      style={{ accentColor: primaryColor }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-title)' }}>🟢 Modo Gratis (Abierto)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cualquier participante puede crear un cartón solo ingresando su Nickname.</span>
                    </div>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: `2px solid ${accessMode === 'code' ? primaryColor : 'var(--border-color)'}`,
                    background: accessMode === 'code' ? `${primaryColor}08` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="accessMode" 
                      value="code" 
                      checked={accessMode === 'code'}
                      onChange={() => setAccessMode('code')}
                      style={{ accentColor: primaryColor }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-title)' }}>🔴 Modo Privativo (Código de Activación)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>El jugador debe ingresar un código único y válido para generar su cartón.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tarjeta de Escala y Capacidad Masiva */}
              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚀</span> Capacidad y Escala de la Partida
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  Ajusta el rendimiento del motor anticolisión según la cantidad proyectada de jugadores simultáneos en tu evento.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: `2px solid ${!massiveMode ? primaryColor : 'var(--border-color)'}`,
                    background: !massiveMode ? `${primaryColor}08` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="massiveMode" 
                      value="standard" 
                      checked={!massiveMode}
                      onChange={() => setMassiveMode(false)}
                      style={{ accentColor: primaryColor, marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-title)' }}>🟢 Modo Estándar (Hasta 1,500 cartones)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.3' }}>
                        Dispersión máxima estricta (máximo 8 números en común). Ideal para juegos con coincidencia baja.
                      </span>
                    </div>
                  </label>

                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: `2px solid ${massiveMode ? primaryColor : 'var(--border-color)'}`,
                    background: massiveMode ? `${primaryColor}08` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="radio" 
                      name="massiveMode" 
                      value="massive" 
                      checked={massiveMode}
                      onChange={() => setMassiveMode(true)}
                      style={{ accentColor: primaryColor, marginTop: '3px' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-title)' }}>⚡ Modo Masivo (3,000+ a 10,000 cartones)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: '1.3' }}>
                        Generación ultrarrápida a gran escala (máximo 10 números en común, 14 números independientes). Diseñado para salas masivas en directo.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📋</span> Formulario de Registro del Participante
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  Configura qué información adicional capturarás al momento de que el usuario solicite un cartón.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {/* Nickname: Siempre habilitado y obligatorio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-title)' }}>Nickname de Juego</strong>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Identificación obligatoria del cartón.</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: primaryColor, fontWeight: 'bold', background: `${primaryColor}15`, padding: '3px 8px', borderRadius: '20px' }}>Siempre Activo</span>
                  </div>

                  {/* Teléfono */}
                  <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-title)' }}>Capturar Teléfono</strong>
                      <input 
                        type="checkbox" 
                        checked={fieldPhoneEnabled} 
                        onChange={(e) => {
                          setFieldPhoneEnabled(e.target.checked);
                          if (!e.target.checked) setFieldPhoneRequired(false);
                        }}
                        style={{ width: '18px', height: '18px', accentColor: primaryColor }}
                      />
                    </div>
                    {fieldPhoneEnabled && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={fieldPhoneRequired} 
                          onChange={(e) => setFieldPhoneRequired(e.target.checked)}
                          style={{ accentColor: primaryColor }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Marcar como Obligatorio (*)</span>
                      </label>
                    )}
                  </div>

                  {/* Lugar / Ubicación */}
                  <div style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-title)' }}>Capturar Lugar (Ubicación)</strong>
                      <input 
                        type="checkbox" 
                        checked={fieldLocationEnabled} 
                        onChange={(e) => {
                          setFieldLocationEnabled(e.target.checked);
                          if (!e.target.checked) setFieldLocationRequired(false);
                        }}
                        style={{ width: '18px', height: '18px', accentColor: primaryColor }}
                      />
                    </div>
                    {fieldLocationEnabled && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={fieldLocationRequired} 
                          onChange={(e) => setFieldLocationRequired(e.target.checked)}
                          style={{ accentColor: primaryColor }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Marcar como Obligatorio (*)</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Medios de Pago y Cobro (Configuración) */}
              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💳</span> Medios de Pago y Recaudo
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  Define las instrucciones de cobro que verá el jugador cuando solicite un cartón si no posee un código.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>Número SINPE Móvil:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 8888-8888 (A nombre de Editorial)" 
                      value={sinpeNumber}
                      onChange={(e) => setSinpeNumber(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>WhatsApp de Atención / Ventas:</label>
                    <input 
                      type="text" 
                      placeholder="Ej: +50688888888" 
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>Cuenta Bancaria / IBAN (Opcional):</label>
                    <input 
                      type="text" 
                      placeholder="Ej: CR050152020010264..." 
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Lote y Tabla de Códigos de Activación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎟️</span> Generador de Códigos Únicos
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  Genera códigos individuales para vender o dar a los jugadores. Los códigos son únicos por partida.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>Cantidad de Códigos:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="200" 
                      value={generateCount} 
                      onChange={(e) => setGenerateCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 20)))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    disabled={isGenerating || !activeGame}
                    onClick={generateCodes}
                    style={{ alignSelf: 'flex-end', height: '41px', background: primaryColor, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', padding: '0 15px' }}
                  >
                    {isGenerating ? 'Generando...' : 'Generar Lote 🎲'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={copyAvailableCodes}
                    disabled={generatedCodesList.filter(c => !c.used).length === 0}
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: '1px solid var(--border-color)', background: '#fff', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    📋 Copiar Libres
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={clearAllCodes}
                    disabled={isGenerating || generatedCodesList.length === 0}
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: '1px solid #fee2e2', background: '#fff5f5', color: '#dc2626', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    🗑️ Borrar Todos
                  </button>
                </div>
              </div>

              {/* Listado de Códigos con Scroll */}
              <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: '420px', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-title)', margin: 0 }}>
                    Listado de Códigos ({generatedCodesList.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                    {generatedCodesList.filter(c => !c.used).length} Libres / {generatedCodesList.filter(c => c.used).length} Usados
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  {generatedCodesList.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No se han generado códigos para esta partida. Elige la cantidad arriba y pulsa "Generar Lote".
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px 12px', fontWeight: 'bold', color: 'var(--text-title)' }}>Código</th>
                          <th style={{ padding: '8px 12px', fontWeight: 'bold', color: 'var(--text-title)' }}>Estado</th>
                          <th style={{ padding: '8px 12px', fontWeight: 'bold', color: 'var(--text-title)' }}>Detalle / Uso</th>
                          <th style={{ padding: '8px 12px', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedCodesList.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', background: c.used ? '#fffafa' : '#fff' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: c.used ? 'var(--text-muted)' : '#000', fontSize: '0.85rem' }}>
                              <code>{c.code}</code>
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              {c.used ? (
                                <span style={{ color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>Usado</span>
                              ) : (
                                <span style={{ color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>Libre</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: '120px' }}>
                              {c.used ? (
                                <div>
                                  <strong>{c.usedByPlayer || 'Jugador'}</strong>
                                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8' }}>
                                    Cartón: {c.usedByCardId || 'N/A'}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ fontStyle: 'italic' }}>Disponible</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              {!c.used && (
                                <button 
                                  type="button" 
                                  onClick={() => copyDirectLinkCode(c.code)}
                                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 8px' }}
                                  title="Copiar Enlace Directo con Código pre-cargado para enviar por WhatsApp"
                                >
                                  🔗 Link
                                </button>
                              )}
                              <button 
                                type="button" 
                                onClick={() => deleteCode(c.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                title="Eliminar Código"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: GALERÍA DE PREMIOS DEL BINGO */}
        {subTab === 'premios' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            
            {/* Formulario para agregar / editar premios */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎁</span> {editingPrizeId ? 'Editar Premio' : 'Agregar Nuevo Premio'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                Agrega imágenes, títulos y descripciones de los premios que los participantes podrán ganar durante el evento.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPrizeTitle.trim()) return;
                
                if (editingPrizeId) {
                  setPrizesList(prev => prev.map(p => p.id === editingPrizeId ? {
                    ...p,
                    title: newPrizeTitle.trim(),
                    description: newPrizeDesc.trim(),
                    image: newPrizeImage.trim(),
                    category: newPrizeCategory.trim() || 'General',
                    order: Number(newPrizeOrder) || 1
                  } : p));
                  setEditingPrizeId(null);
                } else {
                  const newPrize: BingoPrize = {
                    id: Date.now().toString(),
                    title: newPrizeTitle.trim(),
                    description: newPrizeDesc.trim(),
                    image: newPrizeImage.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60',
                    category: newPrizeCategory.trim() || 'General',
                    order: Number(newPrizeOrder) || (prizesList.length + 1)
                  };
                  setPrizesList(prev => [...prev, newPrize]);
                }

                setNewPrizeTitle('');
                setNewPrizeDesc('');
                setNewPrizeImage('');
                setNewPrizeCategory('');
                setNewPrizeOrder(1);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Título del Premio *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej. Smart TV 55 pulgadas 4K / Laptop Educativa" 
                    value={newPrizeTitle}
                    onChange={(e) => setNewPrizeTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Descripción Detallada
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Describe las características principales del premio..." 
                    value={newPrizeDesc}
                    onChange={(e) => setNewPrizeDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '6px' }}>
                      Categoría
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej. Tecnología / Escolar / Electrodomésticos" 
                      value={newPrizeCategory}
                      onChange={(e) => setNewPrizeCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ width: '130px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '6px' }}>
                      Orden / Nivel *
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      value={newPrizeOrder}
                      onChange={(e) => setNewPrizeOrder(parseInt(e.target.value) || 1)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                    <small style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>1 = Menor, 2 = Medio, 3 = Mayor</small>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', marginBottom: '6px' }}>
                    Imagen del Premio (URL o Archivo)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enlace HTTPS de la imagen o subir archivo abajo" 
                    value={newPrizeImage}
                    onChange={(e) => setNewPrizeImage(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem', marginBottom: '8px' }}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewPrizeImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                {newPrizeImage && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={newPrizeImage} alt="Previsualización" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {editingPrizeId && (
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => {
                        setEditingPrizeId(null);
                        setNewPrizeTitle('');
                        setNewPrizeDesc('');
                        setNewPrizeImage('');
                        setNewPrizeCategory('');
                        setNewPrizeOrder(1);
                      }}
                      style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#fff' }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '10px', borderRadius: '12px', background: primaryColor, color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {editingPrizeId ? 'Actualizar Premio ✏️' : '＋ Guardar Premio en la Galería'}
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Premios Registrados */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span> Premios de la Partida ({prizesList.length})
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: '1.3' }}>
                    Lista ordenada por nivel de premio (de menor a mayor por defecto).
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    const samplePrizes: BingoPrize[] = [
                      {
                        id: 'prize_' + Date.now() + '_1',
                        title: '🥇 Premio Mayor: Smart TV 55" 4K HDR',
                        description: 'Pantalla inteligente de alta resolución con conectividad WiFi y sonido envolvente para el ganador principal.',
                        image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=60',
                        category: 'Tecnología',
                        order: 3
                      },
                      {
                        id: 'prize_' + Date.now() + '_2',
                        title: '🥈 Segundo Premio: Tablet Educativa 10"',
                        description: 'Tablet de alto rendimiento ideal para estudio, lectura digital e interacción con contenidos educativos.',
                        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
                        category: 'Estudio',
                        order: 2
                      },
                      {
                        id: 'prize_' + Date.now() + '_3',
                        title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas',
                        description: 'Paquete de libros infantiles y juveniles ilustrados con historias mágicas de nuestra editorial.',
                        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60',
                        category: 'Editorial',
                        order: 1
                      }
                    ];
                    setPrizesList(prev => [...prev, ...samplePrizes]);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ✨ Cargar Ejemplos para Editar
                </button>
              </div>

              {prizesList.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2.5rem' }}>🎁</span>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-title)', fontSize: '1rem' }}>No se han configurado premios personalizados aún</strong>
                    <small style={{ opacity: 0.8 }}>Agrega premios manualmente con el formulario o carga la plantilla de ejemplos para editar en 1 clic.</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const samplePrizes: BingoPrize[] = [
                        {
                          id: 'prize_' + Date.now() + '_1',
                          title: '🥇 Premio Mayor: Smart TV 55" 4K HDR',
                          description: 'Pantalla inteligente de alta resolución con conectividad WiFi y sonido envolvente para el ganador principal.',
                          image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=60',
                          category: 'Tecnología',
                          order: 3
                        },
                        {
                          id: 'prize_' + Date.now() + '_2',
                          title: '🥈 Segundo Premio: Tablet Educativa 10"',
                          description: 'Tablet de alto rendimiento ideal para estudio, lectura digital e interacción con contenidos educativos.',
                          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
                          category: 'Estudio',
                          order: 2
                        },
                        {
                          id: 'prize_' + Date.now() + '_3',
                          title: '🥉 Premio Especial 1: Colección de Libros Lluvia de Ideas',
                          description: 'Paquete de libros infantiles y juveniles ilustrados con historias mágicas de nuestra editorial.',
                          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60',
                          category: 'Editorial',
                          order: 1
                        }
                      ];
                      setPrizesList(samplePrizes);
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: primaryColor,
                      color: '#fff',
                      border: 'none',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: `0 4px 12px ${primaryColor}44`,
                      marginTop: '6px'
                    }}
                  >
                    🚀 Convertir Ejemplos en Premios Reales para Editar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                  {[...prizesList].sort((a, b) => (a.order || 0) - (b.order || 0)).map((prize) => (
                    <div key={prize.id} style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-color)', background: '#fff', alignItems: 'center' }}>
                      <div style={{ width: '65px', height: '65px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {prize.image ? (
                          <img src={prize.image} alt={prize.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '1.8rem' }}>🎁</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: primaryColor, background: `${primaryColor}15`, padding: '2px 6px', borderRadius: '6px' }}>
                            Orden #{prize.order || 1}
                          </span>
                          {prize.category && (
                            <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>
                              {prize.category}
                            </span>
                          )}
                        </div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-title)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prize.title}
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {prize.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingPrizeId(prize.id);
                            setNewPrizeTitle(prize.title);
                            setNewPrizeDesc(prize.description);
                            setNewPrizeImage(prize.image);
                            setNewPrizeCategory(prize.category || '');
                            setNewPrizeOrder(prize.order || 1);
                          }}
                          style={{ background: '#f1f5f9', border: 'none', color: '#334155', borderRadius: '8px', cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}
                          title="Editar Premio"
                        >
                          ✏️
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPrizesList(prev => prev.filter(p => p.id !== prize.id))}
                          style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 'bold' }}
                          title="Eliminar Premio"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 8: PROMOTORES DE VENTA */}
        {subTab === 'promotores' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Tarjetas de Estadísticas Globales de Promotores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.8px', display: 'block' }}>Promotores Registrados</span>
                <strong style={{ fontSize: '1.8rem', color: '#1e3a8a', display: 'block', marginTop: '4px' }}>{promotersList.length}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{promotersList.filter(p => p.active).length} activos</span>
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.15) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.8px', display: 'block' }}>Jugadores Afiliados</span>
                <strong style={{ fontSize: '1.8rem', color: '#581c87', display: 'block', marginTop: '4px' }}>
                  {registeredCardsList.filter(c => c.promoterCode).length}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Con código de vendedor</span>
              </div>
            </div>

            {/* Formulario para agregar nuevo Promotor */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-title)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📢</span> Crear Código de Promotor de Ventas
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Asigna códigos de referidos a promotores o vendedores para compensarles por cada jugador que logren inscribir al Bingo.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', display: 'block', marginBottom: '6px' }}>Código Promotor *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: PROMO10 o JUAN2026" 
                    value={newPromoterCode} 
                    onChange={(e) => setNewPromoterCode(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', display: 'block', marginBottom: '6px' }}>Nombre del Vendedor *</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez" 
                    value={newPromoterName} 
                    onChange={(e) => setNewPromoterName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-title)', display: 'block', marginBottom: '6px' }}>Contacto / Teléfono</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 5555-1234" 
                    value={newPromoterContact} 
                    onChange={(e) => setNewPromoterContact(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleAddPromoter}
                style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ➕ Registrar Código de Promotor
              </button>
            </div>

            {/* Tabla de Promotores Registrados */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'white' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-title)', marginBottom: '15px' }}>
                📋 Códigos y Promotores Activos ({promotersList.length})
              </h3>

              {promotersList.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '10px 0' }}>
                  No hay códigos de promotores creados aún. Ingresa uno arriba para comenzar a rastrear inscripciones.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Código</th>
                        <th style={{ padding: '10px' }}>Promotor / Vendedor</th>
                        <th style={{ padding: '10px' }}>Contacto</th>
                        <th style={{ padding: '10px' }}>Jugadores Afiliados</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promotersList.map((p) => {
                        const count = registeredCardsList.filter(c => c.promoterCode === p.id).length;
                        const refLink = `${window.location.origin}/juegos/bingo?promoter=${p.id}`;

                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>
                              <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '8px', fontFamily: 'monospace' }}>
                                📢 {p.id}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--text-title)' }}>{p.promoterName}</td>
                            <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{p.contact || '--'}</td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                👥 {count} Jugadores
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <button
                                type="button"
                                onClick={() => handleTogglePromoterStatus(p)}
                                style={{
                                  background: p.active ? '#dcfce7' : '#fee2e2',
                                  color: p.active ? '#15803d' : '#b91c1c',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {p.active ? '🟢 Activo' : '🔴 Inactivo'}
                              </button>
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(refLink);
                                    showAlert(`Enlace de afiliado copiado: ${refLink}`, "Enlace Copiado", "🔗");
                                  }}
                                  style={{ background: '#e0f2fe', border: 'none', color: '#0369a1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                  title="Copiar Enlace Directo con Código de Promotor"
                                >
                                  🔗 Copiar Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePromoter(p.id, p.promoterName)}
                                  style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                  title="Eliminar Promotor"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

