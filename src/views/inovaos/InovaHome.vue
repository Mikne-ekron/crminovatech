<template>
  <v-container class="py-6" style="max-width:1000px">
    <h1 class="text-h5 font-weight-bold mb-1">Hola, {{ primerNombre }}</h1>
    <div class="text-body-2 text-medium-emphasis mb-5">Este es tu panel de pendientes en InovaOS.</div>

    <!-- Semáforo -->
    <div class="text-subtitle-1 font-weight-bold mb-2">Mis pendientes</div>
    <v-row dense class="mb-5">
      <v-col v-for="s in SEMAFORO" :key="s.key" cols="6" sm="4" md="2">
        <v-card border elevation="0" class="rounded-xl text-center pa-3 sem-card" @click="$router.push('/app/inovaos/tareas')">
          <span class="sem-dot" :style="{ background: s.color }"></span>
          <div class="text-h5 font-weight-bold">{{ store.loadingResumen ? '·' : (store.resumen.semaforo[s.key] || 0) }}</div>
          <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Accesos rápidos -->
    <div class="text-subtitle-1 font-weight-bold mb-2">Acciones rápidas</div>
    <div class="d-flex flex-wrap ga-3 mb-6">
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" @click="$router.push('/app/inovaos/crear')">
        <v-icon color="primary" size="28">mdi-plus-circle</v-icon>
        <div class="font-weight-medium mt-1">Nuevo pendiente</div>
      </v-card>
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" @click="$router.push('/app/inovaos/tablero')">
        <v-icon color="primary" size="28">mdi-chart-donut</v-icon>
        <div class="font-weight-medium mt-1">Ver tablero</div>
      </v-card>
      <v-card border elevation="0" class="rounded-xl pa-4 acc-card" @click="$router.push('/app/inovaos/metricas')">
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
          <v-list-item @click="store.abrirDetalle(p.id)">
            <template #prepend>
              <v-avatar size="34" :color="semaforo(p).c" variant="tonal"><v-icon size="18" :color="semaforo(p).c">mdi-calendar-clock</v-icon></v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">{{ p.titulo }}</v-list-item-title>
            <v-list-item-subtitle>{{ p.responsable_nombre || 'Sin responsable' }} · vence {{ fdate(p.fecha_compromiso) }}</v-list-item-subtitle>
            <template #append>
              <v-chip size="small" :color="semaforo(p).c" variant="tonal">{{ semaforo(p).t }}</v-chip>
            </template>
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
import { useInovaosStore } from '@/stores/inovaos';
import { useAuthStore } from '@/stores/auth';
import { SEMAFORO, semaforo, fdate } from '@/views/inovaos/inova-helpers';

const store = useInovaosStore();
const authStore = useAuthStore();
const primerNombre = computed(() => (authStore.user?.name || 'Usuario').split(' ')[0]);

onMounted(() => store.fetchResumen());
</script>

<style scoped>
.sem-card, .acc-card { cursor: pointer; transition: transform .12s ease; }
.sem-card:hover, .acc-card:hover { transform: translateY(-2px); }
.sem-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-bottom: 4px; }
.acc-card { min-width: 150px; text-align: center; }
</style>
