import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import type { Cotizacion, CotizacionItem } from '../../types';

export default function AdminTabCotizador() {
  const [editingCotizaId, setEditingCotizaId] = useState<string | null>(null);
  const [cotizaClientName, setCotizaClientName] = useState('');
  const [cotizaClientEmail, setCotizaClientEmail] = useState('');
  const [cotizaClientPhone, setCotizaClientPhone] = useState('');
  const [cotizaClientCompany, setCotizaClientCompany] = useState('');
  const [cotizaItems, setCotizaItems] = useState<CotizacionItem[]>([]);
  const [cotizaNewItemDesc, setCotizaNewItemDesc] = useState('');
  const [cotizaNewItemQty, setCotizaNewItemQty] = useState(1);
  const [cotizaNewItemPrice, setCotizaNewItemPrice] = useState(0);
  const [cotizaNewItemType, setCotizaNewItemType] = useState<'producto' | 'servicio'>('producto');

  const [cotizaSignerName, setCotizaSignerName] = useState('');
  const [cotizaValidDays, setCotizaValidDays] = useState(15);
  const [cotizaSignatureImage, setCotizaSignatureImage] = useState<string | null>(null);
  const [cotizaSealImage, setCotizaSealImage] = useState<string | null>(null);
  const [cotizacionesHistory, setCotizacionesHistory] = useState<Cotizacion[]>([]);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

  const cotizaProducts = ['Libros', 'Lotería', 'Impresiones'];
  const cotizaServices = ['Diseño Editorial', 'Diseño Gráfico', 'Diseño de Manuales y Catálogos', 'Automatización y Diseño de Aplicaciones Web', 'Gamificación', 'Desarrollo de Software Educativo', 'Consultoría Pedagógica'];

  const cotizaSubtotal = cotizaItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cotizaciones'), (snapshot) => {
      const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cotizacion));
      history.sort((a, b) => b.createdAt - a.createdAt);
      setCotizacionesHistory(history);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCotizaItem = () => {
    if (!cotizaNewItemDesc) return;
    setCotizaItems(prev => [...prev, {
      description: cotizaNewItemDesc,
      quantity: Number(cotizaNewItemQty),
      unitPrice: Number(cotizaNewItemPrice),
      type: cotizaNewItemType
    }]);
    setCotizaNewItemDesc('');
    setCotizaNewItemQty(1);
    setCotizaNewItemPrice(0);
  };

  const updateCotizaItem = (index: number, field: string, value: any) => {
    setCotizaItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleRemoveCotizaItem = (index: number) => {
    setCotizaItems(prev => prev.filter((_, i) => i !== index));
  };

  const generateCotizacionPDF = (webId?: string, overrideSignature?: string, overrideSeal?: string) => {
    import('../../utils/pdfGenerator').then(({ generateCotizacionPDF: generate }) => {
      generate({
        id: webId,
        clientCompany: cotizaClientCompany,
        clientName: cotizaClientName,
        clientEmail: cotizaClientEmail,
        clientPhone: cotizaClientPhone,
        items: cotizaItems,
        subtotal: cotizaSubtotal,
        validDays: cotizaValidDays,
        createdAt: new Date().getTime(),
        sealUrl: overrideSeal !== undefined ? overrideSeal : cotizaSealImage || undefined,
        signatureUrl: overrideSignature !== undefined ? overrideSignature : cotizaSignatureImage || undefined,
        signerName: cotizaSignerName
      });
    });
  };

  const handleEditCotizacion = (c: Cotizacion) => {
    setEditingCotizaId(c.id || null);
    setCotizaClientName(c.clientName || '');
    setCotizaClientCompany(c.clientCompany || '');
    setCotizaClientEmail(c.clientEmail || '');
    setCotizaClientPhone(c.clientPhone || '');
    setCotizaItems(c.items || []);
    setCotizaValidDays(c.validDays || 15);
    setCotizaSignerName(c.signerName || '');
    setCotizaSignatureImage(c.signatureUrl || null);
    setCotizaSealImage(c.sealUrl || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCotizacion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cotización?')) return;
    try {
      await deleteDoc(doc(db, 'cotizaciones', id));
      alert('Cotización eliminada con éxito');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la cotización');
    }
  };

  const cancelEdit = () => {
    setEditingCotizaId(null);
    setCotizaClientName('');
    setCotizaClientCompany('');
    setCotizaClientEmail('');
    setCotizaClientPhone('');
    setCotizaItems([]);
    setCotizaValidDays(15);
    setCotizaSignerName('');
    setCotizaSignatureImage(null);
    setCotizaSealImage(null);
  };

  const handleGenerateQuote = async () => {
    setIsGeneratingQuote(true);
    try {
      let signatureUrl = cotizaSignatureImage || '';
      let sealUrl = cotizaSealImage || '';

      if (cotizaSignatureImage && cotizaSignatureImage.startsWith('data:image')) {
        const sigRef = ref(storage, `cotizaciones/signatures/${Date.now()}_sig`);
        await uploadString(sigRef, cotizaSignatureImage, 'data_url');
        signatureUrl = await getDownloadURL(sigRef);
      }

      if (cotizaSealImage && cotizaSealImage.startsWith('data:image')) {
        const sealRef = ref(storage, `cotizaciones/seals/${Date.now()}_seal`);
        await uploadString(sealRef, cotizaSealImage, 'data_url');
        sealUrl = await getDownloadURL(sealRef);
      }

      const now = new Date().getTime();
      let createdAt = now;
      if (editingCotizaId) {
         const existing = cotizacionesHistory.find(c => c.id === editingCotizaId);
         if (existing && existing.createdAt) {
           createdAt = existing.createdAt;
         }
      }

      const expiresAt = createdAt + (cotizaValidDays * 24 * 60 * 60 * 1000);

      const quoteData = {
        clientName: cotizaClientName,
        clientCompany: cotizaClientCompany,
        clientEmail: cotizaClientEmail,
        clientPhone: cotizaClientPhone,
        items: cotizaItems,
        subtotal: cotizaSubtotal,
        signerName: cotizaSignerName,
        signatureUrl,
        sealUrl,
        validDays: cotizaValidDays,
        createdAt,
        expiresAt,
      };

      if (editingCotizaId) {
        await setDoc(doc(db, 'cotizaciones', editingCotizaId), quoteData, { merge: true });
        generateCotizacionPDF(editingCotizaId, cotizaSignatureImage || signatureUrl, cotizaSealImage || sealUrl);
        alert(`Cotización actualizada con éxito!\nLink: https://lluviadeideasgt.com/cotizacion/${editingCotizaId}`);
        cancelEdit();
      } else {
        const docRef = await addDoc(collection(db, 'cotizaciones'), quoteData);
        generateCotizacionPDF(docRef.id, cotizaSignatureImage || signatureUrl, cotizaSealImage || sealUrl);
        alert(`Cotización y Link generados con éxito!\nLink: https://lluviadeideasgt.com/cotizacion/${docRef.id}`);
        cancelEdit();
      }
    } catch (e) {
      console.error(e);
      alert('Hubo un error al guardar la cotización web.');
    } finally {
      setIsGeneratingQuote(false);
    }
  };

  return (
    <div className="admin-card card-glass animate-fade-in">
      <h3>📄 Generar Cotización</h3>
      <p className="tab-section-desc">Crea cotizaciones profesionales en PDF para productos y servicios.</p>

      <div className="admin-form-section">
        <h4>Datos del Cliente</h4>
        <div className="admin-form-row two-cols">
          <div className="admin-form-group">
            <label>Nombre del Cliente</label>
            <input type="text" value={cotizaClientName} onChange={e => setCotizaClientName(e.target.value)} />
          </div>
          <div className="admin-form-group">
            <label>Empresa / Organización</label>
            <input type="text" value={cotizaClientCompany} onChange={e => setCotizaClientCompany(e.target.value)} />
          </div>
        </div>
        <div className="admin-form-row two-cols">
          <div className="admin-form-group">
            <label>Correo Electrónico</label>
            <input type="email" value={cotizaClientEmail} onChange={e => setCotizaClientEmail(e.target.value)} />
          </div>
          <div className="admin-form-group">
            <label>Teléfono</label>
            <input type="text" value={cotizaClientPhone} onChange={e => setCotizaClientPhone(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Items de la Cotización</h4>
        <div className="admin-table-wrapper" style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '18px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(147, 51, 234, 0.06)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Tipo</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Descripción</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Cant.</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Precio Unit. (Q)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Subtotal</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cotizaItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <select value={item.type} onChange={(e) => updateCotizaItem(idx, 'type', e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.6)', color: 'var(--text-title)' }}>
                      <option value="producto">Producto</option>
                      <option value="servicio">Servicio</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="text" value={item.description} onChange={(e) => updateCotizaItem(idx, 'description', e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.6)', color: 'var(--text-title)' }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateCotizaItem(idx, 'quantity', Number(e.target.value))} style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.6)', color: 'var(--text-title)' }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateCotizaItem(idx, 'unitPrice', Number(e.target.value))} style={{ width: '90px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.6)', color: 'var(--text-title)' }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>{(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button onClick={() => handleRemoveCotizaItem(idx)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>Total General:</td>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--primary)' }}>Q{cotizaSubtotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="admin-form-row cotizador-add-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="admin-form-group" style={{ flex: '1 1 120px' }}>
            <label>Tipo</label>
            <select value={cotizaNewItemType} onChange={e => setCotizaNewItemType(e.target.value as any)}>
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
          </div>
          <div className="admin-form-group" style={{ flex: '2 1 200px' }}>
            <label>Descripción</label>
            <input type="text" list="cotiza-suggestions" value={cotizaNewItemDesc} onChange={e => setCotizaNewItemDesc(e.target.value)} placeholder="Ej. Impresión de manual" />
            <datalist id="cotiza-suggestions">
              {cotizaNewItemType === 'producto' ? cotizaProducts.map(p => <option key={p} value={p} />) : cotizaServices.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="admin-form-group cotizador-qty-price" style={{ display: 'flex', flexDirection: 'row', gap: '10px', flex: '1 1 200px' }}>
            <div style={{ flex: 1 }}>
              <label>Cant.</label>
              <input type="number" min="1" value={cotizaNewItemQty} onChange={e => setCotizaNewItemQty(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Precio Unit.</label>
              <input type="number" min="0" step="0.01" value={cotizaNewItemPrice} onChange={e => setCotizaNewItemPrice(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleAddCotizaItem} style={{ marginBottom: '0', padding: '12px 20px', borderRadius: '8px', alignSelf: 'stretch' }}>+ Agregar</button>
        </div>
      </div>

      <div className="admin-form-section">
        <h4>Firmas y Opciones Web</h4>
        <div className="admin-form-row" style={{ flexWrap: 'wrap' }}>
          <div className="admin-form-group" style={{ flex: '1 1 200px' }}>
            <label>Nombre de quien firma</label>
            <input type="text" value={cotizaSignerName} onChange={e => setCotizaSignerName(e.target.value)} placeholder="Ej. Juan Pérez" />
          </div>
          <div className="admin-form-group" style={{ flex: '1 1 200px' }}>
            <label>Validez del enlace (Días)</label>
            <input type="number" min="1" value={cotizaValidDays} onChange={e => setCotizaValidDays(Number(e.target.value))} />
          </div>
        </div>
        <div className="admin-form-row" style={{ flexWrap: 'wrap', marginTop: '15px' }}>
          <div className="admin-form-group" style={{ flex: '1 1 200px' }}>
            <label>Imagen de Firma (Transparente PNG)</label>
            <input type="file" accept="image/png, image/jpeg" onChange={e => handleImageUpload(e, setCotizaSignatureImage)} className="file-input-mobile" />
            {cotizaSignatureImage && <img src={cotizaSignatureImage} alt="Firma" style={{ height: '80px', marginTop: '10px', objectFit: 'contain', background: 'rgba(0,0,0,0.05)', padding: '5px', borderRadius: '5px' }} />}
          </div>
          <div className="admin-form-group" style={{ flex: '1 1 200px' }}>
            <label>Imagen de Sello (Opcional)</label>
            <input type="file" accept="image/png, image/jpeg" onChange={e => handleImageUpload(e, setCotizaSealImage)} className="file-input-mobile" />
            {cotizaSealImage && <img src={cotizaSealImage} alt="Sello" style={{ height: '80px', marginTop: '10px', objectFit: 'contain', background: 'rgba(0,0,0,0.05)', padding: '5px', borderRadius: '5px' }} />}
          </div>
        </div>
      </div>

      <div className="admin-form-section" style={{ textAlign: 'center', marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button type="button" className="btn btn-primary btn-large" onClick={handleGenerateQuote} disabled={cotizaItems.length === 0 || isGeneratingQuote} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          {isGeneratingQuote ? '⏳ Guardando...' : (editingCotizaId ? '🔄 Actualizar Cotización' : '📄 Generar PDF y Link Web')}
        </button>
        {editingCotizaId && (
          <button type="button" className="btn btn-secondary btn-large" onClick={cancelEdit} disabled={isGeneratingQuote} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            ❌ Cancelar
          </button>
        )}
      </div>

      {cotizacionesHistory.length > 0 && (
        <div className="admin-form-section" style={{ marginTop: '40px' }}>
          <h4>Historial de Cotizaciones Web</h4>
          <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(147, 51, 234, 0.06)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Fecha</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Cliente</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Total</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-title)' }}>Expira</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-title)' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cotizacionesHistory.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>{c.clientCompany || c.clientName}</td>
                    <td style={{ padding: '12px 16px' }}>Q{Number(c.subtotal).toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: c.expiresAt < new Date().getTime() ? '#ef4444' : 'inherit' }}>
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigator.clipboard.writeText(`https://lluviadeideasgt.com/cotizacion/${c.id}`).then(() => alert('Enlace copiado!'))}>
                        🔗 Copiar
                      </button>
                      <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleEditCotizacion(c)}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleDeleteCotizacion(c.id)}>
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
