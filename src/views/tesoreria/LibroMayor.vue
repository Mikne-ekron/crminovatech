<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Libro Mayor"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Libro Mayor', href: '#' }
      ]"
    />

    <v-card elevation="0" class="rounded-lg card-dark-blue mb-3">
      <v-card-text class="d-flex flex-wrap align-center ga-3">
        <v-btn-toggle v-model="filtroTipo" mandatory divided density="comfortable" color="primary">
          <v-btn value="Todos" size="small">Todos</v-btn>
          <v-btn value="Ingreso" size="small">Ingresos</v-btn>
          <v-btn value="Egreso" size="small">Egresos</v-btn>
          <v-btn value="Traspaso" size="small">Traspasos</v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field v-model="search" density="compact" variant="solo-filled" flat hide-details
          placeholder="Buscar…" prepend-inner-icon="mdi-magnify" style="max-width:240px" />
        <v-btn icon="mdi-refresh" variant="text" @click="load" title="Recargar" />
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="rounded-lg card-dark-blue">
      <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
        <v-icon class="mr-2 text-primary">mdi-book-open-variant</v-icon>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Todas las operaciones</v-toolbar-title>
        <v-spacer />
        <v-btn color="success" variant="tonal" prepend-icon="mdi-file-excel" class="mr-3"
          :disabled="!filtered.length" @click="exportExcel">Exportar Excel</v-btn>
        <v-chip color="primary" variant="flat">{{ filtered.length }} operaciones</v-chip>
      </v-toolbar>
      <v-data-table
        :headers="headers" :items="filtered" :loading="loading" density="compact"
        class="bg-transparent dark-table cursor-table lm-table" :sort-by="[{ key: 'fecha', order: 'desc' }]"
        hover @click:row="onRow"
      >
        <!-- Filtros por columna -->
        <template v-slot:header.concepto="{ column }">
          <div class="d-flex align-center"><span>{{ column.title }}</span>
            <v-menu :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }"><v-btn v-bind="props" :color="colFilters.concepto ? 'primary' : ''" icon size="x-small" variant="text" class="ml-1"><v-icon size="15">mdi-filter-variant</v-icon></v-btn></template>
              <v-card min-width="230" class="pa-2"><v-text-field v-model="colFilters.concepto" label="Contiene…" density="compact" variant="outlined" hide-details clearable autofocus></v-text-field></v-card>
            </v-menu>
          </div>
        </template>
        <template v-slot:header.categoria="{ column }">
          <div class="d-flex align-center"><span>{{ column.title }}</span>
            <v-menu :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }"><v-btn v-bind="props" :color="colFilters.categoria ? 'primary' : ''" icon size="x-small" variant="text" class="ml-1"><v-icon size="15">mdi-filter-variant</v-icon></v-btn></template>
              <v-card min-width="230" class="pa-2"><v-text-field v-model="colFilters.categoria" label="Contiene…" density="compact" variant="outlined" hide-details clearable autofocus></v-text-field></v-card>
            </v-menu>
          </div>
        </template>
        <template v-slot:header.ruta="{ column }">
          <div class="d-flex align-center"><span>{{ column.title }}</span>
            <v-menu :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }"><v-btn v-bind="props" :color="colFilters.ruta ? 'primary' : ''" icon size="x-small" variant="text" class="ml-1"><v-icon size="15">mdi-filter-variant</v-icon></v-btn></template>
              <v-card min-width="230" class="pa-2"><v-text-field v-model="colFilters.ruta" label="Contiene…" density="compact" variant="outlined" hide-details clearable autofocus></v-text-field></v-card>
            </v-menu>
          </div>
        </template>
        <template v-slot:header.usuario="{ column }">
          <div class="d-flex align-center"><span>{{ column.title }}</span>
            <v-menu :close-on-content-click="false" location="bottom">
              <template v-slot:activator="{ props }"><v-btn v-bind="props" :color="colFilters.usuario ? 'primary' : ''" icon size="x-small" variant="text" class="ml-1"><v-icon size="15">mdi-filter-variant</v-icon></v-btn></template>
              <v-card min-width="230" class="pa-2"><v-text-field v-model="colFilters.usuario" label="Contiene…" density="compact" variant="outlined" hide-details clearable autofocus></v-text-field></v-card>
            </v-menu>
          </div>
        </template>

        <!-- Celdas -->
        <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
        <template v-slot:item.tipo="{ item }"><v-chip size="x-small" :color="tipoColor(item.tipo)" variant="tonal" class="font-weight-bold">{{ item.tipo }}</v-chip></template>
        <template v-slot:item.concepto="{ item }"><span :title="item.concepto">{{ item.concepto }}</span></template>
        <template v-slot:item.categoria="{ item }">
          <span :title="(item.categoria && item.categoria !== '-' ? item.categoria : '') + (item.subcategoria ? ' / ' + item.subcategoria : '')">
            {{ item.categoria && item.categoria !== '-' ? item.categoria : '—' }}<span v-if="item.subcategoria" class="text-light-muted"> / {{ item.subcategoria }}</span>
          </span>
        </template>
        <template v-slot:item.ruta="{ item }"><span class="text-light-muted" :title="ruta(item)">{{ ruta(item) }}</span></template>
        <template v-slot:item.monto="{ item }"><span class="font-weight-bold">{{ money(item.monto) }}</span></template>
        <template v-slot:item.ingreso="{ item }"><span v-if="item.ingreso>0" class="text-success font-weight-bold">+{{ money(item.ingreso) }}</span><span v-else class="text-light-muted">-</span></template>
        <template v-slot:item.egreso="{ item }"><span v-if="item.egreso>0" class="text-error font-weight-bold">-{{ money(item.egreso) }}</span><span v-else class="text-light-muted">-</span></template>
        <template v-slot:item.acciones="{ item }">
          <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary" @click.stop="openEdit(item)" />
          <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click.stop="askDelete(item)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- DETALLE -->
    <v-dialog v-model="detalle.show" max-width="560">
      <v-card class="card-dark-blue" v-if="detalle.op">
        <v-toolbar :color="tipoColor(detalle.op.tipo)" density="compact">
          <v-icon class="ml-4">mdi-information-outline</v-icon>
          <v-toolbar-title class="font-weight-bold">Operación #{{ detalle.op.id }} · {{ detalle.op.tipo }}</v-toolbar-title>
          <v-btn icon @click="detalle.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-table density="compact" class="bg-transparent dark-table">
            <tbody>
              <tr><td class="text-light-muted">Fecha</td><td class="text-right">{{ fmtDate(detalle.op.fecha) }}</td></tr>
              <tr><td class="text-light-muted">Concepto</td><td class="text-right">{{ detalle.op.concepto || '—' }}</td></tr>
              <tr><td class="text-light-muted">Monto</td><td class="text-right font-weight-bold">{{ money(detalle.op.monto) }}</td></tr>
              <tr><td class="text-light-muted">Ingreso / Egreso</td><td class="text-right">{{ money(detalle.op.ingreso) }} / {{ money(detalle.op.egreso) }}</td></tr>
              <tr v-if="detalle.op.categoria"><td class="text-light-muted">Categoría</td><td class="text-right">{{ detalle.op.categoria }}<span v-if="detalle.op.subcategoria"> / {{ detalle.op.subcategoria }}</span></td></tr>
              <tr><td class="text-light-muted">Sobre origen → destino</td><td class="text-right">{{ detalle.op.sobre_origen || '—' }} → {{ detalle.op.sobre_destino || '—' }}</td></tr>
              <tr v-if="detalle.op.tipo_ingreso"><td class="text-light-muted">Tipo de ingreso</td><td class="text-right">{{ detalle.op.tipo_ingreso }}</td></tr>
              <tr v-if="detalle.op.origen_ingreso"><td class="text-light-muted">Origen</td><td class="text-right">{{ detalle.op.origen_ingreso }}</td></tr>
              <tr v-if="detalle.op.num_cheque"><td class="text-light-muted">No. cheque</td><td class="text-right">{{ detalle.op.num_cheque }}</td></tr>
              <tr v-if="detalle.op.contado"><td class="text-light-muted">Efectivo contado</td><td class="text-right">{{ money(detalle.op.monto_contado) }} <span class="text-light-muted">({{ fmtDate(detalle.op.fecha_conteo) }})</span></td></tr>
              <tr><td class="text-light-muted">Usuario</td><td class="text-right">{{ detalle.op.usuario || '—' }}</td></tr>
            </tbody>
          </v-table>
          <template v-if="detalle.conciliaciones.length">
            <div class="text-subtitle-2 font-weight-bold mt-3 mb-1">Conciliación de factura</div>
            <v-alert v-for="c in detalle.conciliaciones" :key="c.id" type="info" variant="tonal" density="compact" class="mb-1">
              Folio {{ c.sap_docnum }} · Ref {{ c.numatcard || '—' }} · {{ money(c.monto_abonado) }} de {{ money(c.subtotal) }}
            </v-alert>
          </template>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="detalle.show=false">Cerrar</v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-pencil" @click="openEdit(detalle.op); detalle.show=false">Editar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDITAR -->
    <v-dialog v-model="edit.show" max-width="500" persistent>
      <v-card class="card-dark-blue">
        <v-toolbar color="primary" density="compact">
          <v-icon class="ml-4">mdi-pencil</v-icon>
          <v-toolbar-title class="font-weight-bold">Editar operación #{{ edit.id }}</v-toolbar-title>
          <v-btn icon @click="edit.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-form ref="form">
            <v-select v-model="edit.tipo" :items="['Ingreso','Egreso','Traspaso']" label="Tipo" variant="outlined" @update:model-value="onTipoChange" />
            <v-text-field v-model.number="edit.monto" label="Monto ($)" type="number" prefix="$" variant="outlined" :rules="[v => v>0 || 'Requerido']" />
            <v-text-field v-model="edit.concepto" label="Concepto" variant="outlined" />
            <v-select v-if="edit.tipo !== 'Ingreso'" v-model="edit.sobreOrigen" :items="sobres" label="Sobre origen" variant="outlined" clearable />
            <v-select v-if="edit.tipo !== 'Egreso'" v-model="edit.sobreDestino" :items="sobres" label="Sobre destino" variant="outlined" clearable />
            <template v-if="edit.tipo === 'Egreso'">
              <v-select v-model="edit.categoria" :items="categorias" item-title="nombre" item-value="nombre" label="Categoría" variant="outlined" clearable @update:model-value="edit.subcategoria=null" />
              <v-select v-if="subcatsEdit.length" v-model="edit.subcategoria" :items="subcatsEdit" item-title="nombre" item-value="nombre" label="Subcategoría" variant="outlined" clearable />
            </template>

            <!-- Cambiar factura conciliada (Abono de Deudor por factura) -->
            <template v-if="edit.tieneConciliacion">
              <v-divider class="border-b-dark my-3" />
              <div class="text-caption text-light-muted mb-1">Factura conciliada</div>
              <v-alert v-if="edit.facturaNueva" type="success" variant="tonal" density="compact" class="mb-2">
                Nueva: <strong>Folio {{ edit.facturaNueva.folio_sap }}</strong> · Ref {{ edit.facturaNueva.numatcard || '—' }} · {{ money(edit.facturaNueva.subtotal) }}
              </v-alert>
              <v-alert v-else-if="edit.facturaActual" type="info" variant="tonal" density="compact" class="mb-2">
                Actual: <strong>Folio {{ edit.facturaActual.folio_sap }}</strong> · Ref {{ edit.facturaActual.numatcard || '—' }} · {{ money(edit.facturaActual.subtotal) }}
              </v-alert>
              <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-file-search-outline" @click="openFacturaModal">Cambiar factura</v-btn>
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="edit.show=false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL: cambiar factura conciliada -->
    <v-dialog v-model="facturaModal.show" max-width="1040" scrollable>
      <v-card class="card-dark-blue">
        <v-toolbar color="primary" density="compact">
          <v-icon class="ml-4">mdi-file-search-outline</v-icon>
          <v-toolbar-title class="font-weight-bold">Selecciona la nueva factura (Trade / Log, pagadas)</v-toolbar-title>
          <v-btn icon @click="facturaModal.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text style="max-height:70vh">
          <v-text-field v-model="facturaModal.search" prepend-inner-icon="mdi-magnify"
            placeholder="Buscar por folio, referencia o concepto…" density="compact" variant="outlined" hide-details class="mb-2" />
          <div class="text-caption text-light-muted mb-2"><v-icon size="14" class="mr-1">mdi-cursor-default-click</v-icon>Haz clic en una factura para seleccionarla.</div>
          <v-data-table :headers="facturaHeaders" :items="facturaModal.items" :search="facturaModal.search"
            :loading="facturaModal.loading" density="compact" class="bg-transparent dark-table factura-table"
            :items-per-page="10" hover @click:row="onRowFacturaEdit">
            <template v-slot:item.card_code="{ item }">
              <v-chip size="x-small" variant="tonal" :color="item.card_code === 'P0148' ? 'primary' : 'info'">{{ item.card_code === 'P0148' ? 'Trade' : 'Log' }}</v-chip>
            </template>
            <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
            <template v-slot:item.concepto="{ item }"><span :title="item.concepto">{{ item.concepto || '—' }}</span></template>
            <template v-slot:item.subtotal="{ item }">{{ money(item.subtotal) }}</template>
            <template v-slot:item.abonado="{ item }"><span :class="item.abonado>0?'text-success':'text-light-muted'">{{ money(item.abonado) }}</span></template>
            <template v-slot:item.pendiente="{ item }"><strong>{{ money(item.subtotal - item.abonado) }}</strong></template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ELIMINAR -->
    <v-dialog v-model="del.show" max-width="420">
      <v-card class="card-dark-blue">
        <v-card-text class="pt-5 text-center">
          <v-avatar color="error" variant="tonal" size="56" class="mb-3"><v-icon size="30">mdi-delete-alert</v-icon></v-avatar>
          <h3 class="text-h6 font-weight-bold mb-1">¿Eliminar operación?</h3>
          <p class="text-light-muted">Se eliminará la operación #{{ del.item?.id }} de forma permanente. Si tiene conciliación de factura, también se quitará.</p>
        </v-card-text>
        <v-card-actions class="border-t-dark px-4 pb-3">
          <v-spacer />
          <v-btn variant="text" @click="del.show=false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';
import * as XLSX from 'xlsx';

const authStore = useAuthStore();
const items = ref([]);
const sobres = ref([]);
const categorias = ref([]);
const loading = ref(false), saving = ref(false), deleting = ref(false);
const search = ref('');
const filtroTipo = ref('Todos');
const form = ref(null);
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'Fecha', key: 'fecha', width: '150px' },
  { title: 'Tipo', key: 'tipo', width: '92px' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Categoría', key: 'categoria', width: '150px' },
  { title: 'Ruta / Sobre', key: 'ruta', sortable: false, width: '150px' },
  { title: 'Monto Op.', key: 'monto', align: 'end', width: '110px' },
  { title: 'Ingreso', key: 'ingreso', align: 'end', width: '104px' },
  { title: 'Egreso', key: 'egreso', align: 'end', width: '104px' },
  { title: 'Usuario', key: 'usuario', width: '100px' },
  { title: '', key: 'acciones', align: 'end', sortable: false, width: '78px' },
];

// Filtros por columna (además del toggle de tipo y la búsqueda global)
const colFilters = ref({ concepto: '', categoria: '', ruta: '', usuario: '' });

// Filtrado completo (toggle de tipo + filtros de columna + búsqueda). El export
// usa este mismo resultado, por lo que respeta todos los filtros aplicados.
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  const f = colFilters.value;
  const inc = (val, term) => String(val ?? '').toLowerCase().includes(String(term).toLowerCase());
  return items.value.filter(o => {
    if (filtroTipo.value !== 'Todos' && o.tipo !== filtroTipo.value) return false;
    if (f.concepto && !inc(o.concepto, f.concepto)) return false;
    if (f.categoria && !inc(o.categoria, f.categoria)) return false;
    if (f.ruta && !inc(ruta(o), f.ruta)) return false;
    if (f.usuario && !inc(o.usuario, f.usuario)) return false;
    if (q) {
      const hay = [o.concepto, o.tipo, o.categoria, o.subcategoria, ruta(o), o.usuario, fmtDate(o.fecha)]
        .map(x => String(x ?? '').toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

const load = async () => {
  loading.value = true;
  try {
    const [ro, rs, rc] = await Promise.all([
      axios.get('/tesoreria/operaciones'),
      axios.get('/tesoreria/sobres'),
      axios.get('/tesoreria/categorias'),
    ]);
    items.value = ro.data.map(o => ({
      ...o,
      ingreso: parseFloat(o.ingreso || 0),
      egreso: parseFloat(o.egreso || 0),
      monto: parseFloat(o.monto || 0),
    }));
    sobres.value = rs.data.map(s => s.nombre);
    categorias.value = rc.data;
  } catch (e) { notify('Error cargando operaciones', 'error'); }
  finally { loading.value = false; }
};

// Detalle
const detalle = ref({ show: false, op: null, conciliaciones: [] });
const onRow = async (_e, row) => {
  const item = row?.item ?? row;
  try {
    const r = await axios.get(`/tesoreria/operaciones/${item.id}`);
    detalle.value = { show: true, op: r.data.operacion, conciliaciones: r.data.conciliaciones || [] };
  } catch (e) { notify('Error abriendo detalle', 'error'); }
};

// Editar
const edit = ref({ show: false, id: null, tipo: 'Ingreso', monto: null, concepto: '', sobreOrigen: null, sobreDestino: null, categoria: null, subcategoria: null, tieneConciliacion: false, facturaActual: null, facturaNueva: null });
const subcatsEdit = computed(() => categorias.value.find(c => c.nombre === edit.value.categoria)?.subcategorias || []);
const onTipoChange = () => { /* mantener valores; el template oculta lo no aplicable */ };
const openEdit = async (o) => {
  edit.value = {
    show: true, id: o.id, tipo: o.tipo, monto: Number(o.monto), concepto: o.concepto,
    sobreOrigen: o.sobre_origen || null, sobreDestino: o.sobre_destino || null,
    categoria: (o.categoria && o.categoria !== '-') ? o.categoria : null, subcategoria: o.subcategoria || null,
    tieneConciliacion: false, facturaActual: null, facturaNueva: null,
  };
  try {
    const r = await axios.get(`/tesoreria/operaciones/${o.id}`);
    const c = (r.data.conciliaciones || [])[0];
    if (c) {
      edit.value.tieneConciliacion = true;
      edit.value.facturaActual = { folio_sap: c.sap_docnum, numatcard: c.numatcard, subtotal: c.subtotal, docentry: c.sap_docentry };
    }
  } catch (e) { /* sin conciliación */ }
};

// Modal de selección de factura para el cambio en edición
const facturaModal = ref({ show: false, loading: false, items: [], search: '' });
const facturaHeaders = [
  { title: 'Prov.', key: 'card_code', width: 62, sortable: false },
  { title: 'Folio', key: 'folio_sap', width: 76 },
  { title: 'Ref.', key: 'numatcard', width: 84 },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Fecha', key: 'fecha', width: 92 },
  { title: 'Valor', key: 'subtotal', align: 'end', width: 108 },
  { title: 'Abonado', key: 'abonado', align: 'end', width: 100 },
  { title: 'Pendiente', key: 'pendiente', align: 'end', width: 108 },
];
const openFacturaModal = async () => {
  facturaModal.value.show = true;
  facturaModal.value.loading = true;
  try {
    const r = await axios.get('/tesoreria/sap/facturas-proveedor');
    facturaModal.value.items = r.data.map(f => ({ ...f, pendiente: Number(f.subtotal) - Number(f.abonado || 0) }));
  } catch (e) { notify('Error cargando facturas SAP', 'error'); }
  finally { facturaModal.value.loading = false; }
};
const selectFacturaEdit = (f) => { const row = f?.raw ?? f; if (row) edit.value.facturaNueva = row; facturaModal.value.show = false; };
const onRowFacturaEdit = (_e, row) => selectFacturaEdit(row?.item ?? row);
const save = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    await axios.put(`/tesoreria/operaciones/${edit.value.id}`, {
      concepto: edit.value.concepto,
      tipo: edit.value.tipo,
      monto: edit.value.monto,
      categoria: edit.value.tipo === 'Egreso' ? edit.value.categoria : null,
      subcategoria: edit.value.tipo === 'Egreso' ? edit.value.subcategoria : null,
      sobreOrigen: edit.value.tipo !== 'Ingreso' ? edit.value.sobreOrigen : null,
      sobreDestino: edit.value.tipo !== 'Egreso' ? edit.value.sobreDestino : null,
      docentry: edit.value.facturaNueva ? edit.value.facturaNueva.docentry : undefined,
      usuario: authStore.user?.name || 'Usuario',
    });
    notify('Operación actualizada');
    edit.value.show = false;
    await load();
  } catch (e) { notify(e.response?.data?.message || 'Error al guardar', 'error'); }
  finally { saving.value = false; }
};

// Eliminar
const del = ref({ show: false, item: null });
const askDelete = (o) => { del.value = { show: true, item: o }; };
const confirmDelete = async () => {
  deleting.value = true;
  try {
    await axios.delete(`/tesoreria/operaciones/${del.value.item.id}`);
    notify('Operación eliminada');
    del.value.show = false;
    await load();
  } catch (e) { notify('Error al eliminar', 'error'); }
  finally { deleting.value = false; }
};

// Exportar a Excel las operaciones filtradas
const exportExcel = () => {
  const rows = filtered.value.map(o => ({
    Fecha: fmtDate(o.fecha),
    Concepto: o.concepto || '',
    Tipo: o.tipo,
    'Categoría': (o.categoria && o.categoria !== '-') ? o.categoria : '',
    'Subcategoría': o.subcategoria || '',
    'Sobre origen': o.sobre_origen || '',
    'Sobre destino': o.sobre_destino || '',
    Ingreso: Number(o.ingreso || 0),
    Egreso: Number(o.egreso || 0),
    Monto: Number(o.monto || 0),
    Usuario: o.usuario || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 34 }, { wch: 10 }, { wch: 18 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Libro Mayor');
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `libro_mayor_${stamp}.xlsx`);
};

const ruta = (o) => o.tipo === 'Traspaso' ? `${o.sobre_origen || '-'} → ${o.sobre_destino || '-'}` : (o.sobre_destino || o.sobre_origen || '—');
const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const tipoColor = (t) => t === 'Ingreso' ? 'success' : (t === 'Egreso' ? 'error' : 'warning');

onMounted(load);
</script>

<style scoped>
.cursor-table :deep(tbody tr) { cursor: pointer; }
/* Libro Mayor: anchos fijos, sin scroll horizontal */
.lm-table :deep(table) { table-layout: fixed; width: 100%; }
.lm-table :deep(th), .lm-table :deep(td) {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-size: 12px; padding-inline: 8px !important;
}
.lm-table :deep(th .d-flex) { overflow: visible; }
.factura-table :deep(table) { table-layout: fixed; width: 100%; }
.factura-table :deep(th), .factura-table :deep(td) {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; padding-inline: 8px !important;
}
.factura-table :deep(tbody tr) { cursor: pointer; }
</style>
