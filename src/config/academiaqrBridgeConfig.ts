// src/config/academiaqrBridgeConfig.ts
// Configuración oficial de interoperabilidad y puente entre SUTZ y AcademiaQR.
// Permite que SUTZ opere de forma 100% autónoma, pero cuando un estudiante o docente
// llega desde AcademiaQR, intercambia sesiones, asignaciones, calificaciones y recompensas.

export interface AcademiaQrHandshake {
  ref: 'academiaqr';
  schoolId: string;
  studentId: string;
  studentName?: string;
  grade?: string;
  teacherId?: string;
  assignmentId?: string;
  challengeId?: string;
  maxScore?: number;
  returnUrl?: string;
  receivedAt: string;
}

export interface AcademiaQrCompletionPayload {
  assignmentId: string;
  challengeId: string;
  studentId: string;
  studentName?: string;
  schoolId: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
  completedAt: string;
}

export const ACADEMIAQR_BRIDGE_CONFIG = {
  version: "1.0.0",
  // Dominios autorizados para comunicación postMessage y redirección segura
  allowedOrigins: [
    "https://academiaqrtst.web.app",
    "http://localhost:8085",
    "http://127.0.0.1:8085",
    "http://localhost:5000",
    "https://sosqr-707ca.web.app"
  ],
  defaultReturnUrl: "https://academiaqrtst.web.app/tareas.html",
  sessionStorageKey: "sutz_academiaqr_handshake",
  completionStorageKey: "sutz_academiaqr_completion_log",
  // Parámetros de URL esperados
  urlParams: {
    refFlag: "ref",
    schoolId: "schoolId",
    studentId: "studentId",
    studentName: "studentName",
    grade: "grade",
    teacherId: "teacherId",
    assignmentId: "assignmentId",
    challengeId: "challengeId",
    maxScore: "maxScore",
    returnUrl: "returnUrl"
  },
  // Colecciones compartidas en Firestore
  firestore: {
    completionsCollection: "sutz_completions",
    schoolsCollection: "sutz_schools",
    presenceCollection: "sutz_presence"
  },
  // Multiplicadores de gamificación en SUTZ por completar tareas de AcademiaQR
  rewardsMultiplier: {
    puntosPerScoreUnit: 10,  // ej. 20 pts de tarea = 200 puntos XP en SUTZ
    gemasPerCompletion: 5,   // 5 gemas por reto completado
    pergaminosPerCompletion: 1 // 1 pergamino
  }
};

