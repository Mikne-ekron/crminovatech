<template>
  <v-container class="py-6" style="max-width:1000px">
    <h1 class="text-h5 font-weight-bold mb-1">Hola, {{ primerNombre }}</h1>
    <div class="text-body-2 text-medium-emphasis mb-5">Tu panel de pendientes en InovaOS.</div>

    <!-- Semáforo -->
    <div class="text-subtitle-1 font-weight-bold mb-2">Mis pendientes</div>
    <v-row dense class="mb-5">
      <v-col v-for="s in SEMAFORO_HOME" :key="s.key" cols="6" sm="4" md="2">
        <v-card border elevation="0" class="rounded-xl pa-3 sem-card" @click="verFiltrados(s.key)">
          <span class="sem-dot" :style="{ background: ST_HEX[s.key] }"></span>
          <div class="text-h4 font-weight-bold">{{ store.loadingResumen ? '·' : (store.resumen.semaforo[s.key] || 0) }}</div>
          <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Accesos rápidos -->
    <div class="text-subtitle-1 font-weight-bold mb-2">Acciones rápidas</div>
    <div class="d-flex flex-wrap ga-3 mb-6">
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" to="/app/inovaos/crear">
        <v-icon color="primary" size="28">mdi-plus-circle</v-icon>
        <div class="font-weight-medium mt-1">Nuevo pendiente</div>
      </v-card>
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" to="/app/inovaos/tablero">
        <v-icon color="primary" size="28">mdi-chart-donut</v-icon>
        <div class="font-weight-medium mt-1">Ver tablero</div>
      </v-card>
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" to="/app/inovaos/metricas">
        <v-icon color="primary" size="28">mdi-chart-bar</v-icon>
        <div class="font-weight-medium mt-1">Métricas</div>
      </v-card>
    </div>

    <!-- Próximos a vencer -->
    <div class="text-subtitle-1 font-weight-bold mb-2">Próximos a vencer</div>
    <div v-if="store.loadingResumen" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
    <v-card v-else border elevation="0" class="rounded-xl">
      <v-list v-if="store.resumen.proximos.length" lines="two" class="py-0">
        <template v-for="(p, i) in store.resumen.proximos" :key="p.id">
          <v-list-item @click="store.abrirDetalle(p.id)" style="cursor:pointer">
            <template #prepend><span class="st-dot" :style="{ background: ST_HEX[estatusColor(p)] }"></span></template>
            <v-list-item-title class="font-weight-medium">{{ p.titulo }}</v-list-item-title>
            <v-list-item-subtitle>{{ p.responsable_nombre || 'Sin asignar' }} · vence {{ formatFecha(p.fecha_compromiso) }}</v-list-item-subtitle>
            <template #append><v-chip size="x-small" variant="tonal">{{ p.prioridad }}</v-chip></template>
          </v-list-item>
          <v-divider v-if="i < store.resumen.proximos.length - 1"></v-divider>
        </template>
      </v-list>
      <div v-else class="text-center text-medium-emphasis py-8">Nada por vencer.</div>
    </v-card>
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

const verFiltrados = (key) => {
  store.setFiltro(MAPA_FILTRO[key] || key);
  router.push('/app/inovaos/pendientes');
};

onMounted(() => store.fetchResumen());
</script>

<style scoped>
.sem-card, .acc-card { cursor: pointer; transition: transform .12s ease; position: relative; }
.sem-card:hover, .acc-card:hover { transform: translateY(-2px); }
.sem-dot { position: absolute; top: 12px; right: 12px; width: 10px; height: 10px; border-radius: 50%; }
.st-dot { display: inline-block; width: 11px; height: 11px; border-radius: 50%; }
.acc-card { min-width: 150px; text-align: center; }
</style>
