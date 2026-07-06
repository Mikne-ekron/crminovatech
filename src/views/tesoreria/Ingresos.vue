<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Ingresos — Conciliación de facturas"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Ingresos', href: '#' }
      ]"
    />

    <!-- Barra de acciones -->
    <v-row class="mb-2" dense>
      <v-col cols="12" class="d-flex flex-wrap ga-2 align-center">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-sync" :loading="syncing" @click="syncSap">
          Sincronizar SAP (Trade/Log)
        </v-btn>
        <v-btn color="success" variant="tonal" prepend-icon="mdi-cash-plus" @click="openManual('DEUDOR')">
          Abono de deudor
        </v-btn>
        <v-btn color="info" variant="tonal" prepend-icon="mdi-checkbook" @click="openManual('CHEQUE')">
          Cheque
        </v-btn>
        <v-btn color="warning" variant="tonal" prepend-icon="mdi-pencil-plus" @click="openManual('MANUAL')">
          Manual / Caja chica
        </v-btn>
        <v-spacer />
        <v-btn-toggle v-model="filtroEstado" density="compact" mandatory variant="outlined" divided>
          <v-btn value="Todos" size="small">Todos</v-btn>
          <v-btn value="PENDIENTE" size="small" class="text-error">Rojo</v-btn>
          <v-btn value="PARCIAL" size="small" class="text-warning">Parcial</v-btn>
          <v-btn value="PAGADA" size="small" class="text-success">Verde</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- KPIs de conciliación -->
    <v-row dense class="mb-2">
      <v-col cols="12" sm="4">
        <v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center">
          <p class="text-subtitle-1 text-light-muted mb-1">Por cobrar (saldo abierto)</p>
          <h3 class="text-h4 text-warning">{{ money(totalPorCobrar) }}</h3>
        </v-card-text></v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center">
          <p class="text-subtitle-1 text-light-muted mb-1">Facturas en rojo</p>
          <h3 class="text-h4 text-error">{{ facturas.filter(f => f.estado==='PENDIENTE').length }}</h3>
        </v-card-text></v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center">
          <p class="text-subtitle-1 text-light-muted mb-1">Recibido sin confirmar</p>
          <h3 class="text-h4 text-info">{{ money(totalSinConfirmar) }}</h3>
        </v-card-text></v-card>
      </v-col>
    </v-row>

    <!-- Tabla de facturas -->
    <v-card class="rounded-lg card-dark-blue" elevation="0">
      <v-data-table
        :headers="headers"
        :items="facturasFiltradas"
        :loading="loading"
        item-value="id"
        density="compact"
        class="bg-transparent dark-table"
        hover
        @click:row="(_, { item }) => openDetalle(item)"
      >
        <template v-slot:item.estado="{ item }">
          <v-chip :color="semaforo(item.estado)" size="small" variant="flat" class="font-weight-bold">
            <v-icon start size="small">{{ item.estado==='PAGADA' ? 'mdi-check-circle' : (item.estado==='PARCIAL' ? 'mdi-progress-clock' : 'mdi-alert-circle') }}</v-icon>
            {{ item.estado }}
          </v-chip>
        </template>
        <template v-slot:item.origen="{ item }">
          <v-chip size="x-small" variant="tonal" :color="origenColor(item.origen)">{{ origenLabel(item.origen) }}</v-chip>
        </template>
        <template v-slot:item.subtotal="{ item }"><span class="font-weight-bold">{{ money(item.subtotal) }}</span></template>
        <template v-slot:item.total_confirmado="{ item }"><span class="text-success">{{ money(item.total_confirmado) }}</span></template>
        <template v-slot:item.saldo_pendiente="{ item }">
          <strong :class="item.saldo_pendiente > 0 ? 'text-warning' : 'text-success'">{{ money(item.saldo_pendiente) }}</strong>
        </template>
        <template v-slot:item.fecha_documento="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha_documento) }}</span></template>
      </v-data-table>
    </v-card>

    <!-- ============ DIALOG: NUEVA FACTURA MANUAL ============ -->
    <v-dialog v-model="manual.show" max-width="520">
      <v-card class="card-dark-blue">
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title class="font-weight-bold">{{ manualTitle }}</v-toolbar-title>
          <v-btn icon @click="manual.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <!-- Abono de deudor: buscar factura en SAP -->
          <template v-if="manual.tipo==='DEUDOR'">
            <div class="d-flex ga-2 align-start">
              <v-text-field v-model="manual.docnum" label="No. de factura SAP" type="number" variant="outlined" density="comfortable" />
              <v-btn color="primary" variant="flat" :loading="manual.lookingUp" @click="lookupSap" style="margin-top:4px">Buscar</v-btn>
            </div>
            <v-alert v-if="manual.sap" type="success" variant="tonal" density="compact" class="mb-3">
              <div><strong>{{ manual.sap.CardName }}</strong> ({{ manual.sap.CardCode }})</div>
              <div class="text-caption">{{ manual.sap.Comments || 'Sin concepto' }}</div>
              <div class="mt-1">Total sin IVA: <strong>{{ money(manual.sap.Subtotal) }}</strong></div>
            </v-alert>
          </template>

          <!-- Cheque -->
          <template v-if="manual.tipo==='CHEQUE'">
            <v-text-field v-model="manual.num_cheque" label="No. de cheque" variant="outlined" density="comfortable" />
          </template>

          <!-- Manual / caja chica -->
          <template v-if="manual.tipo==='MANUAL'">
            <v-text-field v-model="manual.card_name" label="Origen (texto libre)" variant="outlined" density="comfortable" />
          </template>

          <v-text-field v-model="manual.concepto" label="Concepto" variant="outlined" density="comfortable" />
          <v-text-field
            v-model.number="manual.subtotal"
            label="Monto sin IVA ($)" prefix="$" type="number" variant="outlined" density="comfortable"
            :hint="manual.tipo==='DEUDOR' ? 'Debe coincidir con la factura SAP' : 'Las facturas no relevantes NO desglosan IVA'"
            persistent-hint
          />
        </v-card-text>
        <v-card-actions class="border-t-dark">
          <v-spacer />
          <v-btn variant="text" @click="manual.show=false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" :loading="manual.saving" @click="saveManual">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ============ DIALOG: DETALLE DE FACTURA + ABONOS ============ -->
    <v-dialog v-model="detalle.show" max-width="820">
      <v-card class="card-dark-blue" v-if="detalle.factura">
        <v-toolbar :color="semaforo(detalle.factura.estado)" density="compact">
          <v-toolbar-title class="font-weight-bold">
            Factura {{ detalle.factura.sap_docnum || detalle.factura.id }} — {{ detalle.factura.card_name || detalle.factura.concepto }}
          </v-toolbar-title>
          <v-btn icon @click="detalle.show=false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-row dense class="mb-2">
            <v-col cols="4"><div class="text-caption text-light-muted">Total (sin IVA)</div><div class="text-h6">{{ money(detalle.factura.subtotal) }}</div></v-col>
            <v-col cols="4"><div class="text-caption text-light-muted">Confirmado</div><div class="text-h6 text-success">{{ money(detalle.factura.total_confirmado) }}</div></v-col>
            <v-col cols="4"><div class="text-caption text-light-muted">Pendiente</div><div class="text-h6 text-warning">{{ money(detalle.factura.subtotal - detalle.factura.total_confirmado) }}</div></v-col>
          </v-row>
          <v-progress-linear :model-value="pctPagado" :color="semaforo(detalle.factura.estado)" height="8" rounded class="mb-4" />

          <!-- Formulario nuevo abono -->
          <v-card variant="tonal" class="mb-3">
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold mb-2">Registrar recepción de dinero</div>
              <v-row dense>
                <v-col cols="12" sm="6"><v-text-field v-model="abono.quien_trajo" label="Quién lo trajo" density="compact" variant="outlined" placeholder="Sergio, Luis, Chequín…" /></v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="abono.fecha" label="Fecha" type="date" density="compact" variant="outlined" /></v-col>
                <v-col cols="12" sm="4">
                  <v-select v-model="abono.metodo" :items="['EFECTIVO','CHEQUE','TRANSFERENCIA']" label="Método" density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12" sm="4"><v-text-field v-model.number="abono.monto_recibido" label="Monto recibido ($)" prefix="$" type="number" density="compact" variant="outlined" /></v-col>
                <v-col cols="12" sm="4">
                  <v-select v-model="abono.sobre_destino_id" :items="sobres" item-title="nombre" item-value="id" label="Sobre destino" density="compact" variant="outlined" />
                </v-col>
                <v-col cols="12"><v-text-field v-model="abono.comentario" label="Comentario / evidencia (opcional)" density="compact" variant="outlined" /></v-col>
              </v-row>
              <div class="d-flex justify-end">
                <v-btn color="primary" variant="flat" size="small" :loading="abono.saving" @click="saveAbono">Registrar (queda en rojo)</v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Lista de abonos -->
          <v-table density="compact" class="bg-transparent dark-table">
            <thead><tr>
              <th>Fecha</th><th>Quién</th><th>Método</th><th class="text-right">Recibido</th>
              <th class="text-right">Confirmado</th><th>Sobre</th><th class="text-center">Estado</th><th></th>
            </tr></thead>
            <tbody>
              <tr v-for="a in detalle.abonos" :key="a.id">
                <td class="text-light-muted">{{ fmtDate(a.fecha) }}</td>
                <td>{{ a.quien_trajo || '-' }}</td>
                <td>{{ a.metodo || '-' }}</td>
                <td class="text-right">{{ money(a.monto_recibido) }}</td>
                <td class="text-right text-success">{{ a.confirmado ? money(a.monto_confirmado) : '—' }}</td>
                <td>{{ a.sobre_destino || '-' }}</td>
                <td class="text-center">
                  <v-chip :color="a.confirmado ? 'success' : 'error'" size="x-small" variant="flat" class="font-weight-bold">
                    {{ a.confirmado ? 'VERDE' : 'ROJO' }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn v-if="!a.confirmado" icon="mdi-check-bold" size="x-small" color="success" variant="text" title="Confirmar (contar)" @click="confirmar(a)" />
                  <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="delAbono(a)" />
                </td>
              </tr>
              <tr v-if="!detalle.abonos.length"><td colspan="8" class="text-center text-light-muted py-4">Sin abonos aún</td></tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const loading = ref(false);
const syncing = ref(false);
const facturas = ref([]);
const sobres = ref([]);
const filtroEstado = ref('Todos');
const snack = ref({ show: false, text: '', color: 'success' });
const notify = (text, color = 'success') => { snack.value = { show: true, text, color }; };

const headers = [
  { title: 'Estado', key: 'estado' },
  { title: 'Origen', key: 'origen' },
  { title: 'Folio', key: 'sap_docnum' },
  { title: 'Cliente / Concepto', key: 'card_name' },
  { title: 'Fecha', key: 'fecha_documento' },
  { title: 'Total', key: 'subtotal', align: 'end' },
  { title: 'Confirmado', key: 'total_confirmado', align: 'end' },
  { title: 'Pendiente', key: 'saldo_pendiente', align: 'end' },
  { title: 'Abonos', key: 'num_abonos', align: 'center' },
];

const facturasFiltradas = computed(() =>
  filtroEstado.value === 'Todos' ? facturas.value : facturas.value.filter(f => f.estado === filtroEstado.value));
const totalPorCobrar = computed(() =>
  facturas.value.filter(f => f.estado !== 'PAGADA').reduce((a, f) => a + Number(f.saldo_pendiente || 0), 0));
const totalSinConfirmar = computed(() =>
  facturas.value.reduce((a, f) => a + Number(f.recibido_sin_confirmar || 0), 0));

const fetchAll = async () => {
  loading.value = true;
  try {
    const [rf, rs] = await Promise.all([
      axios.get('/tesoreria/facturas'),
      axios.get('/tesoreria/sobres'),
    ]);
    facturas.value = rf.data;
    sobres.value = rs.data;
  } catch (e) { notify('Error cargando facturas', 'error'); }
  finally { loading.value = false; }
};

const syncSap = async () => {
  syncing.value = true;
  try {
    const r = await axios.post('/tesoreria/facturas/sync-sap', { incluirNoRelevantes: false });
    notify(`Sincronización lista: ${r.data.insertados} nuevas de ${r.data.revisados} revisadas`);
    await fetchAll();
  } catch (e) { notify(e.response?.data?.message || 'Error sincronizando SAP', 'error'); }
  finally { syncing.value = false; }
};

// ---- Manual ----
const manual = ref({ show: false, tipo: 'MANUAL', docnum: '', sap: null, lookingUp: false, saving: false, concepto: '', subtotal: null, num_cheque: '', card_name: '' });
const manualTitle = computed(() => ({ DEUDOR: 'Abono de deudor (factura SAP)', CHEQUE: 'Ingreso por cheque', MANUAL: 'Ingreso manual / caja chica' }[manual.value.tipo]));
const openManual = (tipo) => { manual.value = { show: true, tipo, docnum: '', sap: null, lookingUp: false, saving: false, concepto: '', subtotal: null, num_cheque: '', card_name: '' }; };

const lookupSap = async () => {
  if (!manual.value.docnum) return;
  manual.value.lookingUp = true;
  try {
    const r = await axios.get('/tesoreria/sap/factura', { params: { docnum: manual.value.docnum, tabla: 'OINV' } });
    manual.value.sap = r.data;
    manual.value.concepto = r.data.Comments || `Factura ${r.data.DocNum}`;
    manual.value.card_name = r.data.CardName;
    manual.value.subtotal = Number(r.data.Subtotal);
  } catch (e) { notify(e.response?.data?.message || 'No encontrada en SAP', 'error'); }
  finally { manual.value.lookingUp = false; }
};

const saveManual = async () => {
  if (!manual.value.subtotal || manual.value.subtotal <= 0) return notify('Monto requerido', 'error');
  manual.value.saving = true;
  try {
    const origen = manual.value.tipo === 'CHEQUE' ? 'CHEQUE' : 'MANUAL';
    await axios.post('/tesoreria/facturas', {
      origen,
      concepto: manual.value.concepto,
      card_name: manual.value.card_name,
      num_cheque: manual.value.num_cheque,
      subtotal: manual.value.subtotal,
    });
    notify('Factura creada');
    manual.value.show = false;
    await fetchAll();
  } catch (e) { notify('Error al crear factura', 'error'); }
  finally { manual.value.saving = false; }
};

// ---- Detalle + abonos ----
const detalle = ref({ show: false, factura: null, abonos: [] });
const abono = ref({ quien_trajo: '', fecha: '', metodo: 'EFECTIVO', monto_recibido: null, sobre_destino_id: null, comentario: '', saving: false });
const pctPagado = computed(() => {
  const f = detalle.value.factura;
  if (!f || !f.subtotal) return 0;
  return Math.min(100, (f.total_confirmado / f.subtotal) * 100);
});
const resetAbono = () => {
  const entrada = sobres.value.find(s => s.es_entrada);
  abono.value = { quien_trajo: '', fecha: '', metodo: 'EFECTIVO', monto_recibido: null, sobre_destino_id: entrada?.id || null, comentario: '', saving: false };
};

const openDetalle = async (item) => {
  try {
    const r = await axios.get(`/tesoreria/facturas/${item.id}`);
    detalle.value = { show: true, factura: r.data.factura, abonos: r.data.abonos };
    resetAbono();
  } catch (e) { notify('Error abriendo factura', 'error'); }
};

const reloadDetalle = async () => {
  if (!detalle.value.factura) return;
  const r = await axios.get(`/tesoreria/facturas/${detalle.value.factura.id}`);
  detalle.value.factura = r.data.factura;
  detalle.value.abonos = r.data.abonos;
};

const saveAbono = async () => {
  if (!abono.value.monto_recibido) return notify('Monto recibido requerido', 'error');
  abono.value.saving = true;
  try {
    await axios.post(`/tesoreria/facturas/${detalle.value.factura.id}/abonos`, abono.value);
    notify('Abono registrado (en rojo, pendiente de confirmar)');
    resetAbono();
    await reloadDetalle();
    await fetchAll();
  } catch (e) { notify('Error registrando abono', 'error'); }
  finally { abono.value.saving = false; }
};

const confirmar = async (a) => {
  const val = prompt('Monto confirmado (contado). Enter para usar el recibido:', a.monto_recibido);
  if (val === null) return;
  try {
    await axios.put(`/tesoreria/abonos/${a.id}/confirmar`, { monto_confirmado: val === '' ? a.monto_recibido : Number(val) });
    notify('Abono confirmado (verde)');
    await reloadDetalle();
    await fetchAll();
  } catch (e) { notify('Error al confirmar', 'error'); }
};

const delAbono = async (a) => {
  if (!confirm('¿Eliminar este abono?')) return;
  try {
    await axios.delete(`/tesoreria/abonos/${a.id}`);
    await reloadDetalle();
    await fetchAll();
  } catch (e) { notify('Error al eliminar', 'error'); }
};

// ---- Helpers ----
const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
const semaforo = (e) => e === 'PAGADA' ? 'success' : (e === 'PARCIAL' ? 'warning' : 'error');
const origenLabel = (o) => ({ SAP_PROVEEDOR: 'Proveedor', SAP_CLIENTE_NR: 'No relevante', MANUAL: 'Manual', CHEQUE: 'Cheque' }[o] || o);
const origenColor = (o) => ({ SAP_PROVEEDOR: 'primary', SAP_CLIENTE_NR: 'purple', MANUAL: 'grey', CHEQUE: 'info' }[o] || 'grey');

onMounted(fetchAll);
</script>
