import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

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

// Teclado fijo persistente con botones táctiles grandes y Web Apps integradas
const MAIN_PERSISTENT_KEYBOARD = {
  keyboard: [
    [
      { text: '🎮 Entrar a la Sala de Juego', web_app: { url: 'https://lluviadeideas-educativo.web.app/juegos/bingo' } }
    ],
    [
      { text: '🎟️ Comprar Cartones', web_app: { url: 'https://lluviadeideas-educativo.web.app/juegos/bingo/boletos' } },
      { text: '💬 Soporte WhatsApp' }
    ]
  ],
  resize_keyboard: true,
  is_persistent: true
};

/**
 * Envía un mensaje con soporte para Markdown/HTML, inline_keyboard o reply_markup persistente.
 */
async function sendMessage(chatId, text, inlineKeyboard = null, customReplyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };

    if (customReplyMarkup) {
      payload.reply_markup = customReplyMarkup;
    } else if (inlineKeyboard) {
      payload.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`❌ Error Telegram enviando a chat ${chatId}:`, data.description);
      if (data.description && data.description.includes("can't parse entities")) {
        delete payload.parse_mode;
        const resFallback = await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        return await resFallback.json();
      }
    } else {
      console.log(`✅ Mensaje enviado exitosamente a chat ${chatId}`);
    }
    return data;
  } catch (err) {
    console.error(`Error de red enviando mensaje a chat ${chatId}:`, err.message);
  }
}

/**
 * Maneja el comando /start (con o sin token de pase/cartón)
 */
async function handleStartCommand(chatId, payload, userName = 'Jugador') {
  console.log(`\n📥 Comando /start recibido en chat ${chatId} de @${userName} con payload: "${payload}"`);

  if (!payload) {
    const welcomeMsg = 
      `✨ <b>¡Hola ${userName}! Bienvenido a Bingotenango Oficial</b> 🎟️\n\n` +
      `Soy tu asistente interactivo para recibir cartones digitales y jugar en vivo.\n\n` +
      `🎮 <b>Toca el botón inferior izquierdo [🎮 Jugar Bingo]</b> para abrir el juego en pantalla completa dentro de Telegram, o utiliza los accesos rápidos de abajo:`;
    
    // Enviamos el mensaje inicial activando el teclado fijo con botones táctiles grandes
    await sendMessage(chatId, welcomeMsg, null, MAIN_PERSISTENT_KEYBOARD);
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

      // Vincular a la Cartera de Clientes bingo_players si tenemos el teléfono
      if (token.playerWhatsapp) {
        const normPhone = token.playerWhatsapp.replace(/\D/g, '');
        const finalPhone = normPhone.length === 8 ? `502${normPhone}` : normPhone;
        if (finalPhone) {
          const pRef = doc(db, 'bingo_players', finalPhone);
          await setDoc(pRef, {
            id: finalPhone,
            phone: finalPhone,
            name: playerName,
            telegramChatId: chatId,
            telegramUsername: userName,
            updatedAt: Date.now()
          }, { merge: true });
          console.log(`👤 Jugador ${finalPhone} vinculado con Telegram Chat ID: ${chatId}`);
        }
      }

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

      if (card.playerWhatsapp) {
        const normPhone = card.playerWhatsapp.replace(/\D/g, '');
        const finalPhone = normPhone.length === 8 ? `502${normPhone}` : normPhone;
        if (finalPhone) {
          const pRef = doc(db, 'bingo_players', finalPhone);
          await setDoc(pRef, {
            id: finalPhone,
            phone: finalPhone,
            name: card.playerName || userName,
            telegramChatId: chatId,
            telegramUsername: userName,
            updatedAt: Date.now()
          }, { merge: true });
          console.log(`👤 Jugador ${finalPhone} vinculado con Telegram Chat ID: ${chatId}`);
        }
      }

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

/**
 * Sincroniza las configuraciones visuales del bot en Telegram (Web App en menú, comandos y descripciones)
 */
async function syncBotSettings() {
  try {
    console.log("⚙️ Sincronizando configuraciones oficiales en Telegram API...");

    // 1. Botón de Menú como Mini App (Web App directa)
    await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🎮 Jugar Bingo',
          web_app: {
            url: 'https://lluviadeideas-educativo.web.app/juegos/bingo'
          }
        }
      })
    });

    // 2. Descripción oficial completa
    const desc = '¡Bienvenido a Bingotenango Oficial! 🎟️\n\nAquí recibirás tus cartones digitales y pases de juego para participar y marcar tus números en vivo desde tu teléfono o computadora.\n\nPresiona INICIAR para recibir tus accesos y unirte a la diversión.';
    const shortDesc = 'Bot Oficial de Bingotenango para recibir tus cartones y jugar en vivo.';

    for (const lang of ['', 'es', 'en']) {
      await fetch(`${TELEGRAM_API}/setMyDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, language_code: lang })
      });
      await fetch(`${TELEGRAM_API}/setMyShortDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_description: shortDesc, language_code: lang })
      });
    }

    // 3. Comandos oficiales
    const commands = [
      { command: 'start', description: 'Iniciar asistente y recibir mis cartones' },
      { command: 'jugar', description: 'Entrar a la sala de juego en vivo' },
      { command: 'boletos', description: 'Comprar cartones en la tienda oficial' },
      { command: 'ayuda', description: 'Soporte y atención al jugador' }
    ];

    for (const lang of ['', 'es']) {
      await fetch(`${TELEGRAM_API}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands: commands, language_code: lang })
      });
    }

    console.log("✅ Configuraciones de Telegram sincronizadas exitosamente.");
  } catch (err) {
    console.warn("Aviso al sincronizar configuraciones de Telegram:", err.message);
  }
}

/**
 * Bucle continuo de polling para procesar mensajes de Telegram 24/7
 */
async function startBotPolling() {
  console.log("🤖 Iniciando Bot de Telegram Bingotenango (@Bingotenangobot)...");
  await syncBotSettings();

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
            const lower = text.toLowerCase();
            console.log(`\n📩 Mensaje recibido de ${userName} (Chat ${chatId}): "${text}"`);

            if (lower.startsWith('/start')) {
              const parts = text.split(' ');
              const payload = parts.length > 1 ? parts[1].trim() : '';
              await handleStartCommand(chatId, payload, userName);
            } else if (lower.includes('soporte') || lower.includes('whatsapp') || lower.startsWith('/ayuda')) {
              console.log(`▶️ Ejecutando soporte WhatsApp para ${userName}`);
              await sendMessage(
                chatId,
                `💬 <b>ATENCIÓN Y SOPORTE OFICIAL</b>\n\n` +
                `¡Hola <b>${userName}</b>! Estamos disponibles para ayudarte con cualquier duda sobre tus cartones, compras o la transmisión en vivo.\n\n` +
                `👇 <i>Toca el botón abajo para comunicarte directamente con nuestro equipo:</i>`,
                [
                  [{ text: '💬 Chatear con Soporte por WhatsApp', url: 'https://wa.me/50246741239?text=Hola,%20necesito%20asistencia%20con%20Bingotenango' }],
                  [{ text: '🎮 Entrar a la Sala de Juego', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo' }]
                ]
              );
            } else if (lower.startsWith('/jugar') || lower.includes('jugar') || lower.includes('sala')) {
              console.log(`▶️ Ejecutando /jugar para ${userName}`);
              await sendMessage(
                chatId,
                `🎮 <b>SALA DE BINGO EN VIVO</b>\n\n` +
                `¡Hola <b>${userName}</b>! Ya puedes ingresar a la sala de juego en vivo para marcar tus cartones en pantalla.\n\n` +
                `👇 <i>Toca el botón abajo para ingresar de inmediato:</i>`,
                [
                  [{ text: '🎲 ENTRAR A LA SALA DE JUEGO', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo' }],
                  [{ text: '🛒 Tienda de Boletos', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo/boletos' }]
                ]
              );
            } else if (lower.startsWith('/boletos') || lower.includes('boletos') || lower.includes('carton') || lower.includes('comprar')) {
              console.log(`▶️ Ejecutando /boletos para ${userName}`);
              await sendMessage(
                chatId,
                `🎟️ <b>TIENDA OFICIAL DE BOLETOS</b>\n\n` +
                `¡Hola <b>${userName}</b>! Adquiere tus cartones para participar en la próxima partida de Bingotenango.\n\n` +
                `👇 <i>Toca el botón abajo para elegir tus cartones:</i>`,
                [
                  [{ text: '🛒 COMPRAR CARTONES AHORA', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo/boletos' }],
                  [{ text: '🎮 Entrar a la Sala', url: 'https://lluviadeideas-educativo.web.app/juegos/bingo' }]
                ]
              );
            } else {
              console.log(`▶️ Mensaje general de ${userName}, respondiendo con teclado interactivo`);
              await sendMessage(
                chatId,
                `👋 ¡Hola <b>${userName}</b>! Bienvenido a <b>Bingotenango Oficial</b> 🎟️\n\n` +
                `Utiliza los botones de abajo para entrar a la sala, adquirir cartones o contactar a soporte:`,
                null,
                MAIN_PERSISTENT_KEYBOARD
              );
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
