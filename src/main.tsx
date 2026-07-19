import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { PortalConfigProvider } from './context/PortalConfigContext'
import { CartProvider } from './context/CartContext'

import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <PortalConfigProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PortalConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
