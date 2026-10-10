// src/services/academiaqrSyncService.ts
// Servicio de sincronización, detección y reporte entre SUTZ y AcademiaQR.

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ACADEMIAQR_BRIDGE_CONFIG, 
  type AcademiaQrHandshake, 
  type AcademiaQrCompletionPayload 
} from '../config/academiaqrBridgeConfig';

export type { AcademiaQrHandshake, AcademiaQrCompletionPayload };

/**
 * Detecta parámetros de enlace entrante de AcademiaQR en la URL actual
 * y guarda la sesión en sessionStorage para persistencia entre navegación en SUTZ.
 */
export function detectAndStoreAcademiaQrHandshake(): AcademiaQrHandshake | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.refFlag);

    if (ref === 'academiaqr') {
      const handshake: AcademiaQrHandshake = {
        ref: 'academiaqr',
        schoolId: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.schoolId) || 'QUE002',
        studentId: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.studentId) || '',
        studentName: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.studentName) || 'Estudiante AcademiaQR',
        grade: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.grade) || '',
        teacherId: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.teacherId) || '',
        assignmentId: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.assignmentId) || '',
        challengeId: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.challengeId) || '',
        maxScore: Number(params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.maxScore) || 20),
        returnUrl: params.get(ACADEMIAQR_BRIDGE_CONFIG.urlParams.returnUrl) || ACADEMIAQR_BRIDGE_CONFIG.defaultReturnUrl,
        receivedAt: new Date().toISOString()
      };

      sessionStorage.setItem(
        ACADEMIAQR_BRIDGE_CONFIG.sessionStorageKey, 
        JSON.stringify(handshake)
      );

      return handshake;
    }

    // Si no está en URL, revisar si ya existe en sessionStorage
    return getActiveAcademiaQrHandshake();
  } catch (err) {
    console.warn('[AcademiaQrSync] Error detectando handshake:', err);
    return null;
  }
}

/**
 * Obtiene el handshake activo de AcademiaQR si existe
 */
export function getActiveAcademiaQrHandshake(): AcademiaQrHandshake | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACADEMIAQR_BRIDGE_CONFIG.sessionStorageKey);
    if (raw) {
      return JSON.parse(raw) as AcademiaQrHandshake;
    }
  } catch {}
  return null;
}

/**
 * Indica si el usuario está actualmente ejecutando una tarea de AcademiaQR
 */
export function isAcademiaQrSessionActive(): boolean {
  return Boolean(getActiveAcademiaQrHandshake());
}

/**
 * Limpia el handshake activo
 */
export function clearAcademiaQrHandshake(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ACADEMIAQR_BRIDGE_CONFIG.sessionStorageKey);
  } catch {}
}

/**
 * Reporta la culminación de un reto hacia AcademiaQR
 * (Guarda en Firestore, emite postMessage y actualiza progreso)
 */
export async function reportChallengeCompletion(params: {
  challengeId?: string;
  score?: number;
  percentage?: number;
  feedback?: string;
}): Promise<AcademiaQrCompletionPayload | null> {
  const handshake = getActiveAcademiaQrHandshake();
  if (!handshake || !handshake.assignmentId) {
    console.info('[AcademiaQrSync] No hay tarea activa vinculada a AcademiaQR.');
    return null;
  }

  const maxScore = handshake.maxScore || 20;
  const percentage = params.percentage ?? 100;
  const score = params.score ?? Math.round((percentage / 100) * maxScore);
  const challengeId = params.challengeId || handshake.challengeId || 'sutz_general_challenge';

  const payload: AcademiaQrCompletionPayload = {
    assignmentId: handshake.assignmentId,
    challengeId,
    studentId: handshake.studentId || 'anon_student',
    studentName: handshake.studentName,
    schoolId: handshake.schoolId,
    score,
    maxScore,
    percentage,
    feedback: params.feedback || 'Reto interactivo resuelto satisfactoriamente en SUTZ.',
    completedAt: new Date().toISOString()
  };

  // 1. Guardar en Firestore para sincronización en tiempo real
  try {
    const docId = `${handshake.assignmentId}_${handshake.studentId || 'completion'}`;
    const compRef = doc(db, ACADEMIAQR_BRIDGE_CONFIG.firestore.completionsCollection, docId);
    await setDoc(compRef, {
      ...payload,
      syncedAt: serverTimestamp()
    }, { merge: true });
    console.info('[AcademiaQrSync] Completado registrado en Firestore:', docId);
  } catch (err) {
    console.warn('[AcademiaQrSync] Error guardando completado en Firestore:', err);
  }

  // 2. Notificar por postMessage si SUTZ fue abierto mediante popup / iframe
  if (typeof window !== 'undefined' && window.opener) {
    try {
      window.opener.postMessage({
        type: 'SUTZ_CHALLENGE_COMPLETED',
        payload
      }, '*');
    } catch (e) {
      console.warn('[AcademiaQrSync] No se pudo emitir postMessage:', e);
    }
  }

  // 3. Registrar en registro local para trazabilidad
  try {
    const historyRaw = localStorage.getItem(ACADEMIAQR_BRIDGE_CONFIG.completionStorageKey) || '[]';
    const history = JSON.parse(historyRaw);
    history.unshift(payload);
    localStorage.setItem(ACADEMIAQR_BRIDGE_CONFIG.completionStorageKey, JSON.stringify(history.slice(0, 50)));
  } catch {}

  // 4. Emitir evento del navegador local para componentes React
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('academiaqr:challenge_completed', { detail: payload }));
  }

  return payload;
}

/**
 * Redirige al estudiante de vuelta a AcademiaQR
 */
export function returnToAcademiaQr(): void {
  const handshake = getActiveAcademiaQrHandshake();
  const targetUrl = handshake?.returnUrl || ACADEMIAQR_BRIDGE_CONFIG.defaultReturnUrl;
  clearAcademiaQrHandshake();
  window.location.href = targetUrl;
}
