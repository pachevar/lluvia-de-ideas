import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import type { BingoAccessToken } from '../types';
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
  const playerNameParam = searchParams.get('name');
  const phoneParam = searchParams.get('phone');
  const modeParam = (searchParams.get('mode') as 'personal' | 'gift') || 'personal';

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<BingoAccessToken | null>(null);
  const [giftLinks, setGiftLinks] = useState<GiftLinkItem[]>([]);
  const [copiedMainLink, setCopiedMainLink] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);

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
            if (isSuccess && currentOrder.status !== 'completed') {
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
          const unitPrice = targetTier === 'tier-10' || targetTier === 'pkg-10' ? 10 : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 50 : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 100 : 25;
          const tierName = targetTier === 'tier-10' || targetTier === 'pkg-10' ? 'Cartón Bronce' : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 'Cartón Oro' : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 'Cartón Diamante VIP' : 'Cartón Plata';
          const prizeLevel = targetTier === 'tier-10' ? 'Premios Estándar' : targetTier === 'tier-50' ? 'Grandes Premios' : targetTier === 'tier-100' ? 'Premio Mayor / Pozo VIP' : 'Premios Intermedios';
          const totalQ = unitPrice * qtyParam;

          currentOrder = {
            playerName: decodeURIComponent(playerNameParam),
            playerWhatsapp: phoneParam,
            tierId: targetTier || 'tier-25',
            tierName: tierName,
            prizeLevel: prizeLevel,
            packageName: `${tierName} (${qtyParam} ${qtyParam === 1 ? 'Cartón' : 'Cartones'})`,
            unitPriceQ: unitPrice,
            quantity: qtyParam,
            priceQ: totalQ,
            totalPriceQ: totalQ,
            cartonesCount: qtyParam,
            purchaseMode: modeParam
          };
        }

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

        if (isGift && totalQty > 1) {
          // Generar tokens independientes para cada contacto
          const generatedLinks: GiftLinkItem[] = [];
          for (let i = 1; i <= totalQty; i++) {
            const giftTokenId = `tkn_gift_${effectiveOrderId}_c${i}`;
            const giftTokenObj: BingoAccessToken = {
              id: giftTokenId,
              orderId: effectiveOrderId,
              playerName: `${currentOrder.playerName} (Invitado #${i})`,
              playerWhatsapp: currentOrder.playerWhatsapp || '',
              tierId: currentOrder.tierId || 'tier-25',
              tierName: currentOrder.tierName || 'Cartón Oficial',
              prizeLevel: currentOrder.prizeLevel || 'Premios en vivo',
              quantity: 1, // Cada amigo recibe 1 cartón independiente
              purchaseMode: 'gift',
              gameId: activeGameId,
              scheduledGameId: currentOrder.scheduledGameId || null,
              sessionResetAt: sessionResetAt,
              status: 'active',
              usedByDevice: null,
              linkSent: false,
              linkSentAt: null,
              createdAt: Date.now()
            };
            try {
              await setDoc(doc(db, 'bingo_access_tokens', giftTokenId), giftTokenObj);
            } catch (errSet) {
              console.warn("Aviso al guardar gift token:", errSet);
            }
            generatedLinks.push({
              id: giftTokenId,
              num: i,
              url: `${window.location.origin}/juegos/bingo?access=${giftTokenId}`,
              copied: false
            });
          }
          setGiftLinks(generatedLinks);
        } else {
          // Modo personal: token único con todos los cartones (1 a 3) cargados
          const qToken = query(collection(db, 'bingo_access_tokens'), where('orderId', '==', effectiveOrderId), limit(1));
          const snapToken = await getDocs(qToken);

          if (!snapToken.empty) {
            setAccessToken(snapToken.docs[0].data() as BingoAccessToken);
          } else if (currentOrder) {
            const newTokenId = 'tkn_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
            const tokenObj: BingoAccessToken = {
              id: newTokenId,
              orderId: effectiveOrderId,
              playerName: currentOrder.playerName,
              playerWhatsapp: currentOrder.playerWhatsapp || '',
              tierId: currentOrder.tierId || 'tier-25',
              tierName: currentOrder.tierName || 'Cartón Oficial',
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

  const copyGiftLink = (index: number, url: string) => {
    navigator.clipboard.writeText(url);
    setGiftLinks(prev => prev.map((item, idx) => idx === index ? { ...item, copied: true } : item));
    setTimeout(() => {
      setGiftLinks(prev => prev.map((item, idx) => idx === index ? { ...item, copied: false } : item));
    }, 2500);
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
            background: 'rgba(16, 185, 129, 0.2)',
            border: '2px solid #10b981',
            fontSize: '2rem',
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
          }}>
            {isGiftMode ? '🎁' : '🎉'}
          </div>

          <span style={{
            display: 'block',
            fontFamily: 'var(--font-gamer)',
            fontSize: '0.85rem',
            color: '#10b981',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            {isGiftMode ? '¡ENLACES GENERADOS CON ÉXITO!' : '¡COMPRA CONFIRMADA!'}
          </span>

          <h1 style={{
            fontFamily: 'var(--font-gamer)',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            color: '#ffffff',
            margin: '0 0 10px 0',
            letterSpacing: '1px'
          }}>
            {isGiftMode ? 'Tus Links para Contactos están Listos' : '¡Tus Boletos Están Listos!'}
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 auto 24px', maxWidth: '520px', lineHeight: 1.5 }}>
            Felicidades <strong>{orderData?.playerName || 'Jugador'}</strong>, tu pago ha sido procesado. {isGiftMode ? 'A continuación tienes cada uno de los enlaces independientes para repartir a tus contactos.' : 'Ya puedes ingresar directamente a la sala de juego en vivo.'}
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
              <strong style={{ color: '#fbbf24' }}>Q {orderData?.totalPriceQ || orderData?.priceQ || 25}.00</strong>
            </div>
            {orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.78rem', color: '#64748b' }}>
                <span>Referencia:</span>
                <span style={{ fontFamily: 'monospace' }}>#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* CASO A: MODO REPARTIR A CONTACTOS (LISTA DE ENLACES CON BOTÓN DE COMPARTIR) */}
          {isGiftMode ? (
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-gamer)', fontSize: '1rem', color: '#38bdf8', marginBottom: '8px', textAlign: 'center' }}>
                📲 COMPARTE CADA ENLACE CON UN CONTACTO:
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginBottom: '16px' }}>
                Cada link contiene <strong>1 cartón único</strong>. Una vez que un contacto lo abra en su dispositivo, quedará registrado a su nombre.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {giftLinks.map((item, idx) => (
                  <div key={item.id} style={{
                    background: 'rgba(18, 14, 33, 0.85)',
                    border: '1.5px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-gamer)', fontSize: '0.85rem', color: '#fbbf24', display: 'block' }}>
                        🎁 Enlace #{item.num} para Contacto
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748b' }}>
                        {item.id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                          `¡Hola! 🎟️ Te comparto tu cartón para jugar hoy en Bingotenango.\n\n` +
                          `🔑 Tu enlace directo de acceso:\n${item.url}\n\n` +
                          `¡Ábrelo en tu celular para ingresar a la sala en vivo!`
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
                        href={`https://t.me/share/url?url=${encodeURIComponent(item.url)}&text=${encodeURIComponent('¡Hola! 🎟️ Te comparto tu pase para jugar hoy en Bingotenango. Ábrelo en tu celular para ingresar a la sala en vivo!')}`}
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
            /* CASO B: MODO PERSONAL (PASE ÚNICO Y BOTÓN DIRECTO A LA SALA) */
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
                    Este pase contiene tus <strong>{orderData?.quantity || 1} {((orderData?.quantity || 1) === 1) ? 'cartón' : 'cartones'}</strong> y se cargará automáticamente en tu dispositivo.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/juegos/bingo?access=${accessToken.id}`;
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
                    {copiedMainLink ? '✓ ¡Enlace Copiado!' : '📋 Copiar Enlace de Acceso'}
                  </button>
                </div>
              )}

              {/* BOTÓN PRINCIPAL PARA ENTRAR A JUGAR */}
              <button
                onClick={() => {
                  const targetUrl = accessToken 
                    ? `/juegos/bingo?access=${accessToken.id}`
                    : '/juegos/bingo';
                  navigate(targetUrl);
                }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  border: '1px solid rgba(0, 240, 255, 0.5)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-gamer)',
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(37, 99, 235, 0.5)',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px'
                }}
              >
                🎮 ENTRAR A LA SALA CON MIS CARTONES
              </button>
            </>
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
              {orderData?.playerWhatsapp && (
                <a
                  href={`https://wa.me/502${orderData.playerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `¡Hola ${orderData?.playerName || 'Jugador'}! 🎟️ Comprobante de boletos de Bingotenango:\n\n` +
                    `Tipo: ${isGiftMode ? `${orderData?.quantity} Links para Contactos` : `${orderData?.quantity} Cartón(es) Personal`}\n` +
                    `Total: Q${orderData?.totalPriceQ || 25}.00\n\n` +
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
              )}

        </div>

      </div>
    </div>
  );
};

export default BingoBoletosConfirmacion;
