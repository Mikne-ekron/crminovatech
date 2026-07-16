<template>
  <v-container class="py-6" style="max-width:1100px">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <h1 class="text-h5 font-weight-bold d-flex align-center ga-2">
        <v-icon color="#5b5bd6">mdi-clipboard-list-outline</v-icon> Pendientes
      </h1>
      <v-btn class="iv-btn-accent" rounded="xl" prepend-icon="mdi-plus" to="/app/inovaos/crear" elevation="0">Nuevo</v-btn>
    </div>

    <!-- Buscador -->
    <v-text-field
      v-model="busqueda" placeholder="Buscar en pendientes..." prepend-inner-icon="mdi-magnify"
      variant="solo-filled" flat density="comfortable" hide-details rounded="lg" class="mb-3 iv-search" clearable
    ></v-text-field>

    <!-- Relación -->
    <div class="d-flex justify-space-between align-center flex-wrap ga-2 mb-3">
      <div class="iv-seg">
        <button v-for="r in RELACIONES" :key="r.key" :class="{ active: relacion === r.key }" @click="relacion = r.key">{{ r.label }}</button>
      </div>
    </div>

    <!-- Pilas -->
    <div class="d-flex flex-wrap ga-2 mb-4">
      <div v-for="c in CATEGORIAS" :key="c.key" class="iv-pila" :class="{ active: filtro === c.key }" @click="filtro = c.key">
        {{ c.label }}
        <span v-if="conteo(c.key)" class="iv-pila-count">{{ conteo(c.key) }}</span>
      </div>
    </div>

    <div v-if="store.loading" class="text-center py-10"><v-progress-circular indeterminate color="#5b5bd6" /></div>

    <template v-else>
      <div v-if="filtrados.length" class="iv-card">
        <v-list class="py-0 bg-transparent">
          <template v-for="(p, i) in filtrados" :key="p.id">
            <v-list-item class="iv-row py-2" @click="store.abrirDetalle(p.id)">
              <template #prepend><span class="iv-dot me-3" :style="{ background: ST_HEX[estatusColor(p)] }"></span></template>
              <v-list-item-title class="d-flex align-center ga-2">
                <span class="font-weight-medium text-truncate">{{ p.titulo }}</span>
                <v-chip size="x-small" variant="tonal" class="flex-0">{{ p.prioridad }}</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle class="mt-1">
                <span v-if="etiquetaRelacion(p, store.myId)" class="rel-tag" :class="'rel-' + relacionCon(p, store.myId)">{{ etiquetaRelacion(p, store.myId) }}</span>
                {{ p.responsable_nombre || 'Sin asignar' }} · {{ etiquetaEstatus(p.estatus) }}
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center ga-2">
                  <span class="text-caption text-medium-emphasis d-none d-sm-block">Vence {{ formatFecha(p.fecha_compromiso) }}</span>
                  <v-btn :icon="verArchivados ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-arrow-down-outline'" size="small" variant="text" @click.stop="alternarArchivo(p)"></v-btn>
                </div>
              </template>
            </v-list-item>
            <v-divider v-if="i < filtrados.length - 1" class="mx-3"></v-divider>
          </template>
        </v-list>
      </div>

      <div v-else class="text-center text-medium-emphasis py-16">
        <v-icon size="40" class="mb-2" color="#5b5bd6">mdi-clipboard-check-outline</v-icon>
        <div>{{ mensajeVacio }}</div>
        <v-btn v-if="filtro !== 'inmediata' || relacion !== 'todas' || busqueda" class="mt-2" variant="text" color="#5b5bd6" @click="limpiar">Restablecer</v-btn>
      </div>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import {
  CATEGORIAS, ST_HEX, estatusColor, etiquetaEstatus, formatFecha,
  relacionCon, etiquetaRelacion, enCategoria, msgError,
} from '@/views/inovaos/inova-helpers';

const store = useInovaosStore();
const busqueda = ref('');
const relacion = ref('todas');
const RELACIONES = [
  { key: 'todas', label: 'Todas' },
  { key: 'mia', label: 'Para mí' },
  { key: 'delegada', label: 'Yo delegué' },
];

const filtro = computed({ get: () => store.filtro, set: (v) => store.setFiltro(v) });
const verArchivados = computed(() => filtro.value === 'archivados');
const items = computed(() => (verArchivados.value ? store.archivados : store.pendientes));

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const coincideBusqueda = (p) => {
  const q = norm((busqueda.value || '').trim());
  if (!q) return true;
  return [p.titulo, p.descripcion, p.responsable_nombre, p.area, p.cliente, p.tipo, p.prioridad, etiquetaEstatus(p.estatus)]
    .map(norm).join(' ').includes(q);
};
const coincideRelacion = (p) => {
  if (relacion.value === 'todas') return true;
  const r = relacionCon(p, store.myId);
  if (relacion.value === 'mia') return r === 'mia' || r === 'ambas';
  if (relacion.value === 'delegada') return r === 'delegada' || r === 'ambas';
  return true;
};

const enRelacion = computed(() => items.value.filter(coincideRelacion));
const filtrados = computed(() => {
  if ((busqueda.value || '').trim()) return enRelacion.value.filter(coincideBusqueda);
  return verArchivados.value ? enRelacion.value : enRelacion.value.filter((p) => enCategoria(p, filtro.value, store.myId));
});
const conteo = (key) => {
  if (key === 'archivados') return store.archivados.filter(coincideRelacion).length;
  return store.pendientes.filter(coincideRelacion).filter((p) => enCategoria(p, key, store.myId)).length;
};

const etiquetaFiltro = computed(() => CATEGORIAS.find((c) => c.key === filtro.value)?.label ?? '');
const mensajeVacio = computed(() => {
  if ((busqueda.value || '').trim()) return `Sin resultados para «${busqueda.value.trim()}».`;
  if (verArchivados.value) return 'No tienes pendientes archivados.';
  if (filtro.value === 'inmediata') return 'Nada requiere tu atención inmediata.';
  return `Nada en «${etiquetaFiltro.value}».`;
});
const limpiar = () => { filtro.value = 'inmediata'; relacion.value = 'todas'; busqueda.value = ''; };

const alternarArchivo = async (p) => {
  try { await store.archivar(p.id, !verArchivados.value); store.notify(verArchivados.value ? 'Desarchivado' : 'Archivado'); }
  catch (err) { store.notify(msgError(err), 'error'); }
};

watch(verArchivados, (v) => { if (v && !store.archivadosCargados) store.fetchArchivados(); });
onMounted(() => store.fetchPendientes());
</script>

<style scoped>
.flex-0 { flex: 0 0 auto; }
.iv-search :deep(.v-field) { border-radius: 14px; }
</style>
