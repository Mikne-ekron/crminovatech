<template>
  <v-container fluid class="py-5 px-6">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3">
      <h1 class="text-h5 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary">mdi-format-list-checks</v-icon> Tareas
      </h1>
      <div class="d-flex align-center ga-2">
        <v-btn variant="text" :color="store.verArchivados ? 'primary' : undefined" prepend-icon="mdi-archive-outline" @click="toggleArchivados">
          {{ store.verArchivados ? 'Ver activos' : 'Ver archivados' }}
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" :to="'/app/inovaos/crear'">Nuevo</v-btn>
      </div>
    </div>

    <div class="d-flex align-center flex-wrap ga-3 mb-3">
      <v-btn-toggle v-model="vista" mandatory density="comfortable" color="primary" variant="outlined" rounded="lg">
        <v-btn value="tablero" prepend-icon="mdi-view-column-outline">Kanban</v-btn>
        <v-btn value="lista" prepend-icon="mdi-format-list-bulleted">Lista</v-btn>
      </v-btn-toggle>
      <v-text-field v-model="busqueda" placeholder="Buscar..." prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" hide-details style="max-width:280px"></v-text-field>
      <v-select v-model="fPrioridad" :items="['Alta','Media','Baja']" label="Prioridad" clearable density="compact" variant="outlined" hide-details style="max-width:150px"></v-select>
      <v-spacer></v-spacer>
      <v-btn variant="text" icon="mdi-refresh" :loading="store.loading" @click="store.fetchPendientes()"></v-btn>
    </div>

    <!-- Kanban -->
    <div v-if="vista === 'tablero'" class="kanban">
      <div v-for="col in ESTATUS" :key="col.key" class="kanban-col">
        <div class="kanban-head">
          <v-icon size="16" :color="col.color">{{ col.icon }}</v-icon>
          <span class="font-weight-bold text-body-2">{{ col.label }}</span>
          <v-chip size="x-small" variant="tonal">{{ porEstatus(col.key).length }}</v-chip>
        </div>
        <div class="kanban-body">
          <v-card v-for="p in porEstatus(col.key)" :key="p.id" class="pend-card mb-2" border elevation="0" @click="store.abrirDetalle(p.id)">
            <div class="d-flex align-center ga-1 mb-1">
              <span class="prio-dot" :style="{ background: colorPrioridad(p.prioridad) }"></span>
              <v-chip size="x-small" :color="semaforo(p).c" variant="tonal">{{ semaforo(p).t }}</v-chip>
            </div>
            <div class="font-weight-medium text-body-2" style="line-height:1.3">{{ p.titulo }}</div>
            <div class="d-flex align-center justify-space-between mt-1">
              <span class="text-caption text-medium-emphasis text-truncate">{{ p.responsable_nombre || 'Sin responsable' }}</span>
              <span class="text-caption text-medium-emphasis">{{ p.area || '' }}</span>
            </div>
          </v-card>
          <div v-if="!porEstatus(col.key).length" class="text-caption text-disabled text-center py-3">—</div>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <v-data-table
      v-else :headers="headers" :items="filtrados" :loading="store.loading"
      density="comfortable" items-per-page="25" class="rounded-lg" hover
      @click:row="(e, { item }) => store.abrirDetalle(item.id)"
    >
      <template #item.prioridad="{ item }">
        <span class="prio-dot mr-1" :style="{ background: colorPrioridad(item.prioridad) }"></span>{{ item.prioridad }}
      </template>
      <template #item.estatus="{ item }">
        <v-chip size="small" :color="estatusMeta(item.estatus).color" variant="tonal">{{ estatusMeta(item.estatus).label }}</v-chip>
      </template>
      <template #item.semaforo="{ item }">
        <v-chip size="small" :color="semaforo(item).c" variant="tonal">{{ semaforo(item).t }}</v-chip>
      </template>
      <template #item.fecha_compromiso="{ item }">{{ fdate(item.fecha_compromiso) }}</template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { ESTATUS, estatusMeta, semaforo, colorPrioridad, fdate } from '@/views/inovaos/inova-helpers';

const store = useInovaosStore();
const vista = ref('tablero');
const busqueda = ref('');
const fPrioridad = ref(null);

const headers = [
  { title: 'Título', key: 'titulo' },
  { title: 'Responsable', key: 'responsable_nombre' },
  { title: 'Prioridad', key: 'prioridad', width: 110 },
  { title: 'Área', key: 'area', width: 120 },
  { title: 'Fecha', key: 'fecha_compromiso', width: 120 },
  { title: 'Semáforo', key: 'semaforo', sortable: false, width: 120 },
  { title: 'Estatus', key: 'estatus', width: 130 },
];

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  return store.pendientes.filter((p) => {
    if (fPrioridad.value && p.prioridad !== fPrioridad.value) return false;
    if (q) {
      const hay = [p.titulo, p.descripcion, p.responsable_nombre, p.area, p.cliente].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});
const porEstatus = (k) => filtrados.value.filter((p) => p.estatus === k);
const toggleArchivados = async () => { store.verArchivados = !store.verArchivados; await store.fetchPendientes(); };

onMounted(() => store.fetchPendientes());
</script>

<style scoped>
.prio-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex: 0 0 auto; }
.kanban { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; align-items: flex-start; }
.kanban-col { flex: 0 0 260px; background: rgba(var(--v-theme-on-surface), 0.03); border-radius: 14px; padding: 8px; }
.kanban-head { display: flex; align-items: center; gap: 6px; padding: 4px 6px 8px; }
.kanban-body { min-height: 40px; }
.pend-card { padding: 10px 12px; cursor: pointer; transition: transform .12s ease; }
.pend-card:hover { transform: translateY(-1px); }
</style>
