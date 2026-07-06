<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    <PageHeader
      title="Reportes — Estado de cuenta"
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Reportes', href: '#' }
      ]"
    />

    <!-- Filtros -->
    <v-card class="rounded-lg card-dark-blue mb-3" elevation="0">
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="6" md="2"><v-text-field v-model="f.desde" type="date" label="Desde" density="compact" variant="outlined" hide-details /></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="f.hasta" type="date" label="Hasta" density="compact" variant="outlined" hide-details /></v-col>
          <v-col cols="6" md="2"><v-select v-model="f.tipo" :items="['Todos','INGRESO','EGRESO','TRASPASO']" label="Tipo" density="compact" variant="outlined" hide-details /></v-col>
          <v-col cols="6" md="3"><v-select v-model="f.categoria_id" :items="categorias" item-title="nombre" item-value="id" label="Categoría" density="compact" variant="outlined" clearable hide-details @update:model-value="f.subcategoria_id=null" /></v-col>
          <v-col cols="6" md="3"><v-select v-model="f.subcategoria_id" :items="subcats" item-title="nombre" item-value="id" label="Subcategoría" density="compact" variant="outlined" clearable hide-details :disabled="!subcats.length" /></v-col>
        </v-row>
        <div class="d-flex ga-2 mt-3">
          <v-btn color="primary" variant="flat" prepend-icon="mdi-magnify" :loading="loading" @click="fetchData">Consultar</v-btn>
          <v-spacer />
          <v-btn color="success" variant="tonal" prepend-icon="mdi-file-excel" :disabled="!rows.length" @click="exportExcel">Excel</v-btn>
          <v-btn color="error" variant="tonal" prepend-icon="mdi-file-pdf-box" :disabled="!rows.length" @click="exportPdf">PDF</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Totales -->
    <v-row dense class="mb-2">
      <v-col cols="4"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Ingresos</p><h3 class="text-h5 text-success">{{ money(totales.ingreso) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="4"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Egresos</p><h3 class="text-h5 text-error">{{ money(totales.egreso) }}</h3></v-card-text></v-card></v-col>
      <v-col cols="4"><v-card class="rounded-lg card-dark-blue" elevation="0"><v-card-text class="text-center"><p class="text-subtitle-2 text-light-muted mb-1">Neto</p><h3 class="text-h5 text-primary">{{ money(totales.ingreso - totales.egreso) }}</h3></v-card-text></v-card></v-col>
    </v-row>

    <v-card class="rounded-lg card-dark-blue" elevation="0">
      <v-data-table :headers="headers" :items="rows" :loading="loading" density="compact" class="bg-transparent dark-table">
        <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ fmtDate(item.fecha) }}</span></template>
        <template v-slot:item.tipo="{ item }"><v-chip size="x-small" :color="tipoColor(item.tipo)" variant="tonal">{{ item.tipo }}</v-chip></template>
        <template v-slot:item.categoria="{ item }">{{ item.categoria || '-' }}<span v-if="item.subcategoria" class="text-light-muted"> / {{ item.subcategoria }}</span></template>
        <template v-slot:item.monto="{ item }">
          <span :class="item.tipo==='EGRESO' ? 'text-error' : (item.tipo==='INGRESO' ? 'text-success' : 'text-warning')" class="font-weight-bold">{{ money(item.monto) }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="3000">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const loading = ref(false);
const rows = ref([]);
const categorias = ref([]);
const snack = ref({ show: false, text: '', color: 'success' });

const today = new Date();
const f = ref({ desde: `${today.getFullYear()}-01-01`, hasta: today.toISOString().slice(0, 10), tipo: 'Todos', categoria_id: null, subcategoria_id: null });
const subcats = computed(() => categorias.value.find(c => c.id === f.value.categoria_id)?.subcategorias || []);

const headers = [
  { title: 'Fecha', key: 'fecha' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Concepto', key: 'concepto' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Sobre orig.', key: 'sobre_origen' },
  { title: 'Sobre dest.', key: 'sobre_destino' },
  { title: 'Monto', key: 'monto', align: 'end' },
  { title: 'Usuario', key: 'usuario' },
];

const totales = computed(() => ({
  ingreso: rows.value.filter(r => r.tipo === 'INGRESO').reduce((a, r) => a + Number(r.monto), 0),
  egreso: rows.value.filter(r => r.tipo === 'EGRESO').reduce((a, r) => a + Number(r.monto), 0),
}));

const fetchData = async () => {
  loading.value = true;
  try {
    const params = { desde: f.value.desde, hasta: f.value.hasta };
    if (f.value.tipo !== 'Todos') params.tipo = f.value.tipo;
    if (f.value.categoria_id) params.categoria_id = f.value.categoria_id;
    if (f.value.subcategoria_id) params.subcategoria_id = f.value.subcategoria_id;
    const r = await axios.get('/tesoreria/reportes/estado-cuenta', { params });
    rows.value = r.data;
  } catch (e) { snack.value = { show: true, text: 'Error consultando', color: 'error' }; }
  finally { loading.value = false; }
};

const tableRows = () => rows.value.map(r => [
  fmtDate(r.fecha), r.tipo, r.concepto || '', (r.categoria || '') + (r.subcategoria ? ' / ' + r.subcategoria : ''),
  r.sobre_origen || '', r.sobre_destino || '', Number(r.monto), r.usuario || ''
]);

const exportExcel = () => {
  const data = [['Fecha', 'Tipo', 'Concepto', 'Categoría', 'Sobre origen', 'Sobre destino', 'Monto', 'Usuario'], ...tableRows()];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estado de cuenta');
  XLSX.writeFile(wb, `estado_cuenta_${f.value.desde}_${f.value.hasta}.xlsx`);
};

const exportPdf = () => {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(`Estado de cuenta  ${f.value.desde} a ${f.value.hasta}`, 14, 15);
  autoTable(doc, {
    startY: 22,
    head: [['Fecha', 'Tipo', 'Concepto', 'Categoría', 'Sobre orig.', 'Sobre dest.', 'Monto', 'Usuario']],
    body: tableRows().map(r => { r[6] = money(r[6]); return r; }),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [59, 89, 152] },
  });
  const y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.text(`Ingresos: ${money(totales.value.ingreso)}   Egresos: ${money(totales.value.egreso)}   Neto: ${money(totales.value.ingreso - totales.value.egreso)}`, 14, y);
  doc.save(`estado_cuenta_${f.value.desde}_${f.value.hasta}.pdf`);
};

const money = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
const tipoColor = (t) => t === 'INGRESO' ? 'success' : (t === 'EGRESO' ? 'error' : 'warning');

onMounted(async () => {
  const rc = await axios.get('/tesoreria/categorias');
  categorias.value = rc.data;
  await fetchData();
});
</script>
