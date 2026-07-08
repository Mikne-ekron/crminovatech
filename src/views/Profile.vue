<template>
  <v-container class="py-6" style="max-width:760px">
    <h1 class="text-h5 font-weight-bold mb-4">Mi perfil</h1>

    <!-- Datos + avatar -->
    <v-card elevation="0" class="rounded-xl mb-4" border>
      <v-card-text class="d-flex flex-column flex-sm-row align-center ga-5 pa-5">
        <div class="position-relative">
          <v-avatar size="112" color="primary">
            <v-img v-if="avatar" :src="avatar" cover />
            <span v-else class="text-h4 text-white">{{ initials }}</span>
          </v-avatar>
          <v-btn icon size="small" color="primary" class="avatar-edit" @click="pickImage">
            <v-icon size="18">mdi-camera</v-icon>
          </v-btn>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
        </div>
        <div class="text-center text-sm-left">
          <div class="text-h6 font-weight-bold">{{ user.name || 'Usuario' }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ user.email }}</div>
          <v-chip size="small" color="primary" variant="tonal" class="mt-2 font-weight-bold">
            <v-icon start size="16">mdi-shield-account</v-icon>{{ user.role || 'Personal' }}
          </v-chip>
          <div v-if="avatar" class="mt-2">
            <v-btn size="x-small" variant="text" color="error" :loading="removing" @click="removeAvatar">Quitar foto</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Apariencia -->
    <v-card elevation="0" class="rounded-xl mb-4" border>
      <v-card-title class="text-subtitle-1 font-weight-bold pt-4">Apariencia</v-card-title>
      <v-card-text>
        <div class="text-body-2 text-medium-emphasis mb-3">Elige cómo quieres ver la app.</div>
        <div class="d-flex ga-3">
          <v-card
            v-for="opt in temas" :key="opt.val"
            @click="setTheme(opt.val)"
            :color="theme === opt.val ? 'primary' : undefined"
            :variant="theme === opt.val ? 'flat' : 'outlined'"
            class="rounded-lg flex-grow-1 theme-opt"
          >
            <v-card-text class="text-center py-4">
              <v-icon size="30" class="mb-1">{{ opt.icon }}</v-icon>
              <div class="font-weight-medium">{{ opt.label }}</div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Empresa (si tiene permiso) -->
    <v-card v-if="user.canSwitchCompany" elevation="0" class="rounded-xl mb-4" border>
      <v-card-title class="text-subtitle-1 font-weight-bold pt-4">Empresa</v-card-title>
      <v-card-text>
        <v-select
          :model-value="companyStore.currentCompany" @update:model-value="switchCompany"
          :items="companyStore.companies" item-title="label" item-value="id"
          variant="outlined" density="comfortable" prepend-inner-icon="mdi-domain" hide-details
        ></v-select>
      </v-card-text>
    </v-card>

    <!-- Aplicación -->
    <v-card elevation="0" class="rounded-xl mb-4" border>
      <v-card-title class="text-subtitle-1 font-weight-bold pt-4">Aplicación</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <div class="font-weight-medium">Buscar actualizaciones</div>
            <div class="text-body-2 text-medium-emphasis">Si no ves los últimos cambios, actualiza para traer la versión más reciente.</div>
          </div>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-update" :loading="updating" @click="updateApp">
            Actualizar app
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Cerrar sesión -->
    <v-btn block color="error" variant="tonal" size="large" prepend-icon="mdi-logout" @click="logout">
      Cerrar sesión
    </v-btn>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCustomizerStore } from '@/stores/customizer';
import { useCompanyStore } from '@/stores/company';

const router = useRouter();
const authStore = useAuthStore();
const customizer = useCustomizerStore();
const companyStore = useCompanyStore();

const user = computed(() => authStore.user || {});
const avatar = ref(authStore.user?.avatar || null);
const removing = ref(false);
const fileInput = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const initials = computed(() => {
  const n = user.value.name || 'U';
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
});

// --- Avatar ---
const pickImage = () => fileInput.value?.click();
const resizeToDataUrl = (file, size = 256) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
const onFile = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await resizeToDataUrl(file, 256);
    await authStore.saveProfile({ avatar: dataUrl });
    avatar.value = dataUrl;
    notify('Foto de perfil actualizada');
  } catch (err) { notify('No se pudo procesar la imagen', 'error'); }
  e.target.value = '';
};
const removeAvatar = async () => {
  removing.value = true;
  try { await authStore.saveProfile({ avatar: '' }); avatar.value = null; notify('Foto eliminada'); }
  catch { notify('Error al quitar la foto', 'error'); }
  finally { removing.value = false; }
};

// --- Tema día / noche ---
const temas = [
  { val: 'light', label: 'Día', icon: 'mdi-white-balance-sunny' },
  { val: 'dark', label: 'Noche', icon: 'mdi-weather-night' },
];
const theme = ref((customizer.actTheme || '').toUpperCase().includes('DARK') ? 'dark' : 'light');
const setTheme = async (val) => {
  theme.value = val;
  customizer.actTheme = val === 'dark' ? 'DARK_BLUE_THEME' : 'BLUE_THEME';
  try { await authStore.saveProfile({ themePref: val }); } catch { /* preferencia local aplicada igual */ }
};

// --- Empresa / sesión ---
const switchCompany = (id) => companyStore.setCompany(id); // dispara recarga en MainLayout
const logout = () => { authStore.logout(); router.push('/login'); };

// --- Actualizar la webapp (fuerza la última versión aunque el SW esté "pegado") ---
const updating = ref(false);
const updateApp = async () => {
  updating.value = true;
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(async (r) => {
        try { await r.update(); } catch (_) { /* noop */ }
        if (r.waiting) r.waiting.postMessage({ type: 'SKIP_WAITING' });
      }));
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (e) { /* ignore */ }
  // Recarga forzada para tomar la versión nueva
  window.location.reload();
};
</script>

<style scoped>
.avatar-edit {
  position: absolute;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgb(var(--v-theme-surface));
}
.theme-opt { cursor: pointer; transition: transform 0.15s ease; }
.theme-opt:hover { transform: translateY(-2px); }
</style>
