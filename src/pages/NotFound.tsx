import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page animate-fade-in">
      <div className="card-glass not-found-card">
        <span className="not-found-emoji" aria-hidden="true">🌪️</span>
        <h2>¡Te perdiste en la nube!</h2>
        <p>La página que buscas no existe o fue movida.</p>
        <div className="not-found-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🏠 Volver al Inicio
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ⬅ Regresar
          </button>
        </div>
      </div>
    </div>
  );
}