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

const SESSION_STORAGE_KEY = 'sutz_current_session_token';

/**
 * Genera o recupera el token único de sesión de la pestaña actual.
 */
export function getLocalSessionId(): string {
  let token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!token) {
    const randomPart = Math.random().toString(36).substring(2, 10);
    token = `sutz_sess_${Date.now()}_${randomPart}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  }
  return token;
}

/**
 * Regenera un nuevo token de sesión local (para cuando el usuario reclama la sesión en esta pestaña).
 */
export function refreshLocalSessionId(): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const token = `sutz_sess_${Date.now()}_${randomPart}`;
  sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  return token;
}

/**
 * Inicia la sesión única del estudiante en Firestore.
 */
export async function startSutzSession(uid: string, studentName: string, email?: string | null): Promise<string> {
  const sessionId = getLocalSessionId();
  const sessionRef = doc(db, 'sutz_sessions', uid);

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
  const newSessionId = refreshLocalSessionId();
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
    const sessionId = getLocalSessionId();
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
 * Si el sessionId en Firestore cambia y sigue activo, se dispara onConflict.
 */
export function listenToSutzSession(
  uid: string,
  onConflict: (remoteSession: SutzSessionData) => void
): Unsubscribe {
  const sessionRef = doc(db, 'sutz_sessions', uid);

  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteData = snapshot.data() as SutzSessionData;
    const localSessionId = getLocalSessionId();

    // Conflicto si la sesión remota está activa y tiene un ID diferente al de esta pestaña
    if (remoteData.isActive && remoteData.sessionId && remoteData.sessionId !== localSessionId) {
      onConflict(remoteData);
    }
  }, (err) => {
    console.warn('Error en listener de sesión única de Sutz:', err);
  });
}
