<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/utils/axios';
import QuoteDetailDialog from '@/components/crm/QuoteDetailDialog.vue';
import { stageColors } from '@/config/crmStages';

const props = defineProps({
    modelValue: Boolean,
    docNum: [Number, String],
    sourceCompany: { type: String, default: null }
});
const emit = defineEmits(['update:modelValue']);

const internal = ref(props.modelValue);
const loading = ref(false);
const data = ref(null);
const router = useRouter();

const showQuoteDialog = ref(false);
const selectedQuoteFolio = ref(null);

watch(() => props.modelValue, (v) => {
    internal.value = v;
    if (v && props.docNum) fetchDetail();
});
watch(internal, (v) => emit('update:modelValue', v));

const fetchDetail = async () => {
    loading.value = true;
    data.value = null;
    try {
        const res = await axios.get(`/crm/backlog/${props.docNum}`, {
            params: props.sourceCompany ? { sourceCompany: props.sourceCompany } : {}
        });
        data.value = res.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const close = () => { internal.value = false; };

const openQuote = (folio) => {
    selectedQuoteFolio.value = folio;
    showQuoteDialog.value = true;
};

const openOpportunity = () => {
    if (data.value?.opportunity?.OpportunityID) {
        router.push(`/app/crm/opportunities/${data.value.opportunity.OpportunityID}`);
        close();
    }
};

// Stock por línea: estado relativo a OpenQty
const lineStockStatus = (line) => {
    if (line.PendienteEntrega <= 0) return 'delivered';
    if (line.StockDisponible >= line.PendienteEntrega) return 'full';
    if (line.StockDisponible <= 0) return 'none';
    return 'partial';
};
const stockColor = (s) => ({
    delivered: 'grey',
    full: 'success',
    partial: 'warning',
    none: 'error'
}[s] || 'grey');
const stockIcon = (s) => ({
    delivered: 'mdi-check-decagram',
    full: 'mdi-check-circle',
    partial: 'mdi-alert',
    none: 'mdi-close-circle'
}[s] || 'mdi-help');
const stockLabel = (s) => ({
    delivered: 'Entregado',
    full: 'Disponible',
    partial: 'Parcial',
    none: 'Sin stock'
}[s] || '—');

const formatCurrency = (v, c) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: c || 'MXN' }).format(v || 0);
const formatNumber = (v) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX') : '—';

const daysUntilDue = (date) => {
    if (!date) return null;
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((d - t) / (1000 * 60 * 60 * 24));
};

const lineHeaders = [
    { title: '#', key: 'NoLinea', align: 'start', width: '50px' },
    { title: 'Artículo', key: 'Articulo' },
    { title: 'Descripción', key: 'Descripcion' },
    { title: 'Cant.', key: 'Cantidad', align: 'center' },
    { title: 'Entregado', key: 'Entregado', align: 'center' },
    { title: 'Pendiente', key: 'PendienteEntrega', align: 'center' },
    { title: 'Stock', key: 'StockStatus', align: 'center' },
    { title: 'Total', key: 'TotalLinea', align: 'end' },
    { title: 'Origen', key: 'FolioCotizacionOrigen', align: 'center' }
];
</script>

<template>
    <v-dialog v-model="internal" fullscreen transition="dialog-bottom-transition">
        <v-card class="bg-dark-canvas">
            <v-toolbar color="surface" elevation="1" class="border-b" density="comfortable">
                <v-btn icon="mdi-close" @click="close"></v-btn>
                <v-toolbar-title class="font-weight-bold">
                    <v-icon class="mr-2" color="primary">mdi-truck-fast-outline</v-icon>
                    Pedido #{{ docNum }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>

            <v-container fluid class="pa-6" v-if="loading">
                <v-row justify="center" align="center" style="min-height: 80vh;">
                    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                </v-row>
            </v-container>

            <v-container fluid class="pa-6" v-else-if="data">
                <!-- Cabecera del pedido -->
                <v-row>
                    <v-col cols="12" md="8">
                        <v-card elevation="0" class="border pa-4">
                            <div class="d-flex justify-space-between align-start mb-3">
                                <div>
                                    <div class="text-caption text-medium-emphasis text-uppercase">Cliente</div>
                                    <div class="text-h6 font-weight-bold">{{ data.header.Cliente }}</div>
                                    <div class="text-body-2 text-medium-emphasis">{{ data.header.CardCode }}</div>
                                </div>
                                <div class="text-right">
                                    <v-chip
                                        :color="(() => {
                                            const d = daysUntilDue(data.header.FechaEntrega);
                                            if (d === null) return 'grey';
                                            if (d < 0) return 'error';
                                            if (d <= 3) return 'warning';
                                            return 'success';
                                        })()"
                                        variant="tonal"
                                        prepend-icon="mdi-calendar-check"
                                        class="font-weight-bold"
                                    >
                                        Entrega: {{ formatDate(data.header.FechaEntrega) }}
                                    </v-chip>
                                </div>
                            </div>
                            <v-divider class="my-2"></v-divider>
                            <v-row dense>
                                <v-col cols="6" md="3">
                                    <div class="text-caption text-medium-emphasis">Pedido</div>
                                    <div class="font-weight-bold">{{ formatDate(data.header.FechaPedido) }}</div>
                                </v-col>
                                <v-col cols="6" md="3">
                                    <div class="text-caption text-medium-emphasis">Vendedor</div>
                                    <div class="font-weight-bold">{{ data.header.Vendedor }}</div>
                                </v-col>
                                <v-col cols="6" md="3">
                                    <div class="text-caption text-medium-emphasis">Moneda</div>
                                    <div class="font-weight-bold">{{ data.header.Moneda }}</div>
                                </v-col>
                                <v-col cols="6" md="3">
                                    <div class="text-caption text-medium-emphasis">Total</div>
                                    <div class="font-weight-bold text-primary">{{ formatCurrency(data.header.Total, data.header.Moneda) }}</div>
                                </v-col>
                                <v-col cols="12" v-if="data.header.Referencia">
                                    <div class="text-caption text-medium-emphasis"><v-icon size="14" class="mr-1">mdi-tag-outline</v-icon>Referencia cliente</div>
                                    <div class="font-weight-medium">{{ data.header.Referencia }}</div>
                                </v-col>
                                <v-col cols="12" v-if="data.header.Comentarios">
                                    <div class="text-caption text-medium-emphasis"><v-icon size="14" class="mr-1">mdi-comment-text-outline</v-icon>Comentarios</div>
                                    <div class="text-body-2">{{ data.header.Comentarios }}</div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>

                    <!-- KPI de stock -->
                    <v-col cols="12" md="4">
                        <v-card elevation="0" class="border pa-4 h-100">
                            <div class="text-overline text-primary font-weight-black mb-3">SURTIDO DEL PEDIDO</div>
                            <div class="d-flex align-center mb-3">
                                <v-progress-circular
                                    :model-value="data.stockSummary.linesOpen > 0
                                        ? (data.stockSummary.linesFullStock / data.stockSummary.linesOpen) * 100
                                        : 100"
                                    :color="data.stockSummary.linesOpen === 0
                                        ? 'success'
                                        : (data.stockSummary.linesFullStock === data.stockSummary.linesOpen
                                            ? 'success'
                                            : (data.stockSummary.linesFullStock === 0 ? 'error' : 'warning'))"
                                    size="64"
                                    width="8"
                                    class="mr-3"
                                >
                                    <span class="text-h6 font-weight-black">
                                        {{ data.stockSummary.linesOpen > 0
                                            ? Math.round((data.stockSummary.linesFullStock / data.stockSummary.linesOpen) * 100)
                                            : 100 }}%
                                    </span>
                                </v-progress-circular>
                                <div>
                                    <div class="text-body-2"><strong>{{ data.stockSummary.linesFullStock }}</strong> líneas con stock</div>
                                    <div class="text-body-2"><strong>{{ data.stockSummary.linesPartialStock }}</strong> parciales</div>
                                    <div class="text-body-2 text-error" v-if="data.stockSummary.linesNoStock > 0">
                                        <strong>{{ data.stockSummary.linesNoStock }}</strong> sin stock
                                    </div>
                                </div>
                            </div>
                            <v-alert
                                v-if="data.stockSummary.linesNoStock > 0"
                                type="error"
                                variant="tonal"
                                density="compact"
                                class="mt-2 text-caption"
                            >
                                Hay líneas sin stock disponible. Revisar compras o sustitutos.
                            </v-alert>
                            <v-alert
                                v-else-if="data.stockSummary.linesPartialStock > 0"
                                type="warning"
                                variant="tonal"
                                density="compact"
                                class="mt-2 text-caption"
                            >
                                Hay líneas con stock parcial. Entrega podría requerir surtido por partes.
                            </v-alert>
                            <v-alert
                                v-else-if="data.stockSummary.linesOpen === 0"
                                type="success"
                                variant="tonal"
                                density="compact"
                                class="mt-2 text-caption"
                            >
                                Pedido completamente entregado.
                            </v-alert>
                            <v-alert
                                v-else
                                type="success"
                                variant="tonal"
                                density="compact"
                                class="mt-2 text-caption"
                            >
                                Stock disponible para todas las líneas pendientes.
                            </v-alert>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Tabla de líneas con stock -->
                <v-card elevation="0" class="border mt-4">
                    <v-toolbar density="compact" color="surface">
                        <v-icon class="ml-2" color="primary">mdi-package-variant-closed</v-icon>
                        <v-toolbar-title class="font-weight-bold">Líneas del pedido</v-toolbar-title>
                    </v-toolbar>
                    <v-data-table
                        :headers="lineHeaders"
                        :items="data.lines"
                        hide-default-footer
                        items-per-page="-1"
                        density="compact"
                    >
                        <template v-slot:item.Articulo="{ item }">
                            <span class="text-caption text-medium-emphasis font-weight-medium">{{ item.Articulo }}</span>
                        </template>
                        <template v-slot:item.Descripcion="{ item }">
                            <span class="text-body-2">{{ item.Descripcion }}</span>
                        </template>
                        <template v-slot:item.Cantidad="{ item }">{{ formatNumber(item.Cantidad) }}</template>
                        <template v-slot:item.Entregado="{ item }">
                            <span class="text-success font-weight-bold">{{ formatNumber(item.Entregado) }}</span>
                        </template>
                        <template v-slot:item.PendienteEntrega="{ item }">
                            <span :class="item.PendienteEntrega > 0 ? 'text-warning font-weight-bold' : 'text-disabled'">
                                {{ formatNumber(item.PendienteEntrega) }}
                            </span>
                        </template>
                        <template v-slot:item.StockStatus="{ item }">
                            <v-tooltip location="left">
                                <template v-slot:activator="{ props: tip }">
                                    <v-chip
                                        v-bind="tip"
                                        :color="stockColor(lineStockStatus(item))"
                                        :prepend-icon="stockIcon(lineStockStatus(item))"
                                        size="x-small"
                                        variant="tonal"
                                        class="font-weight-bold"
                                    >
                                        {{ stockLabel(lineStockStatus(item)) }}
                                    </v-chip>
                                </template>
                                Disponible: {{ formatNumber(item.StockDisponible) }} / Comprometido: {{ formatNumber(item.StockComprometido) }} / Total: {{ formatNumber(item.StockTotal) }}
                            </v-tooltip>
                        </template>
                        <template v-slot:item.TotalLinea="{ item }">
                            <span class="font-weight-bold">{{ formatCurrency(item.TotalLinea, data.header.Moneda) }}</span>
                        </template>
                        <template v-slot:item.FolioCotizacionOrigen="{ item }">
                            <v-chip
                                v-if="item.FolioCotizacionOrigen"
                                size="x-small"
                                variant="tonal"
                                color="primary"
                                class="cursor-pointer"
                                @click="openQuote(item.FolioCotizacionOrigen)"
                            >
                                #{{ item.FolioCotizacionOrigen }}
                            </v-chip>
                            <span v-else class="text-caption text-disabled">—</span>
                        </template>
                    </v-data-table>
                </v-card>

                <!-- Origen: oportunidad (si aplica) -->
                <v-card v-if="data.opportunity" elevation="0" class="border mt-4">
                    <v-toolbar density="compact" color="surface">
                        <v-icon class="ml-2" color="primary">mdi-target</v-icon>
                        <v-toolbar-title class="font-weight-bold">Oportunidad de origen</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <div>
                                <div class="text-h6 font-weight-bold">
                                    #{{ data.opportunity.OpportunityID }} — {{ data.opportunity.Name }}
                                </div>
                                <div class="text-body-2 text-medium-emphasis">
                                    Etapa:
                                    <v-chip size="x-small" :color="stageColors[data.opportunity.Etapa] || 'grey'" variant="tonal" class="ml-1">
                                        {{ data.opportunity.Etapa }}
                                    </v-chip>
                                    <span v-if="data.opportunity.FechaCierre" class="ml-3">
                                        Cierre estimado: <strong>{{ formatDate(data.opportunity.FechaCierre) }}</strong>
                                    </span>
                                </div>
                            </div>
                            <v-spacer></v-spacer>
                            <v-btn variant="flat" color="primary" prepend-icon="mdi-open-in-new" @click="openOpportunity">
                                Abrir oportunidad
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Origen: cotizaciones -->
                <v-card elevation="0" class="border mt-4" v-if="data.cotizaciones.length > 0">
                    <v-toolbar density="compact" color="surface">
                        <v-icon class="ml-2" color="primary">mdi-file-document-multiple</v-icon>
                        <v-toolbar-title class="font-weight-bold">
                            Cotizaciones de origen ({{ data.cotizaciones.length }})
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-list density="compact">
                        <v-list-item
                            v-for="cot in data.cotizaciones"
                            :key="cot.Folio"
                            @click="openQuote(cot.Folio)"
                        >
                            <template v-slot:prepend>
                                <v-icon color="primary">mdi-file-document-outline</v-icon>
                            </template>
                            <v-list-item-title>
                                <span class="font-weight-bold text-primary">#{{ cot.Folio }}</span>
                                <v-chip size="x-small" :color="stageColors[cot.Etapa] || 'grey'" variant="tonal" class="ml-2">
                                    {{ cot.Etapa }}
                                </v-chip>
                                <span class="ml-2 text-medium-emphasis text-body-2">
                                    {{ formatDate(cot.Fecha) }} · {{ formatCurrency(cot.Monto, cot.Moneda) }}
                                </span>
                            </v-list-item-title>
                            <template v-slot:append>
                                <v-icon size="16">mdi-open-in-new</v-icon>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-container>
        </v-card>

        <!-- Dialog anidado para ver el detalle de una cotización origen -->
        <QuoteDetailDialog
            v-model="showQuoteDialog"
            :folio="selectedQuoteFolio"
            :item="null"
        />
    </v-dialog>
</template>
