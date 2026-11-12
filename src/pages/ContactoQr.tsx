import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitEcosystemContact } from '../services/ecosystemContactsService';
import { soundEffects } from '../utils/soundEffects';
import './ContactoQr.css';

export default function ContactoQr() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [puesto, setPuesto] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [contacto, setContacto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim() || !puesto.trim() || !institucion.trim() || !contacto.trim()) {
      setErrorMsg('Por favor completa todos los campos para registrar tu contacto.');
      return;
    }

    setSubmitting(true);
    try {
      await submitEcosystemContact({
        nombre,
        puesto,
        institucion,
        contacto,
      });
      soundEffects.playSuccess();
      setSubmitted(true);
      setNombre('');
      setPuesto('');
      setInstitucion('');
      setContacto('');
    } catch (err) {
      console.error('Error al guardar contacto QR:', err);
      setErrorMsg('No se pudo guardar el registro. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cqr-page">
      <div className="cqr-card">
        <div className="cqr-badge">
          <span>🌧️</span>
          <span>Lluvia de Ideas · Registro Rápido</span>
        </div>

        {!submitted ? (
          <>
            <h1 className="cqr-title">Conecta con nuestro Ecosistema</h1>
            <p className="cqr-subtitle">
              Deja tus datos en este formulario corto y nuestro equipo se pondrá en contacto contigo.
            </p>

            <form className="cqr-form" onSubmit={handleSubmit}>
              <div className="cqr-field">
                <label htmlFor="cqr-nombre">Nombre</label>
                <input
                  id="cqr-nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="cqr-field">
                <label htmlFor="cqr-puesto">Puesto</label>
                <input
                  id="cqr-puesto"
                  type="text"
                  placeholder="Ej. Director, Docente, Coordinador"
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                  required
                />
              </div>

              <div className="cqr-field">
                <label htmlFor="cqr-institucion">Institución</label>
                <input
                  id="cqr-institucion"
                  type="text"
                  placeholder="Colegio, escuela o institución"
                  value={institucion}
                  onChange={(e) => setInstitucion(e.target.value)}
                  required
                />
              </div>

              <div className="cqr-field">
                <label htmlFor="cqr-contacto">Contacto</label>
                <input
                  id="cqr-contacto"
                  type="text"
                  placeholder="Teléfono, WhatsApp o correo electrónico"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  required
                />
              </div>

              {errorMsg && <div className="cqr-error">{errorMsg}</div>}

              <button type="submit" className="cqr-submit-btn" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Contacto'}
              </button>
            </form>
          </>
        ) : (
          <div className="cqr-success-box">
            <div className="cqr-success-icon">✅</div>
            <h1 className="cqr-title">¡Gracias por conectar!</h1>
            <p className="cqr-subtitle">
              Tus datos fueron registrados correctamente en el Ecosistema Educativo de Lluvia de Ideas.
            </p>
            <div className="cqr-success-actions">
              <button
                type="button"
                className="cqr-submit-btn"
                onClick={() => navigate('/')}
              >
                Explorar el Portal
              </button>
              <button
                type="button"
                className="cqr-secondary-btn"
                onClick={() => setSubmitted(false)}
              >
                Registrar otro contacto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

