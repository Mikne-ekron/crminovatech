<template>
  <v-container class="py-6" style="max-width:1120px">
    <h1 class="text-h5 font-weight-bold mb-1 d-flex align-center ga-2">
      <v-icon color="#5b5bd6">mdi-chart-bar</v-icon> Métricas
    </h1>
    <div class="text-body-2 text-medium-emphasis mb-5">
      {{ store.metricas.direccion ? 'Desempeño de cada colaborador.' : 'Tu desempeño como responsable.' }}
    </div>

    <div v-if="store.loadingMetricas" class="text-center py-16"><v-progress-circular indeterminate color="#5b5bd6" /></div>
    <div v-else-if="!store.metricas.colaboradores.length" class="text-center text-medium-emphasis py-16">
      <v-icon size="40" class="mb-2" color="#5b5bd6">mdi-chart-bar</v-icon>
      <div>Aún no hay datos suficientes para calcular métricas.</div>
    </div>

    <v-row v-else dense>
      <v-col v-for="c in store.metricas.colaboradores" :key="c.id" cols="12" md="6">
        <div class="iv-card pa-4 h-100">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="#5b5bd6" size="44"><span class="text-white font-weight-bold">{{ inicial(c.nombre) }}</span></v-avatar>
            <div class="flex-grow-1">
              <div class="font-weight-bold">{{ c.nombre }}</div>
              <div class="text-caption text-medium-emphasis">{{ c.total }} asignados · {{ c.completados }} completados</div>
            </div>
          </div>
          <div class="met-grid">
            <div class="met-tile" :style="tile(colorCumpl(c.cumplimiento))">
              <v-icon size="18" :color="colorCumpl(c.cumplimiento)">mdi-seal-variant</v-icon>
              <div class="met-val" :style="{ color: colorCumpl(c.cumplimiento) }">{{ c.cumplimiento === null ? '—' : c.cumplimiento + '%' }}</div>
              <div class="met-lbl">Cumplimiento</div>
            </div>
            <div class="met-tile" :style="tile('#0a84ff')">
              <v-icon size="18" color="#0a84ff">mdi-timer-outline</v-icon>
              <div class="met-val" style="color:#0a84ff">{{ tiempo(c.tiempo_respuesta_horas) }}</div>
              <div class="met-lbl">Respuesta</div>
            </div>
            <div class="met-tile" :style="tile(c.retrasos > 0 ? '#ff453a' : '#30d158')">
              <v-icon size="18" :color="c.retrasos > 0 ? '#ff453a' : '#30d158'">mdi-alert-outline</v-icon>
              <div class="met-val" :style="{ color: c.retrasos > 0 ? '#ff453a' : '#30d158' }">{{ c.retrasos }}</div>
              <div class="met-lbl">Retrasos</div>
            </div>
            <div class="met-tile" :style="tile('#5b5bd6')">
              <v-icon size="18" color="#5b5bd6">mdi-paperclip</v-icon>
              <div class="met-val" style="color:#5b5bd6">{{ c.calidad_evidencia === null ? '—' : c.calidad_evidencia }}</div>
              <div class="met-lbl">Evidencia</div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';

const store = useInovaosStore();
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();
const colorCumpl = (v) => (v === null ? '#8a8699' : v >= 80 ? '#30d158' : v >= 50 ? '#ff9f0a' : '#ff453a');
const tile = (hex) => ({ background: hex + '14' });
const tiempo = (h) => {
  if (h === null || h === undefined) return '—';
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} d`;
};

onMounted(() => store.fetchMetricas());
</script>

<style scoped>
.met-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 600px) { .met-grid { grid-template-columns: repeat(2, 1fr); } }
.met-tile { border-radius: 14px; padding: 12px 10px; text-align: center; }
.met-val { font-size: 1.25rem; font-weight: 800; line-height: 1; margin: 5px 0 3px; }
.met-lbl { font-size: 0.7rem; color: rgba(var(--v-theme-on-surface), 0.6); }
</style>
