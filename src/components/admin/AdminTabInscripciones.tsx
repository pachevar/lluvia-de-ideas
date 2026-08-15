import { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Inscripcion } from '../../types';

export default function AdminTabInscripciones() {
  const [registrations, setRegistrations] = useState<Inscripcion[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const fetchRegistrations = async () => {
    setRegLoading(true);
    setRegError('');
    try {
      const q = query(collection(db, 'inscripciones'));
      const querySnapshot = await getDocs(q);
      const list: Inscripcion[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Inscripcion);
      });
      // Sort cronologically by timestamp descending
      list.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });
      setRegistrations(list);
    } catch (err: unknown) {
      console.error("Error loading registrations:", err);
      setRegError('Error al cargar la lista de maestros inscritos.');
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDeleteRegistration = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de inscripción?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'inscripciones', id));
      setRegistrations(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting registration:", err);
      alert("No se pudo eliminar la inscripción.");
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;
    
    // CSV headers
    const headers = ['Nombre Completo', 'Telefono', 'Colegio/Instituto', 'Fecha de Registro'];
    
    // Format rows
    const rows = registrations.map(reg => [
      `"${(reg.name || '').replace(/"/g, '""')}"`,
      `"${(reg.phone || '').replace(/"/g, '""')}"`,
      `"${(reg.school || '').replace(/"/g, '""')}"`,
      `"${reg.timestamp ? new Date(reg.timestamp).toLocaleString('es-GT') : ''}"`
    ]);
    
    // Combine to single string
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Create blob and force download
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM for Excel support
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maestros_inscritos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>📝 Listado de Maestros Inscritos</h3>
          <p className="tab-section-desc" style={{ margin: 0 }}>Visualiza y gestiona las inscripciones recibidas para los laboratorios docentes.</p>
        </div>
        <button 
          className="btn btn-success" 
          onClick={exportToCSV}
          disabled={registrations.length === 0}
          style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}
        >
          📥 Descargar Reporte CSV (Excel)
        </button>
      </div>

      {regLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '10px' }}>
          <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(147, 51, 234, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando inscripciones...</p>
        </div>
      )}

      {regError && (
        <div className="login-error-alert" style={{ marginBottom: '20px' }}>
          {regError}
        </div>
      )}

      {!regLoading && !regError && registrations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>📭</span>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Aún no hay maestros inscritos.</p>
          <p style={{ fontSize: '0.85rem' }}>Las inscripciones aparecerán aquí automáticamente cuando envíen el formulario en la pestaña de laboratorios.</p>
        </div>
      )}

      {!regLoading && !regError && registrations.length > 0 && (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '18px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(147, 51, 234, 0.06)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-title)', fontWeight: 750 }}>Nombre Completo</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-title)', fontWeight: 750 }}>Teléfono / WhatsApp</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-title)', fontWeight: 750 }}>Colegio o Instituto</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-title)', fontWeight: 750 }}>Fecha de Registro</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-title)', fontWeight: 750 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-title)' }}>{reg.name}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <a href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      📞 {reg.phone} ↗
                    </a>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-main)' }}>{reg.school}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {reg.timestamp ? new Date(reg.timestamp).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin fecha'}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button 
                      onClick={() => reg.id && handleDeleteRegistration(reg.id)}
                      style={{ color: 'var(--danger)', background: 'transparent', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 700 }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Eliminar 🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
