const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkActiveGame() {
  const snapshot = await db.collection('bingo_games').where('active', '==', true).limit(1).get();
  if (snapshot.empty) {
    console.log('No active game found');
    return;
  }
  const doc = snapshot.docs[0];
  console.log('Active Game ID:', doc.id);
  console.log('Data:', JSON.stringify(doc.data(), null, 2));
}

checkActiveGame().catch(console.error);
