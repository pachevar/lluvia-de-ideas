import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { compressImageWebP, blobToDataURL } from '../utils/imageUpload';

export type SutzIconCategory = 'personalizado' | 'ancestral' | 'tecnologia' | 'naturaleza' | 'codices';

export interface SutzCustomIcon {
  id: string;
  name: string;
  url: string;
  category: SutzIconCategory;
  tags?: string[];
  createdAt?: any;
  createdBy?: string;
  isBase64?: boolean;
}

export const SUTZ_ICON_CATEGORIES: { id: SutzIconCategory; label: string; icon: string }[] = [
  { id: 'personalizado', label: 'Personalizados', icon: '✨' },
  { id: 'ancestral', label: 'Ancestrales / Mayas', icon: '📜' },
  { id: 'tecnologia', label: 'Ciencia y Tecnología', icon: '⚡' },
  { id: 'naturaleza', label: 'Flora, Fauna y Biomas', icon: '🌿' },
  { id: 'codices', label: 'Códices y Sabiduría', icon: '🔮' }
];

const COLLECTION_NAME = 'sutz_hex_icons';
const STORAGE_FOLDER = 'sutz_icons';

/**
 * Escucha en tiempo real todos los iconos personalizados ordenados por fecha de creación.
 */
export function subscribeCustomIcons(
  callback: (icons: SutzCustomIcon[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: SutzCustomIcon[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || 'Ícono sin nombre',
          url: data.url || '',
          category: data.category || 'personalizado',
          tags: data.tags || [],
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          isBase64: data.isBase64
        });
      });
      // Ordenar por fecha o nombre en memoria para evitar requerir índices compuestos en Firestore
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis?.() || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      callback(items);
    },
    (err) => {
      console.warn('[sutzIconService] Error en snapshot de iconos:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Obtiene la lista estática de iconos personalizados de Firestore.
 */
export async function getCustomIcons(): Promise<SutzCustomIcon[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    const items: SutzCustomIcon[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        name: data.name || '',
        url: data.url || '',
        category: data.category || 'personalizado',
        tags: data.tags || [],
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isBase64: data.isBase64
      });
    });
    return items;
  } catch (err) {
    console.warn('[sutzIconService] Fallback obteniendo iconos sin orderBy:', err);
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items: SutzCustomIcon[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        name: data.name || '',
        url: data.url || '',
        category: data.category || 'personalizado',
        tags: data.tags || [],
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isBase64: data.isBase64
      });
    });
    return items;
  }
}

/**
 * Sube un archivo de icono (SVG o imagen rasterizada WebP optimizada de 256x256)
 * a la carpeta organizada `sutz_icons/` en Storage y crea el registro en Firestore.
 */
export async function uploadCustomIcon(
  file: File,
  name: string,
  category: SutzIconCategory = 'personalizado',
  createdBy = 'admin'
): Promise<SutzCustomIcon> {
  const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  let downloadUrl = '';
  let isBase64 = false;

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (isSvg) {
    // Si es SVG, preservar la naturaleza vectorial sin rasterizar
    const fileName = `${timestamp}_${cleanBaseName}.svg`;
    const storageRef = ref(storage, `${STORAGE_FOLDER}/${fileName}`);
    try {
      await uploadBytes(storageRef, file, { contentType: 'image/svg+xml' });
      downloadUrl = await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('[sutzIconService] Error subiendo SVG a Storage. Usando Data URL fallback.', err);
      downloadUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      isBase64 = true;
    }
  } else {
    // Si es PNG, JPG, WebP, etc., procesamos y optimizamos a WebP 256x256 con fondo transparente preservado
    try {
      const compressedBlob = await compressImageWebP(file, 256, 256, 0.90);
      const fileName = `${timestamp}_${cleanBaseName}.webp`;
      const storageRef = ref(storage, `${STORAGE_FOLDER}/${fileName}`);

      try {
        await uploadBytes(storageRef, compressedBlob, { contentType: 'image/webp' });
        downloadUrl = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('[sutzIconService] Storage no disponible. Usando Base64 WebP fallback:', storageErr);
        downloadUrl = await blobToDataURL(compressedBlob);
        isBase64 = true;
      }
    } catch (compressErr) {
      console.error('[sutzIconService] Error procesando imagen:', compressErr);
      throw new Error('No se pudo procesar la imagen del icono.');
    }
  }

  // Generar ID único para el documento en Firestore
  const iconDocId = `icon_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const iconDocRef = doc(db, COLLECTION_NAME, iconDocId);

  const cleanDisplayName = name.trim() || cleanBaseName.replace(/_/g, ' ');

  const newIcon: SutzCustomIcon = {
    id: iconDocId,
    name: cleanDisplayName,
    url: downloadUrl,
    category,
    createdAt: serverTimestamp(),
    createdBy,
    isBase64
  };

  await setDoc(iconDocRef, newIcon);

  return newIcon;
}

/**
 * Elimina un icono personalizado de Firestore y de Storage si corresponde.
 */
export async function deleteCustomIcon(id: string, url: string): Promise<void> {
  // 1. Borrar documento en Firestore
  const iconDocRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(iconDocRef);

  // 2. Intentar borrar en Firebase Storage si es una URL de storage
  if (url && (url.includes('firebasestorage.googleapis.com') || url.startsWith('gs://'))) {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('[sutzIconService] No se pudo borrar el archivo físico en Storage (puede que ya no exista):', err);
    }
  }
}
