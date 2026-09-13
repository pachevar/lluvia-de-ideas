import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoAccessToken } from '../types';
import { generateBingoMatrix, hashBingoMatrix } from '../utils/bingoGenerator';
import { soundEffects } from '../utils/soundEffects';
import {
  recordPlayerPurchase,
  autoDispatchPurchaseToTelegramIfLinked
} from '../services/bingoPlayerService';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  triggerBrowserNotification
} from '../utils/webNotificationUtils';
import './BingoBoletos.css';

interface GiftLinkItem {
  id: string;
  num: number;
  url: string;
  copied: boolean;
}

const BingoBoletosConfirmacion: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const isSuccess = searchParams.get('status') === 'success' || searchParams.get('testMode') === 'true';
  const pkgId = searchParams.get('pkg');
  const tierId = searchParams.get('tier');
  const qtyParam = parseInt(searchParams.get('qty') || '1', 10);
  const playerNameParam = searchParams.get('playerName') || searchParams.get('name');
  const phoneParam = searchParams.get('phone');
  const modeParam = (searchParams.get('mode') as 'personal' | 'gift') || 'personal';

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<BingoAccessToken | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isActivatingCard, setIsActivatingCard] = useState(false);
  const [isOrderPending, setIsOrderPending] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [giftLinks, setGiftLinks] = useState<GiftLinkItem[]>([]);
  const [copiedMainLink, setCopiedMainLink] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [telegramAutoDispatched, setTelegramAutoDispatched] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission());
  const [pushActivating, setPushActivating] = useState(false);

  // Función para generar y asignar cartón en Firestore directamente (evitando duplicados por teléfono)
  const generateAndAssignCard = async (
    tknId: string | null,
    ord: any,
    targetGameId: string
  ): Promise<string | null> => {
    try {
      // 1. Si el jugador ya tiene un número de teléfono, verificar si ya existe un cartón activo para esta partida
      if (ord?.playerWhatsapp) {
        try {
          const qExisting = query(
            collection(db, 'bingo_cards'),
            where('phone', '==', ord.playerWhatsapp),
            where('gameId', '==', targetGameId),
            limit(1)
          );
          const existingSnap = await getDocs(qExisting);
          if (!existingSnap.empty) {
            const existingId = existingSnap.docs[0].id;
            if (tknId) {
              await updateDoc(doc(db, 'bingo_access_tokens', tknId), {
                usedByCardId: existingId,
                cardIds: [existingId],
                status: 'used',
                firstUsedAt: Date.now()
              });
            }
            return existingId;
          }
        } catch (checkErr) {
          console.warn("Aviso al verificar cartón previo por teléfono en confirmación:", checkErr);
        }
      }

      const currentMatrix = generateBingoMatrix();
      const currentHash = hashBingoMatrix(currentMatrix);
      let currentShortId = '';
      let unique = false;
      while (!unique) {
        currentShortId = Math.floor(1000000 + Math.random() * 9000000).toString();
        const cardRef = doc(db, 'bingo_cards', currentShortId);
        const cardSnap = await getDoc(cardRef);
        if (!cardSnap.exists()) {
          unique = true;
        }
      }

      await setDoc(doc(db, 'bingo_cards', currentShortId), {
        gameId: targetGameId,
        playerName: ord?.playerName || 'Jugador Bingotenango',
        phone: ord?.playerWhatsapp || null,
        promoterCode: null,
        tierId: ord?.tierId || null,
        tierName: ord?.tierName || null,
        prizeLevel: ord?.prizeLevel || null,
        tokenId: tknId || null,
        cardNumber: 1,
        totalCards: 1,
        matrix: {
          r0: currentMatrix[0],
          r1: currentMatrix[1],
          r2: currentMatrix[2],
          r3: currentMatrix[3],
          r4: currentMatrix[4]
        },
        hash: currentHash,
        createdAt: Date.now()
      });

      if (tknId) {
        await updateDoc(doc(db, 'bingo_access_tokens', tknId), {
          usedByCardId: currentShortId,
          cardIds: [currentShortId],
          status: 'used',
          firstUsedAt: Date.now()
        });
      }

      return currentShortId;
    } catch (e) {
      console.error("Error generando cartón directo:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchOrderAndToken = async () => {
      if (!orderId && !playerNameParam) {
        setLoading(false);
        return;
      }

      let currentOrder: any = null;

      try {
        if (orderId) {
          const ref = doc(db, 'bingo_orders', orderId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            currentOrder = snap.data();
            const isCash = currentOrder.paymentMethod === 'efectivo';
            const isFree = (currentOrder.totalPriceQ === 0) || (currentOrder.priceQ === 0) || (currentOrder.unitPriceQ === 0) || (currentOrder.gateway === 'gratis_cortesia') || (tierId === 'tier-free');
            if (!isCash && (isSuccess || isFree) && currentOrder.status !== 'completed') {
              await updateDoc(ref, {
                status: 'completed',
                paidAt: Date.now()
              });
              currentOrder.status = 'completed';
            }
          }
        }

        if (!currentOrder && playerNameParam) {
          const targetTier = tierId || pkgId;
          const unitPrice = targetTier === 'tier-free' ? 0 : (targetTier === 'tier-10' || targetTier === 'pkg-10' ? 10 : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 50 : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 100 : 25);
          const tierName = targetTier === 'tier-free' ? 'Cartón Gratuito (Prueba)' : (targetTier === 'tier-10' || targetTier === 'pkg-10' ? 'Cartón Bronce' : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 'Cartón Oro' : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 'Cartón Diamante VIP' : 'Cartón Plata');
          const prizeLevel = targetTier === 'tier-free' ? 'Partida Gratuita / Demostración' : (targetTier === 'tier-10' ? 'Premios Estándar' : targetTier === 'tier-50' ? 'Grandes Premios' : targetTier === 'tier-100' ? 'Premio Mayor / Pozo VIP' : 'Premios Intermedios');
          const totalQ = unitPrice * qtyParam;
          const isCashFromParam = searchParams.get('paymentMethod') === 'efectivo';

          currentOrder = {
            playerName: decodeURIComponent(playerNameParam),
            playerWhatsapp: phoneParam,
            tierId: targetTier || (unitPrice === 0 ? 'tier-free' : 'tier-25'),
            tierName: tierName,
            prizeLevel: prizeLevel,
            packageName: `${tierName} (${qtyParam} ${qtyParam === 1 ? 'Cartón' : 'Cartones'})`,
            unitPriceQ: unitPrice,
            quantity: qtyParam,
            priceQ: totalQ,
            totalPriceQ: totalQ,
            cartonesCount: qtyParam,
            purchaseMode: modeParam,
            paymentMethod: isCashFromParam ? 'efectivo' : 'online',
            status: (!isCashFromParam && (isSuccess || unitPrice === 0)) ? 'completed' : 'pending'
          };
        }

        const isCash = currentOrder?.paymentMethod === 'efectivo';
        const isFree = (currentOrder?.totalPriceQ === 0) || (currentOrder?.priceQ === 0) || (currentOrder?.unitPriceQ === 0) || (currentOrder?.gateway === 'gratis_cortesia') || (tierId === 'tier-free');
        const isPaid = isFree || (!isCash && isSuccess) || currentOrder?.status === 'completed' || currentOrder?.status === 'paid' || currentOrder?.paymentStatus === 'paid';
        setIsOrderPending(!isPaid && (currentOrder?.status === 'pending' || !currentOrder?.status));
        setOrderData(currentOrder);


        // 2. Obtener la sesión activa de Bingo para vincular el token
        let activeGameId = 'juego-principal';
        let sessionResetAt = Date.now();
        try {
          const qGame = query(collection(db, 'bingo_games'), where('active', '==', true), limit(1));
          const gameSnap = await getDocs(qGame);
          if (!gameSnap.empty) {
            activeGameId = gameSnap.docs[0].id;
            const gData = gameSnap.docs[0].data();
            sessionResetAt = gData.lastResetAt || gData.createdAt || Date.now();
          }
        } catch (gErr) {
          console.warn("No se pudo obtener juego activo:", gErr);
        }

        // 3. Crear pases de acceso según el modo de compra
        const effectiveOrderId = orderId || ('ord_sim_' + Date.now());
        const isGift = currentOrder?.purchaseMode === 'gift';
        const totalQty = currentOrder?.quantity || 1;
        let effectiveTokenId = '';
        const generatedLinks: GiftLinkItem[] = [];

        if (isGift && totalQty >= 1) {
          // Generar o recuperar tokens independientes para cada contacto
          for (let i = 1; i <= totalQty; i++) {
            const giftTokenId = `tkn_gift_${effectiveOrderId}_c${i}`;
            const giftTokenRef = doc(db, 'bingo_access_tokens', giftTokenId);
            try {
              const giftTokenSnap = await getDoc(giftTokenRef);
              if (!giftTokenSnap.exists()) {
                const giftTokenObj: BingoAccessToken = {
                  id: giftTokenId,
                  orderId: effectiveOrderId,
                  playerName: `${currentOrder.playerName} (Contacto #${i})`,
                  playerWhatsapp: currentOrder.playerWhatsapp || '',
                  tierId: currentOrder.tierId || 'tier-25',
                  tierName: currentOrder.tierName || 'Cartón Oficial',
                  prizeLevel: currentOrder.prizeLevel || 'Premios en vivo',
                  quantity: 1, // Cada amigo recibe 1 cartón independiente
                  purchaseMode: 'gift',
                  gameId: activeGameId,
                  scheduledGameId: currentOrder.scheduledGameId || null,
                  sessionResetAt: sessionResetAt,
                  status: isPaid ? 'active' : 'pending',
                  paymentStatus: isPaid ? 'paid' : 'pending',
                  paymentMethod: currentOrder.paymentMethod || 'efectivo',
                  paidAmount: isPaid ? (currentOrder.unitPriceQ || 0) : 0,
                  unitPriceQ: currentOrder.unitPriceQ || 0,
                  usedByDevice: null,
                  linkSent: false,
                  linkSentAt: null,
                  createdAt: Date.now()
                };
                await setDoc(giftTokenRef, giftTokenObj);
              } else if (isPaid && giftTokenSnap.data()?.status === 'pending') {
                await updateDoc(giftTokenRef, {
                  status: 'active',
                  paymentStatus: 'paid',
                  paidAt: Date.now()
                });
              }
            } catch (errSet) {
              console.warn("Aviso al procesar gift token:", errSet);
            }
            generatedLinks.push({
              id: giftTokenId,
              num: i,
              url: `${window.location.origin}/juegos/bingo?access=${giftTokenId}`,
              copied: false
            });
          }
          setGiftLinks(generatedLinks);
          effectiveTokenId = generatedLinks[0]?.id || '';
        } else {
          // Modo personal: token único con su cartón
          const qToken = query(collection(db, 'bingo_access_tokens'), where('orderId', '==', effectiveOrderId), limit(1));
          const snapToken = await getDocs(qToken);

          let tokenObj: BingoAccessToken | null = null;
          if (!snapToken.empty) {
            tokenObj = snapToken.docs[0].data() as BingoAccessToken;
            setAccessToken(tokenObj);
            effectiveTokenId = tokenObj.id;
          } else if (currentOrder) {
            const newTokenId = 'tkn_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
            tokenObj = {
              id: newTokenId,
              orderId: effectiveOrderId,
              playerName: currentOrder.playerName,
              playerWhatsapp: currentOrder.playerWhatsapp || '',
              tierId: currentOrder.tierId || (isFree ? 'tier-free' : 'tier-25'),
              tierName: currentOrder.tierName || (isFree ? 'Cartón Gratuito' : 'Cartón Oficial'),
              prizeLevel: currentOrder.prizeLevel || 'Premios en vivo',
              quantity: currentOrder.quantity || 1,
              purchaseMode: 'personal',
              gameId: activeGameId,
              scheduledGameId: currentOrder.scheduledGameId || null,
              sessionResetAt: sessionResetAt,
              status: 'active',
              usedByDevice: null,
              linkSent: false,
              linkSentAt: null,
              createdAt: Date.now()
            };
            await setDoc(doc(db, 'bingo_access_tokens', newTokenId), tokenObj);
            setAccessToken(tokenObj);
            effectiveTokenId = newTokenId;
          }

          // Si el pago ya está verificado, asegurar que el cartón esté generado y asignado de inmediato
          if (isPaid && currentOrder) {
            let cardIdToUse = tokenObj?.usedByCardId;
            if (!cardIdToUse) {
              cardIdToUse = await generateAndAssignCard(effectiveTokenId, currentOrder, activeGameId);
            }
            if (cardIdToUse) {
              setActiveCardId(cardIdToUse);
              localStorage.setItem('my_bingo_card_id', cardIdToUse);
              localStorage.setItem('my_bingo_card_ids', JSON.stringify([cardIdToUse]));
            }
          }
        }

        // REGISTRO EN CARTERA DE JUGADORES (CRM) Y AUTO-DESPACHO
        if (currentOrder && currentOrder.playerWhatsapp) {
          try {
            const currentPermission = getNotificationPermission();
            await recordPlayerPurchase({
              phone: currentOrder.playerWhatsapp,
              name: currentOrder.playerName,
              email: currentOrder.playerEmail || '',
              spentQ: currentOrder.totalPriceQ ?? currentOrder.priceQ ?? (isFree ? 0 : 25),
              webPushEnabled: currentPermission === 'granted'
            });
          } catch (errCrm) {
            console.warn("Aviso registrando perfil de cliente en cartera:", errCrm);
          }

          // AUTO-DESPACHO TELEGRAM SI EL CLIENTE YA ESTABA VINCULADO
          try {
            if (effectiveTokenId || (isGift && generatedLinks.length > 0)) {
              const targetUrl = isGift ? `${window.location.origin}/juegos/bingo` : `${window.location.origin}/juegos/bingo?access=${effectiveTokenId}`;
              const autoRes = await autoDispatchPurchaseToTelegramIfLinked({
                phone: currentOrder.playerWhatsapp,
                playerName: currentOrder.playerName,
                tokenId: effectiveTokenId,
                quantity: currentOrder.quantity || 1,
                url: targetUrl,
                purchaseMode: isGift ? 'gift' : 'personal',
                giftLinks: isGift ? generatedLinks.map(g => ({ num: g.num, url: g.url })) : undefined
              });
              if (autoRes.dispatched) {
                setTelegramAutoDispatched(true);
              }
            }
          } catch (errAuto) {
            console.warn("Aviso en auto-despacho de Telegram:", errAuto);
          }

          // DISPARO DE NOTIFICACIÓN DE NAVEGADOR SI YA ESTABA PERMITIDA
          if (getNotificationPermission() === 'granted' && effectiveTokenId) {
            const targetUrl = `${window.location.origin}/juegos/bingo?access=${effectiveTokenId}`;
            triggerBrowserNotification("🎟️ ¡Tus Cartones de Bingotenango están Listos!", {
              body: `¡Hola ${currentOrder.playerName}! Tu compra fue confirmada. Toca aquí para abrir tus cartones.`,
              url: targetUrl
            });
          }
        }

      } catch (err) {
        console.error("Error al obtener la orden:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndToken();
  }, [orderId, isSuccess, pkgId, tierId, qtyParam, playerNameParam, phoneParam, modeParam]);

  // Escuchar en tiempo real la orden para cuando el promotor habilite el pago en efectivo
  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, 'bingo_orders', orderId), async (snap) => {
      if (!snap.exists()) return;
      const updated = snap.data();
      setOrderData(updated);

      const isFree = (updated.totalPriceQ === 0) || (updated.priceQ === 0) || (updated.unitPriceQ === 0) || (updated.gateway === 'gratis_cortesia') || (tierId === 'tier-free');
      const isNowPaid = isFree || updated.status === 'completed' || updated.status === 'paid' || updated.paymentStatus === 'paid';

      if (isNowPaid) {
        setIsOrderPending(false);

        if (updated.purchaseMode === 'gift') {
          const totalQty = updated.quantity || 1;
          for (let i = 1; i <= totalQty; i++) {
            const giftTokenId = `tkn_gift_${orderId}_c${i}`;
            try {
              await updateDoc(doc(db, 'bingo_access_tokens', giftTokenId), {
                status: 'active',
                paymentStatus: 'paid',
                paidAt: Date.now()
              });
            } catch (err) {
              console.warn("Aviso activando gift token en snapshot:", err);
            }
          }
          soundEffects.playSuccessFanfare();

          // Auto-despacho a Telegram al confirmarse cobro en efectivo
          try {
            const currentLinks = giftLinks.length > 0
              ? giftLinks.map(g => ({ num: g.num, url: g.url }))
              : Array.from({ length: totalQty }, (_, idx) => ({
                  num: idx + 1,
                  url: `${window.location.origin}/juegos/bingo?access=tkn_gift_${orderId}_c${idx + 1}`
                }));

            const autoRes = await autoDispatchPurchaseToTelegramIfLinked({
              phone: updated.playerWhatsapp,
              playerName: updated.playerName,
              tokenId: `tkn_gift_${orderId}_c1`,
              quantity: totalQty,
              url: `${window.location.origin}/juegos/bingo`,
              purchaseMode: 'gift',
              giftLinks: currentLinks
            });
            if (autoRes.dispatched) {
              setTelegramAutoDispatched(true);
            }
          } catch (errTg) {
            console.warn("Aviso auto-despacho Telegram en snapshot:", errTg);
          }
        } else {
          // Si ya está habilitado, asegurar que el cartón esté generado y guardado en sesión
          let cardIdToUse = activeCardId || accessToken?.usedByCardId;
          if (!cardIdToUse) {
            const targetGameId = updated.gameId || accessToken?.gameId || 'juego-principal';
            cardIdToUse = await generateAndAssignCard(accessToken?.id || null, updated, targetGameId);
          }

          if (cardIdToUse) {
            setActiveCardId(cardIdToUse);
            localStorage.setItem('my_bingo_card_id', cardIdToUse);
            localStorage.setItem('my_bingo_card_ids', JSON.stringify([cardIdToUse]));
            localStorage.setItem('my_bingo_player_name', updated.playerName);

            // Si vino por pago en efectivo y es modo personal, celebrar y entrar automáticamente
            if (updated.paymentMethod === 'efectivo') {
              soundEffects.playSuccessFanfare();
              setTimeout(() => {
                navigate(`/juegos/bingo/carton/${cardIdToUse}`);
              }, 1800);
            }
          }
        }
      }
    }, (err) => {
      console.warn("Aviso escuchando orden en tiempo real:", err);
    });

    return () => unsub();
  }, [orderId, accessToken?.id, accessToken?.usedByCardId, activeCardId, tierId, navigate]);

  const handleEnableWebPush = async () => {
    setPushActivating(true);
    try {
      const res = await requestNotificationPermission();
      setPushPermission(res);
      if (res === 'granted') {
        const effectiveTokenId = accessToken?.id || (giftLinks.length > 0 ? giftLinks[0]?.id : '');
        const targetUrl = effectiveTokenId 
          ? `${window.location.origin}/juegos/bingo?access=${effectiveTokenId}`
          : `${window.location.origin}/juegos/bingo`;

        triggerBrowserNotification("🎟️ ¡Notificaciones de Bingotenango Activadas!", {
          body: `Hola ${orderData?.playerName || 'Jugador'}, tus notificaciones están listas. Te avisaremos el inicio de la partida.`,
          url: targetUrl
        });

        if (orderData?.playerWhatsapp) {
          recordPlayerPurchase({
            phone: orderData.playerWhatsapp,
            name: orderData.playerName,
            email: orderData.playerEmail || '',
            spentQ: orderData.totalPriceQ || orderData.priceQ || 25,
            webPushEnabled: true
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Error activando web push:", e);
    } finally {
      setPushActivating(false);
    }
  };

  const [copiedAllLinks, setCopiedAllLinks] = useState(false);

  const copyGiftLink = (index: number, url: string) => {
    navigator.clipboard.writeText(url);
    setGiftLinks(prev => prev.map((item, idx) => idx === index ? { ...item, copied: true } : item));
    setTimeout(() => {
      setGiftLinks(prev => prev.map((item, idx) => idx === index ? { ...item, copied: false } : item));
    }, 2500);
  };

  const getAllLinksWhatsAppText = () => {
    const totalQty = orderData?.quantity || giftLinks.length || 1;
    let linksText = '';
    giftLinks.forEach((item) => {
      linksText += `🎁 *Link #${item.num} (1 Cartón):*\n${item.url}\n\n`;
    });

    const portalUrl = `${window.location.origin}/juegos/bingo/boletos/confirmacion?orderId=${orderId || ''}&status=success`;

    return (
      `¡Hola! 🎟️ Aquí tienes tus enlaces de Bingotenango (${totalQty} ${totalQty === 1 ? 'link para contacto' : 'links independientes'}):\n\n` +
      `🏆 Partida Oficial en Vivo\n` +
      `💵 Estado: Cobro Confirmado\n\n` +
      `⚠️ *AVISO IMPORTANTE:*\n` +
      `Cada link es único y habilita solo un cartón en pantalla. Compártelos con cuidado: envía cada link únicamente a su dueño, ya que al abrirse en un celular quedará vinculado a esa persona.\n\n` +
      `📲 ENLACES PARA REPARTIR A TUS CONTACTOS:\n\n` +
      `${linksText}` +
      `👉 Cada amigo o contacto debe tocar su enlace exclusivo para ingresar y jugar en su propio celular.\n\n` +
      `📋 También puedes gestionar tus links desde tu portal:\n${portalUrl}\n\n` +
      `¡Muchos éxitos a todos! 🎉`
    );
  };

  const handleSendAllLinksToMyWhatsApp = () => {
    const rawPhone = orderData?.playerWhatsapp || phoneParam || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('502') ? cleanPhone : `502${cleanPhone}`;
    const text = encodeURIComponent(getAllLinksWhatsAppText());
    if (cleanPhone.length >= 8) {
      window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleCopyAllLinks = () => {
    const text = getAllLinksWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopiedAllLinks(true);
    setTimeout(() => setCopiedAllLinks(false), 3000);
  };

  const handleShareAllNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🎟️ Mis Links de Bingotenango',
          text: getAllLinksWhatsAppText()
        });
      } catch {}
    } else {
      handleCopyAllLinks();
    }
  };


  const handleCheckPaymentStatus = async () => {
    if (!orderId) return;
    setIsRechecking(true);
    try {
      const ref = doc(db, 'bingo_orders', orderId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const updated = snap.data();
        setOrderData(updated);
        const isFree = (updated.totalPriceQ === 0) || (updated.priceQ === 0) || (updated.unitPriceQ === 0) || (updated.gateway === 'gratis_cortesia') || (tierId === 'tier-free');
        const isNowPaid = isFree || updated.status === 'completed' || updated.status === 'paid';
        if (isNowPaid) {
          setIsOrderPending(false);
          let cardIdToUse = accessToken?.usedByCardId;
          if (!cardIdToUse && accessToken) {
            cardIdToUse = await generateAndAssignCard(accessToken.id, updated, accessToken.gameId || 'juego-principal');
          }
          if (cardIdToUse) {
            setActiveCardId(cardIdToUse);
            localStorage.setItem('my_bingo_card_id', cardIdToUse);
            localStorage.setItem('my_bingo_card_ids', JSON.stringify([cardIdToUse]));
          }
        }
      }
    } catch (e) {
      console.error("Error comprobando pago:", e);
    } finally {
      setIsRechecking(false);
    }
  };

  const handleEnterCardDirectly = async () => {
    if (activeCardId) {
      localStorage.setItem('my_bingo_card_id', activeCardId);
      localStorage.setItem('my_bingo_card_ids', JSON.stringify([activeCardId]));
      navigate(`/juegos/bingo/carton/${activeCardId}`);
      return;
    }

    setIsActivatingCard(true);
    try {
      const targetGame = accessToken?.gameId || 'juego-principal';
      const cardId = await generateAndAssignCard(accessToken?.id || null, orderData, targetGame);
      if (cardId) {
        setActiveCardId(cardId);
        localStorage.setItem('my_bingo_card_id', cardId);
        localStorage.setItem('my_bingo_card_ids', JSON.stringify([cardId]));
        navigate(`/juegos/bingo/carton/${cardId}`);
        return;
      }
    } catch (err) {
      console.error("Error al ingresar directo al cartón:", err);
    } finally {
      setIsActivatingCard(false);
    }

    navigate(accessToken ? `/juegos/bingo?access=${accessToken.id}` : '/juegos/bingo');
  };

  if (loading) {
    return (
      <div className="bingo-boletos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#38bdf8', fontFamily: 'var(--font-gamer)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>⏳</span>
          <p style={{ fontSize: '1.1rem' }}>Verificando tus boletos con Recurrente...</p>
        </div>
      </div>
    );
  }

  const isGiftMode = orderData?.purchaseMode === 'gift' && giftLinks.length > 0;
  const effectivePaidQ = orderData?.totalPriceQ ?? orderData?.priceQ ?? (tierId === 'tier-free' ? 0 : 25);

  return (
    <div className="bingo-boletos-page">
      <div className="bingo-boletos-container" style={{ maxWidth: '720px' }}>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.96) 0%, rgba(10, 8, 22, 0.98) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '24px',
          padding: '36px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.25)',
          animation: 'fadeInDown 0.5s ease-out'
        }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: isOrderPending 
              ? (orderData?.paymentMethod === 'efectivo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)')
              : 'rgba(16, 185, 129, 0.2)',
            border: `2px solid ${isOrderPending ? (orderData?.paymentMethod === 'efectivo' ? '#10b981' : '#f59e0b') : '#10b981'}`,
            fontSize: '2rem',
            marginBottom: '16px',
            boxShadow: isOrderPending 
              ? (orderData?.paymentMethod === 'efectivo' ? '0 0 25px rgba(16, 185, 129, 0.4)' : '0 0 25px rgba(245, 158, 11, 0.4)')
              : '0 0 25px rgba(16, 185, 129, 0.4)'
          }}>
            {isOrderPending ? (orderData?.paymentMethod === 'efectivo' ? '💵' : '⏳') : isGiftMode ? '🎁' : '🎉'}
          </div>

          <span style={{
            display: 'block',
            fontFamily: 'var(--font-gamer)',
            fontSize: '0.85rem',
            color: isOrderPending ? (orderData?.paymentMethod === 'efectivo' ? '#34d399' : '#fbbf24') : '#10b981',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            {isOrderPending 
              ? (orderData?.paymentMethod === 'efectivo' ? 'SOLICITUD EN EFECTIVO - ESPERANDO PROMOTOR' : 'EN PROCESO DE VERIFICACIÓN') 
              : isGiftMode ? '¡ENLACES GENERADOS CON ÉXITO!' : '¡COMPRA CONFIRMADA!'}
          </span>

          <h1 style={{
            fontFamily: 'var(--font-gamer)',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            color: '#ffffff',
            margin: '0 0 10px 0',
            letterSpacing: '1px'
          }}>
            {isOrderPending 
              ? (orderData?.paymentMethod === 'efectivo' ? 'Esperando Cobro en Efectivo' : 'Verificando tu Pago') 
              : isGiftMode ? 'Tus Links para Contactos están Listos' : '¡Tu Cartón está Listo!'}
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 auto 24px', maxWidth: '520px', lineHeight: 1.5 }}>
            {isOrderPending
              ? (orderData?.paymentMethod === 'efectivo'
                  ? `Hola ${orderData?.playerName || 'Jugador'}, tu solicitud de boleto en efectivo está registrada. Un promotor debe cobrar tus Q${effectivePaidQ}.00 para habilitar tu cartón.`
                  : `Hola ${orderData?.playerName || 'Jugador'}, estamos a la espera de la acreditación bancaria para habilitar tu cartón.`)
              : `Felicidades ${orderData?.playerName || 'Jugador'}, tu orden ha sido procesada. ${isGiftMode ? 'A continuación tienes cada uno de los enlaces independientes para repartir a tus contactos.' : 'Ya puedes entrar directo a tu cartón de juego en pantalla.'}`}
          </p>


          {/* DETALLES DE LA COMPRA */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            margin: '0 auto 26px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Modalidad de Compra:</span>
              <strong style={{ color: '#38bdf8' }}>
                {isGiftMode ? '🎁 Links para Repartir a Contactos' : '👤 Para mí (Uso Personal)'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Total Adquirido:</span>
              <strong style={{ color: '#fff' }}>
                {orderData?.quantity || 1} {isGiftMode ? 'Links Independientes' : ((orderData?.quantity || 1) === 1 ? 'Cartón' : 'Cartones')}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Total Pagado:</span>
              <strong style={{ color: effectivePaidQ === 0 ? '#4ade80' : '#fbbf24' }}>
                {effectivePaidQ === 0 ? 'Q 0.00 (Gratis)' : `Q ${effectivePaidQ}.00`}
              </strong>
            </div>
            {orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.78rem', color: '#64748b' }}>
                <span>Referencia:</span>
                <span style={{ fontFamily: 'monospace' }}>#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* SI LA ORDEN ESTÁ PENDIENTE (PAGO EN EFECTIVO O EN CONCILIACIÓN), MOSTRAR CAJA DE ESPERA */}
          {isOrderPending ? (
            orderData?.paymentMethod === 'efectivo' ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.65)',
                borderRadius: '20px',
                padding: '28px 20px',
                margin: '0 auto 24px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>💵⏳</span>
                <h3 style={{
                  fontFamily: 'var(--font-gamer)',
                  color: '#34d399',
                  fontSize: '1.2rem',
                  margin: '0 0 10px 0',
                  letterSpacing: '1px'
                }}>
                  ESPERANDO CONFIRMACIÓN DEL PROMOTOR
                </h3>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px dashed rgba(52, 211, 153, 0.5)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'inline-block',
                  textAlign: 'left',
                  minWidth: '280px'
                }}>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    👤 Comprador: <strong style={{ color: '#fff' }}>{orderData?.playerName}</strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    📱 Teléfono Inscrito: <strong style={{ color: '#38bdf8' }}>+{orderData?.playerWhatsapp}</strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    🎁 Modalidad: <strong style={{ color: '#38bdf8' }}>{orderData?.purchaseMode === 'gift' ? `${orderData?.quantity || 1} Links para Contactos` : 'Uso Personal'}</strong>
                  </div>
                  <div style={{ fontSize: '0.98rem', color: '#e2e8f0', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    💵 Total a Pagar al Promotor: <strong style={{ color: '#fbbf24', fontSize: '1.15rem' }}>Q{effectivePaidQ}.00 GTQ</strong>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5, margin: '0 auto 18px', maxWidth: '520px' }}>
                  Entrega tus <strong>Q{effectivePaidQ}.00</strong> en efectivo al promotor o taquilla indicándole tu nombre.
                  <strong style={{ color: '#34d399', display: 'block', marginTop: '8px' }}>
                    ⚡ Mantén esta pantalla abierta. En cuanto el promotor presione "Cobrar y Habilitar" en su registro, tu sesión se desbloqueará de inmediato {orderData?.purchaseMode === 'gift' ? 'y se habilitarán todos tus enlaces para enviarlos por WhatsApp a tus contactos.' : 'y entrarás a tu cartón.'}
                  </strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={isRechecking}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-gamer)',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRechecking ? 'Verificando Registro...' : '🔄 Comprobar Si Ya Me Habilitaron'}
                  </button>
                  <a
                    href={`https://wa.me/50242250165?text=${encodeURIComponent(`Hola, solicité pagar en efectivo Q${effectivePaidQ}.00 para Bingotenango a nombre de ${orderData?.playerName} (Orden: ${orderId}). ¿Me apoyan con la verificación?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(37, 211, 102, 0.2)',
                      border: '1px solid rgba(37, 211, 102, 0.5)',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      color: '#25d366',
                      fontFamily: 'var(--font-gamer)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    💬 WhatsApp Taquilla
                  </a>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
                border: '1.5px solid rgba(245, 158, 11, 0.55)',
                borderRadius: '18px',
                padding: '24px 20px',
                margin: '0 auto 24px',
                textAlign: 'center',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.2)'
              }}>
                <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '10px' }}>⏳</span>
                <h3 style={{
                  fontFamily: 'var(--font-gamer)',
                  color: '#fbbf24',
                  fontSize: '1.1rem',
                  margin: '0 0 10px 0',
                  letterSpacing: '1px'
                }}>
                  PAGO EN PROCESO DE VERIFICACIÓN
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#fef3c7', lineHeight: 1.5, margin: '0 auto 16px', maxWidth: '480px' }}>
                  Si realizaste tu pago mediante <strong>Transferencia Bancaria</strong>, la pasarela de Recurrente requiere un tiempo de espera de <strong>hasta 10 minutos</strong> para conciliar con el banco. Si pagaste con <strong>Tarjeta de Débito o Crédito</strong>, la acreditación es inmediata.
                </p>
                <button
                  type="button"
                  onClick={handleCheckPaymentStatus}
                  disabled={isRechecking}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-gamer)',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isRechecking ? 'Comprobando con el Banco...' : '🔄 Comprobar Estado de Pago'}
                </button>
              </div>
            )
          ) : isGiftMode ? (
            /* CASO A: MODO REPARTIR A CONTACTOS (PAGADO/HABILITADO) */
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(16, 185, 129, 0.2) 100%)',
                border: '1.5px solid rgba(37, 211, 102, 0.5)',
                borderRadius: '16px',
                padding: '18px 20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', color: '#86efac', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>
                  🚀 DESPACHO RÁPIDO PARA EL COMPRADOR
                </span>
                <button
                  type="button"
                  onClick={handleSendAllLinksToMyWhatsApp}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontFamily: 'var(--font-gamer)',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.45)',
                    marginBottom: '10px'
                  }}
                >
                  📲 Enviar todos los links a mi WhatsApp {orderData?.playerWhatsapp ? `(+${orderData.playerWhatsapp})` : ''}
                </button>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCopyAllLinks}
                    style={{
                      background: copiedAllLinks ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${copiedAllLinks ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                      color: copiedAllLinks ? '#34d399' : '#e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedAllLinks ? '✓ ¡Todos los Links Copiados!' : '📋 Copiar Todos los Links'}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareAllNative}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🔗 Compartir Todos
                  </button>
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-gamer)', fontSize: '1rem', color: '#38bdf8', marginBottom: '8px', textAlign: 'center' }}>
                📲 O COMPARTE CADA ENLACE POR SEPARADO:
              </h3>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span style={{ fontSize: '0.8rem', color: '#fde68a', lineHeight: 1.4 }}>
                  <strong>Cada link es único y habilita solo un cartón en pantalla:</strong> Compártelos con cuidado. Envía cada link únicamente a su dueño, ya que al abrirse en un celular quedará vinculado a esa persona.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {giftLinks.map((item, idx) => (
                  <div key={item.id} style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: '#0284c7',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        fontWeight: 'bold'
                      }}>
                        {item.num}
                      </span>
                      <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 'bold' }}>
                        Cartón #{item.num}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => copyGiftLink(idx, item.url)}
                        style={{
                          background: item.copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${item.copied ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
                          color: item.copied ? '#34d399' : '#e2e8f0',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {item.copied ? '✓ Copiado' : '📋 Copiar'}
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `¡Hola! 🎟️ Te comparto tu cartón oficial para jugar en vivo en Bingotenango:\n\n` +
                          `📲 Entra aquí para abrir tu cartón:\n${item.url}\n\n` +
                          `¡Vamos a jugar!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(37, 211, 102, 0.2)',
                          border: '1px solid rgba(37, 211, 102, 0.5)',
                          color: '#25d366',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        💬 WhatsApp
                      </a>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(item.url)}&text=${encodeURIComponent('¡Hola! 🎟️ Te comparto tu cartón para Bingotenango:')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(34, 158, 217, 0.2)',
                          border: '1px solid rgba(34, 158, 217, 0.5)',
                          color: '#38bdf8',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✈️ Telegram
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CASO B: MODO PERSONAL (PAGADO/HABILITADO) */
            <>
              {accessToken && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 27, 75, 0.6) 100%)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '18px',
                  padding: '20px',
                  margin: '0 auto 24px',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(0, 240, 255, 0.15)'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-gamer)',
                    color: '#38bdf8',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    🔑 TU PASE DE SESIÓN EN VIVO
                  </span>

                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    color: '#00f0ff',
                    letterSpacing: '2px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px dashed rgba(0, 240, 255, 0.3)',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    {accessToken.id}
                  </div>

                  <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Tu cartón oficial ha sido asignado a este dispositivo. Ya puedes ingresar directamente a jugar.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const url = activeCardId 
                        ? `${window.location.origin}/juegos/bingo/carton/${activeCardId}`
                        : `${window.location.origin}/juegos/bingo?access=${accessToken.id}`;
                      navigator.clipboard.writeText(url);
                      setCopiedMainLink(true);
                      setTimeout(() => setCopiedMainLink(false), 2500);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      color: copiedMainLink ? '#34d399' : '#e2e8f0',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedMainLink ? '✓ ¡Enlace Copiado!' : '📋 Copiar Enlace Directo a Mi Cartón'}
                  </button>
                </div>
              )}

              {/* BOTÓN PRINCIPAL: ENTRAR DIRECTO A MI CARTÓN */}
              <button
                onClick={handleEnterCardDirectly}
                disabled={isActivatingCard}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.5)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-gamer)',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5)',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px'
                }}
              >
                {isActivatingCard ? '🎮 PREPARANDO CARTÓN...' : '🎮 ENTRAR DIRECTO A MI CARTÓN'}
              </button>
            </>
          )}

              {/* BANNER DE AUTO-DESPACHO A TELEGRAM SI YA ERA CLIENTE REGISTRADO */}
              {telegramAutoDispatched && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.6) 100%)',
                  border: '1.5px solid #10b981',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>⚡</span>
                  <div>
                    <strong style={{ color: '#34d399', fontSize: '0.92rem', display: 'block', fontFamily: 'var(--font-gamer)' }}>
                      ¡DESPACHADO EN AUTOMÁTICO A TU TELEGRAM!
                    </strong>
                    <span style={{ color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.35, display: 'block' }}>
                      Como ya eres cliente registrado en nuestra cartera, enviamos tus cartones directamente a tu chat de <strong>@Bingotenangobot</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* NOTIFICACIONES WEB PUSH EN EL NAVEGADOR */}
              {isNotificationSupported() && pushPermission !== 'unsupported' && (
                <div style={{
                  background: pushPermission === 'granted' 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(30, 27, 75, 0.5) 100%)',
                  border: `1.5px solid ${pushPermission === 'granted' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  borderRadius: '16px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{pushPermission === 'granted' ? '🔔' : '📣'}</span>
                    <div>
                      <strong style={{ 
                        fontSize: '0.88rem', 
                        color: pushPermission === 'granted' ? '#34d399' : '#fbbf24',
                        display: 'block',
                        fontFamily: 'var(--font-gamer)'
                      }}>
                        {pushPermission === 'granted' ? 'ALERTAS EN PANTALLA ACTIVAS' : 'ALERTAS DIRECTAS EN TU NAVEGADOR'}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.3, display: 'block' }}>
                        {pushPermission === 'granted'
                          ? 'Recibirás avisos nativos del inicio de la partida en esta pantalla.'
                          : '¿No usas Telegram? Activa las notificaciones en tu pantalla para avisarte cuando empiece el bingo.'}
                      </span>
                    </div>
                  </div>

                  {pushPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleEnableWebPush}
                      disabled={pushActivating}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {pushActivating ? 'Activando...' : '🔔 Activar Alertas'}
                    </button>
                  )}
                </div>
              )}

              {/* RESPALDO DE CORREO ELECTRÓNICO */}
              {orderData?.playerEmail && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  textAlign: 'left'
                }}>
                  <span>✉️</span>
                  <span>
                    Comprobante y accesos respaldados para: <strong style={{ color: '#ffffff' }}>{orderData.playerEmail}</strong>
                  </span>
                </div>
              )}

              {/* TARJETA GUIADA DE ENTREGA AUTOMÁTICA POR TELEGRAM */}
              {accessToken && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(34, 158, 217, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
                  border: '1.5px solid rgba(34, 158, 217, 0.45)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(2, 132, 199, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🤖</span>
                    <strong style={{ fontSize: '1.05rem', color: '#38bdf8', fontFamily: 'var(--font-gamer)', letterSpacing: '0.5px' }}>
                      ENTREGA INSTANTÁNEA EN TELEGRAM
                    </strong>
                  </div>

                  <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Recibe tu cartón oficial directo en tu teléfono de forma 100% automática.
                  </p>

                  {/* BOTÓN PRINCIPAL TELEGRAM */}
                  <a
                    href={`https://t.me/Bingotenangobot?start=${accessToken.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '14px 20px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0088cc 100%)',
                      border: '1px solid rgba(56, 189, 248, 0.6)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-gamer)',
                      textDecoration: 'none',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(0, 136, 204, 0.45)',
                      transition: 'all 0.2s ease',
                      marginBottom: '10px'
                    }}
                  >
                    <span>✈️</span> ABRIR EN TELEGRAM Y RECIBIR MI CARTÓN
                  </a>

                  {/* INDICADOR DIDÁCTICO */}
                  <span style={{ display: 'block', fontSize: '0.76rem', color: '#93c5fd', marginBottom: '12px' }}>
                    👆 <em>Al abrirse el chat en Telegram, solo toca <strong>"INICIAR"</strong> (Start) abajo y listo.</em>
                  </span>

                  {/* BOTÓN PARA ABRIR LA GUÍA DE INSTALACIÓN */}
                  <button
                    type="button"
                    onClick={() => setShowTelegramGuide(prev => !prev)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px dashed rgba(56, 189, 248, 0.4)',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{showTelegramGuide ? '▲' : '▼'}</span>
                    <span>¿No tienes Telegram instalado? Toca aquí para ver cómo instalarlo gratis</span>
                  </button>

                  {/* GUÍA PASO A PASO DESPLEGABLE */}
                  {showTelegramGuide && (
                    <div style={{
                      marginTop: '12px',
                      padding: '14px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'left'
                    }}>
                      <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block', marginBottom: '8px' }}>
                        📲 Descarga Telegram en 30 segundos (100% Gratis):
                      </strong>

                      {/* Botones de Descarga en Play Store y App Store */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <a
                          href="https://play.google.com/store/apps/details?id=org.telegram.messenger"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            color: '#4ade80',
                            fontSize: '0.74rem',
                            fontWeight: 'bold',
                            textDecoration: 'none'
                          }}
                        >
                          <span>📱</span> Google Play
                        </a>

                        <a
                          href="https://apps.apple.com/app/telegram-messenger/id686449807"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: '#ffffff',
                            fontSize: '0.74rem',
                            fontWeight: 'bold',
                            textDecoration: 'none'
                          }}
                        >
                          <span>🍏</span> App Store
                        </a>
                      </div>

                      {/* Pasos numerados */}
                      <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        <li>Descarga e instala la app de Telegram en tu celular.</li>
                        <li>Regresa a esta pantalla y toca el botón azul: <strong>"ABRIR EN TELEGRAM"</strong>.</li>
                        <li>En el chat de <strong>@Bingotenangobot</strong>, presiona <strong>"INICIAR"</strong> abajo. ¡Tus cartones aparecerán al instante! 🎉</li>
                      </ol>
                    </div>
                  )}

                </div>
              )}

              {/* BOTÓN SECUNDARIO PARA ENVIAR AL WHATSAPP DEL COMPRADOR */}
              {orderData?.playerWhatsapp && (() => {
                const rawDigits = orderData.playerWhatsapp.replace(/\D/g, '');
                const finalPhone = rawDigits.startsWith('502') ? rawDigits : `502${rawDigits}`;
                return (
                  <a
                    href={`https://wa.me/${finalPhone}?text=${encodeURIComponent(
                      `¡Hola ${orderData?.playerName || 'Jugador'}! 🎟️ Comprobante de boletos de Bingotenango:\n\n` +
                      `Tipo: ${isGiftMode ? `${orderData?.quantity} Links para Contactos` : `${orderData?.quantity} Cartón(es) Personal`}\n` +
                      `Total: Q${orderData?.totalPriceQ ?? orderData?.priceQ ?? (tierId === 'tier-free' ? 0 : 25)}.00\n\n` +
                      (accessToken ? `Enlace de acceso: ${window.location.origin}/juegos/bingo?access=${accessToken.id}\n\n` : '') +
                      `¡Buena suerte en la partida en vivo!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'rgba(37, 211, 102, 0.15)',
                    border: '1px solid rgba(37, 211, 102, 0.4)',
                    color: '#25d366',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span>📲</span> Guardar Comprobante en mi WhatsApp
                </a>
              );})()}

        </div>

      </div>
    </div>
  );
};

export default BingoBoletosConfirmacion;
