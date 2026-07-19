import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs, updateDoc, doc } from 'firebase/firestore';

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

async function update() {
  const q = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No active game found.");
    return;
  }
  const gameDoc = snap.docs[0];
  console.log("Active Game ID:", gameDoc.id);

  // Set test customization
  const customization = {
    headerHeight: 220,
    headerImage: gameDoc.data().customization?.headerImage || "",
    soundTheme: "cyberpunk",
    subtitle: "Prueba de Integracion",
    title: "Cyber Bingo Test",
    primaryColor: "#00f0ff", // cyan
    accentColor: "#ff007f", // hot pink
    backgroundColor: "#0a0b10", // dark blue
    themeName: "neon",
    markerEmoji: "🔥",
    cardTheme: "cyberpunk",
    numberToImageMap: {
      "17": {
        type: "emoji",
        value: "🦜",
        label: "Quetzal"
      }
    }
  };

  await updateDoc(doc(db, 'bingo_games', gameDoc.id), {
    customization
  });
  console.log("Active game updated with test customization!");
}

update().catch(console.error);
