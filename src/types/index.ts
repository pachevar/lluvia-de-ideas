export interface LabModuleConfig {
  id: number;
  title: string;
  icon: string;
  competency: string;
  skills: string[];
  date?: string;
  time?: string;
  location?: string;
  type?: string;
}

export interface StoryConfig {
  id: string;
  title: string;
  role: string;
  summary: string;
  imageOverride?: string;
}

export interface HexLayer {
  type: 'color' | 'image' | 'icon' | 'text' | 'none';
  value: string; // Ej: '#4ade80', 'URL de imagen', '🌳', o 'Texto'
  color?: string; // Optional color for icons
  size?: number; // Multiplier, default 1.0
  rotation?: number; // Degrees, default 0
  offsetX?: number; // Pixels, default 0
  offsetY?: number; // Pixels, default 0
}

export interface HexInteractiveAction {
  type: 'navigate' | 'external' | 'modal' | 'none';
  target: string; // Ej: '/catalogo', 'https://...', 'story-camazotz'
}

export interface CustomHexagon {
  id: string; // Formato de coordenada precisa: "row,col" ej: "0,0" o "-1,2"
  row: number;
  col: number;
  title: string; // Para accesibilidad y tooltip
  glowColor: string;
  layerBg: HexLayer;         // Capa 1: Fondo
  layerDeco: HexLayer;       // Capa 2: Decorativa
  layerInteractive: HexLayer; // Capa 3: Interactiva (Ícono o texto)
  action: HexInteractiveAction; // Lógica de acción al hacer clic
}

export interface CreatikaConfig {
  storyMachineIntro?: string;
  colorTheoryIntro?: string;
}

export interface Tek100Config {
  numberSequencesIntro?: string;
  solarSystemIntro?: string;
}

export interface TiendaConfig {
  announcement?: string;
  whatsappPhone?: string;
}

export type BookAccent = 'cyan' | 'yellow' | 'lilac';
export type BookCategory = 'primaria' | 'basico' | 'diversificado' | 'todos';

export interface BookProduct {
  id: string;
  title: string;
  tagline: string;
  accent: BookAccent;
  category: BookCategory;
  price: number;
  description: string;
  gradeLevel: string;
  badge?: string;
  image?: string; // URL de portada (Firebase Storage)
  coverEmoji?: string; // Portada emoji de respaldo
  available?: boolean;
  featured?: boolean;
  pos?: { x: number; y: number }; // Posición en la constelación
}

export interface LandingSectionConfig {
  title?: string;
  badge?: string;
  body?: string;
  bullets?: string[];
  bgImage?: string;
}

export interface PromoVideoItem {
  id: string;
  tabLabel: string;
  icon: string;
  title: string;
  videoId: string;
  youtubeUrl?: string;
  description: string;
  bullets: string[];
  visible?: boolean;
}

export interface PromoFeatureCard {
  icon: string;
  title: string;
  description: string;
}

export interface LandingCardConfig {
  title?: string;
  badge?: string;
  kicheTag?: string;
  desc?: string;
}

export interface LandingConfig {
  cards?: {
    sutz?: LandingCardConfig;
    creatika?: LandingCardConfig;
    tek100?: LandingCardConfig;
    lab?: LandingCardConfig;
  };
  sections?: {
    sutz?: LandingSectionConfig;
    creatika?: LandingSectionConfig;
    tek100?: LandingSectionConfig;
    lab?: LandingSectionConfig;
  };
  promoVideos?: {
    mainShortId?: string;
    mainTitle?: string;
    mainBadge?: string;
    mainDescription?: string;
    mainYoutubeUrl?: string;
    featureCards?: PromoFeatureCard[];
    tipsList?: PromoVideoItem[];
  };
}

export interface PortalConfig {
  hero: {
    slogan: string;
  };
  minecraft: {
    ip: string;
    url: string;
  };
  stories: StoryConfig[];
  gateways: {
    labDesc: string;
    casaDesc: string;
  };
  laboratorios: {
    intro: string;
    modules: LabModuleConfig[];
  };
  colors: {
    primary: string;
    tertiary: string;
    'bg-main': string;
    'text-title': string;
  };
  map?: CustomHexagon[];
  creatika?: CreatikaConfig;
  tek100?: Tek100Config;
  techTreeNodes?: Record<string, TechNode>;
  tiendaConfig?: TiendaConfig;
  libros?: BookProduct[];
  landingConfig?: LandingConfig;
  archetypeImages?: Record<string, string>;
  journeyStageImages?: Record<string, string>;
  archetypesConfig?: Record<string, {
    customTitle?: string;
    customSubtitle?: string;
    customQuote?: string;
    customFunction?: string;
    image?: string;
  }>;
}

export interface TechNode {
  id: string; // "c1-n1", "c2-n1", etc.
  col: number; // 1 to 30
  indexInCol: number; // 1..3, 1..6, or 1..12
  title: string;
  shortDescription: string;
  icon: string;
  image?: string;
  category?: 'STEM' | 'HUMANIDADES' | 'APRENDIZAJE';
  parents: string[]; // parent node IDs
  resourceCost?: Partial<Record<SutzResourceKey, number>>; // Recursos del mundo virtual necesarios para desbloquear
  unlocked?: boolean;
}

// Recursos del mundo virtual de Sutz (compartidos entre el HUD del mapa y el Árbol de Tecnología)
export type SutzResourceKey = 'pergaminos' | 'puntos' | 'monedas' | 'gemas';

export interface SutzResources {
  pergaminos: number;
  puntos: number;
  monedas: number;
  gemas: number;
}


export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  image: string;
}

export interface SponsorConfig {
  active: boolean;
  interval: number;
  mode: 'integrated' | 'modal';
  audioAnnounce?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string; // base64 or URL
  message?: string;
}

export interface BingoPrize {
  id: string;
  title: string;
  description: string;
  image: string; // base64 or URL
  category?: string;
  order: number; // 1 = menor, 2 = medio, 3 = mayor, etc.
}

export interface BingoCustomization {
  headerImage?: string; // base64 or URL
  headerHeight?: number; // height in px
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  themeName: 'classic' | 'neon' | 'forest' | 'pastel';
  markerEmoji: string;
  numberToImageMap: Record<number, { type: 'emoji' | 'image'; value: string; label: string }>;
  soundTheme?: 'classic' | 'cyberpunk' | 'retro' | 'none';
  cardTheme?: 'classic' | 'cyberpunk' | 'dark' | 'light';
  sponsorConfig?: SponsorConfig;
  sponsors?: Sponsor[];
  prizes?: BingoPrize[];
  accessConfig?: {
    mode: 'free' | 'code';
    massiveMode?: boolean;
    maxOverlapThreshold?: number;
    formFields: {
      phone: { enabled: boolean; required: boolean };
      location: { enabled: boolean; required: boolean };
    };
    paymentInfo?: {
      sinpeNumber?: string;
      bankAccount?: string;
      whatsappNumber?: string;
      paymentInstructions?: string;
    };
  };
}

export interface BingoGame {
  id: string;
  title: string;
  status: 'waiting' | 'playing' | 'finished';
  drawnNumbers: number[];
  winningPattern: string; // e.g., 'full', 'line', 'four_corners'
  createdAt: number;
  active: boolean;
  customization?: BingoCustomization;
  currentPrizeId?: string;
  currentPrizeTitle?: string;
  lastResetAt?: number;
  latestWinner?: {
    playerName: string;
    prizeTitle: string;
    timestamp: number;
  };
}

export interface BingoCard {
  id: string;
  gameId: string;
  playerName: string;
  matrix: (number | null)[][]; // 5x5 matrix, center is null
  hash: string;
  createdAt: number;
  shoutedBingo?: boolean;
  shoutedAt?: number;
  winnerConfirmed?: boolean;
  phone?: string;
  location?: string;
  promoterCode?: string;
}

export interface BingoPromoter {
  id: string; // Código del promotor (ej. PROMO10)
  promoterName: string;
  contact?: string;
  commission?: number; // Comisión o compensación acordada
  createdAt: number;
  active: boolean;
}

export interface CotizacionItem {
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'producto' | 'servicio';
}

export interface Cotizacion {
  id?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  items: CotizacionItem[];
  subtotal: number;
  validDays: number;
  createdAt: number;
  expiresAt?: number;
  sealUrl?: string;
  signatureUrl?: string;
  signerName?: string;
}

export interface Inscripcion {
  id?: string;
  name: string;
  phone: string;
  school: string;
  timestamp: number;
}
