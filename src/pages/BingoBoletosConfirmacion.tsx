import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './BingoBoletos.css';

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

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, 'bingo_orders', orderId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setOrderData(data);
          // Si vino de retorno exitoso, marcamos como pagado
          if (isSuccess && data.status !== 'completed') {
            await updateDoc(ref, {
              status: 'completed',
              paidAt: Date.now()
            });
          }
        } else if (playerNameParam) {
          const targetTier = tierId || pkgId;
          const unitPrice = targetTier === 'tier-10' || targetTier === 'pkg-10' ? 10 : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 50 : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 100 : 25;
          const tierName = targetTier === 'tier-10' || targetTier === 'pkg-10' ? 'Cartón Bronce' : targetTier === 'tier-50' || targetTier === 'pkg-50' ? 'Cartón Oro' : targetTier === 'tier-100' || targetTier === 'pkg-100' ? 'Cartón Diamante VIP' : 'Cartón Plata';
          const prizeLevel = targetTier === 'tier-10' ? 'Premios Estándar' : targetTier === 'tier-50' ? 'Grandes Premios' : targetTier === 'tier-100' ? 'Premio Mayor / Pozo VIP' : 'Premios Intermedios';
          const totalQ = unitPrice * qtyParam;

          setOrderData({
            playerName: decodeURIComponent(playerNameParam),
            playerWhatsapp: phoneParam,
            tierName: tierName,
            prizeLevel: prizeLevel,
            packageName: `${tierName} (${qtyParam} ${qtyParam === 1 ? 'Cartón' : 'Cartones'})`,
            unitPriceQ: unitPrice,
            quantity: qtyParam,
            priceQ: totalQ,
            totalPriceQ: totalQ,
            cartonesCount: qtyParam
          });
        }
      } catch (err) {
        console.error("Error al obtener la orden:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isSuccess, pkgId, tierId, qtyParam, playerNameParam, phoneParam]);

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

  const gameUrl = `${window.location.origin}/juegos/bingo`;
  const whatsappShareText = encodeURIComponent(
    `¡Hola! Ya compré mis boletos de Bingotenango (${orderData?.packageName || 'Bingo'}). Este es mi link oficial para entrar a jugar en vivo: ${gameUrl}`
  );

  return (
    <div className="bingo-boletos-page">
      <div className="bingo-boletos-container" style={{ maxWidth: '720px' }}>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.96) 0%, rgba(10, 8, 22, 0.98) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.25)',
          animation: 'fadeInDown 0.5s ease-out'
        }}>
          
          {/* ICONO DE ÉXITO */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)'
          }}>
            ✓
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-gamer)',
            color: '#34d399',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px'
          }}>
            PAGO CONFIRMADO CON RECURRENTE
          </span>

          <h1 style={{
            fontFamily: 'var(--font-gamer)',
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            color: '#ffffff',
            margin: '0 0 12px 0',
            letterSpacing: '1px'
          }}>
            ¡Tus Boletos Están Listos!
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 auto 24px', maxWidth: '520px', lineHeight: 1.5 }}>
            Felicidades <strong>{orderData?.playerName || 'Jugador'}</strong>, tu compra ha sido procesada con éxito. Ya puedes entrar a la sala en vivo de Bingotenango.
          </p>

          {/* DETALLES DE LA COMPRA */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            margin: '0 auto 30px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Tipo de Cartón / Ronda:</span>
              <strong style={{ color: '#fff' }}>{orderData?.tierName || orderData?.packageName || 'Cartón Bingotenango'}</strong>
            </div>
            {orderData?.prizeLevel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span>Nivel de Premio:</span>
                <strong style={{ color: '#cbd5e1' }}>{orderData.prizeLevel}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Total de Cartones:</span>
              <strong style={{ color: '#38bdf8' }}>{orderData?.quantity || orderData?.cartonesCount || 1} {((orderData?.quantity || orderData?.cartonesCount || 1) === 1) ? 'Cartón' : 'Cartones'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span>Monto Total Pagado:</span>
              <strong style={{ color: '#fbbf24' }}>Q {orderData?.totalPriceQ || orderData?.priceQ || 25}.00</strong>
            </div>
            {orderId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.78rem', color: '#64748b' }}>
                <span>Referencia / Orden:</span>
                <span style={{ fontFamily: 'monospace' }}>#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* BOTÓN PRINCIPAL PARA ENTRAR A JUGAR */}
          <button
            onClick={() => navigate('/juegos/bingo')}
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
            🎮 ENTRAR A LA SALA DE JUEGO AHORA
          </button>

          {/* BOTÓN PARA COMPARTIR ENLACE POR WHATSAPP */}
          {orderData?.playerWhatsapp && (
            <a
              href={`https://wa.me/502${orderData.playerWhatsapp.replace(/\D/g, '')}?text=${whatsappShareText}`}
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
              <span>📲</span> Guardar Enlace en mi WhatsApp
            </a>
          )}

          <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
              ¿Tienes alguna duda o necesitas asistencia? Contáctanos de inmediato al WhatsApp de soporte de Editorial Lluvia de Ideas.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BingoBoletosConfirmacion;
