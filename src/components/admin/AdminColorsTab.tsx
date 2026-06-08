
import type { PortalConfig } from '../../Gerencia';

interface AdminColorsTabProps {
  localConfig: PortalConfig;
  setLocalConfig: (config: PortalConfig) => void;
}

export default function AdminColorsTab({ localConfig, setLocalConfig }: AdminColorsTabProps) {
  return (
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
  );
}
