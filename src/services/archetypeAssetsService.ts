import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface ArchetypeAssetDoc {
  id: string;
  url: string;
  type: 'archetype' | 'journey';
  updatedAt: string;
}

const COLLECTION_NAME = 'archetype_assets';

/**
 * Guarda o actualiza un asset de arquetipo o etapa en su propio documento individual en Firestore.
 * Cada documento cuenta con hasta 1 MiB de almacenamiento exclusivo.
 */
export async function saveArchetypeAsset(
  id: string,
  url: string,
  type: 'archetype' | 'journey'
): Promise<void> {
  const assetRef = doc(db, COLLECTION_NAME, id);
  await setDoc(assetRef, {
    id,
    url,
    type,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

/**
 * Elimina un asset de arquetipo o etapa de Firestore.
 */
export async function deleteArchetypeAsset(id: string): Promise<void> {
  const assetRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(assetRef);
}

/**
 * Escucha en tiempo real todos los assets de arquetipos y etapas del viaje del héroe.
 */
export function subscribeArchetypeAssets(
  callback: (assets: { archetypes: Record<string, string>; journey: Record<string, string> }) => void,
  onError?: (err: Error) => void
): () => void {
  const assetsColRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    assetsColRef,
    (snapshot) => {
      const archetypes: Record<string, string> = {};
      const journey: Record<string, string> = {};

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Partial<ArchetypeAssetDoc>;
        if (data.url) {
          if (data.type === 'journey') {
            journey[docSnap.id] = data.url;
          } else {
            // Por defecto tratamos como arquetipo si no es journey
            archetypes[docSnap.id] = data.url;
          }
        }
      });

      callback({ archetypes, journey });
    },
    (err) => {
      console.warn('[ArchetypeAssetsService] Firestore listener warning:', err);
      if (onError) onError(err);
    }
  );
}
