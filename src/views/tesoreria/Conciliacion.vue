<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Conciliación"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Conciliación', href: '#' }
      ]"
    />

    <!-- Filtros -->
    <v-card elevation="0" class="rounded-lg card-dark-blue mb-3">
      <v-card-text class="d-flex flex-wrap align-center ga-3">
        <v-btn-toggle v-model="filtroEstado" mandatory divided density="comfortable" color="primary">
          <v-btn value="Todas" size="small">Todas ({{ facturas.length }})</v-btn>
          <v-btn value="PENDIENTE" size="small">🔴 Pendientes ({{ countBy('PENDIENTE') }})</v-btn>
          <v-btn value="PARCIAL" size="small">🟡 Parciales ({{ countBy('PARCIAL') }})</v-btn>
          <v-btn value="CONCILIADA" size="small">🟢 Conciliadas ({{ countBy('CONCILIADA') }})</v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field v-model="search" density="compact" variant="solo-filled" flat hide-details
          placeholder="Buscar factura…" prepend-inner-icon="mdi-magnify" style="max-width:240px" />
        <v-btn icon="mdi-refresh" variant="text" @click="loadAll" title="Recargar" />
      </v-card-text>
    </v-card>

    <v-row>
      <!-- IZQUIERDA: ingresos sin conciliar -->
      <v-col cols="12" md="5">
        <v-card elevation="0" class="rounded-lg card-dark-blue h-100">
          <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
            <v-icon class="mr-2 text-success">mdi-cash-plus</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Ingresos sin conciliar</v-toolbar-title>
          </v-toolbar>
          <v-alert v-if="!selectedFactura" type="info" variant="tonal" density="compact" class="ma-3">
            Selecciona una factura de la derecha para vincularle ingresos.
          </v-alert>
          <v-alert v-else type="primary" variant="tonal" density="compact" class="ma-3">
            Vinculando a: <strong>Folio {{ selectedFactura.folio_sap }}</strong>
          </v-alert>
          <v-data-table :headers="ingHeaders" :items="ingresosLibres" :loading="loadingIng" density="compact"
            class="bg-transparent dark-table" :items-per-page="10" no-data-text="No hay ingresos sin conciliar.">
            <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
            <template v-slot:item.monto="{ item }"><span class="font-weight-bold text-success">{{ money(item.monto) }}</span></template>
            <template v-slot:item.acciones="{ item }">
              <v-btn size="x-small" color="primary" variant="flat" :disabled="!selectedFactura"
                :loading="linkingId === item.id" @click="vincular(item)">Vincular</v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- DERECHA: facturas de proveedor -->
      <v-col cols="12" md="7">
        <!-- Detalle de la factura seleccionada -->
        <v-expand-transition>
          <v-card v-if="selectedFactura" elevation="0" class="rounded-lg card-dark-blue mb-3" border>
            <v-toolbar :color="estatusColor(selectedFactura.estatus)" density="compact">
              <v-toolbar-title class="font-weight-bold">
                Folio {{ selectedFactura.folio_sap }} · {{ selectedFactura.card_code === 'P0148' ? 'Trade' : 'Log' }}
              </v-toolbar-title>
              <v-spacer />
              <v-chip size="small" variant="flat" class="mr-2 font-weight-bold">{{ estatusLabel(selectedFactura.estatus) }}</v-chip>
              <v-btn icon="mdi-close" size="small" @click="clearSelection" />
            </v-toolbar>
            <v-card-text>
              <div class="text-caption text-light-muted mb-2">{{ selectedFactura.card_name }} · Ref {{ selectedFactura.numatcard || '—' }}</div>
              <v-row dense class="mb-2">
                <v-col cols="4"><div class="text-caption text-light-muted">Valor</div><div class="text-subtitle-1 font-weight-bold">{{ money(selectedFactura.subtotal) }}</div></v-col>
                <v-col cols="4"><div class="text-caption text-light-muted">Recibido</div><div class="text-subtitle-1 text-success">{{ money(selectedFactura.abonado) }}</div></v-col>
                <v-col cols="4"><div class="text-caption text-light-muted">Pendiente</div><div class="text-subtitle-1 text-warning">{{ money(selectedFactura.subtotal - selectedFactura.abonado) }}</div></v-col>
              </v-row>
              <v-divider class="border-b-dark mb-2" />
              <div class="text-subtitle-2 font-weight-bold mb-1">Ingresos conciliados</div>
              <v-table density="compact" class="bg-transparent dark-table">
                <tbody>
                  <tr v-for="a in abonos" :key="a.id">
                    <td class="text-light-muted">{{ fmtDate(a.fecha_operacion || a.fecha) }}</td>
                    <td>{{ a.concepto || '—' }}</td>
                    <td class="text-right text-success font-weight-bold">{{ money(a.monto_abonado) }}</td>
                    <td class="text-right">
                      <v-btn icon="mdi-link-variant-off" size="x-small" variant="text" color="error"
                        title="Desvincular" @click="desvincular(a)" />
                    </td>
                  </tr>
                  <tr v-if="!abonos.length"><td colspan="4" class="text-center text-light-muted py-3">Sin ingresos conciliados</td></tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-toolbar color="transparent" density="comfortable" class="header-dark-blue border-b-dark px-4">
            <v-icon class="mr-2 text-primary">mdi-file-document-multiple-outline</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-white">Facturas de proveedor (Trade / Log)</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="facHeaders" :items="facturasFiltradas" :search="search" :loading="loadingFac"
            density="compact" class="bg-transparent dark-table cursor-table" :items-per-page="15" hover
            @click:row="onRowFactura">
            <template v-slot:item.estatus="{ item }">
              <v-chip :color="estatusColor(item.estatus)" size="x-small" variant="flat" class="font-weight-bold">
                {{ estatusLabel(item.estatus) }}
              </v-chip>
            </template>
            <template v-slot:item.card_code="{ item }">
              <v-chip size="x-small" variant="tonal" :color="item.card_code === 'P0148' ? 'primary' : 'info'">{{ item.card_code === 'P0148' ? 'Trade' : 'Log' }}</v-chip>
            </template>
            <template v-slot:item.subtotal="{ item }">{{ money(item.subtotal) }}</template>
            <template v-slot:item.abonado="{ item }"><span :class="item.abonado>0?'text-success':'text-light-muted'">{{ money(item.abonado) }}</span></template>
            <template v-slot:item.pendiente="{ item }"><strong :class="item.pendiente>0?'text-warning':'text-success'">{{ money(item.pendiente) }}</strong></template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3500" location="top right">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const facturas = ref([]);
const ingresosLibres = ref([]);
const abonos = ref([]);
const selectedFactura = ref(null);
const loadingFac = ref(false), loadingIng = ref(false);
const linkingId = ref(null);
const search = ref('');
const filtroEstado = ref('Todas');
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const facHeaders = [
  { title: 'Estatus', key: 'estatus', width: 110 },
  { title: 'Prov.', key: 'card_code', width: 70, sortable: false },
  { title: 'Folio', key: 'folio_sap', width: 78 },
  { title: 'Ref.', key: 'numatcard', width: 84 },
  { title: 'Valor', key: 'subtotal', align: 'end', width: 110 },
  { title: 'Recibido', key: 'abonado', align: 'end', width: 100 },
  { title: 'Pendiente', key: 'pendiente', align: 'end', width: 110 },
];
const ingHeaders = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Monto', key: 'monto', align: 'end' },
  { title: '', key: 'acciones', align: 'end', sortable: false },
];

const countBy = (e) => facturas.value.filter(f => f.estatus === e).length;
const facturasFiltradas = computed(() =>
  filtroEstado.value === 'Todas' ? facturas.value : facturas.value.filter(f => f.estatus === filtroEstado.value));

const loadFacturas = async () => {
  loadingFac.value = true;
  try { facturas.value = (await axios.get('/tesoreria/conciliacion/facturas')).data; }
  catch (e) { notify('Error cargando facturas', 'error'); }
  finally { loadingFac.value = false; }
};
const loadIngresos = async () => {
  loadingIng.value = true;
  try { ingresosLibres.value = (await axios.get('/tesoreria/conciliacion/ingresos-libres')).data; }
  catch (e) { notify('Error cargando ingresos', 'error'); }
  finally { loadingIng.value = false; }
};
const loadAll = async () => { await Promise.all([loadFacturas(), loadIngresos()]); if (selectedFactura.value) await refreshSelected(); };

const refreshSelected = async () => {
  const f = facturas.value.find(x => x.docentry === selectedFactura.value.docentry);
  selectedFactura.value = f || selectedFactura.value;
  if (selectedFactura.value) {
    abonos.value = (await axios.get(`/tesoreria/conciliacion/factura/${selectedFactura.value.docentry}/abonos`)).data;
  }
};

const onRowFactura = async (_e, row) => {
  const f = row?.item ?? row;
  selectedFactura.value = f;
  try { abonos.value = (await axios.get(`/tesoreria/conciliacion/factura/${f.docentry}/abonos`)).data; }
  catch (e) { abonos.value = []; }
};
const clearSelection = () => { selectedFactura.value = null; abonos.value = []; };

const vincular = async (ingreso) => {
  if (!selectedFactura.value) return;
  linkingId.value = ingreso.id;
  try {
    await axios.post('/tesoreria/conciliacion', { operacion_id: ingreso.id, docentry: selectedFactura.value.docentry });
    notify('Ingreso vinculado');
    await Promise.all([loadFacturas(), loadIngresos()]);
    await refreshSelected();
  } catch (e) { notify(e.response?.data?.message || 'Error al vincular', 'error'); }
  finally { linkingId.value = null; }
};

const desvincular = async (a) => {
  if (!confirm('¿Desvincular este ingreso de la factura?')) return;
  try {
    await axios.delete(`/tesoreria/conciliacion/${a.id}`);
    notify('Ingreso desvinculado');
    await Promise.all([loadFacturas(), loadIngresos()]);
    await refreshSelected();
  } catch (e) { notify('Error al desvincular', 'error'); }
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
const estatusColor = (e) => e === 'CONCILIADA' ? 'success' : (e === 'PARCIAL' ? 'warning' : 'error');
const estatusLabel = (e) => e === 'CONCILIADA' ? 'Conciliada' : (e === 'PARCIAL' ? 'Parcial' : 'Pendiente');

onMounted(loadAll);
</script>

<style scoped>
.cursor-table :deep(tbody tr) { cursor: pointer; }
.factura-table :deep(table) { table-layout: fixed; width: 100%; }
</style>
