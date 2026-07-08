<template>
  <v-snackbar
    v-model="show"
    :timeout="-1"
    location="bottom"
    multi-line
    color="surface"
    elevation="14"
    class="pwa-install"
  >
    <div class="d-flex align-center ga-4 py-1">
      <img src="/pwa-192.png" alt="Inovatech" width="60" height="60" style="border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,0.25)" />
      <div>
        <div class="font-weight-bold text-h6 mb-1">Instala Inovatech</div>
        <div v-if="isIOS" class="text-body-2 text-medium-emphasis">
          Toca <v-icon size="18" class="mx-1">mdi-export-variant</v-icon><strong>Compartir</strong>
          y luego <strong>“Agregar a inicio”</strong>.
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          Añádela a tu pantalla de inicio para un acceso rápido, como una app.
        </div>
      </div>
    </div>
    <template v-slot:actions>
      <v-btn v-if="canInstall" color="primary" variant="flat" class="mr-1" @click="install">
        Instalar
      </v-btn>
      <v-btn icon="mdi-close" variant="text" @click="dismiss"></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const show = ref(false);
const isIOS = ref(false);
const canInstall = ref(false);
let deferredPrompt = null;

const DISMISS_KEY = 'pwaInstallDismissedAt';
const DISMISS_DAYS = 7; // vuelve a ofrecerse tras 7 días

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const recentlyDismissed = () => {
  const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return at && (Date.now() - at) < DISMISS_DAYS * 864e5;
};

const detectIOS = () => {
  const ua = window.navigator.userAgent.toLowerCase();
  const iOSClassic = /iphone|ipad|ipod/.test(ua);
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSClassic || iPadOS;
};

// Solo en móvil/táctil: en desktop se usa el ícono de instalar nativo del navegador.
const isMobile = () =>
  window.matchMedia('(max-width: 820px)').matches || (navigator.maxTouchPoints || 0) > 0;

onMounted(() => {
  if (isStandalone() || recentlyDismissed() || !isMobile()) return;

  // Android/Chrome: capturamos el evento (o el que se guardó temprano en main.js)
  if (window.__deferredInstallPrompt) {
    deferredPrompt = window.__deferredInstallPrompt;
    canInstall.value = true;
    show.value = true;
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    canInstall.value = true;
    show.value = true;
  });
  window.addEventListener('appinstalled', () => { show.value = false; });

  // iOS Safari no dispara beforeinstallprompt → mostramos instrucciones
  isIOS.value = detectIOS();
  if (isIOS.value) show.value = true;
});

const install = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  canInstall.value = false;
  show.value = false;
};

const dismiss = () => {
  show.value = false;
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
};
</script>
