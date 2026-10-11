import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type ActionType = 'navigate' | 'external' | 'modal';

export interface PillarAppRoute {
  id: string;
  code?: string;
  label: string;
  target: string;
  type: ActionType;
  pillarId: string;
  isCustom?: boolean;
}

export interface PillarCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
}

export const PILLAR_CATEGORIES: PillarCategory[] = [
  { id: 'todos', name: 'Todos los Reinos & Rutas', label: 'Todos', icon: '🌐' },
  { id: 'creatika', name: 'Creatika (Artes & Humanidades)', label: 'Creatika', icon: '✨' },
  { id: '100tek', name: '100tek (Ciencia, Lógica & Tecnología)', label: '100tek', icon: '⚡' },
  { id: 'tienda', name: 'Tienda (Catálogo de Cuentos & Libros)', label: 'Tienda', icon: '📚' },
  { id: 'lab', name: 'LAB (Prácticas, Talleres & Guías)', label: 'LAB', icon: '🧪' },
  { id: 'mercado', name: 'Mercado (Bingotenango & Taquilla)', label: 'Mercado', icon: '🛍️' },
  { id: 'gran_galeria', name: 'Gran Galería (Banco de Proyectos & Propuestas)', label: 'Gran Galería', icon: '💡' },
  { id: 'sutz', name: 'Sutz (Mundo Virtual, Árbol & Relatos)', label: 'Sutz', icon: '☁️' },
  { id: 'personalizados', name: 'Nuevas Apps & Páginas Propias', label: 'Personalizados', icon: '⭐' },
];

export const BUILTIN_PILLAR_ROUTES: PillarAppRoute[] = [
  // ✨ Creatika (Artes & Humanidades)
  { id: 'creatika_cuentos', code: 'CRK-STORY-C01', label: '🎰 Máquina de Cuentos', target: '/creatika/maquina-de-cuentos', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_color', code: 'CRK-COLOR-C01', label: '🎨 Teoría del Color', target: '/creatika/teoria-del-color', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_personaje', code: 'CRK-PERSONAJE-C01', label: '🎭 Construyendo Personaje', target: '/creatika/construyendo-el-personaje', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_gran_galeria', code: 'CRK-GALERIA-C01', label: '🏛️ Gran Galería', target: '/gran-galeria', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_libros', code: 'TND-LIBROS-C01', label: '📖 Libros & Cuentos', target: '/libros', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_hub', code: 'CRK-HUB-C01', label: '🎪 Hub Creatika', target: '/creatika', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_docente', code: 'CRK-DOCENTE-C01', label: '📜 Código Docente', target: '/codigo-docente', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_estudiante', code: 'CRK-ESTUDIANTE-C01', label: '🎓 Código Estudiante', target: '/codigo-estudiante', type: 'navigate', pillarId: 'creatika' },

  // ⚡ 100tek (Ciencia, Lógica & Tecnología)
  { id: '100tek_solar', code: 'TEK-SOLAR-C01', label: '🪐 Sistema Solar 3D', target: '/100tek/sistema-solar', type: 'navigate', pillarId: '100tek' },
  { id: '100tek_secuencias', code: 'TEK-SECUENCIAS-C01', label: '🔢 Secuencias Numéricas', target: '/100tek/secuencias-numericas', type: 'navigate', pillarId: '100tek' },
  { id: '100tek_atlas', code: 'TEK-ATLAS-C01', label: '🫀 Cuerpo Humano Virtual 3D', target: '/atlas', type: 'navigate', pillarId: '100tek' },

  // 📚 Tienda (Libros y Catálogo)
  { id: 'tienda_principal', code: 'TND-LIBROS-C01', label: '📚 Tienda de Libros & Cuentos', target: '/tienda', type: 'navigate', pillarId: 'tienda' },
  { id: 'tienda_catalogo', code: 'TND-CATALOGO-C01', label: '📖 Catálogo Editorial de Libros', target: '/libros', type: 'navigate', pillarId: 'tienda' },

  // 🧪 LAB (Prácticas, Talleres y Guías de Tareas)
  { id: 'lab_home', code: 'LAB-HOME-C01', label: '🧪 LAB: Todos los Módulos', target: '/laboratorios', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_animacion', code: 'LAB-ANIMACION-C01', label: '🎬 LAB Animación Educativa', target: '/animacion-educativa', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_robotica', code: 'LAB-ROBOTICA-C01', label: '🤖 LAB Robótica Educativa', target: '/robotica-educativa', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_cientifico', code: 'LAB-CIENTIFICO-C01', label: '💡 LAB Pensamiento Científico', target: '/pensamiento-cientifico', type: 'navigate', pillarId: 'lab' },

  // 🛍️ Mercado (Bingotenango & Comercial)
  { id: 'mercado_bingo_lobby', code: 'MKT-BINGO-C01', label: '🎲 Bingotenango (Lobby & Dinámica)', target: '/juegos/bingo', type: 'navigate', pillarId: 'mercado' },
  { id: 'mercado_bingo_boletos', code: 'MKT-BOLETOS-C01', label: '🎟️ Boletos Bingotenango', target: '/juegos/bingo/boletos', type: 'navigate', pillarId: 'mercado' },
  { id: 'mercado_cotizador', code: 'MKT-COTIZADOR-C01', label: '💼 Cotizador Web', target: '/gerencia', type: 'navigate', pillarId: 'mercado' },

  // 🏛️ Gran Galería (Pergamino del Escriba, Museo Virtual, Videos & Concursos)
  { id: 'gran_galeria_hub', code: 'CRK-GALERIA-C01', label: '🏛️ Gran Galería (Pergamino & Museo)', target: '/gran-galeria', type: 'navigate', pillarId: 'creatika' },
  { id: 'gran_galeria_panel', code: 'CRK-GALERIA-C02', label: '⚙️ Gran Galería (Gestión & Banco)', target: '/gerencia', type: 'navigate', pillarId: 'creatika' },

  // ☁️ Sutz (Mundo Virtual, Popol Vuh & Árbol Tecnológico)
  { id: 'sutz_mapa', code: 'STZ-MAPA-C01', label: '🗺️ Mundo Virtual Sutz', target: '/sutz', type: 'navigate', pillarId: 'sutz' },
  { id: 'sutz_juracan', code: 'STZ-JURACAN-C01', label: '🌀 Universo de Juracán', target: '/universo-de-juracan', type: 'navigate', pillarId: 'sutz' },
  { id: 'sutz_neurociencia', code: 'STZ-NEURO-C01', label: '🧠 Neurociencia Educativa', target: '/neurociencia', type: 'navigate', pillarId: 'sutz' },

  // Popol Vuh (Modales dentro de Sutz)
  { id: 'pv_camazotz', code: 'STZ-CAMAZOTZ-C01', label: '🦇 Popol Vuh: Camazotz', target: 'camazotz', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ixkik', code: 'STZ-IXKIK-C01', label: '🌸 Popol Vuh: Ixkik', target: 'ixkik', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ixmukanne', code: 'STZ-IXMUKANE-C01', label: '🌾 Popol Vuh: Ixmukané', target: 'ixmukanne', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_juracan', code: 'STZ-JURACANMITO-C01', label: '⛈️ Popol Vuh: Juracán', target: 'juracan', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ququmatz', code: 'STZ-QUQUMATZ-C01', label: '🐍 Popol Vuh: Q\'uq\'umatz', target: 'ququmatz', type: 'modal', pillarId: 'sutz' }
];

const CUSTOM_ROUTES_DOC = 'sutz_custom_routes';

/**
 * Escucha las rutas personalizadas agregadas por administradores en Firestore
 */
export function subscribeCustomRoutes(
  callback: (routes: PillarAppRoute[]) => void
): () => void {
  const docRef = doc(db, 'config', CUSTOM_ROUTES_DOC);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const routes: PillarAppRoute[] = (data.routes || []).map((r: any) => ({
          ...r,
          isCustom: true
        }));
        callback(routes);
      } else {
        callback([]);
      }
    },
    (err) => {
      console.warn('[pillarProjectsConfig] Error cargando rutas personalizadas:', err);
      // Fallback a localStorage
      try {
        const local = localStorage.getItem('sutz_custom_routes_cache');
        if (local) callback(JSON.parse(local));
      } catch {}
    }
  );
}

/**
 * Agrega una nueva ruta o aplicación personalizada a la colección de Proyectos Pilares
 */
export async function addCustomRoute(
  route: Omit<PillarAppRoute, 'id' | 'isCustom'>
): Promise<PillarAppRoute> {
  const docRef = doc(db, 'config', CUSTOM_ROUTES_DOC);
  const snap = await getDoc(docRef);
  const existing: PillarAppRoute[] = snap.exists() ? snap.data().routes || [] : [];

  const newRoute: PillarAppRoute = {
    ...route,
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    isCustom: true
  };

  const updated = [...existing, newRoute];

  await setDoc(docRef, { routes: updated, updatedAt: new Date().toISOString() }, { merge: true });

  try {
    localStorage.setItem('sutz_custom_routes_cache', JSON.stringify(updated));
  } catch {}

  return newRoute;
}

/**
 * Elimina una ruta personalizada
 */
export async function removeCustomRoute(routeId: string): Promise<void> {
  const docRef = doc(db, 'config', CUSTOM_ROUTES_DOC);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const existing: PillarAppRoute[] = snap.data().routes || [];
  const updated = existing.filter((r) => r.id !== routeId);

  await setDoc(docRef, { routes: updated, updatedAt: new Date().toISOString() }, { merge: true });

  try {
    localStorage.setItem('sutz_custom_routes_cache', JSON.stringify(updated));
  } catch {}
}
