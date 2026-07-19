import { useState } from 'react';
import type { PortalConfig } from '../../types';

interface AdminTabInicioProps {
  localConfig: PortalConfig;
  updateField: (section: string, field: string, value: any) => void;
  updateStory: (index: number, field: string, value: string) => void;
}

export default function AdminTabInicio({ localConfig, updateField, updateStory }: AdminTabInicioProps) {
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);

  return (
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
  );
}
