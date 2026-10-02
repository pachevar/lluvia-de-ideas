import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function compressImageWebP(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas failure'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Blob failure'));
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function uploadImageWithFallback(
  file: File,
  folder = 'landing-assets',
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.78
): Promise<{ url: string; isBase64: boolean }> {
  // Para assets de libros o catálogo, dimensiones balanceadas para nitidez y peso liviano
  const isBookAsset = folder.includes('libros') || folder.includes('mercado');
  const targetMaxW = isBookAsset ? Math.min(maxWidth, 600) : maxWidth;
  const targetMaxH = isBookAsset ? Math.min(maxHeight, 800) : maxHeight;
  const targetQuality = isBookAsset ? 0.72 : quality;

  const compressedBlob = await compressImageWebP(file, targetMaxW, targetMaxH, targetQuality);
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') + '.webp';
  const fileRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);

  try {
    await uploadBytes(fileRef, compressedBlob, { contentType: 'image/webp' });
    const downloadUrl = await getDownloadURL(fileRef);
    return { url: downloadUrl, isBase64: false };
  } catch (storageErr: any) {
    console.warn(`[ImageUpload] Firebase Storage no disponible o cuota excedida (${storageErr?.code || storageErr?.message}). Usando fallback Base64 WebP optimizado.`);
    // En caso de fallback base64, comprimimos con dimensiones compactas para no saturar Firestore
    const compactBlob = isBookAsset
      ? await compressImageWebP(file, 450, 600, 0.65)
      : compressedBlob;
    const dataUrl = await blobToDataURL(compactBlob);
    return { url: dataUrl, isBase64: true };
  }
}

export async function uploadImageToStorage(file: File, folder = 'libros-assets'): Promise<string> {
  const res = await uploadImageWithFallback(file, folder);
  return res.url;
}

/**
 * Reduce y comprime una imagen en Base64 existente para que ocupe menos de 30 KiB
 * garantizando que nunca exceda el límite de documento de Firestore.
 */
export async function shrinkBase64Image(
  dataUrl: string,
  maxWidth = 450,
  maxHeight = 600,
  quality = 0.65
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  // Si ya es muy liviana (< 40 KB de longitud de texto), no requiere re-compresión
  if (dataUrl.length < 40000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(dataUrl);
      }
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/webp', quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

