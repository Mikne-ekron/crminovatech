<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/utils/axios';
import {
    stageOptions, stageColors, motivoPerdidaOptions,
    isPerdida, requiresSeguimiento, requiresComentario
} from '@/config/crmStages';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const data = ref(null);

const editable = ref({
    Name: '', Etapa: '', FechaCierre: null, Notas: '',
    MotivoPerdida: null, ComentarioPerdida: '', FechaSeguimiento: null
});

const showPerdidaFields = computed(() => isPerdida(editable.value.Etapa));
const showSeguimientoField = computed(() => showPerdidaFields.value && requiresSeguimiento(editable.value.MotivoPerdida));
const showComentarioField = computed(() => showPerdidaFields.value && requiresComentario(editable.value.MotivoPerdida));

const fetchDetail = async () => {
    loading.value = true;
    try {
        const res = await axios.get(`/crm/opportunities/${route.params.id}`);
        data.value = res.data;
        const h = data.value.header;
        editable.value = {
            Name: h.Name,
            Etapa: h.Etapa,
            FechaCierre: h.FechaCierre ? new Date(h.FechaCierre).toISOString().slice(0, 10) : null,
            Notas: h.Notas || '',
            MotivoPerdida: h.MotivoPerdida || null,
            ComentarioPerdida: h.ComentarioPerdida || '',
            FechaSeguimiento: h.FechaSeguimiento ? new Date(h.FechaSeguimiento).toISOString().slice(0, 10) : null
        };
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

watch(() => route.params.id, fetchDetail);

const save = async () => {
    saving.value = true;
    try {
        await axios.put(`/crm/opportunities/${route.params.id}`, editable.value);
        await fetchDetail();
    } catch (e) {
        console.error(e);
    } finally {
        saving.value = false;
    }
};

const removeQuote = async (folio) => {
    if (!confirm(`¿Quitar cotización #${folio} de la oportunidad?`)) return;
    try {
        await axios.delete(`/crm/opportunities/${route.params.id}/quotes/${folio}`);
        await fetchDetail();
    } catch (e) { console.error(e); }
};

const removeOpp = async () => {
    if (!confirm('¿Eliminar la oportunidad? Las cotizaciones quedarán liberadas.')) return;
    try {
        await axios.delete(`/crm/opportunities/${route.params.id}`);
        router.push('/app/crm/opportunities');
    } catch (e) { console.error(e); }
};

const formatCurrency = (v, c) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: c || 'MXN' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX') : '—';

const quoteHeaders = [
    { title: 'Folio', key: 'Folio' },
    { title: 'Fecha', key: 'Fecha' },
    { title: 'Etapa', key: 'Etapa' },
    { title: 'Estado SAP', key: 'EstadoSAP' },
    { title: 'Monto', key: 'Monto', align: 'end' },
    { title: '', key: 'actions', sortable: false, align: 'end' }
];

const estadoSapColor = (estado) => {
    if (estado === 'Cancelada en SAP') return 'error';
    if (estado === 'Cerrada en SAP') return 'success';
    return 'info'; // Abierta
};
const estadoSapIcon = (estado) => {
    if (estado === 'Cancelada en SAP') return 'mdi-close-octagon';
    if (estado === 'Cerrada en SAP') return 'mdi-check-decagram';
    return 'mdi-clock-outline';
};

onMounted(fetchDetail);
</script>

<template>
    <v-container fluid class="page-wrapper">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-2" @click="router.push('/app/crm/opportunities')">
            Volver al listado
        </v-btn>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

        <template v-if="data && !loading">
            <v-row class="mb-4">
                <v-col cols="12" class="d-flex align-center justify-space-between">
                    <div>
                        <h2 class="text-h4 font-weight-bold">
                            <v-icon color="primary" class="mr-2">mdi-target</v-icon>
                            {{ data.header.Name }}
                        </h2>
                        <p class="text-subtitle-1 text-medium-emphasis">
                            {{ data.header.CustomerName }} ({{ data.header.CardCode }})
                            · #{{ data.header.OpportunityID }}
                        </p>
                    </div>
                    <div>
                        <v-btn color="error" variant="text" prepend-icon="mdi-delete" class="mr-2" @click="removeOpp">
                            Eliminar
                        </v-btn>
                        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="save">
                            Guardar cambios
                        </v-btn>
                    </div>
                </v-col>
            </v-row>

            <!-- KPIs de la oportunidad: valor = promedio de las cotizaciones -->
            <v-row class="mb-6">
                <v-col cols="12" sm="6" md="3">
                    <v-card elevation="2" class="pa-4 text-center">
                        <div class="text-overline text-medium-emphasis">Cotizaciones</div>
                        <div class="text-h4 font-weight-bold text-info">{{ data.totals.QuoteCount }}</div>
                        <div class="text-caption text-disabled">Suma: {{ formatCurrency(data.totals.SumaMonto) }}</div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="primary">
                        <div class="text-overline text-medium-emphasis">Valor de la Oportunidad</div>
                        <div class="text-h4 font-weight-bold text-primary">{{ formatCurrency(data.totals.ValorOportunidad) }}</div>
                        <div class="text-caption text-disabled">Promedio (suma / {{ data.totals.QuoteCount }})</div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="success">
                        <div class="text-overline text-medium-emphasis">Utilidad</div>
                        <div class="text-h4 font-weight-bold text-success">{{ formatCurrency(data.totals.UtilidadOportunidad) }}</div>
                        <div class="text-caption text-disabled">Promedio</div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                    <v-card elevation="2" class="pa-4 text-center">
                        <div class="text-overline text-medium-emphasis">Margen</div>
                        <div class="text-h4 font-weight-bold">{{ Math.ceil(data.totals.MargenOportunidad) }}%</div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Edición de cabecera -->
            <v-card elevation="0" class="border mb-4">
                <v-toolbar density="compact" color="surface">
                    <v-icon class="ml-2" color="primary">mdi-tune-vertical</v-icon>
                    <v-toolbar-title class="font-weight-bold">Datos de la Oportunidad</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="editable.Name" label="Nombre" variant="outlined" density="compact"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-select v-model="editable.Etapa" :items="stageOptions" label="Etapa" variant="outlined" density="compact"></v-select>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field v-model="editable.FechaCierre" type="date" label="Fecha de Cierre" variant="outlined" density="compact" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field v-model="editable.Notas" label="Notas" variant="outlined" density="compact"></v-text-field>
                        </v-col>

                        <!-- Campos condicionales cuando Etapa = Perdida -->
                        <template v-if="showPerdidaFields">
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="editable.MotivoPerdida"
                                    :items="motivoPerdidaOptions"
                                    label="Motivo de pérdida"
                                    variant="outlined"
                                    density="compact"
                                    prepend-inner-icon="mdi-alert-octagon-outline"
                                    color="error"
                                ></v-select>
                            </v-col>
                            <v-col cols="12" md="6" v-if="showSeguimientoField">
                                <v-text-field
                                    v-model="editable.FechaSeguimiento"
                                    type="date"
                                    label="Próximo seguimiento"
                                    variant="outlined"
                                    density="compact"
                                    prepend-inner-icon="mdi-calendar-clock"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" v-if="showComentarioField">
                                <v-textarea
                                    v-model="editable.ComentarioPerdida"
                                    label="Comentario del vendedor"
                                    variant="outlined"
                                    density="compact"
                                    rows="2"
                                    auto-grow
                                ></v-textarea>
                            </v-col>
                        </template>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Cotizaciones vinculadas -->
            <v-card elevation="0" class="border mb-4">
                <v-toolbar density="compact" color="surface">
                    <v-icon class="ml-2" color="primary">mdi-file-document-multiple</v-icon>
                    <v-toolbar-title class="font-weight-bold">Cotizaciones Vinculadas</v-toolbar-title>
                </v-toolbar>
                <v-data-table :headers="quoteHeaders" :items="data.quotes" hide-default-footer density="compact">
                    <template v-slot:item.Folio="{ item }">
                        <span class="font-weight-bold text-primary">#{{ item.Folio }}</span>
                    </template>
                    <template v-slot:item.Fecha="{ item }">{{ formatDate(item.Fecha) }}</template>
                    <template v-slot:item.Etapa="{ item }">
                        <v-chip :color="stageColors[item.Etapa] || 'grey'" size="x-small" variant="tonal">{{ item.Etapa }}</v-chip>
                    </template>
                    <template v-slot:item.EstadoSAP="{ item }">
                        <v-chip :color="estadoSapColor(item.EstadoSAP)" size="x-small" variant="tonal" :prepend-icon="estadoSapIcon(item.EstadoSAP)">
                            {{ item.EstadoSAP }}
                        </v-chip>
                    </template>
                    <template v-slot:item.Monto="{ item }">
                        <span class="font-weight-bold" :class="{ 'text-disabled text-decoration-line-through': item.DocStatus !== 'O' }">
                            {{ formatCurrency(item.Monto, item.Moneda) }}
                        </span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn icon="mdi-link-off" size="x-small" variant="text" color="error" @click="removeQuote(item.Folio)"></v-btn>
                    </template>
                </v-data-table>
                <div class="px-4 pb-3 text-caption text-medium-emphasis" v-if="data.totals.QuoteCount !== data.totals.QuoteCountTotal">
                    <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
                    Los totales y productos consolidados solo consideran las cotizaciones activas en SAP
                    ({{ data.totals.QuoteCount }} de {{ data.totals.QuoteCountTotal }}).
                </div>
            </v-card>
        </template>
    </v-container>
</template>
