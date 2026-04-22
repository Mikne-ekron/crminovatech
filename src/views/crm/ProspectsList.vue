<template>
  <v-container fluid class="page-wrapper">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h4 font-weight-bold">Nuevos Logos</h2>
          <p class="text-subtitle-1 text-medium-emphasis">Seguimiento y Registro de Nuevos Clientes (SAP)</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-refresh" elevation="0" @click="fetchAll" :loading="loading">
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="(kpi, index) in kpiCards" :key="index">
        <v-card elevation="0" class="border h-100" :loading="loading">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-overline font-weight-bold text-medium-emphasis">{{ kpi.title }}</span>
              <v-icon :color="kpi.color" size="24">{{ kpi.icon }}</v-icon>
            </div>
            <div class="d-flex align-end">
              <h3 class="text-h4 font-weight-bold mr-2">{{ kpi.value }}</h3>
            </div>
            <div class="mt-2 text-caption text-medium-emphasis">{{ kpi.subtitle }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Bar -->
    <v-card elevation="0" class="border mb-6">
      <v-card-text style="background: rgba(var(--v-theme-surface-variant), 0.05)">
        <v-row density="compact" align="center">
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.year"
              :items="yearOptions"
              label="Año"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchAll"
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
              @update:model-value="fetchAll"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-autocomplete
              v-model="filters.slpCode"
              :items="vendedorOptions"
              label="Vendedor"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchAll"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-autocomplete
              v-model="filters.userSign"
              :items="creatorOptions"
              label="Creador (Sistema)"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              hide-details
              @update:model-value="fetchAll"
            ></v-autocomplete>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn icon="mdi-filter-off" variant="text" @click="resetFilters" title="Limpiar Filtros"></v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Table -->
    <v-card elevation="0" class="border">
        <v-card-text>
            <v-row align="center">
                <v-col cols="12" md="6">
                    <v-text-field
                        v-model="search"
                        prepend-inner-icon="mdi-magnify"
                        label="Filtrar por nombre o código..."
                        density="compact"
                        variant="outlined"
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="auto" class="text-caption text-medium-emphasis">
                  {{ filteredProspects.length }} clientes encontrados
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-data-table
            :headers="headers"
            :items="filteredProspects"
            class="elevation-0"
            hover
            :loading="loading"
        >
            <template v-slot:item.CardCode="{ item }">
              <span class="font-weight-bold color-primary">{{ item.CardCode }}</span>
            </template>
            <template v-slot:item.CreateDate="{ item }">
                {{ formatSimpleDate(item.CreateDate) }}
            </template>
            <template v-slot:item.LastSaleAmount="{ item }">
                <span :class="item.LastSaleAmount > 0 ? 'text-success font-weight-bold' : 'text-medium-emphasis'">
                  {{ formatCurrency(item.LastSaleAmount) }}
                </span>
            </template>
            <template v-slot:item.DaysSinceCreation="{ item }">
                <v-chip size="x-small" :color="getDaysColor(item.DaysSinceCreation)" variant="flat">
                  {{ item.DaysSinceCreation }} días
                </v-chip>
            </template>
        </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '@/utils/axios';
const loading = ref(false);
const search = ref('');

// Filters
const filters = ref({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    slpCode: null,
    userSign: null
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

const vendedorOptions = ref([{ name: 'Todos los vendedores', id: null }]);
const creatorOptions = ref([{ name: 'Todos los creadores', id: null }]);

// Data
const prospects = ref([]);
const kpisData = ref({
    totalProspects: 0,
    newThisMonth: 0,
    topSalesPerson: 'N/A',
    topCreator: 'N/A'
});

const headers = [
    { title: 'Código', key: 'CardCode', align: 'start', sortable: true },
    { title: 'Nombre Cliente', key: 'CardName', align: 'start', sortable: true },
    { title: 'Creador', key: 'Creator', align: 'start' },
    { title: 'Vendedor', key: 'SalesPerson', align: 'start' },
    { title: 'Grupo', key: 'GroupName', align: 'start' },
    { title: 'Fecha Creación', key: 'CreateDate', align: 'center' },
    { title: 'Antigüedad', key: 'DaysSinceCreation', align: 'center' },
    { title: 'Última Venta', key: 'LastSaleAmount', align: 'end' },
];

const kpiCards = computed(() => [
  {
    title: 'Total Clientes',
    value: kpisData.value.totalProspects,
    subtitle: `Registrados en ${filters.value.year}`,
    icon: 'mdi-account-group',
    color: 'primary'
  },
  {
    title: 'Nuevos (Mes)',
    value: kpisData.value.newThisMonth,
    subtitle: 'Nuevas altas en el periodo',
    icon: 'mdi-account-plus',
    color: 'success'
  },
  {
    title: 'Top Vendedor',
    value: kpisData.value.topSalesPerson,
    subtitle: 'Más clientes creados (Mes)',
    icon: 'mdi-trophy',
    color: 'warning'
  },
  {
    title: 'Top Creador',
    value: kpisData.value.topCreator,
    subtitle: 'Más actividad (Mes)',
    icon: 'mdi-account-star',
    color: 'info'
  }
]);

const filteredProspects = computed(() => {
  if (!search.value) return prospects.value;
  const s = search.value.toLowerCase();
  return prospects.value.filter(p => 
    p.CardName.toLowerCase().includes(s) || 
    p.CardCode.toLowerCase().includes(s)
  );
});

// Actions
const fetchAll = async () => {
    loading.value = true;
    try {
        const params = { ...filters.value };

        const [prospectsRes, kpiRes] = await Promise.all([
            axios.get('/crm/prospects', { params }),
            axios.get('/crm/prospects/kpis', { params })
        ]);
        
        prospects.value = prospectsRes.data;
        kpisData.value = kpiRes.data;
    } catch (error) {
        console.error('Error fetching prospects data:', error);
    } finally {
        loading.value = false;
    }
};

const fetchOptions = async () => {
    try {
        const slpRes = await axios.get('/crm/salespeople');
        vendedorOptions.value = [{ name: 'Todos los vendedores', id: null }, ...slpRes.data];

        const userRes = await axios.get('/crm/users');
        creatorOptions.value = [{ name: 'Todos los creadores', id: null }, ...userRes.data];
    } catch (error) {
        console.error('Error fetching options:', error);
    }
};

// Necesitamos una lista de vendedores con ID. El endpoint /salespeople actual solo da nombres.
// Voy a añadir un nuevo endpoint /salespeople-full o modificar el actual.
// Por ahora, como SlpCode es lo que espera el controller, intentaré obtener SlpCode.

const resetFilters = () => {
  filters.value = {
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    slpCode: null,
    userSign: null
  };
  fetchAll();
};

const formatSimpleDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
    });
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

const getDaysColor = (days) => {
    if (days < 30) return 'success';
    if (days < 90) return 'warning';
    return 'grey';
};

onMounted(() => {
    fetchOptions();
    fetchAll();
});
</script>

<style scoped>
.page-wrapper {
  background-color: rgb(var(--v-theme-background));
}
.color-primary {
  color: rgb(var(--v-theme-primary));
}
</style>
