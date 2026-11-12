import { useState, useEffect, useMemo } from 'react';
import {
  fetchEcosystemContacts,
  deleteEcosystemContact,
  type EcosystemContact,
} from '../../services/ecosystemContactsService';

export default function AdminTabContactos() {
  const [contacts, setContacts] = useState<EcosystemContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchEcosystemContacts();
      setContacts(list);
    } catch (err) {
      console.error('Error loading ecosystem contacts:', err);
      setError('Error al cargar los contactos registrados por QR.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.puesto.toLowerCase().includes(q) ||
        c.institucion.toLowerCase().includes(q) ||
        c.contacto.toLowerCase().includes(q)
    );
  }, [contacts, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      return;
    }
    try {
      await deleteEcosystemContact(id);
      setContacts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('No se pudo eliminar el contacto.');
    }
  };

  const exportToCSV = () => {
    if (contacts.length === 0) return;
    const headers = ['Nombre', 'Puesto', 'Institución', 'Contacto', 'Fecha'];
    const rows = contacts.map((c) => [
      `"${(c.nombre || '').replace(/"/g, '""')}"`,
      `"${(c.puesto || '').replace(/"/g, '""')}"`,
      `"${(c.institucion || '').replace(/"/g, '""')}"`,
      `"${(c.contacto || '').replace(/"/g, '""')}"`,
      `"${c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `contactos_qr_lluvia_ideas_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="admin-tab-section">
      <div
        className="section-header-flex"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 className="tab-section-title" style={{ marginBottom: '0.25rem' }}>
            📇 Contactos Captados vía QR ({contacts.length})
          </h2>
          <p className="tab-section-desc" style={{ margin: 0 }}>
            Registros enviados desde el código QR del modo fondo de pantalla en la página principal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Buscar nombre, puesto, institución..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#f8fafc',
              minWidth: '230px',
              fontSize: '0.88rem',
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={loadContacts}
            disabled={loading}
          >
            🔄 {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={exportToCSV}
            disabled={contacts.length === 0}
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            color: '#fecaca',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && contacts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Cargando contactos...</p>
      ) : filteredContacts.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px dashed rgba(148, 163, 184, 0.25)',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>
            {contacts.length === 0
              ? 'Aún no hay contactos registrados vía QR.'
              : 'No se encontraron contactos con ese filtro.'}
          </p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            Cuando alguien escanee el código QR y envíe el formulario corto, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'rgba(15, 23, 42, 0.55)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(30, 41, 59, 0.85)',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#94a3b8',
                }}
              >
                <th style={{ padding: '12px 14px' }}>Nombre</th>
                <th style={{ padding: '12px 14px' }}>Puesto</th>
                <th style={{ padding: '12px 14px' }}>Institución</th>
                <th style={{ padding: '12px 14px' }}>Contacto</th>
                <th style={{ padding: '12px 14px' }}>Fecha</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    borderTop: '1px solid rgba(148, 163, 184, 0.14)',
                    fontSize: '0.9rem',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f8fafc' }}>
                    {c.nombre}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{c.puesto}</td>
                  <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{c.institucion}</td>
                  <td style={{ padding: '12px 14px', color: '#7dd3fc', fontWeight: 500 }}>
                    {c.contacto}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    {c.timestamp ? new Date(c.timestamp).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {c.id && (
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleDelete(c.id!)}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

