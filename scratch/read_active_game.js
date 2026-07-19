import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDk5Z1_us-yKBO9YmnvSZD0SS10X_wklek",
  authDomain: "lluviadeideas-educativo.firebaseapp.com",
  projectId: "lluviadeideas-educativo",
  storageBucket: "lluviadeideas-educativo.firebasestorage.app",
  messagingSenderId: "636417514690",
  appId: "1:636417514690:web:df3b2b2c1ad0606a7e6f5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No active game found.");
    return;
  }
  const doc = snap.docs[0];
  console.log("ID:", doc.id);
  console.log("Data:", JSON.stringify(doc.data(), null, 2));
}

check().catch(console.error);
