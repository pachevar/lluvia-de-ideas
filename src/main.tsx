import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { PortalConfigProvider } from './context/PortalConfigContext'
import { SutzResourcesProvider } from './context/SutzResourcesContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'

import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <PortalConfigProvider>
          <AuthProvider>
            <SutzResourcesProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </SutzResourcesProvider>
          </AuthProvider>
        </PortalConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
