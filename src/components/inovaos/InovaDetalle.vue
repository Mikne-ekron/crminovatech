<template>
  <v-navigation-drawer v-model="store.drawerOpen" location="right" temporary touchless width="440">
    <template v-if="d">
      <div class="d-flex align-center justify-space-between px-4 py-3">
        <v-chip size="small" :color="estatusMeta(d.estatus).color" variant="flat">{{ estatusMeta(d.estatus).label }}</v-chip>
        <v-btn icon="mdi-close" size="small" variant="text" @click="store.cerrarDetalle()"></v-btn>
      </div>
      <v-divider></v-divider>

      <div class="pa-4">
        <h2 class="text-h6 font-weight-bold mb-1">{{ d.titulo }}</h2>
        <p v-if="d.descripcion" class="text-body-2 text-medium-emphasis mb-3" style="white-space:pre-wrap">{{ d.descripcion }}</p>

        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-chip size="small" variant="tonal"><v-icon start size="14">mdi-flag</v-icon>{{ d.prioridad || '—' }}</v-chip>
          <v-chip size="small" :color="semaforo(d).c" variant="tonal">{{ semaforo(d).t }}</v-chip>
          <v-chip v-if="d.area" size="small" variant="tonal"><v-icon start size="14">mdi-shape-outline</v-icon>{{ d.area }}</v-chip>
        </div>

        <v-list density="compact" class="bg-transparent py-0 mb-2">
          <v-list-item class="px-0" prepend-icon="mdi-account-arrow-right-outline" :title="d.responsable_nombre || 'Sin responsable'" subtitle="Responsable"></v-list-item>
          <v-list-item class="px-0" prepend-icon="mdi-account-edit-outline" :title="d.creador_nombre || '—'" subtitle="Delegado por"></v-list-item>
          <v-list-item class="px-0" prepend-icon="mdi-calendar" :title="fdate(d.fecha_compromiso)" subtitle="Fecha compromiso"></v-list-item>
          <v-list-item v-if="d.cliente" class="px-0" prepend-icon="mdi-domain" :title="d.cliente" subtitle="Cliente"></v-list-item>
          <v-list-item v-if="d.origen" class="px-0" prepend-icon="mdi-source-branch" :title="d.origen" subtitle="Origen"></v-list-item>
        </v-list>

        <!-- Acciones de estatus -->
        <div v-if="acciones.length" class="d-flex flex-wrap ga-2 my-3">
          <v-btn v-for="a in acciones" :key="a.e + a.t" :color="a.c" size="small" variant="flat" :prepend-icon="a.i" :loading="accion === a.e + a.t" @click="hacer(a)">{{ a.t }}</v-btn>
        </div>
        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-btn v-if="creador" size="small" variant="tonal" prepend-icon="mdi-pencil" @click="$emit('editar', d)">Editar</v-btn>
          <v-btn size="small" variant="tonal" :prepend-icon="d.archivado ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-outline'" @click="archivar">{{ d.archivado ? 'Desarchivar' : 'Archivar' }}</v-btn>
          <v-btn v-if="creador" size="small" variant="tonal" color="error" prepend-icon="mdi-trash-can-outline" @click="eliminar">Eliminar</v-btn>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- Checklist -->
        <div class="text-subtitle-2 font-weight-bold mb-1">Checklist</div>
        <div v-for="c in store.detalle.checklist" :key="c.id" class="d-flex align-center">
          <v-checkbox-btn :model-value="!!c.completado" density="compact" @update:model-value="v => store.toggleChecklist(c.id, v, d.id)"></v-checkbox-btn>
          <span class="text-body-2 flex-grow-1" :class="{ 'text-decoration-line-through text-disabled': c.completado }">{{ c.texto }}</span>
          <v-btn icon="mdi-close" size="x-small" variant="text" @click="store.delChecklist(c.id, d.id)"></v-btn>
        </div>
        <div class="d-flex align-center ga-2 mt-1 mb-3">
          <v-text-field v-model="nuevoChk" placeholder="Agregar ítem..." density="compact" variant="outlined" hide-details @keyup.enter="agregarChk"></v-text-field>
          <v-btn icon="mdi-plus" size="small" variant="tonal" :disabled="!nuevoChk.trim()" @click="agregarChk"></v-btn>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- Evidencias (solo lectura) -->
        <div class="text-subtitle-2 font-weight-bold mb-1">Evidencias</div>
        <div v-if="!store.detalle.evidencias.length" class="text-caption text-disabled mb-2">Sin evidencias.</div>
        <div v-for="ev in store.detalle.evidencias" :key="ev.id" class="d-flex align-center ga-2 mb-1">
          <v-icon size="18" color="primary">mdi-paperclip</v-icon>
          <a :href="ev.url" target="_blank" rel="noopener" class="text-body-2 text-primary text-truncate">{{ ev.nombre || ev.url }}</a>
          <span class="text-caption text-disabled">· {{ ev.autor || '' }}</span>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- Historial -->
        <div class="text-subtitle-2 font-weight-bold mb-2">Historial</div>
        <v-timeline density="compact" side="end" truncate-line="both">
          <v-timeline-item v-for="(h, i) in store.detalle.historial" :key="i" size="x-small" dot-color="primary">
            <div class="text-body-2 font-weight-medium">{{ h.evento }}</div>
            <div class="text-caption text-medium-emphasis">{{ h.detalle }}</div>
            <div class="text-caption text-disabled">{{ fdatetime(h.created_at) }}</div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </template>
    <div v-else-if="store.loadingDetalle" class="text-center py-10"><v-progress-circular indeterminate color="primary" /></div>

    <!-- Reagendar -->
    <v-dialog v-model="dlgReagendar" max-width="380">
      <v-card class="rounded-xl">
        <v-card-title class="text-subtitle-1 font-weight-bold">Reagendar</v-card-title>
        <v-card-text>
          <v-text-field v-model="nuevaFecha" label="Nueva fecha compromiso" type="date" variant="outlined" density="comfortable" hide-details></v-text-field>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dlgReagendar = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="!!accion" :disabled="!nuevaFecha" @click="confirmarReagendar">Reagendar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { estatusMeta, semaforo, fdate, fdatetime, accionesEstatus, esCreador, msgError } from '@/views/inovaos/inova-helpers';

defineEmits(['editar']);
const store = useInovaosStore();
const d = computed(() => store.detalle?.pendiente || null);
const creador = computed(() => d.value && esCreador(d.value, store.myId));
const acciones = computed(() => (d.value ? accionesEstatus(d.value, store.myId) : []));

const accion = ref(null);
const nuevoChk = ref('');
const dlgReagendar = ref(false);
const nuevaFecha = ref('');
let reagendarId = null;

const hacer = async (a) => {
  if (a.fecha) { reagendarId = d.value.id; nuevaFecha.value = d.value.fecha_compromiso ? String(d.value.fecha_compromiso).slice(0, 10) : ''; dlgReagendar.value = true; return; }
  accion.value = a.e + a.t;
  try { await store.cambiarEstatus(d.value.id, a.e); store.notify(`Estatus: ${estatusMeta(a.e).label}`); }
  catch (err) { store.notify(msgError(err), 'error'); }
  finally { accion.value = null; }
};
const confirmarReagendar = async () => {
  accion.value = 'reagendar';
  try { await store.cambiarEstatus(reagendarId, 'reagendado', { fecha_compromiso: nuevaFecha.value }); dlgReagendar.value = false; store.notify('Pendiente reagendado'); }
  catch (err) { store.notify(msgError(err), 'error'); }
  finally { accion.value = null; }
};
const agregarChk = async () => {
  const t = nuevoChk.value.trim();
  if (!t) return;
  nuevoChk.value = '';
  try { await store.addChecklist(d.value.id, t); } catch (err) { store.notify(msgError(err), 'error'); }
};
const archivar = async () => {
  try { await store.archivar(d.value.id, !d.value.archivado); store.notify(d.value.archivado ? 'Desarchivado' : 'Archivado'); store.cerrarDetalle(); }
  catch (err) { store.notify(msgError(err), 'error'); }
};
const eliminar = async () => {
  if (!confirm('¿Eliminar este pendiente? No se puede deshacer.')) return;
  try { await store.eliminar(d.value.id); store.notify('Pendiente eliminado'); }
  catch (err) { store.notify(msgError(err), 'error'); }
};
</script>
