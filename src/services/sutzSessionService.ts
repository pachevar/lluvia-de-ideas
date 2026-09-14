import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';

export interface SutzSessionData {
  sessionId: string;
  uid: string;
  studentName: string;
  email?: string;
  userAgent?: string;
  startedAt?: unknown;
  lastHeartbeatAt?: unknown;
  isActive: boolean;
}

const SESSION_STORAGE_PREFIX = 'sutz_sess_token_';

/**
 * Genera o recupera el token único de sesión de la pestaña actual para un UID específico.
 */
export function getLocalSessionId(uid?: string): string {
  const key = uid ? `${SESSION_STORAGE_PREFIX}${uid}` : `${SESSION_STORAGE_PREFIX}default`;
  let token = sessionStorage.getItem(key);
  if (!token) {
    const randomPart = Math.random().toString(36).substring(2, 10);
    token = `sutz_sess_${Date.now()}_${randomPart}`;
    sessionStorage.setItem(key, token);
  }
  return token;
}

/**
 * Regenera un nuevo token de sesión local (para cuando el usuario reclama la sesión en esta pestaña).
 */
export function refreshLocalSessionId(uid?: string): string {
  const key = uid ? `${SESSION_STORAGE_PREFIX}${uid}` : `${SESSION_STORAGE_PREFIX}default`;
  const randomPart = Math.random().toString(36).substring(2, 10);
  const token = `sutz_sess_${Date.now()}_${randomPart}`;
  sessionStorage.setItem(key, token);
  return token;
}

/**
 * Inicia la sesión única del estudiante en Firestore.
 * El dispositivo que acaba de conectarse toma la sesión activa de forma limpia.
 */
export async function startSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const sessionId = getLocalSessionId(uid);
  const sessionRef = doc(db, 'sutz_sessions', uid);

  try {
    await setDoc(sessionRef, {
      sessionId,
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

  return sessionId;
}

/**
 * Reclama la sesión activa para esta pestaña, anulando la sesión anterior en otro dispositivo.
 */
export async function reclaimSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const newSessionId = refreshLocalSessionId(uid);
  const sessionRef = doc(db, 'sutz_sessions', uid);

  await setDoc(sessionRef, {
    sessionId: newSessionId,
    uid,
    studentName: studentName || 'Estudiante Explorador',
    email: email || '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Browser',
    startedAt: serverTimestamp(),
    lastHeartbeatAt: serverTimestamp(),
    isActive: true,
  }, { merge: true });

  return newSessionId;
}

/**
 * Envía pulso de vida (heartbeat) para mantener la sesión activa en Firestore.
 */
export async function heartbeatSutzSession(uid: string): Promise<void> {
  try {
    const sessionId = getLocalSessionId(uid);
    const sessionRef = doc(db, 'sutz_sessions', uid);
    await updateDoc(sessionRef, {
      sessionId,
      lastHeartbeatAt: serverTimestamp(),
      isActive: true,
    });
  } catch (err) {
    console.warn('Error enviando heartbeat de sesión en Sutz:', err);
  }
}

/**
 * Marca la sesión como inactiva al salir de Sutz o cerrar sesión.
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
 * Solo notifica conflicto a la sesión que ya estaba activa si OTRA sesión
 * toma posesión posteriormente con un sessionId diferente.
 */
export function listenToSutzSession(
  uid: string,
  onConflict: (remoteSession: SutzSessionData) => void
): Unsubscribe {
  const sessionRef = doc(db, 'sutz_sessions', uid);
  const localSessionId = getLocalSessionId(uid);

  let initialLoaded = false;

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteData = snapshot.data() as SutzSessionData;

    // En la primera carga:
    if (!initialLoaded) {
      initialLoaded = true;
      // Si coincide con el sessionId local, estamos sincronizados
      if (remoteData.sessionId === localSessionId) {
        return;
      }
      // Si el sessionId del snapshot aún no es el local (latencia de red con startSutzSession),
      // no emitimos falso conflicto, dejamos que startSutzSession complete la escritura
      return;
    }

    // A partir de actualizaciones subsecuentes:
    // Si la sesión remota está activa y cambió a un sessionId ajeno a esta pestaña:
    if (remoteData.isActive && remoteData.sessionId && remoteData.sessionId !== localSessionId) {
      onConflict(remoteData);
    }
  }, (err) => {
    console.warn('Error en listener de sesión única de Sutz:', err);
  });
}
