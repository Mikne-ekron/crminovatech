<template>
  <v-navigation-drawer
    v-model="store.drawer"
    location="right"
    temporary
    touchless
    width="380"
    class="notif-drawer"
    @update:model-value="onToggle"
  >
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between px-4 py-3 notif-head">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-bell-outline</v-icon>
        <span class="text-subtitle-1 font-weight-bold">Notificaciones</span>
      </div>
      <div class="d-flex align-center ga-1">
        <v-btn v-if="store.items.length" size="small" variant="text" @click="store.markAllRead()">
          Marcar leídas
        </v-btn>
        <v-btn icon="mdi-close" size="small" variant="text" @click="store.drawer = false"></v-btn>
      </div>
    </div>
    <v-divider></v-divider>

    <!-- Captura de aprobación para push -->
    <div v-if="showEnable" class="pa-3">
      <v-alert
        v-if="mustInstall"
        type="info" variant="tonal" density="comfortable" class="rounded-lg text-body-2"
      >
        Para recibir avisos push en tu iPhone, primero <strong>instala la app</strong>
        (Compartir → Agregar a inicio) y ábrela desde el ícono.
      </v-alert>
      <v-alert
        v-else-if="permission === 'denied'"
        type="warning" variant="tonal" density="comfortable" class="rounded-lg text-body-2"
      >
        Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador para este sitio.
      </v-alert>
      <v-card v-else elevation="0" border class="rounded-lg pa-3 d-flex align-center ga-3">
        <v-icon color="primary" size="30">mdi-bell-ring-outline</v-icon>
        <div class="flex-grow-1">
          <div class="font-weight-medium">Activa las notificaciones</div>
          <div class="text-caption text-medium-emphasis">Recibe cada movimiento al instante.</div>
        </div>
        <v-btn color="primary" size="small" :loading="enabling" @click="activar">Activar</v-btn>
      </v-card>
    </div>

    <!-- Lista -->
    <div v-if="!store.items.length" class="text-center text-medium-emphasis py-10 px-4">
      <v-icon size="40" class="mb-2">mdi-bell-sleep-outline</v-icon>
      <div>Sin notificaciones</div>
    </div>

    <v-list v-else class="py-0" lines="two">
      <template v-for="(n, i) in store.items" :key="n.NotifID">
        <v-list-item
          :class="{ 'notif-unread': !n.IsRead }"
          @click="open(n)"
        >
          <template #prepend>
            <v-avatar :color="meta(n.Type).color" variant="tonal" size="40">
              <v-icon :color="meta(n.Type).color">{{ meta(n.Type).icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2">{{ n.Title }}</v-list-item-title>
          <v-list-item-subtitle class="text-body-2">{{ n.Body }}</v-list-item-subtitle>
          <template #append>
            <div class="d-flex flex-column align-end ga-1">
              <span class="text-caption text-medium-emphasis">{{ rel(n.CreatedAt) }}</span>
              <v-icon v-if="!n.IsRead" size="10" color="primary">mdi-circle</v-icon>
            </div>
          </template>
        </v-list-item>
        <v-divider v-if="i < store.items.length - 1"></v-divider>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationsStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { enablePush, getPermission, needsInstallForPush, pushSupported } from '@/utils/push';

const store = useNotificationsStore();
const authStore = useAuthStore();
const router = useRouter();

const permission = ref(getPermission());
const mustInstall = ref(needsInstallForPush());
const enabling = ref(false);
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const showEnable = computed(() => isAdmin.value && pushSupported() && permission.value !== 'granted');

const activar = async () => {
  enabling.value = true;
  try {
    await enablePush();
    permission.value = 'granted';
  } catch (e) {
    permission.value = getPermission();
    mustInstall.value = needsInstallForPush();
  } finally {
    enabling.value = false;
  }
};

const META = {
  INGRESO: { icon: 'mdi-arrow-down-bold-circle', color: 'success' },
  EGRESO: { icon: 'mdi-arrow-up-bold-circle', color: 'error' },
  TRASPASO: { icon: 'mdi-swap-horizontal-bold', color: 'info' },
  CONTEO: { icon: 'mdi-calculator-variant-outline', color: 'warning' },
  CONCILIACION: { icon: 'mdi-link-variant', color: 'primary' },
};
const meta = (type) => META[type] || { icon: 'mdi-bell-outline', color: 'primary' };

const rel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'ahora';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 604800) return `hace ${Math.floor(s / 86400)} d`;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const open = (n) => {
  store.drawer = false;
  if (n.Url) router.push(n.Url);
};

// Registra cuándo se cerró (para que la campana funcione como toggle sin reabrir
// por el cierre del scrim en el mismo toque).
const onToggle = (val) => { if (!val) store.markClosed(); };
</script>

<style scoped>
.notif-head { position: sticky; top: 0; z-index: 1; background: rgb(var(--v-theme-surface)); }
.notif-unread { background: rgba(var(--v-theme-primary), 0.06); }
.notif-drawer :deep(.v-list-item) { cursor: pointer; }
</style>
