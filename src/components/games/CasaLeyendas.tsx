import React, { useState } from 'react';

export default function CasaLeyendas() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [riddleAnswer, setRiddleAnswer] = useState('');
  const [riddleFeedback, setRiddleFeedback] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [unlockedRooms, setUnlockedRooms] = useState<string[]>([]);

  const handleRoomRiddleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || riddleAnswer.trim() === '') return;

    const answer = riddleAnswer.trim().toLowerCase();
    let isCorrect = false;

    if (selectedRoom === 'llorona' && (answer.includes('agua') || answer.includes('rio') || answer.includes('río'))) {
      isCorrect = true;
    } else if (selectedRoom === 'sombreron' && (answer.includes('guitarra') || answer.includes('musica') || answer.includes('música'))) {
      isCorrect = true;
    } else if (selectedRoom === 'cadejo' && answer.includes('blanco')) {
      isCorrect = true;
    }

    if (isCorrect) {
      setRiddleFeedback({ type: 'success', text: '¡Excelente! Has descifrado el acertijo y liberado la leyenda. 🗝️' });
      if (!unlockedRooms.includes(selectedRoom)) {
        setUnlockedRooms(prev => [...prev, selectedRoom]);
      }
    } else {
      setRiddleFeedback({ type: 'error', text: 'Respuesta incorrecta. ¡Inténtalo de nuevo o lee la leyenda con más atención!' });
    }
    setRiddleAnswer('');
  };

  return (
    <div className="tab-pane animate-fade-in">
      <section className="game-section">
        <div className="section-intro">
          <span className="badge badge-tertiary">Módulo de Cuentos</span>
          <h2 className="gradient-text">La Casa de las Leyendas</h2>
          <p>Entra a las habitaciones de la mansión colonial, lee las historias y resuelve sus misterios.</p>
        </div>

        <div className="casa-flow-grid">
          <div className="rooms-grid">
            <div 
              className={`room-card card-glass ${selectedRoom === 'llorona' ? 'selected' : ''} ${unlockedRooms.includes('llorona') ? 'unlocked' : ''}`}
              onClick={() => {
                setSelectedRoom('llorona');
                setRiddleFeedback({ type: null, text: '' });
              }}
            >
              <span className="room-icon">👵🌊</span>
              <h4>Cocina de la Llorona</h4>
              <span className="room-status-badge">
                {unlockedRooms.includes('llorona') ? '🔓 Descubierta' : '🔒 Con acertijo'}
              </span>
            </div>

            <div 
              className={`room-card card-glass ${selectedRoom === 'sombreron' ? 'selected' : ''} ${unlockedRooms.includes('sombreron') ? 'unlocked' : ''}`}
              onClick={() => {
                setSelectedRoom('sombreron');
                setRiddleFeedback({ type: null, text: '' });
              }}
            >
              <span className="room-icon">🤠🎸</span>
              <h4>Callejón del Sombrerón</h4>
              <span className="room-status-badge">
                {unlockedRooms.includes('sombreron') ? '🔓 Descubierta' : '🔒 Con acertijo'}
              </span>
            </div>

            <div 
              className={`room-card card-glass ${selectedRoom === 'cadejo' ? 'selected' : ''} ${unlockedRooms.includes('cadejo') ? 'unlocked' : ''}`}
              onClick={() => {
                setSelectedRoom('cadejo');
                setRiddleFeedback({ type: null, text: '' });
              }}
            >
              <span className="room-icon">🐕⚪</span>
              <h4>Corral del Cadejo</h4>
              <span className="room-status-badge">
                {unlockedRooms.includes('cadejo') ? '🔓 Descubierta' : '🔒 Con acertijo'}
              </span>
            </div>
          </div>

          <div className="story-display-panel card-glass">
            {selectedRoom ? (
              <div className="story-content animate-fade-in">
                {selectedRoom === 'llorona' && (
                  <>
                    <div className="story-header">
                      <h3>El Lamento junto al Río</h3>
                      <span className="badge badge-primary">La Llorona</span>
                    </div>
                    <p className="story-text">
                      "Cuenta la leyenda que una mujer vestida de blanco flota sobre las corrientes de agua, suspendida en el aire, buscando desesperadamente los rastros de sus hijos. Sus sollozos erizan la piel de quienes caminan de noche cerca de ríos o fuentes..."
                    </p>
                    <div className="riddle-section">
                      <h4>🔑 Acertijo para liberar la leyenda:</h4>
                      <p className="riddle-prompt">¿Qué elemento líquido de la naturaleza busca siempre la Llorona en sus lamentos?</p>
                    </div>
                  </>
                )}

                {selectedRoom === 'sombreron' && (
                  <>
                    <div className="story-header">
                      <h3>Serenata de Plata</h3>
                      <span className="badge badge-primary">El Sombrerón</span>
                    </div>
                    <p className="story-text">
                      "Un hombre pequeño de gran sombrero de fieltro negro recorre las calles oscuras empujando mulas cargadas de carbón. Cuando ve a una joven de cabello largo y ojos hermosos, saca su guitarra y le canta poemas de amor, dejándola en un trance del que no puede despertar..."
                    </p>
                    <div className="riddle-section">
                      <h4>🔑 Acertijo para liberar la leyenda:</h4>
                      <p className="riddle-prompt">¿Qué instrumento de madera y cuerdas lleva siempre consigo el Sombrerón para cantar?</p>
                    </div>
                  </>
                )}

                {selectedRoom === 'cadejo' && (
                  <>
                    <div className="story-header">
                      <h3>El Guardián del Silencio</h3>
                      <span className="badge badge-primary">El Cadejo</span>
                    </div>
                    <p className="story-text">
                      "El Cadejo es un perro de pelaje espeso y ojos como brasas encendidas. El Cadejo blanco acompaña amigablemente al caminante honesto y lo defiende de los peligros; en cambio, el negro busca perturbar y asustar a los perdidos..."
                    </p>
                    <div className="riddle-section">
                      <h4>🔑 Acertijo para liberar la leyenda:</h4>
                      <p className="riddle-prompt">¿De qué color es el pelaje del Cadejo bondadoso que protege a los caminantes de noche?</p>
                    </div>
                  </>
                )}

                {unlockedRooms.includes(selectedRoom) ? (
                  <div className="unlocked-badge-big animate-bounce">
                    🔓 ¡Leyenda Liberada con éxito! Has aprendido sobre este cuento popular.
                  </div>
                ) : (
                  <form onSubmit={handleRoomRiddleSubmit} className="riddle-form">
                    <input 
                      type="text"
                      value={riddleAnswer}
                      onChange={(e) => setRiddleAnswer(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      className="answer-input"
                    />
                    <button type="submit" className="btn btn-primary">
                      Descifrar Llave
                    </button>
                  </form>
                )}

                {riddleFeedback.type && (
                  <div className={`feedback-banner ${riddleFeedback.type} animate-fade-in`}>
                    {riddleFeedback.text}
                  </div>
                )}
              </div>
            ) : (
              <div className="story-display-placeholder">
                <span>📖</span>
                <h3>El Libro Abierto de la Mansión</h3>
                <p>Selecciona una habitación de la izquierda para abrir el libro de relatos.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
