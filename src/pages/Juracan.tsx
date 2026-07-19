import { useState } from 'react';

export default function Juracan() {
  const [windStrength, setWindStrength] = useState<number>(10);

  const getWindStatus = (strength: number) => {
    if (strength <= 20) return { title: "Brisa de la Selva 🍃", desc: "El viento acaricia las hojas de ceiba. Juracán duerme plácidamente." };
    if (strength <= 50) return { title: "Viento Cruzado 💨", desc: "El dios sopla con fuerza. El silbido de Juracán resuena en los barrancos." };
    if (strength <= 80) return { title: "Tormenta Maya 🌧️⚡", desc: "Rayos y truenos azotan la tierra. La tormenta de Juracán ruge con poder." };
    return { title: "Huracán Ancestral 🌀🌪️", desc: "Fuerza destructiva total. El dios desata toda su energía cósmica sobre el portal." };
  };

  return (
    <div className="tab-pane animate-fade-in">
      <section className="game-section">
        <div className="section-intro">
          <span className="badge badge-tertiary">Cosmología Maya</span>
          <h2 className="gradient-text">El Universo de Juracán</h2>
          <p>Explora el mito de la deidad del viento, el corazón del cielo, y experimenta su poder climático.</p>
        </div>

        <div className="juracan-card card-glass">
          <div className="juracan-header">
            <div className="juracan-brand">
              <span className="juracan-icon">🌪️</span>
              <h3>Simulador de Viento Sagrado</h3>
            </div>
            <span className="badge badge-primary">Regulador de Fuerza</span>
          </div>

          <div className="wind-simulator-box">
            <div className="wind-graphics">
              <div className={`wind-lines speed-${Math.ceil(windStrength / 25)}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className={`deity-avatar status-${Math.ceil(windStrength / 25)}`}>
                {windStrength <= 20 ? '🫁' : windStrength <= 50 ? '🌬️' : windStrength <= 80 ? '⛈️' : '🌀'}
              </span>
            </div>
            
            <div className="simulator-results">
              <h4>{getWindStatus(windStrength).title}</h4>
              <p>{getWindStatus(windStrength).desc}</p>
            </div>
          </div>

          <div className="slider-control-group">
            <label>Fuerza del soplido de Juracán: {windStrength}%</label>
            <input 
              type="range"
              min="0"
              max="100"
              value={windStrength}
              onChange={(e) => setWindStrength(parseInt(e.target.value))}
              className="wind-slider"
            />
            <div className="slider-labels">
              <span>Calma</span>
              <span>Brisa</span>
              <span>Tormenta</span>
              <span>Huracán</span>
            </div>
          </div>

          <div className="juracan-myth-box">
            <h4>📜 El Mito del Huracán</h4>
            <p>
              En el Popol Vuh, **Juracán** (U K'ux Kaj, el Corazón del Cielo) es el dios del viento, la tormenta y el fuego, uno de los creadores del universo. Su aliento dio forma a la tierra emergida de las aguas y desató la gran inundación primordial para moldear a los hombres de maíz. La palabra moderna "huracán" proviene directamente de su nombre sagrado.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
