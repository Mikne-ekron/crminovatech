<template>
  <v-app>
    <!-- Header Profesional MaterialPro -->
    <VerticalHeaderVue />

    <v-navigation-drawer
      v-if="!smAndDown"
      v-model="drawer"
      location="left"
      :rail="customizer.mini_sidebar"
      rail-width="75"
      expand-on-hover
      width="256"
      elevation="0"
      app
      class="leftSidebar"
    >
      <!-- Navigation Menu -->
      <div class="scrollnavbar">
        <v-list density="compact" nav class="py-3 px-4">
          <template v-for="(item, i) in menuItems" :key="i">
            <!-- Item Simple -->
            <v-list-item
              v-if="!item.children"
              :title="item.title"
              :to="item.path"
              color="primary"
              rounded="lg"
              class="mb-1 font-weight-bold"
            >
              <template v-slot:prepend v-if="item.icon">
                <Icon :icon="`solar:${item.icon}`" class="mr-2" width="20" height="20" />
              </template>
            </v-list-item>

            <!-- Item con Hijos -->
            <v-list-group v-else :value="item.title">
              <template v-slot:activator="{ props }">
                <v-list-item 
                  v-bind="props" 
                  :title="item.title"
                  class="font-weight-bold"
                >
                  <template v-slot:prepend v-if="item.icon">
                    <Icon :icon="`solar:${item.icon}`" class="mr-2" width="20" height="20" />
                  </template>
                </v-list-item>
              </template>

              <v-list-item
                v-for="(child, j) in item.children"
                :key="j"
                :title="child.title"
                :to="child.path"
                class="mb-0" 
                style="padding-left: 16px !important;" 
                color="primary"
                rounded="lg"
                density="compact"
              ></v-list-item>
            </v-list-group>
          </template>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-0 h-100 bg-surface">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Barra flotante estilo app (solo móvil): fija, centrada, glass -->
    <nav v-if="smAndDown" class="floating-nav">
      <button type="button" class="fnav-item" @click="goSearch">
        <v-icon size="22">mdi-magnify</v-icon>
        <span>Buscar</span>
      </button>
      <button type="button" class="fnav-item fnav-home" @click="goHome">
        <v-icon size="24">mdi-home</v-icon>
        <span>Inicio</span>
      </button>
      <button v-if="authStore.canSwitchCompany" type="button" class="fnav-item" @click="empresaSheet = true">
        <v-icon size="22">mdi-domain</v-icon>
        <span>Empresa</span>
      </button>
      <button type="button" class="fnav-item" @click="goProfile">
        <v-icon size="22">mdi-account-circle-outline</v-icon>
        <span>Cuenta</span>
      </button>
    </nav>

    <!-- Panel lateral de notificaciones (lo abre la campanita) -->
    <NotificationsDrawer />

    <!-- Cambiar de empresa (solo si el usuario tiene el permiso) -->
    <v-bottom-sheet v-model="empresaSheet">
      <v-card class="rounded-t-xl">
        <v-list class="py-2">
          <v-list-subheader class="font-weight-bold text-uppercase">Cambiar de empresa</v-list-subheader>
          <v-list-item
            v-for="co in companyStore.companies" :key="co.id"
            :active="companyStore.currentCompany === co.id"
            color="primary"
            @click="pickCompany(co.id)"
          >
            <template #prepend><v-icon>mdi-domain</v-icon></template>
            <v-list-item-title class="font-weight-medium">{{ co.label }}</v-list-item-title>
            <template #append>
              <v-icon v-if="companyStore.currentCompany === co.id" color="primary">mdi-check-circle</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-bottom-sheet>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useCustomizerStore } from '@/stores/customizer';
import { useCompanyStore } from '@/stores/company';
import { useNotificationsStore } from '@/stores/notifications';
import { ensureSubscribed } from '@/utils/push';
import VerticalHeaderVue from './full/vertical-header/VerticalHeader.vue';
import NotificationsDrawer from '@/components/shared/NotificationsDrawer.vue';
import { Icon } from '@iconify/vue';
import axios from '@/utils/axios';
import { useTheme, useDisplay } from 'vuetify';

const authStore = useAuthStore();
const { smAndDown } = useDisplay();
const goHome = () => router.push('/app/dashboard');
const goSearch = () => router.push('/app/dashboard');
const goProfile = () => router.push('/app/perfil');
// Hoja para cambiar de empresa desde la barra inferior (móvil)
const empresaSheet = ref(false);
const pickCompany = (id) => { empresaSheet.value = false; companyStore.setCompany(id); };
// Aplica la preferencia de tema (día/noche) del usuario
const applyThemePref = () => {
  const pref = authStore.user?.themePref;
  if (pref) customizer.actTheme = pref === 'dark' ? 'DARK_BLUE_THEME' : 'BLUE_THEME';
};
const router = useRouter();
const customizer = useCustomizerStore();
const companyStore = useCompanyStore();
const notifStore = useNotificationsStore();
const theme = useTheme();

// Sondeo de notificaciones + resuscripción (solo para ADMIN, que son quienes reciben).
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');
let notifTimer = null;
const onVisible = () => { if (document.visibilityState === 'visible' && isAdmin.value) notifStore.fetch(); };
const startNotifications = () => {
  if (!isAdmin.value) return;
  notifStore.fetch();
  ensureSubscribed(); // reasegura el push si ya hay permiso concedido
  if (notifTimer) clearInterval(notifTimer);
  notifTimer = setInterval(() => { if (document.visibilityState === 'visible') notifStore.fetch(); }, 45000);
  document.addEventListener('visibilitychange', onVisible);
};

// Tema activo: combina empresa actual + modo (light/dark del usuario).
// Si actTheme termina en DARK -> usar variante dark de la empresa, sino light.
const isDarkMode = computed(() =>
    (customizer.actTheme || '').toUpperCase().includes('DARK')
);
const effectiveTheme = computed(() => {
    const c = companyStore.company;
    if (!c) return customizer.actTheme;
    return isDarkMode.value ? c.themeDark : c.themeLight;
});

// Sincronizar el estado del drawer con el store del customizer
const drawer = computed({
  get: () => customizer.Sidebar_drawer,
  set: (val) => customizer.Sidebar_drawer = val
});

// Watch para el cambio de tema (reacciona a actTheme + cambio de empresa)
watch(effectiveTheme, (newTheme) => {
  if (newTheme) theme.global.name.value = newTheme;
}, { immediate: true });

// Cuando el usuario cambia de empresa, recargar para refetch toda la data
// con el nuevo header X-Company. Es la forma más segura de evitar mezclas.
watch(() => companyStore.currentCompany, (newCo, oldCo) => {
  if (oldCo && newCo && oldCo !== newCo) {
    window.location.reload();
  }
});

// Iniciales del usuario para el avatar
const initials = computed(() => {
  const name = authStore.user?.name || 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

const menuItems = ref([]);

// Función para traer el menú dinámico
const fetchMenu = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const response = await axios.get('/admin/my-menu');

    menuItems.value = response.data.map(item => ({
        title: item.Title,
        path: item.Path,
        icon: item.Icon,
        children: (item.children && item.children.length > 0) ? item.children.map(child => ({
            title: child.Title,
            path: child.Path
            // No icon for submenus
        })) : null
    }));

  } catch (error) {
    console.error("Error cargando menú", error);
  }
};

onMounted(async () => {
    // Iniciar siempre con el menú colapsado: rail en desktop, cerrado en móvil.
    customizer.mini_sidebar = true;
    if (smAndDown.value) customizer.Sidebar_drawer = false;

    if (!authStore.isAuthenticated) {
        router.push('/login');
    } else {
        // Restaurar datos del usuario si se perdió el estado de Pinia pero hay token
        if (!authStore.user) {
            await authStore.restoreSession();
        }
        applyThemePref();
        fetchMenu();
        startNotifications();
    }
});

onUnmounted(() => {
  if (notifTimer) clearInterval(notifTimer);
  document.removeEventListener('visibilitychange', onVisible);
});
</script>

<style scoped>
/* Sidebar Styles */
.leftSidebar {
  box-shadow: 0 3px 4px 0 rgba(0, 0, 0, .03), 0 0 1px 0 rgba(0, 0, 0, .1);
}

.profile {
  padding-bottom: 16px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.profile-img {
  text-align: center;
  margin-left: 14px;
}

.profile-name {
  background: rgba(var(--v-theme-primary), 0.1);
  margin-top: -6px;
  height: 35px;
}

/* Centrar avatar cuando está colapsado */
:deep(.v-navigation-drawer--rail) .profile-img {
  margin-left: 0;
}

.scrollnavbar {
  overflow: visible;
}

/* Ocultar scrollbar pero mantener funcionalidad */
.scrollnavbar::-webkit-scrollbar {
  width: 4px;
}

.scrollnavbar::-webkit-scrollbar-track {
  background: transparent;
}

.scrollnavbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.scrollnavbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Fix para mini-sidebar - ocultar texto cuando está contraído */
:deep(.v-navigation-drawer--rail) .v-list-item-title {
  opacity: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  transition: opacity 0.2s;
}

:deep(.v-navigation-drawer--rail) .profile-name {
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  transition: opacity 0.2s, height 0.2s;
}

/* Ocultar dots de submenú cuando está colapsado */
:deep(.v-navigation-drawer--rail) .v-list-group__items .v-list-item__prepend {
  display: none !important;
}

:deep(.v-navigation-drawer--rail) .v-list-group__items {
  opacity: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

/* Mostrar texto en hover */
:deep(.v-navigation-drawer--rail:hover) .v-list-item-title {
  opacity: 1 !important;
  width: auto !important;
}

:deep(.v-navigation-drawer--rail:hover) .profile-name {
  opacity: 1 !important;
  width: auto !important;
  height: auto !important;
}

:deep(.v-navigation-drawer--rail:hover) .v-list-group__items {
  opacity: 1 !important;
  height: auto !important;
}

:deep(.v-navigation-drawer--rail:hover) .v-list-group__items .v-list-item__prepend {
  display: flex !important;
}

.v-main {
  transition: padding-left 0.2s ease;
}

/* Barra flotante estilo app (móvil): fija, centrada, glass */
.floating-nav {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(14px + env(safe-area-inset-bottom));
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 999px;
  background: rgba(var(--v-theme-surface), 0.68);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.24), 0 2px 8px rgba(0, 0, 0, 0.12);
}
.fnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 68px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-size: 11px;
  line-height: 1;
  transition: color 0.15s ease, background 0.15s ease;
}
.fnav-item:active { background: rgba(var(--v-theme-on-surface), 0.06); }
.fnav-home {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}

/* Espacio para que el contenido no quede tapado por la barra flotante */
@media (max-width: 960px) {
  .v-main { padding-bottom: calc(92px + env(safe-area-inset-bottom)) !important; }
}
</style>
