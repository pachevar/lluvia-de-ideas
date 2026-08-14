export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-card card-glass">
        <div className="spinner"></div>
        <p>Cargando experiencia...</p>
      </div>
    </div>
  );
}