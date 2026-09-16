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
  { id: 'todos', name: 'Todos los Reinos & Rutas', label: 'Todos', icon: '🌐' },
  { id: 'creatika', name: 'Creatika (Artes & Humanidades)', label: 'Creatika', icon: '✨' },
  { id: '100tek', name: '100tek (Ciencia, Lógica & Tecnología)', label: '100tek', icon: '⚡' },
  { id: 'lab', name: 'LAB (Prácticas, Talleres & Guías)', label: 'LAB', icon: '🧪' },
  { id: 'mercado', name: 'Mercado (Tienda en Línea & Boletos)', label: 'Mercado', icon: '🛍️' },
  { id: 'pozo_ideas', name: 'Pozo de Ideas (Proyectos & Sugerencias)', label: 'Pozo de Ideas', icon: '💡' },
  { id: 'sutz', name: 'Sutz (Mundo Virtual, Árbol & Relatos)', label: 'Sutz', icon: '☁️' },
  { id: 'personalizados', name: 'Nuevas Apps & Páginas Propias', label: 'Personalizados', icon: '⭐' },
];

export const BUILTIN_PILLAR_ROUTES: PillarAppRoute[] = [
  // ✨ Creatika (Artes & Humanidades)
  { id: 'creatika_cuentos', label: '🎰 Máquina de Cuentos', target: '/creatika/maquina-de-cuentos', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_color', label: '🎨 Teoría del Color', target: '/creatika/teoria-del-color', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_personaje', label: '🎭 Construyendo Personaje', target: '/creatika/construyendo-el-personaje', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_libros', label: '📖 Libros & Cuentos', target: '/libros', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_hub', label: '🎪 Hub Creatika', target: '/creatika', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_docente', label: '📜 Código Docente', target: '/codigo-docente', type: 'navigate', pillarId: 'creatika' },
  { id: 'creatika_estudiante', label: '🎓 Código Estudiante', target: '/codigo-estudiante', type: 'navigate', pillarId: 'creatika' },

  // ⚡ 100tek (Ciencia, Lógica & Tecnología)
  { id: '100tek_solar', label: '🪐 Sistema Solar 3D', target: '/100tek/sistema-solar', type: 'navigate', pillarId: '100tek' },
  { id: '100tek_secuencias', label: '🔢 Secuencias Numéricas', target: '/100tek/secuencias-numericas', type: 'navigate', pillarId: '100tek' },

  // 🧪 LAB (Prácticas, Talleres y Guías de Tareas)
  { id: 'lab_home', label: '🧪 LAB: Todos los Módulos', target: '/laboratorios', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_animacion', label: '🎬 LAB Animación Educativa', target: '/animacion-educativa', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_robotica', label: '🤖 LAB Robótica Educativa', target: '/robotica-educativa', type: 'navigate', pillarId: 'lab' },
  { id: 'lab_cientifico', label: '💡 LAB Pensamiento Científico', target: '/pensamiento-cientifico', type: 'navigate', pillarId: 'lab' },

  // 🛍️ Mercado (Tienda en Línea & Comercial)
  { id: 'mercado_tienda', label: '🛍️ Tienda de Libros & Cuentos', target: '/tienda', type: 'navigate', pillarId: 'mercado' },
  { id: 'mercado_bingo_boletos', label: '🎟️ Boletos Bingotenango', target: '/juegos/bingo/boletos', type: 'navigate', pillarId: 'mercado' },
  { id: 'mercado_cotizador', label: '💼 Cotizador Web', target: '/gerencia', type: 'navigate', pillarId: 'mercado' },

  // 💡 Pozo de Ideas (Banco de Proyectos & Sugerencias)
  { id: 'pozo_ideas_panel', label: '💡 Pozo de Ideas', target: '/gerencia', type: 'navigate', pillarId: 'pozo_ideas' },

  // ☁️ Sutz (Mundo Virtual, Popol Vuh & Árbol Tecnológico)
  { id: 'sutz_mapa', label: '🗺️ Mundo Virtual Sutz', target: '/sutz', type: 'navigate', pillarId: 'sutz' },
  { id: 'sutz_juracan', label: '🌀 Universo de Juracán', target: '/universo-de-juracan', type: 'navigate', pillarId: 'sutz' },
  { id: 'sutz_neurociencia', label: '🧠 Neurociencia Educativa', target: '/neurociencia', type: 'navigate', pillarId: 'sutz' },
  { id: 'sutz_bingo_lobby', label: '🎲 Bingotenango Lobby', target: '/juegos/bingo', type: 'navigate', pillarId: 'sutz' },

  // Popol Vuh (Modales dentro de Sutz)
  { id: 'pv_camazotz', label: '🦇 Popol Vuh: Camazotz', target: 'camazotz', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ixkik', label: '🌸 Popol Vuh: Ixkik', target: 'ixkik', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ixmukanne', label: '🌾 Popol Vuh: Ixmukané', target: 'ixmukanne', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_juracan', label: '⛈️ Popol Vuh: Juracán', target: 'juracan', type: 'modal', pillarId: 'sutz' },
  { id: 'pv_ququmatz', label: '🐍 Popol Vuh: Q\'uq\'umatz', target: 'ququmatz', type: 'modal', pillarId: 'sutz' }
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
