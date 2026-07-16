<template>
  <v-navigation-drawer v-model="store.drawerOpen" location="right" temporary touchless width="440">
    <template v-if="d">
      <div class="d-flex align-center justify-space-between px-4 py-3">
        <div class="d-flex align-center ga-2">
          <span class="st-dot" :style="{ background: ST_HEX[estatusColor(d)] }"></span>
          <v-chip size="small" variant="tonal">{{ etiquetaEstatus(d.estatus) }}</v-chip>
        </div>
        <v-btn icon="mdi-close" size="small" variant="text" @click="store.cerrarDetalle()"></v-btn>
      </div>
      <v-divider></v-divider>

      <div class="pa-4">
        <h2 class="text-h6 font-weight-bold mb-1">{{ d.titulo }}</h2>
        <p v-if="d.descripcion" class="text-body-2 text-medium-emphasis mb-3" style="white-space:pre-wrap">{{ d.descripcion }}</p>

        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-chip size="small" variant="tonal"><v-icon start size="14">mdi-flag</v-icon>{{ d.prioridad || '—' }}</v-chip>
          <v-chip size="small" variant="tonal"><v-icon start size="14">mdi-calendar-clock</v-icon>Vence {{ formatFecha(d.fecha_compromiso) }}</v-chip>
          <v-chip v-if="d.area" size="small" variant="tonal"><v-icon start size="14">mdi-shape-outline</v-icon>{{ d.area }}</v-chip>
        </div>

        <v-list density="compact" class="bg-transparent py-0 mb-2">
          <v-list-item class="px-0" prepend-icon="mdi-account-arrow-right-outline" :title="d.responsable_nombre || 'Sin responsable'" subtitle="Responsable"></v-list-item>
          <v-list-item class="px-0" prepend-icon="mdi-account-edit-outline" :title="d.creador_nombre || '—'" subtitle="Delegado por"></v-list-item>
          <v-list-item v-if="d.cliente" class="px-0" prepend-icon="mdi-domain" :title="d.cliente" subtitle="Cliente"></v-list-item>
          <v-list-item v-if="d.origen" class="px-0" prepend-icon="mdi-source-branch" :title="d.origen" subtitle="Origen"></v-list-item>
          <v-list-item v-if="d.comentario_cierre" class="px-0" prepend-icon="mdi-comment-check-outline" :title="d.comentario_cierre" subtitle="Comentario de cierre"></v-list-item>
        </v-list>

        <!-- Acciones -->
        <div v-if="acciones.length" class="d-flex flex-wrap ga-2 my-3">
          <v-btn v-for="a in acciones" :key="a.id" :color="a.color || 'primary'" size="small" :variant="a.fill ? 'flat' : 'tonal'" :loading="cargando === a.id" @click="hacer(a)">{{ a.texto }}</v-btn>
        </div>
        <div v-else-if="motivo" class="text-caption text-medium-emphasis my-2">{{ motivo }}</div>

        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-btn v-if="editable" size="small" variant="tonal" prepend-icon="mdi-pencil" @click="$emit('editar', d)">Editar</v-btn>
          <v-btn size="small" variant="tonal" :prepend-icon="d.archivado ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-outline'" @click="archivar">{{ d.archivado ? 'Desarchivar' : 'Archivar' }}</v-btn>
          <v-btn v-if="eliminable" size="small" variant="tonal" color="error" prepend-icon="mdi-trash-can-outline" @click="eliminar">Eliminar</v-btn>
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
          <v-text-field v-model="nuevoChk" placeholder="Agregar paso..." density="compact" variant="outlined" hide-details @keyup.enter="agregarChk"></v-text-field>
          <v-btn icon="mdi-plus" size="small" variant="tonal" :disabled="!nuevoChk.trim()" @click="agregarChk"></v-btn>
        </div>

        <v-divider class="my-3"></v-divider>

        <!-- Evidencias (solo lectura) -->
        <div class="text-subtitle-2 font-weight-bold mb-1">Evidencias <span v-if="evidencias.length" class="text-caption text-medium-emphasis">({{ evidencias.length }})</span></div>
        <div v-if="!evidencias.length" class="text-caption text-disabled mb-2">Sin evidencias. Se adjuntan desde la app móvil.</div>
        <div v-for="ev in evidencias" :key="ev.id" class="d-flex align-center ga-2 mb-1">
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
        <v-card-text><v-text-field v-model="nuevaFecha" label="Nueva fecha compromiso" type="date" :min="hoy" variant="outlined" density="comfortable" hide-details></v-text-field></v-card-text>
        <v-card-actions class="px-4 pb-4"><v-spacer></v-spacer><v-btn variant="text" @click="dlgReagendar=false">Cancelar</v-btn><v-btn color="primary" :loading="!!cargando" :disabled="!nuevaFecha" @click="confirmarReagendar">Reagendar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Aprobar -->
    <v-dialog v-model="dlgAprobar" max-width="420">
      <v-card class="rounded-xl">
        <v-card-title class="text-subtitle-1 font-weight-bold">Aprobar pendiente</v-card-title>
        <v-card-text><v-textarea v-model="comentario" label="Comentario (opcional)" variant="outlined" rows="2" auto-grow hide-details></v-textarea></v-card-text>
        <v-card-actions class="px-4 pb-4"><v-spacer></v-spacer><v-btn variant="text" @click="dlgAprobar=false">Cancelar</v-btn><v-btn color="success" :loading="!!cargando" @click="confirmarAprobar">Aprobar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Devolver -->
    <v-dialog v-model="dlgDevolver" max-width="420">
      <v-card class="rounded-xl">
        <v-card-title class="text-subtitle-1 font-weight-bold">Devolver a revisión</v-card-title>
        <v-card-text><v-textarea v-model="motivoDev" label="¿Qué falta corregir? *" variant="outlined" rows="2" auto-grow hide-details></v-textarea></v-card-text>
        <v-card-actions class="px-4 pb-4"><v-spacer></v-spacer><v-btn variant="text" @click="dlgDevolver=false">Cancelar</v-btn><v-btn color="error" :loading="!!cargando" :disabled="!motivoDev.trim()" @click="confirmarDevolver">Devolver</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import {
  ST_HEX, estatusColor, etiquetaEstatus, formatFecha, fdatetime,
  accionesDisponibles, motivoSinAcciones, puedeEditar, puedeEliminar, msgError,
} from '@/views/inovaos/inova-helpers';

const emit = defineEmits(['editar']);
const store = useInovaosStore();
const hoy = new Date().toISOString().slice(0, 10);

const d = computed(() => store.detalle?.pendiente || null);
const evidencias = computed(() => store.detalle?.evidencias || []);
const acciones = computed(() => (d.value ? accionesDisponibles(d.value, store.myId) : []));
const motivo = computed(() => (d.value ? motivoSinAcciones(d.value) : ''));
const editable = computed(() => d.value && puedeEditar(d.value, store.myId));
const eliminable = computed(() => d.value && puedeEliminar(d.value, store.myId));

const cargando = ref(null);
const nuevoChk = ref('');
const dlgReagendar = ref(false); const nuevaFecha = ref('');
const dlgAprobar = ref(false); const comentario = ref('');
const dlgDevolver = ref(false); const motivoDev = ref('');

const aplicar = async (estatus, extra, id) => {
  cargando.value = id || estatus;
  try { await store.cambiarEstatus(d.value.id, estatus, extra || {}); store.notify(`Estatus: ${etiquetaEstatus(estatus)}`); }
  catch (err) { store.notify(msgError(err), 'error'); }
  finally { cargando.value = null; }
};

const hacer = async (a) => {
  if (a.tipo === 'editar') { emit('editar', d.value); return; }
  if (a.tipo === 'reagendar') { nuevaFecha.value = d.value.fecha_compromiso ? String(d.value.fecha_compromiso).slice(0, 10) : hoy; dlgReagendar.value = true; return; }
  if (a.id === 'aprobar') { comentario.value = ''; dlgAprobar.value = true; return; }
  if (a.id === 'devolver') { motivoDev.value = ''; dlgDevolver.value = true; return; }
  if (a.id === 'concluir' && !evidencias.value.length) { store.notify('Adjunta al menos una evidencia antes de concluir (desde la app móvil).', 'error'); return; }
  await aplicar(a.estatus, {}, a.id);
};

const confirmarReagendar = async () => { await aplicar('reagendado', { fecha_compromiso: nuevaFecha.value, detalle: `nueva fecha: ${nuevaFecha.value}` }, 'reagendar'); dlgReagendar.value = false; };
const confirmarAprobar = async () => { const c = comentario.value.trim(); await aplicar('aprobado', c ? { comentario_cierre: c } : {}, 'aprobar'); dlgAprobar.value = false; };
const confirmarDevolver = async () => { const m = motivoDev.value.trim(); if (!m) return; await aplicar('en_progreso', { detalle: `devuelto: ${m}` }, 'devolver'); dlgDevolver.value = false; };

const agregarChk = async () => { const t = nuevoChk.value.trim(); if (!t) return; nuevoChk.value = ''; try { await store.addChecklist(d.value.id, t); } catch (err) { store.notify(msgError(err), 'error'); } };
const archivar = async () => { try { await store.archivar(d.value.id, !d.value.archivado); store.notify(d.value.archivado ? 'Desarchivado' : 'Archivado'); store.cerrarDetalle(); } catch (err) { store.notify(msgError(err), 'error'); } };
const eliminar = async () => { if (!confirm('¿Eliminar este pendiente? No se puede deshacer.')) return; try { await store.eliminar(d.value.id); store.notify('Pendiente eliminado'); } catch (err) { store.notify(msgError(err), 'error'); } };
</script>

<style scoped>
.st-dot { display: inline-block; width: 11px; height: 11px; border-radius: 50%; }
</style>
