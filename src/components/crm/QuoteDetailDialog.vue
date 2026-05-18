<template>
  <v-dialog 
    v-model="internalModel" 
    fullscreen 
    transition="dialog-bottom-transition"
    class="quote-detail-dialog"
  >
    <v-card class="bg-dark-canvas">
      <!-- Toolbar / Header -->
      <v-toolbar color="surface" elevation="1" class="border-b" density="comfortable">
        <v-btn icon="mdi-close" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold">
          Detalle de Cotización: #{{ folio }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-printer"
            class="mr-2"
            :disabled="!folio"
            @click="openPrintView"
        >
            Imprimir
        </v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-check-circle">Aprobar</v-btn>
      </v-toolbar>

      <v-container fluid class="pa-6" v-if="loading">
        <v-row justify="center" align="center" style="min-height: 80vh;">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-row>
      </v-container>

      <v-container fluid class="pa-6" v-else-if="detail">
        <v-row>
          <!-- LEFT SIDE: QUOTE / INVOICE LOOK -->
          <v-col cols="12" lg="7">
            <v-card elevation="0" class="quote-paper pa-8 mx-auto border" max-width="900" color="surface">
              <div class="d-flex justify-space-between align-start mb-8">
                <div>
                   <img :src="activeLogo" alt="Inovatech" height="80" class="mb-2" />
                </div>
                <div class="text-right">
                  <div class="text-h5 font-weight-bold mb-1">COTIZACIÓN</div>
                  <div class="text-subtitle-1 font-weight-bold text-primary">#{{ detail.header.Folio }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatDate(detail.header.FechaContabilizacion) }}</div>
                </div>
              </div>

              <v-divider class="mb-6"></v-divider>

              <v-row class="mb-8">
                <v-col cols="6">
                  <p class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Cliente</p>
                  <p 
                    class="text-h6 font-weight-bold mb-0 cursor-pointer text-primary text-decoration-underline"
                    @click="showCustomerHistory"
                  >
                    {{ detail.header.Cliente }}
                  </p>
                  <p class="text-caption text-medium-emphasis">Condiciones de pago: Crédito 30 días</p>
                </v-col>
                <v-col cols="6" class="text-right">
                  <p class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Moneda</p>
                  <p class="text-h6 font-weight-bold mb-0">{{ detail.header.Moneda }}</p>
                  <p class="text-caption text-medium-emphasis" v-if="detail.header.Moneda !== 'MXN'">T.C.: {{ formatNumber(detail.header.TC) }}</p>
                </v-col>
              </v-row>

              <!-- Items Table -->
              <v-table class="quote-table mb-8 border rounded overflow-hidden">
                <thead class="bg-lightprimary">
                  <tr>
                    <th class="text-left font-weight-bold">Art.</th>
                    <th class="text-left font-weight-bold">Descripción</th>
                    <th class="text-center font-weight-bold">Cant.</th>
                    <th class="text-right font-weight-bold">Precio</th>
                    <th class="text-right font-weight-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in detail.lines" :key="line.NoLinea">
                    <td class="text-caption text-medium-emphasis">{{ line.Articulo }}</td>
                    <td class="text-body-2">{{ line.Descripcion }}</td>
                    <td class="text-center text-body-2">{{ line.Cantidad }}</td>
                    <td class="text-right text-body-2">{{ formatCurrency(line.VentaNetaLinea / line.Cantidad, detail.header.Moneda) }}</td>
                    <td class="text-right font-weight-bold">{{ formatCurrency(line.VentaNetaLinea, detail.header.Moneda) }}</td>
                  </tr>
                </tbody>
              </v-table>

              <div class="d-flex justify-end">
                <div style="width: 250px">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Subtotal:</span>
                    <span class="font-weight-bold">{{ formatCurrency(detail.header.Subtotal, detail.header.Moneda) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">IVA:</span>
                    <span class="font-weight-bold">{{ formatCurrency(detail.header.IVA, detail.header.Moneda) }}</span>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex justify-space-between text-h6 text-primary">
                    <span class="font-weight-black">TOTAL:</span>
                    <span class="font-weight-black">{{ formatCurrency(detail.header.Total, detail.header.Moneda) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-12 text-caption text-center text-disabled">
                Este documento es una representación visual de la cotización en SAP Business One.
              </div>
            </v-card>
          </v-col>

          <!-- RIGHT SIDE: MARGIN & TIMELINE -->
          <v-col cols="12" lg="5">
            <!-- Global KPIs -->
            <v-row class="mb-4" density="comfortable">
              <v-col cols="6">
                <v-card elevation="0" class="border rounded-lg pa-4 d-flex flex-column align-center justify-center h-100" color="surface" style="min-height: 180px;">
                   <div class="text-caption font-weight-black text-primary mb-3" style="letter-spacing: 0.12em;">MARGEN GLOBAL</div>
                   <v-progress-circular
                    :model-value="detail.header.MargenGlobal"
                    :color="getMarginColor(detail.header.MargenGlobal)"
                    size="100"
                    width="10"
                    class="my-2"
                   >
                    <span class="text-h5 font-weight-black">{{ Math.ceil(detail.header.MargenGlobal) }}%</span>
                   </v-progress-circular>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card elevation="0" class="border rounded-lg pa-4 d-flex flex-column align-center justify-center h-100" color="surface" style="min-height: 180px;">
                   <div class="text-caption font-weight-black text-primary mb-4" style="letter-spacing: 0.12em;">UTILIDAD TOTAL</div>
                   <div class="text-h4 font-weight-black text-success mt-1">
                     {{ formatCurrency(detail.header.GananciaBrutaDoc, detail.header.Moneda) }}
                   </div>
                   <div class="text-overline text-medium-emphasis mt-4" style="font-size: 0.7rem; line-height: 1; letter-spacing: 0.05em;">
                     {{ detail.header.Moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'PESOS MEXICANOS' }}
                   </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Utility Table -->
            <v-card elevation="0" class="mb-4 rounded-lg border overflow-hidden" color="surface">
              <div class="py-2 px-4 d-flex align-center border-b bg-lightprimary" style="min-height: 40px;">
                <v-icon start color="success" size="18">mdi-finance</v-icon>
                <span class="font-weight-black text-primary" style="font-size: 0.75rem; letter-spacing: 0.05rem;">ANÁLISIS POR LÍNEA</span>
              </div>
              <v-data-table
                :headers="utilityHeaders"
                :items="detail.lines"
                density="compact"
                hide-default-footer
                class="utility-table bg-transparent"
              >
                <template v-slot:item.MargenLinea="{ item }">
                  <div class="d-flex align-center" style="min-width: 120px;">
                    <v-progress-linear
                      :model-value="item.MargenLinea"
                      :color="getMarginColor(item.MargenLinea)"
                      height="8"
                      rounded
                      class="flex-grow-1 mr-2"
                    ></v-progress-linear>
                    <span :class="`text-${getMarginColor(item.MargenLinea)} font-weight-bold text-body-2`" style="min-width: 45px; text-align: right;">
                      {{ Math.ceil(item.MargenLinea) }}%
                    </span>
                  </div>
                </template>
                <template v-slot:item.GananciaLineaDoc="{ item }">
                    <span class="font-weight-bold text-success">{{ formatCurrency(item.GananciaLineaDoc, detail.header.Moneda) }}</span>
                </template>
              </v-data-table>
            </v-card>

            <!-- Oportunidad -->
            <v-card elevation="0" class="mb-4 rounded-lg border overflow-hidden" color="surface">
                <div class="py-2 px-4 d-flex align-center border-b bg-lightprimary" style="min-height: 40px;">
                    <v-icon start color="primary" size="18">mdi-target</v-icon>
                    <span class="font-weight-black text-primary" style="font-size: 0.75rem; letter-spacing: 0.05rem;">OPORTUNIDAD</span>
                </div>
                <v-card-text class="pa-4">
                    <div v-if="item?.OpportunityID" class="d-flex align-center">
                        <v-chip color="success" variant="tonal" prepend-icon="mdi-link-variant">
                            Vinculada a #{{ item.OpportunityID }} — {{ item.OpportunityName || 'Oportunidad' }}
                        </v-chip>
                        <v-spacer></v-spacer>
                        <v-btn
                            size="small"
                            variant="text"
                            color="primary"
                            prepend-icon="mdi-open-in-new"
                            @click="goToOpportunity"
                        >
                            Abrir oportunidad
                        </v-btn>
                    </div>
                    <div v-else class="d-flex align-center">
                        <span class="text-body-2 text-medium-emphasis">
                            Esta cotización no pertenece a ninguna oportunidad.
                        </span>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            variant="flat"
                            size="small"
                            prepend-icon="mdi-plus"
                            @click="openCreateOpp"
                            :disabled="!item?.CardCode"
                        >
                            Crear / Unificar
                        </v-btn>
                    </div>
                </v-card-text>
            </v-card>

            <!-- Control CRM -->
            <v-card elevation="0" class="mb-4 rounded-lg border overflow-hidden" color="surface">
                <div class="py-2 px-4 d-flex align-center border-b bg-lightprimary" style="min-height: 40px;">
                    <v-icon start color="primary" size="18">mdi-tune-vertical</v-icon>
                    <span class="font-weight-black text-primary" style="font-size: 0.75rem; letter-spacing: 0.05rem;">CONTROL CRM</span>
                </div>
                <v-card-text class="pa-4">
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-select
                                v-model="control.Tipo"
                                :items="tipoOptions"
                                label="Tipo de Venta"
                                variant="outlined"
                                density="compact"
                                hide-details
                                @update:model-value="updateControl"
                            ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select
                                v-model="control.Etapa"
                                :items="stageOptions"
                                label="Etapa"
                                variant="outlined"
                                density="compact"
                                hide-details
                                @update:model-value="updateControl"
                            ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select
                                v-model="control.Sentimiento"
                                :items="sentimentOptions"
                                label="Sentimiento"
                                variant="outlined"
                                density="compact"
                                hide-details
                                @update:model-value="updateControl"
                            >
                                <template v-slot:item="{ props: itemProps, item }">
                                    <v-list-item v-bind="itemProps">
                                        <template v-slot:prepend>
                                            <v-icon :color="getSentimentColor(item.value)">mdi-fire</v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="control.ProximaAccion"
                                label="Próxima Acción"
                                variant="outlined"
                                density="compact"
                                hide-details
                                @blur="updateControl"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="control.FechaCierre"
                                type="date"
                                label="Fecha de Cierre Estimada"
                                variant="outlined"
                                density="compact"
                                hide-details
                                prepend-inner-icon="mdi-calendar-check"
                                clearable
                                @update:model-value="updateControl"
                            ></v-text-field>
                        </v-col>

                        <!-- Campos condicionales cuando Etapa = Perdida -->
                        <template v-if="showPerdidaFields">
                            <v-col cols="12" sm="6">
                                <v-select
                                    v-model="control.MotivoPerdida"
                                    :items="motivoPerdidaOptions"
                                    label="Motivo de pérdida"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    color="error"
                                    prepend-inner-icon="mdi-alert-octagon-outline"
                                    @update:model-value="updateControl"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" v-if="showSeguimientoField">
                                <v-text-field
                                    v-model="control.FechaSeguimiento"
                                    type="date"
                                    label="Próximo seguimiento"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    prepend-inner-icon="mdi-calendar-clock"
                                    @update:model-value="updateControl"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" v-if="showComentarioField">
                                <v-textarea
                                    v-model="control.ComentarioPerdida"
                                    label="Comentario del vendedor"
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    rows="2"
                                    auto-grow
                                    @blur="updateControl"
                                ></v-textarea>
                            </v-col>
                        </template>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Cronological Timeline -->
            <v-card elevation="0" class="rounded-lg border" color="surface">
                <div class="py-2 px-4 d-flex align-center border-b bg-lightprimary" style="min-height: 40px;">
                    <v-icon start color="primary" size="18">mdi-history</v-icon>
                    <span class="font-weight-black text-primary" style="font-size: 0.75rem; letter-spacing: 0.05rem;">HISTORIAL DE ACTIVIDADES</span>
                </div>
                <v-card-text class="pa-6">
                    <!-- Add Log -->
                    <div class="mb-6">
                        <div class="d-flex align-center mb-2">
                             <v-text-field
                                v-model="newLogText"
                                label="Registrar nueva actividad..."
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="flex-grow-1"
                                @keyup.enter="saveLog"
                            ></v-text-field>
                            <v-btn color="primary" class="ml-2" @click="saveLog" :loading="savingLog">Guardar</v-btn>
                        </div>
                        <div class="d-flex align-center">
                            <v-btn
                                v-if="!m365Connected"
                                variant="text"
                                color="info"
                                size="small"
                                prepend-icon="mdi-microsoft-office"
                                @click="connectM365"
                                class="px-0"
                            >
                                Conectar Microsoft To Do
                            </v-btn>
                            <v-chip v-else color="success" size="x-small" variant="tonal" prepend-icon="mdi-check" class="mr-4">
                                Microsoft To Do Conectado
                            </v-chip>

                            <v-spacer></v-spacer>
                            
                            <div style="max-width: 200px">
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
                            </div>
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
                            Error al sincronizar con To Do. Por favor, <strong>reconecta</strong> tu cuenta de Microsoft.
                        </v-alert>
                    </div>

                    <v-timeline density="compact" side="end">
                        <v-timeline-item
                            v-for="log in logs"
                            :key="log.LogID"
                            :dot-color="log.Type === 'comment' ? 'primary' : 'success'"
                            size="x-small"
                        >
                            <div class="d-flex justify-space-between align-center mb-1">
                                <span class="text-subtitle-2 font-weight-bold text-primary">{{ log.Author }}</span>
                                <span class="text-caption text-medium-emphasis">
                                    <v-icon v-if="log.FollowUpDate" size="12" color="warning" class="mr-1">mdi-calendar-alert</v-icon>
                                    {{ formatDateTime(log.Date) }}
                                </span>
                            </div>
                            <p class="text-body-2 mb-1 text-medium-emphasis">{{ log.Text }}</p>
                            <div v-if="log.FollowUpDate" class="text-caption text-warning font-weight-bold">
                                📅 Recordatorio: {{ formatDate(log.FollowUpDate) }}
                            </div>
                        </v-timeline-item>
                    </v-timeline>
                    <div v-if="logs.length === 0" class="text-center py-4 text-disabled italic">
                        Sin actividad previa registrada.
                    </div>
                </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <CreateOpportunityDialog
        v-model="showCreateOpp"
        :card-code="item?.CardCode"
        :customer-name="item?.Cliente"
        :initial-folio="folio"
        @created="onOpportunityCreated"
      />
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import axios from '@/utils/axios';
import LogoLight from '@/assets/images/logos/logolight.svg';
import LogoDark from '@/assets/images/logos/logo-blue.png';
import { useCustomizerStore } from '@/stores/customizer';
import CreateOpportunityDialog from '@/components/crm/CreateOpportunityDialog.vue';
import { useRouter } from 'vue-router';
import {
    stageOptions, motivoPerdidaOptions,
    isPerdida, requiresSeguimiento, requiresComentario
} from '@/config/crmStages';


const customizer = useCustomizerStore();
const isDark = computed(() => customizer.actTheme.includes('DARK'));
const activeLogo = computed(() => isDark.value ? LogoLight : LogoDark);

const props = defineProps({
    modelValue: Boolean,
    folio: [Number, String],
    item: { type: Object, default: null }
});
const emit = defineEmits(['update:modelValue', 'open-customer-history', 'update:item']);

const router = useRouter();
const showCreateOpp = ref(false);

const openCreateOpp = () => {
    showCreateOpp.value = true;
};

const onOpportunityCreated = (data) => {
    // Vincular esta cotización al opp creado y avisar al padre
    emit('update:item', { ...props.item, OpportunityID: data.OpportunityID });
    router.push(`/app/crm/opportunities/${data.OpportunityID}`);
    internalModel.value = false;
};

const goToOpportunity = () => {
    if (props.item?.OpportunityID) {
        router.push(`/app/crm/opportunities/${props.item.OpportunityID}`);
        internalModel.value = false;
    }
};

const openPrintView = () => {
    if (!props.folio) return;
    // Abrir en nueva pestaña para no perder el contexto del pipeline
    const url = router.resolve({ name: 'PrintQuote', params: { folio: props.folio } }).href;
    window.open(url, '_blank', 'noopener');
};

const sentimentOptions = ['Caliente', 'Tibio', 'Frio'];
const tipoOptions = ['Proyecto', 'Transaccional'];

const control = ref({
    Tipo: null,
    Etapa: null,
    Sentimiento: null,
    ProximaAccion: '',
    FechaCierre: null,
    MotivoPerdida: null,
    ComentarioPerdida: '',
    FechaSeguimiento: null
});

const showPerdidaFields = computed(() => isPerdida(control.value.Etapa));
const showSeguimientoField = computed(() => showPerdidaFields.value && requiresSeguimiento(control.value.MotivoPerdida));
const showComentarioField = computed(() => showPerdidaFields.value && requiresComentario(control.value.MotivoPerdida));

const toDateInputValue = (d) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date)) return null;
    return date.toISOString().slice(0, 10);
};

const syncControlFromItem = () => {
    if (!props.item) return;
    control.value = {
        Tipo: props.item.Tipo ?? null,
        Etapa: props.item.Etapa ?? null,
        Sentimiento: props.item.Sentimiento ?? null,
        ProximaAccion: props.item.ProximaAccion ?? '',
        FechaCierre: toDateInputValue(props.item.FechaCierre),
        MotivoPerdida: props.item.MotivoPerdida ?? null,
        ComentarioPerdida: props.item.ComentarioPerdida ?? '',
        FechaSeguimiento: toDateInputValue(props.item.FechaSeguimiento)
    };
};

watch(() => props.item, syncControlFromItem, { immediate: true, deep: true });

const updateControl = async () => {
    if (!props.folio) return;
    try {
        await axios.post('/crm/pipeline/control', {
            Folio: props.folio,
            Tipo: control.value.Tipo,
            Etapa: control.value.Etapa,
            ProximaAccion: control.value.ProximaAccion,
            Sentimiento: control.value.Sentimiento,
            FechaCierre: control.value.FechaCierre,
            MotivoPerdida: control.value.MotivoPerdida,
            ComentarioPerdida: control.value.ComentarioPerdida,
            FechaSeguimiento: control.value.FechaSeguimiento
        });
        emit('update:item', { ...props.item, ...control.value });
    } catch (error) {
        console.error("Error al actualizar control:", error);
    }
};

const getSentimentColor = (sentiment) => {
    switch (sentiment) {
        case 'Caliente': return 'error';
        case 'Tibio': return 'orange';
        case 'Frio': return 'info';
        default: return 'grey';
    }
};

const internalModel = ref(props.modelValue);
const loading = ref(false);
const detail = ref(null);
const logs = ref([]);
const newLogText = ref('');
const getToday = () => new Date().toISOString().split('T')[0];
const followUpDate = ref(getToday());
const savingLog = ref(false);
const activeTab = ref('info');
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
    
    // Obtener UID del token actual
    const token = localStorage.getItem('token');
    let uid = '';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            uid = payload.uid;
        } catch (e) { console.error('Error parsing token', e); }
    }

    if (!uid) {
        alert('Debes estar logueado para conectar Microsoft');
        return;
    }

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Escuchar el mensaje del popup
    const handleMessage = (event) => {
        if (event.data.type === 'm365_connected') {
            m365Connected.value = true;
            window.removeEventListener('message', handleMessage);
        }
    };

    window.addEventListener('message', handleMessage);

    window.open(
        `${axios.defaults.baseURL}/m365/login?uid=${uid}`,
        'M365Auth',
        `width=${width},height=${height},left=${left},top=${top}`
    );
};

const showCustomerHistory = () => {
    if (detail.value?.header?.CardCode) {
        emit('open-customer-history', {
            cardCode: detail.value.header.CardCode,
            customerName: detail.value.header.Cliente
        });
    }
};

const utilityHeaders = computed(() => [
    { title: 'Artículo', key: 'Articulo', align: 'start', sortable: false },
    { title: `Utilidad (${detail.value?.header?.Moneda || 'MXN'})`, key: 'GananciaLineaDoc', align: 'end', sortable: false },
    { title: '% Margen', key: 'MargenLinea', align: 'end', sortable: false },
]);

watch(() => props.modelValue, (val) => {
    internalModel.value = val;
    if (val && props.folio) {
        fetchData();
        checkM365Status();
    }
});

watch(internalModel, (val) => {
    emit('update:modelValue', val);
});

const fetchData = async () => {
    loading.value = true;
    try {
        const [resDetail, resLogs] = await Promise.all([
            axios.get(`/crm/pipeline/detail/${props.folio}`),
            axios.get(`/crm/pipeline/logs/${props.folio}`)
        ]);
        detail.value = resDetail.data;
        logs.value = resLogs.data;
    } catch (error) {
        console.error("Error fetching detail:", error);
    } finally {
        loading.value = false;
    }
};

const saveLog = async () => {
    if (!newLogText.value) return;
    savingLog.value = true;
    try {
        const response = await axios.post('/crm/pipeline/logs', {
            Folio: props.folio,
            Text: newLogText.value,
            Type: 'comment',
            FollowUpDate: followUpDate.value,
            CardName: detail.value?.header?.Cliente
        });
        
        if (response.data.m365Error) {
            m365Error.value = true;
            if (response.data.m365Error === 'InvalidAuthenticationToken' || response.data.m365Error.includes('401')) {
                m365Connected.value = false;
            }
        }

        newLogText.value = '';
        followUpDate.value = getToday();
        fetchLogs();
    } catch (error) {
        console.error("Error saving log:", error);
    } finally {
        savingLog.value = false;
    }
};

const fetchLogs = async () => {
    try {
        const res = await axios.get(`/crm/pipeline/logs/${props.folio}`);
        logs.value = res.data;
    } catch (err) {
        console.error(err);
    }
};

const close = () => {
    internalModel.value = false;
};

const formatCurrency = (val, cur) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: cur || 'MXN' }).format(val);
};

const formatNumber = (val) => {
    return new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
};

const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
};

const getMarginColor = (val) => {
    if (val < 10) return 'error';
    if (val < 25) return 'warning';
    return 'success';
};
</script>

<style scoped>
.quote-paper {
  font-family: 'Poppins', sans-serif !important;
  min-height: 842px; /* A4 Ratio approx */
  box-shadow: var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px !important;
  border-radius: 10px !important;
}

.quote-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.quote-table :deep(td) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.05) !important;
}

.utility-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  font-weight: 700 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.utility-table :deep(tr:hover) {
  background-color: var(--hover-bg) !important;
}

.quote-detail-dialog {
    z-index: 2400 !important;
}
</style>
