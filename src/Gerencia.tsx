import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

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

  // Admin Panel State
  const [activeAdminTab, setActiveAdminTab] = useState<'inicio' | 'laboratorios' | 'colors'>('inicio');
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

  // Initialize local config copy when props config changes
  useEffect(() => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    }
  }, [config]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
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

            <button type="submit" className="btn btn-primary btn-large" disabled={loginLoading}>
              {loginLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
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

                {localConfig.stories.map((story, index) => (
                  <div key={story.id} className="admin-nested-card">
                    <h5>📖 {story.title}</h5>
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
                          rows={4} 
                          value={story.summary} 
                          onChange={(e) => updateStory(index, 'summary', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                <h4>Listado de Módulos Formativos (10 Módulos)</h4>

                {localConfig.laboratorios.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="admin-nested-card">
                    <div className="admin-nested-header">
                      <span className="admin-nested-icon">{mod.icon}</span>
                      <h5>Módulo {mod.id}: {mod.title}</h5>
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
                          rows={2} 
                          value={mod.competency} 
                          onChange={(e) => updateModule(modIdx, 'competency', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Habilidades a Desarrollar</label>
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
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Colors Config */}
          {activeAdminTab === 'colors' && (
            <div className="admin-card card-glass animate-fade-in">
              <h3>🎨 Configuración de Colores y Estilos</h3>
              <p className="tab-section-desc">Personaliza la identidad cromática del portal. Los cambios se aplicarán dinámicamente.</p>

              <div className="admin-form-section">
                <h4>Paleta de Colores Básica</h4>
                
                <div className="admin-colors-grid">
                  {/* Primary Color Picker */}
                  <div className="admin-color-picker-item card-glass">
                    <div className="color-preview" style={{ backgroundColor: localConfig.colors.primary }}></div>
                    <div className="color-picker-info">
                      <label>Color Primario (Violeta Mágico)</label>
                      <span className="color-subtitle">Utilizado en botones activos, realces e íconos principales.</span>
                      <input 
                        type="color" 
                        value={localConfig.colors.primary} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, primary: e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                      <input 
                        type="text" 
                        className="color-hex-text"
                        value={localConfig.colors.primary} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, primary: e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                    </div>
                  </div>

                  {/* Tertiary Color Picker */}
                  <div className="admin-color-picker-item card-glass">
                    <div className="color-preview" style={{ backgroundColor: localConfig.colors.tertiary }}></div>
                    <div className="color-picker-info">
                      <label>Color Terciario (Rosa/Fucsia Creativo)</label>
                      <span className="color-subtitle">Utilizado en insignias y viñetas decorativas secundarias.</span>
                      <input 
                        type="color" 
                        value={localConfig.colors.tertiary} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, tertiary: e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                      <input 
                        type="text" 
                        className="color-hex-text"
                        value={localConfig.colors.tertiary} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, tertiary: e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                    </div>
                  </div>

                  {/* Bg Main Color Picker */}
                  <div className="admin-color-picker-item card-glass">
                    <div className="color-preview" style={{ backgroundColor: localConfig.colors['bg-main'] }}></div>
                    <div className="color-picker-info">
                      <label>Color de Fondo del Sitio</label>
                      <span className="color-subtitle">Fondo principal de la página (se recomienda blanco `#ffffff` o lila muy claro).</span>
                      <input 
                        type="color" 
                        value={localConfig.colors['bg-main']} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, 'bg-main': e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                      <input 
                        type="text" 
                        className="color-hex-text"
                        value={localConfig.colors['bg-main']} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, 'bg-main': e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                    </div>
                  </div>

                  {/* Text Title Color Picker */}
                  <div className="admin-color-picker-item card-glass">
                    <div className="color-preview" style={{ backgroundColor: localConfig.colors['text-title'] }}></div>
                    <div className="color-picker-info">
                      <label>Color del Texto e Encabezados</label>
                      <span className="color-subtitle">Color sólido para los títulos y textos de alto contraste.</span>
                      <input 
                        type="color" 
                        value={localConfig.colors['text-title']} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, 'text-title': e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                      <input 
                        type="text" 
                        className="color-hex-text"
                        value={localConfig.colors['text-title']} 
                        onChange={(e) => {
                          const updatedColors = { ...localConfig.colors, 'text-title': e.target.value };
                          setLocalConfig({ ...localConfig, colors: updatedColors });
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
