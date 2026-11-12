import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface EcosystemContact {
  id?: string;
  nombre: string;
  puesto: string;
  institucion: string;
  contacto: string;
  timestamp: string;
  source?: string;
}

const COLLECTION_NAME = 'ecosystem_contacts';

export async function submitEcosystemContact(
  data: Omit<EcosystemContact, 'id' | 'timestamp' | 'source'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    nombre: data.nombre.trim(),
    puesto: data.puesto.trim(),
    institucion: data.institucion.trim(),
    contacto: data.contacto.trim(),
    timestamp: new Date().toISOString(),
    source: 'qr_wallpaper_modal',
  });
  return docRef.id;
}

export async function fetchEcosystemContacts(): Promise<EcosystemContact[]> {
  const snap = await getDocs(collection(db, COLLECTION_NAME));
  const list: EcosystemContact[] = [];
  snap.forEach((docSnap) => {
    list.push({
      id: docSnap.id,
      ...(docSnap.data() as Omit<EcosystemContact, 'id'>),
    });
  });
  list.sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  });
  return list;
}

export async function deleteEcosystemContact(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

