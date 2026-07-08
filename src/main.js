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

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
