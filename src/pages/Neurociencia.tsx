import { useEffect } from 'react';
import NeuroGuiaSection from '../components/landing/NeuroGuiaSection';
import LandingTopBar from '../components/landing/LandingTopBar';

export default function Neurociencia() {
  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  return (
    <div className="landing-page-wrapper animate-fade-in">

      {/* Top Navigation Bar Header */}
      <LandingTopBar slogan="Ecosistema Educativo" showHomeButton />

      {/* Contenido Principal de Neurociencia */}
      <NeuroGuiaSection />

    </div>
  );
}
