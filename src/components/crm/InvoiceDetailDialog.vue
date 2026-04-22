<template>
  <v-dialog 
    v-model="internalModel" 
    fullscreen 
    transition="dialog-bottom-transition"
    class="invoice-detail-dialog"
  >
    <v-card class="bg-dark-canvas">
      <!-- Toolbar / Header -->
      <v-toolbar color="surface" elevation="1" class="border-b" density="comfortable">
        <v-btn icon="mdi-close" @click="close"></v-btn>
        <v-toolbar-title class="font-weight-bold">
          Detalle de Factura: #{{ folio }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip :color="getPaymentStatusColor(header?.EstatusPago)" class="mr-4 font-weight-bold">
            {{ header?.EstatusPago }}
        </v-chip>
      </v-toolbar>

      <v-container fluid class="pa-6" v-if="loading">
        <v-row justify="center" align="center" style="min-height: 80vh;">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-row>
      </v-container>

      <v-container fluid class="pa-6" v-else>
        <v-row>
          <!-- LEFT SIDE: INVOICE LOOK -->
          <v-col cols="12" lg="7">
            <v-card elevation="0" class="invoice-paper pa-8 mx-auto border" max-width="900" color="surface">
              <div class="d-flex justify-space-between align-start mb-8">
                <div>
                   <!-- Logo placeholder or actual logo -->
                   <div class="text-h4 font-weight-black text-primary mb-2">INOVATECH</div>
                </div>
                <div class="text-right">
                  <div class="text-h5 font-weight-bold mb-1">FACTURA</div>
                  <div class="text-subtitle-1 font-weight-bold text-primary">Folio #{{ folio }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatDate(header?.Fecha) }}</div>
                </div>
              </div>

              <v-divider class="mb-6"></v-divider>

              <v-row class="mb-8">
                <v-col cols="6">
                  <p class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Cliente</p>
                  <p class="text-h6 font-weight-bold mb-0 text-primary">
                    {{ header?.Cliente }}
                  </p>
                  <p class="text-caption text-medium-emphasis">Vendedor: {{ header?.Vendedor }}</p>
                </v-col>
                <v-col cols="6" class="text-right">
                    <p class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Importes</p>
                    <div class="d-flex flex-column align-end">
                        <span class="text-h6 font-weight-bold">{{ formatCurrency(header?.VentaNetaMXN) }}</span>
                        <span class="text-caption text-disabled">USD: {{ formatCurrency(header?.VentaNetaUSD, 'USD') }}</span>
                    </div>
                </v-col>
              </v-row>

              <!-- Items Table -->
              <v-table class="invoice-table mb-8 border rounded overflow-hidden">
                <thead class="bg-lightprimary">
                  <tr>
                    <th class="text-left font-weight-bold">Código</th>
                    <th class="text-left font-weight-bold">Descripción</th>
                    <th class="text-center font-weight-bold">Cant.</th>
                    <th class="text-right font-weight-bold">Precio</th>
                    <th class="text-right font-weight-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in lines" :key="line.ItemCode">
                    <td class="text-caption text-medium-emphasis">{{ line.ItemCode }}</td>
                    <td class="text-body-2">{{ line.Dscription }}</td>
                    <td class="text-center text-body-2">{{ line.Quantity }}</td>
                    <td class="text-right text-body-2">{{ formatCurrency(line.Price, line.Currency) }}</td>
                    <td class="text-right font-weight-bold">{{ formatCurrency(line.LineTotal, line.Currency) }}</td>
                  </tr>
                  <tr v-if="lines.length === 0">
                    <td colspan="5" class="text-center text-disabled py-4">No hay partidas cargadas.</td>
                  </tr>
                </tbody>
              </v-table>

               <div class="d-flex justify-end">
                <div style="width: 250px">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Subtotal (MXN):</span>
                    <span class="font-weight-bold">{{ formatCurrency(header?.VentaNetaMXN) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Utilidad (MXN):</span>
                    <span class="font-weight-bold text-success">{{ formatCurrency(header?.UtilidadMXN) }}</span>
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- RIGHT SIDE: MARGIN KPI -->
          <v-col cols="12" lg="5">
            <v-row class="mb-4" density="comfortable">
              <v-col cols="12">
                <v-card elevation="0" class="border rounded-lg pa-4 d-flex flex-column align-center justify-center h-100" color="surface" style="min-height: 200px;">
                   <div class="text-caption font-weight-black text-primary mb-3" style="letter-spacing: 0.12em;">MARGEN DE LA FACTURA</div>
                   <v-progress-circular
                    :model-value="header?.PorcentajeMargen || 0"
                    :color="getMarginColor(header?.PorcentajeMargen)"
                    size="120"
                    width="12"
                    class="my-4"
                   >
                    <span class="text-h4 font-weight-black">{{ formatPercent(header?.PorcentajeMargen) }}</span>
                   </v-progress-circular>
                </v-card>
              </v-col>
            </v-row>
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
    folio: [Number, String],
    docEntry: [Number, String],
    header: Object
});
const emit = defineEmits(['update:modelValue']);

const internalModel = ref(props.modelValue);
const loading = ref(false);
const lines = ref([]);
watch(() => props.modelValue, (val) => {
    internalModel.value = val;
    if (val && props.docEntry) {
        fetchLines();
    }
});

watch(internalModel, (val) => {
    emit('update:modelValue', val);
});

const fetchLines = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`/crm/invoices/${props.docEntry}`);
        lines.value = response.data;
    } catch (error) {
        console.error("Error fetching invoice lines:", error);
    } finally {
        loading.value = false;
    }
};

const close = () => {
    internalModel.value = false;
};

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
    }).format((value || 0) / 100);
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX');
};

const getMarginColor = (margin) => {
    if (margin > 20) return 'success';
    if (margin < 10) return 'error';
    return 'warning';
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 'Pagada': return 'success';
        case 'Parcial': return 'warning';
        case 'Pendiente': return 'error';
        default: return 'grey';
    }
};
</script>

<style scoped>
.invoice-paper {
  font-family: 'Poppins', sans-serif !important;
  min-height: 600px;
  box-shadow: var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px !important;
  border-radius: 10px !important;
}

.invoice-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.invoice-table :deep(td) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.05) !important;
}

.invoice-detail-dialog {
    z-index: 2400 !important;
}
</style>
