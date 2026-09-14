import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type ActionType = 'navigate' | 'external' | 'modal';

export interface PillarAppRoute {
  id: string;
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
  { id: 'todos', name: 'Todos los Pilares', label: 'Todos', icon: '🌐' },
  { id: '100tek', name: '100tek (Ciencia & Matemáticas)', label: '100tek', icon: '🪐' },
  { id: 'creatika', name: 'Creatika (Literatura & Arte)', label: 'Creatika', icon: '🎭' },
  { id: 'juegos', name: 'Lúdica & Bingo', label: 'Juegos', icon: '🎟️' },
  { id: 'laboratorios', name: 'Laboratorios Pedagógicos', label: 'Laboratorios', icon: '🔬' },
  { id: 'editorial', name: 'Editorial & Libros', label: 'Editorial', icon: '📚' },
  { id: 'popolvuh', name: 'Popol Vuh (Relatos & Modales)', label: 'Popol Vuh', icon: '📜' },
  { id: 'personalizados', name: 'Nuevas Apps & Páginas Propias', label: 'Personalizados', icon: '✨' },
];

export const BUILTIN_PILLAR_ROUTES: PillarAppRoute[] = [
  // 100tek (Rutas actualizadas)
  { id: '100tek_solar', label: '🪐 Sistema Solar', target: '/100tek/sistema-solar', type: 'navigate', pillarId: '100tek' },
  { id: '100tek_secuencias', label: '🔢 Secuencias Numéricas', target: '/100tek/secuencias-numericas', type: 'navigate', pillarId: '100tek' },
  { id: '100tek_color', label: '🎨 Teoría del Color', target: '/100tek/teoria-del-color', type: 'navigate', pillarId: '100tek' },

  // Creatika
  { id: 'creatika_cuentos', label: '📖 Máquina de Cuentos', target: '/creatika/maquina-de-cuentos', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_personaje', label: '🎭 Construyendo Personaje', target: '/creatika/construyendo-el-personaje', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_hub', label: '🎪 Hub Creatika', target: '/creatika', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_docente', label: '🔑 Código Docente', target: '/codigo-docente', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_estudiante', label: '🎒 Código Estudiante', target: '/codigo-estudiante', type: 'navigate', pillarId: 'creatika' },

  // Lúdica & Bingo
  { id: 'juegos_bingo_hub', label: '🎟️ Bingotenango Lobby', target: '/juegos/bingo', type: 'navigate', pillarId: 'juegos' },
  { id: 'juegos_bingo_boletos', label: '🎫 Venta Boletos Bingo', target: '/juegos/bingo/boletos', type: 'navigate', pillarId: 'juegos' },

  // Laboratorios Pedagógicos
  { id: 'labs_home', label: '🔬 Todos los Laboratorios', target: '/laboratorios', type: 'navigate', pillarId: 'laboratorios' },
  { id: 'labs_robotica', label: '🤖 Robótica Educativa', target: '/robotica-educativa', type: 'navigate', pillarId: 'laboratorios' },
  { id: 'labs_animacion', label: '🎬 Animación Educativa', target: '/animacion-educativa', type: 'navigate', pillarId: 'laboratorios' },
  { id: 'labs_cientifico', label: '💡 Pensamiento Científico', target: '/pensamiento-cientifico', type: 'navigate', pillarId: 'laboratorios' },

  // Editorial & Sabiduría
  { id: 'editorial_libros', label: '📚 Catálogo de Libros', target: '/libros', type: 'navigate', pillarId: 'editorial' },
  { id: 'editorial_neurociencia', label: '🧠 Neurociencia Educativa', target: '/neurociencia', type: 'navigate', pillarId: 'editorial' },
  { id: 'editorial_juracan', label: '🌀 Universo de Juracán', target: '/universo-de-juracan', type: 'navigate', pillarId: 'editorial' },

  // Popol Vuh (Modales dentro de Sutz)
  { id: 'pv_camazotz', label: '🦇 Popol Vuh: Camazotz', target: 'camazotz', type: 'modal', pillarId: 'popolvuh' },
  { id: 'pv_ixkik', label: '🌸 Popol Vuh: Ixkik', target: 'ixkik', type: 'modal', pillarId: 'popolvuh' },
  { id: 'pv_ixmukanne', label: '🌾 Popol Vuh: Ixmukané', target: 'ixmukanne', type: 'modal', pillarId: 'popolvuh' },
  { id: 'pv_juracan', label: '⛈️ Popol Vuh: Juracán', target: 'juracan', type: 'modal', pillarId: 'popolvuh' },
  { id: 'pv_ququmatz', label: '🐍 Popol Vuh: Q\'uq\'umatz', target: 'ququmatz', type: 'modal', pillarId: 'popolvuh' }
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
