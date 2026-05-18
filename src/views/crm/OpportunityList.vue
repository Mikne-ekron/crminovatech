<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/utils/axios';
import { stageColors } from '@/config/crmStages';

const router = useRouter();
const loading = ref(false);
const opportunities = ref([]);
const search = ref('');

const headers = [
    { title: 'ID', key: 'OpportunityID', align: 'start', width: '80px' },
    { title: 'Nombre', key: 'Name', align: 'start' },
    { title: 'Cliente', key: 'CustomerName', align: 'start' },
    { title: 'Etapa', key: 'Etapa', align: 'start' },
    { title: 'Cotizaciones', key: 'QuoteCount', align: 'center' },
    { title: 'Monto Total', key: 'TotalMonto', align: 'end' },
    { title: 'Fecha Cierre', key: 'FechaCierre', align: 'start' },
    { title: 'Actualizado', key: 'UpdatedAt', align: 'start' }
];

const filteredOpps = computed(() => {
    if (!search.value) return opportunities.value;
    const s = search.value.toLowerCase();
    return opportunities.value.filter(o =>
        (o.Name || '').toLowerCase().includes(s) ||
        (o.CustomerName || '').toLowerCase().includes(s) ||
        String(o.OpportunityID).includes(s)
    );
});

const totalAggregate = computed(() => filteredOpps.value.reduce((a, o) => a + (o.TotalMonto || 0), 0));

const fetchOpportunities = async () => {
    loading.value = true;
    try {
        const res = await axios.get('/crm/opportunities');
        opportunities.value = res.data;
    } catch (e) {
        console.error('Error cargando oportunidades', e);
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX') : '—';

const openDetail = (item) => router.push(`/app/crm/opportunities/${item.OpportunityID}`);

onMounted(fetchOpportunities);
</script>

<template>
    <v-container fluid class="page-wrapper">
        <v-row class="mb-4">
            <v-col cols="12" class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h4 font-weight-bold">Oportunidades</h2>
                    <p class="text-subtitle-1 text-medium-emphasis">Cotizaciones consolidadas por cliente</p>
                </div>
                <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchOpportunities" :loading="loading">
                    Actualizar
                </v-btn>
            </v-col>
        </v-row>

        <v-row class="mb-4">
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="pa-4 text-center">
                    <div class="text-overline text-medium-emphasis">Total Oportunidades</div>
                    <div class="text-h4 font-weight-bold text-primary">{{ filteredOpps.length }}</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="pa-4 text-center" variant="tonal" color="success">
                    <div class="text-overline text-medium-emphasis">Monto Acumulado</div>
                    <div class="text-h4 font-weight-bold text-success">{{ formatCurrency(totalAggregate) }}</div>
                </v-card>
            </v-col>
        </v-row>

        <v-card elevation="0" class="border">
            <v-card-text class="pb-0">
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar (ID, nombre, cliente)"
                    density="comfortable"
                    variant="solo"
                    hide-details
                    clearable
                    class="mb-2"
                ></v-text-field>
            </v-card-text>

            <v-data-table
                :headers="headers"
                :items="filteredOpps"
                :loading="loading"
                hover
                class="elevation-0"
                @click:row="(_, { item }) => openDetail(item)"
            >
                <template v-slot:item.OpportunityID="{ item }">
                    <span class="font-weight-bold text-primary">#{{ item.OpportunityID }}</span>
                </template>
                <template v-slot:item.Etapa="{ item }">
                    <v-chip :color="stageColors[item.Etapa] || 'grey'" size="x-small" variant="tonal" class="font-weight-bold">
                        {{ item.Etapa }}
                    </v-chip>
                </template>
                <template v-slot:item.QuoteCount="{ item }">
                    <v-chip size="x-small" variant="tonal">{{ item.QuoteCount }}</v-chip>
                </template>
                <template v-slot:item.TotalMonto="{ item }">
                    <span class="font-weight-bold">{{ formatCurrency(item.TotalMonto) }}</span>
                </template>
                <template v-slot:item.FechaCierre="{ item }">
                    {{ formatDate(item.FechaCierre) }}
                </template>
                <template v-slot:item.UpdatedAt="{ item }">
                    <span class="text-caption text-medium-emphasis">{{ formatDate(item.UpdatedAt) }}</span>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>
