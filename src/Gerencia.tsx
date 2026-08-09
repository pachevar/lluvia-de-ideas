import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { usePortalConfig } from './context/PortalConfigContext';
import type { PortalConfig } from './types';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminSidebar, { type AdminTabType } from './components/admin/AdminSidebar';
import AdminTabInicio from './components/admin/AdminTabInicio';
import AdminTabLaboratorios from './components/admin/AdminTabLaboratorios';
import AdminColorsTab from './components/admin/AdminColorsTab';
import AdminTabInscripciones from './components/admin/AdminTabInscripciones';
import AdminTabCotizador from './components/admin/AdminTabCotizador';
import AdminBingoTab from './components/admin/AdminBingoTab';
import AdminTabMundoVirtual from './components/admin/AdminTabMundoVirtual';
import AdminTabCreatika from './components/admin/AdminTabCreatika';
import AdminTab100tek from './components/admin/AdminTab100tek';
import AdminTabCatalogo from './components/admin/AdminTabCatalogo';
import AdminTabTechTree from './components/admin/AdminTabTechTree';

export default function Gerencia() {
  const { config, loading: configLoading, saveConfigToFirestore, resetConfigToFirestore } = usePortalConfig();
  const navigate = useNavigate();
  const onBackToPortal = () => navigate('/');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>('inicio');
  const [localConfig, setLocalConfig] = useState<PortalConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [saving, setSaving] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize local config copy when props config changes and not loading
  useEffect(() => {
    if (config && !configLoading) {
      setLocalConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    }
  }, [config, configLoading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveConfig = async () => {
    if (!localConfig) return;
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    try {
      await saveConfigToFirestore(localConfig);
      setSaveStatus({ type: 'success', message: '¡Configuración guardada exitosamente en Firestore!' });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } catch (err) {
      console.error("Error saving config:", err);
      setSaveStatus({ type: 'error', message: 'Error al guardar la configuración en la base de datos.' });
    } finally {
      setSaving(false);
    }
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

  if (loading || configLoading) {
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
        handleSaveConfig={handleSaveConfig}
        handleResetConfig={handleResetConfig}
        saving={saving}
        saveStatus={saveStatus}
        onBackToPortal={onBackToPortal}
        handleLogout={handleLogout}
      />

      <main className="admin-main-panel">
        <header className="admin-panel-header card-glass">
          <h2>Configuración del Portal Web</h2>
          <p>Los cambios que realices aquí se guardarán en la base de datos de Firebase y se aplicarán al instante.</p>
        </header>

        <div className="admin-tab-content">
          {activeAdminTab === 'inicio' && (
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

          {activeAdminTab === 'catalogo' && (
            <AdminTabCatalogo 
              localConfig={localConfig} 
              updateField={updateField} 
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
    </div>
  );
}
