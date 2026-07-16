<template>
  <v-container class="py-6" style="max-width:1040px">
    <!-- Hero -->
    <div class="iv-hero mb-6 d-flex align-center justify-space-between flex-wrap ga-4">
      <div>
        <div class="text-h5 font-weight-bold">Hola, {{ primerNombre }}</div>
        <div class="iv-hero-sub text-body-2 mt-1">
          {{ store.loadingResumen ? 'Cargando tu panel…' : (activos ? `Tienes ${activos} pendiente${activos === 1 ? '' : 's'} activo${activos === 1 ? '' : 's'}.` : 'Todo bajo control por ahora.') }}
        </div>
      </div>
      <v-btn class="iv-btn-white" size="large" rounded="xl" prepend-icon="mdi-plus" to="/app/inovaos/crear" elevation="0">
        Nuevo pendiente
      </v-btn>
    </div>

    <!-- Semáforo -->
    <div class="iv-section">Mis pendientes</div>
    <v-row dense class="mb-6">
      <v-col v-for="s in SEMAFORO_HOME" :key="s.key" cols="6" sm="4" md="2">
        <div class="iv-sem" :style="{ background: tint(s.key) }" @click="verFiltrados(s.key)">
          <span class="iv-sem-dot" :style="{ background: ST_HEX[s.key] }"></span>
          <div class="iv-sem-num" :style="{ color: ST_HEX[s.key] }">{{ store.loadingResumen ? '·' : (store.resumen.semaforo[s.key] || 0) }}</div>
          <div class="iv-sem-label">{{ s.label }}</div>
        </div>
      </v-col>
    </v-row>

    <!-- Accesos rápidos -->
    <div class="iv-section">Accesos rápidos</div>
    <v-row dense class="mb-6">
      <v-col v-for="a in accesos" :key="a.to" cols="12" sm="4">
        <div class="iv-card iv-clickable iv-action" @click="$router.push(a.to)">
          <div class="iv-action-ico"><v-icon size="22">{{ a.icon }}</v-icon></div>
          <div>
            <div class="font-weight-bold">{{ a.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ a.sub }}</div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Próximos a vencer -->
    <div class="iv-section">Próximos a vencer</div>
    <div v-if="store.loadingResumen" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else class="iv-card">
      <v-list v-if="store.resumen.proximos.length" lines="two" class="py-1 bg-transparent">
        <template v-for="(p, i) in store.resumen.proximos" :key="p.id">
          <v-list-item class="iv-row" @click="store.abrirDetalle(p.id)">
            <template #prepend><span class="iv-dot me-3" :style="{ background: ST_HEX[estatusColor(p)] }"></span></template>
            <v-list-item-title class="font-weight-medium">{{ p.titulo }}</v-list-item-title>
            <v-list-item-subtitle>{{ p.responsable_nombre || 'Sin asignar' }} · vence {{ formatFecha(p.fecha_compromiso) }}</v-list-item-subtitle>
            <template #append><v-chip size="x-small" variant="tonal">{{ p.prioridad }}</v-chip></template>
          </v-list-item>
          <v-divider v-if="i < store.resumen.proximos.length - 1" class="mx-3"></v-divider>
        </template>
      </v-list>
      <div v-else class="text-center text-medium-emphasis py-10">
        <v-icon size="34" class="mb-2" color="success">mdi-check-circle-outline</v-icon>
        <div>Nada por vencer.</div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInovaosStore } from '@/stores/inovaos';
import { useAuthStore } from '@/stores/auth';
import { SEMAFORO_HOME, ST_HEX, MAPA_FILTRO, estatusColor, formatFecha } from '@/views/inovaos/inova-helpers';

const store = useInovaosStore();
const authStore = useAuthStore();
const router = useRouter();
const primerNombre = computed(() => (authStore.user?.name || 'Usuario').split(' ')[0]);

const activos = computed(() => ['vencido', 'hoy', 'manana', 'tiempo', 'espera'].reduce((a, k) => a + (store.resumen.semaforo[k] || 0), 0));
const tint = (key) => ST_HEX[key] + '16';

const accesos = [
  { to: '/app/inovaos/pendientes', icon: 'mdi-clipboard-list-outline', title: 'Pendientes', sub: 'Ver y filtrar' },
  { to: '/app/inovaos/tablero', icon: 'mdi-chart-donut', title: 'Tablero', sub: 'Semáforo' },
  { to: '/app/inovaos/metricas', icon: 'mdi-chart-bar', title: 'Métricas', sub: 'Desempeño' },
];

const verFiltrados = (key) => { store.setFiltro(MAPA_FILTRO[key] || key); router.push('/app/inovaos/pendientes'); };

onMounted(() => store.fetchResumen());
</script>
