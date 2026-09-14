import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
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
 * Helper para verificar si un heartbeat remoto tiene menos de X segundos de antigüedad.
 */
function isHeartbeatFresh(timestamp: unknown, maxAgeSeconds: number = 90): boolean {
  if (!timestamp) return false;
  try {
    let ms = 0;
    const ts = timestamp as { toMillis?: () => number; seconds?: number; getTime?: () => number };
    if (typeof ts.toMillis === 'function') {
      ms = ts.toMillis();
    } else if (typeof ts.seconds === 'number') {
      ms = ts.seconds * 1000;
    } else if (typeof ts.getTime === 'function') {
      ms = ts.getTime();
    }
    if (ms <= 0) return false;
    const elapsedSeconds = (Date.now() - ms) / 1000;
    return elapsedSeconds >= 0 && elapsedSeconds < maxAgeSeconds;
  } catch {
    return false;
  }
}

/**
 * Inicia la sesión única del estudiante en Firestore.
 */
export async function startSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const sessionId = getLocalSessionId(uid);
  const sessionRef = doc(db, 'sutz_sessions', uid);

  // Verificamos si existe una sesión previa
  try {
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      const prevData = snap.data() as SutzSessionData;
      // Si la sesión anterior tenía otro ID y su heartbeat es reciente (<90s),
      // dejamos que el listener capture el conflicto sin sobreescribir a ciegas
      if (prevData.isActive && prevData.sessionId && prevData.sessionId !== sessionId) {
        if (isHeartbeatFresh(prevData.lastHeartbeatAt, 90)) {
          console.warn('[SutzSession] Sesión concurrente detectada en otro dispositivo.');
          return sessionId;
        }
      }
    }
  } catch (err) {
    console.warn('[SutzSession] No se pudo comprobar sesión previa:', err);
  }

  // Tomamos posesión limpia
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
 * Si el sessionId en Firestore cambia, sigue activo y tiene heartbeat fresco (<90s), se dispara onConflict.
 */
export function listenToSutzSession(
  uid: string,
  onConflict: (remoteSession: SutzSessionData) => void
): Unsubscribe {
  const sessionRef = doc(db, 'sutz_sessions', uid);

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteData = snapshot.data() as SutzSessionData;
    const localSessionId = getLocalSessionId(uid);

    // No hay conflicto si la sesión remota está inactiva o si es de esta misma pestaña
    if (!remoteData.isActive || !remoteData.sessionId || remoteData.sessionId === localSessionId) {
      return;
    }

    // Comprobar si la sesión remota sigue viva (heartbeat en los últimos 90 segundos)
    // Si han pasado más de 90s, la sesión remota es 'zombie' (el usuario cerró pestaña o navegador)
    if (!isHeartbeatFresh(remoteData.lastHeartbeatAt, 90)) {
      console.log('[SutzSession] Sesión remota inactiva (>90s sin heartbeat). Reclamando sin emitir alerta...');
      heartbeatSutzSession(uid);
      return;
    }

    // Conflicto legítimo en tiempo real con otro dispositivo activo
    onConflict(remoteData);
  }, (err) => {
    console.warn('Error en listener de sesión única de Sutz:', err);
  });
}
