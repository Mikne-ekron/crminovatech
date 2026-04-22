<template>
  <v-container fluid class="page-wrapper">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h4 font-weight-bold">Gestión Comercial</h2>
          <p class="text-subtitle-1 text-medium-emphasis">Facturas de Clientes (SAP B1 OINV)</p>
        </div>
        <div class="d-flex gap-2">
            <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchInvoices" :loading="loading">Actualizar</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- KPI Section -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-info pa-4 text-center h-100">
          <div class="text-overline text-medium-emphasis mb-1">Facturas</div>
          <div class="text-h4 font-weight-bold text-info">{{ filteredInvoices.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="flex-grow-1">
        <v-card elevation="1" class="kpi-card border-top-primary pa-4 text-center h-100" variant="tonal">
          <div class="text-overline text-medium-emphasis mb-1">Venta Neta</div>
          <div class="text-h4 font-weight-bold text-primary">{{ formatCurrency(totalNetSales) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-success pa-4 text-center h-100">
          <div class="text-overline text-medium-emphasis mb-1">Utilidad Total</div>
          <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(totalProfit) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="flex-grow-1">
        <v-card elevation="1" class="kpi-card border-top-success pa-4 text-center h-100" variant="tonal">
          <div class="text-overline text-medium-emphasis mb-1">Utilidad Aplicada</div>
          <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(appliedProfit) }}</div>
          <div class="text-caption text-disabled" style="font-size: 0.65rem;">Pagadas</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-warning pa-4 text-center h-100">
          <div class="text-overline text-medium-emphasis mb-1">Margen Promedio</div>
          <div class="text-h4 font-weight-bold text-warning">{{ formatPercent(averageMargin) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" class="border">
        <v-card-text class="pb-0" style="background: rgba(var(--v-theme-surface-variant), 0.05)">
            <!-- Row 1: Búsqueda Global -->
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="search"
                        prepend-inner-icon="mdi-magnify"
                        label="Búsqueda rápida (Cliente, Folio, Vendedor...)"
                        density="comfortable"
                        variant="solo"
                        elevation="1"
                        hide-details
                        clearable
                        class="search-top"
                    ></v-text-field>
                </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- Row 2: Filtros Específicos -->
            <v-row density="compact" class="pb-4">
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.year"
                        :items="yearOptions"
                        label="Año"
                        density="compact"
                        variant="outlined"
                        hide-details
                        @update:model-value="fetchInvoices"
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.month"
                        :items="monthOptions"
                        label="Mes"
                        item-title="text"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                        @update:model-value="fetchInvoices"
                    ></v-select>
                </v-col>
                 <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.vendedor"
                        :items="vendedorOptions"
                        prepend-inner-icon="mdi-account-tie"
                        label="Vendedor"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.estatusPago"
                        :items="['Pagada', 'Parcial', 'Pendiente']"
                        prepend-inner-icon="mdi-cash-multiple"
                        label="Estatus Pago"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                    ></v-select>
                </v-col>
            </v-row>
        </v-card-text>

        <v-divider></v-divider>


        <v-data-table
            :headers="headers"
            :items="filteredInvoices"
            :loading="loading"
            class="elevation-0"
            hover
            item-value="Folio"
        >
            <template v-slot:item.Folio="{ item }">
                <span 
                    class="text-primary font-weight-bold cursor-pointer text-decoration-underline"
                    @click="openDialog(item)"
                >
                    {{ item.Folio }}
                </span>
            </template>

            <template v-slot:item.Fecha="{ item }">
                {{ formatDate(item.Fecha) }}
            </template>

            <template v-slot:item.EstatusPago="{ item }">
                <v-chip
                    :color="getPaymentStatusColor(item.EstatusPago)"
                    size="small"
                    class="font-weight-bold"
                    variant="flat"
                >
                    {{ item.EstatusPago }}
                </v-chip>
            </template>

            <template v-slot:item.VentaNetaMXN="{ item }">
                <div class="d-flex flex-column text-end">
                    <span class="font-weight-bold">{{ formatCurrency(item.VentaNetaMXN) }}</span>
                    <span class="text-caption text-disabled">USD: {{ formatCurrency(item.VentaNetaUSD, 'USD') }}</span>
                </div>
            </template>

             <template v-slot:item.UtilidadMXN="{ item }">
                <div class="d-flex flex-column text-end">
                    <span class="font-weight-bold text-success">{{ formatCurrency(item.UtilidadMXN) }}</span>
                     <span class="text-caption text-disabled">USD: {{ formatCurrency(item.UtilidadUSD, 'USD') }}</span>
                </div>
            </template>

            <template v-slot:item.PorcentajeMargen="{ item }">
                <v-chip
                    :color="getMarginColor(item.PorcentajeMargen)"
                    size="small"
                    class="font-weight-bold"
                    variant="tonal"
                >
                    {{ formatPercent(item.PorcentajeMargen) }}
                </v-chip>
            </template>
        </v-data-table>
    </v-card>
    
    <InvoiceDetailDialog 
        v-model="dialogOpen"
        :folio="selectedInvoice?.Folio"
        :docEntry="selectedInvoice?.DocEntry"
        :header="selectedInvoice"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import InvoiceDetailDialog from '@/components/crm/InvoiceDetailDialog.vue';
const loading = ref(false);
const invoices = ref([]);
const search = ref('');
const filters = ref({
    vendedor: null,
    estatusPago: null,
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(), // Mes actual
});

const yearOptions = ['2023', '2024', '2025', '2026'];
const monthOptions = [
    { text: 'Enero', value: '1' },
    { text: 'Febrero', value: '2' },
    { text: 'Marzo', value: '3' },
    { text: 'Abril', value: '4' },
    { text: 'Mayo', value: '5' },
    { text: 'Junio', value: '6' },
    { text: 'Julio', value: '7' },
    { text: 'Agosto', value: '8' },
    { text: 'Septiembre', value: '9' },
    { text: 'Octubre', value: '10' },
    { text: 'Noviembre', value: '11' },
    { text: 'Diciembre', value: '12' },
];

// Dialog State
const dialogOpen = ref(false);
const selectedInvoice = ref(null);

const headers = [
    { title: 'Folio', key: 'Folio', align: 'start' },
    { title: 'Cliente', key: 'Cliente', align: 'start' },
    { title: 'Fecha', key: 'Fecha', align: 'start' },
    { title: 'Vendedor', key: 'Vendedor', align: 'start' },
    { title: 'Estatus Pago', key: 'EstatusPago', align: 'center' },
    { title: 'Venta Neta', key: 'VentaNetaMXN', align: 'end' },
    { title: 'Utilidad', key: 'UtilidadMXN', align: 'end' },
    { title: '% Margen', key: 'PorcentajeMargen', align: 'center' },
];

const fetchInvoices = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/crm/invoices', {
            params: {
                year: filters.value.year,
                month: filters.value.month
            }
        });
        invoices.value = response.data;
    } catch (error) {
        console.error("Error al cargar facturas:", error);
    } finally {
        loading.value = false;
    }
};

const openDialog = (item) => {
    selectedInvoice.value = item;
    dialogOpen.value = true;
};

// Options
const vendedorOptions = computed(() => {
    const list = invoices.value.map(item => item.Vendedor);
    return [...new Set(list)].sort();
});

// Filtering
const filteredInvoices = computed(() => {
    return invoices.value.filter(item => {
        const matchSearch = !search.value || 
            item.Cliente.toLowerCase().includes(search.value.toLowerCase()) ||
            item.Folio.toString().includes(search.value) ||
            item.Vendedor.toLowerCase().includes(search.value.toLowerCase());
        
        const matchVendedor = !filters.value.vendedor || item.Vendedor === filters.value.vendedor;
        const matchStatus = !filters.value.estatusPago || item.EstatusPago === filters.value.estatusPago;

        return matchSearch && matchVendedor && matchStatus;
    });
});

// KPIs
const totalNetSales = computed(() => filteredInvoices.value.reduce((acc, item) => acc + item.VentaNetaMXN, 0));
const totalProfit = computed(() => filteredInvoices.value.reduce((acc, item) => acc + item.UtilidadMXN, 0));
const appliedProfit = computed(() => {
    return filteredInvoices.value
        .filter(item => item.EstatusPago === 'Pagada')
        .reduce((acc, item) => acc + item.UtilidadMXN, 0);
});
const averageMargin = computed(() => {
    if (filteredInvoices.value.length === 0) return 0;
    const totalMargin = filteredInvoices.value.reduce((acc, item) => acc + item.PorcentajeMargen, 0);
    return totalMargin / filteredInvoices.value.length;
});


// Formatters
const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: currency || 'MXN' 
    }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'percent', 
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX');
};

// Colors
const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'Pagada': return 'success';
        case 'Parcial': return 'warning';
        case 'Pendiente': return 'error';
        default: return 'grey';
    }
};

const getMarginColor = (margin) => {
    if (margin > 20) return 'success';
    if (margin < 10) return 'error';
    return 'warning'; // Between 10 and 20 (or default)
};

onMounted(() => {
    fetchInvoices();
});
</script>

<style scoped>
.kpi-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-top: 4px solid transparent !important;
}

.kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}

.border-top-primary { border-top-color: rgb(var(--v-theme-primary)) !important; }
.border-top-info { border-top-color: rgb(var(--v-theme-info)) !important; }
.border-top-success { border-top-color: rgb(var(--v-theme-success)) !important; }
.border-top-warning { border-top-color: rgb(var(--v-theme-warning)) !important; }

.search-top {
    border-radius: 8px;
}
</style>
