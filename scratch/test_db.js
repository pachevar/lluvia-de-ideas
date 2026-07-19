import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyDk5Z1_us-yKBO9YmnvSZD0SS10X_wklek",
  authDomain: "lluviadeideas-educativo.firebaseapp.com",
  projectId: "lluviadeideas-educativo",
  storageBucket: "lluviadeideas-educativo.firebasestorage.app",
  messagingSenderId: "636417514690",
  appId: "1:636417514690:web:df3b2b2c1ad0606a7e6f5b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkActiveGame() {
  const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    fs.writeFileSync('scratch/output.txt', 'No active game found');
    return;
  }
  const doc = querySnapshot.docs[0];
  const out = JSON.stringify(doc.data().customization, null, 2);
  fs.writeFileSync('scratch/output.txt', out);
}

checkActiveGame().catch(e => {
  fs.writeFileSync('scratch/output.txt', e.stack);
});
