<template>
  <v-container fluid class="page-wrapper">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h4 font-weight-bold">Mi Pipeline</h2>
          <p class="text-subtitle-1 text-medium-emphasis">Gestión de Oportunidades (SAP B1 OQUT)</p>
        </div>
        <div class="d-flex gap-2">
            <!-- Selector y orden de Columnas -->
            <v-menu :close-on-content-click="false" location="bottom end" max-width="320">
                <template v-slot:activator="{ props }">
                    <v-btn
                        variant="outlined"
                        color="secondary"
                        prepend-icon="mdi-view-column"
                        v-bind="props"
                        class="mr-2"
                    >
                        Columnas
                    </v-btn>
                </template>
                <v-card min-width="300">
                    <v-card-text class="pa-2">
                        <div class="d-flex align-center mb-2 px-2">
                            <span class="text-overline">Columnas (arrastra para reordenar)</span>
                            <v-spacer></v-spacer>
                            <v-tooltip text="Restablecer orden original">
                                <template v-slot:activator="{ props: tp }">
                                    <v-btn
                                        v-bind="tp"
                                        icon="mdi-restart"
                                        size="x-small"
                                        variant="text"
                                        @click="resetColumnPrefs"
                                    ></v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                        <v-list density="compact" class="column-order-list pa-0">
                            <v-list-item
                                v-for="(key, idx) in columnOrder"
                                :key="key"
                                draggable="true"
                                class="column-order-item"
                                :class="{ 'is-dragging': draggingIndex === idx, 'is-mandatory': isMandatory(key) }"
                                @dragstart="onDragStart(idx, $event)"
                                @dragover.prevent="onDragOver(idx, $event)"
                                @drop.prevent="onDrop(idx)"
                                @dragend="onDragEnd"
                            >
                                <template v-slot:prepend>
                                    <v-icon size="16" class="drag-handle">mdi-drag</v-icon>
                                </template>
                                <v-list-item-title class="text-body-2">
                                    {{ getHeaderTitle(key) }}
                                </v-list-item-title>
                                <template v-slot:append>
                                    <v-checkbox
                                        :model-value="!hiddenColumns.includes(key)"
                                        :disabled="isMandatory(key)"
                                        density="compact"
                                        hide-details
                                        color="primary"
                                        @update:model-value="(v) => toggleColumnVisibility(key, v)"
                                    ></v-checkbox>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-menu>

            <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchPipeline" :loading="loading">Actualizar</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- KPI Section -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-info pa-4 text-center h-100">
          <div class="text-overline text-medium-emphasis mb-1">Cotizaciones</div>
          <div class="text-h4 font-weight-bold text-info">{{ filteredPipeline.length }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="flex-grow-1">
        <v-card elevation="1" class="kpi-card border-top-primary pa-4 text-center h-100" variant="tonal">
          <div class="text-overline text-medium-emphasis mb-1">Monto Total</div>
          <div class="text-h4 font-weight-bold text-primary">{{ formatCurrency(totalSum) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-success pa-4 text-center h-100">
          <div class="text-overline text-medium-emphasis mb-1">Clientes</div>
          <div class="text-h4 font-weight-bold text-success">{{ totalClients }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="2" class="flex-grow-1">
        <v-card elevation="2" class="kpi-card border-top-teal pa-4 text-center h-100 overflow-hidden">
          <div class="text-overline text-teal-darken-2">Transaccional</div>
          <div class="text-h5 font-weight-bold text-teal">{{ formatCurrency(sumTransactional) }}</div>
          <div class="text-caption text-disabled">{{ countTransactional }} docs</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3" class="flex-grow-1">
        <v-card elevation="1" class="kpi-card border-top-purple pa-4 text-center h-100 overflow-hidden" variant="tonal">
          <div class="text-overline text-purple-darken-2">Proyecto</div>
          <div class="text-h5 font-weight-bold text-purple">{{ formatCurrency(sumProject) }}</div>
          <div class="text-caption text-disabled">{{ countProject }} docs</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="0" class="border">
        <v-card-text class="pb-0" style="background: rgba(var(--v-theme-surface-variant), 0.05)">
            <!-- Row 1: Búsqueda Global -->
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model="filters.cliente"
                        prepend-inner-icon="mdi-magnify"
                        label="Búsqueda rápida (Cliente, Folio, Detalle...)"
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
                <!-- Filtro Año -->
                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.year"
                        :items="yearOptions"
                        label="Año"
                        density="compact"
                        variant="outlined"
                        hide-details
                        @update:model-value="fetchPipeline"
                    ></v-select>
                </v-col>
                <!-- Filtro Mes -->
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
                        @update:model-value="fetchPipeline"
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
                        multiple
                        class="vendedor-filter"
                    >
                        <template v-slot:selection="{ item, index }">
                            <v-chip
                                v-if="index === 0"
                                size="x-small"
                                class="vendedor-chip"
                                closable
                                @click:close="removeVendedor(item.value)"
                            >
                                <span class="text-truncate">{{ item.title }}</span>
                            </v-chip>
                            <span
                                v-if="index === 1"
                                class="text-caption text-medium-emphasis ml-1"
                            >
                                +{{ filters.vendedor.length - 1 }}
                            </span>
                        </template>
                    </v-select>
                </v-col>

                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.etapa"
                        :items="stageOptions"
                        prepend-inner-icon="mdi-trending-up"
                        label="Etapa"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                    ></v-select>
                </v-col>

                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.tipo"
                        :items="['Todos', 'Transaccional', 'Proyecto']"
                        prepend-inner-icon="mdi-briefcase-outline"
                        label="Tipo de Venta"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                    ></v-select>
                </v-col>

                <v-col cols="12" sm="6" md="2">
                    <v-select
                        v-model="filters.propietario"
                        :items="propietarioOptions"
                        prepend-inner-icon="mdi-account-star"
                        label="Propietario"
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
            :items="filteredPipeline"
            :loading="loading"
            class="elevation-0"
            hover
            @click:row="(e, { item }) => openQuoteDialog(item)"
        >
            <template v-slot:item.Folio="{ item }">
                <span
                    class="text-primary font-weight-black cursor-pointer folio-link"
                    @click.stop="openQuoteDialog(item)"
                >
                    #{{ item.Folio }}
                </span>
            </template>

            <template v-slot:item.Tipo="{ item }">
                <v-chip
                    :color="item.Tipo === 'Proyecto' ? 'purple' : 'teal'"
                    size="x-small"
                    class="font-weight-bold"
                    variant="flat"
                >
                    {{ item.Tipo }}
                </v-chip>
            </template>

            <template v-slot:item.Cliente="{ item }">
                <span 
                    class="text-primary cursor-pointer text-decoration-underline font-weight-medium"
                    @click.stop="handleOpenHistory({ cardCode: item.CardCode, customerName: item.Cliente })"
                >
                    {{ item.Cliente }}
                </span>
            </template>

            <template v-slot:item.Monto="{ item }">
                <span class="font-weight-bold">
                    {{ item.Moneda === 'USD' ? formatCurrency(item.MontoUSD, 'USD') : formatCurrency(item.Monto, 'MXN') }}
                </span>
            </template>

             <template v-slot:item.Etapa="{ item }">
                <span :class="getStageColor(item.Etapa)" class="text-caption font-weight-bold">
                    {{ item.Etapa }}
                </span>
            </template>

            <template v-slot:item.Sentimiento="{ item }">
                <v-chip
                    :color="getSentimentColor(item.Sentimiento)"
                    size="x-small"
                    class="font-weight-bold"
                    variant="tonal"
                    :prepend-icon="getSentimentIcon(item.Sentimiento)"
                >
                    {{ item.Sentimiento }}
                </v-chip>
            </template>

            <template v-slot:item.FechaContabilizacion="{ item }">
                <span class="text-caption">{{ formatDateShort(item.FechaContabilizacion) }}</span>
            </template>

            <template v-slot:item.UltimaAccion="{ item }">
                <div class="text-truncate text-caption text-medium-emphasis" style="max-width: 150px;">
                    {{ item.UltimaAccion || 'Sin seguimiento' }}
                    <v-tooltip activator="parent" location="top" v-if="item.UltimaAccion">
                        {{ item.UltimaAccion }}
                    </v-tooltip>
                </div>
            </template>

             <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-eye" size="x-small" variant="text" color="primary" @click.stop="openQuoteDialog(item)"></v-btn>
             </template>
        </v-data-table>

        <QuoteDetailDialog
            v-model="showQuoteDialog"
            :folio="selectedFolio"
            :item="selectedItem"
            @open-customer-history="handleOpenHistory"
            @update:item="onItemUpdated"
        />

        <CustomerQuotesDialog
            v-model="showHistoryDialog"
            :cardCode="selectedCardCode"
            :customerName="selectedCustomerName"
            @open-quote-detail="handleOpenQuote"
        />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
import QuoteDetailDialog from '@/components/crm/QuoteDetailDialog.vue';
import CustomerQuotesDialog from '@/components/crm/CustomerQuotesDialog.vue';

const loading = ref(false);

const pipeline = ref([]);
const filters = ref({
    cliente: '',
    vendedor: [],
    etapa: null,
    tipo: null,
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(), // Mes actual
    propietario: null,
    tipo: null
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

const showQuoteDialog = ref(false);
const showHistoryDialog = ref(false);
const selectedFolio = ref(null);
const selectedItem = ref(null);
const selectedCardCode = ref('');
const selectedCustomerName = ref('');

const handleOpenHistory = (data) => {
    selectedCardCode.value = data.cardCode;
    selectedCustomerName.value = data.customerName;
    showHistoryDialog.value = true;
};

const handleOpenQuote = (folio) => {
    selectedFolio.value = folio;
    showQuoteDialog.value = true;
};

const stageOptions = [
    '1. Dimensionamiento',
    '2. Negociación',
    '3. Aprobado/OC',
    '4. Colocado',
    '5. Perdida'
];

// Filtros dinámicos basados en la data cargada
const vendedorOptions = computed(() => {
    const list = pipeline.value.map(item => item.Vendedor);
    return [...new Set(list)].sort();
});

const propietarioOptions = computed(() => {
    const list = pipeline.value.map(item => item.Propietario).filter(p => !!p);
    return [...new Set(list)].sort();
});

// Lógica de filtrado combinada
const filteredPipeline = computed(() => {
    return pipeline.value.filter(item => {
        const matchCliente = !filters.value.cliente || 
            item.Cliente.toLowerCase().includes(filters.value.cliente.toLowerCase()) ||
            item.Folio.toString().includes(filters.value.cliente);
        
        const matchVendedor = !filters.value.vendedor?.length || filters.value.vendedor.includes(item.Vendedor);
        const matchEtapa = !filters.value.etapa || item.Etapa === filters.value.etapa;
        const matchTipo = !filters.value.tipo || filters.value.tipo === 'Todos' || item.Tipo === filters.value.tipo;
        const matchPropietario = !filters.value.propietario || item.Propietario === filters.value.propietario;

        return matchCliente && matchVendedor && matchEtapa && matchTipo && matchPropietario;
    });
});

// KPIs Calculados (Reactivos a los filtros)
const totalSum = computed(() => filteredPipeline.value.reduce((acc, item) => acc + item.Monto, 0));

const totalClients = computed(() => {
    const clients = filteredPipeline.value.map(item => item.Cliente.split(' - ')[0]);
    return [...new Set(clients)].length;
});

const sumTransactional = computed(() => 
    filteredPipeline.value.filter(i => i.Tipo === 'Transaccional').reduce((acc, i) => acc + i.Monto, 0)
);
const countTransactional = computed(() => filteredPipeline.value.filter(i => i.Tipo === 'Transaccional').length);

const sumProject = computed(() => 
    filteredPipeline.value.filter(i => i.Tipo === 'Proyecto').reduce((acc, i) => acc + i.Monto, 0)
);
const countProject = computed(() => filteredPipeline.value.filter(i => i.Tipo === 'Proyecto').length);

const allHeaders = [
    { title: 'Folio', key: 'Folio', align: 'start', mandatory: true },
    { title: 'Tipo', key: 'Tipo', align: 'start' },
    { title: 'Sentimiento', key: 'Sentimiento', align: 'start' },
    { title: 'Cliente', key: 'Cliente', align: 'start', mandatory: true },
    { title: 'Monto', key: 'Monto', align: 'end' },
    { title: 'Etapa', key: 'Etapa', align: 'start' },
    { title: 'Última Acción', key: 'UltimaAccion', align: 'start' },
    { title: 'Vendedor', key: 'Vendedor', align: 'start' },
    { title: 'Propietario', key: 'Propietario', align: 'start' },
    { title: 'Fecha', key: 'FechaContabilizacion', align: 'start' },
    { title: 'Acciones', key: 'actions', align: 'end', sortable: false, mandatory: true },
];

const defaultOrder = allHeaders.map(h => h.key);
const columnOrder = ref([...defaultOrder]);
const hiddenColumns = ref([]);
const draggingIndex = ref(null);

const headerByKey = computed(() => Object.fromEntries(allHeaders.map(h => [h.key, h])));

const isMandatory = (key) => !!headerByKey.value[key]?.mandatory;
const getHeaderTitle = (key) => headerByKey.value[key]?.title || key;

const headers = computed(() => {
    return columnOrder.value
        .filter(k => !hiddenColumns.value.includes(k) || isMandatory(k))
        .map(k => headerByKey.value[k])
        .filter(Boolean);
});

// Persistencia preferencia de columnas
let savePrefsTimer = null;
const savePrefs = () => {
    clearTimeout(savePrefsTimer);
    savePrefsTimer = setTimeout(async () => {
        try {
            await axios.put('/preferences/pipeline_columns', {
                value: { order: columnOrder.value, hidden: hiddenColumns.value }
            });
        } catch (e) { console.error('Error guardando preferencia de columnas', e); }
    }, 400);
};

const loadPrefs = async () => {
    try {
        const res = await axios.get('/preferences/pipeline_columns');
        const v = res.data?.value;
        if (v && Array.isArray(v.order)) {
            // Filtrar columnas obsoletas y agregar nuevas al final
            const validKeys = new Set(defaultOrder);
            const ordered = v.order.filter(k => validKeys.has(k));
            const missing = defaultOrder.filter(k => !ordered.includes(k));
            columnOrder.value = [...ordered, ...missing];
            hiddenColumns.value = Array.isArray(v.hidden)
                ? v.hidden.filter(k => validKeys.has(k) && !isMandatory(k))
                : [];
        }
    } catch (e) { /* sin preferencia guardada, usa default */ }
};

const resetColumnPrefs = async () => {
    columnOrder.value = [...defaultOrder];
    hiddenColumns.value = [];
    try {
        await axios.delete('/preferences/pipeline_columns');
    } catch (e) { console.error(e); }
};

const toggleColumnVisibility = (key, visible) => {
    if (isMandatory(key)) return;
    if (visible) {
        hiddenColumns.value = hiddenColumns.value.filter(k => k !== key);
    } else if (!hiddenColumns.value.includes(key)) {
        hiddenColumns.value = [...hiddenColumns.value, key];
    }
    savePrefs();
};

const onDragStart = (idx, e) => {
    draggingIndex.value = idx;
    e.dataTransfer.effectAllowed = 'move';
};

const onDragOver = (idx, e) => {
    e.dataTransfer.dropEffect = 'move';
};

const onDrop = (targetIdx) => {
    if (draggingIndex.value === null || draggingIndex.value === targetIdx) return;
    const arr = [...columnOrder.value];
    const [moved] = arr.splice(draggingIndex.value, 1);
    arr.splice(targetIdx, 0, moved);
    columnOrder.value = arr;
    savePrefs();
};

const onDragEnd = () => { draggingIndex.value = null; };

const fetchPipeline = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/crm/pipeline', {
            params: {
                year: filters.value.year,
                month: filters.value.month
            }
        });
        pipeline.value = response.data;
    } catch (error) {
        console.error("Error al cargar pipeline:", error);
    } finally {
        loading.value = false;
    }
};

const openQuoteDialog = (item) => {
    selectedItem.value = item;
    selectedFolio.value = item.Folio;
    showQuoteDialog.value = true;
};

const onItemUpdated = (updated) => {
    const idx = pipeline.value.findIndex(p => p.Folio === updated.Folio);
    if (idx !== -1) {
        pipeline.value[idx] = { ...pipeline.value[idx], ...updated };
        selectedItem.value = pipeline.value[idx];
    }
};

const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: currency || 'MXN' 
    }).format(value);
};

const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const getStageColor = (stage) => {
    if (stage.includes('Perdida')) return 'text-error';
    if (stage.includes('Colocado')) return 'text-success';
    if (stage.includes('Aprobado')) return 'text-primary';
    return 'text-info';
};

const getSentimentColor = (sentiment) => {
    switch (sentiment) {
        case 'Caliente': return 'error';
        case 'Tibio': return 'orange';
        case 'Frio': return 'info';
        default: return 'grey';
    }
};

const removeVendedor = (value) => {
    filters.value.vendedor = filters.value.vendedor.filter(v => v !== value);
};

const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
        case 'Caliente': return 'mdi-fire';
        case 'Tibio': return 'mdi-thermometer';
        case 'Frio': return 'mdi-snowflake';
        default: return 'mdi-help-circle';
    }
};

onMounted(async () => {
    await loadPrefs();
    fetchPipeline();
});
</script>

<style scoped>
.folio-link {
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
    padding: 2px 4px;
    border-radius: 4px;
}

.folio-link:hover {
    background-color: rgba(var(--v-theme-primary), 0.1);
    border-bottom: 2px solid rgb(var(--v-theme-primary));
    transform: scale(1.05);
}

.cursor-pointer {
    cursor: pointer;
}

.search-top {
    border-radius: 8px;
}

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
.border-top-error { border-top-color: rgb(var(--v-theme-error)) !important; }
.border-top-teal { border-top-color: #009688 !important; }
.border-top-purple { border-top-color: #9c27b0 !important; }

.bg-light-grey {
    background-color: #f8f9fa;
}

/* Drag & drop de columnas */
.column-order-list .column-order-item {
    cursor: grab;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
    transition: background-color 0.15s ease, opacity 0.15s ease;
}
.column-order-list .column-order-item:last-child { border-bottom: none; }
.column-order-list .column-order-item.is-dragging { opacity: 0.4; }
.column-order-list .column-order-item:hover { background-color: rgba(var(--v-theme-primary), 0.05); }
.column-order-list .column-order-item.is-mandatory { opacity: 0.85; }
.column-order-list .drag-handle { cursor: grab; opacity: 0.5; }

/* Filtro Vendedor: chip unico + "+N", evita que el campo crezca con multiples selecciones */
.vendedor-filter :deep(.v-field__input) {
    flex-wrap: nowrap;
    overflow: hidden;
}
.vendedor-filter :deep(.vendedor-chip) {
    max-width: calc(100% - 40px);
}
.vendedor-filter :deep(.vendedor-chip .v-chip__content) {
    overflow: hidden;
}
</style>
