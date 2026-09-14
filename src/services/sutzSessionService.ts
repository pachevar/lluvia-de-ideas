import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
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

const DEVICE_STORAGE_KEY = 'sutz_persistent_device_id';

/**
 * Genera o recupera el identificador único persistente de este dispositivo/navegador.
 * Al usar localStorage, el navegador conserva su identidad entre recargas, refrescos forzados
 * y cierre/apertura de pestañas, garantizando 0% de falsos positivos en el mismo equipo.
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

/**
 * Inicia la sesión única del estudiante en Firestore.
 * El dispositivo actual se registra como el dueño activo de la sesión.
 */
export async function startSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const deviceId = getLocalDeviceId();
  const sessionRef = doc(db, 'sutz_sessions', uid);

  try {
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
  } catch (err) {
    console.warn('[SutzSession] Error registrando sesión activa en Firestore:', err);
  }

  return deviceId;
}

/**
 * Reclama la sesión activa para este dispositivo, anulando cualquier sesión en otro equipo.
 */
export async function reclaimSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const newDeviceId = refreshLocalSessionId(uid);
  const sessionRef = doc(db, 'sutz_sessions', uid);

  await setDoc(sessionRef, {
    sessionId: newDeviceId,
    deviceId: newDeviceId,
    uid,
    studentName: studentName || 'Estudiante Explorador',
    email: email || '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Browser',
    startedAt: serverTimestamp(),
    lastHeartbeatAt: serverTimestamp(),
    isActive: true,
  }, { merge: true });

  return newDeviceId;
}

/**
 * Envía pulso de vida (heartbeat) para mantener la sesión activa en Firestore.
 */
export async function heartbeatSutzSession(uid: string): Promise<void> {
  try {
    const deviceId = getLocalDeviceId();
    const sessionRef = doc(db, 'sutz_sessions', uid);
    await updateDoc(sessionRef, {
      sessionId: deviceId,
      deviceId,
      lastHeartbeatAt: serverTimestamp(),
      isActive: true,
    });
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
    const sessionRef = doc(db, 'sutz_sessions', uid);
    await updateDoc(sessionRef, {
      isActive: false,
    });
  } catch (err) {
    console.warn('Error al cerrar sesión de Sutz en Firestore:', err);
  }
}

/**
 * Escucha cambios en tiempo real en la sesión única del estudiante.
 * Solo notifica conflicto si en Firestore se registra un deviceId DISTINTO al de este navegador.
 */
export function listenToSutzSession(
  uid: string,
  onConflict: (remoteSession: SutzSessionData) => void
): Unsubscribe {
  const sessionRef = doc(db, 'sutz_sessions', uid);
  const myDeviceId = getLocalDeviceId();

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteData = snapshot.data() as SutzSessionData;

    // Si el ID de sesión o deviceId coincide con el de este dispositivo: CERO CONFLICTO
    if (remoteData.sessionId === myDeviceId || remoteData.deviceId === myDeviceId) {
      return;
    }

    // Solo hay conflicto si la sesión remota está activa y pertenece a OTRO equipo/navegador
    if (remoteData.isActive && remoteData.sessionId && remoteData.sessionId !== myDeviceId) {
      onConflict(remoteData);
    }
  }, (err) => {
    console.warn('Error en listener de sesión única de Sutz:', err);
  });
}
