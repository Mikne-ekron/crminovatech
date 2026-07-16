<template>
  <v-container class="py-6" style="max-width:760px">
    <h1 class="text-h5 font-weight-bold mb-1 d-flex align-center ga-2">
      <v-icon color="primary">mdi-chart-donut</v-icon> Tablero
    </h1>
    <div class="text-body-2 text-medium-emphasis mb-5">Distribución de tus pendientes por estado de vencimiento.</div>

    <div v-if="store.loadingResumen" class="text-center py-16"><v-progress-circular indeterminate color="primary" /></div>

    <template v-else>
      <v-row align="center">
        <v-col cols="12" sm="5" class="text-center">
          <svg viewBox="0 0 42 42" class="dona">
            <circle class="dona-bg" cx="21" cy="21" r="15.915" fill="transparent" stroke-width="4" />
            <circle
              v-for="(seg, i) in segmentos" :key="i"
              cx="21" cy="21" r="15.915" fill="transparent" stroke-width="4"
              :stroke="seg.color" :stroke-dasharray="`${seg.pct} ${100 - seg.pct}`" :stroke-dashoffset="seg.offset"
              stroke-linecap="round"
            />
            <text x="21" y="20" text-anchor="middle" class="dona-total">{{ total }}</text>
            <text x="21" y="26.5" text-anchor="middle" class="dona-sub">pendientes</text>
          </svg>
        </v-col>
        <v-col cols="12" sm="7">
          <v-card border elevation="0" class="rounded-xl">
            <v-list class="py-1">
              <v-list-item v-for="s in SEMAFORO_TABLERO" :key="s.key">
                <template #prepend><span class="sem-dot" :style="{ background: ST_HEX[s.key] }"></span></template>
                <v-list-item-title class="text-body-2">{{ s.label }}</v-list-item-title>
                <template #append><span class="font-weight-bold">{{ store.resumen.semaforo[s.key] || 0 }}</span></template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="!total" class="text-center text-medium-emphasis py-6">Aún no hay pendientes registrados.</div>
    </template>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { SEMAFORO_TABLERO, ST_HEX } from '@/views/inovaos/inova-helpers';

const store = useInovaosStore();
const total = computed(() => SEMAFORO_TABLERO.reduce((a, s) => a + (store.resumen.semaforo[s.key] || 0), 0));

const segmentos = computed(() => {
  const t = total.value || 1;
  let acc = 0;
  return SEMAFORO_TABLERO
    .map((s) => ({ ...s, n: store.resumen.semaforo[s.key] || 0 }))
    .filter((s) => s.n > 0)
    .map((s) => {
      const pct = (s.n / t) * 100;
      const offset = 25 - acc;
      acc += pct;
      return { pct, offset, color: ST_HEX[s.key] };
    });
});

onMounted(() => store.fetchResumen());
</script>

<style scoped>
.dona { width: 220px; max-width: 100%; }
.dona-bg { stroke: rgba(var(--v-theme-on-surface), 0.08); }
.dona-total { font-size: 8px; font-weight: 800; fill: rgb(var(--v-theme-on-surface)); }
.dona-sub { font-size: 3px; fill: rgba(var(--v-theme-on-surface), 0.6); }
.sem-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
</style>
