import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase';

export type SignalType = 'discovery' | 'help' | 'alliance' | 'clue' | 'greeting';

export interface StudentPresence {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  allianceId?: string;
  allianceName?: string;
  level: number;
  rankTitle: string;
  isOnline: boolean;
  currentCoord?: { q: number; r: number; label?: string } | null;
  lastActiveAt?: unknown;
  statusMessage?: string;
}

export interface CoordinationSignal {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string | null;
  authorAlliance?: string;
  type: SignalType;
  title: string;
  message: string;
  coord?: { q: number; r: number; label?: string };
  createdAt?: unknown;
}

/**
 * Publica o actualiza el estado de presencia del estudiante en Sutz.
 */
export async function publishStudentPresence(presence: StudentPresence): Promise<void> {
  try {
    const presenceRef = doc(db, 'sutz_presence', presence.uid);
    await setDoc(presenceRef, {
      ...presence,
      isOnline: true,
      lastActiveAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error al publicar presencia en Sutz:', err);
  }
}

/**
 * Marca la presencia del estudiante como desconectada al salir.
 */
export async function setStudentOffline(uid: string): Promise<void> {
  try {
    const presenceRef = doc(db, 'sutz_presence', uid);
    await updateDoc(presenceRef, {
      isOnline: false,
      lastActiveAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Error al marcar desconexión en Sutz:', err);
  }
}

/**
 * Escucha a todos los compañeros y exploradores escolares en línea.
 */
export function listenToOnlineStudents(
  callback: (students: StudentPresence[]) => void
): Unsubscribe {
  const presenceCol = collection(db, 'sutz_presence');
  const q = query(presenceCol, where('isOnline', '==', true), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: StudentPresence[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as StudentPresence);
    });
    callback(list);
  }, (err) => {
    console.warn('Error escuchando presencia de estudiantes en Sutz:', err);
  });
}

/**
 * Emite una nueva señal de coordinación a todos los compañeros en Sutz.
 */
export async function sendCoordinationSignal(
  signal: Omit<CoordinationSignal, 'id' | 'createdAt'>
): Promise<string> {
  const signalsCol = collection(db, 'sutz_coordination_signals');
  const docRef = await addDoc(signalsCol, {
    ...signal,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Escucha en tiempo real las señales de coordinación recientes enviadas por compañeros.
 */
export function listenToCoordinationSignals(
  callback: (signals: CoordinationSignal[]) => void
): Unsubscribe {
  const signalsCol = collection(db, 'sutz_coordination_signals');
  // Usamos limit(25) para obtener las señales de trabajo colaborativo más recientes
  const q = query(signalsCol, orderBy('createdAt', 'desc'), limit(25));

  return onSnapshot(q, (snapshot) => {
    const list: CoordinationSignal[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        authorUid: data.authorUid || '',
        authorName: data.authorName || 'Explorador Maya',
        authorAvatar: data.authorAvatar || null,
        authorAlliance: data.authorAlliance || '',
        type: data.type || 'discovery',
        title: data.title || '',
        message: data.message || '',
        coord: data.coord || undefined,
        createdAt: data.createdAt || null,
      });
    });
    callback(list);
  }, (err) => {
    console.warn('Error escuchando señales de coordinación en Sutz:', err);
  });
}
