<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import BacklogDetailDialog from '@/components/crm/BacklogDetailDialog.vue';

const loading = ref(false);
const orders = ref([]);
const search = ref('');
const filters = ref({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    vendedor: [],
    stockStatus: null
});

const yearOptions = ['2023', '2024', '2025', '2026'];
const monthOptions = [
    { text: 'Enero', value: '1' }, { text: 'Febrero', value: '2' }, { text: 'Marzo', value: '3' },
    { text: 'Abril', value: '4' }, { text: 'Mayo', value: '5' }, { text: 'Junio', value: '6' },
    { text: 'Julio', value: '7' }, { text: 'Agosto', value: '8' }, { text: 'Septiembre', value: '9' },
    { text: 'Octubre', value: '10' }, { text: 'Noviembre', value: '11' }, { text: 'Diciembre', value: '12' }
];

const stockStatusOptions = [
    { text: 'Todos', value: null },
    { text: 'Con stock completo', value: 'full' },
    { text: 'Stock parcial', value: 'partial' },
    { text: 'Sin stock', value: 'none' }
];

const showDetail = ref(false);
const selectedDocNum = ref(null);
const selectedSourceCompany = ref(null);

const openDetail = (item) => {
    selectedDocNum.value = item.Folio;
    selectedSourceCompany.value = item.SourceCompany || null;
    showDetail.value = true;
};

const fetchBacklog = async () => {
    loading.value = true;
    try {
        const res = await axios.get('/crm/backlog', {
            params: { year: filters.value.year, month: filters.value.month }
        });
        orders.value = res.data;
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
};

// Clasificación de stock por pedido (basado en agregados que vienen del backend)
const stockStatusOf = (o) => {
    if (o.LinesOpen === 0) return 'full';
    if (o.LinesWithStock >= o.LinesOpen) return 'full';
    if (o.LinesWithStock === 0) return 'none';
    return 'partial';
};
const stockColor = (status) => ({ full: 'success', partial: 'warning', none: 'error' }[status] || 'grey');
const stockIcon = (status) => ({ full: 'mdi-check-circle', partial: 'mdi-alert', none: 'mdi-close-circle' }[status] || 'mdi-help');
const stockLabel = (status) => ({ full: 'Completo', partial: 'Parcial', none: 'Sin stock' }[status] || '—');

// Vendedores únicos en la lista
const vendedorOptions = computed(() => [...new Set(orders.value.map(o => o.Vendedor))].sort());

const filteredOrders = computed(() => {
    return orders.value.filter(o => {
        const matchSearch = !search.value ||
            o.Cliente.toLowerCase().includes(search.value.toLowerCase()) ||
            o.Folio.toString().includes(search.value);
        const matchVendedor = !filters.value.vendedor?.length || filters.value.vendedor.includes(o.Vendedor);
        const matchStock = !filters.value.stockStatus || stockStatusOf(o) === filters.value.stockStatus;
        return matchSearch && matchVendedor && matchStock;
    });
});

// KPIs
const totalSum = computed(() => filteredOrders.value.reduce((a, o) => a + (o.Monto || 0), 0));
const ordersFullStock = computed(() => filteredOrders.value.filter(o => stockStatusOf(o) === 'full').length);
const ordersPartialStock = computed(() => filteredOrders.value.filter(o => stockStatusOf(o) === 'partial').length);
const ordersNoStock = computed(() => filteredOrders.value.filter(o => stockStatusOf(o) === 'none').length);

const removeVendedor = (v) => { filters.value.vendedor = filters.value.vendedor.filter(x => x !== v); };

const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—';

// Días para entrega
const daysUntilDue = (date) => {
    if (!date) return null;
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / (1000 * 60 * 60 * 24));
};
const dueColor = (date) => {
    const d = daysUntilDue(date);
    if (d === null) return 'grey';
    if (d < 0) return 'error';
    if (d <= 3) return 'warning';
    return 'success';
};

const headers = [
    { title: 'Pedido', key: 'Folio', align: 'start' },
    { title: 'Cliente', key: 'Cliente', align: 'start' },
    { title: 'Vendedor', key: 'Vendedor', align: 'start' },
    { title: 'Monto', key: 'Monto', align: 'end' },
    { title: 'Líneas (pend/tot)', key: 'LinesOpen', align: 'center' },
    { title: 'Stock', key: 'StockStatus', align: 'center' },
    { title: 'Entrega', key: 'FechaEntrega', align: 'center' },
    { title: 'Pedido', key: 'FechaPedido', align: 'center' }
];

onMounted(fetchBacklog);
</script>

<template>
    <v-container fluid class="page-wrapper">
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h4 font-weight-bold">
                        <v-icon color="primary" class="mr-2">mdi-truck-fast-outline</v-icon>
                        Backlog de Pedidos
                    </h2>
                    <p class="text-subtitle-1 text-medium-emphasis">Pedidos colocados pendientes de entrega (SAP B1 ORDR)</p>
                </div>
                <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchBacklog" :loading="loading">
                    Actualizar
                </v-btn>
            </v-col>
        </v-row>

        <!-- KPIs -->
        <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="pa-4 text-center">
                    <div class="text-overline text-medium-emphasis">Pedidos abiertos</div>
                    <div class="text-h4 font-weight-bold text-primary">{{ filteredOrders.length }}</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="primary">
                    <div class="text-overline">Monto en Backlog</div>
                    <div class="text-h4 font-weight-bold">{{ formatCurrency(totalSum) }}</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="success">
                    <div class="text-overline">Stock completo</div>
                    <div class="text-h4 font-weight-bold text-success">{{ ordersFullStock }}</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="warning">
                    <div class="text-overline">Stock parcial</div>
                    <div class="text-h4 font-weight-bold text-warning">{{ ordersPartialStock }}</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="error">
                    <div class="text-overline">Sin stock</div>
                    <div class="text-h4 font-weight-bold text-error">{{ ordersNoStock }}</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabla con filtros -->
        <v-card elevation="0" class="border">
            <v-card-text class="pb-0">
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="search"
                            prepend-inner-icon="mdi-magnify"
                            label="Búsqueda (Cliente, Folio)"
                            density="comfortable"
                            variant="solo"
                            hide-details
                            clearable
                            class="mb-2"
                        ></v-text-field>
                    </v-col>
                </v-row>

                <v-divider class="my-2"></v-divider>

                <v-row density="compact" class="pb-4">
                    <v-col cols="6" sm="4" md="2">
                        <v-select
                            v-model="filters.year"
                            :items="yearOptions"
                            label="Año"
                            density="compact"
                            variant="outlined"
                            hide-details
                            @update:model-value="fetchBacklog"
                        ></v-select>
                    </v-col>
                    <v-col cols="6" sm="4" md="2">
                        <v-select
                            v-model="filters.month"
                            :items="monthOptions"
                            item-title="text"
                            item-value="value"
                            label="Mes"
                            density="compact"
                            variant="outlined"
                            hide-details
                            clearable
                            @update:model-value="fetchBacklog"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4" md="3">
                        <v-select
                            v-model="filters.vendedor"
                            :items="vendedorOptions"
                            prepend-inner-icon="mdi-account-tie"
                            label="Vendedor"
                            density="compact"
                            variant="outlined"
                            hide-details
                            clearable
                            multiple
                            class="vendedor-filter"
                        >
                            <template v-slot:selection="{ item, index }">
                                <v-chip v-if="index === 0" size="x-small" closable @click:close="removeVendedor(item.value)">
                                    <span class="text-truncate">{{ item.title }}</span>
                                </v-chip>
                                <span v-if="index === 1" class="text-caption text-medium-emphasis ml-1">
                                    +{{ filters.vendedor.length - 1 }}
                                </span>
                            </template>
                        </v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-select
                            v-model="filters.stockStatus"
                            :items="stockStatusOptions"
                            item-title="text"
                            item-value="value"
                            prepend-inner-icon="mdi-package-variant"
                            label="Estado de stock"
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
                :items="filteredOrders"
                :loading="loading"
                hover
                class="elevation-0"
                @click:row="(_, { item }) => openDetail(item)"
            >
                <template v-slot:item.Folio="{ item }">
                    <span class="text-primary font-weight-black">#{{ item.Folio }}</span>
                </template>
                <template v-slot:item.Cliente="{ item }">
                    <span class="font-weight-medium">{{ item.Cliente }}</span>
                </template>
                <template v-slot:item.Monto="{ item }">
                    <span class="font-weight-bold">{{ formatCurrency(item.Monto) }}</span>
                </template>
                <template v-slot:item.LinesOpen="{ item }">
                    <v-chip size="x-small" variant="tonal">
                        {{ item.LinesOpen }} / {{ item.LineCount }}
                    </v-chip>
                </template>
                <template v-slot:item.StockStatus="{ item }">
                    <v-chip
                        :color="stockColor(stockStatusOf(item))"
                        :prepend-icon="stockIcon(stockStatusOf(item))"
                        size="x-small"
                        variant="tonal"
                        class="font-weight-bold"
                    >
                        {{ stockLabel(stockStatusOf(item)) }} ({{ item.LinesWithStock }}/{{ item.LinesOpen }})
                    </v-chip>
                </template>
                <template v-slot:item.FechaEntrega="{ item }">
                    <v-chip
                        :color="dueColor(item.FechaEntrega)"
                        size="x-small"
                        variant="tonal"
                        prepend-icon="mdi-calendar"
                    >
                        {{ formatDate(item.FechaEntrega) }}
                    </v-chip>
                </template>
                <template v-slot:item.FechaPedido="{ item }">
                    <span class="text-caption text-medium-emphasis">{{ formatDate(item.FechaPedido) }}</span>
                </template>
            </v-data-table>
        </v-card>

        <BacklogDetailDialog v-model="showDetail" :doc-num="selectedDocNum" :source-company="selectedSourceCompany" />
    </v-container>
</template>

<style scoped>
.vendedor-filter :deep(.v-field__input) { flex-wrap: nowrap; overflow: hidden; }
</style>
