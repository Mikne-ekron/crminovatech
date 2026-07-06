<template>
  <v-container fluid class="h-100 bg-dark-canvas">
    
    <!-- Page Header -->
    <PageHeader 
      title="Caja Chica - Operaciones" 
      :breadcrumbs="[
        { text: 'Home', href: '/app/dashboard' },
        { text: 'Tesorería', href: '#' },
        { text: 'Caja Chica', href: '#' }
      ]"
    />
    
    <!-- Action Cards Row -->
    <v-row class="mb-4">
      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('ingreso')" style="border-bottom: 4px solid #4caf50 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-success elevation-0" dark>
                <v-icon>mdi-cash-plus</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Ingreso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Recibir dinero</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('egreso')" style="border-bottom: 4px solid #ff5252 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-error elevation-0" dark>
                <v-icon>mdi-cash-minus</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Egreso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Gasto o pago</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg cursor-pointer card-dark-blue border-b-dark" @click="openDialog('traspaso')" style="border-bottom: 4px solid #ffc107 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-warning elevation-0" dark>
                <v-icon>mdi-swap-horizontal</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Traspaso</h2>
                <p class="text-medium-emphasis mt-1 text-15">Mover entre sobres</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" class="py-0 mb-3">
        <v-card elevation="0" class="rounded-lg card-dark-blue border-b-dark" style="border-bottom: 4px solid #03c9d7 !important;">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-4">
              <v-btn icon class="bg-info elevation-0" dark>
                <v-icon>mdi-email-outline</v-icon>
              </v-btn>
              <div>
                <h2 class="text-h4 text-primary">Saldos</h2>
                <p class="text-medium-emphasis mt-1 text-15">Ver desglose</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPI Cards Row -->
    <v-row dense>
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingresos Hoy</p>
              <h3 class="text-h3 text-success">{{ formatCurrency(kpis.ingresoHoy) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egresos Hoy</p>
              <h3 class="text-h3 text-error">{{ formatCurrency(kpis.egresoHoy) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingreso Mensual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.ingresoMes) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egreso Mensual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.egresoMes) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Ingreso Anual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.ingresoAnio) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="2">
        <v-card elevation="0" class="rounded-lg card-dark-blue">
          <v-card-text class="pa-5">
            <div class="text-center">
              <p class="text-subtitle-1 text-light-muted mb-2">Egreso Anual</p>
              <h3 class="text-h4 text-white">{{ formatCurrency(kpis.egresoAnio) }}</h3>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4 rounded-lg card-dark-blue" elevation="0">
      <v-card-title class="d-flex align-center py-3 px-4 header-dark-blue border-b-dark">
        <v-icon icon="mdi-history" class="mr-2 text-primary"></v-icon>
        <span class="font-weight-bold">Historial de Operaciones</span>
        <v-spacer></v-spacer>
        <v-chip color="primary" variant="flat" size="large">
            Saldo Global Actual: {{ formatCurrency(globalBalance) }}
        </v-chip>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="transactionsWithBalance"
        item-value="id"
        density="compact"
        class="bg-transparent dark-table"
        :sort-by="[{ key: 'fecha', order: 'desc' }]"
        hover
      >
        <template v-slot:item.ingreso="{ item }">
          <span v-if="item.ingreso > 0" class="text-success font-weight-bold">+{{ formatCurrency(item.ingreso) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>

        <template v-slot:item.egreso="{ item }">
          <span v-if="item.egreso > 0" class="text-error font-weight-bold">-{{ formatCurrency(item.egreso) }}</span>
          <span v-else class="text-light-muted">-</span>
        </template>

        <template v-slot:item.saldo="{ item }">
           <strong class="text-primary">{{ formatCurrency(item.saldo) }}</strong>
        </template>

        <template v-slot:item.fecha="{ item }">
           <span class="text-light-muted">{{ formatDate(item.fecha) }}</span>
        </template>
        
        <template v-slot:item.tipo="{ item }">
           <v-chip size="x-small" :color="getTypeColor(item.tipo)" class="font-weight-bold" variant="tonal">{{ item.tipo }}</v-chip>
        </template>

        <template v-slot:item.categoria="{ item }">
          <span>{{ item.categoria && item.categoria !== '-' ? item.categoria : '—' }}</span>
          <span v-if="item.subcategoria" class="text-light-muted"> / {{ item.subcategoria }}</span>
        </template>

        <template v-slot:item.monto="{ item }">
          <span class="font-weight-bold">{{ formatCurrency(item.monto) }}</span>
        </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog.show" max-width="500px">
      <v-card class="card-dark-blue">
        <v-toolbar :color="dialogColor" density="compact">
          <v-toolbar-title class="font-weight-bold">{{ dialogTitle }}</v-toolbar-title>
          <v-btn icon @click="dialog.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>

        <v-card-text class="pt-4">
            <v-form ref="form" v-model="valid">
                <v-row dense>
                    <v-col cols="12">
                        <v-text-field 
                            v-model="editedItem.monto" 
                            label="Monto ($)" 
                            type="number" 
                            prefix="$"
                            variant="outlined"
                            :rules="[v => !!v || 'Monto es requerido']"
                        ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12">
                        <v-text-field 
                            v-model="editedItem.concepto" 
                            label="Concepto" 
                            variant="outlined"
                            :rules="[v => !!v || 'Concepto es requerido']"
                        ></v-text-field>
                    </v-col>

                    <template v-if="dialog.type === 'ingreso'">
                        <v-col cols="12" class="pb-1">
                            <div class="text-caption text-light-muted mb-1">Tipo de ingreso</div>
                            <v-btn-toggle v-model="editedItem.tipoIngreso" mandatory divided density="comfortable"
                                color="success" class="flex-wrap w-100" @update:model-value="onTipoIngresoChange">
                                <v-btn value="Abono de Deudor" size="small">Abono de Deudor</v-btn>
                                <v-btn value="Cheque" size="small">Cheque</v-btn>
                                <v-btn value="Caja Chica" size="small">Caja Chica</v-btn>
                                <v-btn value="Préstamos" size="small">Préstamos</v-btn>
                            </v-btn-toggle>
                        </v-col>

                        <!-- Abono de Deudor: Factura (SAP) o Manual -->
                        <v-col cols="12" v-if="editedItem.tipoIngreso === 'Abono de Deudor'" class="pt-1">
                            <v-btn-toggle v-model="editedItem.modoAbono" mandatory divided density="compact"
                                color="primary" class="mb-3" @update:model-value="onModoAbonoChange">
                                <v-btn value="Factura" size="small">Factura (SAP)</v-btn>
                                <v-btn value="Manual" size="small">Manual</v-btn>
                            </v-btn-toggle>

                            <template v-if="editedItem.modoAbono === 'Factura'">
                                <v-btn block color="primary" variant="tonal" prepend-icon="mdi-file-search-outline" @click="openFacturaModal">
                                    {{ editedItem.factura ? 'Cambiar factura' : 'Seleccionar factura de proveedor (SAP)' }}
                                </v-btn>
                                <v-alert v-if="editedItem.factura" type="info" variant="tonal" density="compact" class="mt-2">
                                    <div class="font-weight-bold">Folio {{ editedItem.factura.folio_sap }} · Ref: {{ editedItem.factura.numatcard || '—' }}</div>
                                    <div class="text-caption my-1">{{ editedItem.factura.concepto || 'Sin concepto' }}</div>
                                    <div>Valor: <strong>{{ formatCurrency(editedItem.factura.subtotal) }}</strong>
                                        · Ya abonado: {{ formatCurrency(editedItem.factura.abonado) }}
                                        · Pendiente: <strong>{{ formatCurrency(editedItem.factura.subtotal - editedItem.factura.abonado) }}</strong>
                                    </div>
                                </v-alert>
                            </template>

                            <v-text-field v-else v-model="editedItem.origenIngreso" label="Origen (captura libre) *"
                                prepend-inner-icon="mdi-text" variant="outlined" :rules="[reqRule]"></v-text-field>
                        </v-col>

                        <!-- Cheque -->
                        <v-col cols="12" v-if="editedItem.tipoIngreso === 'Cheque'">
                            <v-text-field v-model="editedItem.numCheque" label="Número de cheque *"
                                prepend-inner-icon="mdi-checkbook" variant="outlined" :rules="[reqRule]"></v-text-field>
                        </v-col>

                        <!-- Caja Chica / Préstamos -->
                        <v-col cols="12" v-if="editedItem.tipoIngreso === 'Caja Chica' || editedItem.tipoIngreso === 'Préstamos'">
                            <v-text-field v-model="editedItem.origenIngreso" label="Origen (captura libre) *"
                                prepend-inner-icon="mdi-text" variant="outlined" :rules="[reqRule]"></v-text-field>
                        </v-col>

                        <!-- Sobre destino: SIEMPRE manual (default Sergio para Abono de Deudor) -->
                        <v-col cols="12">
                            <v-select v-model="editedItem.sobreDestino" :items="sobresList" label="Sobre destino *"
                                prepend-inner-icon="mdi-email" variant="outlined" :rules="[reqRule]"></v-select>
                        </v-col>
                    </template>

                    <v-col cols="12" v-if="dialog.type === 'egreso'">
                        <v-select
                            v-model="editedItem.sobreOrigen"
                            :items="sobresList"
                            label="Tomar del Sobre *"
                            prepend-inner-icon="mdi-email-open"
                            variant="outlined"
                            :rules="[reqRule]"
                        ></v-select>
                        <v-select
                            v-model="editedItem.categoria"
                            :items="categoriasFull"
                            item-title="nombre" item-value="nombre"
                            label="Categoría *"
                            prepend-inner-icon="mdi-folder-outline"
                            variant="outlined"
                            :rules="[reqRule]"
                            @update:model-value="onCategoriaChange"
                        ></v-select>
                        <v-select
                            v-if="subcatsForSelected.length"
                            v-model="editedItem.subcategoria"
                            :items="subcatsForSelected"
                            item-title="nombre" item-value="nombre"
                            label="Subcategoría *"
                            prepend-inner-icon="mdi-file-tree"
                            variant="outlined"
                            :rules="[reqRule]"
                            @update:model-value="onSubcatChange"
                        ></v-select>
                        <v-text-field
                            v-if="isManualSub"
                            v-model="editedItem.subcategoriaManual"
                            label="Subcategoría (captura manual) *"
                            prepend-inner-icon="mdi-pencil"
                            variant="outlined"
                            :rules="[reqRule]"
                        ></v-text-field>
                    </v-col>

                    <v-col cols="12" v-if="dialog.type === 'traspaso'">
                        <v-select 
                            v-model="editedItem.sobreOrigen" 
                            :items="sobresList" 
                            label="Desde Sobre (Origen)" 
                            variant="outlined"
                        ></v-select>
                        <v-icon class="mb-2 mx-auto d-block text-white">mdi-arrow-down-bold</v-icon>
                        <v-select 
                            v-model="editedItem.sobreDestino" 
                            :items="sobresList" 
                            label="Hacia Sobre (Destino)" 
                            variant="outlined"
                        ></v-select>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>

        <v-card-actions class="border-t-dark">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="dialog.show = false">Cancelar</v-btn>
            <v-btn :color="dialogColor" variant="flat" @click="saveOperation">Guardar Operación</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MODAL: selección de factura de proveedor SAP (Trade/Log, pagadas) -->
    <v-dialog v-model="facturaModal.show" max-width="1040" scrollable>
      <v-card class="card-dark-blue">
        <v-toolbar color="primary" density="compact">
          <v-icon class="ml-4">mdi-file-search-outline</v-icon>
          <v-toolbar-title class="font-weight-bold">Facturas de proveedor pagadas (SAP) — Trade / Log</v-toolbar-title>
          <v-btn icon @click="facturaModal.show = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text style="max-height:70vh">
          <div class="d-flex align-center mb-2">
            <v-text-field v-model="facturaModal.search" prepend-inner-icon="mdi-magnify"
              placeholder="Buscar por folio, referencia o concepto…" density="compact" variant="outlined"
              hide-details></v-text-field>
          </div>
          <div class="text-caption text-light-muted mb-2">
            <v-icon size="14" class="mr-1">mdi-cursor-default-click</v-icon>Haz clic en una factura para seleccionarla.
          </div>
          <v-data-table
            :headers="facturaHeaders" :items="facturaModal.items" :search="facturaModal.search"
            :loading="facturaModal.loading" density="compact" class="bg-transparent dark-table factura-table"
            :items-per-page="10" hover
            @click:row="onRowSelectFactura"
          >
            <template v-slot:item.card_code="{ item }">
              <v-chip size="x-small" variant="tonal" :color="item.card_code === 'P0148' ? 'primary' : 'info'">
                {{ item.card_code === 'P0148' ? 'Trade' : 'Log' }}
              </v-chip>
            </template>
            <template v-slot:item.fecha="{ item }"><span class="text-light-muted">{{ formatDate(item.fecha) }}</span></template>
            <template v-slot:item.concepto="{ item }">
              <span :title="item.concepto">{{ item.concepto || '—' }}</span>
            </template>
            <template v-slot:item.subtotal="{ item }"><span class="font-weight-bold">{{ formatCurrency(item.subtotal) }}</span></template>
            <template v-slot:item.abonado="{ item }">
              <span :class="item.abonado > 0 ? 'text-success' : 'text-light-muted'">{{ formatCurrency(item.abonado) }}</span>
            </template>
            <template v-slot:item.pendiente="{ item }">
              <strong :class="(item.subtotal - item.abonado) > 0 ? 'text-warning' : 'text-success'">{{ formatCurrency(item.subtotal - item.abonado) }}</strong>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from '@/utils/axios';
import PageHeader from '@/components/shared/PageHeader.vue';

const authStore = useAuthStore();
const dialog = ref({ show: false, type: 'ingreso' });
const valid = ref(false);
const loading = ref(false);
const form = ref(null);

// Listas Dinámicas
const sobresList = ref([]);
const categoriasFull = ref([]); // [{ nombre, subcategorias: [{ nombre, es_manual }] }]

const fetchCatalogos = async () => {
  try {
    const [resSobres, resCats] = await Promise.all([
      axios.get('/tesoreria/sobres'),
      axios.get('/tesoreria/categorias')
    ]);

    sobresList.value = resSobres.data.map(s => s.nombre);
    categoriasFull.value = resCats.data;
  } catch (e) {
    console.error("Error cargando catálogos", e);
  }
};

// Modelo para el formulario
const editedItem = ref({
    monto: null,
    concepto: '',
    sobreOrigen: null,
    sobreDestino: null,
    categoria: null,
    subcategoria: null,
    subcategoriaManual: ''
});

// --- Categoría / Subcategoría (solo egresos) ---
const reqRule = (v) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Requerido';

// Subcategorías de la categoría elegida
const subcatsForSelected = computed(() => {
    const c = categoriasFull.value.find(x => x.nombre === editedItem.value.categoria);
    return c?.subcategorias || [];
});

// ¿La subcategoría elegida es de captura manual?
const isManualSub = computed(() => {
    const s = subcatsForSelected.value.find(x => x.nombre === editedItem.value.subcategoria);
    return !!s?.es_manual;
});

const onCategoriaChange = () => {
    editedItem.value.subcategoria = null;
    editedItem.value.subcategoriaManual = '';
};
const onSubcatChange = () => {
    if (!isManualSub.value) editedItem.value.subcategoriaManual = '';
};

// --- Ingresos: tipos y selección de factura de proveedor (SAP) ---
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

const onTipoIngresoChange = (t) => {
    editedItem.value.factura = null;
    editedItem.value.numCheque = '';
    editedItem.value.origenIngreso = '';
    editedItem.value.modoAbono = 'Factura';
    // El sobre siempre es manual; solo Abono de Deudor trae "Sergio" por default.
    editedItem.value.sobreDestino = (t === 'Abono de Deudor') ? 'Sergio' : null;
};
const onModoAbonoChange = () => {
    editedItem.value.factura = null;
    editedItem.value.origenIngreso = '';
};

const openFacturaModal = async () => {
    facturaModal.value.show = true;
    facturaModal.value.loading = true;
    try {
        const r = await axios.get('/tesoreria/sap/facturas-proveedor');
        facturaModal.value.items = r.data.map(f => ({ ...f, pendiente: Number(f.subtotal) - Number(f.abonado || 0) }));
    } catch (e) {
        console.error('Error cargando facturas SAP', e);
        alert('Error al cargar las facturas de proveedor de SAP');
    } finally {
        facturaModal.value.loading = false;
    }
};

const selectFactura = (f) => {
    if (!f) return;
    const row = f.raw || f; // robusto ante distintas versiones de Vuetify
    editedItem.value.factura = row;
    const pendiente = Number(row.subtotal) - Number(row.abonado || 0);
    editedItem.value.monto = pendiente > 0 ? pendiente : Number(row.subtotal);
    if (!editedItem.value.concepto) editedItem.value.concepto = `Abono deudor - Folio ${row.folio_sap}`;
    facturaModal.value.show = false;
};

// Selección al hacer clic en cualquier parte de la fila
const onRowSelectFactura = (_event, row) => {
    selectFactura(row?.item ?? row);
};

// ARRAY VACÍO: Se llenará desde la BD
const transactions = ref([]);

const headers = [
    { title: 'Fecha', key: 'fecha', align: 'start', width: '100px' },
    { title: 'Concepto', key: 'concepto' },
    { title: 'Sobre / Ruta', key: 'sobre_display' },
    { title: 'Categoría', key: 'categoria' },
    { title: 'Monto Op.', key: 'monto', align: 'end' }, 
    { title: 'Ingreso', key: 'ingreso', align: 'end' },
    { title: 'Egreso', key: 'egreso', align: 'end' },
    { title: 'Saldo Global', key: 'saldo', align: 'end' },
    { title: 'Usuario', key: 'usuario' },
];

// --- API: CARGAR DATOS ---
const fetchOperations = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/tesoreria/operaciones');

        transactions.value = response.data.map(item => ({
            id: item.id || item.ID,
            fecha: item.fecha || item.Fecha || item.created_at,
            concepto: item.concepto || item.Concepto,
            tipo: item.tipo || item.Tipo,
            ingreso: parseFloat(item.ingreso || item.Ingreso || 0),
            egreso: parseFloat(item.egreso || item.Egreso || 0),
            monto: parseFloat(item.monto || item.Monto || 0),
            categoria: item.categoria || item.Categoria || '-',
            subcategoria: item.subcategoria || item.Subcategoria || null,
            sobre_origen: item.sobre_origen || item.SobreOrigen,
            sobre_destino: item.sobre_destino || item.SobreDestino,
            usuario: item.usuario || item.Usuario,
            sobre_display: (item.tipo === 'Traspaso' || item.Tipo === 'Traspaso') 
                           ? `${item.sobre_origen || '-'} → ${item.sobre_destino || '-'}`
                           : (item.sobre_destino || item.sobre_origen || '-')
        }));

    } catch (error) {
        console.error("Error cargando operaciones:", error);
    } finally {
        loading.value = false;
    }
};

// --- API: GUARDAR DATOS ---
const saveOperation = async () => {
    const { valid: isFormValid } = await form.value.validate();
    if (!isFormValid) return;

    const esIngreso = dialog.value.type === 'ingreso';
    const esEgreso = dialog.value.type === 'egreso';

    // Abono de Deudor por Factura exige una factura seleccionada
    if (esIngreso && editedItem.value.tipoIngreso === 'Abono de Deudor'
        && editedItem.value.modoAbono === 'Factura' && !editedItem.value.factura) {
        alert('Selecciona una factura de proveedor de SAP.');
        return;
    }

    try {
        const subcatFinal = isManualSub.value ? editedItem.value.subcategoriaManual : editedItem.value.subcategoria;
        const payload = {
            monto: parseFloat(editedItem.value.monto),
            concepto: editedItem.value.concepto,
            usuario: authStore.user?.name || 'Usuario',
            tipo: esIngreso ? 'Ingreso' : (esEgreso ? 'Egreso' : 'Traspaso'),
            // Categoría/subcategoría solo aplican a egresos
            categoria: esEgreso ? (editedItem.value.categoria || null) : null,
            subcategoria: esEgreso ? (subcatFinal || null) : null,
            sobreOrigen: (esEgreso || dialog.value.type === 'traspaso') ? editedItem.value.sobreOrigen : null,
            sobreDestino: (esIngreso || dialog.value.type === 'traspaso') ? editedItem.value.sobreDestino : null,
        };

        if (esIngreso) {
            const t = editedItem.value.tipoIngreso;
            payload.tipoIngreso = t;
            if (t === 'Cheque') payload.numCheque = editedItem.value.numCheque;
            const usaOrigen = (t === 'Caja Chica' || t === 'Préstamos'
                || (t === 'Abono de Deudor' && editedItem.value.modoAbono === 'Manual'));
            if (usaOrigen) payload.origenIngreso = editedItem.value.origenIngreso;
            if (t === 'Abono de Deudor' && editedItem.value.modoAbono === 'Factura' && editedItem.value.factura) {
                const f = editedItem.value.factura;
                payload.conciliacion = {
                    sap_docentry: f.docentry,
                    sap_docnum: f.folio_sap,
                    numatcard: f.numatcard,
                    card_code: f.card_code,
                    card_name: f.card_name,
                    subtotal: f.subtotal,
                    concepto: f.concepto,
                    monto_abonado: parseFloat(editedItem.value.monto),
                };
            }
        }

        await axios.post('/tesoreria/operaciones', payload);

        await fetchOperations();
        dialog.value.show = false;

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error al guardar operación");
    }
};

// --- COMPUTED LOGIC ---

const transactionsWithBalance = computed(() => {
    let saldoAcumulado = 0;
    const sorted = [...transactions.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    return sorted.map(t => {
        saldoAcumulado = saldoAcumulado + t.ingreso - t.egreso;
        return { ...t, saldo: saldoAcumulado };
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const globalBalance = computed(() => {
    if (transactionsWithBalance.value.length === 0) return 0;
    return transactionsWithBalance.value[0].saldo;
});

const kpis = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let data = { ingresoHoy: 0, egresoHoy: 0, ingresoMes: 0, egresoMes: 0, ingresoAnio: 0, egresoAnio: 0 };

    transactions.value.forEach(t => {
        const tDate = new Date(t.fecha);
        if(isNaN(tDate)) return; 

        const tDateString = tDate.toISOString().slice(0, 10);
        
        if (tDateString === today) {
            data.ingresoHoy += t.ingreso;
            data.egresoHoy += t.egreso;
        }
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            data.ingresoMes += t.ingreso;
            data.egresoMes += t.egreso;
        }
        if (tDate.getFullYear() === currentYear) {
            data.ingresoAnio += t.ingreso;
            data.egresoAnio += t.egreso;
        }
    });
    return data;
});

const dialogTitle = computed(() => {
    if (dialog.value.type === 'ingreso') return 'Registrar Ingreso';
    if (dialog.value.type === 'egreso') return 'Registrar Egreso';
    return 'Traspaso entre Sobres';
});

const dialogColor = computed(() => {
    if (dialog.value.type === 'ingreso') return 'success';
    if (dialog.value.type === 'egreso') return 'error';
    return 'warning';
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const formatDate = (dateString) => {
    if(!dateString) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
};

const getTypeColor = (type) => {
    if(!type) return 'grey';
    const t = type.toLowerCase();
    if(t === 'ingreso') return 'success';
    if(t === 'egreso') return 'error';
    return 'warning';
}

const openDialog = (type) => {
    dialog.value.type = type;
    editedItem.value = {
        monto: null, concepto: '', sobreOrigen: null, sobreDestino: null,
        categoria: null, subcategoria: null, subcategoriaManual: '',
        tipoIngreso: 'Abono de Deudor', modoAbono: 'Factura',
        origenIngreso: '', numCheque: '', factura: null
    };
    if (type === 'ingreso') editedItem.value.sobreDestino = 'Sergio';
    dialog.value.show = true;
};

onMounted(() => {
    fetchOperations();
    fetchCatalogos();
});
</script>

<style scoped>
/* Todo cabe dentro del modal: layout fijo + concepto recortado, sin scroll horizontal */
.factura-table :deep(table) { table-layout: fixed; width: 100%; }
.factura-table :deep(th),
.factura-table :deep(td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  padding-inline: 8px !important;
}
.factura-table :deep(tbody tr) { cursor: pointer; }
</style>
