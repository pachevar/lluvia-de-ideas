import { EXTERNAL_STORE_URL } from '../../constants';

export default function AdminTabTiendaExternal() {
  const adminStoreUrl = EXTERNAL_STORE_URL ? `${EXTERNAL_STORE_URL.replace(/\/$/, '')}/admin` : '';

  return (
    <div className="admin-tab-tienda-external animate-fade-in" style={{
      maxWidth: '900px',
      margin: '2rem auto',
      padding: '2.5rem',
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      borderRadius: '20px',
      color: '#f8fafc',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '2.8rem' }}>🛍️</span>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Tienda en Línea & Mercado Pedagógico
          </h2>
          <span style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600 }}>
            Plataforma Desacoplada e Independiente
          </span>
        </div>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        El catálogo completo de productos, cuentos, juegos de mesa, colecciones y el panel CMS de inventario ahora residen en la aplicación independiente de la tienda.
      </p>

      <div style={{
        background: 'rgba(2, 132, 199, 0.08)',
        border: '1px solid rgba(2, 132, 199, 0.25)',
        borderRadius: '14px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Estado de Integración
        </div>
        {EXTERNAL_STORE_URL ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
            <span style={{ color: '#f1f5f9', fontSize: '1rem', wordBreak: 'break-all' }}>
              🌐 URL Activa: <strong>{EXTERNAL_STORE_URL}</strong>
            </span>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <a
                href={EXTERNAL_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  textDecoration: 'none'
                }}
              >
                Ver Tienda ↗
              </a>
              <a
                href={adminStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#f8fafc',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  textDecoration: 'none'
                }}
              >
                Panel CMS Tienda ⚙️
              </a>
            </div>
          </div>
        ) : (
          <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>
            ⏳ <em>Enlace pendiente de configuración.</em> Cuando tengas desplegada la tienda externa, ingresa la URL en <code>src/constants.ts</code> (campo <code>externalStoreUrl</code>).
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          💡 Instrucciones de Conexión:
        </h4>
        <ol style={{ paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
          <li>Abre el archivo <code>src/constants.ts</code> en este proyecto.</li>
          <li>Coloca la URL pública de tu tienda en <code>externalStoreUrl</code>.</li>
          <li>Los botones del portal y la barra superior redirigirán a los visitantes a la nueva tienda automáticamente.</li>
        </ol>
      </div>
    </div>
  );
}
