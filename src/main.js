/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'
import '@/scss/style.scss'
import '@/assets/styles/dark-theme.css'

// Captura temprana del evento de instalación (Android/Chrome), antes de montar,
// para no perderlo si dispara antes de que el componente exista.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__deferredInstallPrompt = e
})

// Bloquear el zoom con dos dedos (pinch) y doble toque. En Safari el meta
// user-scalable=no se ignora, así que lo reforzamos por eventos de gesto.
;['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => {
  document.addEventListener(ev, (e) => e.preventDefault(), { passive: false })
})
// Evita el zoom por doble toque rápido.
let __lastTouchEnd = 0
document.addEventListener('touchend', (e) => {
  const now = Date.now()
  if (now - __lastTouchEnd <= 300) e.preventDefault()
  __lastTouchEnd = now
}, { passive: false })
// Evita el zoom por pellizco con dos dedos (touchmove multitáctil).
document.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length > 1) e.preventDefault()
}, { passive: false })

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
