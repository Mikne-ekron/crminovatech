<template>
  <v-container fluid class="page-wrapper">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h4 font-weight-bold">Mi Pipeline</h2>
          <p class="text-subtitle-1 text-medium-emphasis">Gestión de Oportunidades (SAP B1 OQUT)</p>
        </div>
        <div class="d-flex gap-2">
            <!-- Selector de Columnas -->
            <v-menu :close-on-content-click="false" location="bottom end">
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
                <v-list class="pa-2" min-width="200">
                    <div class="text-overline mb-2 px-2">Visibilidad de Columnas</div>
                    <v-list-item v-for="h in allHeaders.filter(x => !x.mandatory)" :key="h.key" density="compact">
                        <v-checkbox
                            v-model="selectedHeaders"
                            :label="h.title"
                            :value="h.key"
                            hide-details
                            density="compact"
                        ></v-checkbox>
                    </v-list-item>
                </v-list>
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

    <!-- Detailed View Sidebar (Similar to Prospects) -->
    <v-navigation-drawer
      v-model="showDetail"
      location="right"
      temporary
      width="450"
      class="pa-0"
    >
      <template v-if="selectedItem">
        <div class="pa-4 bg-primary text-white d-flex align-center">
            <h3 class="text-h6 text-truncate">Folio: {{ selectedItem.Folio }}</h3>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" color="white" @click="showDetail = false"></v-btn>
        </div>
        
        <v-tabs v-model="activeTab" color="primary" grow>
          <v-tab value="info">Detalle</v-tab>
          <v-tab value="timeline">Seguimiento</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="pa-4">
          <!-- Info Tab -->
          <v-window-item value="info">
            <div class="info-section mb-6">
                <p class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-1">Datos SAP</p>
                <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Cliente:</span>
                    <span class="text-body-2 font-weight-bold text-right ml-4">{{ selectedItem.Cliente }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Vendedor:</span>
                    <span class="text-body-2 font-weight-bold">{{ selectedItem.Vendedor }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Monto:</span>
                    <span class="text-body-2 font-weight-bold">
                        {{ selectedItem.Moneda === 'USD' ? formatCurrency(selectedItem.MontoUSD, 'USD') : formatCurrency(selectedItem.Monto, 'MXN') }}
                        <span v-if="selectedItem.Moneda === 'USD'" class="text-caption text-disabled ml-1">
                            ({{ formatCurrency(selectedItem.Monto, 'MXN') }} aprox)
                        </span>
                    </span>
                </div>
            </div>

            <div class="info-section">
                <p class="text-caption text-uppercase font-weight-bold grey--text text--darken-1 mb-1">Control CRM</p>
                <v-select
                    v-model="selectedItem.Tipo"
                    :items="['Proyecto', 'Transaccional']"
                    label="Tipo de Venta"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateControl"
                ></v-select>
                <v-select
                    v-model="selectedItem.Etapa"
                    :items="stageOptions"
                    label="Etapa"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateControl"
                ></v-select>
                <v-select
                    v-model="selectedItem.Sentimiento"
                    :items="['Caliente', 'Tibio', 'Frio']"
                    label="Sentimiento"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                    @update:model-value="updateControl"
                >
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                            <template v-slot:prepend>
                                <v-icon :color="getSentimentColor(item.value)">mdi-fire</v-icon>
                            </template>
                        </v-list-item>
                    </template>
                </v-select>
                <v-text-field
                    v-model="selectedItem.ProximaAccion"
                    label="Próxima Acción"
                    variant="outlined"
                    density="compact"
                    @blur="updateControl"
                ></v-text-field>
            </div>
          </v-window-item>

          <!-- Timeline Tab -->
          <v-window-item value="timeline">
            <v-textarea
                v-model="newComment"
                label="Registrar acción/comentario"
                variant="outlined"
                density="compact"
                rows="2"
                hide-details
                class="mb-2"
                @keyup.enter="saveComment"
            ></v-textarea>
            
            <div class="d-flex align-center mb-4">
                <v-text-field
                    v-model="followUpDate"
                    label="Fecha Seguimiento"
                    type="date"
                    variant="underlined"
                    density="compact"
                    hide-details
                    prepend-inner-icon="mdi-calendar-clock"
                    class="text-caption"
                ></v-text-field>
                <v-btn color="primary" class="ml-4" size="small" :disabled="!newComment" @click="saveComment" :loading="logLoading">Registrar</v-btn>
            </div>

            <div class="d-flex align-center mb-2">
                <v-btn
                    v-if="!m365Connected"
                    variant="text"
                    color="info"
                    size="x-small"
                    prepend-icon="mdi-microsoft-office"
                    @click="connectM365"
                    class="px-0"
                >
                    Conectar Microsoft To Do
                </v-btn>
                <v-chip v-else color="success" size="x-small" variant="tonal" prepend-icon="mdi-check">
                    M365 Conectado
                </v-chip>
                <v-spacer></v-spacer>
            </div>

            <v-alert
                v-if="m365Error"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-2 text-caption"
                closable
                @click:close="m365Error = false"
            >
                Error de sincronización To Do. Por favor, <strong>reconecta</strong>.
            </v-alert>

            <v-divider class="my-4"></v-divider>

            <v-timeline side="end" align="start" density="compact">
              <v-timeline-item
                v-for="(log, i) in logs"
                :key="i"
                :dot-color="log.Type === 'comment' ? 'info' : 'success'"
                size="x-small"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-bold">{{ log.Author }}</span>
                  <span class="text-caption text-disabled">{{ formatDate(log.Date) }}</span>
                </div>
                <div class="text-body-2 mb-1">{{ log.Text }}</div>
                <div v-if="log.FollowUpDate" class="text-caption text-warning font-weight-bold">
                    📅 Recordatorio: {{ new Date(log.FollowUpDate).toLocaleDateString() }}
                </div>
              </v-timeline-item>
              <div v-if="logs.length === 0" class="text-center text-caption text-disabled py-4">
                No hay historial registrado.
              </div>
            </v-timeline>
          </v-window-item>
        </v-window>
      </template>
    </v-navigation-drawer>

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
            @click:row="(e, { item }) => openDetail(item)"
        >
            <template v-slot:item.Folio="{ item }">
                <span 
                    class="text-primary font-weight-black cursor-pointer folio-link"
                    @click.stop="openQuoteDialog(item.Folio)"
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
                <v-btn icon="mdi-eye" size="x-small" variant="text" color="primary" @click.stop="openQuoteDialog(item.Folio)"></v-btn>
             </template>
        </v-data-table>

        <QuoteDetailDialog 
            v-model="showQuoteDialog" 
            :folio="selectedFolio" 
            @open-customer-history="handleOpenHistory"
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
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

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

const showDetail = ref(false);
const showQuoteDialog = ref(false);
const showHistoryDialog = ref(false);
const selectedFolio = ref(null);
const selectedCardCode = ref('');
const selectedCustomerName = ref('');
const selectedItem = ref(null);
const activeTab = ref('info');
const logs = ref([]);
const newComment = ref('');
const getToday = () => new Date().toISOString().split('T')[0];
const followUpDate = ref(getToday());
const logLoading = ref(false);
const m365Connected = ref(false);
const m365Error = ref(false);

const checkM365Status = async () => {
    try {
        const res = await axios.get('/m365/status');
        m365Connected.value = res.data.connected;
    } catch (err) {
        console.error('Error checking M365 status:', err);
    }
};

const connectM365 = () => {
    m365Error.value = false;
    const token = localStorage.getItem('token');
    let uid = '';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            uid = payload.uid;
        } catch (e) { console.error('Error parsing token', e); }
    }
    if (!uid) return alert('Debes iniciar sesión');

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const handleMessage = (event) => {
        if (event.data.type === 'm365_connected') {
            m365Connected.value = true;
            window.removeEventListener('message', handleMessage);
        }
    };
    window.addEventListener('message', handleMessage);
    window.open(`${axios.defaults.baseURL}/m365/login?uid=${uid}`, 'M365Auth', `width=${width},height=${height},left=${left},top=${top}`);
};

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

const selectedHeaders = ref(allHeaders.map(h => h.key));

const headers = computed(() => {
    return allHeaders.filter(h => h.mandatory || selectedHeaders.value.includes(h.key));
});

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

const openDetail = async (item) => {
    selectedItem.value = item;
    showDetail.value = true;
    fetchLogs(item.Folio);
    checkM365Status();
};

const openQuoteDialog = (folio) => {
    selectedFolio.value = folio;
    showQuoteDialog.value = true;
};

const fetchLogs = async (folio) => {
    try {
        const response = await axios.get(`/crm/pipeline/logs/${folio}`);
        logs.value = response.data;
    } catch (error) {
        console.error("Error bscar logs:", error);
    }
};

const saveComment = async () => {
    if (!newComment.value || !selectedItem.value) return;
    logLoading.value = true;
    try {
        const response = await axios.post('/crm/pipeline/logs', {
            Folio: selectedItem.value.Folio,
            Text: newComment.value,
            Type: 'comment',
            FollowUpDate: followUpDate.value,
            CardName: selectedItem.value.Cliente
        });
        
        if (response.data.m365Error) {
            m365Error.value = true;
            if (response.data.m365Error === 'InvalidAuthenticationToken' || response.data.m365Error.includes('401')) {
                m365Connected.value = false;
            }
        }

        newComment.value = '';
        followUpDate.value = getToday();
        fetchLogs(selectedItem.value.Folio);
    } catch (error) {
        console.error("Error al guardar comentario:", error);
    } finally {
        logLoading.value = false;
    }
};

const updateControl = async () => {
    if (!selectedItem.value) return;
    try {
        await axios.post('/crm/pipeline/control', {
            Folio: selectedItem.value.Folio,
            Tipo: selectedItem.value.Tipo,
            Etapa: selectedItem.value.Etapa,
            ProximaAccion: selectedItem.value.ProximaAccion,
            Sentimiento: selectedItem.value.Sentimiento
        });
    } catch (error) {
        console.error("Error al actualizar control:", error);
    }
};

const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: currency || 'MXN' 
    }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-MX');
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

onMounted(() => {
    fetchPipeline();
});
</script>

<style scoped>
.info-section {
    padding: 12px;
    border-radius: 8px;
    background: rgba(var(--v-theme-surface-variant), 0.05);
}

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
