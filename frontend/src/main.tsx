import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initTelegram } from './lib/telegram'

try {
  initTelegram()
} catch (err) {
  // Never let a Telegram SDK quirk take down the whole app — worst case we
  // just run in "not in Telegram" mode instead of a blank white screen.
  console.error('initTelegram failed', err)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
