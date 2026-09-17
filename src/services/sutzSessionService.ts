import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

export interface SutzSessionData {
  sessionId: string;
  deviceId?: string;
  uid: string;
  studentName: string;
  email?: string;
  userAgent?: string;
  startedAt?: unknown;
  lastHeartbeatAt?: unknown;
  isActive: boolean;
}

export interface StartSessionResult {
  deviceId: string;
  hasConflict: boolean;
  remoteSession?: SutzSessionData;
}

const DEVICE_STORAGE_KEY = 'sutz_persistent_device_id';
const HEARTBEAT_STALE_MS = 90000; // 90 segundos para considerar una sesión inactiva o abandonada

/**
 * Genera o recupera el identificador único persistente de este dispositivo/navegador.
 * Al usar localStorage, el navegador conserva su identidad entre recargas, refrescos forzados
 * y cierre/apertura de pestañas.
 */
export function getLocalDeviceId(): string {
  let id: string | null = null;
  try {
    id = localStorage.getItem(DEVICE_STORAGE_KEY);
  } catch {
    // Si localStorage no está disponible
  }

  if (!id) {
    const randomPart = Math.random().toString(36).substring(2, 12);
    id = `dev_${Date.now()}_${randomPart}`;
    try {
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    } catch {
      // Ignorar fallback
    }
  }
  return id;
}

/**
 * Alias de compatibilidad: retorna el ID de dispositivo de este cliente.
 */
export function getLocalSessionId(_uid?: string): string {
  return getLocalDeviceId();
}

/**
 * Regenera un nuevo ID de dispositivo si el usuario explícitamente reclama la sesión.
 */
export function refreshLocalSessionId(_uid?: string): string {
  const randomPart = Math.random().toString(36).substring(2, 12);
  const newId = `dev_${Date.now()}_${randomPart}`;
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, newId);
  } catch {
    // Ignorar fallback
  }
  return newId;
}

function parseTimestampMs(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof (ts as { toMillis?: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof (ts as { seconds?: number }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  if (typeof ts === 'number') return ts;
  return null;
}

/**
 * Inicia la sesión única del estudiante en Firestore verificando si hay otra sesión activa reciente.
 */
export async function startSutzSession(
  uid: string, 
  studentName: string, 
  email?: string | null
): Promise<StartSessionResult> {
  const deviceId = getLocalDeviceId();
  const sessionRef = doc(db, 'sutz_sessions', uid);

  try {
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const data = snap.data() as SutzSessionData;
      const isSameDevice = data.sessionId === deviceId || data.deviceId === deviceId;

      if (!isSameDevice && data.isActive) {
        const lastHb = parseTimestampMs(data.lastHeartbeatAt) || parseTimestampMs(data.startedAt);
        const isRecent = lastHb ? (Date.now() - lastHb < HEARTBEAT_STALE_MS) : false;

        if (isRecent) {
          // Existe otra sesión activa reciente en otro dispositivo/navegador
          return {
            deviceId,
            hasConflict: true,
            remoteSession: data,
          };
        }
      }
    }

    // No hay conflicto o la sesión remota ya caducó/pertenece al mismo equipo
    await setDoc(sessionRef, {
      sessionId: deviceId,
      deviceId,
      uid,
      studentName: studentName || 'Estudiante Explorador',
      email: email || '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Browser',
      startedAt: serverTimestamp(),
      lastHeartbeatAt: serverTimestamp(),
      isActive: true,
    }, { merge: true });

    return {
      deviceId,
      hasConflict: false,
    };
  } catch (err) {
    console.warn('[SutzSession] Error iniciando sesión única en Firestore:', err);
    return { deviceId, hasConflict: false };
  }
}

/**
 * Reclama la sesión activa para este dispositivo, anulando de forma inmediata cualquier sesión en otro equipo.
 */
export async function reclaimSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const deviceId = getLocalDeviceId();
  const sessionRef = doc(db, 'sutz_sessions', uid);

  await setDoc(sessionRef, {
    sessionId: deviceId,
    deviceId,
    uid,
    studentName: studentName || 'Estudiante Explorador',
    email: email || '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Browser',
    startedAt: serverTimestamp(),
    lastHeartbeatAt: serverTimestamp(),
    isActive: true,
  }, { merge: true });

  return deviceId;
}

/**
 * Envía pulso de vida (heartbeat) para mantener la sesión activa en Firestore.
 * Solo actualiza si este dispositivo sigue siendo el dueño activo de la sesión.
 */
export async function heartbeatSutzSession(uid: string): Promise<void> {
  try {
    const deviceId = getLocalDeviceId();
    const sessionRef = doc(db, 'sutz_sessions', uid);
    
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const data = snap.data() as SutzSessionData;
      if ((data.sessionId === deviceId || data.deviceId === deviceId) && data.isActive) {
        await updateDoc(sessionRef, {
          lastHeartbeatAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn('Error enviando heartbeat de sesión en Sutz:', err);
  }
}

/**
 * Marca la sesión como inactiva al salir de Sutz o cerrar sesión.
 * Solo desactiva si este mismo dispositivo sigue siendo el dueño de la sesión.
 */
export async function closeSutzSession(uid: string): Promise<void> {
  try {
    const deviceId = getLocalDeviceId();
    const sessionRef = doc(db, 'sutz_sessions', uid);
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const data = snap.data() as SutzSessionData;
      if (data.sessionId === deviceId || data.deviceId === deviceId) {
        await updateDoc(sessionRef, {
          isActive: false,
        });
      }
    }
  } catch (err) {
    console.warn('Error al cerrar sesión de Sutz en Firestore:', err);
  }
}

/**
 * Escucha cambios en tiempo real en la sesión única del estudiante.
 * Lee dinámicamente el deviceId actual en cada snapshot para evitar problemas de cierres stale.
 */
export function listenToSutzSession(
  uid: string,
  onConflict: (remoteSession: SutzSessionData) => void,
  onResolved?: () => void
): Unsubscribe {
  const sessionRef = doc(db, 'sutz_sessions', uid);

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteData = snapshot.data() as SutzSessionData;
    const currentDeviceId = getLocalDeviceId();

    // 1. Si coincide con nuestro dispositivo actual: cero conflicto
    if (remoteData.sessionId === currentDeviceId || remoteData.deviceId === currentDeviceId) {
      if (onResolved) onResolved();
      return;
    }

    // 2. Si la sesión no está activa en Firestore: cero conflicto
    if (!remoteData.isActive) {
      if (onResolved) onResolved();
      return;
    }

    // 3. Comprobar si la sesión remota está obsoleta (sin heartbeat en los últimos 90 segundos)
    const lastHb = parseTimestampMs(remoteData.lastHeartbeatAt) || parseTimestampMs(remoteData.startedAt);
    if (lastHb && (Date.now() - lastHb > HEARTBEAT_STALE_MS)) {
      if (onResolved) onResolved();
      return;
    }

    // 4. Conflicto verificado con otra sesión remota activa
    onConflict(remoteData);
  }, (err) => {
    console.warn('Error en listener de sesión única de Sutz:', err);
  });
}
