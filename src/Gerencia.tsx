import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

import type { User } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import AdminColorsTab from './components/admin/AdminColorsTab';
import { collection, query, getDocs, deleteDoc, doc, addDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Interfaces matching PortalConfig
export interface LabModuleConfig {
  id: number;
  title: string;
  icon: string;
  competency: string;
  skills: string[];
}

export interface StoryConfig {
  id: string;
  title: string;
  role: string;
  summary: string;
  imageOverride?: string; // Optional URL to override local asset
}

export interface PortalConfig {
  hero: {
    slogan: string;
  };
  minecraft: {
    ip: string;
    url: string;
  };
  stories: StoryConfig[];
  gateways: {
    labDesc: string;
    casaDesc: string;
  };
  laboratorios: {
    intro: string;
    modules: LabModuleConfig[];
  };
  colors: {
    primary: string;
    tertiary: string;
    'bg-main': string;
    'text-title': string;
  };
}

interface GerenciaProps {
  config: PortalConfig;
  onSave: (newConfig: PortalConfig) => Promise<void>;
  onReset: () => Promise<void>;
  onBackToPortal: () => void;
}

export default function Gerencia({ config, onSave, onReset, onBackToPortal }: GerenciaProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Admin Panel State
  const [activeAdminTab, setActiveAdminTab] = useState<'inicio' | 'laboratorios' | 'colors' | 'inscripciones' | 'cotizador'>('inicio');

  // Cotizador State
  const [editingCotizaId, setEditingCotizaId] = useState<string | null>(null);
  const [cotizaClientName, setCotizaClientName] = useState('');
  const [cotizaClientEmail, setCotizaClientEmail] = useState('');
  const [cotizaClientPhone, setCotizaClientPhone] = useState('');
  const [cotizaClientCompany, setCotizaClientCompany] = useState('');
  const [cotizaItems, setCotizaItems] = useState<{description: string, quantity: number, unitPrice: number, type: 'producto' | 'servicio'}[]>([]);
  const [cotizaNewItemDesc, setCotizaNewItemDesc] = useState('');
  const [cotizaNewItemQty, setCotizaNewItemQty] = useState(1);
  const [cotizaNewItemPrice, setCotizaNewItemPrice] = useState(0);
  const [cotizaNewItemType, setCotizaNewItemType] = useState<'producto' | 'servicio'>('producto');

  // New states for Signature, Seal, and Web version
  const [cotizaSignerName, setCotizaSignerName] = useState('');
  const [cotizaValidDays, setCotizaValidDays] = useState(15);
  const [cotizaSignatureImage, setCotizaSignatureImage] = useState<string | null>(null);
  const [cotizaSealImage, setCotizaSealImage] = useState<string | null>(null);
  const [cotizacionesHistory, setCotizacionesHistory] = useState<any[]>([]);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);

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

  const cotizaProducts = ['Libros', 'Lotería', 'Impresiones'];
  const cotizaServices = ['Diseño Editorial', 'Diseño Gráfico', 'Diseño de Manuales y Catálogos', 'Automatización y Diseño de Aplicaciones Web', 'Gamificación', 'Desarrollo de Software Educativo', 'Consultoría Pedagógica'];

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

  const cotizaSubtotal = cotizaItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  useEffect(() => {
    if (user && activeAdminTab === 'cotizador') {
      const unsub = onSnapshot(collection(db, 'cotizaciones'), (snapshot) => {
        const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        history.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setCotizacionesHistory(history);
      });
      return () => unsub();
    }
  }, [user, activeAdminTab]);

  const generateCotizacionPDF = (webId?: string) => {
    import('./utils/pdfGenerator').then(({ generateCotizacionPDF: generate }) => {
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
        sealUrl: cotizaSealImage,
        signatureUrl: cotizaSignatureImage,
        signerName: cotizaSignerName
      }, window.location.origin);
    });
  };

  const handleEditCotizacion = (c: any) => {
    setEditingCotizaId(c.id);
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
        generateCotizacionPDF(editingCotizaId);
        alert(`Cotización actualizada con éxito!\nLink: ${window.location.origin}/cotizacion/${editingCotizaId}`);
        cancelEdit();
      } else {
        const docRef = await addDoc(collection(db, 'cotizaciones'), quoteData);
        generateCotizacionPDF(docRef.id);
        alert(`Cotización y Link generados con éxito!\nLink: ${window.location.origin}/cotizacion/${docRef.id}`);
        cancelEdit();
      }
    } catch (e) {
      console.error(e);
      alert('Hubo un error al guardar la cotización web.');
    } finally {
      setIsGeneratingQuote(false);
    }
  };
  const [localConfig, setLocalConfig] = useState<PortalConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

  // Selector index states for stories and modules
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);

  // Inscripciones State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize local config copy when props config changes
  useEffect(() => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    }
  }, [config]);

  // Handle Reset Password
  const [resetLoading, setResetLoading] = useState(false);
  const handleResetPassword = async () => {
    setLoginError('');
    setResetMessage('');
    if (!email) {
      setLoginError('Por favor, ingresa tu correo electrónico en el campo superior para enviarte el enlace de recuperación.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('¡Enlace de recuperación enviado! Revisa tu correo (incluso en spam).');
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === 'auth/user-not-found') {
        setLoginError('No existe ningún usuario registrado con este correo.');
      } else {
        setLoginError('Ocurrió un error al enviar el correo de recuperación.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Load registrations from Firestore
  const fetchRegistrations = async () => {
    setRegLoading(true);
    setRegError('');
    try {
      const q = query(collection(db, 'inscripciones'));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      // Sort cronologically by timestamp descending
      list.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });
      setRegistrations(list);
    } catch (err: any) {
      console.error("Error loading registrations:", err);
      setRegError('Error al cargar la lista de maestros inscritos.');
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === 'inscripciones' && user) {
      fetchRegistrations();
    }
  }, [activeAdminTab, user]);

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

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setResetMessage('');
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      setLoginError('Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle Save
  const handleSaveConfig = async () => {
    if (!localConfig) return;
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await onSave(localConfig);
      setSaveStatus({ type: 'success', message: '¡Configuración guardada exitosamente en Firestore!' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } catch (err) {
      console.error("Error saving config:", err);
      setSaveStatus({ type: 'error', message: 'Error al guardar la configuración en la base de datos.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle Reset to Default
  const handleResetConfig = async () => {
    if (!window.confirm('¿Estás seguro de que deseas restaurar la configuración predeterminada de fábrica? Esto sobrescribirá los datos guardados.')) {
      return;
    }
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await onReset();
      setSaveStatus({ type: 'success', message: '¡Configuración restaurada a valores por defecto!' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } catch (err) {
      console.error("Error resetting config:", err);
      setSaveStatus({ type: 'error', message: 'Error al restaurar los valores por defecto.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to modify localConfig fields
  const updateField = (section: string, field: string, value: any) => {
    if (!localConfig) return;
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof PortalConfig] as any,
          [field]: value
        }
      };
    });
  };

  const updateStory = (index: number, field: string, value: string) => {
    if (!localConfig) return;
    const updatedStories = [...localConfig.stories];
    updatedStories[index] = {
      ...updatedStories[index],
      [field]: value
    };
    setLocalConfig({
      ...localConfig,
      stories: updatedStories
    });
  };

  const updateModule = (index: number, field: string, value: any) => {
    if (!localConfig) return;
    const updatedModules = [...localConfig.laboratorios.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    setLocalConfig({
      ...localConfig,
      laboratorios: {
        ...localConfig.laboratorios,
        modules: updatedModules
      }
    });
  };

  const updateModuleSkill = (moduleIndex: number, skillIndex: number, value: string) => {
    if (!localConfig) return;
    const updatedModules = [...localConfig.laboratorios.modules];
    const updatedSkills = [...updatedModules[moduleIndex].skills];
    updatedSkills[skillIndex] = value;
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      skills: updatedSkills
    };
    setLocalConfig({
      ...localConfig,
      laboratorios: {
        ...localConfig.laboratorios,
        modules: updatedModules
      }
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
        <p>Cargando panel de gerencia...</p>
      </div>
    );
  }

  // Render Login Card if user is not authenticated
  if (!user) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card card-glass animate-fade-in">
          <div className="login-header">
            <span className="login-logo-emoji">🔑</span>
            <h2>Panel de Gerencia</h2>
            <p>Ingresa tus credenciales de administrador para configurar el portal.</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="admin-form-group">
              <label htmlFor="admin-email">Correo Electrónico</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="ejemplo@lluviadeideaseditorial.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="admin-password">Contraseña</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {loginError && <div className="login-error-alert">{loginError}</div>}
            {resetMessage && <div className="login-success-alert" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>{resetMessage}</div>}

            <button type="submit" className="btn btn-primary btn-large" disabled={loginLoading || resetLoading}>
              {loginLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
            
            <button 
              type="button" 
              className="btn-link" 
              onClick={handleResetPassword}
              disabled={loginLoading || resetLoading}
              style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'underline', alignSelf: 'center', cursor: 'pointer', fontFamily: 'var(--font-headline)', fontWeight: 650, display: 'block', width: '100%', textAlign: 'center' }}
            >
              {resetLoading ? 'Enviando enlace...' : '¿Olvidaste tu contraseña? Recuperar 🔑'}
            </button>
          </form>
          
          <button className="btn btn-secondary btn-sm back-to-site-btn" onClick={onBackToPortal}>
            ⬅ Volver al Sitio Público
          </button>
        </div>
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="admin-loading-screen">
        <p>Cargando datos de configuración...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar card-glass">
        <div className="admin-brand-header">
          <span className="admin-brand-icon">⚙️</span>
          <div>
            <h3>Gerencia</h3>
            <span className="admin-user-email">{user.email}</span>
          </div>
        </div>

        {/* Mobile Navigation Selector */}
        <div className="admin-mobile-nav">
          <label htmlFor="admin-nav-select" className="admin-mobile-nav-label">Seleccionar sección:</label>
          <div className="admin-nav-select-wrapper">
            <select 
              id="admin-nav-select"
              value={activeAdminTab} 
              onChange={(e) => setActiveAdminTab(e.target.value as any)}
              className="admin-nav-select"
            >
              <option value="inicio">🏠 Sección Inicio</option>
              <option value="laboratorios">🧪 Sección Laboratorios</option>
              <option value="colors">🎨 Colores y Estilos</option>
              <option value="inscripciones">📝 Maestros Inscritos</option>
              <option value="cotizador">📄 Generar Cotización</option>
            </select>
            <span className="admin-nav-select-arrow">▼</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('inicio')}
          >
            🏠 Sección Inicio
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'laboratorios' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('laboratorios')}
          >
            🧪 Sección Laboratorios
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('colors')}
          >
            🎨 Colores y Estilos
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'inscripciones' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('inscripciones')}
          >
            📝 Maestros Inscritos
          </button>
          <button 
            className={`admin-nav-tab ${activeAdminTab === 'cotizador' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('cotizador')}
          >
            📄 Generar Cotización
          </button>
        </nav>

        <div className="admin-actions-group">
          {saveStatus.message && (
            <div className={`save-status-toast ${saveStatus.type}`}>
              {saveStatus.type === 'success' ? '✅' : '❌'} {saveStatus.message}
            </div>
          )}

          <button 
            className="btn btn-primary btn-large btn-admin-save" 
            onClick={handleSaveConfig}
            disabled={saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>

          <button 
            className="btn btn-secondary btn-admin-reset" 
            onClick={handleResetConfig}
            disabled={saving}
          >
            🔄 Restaurar por Defecto
          </button>

          <div className="divider-h"></div>

          <button className="btn btn-outline btn-sm" onClick={onBackToPortal}>
            🌐 Ir al Portal Público
          </button>

          <button className="btn btn-danger btn-sm btn-logout" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Form Dashboard */}
      <main className="admin-main-panel">
        <header className="admin-panel-header card-glass">
          <h2>Configuración del Portal Web</h2>
          <p>
            Los cambios que realices aquí se guardarán en la base de datos de Firebase y se aplicarán al instante.
          </p>
        </header>

        <div className="admin-tab-content">
          {/* Tab 1: Inicio Config */}
          {activeAdminTab === 'inicio' && (
            <div className="admin-card card-glass animate-fade-in">
              <h3>🏠 Configuración de la Página de Inicio</h3>
              <p className="tab-section-desc">Edita el slogan, las configuraciones del servidor de Minecraft y las leyendas del Popol Vuh.</p>

              <div className="admin-form-section">
                <h4>Encabezado e IP</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Slogan de la Empresa</label>
                    <input 
                      type="text" 
                      value={localConfig.hero.slogan} 
                      onChange={(e) => updateField('hero', 'slogan', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="admin-form-row two-cols">
                  <div className="admin-form-group">
                    <label>Dirección IP de Minecraft</label>
                    <input 
                      type="text" 
                      value={localConfig.minecraft.ip} 
                      onChange={(e) => updateField('minecraft', 'ip', e.target.value)} 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Enlace del Servidor de Minecraft (URL)</label>
                    <input 
                      type="url" 
                      value={localConfig.minecraft.url} 
                      onChange={(e) => updateField('minecraft', 'url', e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Tarjetas de Acceso Rápido (Gateways)</h4>
                <div className="admin-form-row two-cols">
                  <div className="admin-form-group">
                    <label>Descripción: Tarjeta de Laboratorios</label>
                    <textarea 
                      rows={3} 
                      value={localConfig.gateways.labDesc} 
                      onChange={(e) => updateField('gateways', 'labDesc', e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Descripción: Tarjeta Casa de las Leyendas</label>
                    <textarea 
                      rows={3} 
                      value={localConfig.gateways.casaDesc} 
                      onChange={(e) => updateField('gateways', 'casaDesc', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Leyendas del Popol Vuh (Modal de Inicio)</h4>
                <p className="admin-section-help">Modifica las descripciones y sinopsis que se muestran al clicar las portadas en la página principal.</p>

                {/* Horizontal Story Tabs Selector */}
                <div className="admin-stories-tabs">
                  {localConfig.stories.map((story, index) => (
                    <button
                      key={story.id}
                      type="button"
                      className={`admin-story-tab-button ${selectedStoryIdx === index ? 'active' : ''}`}
                      onClick={() => setSelectedStoryIdx(index)}
                    >
                      <span className="story-tab-icon">📖</span>
                      <div className="story-tab-info">
                        <span className="story-tab-title">{story.title}</span>
                        <span className="story-tab-role">{story.role || 'Leyenda'}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Story Editor Detail */}
                {localConfig.stories[selectedStoryIdx] && (() => {
                  const story = localConfig.stories[selectedStoryIdx];
                  const index = selectedStoryIdx;
                  return (
                    <div className="admin-story-detail-editor admin-nested-card active animate-fade-in">
                      <div className="admin-nested-header">
                        <span className="admin-nested-icon">📖</span>
                        <h5>Editando Leyenda {index + 1}: {story.title}</h5>
                      </div>

                      <div className="admin-form-row two-cols">
                        <div className="admin-form-group">
                          <label>Título Completo</label>
                          <input 
                            type="text" 
                            value={story.title} 
                            onChange={(e) => updateStory(index, 'title', e.target.value)} 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label>Rol o Título Mitológico</label>
                          <input 
                            type="text" 
                            value={story.role} 
                            onChange={(e) => updateStory(index, 'role', e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>URL de Imagen Personalizada (Opcional, para sobrescribir portada)</label>
                          <input 
                            type="url" 
                            placeholder="https://ejemplo.com/imagen.png (vacío para usar portada predeterminada)"
                            value={story.imageOverride || ''} 
                            onChange={(e) => updateStory(index, 'imageOverride', e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>Resumen / Sinopsis Literaria</label>
                          <textarea 
                            rows={6} 
                            value={story.summary} 
                            onChange={(e) => updateStory(index, 'summary', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Tab 2: Laboratorios Config */}
          {activeAdminTab === 'laboratorios' && (
            <div className="admin-card card-glass animate-fade-in">
              <h3>🧪 Configuración de la Sección de Laboratorios</h3>
              <p className="tab-section-desc">Configura los textos generales y define las competencias y habilidades de los 10 módulos formativos.</p>

              <div className="admin-form-section">
                <h4>Introducción del Laboratorio</h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Párrafo Introductorio de Animación Educativa</label>
                    <textarea 
                      rows={3} 
                      value={localConfig.laboratorios.intro} 
                      onChange={(e) => {
                        if (!localConfig) return;
                        setLocalConfig({
                          ...localConfig,
                          laboratorios: {
                            ...localConfig.laboratorios,
                            intro: e.target.value
                          }
                        });
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h4>Módulos Formativos (10 Módulos)</h4>
                <p className="admin-section-help">Selecciona un módulo en la lista lateral para editar su información detallada de manera individual.</p>

                <div className="admin-master-detail-layout">
                  {/* Master Selector Sidebar */}
                  <div className="admin-modules-selector-list">
                    {localConfig.laboratorios.modules.map((mod, modIdx) => (
                      <button
                        key={mod.id}
                        type="button"
                        className={`admin-module-selector-card ${selectedModuleIdx === modIdx ? 'active' : ''}`}
                        onClick={() => setSelectedModuleIdx(modIdx)}
                      >
                        <span className="module-selector-badge">Módulo {mod.id}</span>
                        <div className="module-selector-details">
                          <span className="module-selector-icon">{mod.icon}</span>
                          <span className="module-selector-title">{mod.title || `Sin Título`}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Detail Editor Form */}
                  {localConfig.laboratorios.modules[selectedModuleIdx] && (() => {
                    const mod = localConfig.laboratorios.modules[selectedModuleIdx];
                    const modIdx = selectedModuleIdx;
                    return (
                      <div className="admin-module-detail-editor admin-nested-card active animate-fade-in">
                        <div className="admin-nested-header">
                          <span className="admin-nested-icon">{mod.icon}</span>
                          <h5>Editando Módulo {mod.id}: {mod.title}</h5>
                        </div>

                        <div className="admin-form-row two-cols-small">
                          <div className="admin-form-group">
                            <label>Título del Módulo</label>
                            <input 
                              type="text" 
                              value={mod.title} 
                              onChange={(e) => updateModule(modIdx, 'title', e.target.value)} 
                            />
                          </div>
                          <div className="admin-form-group max-width-100">
                            <label>Emoji / Icono</label>
                            <input 
                              type="text" 
                              value={mod.icon} 
                              onChange={(e) => updateModule(modIdx, 'icon', e.target.value)} 
                            />
                          </div>
                        </div>

                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label>Competencia Principal</label>
                            <textarea 
                              rows={3} 
                              value={mod.competency} 
                              onChange={(e) => updateModule(modIdx, 'competency', e.target.value)} 
                            />
                          </div>
                        </div>

                        <div className="admin-form-row">
                          <div className="admin-form-group">
                            <label>Habilidades a Desarrollar</label>
                            <span className="field-helper-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Edita los 4 aspectos clave que los docentes desarrollarán en este módulo.</span>
                            <div className="admin-skills-inputs-grid">
                              {mod.skills.map((skill, skillIdx) => (
                                <div key={skillIdx} className="skill-input-row">
                                  <span className="skill-idx-label">{skillIdx + 1}</span>
                                  <input 
                                    type="text" 
                                    value={skill} 
                                    onChange={(e) => updateModuleSkill(modIdx, skillIdx, e.target.value)} 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Colors Config */}
          {activeAdminTab === 'colors' && (
            <AdminColorsTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
          )}

          {/* Tab 4: Inscripciones Config */}
          {activeAdminTab === 'inscripciones' && (
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
                              onClick={() => handleDeleteRegistration(reg.id)}
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
          )}

          {/* Tab 5: Cotizador Config */}
          {activeAdminTab === 'cotizador' && (
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
                    {cotizaSignatureImage && <img src={cotizaSignatureImage} alt="Firma" style={{ height: '40px', marginTop: '10px', objectFit: 'contain' }} />}
                  </div>
                  <div className="admin-form-group" style={{ flex: '1 1 200px' }}>
                    <label>Imagen de Sello (Opcional)</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={e => handleImageUpload(e, setCotizaSealImage)} className="file-input-mobile" />
                    {cotizaSealImage && <img src={cotizaSealImage} alt="Sello" style={{ height: '40px', marginTop: '10px', objectFit: 'contain' }} />}
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
                              <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/cotizacion/${c.id}`).then(() => alert('Enlace copiado!'))}>
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
          )}
        </div>
      </main>
    </div>
  );
}
