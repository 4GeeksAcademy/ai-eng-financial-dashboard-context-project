import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { track } from '@/services/telemetry'

/* ── Global error handlers (base técnica obligatoria) ──────────────── */

function hashMessage(msg: string): string {
  let h = 0
  for (let i = 0; i < msg.length; i++) {
    h = ((h << 5) - h) + msg.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h).toString(16)
}

if (typeof window !== 'undefined') {
  /* Errores JS no capturados (window.onerror) */
  window.onerror = (_msg, _source, _lineno, _colno, error) => {
    const raw = typeof _msg === 'string' ? _msg : String(_msg ?? '')
    track('frontend_error_caught', {
      page: 'panel', component: 'global',
      error_class: error?.constructor.name ?? 'WindowError',
      error_message_hash: hashMessage(error?.message ?? raw),
    })
  }

  /* Promesas rechazadas no capturadas */
  window.addEventListener('unhandledrejection', (evt) => {
    const detail = (evt as unknown as Record<string, unknown>).reason
    const msg = detail instanceof Error ? detail.message : String(detail ?? '')
    track('frontend_error_caught', {
      page: 'panel', component: 'global',
      error_class: detail instanceof Error ? (detail.constructor as unknown as { name: string }).name : 'Unknown',
      error_message_hash: hashMessage(msg),
    })
  })
}

/* ── Bootstrap ──────────────────────────────────────────────────────── */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
