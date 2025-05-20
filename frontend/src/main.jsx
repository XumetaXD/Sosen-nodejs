import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SosenRealtime from './components/SosenRealtime.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SosenRealtime />
  </StrictMode>,
)
