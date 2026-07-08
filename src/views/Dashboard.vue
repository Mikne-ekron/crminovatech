<template>
  <v-container class="py-6 py-md-10" style="max-width:1080px">
    <!-- Saludo -->
    <div class="mb-6">
      <h1 class="text-h5 text-md-h4 font-weight-bold">{{ saludo }}, {{ nombre }}</h1>
      <p class="text-h6 text-medium-emphasis mt-1 font-weight-regular">¿Qué vamos a hacer hoy?</p>
    </div>

    <!-- Búsqueda global (enterprise) -->
    <v-text-field
      v-model="query"
      @update:model-value="onSearch"
      @keyup.enter="doSearch"
      placeholder="Busca lo que sea: montos, fechas, clientes, conceptos, folios, usuarios…"
      prepend-inner-icon="mdi-magnify"
      variant="solo"
      rounded="lg"
      density="comfortable"
      hide-details
      clearable
      :loading="searching"
      class="search-box"
      @click:clear="clearSearch"
    ></v-text-field>

    <!-- Resultados -->
    <v-expand-transition>
      <v-card v-if="query && query.length >= 2" elevation="2" class="rounded-lg mt-2 results-card">
        <div v-if="searching && !groups.length" class="pa-6 text-center text-medium-emphasis">
          <v-progress-circular indeterminate size="24" color="primary" class="mr-2" /> Buscando…
        </div>
        <div v-else-if="!groups.length" class="pa-6 text-center text-medium-emphasis">
          Sin resultados para “{{ query }}”.
        </div>
        <v-list v-else class="py-0">
          <template v-for="(g, gi) in groups" :key="g.module">
            <v-list-subheader class="font-weight-bold">
              <v-icon :color="g.color" size="18" class="mr-2">{{ g.icon }}</v-icon>{{ g.module }}
            </v-list-subheader>
            <v-list-item v-for="(it, i) in g.items" :key="i" @click="go(it.to)" class="px-4">
              <v-list-item-title class="font-weight-medium">{{ it.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ it.subtitle }}</v-list-item-subtitle>
              <template v-slot:append><v-icon size="18" class="text-medium-emphasis">mdi-arrow-top-right</v-icon></template>
            </v-list-item>
            <v-divider v-if="gi < groups.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-expand-transition>

    <!-- Accesos por módulo -->
    <h2 class="text-subtitle-1 font-weight-bold mt-10 mb-3 text-medium-emphasis text-uppercase" style="letter-spacing:.5px">Accesos rápidos</h2>

    <div v-for="g in gruposAccesos" :key="g.module" class="mb-5">
      <div class="d-flex align-center mb-2">
        <v-avatar color="primary" variant="tonal" size="26" class="mr-2"><Icon :icon="`solar:${g.icon}`" width="15" height="15" /></v-avatar>
        <span class="text-subtitle-2 font-weight-bold">{{ g.module }}</span>
      </div>
      <v-row dense>
        <v-col v-for="acc in g.items" :key="acc.path" cols="6" sm="4" md="3">
          <v-card @click="go(acc.path)" elevation="0" class="rounded-lg acceso-card h-100">
            <v-card-text class="d-flex align-center ga-3 py-4">
              <v-avatar color="primary" variant="tonal" size="42">
                <Icon :icon="`solar:${acc.icon}`" width="22" height="22" />
              </v-avatar>
              <div class="font-weight-medium text-body-1">{{ acc.title }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-if="!gruposAccesos.length" class="text-center text-medium-emphasis py-6">No tienes accesos asignados.</div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';
import axios from '@/utils/axios';

const router = useRouter();
const authStore = useAuthStore();

const nombre = computed(() => {
  const u = authStore.user || {};
  const full = u.name || u.FullName || u.fullName || u.email || 'Usuario';
  return String(full).split(' ')[0]; // primer nombre
});
const saludo = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
});

// --- Búsqueda global ---
const query = ref('');
const searching = ref(false);
const groups = ref([]);
let debounce;
const onSearch = () => {
  clearTimeout(debounce);
  const q = (query.value || '').trim();
  if (q.length < 2) { groups.value = []; return; }
  debounce = setTimeout(doSearch, 300);
};
const doSearch = async () => {
  const q = (query.value || '').trim();
  if (q.length < 2) return;
  searching.value = true;
  try {
    const r = await axios.get('/search/global', { params: { q } });
    groups.value = r.data.groups || [];
  } catch (e) { groups.value = []; }
  finally { searching.value = false; }
};
const clearSearch = () => { query.value = ''; groups.value = []; };

const go = (path) => { if (path) router.push(path); };

// --- Accesos agrupados por módulo (menú del usuario, filtrado por permisos) ---
const gruposAccesos = ref([]);
const fetchMenu = async () => {
  try {
    const r = await axios.get('/admin/my-menu');
    const grupos = [];
    const generales = [];
    (r.data || []).forEach(item => {
      const icon = item.Icon || 'widget-outline';
      if (item.children && item.children.length) {
        const items = item.children.filter(ch => ch.Path).map(ch => ({ title: ch.Title, path: ch.Path, icon }));
        if (item.Path) items.unshift({ title: item.Title, path: item.Path, icon });
        if (items.length) grupos.push({ module: item.Title, icon, items });
      } else if (item.Path) {
        generales.push({ title: item.Title, path: item.Path, icon });
      }
    });
    if (generales.length) grupos.push({ module: 'General', icon: 'widget-outline', items: generales });
    gruposAccesos.value = grupos;
  } catch (e) { gruposAccesos.value = []; }
};

onMounted(() => {
  if (!authStore.user) authStore.restoreSession();
  fetchMenu();
});
</script>

<style scoped>
.search-box :deep(.v-field) { box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08); }
.results-card { max-height: 60vh; overflow-y: auto; }
.acceso-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.acceso-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(var(--v-theme-primary), 0.18);
  border-color: rgba(var(--v-theme-primary), 0.4);
}
</style>
