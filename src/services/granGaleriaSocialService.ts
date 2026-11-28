import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface CustomGiftEmoji {
  id: string;
  emoji: string;
  name: string;
  cost: number;
  tagline: string;
  accent: string;
}

export interface LiteraryReaction {
  id: string;
  emoji: string;
  label: string;
}

export interface TextSocialStats {
  likes: number;
  commentsCount: number;
  giftPoints: number;
  gifts: Record<string, number>;
  reactions: Record<string, number>;
}

export interface TextCommentItem {
  id: string;
  authorName: string;
  authorBadge?: string;
  text: string;
  createdAt: string;
}

export interface TextGiftItem {
  id: string;
  emojiId: string;
  emoji: string;
  emojiName: string;
  cost: number;
  senderName: string;
  message?: string;
  createdAt: string;
}

export const CUSTOM_GIFT_EMOJIS: CustomGiftEmoji[] = [
  {
    id: 'gota',
    emoji: '🌧️',
    name: 'Gota de Inspiración',
    cost: 2,
    tagline: 'Apoyo inicial para el autor',
    accent: '#38bdf8',
  },
  {
    id: 'pluma',
    emoji: '🪶',
    name: 'Pluma de Oro',
    cost: 5,
    tagline: '¡Excelente redacción!',
    accent: '#f59e0b',
  },
  {
    id: 'gato',
    emoji: '🐱',
    name: 'Gato Lector',
    cost: 8,
    tagline: 'Ternura e ingenio literario',
    accent: '#a78bfa',
  },
  {
    id: 'taza',
    emoji: '☕',
    name: 'Taza de Taller',
    cost: 12,
    tagline: 'Impulso para más capítulos',
    accent: '#fb923c',
  },
  {
    id: 'corona',
    emoji: '👑',
    name: 'Corona del Escriba',
    cost: 20,
    tagline: 'Ovación mayor de mecenas',
    accent: '#fbbf24',
  },
];

export const LITERARY_REACTIONS: LiteraryReaction[] = [
  { id: 'giro', emoji: '🤯', label: 'Qué giro' },
  { id: 'emocion', emoji: '🥹', label: 'Me emocionó' },
  { id: 'inspira', emoji: '💡', label: 'Inspirador' },
  { id: 'risa', emoji: '😂', label: 'Me hizo reír' },
];

export const COMMENT_STARTERS: string[] = [
  'Mi parte favorita fue ',
  'Me encantó cómo describiste ',
  '¡Qué gran final! Me dejó pensando en ',
  'Sigue escribiendo, me gustó mucho ',
];

const RAINDROPS_KEY = 'gg_social_raindrops_v1';
const LIKED_KEY = 'gg_social_liked_texts_v1';
const SAVED_KEY = 'gg_social_saved_texts_v1';
const COMPLETED_READS_KEY = 'gg_social_completed_reads_v1';

const BLOCKED_WORDS = ['idiota', 'estupido', 'estúpido', 'imbecil', 'imbécil', 'mierda', 'puta', 'pendejo'];

export function containsBlockedLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((w) => lower.includes(w));
}

function readJsonArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, items: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignorar error de cuota
  }
}

export function getRaindropsBalance(): number {
  try {
    const raw = localStorage.getItem(RAINDROPS_KEY);
    if (raw === null) {
      localStorage.setItem(RAINDROPS_KEY, '25');
      return 25;
    }
    const num = parseInt(raw, 10);
    return Number.isNaN(num) ? 25 : Math.max(0, num);
  } catch {
    return 25;
  }
}

export function addRaindrops(amount: number): number {
  const next = getRaindropsBalance() + Math.max(0, amount);
  try {
    localStorage.setItem(RAINDROPS_KEY, String(next));
  } catch {
    // Ignorar
  }
  return next;
}

export function spendRaindrops(amount: number): { ok: boolean; balance: number } {
  const current = getRaindropsBalance();
  if (current < amount) {
    return { ok: false, balance: current };
  }
  const next = current - amount;
  try {
    localStorage.setItem(RAINDROPS_KEY, String(next));
  } catch {
    // Ignorar
  }
  return { ok: true, balance: next };
}

export function getLikedTextIds(): string[] {
  return readJsonArray(LIKED_KEY);
}

export function setLikedTextId(textId: string, liked: boolean): string[] {
  const current = readJsonArray(LIKED_KEY);
  const next = liked
    ? Array.from(new Set([...current, textId]))
    : current.filter((id) => id !== textId);
  writeJsonArray(LIKED_KEY, next);
  return next;
}

export function getSavedTextIds(): string[] {
  return readJsonArray(SAVED_KEY);
}

export function toggleSavedTextId(textId: string): { saved: boolean; list: string[] } {
  const current = readJsonArray(SAVED_KEY);
  const exists = current.includes(textId);
  const list = exists ? current.filter((id) => id !== textId) : [...current, textId];
  writeJsonArray(SAVED_KEY, list);
  return { saved: !exists, list };
}

export function getCompletedReadIds(): string[] {
  return readJsonArray(COMPLETED_READS_KEY);
}

export function markReadCompletedLocal(textId: string): boolean {
  const current = readJsonArray(COMPLETED_READS_KEY);
  if (current.includes(textId)) return false;
  writeJsonArray(COMPLETED_READS_KEY, [...current, textId]);
  return true;
}

/**
 * Suscripción global a las estadísticas sociales de todos los textos
 */
export function subscribeAllTextStats(
  onUpdate: (statsMap: Record<string, TextSocialStats>) => void
): () => void {
  const colRef = collection(db, 'gran_galeria_stats');
  return onSnapshot(
    colRef,
    (snap) => {
      const map: Record<string, TextSocialStats> = {};
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        map[docSnap.id] = {
          likes: typeof d.likes === 'number' ? d.likes : 0,
          commentsCount: typeof d.commentsCount === 'number' ? d.commentsCount : 0,
          giftPoints: typeof d.giftPoints === 'number' ? d.giftPoints : 0,
          gifts: (d.gifts && typeof d.gifts === 'object' ? d.gifts : {}) as Record<string, number>,
          reactions: (d.reactions && typeof d.reactions === 'object' ? d.reactions : {}) as Record<string, number>,
        };
      });
      onUpdate(map);
    },
    (err) => {
      console.warn('[granGaleriaSocialService] subscribeAllTextStats:', err);
    }
  );
}

/**
 * Suscripción a comentarios y regalos de un relato específico
 */
export function subscribeTextSocialDetail(
  textId: string,
  onComments: (comments: TextCommentItem[]) => void,
  onGifts: (gifts: TextGiftItem[]) => void
): () => void {
  const commentsQuery = query(
    collection(db, 'gran_galeria_stats', textId, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const giftsQuery = query(
    collection(db, 'gran_galeria_stats', textId, 'gifts'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );

  const unsubComments = onSnapshot(
    commentsQuery,
    (snap) => {
      const list: TextCommentItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorName: String(data.authorName || 'Lector'),
          authorBadge: data.authorBadge ? String(data.authorBadge) : undefined,
          text: String(data.text || ''),
          createdAt: String(data.createdAt || ''),
        };
      });
      onComments(list);
    },
    (err) => {
      console.warn('[granGaleriaSocialService] comments:', err);
    }
  );

  const unsubGifts = onSnapshot(
    giftsQuery,
    (snap) => {
      const list: TextGiftItem[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          emojiId: String(data.emojiId || 'gota'),
          emoji: String(data.emoji || '🌧️'),
          emojiName: String(data.emojiName || 'Gota de Inspiración'),
          cost: typeof data.cost === 'number' ? data.cost : 2,
          senderName: String(data.senderName || 'Lector'),
          message: data.message ? String(data.message) : undefined,
          createdAt: String(data.createdAt || ''),
        };
      });
      onGifts(list);
    },
    (err) => {
      console.warn('[granGaleriaSocialService] gifts:', err);
    }
  );

  return () => {
    unsubComments();
    unsubGifts();
  };
}

export async function toggleTextLikeFirestore(textId: string, nextLiked: boolean): Promise<void> {
  const statsRef = doc(db, 'gran_galeria_stats', textId);
  await setDoc(
    statsRef,
    {
      likes: increment(nextLiked ? 1 : -1),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function addLiteraryReactionFirestore(textId: string, reactionId: string): Promise<void> {
  const statsRef = doc(db, 'gran_galeria_stats', textId);
  await setDoc(
    statsRef,
    {
      reactions: {
        [reactionId]: increment(1),
      },
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function postTextCommentFirestore(
  textId: string,
  payload: { authorName: string; authorBadge?: string; text: string }
): Promise<void> {
  const now = new Date().toISOString();
  await addDoc(collection(db, 'gran_galeria_stats', textId, 'comments'), {
    authorName: payload.authorName.trim().slice(0, 60),
    authorBadge: payload.authorBadge || '📖 Lector',
    text: payload.text.trim().slice(0, 500),
    createdAt: now,
  });

  const statsRef = doc(db, 'gran_galeria_stats', textId);
  await setDoc(
    statsRef,
    {
      commentsCount: increment(1),
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function sendEmojiGiftFirestore(
  textId: string,
  gift: CustomGiftEmoji,
  senderName: string,
  message?: string
): Promise<void> {
  const now = new Date().toISOString();
  await addDoc(collection(db, 'gran_galeria_stats', textId, 'gifts'), {
    emojiId: gift.id,
    emoji: gift.emoji,
    emojiName: gift.name,
    cost: gift.cost,
    senderName: senderName.trim().slice(0, 60) || 'Lector Anónimo',
    ...(message?.trim() ? { message: message.trim().slice(0, 180) } : {}),
    createdAt: now,
  });

  const statsRef = doc(db, 'gran_galeria_stats', textId);
  await setDoc(
    statsRef,
    {
      giftPoints: increment(gift.cost),
      gifts: {
        [gift.id]: increment(1),
      },
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function deleteTextCommentAdmin(textId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(db, 'gran_galeria_stats', textId, 'comments', commentId));
  const statsRef = doc(db, 'gran_galeria_stats', textId);
  await setDoc(
    statsRef,
    {
      commentsCount: increment(-1),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
