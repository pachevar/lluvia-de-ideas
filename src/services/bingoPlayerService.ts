/**
 * bingoPlayerService.ts
 * Servicio para la gestión de la Cartera de Jugadores (CRM) de Bingotenango,
 * vinculación de Telegram, tracking de compras y auto-despacho multicanal.
 */

import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoPlayerProfile } from '../types';

const TELEGRAM_BOT_TOKEN = '8871378697:AAHbLJumNh9FhiRIzROq_g2QjbaPLlzuUj4';

/**
 * Normaliza cualquier formato de teléfono de Guatemala a formato estándar numérico (ej: 50236135616)
 */
export const normalizePlayerPhone = (rawPhone: string): string => {
  if (!rawPhone) return '';
  const cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `502${cleaned}`;
  }
  return cleaned;
};

/**
 * Registra o actualiza la ficha del jugador en la colección `bingo_players`.
 */
export const recordPlayerPurchase = async (params: {
  phone: string;
  name: string;
  email?: string;
  spentQ: number;
  webPushEnabled?: boolean;
}): Promise<BingoPlayerProfile> => {
  const normPhone = normalizePlayerPhone(params.phone);
  if (!normPhone) {
    throw new Error('Número de teléfono inválido');
  }

  const playerRef = doc(db, 'bingo_players', normPhone);
  const snap = await getDoc(playerRef);
  const now = Date.now();

  if (snap.exists()) {
    const existing = snap.data() as BingoPlayerProfile;
    const updatedProfile: BingoPlayerProfile = {
      ...existing,
      name: params.name || existing.name,
      email: params.email || existing.email || '',
      webPushEnabled: params.webPushEnabled ?? existing.webPushEnabled ?? false,
      totalOrdersCount: (existing.totalOrdersCount || 0) + 1,
      totalSpentQ: (existing.totalSpentQ || 0) + (params.spentQ || 0),
      lastPurchaseAt: now,
      updatedAt: now,
    };

    await setDoc(playerRef, updatedProfile, { merge: true });
    return updatedProfile;
  } else {
    const newProfile: BingoPlayerProfile = {
      id: normPhone,
      phone: normPhone,
      name: params.name || 'Jugador Bingotenango',
      email: params.email || '',
      webPushEnabled: params.webPushEnabled ?? false,
      totalOrdersCount: 1,
      totalSpentQ: params.spentQ || 0,
      lastPurchaseAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(playerRef, newProfile);
    return newProfile;
  }
};

/**
 * Consulta si un teléfono ya tiene un Telegram chat ID vinculado en la cartera de clientes.
 */
export const checkTelegramLinked = async (rawPhone: string): Promise<{
  linked: boolean;
  profile?: BingoPlayerProfile;
  chatId?: number | string;
}> => {
  const normPhone = normalizePlayerPhone(rawPhone);
  if (!normPhone) return { linked: false };

  try {
    const playerRef = doc(db, 'bingo_players', normPhone);
    const snap = await getDoc(playerRef);
    if (snap.exists()) {
      const data = snap.data() as BingoPlayerProfile;
      if (data.telegramChatId) {
        return {
          linked: true,
          profile: data,
          chatId: data.telegramChatId,
        };
      }
      return { linked: false, profile: data };
    }
    return { linked: false };
  } catch (error) {
    console.error('Error al verificar vinculación de Telegram:', error);
    return { linked: false };
  }
};

/**
 * Envía un mensaje directo a través de la API oficial de Telegram a un chat ID específico.
 */
export const sendTelegramDirectMessage = async (
  chatId: number | string,
  text: string,
  inlineKeyboard?: Array<Array<{ text: string; url?: string }>>
): Promise<boolean> => {
  try {
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return Boolean(data.ok);
  } catch (error) {
    console.error('Error enviando mensaje directo por Telegram:', error);
    return false;
  }
};

/**
 * Si el cliente ya está en la cartera con Telegram vinculado, le auto-despacha
 * sus cartones directamente a su Telegram sin que tenga que abrir el enlace ni pulsar Start.
 */
export const autoDispatchPurchaseToTelegramIfLinked = async (params: {
  phone: string;
  playerName: string;
  tokenId: string;
  quantity: number;
  url: string;
}): Promise<{ dispatched: boolean; chatId?: number | string }> => {
  const check = await checkTelegramLinked(params.phone);
  if (!check.linked || !check.chatId) {
    return { dispatched: false };
  }

  const messageText = `🎉 <b>¡Hola ${params.playerName}!</b>\n\n` +
    `🎟️ Tu compra de <b>${params.quantity} ${params.quantity === 1 ? 'cartón' : 'cartones'}</b> de <b>Bingotenango</b> fue confirmada con éxito.\n\n` +
    `🔑 <b>Tu Pase de Sesión:</b> <code>${params.tokenId}</code>\n\n` +
    `⚡ Ya puedes tocar el botón de abajo para ingresar a la sala en vivo con tus cartones listos:`;

  const inlineKeyboard = [
    [
      {
        text: '🎮 ABRIR SALA DE JUEGO EN VIVO',
        url: params.url,
      }
    ]
  ];

  const ok = await sendTelegramDirectMessage(check.chatId, messageText, inlineKeyboard);
  return { dispatched: ok, chatId: check.chatId };
};

/**
 * Obtiene la lista completa de jugadores registrados en la cartera para el panel de Gerencia.
 */
export const getAllPlayersList = async (limitCount = 100): Promise<BingoPlayerProfile[]> => {
  try {
    const colRef = collection(db, 'bingo_players');
    const q = query(colRef, orderBy('lastPurchaseAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as BingoPlayerProfile);
  } catch (err) {
    console.warn('Error con query ordenado en bingo_players, usando fallback:', err);
    try {
      const colRef = collection(db, 'bingo_players');
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as BingoPlayerProfile);
    } catch (e2) {
      console.error('Error listando jugadores de bingo_players:', e2);
      return [];
    }
  }
};
