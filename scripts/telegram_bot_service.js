import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const BOT_TOKEN = '8871378697:AAHbLJumNh9FhiRIzROq_g2QjbaPLlzuUj4';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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

async function sendMessage(chatId, text, inlineKeyboard = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (inlineKeyboard) {
      payload.reply_markup = { inline_keyboard: inlineKeyboard };
    }
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error(`Error enviando mensaje a chat ${chatId}:`, err);
  }
}

async function handleStartCommand(chatId, payload, userName = 'Jugador') {
  console.log(`\n📥 Comando /start recibido en chat ${chatId} de @${userName} con payload: "${payload}"`);

  if (!payload) {
    const welcomeMsg = 
      `👋 ¡Hola <b>${userName}</b>! Bienvenido a <b>Bingotenango Oficial</b> 🎟️\n\n` +
      `Soy el asistente automatizado de entrega de cartones y pases de juego.\n\n` +
      `Si compraste o te regalaron un pase, pulsa en el enlace que recibiste para vincularlo aquí, o visita nuestra tienda para adquirir tus boletos.`;
    
    await sendMessage(chatId, welcomeMsg, [
      [{ text: '🛒 Visitar Tienda de Boletos', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo/boletos' }]
    ]);
    return;
  }

  // Si payload es un token o ID de cartón
  const tokenId = payload.replace(/^token_/, '');
  console.log(`Buscando token en Firestore: ${tokenId}...`);

  try {
    // 1. Buscar en bingo_access_tokens
    const tokenRef = doc(db, 'bingo_access_tokens', tokenId);
    const tokenSnap = await getDoc(tokenRef);

    if (tokenSnap.exists()) {
      const token = tokenSnap.data();
      const playerName = token.playerName || userName;
      const playUrl = `https://lluviadeideas-educativo.web.app/juegos/bingo?access=${tokenId}`;

      const text = 
        `🎉 <b>¡PASE DE JUEGO CONFIRMADO!</b>\n\n` +
        `¡Hola <b>${playerName}</b>! 🎟️ Aquí tienes tu Pase Único oficial para jugar en <b>Bingotenango</b>:\n\n` +
        `🏆 <b>Categoría:</b> ${token.tierName || 'Cartón Oficial'} (${token.prizeLevel || 'En vivo'})\n` +
        `🎫 <b>Total Cartones:</b> ${token.quantity || 1} Cartón(es)\n` +
        `💵 <b>Estado de Pago:</b> Confirmado (Q${token.paidAmount || 10}.00)\n\n` +
        `🚀 <i>Presiona el botón de abajo para ingresar a la sala en vivo con tus cartones activos:</i>`;

      const keyboard = [
        [{ text: '🎮 ENTRAR A JUGAR AHORA EN VIVO', url: playUrl }],
        [{ text: '🛒 Tienda de Boletos', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo/boletos' }]
      ];

      await sendMessage(chatId, text, keyboard);

      // Actualizar token en Firestore
      await updateDoc(tokenRef, {
        telegramChatId: chatId,
        telegramUser: userName,
        linkSent: true,
        linkSentAt: Date.now(),
        linkSentCount: (token.linkSentCount || 0) + 1
      });

      console.log(`✅ Pase ${tokenId} entregado exitosamente por Telegram a ${playerName} (Chat: ${chatId})`);
      return;
    }

    // 2. Buscar en bingo_cards (por si es cartón individual)
    const cardRef = doc(db, 'bingo_cards', tokenId);
    const cardSnap = await getDoc(cardRef);

    if (cardSnap.exists()) {
      const card = cardSnap.data();
      const playUrl = `https://lluviadeideas-educativo.web.app/juegos/bingo/carton/${tokenId}`;

      const text = 
        `🎉 <b>¡CARTÓN OFICIAL DE BINGOTENANGO!</b>\n\n` +
        `¡Hola <b>${card.playerName || userName}</b>! 🎟️ Tu cartón individual está listo para jugar:\n\n` +
        `🆔 <b>ID de Cartón:</b> #${tokenId}\n` +
        `💵 <b>Estado:</b> Cobro Confirmado (Q${card.paidAmount || 10})\n\n` +
        `🎮 <i>Abre tu cartón para marcar tus números en vivo:</i>`;

      const keyboard = [
        [{ text: '🎲 ABRIR MI CARTÓN DE BINGO', url: playUrl }]
      ];

      await sendMessage(chatId, text, keyboard);

      await updateDoc(cardRef, {
        telegramChatId: chatId,
        linkSent: true,
        linkSentAt: Date.now()
      });

      console.log(`✅ Cartón #${tokenId} entregado por Telegram a ${card.playerName} (Chat: ${chatId})`);
      return;
    }

    // Si no se encontró el pase
    await sendMessage(chatId, `⚠️ No encontramos un pase activo asociado al código: <code>${tokenId}</code>.\n\nPor favor verifica tu enlace o comunícate con el anfitrión del juego.`);
  } catch (err) {
    console.error("Error al procesar pase en Telegram:", err);
    await sendMessage(chatId, `Ocurrió un inconveniente al validar tu pase. Por favor intenta de nuevo en unos momentos.`);
  }
}

async function startBotPolling() {
  console.log("🤖 Iniciando Bot de Telegram Bingotenango (@Bingotenangobot)...");
  let offset = 0;

  while (true) {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=25`);
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text.trim();
            const userName = update.message.from.first_name || update.message.from.username || 'Jugador';

            if (text.startsWith('/start')) {
              const parts = text.split(' ');
              const payload = parts.length > 1 ? parts[1].trim() : '';
              await handleStartCommand(chatId, payload, userName);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error en polling de Telegram:", err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startBotPolling();
