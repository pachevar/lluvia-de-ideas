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
