<template>
  <v-container fluid class="py-5 px-6">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <h1 class="text-h5 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-clipboard-check-multiple-outline</v-icon> InovaOS · Pendientes
        </h1>
        <div class="text-body-2 text-medium-emphasis">Delegación y seguimiento (vista de escritorio)</div>
      </div>
      <div class="d-flex align-center ga-2">
        <v-btn variant="text" :color="store.verArchivados ? 'primary' : undefined" prepend-icon="mdi-archive-outline" @click="toggleArchivados">
          {{ store.verArchivados ? 'Ver activos' : 'Ver archivados' }}
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" :disabled="!store.habilitado" @click="nuevaCaptura">Nuevo pendiente</v-btn>
      </div>
    </div>

    <v-alert v-if="!loadingInit && !store.habilitado" type="warning" variant="tonal" class="rounded-lg mb-4">
      Tu correo ({{ authEmail }}) no está registrado en InovaOS, así que no puedes ver ni operar pendientes.
      Pide que te den de alta en InovaOS con este mismo correo.
    </v-alert>

    <template v-else>
      <!-- Controles -->
      <div class="d-flex align-center flex-wrap ga-3 mb-3">
        <v-btn-toggle v-model="vista" mandatory density="comfortable" color="primary" variant="outlined" rounded="lg">
          <v-btn value="tablero" prepend-icon="mdi-view-column-outline">Tablero</v-btn>
          <v-btn value="lista" prepend-icon="mdi-format-list-bulleted">Lista</v-btn>
        </v-btn-toggle>
        <v-text-field
          v-model="busqueda" placeholder="Buscar..." prepend-inner-icon="mdi-magnify"
          density="compact" variant="outlined" hide-details style="max-width:280px"
        ></v-text-field>
        <v-select
          v-model="fPrioridad" :items="['Alta','Media','Baja']" label="Prioridad" clearable
          density="compact" variant="outlined" hide-details style="max-width:150px"
        ></v-select>
        <v-spacer></v-spacer>
        <v-btn variant="text" icon="mdi-refresh" :loading="store.loading" @click="recargar"></v-btn>
      </div>

      <!-- TABLERO (kanban) -->
      <div v-if="vista === 'tablero'" class="kanban">
        <div v-for="col in ESTATUS" :key="col.key" class="kanban-col">
          <div class="kanban-head">
            <v-icon size="16" :color="col.color">{{ col.icon }}</v-icon>
            <span class="font-weight-bold text-body-2">{{ col.label }}</span>
            <v-chip size="x-small" variant="tonal">{{ porEstatus(col.key).length }}</v-chip>
          </div>
          <div class="kanban-body">
            <v-card
              v-for="p in porEstatus(col.key)" :key="p.id" class="pend-card mb-2" border elevation="0"
              @click="abrir(p.id)"
            >
              <div class="d-flex align-center ga-1 mb-1">
                <span class="prio-dot" :style="{ background: colorPrioridad(p.prioridad) }"></span>
                <v-chip size="x-small" :color="semaforo(p).c" variant="tonal">{{ semaforo(p).t }}</v-chip>
              </div>
              <div class="font-weight-medium text-body-2 pend-title">{{ p.titulo }}</div>
              <div class="d-flex align-center justify-space-between mt-1">
                <span class="text-caption text-medium-emphasis text-truncate">{{ p.responsable_nombre || 'Sin responsable' }}</span>
                <span class="text-caption text-medium-emphasis">{{ p.area || '' }}</span>
              </div>
            </v-card>
            <div v-if="!porEstatus(col.key).length" class="text-caption text-disabled text-center py-3">—</div>
          </div>
        </div>
      </div>

      <!-- LISTA -->
      <v-data-table
        v-else
        :headers="headers" :items="filtrados" :loading="store.loading"
        density="comfortable" items-per-page="25" class="rounded-lg" hover
        @click:row="(e, { item }) => abrir(item.id)"
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
    </template>

    <!-- ============ DETALLE (drawer derecho) ============ -->
    <v-navigation-drawer v-model="drawer" location="right" temporary touchless width="440">
      <template v-if="d">
        <div class="d-flex align-center justify-space-between px-4 py-3">
          <v-chip size="small" :color="estatusMeta(d.estatus).color" variant="flat">{{ estatusMeta(d.estatus).label }}</v-chip>
          <v-btn icon="mdi-close" size="small" variant="text" @click="drawer = false"></v-btn>
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
          <div v-if="acciones(d).length" class="d-flex flex-wrap ga-2 my-3">
            <v-btn v-for="a in acciones(d)" :key="a.e + a.t" :color="a.c" size="small" variant="flat" :prepend-icon="a.i" :loading="accion === a.e + a.t" @click="hacer(a)">{{ a.t }}</v-btn>
          </div>
          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-btn v-if="esCreador(d)" size="small" variant="tonal" prepend-icon="mdi-pencil" @click="editarPend">Editar</v-btn>
            <v-btn size="small" variant="tonal" :prepend-icon="d.archivado ? 'mdi-archive-arrow-up-outline' : 'mdi-archive-outline'" @click="archivar">{{ d.archivado ? 'Desarchivar' : 'Archivar' }}</v-btn>
            <v-btn v-if="esCreador(d)" size="small" variant="tonal" color="error" prepend-icon="mdi-trash-can-outline" @click="eliminar">Eliminar</v-btn>
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

          <!-- Evidencias (solo lectura por ahora) -->
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
    </v-navigation-drawer>

    <!-- ============ CAPTURA / EDICIÓN ============ -->
    <v-dialog v-model="dlgCaptura" max-width="560">
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">{{ editId ? 'Editar pendiente' : 'Nuevo pendiente' }}</span>
          <v-btn icon="mdi-close" size="small" variant="text" @click="dlgCaptura = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.titulo" label="Título *" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
          <v-textarea v-model="form.descripcion" label="Descripción" variant="outlined" rows="2" auto-grow density="comfortable" class="mb-2"></v-textarea>
          <div class="d-flex ga-2">
            <v-select v-model="form.prioridad" :items="['Alta','Media','Baja']" label="Prioridad" variant="outlined" density="comfortable" class="mb-2"></v-select>
            <v-text-field v-model="form.area" label="Área" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
          </div>
          <v-select
            v-model="form.responsable_id" :items="store.usuarios" item-title="nombre" item-value="id"
            label="Responsable (delegar a)" variant="outlined" density="comfortable" clearable class="mb-2"
            :hint="!editId ? 'Si lo dejas vacío queda como capturado; si te eliges a ti, es tarea personal.' : ''" persistent-hint
          ></v-select>
          <div class="d-flex ga-2">
            <v-text-field v-model="form.cliente" label="Cliente" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
            <v-text-field v-model="form.fecha_compromiso" label="Fecha compromiso" type="date" variant="outlined" density="comfortable" class="mb-2"></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dlgCaptura = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="guardando" :disabled="!form.titulo.trim()" @click="guardar">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============ REAGENDAR ============ -->
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

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useInovaosStore } from '@/stores/inovaos';
import { useAuthStore } from '@/stores/auth';

const store = useInovaosStore();
const authStore = useAuthStore();
const authEmail = computed(() => authStore.user?.email || '');

const vista = ref('tablero');
const busqueda = ref('');
const fPrioridad = ref(null);
const loadingInit = ref(true);
const drawer = ref(false);
const accion = ref(null);
const nuevoChk = ref('');
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const d = computed(() => store.detalle?.pendiente || null);

const ESTATUS = [
  { key: 'capturado', label: 'Capturado', color: 'grey', icon: 'mdi-inbox-outline' },
  { key: 'delegado', label: 'Delegado', color: 'indigo', icon: 'mdi-send-outline' },
  { key: 'aceptado', label: 'Aceptado', color: 'cyan', icon: 'mdi-check' },
  { key: 'reagendado', label: 'Reagendado', color: 'deep-purple', icon: 'mdi-calendar-refresh-outline' },
  { key: 'en_progreso', label: 'En progreso', color: 'blue', icon: 'mdi-play' },
  { key: 'en_espera', label: 'En espera', color: 'orange', icon: 'mdi-pause' },
  { key: 'concluido', label: 'Concluido', color: 'teal', icon: 'mdi-flag-checkered' },
  { key: 'aprobado', label: 'Aprobado', color: 'green', icon: 'mdi-check-decagram' },
];
const estatusMeta = (k) => ESTATUS.find((e) => e.key === k) || { label: k, color: 'grey' };

const headers = [
  { title: 'Título', key: 'titulo' },
  { title: 'Responsable', key: 'responsable_nombre' },
  { title: 'Prioridad', key: 'prioridad', width: 110 },
  { title: 'Área', key: 'area', width: 120 },
  { title: 'Fecha', key: 'fecha_compromiso', width: 120 },
  { title: 'Semáforo', key: 'semaforo', sortable: false, width: 120 },
  { title: 'Estatus', key: 'estatus', width: 130 },
];

const colorPrioridad = (p) => ({ Alta: '#ff453a', Media: '#ff9f0a', Baja: '#30d158' }[p] || '#8a8699');
const fdate = (iso) => iso ? new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fdatetime = (iso) => iso ? new Date(String(iso).replace(' ', 'T') + 'Z').toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Monterrey' }) : '';

const semaforo = (p) => {
  if (['concluido', 'aprobado'].includes(p.estatus)) return { c: 'success', t: 'Concluido' };
  if (p.estatus === 'en_espera') return { c: 'grey', t: 'En espera' };
  if (!p.fecha_compromiso) return { c: 'grey', t: 'Sin fecha' };
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const f = new Date(String(p.fecha_compromiso).slice(0, 10) + 'T12:00:00'); f.setHours(0, 0, 0, 0);
  const dd = Math.round((f - hoy) / 86400000);
  if (dd < 0) return { c: 'error', t: `Vencido ${Math.abs(dd)}d` };
  if (dd === 0) return { c: 'error', t: 'Hoy' };
  if (dd === 1) return { c: 'warning', t: 'Mañana' };
  return { c: 'success', t: `En ${dd}d` };
};

const esCreador = (p) => store.myId != null && Number(p.creado_por) === store.myId;
const esResp = (p) => store.myId != null && Number(p.responsable_id) === store.myId;

const acciones = (p) => {
  const out = [];
  const est = p.estatus;
  if (esResp(p)) {
    if (est === 'delegado') out.push({ e: 'aceptado', t: 'Aceptar', i: 'mdi-check', c: 'success' });
    if (['aceptado', 'en_espera', 'reagendado'].includes(est)) out.push({ e: 'en_progreso', t: 'Iniciar', i: 'mdi-play', c: 'primary' });
    if (est === 'en_progreso') {
      out.push({ e: 'en_espera', t: 'En espera', i: 'mdi-pause', c: 'warning' });
      out.push({ e: 'concluido', t: 'Concluir', i: 'mdi-flag-checkered', c: 'success' });
    }
    if (['delegado', 'aceptado', 'en_progreso', 'en_espera'].includes(est)) out.push({ e: 'reagendado', t: 'Reagendar', i: 'mdi-calendar-edit', c: 'grey', fecha: true });
  }
  if (esCreador(p) && est === 'concluido') {
    out.push({ e: 'aprobado', t: 'Aprobar', i: 'mdi-check-decagram', c: 'success' });
    out.push({ e: 'en_progreso', t: 'Devolver', i: 'mdi-undo', c: 'error' });
  }
  return out;
};

// --- Listas / filtros ---
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

// --- Acciones ---
const recargar = () => store.fetchPendientes();
const toggleArchivados = async () => { store.verArchivados = !store.verArchivados; await store.fetchPendientes(); };

const abrir = async (id) => { drawer.value = true; store.detalle = null; await store.fetchDetalle(id); };

const dlgReagendar = ref(false);
const nuevaFecha = ref('');
let reagendarId = null;
const hacer = async (a) => {
  if (a.fecha) { reagendarId = d.value.id; nuevaFecha.value = d.value.fecha_compromiso || ''; dlgReagendar.value = true; return; }
  accion.value = a.e + a.t;
  try {
    await store.cambiarEstatus(d.value.id, a.e);
    notify(`Estatus actualizado: ${estatusMeta(a.e).label}`);
  } catch (err) { notify(msgError(err), 'error'); }
  finally { accion.value = null; }
};
const confirmarReagendar = async () => {
  accion.value = 'reagendar';
  try {
    await store.cambiarEstatus(reagendarId, 'reagendado', { fecha_compromiso: nuevaFecha.value });
    dlgReagendar.value = false;
    notify('Pendiente reagendado');
  } catch (err) { notify(msgError(err), 'error'); }
  finally { accion.value = null; }
};

const agregarChk = async () => {
  const t = nuevoChk.value.trim();
  if (!t) return;
  nuevoChk.value = '';
  try { await store.addChecklist(d.value.id, t); } catch (err) { notify(msgError(err), 'error'); }
};

const archivar = async () => {
  try { await store.archivar(d.value.id, !d.value.archivado); notify(d.value.archivado ? 'Desarchivado' : 'Archivado'); drawer.value = false; }
  catch (err) { notify(msgError(err), 'error'); }
};
const eliminar = async () => {
  if (!confirm('¿Eliminar este pendiente? No se puede deshacer.')) return;
  try { await store.eliminar(d.value.id); drawer.value = false; notify('Pendiente eliminado'); }
  catch (err) { notify(msgError(err), 'error'); }
};

// --- Captura / edición ---
const dlgCaptura = ref(false);
const guardando = ref(false);
const editId = ref(null);
const form = reactive({ titulo: '', descripcion: '', prioridad: 'Media', area: '', responsable_id: null, cliente: '', fecha_compromiso: '' });
const resetForm = () => Object.assign(form, { titulo: '', descripcion: '', prioridad: 'Media', area: '', responsable_id: null, cliente: '', fecha_compromiso: '' });

const nuevaCaptura = () => { editId.value = null; resetForm(); dlgCaptura.value = true; };
const editarPend = () => {
  editId.value = d.value.id;
  Object.assign(form, {
    titulo: d.value.titulo || '', descripcion: d.value.descripcion || '', prioridad: d.value.prioridad || 'Media',
    area: d.value.area || '', responsable_id: d.value.responsable_id || null, cliente: d.value.cliente || '',
    fecha_compromiso: d.value.fecha_compromiso ? String(d.value.fecha_compromiso).slice(0, 10) : '',
  });
  dlgCaptura.value = true;
};
const guardar = async () => {
  if (!form.titulo.trim()) return;
  guardando.value = true;
  try {
    const payload = { ...form, fecha_compromiso: form.fecha_compromiso || null };
    if (editId.value) { await store.editar(editId.value, payload); notify('Pendiente actualizado'); }
    else { await store.crear(payload); notify('Pendiente creado'); }
    dlgCaptura.value = false;
  } catch (err) { notify(msgError(err), 'error'); }
  finally { guardando.value = false; }
};

const msgError = (err) => err?.response?.data?.error || err?.response?.data?.msg || 'Ocurrió un error';

onMounted(async () => {
  await store.fetchUsuarios();
  if (store.habilitado) await store.fetchPendientes();
  loadingInit.value = false;
});
</script>

<style scoped>
.prio-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex: 0 0 auto; }
.kanban { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; align-items: flex-start; }
.kanban-col { flex: 0 0 260px; background: rgba(var(--v-theme-on-surface), 0.03); border-radius: 14px; padding: 8px; }
.kanban-head { display: flex; align-items: center; gap: 6px; padding: 4px 6px 8px; }
.kanban-body { min-height: 40px; }
.pend-card { padding: 10px 12px; cursor: pointer; transition: transform .12s ease; }
.pend-card:hover { transform: translateY(-1px); }
.pend-title { line-height: 1.3; }
</style>
