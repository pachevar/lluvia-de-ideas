import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalConfig } from './context/PortalConfigContext';
import { useAuth } from './context/AuthContext';
import type { PortalConfig } from './types';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminSidebar from './components/admin/AdminSidebar';
import AdminHeaderBar from './components/admin/AdminHeaderBar';
import { type AdminTabType } from './components/admin/adminNavConfig';
import AdminTabInicio from './components/admin/AdminTabInicio';
import AdminTabVideos from './components/admin/AdminTabVideos';
import AdminTabLaboratorios from './components/admin/AdminTabLaboratorios';
import AdminColorsTab from './components/admin/AdminColorsTab';
import AdminTabInscripciones from './components/admin/AdminTabInscripciones';
import AdminTabCotizador from './components/admin/AdminTabCotizador';
import AdminBingoTab from './components/admin/AdminBingoTab';
import AdminTabMundoVirtual from './components/admin/AdminTabMundoVirtual';
import AdminTabCreatika from './components/admin/AdminTabCreatika';
import AdminTab100tek from './components/admin/AdminTab100tek';
import AdminTabTienda from './components/admin/AdminTabTienda';
import AdminTabTechTree from './components/admin/AdminTabTechTree';
import AdminTabViajeDelHeroe from './components/admin/AdminTabViajeDelHeroe';

export default function Gerencia() {
  const { config, loading: configLoading, saveConfigToFirestore, resetConfigToFirestore } = usePortalConfig();
  const { user, userProfile, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const onBackToPortal = () => navigate('/');

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>('inicio');
  const [localConfig, setLocalConfig] = useState<PortalConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

  // Initialize local config copy and reactively synchronize external asset updates
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (config && !configLoading) {
      if (isInitialLoad.current || !localConfig) {
        setLocalConfig(JSON.parse(JSON.stringify(config))); // Deep copy
        isInitialLoad.current = false;
      } else {
        // Sincronización reactiva: absorbe automáticamente mapas, secciones y fotos actualizadas
        // para que localConfig nunca sobrescriba con datos viejos en Firestore
        setLocalConfig(prev => {
          if (!prev) return JSON.parse(JSON.stringify(config));
          return {
            ...prev,
            map: config.map || prev.map,
            landingConfig: {
              ...prev.landingConfig,
              sections: {
                ...(prev.landingConfig?.sections || {}),
                ...(config.landingConfig?.sections || {})
              },
              promoVideos: config.landingConfig?.promoVideos || prev.landingConfig?.promoVideos
            },
            techTreeNodes: config.techTreeNodes || prev.techTreeNodes,
            archetypeImages: { ...(prev.archetypeImages || {}), ...(config.archetypeImages || {}) },
            journeyStageImages: { ...(prev.journeyStageImages || {}), ...(config.journeyStageImages || {}) }
          };
        });
      }
    }
  }, [config, configLoading]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveConfig = useCallback(async () => {
    if (!localConfig) return;
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      // Blindaje de guardado: fusionar con la última versión de Firestore para no perder activos ni hexágonos
      const safeConfig: PortalConfig = {
        ...config,
        ...localConfig,
        map: (localConfig.map && localConfig.map.length > 0) ? localConfig.map : (config.map || []),
        landingConfig: {
          ...(config.landingConfig || {}),
          ...(localConfig.landingConfig || {}),
          sections: {
            ...(config.landingConfig?.sections || {}),
            ...(localConfig.landingConfig?.sections || {})
          },
          promoVideos: localConfig.landingConfig?.promoVideos || config.landingConfig?.promoVideos
        }
      };
      await saveConfigToFirestore(safeConfig);
      setLocalConfig(safeConfig);
      setSaveStatus({ type: 'success', message: '¡Configuración guardada y blindada exitosamente en Firestore!' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } catch (err) {
      console.error("Error saving config:", err);
      setSaveStatus({ type: 'error', message: 'Error al guardar la configuración en la base de datos.' });
    } finally {
      setSaving(false);
    }
  }, [localConfig, config, saveConfigToFirestore]);

  const handleExportBackup = () => {
    try {
      const dataToExport = localConfig || config;
      const jsonStr = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `respaldo_portal_lluviadeideas_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveStatus({ type: 'success', message: '📥 Copia de seguridad JSON descargada con éxito.' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000);
    } catch (err) {
      console.error('Error exportando backup:', err);
      alert('Error al generar la copia de seguridad.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as PortalConfig;
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Archivo JSON inválido.');
        }
        if (!window.confirm('¿Deseas restaurar esta copia de seguridad? Se actualizarán todos los textos, imágenes y configuraciones en Firestore.')) {
          return;
        }
        setSaving(true);
        await saveConfigToFirestore(parsed);
        setLocalConfig(parsed);
        setSaveStatus({ type: 'success', message: '📤 ¡Copia de seguridad restaurada y guardada en Firestore!' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } catch (err) {
        console.error('Error importando backup:', err);
        alert('El archivo no contiene un formato de configuración válido.');
      } finally {
        setSaving(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfig = async () => {
    if (!window.confirm('¿Estás seguro de que deseas restaurar la configuración predeterminada de fábrica? Esto sobrescribirá los datos guardados.')) {
      return;
    }
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await resetConfigToFirestore();
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
  const updateField = (section: string, field: string, value: unknown) => {
    if (!localConfig) return;
    setLocalConfig(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof PortalConfig] as Record<string, unknown>,
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

  const updateModule = (index: number, field: string, value: unknown) => {
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

  // Shortcut Ctrl + S / Cmd + S to save config
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveConfig();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localConfig, handleSaveConfig]);

  if (authLoading || configLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: 'transparent' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Cargando Panel de Gerencia...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Render Login Card if user is not authenticated
  if (!user) {
    return <AdminLogin onBackToPortal={onBackToPortal} />;
  }

  // Only accounts with role 'admin' (or an admin custom claim) can access the panel
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
        <div className="card-glass" style={{ padding: '2.5rem', maxWidth: '420px', width: '100%' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>🚫</span>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Acceso Denegado</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Tu cuenta <strong>{userProfile?.email || user.email}</strong> no tiene permisos de administrador.
            Solo cuentas con rol <strong>admin</strong> pueden acceder al Panel de Gerencia.
          </p>
          <button className="btn btn-primary btn-large" onClick={onBackToPortal}>
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
      <AdminSidebar
        userEmail={user.email}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        handleResetConfig={handleResetConfig}
        saving={saving}
        onBackToPortal={onBackToPortal}
        handleLogout={handleLogout}
      />

      <main className="admin-main-panel">
        {/* Header Bar Modular con Breadcrumbs, Atajos y Respaldo */}
        <AdminHeaderBar 
          activeTab={activeAdminTab}
          saving={saving}
          saveStatus={saveStatus}
          handleSaveConfig={handleSaveConfig}
          onBackToPortal={onBackToPortal}
          handleExportBackup={handleExportBackup}
          handleImportBackup={handleImportBackup}
        />

        <div className="admin-tab-content">
          {activeAdminTab === 'inicio' && (
            <AdminTabInicio 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig}
              updateField={updateField} 
              updateStory={updateStory} 
            />
          )}

          {activeAdminTab === 'videos' && (
            <AdminTabVideos 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig} 
            />
          )}

          {activeAdminTab === 'neurociencia' && (
            <div className="card-glass p-6 animate-fade-in" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#38bdf8', marginBottom: '1rem' }}>🧠 Módulo de Neurociencia Educativa</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                Configuración de la guía práctica por etapas de neurodesarrollo. Los contenidos de las etapas (Semilla, Brote, Florecer, Fructificar) se sincronizan automáticamente con las directrices didácticas de la editorial.
              </p>
            </div>
          )}

          {activeAdminTab === 'libros' && (
            <AdminTabInicio 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig}
              updateField={updateField} 
              updateStory={updateStory} 
            />
          )}

          {activeAdminTab === 'creatika' && (
            <AdminTabCreatika 
              localConfig={localConfig} 
              updateField={updateField} 
            />
          )}

          {activeAdminTab === '100tek' && (
            <AdminTab100tek 
              localConfig={localConfig} 
              updateField={updateField} 
            />
          )}

          {activeAdminTab === 'mapa' && (
            <AdminTabMundoVirtual 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig} 
            />
          )}

          {activeAdminTab === 'techtree' && (
            <AdminTabTechTree 
              localConfig={localConfig} 
              updateField={updateField} 
            />
          )}

          {activeAdminTab === 'laboratorios' && (
            <AdminTabLaboratorios 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig} 
              updateModule={updateModule} 
              updateModuleSkill={updateModuleSkill} 
            />
          )}

          {activeAdminTab === 'tienda' && (
            <AdminTabTienda 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig}
              updateField={updateField} 
            />
          )}

          {activeAdminTab === 'viaje_del_heroe' && (
            <AdminTabViajeDelHeroe 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig} 
            />
          )}

          {activeAdminTab === 'colors' && (
            <AdminColorsTab 
              localConfig={localConfig} 
              setLocalConfig={setLocalConfig} 
            />
          )}

          {activeAdminTab === 'inscripciones' && (
            <AdminTabInscripciones />
          )}

          {activeAdminTab === 'cotizador' && (
            <AdminTabCotizador />
          )}

          {activeAdminTab === 'bingo' && (
            <AdminBingoTab />
          )}
        </div>
      </main>

      {/* Notificación Flotante Tipo Toast para Guardados y Respaldos */}
      {saveStatus.message && (
        <div className={`admin-floating-toast ${saveStatus.type}`}>
          <span className="toast-icon">{saveStatus.type === 'success' ? '✨' : '⚠️'}</span>
          <span className="toast-text">{saveStatus.message}</span>
        </div>
      )}
    </div>
  );
}
