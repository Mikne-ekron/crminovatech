<template>
  <v-container class="py-5" style="max-width:1100px">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3">
      <h1 class="text-h5 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary">mdi-clipboard-list-outline</v-icon> Pendientes
      </h1>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/app/inovaos/crear">Nuevo</v-btn>
    </div>

    <!-- Buscador -->
    <v-text-field
      v-model="busqueda" placeholder="Buscar en pendientes..." prepend-inner-icon="mdi-magnify"
      variant="solo" density="comfortable" hide-details rounded="lg" bg-color="surface" class="mb-3" clearable
    ></v-text-field>

    <!-- Relación: Todas / Para mí / Yo delegué -->
    <v-btn-toggle v-model="relacion" mandatory density="comfortable" color="primary" variant="outlined" rounded="lg" class="mb-3">
      <v-btn v-for="r in RELACIONES" :key="r.key" :value="r.key">{{ r.label }}</v-btn>
    </v-btn-toggle>

    <!-- Pilas -->
    <div class="chips-row mb-4">
      <v-chip
        v-for="c in CATEGORIAS" :key="c.key"
        :color="filtro === c.key ? 'primary' : undefined"
        :variant="filtro === c.key ? 'flat' : 'tonal'"
        class="mr-2 mb-2" @click="filtro = c.key"
      >
        {{ c.label }}
        <span v-if="conteo(c.key)" class="chip-count ms-2">{{ conteo(c.key) }}</span>
      </v-chip>
    </div>

    <div v-if="store.loading" class="text-center py-10"><v-progress-circular indeterminate color="primary" /></div>

    <template v-else>
      <v-card v-if="filtrados.length" border elevation="0" class="rounded-xl">
        <v-list class="py-0">
          <template v-for="(p, i) in filtrados" :key="p.id">
            <v-list-item class="pend-item" @click="store.abrirDetalle(p.id)">
              <template #prepend>
                <span class="st-dot" :style="{ background: ST_HEX[estatusColor(p)] }"></span>
              </template>
              <v-list-item-title class="d-flex align-center ga-2">
                <span class="font-weight-medium text-truncate">{{ p.titulo }}</span>
                <v-chip size="x-small" variant="tonal" class="flex-0">{{ p.prioridad }}</v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="etiquetaRelacion(p, store.myId)" class="rel-tag" :class="'rel-' + relacionCon(p, store.myId)">{{ etiquetaRelacion(p, store.myId) }}</span>
                {{ p.responsable_nombre || 'Sin asignar' }} · {{ etiquetaEstatus(p.estatus) }}
              </v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center ga-3">
                  <span class="text-caption text-medium-emphasis">Vence {{ formatFecha(p.fecha_compromiso) }}</span>
                  <v-btn
                    :icon="verArchivados ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-arrow-down-outline'"
                    size="small" variant="text" @click.stop="alternarArchivo(p)"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
            <v-divider v-if="i < filtrados.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>

      <div v-else class="text-center text-medium-emphasis py-12">
        {{ mensajeVacio }}
        <div v-if="filtro !== 'inmediata' || relacion !== 'todas' || busqueda" class="mt-2">
          <v-btn variant="text" color="primary" @click="limpiar">Restablecer</v-btn>
        </div>
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

// Carga perezosa de archivados al entrar a esa pila.
watch(verArchivados, (v) => { if (v && !store.archivadosCargados) store.fetchArchivados(); });

onMounted(() => store.fetchPendientes());
</script>

<style scoped>
.st-dot { display: inline-block; width: 11px; height: 11px; border-radius: 50%; }
.chips-row { display: flex; flex-wrap: wrap; }
.chip-count { font-size: 11px; font-weight: 700; opacity: .85; }
.rel-tag { font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 999px; margin-right: 6px; }
.rel-mia, .rel-ambas { background: rgba(91,91,214,.14); color: rgb(var(--v-theme-primary)); }
.rel-delegada { background: rgba(255,159,10,.16); color: #b26a00; }
.pend-item { cursor: pointer; }
.flex-0 { flex: 0 0 auto; }
</style>
