import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingTopBar from '../components/landing/LandingTopBar';
import { soundEffects } from '../utils/soundEffects';
import './CreatikaHub.css';

interface CreatikaApp {
  id: string;
  title: string;
  badge: string;
  desc: string;
  icon: string;
  path: string;
  accentColor: string;
  gradient: string;
  tag: string;
}

const CREATIKA_APPS: CreatikaApp[] = [
  {
    id: 'maquina-de-cuentos',
    title: 'Máquina de Cuentos',
    badge: 'Generador Narrativo',
    tag: 'ESCRITURA CREATIVA',
    desc: 'Activa los carretes mágicos para combinar personajes, entornos, conflictos y atmósferas fantásticas.',
    icon: '🎰',
    path: '/creatika/maquina-de-cuentos',
    accentColor: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.05) 100%)'
  },
  {
    id: 'teoria-del-color',
    title: 'Teoría del Color',
    badge: 'Laboratorio Cromático',
    tag: 'ARTE VISUAL',
    desc: 'Explora la rueda cromática interactiva, mezclas RGB/CMYK, armonías complementarias y contraste visual.',
    icon: '🎨',
    path: '/creatika/teoria-del-color',
    accentColor: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(190,24,93,0.05) 100%)'
  },
  {
    id: 'construyendo-personaje',
    title: 'Construyendo el Personaje',
    badge: 'Diseño de Arquetipos',
    tag: 'NARRATIVA & PSICOLOGÍA',
    desc: 'Crea fichas completas de personajes con virtudes, defectos, motivaciones secretas y arcos de transformación.',
    icon: '🎭',
    path: '/creatika/construyendo-el-personaje',
    accentColor: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(126,34,206,0.05) 100%)'
  },
  {
    id: 'codigo-docente',
    title: 'Código Docente',
    badge: 'Competencias Pedagógicas',
    tag: 'MANIFIESTO EDUCADOR',
    desc: 'Marco interactivo de competencias, ética profesional e innovación metodológica para el maestro contemporáneo.',
    icon: '📜',
    path: '/creatika/codigo-docente',
    accentColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(2,132,199,0.05) 100%)'
  },
  {
    id: 'codigo-estudiante',
    title: 'Código del Estudiante',
    badge: 'Valores & Autonomía',
    tag: 'DESARROLLO INTEGRAL',
    desc: 'Guía de principios, pensamiento reflexivo, responsabilidad y curiosidad para estudiantes transformadores.',
    icon: '🎓',
    path: '/creatika/codigo-estudiante',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.05) 100%)'
  }
];

export default function CreatikaHub() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  const handleOpenApp = (path: string) => {
    soundEffects.playClick();
    navigate(path);
  };

  return (
    <div className="creatika-hub-wrapper animate-fade-in">
      <LandingTopBar slogan="Suite Creatika · Expresión, Arte y Pedagogía" showHomeButton />

      <main className="creatika-hub-content">
        {/* Header Hero */}
        <header className="creatika-hub-header">
          <div className="creatika-badge-hud">✨ SUITE CREATIKA · EDITORIAL LLUVIA DE IDEAS</div>
          <h1 className="creatika-main-title">
            Laboratorio de <span className="creatika-title-gradient">Creatividad & Arte</span>
          </h1>
          <p className="creatika-subtitle">
            Herramientas interactivas diseñadas para estimular la imaginación, la composición visual, la escritura creativa y el desarrollo del pensamiento crítico.
          </p>
        </header>

        {/* Grid de Aplicaciones */}
        <div className="creatika-cards-grid">
          {CREATIKA_APPS.map((app) => (
            <div
              key={app.id}
              className="creatika-card card-glass"
              style={{
                borderColor: `${app.accentColor}55`,
                background: app.gradient
              }}
              onMouseEnter={() => soundEffects.playHover()}
              onClick={() => handleOpenApp(app.path)}
            >
              <div className="creatika-card-top">
                <div
                  className="creatika-icon-box"
                  style={{
                    background: `radial-gradient(circle, ${app.accentColor}33 0%, rgba(0,0,0,0.4) 100%)`,
                    borderColor: `${app.accentColor}88`
                  }}
                >
                  <span className="creatika-icon">{app.icon}</span>
                </div>
                <div className="creatika-meta">
                  <span className="creatika-tag" style={{ color: app.accentColor }}>{app.tag}</span>
                  <span className="creatika-badge">{app.badge}</span>
                </div>
              </div>

              <div className="creatika-card-body">
                <h3 className="creatika-card-title">{app.title}</h3>
                <p className="creatika-card-desc">{app.desc}</p>
              </div>

              <div className="creatika-card-footer">
                <button
                  className="creatika-action-btn"
                  style={{
                    background: `linear-gradient(90deg, ${app.accentColor}, #0284c7)`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenApp(app.path);
                  }}
                >
                  <span>Entrar a la Herramienta</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
