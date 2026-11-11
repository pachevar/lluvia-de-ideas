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

export interface SolarScalePin {
  id: string;
  team: string;
  astro: string;
  lat: number;
  lng: number;
  accuracy: number;
  createdAt?: unknown;
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

export async function saveSolarScalePin(code: string, pin: Omit<SolarScalePin, 'id' | 'createdAt'>): Promise<void> {
  const id = pinId(pin.team, pin.astro);
  await setDoc(doc(db, ROOMS, code, 'pins', id), { ...pin, createdAt: serverTimestamp() });
}

export async function setSolarScaleRevealed(code: string, revealed: boolean): Promise<void> {
  await updateDoc(doc(db, ROOMS, code), { revealed });
}
