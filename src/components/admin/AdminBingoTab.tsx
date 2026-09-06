import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  collection, doc, getDoc, addDoc, updateDoc, setDoc, deleteDoc, 
  onSnapshot, query, limit, where 
} from 'firebase/firestore';
import { db } from '../../firebase';
import type { 
  BingoGame, BingoCustomization, BingoPrize, BingoPromoter, 
  Sponsor, BingoCard, BingoAccessToken 
} from '../../types';
import { compressImageWebP, blobToDataURL } from '../../utils/imageUpload';
import './AdminBingoTab.css';


const PRESETS_MAP = [
  { label: "Ceiba Sagrada", value: "🌳", type: "emoji" as const },
  { label: "Quetzal Libre", value: "🦜", type: "emoji" as const },
  { label: "Jaguar de Xibalbá", value: "🐆", type: "emoji" as const },
  { label: "Maíz Criollo", value: "🌽", type: "emoji" as const },
  { label: "Volcán de Fuego", value: "🌋", type: "emoji" as const },
  { label: "Sol Maya", value: "☀️", type: "emoji" as const },
  { label: "Luna de Xela", value: "🌙", type: "emoji" as const },
  { label: "Tucán Hermoso", value: "🪶", type: "emoji" as const }
];

const HEIGHT_PRESETS = [
  { label: 'Fino (80px)', value: 80 },
  { label: 'Compacto (120px)', value: 120 },
  { label: 'Mediano (160px)', value: 160 },
  { label: 'Alto (200px)', value: 200 },
  { label: 'Grande (240px)', value: 240 }
];

const MARKER_OPTIONS = ["⭐", "🔴", "🌽", "🍀", "🍩", "🎯", "💎", "🔥", "❤️", "⚡", "💀", "🔔"];

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
    title: 'Bingotenango',
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

const getTextColorForBg = (hexColor: string) => {
  if (!hexColor) return '#ffffff';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#1e293b' : '#ffffff';
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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tab Navigation: 7 cohesive modules
  const [activeTab, setActiveTab] = useState<'partida' | 'diseno' | 'figuras' | 'acceso' | 'premios_marcas' | 'promotores' | 'pasarela'>('partida');

  // Configuración de Pasarela Recurrente (Boletos)
  const [recurrenteLinks, setRecurrenteLinks] = useState<Record<string, string>>({
    'tier-10': '',
    'tier-25': '',
    'tier-50': '',
    'tier-100': ''
  });
  const [isSavingGateways, setIsSavingGateways] = useState(false);

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

  // Game & Appearance States
  const [gameTitle, setGameTitle] = useState('Bingotenango');
  const [customTitle, setCustomTitle] = useState('Bingotenango');
  const [customSubtitle, setCustomSubtitle] = useState('Editorial Lluvia de Ideas');
  const [headerImage, setHeaderImage] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#a855f7');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [backgroundColor, setBackgroundColor] = useState('#fbf9ff');
  const [themeName, setThemeName] = useState<BingoCustomization['themeName']>('classic');
  const [cardTheme, setCardTheme] = useState<BingoCustomization['cardTheme']>('classic');
  const [markerEmoji, setMarkerEmoji] = useState('⭐');
  const [headerHeight, setHeaderHeight] = useState(160);
  const [selectedHeightType, setSelectedHeightType] = useState<'preset' | 'custom'>('preset');
  const [soundTheme, setSoundTheme] = useState<BingoCustomization['soundTheme']>('classic');
  const [winningPattern, setWinningPattern] = useState('full');

  // Mappings (Figures) States
  const [numberToImageMap, setNumberToImageMap] = useState<BingoCustomization['numberToImageMap']>({});
  const [mappingNum, setMappingNum] = useState<number>(1);
  const [mappingType, setMappingType] = useState<'emoji' | 'image'>('emoji');
  const [mappingVal, setMappingVal] = useState<string>('🌳');
  const [mappingLabel, setMappingLabel] = useState<string>('Ceiba');
  const [selectedFigureCol, setSelectedFigureCol] = useState<'ALL' | 'B' | 'I' | 'N' | 'G' | 'O'>('ALL');
  const [figureSearch, setFigureSearch] = useState('');

  // Sponsor States
  const [sponsorActive, setSponsorActive] = useState(false);
  const [sponsorInterval, setSponsorInterval] = useState(5);
  const [sponsorMode, setSponsorMode] = useState<'integrated' | 'modal'>('modal');
  const [sponsorAudioAnnounce, setSponsorAudioAnnounce] = useState(false);
  const [sponsorsList, setSponsorsList] = useState<Sponsor[]>([]);
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

  // Estados Modernos de Taquilla y Cobros (Guatemala)
  const [cardPriceQ, setCardPriceQ] = useState<number>(25);
  const [bankName, setBankName] = useState('Banco Industrial');
  const [bankAccountType, setBankAccountType] = useState('Monetaria');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountOwner, setBankAccountOwner] = useState('Lluvia de Ideas Editorial');
  const [whatsappTaquilla, setWhatsappTaquilla] = useState('36135616');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  // Monitor de Pases de Acceso (bingo_access_tokens)
  const [accessTokensList, setAccessTokensList] = useState<BingoAccessToken[]>([]);
  const [tokenStatusFilter, setTokenStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');

  // Prizes Gallery States
  const [prizesList, setPrizesList] = useState<BingoPrize[]>([]);
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [newPrizeDesc, setNewPrizeDesc] = useState('');
  const [newPrizeImage, setNewPrizeImage] = useState('');
  const [newPrizeCategory, setNewPrizeCategory] = useState('');
  const [newPrizeOrder, setNewPrizeOrder] = useState<number>(1);
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);

  // Promoters State
  const [promotersList, setPromotersList] = useState<BingoPromoter[]>([]);
  const [registeredCardsList, setRegisteredCardsList] = useState<BingoCard[]>([]);
  const [newPromoterCode, setNewPromoterCode] = useState('');
  const [newPromoterName, setNewPromoterName] = useState('');
  const [newPromoterContact, setNewPromoterContact] = useState('');
  const [newPromoterCommission, setNewPromoterCommission] = useState<number | ''>('');

  const lastActiveGameIdRef = useRef<string | null>(null);

  // 1. Escuchar la partida de Bingo activa en Firestore
  useEffect(() => {
    const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameDoc = snapshot.docs[0];
        const gData = { id: gameDoc.id, ...gameDoc.data() } as BingoGame;
        setActiveGame(gData);

        if (lastActiveGameIdRef.current !== gData.id) {
          lastActiveGameIdRef.current = gData.id;
          setGameTitle(gData.title || 'Gran Bingo Familiar');
          setWinningPattern(gData.winningPattern || 'full');

          if (gData.customization) {
            setHeaderImage(gData.customization.headerImage || '');
            setPrimaryColor(gData.customization.primaryColor || '#a855f7');
            setAccentColor(gData.customization.accentColor || '#ec4899');
            setBackgroundColor(gData.customization.backgroundColor || '#fbf9ff');
            setThemeName(gData.customization.themeName || 'classic');
            setCardTheme(gData.customization.cardTheme || 'classic');
            setMarkerEmoji(gData.customization.markerEmoji || '⭐');
            setNumberToImageMap(gData.customization.numberToImageMap || {});

            setCustomTitle(gData.customization.title || 'Bingotenango');
            setCustomSubtitle(gData.customization.subtitle || 'Editorial Lluvia de Ideas');
            const hh = gData.customization.headerHeight || 160;
            setHeaderHeight(hh);
            setSelectedHeightType([80, 120, 160, 200, 240].includes(hh) ? 'preset' : 'custom');
            setSoundTheme(gData.customization.soundTheme || 'classic');

            // Sponsors & Prizes
            setSponsorActive(gData.customization.sponsorConfig?.active || false);
            setSponsorInterval(gData.customization.sponsorConfig?.interval || 5);
            setSponsorMode(gData.customization.sponsorConfig?.mode || 'modal');
            setSponsorAudioAnnounce(gData.customization.sponsorConfig?.audioAnnounce || false);
            setSponsorsList(gData.customization.sponsors || []);
            setPrizesList(gData.customization.prizes || []);

            // Access Config & Payments
            const ac = gData.customization.accessConfig;
            setAccessMode(ac?.mode || 'free');
            setMassiveMode(ac?.massiveMode || false);
            setFieldPhoneEnabled(ac?.formFields?.phone?.enabled ?? true);
            setFieldPhoneRequired(ac?.formFields?.phone?.required ?? true);
            setFieldLocationEnabled(ac?.formFields?.location?.enabled || false);
            setFieldLocationRequired(ac?.formFields?.location?.required || false);

            setCardPriceQ(gData.cardPriceQ || 25);
            setBankName(ac?.paymentInfo?.bankName || 'Banco Industrial');
            setBankAccountType(ac?.paymentInfo?.bankAccountType || 'Monetaria');
            setBankAccountNumber(ac?.paymentInfo?.bankAccountNumber || ac?.paymentInfo?.bankAccount || '');
            setBankAccountOwner(ac?.paymentInfo?.bankAccountOwner || 'Lluvia de Ideas Editorial');
            setWhatsappTaquilla(ac?.paymentInfo?.whatsappNumber || '36135616');
            setPaymentInstructions(ac?.paymentInfo?.paymentInstructions || '');
          }
        } else {
          // Sincronizar figuras si fueron modificadas
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

  // 2. Escuchar en tiempo real los pases de acceso (bingo_access_tokens)
  useEffect(() => {
    const q = query(collection(db, 'bingo_access_tokens'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tokens = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BingoAccessToken));
      tokens.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAccessTokensList(tokens);
    });
    return () => unsubscribe();
  }, []);

  // 3. Escuchar promotores y cartones registrados
  useEffect(() => {
    const qPromos = query(collection(db, 'bingo_promoters'));
    const unsubPromos = onSnapshot(qPromos, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BingoPromoter));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPromotersList(list);
    });

    const qCards = query(collection(db, 'bingo_cards'));
    const unsubCards = onSnapshot(qCards, (snapshot) => {
      const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as BingoCard));
      setRegisteredCardsList(cards);
    });

    return () => {
      unsubPromos();
      unsubCards();
    };
  }, []);

  // 4. Cargar configuración de Links de Recurrente (Boletos)
  useEffect(() => {
    const loadGatewaySettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'bingo_settings', 'payment_gateways'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.recurrente_links) {
            const r = d.recurrente_links;
            setRecurrenteLinks({
              'tier-10': r['tier-10'] || r['pkg-10'] || '',
              'tier-25': r['tier-25'] || r['pkg-25'] || '',
              'tier-50': r['tier-50'] || r['pkg-50'] || '',
              'tier-100': r['tier-100'] || r['pkg-100'] || ''
            });
          }
        }
      } catch (err) {
        console.error("Error al cargar settings de pasarela:", err);
      }
    };
    loadGatewaySettings();
  }, []);

  const handleSaveRecurrenteLinks = async () => {
    setIsSavingGateways(true);
    try {
      // Guardar con claves modernas y claves de compatibilidad
      const payloadLinks = {
        ...recurrenteLinks,
        'pkg-10': recurrenteLinks['tier-10'] || '',
        'pkg-25': recurrenteLinks['tier-25'] || '',
        'pkg-50': recurrenteLinks['tier-50'] || '',
        'pkg-100': recurrenteLinks['tier-100'] || ''
      };

      await setDoc(doc(db, 'bingo_settings', 'payment_gateways'), {
        recurrente_links: payloadLinks,
        updatedAt: Date.now()
      }, { merge: true });
      showAlert("Los links de pago de Recurrente se guardaron correctamente para la tienda de boletos.", "Configuración Guardada", "💾");
    } catch (err) {
      console.error("Error al guardar links de Recurrente:", err);
      showAlert("No se pudieron guardar los links de pago. Revisa tu conexión.", "Error", "❌");
    } finally {
      setIsSavingGateways(false);
    }
  };

  // --------------------------------------------------------------------------
  // Compresión automática de imágenes antes de almacenar en Firestore (Evita >1MB)
  // --------------------------------------------------------------------------
  const handleOptimizedUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    maxWidth: number, 
    maxHeight: number, 
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Comprimir a formato WebP optimizado
      const compressedBlob = await compressImageWebP(file, maxWidth, maxHeight, 0.82);
      const dataUrl = await blobToDataURL(compressedBlob);
      onSuccess(dataUrl);
    } catch (err) {
      console.error("Error optimizando imagen:", err);
      // Fallback a lectura directa si falla canvas
      const reader = new FileReader();
      reader.onloadend = () => onSuccess(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --------------------------------------------------------------------------
  // Lógica de Personalización y Guardado
  // --------------------------------------------------------------------------
  const getCustomizationObject = (): BingoCustomization => ({
    headerImage,
    headerHeight: Number(headerHeight) || 160,
    title: customTitle.trim() || 'Bingotenango',
    subtitle: customSubtitle.trim() || 'Editorial Lluvia de Ideas',
    primaryColor,
    accentColor,
    backgroundColor,
    themeName,
    cardTheme,
    markerEmoji,
    numberToImageMap,
    soundTheme,
    sponsorConfig: {
      active: sponsorActive,
      interval: Number(sponsorInterval) || 5,
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
        bankName: bankName.trim(),
        bankAccountType: bankAccountType.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountOwner: bankAccountOwner.trim(),
        bankAccount: bankAccountNumber.trim(),
        whatsappNumber: whatsappTaquilla.trim(),
        paymentInstructions: paymentInstructions.trim()
      }
    }
  });

  const saveCustomization = async () => {
    if (!activeGame) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        title: gameTitle.trim() || 'Gran Bingo Familiar',
        winningPattern: winningPattern,
        cardPriceQ: Number(cardPriceQ) || 25,
        customization: getCustomizationObject()
      });
      await showAlert("¡Toda la configuración del Bingo y la Tómbola ha sido guardada con éxito! 🎉", "Guardado Exitoso", "💾");
    } catch (err) {
      console.error(err);
      await showAlert("Error al guardar la configuración en la base de datos.", "Error", "❌");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetRound = async () => {
    if (!activeGame) return;
    const confirm = await showConfirm(
      "¿Deseas reiniciar las balotas cantadas de la partida actual? Todos los números saldrán de la tómbola para comenzar una nueva ronda limpia, manteniendo los mismos cartones de los jugadores.",
      "Reiniciar Balotas",
      "🔄",
      "SÍ, REINICIAR",
      "CANCELAR"
    );
    if (confirm) {
      try {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), {
          drawnNumbers: [],
          status: 'waiting',
          activeClaim: null,
          lastResetAt: Date.now()
        });
        await showAlert("Las balotas han sido devueltas a la tómbola. ¡Listos para cantar una nueva ronda!", "Ronda Reiniciada", "🎉");
      } catch (err) {
        console.error(err);
        await showAlert("Error al reiniciar las balotas.", "Error", "❌");
      }
    }
  };

  const createNewGame = async () => {
    const confirm = await showConfirm(
      activeGame 
        ? "¿Estás seguro de que deseas finalizar la partida actual y crear una NUEVA sesión de Bingo? Los jugadores actuales deberán unirse a la nueva sesión."
        : "¿Deseas crear e inicializar la partida de Bingotenango ahora?",
      "Nueva Sesión de Bingo",
      "🚀",
      "SÍ, CREAR PARTIDA",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      if (activeGame) {
        await updateDoc(doc(db, 'bingo_games', activeGame.id), { active: false, status: 'finished' });
      }

      await addDoc(collection(db, 'bingo_games'), {
        title: gameTitle.trim() || 'Gran Bingo Familiar',
        status: 'waiting',
        drawnNumbers: [],
        winningPattern: winningPattern,
        createdAt: Date.now(),
        active: true,
        cardPriceQ: Number(cardPriceQ) || 25,
        customization: getCustomizationObject()
      });
      await showAlert("¡Bingo creado! La tómbola y la configuración ya están disponibles en tiempo real.", "Partida Creada", "🚀");
    } catch (err) {
      console.error(err);
      await showAlert("Error al crear el juego.", "Error", "❌");
    }
  };

  // Asignar premio activo en juego
  const handleSetActivePrize = async (prizeId: string, prizeTitle: string) => {
    if (!activeGame) return;
    try {
      await updateDoc(doc(db, 'bingo_games', activeGame.id), {
        currentPrizeId: prizeId,
        currentPrizeTitle: prizeTitle
      });
      await showAlert(`El premio en juego ahora es: "${prizeTitle}". Se reflejará de inmediato en la tómbola y cartones.`, "Premio en Juego Actualizado", "🏆");
    } catch (err) {
      console.error(err);
      await showAlert("Error al actualizar el premio activo.", "Error", "❌");
    }
  };

  // --------------------------------------------------------------------------
  // Lógica de Patrocinadores
  // --------------------------------------------------------------------------
  const addSponsor = async () => {
    if (!newSponsorName.trim()) {
      await showAlert("Por favor escribe el nombre de la marca o patrocinador.", "Campos Requeridos", "🏷️");
      return;
    }
    if (!newSponsorLogo) {
      await showAlert("Por favor sube un logotipo para la marca.", "Campos Requeridos", "🖼️");
      return;
    }
    if (sponsorsList.length >= 12) {
      await showAlert("Has alcanzado el límite recomendado de 12 patrocinadores.", "Límite Excedido", "⚠️");
      return;
    }

    const newSponsor: Sponsor = {
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

  // --------------------------------------------------------------------------
  // Lógica de Mapeos de Figuras
  // --------------------------------------------------------------------------
  const addMapping = async () => {
    if (!mappingLabel.trim()) {
      await showAlert("Por favor escribe el nombre de la figura (para que el anunciador de voz la cante).", "Campo Requerido", "🏷️");
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
        console.error("Error guardando figura:", err);
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
        console.error("Error eliminando figura:", err);
      }
    }
  };

  // Filtro de Figuras por columna B-I-N-G-O y búsqueda
  const filteredMappings = useMemo(() => {
    return Object.entries(numberToImageMap).filter(([numStr, map]) => {
      const num = parseInt(numStr);
      if (selectedFigureCol === 'B' && (num < 1 || num > 15)) return false;
      if (selectedFigureCol === 'I' && (num < 16 || num > 30)) return false;
      if (selectedFigureCol === 'N' && (num < 31 || num > 45)) return false;
      if (selectedFigureCol === 'G' && (num < 46 || num > 60)) return false;
      if (selectedFigureCol === 'O' && (num < 61 || num > 75)) return false;

      if (figureSearch.trim()) {
        const query = figureSearch.toLowerCase();
        return numStr.includes(query) || map.label.toLowerCase().includes(query);
      }
      return true;
    });
  }, [numberToImageMap, selectedFigureCol, figureSearch]);

  // --------------------------------------------------------------------------
  // Lógica de Presets y Reset
  // --------------------------------------------------------------------------
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
      '¿Estás seguro de que deseas restaurar los estilos clásicos de fábrica? Se borrarán figuras personalizadas y colores modificados.',
      'Restaurar Valores de Fábrica',
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
      setCardTheme('classic');
      setMarkerEmoji('⭐');
      setCustomTitle('Bingotenango');
      setCustomSubtitle('Editorial Lluvia de Ideas');
      setHeaderHeight(160);
      setSelectedHeightType('preset');
      setSoundTheme('classic');
      setWinningPattern('full');
      setNumberToImageMap({});
      setSponsorActive(false);
      setSponsorInterval(5);
      setSponsorMode('modal');
      setSponsorAudioAnnounce(false);
      setSponsorsList([]);
      await showAlert('Valores clásicos restaurados. Pulsa "Guardar Cambios" para confirmar en la base de datos.', 'Restauración Completa', '🔄');
    }
  };

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Lógica de Taquilla, Pases de Acceso y Cobros en Quetzales
  // --------------------------------------------------------------------------
  const handleConfirmCashToken = async (token: BingoAccessToken) => {
    const isPaid = token.paymentMethod === 'efectivo' || !!token.paidAmount;
    const priceAmount = (token.unitPriceQ || cardPriceQ || 10) * (token.quantity || 1);

    if (isPaid) {
      await showAlert(`Este pase ya figura con cobro confirmado (Q${token.paidAmount || priceAmount}.00).`, "Cobro Ya Registrado", "ℹ️");
      return;
    }

    const confirm = await showConfirm(
      `¿Deseas confirmar el cobro en efectivo de Q${priceAmount}.00 para el jugador "${token.playerName || 'Jugador'}" (${token.quantity} cartón${token.quantity > 1 ? 'es' : ''})?`,
      "Confirmar Cobro en Efectivo",
      "💵",
      "SÍ, CONFIRMAR COBRO",
      "CANCELAR"
    );
    if (!confirm) return;

    try {
      await updateDoc(doc(db, 'bingo_access_tokens', token.id), {
        paymentMethod: 'efectivo',
        paidAmount: priceAmount,
        status: 'active'
      });
      if (token.orderId) {
        await updateDoc(doc(db, 'bingo_orders', token.orderId), {
          status: 'paid',
          paymentMethod: 'efectivo',
          paidAt: Date.now()
        });
      }
      await showAlert(`¡Cobro en efectivo de Q${priceAmount}.00 confirmado para ${token.playerName}! El pase está listo para despachar. 🚀`, "Cobro Exitoso", "✅");
    } catch (err) {
      console.error("Error al confirmar cobro:", err);
      await showAlert("No se pudo confirmar el cobro en la base de datos.", "Error", "❌");
    }
  };

  const handleSendWhatsAppToken = async (token: BingoAccessToken) => {
    const isPaid = token.paymentMethod === 'efectivo' || !!token.paidAmount;
    if (!isPaid) {
      const confirmCash = await showConfirm(
        `El jugador "${token.playerName}" figura con cobro PENDIENTE.\n\nPara enviarle su enlace de juego por WhatsApp, primero debes confirmar el cobro realizado.\n\n¿Deseas confirmar el cobro en efectivo ahora?`,
        "Cobro Pendiente",
        "💵",
        "REGISTRAR COBRO Y ENVIAR",
        "CANCELAR"
      );
      if (confirmCash) {
        await handleConfirmCashToken(token);
      }
      return;
    }

    const cleanPhone = (token.playerWhatsapp || '').replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      await showAlert("Este pase no tiene un número de WhatsApp válido registrado.", "Sin Teléfono", "⚠️");
      return;
    }

    const playUrl = `${window.location.origin}/juegos/bingo?access=${token.id}`;
    const text = encodeURIComponent(
      `¡Hola ${token.playerName}! 🎟️ Te compartimos tu Pase Único oficial para Bingotenango:\n\n` +
      `🏆 Partida: ${activeGame?.title || 'Gran Bingo Familiar'}\n` +
      `🎟️ Total Cartones: ${token.quantity} Cartón(es)\n` +
      `💵 Estado: Cobro Confirmado (Q${token.paidAmount || (token.unitPriceQ || 10) * token.quantity}.00)\n\n` +
      `🔑 ENLACE EXCLUSIVO PARA JUGAR:\n${playUrl}\n\n` +
      `⚠️ Este enlace es de un solo uso para tu dispositivo. Ábrelo al iniciar la partida para ingresar directamente a la sala. ¡Muchos éxitos!`
    );

    window.open(`https://wa.me/502${cleanPhone}?text=${text}`, '_blank');

    try {
      await updateDoc(doc(db, 'bingo_access_tokens', token.id), {
        linkSent: true,
        linkSentAt: Date.now(),
        linkSentCount: (token.linkSentCount || 0) + 1
      });
    } catch {}
  };

  const handleCopyTokenLink = (tokenId: string) => {
    const playUrl = `${window.location.origin}/juegos/bingo?access=${tokenId}`;
    navigator.clipboard.writeText(playUrl);
    showAlert(`¡Enlace exclusivo del pase copiado al portapapeles! 📋\n\n${playUrl}`, "Enlace Copiado", "🔗");
  };

  // Filtrado de pases de acceso
  const filteredTokensList = useMemo(() => {
    return accessTokensList.filter(t => {
      const isPaid = t.paymentMethod === 'efectivo' || !!t.paidAmount;
      if (tokenStatusFilter === 'paid' && !isPaid) return false;
      if (tokenStatusFilter === 'pending' && isPaid) return false;
      if (tokenSearchQuery.trim()) {
        const q = tokenSearchQuery.toLowerCase();
        return (t.playerName || '').toLowerCase().includes(q) ||
          (t.playerWhatsapp || '').includes(q) ||
          t.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [accessTokensList, tokenStatusFilter, tokenSearchQuery]);

  // --------------------------------------------------------------------------
  // Lógica de Promotores de Venta
  // --------------------------------------------------------------------------
  const handleAddPromoter = async () => {
    const code = newPromoterCode.trim().toUpperCase();
    const name = newPromoterName.trim();
    if (!code || !name) {
      await showAlert("Por favor ingresa un código de promotor y el nombre del vendedor.", "Campos Requeridos", "⚠️");
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
      `¿Deseas eliminar al promotor ${codeId} (${name})?`,
      "Eliminar Promotor",
      "🗑️"
    );
    if (confirm) {
      try {
        await deleteDoc(doc(db, 'bingo_promoters', codeId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Demo de locución por voz
  const playVoiceDemo = async () => {
    if (!('speechSynthesis' in window)) {
      await showAlert("Tu navegador no soporta síntesis de voz.", "Función No Soportada", "🔊");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Letra B... número 15... ¡Quince!");
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;
    else utterance.lang = 'es-ES';

    if (soundTheme === 'cyberpunk') {
      utterance.pitch = 0.2;
      utterance.rate = 1.2;
    } else if (soundTheme === 'retro') {
      utterance.pitch = 1.8;
      utterance.rate = 1.3;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
    }
    window.speechSynthesis.speak(utterance);
  };

  const isCellHighlightedInPattern = (r: number, c: number, pattern: string) => {
    if (pattern === 'full') return true;
    if (pattern === 'four_corners') return (r === 0 || r === 4) && (c === 0 || c === 4);
    if (pattern === 'diagonal') return r === c || r + c === 4;
    if (pattern === 'line') return r === 2 || c === 2;
    return false;
  };

  if (loading) {
    return (
      <div className="admin-tab-content">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-bingo-container">
      
      {/* ====================================================================
          1. LIVE CONTROL & STATUS HEADER
         ==================================================================== */}
      <div className="bingo-control-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/bingotenango-logo.svg" 
            alt="Bingotenango" 
            style={{ maxHeight: '44px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(88, 205, 238, 0.45))' }} 
          />
          <div className="bingo-monitor-info">
          {activeGame ? (
            <span className={`bingo-status-pill ${activeGame.status}`}>
              <span className="bingo-pulsing-dot" />
              {activeGame.status === 'waiting' && '🟢 Esperando Jugadores'}
              {activeGame.status === 'playing' && '⚡ En Juego en Directo'}
              {activeGame.status === 'finished' && '⚪ Partida Finalizada'}
            </span>
          ) : (
            <span className="bingo-status-pill none">
              <span className="bingo-pulsing-dot" />
              ⚠️ Sin Partida Activa
            </span>
          )}

          <div className="bingo-monitor-metrics">
            <span className="bingo-metric-chip" title="Balotas extraídas de la tómbola">
              🎱 <strong>{activeGame?.drawnNumbers?.length || 0} / 75</strong> Balotas
            </span>
            <span className="bingo-metric-chip" title="Patrón necesario para ganar">
              🎯 <strong>
                {winningPattern === 'line' && 'Línea'}
                {winningPattern === 'four_corners' && '4 Esquinas'}
                {winningPattern === 'diagonal' && 'Diagonales'}
                {winningPattern === 'full' && 'Cartón Lleno'}
              </strong>
            </span>
            <span className="bingo-metric-chip" title="Cartones registrados en la sala">
              👥 <strong>{registeredCardsList.length}</strong> Cartones
            </span>
          </div>
        </div>
      </div>

      <div className="bingo-header-actions">
          <a 
            href="/juegos/bingo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bingo-btn-action primary"
            title="Abrir la tómbola y vista pública en una nueva pestaña"
          >
            📺 Abrir Tómbola en Vivo ↗
          </a>

          {activeGame && (
            <button
              type="button"
              onClick={handleResetRound}
              className="bingo-btn-action"
              title="Devuelve todas las balotas a la tómbola para cantar una nueva ronda"
            >
              🔄 Nueva Ronda (Reiniciar Balotas)
            </button>
          )}

          <button
            type="button"
            onClick={createNewGame}
            className="bingo-btn-action danger-outline"
            title="Finaliza la partida actual e inicializa una nueva sesión limpia"
          >
            {activeGame ? '🏁 Finalizar y Nueva Partida' : '🚀 Iniciar Primera Partida'}
          </button>
        </div>
      </div>

      {/* Alerta de Reclamo Activo de ¡BINGO! */}
      {activeGame?.activeClaim && activeGame.activeClaim.status === 'pending' && (
        <div className="bingo-claim-alert">
          <div className="bingo-claim-info">
            <span className="bingo-claim-icon">🚨</span>
            <div>
              <strong style={{ color: '#be123c', fontSize: '1.05rem', display: 'block' }}>
                ¡Grito de BINGO en revisión! Participante: {activeGame.activeClaim.playerName}
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#881337' }}>
                Cartón ID: <code>{activeGame.activeClaim.cardId}</code> {activeGame.activeClaim.phone ? `| Tel: ${activeGame.activeClaim.phone}` : ''}
              </span>
            </div>
          </div>
          <a
            href="/juegos/bingo"
            target="_blank"
            rel="noopener noreferrer"
            className="bingo-btn-action primary"
            style={{ background: '#e11d48' }}
          >
            Verificar en Tómbola ↗
          </a>
        </div>
      )}

      {/* ====================================================================
          2. NAVEGACIÓN MODULAR DE SUB-PESTAÑAS
         ==================================================================== */}
      <div className="bingo-subtabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('partida')}
          className={`bingo-tab-btn ${activeTab === 'partida' ? 'active' : ''}`}
        >
          🎮 Partida & Mecánicas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diseno')}
          className={`bingo-tab-btn ${activeTab === 'diseno' ? 'active' : ''}`}
        >
          🎨 Identidad Visual & Temas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('figuras')}
          className={`bingo-tab-btn ${activeTab === 'figuras' ? 'active' : ''}`}
        >
          🏷️ Figuras de Cartón
          <span className="bingo-badge-chip">{Object.keys(numberToImageMap).length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('acceso')}
          className={`bingo-tab-btn ${activeTab === 'acceso' ? 'active' : ''}`}
        >
          🎟️ Taquilla, Pases & Cobros
          <span className="bingo-badge-chip">{accessTokensList.length} Pases</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('premios_marcas')}
          className={`bingo-tab-btn ${activeTab === 'premios_marcas' ? 'active' : ''}`}
        >
          🏆 Premios & Patrocinadores
          <span className="bingo-badge-chip">{prizesList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promotores')}
          className={`bingo-tab-btn ${activeTab === 'promotores' ? 'active' : ''}`}
        >
          👥 Promotores de Venta
          <span className="bingo-badge-chip">{promotersList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pasarela')}
          className={`bingo-tab-btn ${activeTab === 'pasarela' ? 'active' : ''}`}
          style={{ background: activeTab === 'pasarela' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)' : '' }}
        >
          💳 Pasarela Recurrente (Boletos)
        </button>
      </div>

      {/* ====================================================================
          3. PANELES DE CONTENIDO
         ==================================================================== */}

      {/* ------------------------------------------------------------------
          PESTAÑA 1: PARTIDA & MECÁNICAS
         ------------------------------------------------------------------ */}
      {activeTab === 'partida' && (
        <div className="bingo-section-pane">
          <div className="bingo-grid-2">
            
            {/* Configuración de Textos de Sesión */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>📝</span> Títulos de la Partida</h3>
              </div>
              <p className="bingo-card-subtitle">
                Define cómo se identificará el juego tanto a nivel administrativo como para los jugadores.
              </p>

              <div className="bingo-form-group">
                <label>Título de la Sesión (Interno / Administrativo)</label>
                <input
                  type="text"
                  className="bingo-input"
                  value={gameTitle}
                  onChange={e => setGameTitle(e.target.value)}
                  placeholder="Ej: Gran Bingo Familiar de Verano"
                />
              </div>

              <div className="bingo-grid-2">
                <div className="bingo-form-group">
                  <label>Título Público en Tómbola</label>
                  <input
                    type="text"
                    className="bingo-input"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="Ej: Bingotenango"
                  />
                </div>
                <div className="bingo-form-group">
                  <label>Subtítulo Público en Tómbola</label>
                  <input
                    type="text"
                    className="bingo-input"
                    value={customSubtitle}
                    onChange={e => setCustomSubtitle(e.target.value)}
                    placeholder="Ej: Editorial Lluvia de Ideas"
                  />
                </div>
              </div>

              {/* Capacidad y Escala del Motor Anticolisión */}
              <div className="bingo-form-group" style={{ marginTop: '10px' }}>
                <label>Escala y Dispersión del Generador Matemático</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <label style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: `2px solid ${!massiveMode ? primaryColor : '#e2e8f0'}`,
                    background: !massiveMode ? `${primaryColor}08` : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="capacityMode"
                        checked={!massiveMode}
                        onChange={() => setMassiveMode(false)}
                        style={{ accentColor: primaryColor }}
                      />
                      <strong style={{ fontSize: '0.88rem' }}>🟢 Modo Estándar</strong>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Hasta 1,500 cartones. Dispersión ultra estricta (máx. 8 números en común).
                    </span>
                  </label>

                  <label style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: `2px solid ${massiveMode ? primaryColor : '#e2e8f0'}`,
                    background: massiveMode ? `${primaryColor}08` : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="capacityMode"
                        checked={massiveMode}
                        onChange={() => setMassiveMode(true)}
                        style={{ accentColor: primaryColor }}
                      />
                      <strong style={{ fontSize: '0.88rem' }}>⚡ Modo Masivo</strong>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      3,000+ a 10,000 cartones. Generación ultrarrápida a gran escala.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Patrón de Victoria y Locución por Voz */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>🎯</span> Regla de Victoria y Locución</h3>
              </div>
              <p className="bingo-card-subtitle">
                Selecciona la figura que deben completar los cartones para ganar y el estilo del anunciador de voz.
              </p>

              <div className="bingo-form-group">
                <label>Patrón Ganador de la Partida</label>
                <select
                  className="bingo-select"
                  value={winningPattern}
                  onChange={e => setWinningPattern(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  <option value="line">🥇 Línea Horizontal o Vertical (Juego Rápido ~ 10 a 18 bolas)</option>
                  <option value="four_corners">📐 Cuatro Esquinas (Juego Medio ~ 12 a 20 bolas)</option>
                  <option value="diagonal">❌ Diagonales en X (Juego Medio ~ 12 a 25 bolas)</option>
                  <option value="full">🏆 Cartón Lleno - 24 números (Partida Principal ~ 50 a 70 bolas)</option>
                </select>
              </div>

              {/* Visualizador 5x5 Interactivo del Patrón */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '3px',
                  width: '75px',
                  height: '75px',
                  background: '#ffffff',
                  padding: '5px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
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
                            borderRadius: '2px',
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
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                    Guía Visual para Jugadores
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', display: 'block' }}>
                    Las casillas iluminadas deben estar marcadas por el jugador para que el sistema valide el "¡BINGO!".
                  </span>
                </div>
              </div>

              {/* Tema del Anunciador de Voz */}
              <div className="bingo-form-group" style={{ marginTop: '6px' }}>
                <label>Tema del Anunciador de Balotas por Voz</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="bingo-select"
                    value={soundTheme}
                    onChange={e => setSoundTheme(e.target.value as BingoCustomization['soundTheme'])}
                    style={{ flex: 1 }}
                  >
                    <option value="classic">🗣️ Locutor Español Clásico</option>
                    <option value="cyberpunk">👾 Locutor Gamer Synthwave</option>
                    <option value="retro">🕹️ Locutor Arcade Retro</option>
                    <option value="none">🔇 Anunciador Apagado (Solo Efectos)</option>
                  </select>

                  <button
                    type="button"
                    onClick={playVoiceDemo}
                    disabled={soundTheme === 'none'}
                    className="bingo-btn-action"
                    style={{ padding: '0 16px', flexShrink: 0 }}
                    title="Prueba cómo suena la locución en tus altavoces"
                  >
                    🔊 Probar Voz
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          PESTAÑA 2: IDENTIDAD VISUAL & TEMAS
         ------------------------------------------------------------------ */}
      {activeTab === 'diseno' && (
        <div className="bingo-section-pane">
          
          {/* Banner de Cabecera con Compresión WebP */}
          <div className="bingo-card">
            <div className="bingo-card-header">
              <h3 className="bingo-card-title"><span>🖼️</span> Banner de Cabecera (Optimizado WebP)</h3>
              <span className="bingo-badge-chip">Altura actual: {headerHeight}px</span>
            </div>
            <p className="bingo-card-subtitle">
              Sube una imagen horizontal que se mostrará en la parte superior de la tómbola y de los cartones.
            </p>

            <div className="bingo-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="bingo-upload-dropzone" onClick={() => document.getElementById('header-banner-file')?.click()}>
                  <span style={{ fontSize: '2rem' }}>☁️</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>Seleccionar Banner Horizontal</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Compresión automática en formato WebP para máxima velocidad
                  </span>
                  <input
                    type="file"
                    id="header-banner-file"
                    accept="image/*"
                    onChange={(e) => handleOptimizedUpload(e, 1400, 600, setHeaderImage)}
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="bingo-btn-action">Examinar Imagen</button>
                </div>

                {/* Altura del Banner */}
                <div className="bingo-form-group">
                  <label>Presets de Altura:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {HEIGHT_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setHeaderHeight(preset.value);
                          setSelectedHeightType('preset');
                        }}
                        className={`bingo-col-btn ${selectedHeightType === 'preset' && headerHeight === preset.value ? 'active' : ''}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedHeightType('custom')}
                      className={`bingo-col-btn ${selectedHeightType === 'custom' ? 'active' : ''}`}
                    >
                      ⚙️ Rango Libre
                    </button>
                  </div>

                  {selectedHeightType === 'custom' && (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '10px' }}>
                      <input
                        type="range"
                        min="80"
                        max="350"
                        value={headerHeight}
                        onChange={e => setHeaderHeight(parseInt(e.target.value) || 160)}
                        style={{ flex: 1, accentColor: primaryColor }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{headerHeight}px</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Previsualización en Vivo de la Cabecera */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                  Previsualización en Vivo:
                </label>
                <div style={{
                  position: 'relative',
                  height: `${Math.min(headerHeight, 220)}px`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: headerImage ? `url(${headerImage}) center/cover no-repeat` : 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.45)', zIndex: 1 }} />
                  {headerImage && (
                    <button
                      type="button"
                      onClick={() => setHeaderImage('')}
                      className="bingo-preview-remove-btn"
                      style={{ zIndex: 3 }}
                      title="Eliminar imagen de cabecera"
                    >
                      ✕
                    </button>
                  )}
                  <h2 style={{ color: '#ffffff', margin: 0, zIndex: 2, fontSize: headerHeight < 120 ? '1.2rem' : '1.6rem', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {customTitle || 'Bingotenango'}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', zIndex: 2, fontSize: '0.85rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {customSubtitle || 'Editorial Lluvia de Ideas'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Paleta Cromática y Sellos de Marcado */}
          <div className="bingo-grid-2">
            
            {/* Paleta de Colores Dinámica */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>🌈</span> Paleta de Colores Dinámica</h3>
              </div>
              <p className="bingo-card-subtitle">
                Los colores elegidos se aplicarán a la tómbola, botones principales y acentos de los cartones.
              </p>

              <div className="bingo-grid-3">
                <div className="bingo-color-card">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Color Principal</span>
                  <div className="bingo-color-input-wrapper">
                    <div className="bingo-color-swatch" style={{ background: primaryColor }}>
                      <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                    </div>
                    <input type="text" className="bingo-input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                  </div>
                </div>

                <div className="bingo-color-card">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Color de Acento</span>
                  <div className="bingo-color-input-wrapper">
                    <div className="bingo-color-swatch" style={{ background: accentColor }}>
                      <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                    </div>
                    <input type="text" className="bingo-input" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
                  </div>
                </div>

                <div className="bingo-color-card">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Fondo de Partida</span>
                  <div className="bingo-color-input-wrapper">
                    <div className="bingo-color-swatch" style={{ background: backgroundColor }}>
                      <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                    </div>
                    <input type="text" className="bingo-input" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Previsualización en Vivo de Botones */}
              <div style={{
                background: backgroundColor,
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isBgLight(backgroundColor) ? '#0f172a' : '#ffffff' }}>
                  Contraste:
                </span>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: primaryColor,
                    color: getTextColorForBg(primaryColor),
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  Botón Primario
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: accentColor,
                    color: getTextColorForBg(accentColor),
                    fontWeight: 700,
                    fontSize: '0.82rem'
                  }}
                >
                  Botón Acento
                </button>
              </div>

              {/* Selector de Tema de Cartón */}
              <div className="bingo-form-group">
                <label>Tema del Cartón de Jugador:</label>
                <select 
                  className="bingo-select"
                  value={cardTheme}
                  onChange={e => setCardTheme(e.target.value as BingoCustomization['cardTheme'])}
                >
                  <option value="classic">Clásico Místico (Fondo translúcido adaptable)</option>
                  <option value="cyberpunk">Cyberpunk / Gamer (Fondos oscuros y neones)</option>
                  <option value="light">Luz Diurna (Fondo blanco pulcro)</option>
                  <option value="dark">Modo Oscuro Profundo</option>
                </select>
              </div>
            </div>

            {/* Sello de Marcado y Presets de 1 Clic */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>⭐</span> Sello de Marcado & Presets</h3>
              </div>
              <p className="bingo-card-subtitle">
                Ficha con la que los jugadores marcarán las casillas en sus pantallas y temas de diseño rápidos.
              </p>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Emojis Rápidos:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    {MARKER_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMarkerEmoji(opt)}
                        className={`bingo-col-btn ${markerEmoji === opt ? 'active' : ''}`}
                        style={{ padding: '6px', fontSize: '1.2rem', textAlign: 'center' }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    className="bingo-input"
                    value={MARKER_OPTIONS.includes(markerEmoji) ? '' : markerEmoji}
                    onChange={e => setMarkerEmoji(e.target.value.trim() || '⭐')}
                    placeholder="O escribe otro emoji..."
                    maxLength={2}
                  />
                </div>

                {/* Previsualización del Sello en Celda */}
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '14px',
                  background: primaryColor,
                  color: getTextColorForBg(primaryColor),
                  border: `2px solid ${accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}>
                  24
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    opacity: 0.45,
                    pointerEvents: 'none'
                  }}>
                    {markerEmoji}
                  </span>
                </div>
              </div>

              {/* Presets Rápidos de 1 Clic */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Cargar Tema en 1 Clic:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="bingo-btn-action"
                      style={{ justifyContent: 'space-between', padding: '10px 12px' }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.primaryColor }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.accentColor }} />
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={restoreToDefaults}
                  className="bingo-btn-action danger-outline"
                  style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}
                >
                  🔄 Restaurar Estilos Clásicos de Fábrica
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          PESTAÑA 3: FIGURAS DE CARTÓN (MAPEOS)
         ------------------------------------------------------------------ */}
      {activeTab === 'figuras' && (
        <div className="bingo-section-pane">
          <div className="bingo-grid-2">
            
            {/* Formulario de Asignación */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>🏷️</span> Mapear Número a Figura</h3>
              </div>
              <p className="bingo-card-subtitle">
                Reemplaza cualquier número del 1 al 75 por un emoji o ilustración guatemalteca para cantar bolas temáticas.
              </p>

              <div className="bingo-grid-2">
                <div className="bingo-form-group">
                  <label>Número a Reemplazar (1 - 75)</label>
                  <input
                    type="number"
                    min="1"
                    max="75"
                    className="bingo-input"
                    value={mappingNum}
                    onChange={e => setMappingNum(Math.max(1, Math.min(75, parseInt(e.target.value) || 1)))}
                  />
                </div>

                <div className="bingo-form-group">
                  <label>Tipo de Figura</label>
                  <select
                    className="bingo-select"
                    value={mappingType}
                    onChange={e => {
                      const t = e.target.value as 'emoji' | 'image';
                      setMappingType(t);
                      setMappingVal(t === 'emoji' ? '🌳' : '');
                    }}
                  >
                    <option value="emoji">Emoji Predefinido</option>
                    <option value="image">Imagen / Foto de Dispositivo</option>
                  </select>
                </div>
              </div>

              {mappingType === 'emoji' ? (
                <div className="bingo-form-group">
                  <label>Selecciona un Emoji Rápido:</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {PRESETS_MAP.map(p => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setMappingVal(p.value);
                          setMappingLabel(p.label);
                        }}
                        className={`bingo-col-btn ${mappingVal === p.value ? 'active' : ''}`}
                      >
                        {p.value} {p.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="bingo-input"
                    value={mappingVal}
                    onChange={e => setMappingVal(e.target.value)}
                    placeholder="O pega tu propio emoji aquí..."
                  />
                </div>
              ) : (
                <div className="bingo-form-group">
                  <label>Subir Imagen Pequeña (WebP Optimizado):</label>
                  <div className="bingo-upload-dropzone" onClick={() => document.getElementById('figure-file-input')?.click()}>
                    {mappingVal && mappingType === 'image' ? (
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden' }}>
                        <img src={mappingVal} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '1.8rem' }}>🖼️</span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Elegir ilustración cuadrada</span>
                    <input
                      type="file"
                      id="figure-file-input"
                      accept="image/*"
                      onChange={e => handleOptimizedUpload(e, 120, 120, setMappingVal)}
                      style={{ display: 'none' }}
                    />
                    <button type="button" className="bingo-btn-action">Seleccionar Foto</button>
                  </div>
                </div>
              )}

              <div className="bingo-form-group">
                <label>Nombre o Etiqueta de la Figura (Para el Locutor)</label>
                <input
                  type="text"
                  className="bingo-input"
                  value={mappingLabel}
                  onChange={e => setMappingLabel(e.target.value)}
                  placeholder="Ej: Ceiba, Quetzal, Volcán de Fuego..."
                />
              </div>

              <button
                type="button"
                onClick={addMapping}
                className="bingo-btn-action primary"
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                ➕ Guardar Figura para la Bola #{mappingNum}
              </button>
            </div>

            {/* Listado y Filtros de Figuras Activas */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title">
                  <span>📋</span> Figuras Mapeadas ({Object.keys(numberToImageMap).length} de 75)
                </h3>
              </div>

              {/* Filtro por Columna B-I-N-G-O y Búsqueda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="bingo-col-filters">
                  {(['ALL', 'B', 'I', 'N', 'G', 'O'] as const).map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedFigureCol(col)}
                      className={`bingo-col-btn ${selectedFigureCol === col ? 'active' : ''}`}
                    >
                      {col === 'ALL' ? 'Todas (1-75)' : `Columna ${col}`}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="bingo-input"
                  placeholder="Buscar por número o nombre de figura..."
                  value={figureSearch}
                  onChange={e => setFigureSearch(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {filteredMappings.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No hay figuras mapeadas con este criterio de filtro.
                  </div>
                ) : (
                  filteredMappings.map(([numStr, map]) => {
                    const num = parseInt(numStr);
                    return (
                      <div
                        key={numStr}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          textAlign: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => removeMapping(num)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                          title="Eliminar mapeo"
                        >
                          ✕
                        </button>
                        <strong style={{ color: primaryColor, fontSize: '0.78rem' }}>#{num}</strong>
                        <div style={{ margin: '4px 0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {map.type === 'emoji' ? (
                            <span style={{ fontSize: '1.8rem' }}>{map.value}</span>
                          ) : (
                            <img src={map.value} alt={map.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                          {map.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------
          PESTAÑA 4: TAQUILLA, PASES & COBROS (GUATEMALA)
         ------------------------------------------------------------------ */}
      {activeTab === 'acceso' && (
        <div className="bingo-section-pane">
          
          {/* Fila Superior: Reglas de Entrada + Datos Bancarios de Guatemala */}
          <div className="bingo-grid-2" style={{ marginBottom: '24px' }}>
            
            {/* Tarjeta 1: Modo de Acceso & Precio Oficial del Cartón */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>🔒</span> Acceso & Precio Oficial de Taquilla</h3>
              </div>
              <p className="bingo-card-subtitle">
                Define el costo en Quetzales para esta partida y las reglas de entrada a la sala de juego.
              </p>

              {/* Selector de Modo de Acceso */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <label style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${accessMode === 'code' ? '#10b981' : '#e2e8f0'}`,
                  background: accessMode === 'code' ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === 'code'}
                    onChange={() => setAccessMode('code')}
                    style={{ accentColor: '#10b981' }}
                  />
                  <strong style={{ display: 'block', fontSize: '0.86rem', marginTop: '4px', color: '#0f172a' }}>🎟️ Pase Oficial Requerido</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Solo ingresan con token o enlace de compra/taquilla.</span>
                </label>

                <label style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `2px solid ${accessMode === 'free' ? primaryColor : '#e2e8f0'}`,
                  background: accessMode === 'free' ? `${primaryColor}08` : '#ffffff',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="accessMode"
                    checked={accessMode === 'free'}
                    onChange={() => setAccessMode('free')}
                    style={{ accentColor: primaryColor }}
                  />
                  <strong style={{ display: 'block', fontSize: '0.86rem', marginTop: '4px', color: '#0f172a' }}>🟢 Acceso Libre / Abierto</strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cualquiera entra solo con su Nickname sin cobrar boleto.</span>
                </label>
              </div>

              {/* Fijación de Precio Oficial por Cartón (Q) */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    💵 Costo Oficial del Cartón en Quetzales (Q):
                  </label>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981' }}>Q {cardPriceQ}.00 c/u</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {[10, 25, 50, 100].map(tierP => (
                    <button
                      key={tierP}
                      type="button"
                      onClick={() => setCardPriceQ(tierP)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: cardPriceQ === tierP ? '2px solid #10b981' : '1px solid #cbd5e1',
                        background: cardPriceQ === tierP ? '#dcfce7' : '#ffffff',
                        color: cardPriceQ === tierP ? '#15803d' : '#334155',
                        fontWeight: 'bold',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Q {tierP}.00
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>O ingresa un monto personalizado:</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    className="bingo-input"
                    value={cardPriceQ}
                    onChange={e => setCardPriceQ(Math.max(1, parseInt(e.target.value) || 25))}
                    style={{ width: '90px', padding: '4px 8px', fontSize: '0.84rem', fontWeight: 'bold' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(Se sincroniza con la tómbola y la tienda de boletos)</span>
                </div>
              </div>

              {/* Formulario de Captura de Jugador */}
              <div className="bingo-form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.82rem' }}>Datos Requeridos al Registrar Jugador:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>📱 Capturar Número de WhatsApp</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={fieldPhoneEnabled}
                          onChange={e => {
                            setFieldPhoneEnabled(e.target.checked);
                            if (!e.target.checked) setFieldPhoneRequired(false);
                          }}
                          style={{ accentColor: primaryColor }}
                        /> Habilitar
                      </label>
                      {fieldPhoneEnabled && (
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="checkbox"
                            checked={fieldPhoneRequired}
                            onChange={e => setFieldPhoneRequired(e.target.checked)}
                            style={{ accentColor: primaryColor }}
                          /> Obligatorio (*)
                        </label>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>📍 Capturar Ciudad / Departamento</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={fieldLocationEnabled}
                          onChange={e => {
                            setFieldLocationEnabled(e.target.checked);
                            if (!e.target.checked) setFieldLocationRequired(false);
                          }}
                          style={{ accentColor: primaryColor }}
                        /> Habilitar
                      </label>
                      {fieldLocationEnabled && (
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="checkbox"
                            checked={fieldLocationRequired}
                            onChange={e => setFieldLocationRequired(e.target.checked)}
                            style={{ accentColor: primaryColor }}
                          /> Obligatorio (*)
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Tarjeta 2: Datos Bancarios de Guatemala para Transferencia y Efectivo */}
            <div className="bingo-card">
              <div className="bingo-card-header">
                <h3 className="bingo-card-title"><span>🇬🇹</span> Datos de Cobro Local (Guatemala)</h3>
              </div>
              <p className="bingo-card-subtitle">
                Datos de depósito y WhatsApp que ven los compradores al seleccionar pago por transferencia o en efectivo.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Banco en Guatemala:</span>
                  <input
                    type="text"
                    className="bingo-input"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="Ej: Banco Industrial, Banrural, BAC"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Tipo de Cuenta:</span>
                  <select
                    className="bingo-input"
                    value={bankAccountType}
                    onChange={e => setBankAccountType(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="Monetaria">Cuenta Monetaria</option>
                    <option value="Ahorro">Cuenta de Ahorro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Número de Cuenta:</span>
                  <input
                    type="text"
                    className="bingo-input"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                    placeholder="Ej: 004-0012345-6"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Nombre del Titular:</span>
                  <input
                    type="text"
                    className="bingo-input"
                    value={bankAccountOwner}
                    onChange={e => setBankAccountOwner(e.target.value)}
                    placeholder="Ej: Editorial Lluvia de Ideas"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>📱 WhatsApp Oficial de Taquilla (para recibir comprobantes):</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#16a34a' }}>+502</span>
                  <input
                    type="text"
                    className="bingo-input"
                    value={whatsappTaquilla}
                    onChange={e => setWhatsappTaquilla(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 36135616"
                    style={{ fontSize: '0.82rem', flex: 1 }}
                  />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Mensaje de Instrucciones para el Jugador:</span>
                <textarea
                  rows={2}
                  className="bingo-textarea"
                  value={paymentInstructions}
                  onChange={e => setPaymentInstructions(e.target.value)}
                  placeholder="Ej: Realiza tu transferencia o depósito bancario y envía tu boleta a nuestro WhatsApp para recibir tu pase oficial al instante."
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              {/* Bot de Telegram & Automatizaciones Integradas */}
              <div style={{ marginTop: '14px', background: 'rgba(34, 158, 217, 0.08)', border: '1px solid rgba(34, 158, 217, 0.3)', borderRadius: '10px', padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🤖</span> Bot Oficial de Telegram Activo
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>
                      @Bingotenangobot entrega pases con 1 clic de forma autónoma.
                    </span>
                  </div>
                  <a
                    href="https://t.me/Bingotenangobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ✈️ Abrir Bot
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Fila Inferior: Monitor y Taquilla de Pases en Tiempo Real */}
          <div className="bingo-card" style={{ width: '100%', boxSizing: 'border-box' }}>
            <div className="bingo-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 className="bingo-card-title">
                  <span>🎟️</span> Monitor de Pases & Taquilla en Vivo ({accessTokensList.length})
                </h3>
                <p className="bingo-card-subtitle" style={{ margin: 0 }}>
                  Todos los pases únicos emitidos para jugar. Puedes registrar cobros en efectivo y despachar enlaces por WhatsApp o Telegram.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                  ✓ {accessTokensList.filter(t => t.paymentMethod === 'efectivo' || !!t.paidAmount).length} Cobrados
                </span>
                <span style={{ fontSize: '0.75rem', color: '#d97706', background: '#fef3c7', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                  ⏳ {accessTokensList.filter(t => t.paymentMethod !== 'efectivo' && !t.paidAmount).length} Pendientes
                </span>
              </div>
            </div>

            {/* Filtros y Buscador */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div className="bingo-col-filters">
                {(['all', 'paid', 'pending'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTokenStatusFilter(f)}
                    className={`bingo-col-btn ${tokenStatusFilter === f ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {f === 'all' && `Todos (${accessTokensList.length})`}
                    {f === 'paid' && `Cobrados (${accessTokensList.filter(t => t.paymentMethod === 'efectivo' || !!t.paidAmount).length})`}
                    {f === 'pending' && `Pendientes (${accessTokensList.filter(t => t.paymentMethod !== 'efectivo' && !t.paidAmount).length})`}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="bingo-input"
                placeholder="Buscar por jugador, teléfono o ID de pase..."
                value={tokenSearchQuery}
                onChange={e => setTokenSearchQuery(e.target.value)}
                style={{ width: '280px', fontSize: '0.82rem' }}
              />
            </div>

            {/* Tabla de Pases de Taquilla */}
            <div className="bingo-table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table className="bingo-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>PASE / ID</th>
                    <th>JUGADOR / WHATSAPP</th>
                    <th>CARTONES</th>
                    <th>TOTAL</th>
                    <th>ESTADO COBRO</th>
                    <th>ENLACE</th>
                    <th style={{ textAlign: 'right' }}>ACCIONES DE TAQUILLA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokensList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No hay pases de taquilla registrados con este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredTokensList.map(token => {
                      const isPaid = token.paymentMethod === 'efectivo' || !!token.paidAmount;
                      const priceAmount = token.paidAmount || ((token.unitPriceQ || cardPriceQ || 10) * (token.quantity || 1));
                      const cleanPhone = (token.playerWhatsapp || '').replace(/\D/g, '');

                      return (
                        <tr key={token.id}>
                          <td>
                            <code style={{ fontWeight: 700, fontSize: '0.82rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', color: '#0f172a' }}>
                              {token.id}
                            </code>
                          </td>
                          <td>
                            <strong style={{ display: 'block', color: '#0f172a' }}>{token.playerName || 'Jugador'}</strong>
                            {cleanPhone ? (
                              <a
                                href={`https://wa.me/502${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.72rem', color: '#16a34a', textDecoration: 'none' }}
                              >
                                📱 +502 {cleanPhone}
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sin WhatsApp</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: 'bold', color: '#4338ca' }}>
                              {token.quantity || 1} {token.quantity === 1 ? 'Cartón' : 'Cartones'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>
                              {token.tierName || 'Oficial'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#059669', fontSize: '0.86rem' }}>
                              Q {priceAmount}.00
                            </strong>
                          </td>
                          <td>
                            {isPaid ? (
                              <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>
                                ✓ {token.paymentMethod === 'efectivo' ? 'Efectivo' : 'Pagado'}
                              </span>
                            ) : (
                              <span style={{ color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }}>
                                ⏳ Pendiente
                              </span>
                            )}
                          </td>
                          <td>
                            {token.linkSent ? (
                              <span style={{ color: '#0284c7', background: 'rgba(2, 132, 199, 0.12)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                📲 Despachado ({token.linkSentCount || 1})
                              </span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                No enviado
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmCashToken(token)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: '#dcfce7',
                                    border: '1px solid #86efac',
                                    color: '#15803d',
                                    fontSize: '0.72rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                  title="Marcar como cobrado en efectivo"
                                >
                                  💵 Cobrar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppToken(token)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  border: '1px solid rgba(34, 197, 94, 0.4)',
                                  color: '#16a34a',
                                  fontSize: '0.72rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                                title="Enviar enlace de acceso oficial por WhatsApp"
                              >
                                📲 WhatsApp
                              </button>

                              <a
                                href={`https://t.me/Bingotenangobot?start=${token.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(34, 158, 217, 0.15)',
                                  border: '1px solid rgba(34, 158, 217, 0.4)',
                                  color: '#0284c7',
                                  fontSize: '0.72rem',
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Abrir y despachar en Telegram (@Bingotenangobot)"
                              >
                                ✈️ Telegram
                              </a>

                              <button
                                type="button"
                                onClick={() => handleCopyTokenLink(token.id)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer'
                                }}
                                title="Copiar enlace de juego al portapapeles"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------
          PESTAÑA 5: PREMIOS & PATROCINADORES
         ------------------------------------------------------------------ */}
      {activeTab === 'premios_marcas' && (
        <div className="bingo-section-pane">
          
          {/* SECCIÓN 1: CATÁLOGO DE PREMIOS */}
          <div className="bingo-card">
            <div className="bingo-card-header">
              <h3 className="bingo-card-title"><span>🏆</span> Galería de Premios del Bingo</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {prizesList.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrizesList([
                        {
                          id: 'p1',
                          title: '🥇 Smart TV 55" 4K UHD',
                          description: 'Pantalla inteligente de alta resolución con sonido envolvente para el ganador principal.',
                          image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=60',
                          category: 'Tecnología',
                          order: 3
                        },
                        {
                          id: 'p2',
                          title: '🥈 Tablet Educativa 10"',
                          description: 'Tablet de alto rendimiento ideal para estudio y lectura digital.',
                          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
                          category: 'Estudio',
                          order: 2
                        },
                        {
                          id: 'p3',
                          title: '🥉 Colección de Libros Lluvia de Ideas',
                          description: 'Paquete de libros infantiles y juveniles ilustrados con historias mágicas.',
                          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=60',
                          category: 'Editorial',
                          order: 1
                        }
                      ]);
                    }}
                    className="bingo-btn-action primary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    ✨ Cargar Ejemplos en 1 Clic
                  </button>
                )}
              </div>
            </div>

            <div className="bingo-grid-2">
              {/* Formulario de Crear / Editar Premio */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPrizeTitle.trim()) return;

                if (editingPrizeId) {
                  setPrizesList(prev => prev.map(p => p.id === editingPrizeId ? {
                    ...p,
                    title: newPrizeTitle.trim(),
                    description: newPrizeDesc.trim(),
                    image: newPrizeImage.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
                    category: newPrizeCategory.trim() || 'General',
                    order: Number(newPrizeOrder) || 1
                  } : p));
                  setEditingPrizeId(null);
                } else {
                  const newPrize: BingoPrize = {
                    id: Date.now().toString(),
                    title: newPrizeTitle.trim(),
                    description: newPrizeDesc.trim(),
                    image: newPrizeImage.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
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
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div className="bingo-form-group">
                  <label>Título del Premio *</label>
                  <input
                    type="text"
                    className="bingo-input"
                    value={newPrizeTitle}
                    onChange={e => setNewPrizeTitle(e.target.value)}
                    placeholder="Ej: Smart TV 55 pulgadas / Bicicleta de Montaña"
                    required
                  />
                </div>

                <div className="bingo-form-group">
                  <label>Descripción del Premio</label>
                  <textarea
                    rows={2}
                    className="bingo-textarea"
                    value={newPrizeDesc}
                    onChange={e => setNewPrizeDesc(e.target.value)}
                    placeholder="Detalles técnicos, marca o especificaciones..."
                  />
                </div>

                <div className="bingo-grid-2">
                  <div className="bingo-form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      className="bingo-input"
                      value={newPrizeCategory}
                      onChange={e => setNewPrizeCategory(e.target.value)}
                      placeholder="Ej: Tecnología, Libros, Hogar"
                    />
                  </div>

                  <div className="bingo-form-group">
                    <label>Jerarquía / Nivel (1 = Menor, 3 = Mayor)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="bingo-input"
                      value={newPrizeOrder}
                      onChange={e => setNewPrizeOrder(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="bingo-form-group">
                  <label>Foto del Premio (Subir o URL WebP):</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="bingo-input"
                      value={newPrizeImage}
                      onChange={e => setNewPrizeImage(e.target.value)}
                      placeholder="URL HTTPS de imagen o sube archivo ->"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('prize-photo-input')?.click()}
                      className="bingo-btn-action"
                    >
                      Examinar
                    </button>
                    <input
                      type="file"
                      id="prize-photo-input"
                      accept="image/*"
                      onChange={e => handleOptimizedUpload(e, 800, 800, setNewPrizeImage)}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {editingPrizeId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPrizeId(null);
                        setNewPrizeTitle('');
                        setNewPrizeDesc('');
                        setNewPrizeImage('');
                      }}
                      className="bingo-btn-action"
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bingo-btn-action primary"
                    style={{ flex: 2, justifyContent: 'center' }}
                  >
                    {editingPrizeId ? '✏️ Actualizar Premio' : '➕ Agregar Premio al Catálogo'}
                  </button>
                </div>
              </form>

              {/* Lista de Premios con Selector de Premio Activo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  Premios Configurados ({prizesList.length}):
                </label>

                {prizesList.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '14px' }}>
                    No hay premios registrados aún. Agrega uno o carga los ejemplos.
                  </div>
                ) : (
                  [...prizesList].sort((a, b) => (b.order || 0) - (a.order || 0)).map(prize => {
                    const isCurrentlyPlaying = activeGame?.currentPrizeId === prize.id;

                    return (
                      <div
                        key={prize.id}
                        style={{
                          background: isCurrentlyPlaying ? 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' : '#ffffff',
                          border: `1.5px solid ${isCurrentlyPlaying ? primaryColor : '#e2e8f0'}`,
                          borderRadius: '14px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: isCurrentlyPlaying ? `0 4px 14px ${primaryColor}22` : 'none'
                        }}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                          <img src={prize.image} alt={prize.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: primaryColor, background: `${primaryColor}15`, padding: '2px 6px', borderRadius: '6px' }}>
                              Nivel #{prize.order}
                            </span>
                            {isCurrentlyPlaying && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '6px' }}>
                                🎯 EN JUEGO AHORA
                              </span>
                            )}
                          </div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prize.title}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prize.description}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleSetActivePrize(prize.id, prize.title)}
                            className="bingo-btn-action"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.72rem',
                              background: isCurrentlyPlaying ? primaryColor : '#f8fafc',
                              color: isCurrentlyPlaying ? '#ffffff' : '#334155',
                              border: '1px solid #cbd5e1'
                            }}
                            title="Pone este premio en la pantalla principal de la tómbola para la ronda actual"
                          >
                            {isCurrentlyPlaying ? '✓ Activo' : 'Poner en Juego'}
                          </button>
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
                            className="bingo-btn-action"
                            style={{ padding: '6px 8px' }}
                            title="Editar premio"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrizesList(prev => prev.filter(p => p.id !== prize.id))}
                            className="bingo-btn-action danger-outline"
                            style={{ padding: '6px 8px' }}
                            title="Eliminar premio"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: MARCAS PATROCINADORAS */}
          <div className="bingo-card">
            <div className="bingo-card-header">
              <h3 className="bingo-card-title"><span>📢</span> Publicidad & Marcas Patrocinadoras</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Activar Publicidad:</span>
                <input
                  type="checkbox"
                  checked={sponsorActive}
                  onChange={e => setSponsorActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: primaryColor }}
                />
              </div>
            </div>

            <div className="bingo-grid-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="bingo-grid-2">
                  <div className="bingo-form-group">
                    <label>Frecuencia de Muestra:</label>
                    <select
                      className="bingo-select"
                      value={sponsorInterval}
                      onChange={e => setSponsorInterval(parseInt(e.target.value) || 5)}
                      disabled={!sponsorActive}
                    >
                      <option value={3}>Cada 3 balotas cantadas</option>
                      <option value={5}>Cada 5 balotas (Recomendado)</option>
                      <option value={8}>Cada 8 balotas cantadas</option>
                      <option value={10}>Cada 10 balotas cantadas</option>
                    </select>
                  </div>

                  <div className="bingo-form-group">
                    <label>Modo de Exposición:</label>
                    <select
                      className="bingo-select"
                      value={sponsorMode}
                      onChange={e => setSponsorMode(e.target.value as 'integrated' | 'modal')}
                      disabled={!sponsorActive}
                    >
                      <option value="modal">💥 Modal Emergente 4s (Alta Visibilidad)</option>
                      <option value="integrated">🔮 Holograma Ticker Sutil</option>
                    </select>
                  </div>
                </div>

                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={sponsorAudioAnnounce}
                    onChange={e => setSponsorAudioAnnounce(e.target.checked)}
                    disabled={!sponsorActive}
                    style={{ accentColor: primaryColor }}
                  />
                  <span>Mencionar patrocinador por voz del anunciador al cantar la bola</span>
                </label>

                {/* Formulario de Agregar Marca */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>➕ Registrar Marca Patrocinadora:</strong>
                  
                  <div className="bingo-grid-2">
                    <input
                      type="text"
                      className="bingo-input"
                      placeholder="Nombre de la marca (ej: Pepsi, Banco X)"
                      value={newSponsorName}
                      onChange={e => setNewSponsorName(e.target.value)}
                      disabled={!sponsorActive}
                    />
                    <input
                      type="text"
                      className="bingo-input"
                      placeholder="Eslogan corto (ej: ¡El sabor del juego!)"
                      value={newSponsorMessage}
                      onChange={e => setNewSponsorMessage(e.target.value)}
                      disabled={!sponsorActive}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {newSponsorLogo ? (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <img src={newSponsorLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>🏷️</span>
                    )}
                    <button
                      type="button"
                      onClick={() => document.getElementById('sponsor-logo-file')?.click()}
                      className="bingo-btn-action"
                      disabled={!sponsorActive}
                      style={{ flex: 1 }}
                    >
                      Subir Logo (WebP)
                    </button>
                    <input
                      type="file"
                      id="sponsor-logo-file"
                      accept="image/*"
                      onChange={e => handleOptimizedUpload(e, 400, 400, setNewSponsorLogo)}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={addSponsor}
                      className="bingo-btn-action primary"
                      disabled={!sponsorActive}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de Marcas Registradas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Marcas Registradas ({sponsorsList.length}):</label>
                {sponsorsList.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No hay marcas registradas. Carga patrocinadores para mostrarlos durante la partida.
                  </div>
                ) : (
                  sponsorsList.map(s => (
                    <div
                      key={s.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{s.name}</strong>
                          {s.message && <span style={{ fontSize: '0.74rem', color: '#64748b' }}>"{s.message}"</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSponsor(s.id)}
                        className="bingo-btn-action danger-outline"
                        style={{ padding: '4px 8px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------
          PESTAÑA 6: PROMOTORES DE VENTA
         ------------------------------------------------------------------ */}
      {activeTab === 'promotores' && (
        <div className="bingo-section-pane">
          
          {/* Métricas Globales de Promotores */}
          <div className="bingo-grid-3">
            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase' }}>Promotores Registrados</span>
              <strong style={{ fontSize: '1.8rem', color: '#1e3a8a', display: 'block', margin: '4px 0' }}>{promotersList.length}</strong>
              <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>{promotersList.filter(p => p.active).length} activos actualmente</span>
            </div>

            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '0.74rem', color: '#7e22ce', fontWeight: 800, textTransform: 'uppercase' }}>Jugadores Afiliados</span>
              <strong style={{ fontSize: '1.8rem', color: '#581c87', display: 'block', margin: '4px 0' }}>
                {registeredCardsList.filter(c => c.promoterCode).length}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#9333ea' }}>Inscritos con código de vendedor</span>
            </div>

            <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Comisiones Estimadas</span>
              <strong style={{ fontSize: '1.8rem', color: '#14532d', display: 'block', margin: '4px 0' }}>
                {promotersList.reduce((acc, p) => {
                  const count = registeredCardsList.filter(c => c.promoterCode === p.id).length;
                  return acc + (count * (p.commission || 0));
                }, 0).toLocaleString()}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Total a liquidar por ventas</span>
            </div>
          </div>

          {/* Formulario de Creación de Promotor */}
          <div className="bingo-card">
            <div className="bingo-card-header">
              <h3 className="bingo-card-title"><span>📢</span> Crear Código de Promotor de Ventas</h3>
            </div>
            <p className="bingo-card-subtitle">
              Genera enlaces con código de referido para promotores y lleva el control de comisiones por cada cartón vendido.
            </p>

            <div className="bingo-grid-3">
              <div className="bingo-form-group">
                <label>Código del Promotor (Ej: PROMO10, JUAN2026) *</label>
                <input
                  type="text"
                  className="bingo-input"
                  value={newPromoterCode}
                  onChange={e => setNewPromoterCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO ÚNICO"
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                />
              </div>

              <div className="bingo-form-group">
                <label>Nombre del Vendedor / Aliado *</label>
                <input
                  type="text"
                  className="bingo-input"
                  value={newPromoterName}
                  onChange={e => setNewPromoterName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="bingo-form-group">
                <label>Contacto / WhatsApp</label>
                <input
                  type="text"
                  className="bingo-input"
                  value={newPromoterContact}
                  onChange={e => setNewPromoterContact(e.target.value)}
                  placeholder="Ej: 5555-1234"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', marginTop: '4px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Comisión Acordada por Cartón Vendido:
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="bingo-input"
                  value={newPromoterCommission}
                  onChange={e => setNewPromoterCommission(parseFloat(e.target.value) || '')}
                  placeholder="Ej: 500 (monto en moneda local por cada cartón)"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPromoter}
                className="bingo-btn-action primary"
                style={{ height: '41px', padding: '0 24px' }}
              >
                ➕ Registrar Promotor
              </button>
            </div>
          </div>

          {/* Tabla de Promotores */}
          <div className="bingo-card">
            <div className="bingo-card-header">
              <h3 className="bingo-card-title"><span>📋</span> Promotores y Enlaces de Afiliados ({promotersList.length})</h3>
            </div>

            <div className="bingo-table-wrapper">
              <table className="bingo-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Promotor</th>
                    <th>Contacto</th>
                    <th>Comisión / Cartón</th>
                    <th>Afiliados</th>
                    <th>Total Generado</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promotersList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No hay promotores registrados. Crea uno arriba para empezar a rastrear ventas.
                      </td>
                    </tr>
                  ) : (
                    promotersList.map(p => {
                      const count = registeredCardsList.filter(c => c.promoterCode === p.id).length;
                      const refLink = `${window.location.origin}/juegos/bingo?promoter=${p.id}`;
                      const totalEarnings = count * (p.commission || 0);

                      return (
                        <tr key={p.id}>
                          <td>
                            <code style={{ fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                              📢 {p.id}
                            </code>
                          </td>
                          <td><strong>{p.promoterName}</strong></td>
                          <td style={{ color: '#64748b' }}>{p.contact || '--'}</td>
                          <td>{p.commission ? `${p.commission}` : 'Sin comisión'}</td>
                          <td>
                            <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem' }}>
                              👥 {count} Jugadores
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#16a34a' }}>
                              {totalEarnings > 0 ? `${totalEarnings.toLocaleString()}` : '--'}
                            </strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleTogglePromoterStatus(p)}
                              style={{
                                border: 'none',
                                background: p.active ? '#dcfce7' : '#fee2e2',
                                color: p.active ? '#15803d' : '#b91c1c',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              {p.active ? '🟢 Activo' : '🔴 Inactivo'}
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(refLink);
                                  showAlert(`Enlace de afiliado copiado:\n${refLink}`, "Enlace Copiado", "🔗");
                                }}
                                className="bingo-btn-action"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                title="Copiar enlace de WhatsApp para este promotor"
                              >
                                🔗 Link
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePromoter(p.id, p.promoterName)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                                title="Eliminar promotor"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ====================================================================
          MÓDULO 7: PASARELA DE PAGO RECURRENTE (TIENDA DE BOLETOS)
         ==================================================================== */}
      {activeTab === 'pasarela' && (
        <div className="bingo-tab-content animate-fade-in">
          
          {/* Header de la Pasarela */}
          <div className="admin-card" style={{ borderLeft: '4px solid #10b981', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🇬🇹</span> Pasarela de Pago Recurrente (Guatemala)
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Configuración oficial para la venta en línea de boletos de Bingotenango con tarjetas de crédito/débito y transferencias bancarias.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href="/juegos/bingo/boletos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                >
                  🌐 Ver Tienda de Boletos
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/juegos/bingo/boletos`);
                    showAlert("Enlace de la tienda copiado al portapapeles: " + `${window.location.origin}/juegos/bingo/boletos`, "Enlace Copiado", "📋");
                  }}
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981', fontSize: '0.82rem' }}
                >
                  📋 Copiar Enlace Público
                </button>
              </div>
            </div>
          </div>

          {/* Guía de Configuración Rápida */}
          <div className="admin-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#166534', fontSize: '0.95rem' }}>
              💡 ¿Cómo obtener los Links de Pago y asegurar el idioma en Español en Recurrente?
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#15803d', lineHeight: '1.6' }}>
              <li>Inicia sesión en tu cuenta de <a href="https://app.recurrente.com" target="_blank" rel="noopener noreferrer" style={{ color: '#166534', fontWeight: 'bold' }}>app.recurrente.com</a>.</li>
              <li>
                <strong>Configuración de Idioma:</strong> Ve a tu <em>Perfil / Ajustes de Cuenta</em> en la esquina inferior izquierda y confirma que el idioma de tu cuenta esté seleccionado en <strong>Español</strong>.
              </li>
              <li>Ve a la sección <strong>"Cobros / Links de Pago"</strong> y crea los 4 productos con los precios correspondientes: <strong>Q10, Q25, Q50 y Q100</strong> (con títulos en español: <em>Cartón Bronce</em>, <em>Cartón Plata</em>, etc.).</li>
              <li>En cada producto, en el campo <strong>"URL de redirección al pagar con éxito"</strong>, coloca exactamente:  
                <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
                  {window.location.origin}/juegos/bingo/boletos/confirmacion
                </code>
              </li>
              <li>Copia el enlace que te genera Recurrente para cada uno y pégalo en las casillas de abajo.</li>
            </ol>
            <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '8px', fontSize: '0.78rem', color: '#166534' }}>
              🌐 <strong>Optimización Automática:</strong> El sistema inyecta automáticamente los parámetros <code>locale=es</code> y cabeceras en español en el checkout dinámico y en los enlaces de pago para garantizar la interfaz en español a los compradores.
            </div>
          </div>

          {/* Formulario de Links de Recurrente */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#1e293b' }}>
              Enlaces de Cobro de Recurrente por Tipo de Cartón / Premio
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Cartón Bronce Q10 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>🥉 Cartón Bronce</strong>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>Q 10.00 c/u</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>Ronda Rápida / Premios Estándar</p>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://app.recurrente.com/s/tu-link-bronce-q10"
                  value={recurrenteLinks['tier-10'] || ''}
                  onChange={(e) => setRecurrenteLinks(prev => ({ ...prev, 'tier-10': e.target.value }))}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Cartón Plata Q25 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>🥈 Cartón Plata (Popular)</strong>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>Q 25.00 c/u</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>Ronda Estándar / Premios Intermedios</p>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://app.recurrente.com/s/tu-link-plata-q25"
                  value={recurrenteLinks['tier-25'] || ''}
                  onChange={(e) => setRecurrenteLinks(prev => ({ ...prev, 'tier-25': e.target.value }))}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Cartón Oro Q50 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #fef08a', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>🥇 Cartón Oro (Destacado)</strong>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#d97706', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>Q 50.00 c/u</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>Grandes Premios / Tecnología</p>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://app.recurrente.com/s/tu-link-oro-q50"
                  value={recurrenteLinks['tier-50'] || ''}
                  onChange={(e) => setRecurrenteLinks(prev => ({ ...prev, 'tier-50': e.target.value }))}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Cartón Diamante VIP Q100 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #c084fc', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>💎 Cartón Diamante VIP</strong>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#9333ea', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>Q 100.00 c/u</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>Premio Mayor / Gran Pozo VIP</p>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://app.recurrente.com/s/tu-link-diamante-q100"
                  value={recurrenteLinks['tier-100'] || ''}
                  onChange={(e) => setRecurrenteLinks(prev => ({ ...prev, 'tier-100': e.target.value }))}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

            </div>

            <button
              type="button"
              onClick={handleSaveRecurrenteLinks}
              disabled={isSavingGateways}
              className="btn btn-primary"
              style={{ padding: '12px 24px', background: '#10b981', borderColor: '#10b981', fontSize: '0.95rem', fontWeight: 'bold' }}
            >
              {isSavingGateways ? 'Guardando...' : '💾 Guardar Links de Cobro de Recurrente'}
            </button>
          </div>

        </div>
      )}

      {/* ====================================================================
          4. BARRA DE GUARDADO FLOTANTE (STICKY FOOTER ACTION BAR)
         ==================================================================== */}
      <div className="bingo-sticky-footer">
        <div className="bingo-footer-status">
          <span style={{ fontSize: '0.85rem', color: '#334155' }}>
            Partida Activa: <strong>{activeGame?.title || 'Gran Bingo Familiar'}</strong>
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            | Patrón: <strong>{winningPattern.toUpperCase()}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={saveCustomization}
          disabled={isSaving}
          className="bingo-footer-save-btn"
        >
          {isSaving ? 'Guardando en Base de Datos...' : 'Guardar Cambios Visuales y de Juego 💾'}
        </button>
      </div>

      {/* ====================================================================
          5. MODAL DE ALERTA / CONFIRMACIÓN PERSONALIZADO
         ==================================================================== */}
      {dialogConfig?.isOpen && createPortal(
        <div className="player-modal-overlay" style={{ zIndex: 999999 }} onClick={() => {
          if (dialogConfig.type === 'alert' && dialogConfig.onConfirm) {
            dialogConfig.onConfirm();
          } else if (dialogConfig.type === 'confirm' && dialogConfig.onCancel) {
            dialogConfig.onCancel();
          }
        }}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()} style={{ 
            borderColor: primaryColor || '#a855f7',
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
                  background: primaryColor || '#a855f7', 
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
