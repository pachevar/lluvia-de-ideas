import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import logoEditorial from './assets/logo editorial.png';
import { CONTACT } from './constants';


interface CotizacionViewProps {
  id: string;
}

const CotizacionView: React.FC<CotizacionViewProps> = ({ id }) => {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const docRef = doc(db, 'cotizaciones', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuote(docSnap.data());
        } else {
          setError('Cotización no encontrada o enlace inválido.');
        }
      } catch (err) {
        setError('Error al cargar la cotización.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  useEffect(() => {
    if (!quote) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = quote.expiresAt - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><h2>Cargando Cotización...</h2></div>;
  }

  if (error || !quote) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}><h2>{error}</h2></div>;
  }

  const isExpired = new Date().getTime() > quote.expiresAt;

  const downloadPDF = () => {
    import('./utils/pdfGenerator').then(({ generateCotizacionPDF }) => {
      generateCotizacionPDF({
        id: id,
        clientCompany: quote.clientCompany,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientPhone: quote.clientPhone,
        items: quote.items,
        subtotal: quote.subtotal,
        validDays: quote.validDays,
        createdAt: quote.createdAt,
        sealUrl: quote.sealUrl,
        signatureUrl: quote.signatureUrl,
        signerName: quote.signerName
      });
    });
  };

  const wspMessage = encodeURIComponent(`Hola Lluvia de Ideas Editorial, me interesa aprobar la cotización web (ID: ${id}) por un total de Q${quote.subtotal.toFixed(2)}.`);

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Timer Bar */}
      <div style={{ background: isExpired ? 'var(--color-secondary)' : 'rgba(168, 85, 247, 0.2)', padding: '15px 30px', borderRadius: '50px', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {isExpired ? (
          <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>⚠️ Esta cotización ha expirado</h3>
        ) : (
          <>
            <h4 style={{ margin: 0 }}>Válido por:</h4>
            <div style={{ display: 'flex', gap: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              <span>{timeLeft?.days} Días</span>
              <span>{timeLeft?.hours} hrs</span>
              <span>{timeLeft?.minutes} min</span>
              <span>{timeLeft?.seconds} seg</span>
            </div>
          </>
        )}
      </div>

      <div className="card-glass" style={{ width: '100%', maxWidth: '800px', padding: '40px', position: 'relative' }}>
        {isExpired && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '24px' }}>
            <h1 style={{ color: 'var(--color-primary)', transform: 'rotate(-15deg)', fontSize: '3rem', border: '5px solid var(--color-primary)', padding: '20px', borderRadius: '15px' }}>EXPIRADA</h1>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <img src={logoEditorial} alt="Lluvia de Ideas" style={{ height: '80px', marginBottom: '10px' }} />
            <h2 style={{ margin: 0 }}>Lluvia de Ideas Editorial S.A.</h2>
            <p style={{ margin: '5px 0', opacity: 0.8 }}>NIT: {CONTACT.nit}</p>
            <p style={{ margin: '5px 0', opacity: 0.8 }}>Tel: {CONTACT.phoneDisplay}</p>
            <p style={{ margin: '5px 0', opacity: 0.8 }}>{CONTACT.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ color: 'var(--color-primary)', margin: '0 0 10px 0' }}>COTIZACIÓN</h1>
            <p style={{ margin: '5px 0' }}><strong>ID:</strong> {id.slice(0, 8).toUpperCase()}</p>
            <p style={{ margin: '5px 0' }}><strong>Fecha:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: 'var(--color-secondary)' }}>Datos del Cliente</h3>
          <p style={{ margin: '5px 0' }}><strong>Cliente:</strong> {quote.clientName || ''}</p>
          <p style={{ margin: '5px 0' }}><strong>Empresa:</strong> {quote.clientCompany || ''}</p>
          <p style={{ margin: '5px 0' }}><strong>Correo:</strong> {quote.clientEmail || ''}</p>
          <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> {quote.clientPhone || ''}</p>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(168, 85, 247, 0.1)', borderBottom: '2px solid var(--color-primary)' }}>
                <th style={{ padding: '12px' }}>Descripción</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase' }}>{item.type}</span>
                    {item.description}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>Q{Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Q{(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '20px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>Total General:</td>
                <td style={{ padding: '20px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>Q{Number(quote.subtotal).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Info & Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ flex: '1 1 300px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
            <h4 style={{ marginTop: 0 }}>Datos para Pago / Depósito</h4>
            <p style={{ margin: '5px 0' }}><strong>Banco:</strong> Banco Industrial</p>
            <p style={{ margin: '5px 0' }}><strong>Tipo de Cuenta:</strong> Monetaria</p>
            <p style={{ margin: '5px 0' }}><strong>No. de Cuenta:</strong> 2330080355</p>
            <p style={{ margin: '5px 0' }}><strong>A nombre de:</strong> Lluvia de Ideas Editorial S.A.</p>
            <p style={{ margin: '15px 0 5px 0', fontSize: '0.8rem', opacity: 0.8 }}>Nos regimos al régimen tributario del 5%.</p>
          </div>
          
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {quote.sealUrl && (
              <img src={quote.sealUrl} alt="Sello" style={{ position: 'absolute', right: 0, top: 0, opacity: 0.5, height: '100px', objectFit: 'contain' }} />
            )}
            {quote.signatureUrl && (
              <img src={quote.signatureUrl} alt="Firma" style={{ height: '80px', objectFit: 'contain', zIndex: 1, marginBottom: '5px' }} />
            )}
            <div style={{ width: '80%', borderTop: '1px solid var(--text-title)', textAlign: 'center', paddingTop: '10px', zIndex: 1, marginTop: quote.signatureUrl ? '0' : '60px' }}>
              <strong>{quote.signerName || 'Lluvia de Ideas Editorial S.A.'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isExpired && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={downloadPDF} className="btn btn-secondary" style={{ padding: '15px 30px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📄 Descargar PDF
          </button>
          <a href={`https://wa.me/${CONTACT.whatsappPhone}?text=${wspMessage}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-large" style={{ padding: '15px 30px', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', background: '#25D366' }}>
            💬 Aprobar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
};

export default CotizacionView;
