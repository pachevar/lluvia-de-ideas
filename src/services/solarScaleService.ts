// src/services/solarScaleService.ts
// Servicio de salas colectivas (código de sala + nombre de grupo) con Firestore en tiempo real.
// Diseñado de forma genérica: las "salas" y "grupos" pueden reutilizarse en otras dinámicas.

import {
  doc, setDoc, getDoc, updateDoc, collection, onSnapshot, serverTimestamp, type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';

const ROOMS = 'solar_scale_rooms';

export interface SolarScaleRoom {
  code: string;
  title: string;
  sunLat: number;
  sunLng: number;
  sunAccuracy: number;
  /** Si es true se muestra la distancia real (millones de km) como dato del problema. */
  showRealKm: boolean;
  revealed: boolean;
  createdAt?: unknown;
}

export const MAX_CORRECTION_ATTEMPTS = 3;

export interface SolarScalePin {
  id: string;
  team: string;
  astro: string;
  lat: number;
  lng: number;
  accuracy: number;
  /** Número de correcciones usadas después del escaneo inicial (0 a 3). */
  correctionsUsed?: number;
  /** Cuando es true (o correctionsUsed >= 3), la posición queda fijada definitivamente. */
  locked?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SaveSolarScalePinResult {
  correctionsUsed: number;
  remainingAttempts: number;
  locked: boolean;
  isInitial: boolean;
}

const pinId = (team: string, astro: string) =>
  `${team.trim().toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '_')}__${astro}`;

export async function createSolarScaleRoom(room: Omit<SolarScaleRoom, 'revealed' | 'createdAt'>): Promise<void> {
  const ref = doc(db, ROOMS, room.code);
  const existing = await getDoc(ref);
  if (existing.exists()) throw new Error('Ya existe una sala con ese código. Elige otro.');
  await setDoc(ref, { ...room, revealed: false, createdAt: serverTimestamp() });
}

export async function getSolarScaleRoom(code: string): Promise<SolarScaleRoom | null> {
  const snap = await getDoc(doc(db, ROOMS, code));
  return snap.exists() ? (snap.data() as SolarScaleRoom) : null;
}

export function listenToSolarScaleRoom(code: string, cb: (room: SolarScaleRoom | null) => void): Unsubscribe {
  return onSnapshot(doc(db, ROOMS, code), snap => cb(snap.exists() ? (snap.data() as SolarScaleRoom) : null),
    err => { console.warn('[SolarScale] room listener', err); cb(null); });
}

export function listenToSolarScalePins(code: string, cb: (pins: SolarScalePin[]) => void): Unsubscribe {
  return onSnapshot(collection(db, ROOMS, code, 'pins'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SolarScalePin, 'id'>) })));
  }, err => { console.warn('[SolarScale] pins listener', err); cb([]); });
}

export async function saveSolarScalePin(
  code: string,
  pin: Omit<SolarScalePin, 'id' | 'createdAt' | 'updatedAt' | 'correctionsUsed' | 'locked'>
): Promise<SaveSolarScalePinResult> {
  const id = pinId(pin.team, pin.astro);
  const ref = doc(db, ROOMS, code, 'pins', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      ...pin,
      correctionsUsed: 0,
      locked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return {
      correctionsUsed: 0,
      remainingAttempts: MAX_CORRECTION_ATTEMPTS,
      locked: false,
      isInitial: true
    };
  }

  const prev = snap.data() as Omit<SolarScalePin, 'id'>;
  const prevCorrections = typeof prev.correctionsUsed === 'number' ? prev.correctionsUsed : 0;
  const isAlreadyLocked = Boolean(prev.locked) || prevCorrections >= MAX_CORRECTION_ATTEMPTS;

  if (isAlreadyLocked) {
    throw new Error('🔒 El resultado de este planeta ya quedó fijado (se agotaron los 3 intentos de corrección).');
  }

  const nextCorrections = prevCorrections + 1;
  const nextLocked = nextCorrections >= MAX_CORRECTION_ATTEMPTS;

  await setDoc(ref, {
    ...prev,
    ...pin,
    correctionsUsed: nextCorrections,
    locked: nextLocked,
    updatedAt: serverTimestamp()
  });

  return {
    correctionsUsed: nextCorrections,
    remainingAttempts: Math.max(0, MAX_CORRECTION_ATTEMPTS - nextCorrections),
    locked: nextLocked,
    isInitial: false
  };
}

export async function lockSolarScalePin(code: string, team: string, astro: string): Promise<void> {
  const id = pinId(team, astro);
  const ref = doc(db, ROOMS, code, 'pins', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const prev = snap.data() as Omit<SolarScalePin, 'id'>;
  await setDoc(ref, {
    ...prev,
    locked: true,
    updatedAt: serverTimestamp()
  });
}

export async function setSolarScaleRevealed(code: string, revealed: boolean): Promise<void> {
  await updateDoc(doc(db, ROOMS, code), { revealed });
}
