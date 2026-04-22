<template>
  <v-dialog 
    v-model="internalModel" 
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card class="bg-dark-canvas overflow-hidden">
      <!-- Toolbar / Branding -->
      <v-toolbar color="surface" elevation="2" class="border-b" density="comfortable">
        <v-btn icon="mdi-close" @click="close"></v-btn>
        <v-toolbar-title class="d-flex align-center">
            <span class="font-weight-black text-h6">{{ customerName }}</span>
            <v-chip size="x-small" color="primary" variant="flat" class="ml-4 font-weight-bold" v-if="profile?.RFC">
                {{ profile.RFC }}
            </v-chip>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="d-none d-md-flex align-center mr-6">
            <div class="text-right mr-6 border-r pr-6">
                <div class="text-caption text-medium-emphasis font-weight-bold">COTIZACIONES ABIERTAS</div>
                <div class="text-h6 font-weight-black text-success">{{ kpis.countOpen }}</div>
            </div>
            <div class="text-right mr-6">
                <div class="text-caption text-medium-emphasis font-weight-bold">MONTO ABIERTO (MXN)</div>
                <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(kpis.totalOpenMXN) }}</div>
            </div>
        </div>
      </v-toolbar>

      <v-container fluid class="pa-0 flex-grow-1 overflow-auto">
        <v-row no-gutters class="fill-height">
          <!-- Sidebar: Navigation Tabs -->
          <v-col cols="12" md="2" class="border-r bg-surface py-6">
            <v-tabs
              v-model="activeTab"
              direction="vertical"
              color="primary"
              class="customer-360-tabs"
            >
              <v-tab value="overview" prepend-icon="mdi-view-dashboard">Resumen IA</v-tab>
              <v-tab value="history" prepend-icon="mdi-history">Historial Cotizaciones</v-tab>
              <v-tab value="profile" prepend-icon="mdi-account-details">Perfil Corporativo</v-tab>
              <v-tab value="financial" prepend-icon="mdi-cash-multiple">Situación Financiera</v-tab>
            </v-tabs>

            <v-divider class="my-6"></v-divider>
            
            <div class="px-4" v-if="profile">
                <p class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-2">Vendedor Asignado</p>
                <div class="d-flex align-center">
                    <v-avatar color="primary" size="32" class="mr-3">
                        <span class="text-caption">{{ profile.Vendedor?.substring(0, 2) }}</span>
                    </v-avatar>
                    <span class="text-body-2 font-weight-bold">{{ profile.Vendedor || 'No asignado' }}</span>
                </div>
            </div>
          </v-col>

          <!-- Main Content Area -->
          <v-col cols="12" md="10" class="pa-6 bg-dark-canvas">
            <v-window v-model="activeTab">
              <!-- OVERVIEW: AI Insights -->
              <v-window-item value="overview">
                <v-row>
                    <v-col cols="12" lg="8">
                        <v-card class="rounded-lg border mb-6" color="surface" elevation="0">
                            <v-card-title class="d-flex align-center py-4 px-6 bg-primary text-white">
                                <v-icon start>mdi-robot-outline</v-icon>
                                <span>Inteligencia de Cliente (AI Insights)</span>
                            </v-card-title>
                            <v-card-text class="pa-6">
                                <div v-if="loadingDetail" class="text-center py-12">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                    <p class="mt-4 text-medium-emphasis">Analizando comportamiento del cliente...</p>
                                </div>
                                <template v-else>
                                    <v-alert
                                        color="info"
                                        variant="tonal"
                                        border="start"
                                        class="mb-6 rounded-lg"
                                        icon="mdi-lightbulb-on"
                                    >
                                        <div class="font-weight-bold mb-1">Análisis de Compra:</div>
                                        <div class="text-body-2">{{ aiSummary.behavior }}</div>
                                    </v-alert>

                                    <div class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
                                        <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
                                        Recomendación de Venta Cruzada
                                    </div>
                                    <v-card variant="outlined" color="success" class="rounded-lg pa-4">
                                        <p class="text-body-2 mb-0 font-weight-medium">{{ aiSummary.recommendation }}</p>
                                    </v-card>

                                    <div class="mt-8">
                                        <p class="text-caption text-uppercase font-weight-black text-disabled mb-3">PRODUCTOS MÁS COTIZADOS</p>
                                        <v-chip-group>
                                            <v-chip v-for="tag in aiSummary.tags" :key="tag" variant="outlined" size="small" color="primary">
                                                {{ tag }}
                                            </v-chip>
                                        </v-chip-group>
                                    </div>
                                </template>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" lg="4">
                        <v-card class="rounded-lg border h-100" color="surface" elevation="0">
                            <v-card-title class="py-4 px-6 border-b">
                                <v-icon start color="primary">mdi-credit-card-outline</v-icon>
                                <span class="text-subtitle-1 font-weight-bold">Crédito y Cobranza</span>
                            </v-card-title>
                            <v-card-text class="pa-6">
                                <template v-if="profile">
                                    <div class="text-center mb-6">
                                        <v-progress-circular
                                            :model-value="(profile.Balance / profile.CreditLine) * 100"
                                            size="120"
                                            width="12"
                                            :color="getCreditColor(profile.Balance, profile.CreditLine)"
                                        >
                                            <div class="text-center">
                                                <div class="text-caption text-medium-emphasis">Uso de Línea</div>
                                                <div class="text-h6 font-weight-black">{{ Math.round((profile.Balance / profile.CreditLine) * 100) }}%</div>
                                            </div>
                                        </v-progress-circular>
                                    </div>
                                    <v-list density="compact" bg-color="transparent">
                                        <v-list-item class="px-0">
                                            <template v-slot:subtitle>Saldo Actual</template>
                                            <template v-slot:append>
                                                <span class="font-weight-black text-error">{{ formatCurrency(profile.Balance) }}</span>
                                            </template>
                                        </v-list-item>
                                        <v-list-item class="px-0">
                                            <template v-slot:subtitle>Límite de Crédito</template>
                                            <template v-slot:append>
                                                <span class="font-weight-black">{{ formatCurrency(profile.CreditLine) }}</span>
                                            </template>
                                        </v-list-item>
                                        <v-divider class="my-2"></v-divider>
                                        <v-list-item class="px-0">
                                            <template v-slot:subtitle>Disponible</template>
                                            <template v-slot:append>
                                                <span class="font-weight-black text-success">{{ formatCurrency(profile.CreditAvailable) }}</span>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                </template>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
              </v-window-item>

              <!-- HISTORY: Quote Table (Enhanced Pipeline-style) -->
              <v-window-item value="history">
                <!-- Mini-KPIs Summary -->
                <v-row class="mb-6">
                    <v-col cols="12" sm="3">
                        <v-card elevation="0" class="border pa-3 text-center h-100" color="surface">
                            <div class="text-overline text-medium-emphasis">Total Doctos</div>
                            <div class="text-h6 font-weight-bold">{{ kpis.totalHistory }}</div>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-card elevation="0" class="border pa-3 text-center h-100" color="surface">
                            <div class="text-overline text-purple-darken-2">Proyectos</div>
                            <div class="text-h6 font-weight-bold text-purple">{{ formatCurrency(kpis.sumProject) }}</div>
                            <div class="text-caption text-disabled">{{ kpis.countProject }} docs</div>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-card elevation="0" class="border pa-3 text-center h-100" color="surface">
                            <div class="text-overline text-teal-darken-2">Transaccional</div>
                            <div class="text-h6 font-weight-bold text-teal">{{ formatCurrency(kpis.sumTransactional) }}</div>
                            <div class="text-caption text-disabled">{{ kpis.countTransactional }} docs</div>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="3">
                        <v-card elevation="0" class="border pa-3 text-center h-100 bg-primary-lighten-5" variant="flat">
                            <div class="text-overline text-primary">Monto Abierto</div>
                            <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(kpis.totalOpenMXN) }}</div>
                            <div class="text-caption text-disabled">{{ kpis.countOpen }} docs</div>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Filter Bar -->
                <v-card class="rounded-lg border mb-4" color="surface" elevation="0">
                    <v-card-text class="pa-3">
                        <v-row density="compact" align="center">
                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="filters.search"
                                    prepend-inner-icon="mdi-magnify"
                                    label="Buscar folio o descripción..."
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-select
                                    v-model="filters.stage"
                                    :items="stageOptions"
                                    label="Etapa"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    clearable
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-select
                                    v-model="filters.type"
                                    :items="['Proyecto', 'Transaccional']"
                                    label="Tipo"
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    clearable
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="2" class="text-right">
                                <v-btn icon="mdi-refresh" variant="text" color="primary" @click="fetchAllData" :loading="loadingHistory"></v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Data Table -->
                <v-card class="rounded-lg border" color="surface" elevation="0">
                    <v-card-text class="pa-0">
                        <v-data-table
                            :headers="quoteHeaders"
                            :items="filteredQuotes"
                            :loading="loadingHistory"
                            hover
                            class="bg-transparent customer-quotes-table"
                        >
                            <template v-slot:item.Folio="{ item }">
                                <span class="font-weight-black text-primary cursor-pointer text-decoration-underline" @click="openQuote(item.Folio)">
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
                            <template v-slot:item.Etapa="{ item }">
                                <span :class="getStageColor(item.Etapa)" class="text-caption font-weight-bold">
                                    {{ item.Etapa }}
                                </span>
                            </template>
                            <template v-slot:item.Fecha="{ item }">
                                <span class="text-caption">{{ formatDate(item.Fecha) }}</span>
                            </template>
                            <template v-slot:item.Total="{ item }">
                                <span class="font-weight-bold">{{ formatCurrency(item.Total, item.Moneda) }}</span>
                            </template>
                            <template v-slot:item.Estado="{ item }">
                                <v-chip :color="getStatusColor(item.Estado)" size="x-small" class="text-uppercase font-weight-bold" variant="tonal">
                                    {{ item.Estado }}
                                </v-chip>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn icon="mdi-eye" size="x-small" variant="text" color="primary" @click="openQuote(item.Folio)"></v-btn>
                             </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
              </v-window-item>

              <!-- PROFILE: Corporate Data -->
              <v-window-item value="profile">
                <!-- ... (Profile view same as before) ... -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-card class="rounded-lg border mb-6" color="surface" elevation="0">
                            <v-card-title class="py-4 px-6 border-b">Datos de Facturación</v-card-title>
                            <v-card-text class="pa-6" v-if="profile">
                                <div class="text-h6 font-weight-bold mb-4 text-primary">{{ profile.CardName }}</div>
                                <div class="d-flex mb-2">
                                    <v-icon start size="small" color="disabled" class="mr-2">mdi-map-marker</v-icon>
                                    <div class="text-body-2">
                                        {{ profile.BillStreet }} {{ profile.BillNo }}, {{ profile.BillBlock }}<br>
                                        {{ profile.BillCity }}, {{ profile.BillState }}, CP {{ profile.BillCP }}
                                    </div>
                                </div>
                                <div class="d-flex mt-4 pt-4 border-t">
                                    <div class="mr-8">
                                        <p class="text-caption text-disabled mb-0">Condiciones</p>
                                        <p class="text-body-2 font-weight-bold">{{ profile.PaymentTerms }}</p>
                                    </div>
                                    <div>
                                        <p class="text-caption text-disabled mb-0">RFC</p>
                                        <p class="text-body-2 font-weight-bold">{{ profile.RFC }}</p>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card class="rounded-lg border mb-6" color="surface" elevation="0">
                            <v-card-title class="py-4 px-6 border-b">Dirección de Entrega</v-card-title>
                            <v-card-text class="pa-6" v-if="profile">
                                <div class="d-flex mb-2">
                                    <v-icon start size="small" color="disabled" class="mr-2">mdi-truck-delivery-outline</v-icon>
                                    <div class="text-body-2">
                                        {{ profile.ShipStreet }} {{ profile.ShipNo }}, {{ profile.ShipBlock }}<br>
                                        {{ profile.ShipCity }}, {{ profile.ShipState }}, CP {{ profile.ShipCP }}
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                        <v-card class="rounded-lg border" color="surface" elevation="0">
                            <v-card-title class="py-4 px-6 border-b">Contacto Directo</v-card-title>
                            <v-card-text class="pa-6" v-if="profile">
                                <v-list density="compact" bg-color="transparent">
                                    <v-list-item prepend-icon="mdi-account" class="px-0">
                                        <v-list-item-title>{{ profile.CntctPrsn }}</v-list-item-title>
                                        <v-list-item-subtitle>Contacto Principal</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item prepend-icon="mdi-email" class="px-0">
                                        <v-list-item-title>{{ profile.E_Mail }}</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item prepend-icon="mdi-phone" class="px-0">
                                        <v-list-item-title>{{ profile.Phone1 }} / {{ profile.Phone2 }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
              </v-window-item>

              <!-- FINANCIAL: (Aggregated from Credit Block if needed or more raw data) -->
              <v-window-item value="financial">
                <v-card class="rounded-lg border" color="surface" elevation="0">
                    <v-card-title class="py-4 px-6 border-b d-flex align-center">
                        <span>Resumen Financiero Consolidado</span>
                        <v-spacer></v-spacer>
                        <v-chip color="info" size="small" variant="flat">SAP B1 OCRD</v-chip>
                    </v-card-title>
                    <v-card-text class="pa-0">
                        <v-table density="comfortable" class="bg-transparent">
                            <thead>
                                <tr>
                                    <th class="text-left font-weight-bold">CONCEPTO</th>
                                    <th class="text-right font-weight-bold">LOCAL (MXN)</th>
                                    <th class="text-right font-weight-bold">SISTEMA (USD)</th>
                                </tr>
                            </thead>
                            <tbody v-if="profile">
                                <tr>
                                    <td>Saldo de Cuenta</td>
                                    <td class="text-right text-error font-weight-bold">{{ formatCurrency(profile.Balance) }}</td>
                                    <td class="text-right">{{ formatCurrency(profile.BalanceSys, 'USD') }}</td>
                                </tr>
                                <tr>
                                    <td>Límite de Crédito</td>
                                    <td class="text-right">{{ formatCurrency(profile.CreditLine) }}</td>
                                    <td class="text-right text-disabled">-</td>
                                </tr>
                                <tr class="bg-primary-lighten-5">
                                    <td class="font-weight-black text-primary">Disponible</td>
                                    <td class="text-right font-weight-black text-primary">{{ formatCurrency(profile.CreditAvailable) }}</td>
                                    <td class="text-right text-disabled">-</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from '@/utils/axios';

const props = defineProps({
  modelValue: Boolean,
  cardCode: String,
  customerName: String
});

const emit = defineEmits(['update:modelValue', 'open-quote-detail']);

const internalModel = ref(props.modelValue);
const activeTab = ref('overview');
const loadingHistory = ref(false);
const loadingDetail = ref(false);
const quotes = ref([]);
const profile = ref(null);
const kpis = ref({ countOpen: 0, totalOpenMXN: 0, totalHistory: 0, countProject: 0, countTransactional: 0, sumProject: 0, sumTransactional: 0 });

const filters = ref({
    search: '',
    stage: null,
    type: null
});

const stageOptions = [
    '1. Dimensionamiento',
    '2. Negociación',
    '3. Aprobado/OC',
    '4. Colocado',
    '5. Perdida'
];

const quoteHeaders = [
  { title: 'Folio', key: 'Folio', align: 'start' },
  { title: 'Tipo', key: 'Tipo', align: 'start' },
  { title: 'Etapa', key: 'Etapa', align: 'start' },
  { title: 'Fecha', key: 'Fecha', align: 'start' },
  { title: 'Estado', key: 'Estado', align: 'center' },
  { title: 'Moneda', key: 'Moneda', align: 'center' },
  { title: 'Total', key: 'Total', align: 'end' },
  { title: '', key: 'actions', align: 'end', sortable: false },
];

const filteredQuotes = computed(() => {
    return quotes.value.filter(q => {
        const matchSearch = !filters.value.search || 
            q.Folio.toString().includes(filters.value.search);
        const matchStage = !filters.value.stage || q.Etapa === filters.value.stage;
        const matchType = !filters.value.type || q.Tipo === filters.value.type;
        return matchSearch && matchStage && matchType;
    });
});

// Generador de Resumen IA Dinámico (Conectado a Gemini)
const aiSummary = computed(() => {
    if (!profile.value || !profile.value.aiInsights) {
        return { 
            behavior: 'Analizando historial completo con Gemini AI...', 
            recommendation: 'Buscando oportunidades semánticas...', 
            tags: [] 
        };
    }
    return profile.value.aiInsights;
});

watch(() => props.modelValue, (val) => {
  internalModel.value = val;
  if (val && props.cardCode) {
    fetchAllData();
  }
});

watch(internalModel, (val) => {
  emit('update:modelValue', val);
});

const fetchAllData = async () => {
  loadingHistory.value = true;
  loadingDetail.value = true;
  try {
    const [resQuotes, resProfile] = await Promise.all([
        axios.get(`/crm/pipeline/customer/${props.cardCode}`),
        axios.get(`/crm/pipeline/customer/detail/${props.cardCode}`)
    ]);
    quotes.value = resQuotes.data.quotes;
    kpis.value = resQuotes.data.kpis;
    profile.value = resProfile.data;
  } catch (error) {
    console.error('Error fetching customer 360 data:', error);
  } finally {
    loadingHistory.value = false;
    loadingDetail.value = false;
  }
};

const close = () => {
  internalModel.value = false;
};

const openQuote = (folio) => {
    // IMPORTANTE: Para stack navigation (regresar al historial), NO cerramos este diálogo.
    // El Manager abrirá el detalle encima.
    emit('open-quote-detail', folio);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short'
  });
};

const formatCurrency = (value, currency) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN'
  }).format(value || 0);
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'abierta': return 'success';
    case 'cerrada': return 'primary';
    case 'cancelada': return 'error';
    default: return 'grey';
  }
};

const getStageColor = (stage) => {
    if (stage.includes('Perdida')) return 'text-error';
    if (stage.includes('Colocado')) return 'text-success';
    if (stage.includes('Aprobado')) return 'text-primary';
    return 'text-info';
};

const getCreditColor = (balance, limit) => {
    if (!limit) return 'grey';
    const percent = (balance / limit) * 100;
    if (percent > 90) return 'error';
    if (percent > 70) return 'warning';
    return 'success';
};
</script>

<style scoped>
.customer-360-tabs :deep(.v-tab) {
    justify-content: start !important;
    text-transform: none !important;
    font-weight: 500;
}

.customer-quotes-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.customer-quotes-table :deep(tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.bg-primary-lighten-5 {
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
