<template>
  <v-container class="py-6" style="max-width:1100px">
    <h1 class="text-h5 font-weight-bold mb-1 d-flex align-center ga-2">
      <v-icon color="#5b5bd6">mdi-chart-bar</v-icon> Métricas
    </h1>
    <div class="text-body-2 text-medium-emphasis mb-5">
      {{ store.metricas.direccion ? 'Desempeño de cada colaborador.' : 'Tu desempeño como responsable.' }}
    </div>

    <div v-if="store.loadingMetricas" class="text-center py-16"><v-progress-circular indeterminate color="primary" /></div>
    <div v-else-if="!store.metricas.colaboradores.length" class="text-center text-medium-emphasis py-12">
      Aún no hay datos suficientes para calcular métricas.
    </div>

    <v-row v-else dense>
      <v-col v-for="c in store.metricas.colaboradores" :key="c.id" cols="12" md="6">
        <div class="iv-card pa-4 h-100">
          <div class="d-flex align-center ga-3 mb-3">
            <v-avatar color="#5b5bd6" size="42"><span class="text-white font-weight-bold">{{ inicial(c.nombre) }}</span></v-avatar>
            <div>
              <div class="font-weight-bold">{{ c.nombre }}</div>
              <div class="text-caption text-medium-emphasis">{{ c.total }} asignados · {{ c.completados }} completados</div>
            </div>
          </div>
          <v-row dense>
            <v-col cols="6" sm="3" class="text-center">
              <v-icon :color="colorCumpl(c.cumplimiento)" size="22">mdi-seal-variant</v-icon>
              <div class="text-h6 font-weight-bold">{{ c.cumplimiento === null ? '—' : c.cumplimiento + '%' }}</div>
              <div class="text-caption text-medium-emphasis">Cumplimiento</div>
            </v-col>
            <v-col cols="6" sm="3" class="text-center">
              <v-icon color="info" size="22">mdi-timer-outline</v-icon>
              <div class="text-h6 font-weight-bold">{{ tiempo(c.tiempo_respuesta_horas) }}</div>
              <div class="text-caption text-medium-emphasis">Respuesta</div>
            </v-col>
            <v-col cols="6" sm="3" class="text-center">
              <v-icon :color="c.retrasos > 0 ? 'error' : 'success'" size="22">mdi-alert-outline</v-icon>
              <div class="text-h6 font-weight-bold">{{ c.retrasos }}</div>
              <div class="text-caption text-medium-emphasis">Retrasos</div>
            </v-col>
            <v-col cols="6" sm="3" class="text-center">
              <v-icon color="deep-purple" size="22">mdi-paperclip</v-icon>
              <div class="text-h6 font-weight-bold">{{ c.calidad_evidencia === null ? '—' : c.calidad_evidencia }}</div>
              <div class="text-caption text-medium-emphasis">Evidencia</div>
            </v-col>
          </v-row>
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
const colorCumpl = (v) => (v === null ? 'grey' : v >= 80 ? 'success' : v >= 50 ? 'warning' : 'error');
const tiempo = (h) => {
  if (h === null || h === undefined) return '—';
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} d`;
};

onMounted(() => store.fetchMetricas());
</script>
